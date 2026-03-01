/**
 * Auto-generated templates for the FilterCN CLI
 */

const ALIAS = "__ALIAS__";

const TEMPLATE_CONSTANTS_TS = `import type { FieldType, FilterLocale, OperatorType } from "./types";

export const DEFAULT_LOCALE: FilterLocale = {
  addFilter: "+ Add filter",
  reset: "Reset",
  apply: "Apply",
  placeholder: "Select...",
  and: "AND",
  or: "OR",
  noFilters: "No filters active",
};

export const DEFAULT_OPERATORS: Record<FieldType, OperatorType[]> = {
  text: ["is", "is_not", "contains", "not_contains", "is_empty", "is_not_empty"],
  number: ["is", "is_not", "gt", "gte", "lt", "lte", "between", "is_empty", "is_not_empty"],
  select: ["is", "is_not", "is_empty", "is_not_empty"],
  multiselect: ["in", "not_in", "is_empty", "is_not_empty"],
  date: ["is", "is_not", "gt", "gte", "lt", "lte", "between", "is_empty", "is_not_empty"],
  datetime: ["is", "is_not", "gt", "gte", "lt", "lte", "between", "is_empty", "is_not_empty"],
  boolean: ["is"],
  combobox: ["is", "is_not", "is_empty", "is_not_empty"],
};
`;

const TEMPLATE_HELPERS_OPERATORS_TS = `import type { OperatorType } from "../types";

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

  if (paramStyle === "underscore") return \`__\${suffix}\`;
  if (paramStyle === "bracket") return \`[\${suffix}]\`;
  return "";
};
`;

const TEMPLATE_HELPERS_QUERY_BUILDER_TS = `import type { FilterConfig, FilterRow, RestQueryParams } from "../types";
import { getOperatorSuffix } from "./operators";
import { getValidFilterRows } from "./validators";

export const buildRestQuery = (rows: FilterRow[], config: FilterConfig): RestQueryParams => {
  const validRows = getValidFilterRows(rows);
  const params: RestQueryParams = {};

  validRows.forEach((row) => {
    if (!row.field || !row.operator) return;

    if (config.customParamBuilder) {
      const customParams = config.customParamBuilder(row.field.name, row.operator, row.value);
      Object.assign(params, customParams);
      return;
    }

    const style = config.paramStyle || "underscore";
    const suffix = getOperatorSuffix(row.operator, style);
    const prefix = config.paramPrefix || "";

    let paramKey = row.field.name;
    if (style === "underscore" && suffix) {
      paramKey = \`\${row.field.name}\${suffix}\`;
    } else if (style === "bracket" && suffix) {
      paramKey = \`filter[\${row.field.name}]\${suffix}\`;
    } else if (style === "bracket" && !suffix) {
      paramKey = \`filter[\${row.field.name}]\`;
    }

    if (prefix) {
      paramKey = \`\${prefix}\${paramKey}\`;
    }

    let paramValue: string | string[];

    if (row.operator === "is_empty") {
      paramValue = "true";
    } else if (row.operator === "is_not_empty") {
      paramValue = "false";
    } else if (row.operator === "between" && Array.isArray(row.value)) {
      if (style === "underscore") {
        paramValue = \`\${row.value[0]},\${row.value[1]}\`;
      } else {
        paramValue = [row.value[0].toString(), row.value[1].toString()];
      }
    } else if ((row.operator === "in" || row.operator === "not_in") && Array.isArray(row.value)) {
      if (style === "underscore") {
        paramValue = row.value.join(",");
      } else {
        paramValue = row.value.map((v) => v.toString());
      }
    } else {
      paramValue = String(row.value);
    }

    params[paramKey] = paramValue;
  });

  return params;
};
`;

