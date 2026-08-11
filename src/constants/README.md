# src/constants — 区分値TS定数の取り込み先

このディレクトリには、**`jpetstore-database` の `generateEnums` が出力する区分値定数**を取り込む。

## 取り込み方針

- データベースリポジトリの `generateEnums` タスクが `code.constants.ts` を生成する。
- 生成された `code.constants.ts` をこのディレクトリ（`src/constants/`）へコピーして取り込む。
- **このファイルは手で編集しない**（区分値の唯一の情報源はデータベース側。再生成のたびに上書きする）。
- import は alias 経由で行う。例:

  ```ts
  import { ORDER_STATUS, type OrderStatusCode } from '@/constants/code.constants'
  ```

## 現状

まだ `code.constants.ts` は取り込んでいない（プレースホルダ）。
`jpetstore-database` 側で `generateEnums` が用意され次第、その成果物をここへ配置する。
