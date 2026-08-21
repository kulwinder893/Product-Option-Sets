import type { Prisma } from "@prisma/client";
import prisma from "../db.server";
import type {
  FieldDraft,
  OptionSetDraft,
  ProductCondition,
} from "../types/field";
import { isTempId } from "../utils/draft";
import { safeJsonParse } from "../utils/errors";

type FieldWithChoices = Prisma.OptionFieldGetPayload<{
  include: { choices: true };
}>;

function toFieldDraft(field: FieldWithChoices): FieldDraft {
  return {
    id: field.id,
    parentId: field.parentId,
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
    settings: safeJsonParse(field.settings, {}),
    choices: [...field.choices]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((choice) => ({
        id: choice.id,
        label: choice.label,
        value: choice.value,
        imageUrl: choice.imageUrl,
        colorHex: choice.colorHex,
        priceAddon: choice.priceAddon,
        isDefault: choice.isDefault,
        isDisabled: choice.isDisabled,
        sortOrder: choice.sortOrder,
      })),
  };
}

/** Scalar columns shared by create and update paths. */
function fieldColumns(field: FieldDraft) {
  return {
    type: field.type,
    label: field.label.trim(),
    description: field.description?.trim() || null,
    placeholder: field.placeholder?.trim() || null,
    required: field.required,
    hidden: field.hidden,
    defaultValue: field.defaultValue,
    validation: field.validation,
    cssClass: field.cssClass?.trim() || null,
    tooltip: field.tooltip?.trim() || null,
    helpText: field.helpText?.trim() || null,
    customErrorMessage: field.customErrorMessage?.trim() || null,
    minQuantity: field.minQuantity,
    maxQuantity: field.maxQuantity,
    minLength: field.minLength,
    maxLength: field.maxLength,
    sortOrder: field.sortOrder,
    collapsed: field.collapsed,
    settings: JSON.stringify(sanitizeSettings(field)),
  };
}

/** Keep Product picker payloads lean so saves stay inside the transaction window. */
function sanitizeSettings(field: FieldDraft) {
  const settings = { ...(field.settings ?? {}) };
  if (Array.isArray(settings.products)) {
    settings.products = settings.products.map((product) => ({
      id: product.id,
      productGid: product.productGid,
      productId: product.productId,
      variantGid: product.variantGid ?? null,
      variantId: product.variantId ?? null,
      title: product.title,
      handle: product.handle,
      imageUrl: product.imageUrl ?? null,
    }));
  }
  return settings;
}

