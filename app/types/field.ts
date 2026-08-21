import type { FieldType } from "@prisma/client";

/**
 * Type-specific configuration persisted as JSON in `OptionField.settings`.
 * Keys are intentionally optional so a single shape serves every field type.
 */
export type FieldSettings = {
  /** Flat surcharge applied when the field has a value. */
  priceAddon?: number | null;
  priceType?: "FIXED" | "PERCENTAGE";

  /** Layout + content types */
  content?: string;
  headingLevel?: 1 | 2 | 3 | 4;
  spacerSize?: number;

  /** Choice rendering */
  columns?: number;
  swatchShape?: "circle" | "square";
  allowMultiple?: boolean;

  /** Numeric + slider types */
  min?: number | null;
  max?: number | null;
  step?: number | null;
  unit?: string;

  /** File upload */
  maxFiles?: number | null;
  maxSizeMb?: number | null;
  allowedExtensions?: string[];

  /** Date + time */
  minDate?: string;
  maxDate?: string;

  /** Hidden field */
  hiddenValue?: string;

  /** Product picker — catalog products shoppers can add as add-ons */
  products?: AddonProduct[];
  /** Set on the storefront payload so newer JS can render add-on cards. */
  productPicker?: boolean;
};

/** A catalog product offered inside a Product picker field. */
export type AddonProduct = {
  id: string;
  productGid: string;
  productId: string;
  variantGid?: string | null;
  variantId?: string | null;
  title: string;
  handle: string | null;
  imageUrl?: string | null;
  /** Unit price in shop currency (e.g. 19.99). */
  price?: number | null;
};

export type ChoiceDraft = {
  id: string;
  label: string;
  value: string;
  imageUrl: string | null;
  colorHex: string | null;
  priceAddon: number | null;
  isDefault: boolean;
  isDisabled: boolean;
  sortOrder: number;
};

export type FieldDraft = {
  id: string;
  parentId: string | null;
  type: FieldType;
  label: string;
  description: string | null;
  placeholder: string | null;
  required: boolean;
  hidden: boolean;
  defaultValue: string | null;
  validation: string | null;
  cssClass: string | null;
  tooltip: string | null;
  helpText: string | null;
  customErrorMessage: string | null;
  minQuantity: number | null;
  maxQuantity: number | null;
  minLength: number | null;
  maxLength: number | null;
  sortOrder: number;
  collapsed: boolean;
  settings: FieldSettings;
  choices: ChoiceDraft[];
};

export type AssignmentMode = "ALL_PRODUCTS" | "MANUAL" | "CONDITIONS";

export type ProductAssignmentDraft = {
  id: string;
  productGid: string;
  productId: string;
  title: string;
  handle: string | null;
  imageUrl?: string | null;
};

export type ProductCondition = {
  id: string;
  field: "TITLE" | "VENDOR" | "PRODUCT_TYPE" | "TAG";
  operator: "EQUALS" | "CONTAINS";
  value: string;
};

export type OptionSetDraft = {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  fields: FieldDraft[];
  assignmentMode: AssignmentMode;
  products: ProductAssignmentDraft[];
  conditions: ProductCondition[];
};

export type BuilderSaveResult = {
  ok: boolean;
  message: string;
  /** Maps temporary client ids to persisted database ids. */
  idMap?: Record<string, string>;
  fieldErrors?: Record<string, string>;
};
