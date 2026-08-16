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
