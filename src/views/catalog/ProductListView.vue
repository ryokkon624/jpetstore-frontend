<script setup lang="ts">
// #1 AC1/AC2: カテゴリ内商品一覧(カードグリッド・サーバページング)。
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import ProductCard from '@/components/catalog/ProductCard.vue'
import Pagination from '@/components/catalog/Pagination.vue'
import CatalogBreadcrumb from '@/components/catalog/CatalogBreadcrumb.vue'
import { useCatalogStore } from '@/stores/catalog'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const catalogStore = useCatalogStore()

const categoryId = computed(() => String(route.params.categoryId))
const currentPage = computed(() => {
  const raw = Number(route.query.page)
  return Number.isInteger(raw) && raw > 0 ? raw : 1
})

function load() {
  catalogStore.fetchCategoryProducts(categoryId.value, currentPage.value)
}

function handlePageChange(page: number) {
  router.push({
    name: 'catalog-category',
    params: { categoryId: categoryId.value },
    query: { page },
  })
}

watch([categoryId, currentPage], load, { immediate: true })
</script>

<template>
  <AppLayout>
    <div class="product-list-view">
      <CatalogBreadcrumb
        :items="[
          { label: t('catalog.breadcrumb.home'), to: '/' },
          { label: t('catalog.breadcrumb.catalog'), to: '/catalog' },
          { label: catalogStore.currentCategory?.name ?? categoryId },
        ]"
      />

      <header v-if="catalogStore.currentCategory" class="product-list-view__header">
        <h1>{{ catalogStore.currentCategory.name }}</h1>
        <p>{{ catalogStore.currentCategory.description }}</p>
      </header>

      <div v-if="catalogStore.isLoadingProducts" class="product-list-view__grid" aria-busy="true">
        <div v-for="n in 6" :key="n" class="jps-skeleton product-list-view__skeleton"></div>
      </div>

      <div v-else-if="catalogStore.hasError" class="jps-empty">
        <p class="jps-empty__title">{{ t('catalog.error.title') }}</p>
        <p class="jps-empty__desc">{{ t('catalog.error.desc') }}</p>
      </div>

      <div v-else-if="catalogStore.products.content.length === 0" class="jps-empty">
        <p class="jps-empty__title">{{ t('catalog.empty.products') }}</p>
      </div>

      <template v-else>
        <div class="product-list-view__grid">
          <ProductCard
            v-for="product in catalogStore.products.content"
            :key="product.productId"
            :product="product"
          />
        </div>

        <Pagination
          :page="catalogStore.products.page"
          :total-pages="catalogStore.products.totalPages"
          @update:page="handlePageChange"
        />
      </template>
    </div>
  </AppLayout>
</template>

<style scoped>
.product-list-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-list-view__header h1 {
  font-size: 1.5rem;
  color: var(--jps-text-heading);
  margin-bottom: 0.375rem;
}

.product-list-view__header p {
  color: var(--jps-text-muted);
  font-size: 0.875rem;
}

.product-list-view__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

.product-list-view__skeleton {
  aspect-ratio: 4 / 3;
}
</style>
