"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PopoverClose } from "@/components/ui/popover";
import { isValidFilterRow } from "../helpers/validators";
import { useFilterContext } from "../provider/filter-context";

export function FilterFooter() {
  const { config, addRow, reset, apply, state } = useFilterContext();
  const maxRows = config.maxRows || 10;
  const canAddMore = state.rows.length < maxRows;

  // Determine if there is at least one valid filter row
  const hasValidFilters = state.rows.some(isValidFilterRow);

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t">
      <Button variant="ghost" onClick={addRow} disabled={!canAddMore} className="text-sm font-medium">
        {config.locale?.addFilter || "+ Add filter"}
      </Button>
      <div className="flex space-x-2">
        <PopoverClose asChild>
          <Button variant="outline" onClick={reset}>
            {config.locale?.reset || "Reset"}
          </Button>
        </PopoverClose>
        {hasValidFilters ? (
          <PopoverClose asChild>
            <Button onClick={apply}>{config.locale?.apply || "Apply"}</Button>
          </PopoverClose>
        ) : (
          <Button disabled>{config.locale?.apply || "Apply"}</Button>
        )}
      </div>
    </div>
  );
}
