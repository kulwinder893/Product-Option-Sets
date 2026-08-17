import type { AppSettingsState, SizeSettings } from "../../types/app-design";
import { SIZE_FIELDS } from "../../constants/app-design";
import { DesignPreview } from "./DesignPreview";

type Props = {
  settings: AppSettingsState;
  onChange: (next: AppSettingsState) => void;
};

export function SizeSettingsEditor({ settings, onChange }: Props) {
  const sizes = settings.design.sizes;

  const update = (key: keyof SizeSettings, value: number) => {
    onChange({
      ...settings,
      design: { ...settings.design, sizes: { ...sizes, [key]: value } },
    });
  };

  return (
    <s-grid gridTemplateColumns="minmax(0, 1.2fr) minmax(280px, 1fr)" gap="base">
      <s-box padding="base" borderWidth="base" borderRadius="base">
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
      </s-box>
      <DesignPreview settings={settings} />
    </s-grid>
  );
}
