<script setup lang="ts">
// #8 計画フェーズ確定②: 最小の完了画面(注文番号・サーバ再計算合計・サンクスメッセージのみ)。
// 明細・商品名の一覧表示は作らない(#10 注文詳細閲覧に委譲)。
// orderStoreはPiniaメモリ保持のみ(揮発)のため、リロード等でhasResult=falseになった場合は/へ
// リダイレクトする(#7で確立した否定AC判定=Piniaストアのtestable getterパターンを踏襲)。
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { useOrderStore } from '@/stores/order'

const { t, n } = useI18n()
const router = useRouter()
const orderStore = useOrderStore()

function formatPrice(price: number): string {
  return n(price, { style: 'currency', currency: 'USD' })
}

onMounted(() => {
  if (!orderStore.hasResult) {
    router.replace('/')
  }
})
</script>

<template>
  <AppLayout>
    <div v-if="orderStore.result" class="order-complete-view">
      <section class="jps-card jps-card-pad order-complete-view__card">
        <h1 class="order-complete-view__title">{{ t('orderComplete.title') }}</h1>
        <p class="order-complete-view__message">{{ t('orderComplete.message') }}</p>
        <dl class="order-complete-view__summary">
          <div class="order-complete-view__summary-row">
            <dt>{{ t('orderComplete.orderNumberLabel') }}</dt>
            <dd>{{ orderStore.result.orderId }}</dd>
          </div>
          <div class="order-complete-view__summary-row">
            <dt>{{ t('orderComplete.totalLabel') }}</dt>
            <dd class="jps-price jps-price-lg">{{ formatPrice(orderStore.result.totalPrice) }}</dd>
          </div>
        </dl>
        <router-link to="/" class="jps-btn jps-btn-primary jps-btn-lg">
          {{ t('orderComplete.continueShopping') }}
        </router-link>
      </section>
    </div>
  </AppLayout>
</template>

<style scoped>
.order-complete-view {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.order-complete-view__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 28rem;
  width: 100%;
  text-align: center;
}

.order-complete-view__title {
  font-size: 1.5rem;
  color: var(--jps-text-heading);
}

.order-complete-view__message {
  color: var(--jps-text-body);
}

.order-complete-view__summary {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-complete-view__summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-complete-view__summary-row dt {
  color: var(--jps-text-muted);
}
</style>
