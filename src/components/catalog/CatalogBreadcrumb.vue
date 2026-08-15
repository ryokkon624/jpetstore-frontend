<script setup lang="ts">
// #1: カテゴリ/商品/アイテムの各階層で共通のパンくず。最後の要素はリンクなし(現在地)。
import { RouterLink, type RouteLocationRaw } from 'vue-router'

export interface BreadcrumbItem {
  label: string
  to?: RouteLocationRaw
}

defineProps<{ items: BreadcrumbItem[] }>()
</script>

<template>
  <nav class="jps-breadcrumb" aria-label="Breadcrumb">
    <template v-for="(item, index) in items" :key="index">
      <RouterLink v-if="item.to" :to="item.to">{{ item.label }}</RouterLink>
      <span v-else :aria-current="'page'">{{ item.label }}</span>
      <span v-if="index < items.length - 1" aria-hidden="true"> / </span>
    </template>
  </nav>
</template>
