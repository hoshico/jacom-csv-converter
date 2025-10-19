import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import * as iconv from 'iconv-lite';

// 有効なtopicリスト
const VALID_TOPICS = [
  'JA通信', 'ＪＡ全国大会', 'ＴＡＣ', '一品厳選', '仮渡金(概算金)', '国消国産', '事業承継', '農協人文化賞',
  '殺菌剤', '殺虫剤', '除草剤', '肥料', '水田活用', 'フードロス', 'Z-GIS', 'スマート農業', 'GAP', 'バイオスティミュラント',
  '病害虫', '病害虫発生情報', '病害虫発生予報', '病害虫防除', 'SDGs', 'SDGS', 'ＡＳＦ（アフリカ豚熱）', 'ＣＳＦ（豚熱）',
  'GI', 'HACCP', 'みどり戦略', '花き', '海外ニュース', '基本計画', '基本法', '国際協同組合年', '食料安保', '食料危機',
  '新規就農者支援', '水稲', '水田', '政府備蓄米', '鳥インフルエンザ', '都市農業', '農泊', '農福連携', '備蓄米放出',
  '米の作柄', '米の食味ランキング', '米価', 'ＪＡ共済連・県本部', '新世紀ＪＡ研究会', '全農・県本部',
  '日本農業新聞', 'ＪＡグループ', '中央畜産会', '全農子会社', '家の光協会', '文化厚生連', '農協研究会',
  '農薬工業会', 'ＪＡ女性協', 'ＪＡ青年協', '日本公庫', '農協協会', '農林中金', '農林年金', '農研機構',
  'Ｊミルク', 'ＪＡ全中', 'ＪＡ全農', 'ＪＡ共済', '全厚連', '全青協', '共済連', '厚生連', '女性協',
  '県信連', '県本部', '経済連', '農水省', 'ＪＣＡ', '単協', '生協', '㈱農協観光', '㈳農協観光', 'ホクレン',
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都',
  '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府',
  '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県', '解説・提言', '新型コロナウイルス',
  'インタビュー', '決算', '調査・統計・アンケート', '米粉', '令和6年能登半島地震', '訃報', '酪農',
  'ウクライナ危機', 'フードロス'
];

// 名称変換マッピング
const TOPIC_NAME_MAPPING: { [key: string]: string } = {
  'JAの活動': 'JA通信',
  '2021水田農業対策': '水田活用',
  '水田農業対策': '水田活用',
  'ドローン': 'スマート農業',
  '精密農業': 'スマート農業',
  '食品ロス': 'フードロス',
  '提言': '解説・提言',
  '統計・調査・アンケート': '調査・統計・アンケート',
  '青森': '青森県',
  '岩手': '岩手県',
  '宮城': '宮城県',
  '秋田': '秋田県',
  '山形': '山形県',
  '福島': '福島県',
  '茨城': '茨城県',
  '栃木': '栃木県',
  '群馬': '群馬県',
  '埼玉': '埼玉県',
  '千葉': '千葉県',
  '東京': '東京都',
  '神奈川': '神奈川県',
  '新潟': '新潟県',
  '富山': '富山県',
  '石川': '石川県',
  '福井': '福井県',
  '山梨': '山梨県',
  '長野': '長野県',
  '岐阜': '岐阜県',
  '静岡': '静岡県',
  '愛知': '愛知県',
  '三重': '三重県',
  '滋賀': '滋賀県',
  '京都': '京都府',
  '大阪': '大阪府',
  '兵庫': '兵庫県',
  '奈良': '奈良県',
  '和歌山': '和歌山県',
  '鳥取': '鳥取県',
  '島根': '島根県',
  '岡山': '岡山県',
  '広島': '広島県',
  '山口': '山口県',
  '徳島': '徳島県',
  '香川': '香川県',
  '愛媛': '愛媛県',
  '高知': '高知県',
  '福岡': '福岡県',
  '佐賀': '佐賀県',
  '長崎': '長崎県',
  '熊本': '熊本県',
  '大分': '大分県',
  '宮崎': '宮崎県',
  '鹿児島': '鹿児島県',
  '沖縄': '沖縄県'
};

