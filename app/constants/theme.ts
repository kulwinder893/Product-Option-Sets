/** Theme app extension handle (folder name in extensions/). */
export const THEME_EXTENSION_HANDLE = "product-options";

/** App embed block file handle in the theme extension. */
export const THEME_APP_EMBED_HANDLE = "app-embed";

/** App block file handle for manual placement on product templates. */
export const THEME_APP_BLOCK_HANDLE = "product-options";

/** Template files scanned for active app blocks. */
export const THEME_BLOCK_TEMPLATE_FILES = [
  "templates/product.json",
  "templates/product.quick-view.json",
  "templates/product.pre-order.json",
] as const;
