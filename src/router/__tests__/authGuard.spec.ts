import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'
import { createAuthGuard, SIGNON_ROUTE_NAME } from '@/router/authGuard'
import { useAuthStore } from '@/stores/auth'

function fakeRoute(overrides: Partial<RouteLocationNormalized>): RouteLocationNormalized {
  return {
    fullPath: '/protected',
    path: '/protected',
    name: 'protected',
    params: {},
    query: {},
    hash: '',
    matched: [],
    meta: {},
    redirectedFrom: undefined,
    ...overrides,
  } as RouteLocationNormalized
}

describe('createAuthGuard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('meta.requiresAuth=trueかつ未認証の場合、元URL(to.fullPath)をredirectクエリに載せてsignonへ誘導する(AC8)', () => {
    const guard = createAuthGuard()
    const to = fakeRoute({ fullPath: '/account/orders?page=2', meta: { requiresAuth: true } })

    const result = guard(to, fakeRoute({}), () => undefined)

    expect(result).toEqual({
      name: SIGNON_ROUTE_NAME,
      query: { redirect: '/account/orders?page=2' },
    })
  })

  it('meta.requiresAuth=trueかつ認証済みの場合、遷移を許可する(true)', () => {
    const authStore = useAuthStore()
    authStore.$patch({ user: { username: 'j2ee', roles: ['USER'] } })
    const guard = createAuthGuard()
    const to = fakeRoute({ meta: { requiresAuth: true } })

    const result = guard(to, fakeRoute({}), () => undefined)

    expect(result).toBe(true)
  })

  it('meta.requiresAuthが未設定の場合、未認証でも遷移を許可する(公開ルート)', () => {
    const guard = createAuthGuard()
    const to = fakeRoute({ meta: {} })

    const result = guard(to, fakeRoute({}), () => undefined)

    expect(result).toBe(true)
  })

  it('meta.requiresAuth=falseの場合、未認証でも遷移を許可する', () => {
    const guard = createAuthGuard()
    const to = fakeRoute({ meta: { requiresAuth: false } })

    const result = guard(to, fakeRoute({}), () => undefined)

    expect(result).toBe(true)
  })
})
