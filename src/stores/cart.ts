import { defineStore } from 'pinia'
import * as cartApi from '@/api/cartApi'
import * as catalogApi from '@/api/catalogApi'
import { loadCart, saveCart, clearCart, type StoredCartLine } from '@/utils/cartStorage'
import { useAuthStore } from '@/stores/auth'
import type { Cart, CartItem } from '@/domain/cart'
import type { ItemDetail } from '@/domain/catalog'

function emptyCart(): Cart {
  return { cartId: null, items: [], subtotal: 0 }
}

export interface CartActionResult {
  success: boolean
  reason?: string
}

/**
 * #4 AC1〜AC5・[L2]・AC-neg1: カート状態を保持するPinia store。
 *
 * <p>未ログインは {@link localLines}（localStorageミラー・D2/AC3）を真実とし、ログイン中は
 * {@link cart}（サーバーカート）を真実とする。未ログイン中のadd/updateは backend の orderable
 * EP（{@code cartApi.checkOrderable}）で在庫上限チェックしてから反映する（AC5/AC-neg1・qty非露出のまま
 * 匿名でも上限を強制できる。D1）。
 *
 * <p>{@link syncOnAuthChange} は App.vue が {@code authStore.isAuthenticated} の変化を監視して
 * 呼び出す想定（false→true でマージ・true→false でサーバーカート状態を破棄）。マージは
 * {@link localLines} が空になるまで（＝成功するまで）何度呼んでも冪等に再試行され、成功時のみ
 * localStorageをクリアする（二重マージ防止・失敗時リトライ）。
 */
