import type { AppSettingsState } from "../../types/app-design";
import { SettingsSplit } from "./SettingsSplit";

type Props = {
  settings: AppSettingsState;
  onChange: (next: AppSettingsState) => void;
};

export function CssSettingsEditor({ settings, onChange }: Props) {
  return (
    <SettingsSplit settings={settings}>
        <s-stack direction="block" gap="base">
          <s-text-area
            label="Custom CSS"
            details="Applied after App Design styles on the storefront. Target .product-options classes."
            rows={16}
            value={settings.design.customCss}
            onInput={(event: Event) =>
              onChange({
                ...settings,
                design: {
                  ...settings.design,
                  customCss: (event.currentTarget as HTMLTextAreaElement).value,
                },
              })
            }
          />
        </s-stack>
    </SettingsSplit>
  );
}
