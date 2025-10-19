import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { JSDOM } from "jsdom";
import {
  CREATED_AT,
  DISPLAY_ID,
  NOW,
  POST_ASSET_DOMAIN,
  SITE_ID,
  STATUS,
  TYPE,
} from "../common/constants";
import {
  Content,
  ContentAsset,
  ContentCheckboxField,
  ContentCheckboxValue,
  ContentCheckboxesField,
  ContentCheckboxesValue,
  ContentField,
  ContentImageField,
  ContentImageValue,
  ContentMultiSelectField,
  ContentMultiTaxonomyField,
  ContentMultiTaxonomyValue,
  ContentNestedArrayChildField,
  ContentNestedArrayField,
  ContentRadioField,
  ContentRadioValue,
  ContentRichTextField,
  ContentRichTextValue,
  ContentSetting,
  ContentTaxonomyField,
  ContentTaxonomyValue,
  ContentTextAreaField,
  ContentTextAreaValue,
  ContentTextField,
  ContentTextValue,
  Taxonomy,
  Term,
} from "../common/models";
import {
  FieldArrayItem,
  FieldsByTypeWithFile,
  ValuesByTypeWithFile,
} from "../common/types";
import {
  copyFileToOutput,
  getFilePath,
  getImageInfo,
  getRowToKeyValue,
  readCsvFile,
} from "../common/utils";
import { INPUT_CSV_DIR, INPUT_IMAGE_DIR, OUTPUT_IMAGE_DIR } from "./constants";
import { getStatus, getUpdatedDate } from "./utils";

// export const createTaxonomiesFromCSV = ({
//   taxonomies,
//   taxonomyData,
// }: {
//   taxonomies: Taxonomy[];
//   taxonomyData: { name: string }[];
// }) => {
//   for (const { name } of taxonomyData) {
//     const taxonomy = new Taxonomy({ name, updated_at: NOW });
//     taxonomies.push(taxonomy);
//   }
// };
export const createTaxonomiesFromCSV = ({
  taxonomies,
  taxonomyData,
}: {
  taxonomies: Taxonomy[];
  taxonomyData: { name: string, id: string }[];
}) => {
  for (const { name, id } of taxonomyData) {
    const taxonomy = new Taxonomy({ name, id, updated_at: NOW });
    taxonomies.push(taxonomy);
  }
};

/**
 * termsのslug生成用
 */
const SLUG_MAPPING: Record<string, string> = {
  // カテゴリ（大カテゴリ）
  "農政": "nousei",
  "JA": "ja", 
  "メーカー": "maker",
  "食と流通": "shoku-ryutsu",
  "農業技術": "nougi",
  "大学・機関": "daigaku-kikan",
  "連載・コラム他": "other",
  
  // カテゴリ（中カテゴリ）
  "農政のすべて": "nousei-all",
  "JAのすべて": "ja-all",
  "メーカーのすべて": "maker-all",
  "農業技術のすべて": "nougi-all",
  "食と流通のすべて": "shoku-ryutsu-all",
  "大学・機関のすべて": "daigaku-kikan-all",
  "連載・コラム他のすべて": "other-all",
  "オリジナル連載": "original-content",
  "JAの人事": "ja-jinji",
  "メーカーの人事": "maker-jinji",
  "人事のすべて": "jinji-all",
  "農水省": "nousuisyou",
  "その他官公庁": "kankouchou",
  "地域情報": "chiiki",
  "米": "kome",
  "畜産酪農": "chikusan",
  "青果物": "seikabutsu",
  "人事": "ja-jinji",
  "営農経済": "einou",
  "金融共済": "kinyu",
  "その他JAの活動": "ja-other",
  "農薬": "nouyaku",
  "農業機械": "nouki",
  "その他生産資材": "shizai-other",
  "食品": "shokuhin",
  "流通": "ryutsu",
  "生協": "seikyo",
  "栽培技術": "saibai",
  "病害虫対策": "byogaichu-taisaku",
  "大学・研究機関": "daigaku-kenkyu",
  "教育": "kyoiku",
  "コラム": "column",
  "書評": "shohyou",
  "訃報": "fuho",
  
  // トピック
 "JA通信": "ja-tsushin",
  "ＪＡ全国大会": "ja-national-meeting",
  "ＴＡＣ": "tac",
  "一品厳選": "ippin-gensen",
  "仮渡金(概算金)": "karitokin",
  "国消国産": "kokusho-kokusan",
  "事業承継": "jigyo-shokei",
  "農協人文化賞": "nokyo-bunka-award",
  "殺菌剤": "sakkinzai",
  "殺虫剤": "sacchuzai",
  "除草剤": "josozai",
  "肥料": "hiryo",
  "水田活用": "suiden-katsuyo",
  "フードロス": "food-loss",
  "Z-GIS": "z-gis",
  "スマート農業": "smart-agriculture",
  "バイオスティミュラント": "biostimulant",
  "病害虫": "byogaichu",
  "病害虫発生情報": "byogaichu-johou",
  "病害虫発生予報": "byogaichu-yohou",
  "病害虫防除": "byogaichu-bojo",
  "SDGs": "sdgs",
  "ＡＳＦ（アフリカ豚熱）": "asf",
  "ＣＳＦ（豚熱）": "csf",
  "GI": "gi",
  "HACCP": "haccp",
  "みどり戦略": "midori-senryaku",
  "花き": "kaki",
  "海外ニュース": "overseas-news",
  "基本計画": "kihon-keikaku",
  "基本法": "kihon-ho",
  "国際協同組合年": "international-cooperative-year",
  "食料安保": "shokuryo-anpo",
  "食料危機": "shokuryo-kiki",
  "新規就農者支援": "shinki-shuno-shien",
  "水稲": "suito",
  "水田": "suiden",
  "政府備蓄米": "seifu-bichikumai",
  "鳥インフルエンザ": "bird-influenza",
  "都市農業": "toshi-nogyo",
  "農泊": "nohaku",
  "農福連携": "nofuku-renkei",
  "備蓄米放出": "bichikumai-hoshutsu",
  "米の作柄": "kome-sakugara",
  "米の食味ランキング": "kome-ranking",
  "米価": "beika",
  "ＪＡ共済連・県本部": "ja-kyosairen-ken-honbu",
  "新世紀ＪＡ研究会": "shinseiki-ja-kenkyukai",
  "ＪＡ全農・県本部": "ja-zennoh-ken-honbu",
  "日本農業新聞": "nihon-nogyo-shimbun",
  "ＪＡグループ": "ja-group",
  "中央畜産会": "chuo-chikusankai",
  "全農子会社": "zennoh-subsidiary",
  "家の光協会": "ieno-hikari-kyokai",
  "文化厚生連": "bunka-koseiren",
  "農協研究会": "nokyo-kenkyukai",
  "農薬工業会": "noyaku-kogyokai",
  "ＪＡ女性協": "ja-joseikyo",
  "ＪＡ青年協": "ja-seinenkyo",
  "日本公庫": "nihon-koko",
  "農協協会": "nokyo-kyokai",
  "農林中金": "norinchukin",
  "農林年金": "norin-nenkin",
  "農研機構": "noken-kiko",
  "Ｊミルク": "j-milk",
  "ＪＡ共済": "ja-kyosai",
  "全厚連": "zenkoren",
  "全青協": "zenseikyo",
  "共済連": "kyosairen",
  "厚生連": "koseiren",
  "女性協": "joseikyo",
  "県信連": "kenshinren",
  "県本部": "ken-honbu",
  "経済連": "keizairen",
  "ＪＣＡ": "jca",
  "単協": "tankyo",
  "㈱農協観光": "noko-kanko-co-ltd",
  "㈳農協観光": "noko-kanko-foundation",
  "ホクレン": "hokuren",
  "北海道": "Hokkaido",
  "青森県": "Aomori",
  "岩手県": "Iwate",
  "宮城県": "Miyagi",
  "秋田県": "Akita",
  "山形県": "Yamagata",
  "福島県": "Fukushima",
  "茨城県": "Ibaraki",
  "栃木県": "Tochigi",
  "群馬県": "Gunma",
  "埼玉県": "Saitama",
  "千葉県": "Chiba",
  "東京都": "Tokyo",
  "神奈川県": "Kanagawa",
  "新潟県": "Niigata",
  "富山県": "Toyama",
  "石川県": "Ishikawa",
  "福井県": "Fukui",
  "山梨県": "Yamanashi",
  "長野県": "Nagano",
  "岐阜県": "Gifu",
  "静岡県": "Shizuoka",
  "愛知県": "Aichi",
  "三重県": "Mie",
  "滋賀県": "Shiga",
  "京都府": "Kyoto",
  "大阪府": "Osaka",
  "兵庫県": "Hyogo",
  "奈良県": "Nara",
  "和歌山県": "Wakayama",
  "鳥取県": "Tottori",
  "島根県": "Shimane",
  "岡山県": "Okayama",
  "広島県": "Hiroshima",
  "山口県": "Yamaguchi",
  "徳島県": "Tokushima",
  "香川県": "Kagawa",
  "愛媛県": "Ehime",
  "高知県": "Kochi",
  "福岡県": "Fukuoka",
  "佐賀県": "Saga",
  "長崎県": "Nagasaki",
  "熊本県": "Kumamoto",
  "大分県": "Oita",
  "宮崎県": "Miyazaki",
  "鹿児島県": "Kagoshima",
  "沖縄県": "Okinawa",
  "解説・提言": "kaisetsu-teigen",
  "新型コロナウイルス": "shingata-coronavirus",
  "インタビュー": "interview",
  "決算": "kessan",
  "調査・統計・アンケート": "chosa-tokei-anketo",
  "米粉": "komeko",
  "令和6年能登半島地震": "noto-earthquake-2024",
  "酪農": "rakuno",
  "ウクライナ危機": "ukraine-crisis",
  
  // シリーズ
  "正義の農政論": "justice-for-agriculture",
  
  // 筆者
  "森島賢一": "morishima-kenichi",

  // 作物

  "いも類": "tubers",
  "果樹類": "fruit-crops",
  "豆類": "legumes",
  "麦類": "cereals", 
  "野菜": "vegetables",
  "その他": "other",
};

