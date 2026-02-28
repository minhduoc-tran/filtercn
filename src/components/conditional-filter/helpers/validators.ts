import type { FilterRow } from "../types";

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
