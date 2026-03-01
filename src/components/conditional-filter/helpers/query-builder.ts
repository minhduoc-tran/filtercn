import type { FilterConfig, FilterRow, RestQueryParams } from "../types";
import { getOperatorSuffix } from "./operators";
import { getValidFilterRows } from "./validators";

export const buildRestQuery = (rows: FilterRow[], config: FilterConfig): RestQueryParams => {
  const validRows = getValidFilterRows(rows);
  const params: RestQueryParams = {};

  validRows.forEach((row) => {
    if (!row.field || !row.operator) return;

    if (config.customParamBuilder) {
      const customParams = config.customParamBuilder(row.field.name, row.operator, row.value);
      Object.assign(params, customParams);
      return;
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

    let paramValue: string | string[];

    if (row.operator === "is_empty") {
      paramValue = "true";
    } else if (row.operator === "is_not_empty") {
      paramValue = "false";
    } else if (row.operator === "between" && Array.isArray(row.value)) {
      if (style === "underscore") {
        paramValue = `${row.value[0]},${row.value[1]}`;
      } else {
        paramValue = [row.value[0].toString(), row.value[1].toString()];
      }
    } else if ((row.operator === "in" || row.operator === "not_in") && Array.isArray(row.value)) {
      if (style === "underscore") {
        paramValue = row.value.join(",");
      } else {
        paramValue = row.value.map((v) => v.toString());
      }
    } else {
      paramValue = String(row.value);
    }

    params[paramKey] = paramValue;
  });

  return params;
};
