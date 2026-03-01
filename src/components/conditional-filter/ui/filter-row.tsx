"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFilterContext } from "../provider/filter-context";
import type { FilterRow } from "../types";
import { FieldSelect } from "./field-select";
import { OperatorSelect } from "./operator-select";
import { ValueInput } from "./value-input";

interface FilterRowProps {
  rowId: string;
  row: FilterRow;
}

export function FilterRowComponent({ row }: FilterRowProps) {
  const { removeRow } = useFilterContext();

  return (
    <div className="flex items-center space-x-2 w-full py-1">
      <FieldSelect rowId={row.id} selectedField={row.field} />

      {row.field && <OperatorSelect rowId={row.id} selectedField={row.field.name} selectedOperator={row.operator} />}

      {row.field && row.operator && (
        <div className="flex-1 flex max-w-[280px]">
          <ValueInput rowId={row.id} field={row.field} operator={row.operator} value={row.value} />
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeRow(row.id)}
        className="ml-auto shrink-0"
        aria-label="Remove filter"
      >
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
