import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import type { AppSettingsState } from "../../types/app-design";
import { designToCss, googleFontsUrl } from "../../utils/app-design";
import "../../../extensions/product-options/assets/product-options.css";

type Props = {
  settings: AppSettingsState;
};

function loadGoogleFont(url: string | null) {
  if (!url) return;
  if (document.querySelector(`link[data-po-google-fonts="${url}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  link.setAttribute("data-po-google-fonts", url);
  document.head.appendChild(link);
}

function Field({
  title,
  selected,
  badge,
  tooltip,
  children,
}: {
  title: string;
  selected?: string;
  badge?: string;
  tooltip?: string;
  children: ReactNode;
}) {
  return (
    <div className="product-options__field">
      <div className="product-options__label">
        <span className="product-options__label-text">{title}</span>
        {badge ? <span className="product-options__badge">{badge}</span> : null}
        {tooltip ? <span className="product-options__tooltip">{tooltip}</span> : null}
        {selected ? <span className="product-options__selected-value">{selected}</span> : null}
      </div>
      {children}
    </div>
  );
}

function Choice({
  type,
  label,
  checked = false,
}: {
  type: "checkbox" | "radio";
  label: string;
  checked?: boolean;
}) {
  return (
    <label className="product-options__choice">
      <input
        className="product-options__choice-input"
        type={type}
        defaultChecked={checked}
      />
      <span className="product-options__choice-label">{label}</span>
    </label>
  );
}

function Swatches({
  name,
  colors,
  shape,
  kind,
}: {
  name: string;
  colors: string[];
  shape: string;
  kind: "color" | "image";
}) {
  return (
    <div
      className={`product-options__swatches product-options__swatches--${shape} product-options__swatches--${kind}`}
    >
      {colors.map((color, index) => (
        <label key={color} className="product-options__swatch">
          <input
            className="product-options__swatch-input"
            type="radio"
            name={name}
            defaultChecked={index === 0}
          />
          <span className="product-options__swatch-visual" style={{ background: color }} />
        </label>
      ))}
    </div>
  );
}

function PreviewFileUpload({ label }: { label: string }) {
  const [filename, setFilename] = useState("");

  return (
    <Field title="File upload" selected={filename || undefined}>
      <span className="product-options__button product-options__upload">
        {label}
        <input
          className="product-options__file-input"
          type="file"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            setFilename(file?.name || "");
          }}
        />
      </span>
      {filename ? <span className="product-options__filename">{filename}</span> : null}
    </Field>
  );
}

export function DesignPreview({ settings }: Props) {
  const scopeId = useId().replace(/:/g, "");
  const { translations, design } = settings;
  const dark = design.style.mode === "dark";
  const fontsUrl = googleFontsUrl(design.fonts);
  const hideSelected = design.style.showSelectedValue
    ? ""
    : " product-options--hide-selected";

  useEffect(() => {
    loadGoogleFont(fontsUrl);
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

      <style>{designToCss(design, `#${scopeId}`)}</style>

      <div className="osp-preview-canvas">
        <div className="osp-preview-phone">
          <div className="osp-preview-phone__bar">
            <span>Product options</span>
            <span>{design.style.preset === "modern" ? "Soft Studio" : "Editorial"}</span>
          </div>

          <div className="osp-preview-phone__body">
          <div
            id={scopeId}
            className={`product-options${hideSelected}`}
            data-mode={dark ? "dark" : "light"}
          >
            <Field title="Text box" selected="Sample">
              <input className="product-options__input" placeholder="Type here" defaultValue="Sample" />
              <p className="product-options__help">Help text</p>
            </Field>

            <Field title="Color swatch">
              <Swatches
                name={`${scopeId}-color`}
                colors={["#efc9b8", "#9ec5c0", "#c9b8e3"]}
                shape={design.shapes.swatchShape}
                kind="color"
              />
            </Field>

            <Field title="Image swatches">
              <Swatches
                name={`${scopeId}-image`}
                colors={["#e6d5c3", "#d3c2ae", "#c0ad98"]}
                shape={design.shapes.swatchShape}
                kind="image"
              />
            </Field>

            <Field title="Dropdown" tooltip="i">
              <select className="product-options__input product-options__select" defaultValue="">
                <option value="">{translations.pleaseSelect}</option>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
              </select>
            </Field>

            <Field title="Checkbox" badge="New" selected="Option 1">
              <div className="product-options__choices">
                <Choice type="checkbox" label="Option 1" checked />
                <Choice type="checkbox" label="Option 2" />
              </div>
            </Field>

            <Field title="Radio buttons">
              <div className="product-options__choices">
                <Choice type="radio" label="Option 1" checked />
                <Choice type="radio" label="Option 2" />
              </div>
            </Field>

            <Field title="Buttons">
              <div className="product-options__buttons">
                <span className="product-options__button is-selected">Option 1</span>
                <span className="product-options__button">Option 2</span>
              </div>
            </Field>

            <Field title="Switch">
              <label className="product-options__switch">
                <input
                  className="product-options__switch-input"
                  type="checkbox"
                  defaultChecked
                />
                <span className="product-options__switch-track" />
                <span className="product-options__choice-label">{translations.yes}</span>
              </label>
            </Field>

            <Field title="Quantity">
              <input
                className="product-options__input product-options__quantity"
                defaultValue="1"
              />
            </Field>

            <PreviewFileUpload label={translations.uploadFile} />

            <div className="product-options__total">
              {translations.optionsTotal}:{" "}
              <span className="product-options__total-price">+$5.00</span>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
