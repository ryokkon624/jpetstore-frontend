import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SignonView from '@/views/SignonView.vue'
import CatalogView from '@/views/catalog/CatalogView.vue'
import ProductListView from '@/views/catalog/ProductListView.vue'
import ItemListView from '@/views/catalog/ItemListView.vue'
import ItemDetailView from '@/views/catalog/ItemDetailView.vue'
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
  // #1 AC1/AC4: カタログは読み取り専用・全公開のため requiresAuth は付けない。
  {
    path: '/catalog',
    name: 'catalog',
    component: CatalogView,
    meta: { title: 'JPetStore - Catalog' },
  },
  {
    path: '/catalog/categories/:categoryId',
    name: 'catalog-category',
    component: ProductListView,
    meta: { title: 'JPetStore - Catalog' },
  },
  {
    path: '/catalog/products/:productId',
    name: 'catalog-product',
    component: ItemListView,
    meta: { title: 'JPetStore - Catalog' },
  },
  {
    path: '/catalog/items/:itemId',
    name: 'catalog-item',
    component: ItemDetailView,
    meta: { title: 'JPetStore - Catalog' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(createAuthGuard())

export default router
