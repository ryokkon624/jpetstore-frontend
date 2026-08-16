<script setup lang="ts">
// #1 AC3: 在庫status(code文字列)を薄いラッパーでバッジ表示する。qtyは一切扱わない(在庫数非露出)。
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveStockBadge } from '@/utils/stockBadge'

const props = defineProps<{ status: string }>()
const { t } = useI18n()

const badge = computed(() => resolveStockBadge(props.status))
</script>

<template>
  <span class="jps-badge" :class="badge.cssClass">{{ t(badge.i18nKey) }}</span>
</template>
