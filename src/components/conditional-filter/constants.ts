import type { FieldType, FilterLocale, OperatorType } from "./types";

export const DEFAULT_LOCALE: FilterLocale = {
  addFilter: "+ Add filter",
  reset: "Reset",
  apply: "Apply",
  placeholder: "Select...",
  and: "AND",
  or: "OR",
  noFilters: "No filters active",
};

export const DEFAULT_OPERATORS: Record<FieldType, OperatorType[]> = {
  text: ["is", "is_not", "contains", "not_contains", "is_empty", "is_not_empty"],
  number: ["is", "is_not", "gt", "gte", "lt", "lte", "between", "is_empty", "is_not_empty"],
  select: ["is", "is_not", "is_empty", "is_not_empty"],
  multiselect: ["in", "not_in", "is_empty", "is_not_empty"],
  date: ["is", "is_not", "gt", "gte", "lt", "lte", "between", "is_empty", "is_not_empty"],
  datetime: ["is", "is_not", "gt", "gte", "lt", "lte", "between", "is_empty", "is_not_empty"],
  boolean: ["is"],
  combobox: ["is", "is_not", "is_empty", "is_not_empty"],
};
