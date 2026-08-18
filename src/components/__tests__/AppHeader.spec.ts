import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { usePreferencesStore } from '@/stores/preferences'
import i18n from '@/i18n'

async function mountAppHeader(options: { attachToBody?: boolean } = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/catalog', name: 'catalog', component: { template: '<div />' } },
      { path: '/cart', name: 'cart', component: { template: '<div />' } },
      { path: '/signon', name: 'signon', component: { template: '<div />' } },
      { path: '/account/orders', name: 'order-history', component: { template: '<div />' } },
      { path: '/account', name: 'account-edit', component: { template: '<div />' } },
      { path: '/catalog/search', name: 'catalog-search', component: { template: '<div />' } },
    ],
  })
  router.push('/')
  await router.isReady()

  return mount(AppHeader, {
    global: { plugins: [router, i18n] },
    attachTo: options.attachToBody ? document.body : undefined,
  })
}

describe('AppHeader ナビ導線(#34)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('認証済み時、注文履歴(/account/orders)とアカウント設定(/account)へのリンクを表示する(AC1)', async () => {
    const authStore = useAuthStore()
    authStore.$patch({ user: { username: 'demo_user', roles: ['USER'] } })

    const wrapper = await mountAppHeader()

    expect(wrapper.find('.app-header__account a[href="/account/orders"]').exists()).toBe(true)
    expect(wrapper.find('.app-header__account a[href="/account"]').exists()).toBe(true)
  })

  it('未認証時は注文履歴/アカウント設定リンクを表示せず、Sign Inのみ表示する(AC2)', async () => {
    const wrapper = await mountAppHeader()

    expect(wrapper.find('.app-header__account a[href="/account/orders"]').exists()).toBe(false)
    expect(wrapper.find('.app-header__account a[href="/account"]').exists()).toBe(false)
    expect(wrapper.find('.app-header__account a[href="/signon"]').exists()).toBe(true)
  })
})

describe('AppHeader テーマ設定ドロップダウン(#36 AC1)', () => {
  let wrapper: VueWrapper | undefined

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    document.documentElement.classList.remove('dark', 'light')
  })

  it('未ログインでもテーマドロップダウンのトリガーを表示する(AC1・未ログインでも表示・操作可)', async () => {
    wrapper = await mountAppHeader()

    const trigger = wrapper.find('.jps-settings-dropdown__trigger')
    expect(trigger.exists()).toBe(true)
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('既定値はSystemとして表示される(AC3)', async () => {
    wrapper = await mountAppHeader()

    expect(wrapper.find('.jps-settings-dropdown__trigger').text()).toBe('System')
  })

  it('トリガーをクリックするとLight/Dark/Systemの3択が開く(AC1)', async () => {
    wrapper = await mountAppHeader()

    await wrapper.find('.jps-settings-dropdown__trigger').trigger('click')

    const options = wrapper.findAll('.jps-settings-dropdown__option')
    expect(options).toHaveLength(3)
    expect(options.map((o) => o.text())).toEqual(['System', 'Light', 'Dark'])
    expect(wrapper.find('.jps-settings-dropdown__trigger').attributes('aria-expanded')).toBe('true')
  })

  it('Darkを選択すると即座に全画面へ反映され(<html>にdarkクラス付与)、ドロップダウンは閉じる(AC1)', async () => {
    wrapper = await mountAppHeader()
    await wrapper.find('.jps-settings-dropdown__trigger').trigger('click')

    const darkOption = wrapper
      .findAll('.jps-settings-dropdown__option')
      .find((o) => o.text() === 'Dark')
    await darkOption!.trigger('click')

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(usePreferencesStore().colorScheme).toBe('dark')
    expect(wrapper.find('.jps-settings-dropdown__menu').exists()).toBe(false)
    expect(wrapper.find('.jps-settings-dropdown__trigger').text()).toBe('Dark')
  })

  it('Systemを選択すると<html>からdark/lightクラスが除去される(AC2・OS追従)', async () => {
    wrapper = await mountAppHeader()
    usePreferencesStore().setColorScheme('dark')
    await wrapper.vm.$nextTick()
    await wrapper.find('.jps-settings-dropdown__trigger').trigger('click')

    const systemOption = wrapper
      .findAll('.jps-settings-dropdown__option')
      .find((o) => o.text() === 'System')
    await systemOption!.trigger('click')

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('外側をクリックするとドロップダウンが閉じる(click-outside)', async () => {
    wrapper = await mountAppHeader({ attachToBody: true })
    await wrapper.find('.jps-settings-dropdown__trigger').trigger('click')
    expect(wrapper.find('.jps-settings-dropdown__menu').exists()).toBe(true)

    document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.jps-settings-dropdown__menu').exists()).toBe(false)
  })

  it('Escapeキーでドロップダウンが閉じる(keyboard)', async () => {
    wrapper = await mountAppHeader({ attachToBody: true })
    await wrapper.find('.jps-settings-dropdown__trigger').trigger('click')
    expect(wrapper.find('.jps-settings-dropdown__menu').exists()).toBe(true)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.jps-settings-dropdown__menu').exists()).toBe(false)
  })
})

describe('AppHeader 言語切替ドロップダウン(#25 AC5)', () => {
  let wrapper: VueWrapper | undefined

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    i18n.global.locale.value = 'en'
  })

  function languageTrigger(w: VueWrapper) {
    return w.findAll('.jps-settings-dropdown__trigger').at(1)!
  }

  it('未ログインでも言語ドロップダウンのトリガーを表示する(未ログインでも表示・操作可)', async () => {
    wrapper = await mountAppHeader()

    const triggers = wrapper.findAll('.jps-settings-dropdown__trigger')
    expect(triggers).toHaveLength(2)
  })

  it('既定値はEnglishとして表示される', async () => {
    wrapper = await mountAppHeader()

    expect(languageTrigger(wrapper).text()).toBe('English')
  })

  it('日本語を選択するとi18nのlocaleがjaへ切り替わり、ヘッダー自体も日本語表示になる', async () => {
    wrapper = await mountAppHeader()
    await languageTrigger(wrapper).trigger('click')

    const options = wrapper.findAll('.jps-settings-dropdown__option')
    const japaneseOption = options.find((o) => o.text() === '日本語')
    await japaneseOption!.trigger('click')

    expect(i18n.global.locale.value).toBe('ja')
    expect(usePreferencesStore().language).toBe('ja')
    expect(wrapper.find('.app-header__account a[href="/signon"]').text()).toBe('サインイン')
  })
})
