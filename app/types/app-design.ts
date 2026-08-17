export type FontFamilyId = string;

export type FontStyleId = "normal" | "bold" | "italic" | "bold_italic";

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
] as const;

export type FontElementKey = (typeof FONT_ELEMENT_KEYS)[number];

export type FontSettings = Record<FontElementKey, FontToken>;

export type AppDesignSettings = {
  fonts: FontSettings;
};

export type StorefrontDesignPayload = {
  fonts: FontSettings;
  css: string;
  googleFontsUrl: string | null;
};
