"use client";

import { useMemo } from "react";
import { buildNestedQuery, buildRestQuery } from "../helpers/query-builder";
import { getValidRowsFromGroup, hasSubGroups } from "../helpers/validators";
import { useFilterContext } from "../provider/filter-context";

export function useFilterQuery() {
  const { state, config, activeCount, isValid } = useFilterContext();

  const queryParams = useMemo(() => {
    if (hasSubGroups(state.root)) {
      return buildNestedQuery(state.root, config);
    }
    const rows = getValidRowsFromGroup(state.root);
    return buildRestQuery(rows, config);
  }, [state.root, config]);

  return {
    queryParams,
    activeCount,
    isValid,
    conjunction: state.root.conjunction,
  };
}
