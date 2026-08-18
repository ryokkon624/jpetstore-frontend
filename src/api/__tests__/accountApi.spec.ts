import { describe, it, expect, vi } from 'vitest'
import {
  fetchAccountContact,
  registerAccount,
  fetchAccount,
  updateAccount,
  changePassword,
} from '@/api/accountApi'
import { request } from '@/api/httpClient'
import { emptyAddress } from '@/domain/checkout'
import type { RegisterPayload, AccountEditDetail } from '@/domain/account'

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

  it('#13 AC1: registerAccountはPOST /api/registerへallowlistフィールドのみ送信しAuthenticatedUserへ変換する', async () => {
    mockedRequest.mockResolvedValue({ username: 'new_user', roles: ['USER'] })
    const payload: RegisterPayload = {
      ...emptyAddress(),
      username: 'new_user',
      password: 'correct-horse',
      repeatedPassword: 'correct-horse',
      firstName: 'Taro',
      lastName: 'Yamada',
      email: 'new_user@example.com',
      phone: '555-0100',
      address1: '1 Test St',
      address2: 'Suite 2',
      city: 'Testville',
      state: 'CA',
      postalCode: '90000',
      country: 'USA',
    }

    const user = await registerAccount(payload)

    expect(mockedRequest).toHaveBeenCalledWith('/api/register', {
      method: 'POST',
      body: {
        username: 'new_user',
        password: 'correct-horse',
        repeatedPassword: 'correct-horse',
        email: 'new_user@example.com',
        firstName: 'Taro',
        lastName: 'Yamada',
        address1: '1 Test St',
        address2: 'Suite 2',
        city: 'Testville',
        state: 'CA',
        postalCode: '90000',
        country: 'USA',
        phone: '555-0100',
      },
      skipAuthRetry: true,
    })
    expect(user).toEqual({ username: 'new_user', roles: ['USER'] })
  })

  it('#13: registerAccountはaddress2が空文字ならnullとして送信する', async () => {
    mockedRequest.mockResolvedValue({ username: 'new_user2', roles: ['USER'] })
    const payload: RegisterPayload = {
      ...emptyAddress(),
      username: 'new_user2',
      password: 'correct-horse',
      repeatedPassword: 'correct-horse',
      firstName: 'Taro',
      lastName: 'Yamada',
      email: 'new_user2@example.com',
      phone: '555-0100',
      address1: '1 Test St',
      address2: '',
      city: 'Testville',
      state: 'CA',
      postalCode: '90000',
      country: 'USA',
    }

    await registerAccount(payload)

    const [, options] = mockedRequest.mock.calls.at(-1)!
    expect((options!.body as { address2: string | null }).address2).toBeNull()
  })

  it('#14 AC3/E3: fetchAccountはGET /api/accountを発行しversion込みでdomainへ変換する', async () => {
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
      languagePreference: 'english',
      favoriteCategoryId: 'FISH',
      colorSchemePreference: 'dark',
      version: 3,
    })

    const detail = await fetchAccount()

    expect(mockedRequest).toHaveBeenCalledWith('/api/account')
    expect(detail).toEqual({
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
      languagePreference: 'english',
      favoriteCategoryId: 'FISH',
      colorSchemePreference: 'dark',
      version: 3,
    })
  })

  it('#14 AC1〜AC3/#36 AC7: updateAccountはPUT /api/accountへversion/colorSchemePreference込みで送信しdomainへ変換する', async () => {
    const payload: AccountEditDetail = {
      firstName: 'Jiro',
      lastName: 'Suzuki',
      email: 'jiro@example.com',
      phone: '555-0199',
      address1: '2 New St',
      address2: null,
      city: 'Newtown',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      languagePreference: 'japanese',
      favoriteCategoryId: 'DOGS',
      colorSchemePreference: 'light',
      version: 3,
    }
    mockedRequest.mockResolvedValue({ ...payload, version: 4 })

    const detail = await updateAccount(payload)

    expect(mockedRequest).toHaveBeenCalledWith('/api/account', {
      method: 'PUT',
      body: payload,
    })
    expect(detail.version).toBe(4)
    expect(detail.firstName).toBe('Jiro')
    expect(detail.colorSchemePreference).toBe('light')
  })

  it('#15 AC1〜AC2: changePasswordはPOST /api/account/passwordへcurrentPassword/newPasswordのみ送信する', async () => {
    mockedRequest.mockResolvedValue(undefined)

    await changePassword({ currentPassword: 'OldCorrect#1', newPassword: 'NewCorrect#2' })

    expect(mockedRequest).toHaveBeenCalledWith('/api/account/password', {
      method: 'POST',
      body: { currentPassword: 'OldCorrect#1', newPassword: 'NewCorrect#2' },
    })
  })
})
