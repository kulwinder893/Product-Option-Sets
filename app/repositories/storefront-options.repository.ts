import type { Prisma } from "@prisma/client";
import prisma from "../db.server";
import { assertShop } from "../utils/errors";

export type MatchableOptionSet = Prisma.OptionSetGetPayload<{
  include: { fields: { include: { choices: true } } };
}>;

export class StorefrontOptionsRepository {
  /**
   * Loads every published option set that could apply to a product. Manual
   * assignments are filtered in SQL; condition-based sets are returned in full
   * so the service can evaluate them against the storefront product context.
   */
  async findCandidates(
    shop: string,
    productGid: string,
  ): Promise<MatchableOptionSet[]> {
    assertShop(shop);

    return prisma.optionSet.findMany({
      where: {
        shop,
        status: "ACTIVE",
        deletedAt: null,
        OR: [
          { assignmentMode: "ALL_PRODUCTS" },
          { assignmentMode: "CONDITIONS" },
          {
            assignmentMode: "MANUAL",
            productAssignments: { some: { productGid, enabled: true } },
          },
        ],
      },
      include: {
        fields: {
          include: { choices: { orderBy: { sortOrder: "asc" } } },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    });
  }
}

export const storefrontOptionsRepository = new StorefrontOptionsRepository();
