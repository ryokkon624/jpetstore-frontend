<script setup lang="ts">
// デザイントークン（main.css の --jps-*）とヒーロー/ロゴが効くことを示すトップ画面。
// ドメイン画面（商品一覧/カート/注文など）はこの雛形では作り込まない。
import heroImage from '@/assets/hero.png'
import logoUrl from '@/assets/logo.svg'
</script>

<template>
  <div class="home">
    <header class="jps-header">
      <div class="jps-header__bar home__header">
        <img :src="logoUrl" alt="JPetStore" class="home__logo" />
        <nav class="home__nav">
          <a class="jps-navlink jps-navlink-active" href="#">ホーム</a>
          <a class="jps-navlink" href="#">カタログ</a>
          <a class="jps-navlink" href="#">カート</a>
        </nav>
      </div>
    </header>

    <main class="home__main">
      <!-- ヒーロー: 画像を全面に敷き、テキストは右 1/3 のパネルに乗せる構図 -->
      <section class="hero" :style="{ '--hero-image': `url(${heroImage})` }">
        <div
          class="hero__media"
          role="img"
          aria-label="犬・猫・鳥・金魚が集まる、あたたかく親しみやすいペットショップの様子"
        ></div>
        <div class="hero__panel">
          <p class="hero__eyebrow">モダンに生まれ変わった</p>
          <h1 class="hero__title">ペットとの暮らしを、<br />もっと身近に。</h1>
          <p class="hero__lead">
            魚・犬・猫・爬虫類・鳥。JPetStore は、お気に入りのパートナーと出会えるオンラインペットストアです。
          </p>
          <div class="hero__actions">
            <a class="jps-btn jps-btn-primary jps-btn-lg" href="#">カタログを見る</a>
            <a class="jps-btn jps-btn-secondary jps-btn-lg" href="#">はじめての方へ</a>
          </div>
        </div>
      </section>

      <!-- デザイントークンがこの雛形で有効に効いていることの確認スロット -->
      <section class="tokens jps-card jps-card-pad">
        <h2 class="tokens__title">デザイントークン確認</h2>
        <p class="tokens__desc">
          main.css の CSS カスタムプロパティ（--jps-primary / --jps-accent / --jps-surface
          など）と @layer で定義したクラスが、Tailwind 非導入のまま効いていることの確認用スロットです。
        </p>
        <div class="tokens__row">
          <span class="jps-badge badge-jps-stock-in">在庫あり</span>
          <span class="jps-badge badge-jps-stock-low">残りわずか</span>
          <span class="jps-badge badge-jps-stock-out">在庫なし</span>
          <span class="jps-chip">Fish</span>
          <span class="jps-chip jps-chip-active">Dogs</span>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background-color: var(--jps-surface);
}

.home__header {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.home__logo {
  height: 40px;
  width: auto;
}

.home__nav {
  display: flex;
  gap: 0.25rem;
  margin-left: auto;
}

.home__main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.75rem;
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

/* ── トークン確認 ── */
.tokens__title {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.tokens__desc {
  font-size: 0.8125rem;
  line-height: 1.9;
  color: var(--jps-text-muted);
  margin-bottom: 1rem;
}

.tokens__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem;
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
