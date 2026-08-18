<script setup lang="ts">
// #1 AC1/AC3/AC5/AC-neg1: アイテム詳細。在庫バッジ(qty非露出)・plaintext description。
// AC-neg1(SBD-18): productDescriptionはテキスト補間({{ }})のみで描画する。v-html/innerHTMLは
// 一切使わない(レガシーのescapeXml="false"を継承しない・格納XSS面を再現しない)。
// #4: カート追加を実装する。在庫切れ(OUT_STOCK)のみ非活性。匿名は在庫上限をorderable EP経由で
// server-sideに検証する(cartStore.addItemが認証状態に応じて自動的に振り分ける)。
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import StockBadge from '@/components/catalog/StockBadge.vue'
import CatalogBreadcrumb from '@/components/catalog/CatalogBreadcrumb.vue'
import { useCatalogStore } from '@/stores/catalog'
import { useCartStore } from '@/stores/cart'
import { resolveCatalogImage } from '@/utils/catalogImage'

const { t, n, tm } = useI18n()
const route = useRoute()
const catalogStore = useCatalogStore()
const cartStore = useCartStore()

const itemId = computed(() => String(route.params.itemId))
const isAddingToCart = ref(false)
const addToCartErrorReason = ref<string | null>(null)
const addToCartSucceeded = ref(false)

function formatPrice(price: number): string {
  return n(price, { style: 'currency', currency: 'USD' })
}

async function handleAddToCart() {
  addToCartErrorReason.value = null
  addToCartSucceeded.value = false
  isAddingToCart.value = true
  try {
    const result = await cartStore.addItem(itemId.value, 1)
    if (result.success) {
      addToCartSucceeded.value = true
    } else {
      addToCartErrorReason.value = result.reason ?? 'default'
    }
  } finally {
    isAddingToCart.value = false
  }
}

function addToCartErrorMessage(reason: string): string {
  const messages = tm('cart.addError') as Record<string, string>
  return messages[reason] ?? messages.default ?? ''
}

watch(
  itemId,
  (id) => {
    addToCartErrorReason.value = null
    addToCartSucceeded.value = false
    catalogStore.fetchItemDetail(id)
  },
  { immediate: true },
)
</script>

<template>
  <AppLayout>
    <div class="item-detail-view">
      <CatalogBreadcrumb
        :items="[
          { label: t('catalog.breadcrumb.home'), to: '/' },
          { label: t('catalog.breadcrumb.catalog'), to: '/catalog' },
          {
            label: catalogStore.currentItem?.productName ?? '',
            to: catalogStore.currentItem
              ? {
                  name: 'catalog-product',
                  params: { productId: catalogStore.currentItem.productId },
                }
              : undefined,
          },
          { label: itemId },
        ]"
      />

      <div
        v-if="catalogStore.isLoadingItem"
        class="jps-skeleton item-detail-view__skeleton"
        aria-busy="true"
      ></div>

      <div v-else-if="catalogStore.hasError || !catalogStore.currentItem" class="jps-empty">
        <p class="jps-empty__title">{{ t('catalog.error.title') }}</p>
        <p class="jps-empty__desc">{{ t('catalog.error.desc') }}</p>
      </div>

      <div v-else class="item-detail-view__panel jps-card jps-card-pad">
        <div class="jps-media item-detail-view__media">
          <img
            :src="resolveCatalogImage('product', catalogStore.currentItem.productId)"
            :alt="catalogStore.currentItem.productName"
            loading="lazy"
            class="item-detail-view__img"
          />
        </div>

        <div class="item-detail-view__body">
          <p class="item-detail-view__item-id">{{ catalogStore.currentItem.itemId }}</p>
          <h1 class="item-detail-view__name">
            {{ catalogStore.currentItem.attribute1 }} {{ catalogStore.currentItem.productName }}
          </h1>
          <!-- AC5/AC-neg1: 生HTMLを描画しない。productDescriptionは常にテキスト補間で表示する -->
          <p class="item-detail-view__desc">{{ catalogStore.currentItem.productDescription }}</p>

          <StockBadge :status="catalogStore.currentItem.stockStatus" />

          <p class="jps-price jps-price-lg">
            {{ formatPrice(catalogStore.currentItem.listPrice) }}
          </p>

          <button
            type="button"
            class="jps-btn jps-btn-primary jps-btn-lg item-detail-view__add-to-cart"
            :disabled="catalogStore.currentItem.stockStatus === 'OUT_STOCK' || isAddingToCart"
            @click="handleAddToCart"
          >
            {{ t('catalog.item.addToCart') }}
          </button>

          <p v-if="addToCartSucceeded" class="item-detail-view__add-success" role="status">
            {{ t('catalog.item.addedToCart') }}
          </p>
          <p v-if="addToCartErrorReason" class="item-detail-view__add-error" role="alert">
            {{ addToCartErrorMessage(addToCartErrorReason) }}
          </p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.item-detail-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.item-detail-view__panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.item-detail-view__media {
  aspect-ratio: 1 / 1;
  border-radius: var(--jps-radius-lg);
  overflow: hidden;
}

.item-detail-view__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-detail-view__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-detail-view__item-id {
  font-size: 0.8125rem;
  color: var(--jps-text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.item-detail-view__name {
  font-size: 1.5rem;
  color: var(--jps-text-heading);
}

.item-detail-view__desc {
  color: var(--jps-text-body);
  line-height: 1.9;
}

.item-detail-view__add-success {
  color: var(--jps-primary-text);
  font-size: 0.875rem;
}

.item-detail-view__add-error {
  color: var(--jps-danger-text);
  font-size: 0.875rem;
}

.item-detail-view__skeleton {
  height: 420px;
}

@media (max-width: 720px) {
  .item-detail-view__panel {
    grid-template-columns: 1fr;
  }
}
</style>
