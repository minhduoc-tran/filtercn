"use client";

import { useMemo } from "react";
import { buildRestQuery } from "../helpers/query-builder";
import { useFilterContext } from "../provider/filter-context";

export function useFilterQuery() {
  const { state, config, activeCount, isValid } = useFilterContext();

  const queryParams = useMemo(() => {
    return buildRestQuery(state.rows, config);
  }, [state.rows, config]);

  return {
    queryParams,
    activeCount,
    isValid,
    conjunction: state.conjunction,
  };
}
