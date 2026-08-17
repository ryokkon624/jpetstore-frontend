// #7 計画フェーズ確定①: プリフィル用の氏名/連絡先/住所を返すread-only APIクライアント。
// /api/account/me は認証必須(backend SecurityConfig無変更)。GETのみのためCSRF不要。
import { request } from '@/api/httpClient'
import type { AccountContact, RegisterPayload } from '@/domain/account'
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
