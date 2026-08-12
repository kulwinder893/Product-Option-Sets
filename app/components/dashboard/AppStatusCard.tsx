import type { ThemeIntegrationStatus } from "../../types/theme";
import { APP_NAME } from "../../constants";

type Props = {
  status: ThemeIntegrationStatus;
};

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <s-badge tone={active ? "success" : "neutral"}>
      {active ? "Active" : label}
    </s-badge>
  );
}

export function AppStatusCard({ status }: Props) {
  const themeLabel = status.theme?.name ?? "Live theme";

  return (
    <s-section heading="App Status">
      <s-stack direction="block" gap="base">
        <s-stack direction="inline" gap="small-200" alignItems="center">
          <s-text color="subdued">Theme:</s-text>
          <s-text type="strong">{themeLabel}</s-text>
          {status.theme?.role === "MAIN" ? (
            <s-badge tone="success">Live</s-badge>
          ) : null}
        </s-stack>

        <s-grid gridTemplateColumns="1fr 1fr" gap="base">
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="small-200">
              <s-stack
                direction="inline"
                gap="small-200"
                alignItems="center"
              >
                <s-text type="strong">App embed</s-text>
                <StatusBadge
                  active={status.appEmbedActive}
                  label="Inactive"
                />
              </s-stack>

              <s-paragraph>
                To <s-text type="strong">display</s-text> options on your store,
                enable {APP_NAME} in the Theme Editor.
              </s-paragraph>

              <s-stack direction="inline" gap="small-200">
                <s-button
                  href={status.appEmbedEditorUrl}
                  target="_top"
                  variant="primary"
                >
                  Open theme editor
                </s-button>
                <s-button href="/app/help" variant="tertiary">
                  View guide
                </s-button>
              </s-stack>
            </s-stack>
          </s-box>

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="small-200">
              <s-stack
                direction="inline"
                gap="small-200"
                alignItems="center"
              >
                <s-text type="strong">App block (Optional)</s-text>
                <StatusBadge
                  active={status.appBlockCount > 0}
                  label="Inactive"
                />
                <div style={{ marginInlineStart: "auto" }}>
                  <s-text color="subdued">
                    {status.appBlockCount} active block
                    {status.appBlockCount === 1 ? "" : "s"}
                  </s-text>
                </div>
              </s-stack>

              <s-paragraph>
                To <s-text type="strong">reposition</s-text> the option set widget
                on your pages, add the app block.
              </s-paragraph>

              <s-stack direction="inline" gap="small-200">
                <s-button
                  href={status.appBlockEditorUrl}
                  target="_top"
                  variant="primary"
                >
                  Add block
                </s-button>
                <s-button href="/app/help" variant="tertiary">
                  View guide
                </s-button>
              </s-stack>
            </s-stack>
          </s-box>
        </s-grid>
      </s-stack>
    </s-section>
  );
}
