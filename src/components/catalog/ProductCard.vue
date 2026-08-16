<script setup lang="ts">
// #1: カテゴリ→商品一覧のカードグリッド1件分。CSS(.jps-product-card等)は#24/デザイン既達の薄いラッパー。
import { RouterLink } from 'vue-router'
import type { Product } from '@/domain/catalog'
import { resolveCatalogImage } from '@/utils/catalogImage'

const props = defineProps<{ product: Product }>()
</script>

<template>
  <RouterLink
    :to="{ name: 'catalog-product', params: { productId: props.product.productId } }"
    class="jps-product-card"
  >
    <div class="jps-media product-card__media">
      <img
        :src="resolveCatalogImage('product', props.product.productId)"
        :alt="props.product.name"
        loading="lazy"
        class="product-card__img"
      />
    </div>
    <div class="jps-product-card__body">
      <span class="jps-product-card__name">{{ props.product.name }}</span>
      <p class="product-card__desc">{{ props.product.description }}</p>
    </div>
  </RouterLink>
</template>

<style scoped>
.product-card__media {
  aspect-ratio: 4 / 3;
  width: 100%;
}

.product-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card__desc {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--jps-text-muted);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