/**
 * slugが指定されていない場合の自動生成関数
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export const createTermsFromCSV = ({
  terms,
  fileName,
  taxonomy,
}: {
  terms: Term[];
  fileName: string;
  taxonomy: Taxonomy;
}) => {
  const dataRows = readCsvFile(getFilePath(INPUT_CSV_DIR, fileName)).slice(1);
  let currentparent_id: string | null = null;
  let parentsort_order = 1;
  let childsort_order = 0;
  
  for (const row of dataRows) {
    const [_, name] = row;
    if (!name) continue;
    
    const isParent = !name.startsWith("―");
    if (isParent) {
      childsort_order = 0;
      const parentTerm = new Term({
        taxonomy_id: taxonomy.id,
        name: name,
        slug: SLUG_MAPPING[name] || generateSlug(name), // マッピングから取得、なければ自動生成
        sort_order: parentsort_order++,
        updated_at: NOW,
      });
      terms.push(parentTerm);
      currentparent_id = parentTerm.id;
    } else {
      const value = name.replace(/^―\s*/, "");
      const childrenTerm = new Term({
        taxonomy_id: taxonomy.id,
        parent_id: currentparent_id,
        name: value,
        slug: SLUG_MAPPING[value] || generateSlug(value), // マッピングから取得、なければ自動生成
        sort_order: ++childsort_order,
        updated_at: NOW,
      });
      terms.push(childrenTerm);
    }
  }
};

// export const createContentSettings = (
//   contentSettingData: { name: string }[]
// ) => {
//   const contentSettings: ContentSetting[] = [];
//   for (const { name } of contentSettingData) {
//     const contentSetting = new ContentSetting({ name, updated_at: NOW });
//     contentSettings.push(contentSetting);
//   }
//   return contentSettings;
// };
export const createContentSettings = (
  contentSettingData: { name: string, id: string }[]
) => {
  const contentSettings: ContentSetting[] = [];
  for (const { name, id } of contentSettingData) {
    const contentSetting = new ContentSetting({ name, id, updated_at: NOW });
    contentSettings.push(contentSetting);
  }
  return contentSettings;
};

