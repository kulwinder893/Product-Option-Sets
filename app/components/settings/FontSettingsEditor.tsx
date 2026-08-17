import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { FontElementKey, FontSettings, FontStyleId } from "../../types/app-design";
import {
  FONT_ELEMENT_LABELS,
  FONT_FAMILIES,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FONT_STYLES,
} from "../../constants/app-design";
import { FONT_ELEMENT_KEYS } from "../../types/app-design";
import { FontLivePreview } from "./FontLivePreview";

type Props = {
  initialFonts: FontSettings;
};

type ActionData = {
  ok?: boolean;
  message?: string;
  fonts?: FontSettings;
};

export function FontSettingsEditor({ initialFonts }: Props) {
  const fetcher = useFetcher<ActionData>();
  const [fonts, setFonts] = useState(initialFonts);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFonts(initialFonts);
  }, [initialFonts]);

  useEffect(() => {
    if (fetcher.data?.fonts && fetcher.data.message?.includes("reset")) {
      setFonts(fetcher.data.fonts);
    }
  }, [fetcher.data]);

  const persist = (next: FontSettings) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const form = new FormData();
      form.set("intent", "save-fonts");
      form.set("fonts", JSON.stringify(next));
      fetcher.submit(form, { method: "post" });
    }, 250);
  };

  const updateToken = (
    key: FontElementKey,
    patch: Partial<FontSettings[FontElementKey]>,
  ) => {
    const next = {
      ...fonts,
      [key]: { ...fonts[key], ...patch },
    };
    setFonts(next);
    persist(next);
  };

  return (
    <s-grid gridTemplateColumns="minmax(0, 1.4fr) minmax(280px, 1fr)" gap="base">
      <s-box padding="base" borderWidth="base" borderRadius="base">
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
                    style: (event.currentTarget as HTMLSelectElement)
                      .value as FontStyleId,
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

          {fetcher.state !== "idle" ? (
            <s-text color="subdued">Saving…</s-text>
          ) : fetcher.data?.ok ? (
            <s-text color="subdued">{fetcher.data.message}</s-text>
          ) : null}
        </s-stack>
      </s-box>

      <FontLivePreview fonts={fonts} />
    </s-grid>
  );
}
