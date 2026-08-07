import { fieldMeta } from "../constants/field-types";
import prisma from "../db.server";
import { optionFieldRepository } from "../repositories/option-field.repository";
import type { FieldDraft, OptionSetDraft } from "../types/field";
import { AppError, assertShop } from "../utils/errors";
import { normalizeOptionSetDraft } from "../utils/normalize-draft";

const MAX_LABEL_LENGTH = 200;
const MAX_FIELDS = 300;

function validateField(field: FieldDraft, index: number): void {
  const meta = fieldMeta(field.type);
  const position = `Field ${index + 1}`;

  if (!meta.isPresentational && !field.label?.trim()) {
    throw new AppError(`${position}: label is required`, "VALIDATION_ERROR");
  }

  if (field.label && field.label.length > MAX_LABEL_LENGTH) {
    throw new AppError(
      `${position}: label must be ${MAX_LABEL_LENGTH} characters or fewer`,
      "VALIDATION_ERROR",
    );
  }

  if (meta.hasChoices && field.choices.length === 0) {
    throw new AppError(
      `${position} ("${field.label}"): add at least one choice`,
      "VALIDATION_ERROR",
    );
  }

  for (const choice of field.choices) {
    if (!choice.label?.trim()) {
      throw new AppError(
        `${position} ("${field.label}"): every choice needs a label`,
        "VALIDATION_ERROR",
      );
    }
  }

  if (
    field.minLength != null &&
    field.maxLength != null &&
    field.minLength > field.maxLength
  ) {
    throw new AppError(
      `${position}: minimum length cannot exceed maximum length`,
      "VALIDATION_ERROR",
    );
  }

  if (
    field.minQuantity != null &&
    field.maxQuantity != null &&
    field.minQuantity > field.maxQuantity
  ) {
    throw new AppError(
      `${position}: minimum quantity cannot exceed maximum quantity`,
      "VALIDATION_ERROR",
    );
  }
}

export class OptionBuilderService {
  async load(shop: string, optionSetId: string): Promise<OptionSetDraft | null> {
    assertShop(shop);
    return optionFieldRepository.loadDraft(shop, optionSetId);
  }

  async save(
    shop: string,
    optionSetId: string,
    rawDraft: OptionSetDraft,
  ): Promise<{ idMap: Record<string, string>; saved: OptionSetDraft }> {
    assertShop(shop);
    const draft = normalizeOptionSetDraft(rawDraft);

    const owned = await prisma.optionSet.findFirst({
      where: { id: optionSetId, shop, deletedAt: null },
      select: { id: true },
    });
    if (!owned) {
      throw new AppError("Option set not found", "NOT_FOUND", 404);
    }

    if (!draft.name?.trim()) {
      throw new AppError("Option set name is required", "VALIDATION_ERROR");
    }
    if (draft.fields.length > MAX_FIELDS) {
      throw new AppError(
        `An option set supports up to ${MAX_FIELDS} fields`,
        "VALIDATION_ERROR",
      );
    }

    draft.fields.forEach(validateField);

    if (draft.assignmentMode === "MANUAL" && draft.products.length === 0) {
      throw new AppError(
        "Select at least one product, or choose All products",
        "VALIDATION_ERROR",
      );
    }
    if (
      draft.assignmentMode === "CONDITIONS" &&
      (draft.conditions.length === 0 ||
        draft.conditions.some((condition) => !condition.value.trim()))
    ) {
      throw new AppError(
        "Add a value to every product condition",
        "VALIDATION_ERROR",
      );
    }

    const idMap = await optionFieldRepository.saveDraft(shop, optionSetId, draft);

    await prisma.log.create({
      data: {
        shop,
        level: "INFO",
        action: "option_set.builder.save",
        message: `Saved "${draft.name}" with ${draft.fields.length} field(s)`,
        metadata: JSON.stringify({ optionSetId, fieldCount: draft.fields.length }),
      },
    });

    const saved = await optionFieldRepository.loadDraft(shop, optionSetId);
    if (!saved) {
      throw new AppError("Option set not found after save", "NOT_FOUND", 404);
    }

    return { idMap, saved };
  }
}

export const optionBuilderService = new OptionBuilderService();
