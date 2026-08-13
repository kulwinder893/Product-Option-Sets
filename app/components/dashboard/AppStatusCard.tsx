import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { ThemeInfo, ThemeIntegrationStatus } from "../../types/theme";
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

function ThemeSelector({
  themes,
  selected,
}: {
  themes: ThemeInfo[];
  selected: ThemeInfo | null;
}) {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectTheme = (theme: ThemeInfo) => {
    setOpen(false);
    if (theme.id === selected?.id) return;

    const next = new URLSearchParams(searchParams);
    next.set("theme", theme.numericId);
    navigate(`?${next.toString()}`, { replace: true });
  };

  if (themes.length === 0) {
    return (
      <s-stack direction="inline" gap="small-200" alignItems="center">
        <s-text color="subdued">Theme:</s-text>
        <s-text type="strong">No themes found</s-text>
      </s-stack>
    );
  }

  return (
    <div ref={rootRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          border: "1px solid var(--p-color-border, #c9cccf)",
          borderRadius: 8,
          background: "var(--p-color-bg-surface, #fff)",
          cursor: "pointer",
          font: "inherit",
        }}
      >
        <s-text color="subdued">Theme:</s-text>
        <s-text type="strong">{selected?.name ?? "Select theme"}</s-text>
        {selected?.role === "MAIN" ? (
          <s-badge tone="success">Live</s-badge>
        ) : null}
        <s-icon type={open ? "chevron-up" : "chevron-down"} />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Store themes"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 20,
            minWidth: 260,
            maxHeight: 320,
            overflowY: "auto",
            border: "1px solid var(--p-color-border, #c9cccf)",
            borderRadius: 10,
            background: "var(--p-color-bg-surface, #fff)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
            padding: 6,
          }}
        >
          {themes.map((theme) => {
            const isSelected = theme.id === selected?.id;

            return (
              <button
                key={theme.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => selectTheme(theme)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textAlign: "left",
                  padding: "10px 12px",
                  border: "none",
                  borderRadius: 8,
                  background: isSelected
                    ? "var(--p-color-bg-surface-brand-selected, #ebebeb)"
                    : "transparent",
                  cursor: "pointer",
                  font: "inherit",
                }}
              >
                <span style={{ flex: 1 }}>{theme.name}</span>
                {theme.role === "MAIN" ? (
                  <s-badge tone="success">Live</s-badge>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function AppStatusCard({ status }: Props) {
  return (
    <s-section heading="App Status">
      <s-stack direction="block" gap="base">
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <ThemeSelector themes={status.themes} selected={status.theme} />
        </div>

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
