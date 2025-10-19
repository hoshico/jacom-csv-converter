import { CONTENTS_ID, DATABASE_NAMES, LAYOUT, TAXONOMIES_ID, TYPE } from "../common/constants";
import {
  Content,
  ContentAsset,
  ContentField,
  ContentNestedArrayField,
  Taxonomy,
  Term,
} from "../common/models";
import { FieldsByTypeWithFile, ValuesByTypeWithFile } from "../common/types";
import {
  clearDirectory,
  populateCsvAndColumns,
  writeCsvFiles,
} from "../common/utils";
import { OUTPUT_CSV_DIR, OUTPUT_IMAGE_DIR } from "./constants";
import {
  createContentFieldsFromCSV,
  createContentFromCSVForArticle,
  createContentFromCSVForPestInfo,
  createContentFromCSVForHR,
  createContentSettings,
  createTaxonomiesFromCSV,
  createTermsFromCSV,
} from "./services";
import { ContentConfigs } from "./types";

const main = () => {
  const contentAssets: ContentAsset[] = [];
  const taxonomies: Taxonomy[] = [];
  const terms: Term[] = [];
  const contentFields: ContentField[] = [];
  const contentNestedArrayFields: ContentNestedArrayField[] = [];
  // NOTE: ここで記事のデータを作成している
  const contentValues: Content[] = [];
  const fieldsByTypeWithFile: FieldsByTypeWithFile = {
    TEXT: {
      tableName: DATABASE_NAMES.CONTENT_TEXT_FIELDS_TABLE_NAME,
      data: [],
    },
    TEXTAREA: {
      tableName: DATABASE_NAMES.CONTENT_TEXT_AREA_FIELDS_TABLE_NAME,
      data: [],
    },
    MULTI_SELECT: {
      tableName: DATABASE_NAMES.CONTENT_MULTI_SELECT_FIELDS_TABLE_NAME,
      data: [],
    },
    RADIO: {
      tableName: DATABASE_NAMES.CONTENT_RADIO_FIELDS_TABLE_NAME,
      data: [],
    },
    CHECKBOXES: {
      tableName: DATABASE_NAMES.CONTENT_CHECKBOXES_FIELDS_TABLE_NAME,
      data: [],
    },
    CHECKBOX: {
      tableName: DATABASE_NAMES.CONTENT_CHECKBOX_FIELDS_TABLE_NAME,
      data: [],
    },
    IMAGE: {
      tableName: DATABASE_NAMES.CONTENT_IMAGE_FIELDS_TABLE_NAME,
      data: [],
    },
    RICH_TEXT: {
      tableName: DATABASE_NAMES.CONTENT_RICH_TEXT_FIELDS_TABLE_NAME,
      data: [],
    },
    TAXONOMY: {
      tableName: DATABASE_NAMES.CONTENT_TAXONOMY_FIELDS_TABLE_NAME,
      data: [],
    },
    MULTI_TAXONOMY: {
      tableName: DATABASE_NAMES.CONTENT_MULTI_TAXONOMY_FIELDS_TABLE_NAME,
      data: [],
    },
    NESTED_ARRAY_CHILD: {
      tableName: DATABASE_NAMES.CONTENT_NESTED_ARRAY_CHILD_FIELDS_TABLE_NAME,
      data: [],
    },
  };
  const valuesByTypeWithFile: ValuesByTypeWithFile = {
    TEXT: {
      tableName: DATABASE_NAMES.CONTENT_TEXT_VALUES_TABLE_NAME,
      data: [],
    },
    TEXTAREA: {
      tableName: DATABASE_NAMES.CONTENT_TEXT_AREA_VALUES_TABLE_NAME,
      data: [],
    },
    MULTI_SELECT: {
      tableName: DATABASE_NAMES.CONTENT_MULTI_SELECT_VALUES_TABLE_NAME,
      data: [],
    },
    RADIO: {
      tableName: DATABASE_NAMES.CONTENT_RADIO_VALUES_TABLE_NAME,
      data: [],
    },
    CHECKBOXES: {
      tableName: DATABASE_NAMES.CONTENT_CHECKBOXES_VALUES_TABLE_NAME,
      data: [],
    },
    CHECKBOX: {
      tableName: DATABASE_NAMES.CONTENT_CHECKBOX_VALUES_TABLE_NAME,
      data: [],
    },
    IMAGE: {
      tableName: DATABASE_NAMES.CONTENT_IMAGE_VALUES_TABLE_NAME,
      data: [],
    },
    RICH_TEXT: {
      tableName: DATABASE_NAMES.CONTENT_RICH_TEXT_VALUES_TABLE_NAME,
      data: [],
    },
    TAXONOMY: {
      tableName: DATABASE_NAMES.CONTENT_TAXONOMY_VALUES_TABLE_NAME,
      data: [],
    },
    MULTI_TAXONOMY: {
      tableName: DATABASE_NAMES.CONTENT_MULTI_TAXONOMY_VALUES_TABLE_NAME,
      data: [],
    },
  };

  const taxonomyData: { name: string; fileName: string; id: string }[] = [
    { name: "カテゴリ", fileName: "category_categories", id: TAXONOMIES_ID.CATEGORY },
    { name: "トピック", fileName: "category_topics", id: TAXONOMIES_ID.TOPIC },
    { name: "シリーズ", fileName: "category_series", id: TAXONOMIES_ID.SERIES },
    { name: "筆者", fileName: "category_authors", id: TAXONOMIES_ID.AUTHOR },
    { name: "都道府県", fileName: "category_prefectures", id: TAXONOMIES_ID.PREFECTURE },
    { name: "作物", fileName: "category_crops", id: TAXONOMIES_ID.CROP },
  ];
  createTaxonomiesFromCSV({ taxonomies, taxonomyData });

  for (const { name, fileName } of taxonomyData) {
    const taxonomy = taxonomies.find((i) => i.name === name);
    if (!taxonomy) continue;
    createTermsFromCSV({ terms, fileName: `${fileName}.csv`, taxonomy });
  }

  // const contentSettingsData = [{ name: "記事", id: CONTENTS_ID.ARTICLES }];
  const contentSettingsData = [{ name: "記事", id: CONTENTS_ID.ARTICLES }, { name: "病害虫情報", id: CONTENTS_ID.PESTINFOS }, { name: "人事", id: CONTENTS_ID.HUMANRESOURCE }];
  const contentSettings = createContentSettings(contentSettingsData);

  // NOTE: ここでCSVのファイルのheaderを見ている
  const contentConfigs: ContentConfigs[] = [
    {
      name: "記事",
      fieldArray: [
        // {
        //   type: TYPE.TEXT,
        //   name: "title",
        //   label: "タイトル",
        // },
        {
          type: TYPE.MULTI_TAXONOMY,
          name: "category",
          label: "カテゴリ",
          is_required: false,
          taxonomy_id: taxonomies.find((i) => i.name === "カテゴリ")?.id || "",
        },
        {
          type: TYPE.MULTI_TAXONOMY,
          name: "topic",
          label: "トピック",
          is_required: false,
          taxonomy_id: taxonomies.find((i) => i.name === "トピック")?.id || "",
        },
        {
          type: TYPE.MULTI_TAXONOMY,
          name: "series",
          label: "シリーズ",
          is_required: false,
          taxonomy_id: taxonomies.find((i) => i.name === "シリーズ")?.id || "",
        },
        {
          type: TYPE.MULTI_TAXONOMY,
          name: "author",
          label: "筆者",
          taxonomy_id: taxonomies.find((i) => i.name === "筆者")?.id || "",
        },
        {
          type: TYPE.IMAGE,
          name: "thumbnail",
          label: "サムネイル",
        },
        {
          type: TYPE.CHECKBOX,
          name: "hideThumbnailInBody",
          label: "記事本文へのサムネイル表示について",
          checkbox_label: "表示しない（チェックすると非表示になります）",
        },
        {
          type: TYPE.TEXTAREA,
          name: "description",
          label: "概要",
        },
        {
          type: TYPE.NESTED_ARRAY,
          name: "content",
          label: "内容",
          contentCurrent: 1,
          children: [
            {
              type: TYPE.RICH_TEXT,
              name: "page",
              label: "ページ",
            },
          ],
        },
        {
          type: TYPE.TEXT,
          name: "fileName",
          label: "ファイル名",
        },
      ],
      createContentFromCSV: createContentFromCSVForArticle,
    },
    {
      name: "病害虫情報",
      fieldArray: [
        // {
        //   type: TYPE.TEXT,
        //   name: "title",
        //   label: "タイトル",
        // },
        {
          type: TYPE.MULTI_TAXONOMY,
          name: "category",
          label: "カテゴリ",
          is_required: false,
          taxonomy_id: taxonomies.find((i) => i.name === "カテゴリ")?.id || "",
        },
        {
          type: TYPE.MULTI_TAXONOMY,
          name: "topic",
          label: "トピック",
          is_required: false,
          taxonomy_id: taxonomies.find((i) => i.name === "トピック")?.id || "",
        },
        {
          type: TYPE.MULTI_TAXONOMY,
          name: "prefecture",
          label: "都道府県",
          is_required: false,
          taxonomy_id: taxonomies.find((i) => i.name === "都道府県")?.id || "",
        },
        {
          type: TYPE.MULTI_TAXONOMY,
          name: "crops",
          label: "作物",
          is_required: false,
          taxonomy_id: taxonomies.find((i) => i.name === "作物")?.id || "",
        },
        // {
        //   type: TYPE.TEXT,
        //   name: "diseaseTypes",
        //   label: "病気の種類",
        // },
        {
          type: TYPE.RADIO,
          name: "alertType",
          label: "アラートタイプ",
          options: ["注意報", "特殊報", "警報"],
          layout: LAYOUT.HORIZONTAL,
        },
        {
          type: TYPE.TEXTAREA,
          name: "description",
          label: "概要",
        },
        {
          type: TYPE.IMAGE,
          name: "thumbnail",
          label: "サムネイル",
        },
        {
          type: TYPE.CHECKBOX,
          name: "hideThumbnailInBody",
          label: "記事本文へのサムネイル表示について",
          checkbox_label: "表示しない（チェックすると非表示になります）",
        },
        {
          type: TYPE.NESTED_ARRAY,
          name: "content",
          label: "内容",
          contentCurrent: 1,
          children: [
            {
              type: TYPE.RICH_TEXT,
              name: "page",
              label: "ページ",
            },
          ],
        },      
      ],
      createContentFromCSV: createContentFromCSVForPestInfo,
    },
    {
      name: "人事",
      fieldArray: [
        // {
        //   type: TYPE.TEXT,
        //   name: "title",
        //   label: "タイトル",
        // },
        {
          type: TYPE.MULTI_TAXONOMY,
          name: "category",
          label: "カテゴリ",
          is_required: false,
          taxonomy_id: taxonomies.find((i) => i.name === "カテゴリ")?.id || "",
        },
        {
          type: TYPE.MULTI_TAXONOMY,
          name: "topic",
          label: "トピック",
          is_required: false,
          taxonomy_id: taxonomies.find((i) => i.name === "トピック")?.id || "",
        },
        {
          type: TYPE.RADIO,
          name: "jinjiKubun",
          label: "人事区分",
          options: ["単協人事", "県連人事"],
          layout: LAYOUT.HORIZONTAL,
        },
        // {
        //   type: TYPE.TEXT,
        //   name: "jaName",
        //   label: "JA名",
        // },
        // {
        //   type: TYPE.TEXT,
        //   name: "announcementDate",
        //   label: "人事異動の発効日",
        // },
        {
          type: TYPE.MULTI_TAXONOMY,
          name: "prefecture",
          label: "都道府県",
          is_required: false,
          taxonomy_id: taxonomies.find((i) => i.name === "都道府県")?.id || "",
        },
        {
          type: TYPE.RADIO,
          name: "zenkokurenJinji",
          label: "全国連人事",
          options: ["全中", "全農", "JA全共連", "農林中央金庫", "JA全厚連", "文化厚生連", "(社)農協観光", "(株)農協観光", "日本農業新聞"],
          layout: LAYOUT.HORIZONTAL,
        },
        {
          type: TYPE.IMAGE,
          name: "thumbnail",
          label: "サムネイル",
        },
        {
          type: TYPE.CHECKBOX,
          name: "hideThumbnailInBody",
          label: "記事本文へのサムネイル表示について",
          checkbox_label: "表示しない（チェックすると非表示になります）",
        },
        {
          type: TYPE.TEXTAREA,
          name: "description",
          label: "概要",
        },
        {
          type: TYPE.NESTED_ARRAY,
          name: "content",
          label: "内容",
          contentCurrent: 1,
          children: [
            {
              type: TYPE.RICH_TEXT,
              name: "page",
              label: "ページ",
            },
          ],
        },
      
      ],
      createContentFromCSV: createContentFromCSVForHR,
    },
  ];
  contentConfigs.map(
    ({ name, fieldArray, createContentFromCSV }: ContentConfigs) => {
      const contentSettingId =
        contentSettings.find((i) => i.name === name)?.id || "";
      createContentFieldsFromCSV(
        contentSettingId,
        fieldArray,
        contentFields,
        contentNestedArrayFields,
        fieldsByTypeWithFile
      );
      createContentFromCSV(
        contentSettingId,
        fieldArray,
        contentFields,
        terms,
        contentValues,
        contentAssets,
        valuesByTypeWithFile
      );
    }
  );

  const dataMap = {
    [DATABASE_NAMES.CONTENT_ASSETS_TABLE_NAME]: contentAssets,
    [DATABASE_NAMES.TAXONOMIES_TABLE_NAME]: taxonomies,
    [DATABASE_NAMES.TERMS_TABLE_NAME]: terms,
    [DATABASE_NAMES.CONTENT_SETTINGS_TABLE_NAME]: contentSettings,
    [DATABASE_NAMES.CONTENT_FIELDS_TABLE_NAME]: contentFields,
    [DATABASE_NAMES.CONTENT_NESTED_ARRAY_FIELDS_TABLE_NAME]:
      contentNestedArrayFields,
    [DATABASE_NAMES.CONTENT_TABLE_NAME]: contentValues,
    ...Object.fromEntries(
      Object.values(fieldsByTypeWithFile).map(({ tableName, data }) => [
        tableName,
        data,
      ])
    ),
    ...Object.fromEntries(
      Object.values(valuesByTypeWithFile).map(({ tableName, data }) => [
        tableName,
        data,
      ])
    ),
  };

  writeCsvFiles(dataMap, OUTPUT_CSV_DIR);
};

clearDirectory(OUTPUT_CSV_DIR);
clearDirectory(OUTPUT_IMAGE_DIR);

main();
populateCsvAndColumns(OUTPUT_CSV_DIR);
