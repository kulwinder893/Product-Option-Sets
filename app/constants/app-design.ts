import type {
  FontElementKey,
  FontFamilyId,
  FontSettings,
  FontStyleId,
  FontToken,
} from "../types/app-design";

export const FONT_FAMILIES: Array<{
  id: FontFamilyId;
  label: string;
  stack: string;
  google?: string;
}> = [
  { id: "theme", label: "Theme default", stack: "inherit" },
  { id: "arial", label: "Arial", stack: "Arial, Helvetica, sans-serif" },
  {
    id: "helvetica",
    label: "Helvetica",
    stack: "Helvetica, Arial, sans-serif",
  },
  {
    id: "times",
    label: "Times New Roman",
    stack: '"Times New Roman", Times, serif',
  },
  { id: "georgia", label: "Georgia", stack: "Georgia, serif" },
  { id: "verdana", label: "Verdana", stack: "Verdana, Geneva, sans-serif" },
  { id: "tahoma", label: "Tahoma", stack: "Tahoma, Geneva, sans-serif" },
  {
    id: "trebuchet",
    label: "Trebuchet MS",
    stack: '"Trebuchet MS", Helvetica, sans-serif',
  },
  {
    id: "courier",
    label: "Courier New",
    stack: '"Courier New", Courier, monospace',
  },
  { id: "roboto", label: "Roboto", stack: "Roboto, sans-serif", google: "Roboto" },
  {
    id: "open-sans",
    label: "Open Sans",
    stack: '"Open Sans", sans-serif',
    google: "Open+Sans",
  },
  { id: "lato", label: "Lato", stack: "Lato, sans-serif", google: "Lato" },
  {
    id: "montserrat",
    label: "Montserrat",
    stack: "Montserrat, sans-serif",
    google: "Montserrat",
  },
  {
    id: "poppins",
    label: "Poppins",
    stack: "Poppins, sans-serif",
    google: "Poppins",
  },
  { id: "inter", label: "Inter", stack: "Inter, sans-serif", google: "Inter" },
  {
    id: "playfair",
    label: "Playfair Display",
    stack: '"Playfair Display", serif',
    google: "Playfair+Display",
  },
  { id: "nunito", label: "Nunito", stack: "Nunito, sans-serif", google: "Nunito" },
];

export const FONT_STYLES: Array<{ id: FontStyleId; label: string }> = [
  { id: "normal", label: "Normal" },
  { id: "bold", label: "Bold" },
  { id: "italic", label: "Italic" },
  { id: "bold_italic", label: "Bold italic" },
];

export const FONT_ELEMENT_LABELS: Record<FontElementKey, string> = {
  optionLabel: "Option label",
  optionValue: "Option value",
  selectedValue: "Selected value next to label",
  helpText: "Help text",
  tooltip: "Info / Tooltip",
  totalPrice: "Total (additional) price",
  errorText: "Error text",
  inputText: "Input text",
  quantitySelector: "Quantity selector",
};

function token(
  family: FontFamilyId,
  style: FontStyleId,
  size: number,
): FontToken {
  return { family, style, size };
}

/** Matches Easify Options font defaults. */
export const DEFAULT_FONT_SETTINGS: FontSettings = {
  optionLabel: token("theme", "bold", 16),
  optionValue: token("theme", "normal", 16),
  selectedValue: token("theme", "normal", 14),
  helpText: token("theme", "italic", 14),
  tooltip: token("theme", "normal", 14),
  totalPrice: token("theme", "normal", 14),
  errorText: token("theme", "normal", 14),
  inputText: token("theme", "normal", 16),
  quantitySelector: token("theme", "normal", 14),
};

export const FONT_SIZE_MIN = 10;
export const FONT_SIZE_MAX = 48;

export const DESIGN_TABS = [
  { id: "style", label: "Style" },
  { id: "font", label: "Font" },
  { id: "color", label: "Color" },
  { id: "size", label: "Size" },
  { id: "shape", label: "Shape" },
  { id: "spacing", label: "Spacing" },
  { id: "css", label: "CSS" },
] as const;

export const SETTINGS_SECTIONS = [
  { id: "design", label: "App Design" },
  { id: "translation", label: "App Translation" },
  { id: "advanced", label: "Advanced Settings" },
  { id: "api", label: "API Connections" },
] as const;

export type DesignTabId = (typeof DESIGN_TABS)[number]["id"];
export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]["id"];
