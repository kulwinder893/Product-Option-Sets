import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

const FILES_QUERY = `#graphql
  query ChoiceImages($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on MediaImage {
        id
        alt
        image {
          url
          altText
        }
      }
    }
  }
`;

type MediaNode = {
  id?: string;
  alt?: string | null;
  image?: { url?: string | null; altText?: string | null } | null;
};

function normalizeFileId(id: string): string {
  const trimmed = id.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("gid://")) return trimmed;
  return `gid://shopify/MediaImage/${trimmed}`;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const rawIds = String(url.searchParams.get("ids") || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map(normalizeFileId);

  if (rawIds.length === 0) {
    return Response.json({ files: [] });
  }

  const response = await admin.graphql(FILES_QUERY, {
    variables: { ids: rawIds },
  });
  const json = await response.json();
  const nodes = (json.data?.nodes ?? []) as Array<MediaNode | null>;

  const files = nodes
    .filter((node): node is MediaNode => Boolean(node?.image?.url))
    .map((node) => ({
      id: node.id!,
      url: node.image!.url!,
      alt: node.image?.altText || node.alt || null,
    }));

  return Response.json({ files });
};

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
