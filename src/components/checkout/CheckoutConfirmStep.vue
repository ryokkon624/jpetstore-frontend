<script setup lang="ts">
// #7/#8 AC1/AC3/AC4: ウィザード第3ステップ(内容確認・注文確定)。
// 支払はカード入力欄を置かず明示プレースホルダのみ(F3.6承認済)。courier/locale入力欄も置かない(PO決定)。
// 注文確定はorderStore.placeOrder()(POST /api/orders・非冪等・CSRF自動付与)を呼び、
// 成功時は完了画面(/checkout/complete)へ、失敗時はエラーメッセージを表示する。
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
import { useOrderStore } from '@/stores/order'

const { t, n } = useI18n()
const router = useRouter()
const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()
const orderStore = useOrderStore()

function formatPrice(price: number): string {
  return n(price, { style: 'currency', currency: 'USD' })
}

async function handlePlaceOrder(): Promise<void> {
  const success = await orderStore.placeOrder()
  if (success) {
    await router.push('/checkout/complete')
  }
}
</script>

<template>
  <div class="checkout-confirm-step">
    <h2 class="checkout-confirm-step__title">{{ t('checkout.confirmStep.title') }}</h2>

    <table class="jps-table">
      <thead>
        <tr>
          <th>{{ t('cart.table.item') }}</th>
          <th>{{ t('cart.table.price') }}</th>
          <th>{{ t('cart.table.quantity') }}</th>
          <th>{{ t('cart.table.subtotal') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in cartStore.displayItems" :key="item.itemId">
          <td>{{ item.attribute1 }} {{ item.productName }}</td>
          <td class="jps-price">{{ formatPrice(item.listPrice) }}</td>
          <td>{{ item.quantity }}</td>
          <td class="jps-price">{{ formatPrice(item.lineTotal) }}</td>
        </tr>
      </tbody>
    </table>
    <p class="checkout-confirm-step__subtotal">
      {{ t('cart.subtotalLabel') }}:
      <span class="jps-price jps-price-lg">{{ formatPrice(cartStore.subtotal) }}</span>
    </p>

    <div class="checkout-confirm-step__addresses">
      <section class="jps-card jps-card-pad">
        <h3 class="checkout-confirm-step__section-title">
          {{ t('checkout.confirmStep.billingTitle') }}
        </h3>
        <address class="checkout-confirm-step__address">
          {{ checkoutStore.billing.firstName }} {{ checkoutStore.billing.lastName }}<br />
          {{ checkoutStore.billing.address1 }}
          <template v-if="checkoutStore.billing.address2"
            >, {{ checkoutStore.billing.address2 }}</template
          ><br />
          {{ checkoutStore.billing.city }}, {{ checkoutStore.billing.state }}
          {{ checkoutStore.billing.postalCode }}<br />
          {{ checkoutStore.billing.country }}
        </address>
      </section>

      <section class="jps-card jps-card-pad">
        <h3 class="checkout-confirm-step__section-title">
          {{ t('checkout.confirmStep.shippingTitle') }}
        </h3>
        <address class="checkout-confirm-step__address">
          {{ checkoutStore.effectiveShipping.firstName }}
          {{ checkoutStore.effectiveShipping.lastName }}<br />
          {{ checkoutStore.effectiveShipping.address1 }}
          <template v-if="checkoutStore.effectiveShipping.address2"
            >, {{ checkoutStore.effectiveShipping.address2 }}</template
          ><br />
          {{ checkoutStore.effectiveShipping.city }}, {{ checkoutStore.effectiveShipping.state }}
          {{ checkoutStore.effectiveShipping.postalCode }}<br />
          {{ checkoutStore.effectiveShipping.country }}
        </address>
      </section>
    </div>

    <section class="jps-card jps-card-pad">
      <h3 class="checkout-confirm-step__section-title">
        {{ t('checkout.confirmStep.paymentTitle') }}
      </h3>
      <p class="checkout-confirm-step__payment-placeholder">
        {{ t('checkout.confirmStep.paymentPlaceholder') }}
      </p>
    </section>

    <p v-if="orderStore.placeError" class="jps-alert jps-alert-danger" role="alert">
      {{ t(`checkout.confirmStep.placeOrderError.${orderStore.placeError}`) }}
    </p>

    <div class="checkout-confirm-step__actions">
      <button
        type="button"
        class="jps-btn jps-btn-secondary"
        :disabled="orderStore.isPlacing"
        @click="checkoutStore.prev()"
      >
        {{ t('checkout.confirmStep.back') }}
      </button>
      <button
        type="button"
        class="jps-btn jps-btn-primary jps-btn-lg"
        :disabled="orderStore.isPlacing"
        @click="handlePlaceOrder"
      >
        {{
          orderStore.isPlacing
            ? t('checkout.confirmStep.placing')
            : t('checkout.confirmStep.placeOrder')
        }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.checkout-confirm-step {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.checkout-confirm-step__title {
  font-size: 1.25rem;
  color: var(--jps-text-heading);
}

.checkout-confirm-step__subtotal {
  text-align: right;
}

.checkout-confirm-step__addresses {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 640px) {
  .checkout-confirm-step__addresses {
    grid-template-columns: 1fr;
  }
}

.checkout-confirm-step__section-title {
  font-size: 1rem;
  color: var(--jps-text-heading);
  margin-bottom: 0.5rem;
}

.checkout-confirm-step__address {
  font-style: normal;
  font-size: 0.875rem;
  color: var(--jps-text-body);
  line-height: 1.6;
}

.checkout-confirm-step__payment-placeholder {
  font-size: 0.875rem;
  color: var(--jps-text-muted);
}

.checkout-confirm-step__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
</style>
