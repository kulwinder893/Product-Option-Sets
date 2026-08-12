import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import { THEME_BLOCK_TEMPLATE_FILES } from "../constants/theme";
import type { ThemeIntegrationStatus } from "../types/theme";
import {
  countActiveAppBlocks,
  isAppEmbedActive,
  themeEditorUrls,
  themeNumericId,
} from "../utils/theme-files";

const MAIN_THEME_QUERY = `#graphql
  query DashboardMainTheme {
    themes(first: 1, roles: [MAIN]) {
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

type MainThemeResponse = {
  data?: {
    themes?: {
      nodes?: Array<{
        id: string;
        name: string;
        role: string;
      }>;
    };
  };
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
};

function emptyStatus(): ThemeIntegrationStatus {
  return {
    theme: null,
    appEmbedActive: false,
    appBlockCount: 0,
    appEmbedEditorUrl: "shopify://admin/themes/current/editor?context=apps",
    appBlockEditorUrl:
      "shopify://admin/themes/current/editor?template=product",
    themeEditorUrl: "shopify://admin/themes/current/editor",
  };
}

export async function getThemeIntegrationStatus(
  admin: AdminApiContext,
  apiKey: string,
): Promise<ThemeIntegrationStatus> {
  try {
    const themeResponse = await admin.graphql(MAIN_THEME_QUERY);
    const themeJson = (await themeResponse.json()) as MainThemeResponse;
    const themeNode = themeJson.data?.themes?.nodes?.[0];

    if (!themeNode) return emptyStatus();

    const numericId = themeNumericId(themeNode.id);
    const urls = themeEditorUrls(numericId, apiKey);

    const filesResponse = await admin.graphql(THEME_FILES_QUERY, {
      variables: {
        themeId: themeNode.id,
        filenames: [
          "config/settings_data.json",
          ...THEME_BLOCK_TEMPLATE_FILES,
        ],
      },
    });

    const filesJson = (await filesResponse.json()) as ThemeFilesResponse;
    const fileNodes = filesJson.data?.theme?.files?.nodes ?? [];

    const settingsContent = fileNodes.find(
      (file) => file.filename === "config/settings_data.json",
    )?.body?.content;

    const templateContents = THEME_BLOCK_TEMPLATE_FILES.map(
      (filename) =>
        fileNodes.find((file) => file.filename === filename)?.body?.content,
    );

    return {
      theme: {
        id: themeNode.id,
        numericId,
        name: themeNode.name,
        role: themeNode.role,
      },
      appEmbedActive: isAppEmbedActive(settingsContent, apiKey),
      appBlockCount: countActiveAppBlocks(templateContents, apiKey),
      ...urls,
    };
  } catch (error) {
    console.error("Failed to load theme integration status:", error);
    return emptyStatus();
  }
}
