// #8 AC4: 注文確定APIクライアント(POST /api/orders)。非GETのためhttpClientがCSRFを自動付与する
// (consume-then-regenerate挙動への自己修復prime込み。既達httpClientを無改造再利用)。
import { request } from '@/api/httpClient'
import type { OrderConfirmation, OrderPlacementRequest } from '@/domain/order'

interface OrderConfirmationDto {
  orderId: number
  totalPrice: number
}

function toOrderConfirmation(dto: OrderConfirmationDto): OrderConfirmation {
  return { orderId: dto.orderId, totalPrice: dto.totalPrice }
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
