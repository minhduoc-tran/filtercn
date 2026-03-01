import type { FilterConfig, FilterRow, FilterState, FilterValue, OperatorType } from "../types";
import { buildRestQuery } from "./query-builder";

export const serializeFiltersToUrl = (state: FilterState, config: FilterConfig): URLSearchParams => {
  const params = new URLSearchParams();
  const restQuery = buildRestQuery(state.rows, config);

  Object.entries(restQuery).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      params.append(key, value.join(","));
    } else {
      params.append(key, value);
    }
  });

  if (state.conjunction === "or") {
    params.set("conjunction", "or");
  }

  return params;
};

export const deserializeUrlToFilters = (params: URLSearchParams, config: FilterConfig): FilterState => {
  const rows: FilterRow[] = [];
  const style = config.paramStyle || "underscore";
  const prefix = config.paramPrefix || "";

  Array.from(params.entries()).forEach(([key, value]) => {
    if (key === "conjunction") return;

    let processKey = key;
    if (prefix && processKey.startsWith(prefix)) {
      processKey = processKey.slice(prefix.length);
    } else if (prefix && !processKey.startsWith(prefix)) {
      // If a prefix is configured but this key doesn't have it, it's not a filter param
      return;
    }

    let fieldName = processKey;
    let operatorStr = "";

    if (style === "underscore" && processKey.includes("__")) {
      const parts = processKey.split("__");
      operatorStr = parts.pop() || "";
      fieldName = parts.join("__");
    } else if (style === "bracket" && processKey.startsWith("filter[")) {
      // Very basic bracket parse assumption
      const match = processKey.match(/filter\[(.*?)\](?:\[(.*?)\])?/);
      if (match?.[1]) {
        fieldName = match[1];
        operatorStr = match[2] || "";
      }
    }

    const fieldDef = config.fields.find((f) => f.name === fieldName);
    if (!fieldDef) return;

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
  });

  return {
    rows,
    conjunction: params.get("conjunction") === "or" ? "or" : "and",
  };
};
