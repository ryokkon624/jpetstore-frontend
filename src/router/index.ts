import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SignonView from '@/views/SignonView.vue'
import CatalogView from '@/views/catalog/CatalogView.vue'
import ProductListView from '@/views/catalog/ProductListView.vue'
import ItemListView from '@/views/catalog/ItemListView.vue'
import ItemDetailView from '@/views/catalog/ItemDetailView.vue'
import SearchResultView from '@/views/catalog/SearchResultView.vue'
import CartView from '@/views/CartView.vue'
import CheckoutView from '@/views/checkout/CheckoutView.vue'
import CheckoutCompleteView from '@/views/checkout/CheckoutCompleteView.vue'
import OrderHistoryView from '@/views/order/OrderHistoryView.vue'
import OrderDetailView from '@/views/order/OrderDetailView.vue'
import { createAuthGuard } from '@/router/authGuard'

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
  // #2 AC1/AC4: 検索も読み取り専用・全公開のため requiresAuth は付けない。
  {
    path: '/catalog/search',
    name: 'catalog-search',
    component: SearchResultView,
    meta: { title: 'JPetStore - Search Results' },
  },
  // #4 D2: カート画面は公開ルート(requiresAuthなし)。未ログインでもクライアントカート
  // (localStorage)を閲覧できるようにする。認証必須なのは/api/cart/** APIのみ。
  {
    path: '/cart',
    name: 'cart',
    component: CartView,
    meta: { title: 'JPetStore - Your Cart' },
  },
  // #7 AC2: 単一ルート＋内部3ステップ(カート確認/住所入力/内容確認)。認証必須
  // (既達authGuard/redirectValidatorが未認証→サインオン誘導→復帰を処理する。新規配線ゼロ)。
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutView,
    meta: { title: 'JPetStore - Checkout', requiresAuth: true },
  },
  // #8 計画フェーズ確定②: 最小の完了画面。orderStore.hasResult=falseなら/へredirect(View側で判定)。
  {
    path: '/checkout/complete',
    name: 'checkout-complete',
    component: CheckoutCompleteView,
    meta: { title: 'JPetStore - Order Complete', requiresAuth: true },
  },
  // #9 AC3: 注文履歴一覧(本人スコープ)。認証必須(既達authGuard/元URL復帰を無配線再利用)。
  {
    path: '/account/orders',
    name: 'order-history',
    component: OrderHistoryView,
    meta: { title: 'JPetStore - Order History', requiresAuth: true },
  },
  // #10 AC5: 注文詳細(所有者限定)。認証必須。
  {
    path: '/account/orders/:orderId',
    name: 'order-detail',
    component: OrderDetailView,
    meta: { title: 'JPetStore - Order Detail', requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(createAuthGuard())

export default router
