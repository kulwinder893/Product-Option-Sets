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
      <s-section heading="Order confirmation emails">
        <s-paragraph>
          Product Options saves shopper choices as <strong>line item properties</strong> (for
          example <code>Color swatch: Red</code>). Shopify&apos;s default Order confirmation
          email only prints properties for gift cards — you need to add a small Liquid block
          so custom options appear under each product.
        </s-paragraph>
        <s-ordered-list>
          <s-list-item>
            In Shopify admin go to <strong>Settings → Notifications</strong>.
          </s-list-item>
          <s-list-item>
            Open <strong>Order confirmation</strong> → <strong>Edit code</strong>.
          </s-list-item>
          <s-list-item>
            Search for <code>order-list__item-variant</code> (there are several copies in
            the file — add the snippet in each line-item block, right after the variant title
            lines and before <code>selling_plan_allocation</code>).
          </s-list-item>
          <s-list-item>
            Paste the snippet below, save, and send yourself a test order.
          </s-list-item>
        </s-ordered-list>
        <s-box padding="base" background="subdued" borderRadius="base">
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: "12px" }}>{`{% for property in line.properties %}
  {% assign property_first_char = property.first | slice: 0 %}
  {% if property.last != blank and property_first_char != '_' %}
    <span class="order-list__item-variant">
      {% assign label = property.first | strip %}
      {% if label != blank %}{{ label }}: {% endif %}{{ property.last }}
    </span><br/>
  {% endif %}
{% endfor %}`}</pre>
        </s-box>
        <s-paragraph>
          Properties whose names start with <code>_</code> (including the app&apos;s internal{" "}
          <code>_po_fields</code> key) are skipped so only shopper-facing options show.
        </s-paragraph>
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
