import { createI18n } from 'vue-i18n'
import en from './locales/en'

// AC4: i18n 基盤（英語のみ）。日本語は将来スプリント(#25)で locale 追加のみで拡張できる構造にする。
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en },
})

export default i18n
