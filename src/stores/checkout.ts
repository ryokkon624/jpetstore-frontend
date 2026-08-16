import { defineStore } from 'pinia'
import * as accountApi from '@/api/accountApi'
import type { AccountContact } from '@/domain/account'
import {
  CHECKOUT_STEP_ORDER,
  emptyAddress,
  type Address,
  type CheckoutStep,
} from '@/domain/checkout'

function toAddress(contact: AccountContact): Address {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    address1: contact.address1,
    address2: contact.address2 ?? '',
    city: contact.city,
    state: contact.state,
    postalCode: contact.postalCode,
    country: contact.country,
  }
}

/** address2(任意項目)を除く必須項目が全て入力済みか。 */
function isAddressComplete(address: Address): boolean {
  return (
    address.firstName.trim() !== '' &&
    address.lastName.trim() !== '' &&
    address.email.trim() !== '' &&
    address.phone.trim() !== '' &&
    address.address1.trim() !== '' &&
    address.city.trim() !== '' &&
    address.state.trim() !== '' &&
    address.postalCode.trim() !== '' &&
    address.country.trim() !== ''
  )
}

function initialState() {
  return {
    billing: emptyAddress(),
    shipping: emptyAddress(),
    useSeparateShipping: false,
    currentStep: 'cart' as CheckoutStep,
    isLoading: false,
    hasError: false,
  }
}

/**
 * #7 計画フェーズ確定③: チェックアウト・ウィザードの下書き。Piniaメモリ保持のみ(揮発)。
 *
 * <p>sessionStorage・backend下書き表は一切持たない（リロードで消えてよい。カートはサーバ永続のため
 * 再入場時はカート再取得＋住所再プリフィルで足りる）。サーバ権威は確定時(#8)に集約する。
 */
export const useCheckoutStore = defineStore('checkout', {
  state: initialState,

  getters: {
    /** 別配送を使わない間はbillingをそのまま配送先として扱う。 */
    effectiveShipping(state): Address {
      return state.useSeparateShipping ? state.shipping : state.billing
    },

    /** 住所入力ステップから次へ進めるか(billing、別配送時はshippingも必須項目が揃っていること)。 */
    canProceedFromAddress(state): boolean {
      if (!isAddressComplete(state.billing)) {
        return false
      }
      if (state.useSeparateShipping && !isAddressComplete(state.shipping)) {
        return false
      }
      return true
    },
  },

  actions: {
    /** アカウントの氏名/連絡先/住所でbillingをプリフィルする(上書き可)。 */
    async prefillFromAccount(): Promise<void> {
      this.isLoading = true
      this.hasError = false
      try {
        const contact = await accountApi.fetchAccountContact()
        this.billing = toAddress(contact)
      } catch {
        this.hasError = true
      } finally {
        this.isLoading = false
      }
    },

    setUseSeparateShipping(value: boolean): void {
      this.useSeparateShipping = value
    },

    updateBilling(patch: Partial<Address>): void {
      this.billing = { ...this.billing, ...patch }
    },

    updateShipping(patch: Partial<Address>): void {
      this.shipping = { ...this.shipping, ...patch }
    },

    setStep(step: CheckoutStep): void {
      this.currentStep = step
    },

    next(): void {
      const index = CHECKOUT_STEP_ORDER.indexOf(this.currentStep)
      const nextStep = CHECKOUT_STEP_ORDER[index + 1]
      if (nextStep) {
        this.currentStep = nextStep
      }
    },

    prev(): void {
      const index = CHECKOUT_STEP_ORDER.indexOf(this.currentStep)
      const prevStep = CHECKOUT_STEP_ORDER[index - 1]
      if (prevStep) {
        this.currentStep = prevStep
      }
    },

    /** 下書き・ステップ・別配送フラグを初期状態へ戻す(揮発の明示リセット)。 */
    reset(): void {
      Object.assign(this, initialState())
    },
  },
})
