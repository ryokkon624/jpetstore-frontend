import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { request, primeCsrfToken, HttpError } from '@/api/httpClient'

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function clearCookies() {
  document.cookie.split(';').forEach((entry) => {
    const name = entry.split('=')[0]?.trim()
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  })
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/`
}

describe('httpClient', () => {
  beforeEach(() => {
    clearCookies()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('GETリクエストはX-XSRF-TOKENヘッダを付与せず、credentials:includeを指定する', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { status: 'ok' }))
    vi.stubGlobal('fetch', fetchMock)

    await request('/api/ping')

    const [path, init] = fetchMock.mock.calls[0]!
    expect(path).toBe('/api/ping')
    expect((init.headers as Record<string, string>)['X-XSRF-TOKEN']).toBeUndefined()
    expect(init.credentials).toBe('include')
  })

  it('非冪等POSTはCookieのXSRF-TOKEN生値をそのままX-XSRF-TOKENヘッダへ付与する(非XOR・マスクしない)', async () => {
    setCookie('XSRF-TOKEN', 'raw-token-abc')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, {}))
    vi.stubGlobal('fetch', fetchMock)

    await request('/api/auth/logout', { method: 'POST', skipAuthRetry: true })

    const [, init] = fetchMock.mock.calls[0]!
    expect((init.headers as Record<string, string>)['X-XSRF-TOKEN']).toBe('raw-token-abc')
  })

  it('XSRF-TOKEN Cookieが無い状態で非冪等POSTすると、先にGET /api/pingでprimeしてからヘッダへ付与する', async () => {
    const fetchMock = vi.fn().mockImplementation((path: string) => {
      if (path === '/api/ping') {
        setCookie('XSRF-TOKEN', 'primed-token')
        return Promise.resolve(jsonResponse(200, { status: 'ok' }))
      }
      return Promise.resolve(jsonResponse(200, {}))
    })
    vi.stubGlobal('fetch', fetchMock)

    await request('/api/auth/logout', { method: 'POST', skipAuthRetry: true })

    expect(fetchMock.mock.calls[0]![0]).toBe('/api/ping')
    const [, secondInit] = fetchMock.mock.calls[1]!
    expect((secondInit.headers as Record<string, string>)['X-XSRF-TOKEN']).toBe('primed-token')
  })

  it('primeCsrfTokenはGET /api/pingをcredentials:includeで叩く', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { status: 'ok' }))
    vi.stubGlobal('fetch', fetchMock)

    await primeCsrfToken()

    const [path, init] = fetchMock.mock.calls[0]!
    expect(path).toBe('/api/ping')
    expect(init.method).toBe('GET')
    expect(init.credentials).toBe('include')
  })

  it('401応答時にrefreshを1回試みて成功すれば元のリクエストを再試行する', async () => {
    setCookie('XSRF-TOKEN', 'tok')
    let protectedCallCount = 0
    const fetchMock = vi.fn().mockImplementation((path: string) => {
      if (path === '/api/protected') {
        protectedCallCount += 1
        return Promise.resolve(
          protectedCallCount === 1 ? jsonResponse(401, {}) : jsonResponse(200, { data: 'ok' }),
        )
      }
      if (path === '/api/auth/refresh') {
        return Promise.resolve(new Response(null, { status: 204 }))
      }
      throw new Error(`unexpected path: ${path}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await request<{ data: string }>('/api/protected')

    expect(result).toEqual({ data: 'ok' })
    const calledPaths = fetchMock.mock.calls.map((call) => call[0])
    expect(calledPaths).toEqual(['/api/protected', '/api/auth/refresh', '/api/protected'])
  })

  it('401→refreshも失敗したら元の401をエラーとしてthrowし、無限リトライしない', async () => {
    setCookie('XSRF-TOKEN', 'tok')
    const fetchMock = vi.fn().mockImplementation((path: string) => {
      if (path === '/api/protected') return Promise.resolve(jsonResponse(401, {}))
      if (path === '/api/auth/refresh') return Promise.resolve(jsonResponse(401, {}))
      throw new Error(`unexpected path: ${path}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(request('/api/protected')).rejects.toMatchObject({ status: 401 })

    const calledPaths = fetchMock.mock.calls.map((call) => call[0])
    expect(calledPaths).toEqual(['/api/protected', '/api/auth/refresh'])
  })

  it('skipAuthRetry:trueを指定すると401でもrefreshを試みない(ログイン失敗時の誤動作防止)', async () => {
    setCookie('XSRF-TOKEN', 'tok')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(401, { code: 'UNAUTHORIZED' }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      request('/api/auth/login', {
        method: 'POST',
        body: { username: 'x', password: 'wrong' },
        skipAuthRetry: true,
      }),
    ).rejects.toMatchObject({ status: 401 })

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('204 No Contentのレスポンスはundefinedを返す', async () => {
    setCookie('XSRF-TOKEN', 'tok')
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await request('/api/auth/logout', { method: 'POST', skipAuthRetry: true })

    expect(result).toBeUndefined()
  })

  it('HttpErrorはstatusプロパティを保持する', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(500, {}))
    vi.stubGlobal('fetch', fetchMock)

    let capturedError: unknown
    try {
      await request('/api/ping')
    } catch (e) {
      capturedError = e
    }

    expect(capturedError).toBeInstanceOf(HttpError)
    expect((capturedError as HttpError).status).toBe(500)
  })
})
