import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import * as iconv from 'iconv-lite';

interface InputCSVRow {
  id: string;
  title: string;
  text: string;
  'field.ja_description': string;
  'field.kanri_filename': string;
  asset: string;
  category?: string;
  tags?: string;
  authored_on?: string;
  'field.ja_list_image'?: string;
}

interface OutputCSVRow {
  ID: string;
  タイトル: string;
  カテゴリ: string;
  トピック: string;
  シリーズ: string;
  筆者: string;
  サムネイル: string;
  記事本文へのサムネイル表示について: string;
  概要: string;
  内容: string;
  ページ: string;
  ファイル名: string;
}

// トピック情報のインターフェース
interface TopicInfo {
  slug: string;
  nameChange?: string;
  largeCategory: string;
  mediumCategory: string;
}

// トピックマッピングテーブル
const TOPIC_MAPPING: { [key: string]: TopicInfo } = {
  'JAの活動': { slug: 'ja-tsushin', nameChange: 'JA通信', largeCategory: 'JA', mediumCategory: 'その他JAの活動' },
  'ＪＡ全国大会': { slug: 'ja-national-meeting', largeCategory: 'JA', mediumCategory: 'その他JAの活動' },
  'ＴＡＣ': { slug: 'tac', largeCategory: 'JA', mediumCategory: '営農経済' },
  '一品厳選': { slug: 'ippin-gensen', largeCategory: 'JA', mediumCategory: '営農経済' },
  '仮渡金(概算金)': { slug: 'karitokin', largeCategory: 'JA', mediumCategory: '金融共済' },
  '国消国産': { slug: 'kokusho-kokusan', largeCategory: 'JA', mediumCategory: 'その他JAの活動' },
  '事業承継': { slug: 'jigyo-shokei', largeCategory: 'JA', mediumCategory: 'JAの人事' },
  '農協人文化賞': { slug: 'nokyo-bunka-award', largeCategory: 'JA', mediumCategory: 'JAの人事' },
  '殺菌剤': { slug: 'sakkinzai', largeCategory: 'メーカー', mediumCategory: '農薬' },
  '殺虫剤': { slug: 'sacchuzai', largeCategory: 'メーカー', mediumCategory: '農薬' },
  '除草剤': { slug: 'josozai', largeCategory: 'メーカー', mediumCategory: '農薬' },
  '肥料': { slug: 'hiryo', largeCategory: 'メーカー', mediumCategory: 'その他生産資材' },
  '2021水田農業対策': { slug: 'suiden-katsuyo', nameChange: '水田活用', largeCategory: '食と流通', mediumCategory: '流通' },
  '水田農業対策': { slug: 'suiden-katsuyo', nameChange: '水田活用', largeCategory: '食と流通', mediumCategory: '流通' },
  'フードロス': { slug: 'food-loss', largeCategory: '食と流通', mediumCategory: '食品' },
  'Z-GIS': { slug: 'z-gis', largeCategory: '農業技術', mediumCategory: '栽培技術' },
  'ドローン': { slug: 'smart-agriculture', nameChange: 'スマート農業', largeCategory: '農業技術', mediumCategory: '栽培技術' },
  '精密農業': { slug: 'smart-agriculture', nameChange: 'スマート農業', largeCategory: '農業技術', mediumCategory: '栽培技術' },
  'GAP': { slug: 'gap', largeCategory: '農業技術', mediumCategory: '栽培技術' },
  'Z－ＧＩＳ': { slug: 'z-gis', nameChange: 'Z-GIS', largeCategory: '農業技術', mediumCategory: '栽培技術' },
  'スマート農業': { slug: 'smart-agriculture', largeCategory: '農業技術', mediumCategory: '栽培技術' },
  'バイオスティミュラント': { slug: 'biostimulant', largeCategory: '農業技術', mediumCategory: '栽培技術' },
  '病害虫': { slug: 'byogaichu', largeCategory: '農業技術', mediumCategory: '病害虫対策' },
  '病害虫発生情報': { slug: 'byogaichu-johou', largeCategory: '農業技術', mediumCategory: '病害虫対策' },
  '病害虫発生予報': { slug: 'byogaichu-yohou', largeCategory: '農業技術', mediumCategory: '病害虫対策' },
  '病害虫防除': { slug: 'byogaichu-bojo', largeCategory: '農業技術', mediumCategory: '病害虫対策' },
  'SDGS': { slug: 'sdgs', nameChange: 'SDGs', largeCategory: '農政', mediumCategory: 'その他官公庁' },
  'ＡＳＦ（アフリカ豚熱）': { slug: 'asf', largeCategory: '農政', mediumCategory: '畜産酪農' },
  'ＣＳＦ（豚熱）': { slug: 'csf', largeCategory: '農政', mediumCategory: '畜産酪農' },
  'GI': { slug: 'gi', largeCategory: '農政', mediumCategory: '農水省' },
  'HACCP': { slug: 'haccp', largeCategory: '農政', mediumCategory: 'その他官公庁' },
  'SDGs': { slug: 'sdgs', largeCategory: '農政', mediumCategory: 'その他官公庁' },
  'みどり戦略': { slug: 'midori-senryaku', largeCategory: '農政', mediumCategory: '農水省' },
  '花き': { slug: 'kaki', largeCategory: '農政', mediumCategory: '青果物' },
  '海外ニュース': { slug: 'overseas-news', largeCategory: '農政', mediumCategory: '地域情報' },
  '基本計画': { slug: 'kihon-keikaku', largeCategory: '農政', mediumCategory: '農水省' },
  '基本法': { slug: 'kihon-ho', largeCategory: '農政', mediumCategory: '農水省' },
  '国際協同組合年': { slug: 'international-cooperative-year', largeCategory: '農政', mediumCategory: 'その他官公庁' },
  '食料安保': { slug: 'shokuryo-anpo', largeCategory: '農政', mediumCategory: '農水省' },
  '食料危機': { slug: 'shokuryo-kiki', largeCategory: '農政', mediumCategory: '農水省' },
  '新規就農者支援': { slug: 'shinki-shuno-shien', largeCategory: '農政', mediumCategory: '農水省' },
  '水稲': { slug: 'suito', largeCategory: '農政', mediumCategory: '米' },
  '水田': { slug: 'suiden', largeCategory: '農政', mediumCategory: '米' },
  '水田活用': { slug: 'suiden-katsuyo', largeCategory: '農政', mediumCategory: '米' },
  '政府備蓄米': { slug: 'seifu-bichikumai', largeCategory: '農政', mediumCategory: '米' },
  '鳥インフルエンザ': { slug: 'bird-influenza', largeCategory: '農政', mediumCategory: '畜産酪農' },
  '都市農業': { slug: 'toshi-nogyo', largeCategory: '農政', mediumCategory: '地域情報' },
  '農泊': { slug: 'nohaku', largeCategory: '農政', mediumCategory: '地域情報' },
  '農福連携': { slug: 'nofuku-renkei', largeCategory: '農政', mediumCategory: '地域情報' },
  '備蓄米放出': { slug: 'bichikumai-hoshutsu', largeCategory: '農政', mediumCategory: '米' },
  '米の作柄': { slug: 'kome-sakugara', largeCategory: '農政', mediumCategory: '米' },
  '米の食味ランキング': { slug: 'kome-ranking', largeCategory: '農政', mediumCategory: '米' },
  '米価': { slug: 'beika', largeCategory: '農政', mediumCategory: '米' }
};

