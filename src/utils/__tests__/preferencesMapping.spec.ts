import { describe, it, expect } from 'vitest'
import { toCanonicalLanguage, toDbLanguagePreference } from '@/utils/preferencesMapping'

describe('preferencesMapping', () => {
  it('toCanonicalLanguage: "japanese"は"ja"へ変換する', () => {
    expect(toCanonicalLanguage('japanese')).toBe('ja')
  })

  it('toCanonicalLanguage: "english"は"en"へ変換する', () => {
    expect(toCanonicalLanguage('english')).toBe('en')
  })

  it('toCanonicalLanguage: 不正・未知の値はenへフォールバックする(#25 AC5)', () => {
    expect(toCanonicalLanguage('french')).toBe('en')
    expect(toCanonicalLanguage(null)).toBe('en')
    expect(toCanonicalLanguage(undefined)).toBe('en')
    expect(toCanonicalLanguage('')).toBe('en')
  })

  it('toDbLanguagePreference: "ja"は"japanese"へ変換する', () => {
    expect(toDbLanguagePreference('ja')).toBe('japanese')
  })

  it('toDbLanguagePreference: "en"は"english"へ変換する', () => {
    expect(toDbLanguagePreference('en')).toBe('english')
  })
})
