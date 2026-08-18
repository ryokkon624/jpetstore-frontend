import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import * as authApi from '@/api/authApi'
import * as accountApi from '@/api/accountApi'
import { HttpError } from '@/api/httpClient'
import { emptyAddress } from '@/domain/checkout'
import type { RegisterPayload } from '@/domain/account'

vi.mock('@/api/authApi')
vi.mock('@/api/accountApi')

const mockedAuthApi = vi.mocked(authApi)
const mockedAccountApi = vi.mocked(accountApi)

function registerPayload(overrides: Partial<RegisterPayload> = {}): RegisterPayload {
  return {
    ...emptyAddress(),
    username: 'new_user',
    password: 'correct-horse',
    repeatedPassword: 'correct-horse',
    firstName: 'Taro',
    lastName: 'Yamada',
    email: 'new_user@example.com',
    phone: '555-0100',
    address1: '1 Test St',
    city: 'Testville',
    state: 'CA',
    postalCode: '90000',
    country: 'USA',
    ...overrides,
  }
}

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('初期状態は未認証である(user=null, isAuthenticated=false)', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.hasSignonError).toBe(false)
  })

  it('signonが成功するとuserに{username,roles}がセットされisAuthenticated=trueになる(AC7)', async () => {
    mockedAuthApi.login.mockResolvedValue({ username: 'j2ee', roles: ['USER'] })
    const store = useAuthStore()

    const result = await store.signon('j2ee', 'correct-password')

    expect(result).toBe(true)
    expect(store.user).toEqual({ username: 'j2ee', roles: ['USER'] })
    expect(store.isAuthenticated).toBe(true)
    expect(store.hasSignonError).toBe(false)
    expect(mockedAuthApi.login).toHaveBeenCalledWith('j2ee', 'correct-password')
  })

  it('signonが失敗すると一律のエラー状態(hasSignonError=true)になりuserはnullのまま(AC6・列挙不可)', async () => {
    mockedAuthApi.login.mockRejectedValue(new HttpError(401, 'Unauthorized'))
    const store = useAuthStore()

    const result = await store.signon('unknown_or_wrong', 'whatever')

    expect(result).toBe(false)
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.hasSignonError).toBe(true)
  })

  it('signon失敗後に再度成功すると、直前のhasSignonErrorはリセットされる', async () => {
    mockedAuthApi.login.mockRejectedValueOnce(new HttpError(401, 'Unauthorized'))
    const store = useAuthStore()
    await store.signon('j2ee', 'wrong-password')
    expect(store.hasSignonError).toBe(true)

    mockedAuthApi.login.mockResolvedValueOnce({ username: 'j2ee', roles: ['USER'] })
    await store.signon('j2ee', 'correct-password')

    expect(store.hasSignonError).toBe(false)
    expect(store.isAuthenticated).toBe(true)
  })

  it('signoffを呼ぶとuserがnullに戻る', async () => {
    mockedAuthApi.login.mockResolvedValue({ username: 'j2ee', roles: ['USER'] })
    mockedAuthApi.logout.mockResolvedValue(undefined)
    const store = useAuthStore()
    await store.signon('j2ee', 'correct-password')
    expect(store.isAuthenticated).toBe(true)

    await store.signoff()

    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('signoffのAPI呼び出しが失敗してもローカルのuser状態はクリアされる', async () => {
    mockedAuthApi.login.mockResolvedValue({ username: 'j2ee', roles: ['USER'] })
    mockedAuthApi.logout.mockRejectedValue(new HttpError(500, 'Internal Server Error'))
    const store = useAuthStore()
    await store.signon('j2ee', 'correct-password')

    await store.signoff().catch(() => undefined)

    expect(store.user).toBeNull()
  })

  it('fetchCurrentUserが成功するとuserが再水和される(#24論点①・リロード後のidentity復元)', async () => {
    mockedAuthApi.fetchCurrentUser.mockResolvedValue({ username: 'j2ee', roles: ['USER', 'ADMIN'] })
    const store = useAuthStore()

    await store.fetchCurrentUser()

    expect(store.user).toEqual({ username: 'j2ee', roles: ['USER', 'ADMIN'] })
    expect(store.isAuthenticated).toBe(true)
  })

  it('fetchCurrentUserが401で失敗するとuserはnullのまま(未認証)', async () => {
    mockedAuthApi.fetchCurrentUser.mockRejectedValue(new HttpError(401, 'Unauthorized'))
    const store = useAuthStore()

    await store.fetchCurrentUser()

    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('signon成功時にlocalStorage/sessionStorageへ一切書き込まない(AC5・トークン非JS保持)', async () => {
    const localSetItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    mockedAuthApi.login.mockResolvedValue({ username: 'j2ee', roles: ['USER'] })
    const store = useAuthStore()

    await store.signon('j2ee', 'correct-password')

    expect(localSetItemSpy).not.toHaveBeenCalled()
    localSetItemSpy.mockRestore()
  })

  describe('register (#13 AC1/AC2)', () => {
    it('初期状態はregisterErrorがnull・isRegistering=falseである', () => {
      const store = useAuthStore()
      expect(store.registerError).toBeNull()
      expect(store.isRegistering).toBe(false)
    })

    it('成功するとuserに{username,roles}がセットされisAuthenticated=trueになる(自動ログイン)', async () => {
      mockedAccountApi.registerAccount.mockResolvedValue({ username: 'new_user', roles: ['USER'] })
      const store = useAuthStore()
      const payload = registerPayload()

      const result = await store.register(payload)

      expect(result).toBe(true)
      expect(store.user).toEqual({ username: 'new_user', roles: ['USER'] })
      expect(store.isAuthenticated).toBe(true)
      expect(store.registerError).toBeNull()
      expect(mockedAccountApi.registerAccount).toHaveBeenCalledWith(payload)
    })

    it('username重複(409)はregisterError="USERNAME_TAKEN"になりuserはnullのまま', async () => {
      mockedAccountApi.registerAccount.mockRejectedValue(new HttpError(409, 'Conflict'))
      const store = useAuthStore()

      const result = await store.register(registerPayload())

      expect(result).toBe(false)
      expect(store.user).toBeNull()
      expect(store.registerError).toBe('USERNAME_TAKEN')
    })

    it('レート制限超過(429)はregisterError="RATE_LIMITED"になる', async () => {
      mockedAccountApi.registerAccount.mockRejectedValue(new HttpError(429, 'Too Many Requests'))
      const store = useAuthStore()

      const result = await store.register(registerPayload())

      expect(result).toBe(false)
      expect(store.registerError).toBe('RATE_LIMITED')
    })

    it('#17retrofit: バリデーション失敗(400・パスワード不一致/email形式/最大長/PW強度等)はregisterError="VALIDATION_ERROR"になる', async () => {
      mockedAccountApi.registerAccount.mockRejectedValue(new HttpError(400, 'Bad Request'))
      const store = useAuthStore()

      const result = await store.register(registerPayload())

      expect(result).toBe(false)
      expect(store.registerError).toBe('VALIDATION_ERROR')
    })

    it('その他のエラーはregisterError="default"になる', async () => {
      mockedAccountApi.registerAccount.mockRejectedValue(
        new HttpError(500, 'Internal Server Error'),
      )
      const store = useAuthStore()

      const result = await store.register(registerPayload())

      expect(result).toBe(false)
      expect(store.registerError).toBe('default')
    })

    it('直前の失敗後に成功するとregisterErrorはリセットされる', async () => {
      mockedAccountApi.registerAccount.mockRejectedValueOnce(new HttpError(409, 'Conflict'))
      const store = useAuthStore()
      await store.register(registerPayload())
      expect(store.registerError).toBe('USERNAME_TAKEN')

      mockedAccountApi.registerAccount.mockResolvedValueOnce({
        username: 'new_user',
        roles: ['USER'],
      })
      await store.register(registerPayload())

      expect(store.registerError).toBeNull()
      expect(store.isAuthenticated).toBe(true)
    })
  })
})
