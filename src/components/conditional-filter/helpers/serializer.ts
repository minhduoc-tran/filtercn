import { createEmptyGroup } from "../hooks/use-filter-state";
import type { FilterConfig, FilterGroup, FilterRow, FilterState, FilterValue, OperatorType } from "../types";
import { buildNestedQuery, buildRestQuery } from "./query-builder";
import { hasSubGroups } from "./validators";

/** Collect all rows from a group tree (flat list) */
function collectRows(group: FilterGroup): FilterRow[] {
  const rows: FilterRow[] = [];
  for (const child of group.children) {
    if (child.type === "row") rows.push(child.row);
    else if (child.type === "group") rows.push(...collectRows(child.group));
  }
  return rows;
}

export const serializeFiltersToUrl = (state: FilterState, config: FilterConfig): URLSearchParams => {
  const params = new URLSearchParams();
  const root = state.root;

  const hasNesting = hasSubGroups(root);

  if (hasNesting) {
    // Encode nested structure as base64 JSON
    const nestedQuery = buildNestedQuery(root, config);
    params.set("filters", btoa(JSON.stringify(nestedQuery)));
  } else {
    // Flat format: collect all rows from root group (backward compatible)
    const allRows = collectRows(root);
    const restQuery = buildRestQuery(allRows, config);

    for (const [key, value] of Object.entries(restQuery)) {
      if (Array.isArray(value)) {
        params.append(key, value.join(","));
      } else {
        params.append(key, value);
      }
    }

    if (root.conjunction === "or") {
      params.set("conjunction", "or");
    }
  }

  return params;
};

export const deserializeUrlToFilters = (params: URLSearchParams, config: FilterConfig): FilterState => {
  // Check for nested JSON format first
  const filtersParam = params.get("filters");
  if (filtersParam) {
    try {
      const decoded = JSON.parse(atob(filtersParam));
      return { root: deserializeNestedGroup(decoded, config) };
    } catch {
      // Fall through to flat parsing
    }
  }

  // Flat format parsing (backward compatible)
  const rows: FilterRow[] = [];
  const style = config.paramStyle || "underscore";
  const prefix = config.paramPrefix || "";

  for (const [key, value] of params.entries()) {
    if (key === "conjunction" || key === "filters") continue;

    let processKey = key;
    if (prefix && processKey.startsWith(prefix)) {
      processKey = processKey.slice(prefix.length);
    } else if (prefix && !processKey.startsWith(prefix)) {
      return { root: createEmptyGroup() };
    }

    let fieldName = processKey;
    let operatorStr = "";

    if (style === "underscore" && processKey.includes("__")) {
      const parts = processKey.split("__");
      operatorStr = parts.pop() || "";
      fieldName = parts.join("__");
    } else if (style === "bracket" && processKey.startsWith("filter[")) {
      const match = processKey.match(/filter\[(.*?)\](?:\[(.*?)\])?/);
      if (match?.[1]) {
        fieldName = match[1];
        operatorStr = match[2] || "";
      }
    }

    const fieldDef = config.fields.find((f) => f.name === fieldName);
    if (!fieldDef) continue;

    const suffixToOp: Record<string, OperatorType> = {
      "": "is",
      not: "is_not",
      icontains: "contains",
      not_icontains: "not_contains",
      gt: "gt",
      gte: "gte",
      lt: "lt",
      lte: "lte",
      range: "between",
      in: "in",
      not_in: "not_in",
      isnull: value === "true" ? "is_empty" : "is_not_empty",
    };

    const operator = suffixToOp[operatorStr] || "is";
    let parsedValue: FilterValue = value;

    if (operator === "between" && typeof value === "string" && value.includes(",")) {
      parsedValue = value.split(",");
    } else if ((operator === "in" || operator === "not_in") && typeof value === "string" && value.includes(",")) {
      parsedValue = value.split(",");
    }

    rows.push({
      id: crypto.randomUUID(),
      field: fieldDef,
      operator,
      value: parsedValue,
    });
  }

  const conjunction = params.get("conjunction") === "or" ? "or" : "and";

  return {
    root: {
      id: crypto.randomUUID(),
      conjunction: conjunction as "and" | "or",
      children: rows.map((row) => ({ type: "row" as const, row })),
    },
  };
};

/** Deserialize nested JSON group back to FilterGroup */
function deserializeNestedGroup(data: Record<string, unknown>, config: FilterConfig): FilterGroup {
  const conjunction = (data._logic as string) === "or" ? "or" : "and";
  const children: FilterGroup["children"] = [];

  // Parse flat params in this group
  for (const [key, value] of Object.entries(data)) {
    if (key === "_logic" || key === "_groups") continue;

    const fieldName = extractFieldName(key, config);
    const fieldDef = config.fields.find((f) => f.name === fieldName);
    if (!fieldDef) continue;

    const operator = extractOperator(key, config);
    children.push({
      type: "row",
      row: {
        id: crypto.randomUUID(),
        field: fieldDef,
        operator,
        value: value as FilterValue,
      },
    });
  }

  // Parse sub-groups
  const groups = data._groups as Record<string, unknown>[] | undefined;
  if (groups) {
    for (const subGroupData of groups) {
      children.push({
        type: "group",
        group: deserializeNestedGroup(subGroupData, config),
      });
    }
  }

  return { id: crypto.randomUUID(), conjunction, children };
}

function extractFieldName(key: string, config: FilterConfig): string {
  const prefix = config.paramPrefix || "";
  let processKey = key;
  if (prefix && processKey.startsWith(prefix)) {
    processKey = processKey.slice(prefix.length);
  }
  if (processKey.includes("__")) {
    const parts = processKey.split("__");
    parts.pop();
    return parts.join("__");
  }
  return processKey;
}

function extractOperator(key: string, config: FilterConfig): OperatorType {
  const prefix = config.paramPrefix || "";
  let processKey = key;
  if (prefix && processKey.startsWith(prefix)) {
    processKey = processKey.slice(prefix.length);
  }
  if (processKey.includes("__")) {
    const suffix = processKey.split("__").pop() || "";
    const suffixToOp: Record<string, OperatorType> = {
      not: "is_not",
      icontains: "contains",
      not_icontains: "not_contains",
      gt: "gt",
      gte: "gte",
      lt: "lt",
      lte: "lte",
      range: "between",
      in: "in",
      not_in: "not_in",
      isnull: "is_empty",
    };
    return suffixToOp[suffix] || "is";
  }
  return "is";
}
