import type { AssignmentMode, OptionSetDraft } from "../types/field";

const ASSIGNMENT_MODES = new Set<AssignmentMode>([
  "ALL_PRODUCTS",
  "MANUAL",
  "CONDITIONS",
]);

function resolveAssignmentMode(value: unknown): AssignmentMode {
  if (typeof value === "string" && ASSIGNMENT_MODES.has(value as AssignmentMode)) {
    return value as AssignmentMode;
  }
  if (
    Array.isArray(value) &&
    typeof value[0] === "string" &&
    ASSIGNMENT_MODES.has(value[0] as AssignmentMode)
  ) {
    return value[0] as AssignmentMode;
  }
  return "MANUAL";
}

export function normalizeOptionSetDraft(
  raw: Partial<OptionSetDraft> & { id: string },
): OptionSetDraft {
  const assignmentMode = resolveAssignmentMode(raw.assignmentMode);

  return {
    id: raw.id,
    name: String(raw.name ?? "").trim(),
    description: raw.description ?? null,
    enabled: raw.enabled !== false,
    assignmentMode,
    products: (raw.products ?? []).map((product) => ({
      id: String(product.id),
      productGid: String(product.productGid),
      productId: String(product.productId),
      title: String(product.title || "Untitled product"),
      handle: product.handle ?? null,
      imageUrl: product.imageUrl ?? null,
    })),
    conditions: (raw.conditions ?? []).map((condition) => ({
      id: String(condition.id),
      field: condition.field ?? "TITLE",
      operator: condition.operator ?? "CONTAINS",
      value: String(condition.value ?? ""),
    })),
    fields: (raw.fields ?? []).map((field) => ({
      ...field,
      settings: {
        ...(field.settings ?? {}),
        priceAddon:
          typeof field.settings?.priceAddon === "number" &&
          Number.isFinite(field.settings.priceAddon)
            ? field.settings.priceAddon
            : null,
      },
      choices: (field.choices ?? []).map((choice) => ({
        ...choice,
        priceAddon:
          typeof choice.priceAddon === "number" && Number.isFinite(choice.priceAddon)
            ? choice.priceAddon
            : null,
      })),
    })),
  };
}
