"use client";

import { useCallback, useState } from "react";
import type { FilterFieldDefinition, FilterGroup, FilterNode, FilterState, FilterValue, OperatorType } from "../types";

// ===== Tree Helpers =====

function createEmptyGroup(): FilterGroup {
  return { id: crypto.randomUUID(), conjunction: "and", children: [] };
}

function createEmptyRow(): FilterNode {
  return { type: "row", row: { id: crypto.randomUUID(), field: null, operator: null, value: null } };
}

function createEmptyGroupNode(): FilterNode {
  return { type: "group", group: createEmptyGroup() };
}

/** Recursively update a node in the tree by its id */
function updateNodeInGroup(
  group: FilterGroup,
  targetId: string,
  updater: (node: FilterNode) => FilterNode,
): FilterGroup {
  return {
    ...group,
    children: group.children.map((child) => {
      if (child.type === "row" && child.row.id === targetId) {
        return updater(child);
      }
      if (child.type === "group" && child.group.id === targetId) {
        return updater(child);
      }
      if (child.type === "group") {
        return { type: "group", group: updateNodeInGroup(child.group, targetId, updater) };
      }
      return child;
    }),
  };
}

/** Recursively remove a node from the tree by its id */
function removeNodeFromGroup(group: FilterGroup, targetId: string): FilterGroup {
  return {
    ...group,
    children: group.children
      .filter((child) => {
        if (child.type === "row") return child.row.id !== targetId;
        if (child.type === "group") return child.group.id !== targetId;
        return true;
      })
      .map((child) => {
        if (child.type === "group") {
          return { type: "group" as const, group: removeNodeFromGroup(child.group, targetId) };
        }
        return child;
      }),
  };
}

/** Add a filter row to a specific group */
function addRowToGroup(group: FilterGroup, targetGroupId: string): FilterGroup {
  if (group.id === targetGroupId) {
    return { ...group, children: [...group.children, createEmptyRow()] };
  }
  return {
    ...group,
    children: group.children.map((child) => {
      if (child.type === "group") {
        return { type: "group" as const, group: addRowToGroup(child.group, targetGroupId) };
      }
      return child;
    }),
  };
}

/** Add a sub-group to a specific group */
function addGroupToGroup(group: FilterGroup, targetGroupId: string): FilterGroup {
  if (group.id === targetGroupId) {
    return { ...group, children: [...group.children, createEmptyGroupNode()] };
  }
  return {
    ...group,
    children: group.children.map((child) => {
      if (child.type === "group") {
        return { type: "group" as const, group: addGroupToGroup(child.group, targetGroupId) };
      }
      return child;
    }),
  };
}

/** Set conjunction for a specific group */
function setGroupConjunctionInTree(group: FilterGroup, targetGroupId: string, conjunction: "and" | "or"): FilterGroup {
  if (group.id === targetGroupId) {
    return { ...group, conjunction };
  }
  return {
    ...group,
    children: group.children.map((child) => {
      if (child.type === "group") {
        return { type: "group" as const, group: setGroupConjunctionInTree(child.group, targetGroupId, conjunction) };
      }
      return child;
    }),
  };
}

/** Count the depth of a group within the tree */
function getGroupDepth(root: FilterGroup, targetGroupId: string, currentDepth = 0): number {
  if (root.id === targetGroupId) return currentDepth;
  for (const child of root.children) {
    if (child.type === "group") {
      const found = getGroupDepth(child.group, targetGroupId, currentDepth + 1);
      if (found >= 0) return found;
    }
  }
  return -1;
}

// ===== Hook =====

const defaultState: FilterState = { root: createEmptyGroup() };

export const useFilterState = (initialState?: FilterState) => {
  const [state, setState] = useState<FilterState>(initialState || defaultState);

  // Add a row to a specific group (defaults to root)
  const addRow = useCallback((groupId?: string) => {
    setState((prev) => ({
      root: addRowToGroup(prev.root, groupId || prev.root.id),
    }));
  }, []);

  // Remove a row or group by id
  const removeRow = useCallback((id: string) => {
    setState((prev) => ({
      root: removeNodeFromGroup(prev.root, id),
    }));
  }, []);

  // Update field on a specific row
  const updateField = useCallback((id: string, field: FilterFieldDefinition) => {
    setState((prev) => ({
      root: updateNodeInGroup(prev.root, id, (node) => {
        if (node.type !== "row") return node;
        return { type: "row", row: { ...node.row, field, operator: null, value: null } };
      }),
    }));
  }, []);

  // Update operator on a specific row
  const updateOperator = useCallback((id: string, operator: OperatorType) => {
    setState((prev) => ({
      root: updateNodeInGroup(prev.root, id, (node) => {
        if (node.type !== "row") return node;
        return { type: "row", row: { ...node.row, operator, value: null } };
      }),
    }));
  }, []);

  // Update value on a specific row
  const updateValue = useCallback((id: string, value: FilterValue) => {
    setState((prev) => ({
      root: updateNodeInGroup(prev.root, id, (node) => {
        if (node.type !== "row") return node;
        return { type: "row", row: { ...node.row, value } };
      }),
    }));
  }, []);

  // Set conjunction for a specific group (defaults to root)
  const setConjunction = useCallback((conjunction: "and" | "or", groupId?: string) => {
    setState((prev) => ({
      root: setGroupConjunctionInTree(prev.root, groupId || prev.root.id, conjunction),
    }));
  }, []);

  // Add a sub-group to a specific group
  const addGroup = useCallback((parentGroupId?: string) => {
    setState((prev) => ({
      root: addGroupToGroup(prev.root, parentGroupId || prev.root.id),
    }));
  }, []);

  // Remove a group by id (alias for removeRow since it works on any node)
  const removeGroup = useCallback((groupId: string) => {
    setState((prev) => ({
      root: removeNodeFromGroup(prev.root, groupId),
    }));
  }, []);

  // Reset to empty state
  const reset = useCallback(() => {
    setState({ root: createEmptyGroup() });
  }, []);

  // Override the entire state (for URL sync)
  const overrideState = useCallback((newState: FilterState) => {
    setState(newState);
  }, []);

  return {
    state,
    addRow,
    removeRow,
    updateField,
    updateOperator,
    updateValue,
    setConjunction,
    addGroup,
    removeGroup,
    reset,
    overrideState,
    getGroupDepth: (groupId: string) => getGroupDepth(state.root, groupId),
  };
};

export { createEmptyGroup };
