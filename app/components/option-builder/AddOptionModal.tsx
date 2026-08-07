import { forwardRef, useState } from "react";
import type { FieldType } from "@prisma/client";
import { FIELD_CATEGORIES, FIELD_TYPES } from "../../constants/field-types";

export type OverlayModal = HTMLElement & {
  showOverlay: () => void;
  hideOverlay: () => void;
};

export const ADD_OPTION_MODAL_ID = "add-option-modal";

type Props = {
  onSelect: (type: FieldType) => void;
};

/**
 * Visibility is driven by the Polaris overlay commands rather than React
 * state: `s-modal` exposes no `onHide` property, so a React-mirrored `open`
 * flag desyncs as soon as the built-in close button is used.
 */
export const AddOptionModal = forwardRef<OverlayModal, Props>(
  function AddOptionModal({ onSelect }, ref) {
    const [query, setQuery] = useState("");

    const term = query.trim().toLowerCase();
    const matches = FIELD_TYPES.filter((meta) =>
      term ? meta.label.toLowerCase().includes(term) : true,
    );

    const choose = (type: FieldType) => {
      onSelect(type);
      setQuery("");
      (ref as React.RefObject<OverlayModal | null>)?.current?.hideOverlay();
    };

    return (
      <s-modal id={ADD_OPTION_MODAL_ID} ref={ref as never} heading="Add option">
        <s-stack direction="block" gap="base">
          <s-search-field
            label="Search field types"
            labelAccessibilityVisibility="exclusive"
            placeholder="Search field types"
            value={query}
            onInput={(e: Event) =>
              setQuery((e.currentTarget as HTMLInputElement).value)
            }
          />

          {FIELD_CATEGORIES.map((category) => {
            const items = matches.filter((meta) => meta.category === category);
            if (items.length === 0) return null;

            return (
              <s-stack key={category} direction="block" gap="small-200">
                <s-text color="subdued">{category}</s-text>
                <s-grid
                  gridTemplateColumns="repeat(auto-fill, minmax(160px, 1fr))"
                  gap="small-200"
                >
                  {items.map((meta) => (
                    <s-clickable
                      key={meta.type}
                      onClick={() => choose(meta.type)}
                      accessibilityLabel={`Add ${meta.label}`}
                    >
                      <s-box
                        padding="small-200"
                        borderWidth="base"
                        borderRadius="base"
                        background="subdued"
                      >
                        <s-stack
                          direction="inline"
                          gap="small-200"
                          alignItems="center"
                        >
                          <s-icon type={meta.icon as never} />
                          <s-text>{meta.label}</s-text>
                        </s-stack>
                      </s-box>
                    </s-clickable>
                  ))}
                </s-grid>
              </s-stack>
            );
          })}

          {matches.length === 0 ? (
            <s-text color="subdued">No field types match “{query}”.</s-text>
          ) : null}
        </s-stack>

        <s-button
          slot="secondary-actions"
          type="button"
          command="--hide"
          commandFor={ADD_OPTION_MODAL_ID}
        >
          Cancel
        </s-button>
      </s-modal>
    );
  },
);
