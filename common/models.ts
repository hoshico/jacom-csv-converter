import { v4 as uuidv4 } from "uuid";
import {
  CREATED_AT,
  DISPLAY_ID,
  LAYOUT,
  NOW,
  SITE_ID,
  STATUS,
  TENANT_ID,
  UPDATED_BY_NAME,
} from "./constants";
import { Layout, Status, Type } from "./types";

export class ContentAsset {
  id: string;
  tenant_id: string;
  site_id: string;
  content_setting_id: string;
  filename: string;
  mime_type: string;
  file_size: number;
  s3_key: string;
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    tenant_id = TENANT_ID,
    site_id = SITE_ID,
    content_setting_id,
    filename,
    mime_type,
    file_size,
    s3_key,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    tenant_id?: string;
    site_id?: string;
    content_setting_id: string;
    filename: string;
    mime_type: string;
    file_size: number;
    s3_key?: string;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.tenant_id = tenant_id;
    this.site_id = site_id;
    this.content_setting_id = content_setting_id;
    this.filename = filename;
    this.mime_type = mime_type;
    this.file_size = file_size;
    this.s3_key = s3_key || `${DISPLAY_ID}/${id}`;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

export class Taxonomy {
  id: string;
  site_id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;

  constructor({
    id = uuidv4(),
    site_id = SITE_ID,
    name,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
    deleted_at = null,
  }: {
    id?: string;
    site_id?: string;
    name: string;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date | null;
  }) {
    this.id = id;
    this.site_id = site_id;
    this.name = name;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
  }
}
export class Term {
  id: string;
  taxonomy_id: string;
  parent_id?: string | null;
  name: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
  sort_order: number;

  constructor({
    id = uuidv4(),
    taxonomy_id,
    parent_id = null,
    name,
    slug,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
    deleted_at = null,
    sort_order,
  }: {
    id?: string;
    taxonomy_id: string;
    parent_id?: string | null;
    name: string;
    slug: string;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date | null;
    sort_order: number;
  }) {
    this.id = id;
    this.taxonomy_id = taxonomy_id;
    this.parent_id = parent_id;
    this.name = name;
    this.slug = slug;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
    this.sort_order = sort_order;
  }
}
export class ContentSetting {
  id: string;
  site_id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;

  constructor({
    id = uuidv4(),
    site_id = SITE_ID,
    name,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
    deleted_at = null,
  }: {
    id?: string;
    site_id?: string;
    name: string;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date | null;
  }) {
    this.id = id;
    this.site_id = site_id;
    this.name = name;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
  }
}
export class ContentField {
  id: string;
  setting_id: string;
  type: Type;
  name: string;
  label: string;
  description?: string;
  is_required: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
  sort_order: number;

