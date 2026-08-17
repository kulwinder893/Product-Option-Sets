import type {
  HeadersFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData, useSearchParams, useSubmit } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { settingsService } from "../services/settings.service";
import {
  DESIGN_TABS,
  SETTINGS_SECTIONS,
  type DesignTabId,
  type SettingsSectionId,
} from "../constants/app-design";
import { FontSettingsEditor } from "../components/settings/FontSettingsEditor";
import { AppError } from "../utils/errors";
import type { FontSettings } from "../types/app-design";
import { normalizeFontSettings } from "../utils/app-design";

type ActionData = {
  ok: boolean;
  message: string;
  fonts?: FontSettings;
};

function isSection(value: string | null): value is SettingsSectionId {
  return SETTINGS_SECTIONS.some((section) => section.id === value);
}

function isDesignTab(value: string | null): value is DesignTabId {
  return DESIGN_TABS.some((tab) => tab.id === value);
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const design = await settingsService.getDesign(session.shop);
  return { fonts: design.fonts };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");

  try {
    if (intent === "reset-fonts") {
      const design = await settingsService.resetFonts(session.shop);
      return {
        ok: true,
        message: "Font settings reset to defaults",
        fonts: design.fonts,
      } satisfies ActionData;
    }

    if (intent === "save-fonts") {
      const fonts = normalizeFontSettings(
        JSON.parse(String(formData.get("fonts") || "{}")),
      );
      const design = await settingsService.saveFonts(session.shop, fonts);
      return {
        ok: true,
        message: "Font settings saved",
        fonts: design.fonts,
      } satisfies ActionData;
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
  const { fonts } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();
  const section = isSection(searchParams.get("section"))
    ? searchParams.get("section")!
    : "design";
  const tab = isDesignTab(searchParams.get("tab"))
    ? searchParams.get("tab")!
    : "font";

  const setSection = (next: SettingsSectionId) => {
    const params = new URLSearchParams(searchParams);
    params.set("section", next);
    if (next !== "design") params.delete("tab");
    else if (!params.get("tab")) params.set("tab", "font");
    setSearchParams(params, { replace: true });
  };

  const setTab = (next: DesignTabId) => {
    const params = new URLSearchParams(searchParams);
    params.set("section", "design");
    params.set("tab", next);
    setSearchParams(params, { replace: true });
  };

  const resetFonts = () => {
    submit({ intent: "reset-fonts" }, { method: "post" });
  };

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
                  onClick={resetFonts}
                >
                  Reset
                </s-button>
              </div>
            </s-stack>

            {tab === "font" ? (
              <FontSettingsEditor initialFonts={fonts} />
            ) : (
              <ComingSoon
                title={`${DESIGN_TABS.find((item) => item.id === tab)?.label ?? "This"} settings`}
                body="This App Design section will use the same layout as Font. Font settings are available now and already apply on the storefront."
              />
            )}
          </s-stack>
        ) : (
          <ComingSoon
            title={SETTINGS_SECTIONS.find((item) => item.id === section)?.label ?? "Settings"}
            body="This settings area is next. App Design → Font is ready to use."
          />
        )}
      </s-stack>
    </s-page>
  );
}

function ComingSoon({ title, body }: { title: string; body: string }) {
  return (
    <s-box padding="base" borderWidth="base" borderRadius="base">
      <s-stack direction="block" gap="small-200">
        <s-heading>{title}</s-heading>
        <s-paragraph>{body}</s-paragraph>
      </s-stack>
    </s-box>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
