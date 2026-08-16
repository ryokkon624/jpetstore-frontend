<script setup lang="ts">
// #4 AC3・計画フェーズ確定②: authStore.isAuthenticatedの変化を監視し、カート状態を
// サーバー/localStorageの適切な真実へ同期する(ログイン時マージ・ログアウト時はローカル状態へ復帰)。
// immediate:trueにより起動時(既にログイン済みでリロードされた場合を含む)にも実行され、
// 前回セッションで失敗したマージのリトライも兼ねる(localLinesが空ならmergeは呼ばれずno-op)。
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const authStore = useAuthStore()
const cartStore = useCartStore()

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    cartStore.syncOnAuthChange(isAuthenticated)
  },
  { immediate: true },
)
</script>

<template>
  <RouterView />
</template>