export const createContentFieldsFromCSV = (
  contentSettingId: ContentSetting["id"],
  fieldArray: FieldArrayItem[],
  contentFields: ContentField[],
  contentNestedArrayFields: ContentNestedArrayField[],
  fieldsByTypeWithFile: FieldsByTypeWithFile
) => {
  fieldArray.forEach((field: FieldArrayItem, index) => {
    const contentField = new ContentField({
      setting_id: contentSettingId,
      type: field.type,
      name: field.name,
      label: field.label,
      is_required: field.is_required,
      sort_order: index + 1,
      updated_at: NOW,
    });
    contentFields.push(contentField);
    switch (field.type) {
      case TYPE.TEXT:
        fieldsByTypeWithFile.TEXT.data.push(
          new ContentTextField({
            field_id: contentField.id,
            updated_at: NOW,
          })
        );
        break;
      case TYPE.TEXTAREA:
        fieldsByTypeWithFile.TEXTAREA.data.push(
          new ContentTextAreaField({
            field_id: contentField.id,
            updated_at: NOW,
          })
        );
        break;
      case TYPE.MULTI_SELECT:
        fieldsByTypeWithFile.MULTI_SELECT.data.push(
          new ContentMultiSelectField({
            field_id: contentField.id,
            options: field.options,
            updated_at: NOW,
          })
        );
        break;
      case TYPE.RADIO:
        fieldsByTypeWithFile.RADIO.data.push(
          new ContentRadioField({
            field_id: contentField.id,
            options: field.options,
            layout: field.layout,
            updated_at: NOW,
          })
        );
        break;
      case TYPE.CHECKBOXES:
        fieldsByTypeWithFile.CHECKBOXES.data.push(
          new ContentCheckboxesField({
            field_id: contentField.id,
            options: field.options,
            layout: field.layout,
            updated_at: NOW,
          })
        );
        break;
      case TYPE.CHECKBOX:
        fieldsByTypeWithFile.CHECKBOX.data.push(
          new ContentCheckboxField({
            field_id: contentField.id,
            label: field.checkbox_label,
            updated_at: NOW,
          })
        );
        break;
      case TYPE.IMAGE:
        fieldsByTypeWithFile.IMAGE.data.push(
          new ContentImageField({
            field_id: contentField.id,
            updated_at: NOW,
          })
        );
        break;
      case TYPE.RICH_TEXT:
        fieldsByTypeWithFile.RICH_TEXT.data.push(
          new ContentRichTextField({
            field_id: contentField.id,
            updated_at: NOW,
          })
        );
        break;
      case TYPE.TAXONOMY:
        fieldsByTypeWithFile.TAXONOMY.data.push(
          new ContentTaxonomyField({
            field_id: contentField.id,
            taxonomy_id: field.taxonomy_id,
            updated_at: NOW,
          })
        );
        break;
      case TYPE.MULTI_TAXONOMY:
        fieldsByTypeWithFile.MULTI_TAXONOMY.data.push(
          new ContentMultiTaxonomyField({
            field_id: contentField.id,
            taxonomy_id: field.taxonomy_id,
            updated_at: NOW,
          })
        );
        break;
      case TYPE.NESTED_ARRAY: {
        const contentNestedArrayField = new ContentNestedArrayField({
          field_id: contentField.id,
        });
        contentNestedArrayFields.push(contentNestedArrayField);

        field.children.forEach((children, order) => {
          const childrenContentField = new ContentField({
            setting_id: contentSettingId,
            type: children.type,
            name: children.name,
            label: children.label,
            is_required: children.is_required,
            sort_order: order + 1,
            updated_at: NOW,
          });
          contentFields.push(childrenContentField);
          fieldsByTypeWithFile.NESTED_ARRAY_CHILD.data.push(
            new ContentNestedArrayChildField({
              nested_array_field_id: contentNestedArrayField.id,
              child_field_id: childrenContentField.id,
              updated_at: NOW,
            })
          );
          switch (children.type) {
            case TYPE.TEXT:
              fieldsByTypeWithFile.TEXT.data.push(
                new ContentTextField({
                  field_id: childrenContentField.id,
                  updated_at: NOW,
                })
              );
              break;
            case TYPE.TEXTAREA:
              fieldsByTypeWithFile.TEXTAREA.data.push(
                new ContentTextAreaField({
                  field_id: childrenContentField.id,
                  updated_at: NOW,
                })
              );
              break;
            case TYPE.IMAGE:
              fieldsByTypeWithFile.IMAGE.data.push(
                new ContentImageField({
                  field_id: childrenContentField.id,
                  updated_at: NOW,
                })
              );
              break;
            case TYPE.RICH_TEXT:
              fieldsByTypeWithFile.RICH_TEXT.data.push(
                new ContentRichTextField({
                  field_id: childrenContentField.id,
                  updated_at: NOW,
                })
              );
              break;
            default:
              console.error("不明なフィールドタイプ");
              break;
          }
        });
        break;
      }
      default:
        console.error("不明なフィールドタイプ");
        break;
    }
  });
};

/**
 * 記事のCSVを読み込んで処理している
 * タイトルはデフォルトのtitle
 * カテゴリ: multi_taxonomy
 * トピック: multi_taxonomy
 * シリーズ: multi_taxonomy
 * 筆者: multi_taxonomy
 * サムネイル: image
 * 記事本文へのサムネイル表示について: checkbox
 * 概要: textarea
 * 内容: nested_arrayで「ページ」というlabelでrich_editorが入る
 */
