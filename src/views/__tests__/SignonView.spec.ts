import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import SignonView from '@/views/SignonView.vue'
import i18n from '@/i18n'
import * as authApi from '@/api/authApi'

vi.mock('@/api/authApi')
const mockedAuthApi = vi.mocked(authApi)

async function mountSignonView(initialPath = '/signon') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div>home</div>' } },
      { path: '/signon', name: 'signon', component: SignonView },
      { path: '/account/orders', name: 'orders', component: { template: '<div>orders</div>' } },
    ],
  })
  router.push(initialPath)
  await router.isReady()
  const wrapper = mount(SignonView, { global: { plugins: [router, i18n] } })
  return { wrapper, router }
}

describe('SignonView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('初期表示でusername/passwordフィールドが空である(AC9・既定資格情報プリフィル廃止)', async () => {
    const { wrapper } = await mountSignonView()

    const usernameInput = wrapper.find('input[name="username"]')
    const passwordInput = wrapper.find('input[name="password"]')

    expect((usernameInput.element as HTMLInputElement).value).toBe('')
    expect((passwordInput.element as HTMLInputElement).value).toBe('')
  })

  it('signon失敗時に一律エラーメッセージを表示する(AC6・列挙不可)', async () => {
    mockedAuthApi.login.mockRejectedValue(new Error('unauthorized'))
    const { wrapper } = await mountSignonView()

    await wrapper.find('input[name="username"]').setValue('unknown_or_wrong')
    await wrapper.find('input[name="password"]').setValue('whatever')
    await wrapper.find('form.signon__form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('Invalid username or password.')
  })

  it('signon成功時にredirectクエリの相対パスへ復帰する(AC8)', async () => {
    mockedAuthApi.login.mockResolvedValue({ username: 'j2ee', roles: ['USER'] })
    const { wrapper, router } = await mountSignonView('/signon?redirect=/account/orders')

    await wrapper.find('input[name="username"]').setValue('j2ee')
    await wrapper.find('input[name="password"]').setValue('correct-password')
    await wrapper.find('form.signon__form').trigger('submit.prevent')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/account/orders')
  })

  it('signon成功時にredirectクエリが外部URLなら/へフォールバックする(AC-neg2・オープンリダイレクト対策)', async () => {
    mockedAuthApi.login.mockResolvedValue({ username: 'j2ee', roles: ['USER'] })
    const { wrapper, router } = await mountSignonView('/signon?redirect=https://evil.com')

    await wrapper.find('input[name="username"]').setValue('j2ee')
    await wrapper.find('input[name="password"]').setValue('correct-password')
    await wrapper.find('form.signon__form').trigger('submit.prevent')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/')
  })
})
