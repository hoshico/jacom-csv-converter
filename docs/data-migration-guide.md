# データ移行手順

## 概要
PowerCMSからダウンロードしたCSVデータをCoreData形式に変換するための手順書です。

## 手順

### 1. CSVファイルのマージ
PowerCMSからダウンロードした半年分のCSVファイルをmergeディレクトリ内でマージします。

### 2. ファイルの配置
- マージされたCSVファイルの名称を`content_articles.csv`に変更
- `inputCSV`ディレクトリ配下に格納
- 注意: `inputCSV`には他のファイルも存在する（後々`config`ディレクトリなどを作成して移動予定）

### 3. スクリプトの実行
```bash
npm run convert
```

## 注意事項
- 入力CSVファイルはShift_JISエンコーディングである必要があります
- 出力CSVファイルはUTF-8エンコーディングで生成されます
- 変換処理中にエラーが発生した場合は、ログを確認してください

## 関連ファイル
- 入力CSV: `csv/inputCSV/content_articles.csv`
- 出力CSV: `csv/outputCSV/`配下の各種CSVファイル
- 変換スクリプト: `csv/csv_to_coreda_data.ts`