const TEMPLATE_HELPERS_SERIALIZER_TS = `import type { FilterConfig, FilterRow, FilterState, FilterValue, OperatorType } from "../types";
import { buildRestQuery } from "./query-builder";

export const serializeFiltersToUrl = (state: FilterState, config: FilterConfig): URLSearchParams => {
  const params = new URLSearchParams();
  const restQuery = buildRestQuery(state.rows, config);

  Object.entries(restQuery).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      params.append(key, value.join(","));
    } else {
      params.append(key, value);
    }
  });

  if (state.conjunction === "or") {
    params.set("conjunction", "or");
  }

  return params;
};

export const deserializeUrlToFilters = (params: URLSearchParams, config: FilterConfig): FilterState => {
  const rows: FilterRow[] = [];
  const style = config.paramStyle || "underscore";
  const prefix = config.paramPrefix || "";

  Array.from(params.entries()).forEach(([key, value]) => {
    if (key === "conjunction") return;

    let processKey = key;
    if (prefix && processKey.startsWith(prefix)) {
      processKey = processKey.slice(prefix.length);
    } else if (prefix && !processKey.startsWith(prefix)) {
      // If a prefix is configured but this key doesn't have it, it's not a filter param
      return;
    }

    let fieldName = processKey;
    let operatorStr = "";

    if (style === "underscore" && processKey.includes("__")) {
      const parts = processKey.split("__");
      operatorStr = parts.pop() || "";
      fieldName = parts.join("__");
    } else if (style === "bracket" && processKey.startsWith("filter[")) {
      // Very basic bracket parse assumption
      const match = processKey.match(/filter\\[(.*?)\\](?:\\[(.*?)\\])?/);
      if (match?.[1]) {
        fieldName = match[1];
        operatorStr = match[2] || "";
      }
    }

    const fieldDef = config.fields.find((f) => f.name === fieldName);
    if (!fieldDef) return;

    const suffixToOp: Record<string, OperatorType> = {
      "": "is",
      not: "is_not",
      icontains: "contains",
      not_icontains: "not_contains",
      gt: "gt",
      gte: "gte",
      lt: "lt",
      lte: "lte",
      range: "between",
      in: "in",
      not_in: "not_in",
      isnull: value === "true" ? "is_empty" : "is_not_empty",
    };

    const operator = suffixToOp[operatorStr] || "is";
    let parsedValue: FilterValue = value;

    if (operator === "between" && typeof value === "string" && value.includes(",")) {
      parsedValue = value.split(",");
    } else if ((operator === "in" || operator === "not_in") && typeof value === "string" && value.includes(",")) {
      parsedValue = value.split(",");
    }

    rows.push({
      id: crypto.randomUUID(),
      field: fieldDef,
      operator,
      value: parsedValue,
    });
  });

  return {
    rows,
    conjunction: params.get("conjunction") === "or" ? "or" : "and",
  };
};
`;

const TEMPLATE_HELPERS_VALIDATORS_TS = `import type { FilterRow } from "../types";

export const isValidFilterRow = (row: FilterRow): boolean => {
  if (!row.field || !row.operator) return false;

  if (row.operator === "is_empty" || row.operator === "is_not_empty") {
    return true; // value doesn't matter for empty checks
  }

  if (row.operator === "between") {
    if (!Array.isArray(row.value) || row.value.length !== 2) return false;
    if (row.value[0] === null || row.value[0] === "" || row.value[1] === null || row.value[1] === "") return false;
    return true;
  }

  if (row.operator === "in" || row.operator === "not_in") {
    if (!Array.isArray(row.value) || row.value.length === 0) return false;
    return true;
  }

  if (row.value === null || row.value === "" || (Array.isArray(row.value) && row.value.length === 0)) {
    return false;
  }

  return true;
};

export const getValidFilterRows = (rows: FilterRow[]): FilterRow[] => {
  return rows.filter(isValidFilterRow);
};
`;

const TEMPLATE_HOOKS_USE_FILTER_OPTIONS_TS = `"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SelectOption } from "../types";

export const useFilterOptions = (fetchFn?: (search: string) => Promise<SelectOption[]>) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const search = useCallback(
    (query: string) => {
      if (!fetchFn) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setLoading(true);

      timeoutRef.current = setTimeout(async () => {
        try {
          const result = await fetchFn(query);
          setOptions(result);
        } catch (err) {
          console.error("Failed to fetch filter options", err);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [fetchFn],
  );

  // Initial fetch
  useEffect(() => {
    if (fetchFn) {
      search("");
    }
  }, [fetchFn, search]);

  return { options, loading, search };
};
`;

