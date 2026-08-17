import type { SettingsEditorProps, SizeSettings } from "../../types/app-design";
import { SIZE_FIELDS } from "../../constants/app-design";
import { SettingsSplit } from "./SettingsSplit";

export function SizeSettingsEditor({ settings, onChange }: SettingsEditorProps) {
  const sizes = settings.design.sizes;

  const update = (key: keyof SizeSettings, value: number) => {
    onChange({
      ...settings,
      design: { ...settings.design, sizes: { ...sizes, [key]: value } },
    });
  };

  return (
    <SettingsSplit settings={settings}>
        <s-stack direction="block" gap="base">
          {SIZE_FIELDS.map((field) => (
            <s-number-field
              key={field.key}
              label={field.label}
              suffix="px"
              min={field.min}
              max={field.max}
              value={String(sizes[field.key])}
              onChange={(event: Event) =>
                update(field.key, Number((event.currentTarget as HTMLInputElement).value))
              }
            />
          ))}
        </s-stack>
    </SettingsSplit>
  );
}
