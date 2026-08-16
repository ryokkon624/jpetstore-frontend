<script setup lang="ts">
// #1 AC2/ID-20: サーバサイドページングのUI。page/totalPagesのみを受け取り、ページ選択を
// `update:page` イベントで親に委譲する薄いラッパー(データ取得はしない)。
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { buildPageWindow } from '@/utils/pagination'

const props = defineProps<{ page: number; totalPages: number }>()
const emit = defineEmits<{ 'update:page': [page: number] }>()
const { t } = useI18n()

const pageWindow = computed(() => buildPageWindow(props.page, props.totalPages))

function goTo(page: number) {
  if (page !== props.page) {
    emit('update:page', page)
  }
}
</script>

<template>
  <nav v-if="totalPages > 1" class="jps-pagination" :aria-label="t('catalog.pagination.navLabel')">
    <a
      class="jps-page"
      href="#"
      :aria-disabled="!pageWindow.hasPrevious"
      @click.prevent="pageWindow.hasPrevious && goTo(pageWindow.previousPage)"
    >
      {{ t('catalog.pagination.previous') }}
    </a>
    <a
      v-for="p in pageWindow.pages"
      :key="p"
      class="jps-page"
      href="#"
      :aria-current="p === page ? 'page' : undefined"
      @click.prevent="goTo(p)"
    >
      {{ p }}
    </a>
    <a
      class="jps-page"
      href="#"
      :aria-disabled="!pageWindow.hasNext"
      @click.prevent="pageWindow.hasNext && goTo(pageWindow.nextPage)"
    >
      {{ t('catalog.pagination.next') }}
    </a>
  </nav>
</template>
