import type {
  ColorSettings,
  FontElementKey,
  FontFamilyId,
  FontSettings,
  FontStyleId,
  FontToken,
  ShapeSettings,
  SizeSettings,
  SpacingSettings,
  StyleSettings,
  TranslationSettings,
  AdvancedSettings,
  AppDesignSettings,
  ThemeMode,
} from "../types/app-design";

export const FONT_FAMILIES: Array<{
  id: FontFamilyId;
  label: string;
  stack: string;
  google?: string;
}> = [
  { id: "theme", label: "Theme default", stack: "inherit" },
  { id: "arial", label: "Arial", stack: "Arial, Helvetica, sans-serif" },
  { id: "helvetica", label: "Helvetica", stack: "Helvetica, Arial, sans-serif" },
  { id: "times", label: "Times New Roman", stack: '"Times New Roman", Times, serif' },
  { id: "georgia", label: "Georgia", stack: "Georgia, serif" },
  { id: "verdana", label: "Verdana", stack: "Verdana, Geneva, sans-serif" },
  { id: "tahoma", label: "Tahoma", stack: "Tahoma, Geneva, sans-serif" },
  { id: "trebuchet", label: "Trebuchet MS", stack: '"Trebuchet MS", Helvetica, sans-serif' },
  { id: "courier", label: "Courier New", stack: '"Courier New", Courier, monospace' },
  { id: "roboto", label: "Roboto", stack: "Roboto, sans-serif", google: "Roboto" },
  { id: "open-sans", label: "Open Sans", stack: '"Open Sans", sans-serif', google: "Open+Sans" },
  { id: "lato", label: "Lato", stack: "Lato, sans-serif", google: "Lato" },
  { id: "montserrat", label: "Montserrat", stack: "Montserrat, sans-serif", google: "Montserrat" },
  { id: "poppins", label: "Poppins", stack: "Poppins, sans-serif", google: "Poppins" },
  { id: "inter", label: "Inter", stack: "Inter, sans-serif", google: "Inter" },
  { id: "playfair", label: "Playfair Display", stack: '"Playfair Display", serif', google: "Playfair+Display" },
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
  fileUpload: "File upload (Button text & Uploaded file name)",
  badgeText: "Badge text",
};

function token(family: FontFamilyId, style: FontStyleId, size: number): FontToken {
  return { family, style, size };
}

export const DEFAULT_FONT_SETTINGS: FontSettings = {
  optionLabel: token("inter", "bold", 15),
  optionValue: token("inter", "normal", 14),
  selectedValue: token("inter", "normal", 13),
  helpText: token("inter", "italic", 13),
  tooltip: token("inter", "normal", 13),
  totalPrice: token("inter", "bold", 14),
  errorText: token("inter", "normal", 13),
  inputText: token("inter", "normal", 15),
  quantitySelector: token("inter", "normal", 15),
  fileUpload: token("inter", "normal", 14),
  badgeText: token("inter", "bold", 10),
};

export const FONT_SIZE_MIN = 8;
export const FONT_SIZE_MAX = 48;

export const DEFAULT_STYLE: StyleSettings = {
  preset: "modern",
  mode: "light",
  choiceLayout: "horizontal",
  showSelectedValue: true,
};

export const LIGHT_COLORS: ColorSettings = {
  optionLabel: "#243040",
  optionValue: "#3d4a5c",
  selectedValue: "#5b7c99",
  helpText: "#7a8699",
  errorMessage: "#e85d4c",
  tooltip: "#7a8699",
  totalBackground: "#f4f8f6",
  totalText: "#243040",
  totalPrice: "#1f8a70",
  totalBorder: "#c9ded6",
  inputPlaceholder: "#a8b4c3",
  inputValue: "#243040",
  inputBorder: "#d9e2ec",
  inputBorderFocus: "#3d9b8f",
  inputBackground: "#fffdf9",
  inputBackgroundFocus: "#ffffff",
  colorSwatchBorder: "#d9e2ec",
  colorSwatchBorderSelected: "#3d9b8f",
  imageSwatchBorder: "#d9e2ec",
  imageSwatchBorderSelected: "#3d9b8f",
  buttonBackground: "#fffdf9",
  buttonText: "#243040",
  buttonBorder: "#d9e2ec",
  buttonBackgroundSelected: "#3d9b8f",
  buttonTextSelected: "#fffdf9",
  switchOn: "#3d9b8f",
};

