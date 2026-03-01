"use client";

import { Button } from "@/components/ui/button";
import { PopoverClose } from "@/components/ui/popover";
import { countValidRows } from "../helpers/validators";
import { useFilterContext } from "../provider/filter-context";

export function FilterFooter() {
  const { config, reset, apply, state, setConjunction } = useFilterContext();

  const hasValidFilters = countValidRows(state.root) > 0;

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t">
      <div className="flex items-center space-x-2">
        {config.allowConjunctionToggle && state.root.children.length > 1 && (
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-md">
            <Button
              variant={state.root.conjunction === "and" ? "default" : "ghost"}
              size="sm"
              onClick={() => setConjunction("and")}
              className="h-7 text-xs px-3"
            >
              {config.locale?.and || "AND"}
            </Button>
            <Button
              variant={state.root.conjunction === "or" ? "default" : "ghost"}
              size="sm"
              onClick={() => setConjunction("or")}
              className="h-7 text-xs px-3"
            >
              {config.locale?.or || "OR"}
            </Button>
          </div>
        )}
      </div>
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
