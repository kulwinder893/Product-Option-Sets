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

function parsePrice(raw: unknown): number | null {
  if (raw == null) return null;
  if (typeof raw === "number" && isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = Number(raw.replace(/[^0-9.-]/g, ""));
    return isFinite(n) ? n : null;
  }
  if (typeof raw === "object" && raw !== null && "amount" in raw) {
    return parsePrice((raw as { amount: unknown }).amount);
  }
  return null;
}

type PickerVariant = {
  id: string;
  title?: string;
  price?: string | number | { amount?: string | number };
};

type PickerProduct = {
  id: string;
  title: string;
  handle?: string;
  images?: Array<{ originalSrc?: string; src?: string }>;
  variants?: PickerVariant[];
};

function formatPrice(amount: number | null | undefined): string | null {
  if (amount == null || !isFinite(amount)) return null;
  return amount.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

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
        const image =
          product.images?.[0]?.originalSrc ||
          product.images?.[0]?.src ||
          null;
        return {
          id: existing?.id ?? tempId(),
          productGid: product.id,
          productId: numericId(product.id),
          variantGid: variant?.id ?? null,
          variantId: variant?.id ? numericId(variant.id) : null,
          title: product.title,
          handle: product.handle || null,
          imageUrl: image,
          price: parsePrice(variant?.price) ?? existing?.price ?? null,
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
          <s-grid gridTemplateColumns="1fr 1fr" gap="small-200">
            {products.map((product) => (
              <s-box
                key={product.productGid}
                padding="small-200"
                borderWidth="base"
                borderRadius="base"
              >
                <s-stack direction="block" gap="small-200">
                  {product.imageUrl ? (
                    <s-thumbnail
                      src={product.imageUrl}
                      alt={product.title}
                      size="large"
                    />
                  ) : (
                    <s-icon type="product" />
                  )}
                  <s-stack direction="block" gap="none">
                    <s-text type="strong">{product.title}</s-text>
                    {formatPrice(product.price) ? (
                      <s-text color="subdued">{formatPrice(product.price)}</s-text>
                    ) : product.handle ? (
                      <s-text color="subdued">{product.handle}</s-text>
                    ) : null}
                  </s-stack>
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
                  >
                    Remove
                  </s-button>
                </s-stack>
              </s-box>
            ))}
          </s-grid>
        </s-stack>
      )}
    </s-stack>
  );
}
