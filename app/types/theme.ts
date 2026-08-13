export type ThemeInfo = {
  id: string;
  numericId: string;
  name: string;
  role: string;
};

export type ThemeIntegrationStatus = {
  theme: ThemeInfo | null;
  themes: ThemeInfo[];
  appEmbedActive: boolean;
  appBlockCount: number;
  appEmbedEditorUrl: string;
  appBlockEditorUrl: string;
  themeEditorUrl: string;
  /** True when the shop has not granted read_themes yet. */
  needsThemeAccess: boolean;
  /** Human-readable reason when themes cannot be loaded. */
  error: string | null;
};
