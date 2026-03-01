import { describe, expect, it } from "vitest";
import { deserializeUrlToFilters, serializeFiltersToUrl } from "../helpers/serializer";
import type { FilterConfig, FilterRow, FilterState } from "../types";

const mockConfig: FilterConfig = {
  fields: [
    { name: "status", label: "Status", type: "select" },
    { name: "name", label: "Name", type: "text" },
    { name: "price", label: "Price", type: "number" },
    { name: "is_published", label: "Published", type: "boolean" },
    { name: "created_at", label: "Created At", type: "date" },
  ],
  paramStyle: "underscore", // Default for testing
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

/** Helper to extract flat rows from a FilterState root */
function getRows(state: FilterState): FilterRow[] {
  return state.root.children.filter((c) => c.type === "row").map((c) => (c as { type: "row"; row: FilterRow }).row);
}

describe("serializeFiltersToUrl", () => {
  it("should serialize a simple 'is' filter", () => {
    const state = makeState([{ id: "1", field: mockConfig.fields[0], operator: "is", value: "active" }]);
    const params = serializeFiltersToUrl(state, mockConfig);
    expect(params.toString()).toBe("status=active");
  });

  it("should serialize multiple filters with AND conjunction", () => {
    const state = makeState([
      { id: "1", field: mockConfig.fields[0], operator: "is", value: "active" },
      { id: "2", field: mockConfig.fields[1], operator: "contains", value: "shirt" },
    ]);
    const params = serializeFiltersToUrl(state, mockConfig);
    expect(params.toString()).toBe("status=active&name__icontains=shirt");
  });

  it("should serialize array values correctly (in)", () => {
    const state = makeState([{ id: "1", field: mockConfig.fields[0], operator: "in", value: ["active", "draft"] }]);
    const params = serializeFiltersToUrl(state, mockConfig);
    expect(params.getAll("status__in")).toEqual(["active,draft"]);
    expect(params.toString()).toBe("status__in=active%2Cdraft");
  });

  it("should serialize range values correctly (between)", () => {
    const state = makeState([{ id: "1", field: mockConfig.fields[2], operator: "between", value: ["10", "50"] }]);
    const params = serializeFiltersToUrl(state, mockConfig);
    expect(params.toString()).toBe("price__range=10%2C50"); // 10,50 encoded
  });

  it("should serialize boolean correctly", () => {
    const state = makeState([{ id: "1", field: mockConfig.fields[3], operator: "is", value: false }]);
    const params = serializeFiltersToUrl(state, mockConfig);
    expect(params.toString()).toBe("is_published=false");
  });

  it("should ignore empty rows", () => {
    const state = makeState([
      { id: "1", field: mockConfig.fields[0], operator: "is", value: "" }, // Invalid
      { id: "2", field: mockConfig.fields[2], operator: "gte", value: "10" }, // Valid
    ]);
    const params = serializeFiltersToUrl(state, mockConfig);
    expect(params.toString()).toBe("price__gte=10");
  });
});

describe("deserializeUrlToFilters", () => {
  it("should deserialize simple filters", () => {
    const params = new URLSearchParams("status=active");
    const state = deserializeUrlToFilters(params, mockConfig);
    const rows = getRows(state);

    expect(state.root.conjunction).toBe("and");
    expect(rows).toHaveLength(1);
    expect(rows[0].field?.name).toBe("status");
    expect(rows[0].operator).toBe("is");
    expect(rows[0].value).toBe("active");
  });

  it("should deserialize multiple and complex operators", () => {
    const params = new URLSearchParams("status=active&name__icontains=shirt&price__range=10,50");
    const state = deserializeUrlToFilters(params, mockConfig);
    const rows = getRows(state);

    expect(rows).toHaveLength(3);

    const nameFilter = rows.find((r) => r.field?.name === "name");
    expect(nameFilter?.operator).toBe("contains");
    expect(nameFilter?.value).toBe("shirt");

    const priceFilter = rows.find((r) => r.field?.name === "price");
    expect(priceFilter?.operator).toBe("between");
    expect(priceFilter?.value).toEqual(["10", "50"]);
  });

  it("should handle boolean values", () => {
    const params = new URLSearchParams("is_published=true");
    const state = deserializeUrlToFilters(params, mockConfig);
    const rows = getRows(state);

    expect(rows[0].field?.name).toBe("is_published");
    expect(rows[0].operator).toBe("is");
    expect(String(rows[0].value)).toBe("true");
  });

  it("should ignore unknown keys that do not match field definitions", () => {
    const params = new URLSearchParams("status=active&unknown_field=test");
    const state = deserializeUrlToFilters(params, mockConfig);
    const rows = getRows(state);

    expect(rows).toHaveLength(1);
    expect(rows[0].field?.name).toBe("status");
  });
});
