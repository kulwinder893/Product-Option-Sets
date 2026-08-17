import { useEffect, useRef, useState } from "react";
import type {
  HeadersFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData, useSearchParams } from "react-router";
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
import type { AppSettingsState } from "../types/app-design";
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

type ActionData = {
  ok: boolean;
  message: string;
  settings?: AppSettingsState;
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
  const [settings, setSettings] = useState(initial);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const section = isSection(searchParams.get("section"))
    ? searchParams.get("section")!
    : "design";
  const tab = isDesignTab(searchParams.get("tab"))
    ? searchParams.get("tab")!
    : "style";

  useEffect(() => {
    setSettings(initial);
  }, [initial]);

  useEffect(() => {
    if (fetcher.data?.settings && fetcher.data.message?.includes("reset")) {
      setSettings(fetcher.data.settings);
    }
  }, [fetcher.data]);

  const persist = (next: AppSettingsState) => {
    setSettings(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const form = new FormData();
      form.set("intent", "save-settings");
      form.set("payload", JSON.stringify(next));
      fetcher.submit(form, { method: "post" });
    }, 280);
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

  const editorProps = { settings, onChange: persist };

  return (
    <s-page heading="Settings">
      <s-stack direction="block" gap="base">
        <s-stack direction="inline" gap="small-200">
          {SETTINGS_SECTIONS.map((item) => (
            <s-button
              key={item.id}
              type="button"
              variant={section === item.id ? "primary" : "secondary"}
              onClick={() => setSection(item.id)}
            >
              {item.label}
            </s-button>
          ))}
        </s-stack>

        {section === "design" ? (
          <s-stack direction="block" gap="base">
            <s-stack direction="inline" gap="small-200" alignItems="center">
              {DESIGN_TABS.map((item) => (
                <s-button
                  key={item.id}
                  type="button"
                  variant={tab === item.id ? "primary" : "tertiary"}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                </s-button>
              ))}
              <div style={{ marginInlineStart: "auto" }}>
                <s-button
                  type="button"
                  variant="tertiary"
                  tone="critical"
                  onClick={() =>
                    fetcher.submit({ intent: "reset-design" }, { method: "post" })
                  }
                >
                  Reset
                </s-button>
              </div>
            </s-stack>

            {tab === "style" ? <StyleSettingsEditor {...editorProps} /> : null}
            {tab === "font" ? <FontSettingsEditor {...editorProps} /> : null}
            {tab === "color" ? <ColorSettingsEditor {...editorProps} /> : null}
            {tab === "size" ? <SizeSettingsEditor {...editorProps} /> : null}
            {tab === "shape" ? <ShapeSettingsEditor {...editorProps} /> : null}
            {tab === "spacing" ? <SpacingSettingsEditor {...editorProps} /> : null}
            {tab === "css" ? <CssSettingsEditor {...editorProps} /> : null}
          </s-stack>
        ) : null}

        {section === "translation" ? (
          <TranslationSettingsEditor {...editorProps} />
        ) : null}
        {section === "advanced" ? (
          <AdvancedSettingsEditor {...editorProps} />
        ) : null}
        {section === "api" ? <ApiSettingsEditor /> : null}

        {fetcher.state !== "idle" ? (
          <s-text color="subdued">Saving…</s-text>
        ) : fetcher.data?.ok ? (
          <s-text color="subdued">{fetcher.data.message}</s-text>
        ) : null}
      </s-stack>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
