import type { FontElementKey, FontSettings, FontStyleId, AppSettingsState } from "../../types/app-design";
import {
  FONT_ELEMENT_LABELS,
  FONT_FAMILIES,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FONT_STYLES,
} from "../../constants/app-design";
import { FONT_ELEMENT_KEYS } from "../../types/app-design";
import { SettingsSplit } from "./SettingsSplit";

type Props = {
  settings: AppSettingsState;
  onChange: (next: AppSettingsState) => void;
};

export function FontSettingsEditor({ settings, onChange }: Props) {
  const fonts = settings.design.fonts;

  const updateToken = (
    key: FontElementKey,
    patch: Partial<FontSettings[FontElementKey]>,
  ) => {
    onChange({
      ...settings,
      design: {
        ...settings.design,
        fonts: { ...fonts, [key]: { ...fonts[key], ...patch } },
      },
    });
  };

  return (
    <SettingsSplit settings={settings}>
        <s-stack direction="block" gap="base">
          <s-grid gridTemplateColumns="2fr 1.4fr 1fr 0.8fr" gap="small-200">
            <s-text type="strong">Element</s-text>
            <s-text type="strong">Font family</s-text>
            <s-text type="strong">Style</s-text>
            <s-text type="strong">Size</s-text>
          </s-grid>

          {FONT_ELEMENT_KEYS.map((key) => (
            <s-grid
              key={key}
              gridTemplateColumns="2fr 1.4fr 1fr 0.8fr"
              gap="small-200"
              alignItems="center"
            >
              <s-text>{FONT_ELEMENT_LABELS[key]}</s-text>
              <s-select
                label="Font family"
                labelAccessibilityVisibility="exclusive"
                value={fonts[key].family}
                onChange={(event: Event) =>
                  updateToken(key, {
                    family: (event.currentTarget as HTMLSelectElement).value,
                  })
                }
              >
                {FONT_FAMILIES.map((family) => (
                  <s-option key={family.id} value={family.id}>
                    {family.label}
                  </s-option>
                ))}
              </s-select>
              <s-select
                label="Style"
                labelAccessibilityVisibility="exclusive"
                value={fonts[key].style}
                onChange={(event: Event) =>
                  updateToken(key, {
                    style: (event.currentTarget as HTMLSelectElement).value as FontStyleId,
                  })
                }
              >
                {FONT_STYLES.map((style) => (
                  <s-option key={style.id} value={style.id}>
                    {style.label}
                  </s-option>
                ))}
              </s-select>
              <s-number-field
                label="Size"
                labelAccessibilityVisibility="exclusive"
                suffix="px"
                min={FONT_SIZE_MIN}
                max={FONT_SIZE_MAX}
                value={String(fonts[key].size)}
                onChange={(event: Event) =>
                  updateToken(key, {
                    size: Number((event.currentTarget as HTMLInputElement).value),
                  })
                }
              />
            </s-grid>
          ))}
        </s-stack>
    </SettingsSplit>
  );
}
