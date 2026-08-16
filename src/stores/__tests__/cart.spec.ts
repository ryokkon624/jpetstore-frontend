import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import * as cartApi from '@/api/cartApi'
import * as catalogApi from '@/api/catalogApi'
import * as cartStorage from '@/utils/cartStorage'
import { HttpError } from '@/api/httpClient'

vi.mock('@/api/cartApi')
vi.mock('@/api/catalogApi')
vi.mock('@/utils/cartStorage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/cartStorage')>()
  return {
    ...actual,
    loadCart: vi.fn(() => []),
    saveCart: vi.fn(),
    clearCart: vi.fn(),
  }
})

const mockedCartApi = vi.mocked(cartApi)
const mockedCatalogApi = vi.mocked(catalogApi)
const mockedCartStorage = vi.mocked(cartStorage)

const ITEM_DETAIL = {
  itemId: 'EST-1',
  productId: 'FI-SW-01',
  productName: 'Angelfish',
  productDescription: 'Salt Water fish',
  attribute1: 'Large',
  listPrice: 16.5,
  stockStatus: 'IN_STOCK' as const,
}

const SERVER_CART = {
  cartId: 1,
  items: [
    {
      itemId: 'EST-1',
      productId: 'FI-SW-01',
      productName: 'Angelfish',
      attribute1: 'Large',
      quantity: 2,
      listPrice: 16.5,
      lineTotal: 33.0,
      stockStatus: 'IN_STOCK' as const,
      exceedsStock: false,
    },
  ],
  subtotal: 33.0,
}

