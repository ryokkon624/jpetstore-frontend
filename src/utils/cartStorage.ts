// #4 D2/AC3: フロント初のlocalStorage導入。未ログインカートの永続化(未ログイン=クライアント状態保持)。
// stores/auth.tsは非機密な識別情報のみメモリ保持しlocalStorageへ一切書き込まない方針だが、カートは
// 未ログインでも中身を保持する要件(AC3)のため、この用途に限定してlocalStorageを新規に導入する。

export const CART_STORAGE_KEY = 'jps.cart.v1'

export interface StoredCartLine {
  itemId: string
  quantity: number
}

function isStoredCartLine(value: unknown): value is StoredCartLine {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as StoredCartLine).itemId === 'string' &&
    typeof (value as StoredCartLine).quantity === 'number'
  )
}

/** 破損データ(不正JSON・非配列・型不一致の要素)は例外を投げず空/フィルタ済みへフォールバックする。 */
export function loadCart(): StoredCartLine[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (raw === null) {
      return []
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter(isStoredCartLine)
  } catch {
    return []
  }
}

/** localStorageが使えない環境(プライベートブラウジング等の書き込み拒否)でも例外を伝播しない。 */
export function saveCart(lines: StoredCartLine[]): void {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines))
  } catch {
    // noop: 保存できなくても致命的ではない(次回操作時に再試行される)
  }
}

export function clearCart(): void {
  try {
    window.localStorage.removeItem(CART_STORAGE_KEY)
  } catch {
    // noop
  }
}

/**
 * タブ間同期: 他タブでのカート変更(storageイベント)を検知する。同一タブ内の変更ではブラウザ仕様上
 * storageイベントは発火しない(呼び出し元が自タブの変更は自前で反映する前提)。
 */
export function onCartStorageChange(callback: () => void): () => void {
  function handleStorageEvent(event: StorageEvent): void {
    if (event.key === CART_STORAGE_KEY) {
      callback()
    }
  }
  window.addEventListener('storage', handleStorageEvent)
  return () => window.removeEventListener('storage', handleStorageEvent)
}