export const DARK_COLORS: ColorSettings = {
  optionLabel: "#eef2f4",
  optionValue: "#d5dde4",
  selectedValue: "#9ecdc6",
  helpText: "#8b97a6",
  errorMessage: "#ff8a7a",
  tooltip: "#8b97a6",
  totalBackground: "#1c2428",
  totalText: "#eef2f4",
  totalPrice: "#6fd4c2",
  totalBorder: "#334249",
  inputPlaceholder: "#6f7d8a",
  inputValue: "#eef2f4",
  inputBorder: "#334249",
  inputBorderFocus: "#3d9b8f",
  inputBackground: "#161a1f",
  inputBackgroundFocus: "#1c2428",
  colorSwatchBorder: "#334249",
  colorSwatchBorderSelected: "#6fd4c2",
  imageSwatchBorder: "#334249",
  imageSwatchBorderSelected: "#6fd4c2",
  buttonBackground: "#1c2428",
  buttonText: "#eef2f4",
  buttonBorder: "#334249",
  buttonBackgroundSelected: "#3d9b8f",
  buttonTextSelected: "#fffdf9",
  switchOn: "#3d9b8f",
};

export const DEFAULT_SIZES: SizeSettings = {
  inputHeight: 44,
  dropdownHeight: 44,
  swatchSize: 38,
  buttonMinHeight: 40,
  checkboxSize: 16,
  quantityHeight: 44,
  uploadButtonHeight: 42,
};

export const DEFAULT_SHAPES: ShapeSettings = {
  inputRadius: 12,
  buttonRadius: 12,
  totalRadius: 14,
  swatchShape: "circle",
  swatchRadius: 10,
};

export const DEFAULT_SPACING: SpacingSettings = {
  fieldGap: 16,
  choiceGap: 12,
  swatchGap: 10,
  labelGap: 6,
  widgetPadding: 0,
};

export const DEFAULT_DESIGN: AppDesignSettings = {
  style: DEFAULT_STYLE,
  fonts: DEFAULT_FONT_SETTINGS,
  colors: LIGHT_COLORS,
  sizes: DEFAULT_SIZES,
  shapes: DEFAULT_SHAPES,
  spacing: DEFAULT_SPACING,
  customCss: "",
};

export const DEFAULT_TRANSLATIONS: TranslationSettings = {
  pleaseSelect: "Please select",
  required: "*",
  optionsTotal: "Options total",
  youveChosen: "You've chosen",
  yes: "Yes",
  no: "No",
  uploadFile: "Upload file",
  errorRequired: "This option is required",
};

export const DEFAULT_ADVANCED: AdvancedSettings = {
  showTotal: true,
  showPriceAddons: true,
  totalIncludesProductPrice: false,
  hideOutOfStock: false,
  addToCartText: "",
};

export const COLOR_GROUPS: Array<{
  title: string;
  items: Array<{ key: keyof ColorSettings; label: string }>;
}> = [
  {
    title: "General",
    items: [
      { key: "optionLabel", label: "Option label" },
      { key: "optionValue", label: "Option value" },
      { key: "selectedValue", label: "Selected option value" },
      { key: "helpText", label: "Help text" },
      { key: "tooltip", label: "Info / Tooltip" },
      { key: "errorMessage", label: "Error message" },
    ],
  },
  {
    title: "Total (additional) price",
    items: [
      { key: "totalBackground", label: "Background" },
      { key: "totalText", label: "Text" },
      { key: "totalPrice", label: "Price" },
      { key: "totalBorder", label: "Border" },
    ],
  },
  {
    title: "Text input",
    items: [
      { key: "inputPlaceholder", label: "Placeholder" },
      { key: "inputValue", label: "Entered value" },
      { key: "inputBorder", label: "Border · Unselected" },
      { key: "inputBorderFocus", label: "Border · Selected" },
      { key: "inputBackground", label: "Background · Unselected" },
      { key: "inputBackgroundFocus", label: "Background · Selected" },
    ],
  },
  {
    title: "Color swatches",
    items: [
      { key: "colorSwatchBorder", label: "Border · Unselected" },
      { key: "colorSwatchBorderSelected", label: "Border · Selected" },
    ],
  },
  {
    title: "Image swatches",
    items: [
      { key: "imageSwatchBorder", label: "Border · Unselected" },
      { key: "imageSwatchBorderSelected", label: "Border · Selected" },
    ],
  },
  {
    title: "Buttons",
    items: [
      { key: "buttonBackground", label: "Background · Unselected" },
      { key: "buttonText", label: "Text · Unselected" },
      { key: "buttonBorder", label: "Border" },
      { key: "buttonBackgroundSelected", label: "Background · Selected" },
      { key: "buttonTextSelected", label: "Text · Selected" },
    ],
  },
];

