import type { Address } from '@/domain/checkout'

// #7 計画フェーズ確定①: チェックアウトの配送/請求先プリフィル専用ドメイン型。
// backendのAccountController(GET /api/account/me)のレスポンスと対応する。
// read-onlyに厳格限定(username/status/version/WHO列・カード列は持たない。E4/F4.2編集側・#8送信/在庫を先取りしない)。
export interface AccountContact {
  firstName: string
  lastName: string
  email: string
  phone: string
  address1: string
  address2: string | null
  city: string
  state: string
  postalCode: string
  country: string
}

/**
 * #13 AC1: ユーザー登録リクエストのペイロード。氏名/連絡先/住所は{@link Address}(AddressFormが束縛する形)を
 * そのまま再利用し、username/password/repeatedPasswordを加えたもの(SBD-2アローリスト。userid/status/version/
 * WHO列はサーバ権威のため持たない)。langpref/favcategoryは登録フォームに入力欄を持たない(E5)。
 */
export interface RegisterPayload extends Address {
  username: string
  password: string
  repeatedPassword: string
}
