import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import CheckoutConfirmStep from '@/components/checkout/CheckoutConfirmStep.vue'
import i18n from '@/i18n'

// #12 AC1/AC3(ID-8): 支払は明示プレースホルダのみ・カード入力欄は持たないことを固定する回帰テスト
// （HomeView.spec.tsのマウントパターンを踏襲。pinia/i18n/memory routerを与える）。

async function mountCheckoutConfirmStep() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      {
        path: '/checkout/complete',
        name: 'checkout-complete',
        component: { template: '<div />' },
      },
    ],
  })
  router.push('/')
  await router.isReady()

  return mount(CheckoutConfirmStep, {
    global: { plugins: [router, i18n] },
  })
}

describe('CheckoutConfirmStep', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('#12 AC3(ID-8): 支払プレースホルダに「収集/保持しない」ことを明示する新文言を描画する', async () => {
    const wrapper = await mountCheckoutConfirmStep()
    expect(wrapper.text()).toContain('This demo does not collect or store card details.')
  })

  it('#12 AC1: 支払セクションにカード入力欄(<input>)を一切持たない(独立payment画面/DTOのカード項目も新設しない)', async () => {
    const wrapper = await mountCheckoutConfirmStep()
    const paymentSection = wrapper
      .get('.checkout-confirm-step__payment-placeholder')
      .element.closest('section')
    expect(paymentSection).not.toBeNull()
    expect(paymentSection?.querySelectorAll('input').length).toBe(0)
  })
})
