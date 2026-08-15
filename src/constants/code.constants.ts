/**
 * 区分値カテゴリ（CODE_TYPE）の定義
 */
export const CODE_TYPE = {
  ORDER_STATUS: '0001', // OrderStatus (注文ステータス)
  CARD_TYPE: '0002', // CardType (カード種別)
  STOCK_STATUS: '0003', // StockStatus (在庫ステータス)
} as const

/**
 * 0001: 注文ステータス (OrderStatus)
 */
export const ORDER_STATUS = {
  NEW: 'NEW', // 新規
  PAID: 'PAID', // 支払済
  SHIPPED: 'SHIPPED', // 出荷済
} as const
export type OrderStatusCode = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

/**
 * 0002: カード種別 (CardType)
 */
export const CARD_TYPE = {
  VISA: 'VISA', // VISA
  MASTERCARD: 'MASTERCARD', // Mastercard
  AMERICAN_EXPRESS: 'AMEX', // アメリカン・エキスプレス
} as const
export type CardTypeCode = (typeof CARD_TYPE)[keyof typeof CARD_TYPE]

/**
 * 0003: 在庫ステータス (StockStatus)
 */
export const STOCK_STATUS = {
  IN_STOCK: 'IN_STOCK', // 在庫あり
  LOW_STOCK: 'LOW_STOCK', // 残少
  OUT_OF_STOCK: 'OUT_STOCK', // 在庫切れ
} as const
export type StockStatusCode = (typeof STOCK_STATUS)[keyof typeof STOCK_STATUS]
