import { APP_NAME } from "../../constants";
import type { ThemeIntegrationStatus } from "../../types/theme";

type Props = {
  themeStatus: ThemeIntegrationStatus;
  optionSetCount: number;
};

type Step = {
  id: string;
  title: string;
  description: string;
  complete: boolean;
  primaryAction?: {
    label: string;
    href: string;
    external?: boolean;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
};

function ProgressBar({ value }: { value: number }) {
  const percent = Math.max(0, Math.min(100, value * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        height: 8,
        borderRadius: 4,
        background: "var(--p-color-bg-fill-tertiary, #e3e3e3)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          height: "100%",
          background: "var(--p-color-bg-fill-brand, #303030)",
          transition: "width 0.2s ease",
        }}
      />
    </div>
  );
}

function StepRow({ step, index }: { step: Step; index: number }) {
  return (
    <s-box padding="base" borderWidth="base" borderRadius="base">
      <s-grid gridTemplateColumns="auto 1fr" gap="base" alignItems="start">
        <div
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: step.complete
              ? "2px solid var(--p-color-border-success, #29845a)"
              : "2px dashed var(--p-color-border, #c9cccf)",
            display: "grid",
            placeItems: "center",
            fontSize: 12,
            fontWeight: 600,
            color: step.complete
              ? "var(--p-color-text-success, #29845a)"
              : "var(--p-color-text-subdued, #616161)",
          }}
        >
          {step.complete ? "✓" : index + 1}
        </div>

        <s-stack direction="block" gap="small-200">
          <s-text type="strong">{step.title}</s-text>
          <s-paragraph>{step.description}</s-paragraph>

          {step.primaryAction || step.secondaryAction ? (
            <s-stack direction="inline" gap="small-200" alignItems="center">
              {step.primaryAction ? (
                <s-button
                  href={step.primaryAction.href}
                  {...(step.primaryAction.external ? { target: "_top" } : {})}
                  variant="primary"
                  icon={step.primaryAction.external ? "play" : undefined}
                >
                  {step.primaryAction.label}
                </s-button>
              ) : null}
              {step.secondaryAction ? (
                <s-button href={step.secondaryAction.href} variant="tertiary">
                  {step.secondaryAction.label}
                </s-button>
              ) : null}
            </s-stack>
          ) : null}
        </s-stack>
      </s-grid>
    </s-box>
  );
}

export function OnboardingCard({ themeStatus, optionSetCount }: Props) {
  const steps: Step[] = [
    {
      id: "enable-embed",
      title: `Enable ${APP_NAME} on your live theme`,
      description:
        "Activation is required for product options to appear on your storefront.",
      complete: themeStatus.appEmbedActive,
      primaryAction: {
        label: "Activate app",
        href: themeStatus.appEmbedEditorUrl,
        external: true,
      },
      secondaryAction: {
        label: "Learn more",
        href: "/app/help",
      },
    },
    {
      id: "create-option-set",
      title: "Create your first option set",
      description:
        "Build custom fields, assign products, and publish options to your store.",
      complete: optionSetCount > 0,
      primaryAction: optionSetCount
        ? undefined
        : {
            label: "Create option set",
            href: "/app/option-sets?create=1",
          },
      secondaryAction: optionSetCount
        ? {
            label: "View option sets",
            href: "/app/option-sets",
          }
        : undefined,
    },
  ];

  const completedCount = steps.filter((step) => step.complete).length;
  const progress = completedCount / steps.length;

  return (
    <s-section heading="Get Started in 2 Easy Steps">
      <s-stack direction="block" gap="base">
        <s-stack direction="block" gap="small-200">
          <s-text color="subdued">
            You&apos;ve done {completedCount} of {steps.length} steps
          </s-text>
          <ProgressBar value={progress} />
        </s-stack>

        <s-stack direction="block" gap="small-200">
          {steps.map((step, index) => (
            <StepRow key={step.id} step={step} index={index} />
          ))}
        </s-stack>
      </s-stack>
    </s-section>
  );
}
