import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";
import type {
  HeadersFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData, useSearchParams } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { settingsService } from "../services/settings.service";
import {
  DESIGN_TABS,
  SETTINGS_SECTIONS,
  type DesignTabId,  
  type SettingsSectionId,
} from "../constants/app-design";
import { AppError } from "../utils/errors";
import { normalizeAppSettings } from "../utils/app-design";
import type { AppSettingsState, SettingsEditorProps } from "../types/app-design";
import { StyleSettingsEditor } from "../components/settings/StyleSettingsEditor";
import { FontSettingsEditor } from "../components/settings/FontSettingsEditor";
import { ColorSettingsEditor } from "../components/settings/ColorSettingsEditor";
import { SizeSettingsEditor } from "../components/settings/SizeSettingsEditor";
import { ShapeSettingsEditor } from "../components/settings/ShapeSettingsEditor";
import { SpacingSettingsEditor } from "../components/settings/SpacingSettingsEditor";
import { CssSettingsEditor } from "../components/settings/CssSettingsEditor";
import { TranslationSettingsEditor } from "../components/settings/TranslationSettingsEditor";
import { AdvancedSettingsEditor } from "../components/settings/AdvancedSettingsEditor";
import { ApiSettingsEditor } from "../components/settings/ApiSettingsEditor";
import "../components/settings/settings-ui.css";

type ActionData = {
  ok: boolean;
  message: string;
  settings?: AppSettingsState;
};

const DESIGN_EDITORS: Record<DesignTabId, ComponentType<SettingsEditorProps>> = {
  style: StyleSettingsEditor,
  font: FontSettingsEditor,
  color: ColorSettingsEditor,
  size: SizeSettingsEditor,
  shape: ShapeSettingsEditor,
  spacing: SpacingSettingsEditor,
  css: CssSettingsEditor,
};

function isSection(value: string | null): value is SettingsSectionId {
  return SETTINGS_SECTIONS.some((section) => section.id === value);
}

function isDesignTab(value: string | null): value is DesignTabId {
  return DESIGN_TABS.some((tab) => tab.id === value);
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await settingsService.getAll(session.shop);
  return { settings };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");

  try {
    if (intent === "reset-design") {
      const settings = await settingsService.resetDesign(session.shop);
      return { ok: true, message: "App Design reset to defaults", settings } satisfies ActionData;
    }

    if (intent === "save-settings") {
      const parsed = JSON.parse(String(formData.get("payload") || "{}"));
      const settings = await settingsService.saveAll(
        session.shop,
        normalizeAppSettings(parsed),
      );
      return { ok: true, message: "Settings saved", settings } satisfies ActionData;
    }

    throw new AppError("Unknown settings action", "VALIDATION_ERROR");
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, message: error.message } satisfies ActionData;
    }
    console.error("Settings save failed:", error);
    return {
      ok: false,
      message: "Could not save settings. Please try again.",
    } satisfies ActionData;
  }
};

export default function SettingsPage() {
  const { settings: initial } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionData>();
  const shopify = useAppBridge();
  const [settings, setSettings] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const savedSnapshot = useRef(JSON.stringify(initial));
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = searchParams.get("section");
  const tabParam = searchParams.get("tab");
  const section: SettingsSectionId = isSection(sectionParam) ? sectionParam : "design";
  const tab: DesignTabId = isDesignTab(tabParam) ? tabParam : "style";

  useEffect(() => {
    setSettings(initial);
    savedSnapshot.current = JSON.stringify(initial);
    setDirty(false);
  }, [initial]);

  useEffect(() => {
    if (!fetcher.data || fetcher.state !== "idle") return;
    if (fetcher.data.message) {
      shopify.toast.show(fetcher.data.message, { isError: !fetcher.data.ok });
    }
    if (fetcher.data.ok && fetcher.data.settings) {
      setSettings(fetcher.data.settings);
      savedSnapshot.current = JSON.stringify(fetcher.data.settings);
      setDirty(false);
    }
  }, [fetcher.data, fetcher.state, shopify]);

  const updateSettings = (next: AppSettingsState) => {
    setSettings(next);
    setDirty(JSON.stringify(next) !== savedSnapshot.current);
  };

  const save = () => {
    const form = new FormData();
    form.set("intent", "save-settings");
    form.set("payload", JSON.stringify(settings));
    fetcher.submit(form, { method: "post" });
  };

  const setSection = (next: SettingsSectionId) => {
    const params = new URLSearchParams(searchParams);
    params.set("section", next);
    if (next !== "design") params.delete("tab");
    else if (!params.get("tab")) params.set("tab", "style");
    setSearchParams(params, { replace: true });
  };

  const setTab = (next: DesignTabId) => {
    const params = new URLSearchParams(searchParams);
    params.set("section", "design");
    params.set("tab", next);
    setSearchParams(params, { replace: true });
  };

  const editorProps = { settings, onChange: updateSettings };
  const DesignEditor = DESIGN_EDITORS[tab];
  const saving = fetcher.state !== "idle";
  const saveLabel = saving
    ? "Saving…"
    : dirty
      ? "Unsaved changes — click Save"
      : fetcher.data?.ok
        ? "Settings saved"
        : fetcher.data && !fetcher.data.ok
          ? fetcher.data.message
          : "Ready to save";

  return (
    <s-page heading="Settings">
      <s-button
        slot="primary-action"
        variant="primary"
        onClick={save}
        {...(saving ? { loading: true } : {})}
      >
        Save settings
      </s-button>
      <div className="osp-settings">
        <s-stack direction="block" gap="large">
          <div className="osp-settings__hero">
            <div>
              <p className="osp-settings__kicker">Storefront appearance</p>
              <h2>Craft how options feel on the product page</h2>
              <p>
                A warm daylight canvas with sage accents — easier to scan than a
                stark black-and-white widget.
              </p>
            </div>
            <span
              className={`osp-status${saving ? " osp-status--saving" : ""}${dirty ? " osp-status--dirty" : ""}`}
            >
              {saveLabel}
            </span>
          </div>

          <div className="osp-sections">
            {SETTINGS_SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`osp-chip${section === item.id ? " is-active" : ""}`}
                onClick={() => setSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {section === "design" ? (
            <s-stack direction="block" gap="base">
              <div className="osp-subnav">
                {DESIGN_TABS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={tab === item.id ? "is-active" : undefined}
                    onClick={() => setTab(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  className="osp-reset"
                  onClick={() =>
                    fetcher.submit({ intent: "reset-design" }, { method: "post" })
                  }
                >
                  Reset look
                </button>
              </div>
              <DesignEditor {...editorProps} />
            </s-stack>
          ) : null}

          {section === "translation" ? (
            <TranslationSettingsEditor {...editorProps} />
          ) : null}
          {section === "advanced" ? (
            <AdvancedSettingsEditor {...editorProps} />
          ) : null}
          {section === "api" ? <ApiSettingsEditor /> : null}

          {section !== "api" ? (
            <div className="osp-save-bar">
              <span className={dirty ? "osp-status osp-status--dirty" : "osp-status"}>
                {saveLabel}
              </span>
              <button
                type="button"
                className="osp-save-bar__button"
                onClick={save}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save settings"}
              </button>
            </div>
          ) : null}
        </s-stack>
      </div>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
