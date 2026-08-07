import { useCallback, useMemo, useState } from "react";
import type { FieldType } from "@prisma/client";
import type {
  AssignmentMode,
  ChoiceDraft,
  FieldDraft,
  OptionSetDraft,
  ProductAssignmentDraft,
  ProductCondition,
} from "../types/field";
import {
  childrenOf,
  cloneField,
  createChoice,
  createField,
  resequence,
  withDescendants,
} from "../utils/draft";

export function useOptionBuilder(initial: OptionSetDraft) {
  const [draft, setDraft] = useState<OptionSetDraft>(initial);
  const [dirty, setDirty] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(
    initial.fields[0]?.id ?? null,
  );

  const mutate = useCallback(
    (updater: (current: OptionSetDraft) => OptionSetDraft) => {
      setDraft((current) => updater(current));
      setDirty(true);
    },
    [],
  );

  const setMeta = useCallback(
    (patch: Partial<Pick<OptionSetDraft, "name" | "description" | "enabled">>) => {
      mutate((current) => ({ ...current, ...patch }));
    },
    [mutate],
  );

  const setAssignmentMode = useCallback(
    (assignmentMode: AssignmentMode) => {
      mutate((current) => ({ ...current, assignmentMode }));
    },
    [mutate],
  );

  const setProducts = useCallback(
    (products: ProductAssignmentDraft[]) => {
      mutate((current) => ({ ...current, products }));
    },
    [mutate],
  );

  const removeProduct = useCallback(
    (productGid: string) => {
      mutate((current) => ({
        ...current,
        products: current.products.filter(
          (product) => product.productGid !== productGid,
        ),
      }));
    },
    [mutate],
  );

  const setConditions = useCallback(
    (conditions: ProductCondition[]) => {
      mutate((current) => ({ ...current, conditions }));
    },
    [mutate],
  );

  const addField = useCallback(
    (type: FieldType, parentId: string | null = null) => {
      let createdId = "";

      mutate((current) => {
        const siblings = childrenOf(current.fields, parentId);
        const field = createField(type, siblings.length, parentId);
        createdId = field.id;
        return { ...current, fields: [...current.fields, field] };
      });

      if (createdId) setActiveFieldId(createdId);
    },
    [mutate],
  );

  const updateField = useCallback(
    (id: string, patch: Partial<FieldDraft>) => {
      mutate((current) => ({
        ...current,
        fields: current.fields.map((field) =>
          field.id === id ? { ...field, ...patch } : field,
        ),
      }));
    },
    [mutate],
  );

  const duplicateField = useCallback(
    (id: string) => {
      mutate((current) => {
        const source = current.fields.find((field) => field.id === id);
        if (!source) return current;

        const siblings = childrenOf(current.fields, source.parentId);
        const copy = cloneField(source, siblings.length);
        return { ...current, fields: resequence([...current.fields, copy]) };
      });
    },
    [mutate],
  );

  const removeField = useCallback(
    (id: string) => {
      mutate((current) => {
        const doomed = withDescendants(current.fields, id);
        return {
          ...current,
          fields: resequence(
            current.fields.filter((field) => !doomed.has(field.id)),
          ),
        };
      });

      setActiveFieldId((currentId) => (currentId === id ? null : currentId));
    },
    [mutate],
  );

  const toggleCollapse = useCallback(
    (id: string) => {
      mutate((current) => ({
        ...current,
        fields: current.fields.map((field) =>
          field.id === id ? { ...field, collapsed: !field.collapsed } : field,
        ),
      }));
    },
    [mutate],
  );

  /** Reorders `sourceId` to sit at `targetIndex` within its parent scope. */
  const moveField = useCallback(
    (sourceId: string, targetIndex: number, parentId: string | null) => {
      mutate((current) => {
        const siblings = childrenOf(current.fields, parentId);
        const from = siblings.findIndex((field) => field.id === sourceId);
        if (from === -1) return current;

        const reordered = [...siblings];
        const [moved] = reordered.splice(from, 1);
        reordered.splice(Math.max(0, Math.min(targetIndex, reordered.length)), 0, moved);

        const orderById = new Map(
          reordered.map((field, index) => [field.id, index]),
        );

        return {
          ...current,
          fields: current.fields.map((field) =>
            orderById.has(field.id)
              ? { ...field, sortOrder: orderById.get(field.id)! }
              : field,
          ),
        };
      });
    },
    [mutate],
  );

  const addChoice = useCallback(
    (fieldId: string) => {
      mutate((current) => ({
        ...current,
        fields: current.fields.map((field) =>
          field.id === fieldId
            ? { ...field, choices: [...field.choices, createChoice(field.choices.length)] }
            : field,
        ),
      }));
    },
    [mutate],
  );

  const updateChoice = useCallback(
    (fieldId: string, choiceId: string, patch: Partial<ChoiceDraft>) => {
      mutate((current) => ({
        ...current,
        fields: current.fields.map((field) =>
          field.id === fieldId
            ? {
                ...field,
                choices: field.choices.map((choice) =>
                  choice.id === choiceId ? { ...choice, ...patch } : choice,
                ),
              }
            : field,
        ),
      }));
    },
    [mutate],
  );

  const removeChoice = useCallback(
    (fieldId: string, choiceId: string) => {
      mutate((current) => ({
        ...current,
        fields: current.fields.map((field) =>
          field.id === fieldId
            ? {
                ...field,
                choices: field.choices
                  .filter((choice) => choice.id !== choiceId)
                  .map((choice, index) => ({ ...choice, sortOrder: index })),
              }
            : field,
        ),
      }));
    },
    [mutate],
  );

  const moveChoice = useCallback(
    (fieldId: string, choiceId: string, targetIndex: number) => {
      mutate((current) => ({
        ...current,
        fields: current.fields.map((field) => {
          if (field.id !== fieldId) return field;

          const from = field.choices.findIndex((choice) => choice.id === choiceId);
          if (from === -1) return field;

          const reordered = [...field.choices];
          const [moved] = reordered.splice(from, 1);
          reordered.splice(
            Math.max(0, Math.min(targetIndex, reordered.length)),
            0,
            moved,
          );

          return {
            ...field,
            choices: reordered.map((choice, index) => ({
              ...choice,
              sortOrder: index,
            })),
          };
        }),
      }));
    },
    [mutate],
  );

  /** Re-syncs after a successful save so temp ids become database ids. */
  const commit = useCallback((next: OptionSetDraft) => {
    setDraft(next);
    setDirty(false);
    setActiveFieldId((currentId) =>
      next.fields.some((field) => field.id === currentId) ? currentId : null,
    );
  }, []);

  const reset = useCallback(() => {
    setDraft(initial);
    setDirty(false);
  }, [initial]);

  const rootFields = useMemo(
    () => childrenOf(draft.fields, null),
    [draft.fields],
  );

  const activeField = useMemo(
    () => draft.fields.find((field) => field.id === activeFieldId) ?? null,
    [draft.fields, activeFieldId],
  );

  return {
    draft,
    dirty,
    rootFields,
    activeField,
    activeFieldId,
    setActiveFieldId,
    setMeta,
    setAssignmentMode,
    setProducts,
    removeProduct,
    setConditions,
    addField,
    updateField,
    duplicateField,
    removeField,
    toggleCollapse,
    moveField,
    addChoice,
    updateChoice,
    removeChoice,
    moveChoice,
    commit,
    reset,
  };
}

export type OptionBuilder = ReturnType<typeof useOptionBuilder>;
