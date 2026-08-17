import { defineStore } from 'pinia'
import * as accountApi from '@/api/accountApi'
import { HttpError } from '@/api/httpClient'
import type { AccountEditDetail } from '@/domain/account'

function initialState() {
  return {
    detail: null as AccountEditDetail | null,
    isLoading: false,
    isSaving: false,
    /** #14 新UX: 409競合を検知したフラグ。既存order.tsの409→終端文言とは異なり「再読込を促す」フローに使う。 */
    hasConflict: false,
    hasLoadError: false,
    hasSaveError: false,
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
  },
})