  constructor({
    id = uuidv4(),
    setting_id,
    type,
    name,
    label,
    description = "",
    is_required = false,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
    deleted_at = null,
    sort_order,
  }: {
    id?: string;
    setting_id: string;
    type: Type;
    name: string;
    label: string;
    description?: string;
    is_required?: boolean;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date | null;
    sort_order: number;
  }) {
    this.id = id;
    this.setting_id = setting_id;
    this.type = type;
    this.name = name;
    this.label = label;
    this.description = description;
    this.is_required = is_required;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
    this.sort_order = sort_order;
  }
}
export class ContentTextField {
  id: string;
  field_id: string;
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    field_id,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    field_id: string;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.field_id = field_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentTextAreaField {
  id: string;
  field_id: string;
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    field_id,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    field_id: string;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.field_id = field_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentMultiSelectField {
  id: string;
  field_id: string;
  options?: string[];
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    field_id,
    options,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    field_id: string;
    options: string[];
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.field_id = field_id;
    this.options = options;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentRadioField {
  id: string;
  field_id: string;
  layout: Layout;
  options?: string[];
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    field_id,
    layout = LAYOUT.HORIZONTAL,
    options,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    field_id: string;
    layout?: Layout;
    options: string[];
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.field_id = field_id;
    this.layout = layout;
    this.options = options;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentCheckboxesField {
  id: string;
  field_id: string;
  layout: Layout;
  options?: string[];
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    field_id,
    layout = LAYOUT.HORIZONTAL,
    options,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    field_id: string;
    layout: Layout;
    options: string[];
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.field_id = field_id;
    this.layout = layout;
    this.options = options;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentCheckboxField {
  id: string;
  field_id: string;
  label: string;
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    field_id,
    label,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    field_id: string;
    label: string;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.field_id = field_id;
    this.label = label;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentImageField {
  id: string;
  field_id: string;
  created_at: Date;
  updated_at: Date;
  constructor({
    id = uuidv4(),
    field_id,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    field_id: string;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.field_id = field_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentRichTextField {
  id: string;
  field_id: string;
  created_at: Date;
  updated_at: Date;
  constructor({
    id = uuidv4(),
    field_id,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    field_id: string;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.field_id = field_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentTaxonomyField {
  id: string;
  field_id: string;
  taxonomy_id: string;
  created_at: Date;
  updated_at: Date;
  constructor({
    id = uuidv4(),
    field_id,
    taxonomy_id,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    field_id: string;
    taxonomy_id: string;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.field_id = field_id;
    this.taxonomy_id = taxonomy_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentMultiTaxonomyField {
  id: string;
  field_id: string;
  taxonomy_id: string;
  created_at: Date;
  updated_at: Date;
  constructor({
    id = uuidv4(),
    field_id,
    taxonomy_id,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    field_id: string;
    taxonomy_id: string;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.field_id = field_id;
    this.taxonomy_id = taxonomy_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

export class ContentNestedArrayField {
  id: string;
  field_id: string;
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    field_id,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    field_id: string;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.field_id = field_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentNestedArrayChildField {
  id: string;
  nested_array_field_id: string;
  child_field_id: string;
  created_at: Date;
  updated_at: Date;
  constructor({
    id = uuidv4(),
    nested_array_field_id,
    child_field_id,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    nested_array_field_id: string;
    child_field_id: string;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.nested_array_field_id = nested_array_field_id;
    this.child_field_id = child_field_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

export class Content {
  id: string;
  setting_id: string;
  site_id: string;
  title: string;
  slug: string;
  status: string;
  scheduled_publish_at?: Date | null;
  published_at?: Date | null;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;

  constructor({
    id = uuidv4(),
    setting_id,
    site_id,
    title,
    slug,
    status = STATUS.DRAFT,
    scheduled_publish_at = null,
    published_at = null,
    updated_by = UPDATED_BY_NAME,
    created_at = CREATED_AT,
    updated_at = NOW,
    deleted_at = null,
  }: {
    id?: string;
    setting_id: string;
    site_id: string;
    title: string;
    slug: string;
    status?: Status;
    scheduled_publish_at?: Date | null;
    published_at?: Date | null;
    updated_by?: string;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date | null;
  }) {
    this.id = id;
    this.setting_id = setting_id;
    this.site_id = site_id;
    this.title = title;
    this.slug = slug;
    this.status = status;
    this.scheduled_publish_at = scheduled_publish_at;
    this.published_at = published_at;
    this.updated_by = updated_by;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
  }
}
export class ContentTextValue {
  id: string;
  content_id: string;
  field_id: string;
  value: string;
  nested_array_index?: number | null;
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    content_id,
    field_id,
    value,
    nested_array_index,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    content_id: string;
    field_id: string;
    value: string;
    nested_array_index?: number | null;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.content_id = content_id;
    this.field_id = field_id;
    this.value = value;
    this.nested_array_index = nested_array_index;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentTextAreaValue {
  id: string;
  content_id: string;
  field_id: string;
  value: string;
  nested_array_index?: number | null;
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    content_id,
    field_id,
    value,
    nested_array_index,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    content_id: string;
    field_id: string;
    value: string;
    nested_array_index?: number | null;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.content_id = content_id;
    this.field_id = field_id;
    this.value = value;
    this.nested_array_index = nested_array_index;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentMultiSelectValue {
  id: string;
  content_id: string;
  field_id: string;
  value?: string[];
  nested_array_index?: number | null;
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    content_id,
    field_id,
    value = [],
    nested_array_index,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    content_id: string;
    field_id: string;
    value: string[];
    nested_array_index?: number | null;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.content_id = content_id;
    this.field_id = field_id;
    this.value = value;
    this.nested_array_index = nested_array_index;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentRadioValue {
  id: string;
  content_id: string;
  field_id: string;
  value: string;
  nested_array_index?: number | null;
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    content_id,
    field_id,
    value,
    nested_array_index,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    content_id: string;
    field_id: string;
    value: string;
    nested_array_index?: number | null;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.content_id = content_id;
    this.field_id = field_id;
    this.value = value;
    this.nested_array_index = nested_array_index;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentCheckboxesValue {
  id: string;
  content_id: string;
  field_id: string;
  value?: string[];
  nested_array_index?: number | null;
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    content_id,
    field_id,
    value = [],
    nested_array_index,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    content_id: string;
    field_id: string;
    value: string[];
    nested_array_index?: number | null;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.content_id = content_id;
    this.field_id = field_id;
    this.value = value;
    this.nested_array_index = nested_array_index;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentCheckboxValue {
  id: string;
  content_id: string;
  field_id: string;
  value: boolean;
  nested_array_index?: number | null;
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    content_id,
    field_id,
    value,
    nested_array_index,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    content_id: string;
    field_id: string;
    value: boolean;
    nested_array_index?: number | null;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.content_id = content_id;
    this.field_id = field_id;
    this.value = value;
    this.nested_array_index = nested_array_index;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentImageValue {
  id: string;
  content_id: string;
  field_id: string;
  value: string;
  nested_array_index?: number | null;
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    content_id,
    field_id,
    value,
    nested_array_index,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    content_id: string;
    field_id: string;
    value: string;
    nested_array_index?: number | null;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.content_id = content_id;
    this.field_id = field_id;
    this.value = value;
    this.nested_array_index = nested_array_index;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentRichTextValue {
  id: string;
  content_id: string;
  field_id: string;
  value: string;
  nested_array_index?: number | null;
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    content_id,
    field_id,
    value,
    nested_array_index,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    content_id: string;
    field_id: string;
    value: string;
    nested_array_index?: number | null;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.content_id = content_id;
    this.field_id = field_id;
    this.value = value;
    this.nested_array_index = nested_array_index;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentTaxonomyValue {
  id: string;
  content_id: string;
  field_id: string;
  term_id: string;
  nested_array_index?: number | null;
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    content_id,
    field_id,
    term_id,
    nested_array_index,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    content_id: string;
    field_id: string;
    term_id: string;
    nested_array_index?: number | null;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.content_id = content_id;
    this.field_id = field_id;
    this.term_id = term_id;
    this.nested_array_index = nested_array_index;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export class ContentMultiTaxonomyValue {
  id: string;
  content_id: string;
  field_id: string;
  term_id: string;
  nested_array_index?: number | null;
  created_at: Date;
  updated_at: Date;

  constructor({
    id = uuidv4(),
    content_id,
    field_id,
    term_id,
    nested_array_index,
    created_at = CREATED_AT,
    updated_at = CREATED_AT,
  }: {
    id?: string;
    content_id: string;
    field_id: string;
    term_id: string;
    nested_array_index?: number | null;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.content_id = content_id;
    this.field_id = field_id;
    this.term_id = term_id;
    this.nested_array_index = nested_array_index;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
