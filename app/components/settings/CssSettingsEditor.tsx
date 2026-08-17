import type { AppSettingsState } from "../../types/app-design";
import { DesignPreview } from "./DesignPreview";

type Props = {
  settings: AppSettingsState;
  onChange: (next: AppSettingsState) => void;
};

export function CssSettingsEditor({ settings, onChange }: Props) {
  return (
    <s-grid gridTemplateColumns="minmax(0, 1.2fr) minmax(280px, 1fr)" gap="base">
      <s-box padding="base" borderWidth="base" borderRadius="base">
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
      </s-box>
      <DesignPreview settings={settings} />
    </s-grid>
  );
}
