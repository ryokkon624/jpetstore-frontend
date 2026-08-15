// #1: カタログ階層(category→product→item)のREST APIクライアント。
// 全エンドポイントGETのみ・全公開(backend SecurityConfigでpermitAll)のためCSRF/認証は不要。
import { request } from '@/api/httpClient'
import type { Category, ItemDetail, ItemSummary, PageResult, Product } from '@/domain/catalog'

interface CategoryDto {
  categoryId: string
  name: string
  description: string
}

interface ProductDto {
  productId: string
  categoryId: string
  name: string
  description: string
}

interface ItemSummaryDto {
  itemId: string
  productId: string
  attribute1: string | null
  listPrice: number
  stockStatus: string
}

interface ItemDetailDto {
  itemId: string
  productId: string
  productName: string
  productDescription: string
  attribute1: string | null
  listPrice: number
  stockStatus: string
}

interface PageDto<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

function toCategory(dto: CategoryDto): Category {
  return { categoryId: dto.categoryId, name: dto.name, description: dto.description }
}

function toProduct(dto: ProductDto): Product {
  return {
    productId: dto.productId,
    categoryId: dto.categoryId,
    name: dto.name,
    description: dto.description,
  }
}

function toItemSummary(dto: ItemSummaryDto): ItemSummary {
  return {
    itemId: dto.itemId,
    productId: dto.productId,
    attribute1: dto.attribute1,
    listPrice: dto.listPrice,
    stockStatus: dto.stockStatus as ItemSummary['stockStatus'],
  }
}

function toItemDetail(dto: ItemDetailDto): ItemDetail {
  return {
    itemId: dto.itemId,
    productId: dto.productId,
    productName: dto.productName,
    productDescription: dto.productDescription,
    attribute1: dto.attribute1,
    listPrice: dto.listPrice,
    stockStatus: dto.stockStatus as ItemDetail['stockStatus'],
  }
}

function toPageResult<D, T>(dto: PageDto<D>, mapper: (d: D) => T): PageResult<T> {
  return {
    content: dto.content.map(mapper),
    page: dto.page,
    size: dto.size,
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
  }
}

function pageQuery(page?: number, size?: number): string {
  const params = new URLSearchParams()
  if (page !== undefined) {
    params.set('page', String(page))
  }
  if (size !== undefined) {
    params.set('size', String(size))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

/** カテゴリ一覧([L2]で5件固定・非ページング)。 */
export async function fetchCategories(): Promise<Category[]> {
  const dtos = await request<CategoryDto[]>('/api/categories')
  return dtos.map(toCategory)
}

export async function fetchCategory(categoryId: string): Promise<Category> {
  const dto = await request<CategoryDto>(`/api/categories/${encodeURIComponent(categoryId)}`)
  return toCategory(dto)
}

/** カテゴリ内の商品一覧(AC2・ページング。size省略時はbackend既定=12)。 */
export async function fetchProductsByCategory(
  categoryId: string,
  page?: number,
  size?: number,
): Promise<PageResult<Product>> {
  const dto = await request<PageDto<ProductDto>>(
    `/api/categories/${encodeURIComponent(categoryId)}/products${pageQuery(page, size)}`,
  )
  return toPageResult(dto, toProduct)
}

export async function fetchProduct(productId: string): Promise<Product> {
  const dto = await request<ProductDto>(`/api/products/${encodeURIComponent(productId)}`)
  return toProduct(dto)
}

/** 商品内の在庫アイテム一覧(AC2・ページング。qtyは含まれずstockStatusのみ)。 */
export async function fetchItemsByProduct(
  productId: string,
  page?: number,
  size?: number,
): Promise<PageResult<ItemSummary>> {
  const dto = await request<PageDto<ItemSummaryDto>>(
    `/api/products/${encodeURIComponent(productId)}/items${pageQuery(page, size)}`,
  )
  return toPageResult(dto, toItemSummary)
}

/** アイテム詳細(AC3・在庫status。qtyは含まれない)。 */
export async function fetchItem(itemId: string): Promise<ItemDetail> {
  const dto = await request<ItemDetailDto>(`/api/items/${encodeURIComponent(itemId)}`)
  return toItemDetail(dto)
}
