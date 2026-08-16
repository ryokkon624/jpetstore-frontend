<script setup lang="ts">
// #7 AC1: ウィザード第1ステップ(カート確認)。既達cartストア(displayItems/subtotal)を再利用する
// だけで新規backend呼び出しは発生しない(GET /api/cartは親のCheckoutViewが既に取得済み)。
import { useI18n } from 'vue-i18n'
import StockBadge from '@/components/catalog/StockBadge.vue'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'

const { t, n } = useI18n()
const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()

function formatPrice(price: number): string {
  return n(price, { style: 'currency', currency: 'USD' })
}
</script>

<template>
  <div class="checkout-cart-step">
    <h2 class="checkout-cart-step__title">{{ t('checkout.cartStep.title') }}</h2>

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
          <td>
            {{ item.attribute1 }} {{ item.productName }}
            <StockBadge :status="item.stockStatus" />
          </td>
          <td class="jps-price">{{ formatPrice(item.listPrice) }}</td>
          <td>{{ item.quantity }}</td>
          <td class="jps-price">{{ formatPrice(item.lineTotal) }}</td>
        </tr>
      </tbody>
    </table>

    <p class="checkout-cart-step__subtotal">
      {{ t('cart.subtotalLabel') }}:
      <span class="jps-price jps-price-lg">{{ formatPrice(cartStore.subtotal) }}</span>
    </p>

    <div class="checkout-cart-step__actions">
      <button
        type="button"
        class="jps-btn jps-btn-primary jps-btn-lg"
        @click="checkoutStore.next()"
      >
        {{ t('checkout.cartStep.continue') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.checkout-cart-step {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.checkout-cart-step__title {
  font-size: 1.25rem;
  color: var(--jps-text-heading);
}

.checkout-cart-step__subtotal {
  text-align: right;
}

.checkout-cart-step__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
