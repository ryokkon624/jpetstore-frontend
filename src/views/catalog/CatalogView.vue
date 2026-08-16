<script setup lang="ts">
// #1 AC1: カタログトップ(カテゴリ一覧)。[L2]で5件固定・非ページング。
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/AppLayout.vue'
import CategoryCard from '@/components/catalog/CategoryCard.vue'
import CatalogBreadcrumb from '@/components/catalog/CatalogBreadcrumb.vue'
import { useCatalogStore } from '@/stores/catalog'

const { t } = useI18n()
const catalogStore = useCatalogStore()

onMounted(() => {
  catalogStore.fetchCategories()
})
</script>

<template>
  <AppLayout>
    <div class="catalog-view">
      <CatalogBreadcrumb
        :items="[
          { label: t('catalog.breadcrumb.home'), to: '/' },
          { label: t('catalog.breadcrumb.catalog') },
        ]"
      />

      <header class="catalog-view__header">
        <h1>{{ t('catalog.category.title') }}</h1>
        <p>{{ t('catalog.category.lead') }}</p>
      </header>

      <div v-if="catalogStore.isLoadingCategories" class="catalog-view__grid" aria-busy="true">
        <div v-for="n in 5" :key="n" class="jps-skeleton catalog-view__skeleton"></div>
      </div>

      <div v-else-if="catalogStore.hasError" class="jps-empty">
        <p class="jps-empty__title">{{ t('catalog.error.title') }}</p>
        <p class="jps-empty__desc">{{ t('catalog.error.desc') }}</p>
      </div>

      <div v-else-if="catalogStore.categories.length === 0" class="jps-empty">
        <p class="jps-empty__title">{{ t('catalog.empty.categories') }}</p>
      </div>

      <div v-else class="catalog-view__grid">
        <CategoryCard
          v-for="category in catalogStore.categories"
          :key="category.categoryId"
          :category="category"
        />
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.catalog-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.catalog-view__header h1 {
  font-size: 1.5rem;
  color: var(--jps-text-heading);
  margin-bottom: 0.375rem;
}

.catalog-view__header p {
  color: var(--jps-text-muted);
  font-size: 0.875rem;
}

.catalog-view__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
}

.catalog-view__skeleton {
  aspect-ratio: 4 / 3;
}
</style>
