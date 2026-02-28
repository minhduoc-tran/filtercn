"use client";

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
    ],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};