// トピックからカテゴリへの変換マッピング
const TOPIC_CATEGORY_MAPPING: { [key: string]: { parent: string, child: string } } = {
  'JA通信': { parent: 'JA', child: 'その他JAの活動' },
  'ＪＡ全国大会': { parent: 'JA', child: 'その他JAの活動' },
  'ＴＡＣ': { parent: 'JA', child: '営農経済' },
  '一品厳選': { parent: 'JA', child: '営農経済' },
  '仮渡金(概算金)': { parent: 'JA', child: '金融共済' },
  '国消国産': { parent: 'JA', child: 'その他JAの活動' },
  '事業承継': { parent: 'JA', child: 'JAの人事' },
  '農協人文化賞': { parent: 'JA', child: 'JAの人事' },
  '殺菌剤': { parent: 'メーカー', child: '農薬' },
  '殺虫剤': { parent: 'メーカー', child: '農薬' },
  '除草剤': { parent: 'メーカー', child: '農薬' },
  '肥料': { parent: 'メーカー', child: 'その他生産資材' },
  '水田活用': { parent: '食と流通', child: '流通' },
  'フードロス': { parent: '食と流通', child: '食品' },
  'Z-GIS': { parent: '農業技術', child: '栽培技術' },
  'スマート農業': { parent: '農業技術', child: '栽培技術' },
  'GAP': { parent: '農業技術', child: '栽培技術' },
  'バイオスティミュラント': { parent: '農業技術', child: '栽培技術' },
  '病害虫': { parent: '農業技術', child: '病害虫対策' },
  '病害虫発生情報': { parent: '農業技術', child: '病害虫対策' },
  '病害虫発生予報': { parent: '農業技術', child: '病害虫対策' },
  '病害虫防除': { parent: '農業技術', child: '病害虫対策' },
  'SDGs': { parent: '農政', child: 'その他官公庁' },
  'ＡＳＦ（アフリカ豚熱）': { parent: '農政', child: '畜産酪農' },
  'ＣＳＦ（豚熱）': { parent: '農政', child: '畜産酪農' },
  'GI': { parent: '農政', child: '農水省' },
  'HACCP': { parent: '農政', child: 'その他官公庁' },
  'みどり戦略': { parent: '農政', child: '農水省' },
  '花き': { parent: '農政', child: '青果物' },
  '海外ニュース': { parent: '農政', child: '地域情報' },
  '基本計画': { parent: '農政', child: '農水省' },
  '基本法': { parent: '農政', child: '農水省' },
  '国際協同組合年': { parent: '農政', child: 'その他官公庁' },
  '食料安保': { parent: '農政', child: '農水省' },
  '食料危機': { parent: '農政', child: '農水省' },
  '新規就農者支援': { parent: '農政', child: '農水省' },
  '水稲': { parent: '農政', child: '米' },
  '水田': { parent: '農政', child: '米' },
  '政府備蓄米': { parent: '農政', child: '米' },
  '鳥インフルエンザ': { parent: '農政', child: '畜産酪農' },
  '都市農業': { parent: '農政', child: '地域情報' },
  '農泊': { parent: '農政', child: '地域情報' },
  '農福連携': { parent: '農政', child: '地域情報' },
  '備蓄米放出': { parent: '農政', child: '米' },
  '米の作柄': { parent: '農政', child: '米' },
  '米の食味ランキング': { parent: '農政', child: '米' },
  '米価': { parent: '農政', child: '米' }
};

const VALID_CROPS = [
  '果物',
  '果樹類',
  '野菜',
  'マンゴー',
  'かぼちゃ',
  'ブドウ',
  'モモ',
  'ナシ',
  'さとうきび',
  'チャ',
  '植木類',
  'トマト',
  'アブラナ科野菜',
  'ピーマン',
  'きゅうり',
  'キャベツ',
  // 「野菜」として登録
  '野菜類',
]

