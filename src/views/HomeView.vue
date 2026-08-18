<script setup lang="ts">
// AC1/AC2/AC4: AppLayout(共通ヘッダー)+ i18n(英語) でトップ画面を構成する。
// ドメイン画面（商品一覧/カート/注文など）はこの雛形では作り込まない（土台規律）。
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import heroImage from '@/assets/hero.png'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()
</script>

<template>
  <AppLayout>
    <div class="home">
      <!-- ヒーロー: 画像を全面に敷き、テキストは右 1/3 のパネルに乗せる構図 -->
      <section class="hero" :style="{ '--hero-image': `url(${heroImage})` }">
        <div class="hero__media" role="img" :aria-label="t('home.hero.title')"></div>
        <div class="hero__panel">
          <p class="hero__eyebrow">{{ t('home.hero.eyebrow') }}</p>
          <h1 class="hero__title">{{ t('home.hero.title') }}</h1>
          <p class="hero__lead">{{ t('home.hero.lead') }}</p>
          <div class="hero__actions">
            <RouterLink to="/catalog" class="jps-btn jps-btn-primary jps-btn-lg">
              {{ t('home.hero.browseCatalog') }}
            </RouterLink>
            <!-- #34 AC4: 認証済み時はNew Here?(/register)導線を非表示にする。 -->
            <RouterLink
              v-if="!authStore.isAuthenticated"
              to="/register"
              class="jps-btn jps-btn-secondary jps-btn-lg"
            >
              {{ t('home.hero.newHere') }}
            </RouterLink>
          </div>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ── ヒーロー ── */
.hero {
  position: relative;
  display: grid;
  grid-template-columns: 2fr 1fr; /* 右 1/3 にテキストパネル */
  min-height: 440px;
  border: 1px solid var(--jps-border);
  border-radius: var(--jps-radius-lg);
  box-shadow: var(--jps-shadow-md);
  overflow: hidden;
}

.hero__media {
  grid-column: 1 / -1;
  grid-row: 1;
  background-image: var(--hero-image);
  background-size: cover;
  background-position: center;
}

.hero__panel {
  grid-column: 2 / 3;
  grid-row: 1;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  margin: 1rem;
  padding: 2rem;
  background-color: color-mix(in srgb, var(--jps-surface-card) 88%, transparent);
  border: 1px solid var(--jps-border);
  border-radius: var(--jps-radius-lg);
  backdrop-filter: blur(4px);
}

.hero__eyebrow {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--jps-primary-text);
}

.hero__title {
  font-size: clamp(1.75rem, 2.4vw, 2.5rem);
  line-height: 1.3;
  color: var(--jps-text-heading);
}

.hero__lead {
  font-size: 0.9375rem;
  line-height: 1.9;
  color: var(--jps-text-body);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

/* ── レスポンシブ: 狭い画面では画像を上、テキストを下に積む ── */
@media (max-width: 880px) {
  .hero {
    grid-template-columns: 1fr;
    grid-template-rows: 220px auto;
  }
  .hero__media {
    grid-column: 1;
    grid-row: 1;
  }
  .hero__panel {
    grid-column: 1;
    grid-row: 2;
    margin: 0;
    border: 0;
    border-radius: 0;
    backdrop-filter: none;
    background-color: var(--jps-surface-card);
  }
}
</style>
