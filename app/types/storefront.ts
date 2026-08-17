import type { FieldType } from "@prisma/client";
import type { FieldSettings, ProductCondition } from "./field";
import type { StorefrontDesignPayload } from "./app-design";

/** Product facts sent by the theme extension so conditions can be evaluated. */
export type StorefrontProductContext = {
  productId: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
};

export type StorefrontChoice = {
  id: string;
  label: string;
  value: string;
  imageUrl: string | null;
  colorHex: string | null;
  priceAddon: number | null;
  isDefault: boolean;
  isDisabled: boolean;
};

export type StorefrontField = {
  id: string;
  parentId: string | null;
  type: FieldType;
  label: string;
  description: string | null;
  placeholder: string | null;
  required: boolean;
  hidden: boolean;
  defaultValue: string | null;
  helpText: string | null;
  tooltip: string | null;
  customErrorMessage: string | null;
  cssClass: string | null;
  minLength: number | null;
  maxLength: number | null;
  minQuantity: number | null;
  maxQuantity: number | null;
  settings: FieldSettings;
  choices: StorefrontChoice[];
};

export type StorefrontOptionSet = {
  id: string;
  name: string;
  fields: StorefrontField[];
};

export type StorefrontOptionsPayload = {
  optionSets: StorefrontOptionSet[];
  design?: StorefrontDesignPayload | null;
};

export type AssignmentConditions = ProductCondition[];
