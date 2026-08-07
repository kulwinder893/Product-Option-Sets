import type { FieldType } from "@prisma/client";
import type { FieldSettings } from "../types/field";

export type FieldCategory =
  | "Text"
  | "Choice"
  | "Media"
  | "Date & time"
  | "Number"
  | "Layout"
  | "Advanced";

export type FieldTypeMeta = {
  type: FieldType;
  label: string;
  category: FieldCategory;
  /** Polaris icon name. */
  icon: string;
  /** Renders a list of selectable choices. */
  hasChoices: boolean;
  /** Accepts customer input, so validation and pricing apply. */
  isInput: boolean;
  supportsPlaceholder: boolean;
  supportsCharLimits: boolean;
  supportsQuantity: boolean;
  /** Static content only; no label/required semantics. */
  isPresentational: boolean;
  defaultSettings?: FieldSettings;
};

const base = {
  hasChoices: false,
  isInput: true,
  supportsPlaceholder: false,
  supportsCharLimits: false,
  supportsQuantity: false,
  isPresentational: false,
};

export const FIELD_TYPES: FieldTypeMeta[] = [
  // Text
  {
    ...base,
    type: "TEXT_BOX",
    label: "Text box",
    category: "Text",
    icon: "text",
    supportsPlaceholder: true,
    supportsCharLimits: true,
  },
  {
    ...base,
    type: "TEXTAREA",
    label: "Textarea",
    category: "Text",
    icon: "text-in-rows",
    supportsPlaceholder: true,
    supportsCharLimits: true,
  },

  // Choice
  {
    ...base,
    type: "DROPDOWN",
    label: "Dropdown",
    category: "Choice",
    icon: "select",
    hasChoices: true,
    supportsPlaceholder: true,
  },
  {
    ...base,
    type: "RADIO_BUTTON",
    label: "Radio button",
    category: "Choice",
    icon: "circle",
    hasChoices: true,
  },
  {
    ...base,
    type: "CHECKBOX",
    label: "Checkbox",
    category: "Choice",
    icon: "checkbox",
    hasChoices: true,
    defaultSettings: { allowMultiple: true },
  },
  {
    ...base,
    type: "BUTTONS",
    label: "Buttons",
    category: "Choice",
    icon: "button",
    hasChoices: true,
  },
  {
    ...base,
    type: "SWITCH",
    label: "Switch",
    category: "Choice",
    icon: "toggle-on",
  },

  // Media
  {
    ...base,
    type: "COLOR_SWATCHES",
    label: "Color swatches",
    category: "Media",
    icon: "color",
    hasChoices: true,
    defaultSettings: { swatchShape: "circle" },
  },
  {
    ...base,
    type: "IMAGE_SWATCHES",
    label: "Image swatches",
    category: "Media",
    icon: "image",
    hasChoices: true,
    defaultSettings: { swatchShape: "square" },
  },
  {
    ...base,
    type: "FILE_UPLOAD",
    label: "File upload",
    category: "Media",
    icon: "upload",
    defaultSettings: {
      maxFiles: 1,
      maxSizeMb: 10,
      allowedExtensions: ["jpg", "jpeg", "png", "gif", "pdf", "webp"],
    },
  },

  // Date & time
  {
    ...base,
    type: "DATE_PICKER",
    label: "Date picker",
    category: "Date & time",
    icon: "calendar",
  },
  {
    ...base,
    type: "TIME_PICKER",
    label: "Time picker",
    category: "Date & time",
    icon: "clock",
  },
  {
    ...base,
    type: "DATE_RANGE",
    label: "Date range",
    category: "Date & time",
    icon: "calendar-compare",
  },

  // Number
  {
    ...base,
    type: "NUMBER",
    label: "Number",
    category: "Number",
    icon: "hashtag",
    supportsPlaceholder: true,
    defaultSettings: { min: 0, step: 1 },
  },
  {
    ...base,
    type: "RANGE_SLIDER",
    label: "Range slider",
    category: "Number",
    icon: "adjust",
    defaultSettings: { min: 0, max: 100, step: 1 },
  },
  {
    ...base,
    type: "QUANTITY",
    label: "Quantity",
    category: "Number",
    icon: "hashtag-decimal",
    supportsQuantity: true,
    defaultSettings: { min: 1, step: 1 },
  },

  // Layout
  {
    ...base,
    type: "HEADING",
    label: "Heading",
    category: "Layout",
    icon: "text-title",
    isInput: false,
    isPresentational: true,
    defaultSettings: { headingLevel: 3 },
  },
  {
    ...base,
    type: "PARAGRAPH",
    label: "Paragraph",
    category: "Layout",
    icon: "text-block",
    isInput: false,
    isPresentational: true,
    defaultSettings: { content: "Describe this section for your customers." },
  },
  {
    ...base,
    type: "DIVIDER",
    label: "Divider",
    category: "Layout",
    icon: "minus",
    isInput: false,
    isPresentational: true,
  },
  {
    ...base,
    type: "SPACER",
    label: "Spacer",
    category: "Layout",
    icon: "layout-block",
    isInput: false,
    isPresentational: true,
    defaultSettings: { spacerSize: 16 },
  },
  {
    ...base,
    type: "GROUP",
    label: "Group",
    category: "Layout",
    icon: "folder",
    isInput: false,
  },

  // Advanced
  {
    ...base,
    type: "PRODUCT_PICKER",
    label: "Product picker",
    category: "Advanced",
    icon: "product",
  },
  {
    ...base,
    type: "CUSTOM_HTML",
    label: "Custom HTML",
    category: "Advanced",
    icon: "code",
    isInput: false,
    isPresentational: true,
    defaultSettings: { content: "<p>Custom HTML</p>" },
  },
  {
    ...base,
    type: "HIDDEN_FIELD",
    label: "Hidden field",
    category: "Advanced",
    icon: "hide",
  },
];

export const FIELD_TYPE_MAP: Record<FieldType, FieldTypeMeta> =
  FIELD_TYPES.reduce(
    (acc, meta) => {
      acc[meta.type] = meta;
      return acc;
    },
    {} as Record<FieldType, FieldTypeMeta>,
  );

export const FIELD_CATEGORIES: FieldCategory[] = [
  "Text",
  "Choice",
  "Media",
  "Date & time",
  "Number",
  "Layout",
  "Advanced",
];

export function fieldMeta(type: FieldType): FieldTypeMeta {
  return FIELD_TYPE_MAP[type] ?? FIELD_TYPE_MAP.TEXT_BOX;
}
