// #1: カタログ階層(category→product→item)のドメイン型。backendのCatalogControllerと対応する。
import type { StockStatusCode } from '@/constants/code.constants'

export interface Category {
  categoryId: string
  name: string
  description: string
}

export interface Product {
  productId: string
  categoryId: string
  name: string
  description: string
}

export interface ItemSummary {
  itemId: string
  productId: string
  attribute1: string | null
  listPrice: number
  stockStatus: StockStatusCode
}

export interface ItemDetail {
  itemId: string
  productId: string
  productName: string
  productDescription: string
  attribute1: string | null
  listPrice: number
  stockStatus: StockStatusCode
}

/**
 * 一覧APIのページング結果(#1 論点3・backendの{@code PageResponse<T>}と同形)。1-index。
 * #2(商品検索)・#9(注文履歴一覧)が再利用する先例。
 */
export interface PageResult<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
