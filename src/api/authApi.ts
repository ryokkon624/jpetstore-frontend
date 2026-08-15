import { request } from '@/api/httpClient'
import type { AuthenticatedUser } from '@/domain/authUser'

interface AuthUserResponseDto {
  username: string
  roles: string[]
}

interface LoginRequestDto {
  username: string
  password: string
}

function toDomain(dto: AuthUserResponseDto): AuthenticatedUser {
  return { username: dto.username, roles: dto.roles }
}

/**
 * AC7: username/password を照合する。失敗（誤資格情報）は一律 401 のため、silent refresh は
 * 試みない（skipAuthRetry: true。ログイン失敗を「アクセストークン失効」と誤認しない）。
 */
export async function login(username: string, password: string): Promise<AuthenticatedUser> {
  const body: LoginRequestDto = { username, password }
  const dto = await request<AuthUserResponseDto>('/api/auth/login', {
    method: 'POST',
    body,
    skipAuthRetry: true,
  })
  return toDomain(dto)
}

/** ログアウトは credential 不要（backend 契約）。失敗しても呼び出し側で状態をクリアしてよい。 */
export async function logout(): Promise<void> {
  await request<void>('/api/auth/logout', { method: 'POST', skipAuthRetry: true })
}

/** #24 論点①: リロード後の identity 再水和用。未認証は httpClient が投げる HttpError(401) を呼び出し側で捕捉する。 */
export async function fetchCurrentUser(): Promise<AuthenticatedUser> {
  const dto = await request<AuthUserResponseDto>('/api/auth/me')
  return toDomain(dto)
}
