// #8: 注文確定ユースケースのフロントエンドDomain型。
import type { Address } from '@/domain/checkout'

/**
 * 注文確定リクエスト（AC1・SBD-2アローリスト）。数量・価格・usernameは含めない
 * （数量はサーバ側DBカート、価格はサーバ再計算、usernameは認証プリンシパルからそれぞれ導出されるため）。
 */
export interface OrderPlacementRequest {
  billing: Address
  shipping: Address
  useSeparateShipping: boolean
}

/** 注文確定の結果（計画フェーズ確定②: 完了画面は注文番号＋サーバ再計算合計のみ）。 */
export interface OrderConfirmation {
  orderId: number
  totalPrice: number
}

/** #9: 注文履歴一覧の1行（明細・住所は持たない）。 */
export interface OrderSummary {
  orderId: number
  orderDate: string
  totalPrice: number
}

/**
 * #10: 注文詳細の明細1行。{@link lineTotal}（`unitPrice * quantity`）はapi層で前段算出する
 * （backendは行合計を返さないため）。
 */
export interface OrderDetailLine {
  itemId: string
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

/** #10 Sprint14 Q2確定: 明細＋注文合計＋注文日のみ（住所は意図的に持たない）。 */
export interface OrderDetail {
  orderId: number
  orderDate: string
  totalPrice: number
  lines: OrderDetailLine[]
}
