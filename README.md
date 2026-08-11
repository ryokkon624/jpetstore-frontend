# jpetstore-frontend

モダン版 **JPetStore**（ペットショップ EC）の Vue 3 SPA フロントエンド。

## 役割

- REST API (`/api`) 前提の SPA。バックエンド（`jpetstore-backend`）は開発時 `http://localhost:8080` で動く想定。
- この時点では**トップ画面(Home)の雛形のみ**。商品一覧・カート・注文などのドメイン画面は今後 DEV が実装する。

## 技術スタック

| 項目             | 採用                                    |
| ---------------- | --------------------------------------- |
| フレームワーク   | Vue 3 (`<script setup>` / Composition)  |
| 言語             | TypeScript                              |
| 状態管理         | Pinia                                   |
| ルーティング     | Vue Router 4                            |
| ビルド/Dev       | Vite                                    |
| テスト           | Vitest + @vue/test-utils (jsdom)        |

移植元の技術構成は `hw-hub-frontend` に準拠している。

## セットアップ

```bash
npm install
npm run dev      # 開発サーバ（既定 http://localhost:5173）
```

その他のスクリプト:

```bash
npm run build       # 型チェック + 本番ビルド
npm run preview     # ビルド成果物のプレビュー
npm run type-check  # 型チェックのみ
npm run test        # ユニットテスト（Vitest）
```

## API プロキシ

`vite.config.ts` の dev proxy で `/api` を `http://localhost:8080` へ転送する。
フロントは相対パス `/api/...` でバックエンドを叩けばよい（CORS 回避）。

## 区分値（enum / 区分値TS定数）

区分値の定数は**フロントで手書きしない**。`jpetstore-database` の `generateEnums`
が出力する `code.constants.ts` を `src/constants/` に取り込んで使う。
詳細は [`src/constants/README.md`](src/constants/README.md) を参照。

## デザイン

- デザインは `src/assets/main.css` の **CSS カスタムプロパティ（`--jps-*`）** ベース。
  パレットはテラコッタ (`--jps-primary` `#c0532a`) × セージ (`--jps-accent` `#3f8a6e`)
  × クリーム面 (`--jps-surface` `#fbf8f4`)。ライト/ダーク両対応（OS 追従 + `html.dark` / `html.light` で上書き）。
- `main.css` には `@layer utilities` / `@layer components` で `.jps-btn` `.jps-badge`
  `.jps-card` 等のクラスも定義済み。
- **Tailwind v4 を導入済み**（HwHub と同構成の CSS-first セットアップ）。
  `@tailwindcss/vite` プラグインを `vite.config.ts` に組み込み、`main.css` の
  1 行目で `@import 'tailwindcss';` を読み込む。`tailwind.config.js` は content glob と
  空の `theme.extend` のみの最小構成（`@tailwindcss/line-clamp` は v4 標準搭載のため不採用）。

## ディレクトリ構成

```
src/
  assets/       main.css（デザイントークン）, logo.svg, hero.png
  constants/    区分値TS定数（generateEnums の成果物）の取り込み先
  router/       Vue Router 定義（/ → Home）
  stores/       Pinia ストア（今後追加）
  views/        画面（現状 HomeView のみ）
```
