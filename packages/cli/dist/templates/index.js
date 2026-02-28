/**
 * All template files for the conditional-filter component.
 * Each key is the relative path within the component directory,
 * and each value is the file content.
 *
 * The `ALIAS` placeholder is replaced with the user's actual import alias.
 */
const ALIAS = "__ALIAS__";
// ===================== types.ts =====================
const TYPES = `// ===== FIELD DEFINITION =====
export type FieldType = "text" | "number" | "select" | "multiselect"
  | "date" | "datetime" | "boolean" | "combobox";

export interface FilterFieldDefinition {
  /** Unique key, also used as the query param name (e.g. "status", "category_id") */
  name: string;
  /** Label displayed in the UI */
  label: string;
  /** Input type to render */
  type: FieldType;
  /** Allowed operators (defaults based on type if not provided) */
  operators?: OperatorType[];
  /** Static options for select/multiselect */
  options?: SelectOption[];
  /** Async function to fetch options from a REST API (for combobox/dynamic multiselect) */
  fetchOptions?: (search: string) => Promise<SelectOption[]>;
}

// ===== OPERATORS =====
export type OperatorType =
  | "is"           // =
  | "is_not"       // !=
  | "contains"     // *value*
  | "not_contains" // NOT *value*
  | "gt"           // >
  | "gte"          // >=
  | "lt"           // <
  | "lte"          // <=
  | "between"      // range [from, to]
  | "in"           // in list
  | "not_in"       // not in list
  | "is_empty"     // NULL/empty check
  | "is_not_empty";

// ===== SELECT OPTION =====
export interface SelectOption {
  label: string;
  value: string;
}

// ===== FILTER ROW (runtime state) =====
export interface FilterRow {
  id: string;                        // unique row id
  field: FilterFieldDefinition | null;  // selected field
  operator: OperatorType | null;     // selected operator
  value: FilterValue;                // entered value
}

export type FilterValue =
  | string
  | string[]
  | number
  | [number, number]   // range
  | [string, string]   // date range
  | boolean
  | null;

// ===== FILTER STATE =====
export interface FilterState {
  rows: FilterRow[];
  conjunction: "and" | "or";
}

// ===== REST QUERY OUTPUT =====
export type RestQueryParams = Record<string, string | string[]>;

// ===== FILTER CONFIG (passed to Provider) =====
export interface FilterConfig {
  /** List of fields available for filtering */
  fields: FilterFieldDefinition[];
  /** Allow toggling AND/OR. Default: false */
  allowConjunctionToggle?: boolean;
  /** Max filter rows. Default: 10 */
  maxRows?: number;
  /** Param style. Default: underscore */
  paramStyle?: "underscore" | "bracket" | "custom";
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
// ===================== constants.ts =====================
const CONSTANTS = `import type { FilterLocale, OperatorType, FieldType } from "./types";

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
// ===================== helpers/operators.ts =====================
const OPERATORS = `import type { OperatorType } from "../types";

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
// ===================== helpers/validators.ts =====================
const VALIDATORS = `import type { FilterRow } from "../types";

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
// ===================== helpers/query-builder.ts =====================
const QUERY_BUILDER = `import type { FilterConfig, FilterRow, RestQueryParams } from "../types";
import { getOperatorSuffix } from "./operators";
import { getValidFilterRows } from "./validators";

export const buildRestQuery = (
  rows: FilterRow[],
  config: FilterConfig
): RestQueryParams => {
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
    
    let paramKey = row.field.name;
    if (style === "underscore" && suffix) {
      paramKey = \`\${row.field.name}\${suffix}\`;
    } else if (style === "bracket" && suffix) {
      paramKey = \`filter[\${row.field.name}]\${suffix}\`;
    } else if (style === "bracket" && !suffix) {
      paramKey = \`filter[\${row.field.name}]\`;
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
        paramValue = row.value.map(v => v.toString());
      }
    } else {
      paramValue = String(row.value);
    }

    params[paramKey] = paramValue;
  });

  return params;
};
`;
// ===================== helpers/serializer.ts =====================
const SERIALIZER = `import type { FilterConfig, FilterRow, FilterState, OperatorType } from "../types";
import { buildRestQuery } from "./query-builder";

export const serializeFiltersToUrl = (state: FilterState, config: FilterConfig): URLSearchParams => {
  const params = new URLSearchParams();
  const queryObj = buildRestQuery(state.rows, config);

  Object.entries(queryObj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v));
    } else {
      params.set(key, value);
    }
  });

  if (state.conjunction === "or" && config.allowConjunctionToggle) {
    params.set("conjunction", "or");
  }

  return params;
};

export const deserializeUrlToFilters = (params: URLSearchParams, config: FilterConfig): FilterState => {
  const rows: FilterRow[] = [];
  const style = config.paramStyle || "underscore";

  Array.from(params.entries()).forEach(([key, value]) => {
    if (key === "conjunction") return;

    let fieldName = key;
    let operatorStr = "";

    if (style === "underscore" && key.includes("__")) {
      const parts = key.split("__");
      operatorStr = parts.pop() || "";
      fieldName = parts.join("__");
    } else if (style === "bracket" && key.startsWith("filter[")) {
      const match = key.match(/filter\\[(.*?)\\](?:\\[(.*?)\\])?/);
      if (match && match[1]) {
        fieldName = match[1];
        operatorStr = match[2] || "";
      }
    }

    const fieldDef = config.fields.find(f => f.name === fieldName);
    if (!fieldDef) return;

    const suffixToOp: Record<string, OperatorType> = {
      "": "is",
      "not": "is_not",
      "icontains": "contains",
      "not_icontains": "not_contains",
      "gt": "gt",
      "gte": "gte",
      "lt": "lt",
      "lte": "lte",
      "range": "between",
      "in": "in",
      "not_in": "not_in",
      "isnull": value === "true" ? "is_empty" : "is_not_empty"
    };

    const operator = suffixToOp[operatorStr] || "is";
    let parsedValue: any = value;

    if (operator === "between" && typeof value === 'string' && value.includes(",")) {
      parsedValue = value.split(",");
    } else if ((operator === "in" || operator === "not_in") && typeof value === 'string' && value.includes(",")) {
      parsedValue = value.split(",");
    }

    rows.push({
      id: crypto.randomUUID(),
      field: fieldDef,
      operator,
      value: parsedValue
    });
  });

  return {
    rows,
    conjunction: params.get("conjunction") === "or" ? "or" : "and",
  };
};
`;
// ===================== hooks/use-filter-state.ts =====================
const USE_FILTER_STATE = `"use client";

import { useState, useCallback } from "react";
import type { FilterState, FilterFieldDefinition, OperatorType, FilterValue } from "../types";

export const useFilterState = (initialState?: FilterState) => {
  const [state, setState] = useState<FilterState>(initialState || { rows: [], conjunction: "and" });

  const addRow = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rows: [
        ...prev.rows,
        { id: crypto.randomUUID(), field: null, operator: null, value: null },
      ],
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
      rows: prev.rows.map((row) =>
        row.id === id ? { ...row, field, operator: null, value: null } : row
      ),
    }));
  }, []);

  const updateOperator = useCallback((id: string, operator: OperatorType) => {
    setState((prev) => ({
      ...prev,
      rows: prev.rows.map((row) =>
        row.id === id ? { ...row, operator, value: null } : row
      ),
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
    overrideState
  };
};
`;
// ===================== hooks/use-filter-url-sync.ts =====================
const USE_FILTER_URL_SYNC = `"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { FilterState, FilterConfig } from "../types";
import { serializeFiltersToUrl, deserializeUrlToFilters } from "../helpers/serializer";
import { getValidFilterRows } from "../helpers/validators";

interface UseFilterUrlSyncOptions {
  syncMode: "immediate" | "on-apply";
}

export const useFilterUrlSync = (
  config: FilterConfig,
  _options: UseFilterUrlSyncOptions
) => {
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

  const applyChanges = useCallback((newState: FilterState) => {
    const validState = { ...newState, rows: getValidFilterRows(newState.rows) };
    const newParams = serializeFiltersToUrl(validState, config);
    const searchString = newParams.toString();
    const query = searchString ? \`?\${searchString}\` : "";
    router.replace(\`\${pathname}\${query}\`, { scroll: false });
  }, [config, router, pathname]);

  return {
    initialState: syncedState,
    applyChanges,
  };
};
`;
// ===================== hooks/use-filter-options.ts =====================
const USE_FILTER_OPTIONS = `"use client";

import { useState, useEffect, useCallback } from "react";
import type { SelectOption } from "../types";

export const useFilterOptions = (fetchFn?: (search: string) => Promise<SelectOption[]>) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!fetchFn) return;
    setLoading(true);
    try {
      const result = await fetchFn(query);
      setOptions(result);
    } catch (err) {
      console.error("Failed to fetch filter options", err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  // Initial fetch
  useEffect(() => {
    if (fetchFn) {
      search("");
    }
  }, [fetchFn, search]);

  return { options, loading, search };
};
`;
// ===================== provider/filter-context.ts =====================
const FILTER_CONTEXT = `"use client";

import { createContext, useContext } from "react";
import type { FilterConfig, FilterState, FilterFieldDefinition, OperatorType, FilterValue } from "../types";

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
// ===================== provider/filter-provider.tsx =====================
const FILTER_PROVIDER = `"use client";

