import { describe, it, expect } from 'vitest'
import { sanitizeRedirectTarget } from '@/utils/redirectValidator'

describe('sanitizeRedirectTarget', () => {
  it.each([['/'], ['/catalog'], ['/cart/items?id=5'], ['/account/profile#section']])(
    '相対パス%sはそのまま許可する',
    (input) => {
      expect(sanitizeRedirectTarget(input)).toBe(input)
    },
  )

  it.each([
    ['//evil.com', 'プロトコル相対URL(//evil.com)'],
    ['https://evil.com', '絶対URL(https://evil.com)'],
    ['http://evil.com', '絶対URL(http://evil.com)'],
    ['/\\evil', 'バックスラッシュ混在(/\\evil)'],
    ['\\\\evil', 'バックスラッシュのみ(\\\\evil)'],
    [' /evil', '先頭空白( /evil)'],
    ['javascript:alert(1)', 'javascriptスキーム'],
    ['evil.com', 'スキーム/スラッシュ無しの裸文字列'],
    ['/\t/evil.com', 'タブ混入(2文字目・レビュー指摘: WHATWG URLパーサはタブを位置問わず除去)'],
    ['/\n//evil', '改行(LF)混入'],
    ['/\r/evil', '改行(CR)混入'],
    // %2F%09%2Fevil.com をデコードすると '/\t/evil.com' になる(vue-routerはクエリ値を
    // 自動デコードするため、sanitizeRedirectTarget はデコード後のこの文字列を受け取る)。
    [decodeURIComponent('%2F%09%2Fevil.com'), 'URLエンコードされたタブのデコード相当'],
  ])('外部/プロトコル相対な復帰先(%s: %s)は拒否して既定値(/)にフォールバックする', (input) => {
    expect(sanitizeRedirectTarget(input)).toBe('/')
  })

  it.each([[undefined], [null], [123], ['']])(
    '不正な型/空文字(%s)は既定値(/)にフォールバックする',
    (input) => {
      expect(sanitizeRedirectTarget(input)).toBe('/')
    },
  )

  it('fallbackを明示指定した場合はそれを返す', () => {
    expect(sanitizeRedirectTarget('//evil.com', '/home')).toBe('/home')
  })
})
