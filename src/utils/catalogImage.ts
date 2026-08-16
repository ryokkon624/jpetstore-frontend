// #1 AC5・SM確定(画像取り込み): spec/design/images から取り込んだ src/assets/catalog を
// import.meta.glob(eager) でバンドルし、category/product 画像を解決する。
// itemは対応productIdの画像を流用するため、kind='product' をitem表示にも使う。
// 欠落時はplaceholder.svgへフォールバックする(nano banana未生成の欠けを壊れた画像にしない)。

export type CatalogImageKind = 'category' | 'product'

// import.meta.glob のパターンは静的文字列である必要があるため kind ごとに個別に glob する。
const categoryImages = import.meta.glob<string>('../assets/catalog/category_*.png', {
  eager: true,
  import: 'default',
})
const productImages = import.meta.glob<string>('../assets/catalog/product_*.png', {
  eager: true,
  import: 'default',
})
import placeholderUrl from '../assets/catalog/placeholder.svg'

const IMAGE_MAP: Record<CatalogImageKind, Record<string, string>> = {
  category: categoryImages,
  product: productImages,
}

/** {@code kind}(category|product)とID(自然キー)から画像URLを解決する。無ければplaceholderを返す。 */
export function resolveCatalogImage(kind: CatalogImageKind, id: string): string {
  const map = IMAGE_MAP[kind]
  const suffix = `${kind}_${id}.png`
  const key = Object.keys(map).find((path) => path.endsWith(suffix))
  return key ? map[key]! : placeholderUrl
}
