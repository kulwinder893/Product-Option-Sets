import type { FieldSettings, ProductCondition } from "../types/field";
import type {
  StorefrontField,
  StorefrontOptionSet,
  StorefrontProductContext,
} from "../types/storefront";
import {
  storefrontOptionsRepository,
  type MatchableOptionSet,
} from "../repositories/storefront-options.repository";
import { assertShop, safeJsonParse } from "../utils/errors";

/** Field types whose storefront rendering is not implemented yet. */
const UNSUPPORTED_TYPES = new Set(["FILE_UPLOAD", "PRODUCT_PICKER"]);

function conditionSubject(
  condition: ProductCondition,
  product: StorefrontProductContext,
): string[] {
  switch (condition.field) {
    case "TITLE":
      return [product.title];
    case "VENDOR":
      return [product.vendor];
    case "PRODUCT_TYPE":
      return [product.productType];
    case "TAG":
      return product.tags;
    default:
      return [];
  }
}

function matchesCondition(
  condition: ProductCondition,
  product: StorefrontProductContext,
): boolean {
  const needle = condition.value.trim().toLowerCase();
  if (!needle) return false;

  return conditionSubject(condition, product).some((raw) => {
    const subject = (raw ?? "").toLowerCase();
    return condition.operator === "EQUALS"
      ? subject === needle
      : subject.includes(needle);
  });
}

/** Conditions are OR-ed: matching any one assigns the set to the product. */
function matchesConditions(
  conditions: ProductCondition[],
  product: StorefrontProductContext,
): boolean {
  return conditions.some((condition) => matchesCondition(condition, product));
}

function toStorefrontField(
  field: MatchableOptionSet["fields"][number],
): StorefrontField {
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
    helpText: field.helpText,
    tooltip: field.tooltip,
    customErrorMessage: field.customErrorMessage,
    cssClass: field.cssClass,
    minLength: field.minLength,
    maxLength: field.maxLength,
    minQuantity: field.minQuantity,
    maxQuantity: field.maxQuantity,
    settings: safeJsonParse<FieldSettings>(field.settings, {}),
    choices: field.choices.map((choice) => ({
      id: choice.id,
      label: choice.label,
      value: choice.value,
      imageUrl: choice.imageUrl,
      colorHex: choice.colorHex,
      priceAddon: choice.priceAddon,
      isDefault: choice.isDefault,
      isDisabled: choice.isDisabled,
    })),
  };
}

export class StorefrontOptionsService {
  async getForProduct(
    shop: string,
    product: StorefrontProductContext,
  ): Promise<StorefrontOptionSet[]> {
    assertShop(shop);

    const productGid = `gid://shopify/Product/${product.productId}`;
    const candidates = await storefrontOptionsRepository.findCandidates(
      shop,
      productGid,
    );

    return candidates
      .filter((optionSet) => {
        if (optionSet.assignmentMode !== "CONDITIONS") return true;
        const conditions = safeJsonParse<ProductCondition[]>(
          optionSet.assignmentConditions,
          [],
        );
        return matchesConditions(conditions, product);
      })
      .map((optionSet) => ({
        id: optionSet.id,
        name: optionSet.name,
        fields: optionSet.fields
          .filter((field) => !UNSUPPORTED_TYPES.has(field.type))
          .map(toStorefrontField),
      }))
      .filter((optionSet) => optionSet.fields.length > 0);
  }
}

export const storefrontOptionsService = new StorefrontOptionsService();
