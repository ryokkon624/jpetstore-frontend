import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePreferencesStore } from '@/stores/preferences'
import { COLOR_SCHEME_STORAGE_KEY, LANGUAGE_STORAGE_KEY } from '@/utils/preferencesStorage'
import i18n from '@/i18n'

describe('usePreferencesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    window.localStorage.clear()
    document.documentElement.classList.remove('dark', 'light')
    i18n.global.locale.value = 'en'
  })

  afterEach(() => {
    document.documentElement.classList.remove('dark', 'light')
    i18n.global.locale.value = 'en'
  })

  it('初期状態はcolorScheme=system・language=enである', () => {
    const store = usePreferencesStore()
    expect(store.colorScheme).toBe('system')
    expect(store.language).toBe('en')
  })

  describe('init (AC3/AC4)', () => {
    it('localStorageに保存済みの値を読み込みDOM/i18nへ適用する', () => {
      window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark')
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'ja')
      const store = usePreferencesStore()

      store.init()

      expect(store.colorScheme).toBe('dark')
      expect(store.language).toBe('ja')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(i18n.global.locale.value).toBe('ja')
    })

    it('AC-neg1: localStorageに不正な値がある場合、Systemへフォールバックし例外を投げない', () => {
      window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'purple')
      const store = usePreferencesStore()

      expect(() => store.init()).not.toThrow()

      expect(store.colorScheme).toBe('system')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(document.documentElement.classList.contains('light')).toBe(false)
    })
  })

  describe('setColorScheme (AC1/AC2/AC4)', () => {
    it('darkを選択すると<html>にdarkクラスが付き、localStorageへ保存される', () => {
      const store = usePreferencesStore()

      store.setColorScheme('dark')

      expect(store.colorScheme).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.classList.contains('light')).toBe(false)
      expect(window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe('dark')
    })

    it('lightを選択すると<html>にlightクラスが付く', () => {
      const store = usePreferencesStore()

      store.setColorScheme('light')

      expect(document.documentElement.classList.contains('light')).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('systemを選択すると<html>からdark/lightクラスが両方除去される(AC2・OS追従)', () => {
      const store = usePreferencesStore()
      store.setColorScheme('dark')

      store.setColorScheme('system')

      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(document.documentElement.classList.contains('light')).toBe(false)
      expect(window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe('system')
    })
  })

  describe('setLanguage (#25 AC5)', () => {
    it('jaを選択するとi18nのlocaleが切り替わり、localStorageへ保存される', () => {
      const store = usePreferencesStore()

      store.setLanguage('ja')

      expect(store.language).toBe('ja')
      expect(i18n.global.locale.value).toBe('ja')
      expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ja')
    })
  })

  describe('hydrateFromDb (#36 AC6/#25 AC7)', () => {
    it('DB値(pass-throughのcolorScheme・english/japaneseのlanguage)を適用しlocalStorageへseedする', () => {
      const store = usePreferencesStore()

      store.hydrateFromDb({ colorSchemePreference: 'dark', languagePreference: 'japanese' })

      expect(store.colorScheme).toBe('dark')
      expect(store.language).toBe('ja')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(i18n.global.locale.value).toBe('ja')
      expect(window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe('dark')
      expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ja')
    })

    it('AC-neg1: DBに不正な値が入っていてもSystem/enへフォールバックし例外を投げない', () => {
      const store = usePreferencesStore()

      expect(() =>
        store.hydrateFromDb({ colorSchemePreference: 'purple', languagePreference: 'french' }),
      ).not.toThrow()

      expect(store.colorScheme).toBe('system')
      expect(store.language).toBe('en')
    })
  })
})
