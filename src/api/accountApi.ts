// #7 計画フェーズ確定①: プリフィル用の氏名/連絡先/住所を返すread-only APIクライアント。
// /api/account/me は認証必須(backend SecurityConfig無変更)。GETのみのためCSRF不要。
import { request } from '@/api/httpClient'
import type { AccountContact, AccountEditDetail, RegisterPayload } from '@/domain/account'
import type { AuthenticatedUser } from '@/domain/authUser'

interface AccountContactDto {
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

interface RegisterRequestDto {
  username: string
  password: string
  repeatedPassword: string
  email: string
  firstName: string
  lastName: string
  address1: string
  address2: string | null
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

interface AuthUserResponseDto {
  username: string
  roles: string[]
}

interface PasswordChangeRequestDto {
  currentPassword: string
  newPassword: string
}

interface AccountEditDto {
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
  colorSchemePreference: string
  version: number
}

function toDomain(dto: AccountContactDto): AccountContact {
  return {
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    phone: dto.phone,
    address1: dto.address1,
    address2: dto.address2,
    city: dto.city,
    state: dto.state,
    postalCode: dto.postalCode,
    country: dto.country,
  }
}

function toAuthenticatedUser(dto: AuthUserResponseDto): AuthenticatedUser {
  return { username: dto.username, roles: dto.roles }
}

function toAccountEditDetail(dto: AccountEditDto): AccountEditDetail {
  return {
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    phone: dto.phone,
    address1: dto.address1,
    address2: dto.address2,
    city: dto.city,
    state: dto.state,
    postalCode: dto.postalCode,
    country: dto.country,
    languagePreference: dto.languagePreference,
    favoriteCategoryId: dto.favoriteCategoryId,
    colorSchemePreference: dto.colorSchemePreference,
    version: dto.version,
  }
}

/** チェックアウトの配送/請求先プリフィル専用(read-only)。 */
export async function fetchAccountContact(): Promise<AccountContact> {
  const dto = await request<AccountContactDto>('/api/account/me')
  return toDomain(dto)
}

/**
 * #13 AC1/AC3: ユーザー登録。成功すれば自動ログイン済み(fresh JWT・httpOnly Cookie)の状態で
 * {@link AuthenticatedUser}を返す。allowlist(SBD-2)のみ送信し、userid/status/version/WHO列は
 * 一切送らない(サーバ権威)。ログイン失敗と同様、silent refreshは試みない(skipAuthRetry: true)。
 */
export async function registerAccount(payload: RegisterPayload): Promise<AuthenticatedUser> {
  const body: RegisterRequestDto = {
    username: payload.username,
    password: payload.password,
    repeatedPassword: payload.repeatedPassword,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    address1: payload.address1,
    address2: payload.address2 || null,
    city: payload.city,
    state: payload.state,
    postalCode: payload.postalCode,
    country: payload.country,
    phone: payload.phone,
  }
  const dto = await request<AuthUserResponseDto>('/api/register', {
    method: 'POST',
    body,
    skipAuthRetry: true,
  })
  return toAuthenticatedUser(dto)
}

/** #14 AC3/E3: 編集プリフィル用に本人の全編集可フィールドとversionを取得する（{@code /api/account/me}とは別物）。 */
export async function fetchAccount(): Promise<AccountEditDetail> {
  const dto = await request<AccountEditDto>('/api/account')
  return toAccountEditDetail(dto)
}

/**
 * #14 AC1〜AC3: アカウント/プロフィールを更新する。versionをそのまま往復させ（楽観ロックの読込トークン・
 * arch §4.2）、成功すれば更新後の{@link AccountEditDetail}（新しいversion込み）を返す。競合時はbackendが
 * 409を返し、{@code httpClient}が投げる{@code HttpError}を呼び出し側（{@code stores/account.ts}）が捕捉する。
 */
export async function updateAccount(payload: AccountEditDetail): Promise<AccountEditDetail> {
  const body: AccountEditDto = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    address1: payload.address1,
    address2: payload.address2,
    city: payload.city,
    state: payload.state,
    postalCode: payload.postalCode,
    country: payload.country,
    languagePreference: payload.languagePreference,
    favoriteCategoryId: payload.favoriteCategoryId,
    colorSchemePreference: payload.colorSchemePreference,
    version: payload.version,
  }
  const dto = await request<AccountEditDto>('/api/account', { method: 'PUT', body })
  return toAccountEditDetail(dto)
}

/**
 * #15 AC1〜AC2: 現在パスワード再認証つきでパスワードを変更する。allowlist(SBD-2)のみ送信し、
 * userid/username等は一切送らない(サーバ権威・{@code CurrentUserProvider}起点で本人固定)。応答は204
 * (本文なし)。現在PW誤りはbackendが422を返し、{@code httpClient}が投げる{@code HttpError}を
 * 呼び出し側({@code stores/account.ts})が捕捉する。
 */
export async function changePassword(payload: {
  currentPassword: string
  newPassword: string
}): Promise<void> {
  const body: PasswordChangeRequestDto = {
    currentPassword: payload.currentPassword,
    newPassword: payload.newPassword,
  }
  await request<void>('/api/account/password', { method: 'POST', body })
}
