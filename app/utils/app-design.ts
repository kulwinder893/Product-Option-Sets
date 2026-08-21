import {
  DEFAULT_ADVANCED,
  DEFAULT_DESIGN,
  DEFAULT_FONT_SETTINGS,
  DEFAULT_TRANSLATIONS,
  FONT_ELEMENT_LABELS,
  FONT_FAMILIES,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FONT_STYLES,
  LIGHT_COLORS,
  DEFAULT_SPACING,
  isLegacyLightPalette,
  isLegacySpacing,
} from "../constants/app-design";
import {
  FONT_ELEMENT_KEYS,
  type AdvancedSettings,
  type AppDesignSettings,
  type AppSettingsState,
  type ColorSettings,
  type FontElementKey,
  type FontSettings,
  type FontStyleId,
  type FontToken,
  type ShapeSettings,
  type SizeSettings,
  type SpacingSettings,
  type StorefrontDesignPayload,
  type StyleSettings,
  type TranslationSettings,
} from "../types/app-design";

const FONT_SELECTORS: Record<FontElementKey, string> = {
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
  quantitySelector: ".product-options__quantity, .product-options__range-value",
  fileUpload: ".product-options__upload, .product-options__filename",
  badgeText: ".product-options__badge",
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function clamp(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function isHex(value: unknown): value is string {
  return typeof value === "string" && /^#([0-9a-fA-F]{3,8})$/.test(value);
}

function isFontStyle(value: unknown): value is FontStyleId {
  return FONT_STYLES.some((style) => style.id === value);
}

function normalizeToken(raw: unknown, fallback: FontToken): FontToken {
  if (!isObject(raw)) return { ...fallback };
  const family = FONT_FAMILIES.some((item) => item.id === raw.family)
    ? String(raw.family)
    : fallback.family;
  const style = isFontStyle(raw.style) ? raw.style : fallback.style;
  const size = clamp(Number(raw.size), FONT_SIZE_MIN, FONT_SIZE_MAX, fallback.size);
  return { family, style, size };
}

export function normalizeFontSettings(raw: unknown): FontSettings {
  const source = isObject(raw) ? raw : {};
  const next = { ...DEFAULT_FONT_SETTINGS };
  for (const key of FONT_ELEMENT_KEYS) {
    next[key] = normalizeToken(source[key], DEFAULT_FONT_SETTINGS[key]);
  }
  return next;
}

function mergeRecord<T extends Record<string, unknown>>(defaults: T, raw: unknown): T {
  if (!isObject(raw)) return { ...defaults };
  const next = { ...defaults };
  for (const key of Object.keys(defaults) as Array<keyof T>) {
    const current = defaults[key];
    const incoming = raw[key as string];
    if (typeof current === "string") {
      if (typeof incoming === "string" && incoming.trim()) {
        next[key] = incoming as T[keyof T];
      }
    } else if (typeof current === "number") {
      if (typeof incoming === "number" && Number.isFinite(incoming)) {
        next[key] = incoming as T[keyof T];
      }
    } else if (typeof current === "boolean") {
      if (typeof incoming === "boolean") {
        next[key] = incoming as T[keyof T];
      }
    }
  }
  return next;
}

function normalizeColors(raw: unknown): ColorSettings {
  const merged = mergeRecord(LIGHT_COLORS as unknown as Record<string, unknown>, raw);
  const next = { ...LIGHT_COLORS };
  for (const key of Object.keys(LIGHT_COLORS) as Array<keyof ColorSettings>) {
    const value = merged[key];
    next[key] = isHex(value) ? value : LIGHT_COLORS[key];
  }
  if (isObject(raw) && isLegacyLightPalette(next)) {
    return { ...LIGHT_COLORS };
  }
  return next;
}

export function normalizeAppDesign(raw: unknown): AppDesignSettings {
  const source = isObject(raw) ? raw : {};
  const style = mergeRecord(
    DEFAULT_DESIGN.style as unknown as Record<string, unknown>,
    source.style,
  ) as unknown as StyleSettings;
  if (style.preset !== "classic") style.preset = "modern";
  if (style.mode !== "dark") style.mode = "light";
  if (style.choiceLayout !== "vertical") style.choiceLayout = "horizontal";
  return {
    style,
    fonts: normalizeFontSettings(source.fonts),
    colors: normalizeColors(source.colors),
    sizes: mergeRecord(
      DEFAULT_DESIGN.sizes as unknown as Record<string, unknown>,
      source.sizes,
    ) as unknown as SizeSettings,
    shapes: mergeRecord(
      DEFAULT_DESIGN.shapes as unknown as Record<string, unknown>,
      source.shapes,
    ) as unknown as ShapeSettings,
    spacing: normalizeSpacing(source.spacing),
    customCss: typeof source.customCss === "string" ? source.customCss : "",
  };
}

function normalizeSpacing(raw: unknown): SpacingSettings {
  const spacing = mergeRecord(
    DEFAULT_SPACING as unknown as Record<string, unknown>,
    raw,
  ) as unknown as SpacingSettings;
  if (isObject(raw) && isLegacySpacing(spacing)) {
    return { ...DEFAULT_SPACING };
  }
  return spacing;
}

export function normalizeTranslations(raw: unknown): TranslationSettings {
  return mergeRecord(
    DEFAULT_TRANSLATIONS as unknown as Record<string, unknown>,
    raw,
  ) as unknown as TranslationSettings;
}

export function normalizeAdvanced(raw: unknown): AdvancedSettings {
  return mergeRecord(
    DEFAULT_ADVANCED as unknown as Record<string, unknown>,
    raw,
  ) as unknown as AdvancedSettings;
}

export function normalizeAppSettings(raw: unknown): AppSettingsState {
  const source = isObject(raw) ? raw : {};
  return {
    design: normalizeAppDesign(source.design ?? source),
    translations: normalizeTranslations(source.translations),
    advanced: normalizeAdvanced(source.advanced),
  };
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

function fontRules(fonts: FontSettings, scope?: string): string {
  return FONT_ELEMENT_KEYS.map((key) => {
    const token = fonts[key];
    const { weight, italic } = styleToCss(token.style);
    return `${scopedSelector(FONT_SELECTORS[key], scope)} {
  font-family: ${familyStack(token.family)};
  font-weight: ${weight};
  font-style: ${italic};
  font-size: ${token.size}px;
}`;
  }).join("\n");
}

function rootSelector(scope?: string) {
  return scope || ".product-options";
}

function cssVariables(design: AppDesignSettings): string {
  const { colors, sizes, shapes, spacing, style } = design;
  const swatchRadius =
    shapes.swatchShape === "circle"
      ? "50%"
      : shapes.swatchShape === "rounded"
        ? `${shapes.swatchRadius}px`
        : "0px";

  return `
  --po-color-label: ${colors.optionLabel};
  --po-color-value: ${colors.optionValue};
  --po-color-selected: ${colors.selectedValue};
  --po-color-help: ${colors.helpText};
  --po-color-tooltip: ${colors.tooltip};
  --po-color-error: ${colors.errorMessage};
  --po-total-bg: ${colors.totalBackground};
  --po-total-text: ${colors.totalText};
  --po-total-price: ${colors.totalPrice};
  --po-total-border: ${colors.totalBorder};
  --po-input-placeholder: ${colors.inputPlaceholder};
  --po-input-text: ${colors.inputValue};
  --po-input-border: ${colors.inputBorder};
  --po-input-border-focus: ${colors.inputBorderFocus};
  --po-input-bg: ${colors.inputBackground};
  --po-input-bg-focus: ${colors.inputBackgroundFocus};
  --po-color-swatch-border: ${colors.colorSwatchBorder};
  --po-color-swatch-border-selected: ${colors.colorSwatchBorderSelected};
  --po-image-swatch-border: ${colors.imageSwatchBorder};
  --po-image-swatch-border-selected: ${colors.imageSwatchBorderSelected};
  --po-button-bg: ${colors.buttonBackground};
  --po-button-text: ${colors.buttonText};
  --po-button-border: ${colors.buttonBorder};
  --po-button-bg-selected: ${colors.buttonBackgroundSelected};
  --po-button-text-selected: ${colors.buttonTextSelected};
  --po-switch-on: ${colors.switchOn};
  --po-input-height: ${sizes.inputHeight}px;
  --po-dropdown-height: ${sizes.dropdownHeight}px;
  --po-quantity-height: ${sizes.quantityHeight}px;
  --po-swatch-size: ${sizes.swatchSize}px;
  --po-button-min-height: ${sizes.buttonMinHeight}px;
  --po-checkbox-size: ${sizes.checkboxSize}px;
  --po-upload-height: ${sizes.uploadButtonHeight}px;
  --po-input-radius: ${shapes.inputRadius}px;
  --po-button-radius: ${shapes.buttonRadius}px;
  --po-total-radius: ${shapes.totalRadius}px;
  --po-swatch-radius: ${swatchRadius};
  --po-field-gap: ${spacing.fieldGap}px;
  --po-choice-gap: ${spacing.choiceGap}px;
  --po-swatch-gap: ${spacing.swatchGap}px;
  --po-label-gap: ${spacing.labelGap}px;
  --po-widget-padding: ${spacing.widgetPadding}px;
  --po-choice-direction: ${style.choiceLayout === "horizontal" ? "row" : "column"};
  --product-options-accent: ${colors.inputBorderFocus};
  --product-options-border: ${colors.inputBorder};
  --product-options-radius: ${shapes.inputRadius}px;
`.trimEnd();
}

/**
 * Concrete layout rules so Spacing / Shape beat theme-extension defaults even
 * when the injected <style> tag loses the cascade war on CSS variables alone.
 */
function layoutRules(design: AppDesignSettings, scope?: string): string {
  const { spacing, style, shapes, sizes } = design;
  const direction = style.choiceLayout === "vertical" ? "column" : "row";
  const swatchRadius =
    shapes.swatchShape === "circle"
      ? "50%"
      : shapes.swatchShape === "rounded"
        ? `${shapes.swatchRadius}px`
        : "0px";

  return `
${rootSelector(scope)} {
  gap: ${spacing.fieldGap}px !important;
  padding: ${spacing.widgetPadding}px !important;
}
${scopedSelector(".product-options__field", scope)} {
  gap: ${spacing.labelGap}px !important;
}
${scopedSelector(".product-options__choices, .product-options__buttons", scope)} {
  gap: ${spacing.choiceGap}px !important;
  flex-direction: ${direction} !important;
}
${scopedSelector(".product-options__swatches", scope)} {
  gap: ${spacing.swatchGap}px !important;
}
${scopedSelector(".product-options__swatch-visual", scope)} {
  width: ${sizes.swatchSize}px !important;
  height: ${sizes.swatchSize}px !important;
  border-radius: ${swatchRadius} !important;
}
${scopedSelector(".product-options__input, .product-options__select, .product-options__textarea", scope)} {
  min-height: ${sizes.inputHeight}px !important;
  border-radius: ${shapes.inputRadius}px !important;
}
${scopedSelector(".product-options__select", scope)} {
  min-height: ${sizes.dropdownHeight}px !important;
}`.trim();
}

/** Turns App Design into CSS. Layout is in product-options.css; this sets variables, layout, fonts, and Custom CSS. */
export function designToCss(design: AppDesignSettings, scope?: string): string {
  const root = rootSelector(scope);
  const hideSelected = design.style.showSelectedValue
    ? ""
    : `\n${scopedSelector(".product-options__selected-value", scope)} { display: none; }`;
  const fonts = fontRules(design.fonts, scope);
  const layout = layoutRules(design, scope);
  const custom = design.customCss?.trim()
    ? `\n/* Merchant Custom CSS */\n${design.customCss.trim()}`
    : "";
  return `${root} {
${cssVariables(design)}
  gap: var(--po-field-gap);
  padding: var(--po-widget-padding);
}
${layout}
${fonts}${hideSelected}${custom}`;
}

export function toStorefrontDesign(
  settings: AppSettingsState,
): StorefrontDesignPayload {
  return {
    css: designToCss(settings.design),
    customCss: settings.design.customCss || "",
    googleFontsUrl: googleFontsUrl(settings.design.fonts),
    fonts: settings.design.fonts,
    style: settings.design.style,
    colors: settings.design.colors,
    sizes: settings.design.sizes,
    shapes: settings.design.shapes,
    spacing: settings.design.spacing,
    translations: settings.translations,
    advanced: settings.advanced,
  };
}

export { FONT_ELEMENT_LABELS };
