import { useState } from "react";
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

function PreviewFileUpload({
  field,
  label,
  description,
}: {
  field: FieldDraft;
  label: React.ReactNode;
  description: React.ReactNode;
}) {
  const inputId = `osp-file-preview-${field.id}`;
  const [filename, setFilename] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const extensions = field.settings.allowedExtensions ?? [];
  const accept = extensions.length
    ? extensions.map((ext) => `.${ext.replace(/^\./, "")}`).join(",")
    : undefined;
  const multiple =
    field.settings.maxFiles != null && Number(field.settings.maxFiles) > 1;

  return (
    <s-stack direction="block" gap="small-500">
      {label}
      {description}
      <label
        htmlFor={inputId}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 42,
          padding: "10px 16px",
          border: "1px dashed var(--p-color-border, #c9cccf)",
          borderRadius: 8,
          cursor: "pointer",
          background: "var(--p-color-bg-surface-secondary, #f6f6f7)",
        }}
      >
        <s-text>Upload file</s-text>
      </label>
      <input
        id={inputId}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(event) => {
          const files = event.currentTarget.files;
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
          if (!files?.length) {
            setFilename("");
            return;
          }
          const first = files[0];
          setFilename(
            Array.from(files)
              .map((file) => file.name)
              .join(", "),
          );
          if (first.type.startsWith("image/")) {
            setPreviewUrl(URL.createObjectURL(first));
          }
        }}
      />
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={filename}
          style={{
            width: 72,
            height: 72,
            objectFit: "cover",
            borderRadius: 8,
            border: "1px solid var(--p-color-border, #c9cccf)",
          }}
        />
      ) : null}
      {filename ? <s-text color="subdued">{filename}</s-text> : null}
      <s-text color="subdued">
        Preview only — shoppers upload files on the product page. This is not saved
        with the option set.
      </s-text>
    </s-stack>
  );
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
        <PreviewFileUpload field={field} label={label} description={description} />
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
            <s-grid gridTemplateColumns="1fr 1fr 1fr" gap="small-200">
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
                    <s-text type="strong">{product.title}</s-text>
                    <s-text color="subdued">
                      {product.price != null && isFinite(product.price)
                        ? `$${Number(product.price).toFixed(2)}`
                        : "Add-on"}
                    </s-text>
                  </s-stack>
                </s-box>
              ))}
            </s-grid>
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
