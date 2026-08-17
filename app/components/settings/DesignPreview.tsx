import { useEffect, useId } from "react";
import type { AppSettingsState } from "../../types/app-design";
import { designToCss, googleFontsUrl } from "../../utils/app-design";
import "./font-preview.css";
import "./settings-ui.css";

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
    <div className="osp-preview-shell">
      <div className="osp-preview-head">
        <s-stack direction="block" gap="none">
          <s-text type="strong">Live storefront</s-text>
          <s-text color="subdued">How shoppers will see option widgets</s-text>
        </s-stack>
        <s-badge tone="success">{dark ? "Evening" : "Daylight"}</s-badge>
      </div>
      <style>{css}</style>
      <div className="osp-preview-canvas">
        <div className="osp-preview-phone">
          <div className="osp-preview-phone__bar">
            <span>Product options</span>
            <span>{design.style.preset === "modern" ? "Soft Studio" : "Editorial"}</span>
          </div>
          <div
            id={scopeId}
            className={`product-options font-preview osp-storefront${design.style.showSelectedValue ? "" : " product-options--hide-selected"}`}
            style={{
              padding: 16,
              background: dark ? "#161a1f" : "#fffdf9",
              color: dark ? "#eef2f4" : "#243040",
            }}
          >
            <div className="product-options__field">
              <label className="product-options__label">
                <span className="product-options__label-text">Text box</span>
                <span className="product-options__selected-value">Sample</span>
              </label>
              <input className="product-options__input" placeholder="Type here" readOnly />
              <p className="product-options__help">Help text</p>
            </div>

            <div className="product-options__field">
              <label className="product-options__label">
                <span className="product-options__label-text">Color swatch</span>
              </label>
              <div className="product-options__swatches product-options__swatches--circle product-options__swatches--color">
                {["#efc9b8", "#9ec5c0", "#c9b8e3"].map((color, index) => (
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
                <span className="product-options__label-text">Image swatches</span>
              </label>
              <div className="product-options__swatches product-options__swatches--square product-options__swatches--image">
                {["#e6d5c3", "#d3c2ae", "#c0ad98"].map((color, index) => (
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
                <span className="product-options__tooltip">i</span>
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
                <span className="product-options__label-text">Buttons</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
