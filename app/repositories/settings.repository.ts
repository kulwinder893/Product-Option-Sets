import prisma from "../db.server";
import { assertShop } from "../utils/errors";

export class SettingsRepository {
  async findByShop(shop: string) {
    assertShop(shop);
    return prisma.settings.findUnique({ where: { shop } });
  }

  async upsertAll(
    shop: string,
    data: {
      theme: string;
      translations: string;
      general: string;
      customCss: string | null;
    },
  ) {
    assertShop(shop);
    return prisma.settings.upsert({
      where: { shop },
      create: {
        shop,
        theme: data.theme,
        translations: data.translations,
        general: data.general,
        customCss: data.customCss,
      },
      update: {
        theme: data.theme,
        translations: data.translations,
        general: data.general,
        customCss: data.customCss,
      },
    });
  }
}

export const settingsRepository = new SettingsRepository();
