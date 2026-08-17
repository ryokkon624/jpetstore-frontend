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
