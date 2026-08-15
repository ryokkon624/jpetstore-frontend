import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './assets/main.css'
import { useAuthStore } from '@/stores/auth'
import { primeCsrfToken } from '@/api/httpClient'

async function bootstrap() {
  const app = createApp(App)

  app.use(createPinia())
  app.use(i18n)
  app.use(router)

  // AC7: CSRF Cookie(XSRF-TOKEN)を発行させる。
  // #24 論点①: httpOnly Cookie は生きていても Pinia の identity はリロードで揮発するため、
  // マウント前に /api/auth/me で再水和してから描画する(ヘッダのちらつき防止・ガード誤判定防止)。
  // 両者は互いに独立(/me はGETでCSRFに依存しない)なので並列実行する(レビュー指摘・#24)。
  // /me が401でsilent refreshに入る場合でも、httpClientがCSRF Cookie未取得なら自己primeするため
  // 並列化しても正しさは保たれる。
  await Promise.all([primeCsrfToken(), useAuthStore().fetchCurrentUser()])

  app.mount('#app')
}

bootstrap()
