export type ThemeInfo = {
  id: string;
  numericId: string;
  name: string;
  role: string;
};

export type ThemeIntegrationStatus = {
  theme: ThemeInfo | null;
  appEmbedActive: boolean;
  appBlockCount: number;
  appEmbedEditorUrl: string;
  appBlockEditorUrl: string;
  themeEditorUrl: string;
};
