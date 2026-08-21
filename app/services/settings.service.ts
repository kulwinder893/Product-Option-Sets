import type { AppDesignSettings, AppSettingsState } from "../types/app-design";
import { settingsRepository } from "../repositories/settings.repository";
import { assertShop, safeJsonParse } from "../utils/errors";
import { normalizeAppSettings, toStorefrontDesign } from "../utils/app-design";
import { DEFAULT_DESIGN, colorsForMode } from "../constants/app-design";

function pack(settings: AppSettingsState) {
  return {
    theme: JSON.stringify(settings.design),
    translations: JSON.stringify(settings.translations),
    general: JSON.stringify(settings.advanced),
    customCss: settings.design.customCss || null,
  };
}

export class SettingsService {
  async getAll(shop: string): Promise<AppSettingsState> {
    assertShop(shop);
    const row = await settingsRepository.findByShop(shop);
    const theme = safeJsonParse<AppDesignSettings>(row?.theme, DEFAULT_DESIGN);
    // Prefer the dedicated column, but fall back to CSS stored inside theme JSON
    // so a null column never wipes merchant Custom CSS on read.
    const customCss = row?.customCss ?? theme.customCss ?? "";
    return normalizeAppSettings({
      design: {
        ...theme,
        customCss,
      },
      translations: safeJsonParse(row?.translations, {}),
      advanced: safeJsonParse(row?.general, {}),
    });
  }

  async saveAll(shop: string, settings: AppSettingsState): Promise<AppSettingsState> {
    assertShop(shop);
    const next = normalizeAppSettings(settings);
    await settingsRepository.upsertAll(shop, pack(next));
    return next;
  }

  async resetDesign(shop: string): Promise<AppSettingsState> {
    const current = await this.getAll(shop);
    const mode = current.design.style.mode;
    return this.saveAll(shop, {
      ...current,
      design: {
        ...DEFAULT_DESIGN,
        style: { ...DEFAULT_DESIGN.style, mode },
        colors: colorsForMode(mode),
      },
    });
  }

  async getStorefrontDesign(shop: string) {
    return toStorefrontDesign(await this.getAll(shop));
  }
}

export const settingsService = new SettingsService();
