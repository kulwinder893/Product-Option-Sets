import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function HelpPage() {
  return (
    <s-page heading="Help">
      <s-section heading="Storefront setup">
        <s-unordered-list>
          <s-list-item>
            Open the theme editor from Dashboard → App Status → Open theme
            editor, then enable the Product Options app embed and save.
          </s-list-item>
          <s-list-item>
            Optional: add the Product options app block on your product template
            to control exactly where options appear on the page.
          </s-list-item>
          <s-list-item>
            Set the app embed placement to &quot;Only where I add the app
            block&quot; if you rely on the block for positioning.
          </s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section heading="Getting started">
        <s-unordered-list>
          <s-list-item>Create an option set from Option Sets.</s-list-item>
          <s-list-item>Add fields in the Option Builder (next module).</s-list-item>
          <s-list-item>Assign the set to products, collections, and more.</s-list-item>
          <s-list-item>
            Options render on the storefront via Theme App Extension and save as
            line item properties.
          </s-list-item>
        </s-unordered-list>
      </s-section>
      <s-section heading="Need support?">
        <s-paragraph>
          Documentation and support channels will be connected in a later release.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
