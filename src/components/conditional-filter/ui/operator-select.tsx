"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_OPERATORS } from "../constants";
import { useFilterContext } from "../provider/filter-context";
import type { OperatorType } from "../types";

export interface OperatorSelectProps {
  rowId: string;
  selectedField: string | null;
  selectedOperator: OperatorType | null;
}

const OPERATOR_LABELS: Record<OperatorType, string> = {
  is: "is",
  is_not: "is not",
  contains: "contains",
  not_contains: "does not contain",
  gt: "greater than",
  gte: "greater or equal",
  lt: "less than",
  lte: "less or equal",
  between: "between",
  in: "in list",
  not_in: "not in list",
  is_empty: "is empty",
  is_not_empty: "is not empty",
};

export function OperatorSelect({ rowId, selectedField, selectedOperator }: OperatorSelectProps) {
  const { config, updateOperator } = useFilterContext();

  const fieldDef = config.fields.find((f) => f.name === selectedField);

  if (!fieldDef) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Operator" />
        </SelectTrigger>
      </Select>
    );
  }

  const allowedOperators = fieldDef.operators || DEFAULT_OPERATORS[fieldDef.type] || ["is"];

  return (
    <Select value={selectedOperator || ""} onValueChange={(val) => updateOperator(rowId, val as OperatorType)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select operator..." />
      </SelectTrigger>
      <SelectContent>
        {allowedOperators.map((op) => (
          <SelectItem key={op} value={op}>
            {OPERATOR_LABELS[op] || op}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
