import type { OperatorType } from "../types";

export const getOperatorSuffix = (operator: OperatorType, paramStyle: "underscore" | "bracket" | "custom"): string => {
  if (paramStyle === "custom") return "";

  const mapping: Record<OperatorType, string> = {
    is: "", // usually no suffix for exact match
    is_not: "not",
    contains: "icontains",
    not_contains: "not_icontains",
    gt: "gt",
    gte: "gte",
    lt: "lt",
    lte: "lte",
    between: "range",
    in: "in",
    not_in: "not_in",
    is_empty: "isnull",
    is_not_empty: "isnull",
  };

  const suffix = mapping[operator];
  if (!suffix) return "";

  if (paramStyle === "underscore") return `__${suffix}`;
  if (paramStyle === "bracket") return `[${suffix}]`;
  return "";
};
