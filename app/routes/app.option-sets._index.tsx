import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import type { OptionSetStatus } from "@prisma/client";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { authenticate } from "../shopify.server";
import { optionSetService } from "../services/option-set.service";
import { OPTION_SET_STATUS_LABELS } from "../constants";
import { OptionSetsEmptyState } from "../components/option-sets/OptionSetsEmptyState";
import { OptionSetsTable } from "../components/option-sets/OptionSetsTable";
import { PageSkeleton } from "../components/shared/PageSkeleton";
import { AppError } from "../utils/errors";
import type { OptionSetBulkAction, OptionSetSortField } from "../types/option-set";

type OverlayModal = HTMLElement & {
  showOverlay: () => void;
  hideOverlay: () => void;
};

const CREATE_MODAL_ID = "create-option-set-modal";
const DELETE_MODAL_ID = "delete-option-sets-modal";

type ActionData = {
  ok: boolean;
  message: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);

  const query = url.searchParams.get("q")?.trim() || undefined;
  const statusParam = url.searchParams.get("status") || "ALL";
  const sort = (url.searchParams.get("sort") || "updatedAt") as OptionSetSortField;
  const order = (url.searchParams.get("order") || "desc") as "asc" | "desc";
  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 20);
  const showCreate = url.searchParams.get("create") === "1";

  const status =
    statusParam === "ALL" ? "ALL" : (statusParam as OptionSetStatus);

  const result = await optionSetService.list({
    shop: session.shop,
    query,
    status,
    sort,
    order,
    page,
    pageSize,
  });

  return {
    ...result,
    filters: { query: query ?? "", status: statusParam, sort, order, pageSize },
    showCreate,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");

  try {
    switch (intent) {
      case "create": {
        const result = await optionSetService.create(session.shop, {
          name: String(formData.get("name") || ""),
          description: String(formData.get("description") || ""),
        });
        return result satisfies ActionData;
      }
      case "enable":
      case "disable":
      case "archive": {
        const id = String(formData.get("id") || "");
        const statusMap = {
          enable: "ACTIVE",
          disable: "DISABLED",
          archive: "ARCHIVED",
        } as const;
        return await optionSetService.setStatus(
          session.shop,
          id,
          statusMap[intent],
        );
      }
      case "delete": {
        const id = String(formData.get("id") || "");
        return await optionSetService.remove(session.shop, id);
      }
      case "duplicate": {
        const id = String(formData.get("id") || "");
        return await optionSetService.duplicate(session.shop, id);
      }
      case "bulk": {
        const bulkAction = String(formData.get("bulkAction") || "") as OptionSetBulkAction;
        const ids = formData.getAll("ids").map(String);
        return await optionSetService.bulk(session.shop, bulkAction, ids);
      }
      default:
        throw new AppError("Unknown action", "VALIDATION_ERROR");
    }
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, message: error.message } satisfies ActionData;
    }
    console.error(error);
    return {
      ok: false,
      message: "Something went wrong. Please try again.",
    } satisfies ActionData;
  }
};