export const createContentFromCSVForArticle = (
  contentSettingId: ContentSetting["id"],
  fieldArray: FieldArrayItem[],
  contentFields: ContentField[],
  terms: Term[],
  contentValues: Content[],
  _contentAssets: ContentAsset[],
  valuesByTypeWithFile: ValuesByTypeWithFile
) => {
  console.log("=== createContentFromCSVForArticle 開始 ===");
  console.log("contentSettingId:", contentSettingId);

  const dataRows = readCsvFile(
    getFilePath(INPUT_CSV_DIR, "content_articles.csv")
  );
  console.log("CSV行数:", dataRows.length);

  for (const row of dataRows.slice(1)) {
    console.log("処理中の行:", row);
    const rowKeyValue = getRowToKeyValue(dataRows[0], row);
    console.log("rowKeyValue:", rowKeyValue);

    if (rowKeyValue === null) {
      console.log("rowKeyValueがnullのためスキップ");
      return valuesByTypeWithFile;
    }

    // CSVのIDをslugとして使用
    const contentSlug = rowKeyValue["ID"] || uuidv4();
    console.log("使用するslug:", contentSlug);

    const content = new Content({
      setting_id: contentSettingId,
      site_id: SITE_ID,
      title: rowKeyValue["タイトル"],
      slug: contentSlug, // CSVのIDをslugとして使用
      status: STATUS.PUBLISHED,
      published_at: CREATED_AT,
      updated_at: NOW,  
    });
    console.log("作成されたContent:", content);
    contentValues.push(content);
    console.log("contentValues.length:", contentValues.length);

    fieldArray.map((item) => {
      console.log("処理中のフィールド:", item);
      switch (item.type) {
        case TYPE.TEXT:
          if (!rowKeyValue[item.label]) {
            console.log(`${item.label}の値が空のためスキップ`);
            break;
          }
          console.log(`${item.label}の値を処理中:`, rowKeyValue[item.label]);
          valuesByTypeWithFile.TEXT.data.push(
            new ContentTextValue({
              content_id: content.id,
              field_id:
                contentFields.find(
                  (i) =>
                    i.name === item.name && i.setting_id === contentSettingId && i.label === item.label
                )?.id || "",
              value: rowKeyValue[item.label], 
              updated_at: NOW,
            })
          );
          break;
        case TYPE.TEXTAREA:
          if (!rowKeyValue[item.label]) {
            console.log(`${item.label}の値が空のためスキップ`);
            break;
          }
          console.log(`${item.label}の値を処理中:`, rowKeyValue[item.label]);
          valuesByTypeWithFile.TEXTAREA.data.push(
            new ContentTextAreaValue({
              content_id: content.id,
              field_id:
                contentFields.find(
                  (i) =>
                    i.name === item.name && i.setting_id === contentSettingId
                )?.id || "",
              value: rowKeyValue[item.label],
              updated_at: NOW,
            })
          );
          break;
        case TYPE.MULTI_TAXONOMY:
          if (!rowKeyValue[item.label]) {
            console.log(`${item.label}の値が空のためスキップ`);
            break;
          }
          console.log(`${item.label}の値を処理中:`, rowKeyValue[item.label]);
          const getValue = (
            value: string,
            data: { id: string; name: string }[]
          ) => {
            const values = value.split(",").map((v) => v.trim());
            return values
              .map((v) => {
                const term = data.find((d) => d.name === v);
                return term?.id || "";
              })
              .filter((id) => id !== "");
          };
          if (item.label === "カテゴリ") {
            const data = terms.filter(term => term.taxonomy_id === item.taxonomy_id);
            const termIds = getValue(rowKeyValue[item.label], data);
            console.log("カテゴリのtermIds:", termIds);
            termIds.map((id) => {
              valuesByTypeWithFile.MULTI_TAXONOMY.data.push(
                new ContentMultiTaxonomyValue({
                  content_id: content.id,
                  field_id:
                    contentFields.find(
                      (i) =>
                        i.name === item.name &&
                        i.setting_id === contentSettingId
                    )?.id || "",
                  term_id: id,
                  updated_at: NOW,
                })
              );
            });
          } else if (item.label === "トピック") {
            const data = terms.filter(term => term.taxonomy_id === item.taxonomy_id);
            const termIds = getValue(rowKeyValue[item.label], data);
            console.log("トピックのtermIds:", termIds);
            termIds.map((id) => {
              valuesByTypeWithFile.MULTI_TAXONOMY.data.push(
                new ContentMultiTaxonomyValue({
                  content_id: content.id,
                  field_id:
                    contentFields.find(
                      (i) =>
                        i.name === item.name &&
                        i.setting_id === contentSettingId
                    )?.id || "",
                  term_id: id,
                  updated_at: NOW,
                })
              );
            });
          } else if (item.label === "シリーズ") {
            const data = terms.filter(term => term.taxonomy_id === item.taxonomy_id);
            const termIds = getValue(rowKeyValue[item.label], data);
            console.log("シリーズのtermIds:", termIds);
            termIds.map((id) => {
              valuesByTypeWithFile.MULTI_TAXONOMY.data.push(
                new ContentMultiTaxonomyValue({
                  content_id: content.id,
                  field_id:
                    contentFields.find(
                      (i) =>
                        i.name === item.name &&
                        i.setting_id === contentSettingId
                    )?.id || "",
                  term_id: id,
                  updated_at: NOW,
                })
              );
            });
          } else if (item.label === "筆者") {
            const data = terms.filter(term => term.taxonomy_id === item.taxonomy_id);
            const termIds = getValue(rowKeyValue[item.label], data);
            console.log("筆者のtermIds:", termIds);
            termIds.map((id) => {
              valuesByTypeWithFile.MULTI_TAXONOMY.data.push(
                new ContentMultiTaxonomyValue({
                  content_id: content.id,
                  field_id:
                    contentFields.find(
                      (i) =>
                        i.name === item.name &&
                        i.setting_id === contentSettingId
                    )?.id || "",
                  term_id: id,
                  updated_at: NOW,
                })
              );
            });
          }
          break;
        case TYPE.IMAGE:
          if (!rowKeyValue[item.label]) {
            console.log(`${item.label}の値が空のためスキップ`);
            break;
          }
          console.log(`${item.label}の値を処理中:`, rowKeyValue[item.label]);
          
          // 画像ファイルを処理してContentAssetを作成
          const getImagePath = (fileName: string) => {
            const img = path.join(INPUT_IMAGE_DIR, fileName);
            let imageInfo;
            
            if (!fs.existsSync(img)) {
              console.error(`存在しない画像: ${img}`);
              // ファイルが存在しない場合でもContentAssetを作成
              const ext = path.extname(fileName);
              // ディレクトリパスを含めたファイル名を使用
              imageInfo = {
                ext: ext,
                fileName: fileName, // ディレクトリパスを含む
                mimeType: "image/jpeg", // デフォルト
                size: 0
              };
            } else {
              imageInfo = getImageInfo(INPUT_IMAGE_DIR, fileName);
              // getImageInfoのfileNameは拡張子を含む完全なファイル名なので、そのまま使用
            }
            
            // s3_keyはcontent_image_valuesの値からベースURLを除いた形にする
            const s3Key = `${DISPLAY_ID}/${fileName.replace(/\.[^/.]+$/, "")}`;
            const contentAsset = new ContentAsset({
              content_setting_id: contentSettingId,
              filename: fileName, // ディレクトリパスを含む
              mime_type: imageInfo.mimeType,
              file_size: imageInfo.size,
              s3_key: s3Key,
              updated_at: NOW,
            });
            _contentAssets.push(contentAsset);
            
            // ファイルが存在する場合はコピー
            if (fs.existsSync(img)) {
              copyFileToOutput(OUTPUT_IMAGE_DIR, fileName, img);
            }
            
            // content_image_valuesには拡張子なしのURL形式を設定
            const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
            return `${POST_ASSET_DOMAIN}/${DISPLAY_ID}/${fileNameWithoutExt}`;
          };
          
          const imagePath = getImagePath(rowKeyValue[item.label]);
          valuesByTypeWithFile.IMAGE.data.push(
            new ContentImageValue({
              content_id: content.id,
              field_id:
                contentFields.find(
                  (i) =>
                    i.name === item.name && i.setting_id === contentSettingId
                )?.id || "",
              value: imagePath,
              updated_at: NOW,
            })
          );
          break;
        case TYPE.RADIO:
          if (!rowKeyValue[item.label]) {
            console.log(`${item.label}の値が空のためスキップ`);
            break;
          }
          console.log(`${item.label}の値を処理中:`, rowKeyValue[item.label]);
          valuesByTypeWithFile.RADIO.data.push(
            new ContentRadioValue({
              content_id: content.id,
              field_id:
                contentFields.find(
                  (i) =>
                    i.name === item.name && i.setting_id === contentSettingId
                )?.id || "",
              value: rowKeyValue[item.label],
              updated_at: NOW,
            })
          );
          break;
        case TYPE.CHECKBOX:
          console.log(`${item.label}のcheckbox値を処理中`);
          // checkboxフィールドは常にfalseで初期化
          valuesByTypeWithFile.CHECKBOX.data.push(
            new ContentCheckboxValue({
              content_id: content.id,
              field_id:
                contentFields.find(
                  (i) =>
                    i.name === item.name && i.setting_id === contentSettingId
                )?.id || "",
              value: false, // デフォルトでfalse
              updated_at: NOW,
            })
          );
          break;
        case TYPE.NESTED_ARRAY:
          console.log("NESTED_ARRAY処理中:", item.label);
          if (item.label === "内容") {
            for (let current = 0; current < item.contentCurrent; current++) {
              for (const children of item.children) {
                const nestedIndex = current + 1;
                console.log(
                  `nestedIndex: ${nestedIndex}, children.label: ${children.label}`
                );

                if (children.label === "ページ" && rowKeyValue["ページ"]) {
                  console.log(`ページの値を処理中:`, rowKeyValue["ページ"]);
                  
                  // rich text内のimgタグのパスを変更する処理（ベースURL変換と拡張子除去）
                  const processRichTextImages = (htmlContent: string) => {
                    const dom = new JSDOM(htmlContent);
                    const document = dom.window.document;
                    const images = document.querySelectorAll("img");
                    const imageArray = Array.from(images);
                    
                    if (imageArray.length > 0) {
                      imageArray.forEach((img) => {
                        const src = (img as HTMLImageElement).getAttribute("src");
                        if (src) {
                          // ベースURLを変換し拡張子を除去
                          if (src.startsWith('https://www.jacom.or.jp/')) {
                            const newSrc = src
                              .replace('https://www.jacom.or.jp/', 'https://assets.stg.coreda.biz/jacom/')
                              .replace(/\.(jpg|jpeg|png|gif|pdf|webp)$/i, '');
                            (img as HTMLImageElement).setAttribute("src", newSrc);
                          }
                          
                          // srcからディレクトリパスを含むファイル名を抽出
                          let fileName;
                          if (src.startsWith('https://www.jacom.or.jp/')) {
                            // https://www.jacom.or.jp/ の後ろの部分を取得
                            fileName = src.replace('https://www.jacom.or.jp/', '');
                          } else {
                            // その他の場合は従来通りファイル名のみ
                            fileName = src.split("/").pop();
                          }
                          
                          if (fileName) {
                            // 画像パスは変換せず、アセットの作成のみ行う
                            const img = path.join(INPUT_IMAGE_DIR, fileName);
                            let imageInfo;
                            
                            if (!fs.existsSync(img)) {
                              console.error(`存在しない画像: ${img}`);
                              // ファイルが存在しない場合でもContentAssetを作成
                              const ext = path.extname(fileName);
                              imageInfo = {
                                ext: ext,
                                fileName: fileName, // ディレクトリパスを含む
                                mimeType: "image/jpeg", // デフォルト
                                size: 0
                              };
                            } else {
                              imageInfo = getImageInfo(INPUT_IMAGE_DIR, fileName);
                            }
                            
                            const contentAsset = new ContentAsset({
                              content_setting_id: contentSettingId,
                              filename: fileName, // ディレクトリパスを含む
                              mime_type: imageInfo.mimeType,
                              file_size: imageInfo.size,
                              updated_at: NOW,
                            });
                            _contentAssets.push(contentAsset);
                            
                            // ファイルが存在する場合はコピー
                            if (fs.existsSync(img)) {
                              copyFileToOutput(OUTPUT_IMAGE_DIR, fileName, img);
                            }
                          }
                        }
                      });
                    }
                    
                    return dom.serialize();
                  };
                  
                  const processedHtml = processRichTextImages(rowKeyValue["ページ"]);
                  
                  valuesByTypeWithFile.RICH_TEXT.data.push(
                    new ContentRichTextValue({
                      content_id: content.id,
                      field_id:
                        contentFields.find(
                          (i) =>
                            i.name === children.name &&
                            i.setting_id === contentSettingId
                        )?.id || "",
                      value: processedHtml,
                      nested_array_index: nestedIndex,
                      updated_at: NOW,
                    })
                  );
                }
              }
            }
          }
          break;
        default:
          console.error("不明なフィールドタイプ:", item.type);
          break;
      }
    });
  }
  console.log("=== createContentFromCSVForArticle 終了 ===");
  console.log("最終的なcontentValues.length:", contentValues.length);
  console.log("最終的なvaluesByTypeWithFile:", valuesByTypeWithFile);
};

