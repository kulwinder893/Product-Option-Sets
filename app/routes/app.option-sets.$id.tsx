import { useEffect, useRef, useState } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData, useRouteError } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import type { FieldType } from "@prisma/client";

import { authenticate } from "../shopify.server";
import { optionBuilderService } from "../services/option-builder.service";
import { useOptionBuilder } from "../hooks/useOptionBuilder";
import {
  AddOptionModal,
  type OverlayModal,
} from "../components/option-builder/AddOptionModal";
import { FieldCard } from "../components/option-builder/FieldCard";
import { FieldSettingsPanel } from "../components/option-builder/FieldSettingsPanel";
import { LivePreview } from "../components/option-builder/LivePreview";
import { ProductAssignmentsEditor } from "../components/option-builder/ProductAssignmentsEditor";
import { AppError } from "../utils/errors";
import { childrenOf } from "../utils/draft";
import type { OptionSetDraft } from "../types/field";

type ActionData = {
  ok: boolean;
  message: string;
  saved?: OptionSetDraft;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const draft = await optionBuilderService.load(session.shop, params.id!);

  if (!draft) {
    throw new Response("Option set not found", { status: 404 });
  }

  return { draft };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  try {
    const payload = String(formData.get("payload") || "");
    if (!payload) {
      throw new AppError("Nothing to save", "VALIDATION_ERROR");
    }

    const draft = JSON.parse(payload) as OptionSetDraft;
    const { saved } = await optionBuilderService.save(
      session.shop,
      params.id!,
      draft,
    );

    return { ok: true, message: "Option set saved", saved } satisfies ActionData;
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, message: error.message } satisfies ActionData;
    }
    if (error instanceof SyntaxError) {
      return { ok: false, message: "Invalid builder payload" } satisfies ActionData;
    }
    console.error("Option set save failed:", error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Could not save the option set. Please try again.";
    return { ok: false, message } satisfies ActionData;
  }
};

export default function OptionSetEditor() {
  const { draft: initialDraft } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionData>();
  const shopify = useAppBridge();

  const builder = useOptionBuilder(initialDraft as OptionSetDraft);
  const addModalRef = useRef<OverlayModal | null>(null);
  /** Parent that a newly picked field is attached to; null means top level. */
  const [addingTo, setAddingTo] = useState<string | null>(null);

  const isSaving = fetcher.state !== "idle";

  const openPicker = (parentId: string | null) => {
    setAddingTo(parentId);
    addModalRef.current?.showOverlay();
  };

  useEffect(() => {
    const data = fetcher.data;
    if (!data || fetcher.state !== "idle") return;

    shopify.toast.show(data.message, { isError: !data.ok });
    if (data.ok && data.saved) builder.commit(data.saved);
    // `builder` is recreated each render; commit is stable via useCallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data, fetcher.state, shopify]);

  const save = () => {
    fetcher.submit(
      { payload: JSON.stringify(builder.draft) },
      { method: "post" },
    );
  };

  const renderFields = (parentId: string | null) =>
    childrenOf(builder.draft.fields, parentId).map((field, index) => (
      <FieldCard
        key={field.id}
        field={field}
        index={index}
        isActive={builder.activeFieldId === field.id}
        onSelect={builder.setActiveFieldId}
        onToggleCollapse={builder.toggleCollapse}
        onDuplicate={builder.duplicateField}
        onRemove={builder.removeField}
        onAddChild={(id) => openPicker(id)}
        onDropField={(sourceId, targetIndex) =>
          builder.moveField(sourceId, targetIndex, parentId)
        }
      >
        {field.type === ("GROUP" as FieldType) ? renderFields(field.id) : null}
      </FieldCard>
    ));

  return (
    <s-page heading={builder.draft.name || "Option set"}>
      <s-button slot="back-action" href="/app/option-sets" icon="arrow-left" />

      <s-button
        slot="primary-action"
        variant="primary"
        type="button"
        {...(isSaving ? { loading: true } : {})}
        {...(builder.dirty ? {} : { disabled: true })}
        onClick={save}
      >
        Save
      </s-button>

      <s-section heading="Option set details">
        <s-stack direction="block" gap="base">
          <s-grid gridTemplateColumns="2fr 1fr" gap="base">
            <s-text-field
              label="Name"
              value={builder.draft.name}
              onInput={(e: Event) =>
                builder.setMeta({
                  name: (e.currentTarget as HTMLInputElement).value,
                })
              }
            />
            <s-stack direction="block" gap="small-500">
              <s-text type="strong">Status</s-text>
              <s-switch
                label={builder.draft.enabled ? "Enabled" : "Disabled"}
                {...(builder.draft.enabled ? { checked: true } : {})}
                onChange={(e: Event) =>
                  builder.setMeta({
                    enabled: (e.currentTarget as HTMLInputElement).checked,
                  })
                }
              />
            </s-stack>
          </s-grid>
        </s-stack>
      </s-section>

      <s-section heading="Custom options">
        <s-stack direction="block" gap="base">
          <s-stack direction="inline" gap="small-200">
            <s-button
              type="button"
              variant="primary"
              icon="plus"
              onClick={() => openPicker(null)}
            >
              Add option
            </s-button>
            {builder.dirty ? <s-badge tone="warning">Unsaved changes</s-badge> : null}
          </s-stack>

          {builder.rootFields.length === 0 ? (
            <s-box
              padding="large"
              borderWidth="base"
              borderRadius="base"
              background="subdued"
            >
              <s-stack direction="block" gap="small-200" alignItems="center">
                <s-text type="strong">No options yet</s-text>
                <s-text color="subdued">
                  Add text boxes, dropdowns, swatches, file uploads and more.
                </s-text>
              </s-stack>
            </s-box>
          ) : (
            <s-stack direction="block" gap="small-200">
              {renderFields(null)}
            </s-stack>
          )}
        </s-stack>
      </s-section>

      {builder.activeField ? (
        <s-section heading="Field settings">
          <FieldSettingsPanel
            field={builder.activeField}
            onUpdate={(patch) =>
              builder.updateField(builder.activeField!.id, patch)
            }
            onAddChoice={() => builder.addChoice(builder.activeField!.id)}
            onUpdateChoice={(choiceId, patch) =>
              builder.updateChoice(builder.activeField!.id, choiceId, patch)
            }
            onRemoveChoice={(choiceId) =>
              builder.removeChoice(builder.activeField!.id, choiceId)
            }
            onMoveChoice={(choiceId, targetIndex) =>
              builder.moveChoice(builder.activeField!.id, choiceId, targetIndex)
            }
          />
        </s-section>
      ) : null}

      <s-section heading="Products">
        <ProductAssignmentsEditor
          mode={builder.draft.assignmentMode}
          products={builder.draft.products}
          conditions={builder.draft.conditions}
          onModeChange={builder.setAssignmentMode}
          onProductsChange={builder.setProducts}
          onRemoveProduct={builder.removeProduct}
          onConditionsChange={builder.setConditions}
        />
      </s-section>

      <s-section slot="aside" heading="Live preview">
        <LivePreview fields={builder.draft.fields} />
      </s-section>

      <s-section slot="aside" heading="Next steps">
        <s-paragraph>
          Save this option set, then enable the storefront app embed to show it
          on the selected products.
        </s-paragraph>
      </s-section>

      <AddOptionModal
        ref={addModalRef}
        onSelect={(type) => builder.addField(type, addingTo)}
      />
    </s-page>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
