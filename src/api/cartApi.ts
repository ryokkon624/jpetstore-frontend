// #4: カートREST APIクライアント(view/add/update/remove/merge＋orderable)。
// /api/cart/** は認証必須(backend SecurityConfig無変更)。非GETはhttpClientがCSRFを自動付与する。
import { request } from '@/api/httpClient'
import type { Cart, CartItem, OrderabilityResult } from '@/domain/cart'
import type { StoredCartLine } from '@/utils/cartStorage'

interface CartItemDto {
  itemId: string
  productId: string
  productName: string
  attribute1: string | null
  quantity: number
  listPrice: number
  lineTotal: number
  stockStatus: string
  exceedsStock: boolean
}

interface CartDto {
  cartId: number | null
  items: CartItemDto[]
  subtotal: number
}

interface OrderableDto {
  orderable: boolean
  reason: string | null
}

function toCartItem(dto: CartItemDto): CartItem {
  return {
    itemId: dto.itemId,
    productId: dto.productId,
    productName: dto.productName,
    attribute1: dto.attribute1,
    quantity: dto.quantity,
    listPrice: dto.listPrice,
    lineTotal: dto.lineTotal,
    stockStatus: dto.stockStatus as CartItem['stockStatus'],
    exceedsStock: dto.exceedsStock,
  }
}

function toCart(dto: CartDto): Cart {
  return {
    cartId: dto.cartId,
    items: dto.items.map(toCartItem),
    subtotal: dto.subtotal,
  }
}

/** カート表示(AC1)。初回はbackend側でカートが自動作成される(ensureCart)。 */
export async function fetchCart(): Promise<Cart> {
  const dto = await request<CartDto>('/api/cart')
  return toCart(dto)
}

/** カートへの追加(AC1)。quantity省略時はbackend既定(1)。 */
export async function addItem(itemId: string, quantity?: number): Promise<Cart> {
  const dto = await request<CartDto>('/api/cart/items', {
    method: 'POST',
    body: { itemId, quantity },
  })
  return toCart(dto)
}

/** カート内数量の明示更新(AC1)。quantity<=0は行削除になる(AC2)。 */
export async function updateItem(itemId: string, quantity: number): Promise<Cart> {
  const dto = await request<CartDto>(`/api/cart/items/${encodeURIComponent(itemId)}`, {
    method: 'PUT',
    body: { quantity },
  })
  return toCart(dto)
}

/** カートからの明示削除(AC1)。 */
export async function removeItem(itemId: string): Promise<Cart> {
  const dto = await request<CartDto>(`/api/cart/items/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
  })
  return toCart(dto)
}

/** ログイン時マージ(AC3・計画フェーズ確定②)。未ログイン中のlocalStorage行をサーバーカートへ加算しクランプする。 */
export async function merge(lines: StoredCartLine[]): Promise<Cart> {
  const dto = await request<CartDto>('/api/cart/merge', { method: 'POST', body: lines })
  return toCart(dto)
}

/**
 * D1: 指定数量での注文可否を判定する(未認証でも呼べる公開EP)。未ログイン時のカート段階の在庫上限
 * チェック(AC5/AC-neg1)に使う。在庫数そのものは返さない(ID-28)。
 */
export async function checkOrderable(
  itemId: string,
  quantity: number,
): Promise<OrderabilityResult> {
  const params = new URLSearchParams({ quantity: String(quantity) })
  const dto = await request<OrderableDto>(
    `/api/items/${encodeURIComponent(itemId)}/orderable?${params.toString()}`,
  )
  return { orderable: dto.orderable, reason: dto.reason }
}
