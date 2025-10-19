import { LAYOUT, STATUS, TYPE } from "./constants";
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
  ContentMultiSelectValue,
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
  Term,
} from "./models";

export type Type = (typeof TYPE)[keyof typeof TYPE];
export type Layout = (typeof LAYOUT)[keyof typeof LAYOUT];
export type Status = (typeof STATUS)[keyof typeof STATUS];
export type BaseFieldItem = {
  type: Type;
  name: string;
  label: string;
  is_required?: boolean;
};

export type FieldArrayItem =
  | (BaseFieldItem & {
      type:
        | typeof TYPE.TEXT
        | typeof TYPE.TEXTAREA
        | typeof TYPE.IMAGE
        | typeof TYPE.RICH_TEXT;
    })
  | (BaseFieldItem & { type: typeof TYPE.CHECKBOX; checkbox_label: string })
  | (BaseFieldItem & { type: typeof TYPE.MULTI_SELECT; options: string[] })
  | (BaseFieldItem & {
      type: typeof TYPE.RADIO;
      options: string[];
      layout: Layout;
    })
  | (BaseFieldItem & {
      type: typeof TYPE.CHECKBOXES;
      options: string[];
      layout: Layout;
    })
  | (BaseFieldItem & { type: typeof TYPE.TAXONOMY; taxonomy_id: string })
  | (BaseFieldItem & { type: typeof TYPE.MULTI_TAXONOMY; taxonomy_id: string })
  | (BaseFieldItem & {
      type: typeof TYPE.NESTED_ARRAY;
      children: Exclude<FieldArrayItem, { type: typeof TYPE.NESTED_ARRAY }>[];
      contentCurrent: number;
    });

export type FieldsByTypeMapping = {
  TEXT: ContentTextField[];
  TEXTAREA: ContentTextAreaField[];
  MULTI_SELECT: ContentMultiSelectField[];
  RADIO: ContentRadioField[];
  CHECKBOXES: ContentCheckboxesField[];
  CHECKBOX: ContentCheckboxField[];
  IMAGE: ContentImageField[];
  RICH_TEXT: ContentRichTextField[];
  TAXONOMY: ContentTaxonomyField[];
  MULTI_TAXONOMY: ContentMultiTaxonomyField[];
  NESTED_ARRAY_CHILD: ContentNestedArrayChildField[];
};
export type ValuesByTypeMapping = {
  TEXT: ContentTextValue[];
  TEXTAREA: ContentTextAreaValue[];
  MULTI_SELECT: ContentMultiSelectValue[];
  RADIO: ContentRadioValue[];
  CHECKBOXES: ContentCheckboxesValue[];
  CHECKBOX: ContentCheckboxValue[];
  IMAGE: ContentImageValue[];
  RICH_TEXT: ContentRichTextValue[];
  TAXONOMY: ContentTaxonomyValue[];
  MULTI_TAXONOMY: ContentMultiTaxonomyValue[];
};
export type ValuesByTypeWithFile = {
  [key in keyof ValuesByTypeMapping]: {
    tableName: string;
    data: ValuesByTypeMapping[key];
  };
};
export type FieldsByTypeWithFile = {
  [key in keyof FieldsByTypeMapping]: {
    tableName: string;
    data: FieldsByTypeMapping[key];
  };
};