// 有効なタグリスト（削除対象外）
const VALID_TAGS = new Set([
  'JAの活動',
  'ＪＡ全国大会',
  'ＴＡＣ',
  '一品厳選',
  '仮渡金(概算金)',
  '国消国産',
  '事業承継',
  '農協人文化賞',
  '殺菌剤',
  '殺虫剤',
  '除草剤',
  '肥料',
  '2021水田農業対策',
  '水田農業対策',
  'フードロス',
  'Z-GIS',
  'ドローン',
  '精密農業',
  'GAP',
  'Z－ＧＩＳ',
  'スマート農業',
  'バイオスティミュラント',
  '病害虫',
  '病害虫発生情報',
  '病害虫発生予報',
  '病害虫防除',
  'SDGS',
  'ＡＳＦ（アフリカ豚熱）',
  'ＣＳＦ（豚熱）',
  'GI',
  'HACCP',
  'SDGs',
  'みどり戦略',
  '花き',
  '海外ニュース',
  '基本計画',
  '基本法',
  '国際協同組合年',
  '食料安保',
  '食料危機',
  '新規就農者支援',
  '水稲',
  '水田',
  '水田活用',
  '政府備蓄米',
  '鳥インフルエンザ',
  '都市農業',
  '農泊',
  '農福連携',
  '備蓄米放出',
  '米の作柄',
  '米の食味ランキング',
  '米価',
  'ＪＡ共済連・県本部',
  '新世紀ＪＡ研究会',
  'ＪＡ全農・県本部',
  '全農・県本部',
  '日本農業新聞',
  'ＪＡグループ',
  '中央畜産会',
  '全農子会社',
  '家の光協会',
  '文化厚生連',
  '農協研究会',
  '農薬工業会',
  'ＪＡ共済連',
  'ＪＡ女性協',
  'ＪＡ青年協',
  '日本公庫',
  '農協協会',
  '農林中金',
  '農林年金',
  '農研機構',
  'Ｊミルク',
  'ＪＡ全中',
  'ＪＡ全農',
  'ＪＡ共済',
  '全厚連',
  '全青協',
  '共済連',
  '厚生連',
  '女性協',
  '県信連',
  '県本部',
  '経済連',
  '農水省',
  'ＪＣＡ',
  '全中',
  '全農',
  '単協',
  '生協',
  '㈱農協観光',
  '㈳農協観光',
  'ホクレン',
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
  '解説・提言',
  '新型コロナウイルス',
  'インタビュー',
  '決算',
  '調査・統計・アンケート',
  '米粉',
  '令和6年能登半島地震',
  '訃報',
  '酪農',
  'ウクライナ危機',
  '食品ロス',
  '提言',
  '統計・調査・アンケート'
]);

