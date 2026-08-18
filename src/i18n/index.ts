import { createI18n } from 'vue-i18n'
import en from './locales/en'
import ja from './locales/ja'
import { loadLanguage } from '@/utils/preferencesStorage'

// #25 AC1/AC5: i18n 基盤（英語＋日本語）。
//
// AC5: 初期 locale は localStorage（jps.language・preferencesStorage.tsのloadLanguage）から seed する。
// テーマのFOUC対策（Q3・index.htmlのhead script）とは非対称: 言語は#appがmountされるまでテキストが
// 一切描画されないため、head script無しでも切替のちらつきは起きない（createI18n時のseedのみで足りる）。
//
// AC3: datetimeFormats.short（#9/#10の注文日付表示で使用）。en/ja両方に定義し、未登録localeへの
// フォールバックで整形が崩れないようにする。numberFormatsは追加しない（価格は全画面インラインIntl
// オプション（style:'currency'）で既にlocale連動しており、名前付き設定は冗長・計画フェーズ確定）。
const i18n = createI18n({
  legacy: false,
  locale: loadLanguage(),
  fallbackLocale: 'en',
  messages: { en, ja },
  datetimeFormats: {
    en: {
      short: { year: 'numeric', month: 'short', day: '2-digit' },
    },
    ja: {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
    },
  },
})

export default i18n
