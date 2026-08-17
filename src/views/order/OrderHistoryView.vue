<script setup lang="ts">
// #9 AC1〜AC3: 自分の注文履歴一覧(新しい順・サーバページング)。ProductListView.vueのパターン
// (route.query.pageとの同期・Pagination.vue/buildPageWindow・.jps-empty空状態)を踏襲する。
// 認証必須(router meta.requiresAuth=true)。行クリックで注文詳細(#10)へ遷移する。
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import Pagination from '@/components/catalog/Pagination.vue'
import { useOrderStore } from '@/stores/order'

const { t, n } = useI18n()
const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const currentPage = computed(() => {
  const raw = Number(route.query.page)
  return Number.isInteger(raw) && raw > 0 ? raw : 1
})

function formatPrice(price: number): string {
  return n(price, { style: 'currency', currency: 'USD' })
}

function handlePageChange(page: number) {
  router.push({ name: 'order-history', query: { page } })
}

watch(currentPage, () => orderStore.fetchHistory(currentPage.value), { immediate: true })
</script>

<template>
  <AppLayout>
    <div class="order-history-view">
      <h1 class="order-history-view__title">{{ t('order.history.title') }}</h1>

      <div
        v-if="orderStore.isLoadingHistory"
        class="jps-skeleton order-history-view__skeleton"
        aria-busy="true"
      ></div>

      <div v-else-if="orderStore.history.content.length === 0" class="jps-empty">
        <p class="jps-empty__title">{{ t('order.history.empty') }}</p>
      </div>

      <template v-else>
        <table class="jps-table">
          <thead>
            <tr>
              <th>{{ t('order.history.table.orderId') }}</th>
              <th>{{ t('order.history.table.date') }}</th>
              <th>{{ t('order.history.table.total') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orderStore.history.content" :key="order.orderId">
              <td>
                <router-link :to="{ name: 'order-detail', params: { orderId: order.orderId } }">
                  {{ order.orderId }}
                </router-link>
              </td>
              <td>{{ order.orderDate }}</td>
              <td class="jps-price">{{ formatPrice(order.totalPrice) }}</td>
            </tr>
          </tbody>
        </table>

        <Pagination
          :page="orderStore.history.page"
          :total-pages="orderStore.history.totalPages"
          @update:page="handlePageChange"
        />
      </template>
    </div>
  </AppLayout>
</template>

<style scoped>
.order-history-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-history-view__title {
  font-size: 1.5rem;
  color: var(--jps-text-heading);
}

.order-history-view__skeleton {
  height: 12rem;
}
</style>
