import { useEffect, useId } from "react";
import type { FontSettings } from "../../types/app-design";
import { fontSettingsToCss, googleFontsUrl } from "../../utils/app-design";
import "./font-preview.css";

type Props = {
  fonts: FontSettings;
};

export function FontLivePreview({ fonts }: Props) {
  const scopeId = useId().replace(/:/g, "");
  const css = fontSettingsToCss(fonts, `#${scopeId}`);
  const fontsUrl = googleFontsUrl(fonts);

  useEffect(() => {
    if (!fontsUrl) return;
    const existing = document.querySelector<HTMLLinkElement>(
      `link[data-po-google-fonts="${fontsUrl}"]`,
    );
    if (existing) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontsUrl;
    link.setAttribute("data-po-google-fonts", fontsUrl);
    document.head.appendChild(link);
  }, [fontsUrl]);

  return (
    <s-box padding="base" borderWidth="base" borderRadius="base" background="strong">
      <s-stack direction="block" gap="base">
        <s-text type="strong">Preview</s-text>
        <style>{css}</style>
        <div
          id={scopeId}
          className="product-options font-preview"
          style={{
            padding: 16,
            borderRadius: 10,
            background: "#1a1a1a",
            color: "#f4f4f4",
            display: "grid",
            gap: 18,
          }}
        >
          <div className="product-options__field">
            <label className="product-options__label">
              <span className="product-options__label-text">Text box</span>
              <span className="product-options__selected-value">Sample</span>
            </label>
            <input
              className="product-options__input"
              defaultValue="Type here"
              readOnly
            />
            <p className="product-options__help">Help text</p>
          </div>

          <div className="product-options__field">
            <label className="product-options__label">
              <span className="product-options__label-text">Color swatch Option 1</span>
            </label>
            <div className="product-options__swatches product-options__swatches--circle">
              {["#f7b0c4", "#c9b6ff", "#8ec5ff"].map((color) => (
                <span
                  key={color}
                  className="product-options__swatch"
                  style={{ cursor: "default" }}
                >
                  <span
                    className="product-options__swatch-visual"
                    style={{ background: color }}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className="product-options__field">
            <label className="product-options__label">
              <span className="product-options__label-text">Image swatches Option 1</span>
            </label>
            <div className="product-options__swatches product-options__swatches--square">
              {["#d9c4a5", "#c3b09a", "#ae9a86"].map((color) => (
                <span
                  key={color}
                  className="product-options__swatch"
                  style={{ cursor: "default" }}
                >
                  <span
                    className="product-options__swatch-visual"
                    style={{ background: color }}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className="product-options__field">
            <label className="product-options__label">
              <span className="product-options__label-text">Dropdown</span>
            </label>
            <select className="product-options__input product-options__select" disabled>
              <option>Please select</option>
            </select>
          </div>

          <div className="product-options__field">
            <label className="product-options__label">
              <span className="product-options__label-text">Checkbox</span>
              <span className="product-options__selected-value">Option 1</span>
            </label>
            <div className="product-options__choices">
              <label className="product-options__choice">
                <input className="product-options__choice-input" type="checkbox" defaultChecked readOnly />
                <span className="product-options__choice-label">Option 1</span>
              </label>
              <label className="product-options__choice">
                <input className="product-options__choice-input" type="checkbox" readOnly />
                <span className="product-options__choice-label">Option 2</span>
              </label>
            </div>
          </div>

          <div className="product-options__field">
            <label className="product-options__label">
              <span className="product-options__label-text">Radio buttons</span>
            </label>
            <div className="product-options__choices">
              <label className="product-options__choice">
                <input className="product-options__choice-input" type="radio" defaultChecked readOnly />
                <span className="product-options__choice-label">Option 1</span>
              </label>
              <label className="product-options__choice">
                <input className="product-options__choice-input" type="radio" readOnly />
                <span className="product-options__choice-label">Option 2</span>
              </label>
            </div>
          </div>

          <div className="product-options__field">
            <label className="product-options__label">
              <span className="product-options__label-text">Button(s)</span>
            </label>
            <div className="product-options__buttons">
              <span className="product-options__button">Option 1</span>
              <span className="product-options__button">Option 2</span>
            </div>
            <p className="product-options__tooltip">Info / Tooltip</p>
          </div>

          <div className="product-options__field">
            <label className="product-options__label">
              <span className="product-options__label-text">Quantity</span>
            </label>
            <input
              className="product-options__input product-options__quantity"
              defaultValue="1"
              readOnly
            />
            <p className="product-options__error">Error text</p>
          </div>

          <div className="product-options__total">
            Total (additional) price: +$5.00
          </div>
        </div>
      </s-stack>
    </s-box>
  );
}
