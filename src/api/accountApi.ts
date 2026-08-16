// #7 計画フェーズ確定①: プリフィル用の氏名/連絡先/住所を返すread-only APIクライアント。
// /api/account/me は認証必須(backend SecurityConfig無変更)。GETのみのためCSRF不要。
import { request } from '@/api/httpClient'
import type { AccountContact } from '@/domain/account'

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

/** チェックアウトの配送/請求先プリフィル専用(read-only)。 */
export async function fetchAccountContact(): Promise<AccountContact> {
  const dto = await request<AccountContactDto>('/api/account/me')
  return toDomain(dto)
}
