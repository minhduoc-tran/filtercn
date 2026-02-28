"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { deserializeUrlToFilters, serializeFiltersToUrl } from "../helpers/serializer";
import { getValidFilterRows } from "../helpers/validators";
import type { FilterConfig, FilterState } from "../types";

interface UseFilterUrlSyncOptions {
  syncMode: "immediate" | "on-apply";
}

export const useFilterUrlSync = (config: FilterConfig, options: UseFilterUrlSyncOptions) => {
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

  const applyChanges = useCallback(
    (newState: FilterState) => {
      const validState = { ...newState, rows: getValidFilterRows(newState.rows) };
      const newParams = serializeFiltersToUrl(validState, config);

      // In a real application, you might want to preserve non-filter params like pagination `page=2`.
      // For this example, we overwrite all or keep non-filter depending on implementation.
      // Let's assume conditional-filter params prefixing isn't strictly enforced for now.
      // We just replace.
      const searchString = newParams.toString();
      const query = searchString ? `?${searchString}` : "";
      router.replace(`${pathname}${query}`, { scroll: false });
    },
    [config, router, pathname],
  );

  return {
    initialState: syncedState,
    applyChanges,
  };
};
