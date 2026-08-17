export type FontFamilyId = string;
export type FontStyleId = "normal" | "bold" | "italic" | "bold_italic";
export type StylePreset = "modern" | "classic";
export type ThemeMode = "light" | "dark";
export type ChoiceLayout = "vertical" | "horizontal";
export type SwatchShape = "circle" | "square" | "rounded";

export type FontToken = {
  family: FontFamilyId;
  style: FontStyleId;
  size: number;
};

export const FONT_ELEMENT_KEYS = [
  "optionLabel",
  "optionValue",
  "selectedValue",
  "helpText",
  "tooltip",
  "totalPrice",
  "errorText",
  "inputText",
  "quantitySelector",
  "fileUpload",
  "badgeText",
] as const;

export type FontElementKey = (typeof FONT_ELEMENT_KEYS)[number];
export type FontSettings = Record<FontElementKey, FontToken>;

export type StyleSettings = {
  preset: StylePreset;
  mode: ThemeMode;
  choiceLayout: ChoiceLayout;
  showSelectedValue: boolean;
};

export type ColorSettings = {
  optionLabel: string;
  optionValue: string;
  selectedValue: string;
  helpText: string;
  errorMessage: string;
  tooltip: string;
  totalBackground: string;
  totalText: string;
  totalPrice: string;
  totalBorder: string;
  inputPlaceholder: string;
  inputValue: string;
  inputBorder: string;
  inputBorderFocus: string;
  inputBackground: string;
  inputBackgroundFocus: string;
  colorSwatchBorder: string;
  colorSwatchBorderSelected: string;
  imageSwatchBorder: string;
  imageSwatchBorderSelected: string;
  buttonBackground: string;
  buttonText: string;
  buttonBorder: string;
  buttonBackgroundSelected: string;
  buttonTextSelected: string;
  switchOn: string;
};

export type SizeSettings = {
  inputHeight: number;
  dropdownHeight: number;
  swatchSize: number;
  buttonMinHeight: number;
  checkboxSize: number;
  quantityHeight: number;
  uploadButtonHeight: number;
};

export type ShapeSettings = {
  inputRadius: number;
  buttonRadius: number;
  totalRadius: number;
  swatchShape: SwatchShape;
  swatchRadius: number;
};

export type SpacingSettings = {
  fieldGap: number;
  choiceGap: number;
  swatchGap: number;
  labelGap: number;
  widgetPadding: number;
};

export type AppDesignSettings = {
  style: StyleSettings;
  fonts: FontSettings;
  colors: ColorSettings;
  sizes: SizeSettings;
  shapes: ShapeSettings;
  spacing: SpacingSettings;
  customCss: string;
};

export type TranslationSettings = {
  pleaseSelect: string;
  required: string;
  optionsTotal: string;
  youveChosen: string;
  yes: string;
  no: string;
  uploadFile: string;
  errorRequired: string;
};

export type AdvancedSettings = {
  showTotal: boolean;
  showPriceAddons: boolean;
  totalIncludesProductPrice: boolean;
  hideOutOfStock: boolean;
  addToCartText: string;
};

export type AppSettingsState = {
  design: AppDesignSettings;
  translations: TranslationSettings;
  advanced: AdvancedSettings;
};

export type SettingsEditorProps = {
  settings: AppSettingsState;
  onChange: (next: AppSettingsState) => void;
};

export type StorefrontDesignPayload = {
  css: string;
  googleFontsUrl: string | null;
  fonts: FontSettings;
  style: StyleSettings;
  translations: TranslationSettings;
  advanced: AdvancedSettings;
};