const TEMPLATE_HOOKS_USE_FILTER_QUERY_TS = `"use client";

import { useMemo } from "react";
import { buildRestQuery } from "../helpers/query-builder";
import { useFilterContext } from "../provider/filter-context";

export function useFilterQuery() {
  const { state, config, activeCount, isValid } = useFilterContext();

  const queryParams = useMemo(() => {
    return buildRestQuery(state.rows, config);
  }, [state.rows, config]);

  return {
    queryParams,
    activeCount,
    isValid,
    conjunction: state.conjunction,
  };
}
`;

const TEMPLATE_HOOKS_USE_FILTER_STATE_TS = `"use client";

import { useCallback, useState } from "react";
import type { FilterFieldDefinition, FilterState, FilterValue, OperatorType } from "../types";

export const useFilterState = (initialState?: FilterState) => {
  const [state, setState] = useState<FilterState>(initialState || { rows: [], conjunction: "and" });

  const addRow = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rows: [...prev.rows, { id: crypto.randomUUID(), field: null, operator: null, value: null }],
    }));
  }, []);

  const removeRow = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      rows: prev.rows.filter((row) => row.id !== id),
    }));
  }, []);

  const updateField = useCallback((id: string, field: FilterFieldDefinition) => {
    setState((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => (row.id === id ? { ...row, field, operator: null, value: null } : row)),
    }));
  }, []);

  const updateOperator = useCallback((id: string, operator: OperatorType) => {
    setState((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => (row.id === id ? { ...row, operator, value: null } : row)),
    }));
  }, []);

  const updateValue = useCallback((id: string, value: FilterValue) => {
    setState((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => (row.id === id ? { ...row, value } : row)),
    }));
  }, []);

  const setConjunction = useCallback((conjunction: "and" | "or") => {
    setState((prev) => ({ ...prev, conjunction }));
  }, []);

  const reset = useCallback(() => {
    setState({ rows: [], conjunction: "and" });
  }, []);

  // Sync internal state with external state if external state changes intentionally
  // Often useful when URL changes
  const overrideState = useCallback((newState: FilterState) => {
    setState(newState);
  }, []);

  return {
    state,
    addRow,
    removeRow,
    updateField,
    updateOperator,
    updateValue,
    setConjunction,
    reset,
    overrideState,
  };
};
`;

const TEMPLATE_HOOKS_USE_FILTER_URL_SYNC_TS = `"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { deserializeUrlToFilters, serializeFiltersToUrl } from "../helpers/serializer";
import { getValidFilterRows } from "../helpers/validators";
import type { FilterConfig, FilterState } from "../types";

export const useFilterUrlSync = (config: FilterConfig) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isInitializing = useRef(true);

  const [syncedState, setSyncedState] = useState<FilterState>(() => {
    const params = new URLSearchParams(searchParams.toString());
    return deserializeUrlToFilters(params, config);
  });

  useEffect(() => {
    if (isInitializing.current) {
      isInitializing.current = false;
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    setSyncedState(deserializeUrlToFilters(params, config));
  }, [searchParams, config]);

  const handleSync = useCallback(
    (currentState: FilterState) => {
      // preserve current non-filter params + search param
      const currentParams = new URLSearchParams(searchParams.toString());
      const newParams = serializeFiltersToUrl(currentState, config);

      // Keep searchParamName if it exists
      const searchParamName = config.searchParamName || "q";
      const currentSearchParam = currentParams.get(searchParamName);

      // We clear all existing filter params (by trusting what serialize gives us)
      // Then we append any non-filter params back (except what's newly generated)
      // Simplest approach: create a fresh URLSearchParams, add all from \`newParams\`,
      // then add anything from \`currentParams\` that isn't managed by the filter.
      // For simplicity, we just keep the search param if provided.
      if (currentSearchParam) {
        newParams.set(searchParamName, currentSearchParam);
      }

      const queryStr = newParams.toString();
      const newPath = queryStr ? \`\${pathname}?\${queryStr}\` : pathname;

      router.push(newPath, { scroll: false });
    },
    [config, pathname, router, searchParams],
  );

  const applyChanges = useCallback(
    (newState: FilterState) => {
      handleSync({ ...newState, rows: getValidFilterRows(newState.rows) });
    },
    [handleSync],
  );

  return {
    initialState: syncedState,
    applyChanges,
  };
};
`;

