import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function AssignmentsPlaceholder() {
  return (
    <s-page heading="Assignments">
      <s-section>
        <s-banner tone="info">
          Assignments module comes next — products, collections, vendors, tags,
          and product types.
        </s-banner>
        <s-paragraph>
          You will be able to attach multiple option sets to the same product.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
