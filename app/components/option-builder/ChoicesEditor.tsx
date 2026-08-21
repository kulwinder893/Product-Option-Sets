import type { FieldType } from "@prisma/client";
import type { ChoiceDraft } from "../../types/field";
import { ChoiceImageField } from "./ChoiceImageField";

type Props = {
  fieldType: FieldType;
  choices: ChoiceDraft[];
  onAdd: () => void;
  onUpdate: (choiceId: string, patch: Partial<ChoiceDraft>) => void;
  onRemove: (choiceId: string) => void;
  onMove: (choiceId: string, targetIndex: number) => void;
};

export function ChoicesEditor({
  fieldType,
  choices,
  onAdd,
  onUpdate,
  onRemove,
  onMove,
}: Props) {
  const needsColor = fieldType === ("COLOR_SWATCHES" as FieldType);
  const needsImage = fieldType === ("IMAGE_SWATCHES" as FieldType);

  return (
    <s-stack direction="block" gap="small-200">
      <s-text type="strong">Choices</s-text>

      {choices.map((choice, index) => (
        <s-box
          key={choice.id}
          padding="small-200"
          borderWidth="base"
          borderRadius="base"
        >
          <s-stack direction="block" gap="small-200">
            <s-stack direction="inline" gap="small-200" alignItems="center">
              <s-text color="subdued">#{index + 1}</s-text>
              <div style={{ marginInlineStart: "auto" }}>
                <s-stack direction="inline" gap="small-500">
                  <s-button
                    type="button"
                    variant="tertiary"
                    icon="chevron-up"
                    accessibilityLabel="Move choice up"
                    {...(index === 0 ? { disabled: true } : {})}
                    onClick={() => onMove(choice.id, index - 1)}
                  />
                  <s-button
                    type="button"
                    variant="tertiary"
                    icon="chevron-down"
                    accessibilityLabel="Move choice down"
                    {...(index === choices.length - 1 ? { disabled: true } : {})}
                    onClick={() => onMove(choice.id, index + 1)}
                  />
                  <s-button
                    type="button"
                    variant="tertiary"
                    tone="critical"
                    icon="delete"
                    accessibilityLabel="Remove choice"
                    onClick={() => onRemove(choice.id)}
                  />
                </s-stack>
              </div>
            </s-stack>

            <s-grid gridTemplateColumns="1fr 1fr" gap="small-200">
              <s-text-field
                label="Label"
                value={choice.label}
                onInput={(e: Event) =>
                  onUpdate(choice.id, {
                    label: (e.currentTarget as HTMLInputElement).value,
                  })
                }
              />
              <s-text-field
                label="Value"
                details="Saved to the order line item"
                value={choice.value}
                onInput={(e: Event) =>
                  onUpdate(choice.id, {
                    value: (e.currentTarget as HTMLInputElement).value,
                  })
                }
              />
            </s-grid>

            <s-grid
              gridTemplateColumns={needsImage ? "1fr" : "1fr 1fr"}
              gap="small-200"
            >
              <s-number-field
                label="Price add-on"
                value={choice.priceAddon == null ? "" : String(choice.priceAddon)}
                step={0.01}
                onInput={(e: Event) => {
                  const raw = (e.currentTarget as HTMLInputElement).value;
                  onUpdate(choice.id, {
                    priceAddon: raw === "" ? null : Number(raw),
                  });
                }}
              />
              {needsColor ? (
                <s-color-field
                  label="Color"
                  value={choice.colorHex ?? "#000000"}
                  onInput={(e: Event) =>
                    onUpdate(choice.id, {
                      colorHex: (e.currentTarget as HTMLInputElement).value,
                    })
                  }
                />
              ) : null}
            </s-grid>

            {needsImage ? (
              <ChoiceImageField
                imageUrl={choice.imageUrl}
                onChange={(imageUrl) => onUpdate(choice.id, { imageUrl })}
              />
            ) : null}

            <s-stack direction="inline" gap="base">
              <s-checkbox
                label="Selected by default"
                {...(choice.isDefault ? { checked: true } : {})}
                onChange={(e: Event) =>
                  onUpdate(choice.id, {
                    isDefault: (e.currentTarget as HTMLInputElement).checked,
                  })
                }
              />
              <s-checkbox
                label="Disabled"
                {...(choice.isDisabled ? { checked: true } : {})}
                onChange={(e: Event) =>
                  onUpdate(choice.id, {
                    isDisabled: (e.currentTarget as HTMLInputElement).checked,
                  })
                }
              />
            </s-stack>
          </s-stack>
        </s-box>
      ))}

      <s-button type="button" variant="tertiary" icon="plus" onClick={onAdd}>
        Add choice
      </s-button>
    </s-stack>
  );
}
