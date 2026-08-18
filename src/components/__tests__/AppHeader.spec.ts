import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'
import i18n from '@/i18n'

async function mountAppHeader() {
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
