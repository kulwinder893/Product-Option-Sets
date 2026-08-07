import { useAppBridge } from "@shopify/app-bridge-react";
import type {
  AssignmentMode,
  ProductAssignmentDraft,
  ProductCondition,
} from "../../types/field";
import { tempId } from "../../utils/draft";

type Props = {
  mode: AssignmentMode;
  products: ProductAssignmentDraft[];
  conditions: ProductCondition[];
  onModeChange: (mode: AssignmentMode) => void;
  onProductsChange: (products: ProductAssignmentDraft[]) => void;
  onRemoveProduct: (productGid: string) => void;
  onConditionsChange: (conditions: ProductCondition[]) => void;
};

function numericId(gid: string): string {
  return gid.split("/").pop() ?? gid;
}

export function ProductAssignmentsEditor({
  mode,
  products,
  conditions,
  onModeChange,
  onProductsChange,
  onRemoveProduct,
  onConditionsChange,
}: Props) {
  const shopify = useAppBridge();

  const openProductPicker = async () => {
    const result = await shopify.resourcePicker({
      type: "product",
      action: "select",
      multiple: true,
      selectionIds: products.map((product) => ({ id: product.productGid })),
      filter: { hidden: false, variants: false, draft: false, archived: false },
    });

    if (!result) return;

    const selected = result.selection ?? result;
    onProductsChange(
      selected.map((product) => ({
        id:
          products.find((current) => current.productGid === product.id)?.id ??
          tempId(),
        productGid: product.id,
        productId: numericId(product.id),
        title: product.title,
        handle: product.handle || null,
        imageUrl: product.images[0]?.originalSrc ?? null,
      })),
    );
  };

  const updateCondition = (
    id: string,
    patch: Partial<ProductCondition>,
  ) => {
    onConditionsChange(
      conditions.map((condition) =>
        condition.id === id ? { ...condition, ...patch } : condition,
      ),
    );
  };

  const addCondition = () => {
    onConditionsChange([
      ...conditions,
      {
        id: tempId(),
        field: "TITLE",
        operator: "CONTAINS",
        value: "",
      },
    ]);
  };

  return (
    <s-stack direction="block" gap="base">
      <s-choice-list
        label="Apply this option set to"
        name="assignmentMode"
        values={[mode]}
        onChange={(event: Event) => {
          const target = event.currentTarget as HTMLElement & {
            values: string[];
          };
          const next = target.values[0] as AssignmentMode | undefined;
          if (next) onModeChange(next);
        }}
      >
        <s-choice
          value="ALL_PRODUCTS"
          selected={mode === "ALL_PRODUCTS"}
        >
          All products
        </s-choice>
        <s-choice
          value="MANUAL"
          selected={mode === "MANUAL"}
        >
          Manually select products
        </s-choice>
        <s-choice
          value="CONDITIONS"
          selected={mode === "CONDITIONS"}
        >
          Select products with conditions
        </s-choice>
      </s-choice-list>

      {mode === "MANUAL" ? (
        <s-stack direction="block" gap="small-200">
          <s-button
            type="button"
            variant="primary"
            icon="product-add"
            onClick={openProductPicker}
          >
            {products.length ? "Change products" : "Select products"}
          </s-button>

          {products.length === 0 ? (
            <s-box
              padding="base"
              borderWidth="base"
              borderRadius="base"
              background="subdued"
            >
              <s-text color="subdued">No products selected yet.</s-text>
            </s-box>
          ) : (
            <s-stack direction="block" gap="small-200">
              <s-text type="strong">
                {products.length} product{products.length === 1 ? "" : "s"} selected
              </s-text>
              {products.map((product) => (
                <s-box
                  key={product.productGid}
                  padding="small-200"
                  borderWidth="base"
                  borderRadius="base"
                >
                  <s-stack
                    direction="inline"
                    gap="small-200"
                    alignItems="center"
                  >
                    {product.imageUrl ? (
                      <s-thumbnail
                        src={product.imageUrl}
                        alt={product.title}
                        size="small"
                      />
                    ) : (
                      <s-icon type="product" />
                    )}
                    <s-stack direction="block" gap="none">
                      <s-text type="strong">{product.title}</s-text>
                      {product.handle ? (
                        <s-text color="subdued">{product.handle}</s-text>
                      ) : null}
                    </s-stack>
                    <div style={{ marginInlineStart: "auto" }}>
                      <s-button
                        type="button"
                        variant="tertiary"
                        tone="critical"
                        icon="delete"
                        accessibilityLabel={`Remove ${product.title}`}
                        onClick={() => onRemoveProduct(product.productGid)}
                      />
                    </div>
                  </s-stack>
                </s-box>
              ))}
            </s-stack>
          )}
        </s-stack>
      ) : null}

      {mode === "CONDITIONS" ? (
        <s-stack direction="block" gap="small-200">
          <s-text>
            Products must match <s-text type="strong">all</s-text> conditions:
          </s-text>

          {conditions.map((condition) => (
            <s-grid
              key={condition.id}
              gridTemplateColumns="1fr 1fr 2fr auto"
              gap="small-200"
              alignItems="end"
            >
              <s-select
                label="Product field"
                value={condition.field}
                onChange={(event: Event) =>
                  updateCondition(condition.id, {
                    field: (event.currentTarget as HTMLSelectElement)
                      .value as ProductCondition["field"],
                  })
                }
              >
                <s-option value="TITLE">Product title</s-option>
                <s-option value="VENDOR">Vendor</s-option>
                <s-option value="PRODUCT_TYPE">Product type</s-option>
                <s-option value="TAG">Product tag</s-option>
              </s-select>
              <s-select
                label="Operator"
                value={condition.operator}
                onChange={(event: Event) =>
                  updateCondition(condition.id, {
                    operator: (event.currentTarget as HTMLSelectElement)
                      .value as ProductCondition["operator"],
                  })
                }
              >
                <s-option value="EQUALS">Is equal to</s-option>
                <s-option value="CONTAINS">Contains</s-option>
              </s-select>
              <s-text-field
                label="Value"
                value={condition.value}
                onInput={(event: Event) =>
                  updateCondition(condition.id, {
                    value: (event.currentTarget as HTMLInputElement).value,
                  })
                }
              />
              <s-button
                type="button"
                variant="tertiary"
                tone="critical"
                icon="delete"
                accessibilityLabel="Remove condition"
                onClick={() =>
                  onConditionsChange(
                    conditions.filter((item) => item.id !== condition.id),
                  )
                }
              />
            </s-grid>
          ))}

          <s-button
            type="button"
            variant="tertiary"
            icon="plus"
            onClick={addCondition}
          >
            Add condition
          </s-button>
        </s-stack>
      ) : null}
    </s-stack>
  );
}