const TEMPLATE_INDEX_TS = `export * from "./constants";
export { buildRestQuery } from "./helpers/query-builder";
export { deserializeUrlToFilters, serializeFiltersToUrl } from "./helpers/serializer";
export { getValidFilterRows, isValidFilterRow } from "./helpers/validators";
export * from "./hooks/use-filter-options";
export * from "./hooks/use-filter-query";
export * from "./hooks/use-filter-state";
export * from "./hooks/use-filter-url-sync";
export * from "./provider/filter-context";
export * from "./provider/filter-provider";
export * from "./types";
export * from "./ui/field-select";
export * from "./ui/filter-badge";
export * from "./ui/filter-bar";
export * from "./ui/filter-footer";
export * from "./ui/filter-root";
export * from "./ui/filter-row";
export * from "./ui/operator-select";
export * from "./ui/value-input";
`;

const TEMPLATE_PROVIDER_FILTER_CONTEXT_TS = `"use client";

import { createContext, useContext } from "react";
import type { FilterConfig, FilterFieldDefinition, FilterState, FilterValue, OperatorType } from "../types";

export interface FilterContextValue {
  config: FilterConfig;
  state: FilterState;

  // Mutations
  addRow: () => void;
  removeRow: (id: string) => void;
  updateField: (id: string, field: FilterFieldDefinition) => void;
  updateOperator: (id: string, operator: OperatorType) => void;
  updateValue: (id: string, value: FilterValue) => void;
  setConjunction: (conjunction: "and" | "or") => void;
  reset: () => void;

  // Derived
  isValid: boolean;
  activeCount: number;

  // Actions
  apply: () => void;
}

export const FilterContext = createContext<FilterContextValue | null>(null);

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterContext must be used within a FilterProvider");
  }
  return context;
};
`;

const TEMPLATE_PROVIDER_FILTER_PROVIDER_TSX = `"use client";

import type React from "react";
import { useCallback, useMemo } from "react";
import { DEFAULT_LOCALE } from "../constants";
import { getValidFilterRows, isValidFilterRow } from "../helpers/validators";
import { useFilterState } from "../hooks/use-filter-state";
import { useFilterUrlSync } from "../hooks/use-filter-url-sync";
import type { FilterConfig } from "../types";
import { FilterContext } from "./filter-context";

export interface FilterProviderProps {
  config: FilterConfig;
  children: React.ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ config, children }) => {
  const currentConfig = useMemo(() => {
    return {
      ...config,
      locale: { ...DEFAULT_LOCALE, ...config.locale },
    };
  }, [config]);

  const { initialState, applyChanges } = useFilterUrlSync(currentConfig);

  const {
    state,
    addRow,
    removeRow,
    updateField,
    updateOperator,
    updateValue,
    setConjunction,
    reset: localReset,
  } = useFilterState(initialState);

  const isValid = useMemo(() => state.rows.every(isValidFilterRow), [state.rows]);

  const activeCount = useMemo(() => getValidFilterRows(state.rows).length, [state.rows]);

  const apply = useCallback(() => {
    applyChanges(state);
  }, [applyChanges, state]);

  const reset = useCallback(() => {
    localReset();
    applyChanges({ rows: [], conjunction: "and" });
  }, [localReset, applyChanges]);

  const value = useMemo(
    () => ({
      config: currentConfig,
      state,
      addRow,
      removeRow,
      updateField,
      updateOperator,
      updateValue,
      setConjunction,
      reset,
      isValid,
      activeCount,
      apply,
    }),
    [
      currentConfig,
      state,
      addRow,
      removeRow,
      updateField,
      updateOperator,
      updateValue,
      setConjunction,
      reset,
      isValid,
      activeCount,
      apply,
    ],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};
`;

