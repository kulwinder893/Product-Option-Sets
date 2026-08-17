import type { SettingsEditorProps, SpacingSettings } from "../../types/app-design";
import { SPACING_FIELDS } from "../../constants/app-design";
import { SettingsSplit } from "./SettingsSplit";

export function SpacingSettingsEditor({ settings, onChange }: SettingsEditorProps) {
  const spacing = settings.design.spacing;

  const update = (key: keyof SpacingSettings, value: number) => {
    onChange({
      ...settings,
      design: { ...settings.design, spacing: { ...spacing, [key]: value } },
    });
  };

  return (
    <SettingsSplit settings={settings}>
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
    </SettingsSplit>
  );
}
