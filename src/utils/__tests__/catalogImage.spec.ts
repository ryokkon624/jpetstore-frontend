import { describe, it, expect } from 'vitest'
import { resolveCatalogImage } from '@/utils/catalogImage'
// placeholder.svg は小さいためVite側でbase64データURLにインライン化される(ファイル名を含まない)。
// フォールバック判定はこのモジュールと同一URLになることで確認する。
import placeholderUrl from '@/assets/catalog/placeholder.svg'

// #1 AC5・SM確定(画像取り込み): spec/design/images を取り込んだ src/assets/catalog を
// import.meta.glob(eager) で解決する。欠落IDはplaceholder.svgへフォールバックする。
// itemは対応productIdの画像を流用するため kind='product' を使う。
describe('resolveCatalogImage', () => {
  it('存在するcategoryIdの画像を解決できる(例: DOGS)', () => {
    const url = resolveCatalogImage('category', 'DOGS')
    expect(url).toContain('category_DOGS')
  })

  it('存在するproductIdの画像を解決できる(例: K9-RT-02)', () => {
    const url = resolveCatalogImage('product', 'K9-RT-02')
    expect(url).toContain('product_K9-RT-02')
  })

  it('存在しないcategoryIdはplaceholder.svgにフォールバックする', () => {
    const url = resolveCatalogImage('category', 'NOPE')
    expect(url).toBe(placeholderUrl)
  })

  it('存在しないproductIdはplaceholder.svgにフォールバックする(itemのproductId流用時の欠落対応)', () => {
    const url = resolveCatalogImage('product', 'NOPE')
    expect(url).toBe(placeholderUrl)
  })
})
