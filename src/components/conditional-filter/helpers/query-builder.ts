import type { FilterConfig, FilterGroup, FilterRow } from "../types";
import { getOperatorSuffix } from "./operators";
import { getValidFilterRows } from "./validators";

/** Build REST query params from a flat list of rows (legacy/simple mode) */
export const buildRestQuery = (rows: FilterRow[], config: FilterConfig): Record<string, string> => {
  const validRows = getValidFilterRows(rows);
  const params: Record<string, string> = {};

  for (const row of validRows) {
    if (!row.field || !row.operator) continue;

    if (config.customParamBuilder) {
      const customParams = config.customParamBuilder(row.field.name, row.operator, row.value);
      Object.assign(params, customParams);
      continue;
    }

    const style = config.paramStyle || "underscore";
    const suffix = getOperatorSuffix(row.operator, style);
    const prefix = config.paramPrefix || "";

    let paramKey = row.field.name;
    if (style === "underscore" && suffix) {
      paramKey = `${row.field.name}${suffix}`;
    } else if (style === "bracket" && suffix) {
      paramKey = `filter[${row.field.name}]${suffix}`;
    } else if (style === "bracket" && !suffix) {
      paramKey = `filter[${row.field.name}]`;
    }

    if (prefix) {
      paramKey = `${prefix}${paramKey}`;
    }

    let paramValue: string;

    if (row.operator === "is_empty") {
      paramValue = "true";
    } else if (row.operator === "is_not_empty") {
      paramValue = "false";
    } else if (row.operator === "between" && Array.isArray(row.value)) {
      paramValue = `${row.value[0]},${row.value[1]}`;
    } else if ((row.operator === "in" || row.operator === "not_in") && Array.isArray(row.value)) {
      paramValue = row.value.join(",");
    } else {
      paramValue = String(row.value);
    }

    params[paramKey] = paramValue;
  }

  return params;
};

/** Build nested query structure from a FilterGroup tree */
export const buildNestedQuery = (
  group: FilterGroup,
  config: FilterConfig,
): { _logic: string; [key: string]: unknown } => {
  const result: { _logic: string; [key: string]: unknown } = { _logic: group.conjunction };

  const groups: { _logic: string; [key: string]: unknown }[] = [];
  const flatParams: Record<string, string> = {};

  for (const child of group.children) {
    if (child.type === "row" && child.row.field && child.row.operator) {
      const rowParams = buildRestQuery([child.row], config);
      Object.assign(flatParams, rowParams);
    } else if (child.type === "group") {
      groups.push(buildNestedQuery(child.group, config));
    }
  }

  // Merge flat params directly into result
  Object.assign(result, flatParams);

  if (groups.length > 0) {
    result._groups = groups;
  }

  return result;
};