const TEMPLATE_TYPES_TS = `// ===== FIELD DEFINITION =====
export type FieldType = "text" | "number" | "select" | "multiselect" | "date" | "datetime" | "boolean" | "combobox";

export interface FilterFieldDefinition {
  /** Unique key, cũng là tên query param (e.g. "status", "category_id") */
  name: string;
  /** Label hiển thị trên UI */
  label: string;
  /** Loại input sẽ render */
  type: FieldType;
  /**
   * Danh sách operators được phép (nếu không truyền, lấy default)
   */
  operators?: OperatorType[];
  /**
   * Options tĩnh cho select/multiselect
   */
  options?: SelectOption[];
  /**
   * Hàm fetch options từ REST API (cho combobox/multiselect động)
   */
  fetchOptions?: (search: string) => Promise<SelectOption[]>;
}

// ===== OPERATORS =====
export type OperatorType =
  | "is" // =
  | "is_not" // !=
  | "contains" // *value*
  | "not_contains" // NOT *value*
  | "gt" // >
  | "gte" // >=
  | "lt" // <
  | "lte" // <=
  | "between" // range [from, to]
  | "in" // in list
  | "not_in" // not in list
  | "is_empty" // NULL/empty check
  | "is_not_empty";

// ===== SELECT OPTION =====
export interface SelectOption {
  label: string;
  value: string;
}

// ===== FILTER ROW (runtime state) =====
export interface FilterRow {
  id: string; // unique row id
  field: FilterFieldDefinition | null; // field đã chọn
  operator: OperatorType | null; // operator đã chọn
  value: FilterValue; // giá trị đã nhập
}

export type FilterValue =
  | string
  | string[]
  | number
  | [number, number] // range
  | [string, string] // date range
  | boolean
  | null;

// ===== FILTER STATE =====
export interface FilterState {
  rows: FilterRow[];
  conjunction: "and" | "or";
}

// ===== REST QUERY OUTPUT =====
export type RestQueryParams = Record<string, string | string[]>;

// ===== FILTER CONFIG (truyền vào Provider) =====
export interface FilterConfig {
  /** Danh sách fields có thể filter */
  fields: FilterFieldDefinition[];
  /** Cho phép toggle AND/OR. Default: false */
  allowConjunctionToggle?: boolean;
  /** Max filter rows. Default: 10 */
  maxRows?: number;
  /** Param style. Default: underscore */
  paramStyle?: "underscore" | "bracket" | "custom";
  /** Prefix appended to all query params. e.g "filter_" */
  paramPrefix?: string;
  /** Global search query param name. Default: q */
  searchParamName?: string;
  /** Custom builder */
  customParamBuilder?: (field: string, operator: OperatorType, value: FilterValue) => Record<string, string>;
  /** Locale */
  locale?: FilterLocale;
}

export interface FilterLocale {
  addFilter: string;
  reset: string;
  apply: string;
  placeholder: string;
  and: string;
  or: string;
  noFilters: string;
}
`;

const TEMPLATE_UI_FIELD_SELECT_TSX = `"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "__ALIAS__components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "__ALIAS__components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "__ALIAS__components/ui/popover";
import { cn } from "__ALIAS__lib/utils";
import { useFilterContext } from "../provider/filter-context";
import type { FilterFieldDefinition } from "../types";

export interface FieldSelectProps {
  rowId: string;
  selectedField: FilterFieldDefinition | null;
}

export function FieldSelect({ rowId, selectedField }: FieldSelectProps) {
  const { config, updateField } = useFilterContext();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[160px] justify-between font-normal"
        >
          <span className="truncate">{selectedField ? selectedField.label : "Select field..."}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search field..." />
          <CommandList>
            <CommandEmpty>No field found.</CommandEmpty>
            <CommandGroup>
              {config.fields.map((field) => (
                <CommandItem
                  key={field.name}
                  value={field.name}
                  onSelect={() => {
                    updateField(rowId, field);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", selectedField?.name === field.name ? "opacity-100" : "opacity-0")}
                  />
                  {field.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
`;

const TEMPLATE_UI_FILTER_BADGE_TSX = `"use client";

import { Badge } from "__ALIAS__components/ui/badge";
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
`;