/**
 * 病害虫情報のCSVを読み込んで処理している
 * 病害虫情報のタイトルはデフォルトのtitle(タイトル)
 * カテゴリ: multi_taxonomy -
 * トピック: multi_taxonomy -
 * アラートタイプ: radio 
 * 都道府県: multi_taxonomy
 * 作物: multi_taxonomy
 * 病気の種類: text
 * 発令日 ※2025-01-01のように入力: text
 * サムネイル: image
 * 記事本文へのサムネイル表示について: checkbox
 * 概要: textarea
 * 内容: nested_arrayで「ページ」というlabelでrich_editorが入る
 */

export const createContentFromCSVForPestInfo = (
  contentSettingId: ContentSetting["id"],
  fieldArray: FieldArrayItem[],
  contentFields: ContentField[],
  terms: Term[],
  contentValues: Content[],
  _contentAssets: ContentAsset[],
  valuesByTypeWithFile: ValuesByTypeWithFile
) => {
  console.log("=== createContentFromCSVForPestInfo 開始 ===");
  console.log("contentSettingId:", contentSettingId);

  const dataRows = readCsvFile(
    getFilePath(INPUT_CSV_DIR, "content_pestinfos.csv")
  );
  console.log("CSV行数:", dataRows.length);

  for (const row of dataRows.slice(1)) {
    console.log("処理中の行:", row);
    const rowKeyValue = getRowToKeyValue(dataRows[0], row);
    console.log("rowKeyValue:", rowKeyValue);

    if (rowKeyValue === null) {
      console.log("rowKeyValueがnullのためスキップ");
      return valuesByTypeWithFile;
    }

    // CSVのIDをslugとして使用
    const contentSlug = rowKeyValue["ID"] || uuidv4();
    console.log("使用するslug:", contentSlug);

    const content = new Content({
      setting_id: contentSettingId,
      site_id: SITE_ID,
      title: rowKeyValue["タイトル"],
      slug: contentSlug, // CSVのIDをslugとして使用
      status: STATUS.PUBLISHED,
      published_at: CREATED_AT,
      updated_at: NOW,
    });
    console.log("作成されたContent:", content);
    contentValues.push(content);
    console.log("contentValues.length:", contentValues.length);

    fieldArray.map((item) => {
      console.log("処理中のフィールド:", item);
      switch (item.type) {
        case TYPE.TEXT:
          if (!rowKeyValue[item.label]) {
            console.log(`${item.label}の値が空のためスキップ`);
            break;
          }
          console.log(`${item.label}の値を処理中:`, rowKeyValue[item.label]);
          valuesByTypeWithFile.TEXT.data.push(
            new ContentTextValue({
              content_id: content.id,
              field_id:
                contentFields.find(
                  (i) =>
                    i.name === item.name && i.setting_id === contentSettingId && i.label === item.label
                )?.id || "",
              value: rowKeyValue[item.label], 
              updated_at: NOW,
            })
          );
          break;
        case TYPE.TEXTAREA:
          if (!rowKeyValue[item.label]) {
            console.log(`${item.label}の値が空のためスキップ`);
            break;
          }
          console.log(`${item.label}の値を処理中:`, rowKeyValue[item.label]);
          valuesByTypeWithFile.TEXTAREA.data.push(
            new ContentTextAreaValue({
              content_id: content.id,
              field_id:
                contentFields.find(
                  (i) =>
                    i.name === item.name && i.setting_id === contentSettingId
                )?.id || "",
              value: rowKeyValue[item.label],
              updated_at: NOW,
            })
          );
          break;
        case TYPE.MULTI_TAXONOMY:
          if (!rowKeyValue[item.label]) {
            console.log(`${item.label}の値が空のためスキップ`);
            break;
          }
          console.log(`${item.label}の値を処理中:`, rowKeyValue[item.label]);
          const getValue = (
            value: string,
            data: { id: string; name: string }[]
          ) => {
            const values = value.split(",").map((v) => v.trim());
            return values
              .map((v) => {
                const term = data.find((d) => d.name === v);
                return term?.id || "";
              })
              .filter((id) => id !== "");
          };
          // カテゴリ、トピック、シリーズ、筆者、都道府県、作物、病気の種類の処理を統合
          if (["カテゴリ", "トピック", "都道府県", "作物"].includes(item.label)) {
            const data = terms.filter(term => term.taxonomy_id === item.taxonomy_id);
            const termIds = getValue(rowKeyValue[item.label], data);
            console.log(`${item.label}のtermIds:`, termIds);
            
            termIds.forEach((id) => {
              valuesByTypeWithFile.MULTI_TAXONOMY.data.push(
                new ContentMultiTaxonomyValue({
                  content_id: content.id,
                  field_id:
                    contentFields.find(
                      (i) =>
                        i.name === item.name &&
                        i.setting_id === contentSettingId
                    )?.id || "",
                  term_id: id,
                  updated_at: NOW,
                })
              );
            });
          }
          break;
        case TYPE.IMAGE:
          if (!rowKeyValue[item.label]) {
            console.log(`${item.label}の値が空のためスキップ`);
            break;
          }
          console.log(`${item.label}の値を処理中:`, rowKeyValue[item.label]);
          
          // 画像ファイルを処理してContentAssetを作成
          const getImagePath = (fileName: string) => {
            const img = path.join(INPUT_IMAGE_DIR, fileName);
            let imageInfo;
            
            if (!fs.existsSync(img)) {
              console.error(`存在しない画像: ${img}`);
              // ファイルが存在しない場合でもContentAssetを作成
              const ext = path.extname(fileName);
              // ディレクトリパスを含めたファイル名を使用
              imageInfo = {
                ext: ext,
                fileName: fileName, // ディレクトリパスを含む
                mimeType: "image/jpeg", // デフォルト
                size: 0
              };
            } else {
              imageInfo = getImageInfo(INPUT_IMAGE_DIR, fileName);
              // getImageInfoのfileNameは拡張子を含む完全なファイル名なので、そのまま使用
            }
            
            // s3_keyはcontent_image_valuesの値からベースURLを除いた形にする
            const s3Key = `${DISPLAY_ID}/${fileName.replace(/\.[^/.]+$/, "")}`;
            const contentAsset = new ContentAsset({
              content_setting_id: contentSettingId,
              filename: fileName, // ディレクトリパスを含む
              mime_type: imageInfo.mimeType,
              file_size: imageInfo.size,
              s3_key: s3Key,
              updated_at: NOW,
            });
            _contentAssets.push(contentAsset);
            
            // ファイルが存在する場合はコピー
            if (fs.existsSync(img)) {
              copyFileToOutput(OUTPUT_IMAGE_DIR, fileName, img);
            }
            
            // content_image_valuesには拡張子なしのURL形式を設定
            const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
            return `${POST_ASSET_DOMAIN}/${DISPLAY_ID}/${fileNameWithoutExt}`;
          };
          
          const imagePath = getImagePath(rowKeyValue[item.label]);
          valuesByTypeWithFile.IMAGE.data.push(
            new ContentImageValue({
              content_id: content.id,
              field_id:
                contentFields.find(
                  (i) =>
                    i.name === item.name && i.setting_id === contentSettingId
                )?.id || "",
              value: imagePath,
              updated_at: NOW,
            })
          );
          break;
        case TYPE.RADIO:
          if (!rowKeyValue[item.label]) {
            console.log(`${item.label}の値が空のためスキップ`);
            break;
          }
          console.log(`${item.label}の値を処理中:`, rowKeyValue[item.label]);
          valuesByTypeWithFile.RADIO.data.push(
            new ContentRadioValue({
              content_id: content.id,
              field_id:
                contentFields.find(
                  (i) =>
                    i.name === item.name && i.setting_id === contentSettingId
                )?.id || "",
              value: rowKeyValue[item.label],
              updated_at: NOW,
            })
          );
          break;
        case TYPE.CHECKBOX:
          console.log(`${item.label}のcheckbox値を処理中`);
          // checkboxフィールドは常にfalseで初期化
          valuesByTypeWithFile.CHECKBOX.data.push(
            new ContentCheckboxValue({
              content_id: content.id,
              field_id:
                contentFields.find(
                  (i) =>
                    i.name === item.name && i.setting_id === contentSettingId
                )?.id || "",
              value: false, // デフォルトでfalse
              updated_at: NOW,
            })
          );
          break;
        case TYPE.NESTED_ARRAY:
          console.log("NESTED_ARRAY処理中:", item.label);
          if (item.label === "内容") {
            for (let current = 0; current < item.contentCurrent; current++) {
              for (const children of item.children) {
                const nestedIndex = current + 1;
                console.log(
                  `nestedIndex: ${nestedIndex}, children.label: ${children.label}`
                );

                if (children.label === "ページ" && rowKeyValue["ページ"]) {
                  console.log(`ページの値を処理中:`, rowKeyValue["ページ"]);
                  
                  // rich text内のimgタグのパスを変更する処理
                  const processRichTextImages = (htmlContent: string) => {
                    const dom = new JSDOM(htmlContent);
                    const document = dom.window.document;
                    const images = document.querySelectorAll("img");
                    const imageArray = Array.from(images);
                    
                    if (imageArray.length > 0) {
                      const getImagePath = (fileName: string) => {
                        const img = path.join(INPUT_IMAGE_DIR, fileName);
                        let imageInfo;
                        
                        if (!fs.existsSync(img)) {
                          console.error(`存在しない画像: ${img}`);
                          // ファイルが存在しない場合でもContentAssetを作成
                          const ext = path.extname(fileName);
                          const name = path.basename(fileName); // 拡張子を除去しない
                          imageInfo = {
                            ext: ext,
                            fileName: name,
                            mimeType: "image/jpeg", // デフォルト
                            size: 0
                          };
                        } else {
                          imageInfo = getImageInfo(INPUT_IMAGE_DIR, fileName);
                          // getImageInfoのfileNameは拡張子を含む完全なファイル名なので、そのまま使用
                        }
                        
                        // s3_keyはcontent_image_valuesの値からベースURLを除いた形にする
                        const s3Key = `${DISPLAY_ID}/${imageInfo.fileName.replace(/\.[^/.]+$/, "")}`;
                        const contentAsset = new ContentAsset({
                          content_setting_id: contentSettingId,
                          filename: imageInfo.fileName,
                          mime_type: imageInfo.mimeType,
                          file_size: imageInfo.size,  
                          s3_key: s3Key,
                          updated_at: NOW,
                        });
                        _contentAssets.push(contentAsset);
                        
                        // ファイルが存在する場合はコピー
                        if (fs.existsSync(img)) {
                          copyFileToOutput(OUTPUT_IMAGE_DIR, imageInfo.fileName, img);
                        }
                        
                        // URLの末尾を拡張子なしのファイル名にする
                        const fileNameWithoutExt = imageInfo.fileName.replace(/\.[^/.]+$/, "");
                        return `${POST_ASSET_DOMAIN}/${DISPLAY_ID}/${fileNameWithoutExt}`;
                      };
                      
                      imageArray.forEach((img) => {
                        const src = (img as HTMLImageElement).getAttribute("src");
                        if (src) {
                          // srcから画像ファイル名を抽出（URLの最後の部分）
                          const fileName = src.split("/").pop();
                          if (fileName) {
                            const imgPath = getImagePath(fileName);
                            (img as HTMLImageElement).setAttribute("src", imgPath);
                          }
                        }
                      });
                    }
                    
                    return dom.serialize();
                  };
                  
                  const processedHtml = processRichTextImages(rowKeyValue["ページ"]);
                  
                  valuesByTypeWithFile.RICH_TEXT.data.push(
                    new ContentRichTextValue({
                      content_id: content.id,
                      field_id:
                        contentFields.find(
                          (i) =>
                            i.name === children.name &&
                            i.setting_id === contentSettingId
                        )?.id || "",
                      value: processedHtml,
                      nested_array_index: nestedIndex,
                      updated_at: NOW,
                    })
                  );
                }
              }
            }
          }
          break;
        default:
          console.error("不明なフィールドタイプ:", item.type);
          break;
      }
    });
  }
  console.log("=== createContentFromCSVForArticle 終了 ===");
  console.log("最終的なcontentValues.length:", contentValues.length);
  console.log("最終的なvaluesByTypeWithFile:", valuesByTypeWithFile);
}

