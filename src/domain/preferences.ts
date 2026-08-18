/**
 * #36/#25: ユーザー設定（テーマ配色・表示言語）の共有ドメイン型。`usePreferencesStore`（Pinia単一ソース）が
 * 保持するcanonical値。
 *
 * <p>DBの実際の格納値（テーマは'system'/'light'/'dark'のままpass-through、言語は'english'/'japanese'）とは
 * API境界（{@code accountApi}/{@code authApi}）でのみ相互変換する（{@code utils/preferencesMapping.ts}参照）。
 */
export type ColorScheme = 'system' | 'light' | 'dark'
export type Language = 'en' | 'ja'
