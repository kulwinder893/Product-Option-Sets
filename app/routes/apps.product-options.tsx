import type { LoaderFunctionArgs } from "react-router";

import { authenticate } from "../shopify.server";
import { storefrontOptionsService } from "../services/storefront-options.service";
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
    return jsonResponse({ optionSets: [], design: null }, 401);
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