import React, { useMemo, useCallback } from "react";
import type { FilterConfig } from "../types";
import { FilterContext } from "./filter-context";
import { useFilterState } from "../hooks/use-filter-state";
import { useFilterUrlSync } from "../hooks/use-filter-url-sync";
import { DEFAULT_LOCALE } from "../constants";
import { getValidFilterRows, isValidFilterRow } from "../helpers/validators";

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

  const { initialState, applyChanges } = useFilterUrlSync(currentConfig, {
    syncMode: "on-apply",
  });

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
    ]
  );

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};
`;
// ===================== index.ts =====================
const INDEX = `export * from "./types";
export * from "./constants";
export * from "./hooks/use-filter-state";
export * from "./hooks/use-filter-url-sync";
export * from "./hooks/use-filter-options";
export * from "./provider/filter-context";
export * from "./provider/filter-provider";

export * from "./ui/field-select";
export * from "./ui/operator-select";
export * from "./ui/value-input";
export * from "./ui/filter-row";
export * from "./ui/filter-footer";
export * from "./ui/filter-badge";
export * from "./ui/filter-root";

export { buildRestQuery } from "./helpers/query-builder";
export { serializeFiltersToUrl, deserializeUrlToFilters } from "./helpers/serializer";
export { isValidFilterRow, getValidFilterRows } from "./helpers/validators";
`;
/**
 * Returns all template files mapped to their relative paths
 * within the component directory. The alias placeholder will
 * be replaced by the init command.
 */
export function getTemplateFiles(alias) {
  // UI components use the alias for importing shadcn UI primitives
  const replaceAlias = (content) => content.replaceAll(ALIAS, alias);
  return {
    "types.ts": replaceAlias(TYPES),
    "constants.ts": replaceAlias(CONSTANTS),
    "index.ts": replaceAlias(INDEX),
    "helpers/operators.ts": replaceAlias(OPERATORS),
    "helpers/validators.ts": replaceAlias(VALIDATORS),
    "helpers/query-builder.ts": replaceAlias(QUERY_BUILDER),
    "helpers/serializer.ts": replaceAlias(SERIALIZER),
    "hooks/use-filter-state.ts": replaceAlias(USE_FILTER_STATE),
    "hooks/use-filter-url-sync.ts": replaceAlias(USE_FILTER_URL_SYNC),
    "hooks/use-filter-options.ts": replaceAlias(USE_FILTER_OPTIONS),
    "provider/filter-context.ts": replaceAlias(FILTER_CONTEXT),
    "provider/filter-provider.tsx": replaceAlias(FILTER_PROVIDER),
    ...getUITemplates(alias),
  };
}
/**
 * UI component templates — these use the alias for shadcn imports
 */
function getUITemplates(alias) {
  const FIELD_SELECT = `"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "${alias}components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "${alias}components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "${alias}components/ui/popover";
