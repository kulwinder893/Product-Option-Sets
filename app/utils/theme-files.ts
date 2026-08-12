import {
  THEME_APP_BLOCK_HANDLE,
  THEME_APP_EMBED_HANDLE,
  THEME_EXTENSION_HANDLE,
} from "../constants/theme";

type ThemeBlock = {
  type?: string;
  disabled?: boolean;
};

type ThemeSection = {
  blocks?: Record<string, ThemeBlock>;
};

type SettingsData = {
  current?: {
    blocks?: Record<string, ThemeBlock>;
  };
};

type TemplateData = {
  sections?: Record<string, ThemeSection>;
};

function stripJsonComments(raw: string): string {
  return raw.replace(/\/\*[\s\S]*?\*\//g, "");
}

export function parseThemeJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(stripJsonComments(raw)) as T;
  } catch {
    return fallback;
  }
}

function matchesAppBlock(
  type: string,
  apiKey: string,
  blockHandle: string,
): boolean {
  return type.includes(apiKey) && type.includes(`/blocks/${blockHandle}/`);
}

export function isAppEmbedActive(
  settingsContent: string | null | undefined,
  apiKey: string,
): boolean {
  const settings = parseThemeJson<SettingsData>(settingsContent, {});
  const blocks = settings.current?.blocks ?? {};

  for (const block of Object.values(blocks)) {
    const type = block.type ?? "";
    if (matchesAppBlock(type, apiKey, THEME_APP_EMBED_HANDLE)) {
      return block.disabled !== true;
    }
  }

  return false;
}

export function countActiveAppBlocks(
  templateContents: Array<string | null | undefined>,
  apiKey: string,
): number {
  let count = 0;

  for (const content of templateContents) {
    const template = parseThemeJson<TemplateData>(content, {});
    const sections = template.sections ?? {};

    for (const section of Object.values(sections)) {
      const blocks = section.blocks ?? {};
      for (const block of Object.values(blocks)) {
        const type = block.type ?? "";
        if (
          matchesAppBlock(type, apiKey, THEME_APP_BLOCK_HANDLE) &&
          block.disabled !== true
        ) {
          count += 1;
        }
      }
    }
  }

  return count;
}

export function themeNumericId(themeGid: string): string {
  return themeGid.split("/").pop() ?? themeGid;
}

export function themeEditorUrls(themeId: string, apiKey: string) {
  const base = `shopify://admin/themes/${themeId}/editor`;

  return {
    themeEditorUrl: base,
    appEmbedEditorUrl: `${base}?context=apps&activateAppId=${apiKey}/${THEME_EXTENSION_HANDLE}`,
    appBlockEditorUrl: `${base}?template=product&addAppBlockId=${apiKey}/${THEME_APP_BLOCK_HANDLE}&target=newAppsSection`,
  };
}
