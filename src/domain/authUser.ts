/** フロントエンド用の認証済みユーザードメインモデル（AC7）。 */
export interface AuthenticatedUser {
  username: string
  roles: string[]
}
