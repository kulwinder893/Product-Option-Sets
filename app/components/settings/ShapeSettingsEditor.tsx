import type { ShapeSettings, SettingsEditorProps, SwatchShape } from "../../types/app-design";
import { SHAPE_RADIUS_FIELDS } from "../../constants/app-design";
import { SettingsSplit } from "./SettingsSplit";
import { ChoiceCard } from "./ChoiceCard";

const SWATCH_SHAPES: Array<{ value: SwatchShape; title: string; detail: string }> = [
  { value: "circle", title: "Circle", detail: "Soft, jewelry-style dots" },
  { value: "rounded", title: "Rounded", detail: "Squircle tiles" },
  { value: "square", title: "Square", detail: "Sharp product chips" },
];

export function ShapeSettingsEditor({ settings, onChange }: SettingsEditorProps) {
  const shapes = settings.design.shapes;

  const patch = (next: Partial<ShapeSettings>) => {
    onChange({
      ...settings,
      design: { ...settings.design, shapes: { ...shapes, ...next } },
    });
  };

  return (
    <SettingsSplit settings={settings}>
      <s-stack direction="block" gap="large">
        <div>
          <span className="osp-label">Swatch shape</span>
          <p className="osp-help">Used for both color and image swatches on the product page.</p>
          <div className="osp-choices osp-choices--3">
            {SWATCH_SHAPES.map((item) => (
              <ChoiceCard
                key={item.value}
                active={shapes.swatchShape === item.value}
                title={item.title}
                detail={item.detail}
                onClick={() => patch({ swatchShape: item.value })}
              />
            ))}
          </div>
        </div>

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
    </SettingsSplit>
  );
}
