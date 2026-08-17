import { defineStore } from 'pinia'
import * as orderApi from '@/api/orderApi'
import { HttpError } from '@/api/httpClient'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
import type { PageResult } from '@/domain/catalog'
import type { OrderConfirmation, OrderDetail, OrderSummary } from '@/domain/order'

export type PlaceOrderErrorReason = 'INSUFFICIENT_STOCK' | 'default'

function emptyPage<T>(): PageResult<T> {
  return { content: [], page: 1, size: 12, totalElements: 0, totalPages: 0 }
}

function initialState() {
  return {
    isPlacing: false,
    placeError: null as PlaceOrderErrorReason | null,
    result: null as OrderConfirmation | null,

    // #9: 注文履歴一覧(本人スコープ・サーバページング)。
    history: emptyPage<OrderSummary>(),
    isLoadingHistory: false,

    // #10: 注文詳細(所有者限定)。
    detail: null as OrderDetail | null,
    isLoadingDetail: false,
    // AC-neg1/AC-neg2(SBD-1/SBD-8): 403(非所有)・404相当(不存在)を区別せず統一エラーとして扱う
    // (存在推測を与えない。Viewは本フラグのみで判定する)。
    detailUnavailable: false,
  }
}

/**
 * #8: 注文確定の状態管理。ウィザードの下書き（{@code checkout} store）とは分離し、確定結果（result）のみを
 * 保持する。
 *
 * <p>{@code checkout} store から billing/shipping/useSeparateShipping を読み取り {@code orderApi.placeOrder}
 * を呼ぶ。成功時は {@link CheckoutCompleteView} が参照する {@link result} を設定し、サーバーカートは既に
 * クリア済みのため {@code cartStore.clearAfterOrder()}（クライアント側表示のリセットのみ・追加API呼び出しなし）
 * と {@code checkoutStore.reset()}（下書きの明示リセット）を行う。
 */
export const useOrderStore = defineStore('order', {
  state: initialState,

  getters: {
    /** #8: 完了画面への進入可否判定に使う（結果が無ければ`/`へリダイレクト）。 */
    hasResult: (state) => state.result !== null,
  },

  actions: {
    /** 注文確定（AC1〜AC6）。成功=true、失敗=falseを返す（Viewが分岐に使う）。 */
    async placeOrder(): Promise<boolean> {
      const checkoutStore = useCheckoutStore()
      this.isPlacing = true
      this.placeError = null
      try {
        this.result = await orderApi.placeOrder({
          billing: checkoutStore.billing,
          shipping: checkoutStore.shipping,
          useSeparateShipping: checkoutStore.useSeparateShipping,
        })
        useCartStore().clearAfterOrder()
        checkoutStore.reset()
        return true
      } catch (error) {
        // 409=在庫不足(InsufficientStockException)。それ以外は一律defaultメッセージへ分類する。
        this.placeError =
          error instanceof HttpError && error.status === 409 ? 'INSUFFICIENT_STOCK' : 'default'
        return false
      } finally {
        this.isPlacing = false
      }
    },

    reset(): void {
      Object.assign(this, initialState())
    },

    /** #9 AC1: 認証プリンシパル本人の注文履歴一覧(新しい順)を取得する。失敗しても例外は伝播しない。 */
    async fetchHistory(page?: number): Promise<void> {
      this.isLoadingHistory = true
      try {
        this.history = await orderApi.fetchOrders(page)
      } catch {
        this.history = emptyPage<OrderSummary>()
      } finally {
        this.isLoadingHistory = false
      }
    },

    /**
     * #10 AC1〜AC4: 所有者限定の注文詳細を取得する。403(非所有)・不存在相当のいずれも
     * {@link detailUnavailable}のみで表す(AC-neg1/AC-neg2・区別しない統一エラー)。
     */
    async fetchDetail(orderId: number): Promise<void> {
      this.isLoadingDetail = true
      this.detailUnavailable = false
      this.detail = null
      try {
        this.detail = await orderApi.fetchOrder(orderId)
      } catch {
        this.detail = null
        this.detailUnavailable = true
      } finally {
        this.isLoadingDetail = false
      }
    },
  },
})