export const useCartStore = defineStore('cart', {
  state: () => ({
    /** ログイン中の真実（サーバーカート）。 */
    cart: emptyCart(),
    /** 未ログイン中の真実（localStorageミラー）。 */
    localLines: loadCart() as StoredCartLine[],
    /** 未ログイン時のカート表示用に解決したアイテム詳細（itemId→ItemDetail）。 */
    localItemDetails: {} as Record<string, ItemDetail>,
    isLoading: false,
    hasError: false,
  }),

  getters: {
    /** ヘッダーの件数バッジ用。認証状態に応じて真実のソースを切り替える。 */
    itemCount(state): number {
      if (useAuthStore().isAuthenticated) {
        return state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
      return state.localLines.reduce((sum, line) => sum + line.quantity, 0)
    },

    /** CartView表示用の行一覧。未ログイン時は{@link localItemDetails}で解決済みの行のみ返す。 */
    displayItems(state): CartItem[] {
      if (useAuthStore().isAuthenticated) {
        return state.cart.items
      }
      return state.localLines
        .map((line): CartItem | null => {
          const detail = state.localItemDetails[line.itemId]
          if (!detail) {
            return null
          }
          return {
            itemId: detail.itemId,
            productId: detail.productId,
            productName: detail.productName,
            attribute1: detail.attribute1,
            quantity: line.quantity,
            listPrice: detail.listPrice,
            lineTotal: detail.listPrice * line.quantity,
            stockStatus: detail.stockStatus,
            exceedsStock: false,
          }
        })
        .filter((item): item is CartItem => item !== null)
    },

    subtotal(): number {
      return this.displayItems.reduce((sum: number, item: CartItem) => sum + item.lineTotal, 0)
    },

    /** #7 AC-neg1: チェックアウト進入可否の判定に使う(空カートでnewOrderFormへ進めない)。 */
    isEmpty(): boolean {
      return this.displayItems.length === 0
    },
  },

  actions: {
    /** ログイン中: サーバーカートを取得する(AC1)。 */
    async fetchCart(): Promise<void> {
      this.isLoading = true
      this.hasError = false
      try {
        this.cart = await cartApi.fetchCart()
      } catch {
        this.hasError = true
      } finally {
        this.isLoading = false
      }
    },

    /** 未ログイン中: localLinesの各itemIdをcatalogApi.fetchItemで解決しdisplayItemsに反映する。 */
    async refreshLocalItemDetails(): Promise<void> {
      const missingIds = this.localLines
        .map((line) => line.itemId)
        .filter((itemId) => !(itemId in this.localItemDetails))
      if (missingIds.length === 0) {
        return
      }
      const details = await Promise.all(
        missingIds.map((itemId) => catalogApi.fetchItem(itemId).catch(() => null)),
      )
      details.forEach((detail) => {
        if (detail) {
          this.localItemDetails[detail.itemId] = detail
        }
      })
    },

    /** AC1: カートへの追加。既存数量+requestedQuantityの絶対値をサーバ/orderable EPで在庫チェックする。 */
    async addItem(itemId: string, quantity = 1): Promise<CartActionResult> {
      if (useAuthStore().isAuthenticated) {
        return this.callServer(() => cartApi.addItem(itemId, quantity))
      }
      const existing = this.localLines.find((line) => line.itemId === itemId)
      const newQuantity = (existing?.quantity ?? 0) + quantity
      return this.applyLocalQuantity(itemId, newQuantity)
    },

    /** AC1/AC2: カート内数量の明示更新。quantity<=0は行削除（orderableチェック不要）。 */
    async updateItem(itemId: string, quantity: number): Promise<CartActionResult> {
      if (useAuthStore().isAuthenticated) {
        return this.callServer(() => cartApi.updateItem(itemId, quantity))
      }
      return this.applyLocalQuantity(itemId, quantity)
    },

    /** AC1: カートからの明示削除。 */
    async removeItem(itemId: string): Promise<CartActionResult> {
      if (useAuthStore().isAuthenticated) {
        return this.callServer(() => cartApi.removeItem(itemId))
      }
      this.localLines = this.localLines.filter((line) => line.itemId !== itemId)
      saveCart(this.localLines)
      return { success: true }
    },

    /** 未ログイン中の絶対数量適用。quantity<=0は削除、正の値はorderable EPで検証してから反映する。 */
    async applyLocalQuantity(itemId: string, quantity: number): Promise<CartActionResult> {
      if (quantity <= 0) {
        this.localLines = this.localLines.filter((line) => line.itemId !== itemId)
        saveCart(this.localLines)
        return { success: true }
      }
      const result = await cartApi.checkOrderable(itemId, quantity)
      if (!result.orderable) {
        return { success: false, reason: result.reason ?? undefined }
      }
      const existing = this.localLines.find((line) => line.itemId === itemId)
      if (existing) {
        existing.quantity = quantity
      } else {
        this.localLines.push({ itemId, quantity })
      }
      saveCart(this.localLines)
      return { success: true }
    },

    async callServer(action: () => Promise<Cart>): Promise<CartActionResult> {
      this.hasError = false
      try {
        this.cart = await action()
        return { success: true }
      } catch {
        this.hasError = true
        return { success: false }
      }
    },

    /**
     * AC3・計画フェーズ確定②: ログイン時マージ。localLinesが空ならmergeを呼ばずfetchCartのみ行う
     * （＝1回成功した後の再呼び出しは自動的にno-op化する）。成功時のみlocalStorageをクリアし、
     * 失敗時はlocalLinesを保持して次回呼び出しでのリトライを可能にする。
     */
    async mergeOnLogin(): Promise<void> {
      if (this.localLines.length === 0) {
        await this.fetchCart()
        return
      }
      this.hasError = false
      try {
        this.cart = await cartApi.merge(this.localLines)
        this.localLines = []
        clearCart()
      } catch {
        // フォールバックのfetchCart自体がhasErrorをリセットしうるため、マージ失敗の事実を
        // 上書きされないよう最後に再度trueへ戻す。
        await this.fetchCart().catch(() => undefined)
        this.hasError = true
      }
    },

    /**
     * #8: 注文確定成功後にカートを空へリセットする(サーバー側は既にOrderApplicationServiceが
     * t_cart_itemを全クリア済み。ここではクライアント側の表示状態とlocalStorageミラーを合わせて
     * リセットするだけで、追加のAPI呼び出しは行わない)。
     */
    clearAfterOrder(): void {
      this.cart = emptyCart()
      this.localLines = []
      clearCart()
    },

    /** App.vueがauthStore.isAuthenticatedの変化を監視して呼ぶ。 */
    async syncOnAuthChange(isAuthenticated: boolean): Promise<void> {
      if (isAuthenticated) {
        await this.mergeOnLogin()
      } else {
        this.cart = emptyCart()
        this.localLines = loadCart()
      }
    },
  },
})
