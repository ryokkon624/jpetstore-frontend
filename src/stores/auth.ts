import { defineStore } from 'pinia'
import * as authApi from '@/api/authApi'
import * as accountApi from '@/api/accountApi'
import { HttpError } from '@/api/httpClient'
import type { AuthenticatedUser } from '@/domain/authUser'
import type { RegisterPayload } from '@/domain/account'

/**
 * #13 AC1/AC3/AC4: 登録失敗の分類（HTTPステータス起点。`order.ts`のPlaceOrderErrorReasonと同じ設計）。
 *
 * <p>#17retrofit: 400はパスワード不一致に限らずemail形式/最大長/PW強度等の複数原因になり得るため、
 * `PASSWORD_MISMATCH`固定から`VALIDATION_ERROR`へ一般化した（backendは権威400のbackstop・frontend自前の
 * フィールド単位検証＝{@code utils/accountValidation.ts}が正常系ではこの400経路を潰す想定）。
 */
export type RegisterErrorReason = 'USERNAME_TAKEN' | 'RATE_LIMITED' | 'VALIDATION_ERROR' | 'default'

function toRegisterErrorReason(error: unknown): RegisterErrorReason {
  if (error instanceof HttpError) {
    if (error.status === 409) return 'USERNAME_TAKEN'
    if (error.status === 429) return 'RATE_LIMITED'
    if (error.status === 400) return 'VALIDATION_ERROR'
  }
  return 'default'
}

/**
 * AC5/AC7: 認証状態を保持する Pinia store。
 *
 * <p>保持するのは {@link AuthenticatedUser}（username/roles）のみで、アクセストークン等は一切
 * 保持しない（httpOnly Cookie が保持し、フロントは JS から触れない＝AC5）。Pinia の state は
 * メモリ上のみに存在し、localStorage/sessionStorage への永続化は行わない。
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthenticatedUser | null,
    /** AC6: サインオン失敗理由を問わず一律のエラー表示に使うフラグ（未知ユーザー/誤PWを区別しない）。 */
    hasSignonError: false,
    isSigningOn: false,
    /** #13: 登録の進行中フラグ・失敗理由（signonと異なり、登録は失敗理由ごとに表示を分ける）。 */
    isRegistering: false,
    registerError: null as RegisterErrorReason | null,
  }),

  getters: {
    isAuthenticated: (state): boolean => state.user !== null,
  },

  actions: {
    /** AC6/AC7: 成否のみ返す。失敗理由（未知ユーザー/誤PW/その他）は呼び出し側に一切渡さない。 */
    async signon(username: string, password: string): Promise<boolean> {
      this.isSigningOn = true
      this.hasSignonError = false
      try {
        this.user = await authApi.login(username, password)
        return true
      } catch {
        this.user = null
        this.hasSignonError = true
        return false
      } finally {
        this.isSigningOn = false
      }
    },

    /** API呼び出しが失敗してもローカルの認証状態は必ずクリアする（フェイルセーフ）。 */
    async signoff(): Promise<void> {
      try {
        await authApi.logout()
      } finally {
        this.user = null
      }
    },

    /** #24 論点①: 起動時に呼び、リロードで揮発した identity を httpOnly Cookie 側の状態から再水和する。 */
    async fetchCurrentUser(): Promise<void> {
      try {
        this.user = await authApi.fetchCurrentUser()
      } catch {
        this.user = null
      }
    },

    /**
     * #13 AC1/AC2: アカウントを登録し、成功すれば自動ログイン済みの{@link AuthenticatedUser}を
     * userへセットする（backendが照合をスキップしたfresh JWTを既に発行済み）。失敗理由は
     * {@link registerError}へ分類する（username重複/レート制限/パスワード不一致/その他）。
     */
    async register(payload: RegisterPayload): Promise<boolean> {
      this.isRegistering = true
      this.registerError = null
      try {
        this.user = await accountApi.registerAccount(payload)
        return true
      } catch (error) {
        this.user = null
        this.registerError = toRegisterErrorReason(error)
        return false
      } finally {
        this.isRegistering = false
      }
    },
  },
})
