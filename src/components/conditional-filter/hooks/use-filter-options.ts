"use client";

import { useCallback, useEffect, useState } from "react";
import type { SelectOption } from "../types";

export const useFilterOptions = (fetchFn?: (search: string) => Promise<SelectOption[]>) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(
    async (query: string) => {
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
