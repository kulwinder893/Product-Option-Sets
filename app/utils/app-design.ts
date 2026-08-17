import {
  DEFAULT_FONT_SETTINGS,
  FONT_ELEMENT_LABELS,
  FONT_FAMILIES,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FONT_STYLES,
} from "../constants/app-design";
import {
  FONT_ELEMENT_KEYS,
  type AppDesignSettings,
  type FontElementKey,
  type FontSettings,
  type FontStyleId,
  type FontToken,
  type StorefrontDesignPayload,
} from "../types/app-design";

const SELECTORS: Record<FontElementKey, string> = {
  optionLabel: ".product-options__label-text, .product-options__group-title",
  optionValue:
    ".product-options__choice-label, .product-options__button, .product-options__swatch",
  selectedValue: ".product-options__selected-value",
  helpText: ".product-options__help, .product-options__description",
  tooltip: ".product-options__tooltip",
  totalPrice: ".product-options__total, .product-options__addon",
  errorText: ".product-options__error",
  inputText:
    ".product-options__input, .product-options__select, .product-options__textarea",
  quantitySelector:
    ".product-options__quantity, .product-options__range-value",
};

function clampSize(value: number): number {
  if (!Number.isFinite(value)) return 14;
  return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(value)));
}

function isFontStyle(value: unknown): value is FontStyleId {
  return FONT_STYLES.some((style) => style.id === value);
}

function normalizeToken(raw: unknown, fallback: FontToken): FontToken {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const token = raw as Partial<FontToken>;
  const family = FONT_FAMILIES.some((item) => item.id === token.family)
    ? token.family!
    : fallback.family;
  const style = isFontStyle(token.style) ? token.style : fallback.style;
  const size = clampSize(Number(token.size ?? fallback.size));
  return { family, style, size };
}

export function normalizeFontSettings(raw: unknown): FontSettings {
  const source =
    raw && typeof raw === "object" ? (raw as Partial<FontSettings>) : {};
  const next = { ...DEFAULT_FONT_SETTINGS };
  for (const key of FONT_ELEMENT_KEYS) {
    next[key] = normalizeToken(source[key], DEFAULT_FONT_SETTINGS[key]);
  }
  return next;
}

export function normalizeAppDesign(raw: unknown): AppDesignSettings {
  const source = raw && typeof raw === "object" ? (raw as { fonts?: unknown }) : {};
  return { fonts: normalizeFontSettings(source.fonts) };
}

function styleToCss(style: FontStyleId): { weight: string; italic: string } {
  switch (style) {
    case "bold":
      return { weight: "700", italic: "normal" };
    case "italic":
      return { weight: "400", italic: "italic" };
    case "bold_italic":
      return { weight: "700", italic: "italic" };
    default:
      return { weight: "400", italic: "normal" };
  }
}

function familyStack(familyId: string): string {
  return FONT_FAMILIES.find((item) => item.id === familyId)?.stack ?? "inherit";
}

export function googleFontsUrl(fonts: FontSettings): string | null {
  const names = new Set<string>();
  for (const key of FONT_ELEMENT_KEYS) {
    const meta = FONT_FAMILIES.find((item) => item.id === fonts[key].family);
    if (meta?.google) names.add(meta.google);
  }
  if (names.size === 0) return null;
  const families = Array.from(names)
    .map((name) => `family=${name}:ital,wght@0,400;0,700;1,400;1,700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function scopedSelector(selectors: string, scope?: string): string {
  if (!scope) return selectors;
  return selectors
    .split(",")
    .map((selector) => `${scope} ${selector.trim()}`)
    .join(", ");
}

export function fontSettingsToCss(fonts: FontSettings, scope?: string): string {
  return FONT_ELEMENT_KEYS.map((key) => {
    const token = fonts[key];
    const { weight, italic } = styleToCss(token.style);
    return `${scopedSelector(SELECTORS[key], scope)} {
  font-family: ${familyStack(token.family)};
  font-weight: ${weight};
  font-style: ${italic};
  font-size: ${token.size}px;
}`;
  }).join("\n");
}

export function toStorefrontDesign(fonts: FontSettings): StorefrontDesignPayload {
  return {
    fonts,
    css: fontSettingsToCss(fonts),
    googleFontsUrl: googleFontsUrl(fonts),
  };
}

export { FONT_ELEMENT_LABELS };
