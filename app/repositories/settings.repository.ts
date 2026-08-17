import prisma from "../db.server";
import { assertShop } from "../utils/errors";

export class SettingsRepository {
  async findByShop(shop: string) {
    assertShop(shop);
    return prisma.settings.findUnique({ where: { shop } });
  }

  async upsertTheme(shop: string, theme: string) {
    assertShop(shop);
    return prisma.settings.upsert({
      where: { shop },
      create: { shop, theme },
      update: { theme },
    });
  }
}

export const settingsRepository = new SettingsRepository();
