import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { optionSetService } from "../services/option-set.service";
import { getThemeIntegrationStatus } from "../services/theme-status.service";
import { AppStatusCard } from "../components/dashboard/AppStatusCard";
import { OnboardingCard } from "../components/dashboard/OnboardingCard";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const apiKey = process.env.SHOPIFY_API_KEY ?? "";
  const url = new URL(request.url);
  const selectedThemeParam = url.searchParams.get("theme");
  const selectedThemeId = selectedThemeParam
    ? selectedThemeParam.startsWith("gid://")
      ? selectedThemeParam
      : `gid://shopify/OnlineStoreTheme/${selectedThemeParam}`
    : null;

  const [stats, themeStatus] = await Promise.all([
    optionSetService.dashboardStats(session.shop),
    getThemeIntegrationStatus(admin, apiKey, selectedThemeId),
  ]);

  return { stats, themeStatus };
};

export default function Dashboard() {
  const { stats, themeStatus } = useLoaderData<typeof loader>();

  return (
    <s-page heading="Dashboard">
      <s-button slot="primary-action" variant="primary" href="/app/option-sets?create=1">
        Create option set
      </s-button>

      <AppStatusCard status={themeStatus} />
      <OnboardingCard themeStatus={themeStatus} optionSetCount={stats.total} />

      <s-section heading="Overview">
        <s-paragraph>
          Manage unlimited product option sets independent of Shopify variants.
        </s-paragraph>
      </s-section>

      <s-section>
        <s-stack direction="inline" gap="base">
          <StatCard label="Total option sets" value={stats.total} />
          <StatCard label="Active" value={stats.active} />
          <StatCard label="Disabled" value={stats.disabled} />
          <StatCard label="Archived" value={stats.archived} />
        </s-stack>
      </s-section>

      <s-section heading="Quick actions">
        <s-stack direction="inline" gap="base">
          <s-button href="/app/option-sets">View option sets</s-button>
          <s-button href="/app/assignments" variant="tertiary">
            Manage assignments
          </s-button>
          <s-button href="/app/settings" variant="tertiary">
            Settings
          </s-button>
        </s-stack>
      </s-section>
    </s-page>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <s-box
      padding="base"
      borderWidth="base"
      borderRadius="base"
      background="subdued"
      minInlineSize="140px"
    >
      <s-stack direction="block" gap="small">
        <s-text tone="neutral">{label}</s-text>
        <s-heading>{value}</s-heading>
      </s-stack>
    </s-box>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
