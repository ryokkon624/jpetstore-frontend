<script setup lang="ts">
// #4 AC1〜AC5・[L2]・AC-neg1: カート表示・数量更新・削除。公開ルート(requiresAuthなし・D2)。
// 未ログイン=localStorage(クライアント状態)・ログイン中=サーバーカートをそれぞれstoreが解決する。
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import CatalogBreadcrumb from '@/components/catalog/CatalogBreadcrumb.vue'
import StockBadge from '@/components/catalog/StockBadge.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const { t, n, tm } = useI18n()
const authStore = useAuthStore()
const cartStore = useCartStore()

/** 更新操作中の行のitemId(連打防止・簡易ローディング表示)。 */
const pendingItemId = ref<string | null>(null)
/** 直近の追加/更新失敗理由(orderable EPのreasonコード等)。行ごとではなく画面全体に表示する。 */
const actionErrorReason = ref<string | null>(null)

function load() {
  if (authStore.isAuthenticated) {
    cartStore.fetchCart()
  } else {
    cartStore.refreshLocalItemDetails()
  }
}

onMounted(load)
watch(() => authStore.isAuthenticated, load)

function formatPrice(price: number): string {
  return n(price, { style: 'currency', currency: 'USD' })
}

async function handleQuantityChange(itemId: string, quantity: number) {
  actionErrorReason.value = null
  pendingItemId.value = itemId
  try {
    const result = await cartStore.updateItem(itemId, quantity)
    if (!result.success) {
      actionErrorReason.value = result.reason ?? 'default'
    }
  } finally {
    pendingItemId.value = null
  }
}

async function handleRemove(itemId: string) {
  pendingItemId.value = itemId
  try {
    await cartStore.removeItem(itemId)
  } finally {
    pendingItemId.value = null
  }
}

function addToCartErrorMessage(reason: string): string {
  const messages = tm('cart.addError') as Record<string, string>
  return messages[reason] ?? messages.default ?? ''
}
</script>

<template>
  <AppLayout>
    <div class="cart-view">
      <CatalogBreadcrumb
        :items="[{ label: t('catalog.breadcrumb.home'), to: '/' }, { label: t('cart.breadcrumb') }]"
      />

      <h1 class="cart-view__title">{{ t('cart.title') }}</h1>

      <p v-if="actionErrorReason" class="cart-view__action-error" role="alert">
        {{ addToCartErrorMessage(actionErrorReason) }}
      </p>

      <div
        v-if="cartStore.isLoading"
        class="jps-skeleton cart-view__skeleton"
        aria-busy="true"
      ></div>

      <div v-else-if="cartStore.hasError" class="jps-empty">
        <p class="jps-empty__title">{{ t('cart.error.title') }}</p>
        <p class="jps-empty__desc">{{ t('cart.error.desc') }}</p>
      </div>

      <div v-else-if="cartStore.displayItems.length === 0" class="jps-empty">
        <p class="jps-empty__title">{{ t('cart.empty.title') }}</p>
        <p class="jps-empty__desc">{{ t('cart.empty.desc') }}</p>
        <RouterLink to="/catalog" class="jps-btn jps-btn-primary jps-btn-sm">
          {{ t('cart.empty.browseCatalog') }}
        </RouterLink>
      </div>

      <template v-else>
        <table class="jps-table">
          <thead>
            <tr>
              <th>{{ t('cart.table.item') }}</th>
              <th>{{ t('cart.table.price') }}</th>
              <th>{{ t('cart.table.quantity') }}</th>
              <th>{{ t('cart.table.subtotal') }}</th>
              <th>{{ t('cart.table.remove') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cartStore.displayItems" :key="item.itemId">
              <td>
                <RouterLink :to="{ name: 'catalog-item', params: { itemId: item.itemId } }">
                  {{ item.attribute1 }} {{ item.productName }}
                </RouterLink>
                <div class="cart-view__badges">
                  <StockBadge :status="item.stockStatus" />
                  <span v-if="item.exceedsStock" class="jps-badge cart-view__exceeds-stock">
                    {{ t('cart.exceedsStockWarning') }}
                  </span>
                </div>
              </td>
              <td class="jps-price">{{ formatPrice(item.listPrice) }}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  class="cart-view__quantity-input"
                  :aria-label="t('cart.table.quantity')"
                  :disabled="pendingItemId === item.itemId"
                  :value="item.quantity"
                  @change="
                    handleQuantityChange(
                      item.itemId,
                      Number(($event.target as HTMLInputElement).value),
                    )
                  "
                />
              </td>
              <td class="jps-price">{{ formatPrice(item.lineTotal) }}</td>
              <td>
                <button
                  type="button"
                  class="jps-btn jps-btn-danger jps-btn-sm"
                  :disabled="pendingItemId === item.itemId"
                  @click="handleRemove(item.itemId)"
                >
                  {{ t('cart.remove') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="cart-view__summary">
          <p class="cart-view__subtotal">
            {{ t('cart.subtotalLabel') }}:
            <span class="jps-price jps-price-lg">{{ formatPrice(cartStore.subtotal) }}</span>
          </p>
          <button type="button" class="jps-btn jps-btn-primary jps-btn-lg" disabled>
            {{ t('cart.checkout') }}
            <span class="cart-view__coming-soon">({{ t('cart.checkoutComingSoon') }})</span>
          </button>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<style scoped>
.cart-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.cart-view__title {
  font-size: 1.5rem;
  color: var(--jps-text-heading);
}

.cart-view__skeleton {
  height: 320px;
}

.cart-view__action-error {
  color: var(--jps-danger-text);
  font-size: 0.875rem;
}

.cart-view__badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.375rem;
}

.cart-view__exceeds-stock {
  background-color: var(--jps-danger-soft);
  color: var(--jps-danger-text);
}

.cart-view__quantity-input {
  width: 4.5rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--jps-border);
  border-radius: var(--jps-radius-sm);
}

.cart-view__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.cart-view__subtotal {
  font-size: 1rem;
  color: var(--jps-text-heading);
}

.cart-view__coming-soon {
  font-weight: 400;
  font-size: 0.75rem;
  opacity: 0.8;
}
</style>
