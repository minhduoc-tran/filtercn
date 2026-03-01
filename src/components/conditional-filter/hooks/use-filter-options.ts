"use client";

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
