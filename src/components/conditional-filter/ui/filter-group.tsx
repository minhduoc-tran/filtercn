"use client";

import { Layers, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFilterContext } from "../provider/filter-context";
import type { FilterGroup as FilterGroupType, FilterNode } from "../types";
import { FilterRowComponent } from "./filter-row";

interface FilterGroupComponentProps {
  group: FilterGroupType;
  depth?: number;
  isRoot?: boolean;
}

export function FilterGroupComponent({ group, depth = 0, isRoot = false }: FilterGroupComponentProps) {
  const { config, addRow, addGroup, removeGroup, setConjunction } = useFilterContext();
  const maxDepth = config.maxGroupDepth ?? 3;
  const canAddGroup = config.allowGrouping && depth < maxDepth;

  const depthColors = ["border-l-indigo-400", "border-l-violet-400", "border-l-pink-400", "border-l-amber-400"];
  const borderColor = depthColors[depth % depthColors.length];

  return (
    <div className={isRoot ? "" : `relative pl-4 ml-2 border-l-2 ${borderColor} rounded-sm bg-muted/30 py-2 pr-2`}>
      {/* Group header with conjunction toggle */}
      {!isRoot && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            {config.allowConjunctionToggle && group.children.length > 1 && (
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-md">
                <Button
                  variant={group.conjunction === "and" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setConjunction("and", group.id)}
                  className="h-6 text-xs px-2"
                >
                  {config.locale?.and || "AND"}
                </Button>
                <Button
                  variant={group.conjunction === "or" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setConjunction("or", group.id)}
                  className="h-6 text-xs px-2"
                >
                  {config.locale?.or || "OR"}
                </Button>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeGroup(group.id)}
            className="h-6 px-2 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Children */}
      <div className="flex flex-col gap-2">
        {group.children.length === 0 && (
          <div className="text-center py-2 text-sm text-muted-foreground">
            {config.locale?.noFilters || "No filters active"}
          </div>
        )}
        {group.children.map((child: FilterNode) => {
          if (child.type === "row") {
            return <FilterRowComponent key={child.row.id} rowId={child.row.id} row={child.row} />;
          }
          return <FilterGroupComponent key={child.group.id} group={child.group} depth={depth + 1} />;
        })}
      </div>

      {/* Group footer: add filter / add group */}
      <div className="flex items-center gap-2 mt-2">
        <Button variant="ghost" size="sm" onClick={() => addRow(group.id)} className="text-xs font-medium h-7">
          {config.locale?.addFilter || "+ Add filter"}
        </Button>
        {canAddGroup && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addGroup(group.id)}
            className="text-xs font-medium h-7 text-indigo-600 dark:text-indigo-400"
          >
            {config.locale?.addGroup || "+ Add group"}
          </Button>
        )}
      </div>
    </div>
  );
}
