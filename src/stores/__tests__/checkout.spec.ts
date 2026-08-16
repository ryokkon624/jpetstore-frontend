import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCheckoutStore } from '@/stores/checkout'
import * as accountApi from '@/api/accountApi'

vi.mock('@/api/accountApi')

const mockedAccountApi = vi.mocked(accountApi)

const ACCOUNT_CONTACT = {
  firstName: 'Taro',
  lastName: 'Yamada',
  email: 'taro@example.com',
  phone: '555-0100',
  address1: '1 Test St',
  address2: 'Suite 2',
  city: 'Testville',
  state: 'CA',
  postalCode: '90000',
  country: 'USA',
}

describe('useCheckoutStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('prefillFromAccount', () => {
    it('accountApiの結果をbillingへ反映する', async () => {
      mockedAccountApi.fetchAccountContact.mockResolvedValue(ACCOUNT_CONTACT)
      const store = useCheckoutStore()

      await store.prefillFromAccount()

      expect(store.billing).toEqual({
        firstName: 'Taro',
        lastName: 'Yamada',
        email: 'taro@example.com',
        phone: '555-0100',
        address1: '1 Test St',
        address2: 'Suite 2',
        city: 'Testville',
        state: 'CA',
        postalCode: '90000',
        country: 'USA',
      })
      expect(store.hasError).toBe(false)
    })

    it('address2がnullのAccountContactは空文字へ変換する', async () => {
      mockedAccountApi.fetchAccountContact.mockResolvedValue({ ...ACCOUNT_CONTACT, address2: null })
      const store = useCheckoutStore()

      await store.prefillFromAccount()

      expect(store.billing.address2).toBe('')
    })

    it('失敗時はhasErrorをtrueにする', async () => {
      mockedAccountApi.fetchAccountContact.mockRejectedValue(new Error('network error'))
      const store = useCheckoutStore()

      await store.prefillFromAccount()

      expect(store.hasError).toBe(true)
    })
  })

  describe('別配送トグル(effectiveShipping)', () => {
    it('useSeparateShippingがfalseの間はeffectiveShippingがbillingを返す', () => {
      const store = useCheckoutStore()
      store.updateBilling({ firstName: 'Billing' })

      expect(store.effectiveShipping.firstName).toBe('Billing')
    })

    it('useSeparateShippingをtrueにするとeffectiveShippingはshippingを返す', () => {
      const store = useCheckoutStore()
      store.updateBilling({ firstName: 'Billing' })
      store.setUseSeparateShipping(true)
      store.updateShipping({ firstName: 'Shipping' })

      expect(store.effectiveShipping.firstName).toBe('Shipping')
    })
  })

  describe('上書き(updateBilling/updateShipping)', () => {
    it('updateBillingは既存値を保ったまま指定フィールドのみ部分更新する', () => {
      const store = useCheckoutStore()
      store.updateBilling({ firstName: 'Taro', city: 'Testville' })

      store.updateBilling({ firstName: 'Jiro' })

      expect(store.billing.firstName).toBe('Jiro')
      expect(store.billing.city).toBe('Testville')
    })

    it('updateShippingは既存値を保ったまま指定フィールドのみ部分更新する', () => {
      const store = useCheckoutStore()
      store.updateShipping({ firstName: 'Taro', city: 'Testville' })

      store.updateShipping({ city: 'Otherville' })

      expect(store.shipping.firstName).toBe('Taro')
      expect(store.shipping.city).toBe('Otherville')
    })
  })

  describe('canProceedFromAddress', () => {
    it('billingの必須項目が未入力ならfalse', () => {
      const store = useCheckoutStore()

      expect(store.canProceedFromAddress).toBe(false)
    })

    it('billingの必須項目が全て揃うとtrue(別配送なし)', () => {
      const store = useCheckoutStore()
      store.updateBilling(ACCOUNT_CONTACT)

      expect(store.canProceedFromAddress).toBe(true)
    })

    it('別配送ありでshippingが未入力ならfalse', () => {
      const store = useCheckoutStore()
      store.updateBilling(ACCOUNT_CONTACT)
      store.setUseSeparateShipping(true)

      expect(store.canProceedFromAddress).toBe(false)
    })

    it('別配送ありでもbilling/shipping双方が揃えばtrue', () => {
      const store = useCheckoutStore()
      store.updateBilling(ACCOUNT_CONTACT)
      store.setUseSeparateShipping(true)
      store.updateShipping(ACCOUNT_CONTACT)

      expect(store.canProceedFromAddress).toBe(true)
    })
  })

  describe('遷移(setStep/next/prev)', () => {
    it('初期ステップはcart', () => {
      const store = useCheckoutStore()

      expect(store.currentStep).toBe('cart')
    })

    it('nextでcart→address→confirmと進み、confirmより先には進まない', () => {
      const store = useCheckoutStore()

      store.next()
      expect(store.currentStep).toBe('address')
      store.next()
      expect(store.currentStep).toBe('confirm')
      store.next()
      expect(store.currentStep).toBe('confirm')
    })

    it('prevでconfirm→address→cartと戻り、cartより前には戻らない', () => {
      const store = useCheckoutStore()
      store.setStep('confirm')

      store.prev()
      expect(store.currentStep).toBe('address')
      store.prev()
      expect(store.currentStep).toBe('cart')
      store.prev()
      expect(store.currentStep).toBe('cart')
    })

    it('setStepで直接ステップを指定できる', () => {
      const store = useCheckoutStore()

      store.setStep('confirm')

      expect(store.currentStep).toBe('confirm')
    })
  })

  describe('reset(揮発)', () => {
    it('入力済みの下書き・ステップ・別配送フラグを初期状態へ戻す', () => {
      const store = useCheckoutStore()
      store.updateBilling(ACCOUNT_CONTACT)
      store.setUseSeparateShipping(true)
      store.updateShipping(ACCOUNT_CONTACT)
      store.setStep('confirm')

      store.reset()

      expect(store.billing).toEqual({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      })
      expect(store.shipping.firstName).toBe('')
      expect(store.useSeparateShipping).toBe(false)
      expect(store.currentStep).toBe('cart')
    })
  })
})
