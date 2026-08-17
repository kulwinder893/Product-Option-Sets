import type { AppSettingsState, TranslationSettings } from "../../types/app-design";
import { TRANSLATION_FIELDS } from "../../constants/app-design";
import { SettingsSplit } from "./SettingsSplit";

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
    <SettingsSplit settings={settings}>
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
    </SettingsSplit>
  );
}
