"use client";

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
      // Simplest approach: create a fresh URLSearchParams, add all from `newParams`,
      // then add anything from `currentParams` that isn't managed by the filter.
      // For simplicity, we just keep the search param if provided.
      if (currentSearchParam) {
        newParams.set(searchParamName, currentSearchParam);
      }

      const queryStr = newParams.toString();
      const newPath = queryStr ? `${pathname}?${queryStr}` : pathname;

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