import { useFilterContext } from "../provider/filter-context";
import type { FilterFieldDefinition } from "../types";

interface FieldSelectProps {
  rowId: string;
}

export function FieldSelect({ rowId }: FieldSelectProps) {
  const [open, setOpen] = useState(false);
  const { config, state, updateField } = useFilterContext();
  const row = state.rows.find((r) => r.id === rowId);

  const handleSelect = (field: FilterFieldDefinition) => {
    updateField(rowId, field);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-[180px] justify-between text-sm">
          {row?.field?.label || config.locale?.placeholder || "Select..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search field..." />
          <CommandList>
            <CommandEmpty>No field found.</CommandEmpty>
            <CommandGroup>
              {config.fields.map((field) => (
                <CommandItem
                  key={field.name}
                  value={field.name}
                  onSelect={() => handleSelect(field)}
                >
                  <Check
                    className={\`mr-2 h-4 w-4 \${row?.field?.name === field.name ? "opacity-100" : "opacity-0"}\`}
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
  const OPERATOR_SELECT = `"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "${alias}components/ui/select";
import { useFilterContext } from "../provider/filter-context";
import { DEFAULT_OPERATORS } from "../constants";
import type { OperatorType } from "../types";

interface OperatorSelectProps {
  rowId: string;
}

const OPERATOR_LABELS: Record<OperatorType, string> = {
  is: "is",
  is_not: "is not",
  contains: "contains",
  not_contains: "not contains",
  gt: "greater than",
  gte: "greater or equal",
  lt: "less than",
  lte: "less or equal",
  between: "between",
  in: "in",
  not_in: "not in",
  is_empty: "is empty",
  is_not_empty: "is not empty",
};

export function OperatorSelect({ rowId }: OperatorSelectProps) {
  const { state, updateOperator } = useFilterContext();
  const row = state.rows.find((r) => r.id === rowId);

  if (!row?.field) return null;

  const operators = row.field.operators || DEFAULT_OPERATORS[row.field.type] || [];

  return (
    <Select
      value={row.operator || ""}
      onValueChange={(value) => updateOperator(rowId, value as OperatorType)}
    >
      <SelectTrigger className="w-[160px] text-sm">
        <SelectValue placeholder="Operator..." />
      </SelectTrigger>
      <SelectContent>
        {operators.map((op) => (
          <SelectItem key={op} value={op}>
            {OPERATOR_LABELS[op] || op}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
`;
  const VALUE_INPUT = `"use client";

import { useState, useEffect } from "react";
import { Input } from "${alias}components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "${alias}components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "${alias}components/ui/popover";
import { Button } from "${alias}components/ui/button";
import { Calendar } from "${alias}components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useFilterContext } from "../provider/filter-context";
import { useFilterOptions } from "../hooks/use-filter-options";
import { Badge } from "${alias}components/ui/badge";
import type { SelectOption } from "../types";

interface ValueInputProps {
  rowId: string;
}

export function ValueInput({ rowId }: ValueInputProps) {
  const { state, updateValue } = useFilterContext();
  const row = state.rows.find((r) => r.id === rowId);

  if (!row?.field || !row.operator) return null;

  // No value needed for empty checks
  if (row.operator === "is_empty" || row.operator === "is_not_empty") {
    return null;
  }

  const fieldType = row.field.type;

  switch (fieldType) {
    case "text":
      return <TextInput rowId={rowId} />;
    case "number":
      return row.operator === "between"
        ? <RangeInput rowId={rowId} />
        : <NumberInput rowId={rowId} />;
    case "select":
    case "combobox":
      return <SelectInput rowId={rowId} />;
    case "multiselect":
      return <MultiSelectInput rowId={rowId} />;
    case "date":
    case "datetime":
      return row.operator === "between"
        ? <DateRangeInput rowId={rowId} />
        : <DateInput rowId={rowId} />;
    case "boolean":
      return <BooleanInput rowId={rowId} />;
    default:
      return <TextInput rowId={rowId} />;
  }
}

function TextInput({ rowId }: { rowId: string }) {
  const { state, updateValue } = useFilterContext();
  const row = state.rows.find((r) => r.id === rowId);

  return (
    <Input
      type="text"
      placeholder="Enter value..."
      className="w-[200px] text-sm"
      value={(row?.value as string) || ""}
      onChange={(e) => updateValue(rowId, e.target.value)}
    />
  );
}

function NumberInput({ rowId }: { rowId: string }) {
  const { state, updateValue } = useFilterContext();
  const row = state.rows.find((r) => r.id === rowId);

  return (
    <Input
      type="number"
      placeholder="Enter number..."
      className="w-[200px] text-sm"
      value={(row?.value as string) || ""}
      onChange={(e) => updateValue(rowId, e.target.value)}
    />
  );
}

function RangeInput({ rowId }: { rowId: string }) {
  const { state, updateValue } = useFilterContext();
  const row = state.rows.find((r) => r.id === rowId);
  const values = Array.isArray(row?.value) ? row.value : ["", ""];

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        placeholder="From"
        className="w-[100px] text-sm"
        value={values[0]?.toString() || ""}
        onChange={(e) => updateValue(rowId, [e.target.value, values[1]?.toString() || ""])}
      />
      <span className="text-xs text-muted-foreground">to</span>
      <Input
        type="number"
        placeholder="To"
        className="w-[100px] text-sm"
        value={values[1]?.toString() || ""}
        onChange={(e) => updateValue(rowId, [values[0]?.toString() || "", e.target.value])}
      />
    </div>
  );
}

function SelectInput({ rowId }: { rowId: string }) {
  const { state, updateValue } = useFilterContext();
  const row = state.rows.find((r) => r.id === rowId);
  const { options: fetchedOptions } = useFilterOptions(row?.field?.fetchOptions);
  const options: SelectOption[] = row?.field?.options || fetchedOptions || [];

  return (
    <Select
      value={(row?.value as string) || ""}
      onValueChange={(value) => updateValue(rowId, value)}
    >
      <SelectTrigger className="w-[200px] text-sm">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MultiSelectInput({ rowId }: { rowId: string }) {
  const { state, updateValue } = useFilterContext();
  const row = state.rows.find((r) => r.id === rowId);
  const selectedValues = Array.isArray(row?.value) ? (row.value as string[]) : [];
  const options: SelectOption[] = row?.field?.options || [];

  const toggleValue = (val: string) => {
    const newValues = selectedValues.includes(val)
      ? selectedValues.filter((v) => v !== val)
      : [...selectedValues, val];
    updateValue(rowId, newValues);
  };

  return (
    <div className="flex flex-wrap gap-1 max-w-[300px]">
      {options.map((opt) => (
        <Badge
          key={opt.value}
          variant={selectedValues.includes(opt.value) ? "default" : "outline"}
          className="cursor-pointer text-xs"
          onClick={() => toggleValue(opt.value)}
        >
          {opt.label}
        </Badge>
      ))}
    </div>
  );
}

function DateInput({ rowId }: { rowId: string }) {
  const { state, updateValue } = useFilterContext();
  const row = state.rows.find((r) => r.id === rowId);
  const [open, setOpen] = useState(false);
  const dateValue = row?.value ? new Date(row.value as string) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-start text-sm font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={(date) => {
            if (date) {
              updateValue(rowId, format(date, "yyyy-MM-dd"));
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function DateRangeInput({ rowId }: { rowId: string }) {
  const { state, updateValue } = useFilterContext();
  const row = state.rows.find((r) => r.id === rowId);
  const values = Array.isArray(row?.value) ? row.value : ["", ""];

  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        className="w-[150px] text-sm"
        value={(values[0] as string) || ""}
        onChange={(e) => updateValue(rowId, [e.target.value, values[1] as string || ""])}
      />
      <span className="text-xs text-muted-foreground">to</span>
      <Input
        type="date"
        className="w-[150px] text-sm"
        value={(values[1] as string) || ""}
        onChange={(e) => updateValue(rowId, [values[0] as string || "", e.target.value])}
      />
    </div>
  );
}

function BooleanInput({ rowId }: { rowId: string }) {
  const { state, updateValue } = useFilterContext();
  const row = state.rows.find((r) => r.id === rowId);

  return (
    <Select
      value={row?.value?.toString() || ""}
      onValueChange={(value) => updateValue(rowId, value === "true")}
    >
      <SelectTrigger className="w-[120px] text-sm">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="true">True</SelectItem>
        <SelectItem value="false">False</SelectItem>
      </SelectContent>
    </Select>
  );
}
`;
  const FILTER_ROW = `"use client";

import { Trash2 } from "lucide-react";
import { Button } from "${alias}components/ui/button";
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
    <div className="flex items-center gap-2 flex-wrap">
      <FieldSelect rowId={rowId} />
      {row.field && <OperatorSelect rowId={rowId} />}
      {row.field && row.operator && <ValueInput rowId={rowId} />}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => removeRow(rowId)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
`;
  const FILTER_FOOTER = `"use client";

import { Plus, RotateCcw, Check } from "lucide-react";
import { Button } from "${alias}components/ui/button";
import { useFilterContext } from "../provider/filter-context";
import { PopoverClose } from "${alias}components/ui/popover";
import { isValidFilterRow } from "../helpers/validators";

export function FilterFooter() {
  const { config, state, addRow, reset, apply } = useFilterContext();
  const maxRows = config.maxRows || 10;
  const canAdd = state.rows.length < maxRows;

  // Determine if there is at least one valid filter row
  const hasValidFilters = state.rows.some(isValidFilterRow);

  return (
    <div className="flex items-center gap-2 pt-2">
      <Button variant="outline" size="sm" onClick={addRow} disabled={!canAdd}>
        <Plus className="mr-1 h-4 w-4" />
        {config.locale?.addFilter || "+ Add filter"}
      </Button>
      <PopoverClose asChild>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="mr-1 h-4 w-4" />
          {config.locale?.reset || "Reset"}
        </Button>
      </PopoverClose>
      {hasValidFilters ? (
        <PopoverClose asChild>
          <Button size="sm" onClick={apply}>
            <Check className="mr-1 h-4 w-4" />
            {config.locale?.apply || "Apply"}
          </Button>
        </PopoverClose>
      ) : (
        <Button size="sm" disabled>
          <Check className="mr-1 h-4 w-4" />
          {config.locale?.apply || "Apply"}
        </Button>
      )}
    </div>
  );
}
`;
  const FILTER_BADGE = `"use client";

import { useFilterContext } from "../provider/filter-context";
import { Badge } from "${alias}components/ui/badge";

export function FilterBadge() {
  const { activeCount } = useFilterContext();
  if (activeCount === 0) return null;
  return <Badge variant="secondary">{activeCount} active</Badge>;
}
`;
  const FILTER_ROOT = `"use client";

import { useFilterContext } from "../provider/filter-context";
import { FilterRowComponent } from "./filter-row";
import { FilterFooter } from "./filter-footer";

export function FilterRoot() {
  const { state, config } = useFilterContext();

  return (
    <div className="space-y-3 rounded-lg border p-4">
      {state.rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {config.locale?.noFilters || "No filters active"}
        </p>
      ) : (
        <div className="space-y-2">
          {state.rows.map((row, index) => (
            <div key={row.id} className="flex items-center gap-2">
              {index > 0 && config.allowConjunctionToggle && (
                <span className="text-xs font-medium text-muted-foreground w-10 text-center">
                  {state.conjunction.toUpperCase()}
                </span>
              )}
              {index > 0 && !config.allowConjunctionToggle && (
                <span className="text-xs font-medium text-muted-foreground w-10 text-center">
                  {state.conjunction.toUpperCase()}
                </span>
              )}
              <FilterRowComponent rowId={row.id} />
            </div>
          ))}
        </div>
      )}
      <FilterFooter />
    </div>
  );
}
`;
  return {
    "ui/field-select.tsx": FIELD_SELECT,
    "ui/operator-select.tsx": OPERATOR_SELECT,
    "ui/value-input.tsx": VALUE_INPUT,
    "ui/filter-row.tsx": FILTER_ROW,
    "ui/filter-footer.tsx": FILTER_FOOTER,
    "ui/filter-badge.tsx": FILTER_BADGE,
    "ui/filter-root.tsx": FILTER_ROOT,
  };
}
//# sourceMappingURL=index.js.map
