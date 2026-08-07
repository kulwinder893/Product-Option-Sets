import type { FieldType } from "@prisma/client";
import type { NavItem } from "../types";

export const APP_NAME = "Option Sets Pro";

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/app" },
  { label: "Option Sets", href: "/app/option-sets", match: "/app/option-sets" },
  { label: "Assignments", href: "/app/assignments" },
  { label: "Analytics", href: "/app/analytics" },
  { label: "Settings", href: "/app/settings" },
  { label: "Help", href: "/app/help" },
];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const OPTION_SET_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  DISABLED: "Disabled",
  ARCHIVED: "Archived",
  ALL: "All statuses",
};

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  HEADING: "Heading",
  PARAGRAPH: "Paragraph",
  DIVIDER: "Divider",
  SPACER: "Spacer",
  TEXT_BOX: "Text Box",
  TEXTAREA: "Textarea",
  DROPDOWN: "Dropdown",
  CHECKBOX: "Checkbox",
  RADIO_BUTTON: "Radio Button",
  SWITCH: "Switch",
  BUTTONS: "Buttons",
  COLOR_SWATCHES: "Color Swatches",
  IMAGE_SWATCHES: "Image Swatches",
  FILE_UPLOAD: "File Upload",
  DATE_PICKER: "Date Picker",
  TIME_PICKER: "Time Picker",
  DATE_RANGE: "Date Range",
  NUMBER: "Number",
  RANGE_SLIDER: "Range Slider",
  QUANTITY: "Quantity",
  PRODUCT_PICKER: "Product Picker",
  CUSTOM_HTML: "Custom HTML",
  HIDDEN_FIELD: "Hidden Field",
  GROUP: "Group",
};

export const LAYOUT_FIELD_TYPES: FieldType[] = [
  "HEADING",
  "PARAGRAPH",
  "DIVIDER",
  "SPACER",
  "GROUP",
  "CUSTOM_HTML",
];

export const CHOICE_FIELD_TYPES: FieldType[] = [
  "DROPDOWN",
  "CHECKBOX",
  "RADIO_BUTTON",
  "BUTTONS",
  "COLOR_SWATCHES",
  "IMAGE_SWATCHES",
];
