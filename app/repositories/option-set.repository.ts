import type { OptionSet, OptionSetStatus, Prisma } from "@prisma/client";
import prisma from "../db.server";
import type {
  OptionSetListFilters,
  OptionSetListItem,
  OptionSetListResult,
  OptionSetSortField,
} from "../types/option-set";
import { parsePagination, totalPages } from "../utils/pagination";
import { assertShop } from "../utils/errors";

const listInclude = {
  _count: {
    select: {
      fields: true,
      productAssignments: true,
      collectionAssignments: true,
    },
  },
} satisfies Prisma.OptionSetInclude;

function buildOrderBy(
  sort: OptionSetSortField = "updatedAt",
  order: "asc" | "desc" = "desc",
): Prisma.OptionSetOrderByWithRelationInput {
  return { [sort]: order };
}

export class OptionSetRepository {
  async list(filters: OptionSetListFilters): Promise<OptionSetListResult> {
    assertShop(filters.shop);

    const { page, pageSize, skip, take } = parsePagination({
      page: filters.page,
      pageSize: filters.pageSize,
    });

    const where: Prisma.OptionSetWhereInput = {
      shop: filters.shop,
      deletedAt: filters.includeDeleted ? undefined : null,
    };

    if (filters.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    if (filters.query) {
      where.OR = [
        { name: { contains: filters.query } },
        { description: { contains: filters.query } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.optionSet.findMany({
        where,
        include: listInclude,
        orderBy: buildOrderBy(filters.sort, filters.order),
        skip,
        take,
      }),
      prisma.optionSet.count({ where }),
    ]);

    return {
      items: items as OptionSetListItem[],
      total,
      page,
      pageSize,
      totalPages: totalPages(total, pageSize),
    };
  }

  async findById(shop: string, id: string): Promise<OptionSet | null> {
    assertShop(shop);
    return prisma.optionSet.findFirst({
      where: { id, shop, deletedAt: null },
    });
  }

  async create(
    shop: string,
    data: { name: string; description?: string | null; priority?: number },
  ): Promise<OptionSet> {
    assertShop(shop);
    return prisma.optionSet.create({
      data: {
        shop,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        priority: data.priority ?? 0,
        status: "ACTIVE",
      },
    });
  }

  async updateStatus(
    shop: string,
    id: string,
    status: OptionSetStatus,
  ): Promise<OptionSet | null> {
    assertShop(shop);
    const existing = await this.findById(shop, id);
    if (!existing) return null;

    return prisma.optionSet.update({
      where: { id },
      data: { status },
    });
  }

  async softDelete(shop: string, id: string): Promise<OptionSet | null> {
    assertShop(shop);
    const existing = await this.findById(shop, id);
    if (!existing) return null;

    return prisma.optionSet.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "ARCHIVED",
      },
    });
  }

  async duplicate(shop: string, id: string): Promise<OptionSet | null> {
    assertShop(shop);

    const source = await prisma.optionSet.findFirst({
      where: { id, shop, deletedAt: null },
      include: {
        fields: {
          include: { choices: true },
          orderBy: { sortOrder: "asc" },
        },
        priceRules: true,
        conditionalRules: true,
      },
    });

    if (!source) return null;

    return prisma.$transaction(async (tx) => {
      const copy = await tx.optionSet.create({
        data: {
          shop,
          name: `${source.name} (Copy)`,
          description: source.description,
          status: "DISABLED",
          priority: source.priority,
          internalNote: source.internalNote,
        },
      });

      const fieldIdMap = new Map<string, string>();

      // First pass: create fields without parents
      for (const field of source.fields.filter((f) => !f.parentId)) {
        const created = await tx.optionField.create({
          data: {
            optionSetId: copy.id,
            type: field.type,
            label: field.label,
            description: field.description,
            placeholder: field.placeholder,
            required: field.required,
            hidden: field.hidden,
            defaultValue: field.defaultValue,
            validation: field.validation,
            cssClass: field.cssClass,
            tooltip: field.tooltip,
            helpText: field.helpText,
            customErrorMessage: field.customErrorMessage,
            minQuantity: field.minQuantity,
            maxQuantity: field.maxQuantity,
            minLength: field.minLength,
            maxLength: field.maxLength,
            sortOrder: field.sortOrder,
            collapsed: field.collapsed,
            settings: field.settings,
            choices: {
              create: field.choices.map((choice) => ({
                label: choice.label,
                value: choice.value,
                imageUrl: choice.imageUrl,
                colorHex: choice.colorHex,
                priceAddon: choice.priceAddon,
                isDefault: choice.isDefault,
                isDisabled: choice.isDisabled,
                sortOrder: choice.sortOrder,
                metadata: choice.metadata,
              })),
            },
          },
        });
        fieldIdMap.set(field.id, created.id);
      }

      // Second pass: nested children
      for (const field of source.fields.filter((f) => f.parentId)) {
        const parentId = field.parentId
          ? fieldIdMap.get(field.parentId)
          : undefined;
        if (!parentId) continue;

        const created = await tx.optionField.create({
          data: {
            optionSetId: copy.id,
            parentId,
            type: field.type,
            label: field.label,
            description: field.description,
            placeholder: field.placeholder,
            required: field.required,
            hidden: field.hidden,
            defaultValue: field.defaultValue,
            validation: field.validation,
            cssClass: field.cssClass,
            tooltip: field.tooltip,
            helpText: field.helpText,
            customErrorMessage: field.customErrorMessage,
            minQuantity: field.minQuantity,
            maxQuantity: field.maxQuantity,
            minLength: field.minLength,
            maxLength: field.maxLength,
            sortOrder: field.sortOrder,
            collapsed: field.collapsed,
            settings: field.settings,
            choices: {
              create: field.choices.map((choice) => ({
                label: choice.label,
                value: choice.value,
                imageUrl: choice.imageUrl,
                colorHex: choice.colorHex,
                priceAddon: choice.priceAddon,
                isDefault: choice.isDefault,
                isDisabled: choice.isDisabled,
                sortOrder: choice.sortOrder,
                metadata: choice.metadata,
              })),
            },
          },
        });
        fieldIdMap.set(field.id, created.id);
      }

      for (const rule of source.priceRules) {
        await tx.priceRule.create({
          data: {
            optionSetId: copy.id,
            fieldId: rule.fieldId ? fieldIdMap.get(rule.fieldId) : undefined,
            type: rule.type,
            amount: rule.amount,
            formula: rule.formula,
            quantityTiers: rule.quantityTiers,
            label: rule.label,
            enabled: rule.enabled,
            sortOrder: rule.sortOrder,
          },
        });
      }

      for (const rule of source.conditionalRules) {
        const targetFieldId = fieldIdMap.get(rule.targetFieldId);
        if (!targetFieldId) continue;

        await tx.conditionalRule.create({
          data: {
            optionSetId: copy.id,
            targetFieldId,
            triggerFieldId: rule.triggerFieldId
              ? fieldIdMap.get(rule.triggerFieldId)
              : undefined,
            action: rule.action,
            logic: rule.logic,
            conditions: rule.conditions,
            sortOrder: rule.sortOrder,
            enabled: rule.enabled,
          },
        });
      }

      return copy;
    });
  }

  async countByStatus(shop: string): Promise<Record<string, number>> {
    assertShop(shop);
    const groups = await prisma.optionSet.groupBy({
      by: ["status"],
      where: { shop, deletedAt: null },
      _count: { _all: true },
    });

    return groups.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    }, {});
  }
}

export const optionSetRepository = new OptionSetRepository();
