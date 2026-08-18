import { describe, it, expect } from 'vitest'
import { isValidEmail, isStrongPassword, ACCOUNT_FIELD_MAX_LENGTH } from '@/utils/accountValidation'

// #17 AC1〜AC3: backend(#17 retrofit・StrongPasswordValidator)と同じ検証ロジックをミラーする
// frontend自前のインライン検証(UX向上・backendが権威400のbackstop)。

describe('isValidEmail', () => {
  it.each(['taro@example.com', 'a@b.co', 'first.last@sub.example.com'])(
    '正しい形式のemailはtrueを返す(%s)',
    (value) => {
      expect(isValidEmail(value)).toBe(true)
    },
  )

  it.each([
    '',
    'not-an-email',
    '@example.com',
    'taro@',
    'taro@@example.com',
    'taro example@example.com',
    'taro@example',
    'taro@.com',
  ])('不正な形式のemailはfalseを返す(%s)', (value) => {
    expect(isValidEmail(value)).toBe(false)
  })
})

describe('isStrongPassword (#15 Q1 / #17 AC2)', () => {
  it.each([
    'Correct#Passw0rd!', // 大/小/数字/記号すべて
    'abcdefgH', // ちょうど8文字・大小2種
    'password1', // 小文字+数字の2種
    'PASSWORD1', // 大文字+数字の2種
    'a'.repeat(70) + 'B1', // 72文字ちょうど
  ])('8〜72文字・4種中2種以上を満たす値はtrueを返す(%s)', (value) => {
    expect(isStrongPassword(value)).toBe(true)
  })

  it('空文字はfalseを返す', () => {
    expect(isStrongPassword('')).toBe(false)
  })

  it.each(['Ab1', 'Abcdef1'])('8文字未満はfalseを返す(%s)', (value) => {
    expect(isStrongPassword(value)).toBe(false)
  })

  it('73文字(長さ超過)はfalseを返す', () => {
    expect(isStrongPassword('a'.repeat(71) + 'B1')).toBe(false)
  })

  it('文字数は72以下でもUTF-8バイト長が72を超える場合はfalseを返す(bcrypt 72バイト上限)', () => {
    // 全角「あ」=UTF-8で3バイト。24文字×3バイト=72バイト+13バイトの英数字で85バイトだが文字数は37文字。
    const value = 'あ'.repeat(24) + 'Ab1234567890'
    expect(value.length).toBeLessThanOrEqual(72)
    expect(isStrongPassword(value)).toBe(false)
  })

  it.each(['alllowercase', 'ALLUPPERCASE', '12345678', '!!!!!!!!'])(
    '文字種が1種類のみはfalseを返す(%s)',
    (value) => {
      expect(isStrongPassword(value)).toBe(false)
    },
  )

  it.each(['abcdefgh1', 'ABCDEFGH!', '12345678!'])('文字種が2種類あればtrueを返す(%s)', (value) => {
    expect(isStrongPassword(value)).toBe(true)
  })
})

describe('ACCOUNT_FIELD_MAX_LENGTH (#17 Q2・DBカラム幅整合)', () => {
  it('backendのDDL(V00_000_004__create_account_tables.sql)実測値と一致する', () => {
    expect(ACCOUNT_FIELD_MAX_LENGTH.username).toBe(80)
    expect(ACCOUNT_FIELD_MAX_LENGTH.email).toBe(80)
    expect(ACCOUNT_FIELD_MAX_LENGTH.firstName).toBe(80)
    expect(ACCOUNT_FIELD_MAX_LENGTH.lastName).toBe(80)
    expect(ACCOUNT_FIELD_MAX_LENGTH.address1).toBe(80)
    expect(ACCOUNT_FIELD_MAX_LENGTH.city).toBe(80)
    expect(ACCOUNT_FIELD_MAX_LENGTH.state).toBe(80)
    expect(ACCOUNT_FIELD_MAX_LENGTH.phone).toBe(80)
    expect(ACCOUNT_FIELD_MAX_LENGTH.address2).toBe(40)
    expect(ACCOUNT_FIELD_MAX_LENGTH.postalCode).toBe(20)
    expect(ACCOUNT_FIELD_MAX_LENGTH.country).toBe(20)
    expect(ACCOUNT_FIELD_MAX_LENGTH.languagePreference).toBe(80)
    expect(ACCOUNT_FIELD_MAX_LENGTH.favoriteCategoryId).toBe(10)
  })
})
