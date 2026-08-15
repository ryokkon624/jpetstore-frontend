<script setup lang="ts">
// #1 AC1/AC2/AC3/AC5: 商品内の在庫アイテム一覧(テーブル・サーバページング・在庫バッジ)。
// AC5: product.descriptionはテキスト補間({{ }})のみで描画する(v-html禁止)。
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import Pagination from '@/components/catalog/Pagination.vue'
import StockBadge from '@/components/catalog/StockBadge.vue'
import CatalogBreadcrumb from '@/components/catalog/CatalogBreadcrumb.vue'
import { useCatalogStore } from '@/stores/catalog'

const { t, n } = useI18n()
const route = useRoute()
const router = useRouter()
const catalogStore = useCatalogStore()

const productId = computed(() => String(route.params.productId))
const currentPage = computed(() => {
  const raw = Number(route.query.page)
  return Number.isInteger(raw) && raw > 0 ? raw : 1
})

function load() {
  catalogStore.fetchProductItems(productId.value, currentPage.value)
}

function handlePageChange(page: number) {
  router.push({ name: 'catalog-product', params: { productId: productId.value }, query: { page } })
}

function formatPrice(price: number): string {
  return n(price, { style: 'currency', currency: 'USD' })
}

watch([productId, currentPage], load, { immediate: true })
</script>

<template>
  <AppLayout>
    <div class="item-list-view">
      <CatalogBreadcrumb
        :items="[
          { label: t('catalog.breadcrumb.home'), to: '/' },
          { label: t('catalog.breadcrumb.catalog'), to: '/catalog' },
          {
            label: catalogStore.currentProduct?.categoryId ?? '',
            to: catalogStore.currentProduct
              ? {
                  name: 'catalog-category',
                  params: { categoryId: catalogStore.currentProduct.categoryId },
                }
              : undefined,
          },
          { label: catalogStore.currentProduct?.name ?? productId },
        ]"
      />

      <header v-if="catalogStore.currentProduct" class="item-list-view__header">
        <h1>{{ catalogStore.currentProduct.name }}</h1>
        <p>{{ catalogStore.currentProduct.description }}</p>
      </header>

      <div
        v-if="catalogStore.isLoadingItems"
        class="jps-skeleton item-list-view__skeleton"
        aria-busy="true"
      ></div>

      <div v-else-if="catalogStore.hasError" class="jps-empty">
        <p class="jps-empty__title">{{ t('catalog.error.title') }}</p>
        <p class="jps-empty__desc">{{ t('catalog.error.desc') }}</p>
      </div>

      <div v-else-if="catalogStore.items.content.length === 0" class="jps-empty">
        <p class="jps-empty__title">{{ t('catalog.empty.items') }}</p>
      </div>

      <template v-else>
        <table class="jps-table">
          <thead>
            <tr>
              <th>{{ t('catalog.table.itemId') }}</th>
              <th>{{ t('catalog.table.description') }}</th>
              <th>{{ t('catalog.table.price') }}</th>
              <th>{{ t('catalog.table.stock') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in catalogStore.items.content" :key="item.itemId">
              <td>
                <RouterLink :to="{ name: 'catalog-item', params: { itemId: item.itemId } }">
                  {{ item.itemId }}
                </RouterLink>
              </td>
              <td>{{ item.attribute1 }}</td>
              <td class="jps-price">{{ formatPrice(item.listPrice) }}</td>
              <td><StockBadge :status="item.stockStatus" /></td>
            </tr>
          </tbody>
        </table>

        <Pagination
          :page="catalogStore.items.page"
          :total-pages="catalogStore.items.totalPages"
          @update:page="handlePageChange"
        />
      </template>
    </div>
  </AppLayout>
</template>

<style scoped>
.item-list-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.item-list-view__header h1 {
  font-size: 1.5rem;
  color: var(--jps-text-heading);
  margin-bottom: 0.375rem;
}

.item-list-view__header p {
  color: var(--jps-text-muted);
  font-size: 0.875rem;
}

.item-list-view__skeleton {
  height: 240px;
}
</style>
