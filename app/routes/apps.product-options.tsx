import { readFile } from "node:fs/promises";
import path from "node:path";
import type { LoaderFunctionArgs } from "react-router";

import { authenticate } from "../shopify.server";
import { storefrontOptionsService } from "../services/storefront-options.service";
import { settingsService } from "../services/settings.service";
import type { StorefrontProductContext } from "../types/storefront";

/** Card styles also shipped via design.css so add-on cards look right even if
 *  the theme-extension stylesheet is stale. */
const PRODUCT_CARD_CSS = `
.product-options__addon-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px}
.product-options__product-card{position:relative;display:flex;flex-direction:column;gap:8px;margin:0;padding:10px;border:1px solid var(--product-options-border,#d9e2ec);border-radius:12px;background:#fff;cursor:pointer}
.product-options__product-card.is-selected,.product-options__product-card:has(.product-options__product-card-check:checked){border-color:var(--product-options-accent,#1a1a1a);box-shadow:0 0 0 1px var(--product-options-accent,#1a1a1a)}
.product-options__product-card-check{position:absolute;top:12px;right:12px;z-index:2;width:18px;height:18px;margin:0}
.product-options__product-card-media{display:block;width:100%;aspect-ratio:1;border-radius:8px;background-color:#f4f4f5;background-size:cover;background-position:center}
.product-options__product-card-media.is-empty{background-image:linear-gradient(45deg,rgba(0,0,0,.06) 25%,transparent 25%,transparent 75%,rgba(0,0,0,.06) 75%);background-size:12px 12px}
.product-options__product-card-body{display:flex;flex-direction:column;gap:4px;min-width:0}
.product-options__product-card-title{display:-webkit-box;overflow:hidden;font-size:.85rem;font-weight:600;line-height:1.3;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.product-options__product-card-price{font-size:.9rem;font-weight:700}
.product-options__product-card-price.is-muted{color:#6b7280;font-size:.75rem;font-weight:500}
.product-options__product-card-qty{width:100%;min-height:34px!important;padding:4px 8px;font-size:.85rem}
/* Older theme JS renders product picker as checkboxes — make those look like rows */
.product-options__field:has([data-product-options-field]) .product-options__choices,
.product-options__choices{display:grid;gap:10px}
.product-options__choice{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--product-options-border,#d9e2ec);border-radius:10px;background:#fff;cursor:pointer}
.product-options__choice:has(:checked){border-color:var(--product-options-accent,#1a1a1a);box-shadow:0 0 0 1px var(--product-options-accent,#1a1a1a)}
.product-options__choice-label{font-weight:600;line-height:1.3}
`.trim();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}

function cssResponse(css: string, status = 200) {
  return new Response(css, {
    status,
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "public, max-age=30, must-revalidate",
    },
  });
}

function jsResponse(js: string, status = 200) {
  return new Response(js, {
    status,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=60, must-revalidate",
    },
  });
}

function readProductContext(url: URL): StorefrontProductContext | null {
  const productId = url.searchParams.get("product_id")?.trim();
  if (!productId) return null;

  const tags = url.searchParams.get("tags") ?? "";

  return {
    productId,
    handle: url.searchParams.get("handle") ?? "",
    title: url.searchParams.get("title") ?? "",
    vendor: url.searchParams.get("vendor") ?? "",
    productType: url.searchParams.get("product_type") ?? "",
    tags: tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

async function readExtensionAsset(filename: string) {
  const assetPath = path.join(
    process.cwd(),
    "extensions",
    "product-options",
    "assets",
    filename,
  );
  return readFile(assetPath, "utf8");
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const asset = url.searchParams.get("assets");

  // Static storefront assets — no shop session required (HMAC still applied by
  // Shopify's proxy when requested from the shop domain).
  if (asset === "js") {
    try {
      return jsResponse(await readExtensionAsset("product-options.js"));
    } catch (error) {
      console.error("Storefront JS asset failed:", error);
      return jsResponse("console.warn('[product-options] script missing');", 500);
    }
  }

  if (asset === "css") {
    try {
      const base = await readExtensionAsset("product-options.css");
      return cssResponse(`${base}\n${PRODUCT_CARD_CSS}`);
    } catch (error) {
      console.error("Storefront CSS asset failed:", error);
      return cssResponse(PRODUCT_CARD_CSS, 500);
    }
  }

  const { session } = await authenticate.public.appProxy(request);
  const shop = session?.shop ?? url.searchParams.get("shop");

  if (!shop) {
    if (asset === "design") {
      return cssResponse("/* product-options: missing shop */", 401);
    }
    return jsonResponse({ optionSets: [], design: null }, 401);
  }

  if (asset === "design") {
    try {
      const design = await settingsService.getStorefrontDesign(shop);
      return cssResponse(
        `${design.css || ""}\n/* product picker cards */\n${PRODUCT_CARD_CSS}`,
      );
    } catch (error) {
      console.error("Storefront design CSS failed:", error);
      return cssResponse("/* product-options: design error */", 500);
    }
  }

  const product = readProductContext(url);
  if (!product) {
    return jsonResponse({ optionSets: [], design: null });
  }

  try {
    const payload = await storefrontOptionsService.getForProduct(shop, product);
    return jsonResponse(payload);
  } catch (error) {
    console.error("Storefront option lookup failed:", error);
    return jsonResponse({ optionSets: [], design: null }, 500);
  }
};
