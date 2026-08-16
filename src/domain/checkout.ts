// #7 計画フェーズ確定③: チェックアウト・ウィザードの下書き(揮発・Piniaメモリ保持のみ)のドメイン型。
// サーバ権威は確定時(#8)に集約するため、backendに下書きテーブルは持たない。

/** 配送/請求先1件分。billing/shippingで共通の形にし、プリフィル(AccountContact)からの変換を単純化する。 */
export interface Address {
  firstName: string
  lastName: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  state: string
  postalCode: string
  country: string
}

export function emptyAddress(): Address {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  }
}

/** ウィザードの内部ステップ(単一ルート/checkout・計画フェーズ確定④)。 */
export type CheckoutStep = 'cart' | 'address' | 'confirm'

export const CHECKOUT_STEP_ORDER: readonly CheckoutStep[] = ['cart', 'address', 'confirm']
