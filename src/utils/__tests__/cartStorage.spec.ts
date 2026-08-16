import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadCart,
  saveCart,
  clearCart,
  onCartStorageChange,
  CART_STORAGE_KEY,
} from '@/utils/cartStorage'

describe('cartStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('未保存の状態でloadCartを呼ぶと空配列を返す', () => {
    expect(loadCart()).toEqual([])
  })

  it('saveCart→loadCartでラウンドトリップできる', () => {
    saveCart([
      { itemId: 'EST-1', quantity: 2 },
      { itemId: 'EST-2', quantity: 1 },
    ])

    expect(loadCart()).toEqual([
      { itemId: 'EST-1', quantity: 2 },
      { itemId: 'EST-2', quantity: 1 },
    ])
  })

  it('clearCartはキーを削除する', () => {
    saveCart([{ itemId: 'EST-1', quantity: 2 }])
    clearCart()

    expect(loadCart()).toEqual([])
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBeNull()
  })

  it('破損したJSONが保存されている場合、loadCartは例外を投げず空配列にフォールバックする', () => {
    window.localStorage.setItem(CART_STORAGE_KEY, '{not valid json')

    expect(loadCart()).toEqual([])
  })

  it('保存値が配列でない場合、loadCartは空配列にフォールバックする', () => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ itemId: 'EST-1' }))

    expect(loadCart()).toEqual([])
  })

  it('配列内に不正な形の要素が混じっている場合、その要素だけを除外する', () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        { itemId: 'EST-1', quantity: 2 },
        { itemId: 'EST-2' }, // quantity欠落
        { quantity: 3 }, // itemId欠落
        'not-an-object',
        { itemId: 'EST-4', quantity: 5 },
      ]),
    )

    expect(loadCart()).toEqual([
      { itemId: 'EST-1', quantity: 2 },
      { itemId: 'EST-4', quantity: 5 },
    ])
  })

  it('localStorage.setItemが例外を投げる環境(プライベートブラウジング等)でもsaveCartは例外を伝播しない', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    expect(() => saveCart([{ itemId: 'EST-1', quantity: 1 }])).not.toThrow()

    spy.mockRestore()
  })

  it('onCartStorageChangeは同じキーのstorageイベントでコールバックを呼ぶ(タブ間同期)', () => {
    const callback = vi.fn()
    const unsubscribe = onCartStorageChange(callback)

    window.dispatchEvent(new StorageEvent('storage', { key: CART_STORAGE_KEY }))

    expect(callback).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('onCartStorageChangeは別のキーのstorageイベントでは呼ばれない', () => {
    const callback = vi.fn()
    const unsubscribe = onCartStorageChange(callback)

    window.dispatchEvent(new StorageEvent('storage', { key: 'some.other.key' }))

    expect(callback).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('unsubscribeを呼ぶと以降storageイベントを受け取らない', () => {
    const callback = vi.fn()
    const unsubscribe = onCartStorageChange(callback)
    unsubscribe()

    window.dispatchEvent(new StorageEvent('storage', { key: CART_STORAGE_KEY }))

    expect(callback).not.toHaveBeenCalled()
  })
})