export const SIZE_FIELDS: Array<{
  key: keyof SizeSettings;
  label: string;
  min: number;
  max: number;
}> = [
  { key: "inputHeight", label: "Text input height", min: 28, max: 80 },
  { key: "dropdownHeight", label: "Dropdown height", min: 28, max: 80 },
  { key: "quantityHeight", label: "Quantity selector height", min: 28, max: 80 },
  { key: "swatchSize", label: "Swatch size", min: 16, max: 80 },
  { key: "buttonMinHeight", label: "Button min height", min: 24, max: 72 },
  { key: "checkboxSize", label: "Checkbox / radio size", min: 12, max: 32 },
  { key: "uploadButtonHeight", label: "File upload button height", min: 28, max: 72 },
];

export const SHAPE_RADIUS_FIELDS: Array<{
  key: keyof Pick<ShapeSettings, "inputRadius" | "buttonRadius" | "totalRadius" | "swatchRadius">;
  label: string;
}> = [
  { key: "inputRadius", label: "Input / dropdown corner radius" },
  { key: "buttonRadius", label: "Button corner radius" },
  { key: "totalRadius", label: "Total price box corner radius" },
  { key: "swatchRadius", label: "Image swatch corner radius (when rounded)" },
];

export const SPACING_FIELDS: Array<{
  key: keyof SpacingSettings;
  label: string;
  min: number;
  max: number;
}> = [
  { key: "fieldGap", label: "Gap between options", min: 0, max: 48 },
  { key: "choiceGap", label: "Gap between option values", min: 0, max: 32 },
  { key: "swatchGap", label: "Gap between swatches", min: 0, max: 32 },
  { key: "labelGap", label: "Gap under option label", min: 0, max: 24 },
  { key: "widgetPadding", label: "Widget padding", min: 0, max: 48 },
];

export const TRANSLATION_FIELDS: Array<{
  key: keyof TranslationSettings;
  label: string;
}> = [
  { key: "pleaseSelect", label: "Dropdown placeholder" },
  { key: "required", label: "Required marker" },
  { key: "optionsTotal", label: "Total (additional) price label" },
  { key: "youveChosen", label: "Selected values prefix" },
  { key: "yes", label: "Switch · On" },
  { key: "no", label: "Switch · Off" },
  { key: "uploadFile", label: "File upload button" },
  { key: "errorRequired", label: "Required error message" },
];

export function colorsForMode(mode: ThemeMode): ColorSettings {
  return mode === "dark" ? DARK_COLORS : LIGHT_COLORS;
}

/** Previous Easify-like default. Shops still on this palette pick up the new daylight look. */
export const LEGACY_LIGHT_COLORS: ColorSettings = {
  optionLabel: "#121212",
  optionValue: "#121212",
  selectedValue: "#444444",
  helpText: "#595959",
  errorMessage: "#FF0000",
  tooltip: "#595959",
  totalBackground: "#FFFFFF",
  totalText: "#121212",
  totalPrice: "#009D5B",
  totalBorder: "#121212",
  inputPlaceholder: "#B3B3B3",
  inputValue: "#121212",
  inputBorder: "#E6E6E6",
  inputBorderFocus: "#1E1E1E",
  inputBackground: "#FFFFFF",
  inputBackgroundFocus: "#FFFFFF",
  colorSwatchBorder: "#E6E6E6",
  colorSwatchBorderSelected: "#1E1E1E",
  imageSwatchBorder: "#E6E6E6",
  imageSwatchBorderSelected: "#1E1E1E",
  buttonBackground: "#FFFFFF",
  buttonText: "#121212",
  buttonBorder: "#E6E6E6",
  buttonBackgroundSelected: "#1E1E1E",
  buttonTextSelected: "#FFFFFF",
  switchOn: "#1E1E1E",
};

export function isLegacyLightPalette(colors: ColorSettings): boolean {
  return (Object.keys(LEGACY_LIGHT_COLORS) as Array<keyof ColorSettings>).every(
    (key) => colors[key].toUpperCase() === LEGACY_LIGHT_COLORS[key].toUpperCase(),
  );
}

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