interface InputCSVRow {
  [key: string]: string;
}

interface OutputCSVRow {
  公開日: string;
  記事タイプ: string;
  ID: string;
  タイトル: string;
  カテゴリ: string;
  アラートタイプ: string;
  都道府県: string;
  作物: string;
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

interface ArticleCSVRow {
  公開日: string;
  記事タイプ: string;
  ID: string;
  タイトル: string;
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

interface MergeConfig {
  inputDir: string;
  outputFile: string;
  encoding?: string;
}

class CSVMerger {
  private config: MergeConfig;

  constructor(config: MergeConfig) {
    this.config = {
      encoding: 'utf8',
      ...config
    };
  }

  /**
   * 指定されたディレクトリ内のすべてのCSVファイルを統合
   */
  async mergeCSVFiles(): Promise<void> {
    try {
      console.log('CSVファイルの統合を開始します...');
      
      // 入力ディレクトリ内のCSVファイルを取得
      const csvFiles = this.getCSVFiles();
      
      if (csvFiles.length === 0) {
        throw new Error('入力ディレクトリにCSVファイルが見つかりません');
      }

      console.log(`見つかったCSVファイル: ${csvFiles.length}個`);

      // 各CSVファイルを読み込み
      const allData: OutputCSVRow[] = [];

      for (const file of csvFiles) {
        console.log(`処理中: ${path.basename(file)}`);
        const { data } = await this.readCSVFile(file);
        
        // データを変換して追加
        const convertedData = this.convertToOutputFormat(data);
        allData.push(...convertedData);
      }

      // 統合されたデータを出力
      await this.writeMergedCSV(allData);

      console.log(`統合完了: ${allData.length}行のデータを ${this.config.outputFile} に出力しました`);
    } catch (error) {
      console.error('CSV統合エラー:', error);
      throw error;
    }
  }

  /**
   * 入力ディレクトリ内のCSVファイルを取得
   */
  private getCSVFiles(): string[] {
    const files = fs.readdirSync(this.config.inputDir);
    return files
      .filter(file => file.toLowerCase().endsWith('.csv'))
      .map(file => path.join(this.config.inputDir, file))
      .sort();
  }

