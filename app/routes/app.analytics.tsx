import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function AnalyticsPlaceholder() {
  return (
    <s-page heading="Analytics">
      <s-section>
        <s-banner tone="info">
          Analytics module is planned for a later step.
        </s-banner>
        <s-paragraph>
          Track option usage, revenue add-ons, and popular field selections.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
