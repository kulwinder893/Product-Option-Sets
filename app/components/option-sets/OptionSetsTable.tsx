import type { OptionSetListItem } from "../../types/option-set";
import { OptionSetStatusBadge } from "./OptionSetStatusBadge";

type Props = {
  items: OptionSetListItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onDuplicate: (id: string) => void;
};

function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function OptionSetsTable({
  items,
  selectedIds,
  onToggle,
  onToggleAll,
  onDuplicate,
}: Props) {
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <s-box borderWidth="base" borderRadius="base" overflow="hidden">
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.875rem",
        }}
      >
        <thead>
          <tr style={{ background: "var(--p-color-bg-surface-secondary, #f6f6f7)" }}>
            <th style={{ padding: "12px 16px", textAlign: "left", width: 40 }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Select all option sets"
              />
            </th>
            <th style={{ padding: "12px 16px", textAlign: "left" }}>Name</th>
            <th style={{ padding: "12px 16px", textAlign: "left" }}>Status</th>
            <th style={{ padding: "12px 16px", textAlign: "left" }}>Fields</th>
            <th style={{ padding: "12px 16px", textAlign: "left" }}>Assignments</th>
            <th style={{ padding: "12px 16px", textAlign: "left" }}>Updated</th>
            <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const assignmentCount =
              item._count.productAssignments + item._count.collectionAssignments;
            const checked = selectedIds.includes(item.id);

            return (
              <tr
                key={item.id}
                style={{
                  borderTop: "1px solid var(--p-color-border, #e1e3e5)",
                }}
              >
                <td style={{ padding: "12px 16px" }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(item.id)}
                    aria-label={`Select ${item.name}`}
                  />
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <s-stack direction="block" gap="none">
                    <s-link href={`/app/option-sets/${item.id}`}>
                      <strong>{item.name}</strong>
                    </s-link>
                    {item.description ? (
                      <s-text tone="neutral">{item.description}</s-text>
                    ) : null}
                  </s-stack>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <OptionSetStatusBadge status={item.status} />
                </td>
                <td style={{ padding: "12px 16px" }}>{item._count.fields}</td>
                <td style={{ padding: "12px 16px" }}>{assignmentCount}</td>
                <td style={{ padding: "12px 16px" }}>{formatDate(item.updatedAt)}</td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <s-stack direction="inline" gap="small" justifyContent="end">
                    <s-button
                      href={`/app/option-sets/${item.id}`}
                      variant="tertiary"
                    >
                      Edit
                    </s-button>
                    <s-button
                      type="button"
                      variant="tertiary"
                      onClick={() => onDuplicate(item.id)}
                    >
                      Duplicate
                    </s-button>
                  </s-stack>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </s-box>
  );
}
