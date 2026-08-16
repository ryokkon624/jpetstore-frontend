import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ItemDetailView from '@/views/catalog/ItemDetailView.vue'
import i18n from '@/i18n'
import * as catalogApi from '@/api/catalogApi'

vi.mock('@/api/catalogApi')
const mockedCatalogApi = vi.mocked(catalogApi)

async function mountItemDetailView(itemId = 'EST-3') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div>home</div>' } },
      { path: '/catalog', name: 'catalog', component: { template: '<div>catalog</div>' } },
      {
        path: '/catalog/products/:productId',
        name: 'catalog-product',
        component: { template: '<div>items</div>' },
      },
      { path: '/catalog/items/:itemId', name: 'catalog-item', component: ItemDetailView },
    ],
  })
  router.push(`/catalog/items/${itemId}`)
  await router.isReady()
  const wrapper = mount(ItemDetailView, { global: { plugins: [router, i18n] } })
  await flushPromises()
  return { wrapper, router }
}

describe('ItemDetailView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('AC1: 商品名・価格・在庫バッジを表示する', async () => {
    mockedCatalogApi.fetchItem.mockResolvedValue({
      itemId: 'EST-22',
      productId: 'K9-RT-02',
      productName: 'Labrador Retriever',
      productDescription: 'Great hunting dog',
      attribute1: 'Adult Male',
      listPrice: 135.5,
      stockStatus: 'IN_STOCK',
    })
    const { wrapper } = await mountItemDetailView('EST-22')

    expect(wrapper.text()).toContain('Labrador Retriever')
    expect(wrapper.text()).toContain('In Stock')
    expect(wrapper.text()).toContain('$135.50')
  })

  it('AC-neg1(SBD-18): descriptionにHTML/scriptタグを与えても生描画されず実行されない(v-html不使用)', async () => {
    const maliciousDescription =
      '<img src=x onerror="window.__xss=true"><script>window.__xss=true</script>'
    mockedCatalogApi.fetchItem.mockResolvedValue({
      itemId: 'EST-3',
      productId: 'FI-SW-02',
      productName: 'Tiger Shark',
      productDescription: maliciousDescription,
      attribute1: 'Toothless',
      listPrice: 18.5,
      stockStatus: 'OUT_STOCK',
    })

    const globalWindow = window as typeof window & { __xss?: boolean }
    delete globalWindow.__xss

    const { wrapper } = await mountItemDetailView('EST-3')

    // スクリプトは実行されていない(グローバルフラグが立たない)。
    expect(globalWindow.__xss).toBeUndefined()

    // DOM上に実際の<script>要素・onerror属性を持つ<img>は生成されない
    // (v-htmlで注入されていれば実要素として現れる)。
    expect(wrapper.find('script').exists()).toBe(false)
    expect(wrapper.findAll('img').every((img) => img.attributes('onerror') === undefined)).toBe(
      true,
    )

    // 生のタグ文字列はエスケープされテキストとして表示される({{ }}補間の挙動)。
    expect(wrapper.html()).toContain('&lt;script&gt;')
    expect(wrapper.text()).toContain('<script>window.__xss=true</script>')
  })

  it('存在しないitemId(404)ではエラー状態を表示する', async () => {
    mockedCatalogApi.fetchItem.mockRejectedValue(new Error('Not Found'))
    const { wrapper } = await mountItemDetailView('NOPE')

    expect(wrapper.text()).toContain('Something went wrong')
  })

  it('カート追加ボタンは非活性プレースホルダである(#1論点4・AC4の状態変更なしを維持)', async () => {
    mockedCatalogApi.fetchItem.mockResolvedValue({
      itemId: 'EST-22',
      productId: 'K9-RT-02',
      productName: 'Labrador Retriever',
      productDescription: 'Great hunting dog',
      attribute1: 'Adult Male',
      listPrice: 135.5,
      stockStatus: 'IN_STOCK',
    })
    const { wrapper } = await mountItemDetailView('EST-22')

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })
})
