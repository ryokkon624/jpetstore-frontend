// #1 AC3: 在庫status(backendがStockStatusCalculatorで算出しm_code由来のcode文字列として返す値)を
// バッジ表示(i18nキー+CSSクラス)へ写像する。qty自体はbackend応答に含まれないためここでは扱わない。
import { STOCK_STATUS, type StockStatusCode } from '@/constants/code.constants'

export interface StockBadgeInfo {
  i18nKey: string
  cssClass: string
}

const FALLBACK_BADGE: StockBadgeInfo = {
  i18nKey: 'catalog.stockStatus.unknown',
  cssClass: 'jps-badge',
}

const STOCK_BADGE_MAP: Record<StockStatusCode, StockBadgeInfo> = {
  [STOCK_STATUS.IN_STOCK]: {
    i18nKey: 'catalog.stockStatus.inStock',
    cssClass: 'badge-jps-stock-in',
  },
  [STOCK_STATUS.LOW_STOCK]: {
    i18nKey: 'catalog.stockStatus.lowStock',
    cssClass: 'badge-jps-stock-low',
  },
  [STOCK_STATUS.OUT_OF_STOCK]: {
    i18nKey: 'catalog.stockStatus.outStock',
    cssClass: 'badge-jps-stock-out',
  },
}

/** 未知の値(想定外のバックエンド応答)はフォールバック表示にする(壊れた画面にしない)。 */
export function resolveStockBadge(status: string): StockBadgeInfo {
  return STOCK_BADGE_MAP[status as StockStatusCode] ?? FALLBACK_BADGE
}
