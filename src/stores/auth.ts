import { defineStore } from 'pinia'
import * as authApi from '@/api/authApi'
import type { AuthenticatedUser } from '@/domain/authUser'

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
  },
})
