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

/**
 * #14 AC3/E3: アカウント/プロフィール編集の読取/更新に共通の形。GET応答・PUT要求とも同じ形（全項目を毎回
 * 送る単純な置換更新のためpartial型にしない）。username/status/WHO列は持たない（サーバ権威・編集画面に
 * 出さない）。楽観ロックの往復に必要な{@link #version}を持つ。
 *
 * <p>{@link Address}を継承しない: {@link Address}は{@code AddressForm}が束縛するフォーム値のため
 * {@code address2}が常に{@code string}（空文字許容）だが、本型はサーバから読み取った値（{@link
 * AccountContact}と同様、未設定は{@code null}）を表すため{@code address2: string | null}にする必要があり、
 * 継承すると型が矛盾する。View側で{@code AddressForm}に渡す際は明示的に変換する（{@code
 * AccountEditView.vue}参照）。
 */
export interface AccountEditDetail {
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
  languagePreference: string
  favoriteCategoryId: string | null
  /** #36 AC5/AC7: テーマ配色設定('system'/'light'/'dark'・DB値そのまま)。 */
  colorSchemePreference: string
  version: number
}
