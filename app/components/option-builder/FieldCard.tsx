import { useState } from "react";
import type { FieldType } from "@prisma/client";
import { fieldMeta } from "../../constants/field-types";
import type { FieldDraft } from "../../types/field";

type Props = {
  field: FieldDraft;
  index: number;
  isActive: boolean;
  children?: React.ReactNode;
  onSelect: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onAddChild?: (parentId: string) => void;
  onDropField: (sourceId: string, targetIndex: number) => void;
};

export function FieldCard({
  field,
  index,
  isActive,
  children,
  onSelect,
  onToggleCollapse,
  onDuplicate,
  onRemove,
  onAddChild,
  onDropField,
}: Props) {
  const [dragOver, setDragOver] = useState(false);
  const meta = fieldMeta(field.type);
  const isGroup = field.type === ("GROUP" as FieldType);

  const summary = meta.hasChoices
    ? `${meta.label} · ${field.choices.length} choice${field.choices.length === 1 ? "" : "s"}`
    : meta.label;

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", field.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (!dragOver) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragOver(false);
        const sourceId = event.dataTransfer.getData("text/plain");
        if (sourceId && sourceId !== field.id) onDropField(sourceId, index);
      }}
      style={{
        borderTop: dragOver
          ? "2px solid var(--p-color-border-emphasis, #005bd3)"
          : "2px solid transparent",
      }}
    >
      <s-box
        padding="small-200"
        borderWidth="base"
        borderRadius="base"
        background={isActive ? "strong" : "transparent"}
      >
        <s-stack direction="block" gap="small-200">
          <s-stack direction="inline" gap="small-200" alignItems="center">
            <span style={{ cursor: "grab", display: "inline-flex" }} aria-hidden="true">
              <s-icon type="drag-handle" />
            </span>

            <s-clickable
              onClick={() => onSelect(field.id)}
              accessibilityLabel={`Edit ${field.label}`}
            >
              <s-stack direction="inline" gap="small-200" alignItems="center">
                <s-icon type={meta.icon as never} />
                <s-stack direction="block" gap="none">
                  <s-text type="strong">{field.label || meta.label}</s-text>
                  <s-text color="subdued">{summary}</s-text>
                </s-stack>
              </s-stack>
            </s-clickable>

            <div style={{ marginInlineStart: "auto" }}>
              <s-stack direction="inline" gap="small-500" alignItems="center">
                {field.required ? <s-badge tone="critical">Required</s-badge> : null}
                {field.hidden ? <s-badge>Hidden</s-badge> : null}

                <s-button
                  type="button"
                  variant="tertiary"
                  icon={field.collapsed ? "chevron-down" : "chevron-up"}
                  accessibilityLabel={field.collapsed ? "Expand" : "Collapse"}
                  onClick={() => onToggleCollapse(field.id)}
                />
                <s-button
                  type="button"
                  variant="tertiary"
                  icon="duplicate"
                  accessibilityLabel="Duplicate field"
                  onClick={() => onDuplicate(field.id)}
                />
                <s-button
                  type="button"
                  variant="tertiary"
                  tone="critical"
                  icon="delete"
                  accessibilityLabel="Delete field"
                  onClick={() => onRemove(field.id)}
                />
              </s-stack>
            </div>
          </s-stack>

          {isGroup && !field.collapsed ? (
            <s-box paddingInlineStart="base">
              <s-stack direction="block" gap="small-200">
                {children}
                {onAddChild ? (
                  <s-button
                    type="button"
                    variant="tertiary"
                    icon="plus"
                    onClick={() => onAddChild(field.id)}
                  >
                    Add option inside group
                  </s-button>
                ) : null}
              </s-stack>
            </s-box>
          ) : null}
        </s-stack>
      </s-box>
    </div>
  );
}
