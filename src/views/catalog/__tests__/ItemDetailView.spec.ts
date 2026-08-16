import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ItemDetailView from '@/views/catalog/ItemDetailView.vue'
import i18n from '@/i18n'
import * as catalogApi from '@/api/catalogApi'
import * as cartApi from '@/api/cartApi'

vi.mock('@/api/catalogApi')
vi.mock('@/api/cartApi')
const mockedCatalogApi = vi.mocked(catalogApi)
const mockedCartApi = vi.mocked(cartApi)

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

  it('#4 AC5: 在庫あり(IN_STOCK)の場合、カート追加ボタンは活性である', async () => {
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
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('#4 AC5: 在庫切れ(OUT_STOCK)の場合、カート追加ボタンは非活性である', async () => {
    mockedCatalogApi.fetchItem.mockResolvedValue({
      itemId: 'EST-3',
      productId: 'FI-SW-02',
      productName: 'Tiger Shark',
      productDescription: 'Salt Water fish',
      attribute1: 'Toothless',
      listPrice: 18.5,
      stockStatus: 'OUT_STOCK',
    })
    const { wrapper } = await mountItemDetailView('EST-3')

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('#4 AC1: カート追加ボタンをクリックすると未ログイン(localStorage)カートに追加される', async () => {
    mockedCatalogApi.fetchItem.mockResolvedValue({
      itemId: 'EST-22',
      productId: 'K9-RT-02',
      productName: 'Labrador Retriever',
      productDescription: 'Great hunting dog',
      attribute1: 'Adult Male',
      listPrice: 135.5,
      stockStatus: 'IN_STOCK',
    })
    mockedCartApi.checkOrderable.mockResolvedValue({ orderable: true, reason: null })
    const { wrapper } = await mountItemDetailView('EST-22')

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(mockedCartApi.checkOrderable).toHaveBeenCalledWith('EST-22', 1)
    expect(wrapper.text()).toContain('Added to your cart.')
  })

  it('#4 AC5/AC-neg1: orderable EPがfalseを返す場合、追加は拒否されエラーメッセージを表示する', async () => {
    mockedCatalogApi.fetchItem.mockResolvedValue({
      itemId: 'EST-2',
      productId: 'FI-SW-01',
      productName: 'Angelfish',
      productDescription: 'Salt Water fish',
      attribute1: 'Small',
      listPrice: 16.5,
      stockStatus: 'LOW_STOCK',
    })
    mockedCartApi.checkOrderable.mockResolvedValue({ orderable: false, reason: 'EXCEEDS_STOCK' })
    const { wrapper } = await mountItemDetailView('EST-2')

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('exceeds the available stock')
  })
})
