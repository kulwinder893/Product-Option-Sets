import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import { THEME_BLOCK_TEMPLATE_FILES } from "../constants/theme";
import type { ThemeInfo, ThemeIntegrationStatus } from "../types/theme";
import {
  countActiveAppBlocks,
  isAppEmbedActive,
  themeEditorUrls,
  themeNumericId,
} from "../utils/theme-files";

/** Fetch all store themes — omit roles so nothing is filtered out. */
const THEMES_QUERY = `#graphql
  query DashboardThemes {
    themes(first: 50) {
      nodes {
        id
        name
        role
      }
    }
  }
`;

const THEME_FILES_QUERY = `#graphql
  query DashboardThemeFiles($themeId: ID!, $filenames: [String!]!) {
    theme(id: $themeId) {
      files(filenames: $filenames, first: 20) {
        nodes {
          filename
          body {
            ... on OnlineStoreThemeFileBodyText {
              content
            }
          }
        }
      }
    }
  }
`;

type GraphqlError = {
  message?: string;
  extensions?: { code?: string };
};

type ThemesResponse = {
  data?: {
    themes?: {
      nodes?: Array<{
        id: string;
        name: string;
        role: string;
      }>;
    };
  };
  errors?: GraphqlError[];
};

type ThemeFilesResponse = {
  data?: {
    theme?: {
      files?: {
        nodes?: Array<{
          filename: string;
          body?: { content?: string };
        }>;
      };
    };
  };
  errors?: GraphqlError[];
};

function emptyStatus(
  patch: Partial<ThemeIntegrationStatus> = {},
): ThemeIntegrationStatus {
  return {
    theme: null,
    themes: [],
    appEmbedActive: false,
    appBlockCount: 0,
    appEmbedEditorUrl: "shopify://admin/themes/current/editor?context=apps",
    appBlockEditorUrl:
      "shopify://admin/themes/current/editor?template=product",
    themeEditorUrl: "shopify://admin/themes/current/editor",
    needsThemeAccess: false,
    error: null,
    ...patch,
  };
}

function toThemeInfo(node: {
  id: string;
  name: string;
  role: string;
}): ThemeInfo {
  return {
    id: node.id,
    numericId: themeNumericId(node.id),
    name: node.name,
    role: node.role,
  };
}

function sortThemes(themes: ThemeInfo[]): ThemeInfo[] {
  return [...themes].sort((a, b) => {
    if (a.role === "MAIN" && b.role !== "MAIN") return -1;
    if (b.role === "MAIN" && a.role !== "MAIN") return 1;
    return a.name.localeCompare(b.name);
  });
}

function isAccessDenied(errors: GraphqlError[] | undefined): boolean {
  if (!errors?.length) return false;
  return errors.some((error) => {
    const code = error.extensions?.code?.toUpperCase() ?? "";
    const message = (error.message ?? "").toLowerCase();
    return (
      code.includes("ACCESS") ||
      message.includes("access denied") ||
      message.includes("read_themes") ||
      message.includes("access scope")
    );
  });
}

export async function getThemeIntegrationStatus(
  admin: AdminApiContext,
  apiKey: string,
  selectedThemeId?: string | null,
  options?: { hasReadThemes?: boolean },
): Promise<ThemeIntegrationStatus> {
  if (options?.hasReadThemes === false) {
    return emptyStatus({
      needsThemeAccess: true,
      error:
        "This app needs theme access to list your themes. Click “Grant theme access” to continue.",
    });
  }

  try {
    const themesResponse = await admin.graphql(THEMES_QUERY);
    const themesJson = (await themesResponse.json()) as ThemesResponse;

    if (themesJson.errors?.length) {
      console.error("Themes GraphQL errors:", themesJson.errors);
      if (isAccessDenied(themesJson.errors)) {
        return emptyStatus({
          needsThemeAccess: true,
          error:
            "Theme access is not granted yet. Click “Grant theme access” to continue.",
        });
      }
      return emptyStatus({
        error: themesJson.errors[0]?.message ?? "Could not load themes.",
      });
    }

    const themes = sortThemes(
      (themesJson.data?.themes?.nodes ?? []).map(toThemeInfo),
    );

    if (themes.length === 0) {
      return emptyStatus({
        error: "No themes were returned for this shop.",
      });
    }

    const selected =
      themes.find((theme) => theme.id === selectedThemeId) ??
      themes.find((theme) => theme.role === "MAIN") ??
      themes[0];

    const urls = themeEditorUrls(selected.numericId, apiKey);

    const filesResponse = await admin.graphql(THEME_FILES_QUERY, {
      variables: {
        themeId: selected.id,
        filenames: [
          "config/settings_data.json",
          ...THEME_BLOCK_TEMPLATE_FILES,
        ],
      },
    });

    const filesJson = (await filesResponse.json()) as ThemeFilesResponse;
    if (filesJson.errors?.length) {
      console.error("Theme files GraphQL errors:", filesJson.errors);
    }

    const fileNodes = filesJson.data?.theme?.files?.nodes ?? [];

    const settingsContent = fileNodes.find(
      (file) => file.filename === "config/settings_data.json",
    )?.body?.content;

    const templateContents = THEME_BLOCK_TEMPLATE_FILES.map(
      (filename) =>
        fileNodes.find((file) => file.filename === filename)?.body?.content,
    );

    return {
      theme: selected,
      themes,
      appEmbedActive: isAppEmbedActive(settingsContent, apiKey),
      appBlockCount: countActiveAppBlocks(templateContents, apiKey),
      needsThemeAccess: false,
      error: null,
      ...urls,
    };
  } catch (error) {
    console.error("Failed to load theme integration status:", error);
    return emptyStatus({
      error:
        error instanceof Error
          ? error.message
          : "Could not load theme status.",
    });
  }
}
