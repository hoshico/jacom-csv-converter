# 画像変換ルール

このドキュメントでは、inputCSVからoutputCSVにconvertする際の画像処理ルールについて説明します。

## 概要

convert処理では、以下の2つの画像ソースから画像情報を抽出し、適切な形式で各テーブルに出力します：

1. **サムネイル画像**: `content_articles.csv`の「サムネイル」列
2. **ページ内画像**: `content_articles.csv`の「ページ」列のHTML内の`<img>`タグ

## 出力先テーブル

### 1. content_assets.csv
画像ファイルの物理的な情報を管理するテーブル

**出力されるフィールド**:
- `filename`: 画像ファイル名（ディレクトリパスを含む）
- `mime_type`: MIMEタイプ
- `file_size`: ファイルサイズ
- その他のメタデータ

### 2. content_image_values.csv
画像フィールドの値を管理するテーブル（サムネイル画像用）

**出力されるフィールド**:
- `value`: 画像のURLパス（拡張子なし）

### 3. content_rich_text_values.csv
リッチテキストフィールドの値を管理するテーブル（ページ内画像用）

**出力されるフィールド**:
- `value`: HTMLコンテンツ（画像パスは変換済み）

## 変換ルール

### サムネイル画像

**入力**: `content_articles.csv`の「サムネイル」列
- 例: `shizai/images/cc41e8ae386b9760d8b9638548d5ac91.jpg`

**出力**:
- **content_assets.csv**: `shizai/images/cc41e8ae386b9760d8b9638548d5ac91.jpg`
- **content_image_values.csv**: `https://assets.stg.coreda.biz/jacom/shizai/images/cc41e8ae386b9760d8b9638548d5ac91`

**変換処理**:
1. ディレクトリパスを含むファイル名をそのまま使用
2. 拡張子を除去してURLを生成

### ページ内画像

**入力**: `content_articles.csv`の「ページ」列のHTML内の`<img>`タグ
- 例: `<img src="https://www.jacom.or.jp/shizai/images/abd8089e886ef8795b09d56efb1240cc.jpg">`

**出力**:
- **content_assets.csv**: `shizai/images/abd8089e886ef8795b09d56efb1240cc.jpg`
- **content_rich_text_values.csv**: `<img src="https://assets.stg.coreda.biz/jacom/shizai/images/abd8089e886ef8795b09d56efb1240cc">`

**変換処理**:
1. ベースURLを変換: `https://www.jacom.or.jp/` → `https://assets.stg.coreda.biz/jacom/`
2. 拡張子を除去: `.jpg`、`.jpeg`、`.png`、`.gif`、`.pdf`、`.webp`を削除
3. ディレクトリパスを含むファイル名を抽出してアセット情報を作成

## 処理の流れ

### 1. サムネイル画像の処理
```typescript
// 1. ディレクトリパスを含むファイル名を取得
const fileName = rowKeyValue["サムネイル"]; // shizai/images/cc41e8ae386b9760d8b9638548d5ac91.jpg

// 2. ContentAssetを作成（filenameにディレクトリパスを含む値を設定）
const contentAsset = new ContentAsset({
  filename: fileName, // shizai/images/cc41e8ae386b9760d8b9638548d5ac91.jpg
  // ... その他の情報
});

// 3. content_image_values用のURLを生成（拡張子なし）
const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
const imageUrl = `${POST_ASSET_DOMAIN}/${DISPLAY_ID}/${fileNameWithoutExt}`;
// https://assets.stg.coreda.biz/jacom/shizai/images/cc41e8ae386b9760d8b9638548d5ac91
```

### 2. ページ内画像の処理
```typescript
// 1. HTML内のimgタグを解析
const images = document.querySelectorAll("img");

// 2. 各画像のsrc属性を変換
images.forEach((img) => {
  const src = img.getAttribute("src");
  if (src.startsWith('https://www.jacom.or.jp/')) {
    // ベースURLを変換し拡張子を除去
    const newSrc = src
      .replace('https://www.jacom.or.jp/', 'https://assets.stg.coreda.biz/jacom/')
      .replace(/\.(jpg|jpeg|png|gif|pdf|webp)$/i, '');
    img.setAttribute("src", newSrc);
  }
  
  // 3. ディレクトリパスを含むファイル名を抽出
  const fileName = src.replace('https://www.jacom.or.jp/', '');
  // shizai/images/abd8089e886ef8795b09d56efb1240cc.jpg
  
  // 4. ContentAssetを作成（filenameにディレクトリパスを含む値を設定）
  const contentAsset = new ContentAsset({
    filename: fileName, // shizai/images/abd8089e886ef8795b09d56efb1240cc.jpg
    // ... その他の情報
  });
});
```

## 注意事項

1. **ファイル名の一貫性**: すべての`ContentAsset`でディレクトリパスを含む値を使用
2. **URL変換**: ページ内画像のみベースURLを変換し、サムネイル画像は変換しない
3. **拡張子処理**: `content_image_values.csv`と`content_rich_text_values.csv`では拡張子を除去
4. **アセット管理**: 画像ファイルの物理的な情報は`content_assets.csv`で一元管理

## 設定値

- **POST_ASSET_DOMAIN**: `https://assets.stg.coreda.biz`
- **DISPLAY_ID**: `jacom`
- **ベースURL変換**: `https://www.jacom.or.jp/` → `https://assets.stg.coreda.biz/jacom/`
- **対応拡張子**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.pdf`, `.webp`
