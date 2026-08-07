type Props = {
  onCreate?: () => void;
};

export function OptionSetsEmptyState({ onCreate }: Props) {
  return (
    <s-section>
      <s-box padding="large" borderWidth="base" borderRadius="base" background="subdued">
        <s-stack direction="block" gap="base" alignItems="center">
          <s-heading>No option sets yet</s-heading>
          <s-paragraph>
            Create your first option set to add unlimited custom product options —
            independent of Shopify variants.
          </s-paragraph>
          {onCreate ? (
            <s-button variant="primary" onClick={onCreate}>
              Create option set
            </s-button>
          ) : (
            <s-button variant="primary" href="/app/option-sets?create=1">
              Create option set
            </s-button>
          )}
        </s-stack>
      </s-box>
    </s-section>
  );
}
