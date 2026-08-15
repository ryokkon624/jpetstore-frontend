// AC5/AC7: トークンは httpOnly Cookie が保持する（フロントは JS で触れない）。
// ここで扱う XSRF-TOKEN Cookie は CSRF 対策用であり認証トークンではない（backend は
// httpOnly=false で発行・非XORの CsrfTokenRequestAttributeHandler を採用。cookie-to-header
// パターンのため生値をそのままヘッダへ載せる。マスク処理は実装しない）。

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  /** true の場合、401 を受けても silent refresh を試みない（例: ログイン失敗の誤資格情報）。 */
  skipAuthRetry?: boolean
}

export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

const NON_IDEMPOTENT_METHODS: ReadonlySet<HttpMethod> = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const CSRF_COOKIE_NAME = 'XSRF-TOKEN'
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN'

function readCsrfCookie(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE_NAME}=([^;]*)`))
  return match ? decodeURIComponent(match[1] ?? '') : null
}

/** CSRF Cookie(XSRF-TOKEN)をサーバーに発行させるための疎通呼び出し。 */
export async function primeCsrfToken(): Promise<void> {
  await fetch('/api/ping', { method: 'GET', credentials: 'include' })
}

async function rawFetch(path: string, options: RequestOptions): Promise<Response> {
  const method = options.method ?? 'GET'
  const headers: Record<string, string> = {}

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (NON_IDEMPOTENT_METHODS.has(method)) {
    let token = readCsrfCookie()
    if (token === null) {
      // consume-then-regenerate: 直前の状態変更で XSRF-TOKEN Cookie が失効している場合、
      // 次の GET で再発行されるまで新しい値が取れない。送信前に prime し直す。
      await primeCsrfToken()
      token = readCsrfCookie()
    }
    if (token !== null) {
      headers[CSRF_HEADER_NAME] = token
    }
  }

  return fetch(path, {
    method,
    credentials: 'include',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })
}

async function tryRefresh(): Promise<boolean> {
  const response = await rawFetch('/api/auth/refresh', { method: 'POST', skipAuthRetry: true })
  return response.ok
}

/** AC7: API クライアント。401 は silent refresh を1回だけ試みてから元のリクエストを再試行する。 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await rawFetch(path, options)

  if (response.status === 401 && !options.skipAuthRetry) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      response = await rawFetch(path, options)
    }
  }

  if (!response.ok) {
    throw new HttpError(
      response.status,
      `Request failed: ${options.method ?? 'GET'} ${path} (${response.status})`,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}
