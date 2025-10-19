// export const SITE_ID = "074d5d8c-3119-42a6-b30e-9e0c2b198e65"; // TODO::実際のsite_idいれる
// export const TENANT_ID = "c417f46c-8201-4994-9fae-bd7674fd10dc"; // TODO::実際のtenant_idいれる

export const TENANT_ID = "53e59ad3-b139-4049-9c0e-ff873923f36d"; // JAcom tenant_id
export const SITE_ID = "851383be-e14a-42df-977d-8e420ec723ec"; // JAcom site_id
// cms-assets-730335482132-ap-northeast-1

export const DISPLAY_ID = "jacom"; // JACOM用のS3ディレクトリ名
// export const POST_ASSET_DOMAIN = "https://assets.coreda.biz"; // TODO::実際のcloudfrontディレクトリ名をいれる
export const POST_ASSET_DOMAIN = "https://assets.stg.coreda.biz"; // TODO::実際のcloudfrontディレクトリ名をいれる
// assets.coreda.biz

export const UPDATED_BY_NAME = "coreda";

export const CREATED_AT = new Date(Date.UTC(2020, 0, 1)); // created_at用（2020-01-01）
export const NOW = new Date(
  Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate(),
    new Date().getUTCHours(),
    new Date().getUTCMinutes(),
    new Date().getUTCSeconds(),
    new Date().getUTCMilliseconds()
  )
);
// updated_at用（処理した日の現在時刻）

export const DATABASE_NAMES = {
  CONTENT_ASSETS_TABLE_NAME: "content_assets",

  TAXONOMIES_TABLE_NAME: "taxonomies",
  TERMS_TABLE_NAME: "terms",
  CONTENT_SETTINGS_TABLE_NAME: "content_settings",
  CONTENT_FIELDS_TABLE_NAME: "content_fields",
  CONTENT_TABLE_NAME: "contents",

  CONTENT_TEXT_FIELDS_TABLE_NAME: "content_text_fields",
  CONTENT_TEXT_AREA_FIELDS_TABLE_NAME: "content_text_area_fields",
  CONTENT_MULTI_SELECT_FIELDS_TABLE_NAME: "content_multi_select_fields",
  CONTENT_RADIO_FIELDS_TABLE_NAME: "content_radio_fields",
  CONTENT_CHECKBOXES_FIELDS_TABLE_NAME: "content_checkboxes_fields",
  CONTENT_CHECKBOX_FIELDS_TABLE_NAME: "content_checkbox_fields",
  CONTENT_IMAGE_FIELDS_TABLE_NAME: "content_image_fields",
  CONTENT_RICH_TEXT_FIELDS_TABLE_NAME: "content_rich_text_fields",
  CONTENT_TAXONOMY_FIELDS_TABLE_NAME: "content_taxonomy_fields",
  CONTENT_MULTI_TAXONOMY_FIELDS_TABLE_NAME: "content_multi_taxonomy_fields",
  CONTENT_NESTED_ARRAY_FIELDS_TABLE_NAME: "content_nested_array_fields",
  CONTENT_NESTED_ARRAY_CHILD_FIELDS_TABLE_NAME:
    "content_nested_array_child_fields",

  CONTENT_TEXT_VALUES_TABLE_NAME: "content_text_values",
  CONTENT_TEXT_AREA_VALUES_TABLE_NAME: "content_text_area_values",
  CONTENT_MULTI_SELECT_VALUES_TABLE_NAME: "content_multi_select_values",
  CONTENT_RADIO_VALUES_TABLE_NAME: "content_radio_values",
  CONTENT_CHECKBOXES_VALUES_TABLE_NAME: "content_checkboxes_values",
  CONTENT_CHECKBOX_VALUES_TABLE_NAME: "content_checkbox_values",
  CONTENT_IMAGE_VALUES_TABLE_NAME: "content_image_values",
  CONTENT_RICH_TEXT_VALUES_TABLE_NAME: "content_rich_text_values",
  CONTENT_TAXONOMY_VALUES_TABLE_NAME: "content_taxonomy_values",
  CONTENT_MULTI_TAXONOMY_VALUES_TABLE_NAME: "content_multi_taxonomy_values",
} as const;

// コンテンツと分類のIDを固定に
export const CONTENTS_ID = {
  ARTICLES: "6f797a84-5138-404b-9b4d-a11c27f7f9e0",
  PESTINFOS: "07ab38f9-a39f-482b-9c95-e1f0bd959244",
  HUMANRESOURCE: "1994ee01-5be3-4d32-a249-0b9fb5c96213"
} as const;

export const TAXONOMIES_ID = {
  CATEGORY: "6e135935-cc70-4b2b-816b-a075ed11ccf9",
  TOPIC: "90bfb056-3c4a-4778-85bb-3f23d406bf3d",
  SERIES: "20cb68d9-aa5c-45da-9237-cb7489741a76",
  AUTHOR: "06de3e63-c3a2-4441-8242-bdf2e2245a2d",
  PREFECTURE: "6f77bd5d-3c20-49a9-8529-95c5eb06cfcf",
  CROP: "f234b65f-7f3b-4be0-ae2f-6589c97986ce",
} as const;

export const STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  SCHEDULED: "SCHEDULED",
} as const;
export const TYPE = {
  TEXT: "TEXT",
  TEXTAREA: "TEXTAREA",
  MULTI_SELECT: "MULTI_SELECT",
  RADIO: "RADIO",
  CHECKBOXES: "CHECKBOXES",
  CHECKBOX: "CHECKBOX",
  IMAGE: "IMAGE",
  RICH_TEXT: "RICH_TEXT",
  TAXONOMY: "TAXONOMY",
  MULTI_TAXONOMY: "MULTI_TAXONOMY",
  NESTED_ARRAY: "NESTED_ARRAY",
} as const;
export const LAYOUT = {
  HORIZONTAL: "HORIZONTAL",
  VERTICAL: "VERTICAL",
} as const;
