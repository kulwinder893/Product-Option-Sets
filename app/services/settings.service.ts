import type { AppDesignSettings } from "../types/app-design";
import { settingsRepository } from "../repositories/settings.repository";
import { assertShop, safeJsonParse } from "../utils/errors";
import { normalizeAppDesign, toStorefrontDesign } from "../utils/app-design";

export class SettingsService {
  async getDesign(shop: string): Promise<AppDesignSettings> {
    assertShop(shop);
    const row = await settingsRepository.findByShop(shop);
    return normalizeAppDesign(safeJsonParse(row?.theme, {}));
  }

  async saveFonts(shop: string, fonts: AppDesignSettings["fonts"]): Promise<AppDesignSettings> {
    assertShop(shop);
    const current = await this.getDesign(shop);
    const next = normalizeAppDesign({ ...current, fonts });
    await settingsRepository.upsertTheme(shop, JSON.stringify(next));
    return next;
  }

  async resetFonts(shop: string): Promise<AppDesignSettings> {
    return this.saveFonts(shop, normalizeAppDesign({}).fonts);
  }

  async getStorefrontDesign(shop: string) {
    const design = await this.getDesign(shop);
    return toStorefrontDesign(design.fonts);
  }
}

export const settingsService = new SettingsService();
