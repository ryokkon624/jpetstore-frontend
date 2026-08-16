<script setup lang="ts">
// #7 AC1: ウィザード第2ステップ(配送/請求先入力)。アカウントからプリフィル済み・上書き可。
// 別配送先は任意(useSeparateShippingトグルで表示)。
import { useI18n } from 'vue-i18n'
import AddressForm from '@/components/checkout/AddressForm.vue'
import { useCheckoutStore } from '@/stores/checkout'

const { t } = useI18n()
const checkoutStore = useCheckoutStore()

function handleToggleSeparateShipping(event: Event) {
  checkoutStore.setUseSeparateShipping((event.target as HTMLInputElement).checked)
}
</script>

<template>
  <div class="checkout-address-step">
    <h2 class="checkout-address-step__title">{{ t('checkout.addressStep.title') }}</h2>

    <section class="checkout-address-step__section">
      <h3 class="checkout-address-step__section-title">
        {{ t('checkout.addressStep.billingTitle') }}
      </h3>
      <AddressForm
        :model-value="checkoutStore.billing"
        id-prefix="billing"
        @update:model-value="checkoutStore.updateBilling($event)"
      />
    </section>

    <label class="checkout-address-step__toggle">
      <input
        type="checkbox"
        :checked="checkoutStore.useSeparateShipping"
        @change="handleToggleSeparateShipping"
      />
      {{ t('checkout.addressStep.useSeparateShipping') }}
    </label>

    <section v-if="checkoutStore.useSeparateShipping" class="checkout-address-step__section">
      <h3 class="checkout-address-step__section-title">
        {{ t('checkout.addressStep.shippingTitle') }}
      </h3>
      <AddressForm
        :model-value="checkoutStore.shipping"
        id-prefix="shipping"
        @update:model-value="checkoutStore.updateShipping($event)"
      />
    </section>

    <div class="checkout-address-step__actions">
      <button type="button" class="jps-btn jps-btn-secondary" @click="checkoutStore.prev()">
        {{ t('checkout.addressStep.back') }}
      </button>
      <button
        type="button"
        class="jps-btn jps-btn-primary"
        :disabled="!checkoutStore.canProceedFromAddress"
        @click="checkoutStore.next()"
      >
        {{ t('checkout.addressStep.continue') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.checkout-address-step {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.checkout-address-step__title {
  font-size: 1.25rem;
  color: var(--jps-text-heading);
}

.checkout-address-step__section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkout-address-step__section-title {
  font-size: 1rem;
  color: var(--jps-text-heading);
}

.checkout-address-step__toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.checkout-address-step__actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
</style>
