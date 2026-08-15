import { describe, it, expect } from 'vitest'
import { buildPageWindow } from '@/utils/pagination'

// #1 AC2/ID-20: ページネーション部品(Pagination.vue)が使う純粋関数。1-indexのpage/totalPagesから
// 表示するページ番号の窓・前後頁の有無/番号を算出する。
describe('buildPageWindow', () => {
  it('totalPages=0(空一覧)ではpagesは空でhasPrevious/hasNextはfalse', () => {
    const w = buildPageWindow(1, 0)
    expect(w.pages).toEqual([])
    expect(w.hasPrevious).toBe(false)
    expect(w.hasNext).toBe(false)
  })

  it('totalPages=3(size=2でDOGS6商品)でpage=1なら[1,2,3]・hasPrevious=false・hasNext=true', () => {
    const w = buildPageWindow(1, 3)
    expect(w.pages).toEqual([1, 2, 3])
    expect(w.hasPrevious).toBe(false)
    expect(w.hasNext).toBe(true)
    expect(w.nextPage).toBe(2)
  })

  it('中間ページ(page=2, totalPages=3)ではhasPrevious=true・hasNext=true', () => {
    const w = buildPageWindow(2, 3)
    expect(w.hasPrevious).toBe(true)
    expect(w.hasNext).toBe(true)
    expect(w.previousPage).toBe(1)
    expect(w.nextPage).toBe(3)
  })

  it('最終ページ(page=3, totalPages=3)ではhasNext=false', () => {
    const w = buildPageWindow(3, 3)
    expect(w.hasNext).toBe(false)
    expect(w.hasPrevious).toBe(true)
  })

  it('totalPagesがwindowSizeより多い場合、現在ページを中心にwindowSize件だけ表示する(既定5件)', () => {
    const w = buildPageWindow(10, 20)
    expect(w.pages.length).toBe(5)
    expect(w.pages).toContain(10)
    expect(Math.min(...w.pages)).toBeGreaterThanOrEqual(1)
    expect(Math.max(...w.pages)).toBeLessThanOrEqual(20)
  })

  it('先頭付近(page=1, totalPages=20)ではwindowが1から始まる', () => {
    const w = buildPageWindow(1, 20)
    expect(w.pages[0]).toBe(1)
    expect(w.pages.length).toBe(5)
  })

  it('末尾付近(page=20, totalPages=20)ではwindowが20で終わる', () => {
    const w = buildPageWindow(20, 20)
    expect(w.pages[w.pages.length - 1]).toBe(20)
    expect(w.pages.length).toBe(5)
  })
})
