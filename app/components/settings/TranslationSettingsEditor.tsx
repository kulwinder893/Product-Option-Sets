import type { AppSettingsState, TranslationSettings } from "../../types/app-design";
import { TRANSLATION_FIELDS } from "../../constants/app-design";
import { DesignPreview } from "./DesignPreview";

type Props = {
  settings: AppSettingsState;
  onChange: (next: AppSettingsState) => void;
};

export function TranslationSettingsEditor({ settings, onChange }: Props) {
  const update = (key: keyof TranslationSettings, value: string) => {
    onChange({
      ...settings,
      translations: { ...settings.translations, [key]: value },
    });
  };

  return (
    <s-grid gridTemplateColumns="minmax(0, 1.2fr) minmax(280px, 1fr)" gap="base">
      <s-box padding="base" borderWidth="base" borderRadius="base">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Storefront labels used by the option widget. Leave a field as-is to keep the default.
          </s-paragraph>
          {TRANSLATION_FIELDS.map((field) => (
            <s-text-field
              key={field.key}
              label={field.label}
              value={settings.translations[field.key]}
              onInput={(event: Event) =>
                update(field.key, (event.currentTarget as HTMLInputElement).value)
              }
            />
          ))}
        </s-stack>
      </s-box>
      <DesignPreview settings={settings} />
    </s-grid>
  );
}