/**
 * tagsをトピックとカテゴリに変換する関数
 */
function convertTagsToTopicsAndCategories(tagsString: string): { topics: string[], categories: string[] } {
  if (!tagsString) {
    return { topics: [], categories: [] };
  }

  // カンマで分割してトリム
  const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
  
  const processedTopics = new Set<string>();
  const categorySet = new Set<string>();

  for (const tag of tags) {
    // 有効なタグかチェック
    if (!VALID_TAGS.has(tag)) {
      continue;
    }

    // トピックマッピングから情報を取得
    const topicInfo = TOPIC_MAPPING[tag];
    if (!topicInfo) {
      continue;
    }

    // 名称変更を適用してトピックに追加
    const topicName = topicInfo.nameChange || tag;
    processedTopics.add(topicName);

    // カテゴリを追加（大カテゴリと中カテゴリ）
    categorySet.add(topicInfo.largeCategory);
    categorySet.add(topicInfo.mediumCategory);
  }

  // 重複を除去して配列に変換
  const topics = Array.from(processedTopics);
  const categories = Array.from(categorySet);

  return { topics, categories };
}

function extractThumbnail(listImageHtml: string): string {
  if (!listImageHtml) return '';
  // aタグのhrefからimages/xxxx.jpgを抽出
  const aTagMatch = listImageHtml.match(/<a[^>]+href=["']?([^"'>\s]+)["']?[^>]*>/i);
  if (aTagMatch && aTagMatch[1]) {
    const href = aTagMatch[1];
    // imagesの前のカテゴリ部分も含めて抽出
    const imgMatch = href.match(/([^\/]+\/images\/[^\/]+\.jpg)/i);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
  }
  return '';
}