const TEMPLATE_UI_FILTER_BAR_TSX = `"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Input } from "__ALIAS__components/ui/input";
import { cn } from "__ALIAS__lib/utils";
import { useFilterContext } from "../provider/filter-context";
import { FilterRoot } from "./filter-root";

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  hideSearch?: boolean;
  /**
   * Defines the layout order: "search-filters" or "filters-search"
   * @default "search-filters"
   */
  layout?: "search-filters" | "filters-search";
}

export const FilterBar = React.forwardRef<HTMLDivElement, FilterBarProps>(
  (
    {
      className,
      searchPlaceholder = "Search...",
      searchValue: externalSearchValue,
      onSearchChange,
      hideSearch = false,
      layout = "search-filters",
      ...props
    },
    ref,
  ) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { config } = useFilterContext();

    const searchParamName = config.searchParamName || "q";
    const internalSearchValue = searchParams.get(searchParamName) || "";

    const [localValue, setLocalValue] = React.useState(
      externalSearchValue !== undefined ? externalSearchValue : internalSearchValue,
    );

    const [, startTransition] = React.useTransition();
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Sync external changes (e.g. from clear filters) back into local state
    React.useEffect(() => {
      if (externalSearchValue !== undefined) {
        setLocalValue(externalSearchValue);
      } else {
        setLocalValue(internalSearchValue);
      }
    }, [externalSearchValue, internalSearchValue]);

    const handleSearchChange = (value: string) => {
      if (onSearchChange) {
        onSearchChange(value);
        return;
      }

      setLocalValue(value);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set(searchParamName, value);
        } else {
          params.delete(searchParamName);
        }
        const queryStr = params.toString();
        const newPath = queryStr ? \`\${pathname}?\${queryStr}\` : pathname;

        startTransition(() => {
          router.replace(newPath, { scroll: false });
        });
      }, 300);
    };

    const searchComponent = !hideSearch && (
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-8"
            value={localValue}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>
    );

    const filtersComponent = (
      <div className="flex items-center gap-2">
        <FilterRoot />
      </div>
    );

    return (
      <div ref={ref} className={cn("flex items-center justify-between gap-4", className)} {...props}>
        {layout === "filters-search" ? (
          <>
            {filtersComponent}
            {searchComponent}
          </>
        ) : (
          <>
            {searchComponent}
            {filtersComponent}
          </>
        )}
      </div>
    );
  },
);
FilterBar.displayName = "FilterBar";
`;

const TEMPLATE_UI_FILTER_FOOTER_TSX = `"use client";

import { Button } from "__ALIAS__components/ui/button";
import { PopoverClose } from "__ALIAS__components/ui/popover";
import { isValidFilterRow } from "../helpers/validators";
import { useFilterContext } from "../provider/filter-context";

export function FilterFooter() {
  const { config, addRow, reset, apply, state, setConjunction } = useFilterContext();
  const maxRows = config.maxRows || 10;
  const canAddMore = state.rows.length < maxRows;

  // Determine if there is at least one valid filter row
  const hasValidFilters = state.rows.some(isValidFilterRow);

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={addRow} disabled={!canAddMore} className="text-sm font-medium">
          {config.locale?.addFilter || "+ Add filter"}
        </Button>
        {config.allowConjunctionToggle && state.rows.length > 1 && (
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-md">
            <Button
              variant={state.conjunction === "and" ? "default" : "ghost"}
              size="sm"
              onClick={() => setConjunction("and")}
              className="h-7 text-xs px-3"
            >
              {config.locale?.and || "AND"}
            </Button>
            <Button
              variant={state.conjunction === "or" ? "default" : "ghost"}
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
`;

const TEMPLATE_UI_FILTER_ROOT_TSX = `"use client";

import { Filter as FilterIcon } from "lucide-react";
import { Button } from "__ALIAS__components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "__ALIAS__components/ui/popover";
import { ScrollArea } from "__ALIAS__components/ui/scroll-area";
import { useFilterContext } from "../provider/filter-context";
import { FilterBadge } from "./filter-badge";
import { FilterFooter } from "./filter-footer";
import { FilterRowComponent } from "./filter-row";

export function FilterRoot() {
  const { state, config } = useFilterContext();

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
          <div className="flex flex-col gap-2">
            {state.rows.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {config.locale?.noFilters || "No filters active"}
              </div>
            ) : (
              state.rows.map((row) => <FilterRowComponent key={row.id} rowId={row.id} />)
            )}
          </div>
        </ScrollArea>
        <FilterFooter />
      </PopoverContent>
    </Popover>
  );
}
`;

