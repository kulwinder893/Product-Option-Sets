import { useEffect, useId } from "react";
import type { AppSettingsState } from "../../types/app-design";
import { designToCss, googleFontsUrl } from "../../utils/app-design";
import "./font-preview.css";

type Props = {
  settings: AppSettingsState;
};

export function DesignPreview({ settings }: Props) {
  const scopeId = useId().replace(/:/g, "");
  const css = designToCss(settings.design, `#${scopeId}`);
  const fontsUrl = googleFontsUrl(settings.design.fonts);
  const { translations, design } = settings;
  const dark = design.style.mode === "dark";

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
          className={`product-options font-preview${design.style.showSelectedValue ? "" : " product-options--hide-selected"}`}
          style={{
            padding: 16,
            borderRadius: 10,
            background: dark ? "#1a1a1a" : "#f6f6f6",
            color: dark ? "#f4f4f4" : "#121212",
          }}
        >
          <div className="product-options__field">
            <label className="product-options__label">
              <span className="product-options__label-text">Text box</span>
              <span className="product-options__selected-value">Sample</span>
            </label>
            <input className="product-options__input" placeholder="Type here" defaultValue="" readOnly />
            <p className="product-options__help">Help text</p>
          </div>

          <div className="product-options__field">
            <label className="product-options__label">
              <span className="product-options__label-text">Color swatch Option 1</span>
            </label>
            <div className="product-options__swatches product-options__swatches--circle product-options__swatches--color">
              {["#f7b0c4", "#c9b6ff", "#8ec5ff"].map((color, index) => (
                <label key={color} className="product-options__swatch">
                  <input
                    className="product-options__swatch-input"
                    type="radio"
                    name={`preview-color-${scopeId}`}
                    defaultChecked={index === 0}
                    readOnly
                  />
                  <span className="product-options__swatch-visual" style={{ background: color }} />
                </label>
              ))}
            </div>
          </div>

          <div className="product-options__field">
            <label className="product-options__label">
              <span className="product-options__label-text">Image swatches Option 1</span>
            </label>
            <div className="product-options__swatches product-options__swatches--square product-options__swatches--image">
              {["#d9c4a5", "#c3b09a", "#ae9a86"].map((color, index) => (
                <label key={color} className="product-options__swatch">
                  <input
                    className="product-options__swatch-input"
                    type="radio"
                    name={`preview-image-${scopeId}`}
                    defaultChecked={index === 0}
                    readOnly
                  />
                  <span className="product-options__swatch-visual" style={{ background: color }} />
                </label>
              ))}
            </div>
          </div>

          <div className="product-options__field">
            <label className="product-options__label">
              <span className="product-options__label-text">Dropdown</span>
              <span className="product-options__tooltip">ℹ</span>
            </label>
            <select className="product-options__input product-options__select" disabled>
              <option>{translations.pleaseSelect}</option>
            </select>
          </div>

          <div className="product-options__field">
            <label className="product-options__label">
              <span className="product-options__label-text">Checkbox</span>
              <span className="product-options__badge">New</span>
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
              <span className="product-options__button is-selected">Option 1</span>
              <span className="product-options__button">Option 2</span>
            </div>
          </div>

          <div className="product-options__field">
            <label className="product-options__label">
              <span className="product-options__label-text">Switch</span>
            </label>
            <label className="product-options__switch">
              <input className="product-options__switch-input" type="checkbox" defaultChecked readOnly />
              <span className="product-options__switch-track" />
              <span className="product-options__choice-label">{translations.yes}</span>
            </label>
          </div>

          <div className="product-options__field">
            <label className="product-options__label">
              <span className="product-options__label-text">Quantity</span>
            </label>
            <input className="product-options__input product-options__quantity" defaultValue="1" readOnly />
            <p className="product-options__error">{translations.errorRequired}</p>
          </div>

          <div className="product-options__field">
            <label className="product-options__label">
              <span className="product-options__label-text">File upload</span>
            </label>
            <button type="button" className="product-options__button product-options__upload">
              {translations.uploadFile}
            </button>
            <span className="product-options__filename">sample.png</span>
          </div>

          <div className="product-options__total">
            {translations.optionsTotal}:{" "}
            <span className="product-options__total-price">+$5.00</span>
          </div>
          <s-text color="subdued">
            {translations.youveChosen}: 1
          </s-text>
        </div>
      </s-stack>
    </s-box>
  );
}
