"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { deserializeUrlToFilters, serializeFiltersToUrl } from "../helpers/serializer";
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
      // Only serialize valid rows but keep the tree structure
      handleSync(newState);
    },
    [handleSync],
  );

  return {
    initialState: syncedState,
    applyChanges,
  };
};
