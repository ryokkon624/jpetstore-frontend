import { describe, it, expect, vi } from 'vitest'

// #33 AC1/AC-neg1回帰ガード: main.ts のブート順序契約(RED→GREEN)。
// jsdom/Vitestではリロード/直リンク時のVue Router install挙動そのものは完全再現できないため、
// 「app.use(router)がCSRF prime/再水和(fetchCurrentUser)完了より後に実行される」という
// ソースコード構造上の順序契約を軽量に固定する。実機到達性の最終確認はnpm run dev+ブラウザで別途行う。
const { routerMarker, i18nMarker, callOrder } = vi.hoisted(() => ({
  routerMarker: { __marker: 'router' } as unknown,
  i18nMarker: { __marker: 'i18n' } as unknown,
  callOrder: [] as string[],
}))

vi.mock('vue', async () => {
  const actual = await vi.importActual<typeof import('vue')>('vue')
  return {
    ...actual,
    createApp: vi.fn(() => {
      const app = {
        use: vi.fn((plugin: unknown) => {
          if (plugin === routerMarker) callOrder.push('use:router')
          else if (plugin === i18nMarker) callOrder.push('use:i18n')
          else callOrder.push('use:other')
          return app
        }),
        mount: vi.fn(() => {
          callOrder.push('mount')
        }),
      }
      return app
    }),
  }
})

vi.mock('@/router', () => ({ default: routerMarker }))
vi.mock('@/i18n', () => ({ default: i18nMarker }))

vi.mock('@/api/httpClient', () => ({
  primeCsrfToken: vi.fn(async () => {
    callOrder.push('primeCsrfToken')
  }),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    fetchCurrentUser: vi.fn(async () => {
      callOrder.push('fetchCurrentUser')
    }),
  })),
}))

describe('main.ts ブート順序契約(#33)', () => {
  it('app.use(router)はCSRF prime/再水和(fetchCurrentUser)完了より後に実行される', async () => {
    await import('@/main')
    // bootstrap()はトップレベルでfire-and-forgetされるため、内部のPromise.allが解決するまで待つ。
    await new Promise((resolve) => setTimeout(resolve, 0))

    const routerIndex = callOrder.indexOf('use:router')
    const csrfIndex = callOrder.indexOf('primeCsrfToken')
    const fetchIndex = callOrder.indexOf('fetchCurrentUser')
    const mountIndex = callOrder.indexOf('mount')

    expect(csrfIndex).toBeGreaterThan(-1)
    expect(fetchIndex).toBeGreaterThan(-1)
    expect(routerIndex).toBeGreaterThan(-1)
    expect(routerIndex).toBeGreaterThan(csrfIndex)
    expect(routerIndex).toBeGreaterThan(fetchIndex)
    expect(mountIndex).toBeGreaterThan(routerIndex)
  })
})
