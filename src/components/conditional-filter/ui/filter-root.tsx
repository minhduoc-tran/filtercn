"use client";

import { Filter as FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFilterContext } from "../provider/filter-context";
import { FilterBadge } from "./filter-badge";
import { FilterFooter } from "./filter-footer";
import { FilterGroupComponent } from "./filter-group";

export function FilterRoot() {
  const { state } = useFilterContext();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4" />
          <span>Filters</span>
          <FilterBadge />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[95vw] sm:w-[720px] p-4" align="end">
        <ScrollArea className="max-h-[400px] pr-4">
          <FilterGroupComponent group={state.root} isRoot />
        </ScrollArea>
        <FilterFooter />
      </PopoverContent>
    </Popover>
  );
}
