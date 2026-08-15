import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import i18n from '@/i18n'

async function mountHomeView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: HomeView },
      { path: '/signon', name: 'signon', component: { template: '<div />' } },
    ],
  })
  router.push('/')
  await router.isReady()

  return mount(HomeView, {
    global: { plugins: [router, i18n] },
  })
}

describe('HomeView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('ヒーローの見出し(英語)とロゴを描画する(AC4・i18n英語化)', async () => {
    const wrapper = await mountHomeView()
    expect(wrapper.text()).toContain('Bringing you closer to the pets you love.')
    expect(wrapper.find('img.app-header__logo').attributes('alt')).toBe('JPetStore')
  })
})
