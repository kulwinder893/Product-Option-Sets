import type { FieldType } from "@prisma/client";
import { fieldMeta } from "../constants/field-types";
import type { ChoiceDraft, FieldDraft } from "../types/field";

const TEMP_PREFIX = "tmp_";

export function tempId(): string {
  return `${TEMP_PREFIX}${Math.random().toString(36).slice(2, 11)}`;
}

export function isTempId(id: string): boolean {
  return id.startsWith(TEMP_PREFIX);
}

export function createChoice(index: number): ChoiceDraft {
  return {
    id: tempId(),
    label: `Option ${index + 1}`,
    value: `option-${index + 1}`,
    imageUrl: null,
    colorHex: null,
    priceAddon: null,
    isDefault: false,
    isDisabled: false,
    sortOrder: index,
  };
}

export function createField(
  type: FieldType,
  sortOrder: number,
  parentId: string | null = null,
): FieldDraft {
  const meta = fieldMeta(type);

  return {
    id: tempId(),
    parentId,
    type,
    label: meta.label,
    description: null,
    placeholder: null,
    required: false,
    hidden: false,
    defaultValue: null,
    validation: null,
    cssClass: null,
    tooltip: null,
    helpText: null,
    customErrorMessage: null,
    minQuantity: null,
    maxQuantity: null,
    minLength: null,
    maxLength: null,
    sortOrder,
    collapsed: false,
    settings: { ...(meta.defaultSettings ?? {}) },
    choices: meta.hasChoices ? [0, 1].map(createChoice) : [],
  };
}

/** Deep-copies a field (and its choices) with fresh temporary ids. */
export function cloneField(field: FieldDraft, sortOrder: number): FieldDraft {
  return {
    ...field,
    id: tempId(),
    label: `${field.label} (copy)`,
    sortOrder,
    settings: { ...field.settings },
    choices: field.choices.map((choice) => ({ ...choice, id: tempId() })),
  };
}

/** Reassigns sortOrder to match array position, scoped per parent. */
export function resequence(fields: FieldDraft[]): FieldDraft[] {
  const counters = new Map<string, number>();

  return fields.map((field) => {
    const key = field.parentId ?? "__root__";
    const next = counters.get(key) ?? 0;
    counters.set(key, next + 1);
    return { ...field, sortOrder: next };
  });
}

export function childrenOf(
  fields: FieldDraft[],
  parentId: string | null,
): FieldDraft[] {
  return fields
    .filter((field) => field.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Collects a field id plus every descendant id. */
export function withDescendants(
  fields: FieldDraft[],
  rootId: string,
): Set<string> {
  const ids = new Set<string>([rootId]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const field of fields) {
      if (field.parentId && ids.has(field.parentId) && !ids.has(field.id)) {
        ids.add(field.id);
        changed = true;
      }
    }
  }

  return ids;
}
