<script setup lang="ts">
// one-system 共通レイアウト（AC2）。AppHeader + メインコンテンツスロットのみの薄いラッパー。
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <div class="app-layout">
    <AppHeader />
    <main class="app-layout__main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background-color: var(--jps-surface);
}

.app-layout__main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.75rem;
}
</style>
