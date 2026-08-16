<script setup lang="ts">
// #7 AC1/AC2/AC-neg1: チェックアウト・ウィザード(単一ルート/checkout＋内部3ステップ・計画フェーズ確定④)。
// meta.requiresAuth:trueにより既達authGuard/redirectValidatorが未認証→サインオン誘導→復帰を処理する
// (新規配線ゼロ)。AC-neg1: 空カートではnewOrderForm相当に進めない(カートストアのisEmptyで判定し
// /cart?reason=empty-checkoutへ正規化する)。
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import CatalogBreadcrumb from '@/components/catalog/CatalogBreadcrumb.vue'
import CheckoutCartStep from '@/components/checkout/CheckoutCartStep.vue'
import CheckoutAddressStep from '@/components/checkout/CheckoutAddressStep.vue'
import CheckoutConfirmStep from '@/components/checkout/CheckoutConfirmStep.vue'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
import { CHECKOUT_STEP_ORDER, type CheckoutStep } from '@/domain/checkout'

const { t } = useI18n()
const router = useRouter()
const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()

const steps: { key: CheckoutStep; label: string }[] = CHECKOUT_STEP_ORDER.map((key) => ({
  key,
  label: t(`checkout.steps.${key}`),
}))

function stepStatusClass(step: CheckoutStep): string | undefined {
  const currentIndex = CHECKOUT_STEP_ORDER.indexOf(checkoutStore.currentStep)
  const stepIndex = CHECKOUT_STEP_ORDER.indexOf(step)
  if (stepIndex < currentIndex) {
    return 'jps-step-done'
  }
  if (stepIndex === currentIndex) {
    return 'jps-step-current'
  }
  return undefined
}

function isBillingPrefilled(): boolean {
  return Object.values(checkoutStore.billing).some((value) => value !== '')
}

onMounted(async () => {
  await cartStore.fetchCart()
  if (cartStore.isEmpty) {
    await router.replace({ path: '/cart', query: { reason: 'empty-checkout' } })
    return
  }
  if (!isBillingPrefilled()) {
    await checkoutStore.prefillFromAccount()
  }
})

const showCartStep = computed(() => checkoutStore.currentStep === 'cart')
const showAddressStep = computed(() => checkoutStore.currentStep === 'address')
const showConfirmStep = computed(() => checkoutStore.currentStep === 'confirm')
</script>

<template>
  <AppLayout>
    <div class="checkout-view">
      <CatalogBreadcrumb
        :items="[
          { label: t('catalog.breadcrumb.home'), to: '/' },
          { label: t('cart.breadcrumb'), to: '/cart' },
          { label: t('checkout.breadcrumb') },
        ]"
      />

      <nav class="jps-steps" aria-label="Checkout steps">
        <template v-for="(step, index) in steps" :key="step.key">
          <span
            class="jps-step"
            :class="stepStatusClass(step.key)"
            :aria-current="checkoutStore.currentStep === step.key ? 'step' : undefined"
          >
            {{ step.label }}
          </span>
          <span v-if="index < steps.length - 1" class="jps-steps__sep" aria-hidden="true"></span>
        </template>
      </nav>

      <CheckoutCartStep v-if="showCartStep" />
      <CheckoutAddressStep v-else-if="showAddressStep" />
      <CheckoutConfirmStep v-else-if="showConfirmStep" />
    </div>
  </AppLayout>
</template>

<style scoped>
.checkout-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
