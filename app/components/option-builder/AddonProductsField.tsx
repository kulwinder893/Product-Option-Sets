import { useAppBridge } from "@shopify/app-bridge-react";
import type { AddonProduct } from "../../types/field";
import { tempId } from "../../utils/draft";

type Props = {
  products: AddonProduct[];
  onChange: (products: AddonProduct[]) => void;
};

function numericId(gid: string): string {
  return gid.split("/").pop() ?? gid;
}

type PickerProduct = {
  id: string;
  title: string;
  handle?: string;
  images?: Array<{ originalSrc?: string }>;
  variants?: Array<{ id: string; title?: string }>;
};

/**
 * Lets merchants choose which catalog products appear in a Product picker
 * option (add-on products shoppers can select on the storefront).
 */
export function AddonProductsField({ products, onChange }: Props) {
  const shopify = useAppBridge();

  const openPicker = async () => {
    const result = await shopify.resourcePicker({
      type: "product",
      action: "select",
      multiple: true,
      selectionIds: products.map((product) => ({ id: product.productGid })),
      filter: {
        hidden: false,
        variants: true,
        draft: false,
        archived: false,
      },
    });

    if (!result) return;

    const selected = (result.selection ?? result) as PickerProduct[];
    onChange(
      selected.map((product) => {
        const existing = products.find(
          (current) => current.productGid === product.id,
        );
        const variant = product.variants?.[0];
        return {
          id: existing?.id ?? tempId(),
          productGid: product.id,
          productId: numericId(product.id),
          variantGid: variant?.id ?? null,
          variantId: variant?.id ? numericId(variant.id) : null,
          title: product.title,
          handle: product.handle || null,
          imageUrl: product.images?.[0]?.originalSrc ?? null,
        };
      }),
    );
  };

  return (
    <s-stack direction="block" gap="small-200">
      <s-text type="strong">Add-on products</s-text>
      <s-text color="subdued">
        Choose which products shoppers can pick as add-ons for this option.
      </s-text>

      <s-button
        type="button"
        variant="primary"
        icon="product-add"
        onClick={openPicker}
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
          <s-text color="subdued">No add-on products selected yet.</s-text>
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
                    onClick={() =>
                      onChange(
                        products.filter(
                          (item) => item.productGid !== product.productGid,
                        ),
                      )
                    }
                  />
                </div>
              </s-stack>
            </s-box>
          ))}
        </s-stack>
      )}
    </s-stack>
  );
}
