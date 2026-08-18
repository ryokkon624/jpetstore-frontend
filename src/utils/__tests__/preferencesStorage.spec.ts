import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadColorScheme,
  saveColorScheme,
  loadLanguage,
  saveLanguage,
  COLOR_SCHEME_STORAGE_KEY,
  LANGUAGE_STORAGE_KEY,
} from '@/utils/preferencesStorage'

describe('preferencesStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('未保存の状態でloadColorSchemeを呼ぶとSystemを返す(AC3)', () => {
    expect(loadColorScheme()).toBe('system')
  })

  it('saveColorScheme→loadColorSchemeでラウンドトリップできる(AC4)', () => {
    saveColorScheme('dark')
    expect(loadColorScheme()).toBe('dark')

    saveColorScheme('light')
    expect(loadColorScheme()).toBe('light')
  })

  it('不正な値が保存されている場合、loadColorSchemeはSystemにフォールバックする(AC-neg1)', () => {
    window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'purple')
    expect(loadColorScheme()).toBe('system')
  })

  it('未保存の状態でloadLanguageを呼ぶとenを返す(#25 AC5)', () => {
    expect(loadLanguage()).toBe('en')
  })

  it('saveLanguage→loadLanguageでラウンドトリップできる', () => {
    saveLanguage('ja')
    expect(loadLanguage()).toBe('ja')

    saveLanguage('en')
    expect(loadLanguage()).toBe('en')
  })

  it('不正な値が保存されている場合、loadLanguageはenにフォールバックする(#25 AC5)', () => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr')
    expect(loadLanguage()).toBe('en')
  })

  it('localStorage.setItemが例外を投げる環境でもsaveColorScheme/saveLanguageは例外を伝播しない', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    expect(() => saveColorScheme('dark')).not.toThrow()
    expect(() => saveLanguage('ja')).not.toThrow()

    spy.mockRestore()
  })

  it('localStorage.getItemが例外を投げる環境でもloadColorScheme/loadLanguageは例外を伝播せず既定値を返す', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })

    expect(loadColorScheme()).toBe('system')
    expect(loadLanguage()).toBe('en')

    spy.mockRestore()
  })
})
