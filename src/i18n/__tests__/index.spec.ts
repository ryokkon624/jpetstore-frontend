import { describe, it, expect } from 'vitest'
import i18n from '@/i18n'

describe('i18n', () => {
  it('既定ロケールがenであり、domain.context.key構造のキーを解決できる', () => {
    expect(i18n.global.locale.value).toBe('en')
    expect(i18n.global.t('app.header.account.signIn')).toBe('Sign In')
    expect(i18n.global.t('auth.signon.error')).toBe('Invalid username or password.')
  })

  it('補間パラメータ({username})を解決できる', () => {
    expect(i18n.global.t('app.header.account.greeting', { username: 'j2ee' })).toBe('Hi, j2ee')
  })

  it('未定義キーは解決結果としてキー文字列自体を返す(サイレント失敗しない)', () => {
    expect(i18n.global.t('nonexistent.key')).toBe('nonexistent.key')
  })
})
