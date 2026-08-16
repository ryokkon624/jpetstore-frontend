<script setup lang="ts">
// #2 AC1/AC2/AC-neg2: キーワード検索結果(カードグリッド・サーバページング・カテゴリフィルタ)。
// 空/空白keywordのガード(AC2)はcatalogStore.searchProducts側で行い、ここは結果表示に専念する。
import { computed, onMounted, watch } from 'vue'
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

const keyword = computed(() => String(route.query.keyword ?? ''))
const categoryId = computed(() => {
  const raw = route.query.categoryId
  return typeof raw === 'string' && raw !== '' ? raw : undefined
})
const currentPage = computed(() => {
  const raw = Number(route.query.page)
  return Number.isInteger(raw) && raw > 0 ? raw : 1
})

function load() {
  catalogStore.searchProducts(keyword.value, categoryId.value, currentPage.value)
}

function handlePageChange(page: number) {
  router.push({
    name: 'catalog-search',
    query: { keyword: keyword.value, categoryId: categoryId.value, page },
  })
}

// AC1: カテゴリフィルタを変更したら1頁目からやり直す。
function handleCategoryChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  router.push({
    name: 'catalog-search',
    query: { keyword: keyword.value, categoryId: value || undefined },
  })
}

// カテゴリ選択肢は#1の一覧APIを再利用する(独立処理のためloadと並行して走らせてよい)。
onMounted(() => {
  catalogStore.fetchCategories()
})

watch([keyword, categoryId, currentPage], load, { immediate: true })
</script>

<template>
  <AppLayout>
    <div class="search-result-view">
      <CatalogBreadcrumb
        :items="[
          { label: t('catalog.breadcrumb.home'), to: '/' },
          { label: t('catalog.breadcrumb.catalog'), to: '/catalog' },
          { label: t('catalog.search.title') },
        ]"
      />

      <header class="search-result-view__header">
        <h1>{{ t('catalog.search.title') }}</h1>
        <p v-if="keyword">{{ t('catalog.search.resultsFor', { keyword }) }}</p>
      </header>

      <div class="search-result-view__filter">
        <label for="search-category-filter">{{ t('catalog.search.categoryFilter.label') }}</label>
        <select
          id="search-category-filter"
          :value="categoryId ?? ''"
          @change="handleCategoryChange"
        >
          <option value="">{{ t('catalog.search.categoryFilter.all') }}</option>
          <option
            v-for="category in catalogStore.categories"
            :key="category.categoryId"
            :value="category.categoryId"
          >
            {{ category.name }}
          </option>
        </select>
      </div>

      <div v-if="catalogStore.searchKeywordMissing" class="jps-empty">
        <p class="jps-empty__title">{{ t('catalog.search.emptyKeyword') }}</p>
      </div>

      <div
        v-else-if="catalogStore.isLoadingSearch"
        class="search-result-view__grid"
        aria-busy="true"
      >
        <div v-for="n in 6" :key="n" class="jps-skeleton search-result-view__skeleton"></div>
      </div>

      <div v-else-if="catalogStore.hasError" class="jps-empty">
        <p class="jps-empty__title">{{ t('catalog.error.title') }}</p>
        <p class="jps-empty__desc">{{ t('catalog.error.desc') }}</p>
      </div>

      <div v-else-if="catalogStore.searchResults.content.length === 0" class="jps-empty">
        <p class="jps-empty__title">{{ t('catalog.search.noResults', { keyword }) }}</p>
      </div>

      <template v-else>
        <div class="search-result-view__grid">
          <ProductCard
            v-for="product in catalogStore.searchResults.content"
            :key="product.productId"
            :product="product"
          />
        </div>

        <Pagination
          :page="catalogStore.searchResults.page"
          :total-pages="catalogStore.searchResults.totalPages"
          @update:page="handlePageChange"
        />
      </template>
    </div>
  </AppLayout>
</template>

<style scoped>
.search-result-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-result-view__header h1 {
  font-size: 1.5rem;
  color: var(--jps-text-heading);
  margin-bottom: 0.375rem;
}

.search-result-view__header p {
  color: var(--jps-text-muted);
  font-size: 0.875rem;
}

.search-result-view__filter {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.875rem;
}

.search-result-view__filter select {
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--jps-border);
  border-radius: var(--jps-radius-sm);
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--jps-text-body);
  background-color: var(--jps-surface-card);
}

.search-result-view__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

.search-result-view__skeleton {
  aspect-ratio: 4 / 3;
}
</style>
