import { request } from '@/api/httpClient'
import type { AuthenticatedUser } from '@/domain/authUser'

interface LoginRequestDto {
  username: string
  password: string
}

/**
 * #36/#25: backendの`AuthController.LoginResponse`と対応する（/login・/meが共有する単一DTO）。
 * `colorSchemePreference`は'system'/'light'/'dark'のpass-through、`languagePreference`はDB値
 * ('english'/'japanese')そのまま返る（canonical値('en'/'ja')への変換はAPI境界=呼び出し側で行う）。
 */
interface LoginResponseDto {
  username: string
  roles: string[]
  colorSchemePreference: string
  languagePreference: string
}

/** #36/#25: ユーザー本体とDB権威の設定値をまとめて返す（`stores/auth.ts`が`preferences`をhydrateFromDbへ渡す）。 */
export interface AuthResult {
  user: AuthenticatedUser
  preferences: {
    colorSchemePreference: string
    languagePreference: string
  }
}

function toDomain(dto: LoginResponseDto): AuthResult {
  return {
    user: { username: dto.username, roles: dto.roles },
    preferences: {
      colorSchemePreference: dto.colorSchemePreference,
      languagePreference: dto.languagePreference,
    },
  }
}

/**
 * AC7: username/password を照合する。失敗（誤資格情報）は一律 401 のため、silent refresh は
 * 試みない（skipAuthRetry: true。ログイン失敗を「アクセストークン失効」と誤認しない）。
 */
export async function login(username: string, password: string): Promise<AuthResult> {
  const body: LoginRequestDto = { username, password }
  const dto = await request<LoginResponseDto>('/api/auth/login', {
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
export async function fetchCurrentUser(): Promise<AuthResult> {
  const dto = await request<LoginResponseDto>('/api/auth/me')
  return toDomain(dto)
}
