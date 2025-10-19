import {
  Content,
  ContentAsset,
  ContentField,
  ContentSetting,
  Term,
} from "../common/models";
import { FieldArrayItem, ValuesByTypeWithFile } from "../common/types";

export type ContentConfigs = {
  name: string;
  fieldArray: FieldArrayItem[];
  createContentFromCSV: (
    setting_id: ContentSetting["id"],
    fieldArray: FieldArrayItem[],
    contentFields: ContentField[],
    terms: Term[],
    contentValues: Content[],
    contentAssets: ContentAsset[],
    valuesByTypeWithFile: ValuesByTypeWithFile
  ) => void;
};
