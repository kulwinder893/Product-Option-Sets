import type { AppSettingsState, SpacingSettings } from "../../types/app-design";
import { SPACING_FIELDS } from "../../constants/app-design";
import { DesignPreview } from "./DesignPreview";

type Props = {
  settings: AppSettingsState;
  onChange: (next: AppSettingsState) => void;
};

export function SpacingSettingsEditor({ settings, onChange }: Props) {
  const spacing = settings.design.spacing;

  const update = (key: keyof SpacingSettings, value: number) => {
    onChange({
      ...settings,
      design: { ...settings.design, spacing: { ...spacing, [key]: value } },
    });
  };

  return (
    <s-grid gridTemplateColumns="minmax(0, 1.2fr) minmax(280px, 1fr)" gap="base">
      <s-box padding="base" borderWidth="base" borderRadius="base">
        <s-stack direction="block" gap="base">
          {SPACING_FIELDS.map((field) => (
            <s-number-field
              key={field.key}
              label={field.label}
              suffix="px"
              min={field.min}
              max={field.max}
              value={String(spacing[field.key])}
              onChange={(event: Event) =>
                update(field.key, Number((event.currentTarget as HTMLInputElement).value))
              }
            />
          ))}
        </s-stack>
      </s-box>
      <DesignPreview settings={settings} />
    </s-grid>
  );
}
