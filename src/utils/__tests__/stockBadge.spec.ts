import { describe, it, expect } from 'vitest'
import { resolveStockBadge } from '@/utils/stockBadge'
import { STOCK_STATUS } from '@/constants/code.constants'

// #1 AC3: 在庫status(m_code由来のcode文字列)からバッジ表示(i18nキー+CSSクラス)への写像。
describe('resolveStockBadge', () => {
  it('IN_STOCKはbadge-jps-stock-inとcatalog.stockStatus.inStockに写像される', () => {
    const badge = resolveStockBadge(STOCK_STATUS.IN_STOCK)
    expect(badge.cssClass).toBe('badge-jps-stock-in')
    expect(badge.i18nKey).toBe('catalog.stockStatus.inStock')
  })

  it('LOW_STOCKはbadge-jps-stock-lowとcatalog.stockStatus.lowStockに写像される', () => {
    const badge = resolveStockBadge(STOCK_STATUS.LOW_STOCK)
    expect(badge.cssClass).toBe('badge-jps-stock-low')
    expect(badge.i18nKey).toBe('catalog.stockStatus.lowStock')
  })

  it('OUT_STOCK(OUT_OF_STOCKのcode値)はbadge-jps-stock-outとcatalog.stockStatus.outStockに写像される', () => {
    const badge = resolveStockBadge(STOCK_STATUS.OUT_OF_STOCK)
    expect(badge.cssClass).toBe('badge-jps-stock-out')
    expect(badge.i18nKey).toBe('catalog.stockStatus.outStock')
  })

  it('未知の値はフォールバック(汎用jps-badge・catalog.stockStatus.unknown)を返す', () => {
    const badge = resolveStockBadge('SOMETHING_UNKNOWN')
    expect(badge.cssClass).toBe('jps-badge')
    expect(badge.i18nKey).toBe('catalog.stockStatus.unknown')
  })
})
