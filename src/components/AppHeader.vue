<script setup lang="ts">
// one-system 共通ヘッダー（AC2）。ロゴ・検索バー・主要ナビ・認証状態に応じたサインオン/サインオフを表示する。
// #4: カートは実ルート(/cart)に接続し、件数バッジ(jps-cart-count)を表示する。
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { usePreferencesStore } from '@/stores/preferences'
import type { ColorScheme } from '@/domain/preferences'
import SettingsDropdown from '@/components/SettingsDropdown.vue'
import logoUrl from '@/assets/logo.svg'

const { t } = useI18n()
const authStore = useAuthStore()
const cartStore = useCartStore()
const preferencesStore = usePreferencesStore()
const router = useRouter()

// #36 AC1: ヘッダーのテーマ設定ドロップダウン(未ログインでも表示・操作可)。
const themeOptions = computed(() => [
  { value: 'system', label: t('app.header.settings.theme.options.system') },
  { value: 'light', label: t('app.header.settings.theme.options.light') },
  { value: 'dark', label: t('app.header.settings.theme.options.dark') },
])

function handleThemeChange(value: string): void {
  preferencesStore.setColorScheme(value as ColorScheme)
}

// AC5: 状態変更(サインオフ)は明示ボタン+CSRF経由のPOSTで行う(GETリンクで確定しない)。
async function handleSignOff() {
  await authStore.signoff()
}

// #2 AC1: ヘッダ検索バー。空/空白keywordのガード自体はSearchResultView側(store)が担うため、
// ここでは常に検索結果画面へ遷移させるだけの薄いラッパーに留める。
const searchKeyword = ref('')

function handleSearchSubmit() {
  router.push({ name: 'catalog-search', query: { keyword: searchKeyword.value } })
}
</script>

<template>
  <header class="jps-header">
    <div class="jps-header__bar app-header__bar">
      <RouterLink to="/" class="jps-logo">
        <img :src="logoUrl" :alt="t('app.header.logoAlt')" class="app-header__logo" />
      </RouterLink>

      <form class="jps-search" role="search" @submit.prevent="handleSearchSubmit">
        <input
          v-model="searchKeyword"
          type="search"
          name="keyword"
          :placeholder="t('app.header.search.placeholder')"
          :aria-label="t('app.header.search.label')"
        />
      </form>

      <nav class="app-header__nav" :aria-label="t('app.header.navLabel')">
        <RouterLink to="/" class="jps-navlink" active-class="jps-navlink-active">
          {{ t('app.header.nav.home') }}
        </RouterLink>
        <RouterLink to="/catalog" class="jps-navlink" active-class="jps-navlink-active">
          {{ t('app.header.nav.catalog') }}
        </RouterLink>
        <RouterLink to="/cart" class="jps-navlink" active-class="jps-navlink-active">
          {{ t('app.header.nav.cart') }}
          <span v-if="cartStore.itemCount > 0" class="jps-cart-count">{{
            cartStore.itemCount
          }}</span>
        </RouterLink>
      </nav>

      <div class="app-header__account">
        <SettingsDropdown
          :label="t('app.header.settings.theme.label')"
          :options="themeOptions"
          :model-value="preferencesStore.colorScheme"
          @update:model-value="handleThemeChange"
        />
        <template v-if="authStore.isAuthenticated">
          <span class="app-header__greeting">
            {{ t('app.header.account.greeting', { username: authStore.user?.username }) }}
          </span>
          <!-- #34 AC1: 注文履歴/アカウント設定への導線(認証時のみ平置き。Q1=案A-1確定)。 -->
          <RouterLink to="/account/orders" class="jps-navlink" active-class="jps-navlink-active">
            {{ t('app.header.nav.orders') }}
          </RouterLink>
          <RouterLink to="/account" class="jps-navlink" active-class="jps-navlink-active">
            {{ t('app.header.nav.account') }}
          </RouterLink>
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