const TEMPLATE_UI_FILTER_ROW_TSX = `"use client";

import { Trash2 } from "lucide-react";
import { Button } from "__ALIAS__components/ui/button";
import { useFilterContext } from "../provider/filter-context";
import { FieldSelect } from "./field-select";
import { OperatorSelect } from "./operator-select";
import { ValueInput } from "./value-input";

interface FilterRowProps {
  rowId: string;
}

export function FilterRowComponent({ rowId }: FilterRowProps) {
  const { state, removeRow } = useFilterContext();
  const row = state.rows.find((r) => r.id === rowId);

  if (!row) return null;

  return (
    <div className="flex items-center space-x-2 w-full py-2">
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
`;

const TEMPLATE_UI_OPERATOR_SELECT_TSX = `"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "__ALIAS__components/ui/select";
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
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Operator" />
        </SelectTrigger>
      </Select>
    );
  }

  const allowedOperators = fieldDef.operators || DEFAULT_OPERATORS[fieldDef.type] || ["is"];

  return (
    <Select value={selectedOperator || ""} onValueChange={(val) => updateOperator(rowId, val as OperatorType)}>
      <SelectTrigger className="w-[160px]">
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
`;

const TEMPLATE_UI_VALUE_INPUT_TSX = `"use client";

import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import React from "react";
import { Button } from "__ALIAS__components/ui/button";
import { Calendar } from "__ALIAS__components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "__ALIAS__components/ui/command";
import { Input } from "__ALIAS__components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "__ALIAS__components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "__ALIAS__components/ui/select";
import { cn } from "__ALIAS__lib/utils";
import { useFilterOptions } from "../hooks/use-filter-options";
import { useFilterContext } from "../provider/filter-context";
import type { FilterFieldDefinition, FilterValue, OperatorType } from "../types";

interface ValueInputProps {
  rowId: string;
  field: FilterFieldDefinition;
  operator: OperatorType;
  value: FilterValue;
}

export function ValueInput({ rowId, field, operator, value }: ValueInputProps) {
  const { updateValue } = useFilterContext();

  if (operator === "is_empty" || operator === "is_not_empty") {
    return null; // value doesn't matter
  }

  const handleChange = (val: FilterValue) => {
    updateValue(rowId, val);
  };

  const isDateField = field.type === "date" || field.type === "datetime";

  // Range
  if (operator === "between") {
    const valArr = Array.isArray(value) ? value : ["", ""];

    if (isDateField) {
      return (
        <div className="flex items-center flex-1 space-x-2">
          <DatePickerInput
            value={valArr[0] as string}
            onChange={(dateStr) => handleChange([dateStr, String(valArr[1])] as FilterValue)}
            placeholder="Start date"
          />
          <span className="text-muted-foreground">-</span>
          <DatePickerInput
            value={valArr[1] as string}
            onChange={(dateStr) => handleChange([String(valArr[0]), dateStr] as FilterValue)}
            placeholder="End date"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center flex-1 space-x-2">
        <Input
          type={field.type === "number" ? "number" : "text"}
          placeholder="Min"
          value={(valArr[0] as string | number) || ""}
          onChange={(e) => handleChange([e.target.value, String(valArr[1])] as FilterValue)}
          className="flex-1 min-w-[80px]"
        />
        <span className="text-muted-foreground">-</span>
        <Input
          type={field.type === "number" ? "number" : "text"}
          placeholder="Max"
          value={(valArr[1] as string | number) || ""}
          onChange={(e) => handleChange([String(valArr[0]), e.target.value] as FilterValue)}
          className="flex-1 min-w-[80px]"
        />
      </div>
    );
  }

  // Boolean
  if (field.type === "boolean") {
    return (
      <Select
        value={value === true ? "true" : value === false ? "false" : ""}
        onValueChange={(val) => handleChange(val === "true")}
      >
        <SelectTrigger className="flex-1 min-w-[120px]">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Yes</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  // Select (Static options)
  if (field.type === "select" && field.options) {
    return (
      <Select value={(value as string) || ""} onValueChange={handleChange}>
        <SelectTrigger className="flex-1 min-w-[120px]">
          <SelectValue placeholder="Select option..." />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Combobox (Dynamic options)
  if (field.type === "combobox" && field.fetchOptions) {
    return <ComboboxValueInput field={field} value={value} onChange={handleChange} />;
  }

  // Date Picker
  if (isDateField) {
    return (
      <DatePickerInput
        value={value as string}
        onChange={handleChange}
        placeholder="Pick a date"
        className="flex-1 min-w-[120px]"
      />
    );
  }

  // Default Input (Text, Number)
  return (
    <Input
      type={field.type === "number" ? "number" : "text"}
      placeholder="Value..."
      value={(value as string | number) || ""}
      onChange={(e) => handleChange(e.target.value)}
      className="flex-1 min-w-[120px]"
    />
  );
}

function DatePickerInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const date = value ? new Date(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("justify-start text-left font-normal flex-1", !date && "text-muted-foreground", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function ComboboxValueInput({
  field,
  value,
  onChange,
}: {
  field: FilterFieldDefinition;
  value: FilterValue;
  onChange: (val: FilterValue) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const { options, loading, search } = useFilterOptions(field.fetchOptions);

  const selectedLabel = React.useMemo(() => {
    if (!value) return "Select...";
    const opt = options.find((o) => o.value === value);
    return opt ? opt.label : value;
  }, [value, options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex-1 min-w-[120px] justify-between font-normal"
        >
          {selectedLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search..." onValueChange={search} />
          <CommandList>
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : options.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === opt.value ? "opacity-100" : "opacity-0")} />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
`;

