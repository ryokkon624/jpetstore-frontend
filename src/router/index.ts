import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SignonView from '@/views/SignonView.vue'
import { createAuthGuard } from '@/router/authGuard'

// AC8: meta.requiresAuth を持つルートは createAuthGuard() の対象になる。
// このスプリントでは保護対象のドメイン画面が無いため実際に requiresAuth=true を持つルートは
// まだ無いが、各ドメイン Story が meta.requiresAuth: true を付けるだけで保護ルートに接続できる。
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'JPetStore' },
  },
  {
    path: '/signon',
    name: 'signon',
    component: SignonView,
    meta: { title: 'JPetStore - Sign In' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(createAuthGuard())

export default router
