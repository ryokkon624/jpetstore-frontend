import { describe, it, expect, vi } from 'vitest'
import { placeOrder } from '@/api/orderApi'
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
})
