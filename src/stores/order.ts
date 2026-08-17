import { defineStore } from 'pinia'
import * as orderApi from '@/api/orderApi'
import { HttpError } from '@/api/httpClient'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
import type { OrderConfirmation } from '@/domain/order'

export type PlaceOrderErrorReason = 'INSUFFICIENT_STOCK' | 'default'

function initialState() {
  return {
    isPlacing: false,
    placeError: null as PlaceOrderErrorReason | null,
    result: null as OrderConfirmation | null,
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
  },
})