export class OptionFieldRepository {
  async loadDraft(shop: string, optionSetId: string): Promise<OptionSetDraft | null> {
    const optionSet = await prisma.optionSet.findFirst({
      where: { id: optionSetId, shop, deletedAt: null },
      include: {
        fields: {
          include: { choices: true },
          orderBy: { sortOrder: "asc" },
        },
        productAssignments: {
          where: { enabled: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!optionSet) return null;

    return {
      id: optionSet.id,
      name: optionSet.name,
      description: optionSet.description,
      enabled: optionSet.status === "ACTIVE",
      fields: optionSet.fields.map(toFieldDraft),
      assignmentMode: optionSet.assignmentMode,
      products: optionSet.productAssignments.map((assignment) => ({
        id: assignment.id,
        productGid: assignment.productGid,
        productId: assignment.productId,
        title: assignment.productTitle ?? "Untitled product",
        handle: assignment.productHandle,
        imageUrl: null,
      })),
      conditions: safeJsonParse<ProductCondition[]>(
        optionSet.assignmentConditions,
        [],
      ),
    };
  }

  /**
   * Persists a draft by diffing against stored rows: existing ids are updated,
   * temporary ids are inserted, and omitted rows are deleted. Keeping ids
   * stable matters because conditional rules reference fields by id.
   *
   * Returns a map of temporary client ids to their new database ids.
   */
  async saveDraft(
    shop: string,
    optionSetId: string,
    draft: OptionSetDraft,
  ): Promise<Record<string, string>> {
    // Interactive transactions default to 5s — option sets with many fields /
    // choices (plus larger Product picker settings JSON) routinely exceed that
    // and surface as "Transaction not found" on a later fieldChoice.update().
    return prisma.$transaction(
      async (tx) => {
        const idMap: Record<string, string> = {};

        await tx.optionSet.update({
          where: { id: optionSetId },
          data: {
            name: draft.name.trim(),
            description: draft.description?.trim() || null,
            status: draft.enabled ? "ACTIVE" : "DISABLED",
            assignmentMode: draft.assignmentMode,
            assignmentConditions:
              draft.assignmentMode === "CONDITIONS"
                ? JSON.stringify(draft.conditions)
                : null,
          },
        });

        await tx.productAssignment.deleteMany({ where: { optionSetId } });
        if (draft.assignmentMode === "MANUAL" && draft.products.length > 0) {
          await tx.productAssignment.createMany({
            data: draft.products.map((product, index) => ({
              optionSetId,
              shop,
              productId: product.productId,
              productGid: product.productGid,
              productTitle: product.title,
              productHandle: product.handle,
              priority: index,
              enabled: true,
            })),
          });
        }

        const existing = await tx.optionField.findMany({
          where: { optionSetId },
          select: { id: true },
        });
        const existingIds = new Set(existing.map((row) => row.id));
        const keptIds = new Set(
          draft.fields.filter((field) => !isTempId(field.id)).map((f) => f.id),
        );

        const removedIds = [...existingIds].filter((id) => !keptIds.has(id));
        if (removedIds.length > 0) {
          await tx.optionField.deleteMany({ where: { id: { in: removedIds } } });
        }

        // Parents must exist before children can reference them, so insert
        // roots first and resolve nested levels on later passes.
        const pending = [...draft.fields];
        let guard = pending.length + 1;

        while (pending.length > 0 && guard-- > 0) {
          const remaining: FieldDraft[] = [];

          for (const field of pending) {
            const parentId = field.parentId
              ? (idMap[field.parentId] ??
                (isTempId(field.parentId) ? null : field.parentId))
              : null;

            if (field.parentId && !parentId) {
              remaining.push(field);
              continue;
            }

            const columns = fieldColumns(field);

            if (isTempId(field.id)) {
              const created = await tx.optionField.create({
                data: { ...columns, optionSetId, parentId },
              });
              idMap[field.id] = created.id;
              await this.syncChoices(tx, created.id, field, idMap);
            } else {
              await tx.optionField.update({
                where: { id: field.id },
                data: { ...columns, parentId },
              });
              await this.syncChoices(tx, field.id, field, idMap);
            }
          }

          if (remaining.length === pending.length) break;
          pending.length = 0;
          pending.push(...remaining);
        }

        return idMap;
      },
      {
        maxWait: 15_000,
        timeout: 60_000,
      },
    );
  }

  private async syncChoices(
    tx: Prisma.TransactionClient,
    fieldId: string,
    field: FieldDraft,
    idMap: Record<string, string>,
  ) {
    const choices = field.choices ?? [];

    if (choices.length === 0) {
      await tx.fieldChoice.deleteMany({ where: { fieldId } });
      return;
    }

    const keptChoiceIds = choices
      .filter((choice) => !isTempId(choice.id))
      .map((choice) => choice.id);

    await tx.fieldChoice.deleteMany({
      where: {
        fieldId,
        // Prisma treats `notIn: []` oddly — use a sentinel when nothing is kept.
        id: { notIn: keptChoiceIds.length ? keptChoiceIds : ["__none__"] },
      },
    });

    for (const choice of choices) {
      const columns = {
        label: choice.label.trim(),
        value: (choice.value || choice.label).trim(),
        imageUrl: choice.imageUrl?.trim() || null,
        colorHex: choice.colorHex?.trim() || null,
        priceAddon: choice.priceAddon,
        isDefault: choice.isDefault,
        isDisabled: choice.isDisabled,
        sortOrder: choice.sortOrder,
      };

      if (isTempId(choice.id)) {
        const created = await tx.fieldChoice.create({
          data: { ...columns, fieldId },
        });
        idMap[choice.id] = created.id;
        continue;
      }

      // Upsert avoids an extra findUnique round-trip per choice (which was
      // blowing the default 5s interactive transaction on larger option sets).
      await tx.fieldChoice.upsert({
        where: { id: choice.id },
        create: { id: choice.id, fieldId, ...columns },
        update: columns,
      });
    }
  }
}

export const optionFieldRepository = new OptionFieldRepository();
