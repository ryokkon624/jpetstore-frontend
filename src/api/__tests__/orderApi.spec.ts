import { describe, it, expect, vi } from 'vitest'
import { placeOrder, fetchOrders, fetchOrder } from '@/api/orderApi'
import { request } from '@/api/httpClient'
import { emptyAddress } from '@/domain/checkout'

vi.mock('@/api/httpClient')

const mockedRequest = vi.mocked(request)

const BILLING = {
  ...emptyAddress(),
  firstName: 'Taro',
  lastName: 'Yamada',
  email: 'taro@example.com',
  phone: '555-0100',
  address1: '1 Test St',
  city: 'Testville',
  state: 'CA',
  postalCode: '90000',
  country: 'USA',
}

describe('orderApi', () => {
  it('placeOrderはPOST /api/ordersへbilling/shipping/useSeparateShippingのみを送信しDTOをdomainへ変換する', async () => {
    mockedRequest.mockResolvedValue({ orderId: 123, totalPrice: 168.5 })

    const confirmation = await placeOrder({
      billing: BILLING,
      shipping: emptyAddress(),
      useSeparateShipping: false,
    })

    expect(mockedRequest).toHaveBeenCalledWith('/api/orders', {
      method: 'POST',
      body: {
        billing: BILLING,
        shipping: emptyAddress(),
        useSeparateShipping: false,
      },
    })
    expect(confirmation).toEqual({ orderId: 123, totalPrice: 168.5 })
  })

  it('useSeparateShipping=trueかつ別配送先ありのリクエストもそのまま送信する', async () => {
    mockedRequest.mockResolvedValue({ orderId: 456, totalPrice: 20 })
    const shipping = {
      ...emptyAddress(),
      firstName: 'Hanako',
      address1: '2 Ship Ave',
      city: 'Shipville',
    }

    await placeOrder({ billing: BILLING, shipping, useSeparateShipping: true })

    expect(mockedRequest).toHaveBeenCalledWith('/api/orders', {
      method: 'POST',
      body: { billing: BILLING, shipping, useSeparateShipping: true },
    })
  })

  it('#9 AC1: fetchOrdersはGET /api/ordersを発行しPageResultへ変換する', async () => {
    mockedRequest.mockResolvedValue({
      content: [{ orderId: 3, orderDate: '2026-01-03', totalPrice: 30 }],
      page: 1,
      size: 12,
      totalElements: 1,
      totalPages: 1,
    })

    const page = await fetchOrders()

    expect(mockedRequest).toHaveBeenCalledWith('/api/orders')
    expect(page).toEqual({
      content: [{ orderId: 3, orderDate: '2026-01-03', totalPrice: 30 }],
      page: 1,
      size: 12,
      totalElements: 1,
      totalPages: 1,
    })
  })

  it('#9 AC1: fetchOrdersはpage/sizeをクエリに載せる', async () => {
    mockedRequest.mockResolvedValue({
      content: [],
      page: 2,
      size: 5,
      totalElements: 0,
      totalPages: 0,
    })

    await fetchOrders(2, 5)

    expect(mockedRequest).toHaveBeenCalledWith('/api/orders?page=2&size=5')
  })

  it('#10 AC1/AC2/AC4: fetchOrderはGET /api/orders/{orderId}を発行しlineTotalを前段算出する', async () => {
    mockedRequest.mockResolvedValue({
      orderId: 9,
      orderDate: '2026-01-09',
      totalPrice: 33,
      lines: [{ itemId: 'EST-1', productName: 'Angelfish', quantity: 2, unitPrice: 16.5 }],
    })

    const detail = await fetchOrder(9)

    expect(mockedRequest).toHaveBeenCalledWith('/api/orders/9')
    expect(detail).toEqual({
      orderId: 9,
      orderDate: '2026-01-09',
      totalPrice: 33,
      lines: [
        { itemId: 'EST-1', productName: 'Angelfish', quantity: 2, unitPrice: 16.5, lineTotal: 33 },
      ],
    })
  })
})
