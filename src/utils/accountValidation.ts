// #17 AC1〜AC3: アカウント系フォーム(register/edit/PW変更)のインライン検証。backend
// (#17 retrofit・StrongPasswordValidator)と同じルールをミラーするfrontend自前の事前チェックであり、
// backendの権威400のbackstopを前提に、正常系ではclient側で通過させるためのUX向上目的(計画フェーズ確定②)。
//
// 正規表現の文字クラス表現は使わず、1文字ずつ走査して判定する(redirectValidator.tsと同じ方針。
// 過去セッションで正規表現の文字クラスリテラルが編集ツールにより意図せず書き換わる事象が複数回
// 発生したための回避策・long_term.md記録)。

const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 72
const MIN_CHAR_CLASSES = 2

/** #17 Q2確定: backend DDL(V00_000_004__create_account_tables.sql)実測のDBカラム幅と整合させる。 */
export const ACCOUNT_FIELD_MAX_LENGTH = {
  username: 80,
  email: 80,
  firstName: 80,
  lastName: 80,
  address1: 80,
  address2: 40,
  city: 80,
  state: 80,
  postalCode: 20,
  country: 20,
  phone: 80,
  languagePreference: 80,
  favoriteCategoryId: 10,
} as const

function isWhitespace(char: string): boolean {
  return char === ' ' || char === '\t' || char === '\n' || char === '\r'
}

function containsWhitespace(value: string): boolean {
  for (const char of value) {
    if (isWhitespace(char)) {
      return true
    }
  }
  return false
}

/**
 * emailの簡易形式チェック（backendの`@Email`（Hibernate Validator）を厳密に再実装するものではなく、
 * UX向上のための事前チェック。backendが権威400のbackstopとなる）。
 */
export function isValidEmail(value: string): boolean {
  if (value.length === 0 || containsWhitespace(value)) {
    return false
  }
  const atIndex = value.indexOf('@')
  if (atIndex <= 0 || atIndex !== value.lastIndexOf('@')) {
    return false
  }
  const local = value.slice(0, atIndex)
  const domain = value.slice(atIndex + 1)
  if (local.length === 0 || domain.length === 0) {
    return false
  }
  const dotIndex = domain.indexOf('.')
  if (dotIndex <= 0 || dotIndex === domain.length - 1) {
    return false
  }
  return true
}

function countCharClasses(value: string): number {
  let hasUpper = false
  let hasLower = false
  let hasDigit = false
  let hasSymbol = false

  for (const char of value) {
    const codePoint = char.codePointAt(0) ?? 0
    if (codePoint >= 0x41 && codePoint <= 0x5a) {
      hasUpper = true
    } else if (codePoint >= 0x61 && codePoint <= 0x7a) {
      hasLower = true
    } else if (codePoint >= 0x30 && codePoint <= 0x39) {
      hasDigit = true
    } else {
      hasSymbol = true
    }
  }

  let classes = 0
  if (hasUpper) classes++
  if (hasLower) classes++
  if (hasDigit) classes++
  if (hasSymbol) classes++
  return classes
}

/**
 * PW強度共有ルールのfrontendミラー（#15 Q1 / #17 AC2確定・backend `StrongPasswordValidator`と同一ロジック）。
 * 8〜72文字・UTF-8で72バイト以下（bcryptの72バイト上限・暗黙切り詰め防止）・英大文字/英小文字/数字/記号の
 * 4種中2種以上。
 */
export function isStrongPassword(value: string): boolean {
  if (value.length === 0) {
    return false
  }
  if (value.length < MIN_PASSWORD_LENGTH || value.length > MAX_PASSWORD_LENGTH) {
    return false
  }
  const byteLength = new TextEncoder().encode(value).length
  if (byteLength > MAX_PASSWORD_LENGTH) {
    return false
  }
  return countCharClasses(value) >= MIN_CHAR_CLASSES
}

/** 指定した最大長(文字数)以内かどうか(空文字は`@NotBlank`側で別途検証するため、ここではtrue扱い)。 */
export function isWithinMaxLength(value: string, max: number): boolean {
  return value.length <= max
}
