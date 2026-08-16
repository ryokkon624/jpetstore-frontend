import { defineStore } from 'pinia'
import * as catalogApi from '@/api/catalogApi'
import type { Category, ItemDetail, ItemSummary, PageResult, Product } from '@/domain/catalog'

function emptyPage<T>(): PageResult<T> {
  return { content: [], page: 1, size: 12, totalElements: 0, totalPages: 0 }
}

/**
 * #1: カタログ階層閲覧の状態を保持するPinia store。
 *
 * <p>読み取り専用(GETのみ)。カテゴリ一覧は非ページング([L2]で5件固定)、商品/在庫アイテム一覧は
 * サーバサイドページング(AC2)。カテゴリ詳細+商品一覧、商品詳細+item一覧はそれぞれ独立した
 * リクエストのため{@code Promise.all}で並行取得する(#24で確立した並行初期化パターンを踏襲)。
 */
export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    categories: [] as Category[],
    isLoadingCategories: false,

    currentCategory: null as Category | null,
    products: emptyPage<Product>(),
    isLoadingProducts: false,

    currentProduct: null as Product | null,
    items: emptyPage<ItemSummary>(),
    isLoadingItems: false,

    /** AC3: qtyを含まないDTO形をそのまま保持する(在庫数非露出)。 */
    currentItem: null as ItemDetail | null,
    isLoadingItem: false,

    /** #2: 商品検索(AC1・カテゴリフィルタ任意)。 */
    searchResults: emptyPage<Product>(),
    isLoadingSearch: false,
    /** #2 AC2: 空/空白keywordでsearchProductsを呼ぶとAPIを呼ばずtrueになる(500やtraceを出さない)。 */
    searchKeywordMissing: false,

    hasError: false,
  }),

  actions: {
    /** カテゴリ一覧([L2]で5件固定・非ページング)。 */
    async fetchCategories(): Promise<void> {
      this.isLoadingCategories = true
      this.hasError = false
      try {
        this.categories = await catalogApi.fetchCategories()
      } catch {
        this.hasError = true
      } finally {
        this.isLoadingCategories = false
      }
    },

    /** カテゴリ詳細+カテゴリ内商品一覧(AC2・ページング)を並行取得する。 */
    async fetchCategoryProducts(categoryId: string, page?: number, size?: number): Promise<void> {
      this.isLoadingProducts = true
      this.hasError = false
      try {
        const [category, products] = await Promise.all([
          catalogApi.fetchCategory(categoryId),
          catalogApi.fetchProductsByCategory(categoryId, page, size),
        ])
        this.currentCategory = category
        this.products = products
      } catch {
        this.hasError = true
      } finally {
        this.isLoadingProducts = false
      }
    },

    /** 商品詳細+商品内在庫アイテム一覧(AC2・ページング)を並行取得する。 */
    async fetchProductItems(productId: string, page?: number, size?: number): Promise<void> {
      this.isLoadingItems = true
      this.hasError = false
      try {
        const [product, items] = await Promise.all([
          catalogApi.fetchProduct(productId),
          catalogApi.fetchItemsByProduct(productId, page, size),
        ])
        this.currentProduct = product
        this.items = items
      } catch {
        this.hasError = true
      } finally {
        this.isLoadingItems = false
      }
    },

    /** アイテム詳細(AC3・在庫status。qtyは含まれない)。 */
    async fetchItemDetail(itemId: string): Promise<void> {
      this.isLoadingItem = true
      this.hasError = false
      try {
        this.currentItem = await catalogApi.fetchItem(itemId)
      } catch {
        this.currentItem = null
        this.hasError = true
      } finally {
        this.isLoadingItem = false
      }
    },

    /**
     * 商品検索(#2 AC1/AC3・ID-29)。空/空白keywordはAPIを呼ばず{@link searchKeywordMissing}を
     * trueにするだけで済ませる(AC2・500やtraceを出さない)。categoryIdは任意(指定時はその配下に限定)。
     */
    async searchProducts(
      keyword: string,
      categoryId?: string,
      page?: number,
      size?: number,
    ): Promise<void> {
      this.hasError = false
      const trimmedKeyword = keyword.trim()
      if (trimmedKeyword === '') {
        this.searchKeywordMissing = true
        this.searchResults = emptyPage<Product>()
        return
      }
      this.searchKeywordMissing = false
      this.isLoadingSearch = true
      try {
        this.searchResults = await catalogApi.searchProducts(trimmedKeyword, categoryId, page, size)
      } catch {
        this.hasError = true
      } finally {
        this.isLoadingSearch = false
      }
    },
  },
})
