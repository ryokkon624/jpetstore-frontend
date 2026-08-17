<script setup lang="ts">
// #10 AC1〜AC5: 所有者限定の注文詳細(明細・単価×数量・注文合計・注文日のみ。住所は出さない・Sprint14 Q2)。
// 明細テーブルはCheckoutConfirmStep.vueの<table class="jps-table">パターンを転用する。
// detailUnavailable(403/404を区別しない統一エラー)時は存在推測を与えない固定メッセージのみ表示する
// (AC-neg1/AC-neg2)。認証必須(router meta.requiresAuth=true)。
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { useOrderStore } from '@/stores/order'

const { t, n } = useI18n()
const route = useRoute()
const orderStore = useOrderStore()

const orderId = computed(() => Number(route.params.orderId))

function formatPrice(price: number): string {
  return n(price, { style: 'currency', currency: 'USD' })
}

watch(orderId, () => orderStore.fetchDetail(orderId.value), { immediate: true })
</script>

<template>
  <AppLayout>
    <div class="order-detail-view">
      <div
        v-if="orderStore.isLoadingDetail"
        class="jps-skeleton order-detail-view__skeleton"
        aria-busy="true"
      ></div>

      <div v-else-if="orderStore.detailUnavailable" class="jps-empty">
        <p class="jps-empty__title">{{ t('order.detail.unavailable.title') }}</p>
        <p class="jps-empty__desc">{{ t('order.detail.unavailable.desc') }}</p>
      </div>

      <div v-else-if="orderStore.detail" class="order-detail-view__content">
        <h1 class="order-detail-view__title">
          {{ t('order.detail.title', { orderId: orderStore.detail.orderId }) }}
        </h1>
        <p class="order-detail-view__date">{{ orderStore.detail.orderDate }}</p>

        <table class="jps-table">
          <thead>
            <tr>
              <th>{{ t('order.detail.table.product') }}</th>
              <th>{{ t('order.detail.table.price') }}</th>
              <th>{{ t('order.detail.table.quantity') }}</th>
              <th>{{ t('order.detail.table.subtotal') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in orderStore.detail.lines" :key="line.itemId">
              <td>{{ line.productName }}</td>
              <td class="jps-price">{{ formatPrice(line.unitPrice) }}</td>
              <td>{{ line.quantity }}</td>
              <td class="jps-price">{{ formatPrice(line.lineTotal) }}</td>
            </tr>
          </tbody>
        </table>

        <p class="order-detail-view__total">
          {{ t('order.detail.totalLabel') }}:
          <span class="jps-price jps-price-lg">{{
            formatPrice(orderStore.detail.totalPrice)
          }}</span>
        </p>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.order-detail-view__skeleton {
  height: 12rem;
}

.order-detail-view__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-detail-view__title {
  font-size: 1.5rem;
  color: var(--jps-text-heading);
}

.order-detail-view__date {
  color: var(--jps-text-muted);
  font-size: 0.875rem;
}

.order-detail-view__total {
  text-align: right;
}
</style>
