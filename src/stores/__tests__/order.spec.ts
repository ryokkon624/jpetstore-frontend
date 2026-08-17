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

  it('#9: 初期状態はhistory=空Page・isLoadingHistory=falseになる', () => {
    const store = useOrderStore()

    expect(store.history).toEqual({
      content: [],
      page: 1,
      size: 12,
      totalElements: 0,
      totalPages: 0,
    })
    expect(store.isLoadingHistory).toBe(false)
  })

  it('#9 AC1: fetchHistoryが成功するとhistoryにセットされる', async () => {
    const page = {
      content: [{ orderId: 3, orderDate: '2026-01-03', totalPrice: 30 }],
      page: 1,
      size: 12,
      totalElements: 1,
      totalPages: 1,
    }
    mockedOrderApi.fetchOrders.mockResolvedValue(page)
    const store = useOrderStore()

    await store.fetchHistory(1)

    expect(mockedOrderApi.fetchOrders).toHaveBeenCalledWith(1)
    expect(store.history).toEqual(page)
    expect(store.isLoadingHistory).toBe(false)
  })

  it('#9: fetchHistoryが失敗すると空Pageのままになる(例外は伝播しない)', async () => {
    mockedOrderApi.fetchOrders.mockRejectedValue(new HttpError(401, 'Unauthorized'))
    const store = useOrderStore()

    await expect(store.fetchHistory()).resolves.toBeUndefined()

    expect(store.history.content).toEqual([])
    expect(store.isLoadingHistory).toBe(false)
  })

  it('#10: 初期状態はdetail=null・isLoadingDetail=false・detailUnavailable=falseになる', () => {
    const store = useOrderStore()

    expect(store.detail).toBeNull()
    expect(store.isLoadingDetail).toBe(false)
    expect(store.detailUnavailable).toBe(false)
  })

  it('#10 AC1/AC2/AC4: fetchDetailが成功するとdetailにセットされる', async () => {
    const detail = {
      orderId: 9,
      orderDate: '2026-01-09',
      totalPrice: 33,
      lines: [
        { itemId: 'EST-1', productName: 'Angelfish', quantity: 2, unitPrice: 16.5, lineTotal: 33 },
      ],
    }
    mockedOrderApi.fetchOrder.mockResolvedValue(detail)
    const store = useOrderStore()

    await store.fetchDetail(9)

    expect(mockedOrderApi.fetchOrder).toHaveBeenCalledWith(9)
    expect(store.detail).toEqual(detail)
    expect(store.detailUnavailable).toBe(false)
    expect(store.isLoadingDetail).toBe(false)
  })

  it('#10 AC-neg1(SBD-1): 403(他人の注文)はdetailUnavailable=trueになりdetailはnullのまま', async () => {
    mockedOrderApi.fetchOrder.mockRejectedValue(new HttpError(403, 'Forbidden'))
    const store = useOrderStore()

    await store.fetchDetail(9)

    expect(store.detailUnavailable).toBe(true)
    expect(store.detail).toBeNull()
    expect(store.isLoadingDetail).toBe(false)
  })

  it('#10 AC-neg2(SBD-8): 404(不存在)も403と同一のdetailUnavailable=trueになる(区別しない)', async () => {
    mockedOrderApi.fetchOrder.mockRejectedValue(new HttpError(404, 'Not Found'))
    const store = useOrderStore()

    await store.fetchDetail(999)

    expect(store.detailUnavailable).toBe(true)
    expect(store.detail).toBeNull()
  })

  it('#10: 新しいfetchDetail開始時に直前のdetail/detailUnavailableはリセットされる', async () => {
    mockedOrderApi.fetchOrder.mockRejectedValueOnce(new HttpError(403, 'Forbidden'))
    const store = useOrderStore()
    await store.fetchDetail(9)
    expect(store.detailUnavailable).toBe(true)

    const detail = { orderId: 10, orderDate: '2026-01-10', totalPrice: 5, lines: [] }
    mockedOrderApi.fetchOrder.mockResolvedValueOnce(detail)
    await store.fetchDetail(10)

    expect(store.detailUnavailable).toBe(false)
    expect(store.detail).toEqual(detail)
  })
})
