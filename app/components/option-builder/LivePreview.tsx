import type { FieldDraft } from "../../types/field";
import { childrenOf } from "../../utils/draft";

type Props = {
  fields: FieldDraft[];
};

function PriceHint({ amount }: { amount?: number | null }) {
  if (amount == null || amount === 0) return null;
  const sign = amount > 0 ? "+" : "−";
  return <s-text color="subdued">{` (${sign}${Math.abs(amount)})`}</s-text>;
}

function FieldPreview({ field, all }: { field: FieldDraft; all: FieldDraft[] }) {
  if (field.hidden || field.type === "HIDDEN_FIELD") return null;

  const label = (
    <s-stack direction="inline" gap="none">
      <s-text type="strong">{field.label}</s-text>
      {field.required ? <s-text tone="critical"> *</s-text> : null}
      <PriceHint amount={field.settings.priceAddon} />
    </s-stack>
  );

  const description = field.description ? (
    <s-text color="subdued">{field.description}</s-text>
  ) : null;

  switch (field.type) {
    case "HEADING":
      return <s-heading>{field.settings.content || field.label}</s-heading>;

    case "PARAGRAPH":
      return <s-paragraph>{field.settings.content || field.label}</s-paragraph>;

    case "DIVIDER":
      return <s-divider />;

    case "SPACER":
      return <div style={{ height: field.settings.spacerSize ?? 16 }} />;

    case "CUSTOM_HTML":
      return (
        <s-box padding="small-200" borderWidth="base" borderRadius="base" background="subdued">
          <s-text color="subdued">Custom HTML block</s-text>
        </s-box>
      );

    case "GROUP":
      return (
        <s-box padding="small-200" borderWidth="base" borderRadius="base">
          <s-stack direction="block" gap="small-200">
            {label}
            {childrenOf(all, field.id).map((child) => (
              <FieldPreview key={child.id} field={child} all={all} />
            ))}
          </s-stack>
        </s-box>
      );

    case "DROPDOWN":
      return (
        <s-stack direction="block" gap="small-500">
          {label}
          {description}
          <s-select
            label={field.label}
            labelAccessibilityVisibility="exclusive"
            {...(field.placeholder ? { placeholder: field.placeholder } : {})}
          >
            {field.choices.map((choice) => (
              <s-option key={choice.id} value={choice.value}>
                {choice.label}
                {choice.priceAddon ? ` (+${choice.priceAddon})` : ""}
              </s-option>
            ))}
          </s-select>
        </s-stack>
      );

    case "RADIO_BUTTON":
    case "CHECKBOX":
      return (
        <s-stack direction="block" gap="small-500">
          {label}
          {description}
          {field.choices.map((choice) => (
            <s-checkbox
              key={choice.id}
              label={`${choice.label}${choice.priceAddon ? ` (+${choice.priceAddon})` : ""}`}
              {...(choice.isDisabled ? { disabled: true } : {})}
            />
          ))}
        </s-stack>
      );

    case "BUTTONS":
      return (
        <s-stack direction="block" gap="small-500">
          {label}
          {description}
          <s-stack direction="inline" gap="small-500">
            {field.choices.map((choice) => (
              <s-button key={choice.id} type="button" variant="secondary">
                {choice.label}
              </s-button>
            ))}
          </s-stack>
        </s-stack>
      );

    case "COLOR_SWATCHES":
      return (
        <s-stack direction="block" gap="small-500">
          {label}
          {description}
          <s-stack direction="inline" gap="small-500">
            {field.choices.map((choice) => (
              <div
                key={choice.id}
                title={choice.label}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius:
                    field.settings.swatchShape === "square" ? 4 : "50%",
                  background: choice.colorHex || "#c9cccf",
                  border: "1px solid var(--p-color-border, #e1e3e5)",
                }}
              />
            ))}
          </s-stack>
        </s-stack>
      );

    case "IMAGE_SWATCHES":
      return (
        <s-stack direction="block" gap="small-500">
          {label}
          {description}
          <s-stack direction="inline" gap="small-500">
            {field.choices.map((choice) =>
              choice.imageUrl ? (
                <s-thumbnail key={choice.id} src={choice.imageUrl} alt={choice.label} />
              ) : (
                <div
                  key={choice.id}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 4,
                    background: "var(--p-color-bg-fill-tertiary, #dfe3e8)",
                  }}
                />
              ),
            )}
          </s-stack>
        </s-stack>
      );

    case "SWITCH":
      return <s-switch label={field.label} details={field.description ?? undefined} />;

    case "TEXTAREA":
      return (
        <s-text-area
          label={field.label}
          rows={3}
          {...(field.placeholder ? { placeholder: field.placeholder } : {})}
          {...(field.required ? { required: true } : {})}
        />
      );

    case "NUMBER":
    case "QUANTITY":
    case "RANGE_SLIDER":
      return (
        <s-number-field
          label={field.label}
          {...(field.required ? { required: true } : {})}
        />
      );

    case "DATE_PICKER":
    case "DATE_RANGE":
      return <s-date-field label={field.label} />;

    case "FILE_UPLOAD":
      return (
        <s-stack direction="block" gap="small-500">
          {label}
          <s-drop-zone label={field.label} labelAccessibilityVisibility="exclusive" />
        </s-stack>
      );

    case "PRODUCT_PICKER": {
      const products = field.settings.products ?? [];
      return (
        <s-stack direction="block" gap="small-500">
          {label}
          {description}
          {products.length === 0 ? (
            <s-text color="subdued">No add-on products selected.</s-text>
          ) : (
            <s-stack direction="block" gap="small-200">
              {products.map((product) => (
                <s-stack
                  key={product.productGid}
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
                  <s-checkbox label={product.title} />
                </s-stack>
              ))}
            </s-stack>
          )}
        </s-stack>
      );
    }

    default:
      return (
        <s-text-field
          label={field.label}
          {...(field.placeholder ? { placeholder: field.placeholder } : {})}
          {...(field.required ? { required: true } : {})}
        />
      );
  }
}

export function LivePreview({ fields }: Props) {
  const roots = childrenOf(fields, null);

  return (
    <s-box padding="base" borderWidth="base" borderRadius="base">
      <s-stack direction="block" gap="base">
        {roots.length === 0 ? (
          <s-text color="subdued">
            Add options to see how they appear on your product page.
          </s-text>
        ) : (
          roots.map((field) => (
            <FieldPreview key={field.id} field={field} all={fields} />
          ))
        )}

        <s-button type="button" variant="primary">
          Add to cart
        </s-button>
      </s-stack>
    </s-box>
  );
}
