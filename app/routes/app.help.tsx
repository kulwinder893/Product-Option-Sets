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
          Product Options saves choices as <strong>line item properties</strong> on the order
          (for example <code>Color swatch: Red</code>). They are <strong>not</strong> part of
          the Shopify variant title — the email must loop <code>line.properties</code> under
          each product.
        </s-paragraph>
        <s-ordered-list>
          <s-list-item>
            Confirm data exists: Shopify admin → <strong>Orders</strong> → open a test order
            → under the line item you should see property rows (not only variant size/color).
          </s-list-item>
          <s-list-item>
            Go to <strong>Settings → Notifications → Order confirmation → Edit code</strong>.
          </s-list-item>
          <s-list-item>
            Delete any code you added <strong>after</strong> <code>&lt;/html&gt;</code> — it
            never renders in the email.
          </s-list-item>
          <s-list-item>
            Search for <code>line.gift_card and line.properties</code>. Shopify wraps property
            output in a gift-card-only <code>{`{% if %}`}</code>. Replace that whole block
            (3 times for <code>line</code>, 1 time for <code>component</code>) with the snippet
            below so properties show for every product.
          </s-list-item>
          <s-list-item>Save, then place a new test order and preview the notification.</s-list-item>
        </s-ordered-list>
        <s-box padding="base" background="subdued" borderRadius="base">
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: "12px" }}>{`{% comment %} Product Options — show line item properties {% endcomment %}
{% for property in line.properties %}
  {% assign property_first_char = property.first | slice: 0 %}
  {% if property.last != blank and property_first_char != '_' %}
    <div class="order-list__item-property">
      <dt>{% assign label = property.first | strip %}{% if label != blank %}{{ label }}{% else %}Option{% endif %}:</dt>
      <dd>
        {% if property.last contains '/uploads/' %}
          <a href="{{ property.last }}" class="link" target="_blank">{{ property.last | split: '/' | last }}</a>
        {% else %}
          {{ property.last }}
        {% endif %}
      </dd>
    </div>
  {% endif %}
{% endfor %}`}</pre>
        </s-box>
        <s-paragraph>
          For blocks that use <code>component</code> instead of <code>line</code>, use the same
          snippet but replace <code>line.properties</code> with{" "}
          <code>component.properties</code>. Skip keys starting with <code>_</code> (includes
          internal <code>_po_fields</code>).
        </s-paragraph>
        <s-paragraph>
          If the order page shows properties but email still does not, the snippet is in the
          wrong line-item section — search all <code>selling_plan_allocation</code> blocks and
          paste the loop just above each one.
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
