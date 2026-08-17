import type { ColorSettings, SettingsEditorProps } from "../../types/app-design";
import { COLOR_GROUPS } from "../../constants/app-design";
import { SettingsSplit } from "./SettingsSplit";

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <s-grid gridTemplateColumns="1.4fr auto 120px" gap="small-200" alignItems="center">
      <s-text>{label}</s-text>
      <s-color-field
        label={label}
        labelAccessibilityVisibility="exclusive"
        value={value}
        onInput={(event: Event) =>
          onChange((event.currentTarget as HTMLInputElement).value)
        }
      />
      <s-text-field
        label="Hex"
        labelAccessibilityVisibility="exclusive"
        value={value}
        onInput={(event: Event) =>
          onChange((event.currentTarget as HTMLInputElement).value)
        }
      />
    </s-grid>
  );
}

export function ColorSettingsEditor({ settings, onChange }: SettingsEditorProps) {
  const colors = settings.design.colors;

  const update = (key: keyof ColorSettings, value: string) => {
    onChange({
      ...settings,
      design: { ...settings.design, colors: { ...colors, [key]: value } },
    });
  };

  return (
    <SettingsSplit settings={settings}>
        <s-stack direction="block" gap="large">
          {COLOR_GROUPS.map((group) => (
            <s-stack key={group.title} direction="block" gap="small-200">
              <s-heading>{group.title}</s-heading>
              {group.items.map((item) => (
                <ColorRow
                  key={item.key}
                  label={item.label}
                  value={colors[item.key]}
                  onChange={(value) => update(item.key, value)}
                />
              ))}
            </s-stack>
          ))}
        </s-stack>
    </SettingsSplit>
  );
}
