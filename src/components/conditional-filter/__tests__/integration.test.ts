import { describe, expect, it } from "vitest";
import { buildRestQuery } from "../helpers/query-builder";
import { deserializeUrlToFilters, serializeFiltersToUrl } from "../helpers/serializer";
import type { FilterConfig, FilterState } from "../types";

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

describe("Integration: Filter Roundtrip", () => {
  it("should serialize, generate query, and deserialize back to original state correctly", () => {
    const statusField = mockConfig.fields[0];
    const priceField = mockConfig.fields[1];
    const nameField = mockConfig.fields[2];

    if (!statusField || !priceField || !nameField) {
      throw new Error("Missing test fields from mock config");
    }

    // 1. Initial State
    const initialState: FilterState = {
      conjunction: "or",
      rows: [
        {
          id: "1",
          field: statusField,
          operator: "in",
          value: ["active", "draft"],
        },
        {
          id: "2",
          field: priceField,
          operator: "between",
          value: ["100", "500"],
        },
        {
          id: "3",
          field: nameField,
          operator: "contains",
          value: "shirt",
        },
      ],
    };

    // 2. Serialize to URL
    const urlParams = serializeFiltersToUrl(initialState, mockConfig);
    const urlString = urlParams.toString();

    // Expected URL parts: conjunction=or & filter_status__in=active,draft & filter_price__range=100,500 & filter_name__icontains=shirt
    expect(urlString).toContain("conjunction=or");
    expect(urlString).toContain("filter_status__in=active%2Cdraft");
    expect(urlString).toContain("filter_price__range=100%2C500");
    expect(urlString).toContain("filter_name__icontains=shirt");

    // 3. Build REST Query from the SAME state
    const restQuery = buildRestQuery(initialState.rows, mockConfig);

    // Expected REST query payload
    expect(restQuery).toEqual({
      filter_status__in: "active,draft",
      filter_price__range: "100,500",
      filter_name__icontains: "shirt",
    });

    // 4. Deserialize URL back to State
    const parsedParams = new URLSearchParams(urlString);
    const restoredState = deserializeUrlToFilters(parsedParams, mockConfig);

    // 5. Compare initial and restored
    expect(restoredState.conjunction).toBe("or");
    expect(restoredState.rows).toHaveLength(3);

    // Filter order in URLSearchParams might vary occasionally in theory,
    // but mostly matches insertion. Let's find them reliably.
    const statusRow = restoredState.rows.find((r) => r.field?.name === "status");
    const priceRow = restoredState.rows.find((r) => r.field?.name === "price");
    const nameRow = restoredState.rows.find((r) => r.field?.name === "name");

    expect(statusRow?.operator).toBe("in");
    expect(statusRow?.value).toEqual(["active", "draft"]);

    expect(priceRow?.operator).toBe("between");
    expect(priceRow?.value).toEqual(["100", "500"]);

    expect(nameRow?.operator).toBe("contains");
    expect(nameRow?.value).toBe("shirt");
  });
});
