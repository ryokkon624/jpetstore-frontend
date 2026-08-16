// #4: カート(サーバー永続/クライアント状態)のドメイン型。backendのCartControllerと対応する。
import type { StockStatusCode } from '@/constants/code.constants'

export interface CartItem {
  itemId: string
  productId: string
  productName: string
  attribute1: string | null
  quantity: number
  listPrice: number
  lineTotal: number
  stockStatus: StockStatusCode
  /** 在庫減により数量が現在の在庫数を超えている(表示バッジ警告のみ・実強制はE3)。 */
  exceedsStock: boolean
}

export interface Cart {
  cartId: number | null
  items: CartItem[]
  subtotal: number
}

/** D1: 指定数量での注文可否(orderable EP)。在庫数そのものは含まない(ID-28)。 */
export interface OrderabilityResult {
  orderable: boolean
  reason: string | null
}
