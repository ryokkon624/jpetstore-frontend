// #8 AC4/#9/#10: 注文確定・注文履歴一覧・注文詳細のAPIクライアント。
// POST /api/ordersは非GETのためhttpClientがCSRFを自動付与する(consume-then-regenerate挙動への
// 自己修復prime込み。既達httpClientを無改造再利用)。GET /api/orders・GET /api/orders/{orderId}は
// 認証必須(anyRequest().authenticated())だがCSRF対象外(GETのため)。
import { request } from '@/api/httpClient'
import type { PageResult } from '@/domain/catalog'
import type {
  OrderConfirmation,
  OrderDetail,
  OrderDetailLine,
  OrderPlacementRequest,
  OrderSummary,
} from '@/domain/order'

interface OrderConfirmationDto {
  orderId: number
  totalPrice: number
}

interface OrderSummaryDto {
  orderId: number
  orderDate: string
  totalPrice: number
}

interface OrderDetailLineDto {
  itemId: string
  productName: string
  quantity: number
  unitPrice: number
}

interface OrderDetailDto {
  orderId: number
  orderDate: string
  totalPrice: number
  lines: OrderDetailLineDto[]
}

interface PageDto<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

function toOrderConfirmation(dto: OrderConfirmationDto): OrderConfirmation {
  return { orderId: dto.orderId, totalPrice: dto.totalPrice }
}

function toOrderSummary(dto: OrderSummaryDto): OrderSummary {
  return { orderId: dto.orderId, orderDate: dto.orderDate, totalPrice: dto.totalPrice }
}

/** {@link OrderDetailLine.lineTotal}(`unitPrice * quantity`)はbackendが返さないため前段算出する。 */
function toOrderDetailLine(dto: OrderDetailLineDto): OrderDetailLine {
  return {
    itemId: dto.itemId,
    productName: dto.productName,
    quantity: dto.quantity,
    unitPrice: dto.unitPrice,
    lineTotal: dto.unitPrice * dto.quantity,
  }
}

function toOrderDetail(dto: OrderDetailDto): OrderDetail {
  return {
    orderId: dto.orderId,
    orderDate: dto.orderDate,
    totalPrice: dto.totalPrice,
    lines: dto.lines.map(toOrderDetailLine),
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

/**
 * 注文確定(AC1〜AC6)。billing/shipping/useSeparateShippingのみを送信する(SBD-2アローリスト)。
 * 数量はサーバ側DBカート・価格はサーバ再計算・usernameは認証プリンシパルからそれぞれ導出されるため、
 * リクエストにtotalPrice/username/quantityフィールドを一切持たない(AC-neg1/AC-neg3を構造的に担保)。
 */
export async function placeOrder(placement: OrderPlacementRequest): Promise<OrderConfirmation> {
  const dto = await request<OrderConfirmationDto>('/api/orders', {
    method: 'POST',
    body: placement,
  })
  return toOrderConfirmation(dto)
}

/** #9 AC1: 本人の注文履歴一覧(新しい順・サーバページング。size省略時はbackend既定=12)。 */
export async function fetchOrders(page?: number, size?: number): Promise<PageResult<OrderSummary>> {
  const dto = await request<PageDto<OrderSummaryDto>>(`/api/orders${pageQuery(page, size)}`)
  return toPageResult(dto, toOrderSummary)
}

/** #10 AC1〜AC4: 所有者限定の注文詳細(明細・合計・注文日のみ。住所は含まれない)。 */
export async function fetchOrder(orderId: number): Promise<OrderDetail> {
  const dto = await request<OrderDetailDto>(`/api/orders/${orderId}`)
  return toOrderDetail(dto)
}