export function getTemplateFiles(alias: string): Record<string, string> {
  const replaceAlias = (content: string) => content.replaceAll(ALIAS, alias);
  return {
    "constants.ts": replaceAlias(TEMPLATE_CONSTANTS_TS),
    "helpers/operators.ts": replaceAlias(TEMPLATE_HELPERS_OPERATORS_TS),
    "helpers/query-builder.ts": replaceAlias(TEMPLATE_HELPERS_QUERY_BUILDER_TS),
    "helpers/serializer.ts": replaceAlias(TEMPLATE_HELPERS_SERIALIZER_TS),
    "helpers/validators.ts": replaceAlias(TEMPLATE_HELPERS_VALIDATORS_TS),
    "hooks/use-filter-options.ts": replaceAlias(TEMPLATE_HOOKS_USE_FILTER_OPTIONS_TS),
    "hooks/use-filter-query.ts": replaceAlias(TEMPLATE_HOOKS_USE_FILTER_QUERY_TS),
    "hooks/use-filter-state.ts": replaceAlias(TEMPLATE_HOOKS_USE_FILTER_STATE_TS),
    "hooks/use-filter-url-sync.ts": replaceAlias(TEMPLATE_HOOKS_USE_FILTER_URL_SYNC_TS),
    "index.ts": replaceAlias(TEMPLATE_INDEX_TS),
    "provider/filter-context.ts": replaceAlias(TEMPLATE_PROVIDER_FILTER_CONTEXT_TS),
    "provider/filter-provider.tsx": replaceAlias(TEMPLATE_PROVIDER_FILTER_PROVIDER_TSX),
    "types.ts": replaceAlias(TEMPLATE_TYPES_TS),
    "ui/field-select.tsx": replaceAlias(TEMPLATE_UI_FIELD_SELECT_TSX),
    "ui/filter-badge.tsx": replaceAlias(TEMPLATE_UI_FILTER_BADGE_TSX),
    "ui/filter-bar.tsx": replaceAlias(TEMPLATE_UI_FILTER_BAR_TSX),
    "ui/filter-footer.tsx": replaceAlias(TEMPLATE_UI_FILTER_FOOTER_TSX),
    "ui/filter-root.tsx": replaceAlias(TEMPLATE_UI_FILTER_ROOT_TSX),
    "ui/filter-row.tsx": replaceAlias(TEMPLATE_UI_FILTER_ROW_TSX),
    "ui/operator-select.tsx": replaceAlias(TEMPLATE_UI_OPERATOR_SELECT_TSX),
    "ui/value-input.tsx": replaceAlias(TEMPLATE_UI_VALUE_INPUT_TSX),
  };
}
