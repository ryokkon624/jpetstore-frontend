// #36/#25: DB格納値(m_profile.language_preference='english'/'japanese')とcanonical値
// (usePreferencesStore/i18nが使う'en'/'ja')の相互変換。この変換はAPI境界(accountApi/authApi)でのみ行う
// （backend/DB側はDB値そのまま・frontend内部はcanonical値のまま扱う。テーマはpass-throughのため変換不要）。
import type { Language } from '@/domain/preferences'

/** 不正/未知のDB値はenへフォールバックする(#25 AC5・英語フォールバックが壊れない)。 */
export function toCanonicalLanguage(dbValue: string | null | undefined): Language {
  return dbValue === 'japanese' ? 'ja' : 'en'
}

export function toDbLanguagePreference(language: Language): 'english' | 'japanese' {
  return language === 'ja' ? 'japanese' : 'english'
}
