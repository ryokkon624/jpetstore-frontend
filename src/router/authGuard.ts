import type { NavigationGuard } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/** AC8: 保護ルート要求 → 未認証ならこのルート名へ誘導する。 */
export const SIGNON_ROUTE_NAME = 'signon'

/**
 * AC8: `meta.requiresAuth` が true のルートに未認証でアクセスすると signon へ誘導し、
 * 要求元の URL（`to.fullPath`）を `redirect` クエリへ退避する。認証後に SignonView が
 * この値を {@link sanitizeRedirectTarget}（相対パスのみ許可）で検証してから復帰させる。
 */
export function createAuthGuard(): NavigationGuard {
  return (to) => {
    const authStore = useAuthStore()
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return { name: SIGNON_ROUTE_NAME, query: { redirect: to.fullPath } }
    }
    return true
  }
}
