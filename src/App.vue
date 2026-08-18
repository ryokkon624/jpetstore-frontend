<script setup lang="ts">
// #4 AC3・計画フェーズ確定②: authStore.isAuthenticatedの変化を監視し、カート状態を
// サーバー/localStorageの適切な真実へ同期する(ログイン時マージ・ログアウト時はローカル状態へ復帰)。
// immediate:trueにより起動時(既にログイン済みでリロードされた場合を含む)にも実行され、
// 前回セッションで失敗したマージのリトライも兼ねる(localLinesが空ならmergeは呼ばれずno-op)。
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { usePreferencesStore } from '@/stores/preferences'

const authStore = useAuthStore()
const cartStore = useCartStore()

// #36 AC3/AC4: localStorageの選択をPinia state(ドロップダウンの選択表示等)へ同期する。
// <html>のdark/lightクラス自体はindex.htmlのhead script(Q3)が初回描画前に適用済みのため、
// ここでの再適用は冪等(同じlocalStorageキーを読むため二重適用しても結果は変わらない)。
usePreferencesStore().init()

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
