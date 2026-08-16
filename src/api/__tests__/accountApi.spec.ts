import { describe, it, expect, vi } from 'vitest'
import { fetchAccountContact } from '@/api/accountApi'
import { request } from '@/api/httpClient'

vi.mock('@/api/httpClient')

const mockedRequest = vi.mocked(request)

describe('accountApi', () => {
  it('fetchAccountContactはGET /api/account/meを発行しDTOをdomainへ変換する', async () => {
    mockedRequest.mockResolvedValue({
      firstName: 'Taro',
      lastName: 'Yamada',
      email: 'taro@example.com',
      phone: '555-0100',
      address1: '1 Test St',
      address2: 'Suite 2',
      city: 'Testville',
      state: 'CA',
      postalCode: '90000',
      country: 'USA',
    })

    const contact = await fetchAccountContact()

    expect(mockedRequest).toHaveBeenCalledWith('/api/account/me')
    expect(contact).toEqual({
      firstName: 'Taro',
      lastName: 'Yamada',
      email: 'taro@example.com',
      phone: '555-0100',
      address1: '1 Test St',
      address2: 'Suite 2',
      city: 'Testville',
      state: 'CA',
      postalCode: '90000',
      country: 'USA',
    })
  })

  it('address2がnullのDTOもnullのままdomainへ渡す(任意項目)', async () => {
    mockedRequest.mockResolvedValue({
      firstName: 'Taro',
      lastName: 'Yamada',
      email: 'taro@example.com',
      phone: '555-0100',
      address1: '1 Test St',
      address2: null,
      city: 'Testville',
      state: 'CA',
      postalCode: '90000',
      country: 'USA',
    })

    const contact = await fetchAccountContact()

    expect(contact.address2).toBeNull()
  })
})
