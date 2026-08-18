import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAccountStore } from '@/stores/account'
import * as accountApi from '@/api/accountApi'
import { HttpError } from '@/api/httpClient'
import type { AccountEditDetail } from '@/domain/account'

vi.mock('@/api/accountApi')

const mockedAccountApi = vi.mocked(accountApi)

function editDetail(overrides: Partial<AccountEditDetail> = {}): AccountEditDetail {
  return {
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
    colorSchemePreference: 'system',
    version: 3,
    ...overrides,
  }
}

describe('useAccountStore (#14 AC1〜AC3)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('初期状態はdetail=null・各種フラグはfalseである', () => {
    const store = useAccountStore()
    expect(store.detail).toBeNull()
    expect(store.isLoading).toBe(false)
    expect(store.isSaving).toBe(false)
    expect(store.hasConflict).toBe(false)
    expect(store.hasLoadError).toBe(false)
    expect(store.hasSaveError).toBe(false)
    expect(store.shouldPromptReload).toBe(false)
  })

  it('fetchAccountが成功するとdetailにversion込みでセットされる(E3)', async () => {
    mockedAccountApi.fetchAccount.mockResolvedValue(editDetail())
    const store = useAccountStore()

    await store.fetchAccount()

    expect(store.detail).toEqual(editDetail())
    expect(store.isLoading).toBe(false)
    expect(store.hasLoadError).toBe(false)
  })

  it('fetchAccountが失敗するとdetail=null・hasLoadError=trueになる', async () => {
    mockedAccountApi.fetchAccount.mockRejectedValue(new HttpError(500, 'Internal Server Error'))
    const store = useAccountStore()

    await store.fetchAccount()

    expect(store.detail).toBeNull()
    expect(store.hasLoadError).toBe(true)
  })

  it('updateAccountが成功すると新しいversion込みのdetailに置き換わりtrueを返す', async () => {
    mockedAccountApi.updateAccount.mockResolvedValue(editDetail({ version: 4, firstName: 'Jiro' }))
    const store = useAccountStore()

    const result = await store.updateAccount(editDetail())

    expect(result).toBe(true)
    expect(store.detail?.version).toBe(4)
    expect(store.detail?.firstName).toBe('Jiro')
    expect(store.hasConflict).toBe(false)
    expect(store.hasSaveError).toBe(false)
    expect(mockedAccountApi.updateAccount).toHaveBeenCalledWith(editDetail())
  })

  it('#14 新UX: 409競合はhasConflict=trueになりshouldPromptReloadもtrueになる(再読込促し)', async () => {
    mockedAccountApi.updateAccount.mockRejectedValue(new HttpError(409, 'Conflict'))
    const store = useAccountStore()

    const result = await store.updateAccount(editDetail())

    expect(result).toBe(false)
    expect(store.hasConflict).toBe(true)
    expect(store.shouldPromptReload).toBe(true)
    expect(store.hasSaveError).toBe(false)
  })

  it('409以外のエラーはhasSaveError=trueになりhasConflictはfalseのまま(再読込促しUXとは別扱い)', async () => {
    mockedAccountApi.updateAccount.mockRejectedValue(new HttpError(500, 'Internal Server Error'))
    const store = useAccountStore()

    const result = await store.updateAccount(editDetail())

    expect(result).toBe(false)
    expect(store.hasSaveError).toBe(true)
    expect(store.hasConflict).toBe(false)
    expect(store.shouldPromptReload).toBe(false)
  })

  it('再読込(fetchAccount再実行)するとhasConflictはリセットされる', async () => {
    mockedAccountApi.updateAccount.mockRejectedValue(new HttpError(409, 'Conflict'))
    const store = useAccountStore()
    await store.updateAccount(editDetail())
    expect(store.hasConflict).toBe(true)

    mockedAccountApi.fetchAccount.mockResolvedValue(editDetail({ version: 5 }))
    await store.fetchAccount()

    expect(store.hasConflict).toBe(false)
    expect(store.detail?.version).toBe(5)
  })

  it('resetで初期状態に戻る', async () => {
    mockedAccountApi.fetchAccount.mockResolvedValue(editDetail())
    const store = useAccountStore()
    await store.fetchAccount()
    expect(store.detail).not.toBeNull()

    store.reset()

    expect(store.detail).toBeNull()
    expect(store.hasConflict).toBe(false)
    expect(store.hasSaveError).toBe(false)
    expect(store.hasLoadError).toBe(false)
  })

  describe('changePassword (#15 AC1〜AC2)', () => {
    it('初期状態はisChangingPassword=false・passwordChangeError=null・passwordChangeSuccess=falseである', () => {
      const store = useAccountStore()
      expect(store.isChangingPassword).toBe(false)
      expect(store.passwordChangeError).toBeNull()
      expect(store.passwordChangeSuccess).toBe(false)
    })

    it('成功するとpasswordChangeSuccess=trueになりtrueを返す', async () => {
      mockedAccountApi.changePassword.mockResolvedValue(undefined)
      const store = useAccountStore()

      const result = await store.changePassword({
        currentPassword: 'OldCorrect#1',
        newPassword: 'NewCorrect#2',
      })

      expect(result).toBe(true)
      expect(store.passwordChangeSuccess).toBe(true)
      expect(store.passwordChangeError).toBeNull()
      expect(store.isChangingPassword).toBe(false)
      expect(mockedAccountApi.changePassword).toHaveBeenCalledWith({
        currentPassword: 'OldCorrect#1',
        newPassword: 'NewCorrect#2',
      })
    })

    it('現在PW誤り(422)はpasswordChangeError="INVALID_CURRENT_PASSWORD"になりfalseを返す', async () => {
      mockedAccountApi.changePassword.mockRejectedValue(new HttpError(422, 'Unprocessable Entity'))
      const store = useAccountStore()

      const result = await store.changePassword({
        currentPassword: 'Wrong#1',
        newPassword: 'NewCorrect#2',
      })

      expect(result).toBe(false)
      expect(store.passwordChangeError).toBe('INVALID_CURRENT_PASSWORD')
      expect(store.passwordChangeSuccess).toBe(false)
    })

    it('弱いパスワード等(400)はpasswordChangeError="WEAK_PASSWORD"になる', async () => {
      mockedAccountApi.changePassword.mockRejectedValue(new HttpError(400, 'Bad Request'))
      const store = useAccountStore()

      const result = await store.changePassword({
        currentPassword: 'OldCorrect#1',
        newPassword: 'weak',
      })

      expect(result).toBe(false)
      expect(store.passwordChangeError).toBe('WEAK_PASSWORD')
    })

    it('その他のエラーはpasswordChangeError="default"になる', async () => {
      mockedAccountApi.changePassword.mockRejectedValue(new HttpError(500, 'Internal Server Error'))
      const store = useAccountStore()

      const result = await store.changePassword({
        currentPassword: 'OldCorrect#1',
        newPassword: 'NewCorrect#2',
      })

      expect(result).toBe(false)
      expect(store.passwordChangeError).toBe('default')
    })

    it('直前の失敗後に成功するとpasswordChangeErrorはリセットされる', async () => {
      mockedAccountApi.changePassword.mockRejectedValueOnce(
        new HttpError(422, 'Unprocessable Entity'),
      )
      const store = useAccountStore()
      await store.changePassword({ currentPassword: 'Wrong#1', newPassword: 'NewCorrect#2' })
      expect(store.passwordChangeError).toBe('INVALID_CURRENT_PASSWORD')

      mockedAccountApi.changePassword.mockResolvedValueOnce(undefined)
      await store.changePassword({ currentPassword: 'OldCorrect#1', newPassword: 'NewCorrect#2' })

      expect(store.passwordChangeError).toBeNull()
      expect(store.passwordChangeSuccess).toBe(true)
    })
  })
})
