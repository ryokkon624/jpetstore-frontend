// #36/#25: usePreferencesStore の localStorage 永続化ユーティリティ（cartStorage.ts と同じ
// 例外非伝播パターン・プライベートブラウジング等の書き込み拒否環境でも致命的にならない）。
import type { ColorScheme, Language } from '@/domain/preferences'

export const COLOR_SCHEME_STORAGE_KEY = 'jps.colorScheme'
export const LANGUAGE_STORAGE_KEY = 'jps.language'

const VALID_COLOR_SCHEMES: readonly string[] = ['system', 'light', 'dark']
const VALID_LANGUAGES: readonly string[] = ['en', 'ja']

/** AC3/AC-neg1: 未保存・不正/未知の値はSystemへフォールバックする（例外を投げず描画を壊さない）。 */
export function loadColorScheme(): ColorScheme {
  try {
    const raw = window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)
    if (raw !== null && VALID_COLOR_SCHEMES.includes(raw)) {
      return raw as ColorScheme
    }
  } catch {
    // noop: 読み込めない環境ではSystemへフォールバック
  }
  return 'system'
}

/** AC4: 選択をlocalStorageへ即時保存する（保存できなくても致命的ではない）。 */
export function saveColorScheme(value: ColorScheme): void {
  try {
    window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, value)
  } catch {
    // noop
  }
}

/** #25 AC5: 未保存・不正/未知の値はenへフォールバックする(英語フォールバックが壊れない)。 */
export function loadLanguage(): Language {
  try {
    const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (raw !== null && VALID_LANGUAGES.includes(raw)) {
      return raw as Language
    }
  } catch {
    // noop
  }
  return 'en'
}

export function saveLanguage(value: Language): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, value)
  } catch {
    // noop
  }
}
