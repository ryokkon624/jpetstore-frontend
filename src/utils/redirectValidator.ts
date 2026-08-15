// AC8 / AC-neg2 / SBD-9: 認証後の復帰先は相対パスのみ許可する（オープンリダイレクト対策）。
// 絶対URL・プロトコル相対(//evil)・バックスラッシュ混在(/\evil, \\evil)・先頭空白・
// C0制御文字混入(タブ/CR/LF等)はすべて拒否し、既定値(既定は '/')へフォールバックする。

const DEFAULT_FALLBACK = '/'
const LEADING_SPACE_CODE_POINT = 0x20
// C0 制御文字の上限コードポイント(0x1F)。0x00-0x1F にはタブ・CR・LF 等が含まれる。
// WHATWG URL パーサは位置に関わらずこれらを除去して正規化するため、先頭以外
// (例: '/\t/evil.com')に混入していてもプロトコル相対URL化などのバイパスに
// 使われうる（レビュー指摘・#24）。文字列全体を対象に判定する。
const MAX_CONTROL_CHARACTER_CODE_POINT = 0x1f

// 単一の '/' で始まり、直後が '/' や '\' でないことを要求する（path-absolute のみ許可）。
// '//evil' や '/\evil' はブラウザによってプロトコル相対URLとして解釈されうるため拒否する。
const RELATIVE_PATH_ONLY = /^\/(?!\/|\\)/

// 正規表現の文字クラス表現に頼らず、code point を1文字ずつ走査して C0 制御文字の
// 混入を判定する（曖昧な文字クラス表現を避ける）。
function containsControlCharacter(value: string): boolean {
  for (const char of value) {
    const codePoint = char.codePointAt(0)
    if (codePoint !== undefined && codePoint <= MAX_CONTROL_CHARACTER_CODE_POINT) {
      return true
    }
  }
  return false
}

// 先頭が半角スペース(0x20)、または文字列中のどこかに C0 制御文字が含まれるかを判定する。
function hasLeadingSpaceOrControlCharacter(value: string): boolean {
  if (value.codePointAt(0) === LEADING_SPACE_CODE_POINT) {
    return true
  }
  return containsControlCharacter(value)
}

/**
 * 復帰先候補（クエリパラメータ等の未信頼な入力）を検証し、相対パスであればそのまま返す。
 * 相対パスでなければ fallback（既定 '/'）を返す。
 */
export function sanitizeRedirectTarget(
  target: unknown,
  fallback: string = DEFAULT_FALLBACK,
): string {
  if (typeof target !== 'string' || target.length === 0) {
    return fallback
  }
  if (hasLeadingSpaceOrControlCharacter(target)) {
    return fallback
  }
  if (!RELATIVE_PATH_ONLY.test(target)) {
    return fallback
  }
  return target
}
