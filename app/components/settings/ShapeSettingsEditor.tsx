import type { AppSettingsState, ShapeSettings, SwatchShape } from "../../types/app-design";
import { SHAPE_RADIUS_FIELDS } from "../../constants/app-design";
import { DesignPreview } from "./DesignPreview";

type Props = {
  settings: AppSettingsState;
  onChange: (next: AppSettingsState) => void;
};

export function ShapeSettingsEditor({ settings, onChange }: Props) {
  const shapes = settings.design.shapes;

  const patch = (next: Partial<ShapeSettings>) => {
    onChange({
      ...settings,
      design: { ...settings.design, shapes: { ...shapes, ...next } },
    });
  };

  return (
    <s-grid gridTemplateColumns="minmax(0, 1.2fr) minmax(280px, 1fr)" gap="base">
      <s-box padding="base" borderWidth="base" borderRadius="base">
        <s-stack direction="block" gap="base">
          <s-select
            label="Swatch shape"
            value={shapes.swatchShape}
            onChange={(event: Event) =>
              patch({
                swatchShape: (event.currentTarget as HTMLSelectElement).value as SwatchShape,
              })
            }
          >
            <s-option value="circle">Circle</s-option>
            <s-option value="square">Square</s-option>
            <s-option value="rounded">Rounded square</s-option>
          </s-select>

          {SHAPE_RADIUS_FIELDS.map((field) => (
            <s-number-field
              key={field.key}
              label={field.label}
              suffix="px"
              min={0}
              max={40}
              value={String(shapes[field.key])}
              onChange={(event: Event) =>
                patch({
                  [field.key]: Number((event.currentTarget as HTMLInputElement).value),
                })
              }
            />
          ))}
        </s-stack>
      </s-box>
      <DesignPreview settings={settings} />
    </s-grid>
  );
}
