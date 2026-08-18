import { defineStore } from 'pinia'
import i18n from '@/i18n'
import type { ColorScheme, Language } from '@/domain/preferences'
import {
  loadColorScheme,
  saveColorScheme,
  loadLanguage,
  saveLanguage,
} from '@/utils/preferencesStorage'
import { toCanonicalLanguage } from '@/utils/preferencesMapping'

/** #36 AC1/AC2: <html>の.dark/.lightを付替える(main.cssの@custom-variant dark定義と整合)。System=両方除去。 */
function applyColorScheme(value: ColorScheme): void {
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  if (value === 'light' || value === 'dark') {
    root.classList.add(value)
  }
}

/** #25 AC5: i18nのlocaleを切り替える(head scriptは不要。createI18n時のseedと同じlocalStorageキーを参照)。 */
function applyLanguage(value: Language): void {
  i18n.global.locale.value = value
}

/** AC-neg1/#25 AC5: DB由来のcolorScheme値は3値enum以外System(不正/未知値のフォールバック)。 */
function normalizeColorScheme(value: string): ColorScheme {
  return value === 'light' || value === 'dark' ? value : 'system'
}

/**
 * #36/#25: テーマ配色・表示言語の設定を保持する Pinia store（単一ソース）。
 *
 * <p>state はメモリ上の canonical 値（{@link ColorScheme}/{@link Language}）のみで、永続化は
 * {@code utils/preferencesStorage.ts}（localStorage 2キー）に委譲する。DB権威の値は{@link
 * #hydrateFromDb}経由でのみ取り込む（{@code stores/auth.ts}のsignon/fetchCurrentUser後・Q2）。
 */
export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    colorScheme: 'system' as ColorScheme,
    language: 'en' as Language,
  }),

  actions: {
    /** AC3/AC4: localStorageから読み込みDOM/i18nへ適用する（アプリ起動時・App.vue setup）。 */
    init(): void {
      this.colorScheme = loadColorScheme()
      this.language = loadLanguage()
      applyColorScheme(this.colorScheme)
      applyLanguage(this.language)
    },

    /** AC1/AC2/AC4: ヘッダーのドロップダウンから呼ばれる。state→localStorage→DOM適用の順で即時反映する。 */
    setColorScheme(value: ColorScheme): void {
      this.colorScheme = value
      saveColorScheme(value)
      applyColorScheme(value)
    },

    /** #25 AC5: ヘッダーのドロップダウンから呼ばれる。 */
    setLanguage(value: Language): void {
      this.language = value
      saveLanguage(value)
      applyLanguage(value)
    },

    /**
     * #36 AC6/#25 AC7: ログイン/再水和（/api/auth/login・/api/auth/me）完了後にDB権威の値を適用し、
     * localStorageへseedする（跨デバイス追従）。テーマはpass-through、言語はDB値
     * （'english'/'japanese'）をcanonical値（'en'/'ja'）へ変換する。AC-neg1: 不正/未知の値は
     * System/enへフォールバックし例外を投げない。
     */
    hydrateFromDb(preferences: {
      colorSchemePreference: string
      languagePreference: string
    }): void {
      this.setColorScheme(normalizeColorScheme(preferences.colorSchemePreference))
      this.setLanguage(toCanonicalLanguage(preferences.languagePreference))
    },
  },
})
