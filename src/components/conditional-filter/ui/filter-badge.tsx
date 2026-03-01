"use client";

import { Badge } from "@/components/ui/badge";
import { useFilterContext } from "../provider/filter-context";

export function FilterBadge() {
  const { activeCount } = useFilterContext();

  if (activeCount === 0) return null;

  return (
    <Badge variant="secondary" className="ml-2 rounded-full px-2">
      {activeCount}
    </Badge>
  );
}
