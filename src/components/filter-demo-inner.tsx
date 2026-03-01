"use client";

import { useSearchParams } from "next/navigation";
import { deserializeUrlToFilters } from "@/components/conditional-filter/helpers/serializer";
import { isValidFilterRow } from "@/components/conditional-filter/helpers/validators";
import { FilterProvider } from "@/components/conditional-filter/provider/filter-provider";
import type { FilterConfig, FilterGroup, FilterRow } from "@/components/conditional-filter/types";
import { FilterBar } from "@/components/conditional-filter/ui/filter-bar";

const demoConfig: FilterConfig = {
  allowConjunctionToggle: true,
  allowGrouping: true,
  fields: [
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Pending", value: "pending" },
        { label: "Banned", value: "banned" },
      ],
    },
    { name: "name", label: "Name", type: "text" },
    { name: "price", label: "Price", type: "number" },
    { name: "created_at", label: "Created At", type: "date" },
    { name: "is_verified", label: "Verified", type: "boolean" },
  ],
};

const MOCK_DATA = [
  { name: "Acme Corp", status: "active", price: 299, created_at: "2024-01-12", is_verified: true },
  { name: "Globex Inc", status: "pending", price: 149, created_at: "2024-02-03", is_verified: false },
  { name: "Initech Ltd", status: "inactive", price: 599, created_at: "2024-02-18", is_verified: true },
  { name: "Stark Ind", status: "active", price: 999, created_at: "2024-03-01", is_verified: true },
  { name: "Wayne Ent", status: "active", price: 750, created_at: "2024-03-15", is_verified: false },
  { name: "Hooli App", status: "banned", price: 10, created_at: "2024-04-10", is_verified: false },
];

/** Evaluate a single row against an item */
function evaluateRow(row: FilterRow, item: Record<string, unknown>): boolean | null {
  if (!row.field || !row.operator) return null;
  if (row.operator !== "is_empty" && row.operator !== "is_not_empty" && row.value === null) return null;

  const itemVal = item[row.field.name];
  try {
    switch (row.operator) {
      case "is":
        return String(itemVal) === String(row.value);
      case "is_not":
        return String(itemVal) !== String(row.value);
      case "contains":
        return String(itemVal).toLowerCase().includes(String(row.value).toLowerCase());
      case "not_contains":
        return !String(itemVal).toLowerCase().includes(String(row.value).toLowerCase());
      case "gt":
        return Number(itemVal) > Number(row.value);
      case "gte":
        return Number(itemVal) >= Number(row.value);
      case "lt":
        return Number(itemVal) < Number(row.value);
      case "lte":
        return Number(itemVal) <= Number(row.value);
      case "is_empty":
        return itemVal === null || itemVal === "" || itemVal === undefined;
      case "is_not_empty":
        return itemVal !== null && itemVal !== "" && itemVal !== undefined;
      default:
        return true;
    }
  } catch {
    return true;
  }
}

/** Recursively evaluate a group against an item, respecting nested AND/OR */
function evaluateGroup(group: FilterGroup, item: Record<string, unknown>): boolean {
  const results: boolean[] = [];

  for (const child of group.children) {
    if (child.type === "row") {
      if (!isValidFilterRow(child.row)) continue;
      const result = evaluateRow(child.row, item);
      if (result !== null) results.push(result);
    } else if (child.type === "group") {
      // Recursively evaluate sub-group
      results.push(evaluateGroup(child.group, item));
    }
  }

  if (results.length === 0) return true; // No valid filters → pass

  if (group.conjunction === "or") {
    return results.some((r) => r);
  }
  return results.every((r) => r);
}

export function FilterDemoInner() {
  const searchParams = useSearchParams();

  const state = deserializeUrlToFilters(new URLSearchParams(searchParams.toString()), demoConfig);
  const searchQuery = searchParams.get(demoConfig.searchParamName || "q") || "";

  const filteredData = MOCK_DATA.filter((item) => {
    // Global text search
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Recursively evaluate the entire filter tree
    return evaluateGroup(state.root, item as unknown as Record<string, unknown>);
  });

  return (
    <div className="not-prose rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6">
      <div className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
          <FilterProvider config={demoConfig}>
            <FilterBar searchPlaceholder="Search data..." />
          </FilterProvider>
        </div>

        {/* Mock table */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-700">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-4 py-3 bg-zinc-100 dark:bg-zinc-800">
            {["Name", "Status", "Price", "Created"].map((h) => (
              <div key={h} className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                {h}
              </div>
            ))}
          </div>
          {filteredData.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-zinc-500">No results match your filters.</div>
          ) : (
            filteredData.map(({ name, status, price, created_at }) => {
              const badge: Record<string, string> = {
                active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
                pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
                inactive: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
                banned: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
              };
              return (
                <div
                  key={name}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-4 py-3 bg-white dark:bg-zinc-950 text-sm text-zinc-700 dark:text-zinc-300 items-center"
                >
                  <span className="font-medium">{name}</span>
                  <span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge[status ?? ""] ?? "bg-zinc-100 text-zinc-600"}`}
                    >
                      {status}
                    </span>
                  </span>
                  <span>${price}</span>
                  <span className="text-zinc-400 text-xs">{created_at}</span>
                </div>
              );
            })
          )}
        </div>

        <p className="text-xs text-center text-zinc-400 dark:text-zinc-500">
          Adding filters triggers a URL update. The table reads the URL parameters to filter these mock rows.
        </p>
      </div>
    </div>
  );
}
