// #1 AC2/ID-20: Pagination.vue が使う純粋関数。1-index の page/totalPages から、表示する
// ページ番号の窓(既定5件・現在ページ中心)と前後頁の有無/番号を算出する。

export interface PageWindow {
  pages: number[]
  hasPrevious: boolean
  hasNext: boolean
  previousPage: number
  nextPage: number
}

const DEFAULT_WINDOW_SIZE = 5

export function buildPageWindow(
  page: number,
  totalPages: number,
  windowSize = DEFAULT_WINDOW_SIZE,
): PageWindow {
  if (totalPages <= 0) {
    return { pages: [], hasPrevious: false, hasNext: false, previousPage: page, nextPage: page }
  }

  const half = Math.floor(windowSize / 2)
  let start = Math.max(1, page - half)
  const end = Math.min(totalPages, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)

  const pages: number[] = []
  for (let p = start; p <= end; p++) {
    pages.push(p)
  }

  return {
    pages,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
    previousPage: Math.max(1, page - 1),
    nextPage: Math.min(totalPages, page + 1),
  }
}
