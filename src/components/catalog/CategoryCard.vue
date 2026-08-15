<script setup lang="ts">
// #1: カタログトップのカテゴリカード1件分。カテゴリ別カラートークン(bg/border/text-jps-cat-*)は
// main.cssの既達クラス(categoryId.toLowerCase()がFISH/DOGS/CATS/REPTILES/BIRDSといずれも一致)。
import { RouterLink } from 'vue-router'
import type { Category } from '@/domain/catalog'
import { resolveCatalogImage } from '@/utils/catalogImage'

const props = defineProps<{ category: Category }>()

const colorSuffix = props.category.categoryId.toLowerCase()
</script>

<template>
  <RouterLink
    :to="{ name: 'catalog-category', params: { categoryId: props.category.categoryId } }"
    class="jps-product-card category-card"
    :class="[`border-jps-cat-${colorSuffix}`]"
  >
    <div class="jps-media category-card__media" :class="[`bg-jps-cat-${colorSuffix}-soft`]">
      <img
        :src="resolveCatalogImage('category', props.category.categoryId)"
        :alt="props.category.name"
        loading="lazy"
        class="category-card__img"
      />
    </div>
    <div class="jps-product-card__body">
      <span class="jps-product-card__name" :class="[`text-jps-cat-${colorSuffix}`]">
        {{ props.category.name }}
      </span>
      <p class="category-card__desc">{{ props.category.description }}</p>
    </div>
  </RouterLink>
</template>

<style scoped>
.category-card__media {
  aspect-ratio: 16 / 9;
  width: 100%;
}

.category-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-card__desc {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--jps-text-muted);
}
</style>
