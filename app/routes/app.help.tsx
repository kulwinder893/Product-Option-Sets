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
