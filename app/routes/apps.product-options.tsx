import type { LoaderFunctionArgs } from "react-router";

import { authenticate } from "../shopify.server";
import { storefrontOptionsService } from "../services/storefront-options.service";
import { settingsService } from "../services/settings.service";
import type { StorefrontProductContext } from "../types/storefront";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Shopify's proxy sits in front of this route; keep responses private so
      // one shop's option sets are never served to another.
      "Cache-Control": "private, no-store",
    },
  });
}

function cssResponse(css: string, status = 200) {
  return new Response(css, {
    status,
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      // Short cache so Spacing / Custom CSS updates show up quickly on the storefront.
      "Cache-Control": "public, max-age=30, must-revalidate",
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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const shop = session?.shop ?? url.searchParams.get("shop");
  if (!shop) {
    if (url.searchParams.get("assets") === "design") {
      return cssResponse("/* product-options: missing shop */", 401);
    }
    return jsonResponse({ optionSets: [], design: null }, 401);
  }

  // Theme can <link> this for Spacing / Color / Custom CSS without waiting on JS.
  if (url.searchParams.get("assets") === "design") {
    try {
      const design = await settingsService.getStorefrontDesign(shop);
      return cssResponse(design.css || "/* product-options: empty design */");
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
