// AC8 / AC-neg2 / SBD-9: 認証後の復帰先は相対パスのみ許可する（オープンリダイレクト対策）。
// 絶対URL・プロトコル相対(//evil)・バックスラッシュ混在(/\evil, \\evil)・先頭空白は
// すべて拒否し、既定値(既定は '/')へフォールバックする。

const DEFAULT_FALLBACK = '/'

// 単一の '/' で始まり、直後が '/' や '\' でないことを要求する（path-absolute のみ許可）。
// '//evil' や '/\evil' はブラウザによってプロトコル相対URLとして解釈されうるため拒否する。
const RELATIVE_PATH_ONLY = /^\/(?!\/|\\)/

// 先頭が半角スペース(32)または制御文字(0-31, 例: タブ・改行)かどうかを判定する。
// 正規表現の \s クラスに頼らず code point で直接判定する（曖昧な文字クラス表現を避ける）。
function startsWithWhitespaceOrControl(value: string): boolean {
  const codePoint = value.codePointAt(0)
  return codePoint !== undefined && codePoint <= 32
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
  if (startsWithWhitespaceOrControl(target)) {
    return fallback
  }
  if (!RELATIVE_PATH_ONLY.test(target)) {
    return fallback
  }
  return target
}
