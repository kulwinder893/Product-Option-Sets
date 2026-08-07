import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function SettingsPlaceholder() {
  return (
    <s-page heading="Settings">
      <s-section>
        <s-banner tone="info">
          Settings module is planned for a later step.
        </s-banner>
        <s-paragraph>
          General settings, theme, currency, translations, custom CSS, and JS.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
