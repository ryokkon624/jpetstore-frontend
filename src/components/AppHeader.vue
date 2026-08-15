<script setup lang="ts">
// one-system 共通ヘッダー（AC2）。ロゴ・主要ナビ・認証状態に応じたサインオン/サインオフを表示する。
// カタログ/カートは各ドメイン Story（E1/E2）で実ルートに接続するまでは仮リンクのまま（土台規律）。
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import logoUrl from '@/assets/logo.svg'

const { t } = useI18n()
const authStore = useAuthStore()

// AC5: 状態変更(サインオフ)は明示ボタン+CSRF経由のPOSTで行う(GETリンクで確定しない)。
async function handleSignOff() {
  await authStore.signoff()
}
</script>

<template>
  <header class="jps-header">
    <div class="jps-header__bar app-header__bar">
      <RouterLink to="/" class="jps-logo">
        <img :src="logoUrl" :alt="t('app.header.logoAlt')" class="app-header__logo" />
      </RouterLink>

      <nav class="app-header__nav" :aria-label="t('app.header.navLabel')">
        <RouterLink to="/" class="jps-navlink" active-class="jps-navlink-active">
          {{ t('app.header.nav.home') }}
        </RouterLink>
        <a class="jps-navlink" href="#">{{ t('app.header.nav.catalog') }}</a>
        <a class="jps-navlink" href="#">{{ t('app.header.nav.cart') }}</a>
      </nav>

      <div class="app-header__account">
        <template v-if="authStore.isAuthenticated">
          <span class="app-header__greeting">
            {{ t('app.header.account.greeting', { username: authStore.user?.username }) }}
          </span>
          <button type="button" class="jps-btn jps-btn-ghost jps-btn-sm" @click="handleSignOff">
            {{ t('app.header.account.signOut') }}
          </button>
        </template>
        <RouterLink v-else to="/signon" class="jps-btn jps-btn-secondary jps-btn-sm">
          {{ t('app.header.account.signIn') }}
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header__bar {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.app-header__logo {
  height: 40px;
  width: auto;
}

.app-header__nav {
  display: flex;
  gap: 0.25rem;
  margin-left: auto;
}

.app-header__account {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.app-header__greeting {
  font-size: 0.8125rem;
  color: var(--jps-text-muted);
  white-space: nowrap;
}
</style>