export default function OptionSetsIndex() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  const shopify = useAppBridge();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(data.filters.query);
  const createModalRef = useRef<OverlayModal | null>(null);
  const deleteModalRef = useRef<OverlayModal | null>(null);

  const isLoading =
    navigation.state === "loading" || navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.message) {
      shopify.toast.show(actionData.message);
      if (actionData.ok) {
        createModalRef.current?.hideOverlay();
        deleteModalRef.current?.hideOverlay();
      }
    }
  }, [actionData, shopify]);

  // Supports deep links such as /app/option-sets?create=1
  useEffect(() => {
    if (data.showCreate) createModalRef.current?.showOverlay();
  }, [data.showCreate]);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams);
      if (!value || (key === "status" && value === "ALL") || (key === "page" && value === "1")) {
        if (key === "status" && value === "ALL") next.delete("status");
        else if (key === "page" && value === "1") next.delete("page");
        else if (!value) next.delete(key);
        else next.set(key, value);
      } else {
        next.set(key, value);
      }
      if (key !== "page") next.delete("page");
      setSearchParams(next, { replace: true, preventScrollReset: true });
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    if (searchTerm === data.filters.query) return;

    const timer = setTimeout(() => updateFilter("q", searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm, data.filters.query, updateFilter]);

  const duplicateOne = (id: string) => {
    const formData = new FormData();
    formData.set("intent", "duplicate");
    formData.set("id", id);
    submit(formData, { method: "post" });
  };

  const toggleId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.length === data.items.length ? [] : data.items.map((item) => item.id),
    );
  };

  const runBulk = (bulkAction: OptionSetBulkAction) => {
    if (selectedIds.length === 0) {
      shopify.toast.show("Select at least one option set");
      return;
    }
    if (bulkAction === "delete") {
      deleteModalRef.current?.showOverlay();
      return;
    }

    submitBulk(bulkAction);
  };

  const submitBulk = (bulkAction: OptionSetBulkAction) => {
    const formData = new FormData();
    formData.set("intent", "bulk");
    formData.set("bulkAction", bulkAction);
    selectedIds.forEach((id) => formData.append("ids", id));
    submit(formData, { method: "post" });
    setSelectedIds([]);
  };

  const paginationLabel = useMemo(() => {
    if (data.total === 0) return "0 option sets";
    const start = (data.page - 1) * data.pageSize + 1;
    const end = Math.min(data.page * data.pageSize, data.total);
    return `${start}–${end} of ${data.total}`;
  }, [data]);

  return (
    <s-page heading="Option Sets">
      <s-button
        slot="primary-action"
        variant="primary"
        command="--show"
        commandFor={CREATE_MODAL_ID}
      >
        Create option set
      </s-button>

      <s-section>
        <s-stack direction="block" gap="base">
          <Form method="get">
            <s-stack direction="inline" gap="base" alignItems="end">
              <s-text-field
                name="q"
                label="Search"
                labelAccessibilityVisibility="exclusive"
                value={searchTerm}
                placeholder="Search option sets"
                onInput={(e: Event) => {
                  const target = e.currentTarget as HTMLInputElement;
                  setSearchTerm(target.value);
                }}
              />
              <s-select
                name="status"
                label="Status"
                labelAccessibilityVisibility="exclusive"
                value={data.filters.status}
                onChange={(e: Event) => {
                  const target = e.currentTarget as HTMLSelectElement;
                  updateFilter("status", target.value);
                }}
              >
                {Object.entries(OPTION_SET_STATUS_LABELS).map(([value, label]) => (
                  <s-option key={value} value={value}>
                    {label}
                  </s-option>
                ))}
              </s-select>
              <s-select
                name="sort"
                label="Sort by"
                labelAccessibilityVisibility="exclusive"
                value={data.filters.sort}
                onChange={(e: Event) => {
                  const target = e.currentTarget as HTMLSelectElement;
                  updateFilter("sort", target.value);
                }}
              >
                <s-option value="updatedAt">Last updated</s-option>
                <s-option value="createdAt">Created</s-option>
                <s-option value="name">Name</s-option>
                <s-option value="priority">Priority</s-option>
                <s-option value="status">Status</s-option>
              </s-select>
              <s-select
                name="order"
                label="Order"
                labelAccessibilityVisibility="exclusive"
                value={data.filters.order}
                onChange={(e: Event) => {
                  const target = e.currentTarget as HTMLSelectElement;
                  updateFilter("order", target.value);
                }}
              >
                <s-option value="desc">Descending</s-option>
                <s-option value="asc">Ascending</s-option>
              </s-select>
            </s-stack>
          </Form>

          {selectedIds.length > 0 ? (
            <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
              <s-stack direction="inline" gap="small" alignItems="center">
                <s-text>{selectedIds.length} selected</s-text>
                <s-button onClick={() => runBulk("enable")}>Enable</s-button>
                <s-button onClick={() => runBulk("disable")}>Disable</s-button>
                <s-button onClick={() => runBulk("archive")}>Archive</s-button>
                <s-button onClick={() => runBulk("duplicate")}>Duplicate</s-button>
                <s-button tone="critical" onClick={() => runBulk("delete")}>
                  Delete
                </s-button>
              </s-stack>
            </s-box>
          ) : null}

          {isLoading && data.items.length === 0 ? (
            <PageSkeleton />
          ) : data.items.length === 0 ? (
            <OptionSetsEmptyState
              onCreate={() => createModalRef.current?.showOverlay()}
            />
          ) : (
            <OptionSetsTable
              items={data.items}
              selectedIds={selectedIds}
              onDuplicate={duplicateOne}
              onToggle={toggleId}
              onToggleAll={toggleAll}
            />
          )}

          {data.totalPages > 1 ? (
            <s-stack direction="inline" gap="base" alignItems="center" justifyContent="space-between">
              <s-text>{paginationLabel}</s-text>
              <s-stack direction="inline" gap="small">
                <s-button
                  disabled={data.page <= 1}
                  onClick={() => updateFilter("page", String(data.page - 1))}
                >
                  Previous
                </s-button>
                <s-text>
                  Page {data.page} of {data.totalPages}
                </s-text>
                <s-button
                  disabled={data.page >= data.totalPages}
                  onClick={() => updateFilter("page", String(data.page + 1))}
                >
                  Next
                </s-button>
              </s-stack>
            </s-stack>
          ) : (
            <s-text tone="neutral">{paginationLabel}</s-text>
          )}
        </s-stack>
      </s-section>

      <s-modal id={CREATE_MODAL_ID} ref={createModalRef as never} heading="Create option set">
        <Form method="post">
          <input type="hidden" name="intent" value="create" />
          <s-stack direction="block" gap="base">
            <s-text-field
              name="name"
              label="Name"
              placeholder="e.g. Engraving options"
              required
              autocomplete="off"
            />
            <s-text-field
              name="description"
              label="Description"
              placeholder="Optional internal description"
              autocomplete="off"
            />
            <s-stack direction="inline" gap="base" justifyContent="end">
              <s-button
                type="button"
                variant="tertiary"
                command="--hide"
                commandFor={CREATE_MODAL_ID}
              >
                Cancel
              </s-button>
              <s-button type="submit" variant="primary" {...(isLoading ? { loading: true } : {})}>
                Create
              </s-button>
            </s-stack>
          </s-stack>
        </Form>
      </s-modal>

      <s-modal id={DELETE_MODAL_ID} ref={deleteModalRef as never} heading="Delete option sets?">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Soft-delete {selectedIds.length} option set
            {selectedIds.length === 1 ? "" : "s"}? This can be restored later
            from archives in a future update.
          </s-paragraph>
          <s-stack direction="inline" gap="base" justifyContent="end">
            <s-button
              type="button"
              variant="tertiary"
              command="--hide"
              commandFor={DELETE_MODAL_ID}
            >
              Cancel
            </s-button>
            <s-button
              type="button"
              tone="critical"
              variant="primary"
              onClick={() => submitBulk("delete")}
            >
              Delete
            </s-button>
          </s-stack>
        </s-stack>
      </s-modal>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
