import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useOrderStore } from '@/stores/order'
import { useCheckoutStore } from '@/stores/checkout'
import { useCartStore } from '@/stores/cart'
import * as orderApi from '@/api/orderApi'
import { HttpError } from '@/api/httpClient'
import { emptyAddress } from '@/domain/checkout'

vi.mock('@/api/orderApi')
vi.mock('@/api/cartApi')
vi.mock('@/api/accountApi')
vi.mock('@/utils/cartStorage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/cartStorage')>()
  return {
    ...actual,
    loadCart: vi.fn(() => []),
    saveCart: vi.fn(),
    clearCart: vi.fn(),
  }
})

const mockedOrderApi = vi.mocked(orderApi)

const BILLING = { ...emptyAddress(), firstName: 'Taro', address1: '1 Test St', city: 'Testville' }

describe('useOrderStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('初期状態はisPlacing=false・placeError=null・result=null・hasResult=falseになる', () => {
    const store = useOrderStore()

    expect(store.isPlacing).toBe(false)
    expect(store.placeError).toBeNull()
    expect(store.result).toBeNull()
    expect(store.hasResult).toBe(false)
  })

  it('placeOrderはcheckoutStoreのbilling/shipping/useSeparateShippingでorderApiを呼びresultを設定する', async () => {
    const checkoutStore = useCheckoutStore()
    checkoutStore.billing = BILLING
    checkoutStore.useSeparateShipping = false
    mockedOrderApi.placeOrder.mockResolvedValue({ orderId: 123, totalPrice: 33 })
    const store = useOrderStore()

    const success = await store.placeOrder()

    expect(success).toBe(true)
    expect(mockedOrderApi.placeOrder).toHaveBeenCalledWith({
      billing: BILLING,
      shipping: checkoutStore.shipping,
      useSeparateShipping: false,
    })
    expect(store.result).toEqual({ orderId: 123, totalPrice: 33 })
    expect(store.hasResult).toBe(true)
    expect(store.isPlacing).toBe(false)
    expect(store.placeError).toBeNull()
  })

  it('成功時はcartStore.clearAfterOrderを呼びcheckoutStoreの下書きをresetする', async () => {
    const checkoutStore = useCheckoutStore()
    checkoutStore.billing = BILLING
    checkoutStore.currentStep = 'confirm'
    const cartStore = useCartStore()
    cartStore.localLines = [{ itemId: 'EST-1', quantity: 2 }]
    mockedOrderApi.placeOrder.mockResolvedValue({ orderId: 123, totalPrice: 33 })
    const store = useOrderStore()

    await store.placeOrder()

    expect(cartStore.localLines).toEqual([])
    expect(checkoutStore.currentStep).toBe('cart')
    expect(checkoutStore.billing).toEqual(emptyAddress())
  })

  it('在庫不足(409)はplaceError=INSUFFICIENT_STOCKになりresultは設定されない', async () => {
    mockedOrderApi.placeOrder.mockRejectedValue(new HttpError(409, 'Conflict'))
    const store = useOrderStore()

    const success = await store.placeOrder()

    expect(success).toBe(false)
    expect(store.placeError).toBe('INSUFFICIENT_STOCK')
    expect(store.result).toBeNull()
    expect(store.isPlacing).toBe(false)
  })

  it('409以外の失敗はplaceError=defaultになる', async () => {
    mockedOrderApi.placeOrder.mockRejectedValue(new HttpError(500, 'Internal Server Error'))
    const store = useOrderStore()

    const success = await store.placeOrder()

    expect(success).toBe(false)
    expect(store.placeError).toBe('default')
  })

  it('placeOrder呼び出し中はisPlacingがtrueになる', async () => {
    let resolvePromise: (value: { orderId: number; totalPrice: number }) => void
    mockedOrderApi.placeOrder.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve
      }),
    )
    const store = useOrderStore()

    const placing = store.placeOrder()
    expect(store.isPlacing).toBe(true)

    resolvePromise!({ orderId: 1, totalPrice: 10 })
    await placing

    expect(store.isPlacing).toBe(false)
  })

  it('reset()は状態を初期値へ戻す', async () => {
    mockedOrderApi.placeOrder.mockResolvedValue({ orderId: 123, totalPrice: 33 })
    const store = useOrderStore()
    await store.placeOrder()
    expect(store.hasResult).toBe(true)

    store.reset()

    expect(store.result).toBeNull()
    expect(store.hasResult).toBe(false)
    expect(store.placeError).toBeNull()
  })
})
