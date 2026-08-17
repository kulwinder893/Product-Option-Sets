import type { AppSettingsState, ShapeSettings, SwatchShape } from "../../types/app-design";
import { SHAPE_RADIUS_FIELDS } from "../../constants/app-design";
import { SettingsSplit } from "./SettingsSplit";

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
    <SettingsSplit settings={settings}>
      <s-stack direction="block" gap="large">
        <div>
          <span className="osp-label">Swatch shape</span>
          <p className="osp-help">Used for both color and image swatches on the product page.</p>
          <div className="osp-choices" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            {(
              [
                ["circle", "Circle", "Soft, jewelry-style dots"],
                ["rounded", "Rounded", "Squircle tiles"],
                ["square", "Square", "Sharp product chips"],
              ] as Array<[SwatchShape, string, string]>
            ).map(([value, title, detail]) => (
              <button
                key={value}
                type="button"
                className={`osp-choice${shapes.swatchShape === value ? " is-active" : ""}`}
                onClick={() => patch({ swatchShape: value })}
              >
                <strong>{title}</strong>
                <span>{detail}</span>
              </button>
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
