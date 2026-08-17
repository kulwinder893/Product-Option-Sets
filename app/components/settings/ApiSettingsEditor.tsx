export function ApiSettingsEditor() {
  return (
    <div className="osp-card">
      <s-stack direction="block" gap="base">
        <s-heading>Storefront app proxy</s-heading>
        <s-paragraph>
          Option sets are loaded on the product page through the Shopify app proxy.
          Keep the Product Options app embed enabled so the storefront script can call:
        </s-paragraph>
        <s-text type="strong">/apps/product-options</s-text>
        <s-paragraph>
          That endpoint returns option sets plus App Design CSS, fonts, translations, and
          advanced settings. No extra API key is required for the storefront widget.
        </s-paragraph>
        <s-heading>Theme editor deep links</s-heading>
        <s-paragraph>
          Use Dashboard → App Status to open the theme editor and enable the app embed
          or add the Product options block.
        </s-paragraph>
      </s-stack>
    </div>
  );
}