function parseCSV(inputPath: string): InputCSVRow[] {
  // ファイルをバイナリとして読み込み、Shift_JISからUTF-8に変換
  const buffer = fs.readFileSync(inputPath);
  const csvContent = iconv.decode(buffer, 'shift_jis');
  
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true
  });
  
  return result.data as InputCSVRow[];
}

/**
 * IDとauthored_onをハイフンで繋いだ新しいIDを生成する関数
 * 形式: 日付(YYMMDD) - ID
 */
function generateNewId(id: string, authoredOn: string): string {
  // authored_onが空の場合は元のIDをそのまま使用
  if (!authoredOn || authoredOn.trim() === '') {
    return id;
  }
  
  // authored_onの空欄を除去
  const cleanAuthoredOn = authoredOn.trim();
  
  // 日付部分から3番目から8番目までを抽出（年月日部分）
  // 例: 20250514090000 → 250514
  let datePart = '';
  if (cleanAuthoredOn.length >= 8) {
    datePart = cleanAuthoredOn.substring(2, 8); // 3番目から8番目まで（0ベースなので2-7）
  } else if (cleanAuthoredOn.length >= 6) {
    // 短い形式の場合（例: 20250514）
    datePart = cleanAuthoredOn.substring(2, 8);
  } else {
    // 日付が短すぎる場合は元のIDをそのまま使用
    return id;
  }
  
  // 形式: 日付(YYMMDD) - ID
  return `${datePart}-${id}`;
}

function convertToOutputFormat(inputRows: InputCSVRow[]): OutputCSVRow[] {
  return inputRows.map(row => {
    const { topics, categories } = convertTagsToTopicsAndCategories(row.tags || '');
    const newId = generateNewId(row.id || '', row.authored_on || '');
    return {
      ID: newId,
      タイトル: row.title || '',
      カテゴリ: categories.join(', '),
      トピック: topics.join(', '),
      シリーズ: '',
      筆者: '',
      サムネイル: extractThumbnail(row['field.ja_list_image'] || ''),
      記事本文へのサムネイル表示について: '',
      概要: row['field.ja_description'] || '',
      内容: '',
      ページ: row.text || '',
      ファイル名: row['field.kanri_filename'] || ''
    };
  });
}

function writeCSV(outputRows: OutputCSVRow[], outputPath: string): void {
  const csvContent = Papa.unparse(outputRows);
  
  // UTF-8でファイルに書き込み
  const utf8Buffer = Buffer.from(csvContent, 'utf8');
  fs.writeFileSync(outputPath, utf8Buffer);
  
  console.log(`CSVファイルが正常に出力されました: ${outputPath}`);
  console.log('文字エンコーディング: UTF-8');
}

function main(): void {
  try {
    // newInputCSVディレクトリ内のCSVファイルを検索
    const inputDir = path.join(__dirname, 'newInputCSV');
    const csvFiles = fs.readdirSync(inputDir)
      .filter(file => file.endsWith('.csv'))
      .map(file => path.join(inputDir, file));
    
    if (csvFiles.length === 0) {
      throw new Error('newInputCSVディレクトリにCSVファイルが見つかりません');
    }
    
    // 最初に見つかったCSVファイルを使用
    const inputPath = csvFiles[0];
    const outputPath = path.join(__dirname, 'newOutputCSV', 'converted_articles.csv');
    
    console.log('CSVファイルの変換を開始します...');
    console.log(`入力ファイル: ${inputPath}`);
    console.log(`出力ファイル: ${outputPath}`);
    
    // 入力CSVを解析
    const inputRows = parseCSV(inputPath);
    console.log(`${inputRows.length}件のレコードを読み込みました`);
    
    // 出力形式に変換
    const outputRows = convertToOutputFormat(inputRows);
    
    // 出力ディレクトリが存在しない場合は作成
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // CSVファイルを出力
    writeCSV(outputRows, outputPath);
    
    console.log('変換が完了しました！');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 