/**
 * 人事記事のスキーマ定義
 * 人事記事のタイトルはデフォルトのtitle(タイトル)
 * カテゴリ: multi_taxonomy - 共通
 * トピック: multi_taxonomy - 共通
 * 人事区分: radio - 単協人事OR県連人事
 * JA名: text - 単協人事のみ
 * 人事異動の発効日: text - 単協人事のみ（改選日）
 * 都道府県: multi_taxonomy - 単協AND県連
 * 全国連人事: radio - 全国連のみ（全中、全農等）
 * サムネイル: image - 一覧表示用
 * 記事本文へのサムネイル表示について: checkbox
 * 概要: textarea - 記事の説明文
 * 内容: nested_arrayで「ページ」というlabelでrich_editorが入る
 */

export const createContentFromCSVForHR = (
  contentSettingId: ContentSetting["id"],
  fieldArray: FieldArrayItem[],
  contentFields: ContentField[],
  terms: Term[],
  contentValues: Content[],
  _contentAssets: ContentAsset[],
  valuesByTypeWithFile: ValuesByTypeWithFile
) => {
  console.log("=== createContentFromCSVForPestInfo 開始 ===");
  console.log("contentSettingId:", contentSettingId);

  const dataRows = readCsvFile(
    getFilePath(INPUT_CSV_DIR, "content_humanresouces.csv")
  );
  console.log("CSV行数:", dataRows.length);

  for (const row of dataRows.slice(1)) {
    console.log("処理中の行:", row);
    const rowKeyValue = getRowToKeyValue(dataRows[0], row);
    console.log("rowKeyValue:", rowKeyValue);

    if (rowKeyValue === null) {
      console.log("rowKeyValueがnullのためスキップ");
      return valuesByTypeWithFile;
    }

    // CSVのIDをslugとして使用
    const contentSlug = rowKeyValue["ID"] || uuidv4();
    console.log("使用するslug:", contentSlug);

    const content = new Content({
      setting_id: contentSettingId,
      site_id: SITE_ID,
      title: rowKeyValue["タイトル"],
      slug: contentSlug, // CSVのIDをslugとして使用
      status: STATUS.PUBLISHED,
      published_at: CREATED_AT,
      updated_at: NOW,
    });
    console.log("作成されたContent:", content);
    contentValues.push(content);
    console.log("contentValues.length:", contentValues.length);

    fieldArray.map((item) => {
      console.log("処理中のフィールド:", item);
      switch (item.type) {
        case TYPE.TEXT:
          if (!rowKeyValue[item.label]) {
            console.log(`${item.label}の値が空のためスキップ`);
            break;
          }
          console.log(`${item.label}の値を処理中:`, rowKeyValue[item.label]);
          valuesByTypeWithFile.TEXT.data.push(
            new ContentTextValue({
              content_id: content.id,
              field_id:
                contentFields.find(
                  (i) =>
                    i.name === item.name && i.setting_id === contentSettingId && i.label === item.label
                )?.id || "",
              value: rowKeyValue[item.label], 
              updated_at: NOW,
            })
          );
          break;
        case TYPE.TEXTAREA:
          if (!rowKeyValue[item.label]) {
            console.log(`${item.label}の値が空のためスキップ`);
            break;
          }
          console.log(`${item.label}の値を処理中:`, rowKeyValue[item.label]);
          valuesByTypeWithFile.TEXTAREA.data.push(
            new ContentTextAreaValue({
              content_id: content.id,
              field_id:
                contentFields.find(
                  (i) =>
                    i.name === item.name && i.setting_id === contentSettingId
                )?.id || "",
              value: rowKeyValue[item.label],
              updated_at: NOW,
            })
          );
          break;
        case TYPE.MULTI_TAXONOMY:
          if (!rowKeyValue[item.label]) {
            console.log(`${item.label}の値が空のためスキップ`);
            break;
          }
          console.log(`${item.label}の値を処理中:`, rowKeyValue[item.label]);
          const getValue = (
            value: string,
            data: { id: string; name: string }[]
          ) => {
            const values = value.split(",").map((v) => v.trim());
            return values
              .map((v) => {
                const term = data.find((d) => d.name === v);
                return term?.id || "";
              })
              .filter((id) => id !== "");
          };
          // カテゴリ、トピック、シリーズ、筆者、都道府県、作物、病気の種類の処理を統合
          if (["カテゴリ", "トピック", "都道府県", "作物"].includes(item.label)) {
            const data = terms.filter(term => term.taxonomy_id === item.taxonomy_id);
            const termIds = getValue(rowKeyValue[item.label], data);
            console.log(`${item.label}のtermIds:`, termIds);
            
            termIds.forEach((id) => {
              valuesByTypeWithFile.MULTI_TAXONOMY.data.push(
                new ContentMultiTaxonomyValue({
                  content_id: content.id,
                  field_id:
                    contentFields.find(
                      (i) =>
                        i.name === item.name &&
                        i.setting_id === contentSettingId
                    )?.id || "",
                  term_id: id,
                  updated_at: NOW,
                })
              );
            });
          }
          break;
        case TYPE.IMAGE:
          if (!rowKeyValue[item.label]) {
            console.log(`${item.label}の値が空のためスキップ`);
            break;
          }
          console.log(`${item.label}の値を処理中:`, rowKeyValue[item.label]);
          
          // 画像ファイルを処理してContentAssetを作成
          const getImagePath = (fileName: string) => {
            const img = path.join(INPUT_IMAGE_DIR, fileName);
            let imageInfo;
            
            if (!fs.existsSync(img)) {
              console.error(`存在しない画像: ${img}`);
              // ファイルが存在しない場合でもContentAssetを作成
              const ext = path.extname(fileName);
              // ディレクトリパスを含めたファイル名を使用
              imageInfo = {
                ext: ext,
                fileName: fileName, // ディレクトリパスを含む
                mimeType: "image/jpeg", // デフォルト
                size: 0
              };
            } else {
              imageInfo = getImageInfo(INPUT_IMAGE_DIR, fileName);
              // getImageInfoのfileNameは拡張子を含む完全なファイル名なので、そのまま使用
            }
            
            // s3_keyはcontent_image_valuesの値からベースURLを除いた形にする
            const s3Key = `${DISPLAY_ID}/${fileName.replace(/\.[^/.]+$/, "")}`;
            const contentAsset = new ContentAsset({
              content_setting_id: contentSettingId,
              filename: fileName, // ディレクトリパスを含む
              mime_type: imageInfo.mimeType,
              file_size: imageInfo.size,
              s3_key: s3Key,
              updated_at: NOW,
            });
            _contentAssets.push(contentAsset);
            
            // ファイルが存在する場合はコピー
            if (fs.existsSync(img)) {
              copyFileToOutput(OUTPUT_IMAGE_DIR, fileName, img);
            }
            
            // content_image_valuesには拡張子なしのURL形式を設定
            const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
            return `${POST_ASSET_DOMAIN}/${DISPLAY_ID}/${fileNameWithoutExt}`;
          };
          
          const imagePath = getImagePath(rowKeyValue[item.label]);
          valuesByTypeWithFile.IMAGE.data.push(
            new ContentImageValue({
              content_id: content.id,
              field_id:
                contentFields.find(
                  (i) =>
                    i.name === item.name && i.setting_id === contentSettingId
                )?.id || "",
              value: imagePath,
              updated_at: NOW,
            })
          );
          break;
        case TYPE.RADIO:
          if (!rowKeyValue[item.label]) {
            console.log(`${item.label}の値が空のためスキップ`);
            break;
          }
          console.log(`${item.label}の値を処理中:`, rowKeyValue[item.label]);
          valuesByTypeWithFile.RADIO.data.push(
            new ContentRadioValue({
              content_id: content.id,
              field_id:
                contentFields.find(
                  (i) =>
                    i.name === item.name && i.setting_id === contentSettingId
                )?.id || "",
              value: rowKeyValue[item.label],
              updated_at: NOW,
            })
          );
          break;
        case TYPE.CHECKBOX:
          console.log(`${item.label}のcheckbox値を処理中`);
          // checkboxフィールドは常にfalseで初期化
          valuesByTypeWithFile.CHECKBOX.data.push(
            new ContentCheckboxValue({
              content_id: content.id,
              field_id:
                contentFields.find(
                  (i) =>
                    i.name === item.name && i.setting_id === contentSettingId
                )?.id || "",
              value: false, // デフォルトでfalse
              updated_at: NOW,
            })
          );
          break;
        case TYPE.NESTED_ARRAY:
          console.log("NESTED_ARRAY処理中:", item.label);
          if (item.label === "内容") {
            for (let current = 0; current < item.contentCurrent; current++) {
              for (const children of item.children) {
                const nestedIndex = current + 1;
                console.log(
                  `nestedIndex: ${nestedIndex}, children.label: ${children.label}`
                );

                if (children.label === "ページ" && rowKeyValue["ページ"]) {
                  console.log(`ページの値を処理中:`, rowKeyValue["ページ"]);
                  
                  // rich text内のimgタグのパスを変更する処理
                  const processRichTextImages = (htmlContent: string) => {
                    const dom = new JSDOM(htmlContent);
                    const document = dom.window.document;
                    const images = document.querySelectorAll("img");
                    const imageArray = Array.from(images);
                    
                    if (imageArray.length > 0) {
                      const getImagePath = (fileName: string) => {
                        const img = path.join(INPUT_IMAGE_DIR, fileName);
                        let imageInfo;
                        
                        if (!fs.existsSync(img)) {
                          console.error(`存在しない画像: ${img}`);
                          // ファイルが存在しない場合でもContentAssetを作成
                          const ext = path.extname(fileName);
                          const name = path.basename(fileName); // 拡張子を除去しない
                          imageInfo = {
                            ext: ext,
                            fileName: name,
                            mimeType: "image/jpeg", // デフォルト
                            size: 0
                          };
                        } else {
                          imageInfo = getImageInfo(INPUT_IMAGE_DIR, fileName);
                          // getImageInfoのfileNameは拡張子を含む完全なファイル名なので、そのまま使用
                        }
                        
                        // s3_keyはcontent_image_valuesの値からベースURLを除いた形にする
                        const s3Key = `${DISPLAY_ID}/${imageInfo.fileName.replace(/\.[^/.]+$/, "")}`;
                        const contentAsset = new ContentAsset({
                          content_setting_id: contentSettingId,
                          filename: imageInfo.fileName,
                          mime_type: imageInfo.mimeType,
                          file_size: imageInfo.size,  
                          s3_key: s3Key,
                          updated_at: NOW,
                        });
                        _contentAssets.push(contentAsset);
                        
                        // ファイルが存在する場合はコピー
                        if (fs.existsSync(img)) {
                          copyFileToOutput(OUTPUT_IMAGE_DIR, imageInfo.fileName, img);
                        }
                        
                        // URLの末尾を拡張子なしのファイル名にする
                        const fileNameWithoutExt = imageInfo.fileName.replace(/\.[^/.]+$/, "");
                        return `${POST_ASSET_DOMAIN}/${DISPLAY_ID}/${fileNameWithoutExt}`;
                      };
                      
                      imageArray.forEach((img) => {
                        const src = (img as HTMLImageElement).getAttribute("src");
                        if (src) {
                          // srcから画像ファイル名を抽出（URLの最後の部分）
                          const fileName = src.split("/").pop();
                          if (fileName) {
                            const imgPath = getImagePath(fileName);
                            (img as HTMLImageElement).setAttribute("src", imgPath);
                          }
                        }
                      });
                    }
                    
                    return dom.serialize();
                  };
                  
                  const processedHtml = processRichTextImages(rowKeyValue["ページ"]);
                  
                  valuesByTypeWithFile.RICH_TEXT.data.push(
                    new ContentRichTextValue({
                      content_id: content.id,
                      field_id:
                        contentFields.find(
                          (i) =>
                            i.name === children.name &&
                            i.setting_id === contentSettingId
                        )?.id || "",
                      value: processedHtml,
                      nested_array_index: nestedIndex,
                      updated_at: NOW,
                    })
                  );
                }
              }
            }
          }
          break;
        default:
          console.error("不明なフィールドタイプ:", item.type);
          break;
      }
    });
  }
  console.log("=== createContentFromCSVForArticle 終了 ===");
  console.log("最終的なcontentValues.length:", contentValues.length);
  console.log("最終的なvaluesByTypeWithFile:", valuesByTypeWithFile);
}

