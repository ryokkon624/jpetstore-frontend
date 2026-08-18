import { defineStore } from 'pinia'
import * as accountApi from '@/api/accountApi'
import { HttpError } from '@/api/httpClient'
import type { AccountEditDetail } from '@/domain/account'

/** #15 AC1〜AC2: PW変更失敗の分類（HTTPステータス起点。`auth.ts`のRegisterErrorReasonと同じ設計）。 */
export type PasswordChangeErrorReason = 'INVALID_CURRENT_PASSWORD' | 'WEAK_PASSWORD' | 'default'

function toPasswordChangeErrorReason(error: unknown): PasswordChangeErrorReason {
  if (error instanceof HttpError) {
    // 422: 現在PW誤り(計画フェーズ確定・三系統分離)。400: 弱いPW/不正入力(Bean Validation)。
    if (error.status === 422) return 'INVALID_CURRENT_PASSWORD'
    if (error.status === 400) return 'WEAK_PASSWORD'
  }
  return 'default'
}

function initialState() {
  return {
    detail: null as AccountEditDetail | null,
    isLoading: false,
    isSaving: false,
    /** #14 新UX: 409競合を検知したフラグ。既存order.tsの409→終端文言とは異なり「再読込を促す」フローに使う。 */
    hasConflict: false,
    hasLoadError: false,
    hasSaveError: false,
    /** #15 AC1〜AC2: パスワード変更の進行中フラグ・失敗理由・成功フラグ。 */
    isChangingPassword: false,
    passwordChangeError: null as PasswordChangeErrorReason | null,
    passwordChangeSuccess: false,
  }
}

/**
 * #14 AC1〜AC3: アカウント/プロフィール編集の状態管理。
 *
 * <p>{@link #shouldPromptReload}（Sprint10教訓・判定をstore getterへ切出しVitest固定）: 409競合時に
 * 「最新を再読込してください」を促すUXの判定はViewに埋め込まず、ここで一元化する。再読込（{@link
 * #fetchAccount}の再実行）で{@link #hasConflict}はリセットされる。
 */
export const useAccountStore = defineStore('account', {
  state: initialState,

  getters: {
    /** #14 409競合UX: conflict中は編集フォームを再読込待ちにする。 */
    shouldPromptReload: (state): boolean => state.hasConflict,
  },

  actions: {
    /** 編集プリフィル用に本人の全編集可フィールドとversionを取得する（E3）。 */
    async fetchAccount(): Promise<void> {
      this.isLoading = true
      this.hasLoadError = false
      this.hasConflict = false
      try {
        this.detail = await accountApi.fetchAccount()
      } catch {
        this.detail = null
        this.hasLoadError = true
      } finally {
        this.isLoading = false
      }
    },

    /**
     * アカウント/プロフィールを更新する。成功=true。競合（409）は{@link #hasConflict}へ、それ以外の失敗は
     * {@link #hasSaveError}へ分類する（409は「再読込促し」・それ以外は一般エラー表示、と扱いを分けるため）。
     */
    async updateAccount(payload: AccountEditDetail): Promise<boolean> {
      this.isSaving = true
      this.hasConflict = false
      this.hasSaveError = false
      try {
        this.detail = await accountApi.updateAccount(payload)
        return true
      } catch (error) {
        if (error instanceof HttpError && error.status === 409) {
          this.hasConflict = true
        } else {
          this.hasSaveError = true
        }
        return false
      } finally {
        this.isSaving = false
      }
    },

    reset(): void {
      Object.assign(this, initialState())
    },

    /**
     * 現在パスワード再認証つきでパスワードを変更する（#15 AC1〜AC2）。成功=true。失敗理由（現在PW誤り/弱PW/
     * その他）は{@link #passwordChangeError}へ分類する（`register`と同じ設計）。
     */
    async changePassword(payload: {
      currentPassword: string
      newPassword: string
    }): Promise<boolean> {
      this.isChangingPassword = true
      this.passwordChangeError = null
      this.passwordChangeSuccess = false
      try {
        await accountApi.changePassword(payload)
        this.passwordChangeSuccess = true
        return true
      } catch (error) {
        this.passwordChangeError = toPasswordChangeErrorReason(error)
        return false
      } finally {
        this.isChangingPassword = false
      }
    },
  },
})