  /**
   * CSVファイルを読み込み
   */
  private async readCSVFile(filePath: string): Promise<{ data: InputCSVRow[] }> {
    const fileContent = fs.readFileSync(filePath);
    
    // 日本語CSVファイルは通常Shift_JISエンコーディング
    // まずShift_JISでデコードを試行
    let decodedContent: string;
    try {
      decodedContent = iconv.decode(fileContent, 'shift_jis');
      console.log(`${path.basename(filePath)}: Shift_JISでデコードしました`);
    } catch (error) {
      // Shift_JISで失敗した場合はUTF-8で試行
      try {
        decodedContent = iconv.decode(fileContent, 'utf8');
        console.log(`${path.basename(filePath)}: UTF-8でデコードしました`);
      } catch (utf8Error) {
        // 最後に指定されたエンコーディングで試行
        decodedContent = iconv.decode(fileContent, this.config.encoding!);
        console.log(`${path.basename(filePath)}: ${this.config.encoding}でデコードしました`);
      }
    }
    
    return new Promise((resolve, reject) => {
      Papa.parse(decodedContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn(`警告: ${path.basename(filePath)} でパースエラーが発生しました:`, results.errors);
          }
          
          const data = results.data as InputCSVRow[];
          
          resolve({ data });
        },
        error: (error) => {
          reject(new Error(`CSVファイルの読み込みエラー (${path.basename(filePath)}): ${error.message}`));
        }
      });
    });
  }

  /**
   * 入力データを出力形式に変換
   */
  private convertToOutputFormat(inputData: InputCSVRow[]): OutputCSVRow[] {
    return inputData.map(row => {
      const topic = this.cleanTags(row.tags || row.tag || row['タグ'] || '');
      const categoryInfo = this.getCategoryFromTopic(topic);
      
      // parent_categoryとchild_categoryを組み合わせてcategoryを作成
      let category = '';
      if (categoryInfo.parent && categoryInfo.child) {
        category = `${categoryInfo.parent},${categoryInfo.child}`;
      } else if (categoryInfo.parent) {
        category = categoryInfo.parent;
      } else if (categoryInfo.child) {
        category = categoryInfo.child;
      }
      
      // tagsの内容に基づいてarticle_typeを設定
      let articleType = '記事'; // デフォルトは「記事」
      const originalTags = (row.tags || row.tag || row['タグ'] || '').toLowerCase();
      if (originalTags.includes('コラム')) {
        articleType = 'シリーズ';
      } else if (originalTags.includes('人事')) {
        articleType = '人事';
      } else if (originalTags.includes('病害虫')) {
        articleType = '病害虫';
      }
      
      // 新しいIDを生成（日付 + 元のID）
      const newId = this.generateNewId(row.id || '', row.authored_on || '');
      
      // サムネイルを抽出
      const thumbnail = this.extractThumbnail(row['field.ja_list_image'] || '');
      
      // アラートタイプ、都道府県、作物を抽出
      const alertType = this.extractAlertType(row.title || row['記事タイトル'] || row['タイトル'] || '');
      const prefecture = this.extractPrefecture(row.title || row['記事タイトル'] || row['タイトル'] || '');
      const crops = this.extractCrops(row.title || row['記事タイトル'] || row['タイトル'] || '');
      
      // 記事タイトルからアラートタイプと都道府県を除去したタイトルを抽出
      const cleanTitle = this.extractCleanTitle(row.title || row['記事タイトル'] || row['タイトル'] || '');
      
      // textフィールド内のimgタグのsrc属性は変換せず、元のまま使用
      const processedText = row.text || '';
      
      return {
        公開日: this.extractPublishDate(row.authored_on || ''),
        記事タイプ: articleType,
        ID: newId,
        タイトル: cleanTitle,           // アラートタイプと都道府県を除去したタイトル
        カテゴリ: category,
        アラートタイプ: alertType,      // 抽出されたアラートタイプ
        都道府県: prefecture,           // 抽出された都道府県
        作物: crops,
        トピック: topic,
        シリーズ: '',
        筆者: '',
        サムネイル: thumbnail,
        記事本文へのサムネイル表示について: '',
        概要: row['field.ja_description'] || '',
        内容: '',
        ページ: processedText,
        ファイル名: row['field.kanri_filename'] || ''
      };
    });
  }



  /**
   * authored_onから公開日を抽出（前から8桁）
   */
  private extractPublishDate(authoredOn: string): string {
    if (!authoredOn || authoredOn.trim() === '') {
      return '';
    }
    
    const cleanAuthoredOn = authoredOn.trim();
    
    // 前から8桁を抽出
    if (cleanAuthoredOn.length >= 12) {
      return cleanAuthoredOn.substring(0, 12);
    }
    
    return cleanAuthoredOn;
  }

  /**
   * IDとauthored_onをハイフンで繋いだ新しいIDを生成する関数
   * 形式: 日付(YYMMDD) - ID
   */
  private generateNewId(id: string, authoredOn: string): string {
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

  /**
   * サムネイル画像のパスを抽出
   */
  private extractThumbnail(listImageHtml: string): string {
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

  /**
   * 記事タイトルからアラートタイプを抽出
   */
  private extractAlertType(title: string): string {
    if (!title) return '';
    
    // 【注意報】【特殊報】【警報】のいずれかを抽出
    const alertMatch = title.match(/【(注意報|特殊報|警報)】/);
    if (alertMatch && alertMatch[1]) {
      return alertMatch[1];
    }
    
    return '';
  }

  /**
   * 記事タイトルからアラートタイプと都道府県を除去したタイトルを抽出
   */
  private extractCleanTitle(title: string): string {
    if (!title) return '';

    // アラートタイプ（【注意報】【特殊報】【警報】）を除去
    const alertMatch = title.match(/【(注意報|特殊報|警報)】/);
    let cleanTitle = title;
    if (alertMatch && alertMatch[1]) {
      cleanTitle = cleanTitle.replace(/【(注意報|特殊報|警報)】/, '').trim();
    }

    // 都道府県を除去（extractPrefectureと同じロジック）
    const parts = cleanTitle.split('　');
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1].trim();
      // 都道府県のパターンにマッチするかチェック
      if (lastPart.endsWith('県') || lastPart.endsWith('府') || lastPart.endsWith('都') || lastPart.endsWith('道')) {
        // 最後の都道府県部分を除去
        cleanTitle = parts.slice(0, -1).join('　');
      }
    }

    return cleanTitle.trim();
  }

  /**
   * 記事タイトルの最後から都道府県を抽出
   */
  private extractPrefecture(title: string): string {
    if (!title) return '';
    
    // 記事タイトルの最後のスペース以降を都道府県として抽出
    const parts = title.split('　');
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1].trim();
      // 都道府県のパターンにマッチするかチェック
      if (lastPart.endsWith('県') || lastPart.endsWith('府') || lastPart.endsWith('都') || lastPart.endsWith('道')) {
        return lastPart;
      }
    }
    
    return '';
  }

  /**
   * 記事タイトルから作物名を抽出
   */
  private extractCrops(title: string): string {
    if (!title) return '';
    
    const foundCrops: string[] = [];
    
    // VALID_CROPSの各作物名について、タイトル内でマッチするかチェック
    for (const crop of VALID_CROPS) {
      if (title.includes(crop)) {
        // 「野菜類」の場合は「野菜」として追加
        if (crop === '野菜類') {
          if (!foundCrops.includes('野菜')) {
            foundCrops.push('野菜');
          }
        } else {
          foundCrops.push(crop);
        }
      }
    }
    
    // 複数の作物がある場合はカンマ区切りで返す
    return foundCrops.join(',');
  }

  /**
   * タグから?を除去してクリーンアップ
   */
  private cleanTags(tags: string): string {
    if (!tags || tags.trim() === '') {
      return '';
    }
    
    const originalTags = tags.split(',');
    
    const cleanedTags = originalTags
      .map(tag => tag.trim().replace(/\?/g, '').trim())
      .filter(tag => tag.length > 0);
    
    // 名称変換を適用
    const mappedTags = cleanedTags.map(tag => TOPIC_NAME_MAPPING[tag] || tag);
    
    const validTags = mappedTags.filter(tag => VALID_TOPICS.includes(tag)); 
    
    return validTags.join(',');
  }

  /**
   * トピックからカテゴリを取得
   */
  private getCategoryFromTopic(topic: string): { parent: string, child: string } {
    if (!topic || topic.trim() === '') {
      return { parent: '', child: '' };
    }
    
    // カンマ区切りの最初のトピックからカテゴリを取得
    const firstTopic = topic.split(',')[0].trim();
    return TOPIC_CATEGORY_MAPPING[firstTopic] || { parent: '', child: '' };
  }

  /**
   * トピックから都道府県を抽出
   */
  private extractPrefectureFromTopic(topic: string): string {
    if (!topic || topic.trim() === '') {
      return '';
    }
    
    // カンマ区切りのトピックを分割して、都道府県が含まれているかチェック
    const topics = topic.split(',').map(t => t.trim());
    
    for (const t of topics) {
      // 都道府県のパターンにマッチするかチェック
      if (t.endsWith('県') || t.endsWith('府') || t.endsWith('都') || t.endsWith('道')) {
        return t;
      }
    }
    
    return '';
  }

  /**
   * 統合されたCSVファイルを出力
   */
  private async writeMergedCSV(data: OutputCSVRow[]): Promise<void> {
    // 記事タイプが「記事」または「シリーズ」のものをフィルタリング
    const articleData = data.filter(row => row.記事タイプ === '記事' || row.記事タイプ === 'シリーズ');
    
    // 記事タイプが「病害虫」のもののみをフィルタリング
    const pestData = data.filter(row => row.記事タイプ === '病害虫');
    
    // 記事タイプが「人事」のもののみをフィルタリング
    const humanResourceData = data.filter(row => row.記事タイプ === '人事');
    
    console.log(`記事タイプ「記事・シリーズ」のデータ: ${articleData.length}行`);
    console.log(`記事タイプ「病害虫」のデータ: ${pestData.length}行`);
    console.log(`記事タイプ「人事」のデータ: ${humanResourceData.length}行`);
    
    // content_articles.csv用のヘッダー（カテゴリを追加）
    const articleHeaders = [
      'ID', 'タイトル', '公開日', 'カテゴリ', 'トピック', 'シリーズ', '筆者', 
      'サムネイル', '記事本文へのサムネイル表示について', '概要', '内容', 'ページ', 'ファイル名'
    ];
    
    // content_pestinfos.csv用のヘッダー（カテゴリを追加）
    const pestHeaders = [
      'ID', 'タイトル', '公開日', 'カテゴリ', 'アラートタイプ', '都道府県', '作物', 'トピック', '病気の種類', 
      'サムネイル', '記事本文へのサムネイル表示について', '概要', '内容', 'ページ', 'ファイル名'
    ];
    
    // content_humanresources.csv用のヘッダー
    const humanResourceHeaders = [
      'ID', 'タイトル', '公開日', 'カテゴリ', 'トピック', '人事区分', 'JA名', '人事異動の発効日', 
      '都道府県', '全国連人事', 'サムネイル', '記事本文へのサムネイル表示について', '概要', '内容', 'ページ'
    ];
    
    // content_articles.csvの出力
    await this.writeArticleCSVFile(articleData, articleHeaders, this.config.outputFile);
    
    // content_pestinfos.csvの出力
    const pestOutputFile = this.config.outputFile.replace('content_articles.csv', 'content_pestinfos.csv');
    await this.writePestCSVFile(pestData, pestHeaders, pestOutputFile);
    
    // content_humanresources.csvの出力
    const humanResourceOutputFile = this.config.outputFile.replace('content_articles.csv', 'content_humanresources.csv');
    await this.writeHumanResourceCSVFile(humanResourceData, humanResourceHeaders, humanResourceOutputFile);
  }

  /**
   * content_articles.csv用のCSVファイルを出力するヘルパーメソッド
   */
  private async writeArticleCSVFile(data: OutputCSVRow[], headers: string[], outputFile: string): Promise<void> {
    const csvContent = [headers.join(',')];
    
    // データ行を追加（カテゴリを追加）
    for (const row of data) {
      const rowValues = [
        this.escapeCSVValue(row.ID),
        this.escapeCSVValue(row.タイトル),
        this.escapeCSVValue(row.公開日),
        this.escapeCSVValue(row.カテゴリ),
        this.escapeCSVValue(row.トピック),
        this.escapeCSVValue(row.シリーズ),
        this.escapeCSVValue(row.筆者),
        this.escapeCSVValue(row.サムネイル),
        this.escapeCSVValue(row.記事本文へのサムネイル表示について),
        this.escapeCSVValue(row.概要),
        this.escapeCSVValue(row.内容),
        this.escapeCSVValue(row.ページ),
        this.escapeCSVValue(row.ファイル名)
      ];
      csvContent.push(rowValues.join(','));
    }

    // ファイルに書き込み（UTF-8で出力）
    const outputContent = csvContent.join('\n');
    
    // 出力ディレクトリが存在しない場合は作成
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // UTF-8でファイルに書き込み
    fs.writeFileSync(outputFile, outputContent, 'utf8');
    
    console.log(`${path.basename(outputFile)} に ${data.length}行のデータを出力しました`);
  }

  /**
   * content_pestinfos.csv用のCSVファイルを出力するヘルパーメソッド
   */
  private async writePestCSVFile(data: OutputCSVRow[], headers: string[], outputFile: string): Promise<void> {
    const csvContent = [headers.join(',')];
    
    // データ行を追加（カテゴリを追加）
    for (const row of data) {
      const rowValues = [
        this.escapeCSVValue(row.ID),
        this.escapeCSVValue(row.タイトル),
        this.escapeCSVValue(row.公開日),
        this.escapeCSVValue(row.カテゴリ),
        this.escapeCSVValue(row.アラートタイプ),
        this.escapeCSVValue(row.都道府県),
        this.escapeCSVValue(row.作物),
        this.escapeCSVValue(row.トピック),
        '', // 病気の種類（空値）
        this.escapeCSVValue(row.サムネイル),
        this.escapeCSVValue(row.記事本文へのサムネイル表示について),
        this.escapeCSVValue(row.概要),
        this.escapeCSVValue(row.内容),
        this.escapeCSVValue(row.ページ),
        this.escapeCSVValue(row.ファイル名)
      ];
      csvContent.push(rowValues.join(','));
    }

    // ファイルに書き込み（UTF-8で出力）
    const outputContent = csvContent.join('\n');
    
    // 出力ディレクトリが存在しない場合は作成
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // UTF-8でファイルに書き込み
    fs.writeFileSync(outputFile, outputContent, 'utf8');
    
    console.log(`${path.basename(outputFile)} に ${data.length}行のデータを出力しました`);
  }

  /**
   * content_humanresources.csv用のCSVファイルを出力するヘルパーメソッド
   */
  private async writeHumanResourceCSVFile(data: OutputCSVRow[], headers: string[], outputFile: string): Promise<void> {
    const csvContent = [headers.join(',')];
    
    // データ行を追加
    for (const row of data) {
      // トピックから都道府県を抽出
      const prefectureFromTopic = this.extractPrefectureFromTopic(row.トピック);
      
      const rowValues = [
        this.escapeCSVValue(row.ID),
        this.escapeCSVValue(row.タイトル),
        this.escapeCSVValue(row.公開日),
        'JAの人事', // カテゴリを"JAの人事"に固定
        this.escapeCSVValue(row.トピック),
        '', // 人事区分（空値）
        '', // JA名（空値）
        '', // 人事異動の発効日（空値）
        this.escapeCSVValue(prefectureFromTopic), // トピックから抽出した都道府県
        '', // 全国連人事（空値）
        this.escapeCSVValue(row.サムネイル),
        this.escapeCSVValue(row.記事本文へのサムネイル表示について),
        this.escapeCSVValue(row.概要),
        this.escapeCSVValue(row.内容),
        this.escapeCSVValue(row.ページ)
      ];
      csvContent.push(rowValues.join(','));
    }

    // ファイルに書き込み（UTF-8で出力）
    const outputContent = csvContent.join('\n');
    
    // 出力ディレクトリが存在しない場合は作成
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // UTF-8でファイルに書き込み
    fs.writeFileSync(outputFile, outputContent, 'utf8');
    
    console.log(`${path.basename(outputFile)} に ${data.length}行のデータを出力しました`);
  }

  /**
   * CSV値のエスケープ処理
   */
  private escapeCSVValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

// 使用例
async function main() {
  const merger = new CSVMerger({
    inputDir: path.join(__dirname, 'input'),
    outputFile: path.join(__dirname, 'output', 'content_articles.csv'),
    encoding: 'utf8'
  });

  try {
    await merger.mergeCSVFiles();
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみmain関数を実行
if (require.main === module) {
  main();
}

export { CSVMerger, MergeConfig };
