import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCatalogStore } from '@/stores/catalog'
import * as catalogApi from '@/api/catalogApi'
import { HttpError } from '@/api/httpClient'

vi.mock('@/api/catalogApi')

const mockedCatalogApi = vi.mocked(catalogApi)

const CATEGORY = { categoryId: 'DOGS', name: 'Dogs', description: 'Friendly, loyal dogs.' }
const PRODUCT = {
  productId: 'K9-RT-02',
  categoryId: 'DOGS',
  name: 'Labrador Retriever',
  description: 'Great hunting dog',
}
const PRODUCTS_PAGE = { content: [PRODUCT], page: 1, size: 12, totalElements: 1, totalPages: 1 }
const ITEM_SUMMARY = {
  itemId: 'EST-22',
  productId: 'K9-RT-02',
  attribute1: 'Adult Male',
  listPrice: 135.5,
  stockStatus: 'IN_STOCK' as const,
}
const ITEMS_PAGE = { content: [ITEM_SUMMARY], page: 1, size: 12, totalElements: 1, totalPages: 1 }
const ITEM_DETAIL = {
  itemId: 'EST-22',
  productId: 'K9-RT-02',
  productName: 'Labrador Retriever',
  productDescription: 'Great hunting dog',
  attribute1: 'Adult Male',
  listPrice: 135.5,
  stockStatus: 'IN_STOCK' as const,
}

describe('useCatalogStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('初期状態は空(categories=[], 各currentはnull, hasError=false)', () => {
    const store = useCatalogStore()
    expect(store.categories).toEqual([])
    expect(store.currentCategory).toBeNull()
    expect(store.currentProduct).toBeNull()
    expect(store.currentItem).toBeNull()
    expect(store.hasError).toBe(false)
  })

  it('fetchCategoriesが成功するとcategoriesにセットされる([L2]で5件想定)', async () => {
    mockedCatalogApi.fetchCategories.mockResolvedValue([CATEGORY])
    const store = useCatalogStore()

    await store.fetchCategories()

    expect(store.categories).toEqual([CATEGORY])
    expect(store.isLoadingCategories).toBe(false)
    expect(store.hasError).toBe(false)
  })

  it('fetchCategoriesが失敗するとhasError=trueになる', async () => {
    mockedCatalogApi.fetchCategories.mockRejectedValue(new HttpError(500, 'Internal Server Error'))
    const store = useCatalogStore()

    await store.fetchCategories()

    expect(store.categories).toEqual([])
    expect(store.hasError).toBe(true)
  })

  it('fetchCategoryProductsが成功するとcurrentCategory/productsがセットされる(AC2・並行取得)', async () => {
    mockedCatalogApi.fetchCategory.mockResolvedValue(CATEGORY)
    mockedCatalogApi.fetchProductsByCategory.mockResolvedValue(PRODUCTS_PAGE)
    const store = useCatalogStore()

    await store.fetchCategoryProducts('DOGS', 1, 2)

    expect(store.currentCategory).toEqual(CATEGORY)
    expect(store.products).toEqual(PRODUCTS_PAGE)
    expect(mockedCatalogApi.fetchProductsByCategory).toHaveBeenCalledWith('DOGS', 1, 2)
    expect(store.hasError).toBe(false)
  })

  it('fetchCategoryProductsが失敗する(存在しないcategory=404)とhasError=trueになる', async () => {
    mockedCatalogApi.fetchCategory.mockRejectedValue(new HttpError(404, 'Not Found'))
    mockedCatalogApi.fetchProductsByCategory.mockRejectedValue(new HttpError(404, 'Not Found'))
    const store = useCatalogStore()

    await store.fetchCategoryProducts('NOPE')

    expect(store.hasError).toBe(true)
    expect(store.currentCategory).toBeNull()
  })

  it('fetchProductItemsが成功するとcurrentProduct/itemsがセットされる(AC2・並行取得)', async () => {
    mockedCatalogApi.fetchProduct.mockResolvedValue(PRODUCT)
    mockedCatalogApi.fetchItemsByProduct.mockResolvedValue(ITEMS_PAGE)
    const store = useCatalogStore()

    await store.fetchProductItems('K9-RT-02')

    expect(store.currentProduct).toEqual(PRODUCT)
    expect(store.items).toEqual(ITEMS_PAGE)
    expect(store.hasError).toBe(false)
  })

  it('fetchItemDetailが成功するとcurrentItemがセットされる(AC3・qtyを含まないDTO形)', async () => {
    mockedCatalogApi.fetchItem.mockResolvedValue(ITEM_DETAIL)
    const store = useCatalogStore()

    await store.fetchItemDetail('EST-22')

    expect(store.currentItem).toEqual(ITEM_DETAIL)
    expect(store.hasError).toBe(false)
  })

  it('fetchItemDetailが失敗する(404)とhasError=true・currentItemはnullのまま', async () => {
    mockedCatalogApi.fetchItem.mockRejectedValue(new HttpError(404, 'Not Found'))
    const store = useCatalogStore()

    await store.fetchItemDetail('NOPE')

    expect(store.hasError).toBe(true)
    expect(store.currentItem).toBeNull()
  })

  it('#3 AC-neg2: fetchCategoryProductsが型不一致(400・stale頁送り相当)で失敗してもhasError=trueになり例外は伝播しない', async () => {
    mockedCatalogApi.fetchCategory.mockResolvedValue(CATEGORY)
    mockedCatalogApi.fetchProductsByCategory.mockRejectedValue(new HttpError(400, 'Bad Request'))
    const store = useCatalogStore()

    await expect(store.fetchCategoryProducts('DOGS', 9999)).resolves.toBeUndefined()

    expect(store.hasError).toBe(true)
    expect(store.isLoadingProducts).toBe(false)
  })

  it('#3 AC-neg2: fetchProductItemsが型不一致(400・stale頁送り相当)で失敗してもhasError=trueになり例外は伝播しない', async () => {
    mockedCatalogApi.fetchProduct.mockResolvedValue(PRODUCT)
    mockedCatalogApi.fetchItemsByProduct.mockRejectedValue(new HttpError(400, 'Bad Request'))
    const store = useCatalogStore()

    await expect(store.fetchProductItems('K9-RT-02', 9999)).resolves.toBeUndefined()

    expect(store.hasError).toBe(true)
    expect(store.isLoadingItems).toBe(false)
  })

  it('新しいfetch開始時に直前のhasErrorはリセットされる', async () => {
    mockedCatalogApi.fetchItem.mockRejectedValueOnce(new HttpError(404, 'Not Found'))
    const store = useCatalogStore()
    await store.fetchItemDetail('NOPE')
    expect(store.hasError).toBe(true)

    mockedCatalogApi.fetchItem.mockResolvedValueOnce(ITEM_DETAIL)
    await store.fetchItemDetail('EST-22')

    expect(store.hasError).toBe(false)
    expect(store.currentItem).toEqual(ITEM_DETAIL)
  })
})
