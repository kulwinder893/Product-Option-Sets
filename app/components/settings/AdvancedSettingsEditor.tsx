import type { AdvancedSettings, SettingsEditorProps } from "../../types/app-design";

export function AdvancedSettingsEditor({ settings, onChange }: SettingsEditorProps) {
  const advanced = settings.advanced;

  const patch = (next: Partial<AdvancedSettings>) => {
    onChange({ ...settings, advanced: { ...advanced, ...next } });
  };

  return (
    <div className="osp-card">
      <s-stack direction="block" gap="base">
        <s-checkbox
          label="Show total additional price"
          {...(advanced.showTotal ? { checked: true } : {})}
          onChange={(event: Event) =>
            patch({ showTotal: (event.currentTarget as HTMLInputElement).checked })
          }
        />
        <s-checkbox
          label="Show price add-ons next to options"
          {...(advanced.showPriceAddons ? { checked: true } : {})}
          onChange={(event: Event) =>
            patch({ showPriceAddons: (event.currentTarget as HTMLInputElement).checked })
          }
        />
        <s-checkbox
          label="Include product price in the total"
          {...(advanced.totalIncludesProductPrice ? { checked: true } : {})}
          onChange={(event: Event) =>
            patch({
              totalIncludesProductPrice: (event.currentTarget as HTMLInputElement).checked,
            })
          }
        />
        <s-checkbox
          label="Hide out-of-stock option values"
          {...(advanced.hideOutOfStock ? { checked: true } : {})}
          onChange={(event: Event) =>
            patch({ hideOutOfStock: (event.currentTarget as HTMLInputElement).checked })
          }
        />
        <s-text-field
          label="Custom Add to cart button text"
          details="Leave empty to keep the theme's default button label."
          value={advanced.addToCartText}
          onInput={(event: Event) =>
            patch({ addToCartText: (event.currentTarget as HTMLInputElement).value })
          }
        />
      </s-stack>
    </div>
  );
}
