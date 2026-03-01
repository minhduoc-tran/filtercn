import { describe, expect, it } from "vitest";
import { buildRestQuery } from "../helpers/query-builder";
import { deserializeUrlToFilters, serializeFiltersToUrl } from "../helpers/serializer";
import { getValidRowsFromGroup } from "../helpers/validators";
import type { FilterConfig, FilterRow, FilterState } from "../types";

const mockConfig: FilterConfig = {
  fields: [
    { name: "status", label: "Status", type: "select" },
    { name: "price", label: "Price", type: "number" },
    { name: "name", label: "Name", type: "text" },
    { name: "published_at", label: "Published At", type: "date" },
  ],
  paramStyle: "underscore",
  paramPrefix: "filter_",
};

/** Helper to create a FilterState from flat rows + conjunction */
function makeState(rows: FilterRow[], conjunction: "and" | "or" = "and"): FilterState {
  return {
    root: {
      id: "test-root",
      conjunction,
      children: rows.map((row) => ({ type: "row" as const, row })),
    },
  };
}

describe("Integration: Filter Roundtrip", () => {
  it("should serialize, generate query, and deserialize back to original state correctly", () => {
    const statusField = mockConfig.fields[0];
    const priceField = mockConfig.fields[1];
    const nameField = mockConfig.fields[2];

    if (!statusField || !priceField || !nameField) {
      throw new Error("Missing test fields from mock config");
    }

    const rows: FilterRow[] = [
      { id: "1", field: statusField, operator: "in", value: ["active", "draft"] },
      { id: "2", field: priceField, operator: "between", value: ["100", "500"] },
      { id: "3", field: nameField, operator: "contains", value: "shirt" },
    ];

    // 1. Initial State
    const initialState = makeState(rows, "or");

    // 2. Serialize to URL
    const urlParams = serializeFiltersToUrl(initialState, mockConfig);
    const urlString = urlParams.toString();

    expect(urlString).toContain("conjunction=or");
    expect(urlString).toContain("filter_status__in=active%2Cdraft");
    expect(urlString).toContain("filter_price__range=100%2C500");
    expect(urlString).toContain("filter_name__icontains=shirt");

    // 3. Build REST Query from the SAME rows
    const restQuery = buildRestQuery(rows, mockConfig);

    expect(restQuery).toEqual({
      filter_status__in: "active,draft",
      filter_price__range: "100,500",
      filter_name__icontains: "shirt",
    });

    // 4. Deserialize URL back to State
    const parsedParams = new URLSearchParams(urlString);
    const restoredState = deserializeUrlToFilters(parsedParams, mockConfig);
    const restoredRows = getValidRowsFromGroup(restoredState.root);

    // 5. Compare initial and restored
    expect(restoredState.root.conjunction).toBe("or");
    expect(restoredRows).toHaveLength(3);

    const statusRow = restoredRows.find((r) => r.field?.name === "status");
    const priceRow = restoredRows.find((r) => r.field?.name === "price");
    const nameRow = restoredRows.find((r) => r.field?.name === "name");

    expect(statusRow?.operator).toBe("in");
    expect(statusRow?.value).toEqual(["active", "draft"]);

    expect(priceRow?.operator).toBe("between");
    expect(priceRow?.value).toEqual(["100", "500"]);

    expect(nameRow?.operator).toBe("contains");
    expect(nameRow?.value).toBe("shirt");
  });
});
