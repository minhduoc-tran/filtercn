"use client";

import type React from "react";
import { useCallback, useMemo } from "react";
import { DEFAULT_LOCALE } from "../constants";
import { countValidRows } from "../helpers/validators";
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
    addGroup,
    removeGroup,
    reset: localReset,
    getGroupDepth,
  } = useFilterState(initialState);

  const isValid = useMemo(() => countValidRows(state.root) > 0, [state.root]);

  const activeCount = useMemo(() => countValidRows(state.root), [state.root]);

  const apply = useCallback(() => {
    applyChanges(state);
  }, [applyChanges, state]);

  const reset = useCallback(() => {
    localReset();
    applyChanges({ root: { id: "reset", conjunction: "and", children: [] } });
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
      addGroup,
      removeGroup,
      reset,
      isValid,
      activeCount,
      apply,
      getGroupDepth,
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
      addGroup,
      removeGroup,
      reset,
      isValid,
      activeCount,
      apply,
      getGroupDepth,
    ],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};
