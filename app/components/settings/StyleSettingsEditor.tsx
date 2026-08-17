import type { AppSettingsState } from "../../types/app-design";
import { colorsForMode } from "../../constants/app-design";
import { SettingsSplit } from "./SettingsSplit";

type Props = {
  settings: AppSettingsState;
  onChange: (next: AppSettingsState) => void;
};

function Choice({
  active,
  title,
  detail,
  onClick,
}: {
  active: boolean;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`osp-choice${active ? " is-active" : ""}`}
      onClick={onClick}
    >
      <strong>{title}</strong>
      <span>{detail}</span>
    </button>
  );
}

export function StyleSettingsEditor({ settings, onChange }: Props) {
  const style = settings.design.style;

  const patchStyle = (
    patch: Partial<typeof style>,
    extraDesign?: Partial<AppSettingsState["design"]>,
  ) => {
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
    <SettingsSplit settings={settings}>
      <s-stack direction="block" gap="large">
        <div>
          <span className="osp-label">Look</span>
          <p className="osp-help">
            Pick a storefront personality. Soft Studio is the new default — calmer than a
            black-and-white widget.
          </p>
          <div className="osp-choices">
            <Choice
              active={style.preset === "modern"}
              title="Soft Studio"
              detail="Rounded, airy, teal accents"
              onClick={() => patchStyle({ preset: "modern" })}
            />
            <Choice
              active={style.preset === "classic"}
              title="Editorial"
              detail="Sharper corners, quieter contrast"
              onClick={() => patchStyle({ preset: "classic" })}
            />
          </div>
        </div>

        <div>
          <span className="osp-label">Canvas</span>
          <p className="osp-help">Light is tuned for most Shopify themes. Dark inverts the palette.</p>
          <div className="osp-choices">
            <Choice
              active={style.mode === "light"}
              title="Daylight"
              detail="Warm paper white + sage"
              onClick={() => patchStyle({ mode: "light" }, { colors: colorsForMode("light") })}
            />
            <Choice
              active={style.mode === "dark"}
              title="Evening"
              detail="Ink canvas + mint highlights"
              onClick={() => patchStyle({ mode: "dark" }, { colors: colorsForMode("dark") })}
            />
          </div>
        </div>

        <div>
          <span className="osp-label">Values layout</span>
          <div className="osp-choices">
            <Choice
              active={style.choiceLayout === "horizontal"}
              title="Row"
              detail="Checkboxes and radios side by side"
              onClick={() => patchStyle({ choiceLayout: "horizontal" })}
            />
            <Choice
              active={style.choiceLayout === "vertical"}
              title="Stack"
              detail="One choice per line"
              onClick={() => patchStyle({ choiceLayout: "vertical" })}
            />
          </div>
        </div>

        <label className="osp-toggle">
          <span>
            <strong>Show chosen value next to the label</strong>
            <p className="osp-help" style={{ margin: "4px 0 0" }}>
              Helpful for color and image swatches.
            </p>
          </span>
          <s-switch
            {...(style.showSelectedValue ? { checked: true } : {})}
            onChange={(event: Event) =>
              patchStyle({
                showSelectedValue: (event.currentTarget as HTMLInputElement).checked,
              })
            }
          />
        </label>
      </s-stack>
    </SettingsSplit>
  );
}
