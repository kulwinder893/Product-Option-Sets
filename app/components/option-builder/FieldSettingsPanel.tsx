import { fieldMeta } from "../../constants/field-types";
import type { ChoiceDraft, FieldDraft, FieldSettings } from "../../types/field";
import { AddonProductsField } from "./AddonProductsField";
import { ChoicesEditor } from "./ChoicesEditor";

type Props = {
  field: FieldDraft;
  onUpdate: (patch: Partial<FieldDraft>) => void;
  onAddChoice: () => void;
  onUpdateChoice: (choiceId: string, patch: Partial<ChoiceDraft>) => void;
  onRemoveChoice: (choiceId: string) => void;
  onMoveChoice: (choiceId: string, targetIndex: number) => void;
};

function numberOrNull(value: string): number | null {
  return value === "" ? null : Number(value);
}

export function FieldSettingsPanel({
  field,
  onUpdate,
  onAddChoice,
  onUpdateChoice,
  onRemoveChoice,
  onMoveChoice,
}: Props) {
  const meta = fieldMeta(field.type);

  const patchSettings = (patch: Partial<FieldSettings>) =>
    onUpdate({ settings: { ...field.settings, ...patch } });

  return (
    <s-stack direction="block" gap="base">
      <s-stack direction="inline" gap="small-200" alignItems="center">
        <s-icon type={meta.icon as never} />
        <s-heading>{meta.label} settings</s-heading>
      </s-stack>

      {meta.isPresentational && field.type !== "GROUP" ? null : (
        <s-text-field
          label="Label"
          value={field.label}
          onInput={(e: Event) =>
            onUpdate({ label: (e.currentTarget as HTMLInputElement).value })
          }
        />
      )}

      {field.type === "HEADING" || field.type === "PARAGRAPH" || field.type === "CUSTOM_HTML" ? (
        <s-text-area
          label={field.type === "CUSTOM_HTML" ? "HTML content" : "Content"}
          rows={4}
          value={field.settings.content ?? ""}
          onInput={(e: Event) =>
            patchSettings({ content: (e.currentTarget as HTMLTextAreaElement).value })
          }
        />
      ) : null}

      {!meta.isPresentational ? (
        <>
          <s-text-area
            label="Description"
            rows={2}
            value={field.description ?? ""}
            onInput={(e: Event) =>
              onUpdate({
                description: (e.currentTarget as HTMLTextAreaElement).value || null,
              })
            }
          />

          {meta.supportsPlaceholder ? (
            <s-text-field
              label="Placeholder"
              value={field.placeholder ?? ""}
              onInput={(e: Event) =>
                onUpdate({
                  placeholder: (e.currentTarget as HTMLInputElement).value || null,
                })
              }
            />
          ) : null}

          <s-text-field
            label="Default value"
            value={field.defaultValue ?? ""}
            onInput={(e: Event) =>
              onUpdate({
                defaultValue: (e.currentTarget as HTMLInputElement).value || null,
              })
            }
          />

          <s-text-field
            label="Tooltip"
            value={field.tooltip ?? ""}
            onInput={(e: Event) =>
              onUpdate({ tooltip: (e.currentTarget as HTMLInputElement).value || null })
            }
          />

          <s-stack direction="inline" gap="base">
            <s-checkbox
              label="Required"
              {...(field.required ? { checked: true } : {})}
              onChange={(e: Event) =>
                onUpdate({ required: (e.currentTarget as HTMLInputElement).checked })
              }
            />
            <s-checkbox
              label="Hidden"
              {...(field.hidden ? { checked: true } : {})}
              onChange={(e: Event) =>
                onUpdate({ hidden: (e.currentTarget as HTMLInputElement).checked })
              }
            />
          </s-stack>
        </>
      ) : null}

      {meta.hasChoices ? (
        <>
          <s-divider />
          <ChoicesEditor
            fieldType={field.type}
            choices={field.choices}
            onAdd={onAddChoice}
            onUpdate={onUpdateChoice}
            onRemove={onRemoveChoice}
            onMove={onMoveChoice}
          />
        </>
      ) : null}

      {field.type === "PRODUCT_PICKER" ? (
        <>
          <s-divider />
          <AddonProductsField
            products={field.settings.products ?? []}
            onChange={(products) => patchSettings({ products })}
          />
          <s-checkbox
            label="Allow selecting multiple products"
            {...(field.settings.allowMultiple !== false ? { checked: true } : {})}
            onChange={(e: Event) =>
              patchSettings({
                allowMultiple: (e.currentTarget as HTMLInputElement).checked,
              })
            }
          />
        </>
      ) : null}

      {meta.supportsCharLimits ? (
        <>
          <s-divider />
          <s-grid gridTemplateColumns="1fr 1fr" gap="small-200">
            <s-number-field
              label="Min characters"
              value={field.minLength == null ? "" : String(field.minLength)}
              onInput={(e: Event) =>
                onUpdate({
                  minLength: numberOrNull((e.currentTarget as HTMLInputElement).value),
                })
              }
            />
            <s-number-field
              label="Max characters"
              value={field.maxLength == null ? "" : String(field.maxLength)}
              onInput={(e: Event) =>
                onUpdate({
                  maxLength: numberOrNull((e.currentTarget as HTMLInputElement).value),
                })
              }
            />
          </s-grid>
        </>
      ) : null}

      {field.type === "NUMBER" ||
      field.type === "RANGE_SLIDER" ||
      field.type === "QUANTITY" ? (
        <s-grid gridTemplateColumns="1fr 1fr 1fr" gap="small-200">
          <s-number-field
            label="Min"
            value={field.settings.min == null ? "" : String(field.settings.min)}
            onInput={(e: Event) =>
              patchSettings({
                min: numberOrNull((e.currentTarget as HTMLInputElement).value),
              })
            }
          />
          <s-number-field
            label="Max"
            value={field.settings.max == null ? "" : String(field.settings.max)}
            onInput={(e: Event) =>
              patchSettings({
                max: numberOrNull((e.currentTarget as HTMLInputElement).value),
              })
            }
          />
          <s-number-field
            label="Step"
            value={field.settings.step == null ? "" : String(field.settings.step)}
            onInput={(e: Event) =>
              patchSettings({
                step: numberOrNull((e.currentTarget as HTMLInputElement).value),
              })
            }
          />
        </s-grid>
      ) : null}

      {field.type === "FILE_UPLOAD" ? (
        <s-grid gridTemplateColumns="1fr 1fr" gap="small-200">
          <s-number-field
            label="Max files"
            value={field.settings.maxFiles == null ? "" : String(field.settings.maxFiles)}
            onInput={(e: Event) =>
              patchSettings({
                maxFiles: numberOrNull((e.currentTarget as HTMLInputElement).value),
              })
            }
          />
          <s-number-field
            label="Max size (MB)"
            value={field.settings.maxSizeMb == null ? "" : String(field.settings.maxSizeMb)}
            onInput={(e: Event) =>
              patchSettings({
                maxSizeMb: numberOrNull((e.currentTarget as HTMLInputElement).value),
              })
            }
          />
          <s-text-field
            label="Allowed extensions"
            details="Comma separated, e.g. jpg, png, pdf"
            value={(field.settings.allowedExtensions ?? []).join(", ")}
            onInput={(e: Event) =>
              patchSettings({
                allowedExtensions: (e.currentTarget as HTMLInputElement).value
                  .split(",")
                  .map((ext) => ext.trim().replace(/^\./, ""))
                  .filter(Boolean),
              })
            }
          />
        </s-grid>
      ) : null}

      {field.type === "HIDDEN_FIELD" ? (
        <s-text-field
          label="Hidden value"
          value={field.settings.hiddenValue ?? ""}
          onInput={(e: Event) =>
            patchSettings({ hiddenValue: (e.currentTarget as HTMLInputElement).value })
          }
        />
      ) : null}

      {meta.isInput ? (
        <>
          <s-divider />
          <s-grid gridTemplateColumns="1fr 1fr" gap="small-200">
            <s-number-field
              label="Price add-on"
              details="Added to the product price when used"
              step={0.01}
              value={
                field.settings.priceAddon == null
                  ? ""
                  : String(field.settings.priceAddon)
              }
              onInput={(e: Event) =>
                patchSettings({
                  priceAddon: numberOrNull(
                    (e.currentTarget as HTMLInputElement).value,
                  ),
                })
              }
            />
            <s-select
              label="Price type"
              value={field.settings.priceType ?? "FIXED"}
              onChange={(e: Event) =>
                patchSettings({
                  priceType: (e.currentTarget as HTMLSelectElement)
                    .value as FieldSettings["priceType"],
                })
              }
            >
              <s-option value="FIXED">Fixed amount</s-option>
              <s-option value="PERCENTAGE">Percentage</s-option>
            </s-select>
          </s-grid>

          <s-grid gridTemplateColumns="1fr 1fr" gap="small-200">
            <s-number-field
              label="Min quantity"
              value={field.minQuantity == null ? "" : String(field.minQuantity)}
              onInput={(e: Event) =>
                onUpdate({
                  minQuantity: numberOrNull(
                    (e.currentTarget as HTMLInputElement).value,
                  ),
                })
              }
            />
            <s-number-field
              label="Max quantity"
              value={field.maxQuantity == null ? "" : String(field.maxQuantity)}
              onInput={(e: Event) =>
                onUpdate({
                  maxQuantity: numberOrNull(
                    (e.currentTarget as HTMLInputElement).value,
                  ),
                })
              }
            />
          </s-grid>

          <s-text-field
            label="Custom error message"
            value={field.customErrorMessage ?? ""}
            onInput={(e: Event) =>
              onUpdate({
                customErrorMessage:
                  (e.currentTarget as HTMLInputElement).value || null,
              })
            }
          />
        </>
      ) : null}

      <s-divider />
      <s-text-field
        label="CSS class"
        details="Applied to the field wrapper on the storefront"
        value={field.cssClass ?? ""}
        onInput={(e: Event) =>
          onUpdate({ cssClass: (e.currentTarget as HTMLInputElement).value || null })
        }
      />
    </s-stack>
  );
}