describe('useCartStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedCartStorage.loadCart.mockReturnValue([])
  })

  describe('未ログイン(localStorage保持)', () => {
    it('初期状態はlocalStorageのloadCart結果をlocalLinesに読み込む', () => {
      mockedCartStorage.loadCart.mockReturnValue([{ itemId: 'EST-1', quantity: 2 }])
      const store = useCartStore()

      expect(store.localLines).toEqual([{ itemId: 'EST-1', quantity: 2 }])
    })

    it('AC5/AC-neg1: addItemはorderable EPで在庫チェックしOKならlocalLinesに追加しsaveCartする', async () => {
      mockedCartApi.checkOrderable.mockResolvedValue({ orderable: true, reason: null })
      const store = useCartStore()

      const result = await store.addItem('EST-1', 2)

      expect(result.success).toBe(true)
      expect(store.localLines).toEqual([{ itemId: 'EST-1', quantity: 2 }])
      expect(mockedCartStorage.saveCart).toHaveBeenCalledWith([{ itemId: 'EST-1', quantity: 2 }])
      expect(mockedCartApi.checkOrderable).toHaveBeenCalledWith('EST-1', 2)
    })

    it('既存行への追加は数量を加算してからorderableチェックする(合算数量で検証)', async () => {
      mockedCartStorage.loadCart.mockReturnValue([{ itemId: 'EST-1', quantity: 2 }])
      mockedCartApi.checkOrderable.mockResolvedValue({ orderable: true, reason: null })
      const store = useCartStore()

      await store.addItem('EST-1', 3)

      expect(mockedCartApi.checkOrderable).toHaveBeenCalledWith('EST-1', 5)
      expect(store.localLines).toEqual([{ itemId: 'EST-1', quantity: 5 }])
    })

    it('AC5: orderable=falseの場合は追加を拒否しlocalLinesを変更しない', async () => {
      mockedCartApi.checkOrderable.mockResolvedValue({ orderable: false, reason: 'OUT_OF_STOCK' })
      const store = useCartStore()

      const result = await store.addItem('EST-3', 1)

      expect(result).toEqual({ success: false, reason: 'OUT_OF_STOCK' })
      expect(store.localLines).toEqual([])
      expect(mockedCartStorage.saveCart).not.toHaveBeenCalled()
    })

    it('AC2: updateItemはquantity<=0でlocalLinesから行を削除する(orderableチェック不要)', async () => {
      mockedCartStorage.loadCart.mockReturnValue([{ itemId: 'EST-1', quantity: 2 }])
      const store = useCartStore()

      const result = await store.updateItem('EST-1', 0)

      expect(result.success).toBe(true)
      expect(store.localLines).toEqual([])
      expect(mockedCartApi.checkOrderable).not.toHaveBeenCalled()
      expect(mockedCartStorage.saveCart).toHaveBeenCalledWith([])
    })

    it('updateItemは在庫内の絶対値であれば置き換える', async () => {
      mockedCartStorage.loadCart.mockReturnValue([{ itemId: 'EST-1', quantity: 2 }])
      mockedCartApi.checkOrderable.mockResolvedValue({ orderable: true, reason: null })
      const store = useCartStore()

      await store.updateItem('EST-1', 7)

      expect(mockedCartApi.checkOrderable).toHaveBeenCalledWith('EST-1', 7)
      expect(store.localLines).toEqual([{ itemId: 'EST-1', quantity: 7 }])
    })

    it('removeItemはlocalLinesから該当行を削除しAPIを呼ばない', async () => {
      mockedCartStorage.loadCart.mockReturnValue([
        { itemId: 'EST-1', quantity: 2 },
        { itemId: 'EST-2', quantity: 1 },
      ])
      const store = useCartStore()

      await store.removeItem('EST-1')

      expect(store.localLines).toEqual([{ itemId: 'EST-2', quantity: 1 }])
      expect(mockedCartStorage.saveCart).toHaveBeenCalledWith([{ itemId: 'EST-2', quantity: 1 }])
    })

    it('itemCountはlocalLinesの数量合計になる', () => {
      mockedCartStorage.loadCart.mockReturnValue([
        { itemId: 'EST-1', quantity: 2 },
        { itemId: 'EST-2', quantity: 3 },
      ])
      const store = useCartStore()

      expect(store.itemCount).toBe(5)
    })

    it('refreshLocalItemDetailsはlocalLinesの各itemIdをcatalogApi.fetchItemで解決しdisplayItemsに反映する', async () => {
      mockedCartStorage.loadCart.mockReturnValue([{ itemId: 'EST-1', quantity: 2 }])
      mockedCatalogApi.fetchItem.mockResolvedValue(ITEM_DETAIL)
      const store = useCartStore()

      await store.refreshLocalItemDetails()

      expect(mockedCatalogApi.fetchItem).toHaveBeenCalledWith('EST-1')
      expect(store.displayItems).toEqual([
        expect.objectContaining({
          itemId: 'EST-1',
          productName: 'Angelfish',
          quantity: 2,
          listPrice: 16.5,
          lineTotal: 33,
        }),
      ])
      expect(store.subtotal).toBe(33)
    })

    it('#7 AC-neg1: isEmptyはlocalLines解決済みのdisplayItemsが空ならtrue', async () => {
      mockedCartStorage.loadCart.mockReturnValue([{ itemId: 'EST-1', quantity: 2 }])
      mockedCatalogApi.fetchItem.mockResolvedValue(ITEM_DETAIL)
      const store = useCartStore()

      expect(store.isEmpty).toBe(true)

      await store.refreshLocalItemDetails()

      expect(store.isEmpty).toBe(false)
    })
  })

  describe('ログイン済み(サーバーカート)', () => {
    beforeEach(() => {
      useAuthStore().user = { username: 'j2ee', roles: ['USER'] }
    })

    it('fetchCartはcartApi.fetchCartの結果をcartへ反映する', async () => {
      mockedCartApi.fetchCart.mockResolvedValue(SERVER_CART)
      const store = useCartStore()

      await store.fetchCart()

      expect(store.cart).toEqual(SERVER_CART)
      expect(store.displayItems).toEqual(SERVER_CART.items)
      expect(store.subtotal).toBe(33)
    })

    it('addItemはcartApi.addItemを呼びcartを更新する', async () => {
      mockedCartApi.addItem.mockResolvedValue(SERVER_CART)
      const store = useCartStore()

      const result = await store.addItem('EST-1', 2)

      expect(result.success).toBe(true)
      expect(mockedCartApi.addItem).toHaveBeenCalledWith('EST-1', 2)
      expect(store.cart).toEqual(SERVER_CART)
    })

    it('addItemが失敗(400等)した場合はfalseを返しcartを変更しない', async () => {
      mockedCartApi.addItem.mockRejectedValue(new HttpError(400, 'Bad Request'))
      const store = useCartStore()

      const result = await store.addItem('EST-3', 1)

      expect(result.success).toBe(false)
    })

    it('updateItemはcartApi.updateItemを呼ぶ', async () => {
      mockedCartApi.updateItem.mockResolvedValue(SERVER_CART)
      const store = useCartStore()

      await store.updateItem('EST-1', 5)

      expect(mockedCartApi.updateItem).toHaveBeenCalledWith('EST-1', 5)
    })

    it('removeItemはcartApi.removeItemを呼ぶ', async () => {
      mockedCartApi.removeItem.mockResolvedValue({ cartId: 1, items: [], subtotal: 0 })
      const store = useCartStore()

      await store.removeItem('EST-1')

      expect(mockedCartApi.removeItem).toHaveBeenCalledWith('EST-1')
    })

    it('itemCountはcart.itemsの数量合計になる', async () => {
      mockedCartApi.fetchCart.mockResolvedValue(SERVER_CART)
      const store = useCartStore()
      await store.fetchCart()

      expect(store.itemCount).toBe(2)
    })

    it('#7 AC-neg1: isEmptyはdisplayItemsが空ならtrue、行があればfalseになる', async () => {
      const store = useCartStore()

      expect(store.isEmpty).toBe(true)

      mockedCartApi.fetchCart.mockResolvedValue(SERVER_CART)
      await store.fetchCart()

      expect(store.isEmpty).toBe(false)
    })
  })

  describe('mergeOnLogin(AC3・計画フェーズ確定②)', () => {
    it('localLinesが空ならmergeを呼ばずfetchCartする', async () => {
      mockedCartStorage.loadCart.mockReturnValue([])
      mockedCartApi.fetchCart.mockResolvedValue({ cartId: 1, items: [], subtotal: 0 })
      const store = useCartStore()

      await store.mergeOnLogin()

      expect(mockedCartApi.merge).not.toHaveBeenCalled()
      expect(mockedCartApi.fetchCart).toHaveBeenCalled()
    })

    it('localLinesが非空ならmergeを呼び、成功時のみlocalStorageをクリアする', async () => {
      mockedCartStorage.loadCart.mockReturnValue([{ itemId: 'EST-1', quantity: 2 }])
      mockedCartApi.merge.mockResolvedValue(SERVER_CART)
      const store = useCartStore()

      await store.mergeOnLogin()

      expect(mockedCartApi.merge).toHaveBeenCalledWith([{ itemId: 'EST-1', quantity: 2 }])
      expect(store.cart).toEqual(SERVER_CART)
      expect(store.localLines).toEqual([])
      expect(mockedCartStorage.clearCart).toHaveBeenCalled()
    })

    it('mergeが失敗した場合はlocalLinesを保持しclearCartを呼ばない(次回リトライ可能)', async () => {
      mockedCartStorage.loadCart.mockReturnValue([{ itemId: 'EST-1', quantity: 2 }])
      mockedCartApi.merge.mockRejectedValue(new HttpError(500, 'Internal Server Error'))
      mockedCartApi.fetchCart.mockResolvedValue({ cartId: 1, items: [], subtotal: 0 })
      const store = useCartStore()

      await store.mergeOnLogin()

      expect(store.localLines).toEqual([{ itemId: 'EST-1', quantity: 2 }])
      expect(mockedCartStorage.clearCart).not.toHaveBeenCalled()
      expect(store.hasError).toBe(true)
    })

    it('mergeを2回連続で呼んでも1回目成功後の2回目はmergeを再実行しない(1回だけマージ)', async () => {
      mockedCartStorage.loadCart.mockReturnValue([{ itemId: 'EST-1', quantity: 2 }])
      mockedCartApi.merge.mockResolvedValue(SERVER_CART)
      mockedCartApi.fetchCart.mockResolvedValue(SERVER_CART)
      const store = useCartStore()

      await store.mergeOnLogin()
      await store.mergeOnLogin()

      expect(mockedCartApi.merge).toHaveBeenCalledTimes(1)
      expect(mockedCartApi.fetchCart).toHaveBeenCalledTimes(1)
    })
  })

  describe('syncOnAuthChange(App.vueからのisAuthenticated監視で呼ばれる想定)', () => {
    it('true(未ログイン→ログイン)かつlocalLines非空ならmergeを実行する', async () => {
      mockedCartStorage.loadCart.mockReturnValue([{ itemId: 'EST-1', quantity: 2 }])
      mockedCartApi.merge.mockResolvedValue(SERVER_CART)
      const store = useCartStore()

      await store.syncOnAuthChange(true)

      expect(mockedCartApi.merge).toHaveBeenCalled()
      expect(store.cart).toEqual(SERVER_CART)
    })

    it('true(未ログイン→ログイン)かつlocalLines空ならfetchCartのみ実行する', async () => {
      mockedCartApi.fetchCart.mockResolvedValue(SERVER_CART)
      const store = useCartStore()

      await store.syncOnAuthChange(true)

      expect(mockedCartApi.merge).not.toHaveBeenCalled()
      expect(mockedCartApi.fetchCart).toHaveBeenCalled()
    })

    it('false(ログアウト)ならcartを空に戻しlocalLinesをlocalStorageから再読込する', async () => {
      mockedCartApi.fetchCart.mockResolvedValue(SERVER_CART)
      const store = useCartStore()
      await store.syncOnAuthChange(true)
      expect(store.cart).toEqual(SERVER_CART)

      mockedCartStorage.loadCart.mockReturnValue([{ itemId: 'EST-9', quantity: 1 }])
      await store.syncOnAuthChange(false)

      expect(store.cart).toEqual({ cartId: null, items: [], subtotal: 0 })
      expect(store.localLines).toEqual([{ itemId: 'EST-9', quantity: 1 }])
    })
  })
})
