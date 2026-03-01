"use client";

import { createContext, useContext } from "react";
import type { FilterConfig, FilterFieldDefinition, FilterState, FilterValue, OperatorType } from "../types";

export interface FilterContextValue {
  config: FilterConfig;
  state: FilterState;

  // Row mutations
  addRow: (groupId?: string) => void;
  removeRow: (id: string) => void;
  updateField: (id: string, field: FilterFieldDefinition) => void;
  updateOperator: (id: string, operator: OperatorType) => void;
  updateValue: (id: string, value: FilterValue) => void;

  // Group mutations
  addGroup: (parentGroupId?: string) => void;
  removeGroup: (groupId: string) => void;
  setConjunction: (conjunction: "and" | "or", groupId?: string) => void;

  // Derived
  isValid: boolean;
  activeCount: number;

  // Actions
  reset: () => void;
  apply: () => void;

  // Helpers
  getGroupDepth: (groupId: string) => number;
}

export const FilterContext = createContext<FilterContextValue | null>(null);

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterContext must be used within a FilterProvider");
  }
  return context;
};
