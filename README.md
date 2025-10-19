# JACOM CSV Converter

PowerCMSからダウンロードしたCSVデータをCoreData形式に変換するためのツールです。

## 概要

このプロジェクトは、農協時報（JACOM）のPowerCMSからエクスポートしたCSVデータを、CoreData形式のCSVファイルに変換するためのNode.jsアプリケーションです。

## 機能

- PowerCMSのCSVデータをCoreData形式に変換
- 記事、人材情報、病害虫情報のデータ変換
- 画像ファイルの処理と変換
- 複数のCSVファイルのマージ機能

## プロジェクト構成

```
jacom-csv-converter/
├── csv/
│   ├── inputCSV/          # 入力CSVファイル
│   ├── outputCSV/         # 出力CSVファイル（生成される）
│   ├── outputImage/       # 出力画像ファイル（生成される）
│   ├── merge/             # CSVマージ機能
│   │   ├── input/         # マージ用入力ファイル
│   │   └── output/        # マージ結果（生成される）
│   ├── constants.ts       # 定数定義
│   ├── csv_to_coreda_data.ts  # メイン変換スクリプト
│   ├── services.ts        # サービス関数
│   ├── types.ts           # 型定義
│   └── utils.ts           # ユーティリティ関数
├── common/                # 共通ユーティリティ
├── docs/                  # ドキュメント
└── package.json
```

## セットアップ

### 必要な環境

- Node.js 20.19.0以上
- npm 10.8.2以上

### インストール

```bash
npm install
```

## 使用方法

### 1. PowerCMSのCSVファイルをマージ

PowerCMSからダウンロードしたCSVファイルをマージします。

1. **CSVファイルの配置**
   ```
   csv/merge/input/
   ├── 2024_上半期.csv
   ├── 2024_下半期.csv
   └── 2025.csv
   ```

2. **マージ処理の実行**
   ```bash
   npm run merge
   ```

3. **マージ結果の確認**
   ```
   csv/merge/output/
   ├── content_articles.csv      # 記事コンテンツ
   ├── content_humanresources.csv # 人事コンテンツ
   └── content_pestinfos.csv     # 病害虫コンテンツ
   ```

### 2. マージ結果をinputCSVに配置

マージで生成されたファイルを`inputCSV`ディレクトリに配置します。

```
csv/inputCSV/
├── content_articles.csv      # マージ結果から移動
├── content_humanresources.csv # マージ結果から移動
├── content_pestinfos.csv     # マージ結果から移動
├── category_authors.csv      # カテゴリ用CSV
├── category_categories.csv   # カテゴリ用CSV
├── category_crops.csv        # カテゴリ用CSV
├── category_prefectures.csv  # カテゴリ用CSV
├── category_series.csv       # カテゴリ用CSV
└── category_topics.csv       # カテゴリ用CSV
```

### 3. CoreData形式への変換

```bash
npm run convert
```

変換処理により`csv/outputCSV/`ディレクトリにCoreData用の分割されたCSVファイルが生成されます。

## 入力ファイル

### マージ処理（npm run merge）

- `csv/merge/input/*.csv` - PowerCMSからダウンロードしたCSVファイル

### 変換処理（npm run convert）

- `csv/inputCSV/content_articles.csv` - 記事データ
- `csv/inputCSV/content_pestinfos.csv` - 病害虫情報データ
- `csv/inputCSV/content_humanresources.csv` - 人材データ
- `csv/inputCSV/category_*.csv` - カテゴリデータ

## 出力ファイル

### マージ処理の出力

- `csv/merge/output/content_articles.csv` - 記事コンテンツ
- `csv/merge/output/content_humanresources.csv` - 人事コンテンツ
- `csv/merge/output/content_pestinfos.csv` - 病害虫コンテンツ

### 変換処理の出力

- `csv/outputCSV/` - CoreData用の分割されたCSVファイル群

## 注意事項

- 入力CSVファイルはShift_JISエンコーディングである必要があります
- 出力CSVファイルはUTF-8エンコーディングで生成されます
- 変換処理中にエラーが発生した場合は、ログを確認してください

## 開発

### スクリプト

- `npm run convert` - メインの変換処理
- `npm run new` - 新しい変換処理
- `npm run merge` - CSVマージ処理

### 依存関係

- TypeScript
- papaparse（CSV解析）
- iconv-lite（文字エンコーディング変換）
- jsdom（HTML解析）
- uuid（ID生成）

## ライセンス

ISC

## 作者

JACOM CSV Converter Team
