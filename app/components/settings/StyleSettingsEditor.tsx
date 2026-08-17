import type { AppSettingsState } from "../../types/app-design";
import { colorsForMode } from "../../constants/app-design";
import { DesignPreview } from "./DesignPreview";

type Props = {
  settings: AppSettingsState;
  onChange: (next: AppSettingsState) => void;
};

export function StyleSettingsEditor({ settings, onChange }: Props) {
  const style = settings.design.style;

  const patchStyle = (patch: Partial<typeof style>, extraDesign?: Partial<AppSettingsState["design"]>) => {
    onChange({
      ...settings,
      design: {
        ...settings.design,
        ...extraDesign,
        style: { ...style, ...patch },
      },
    });
  };

  return (
    <s-grid gridTemplateColumns="minmax(0, 1.2fr) minmax(280px, 1fr)" gap="base">
      <s-box padding="base" borderWidth="base" borderRadius="base">
        <s-stack direction="block" gap="base">
          <s-select
            label="Design style"
            value={style.preset}
            onChange={(event: Event) =>
              patchStyle({
                preset: (event.currentTarget as HTMLSelectElement).value as typeof style.preset,
              })
            }
          >
            <s-option value="modern">Modern</s-option>
            <s-option value="classic">Classic</s-option>
          </s-select>

          <s-select
            label="Theme mode"
            value={style.mode}
            onChange={(event: Event) => {
              const mode = (event.currentTarget as HTMLSelectElement).value as typeof style.mode;
              patchStyle({ mode }, { colors: colorsForMode(mode) });
            }}
          >
            <s-option value="light">Light</s-option>
            <s-option value="dark">Dark</s-option>
          </s-select>

          <s-select
            label="Option values layout"
            value={style.choiceLayout}
            onChange={(event: Event) =>
              patchStyle({
                choiceLayout: (event.currentTarget as HTMLSelectElement)
                  .value as typeof style.choiceLayout,
              })
            }
          >
            <s-option value="horizontal">Horizontal</s-option>
            <s-option value="vertical">Vertical</s-option>
          </s-select>

          <s-checkbox
            label="Show selected value next to option label"
            {...(style.showSelectedValue ? { checked: true } : {})}
            onChange={(event: Event) =>
              patchStyle({
                showSelectedValue: (event.currentTarget as HTMLInputElement).checked,
              })
            }
          />
        </s-stack>
      </s-box>
      <DesignPreview settings={settings} />
    </s-grid>
  );
}
