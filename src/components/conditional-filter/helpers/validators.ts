import type { FilterGroup, FilterRow } from "../types";

export const isValidFilterRow = (row: FilterRow): boolean => {
  if (!row.field || !row.operator) return false;

  if (row.operator === "is_empty" || row.operator === "is_not_empty") {
    return true; // value doesn't matter for empty checks
  }

  if (row.operator === "between") {
    if (!Array.isArray(row.value) || row.value.length !== 2) return false;
    if (row.value[0] === null || row.value[0] === "" || row.value[1] === null || row.value[1] === "") return false;
    return true;
  }

  if (row.operator === "in" || row.operator === "not_in") {
    if (!Array.isArray(row.value) || row.value.length === 0) return false;
    return true;
  }

  if (row.value === null || row.value === "" || (Array.isArray(row.value) && row.value.length === 0)) {
    return false;
  }

  return true;
};

export const getValidFilterRows = (rows: FilterRow[]): FilterRow[] => {
  return rows.filter(isValidFilterRow);
};

/** Recursively collect all valid filter rows from a group tree */
export const getValidRowsFromGroup = (group: FilterGroup): FilterRow[] => {
  const rows: FilterRow[] = [];
  for (const child of group.children) {
    if (child.type === "row" && isValidFilterRow(child.row)) {
      rows.push(child.row);
    } else if (child.type === "group") {
      rows.push(...getValidRowsFromGroup(child.group));
    }
  }
  return rows;
};

/** Recursively count all valid filter rows */
export const countValidRows = (group: FilterGroup): number => {
  return getValidRowsFromGroup(group).length;
};

/** Check if a group tree has any sub-groups */
export const hasSubGroups = (group: FilterGroup): boolean => {
  return group.children.some((child) => child.type === "group");
};
