"use client";

import { countValidRows } from "../helpers/validators";
import { useFilterContext } from "../provider/filter-context";

export function FilterBadge() {
  const { state } = useFilterContext();
  const count = countValidRows(state.root);

  if (count === 0) return null;

  return (
    <span className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs px-1.5 min-w-[20px] h-5">
      {count}
    </span>
  );
}
