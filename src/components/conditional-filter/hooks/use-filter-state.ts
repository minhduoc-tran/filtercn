"use client";

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
