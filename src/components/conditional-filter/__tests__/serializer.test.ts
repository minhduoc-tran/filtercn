import { describe, expect, it } from "vitest";
import { deserializeUrlToFilters, serializeFiltersToUrl } from "../helpers/serializer";
import { type FilterConfig, FilterFieldDefinition, type FilterState } from "../types";

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

describe("serializeFiltersToUrl", () => {
  it("should serialize a simple 'is' filter", () => {
    const state: FilterState = {
      conjunction: "and",
      rows: [{ id: "1", field: mockConfig.fields[0], operator: "is", value: "active" }],
    };
    const params = serializeFiltersToUrl(state, mockConfig);
    expect(params.toString()).toBe("status=active");
  });

  it("should serialize multiple filters with AND conjunction", () => {
    const state: FilterState = {
      conjunction: "and",
      rows: [
        { id: "1", field: mockConfig.fields[0], operator: "is", value: "active" },
        { id: "2", field: mockConfig.fields[1], operator: "contains", value: "shirt" },
      ],
    };
    const params = serializeFiltersToUrl(state, mockConfig);
    expect(params.toString()).toBe("status=active&name__icontains=shirt");
  });

  it("should serialize array values correctly (in)", () => {
    const state: FilterState = {
      conjunction: "and",
      rows: [{ id: "1", field: mockConfig.fields[0], operator: "in", value: ["active", "draft"] }],
    };
    const params = serializeFiltersToUrl(state, mockConfig);
    // URLSearchParams joins multiple appends with the same key
    expect(params.getAll("status__in")).toEqual(["active,draft"]);
    expect(params.toString()).toBe("status__in=active%2Cdraft");
  });

  it("should serialize range values correctly (between)", () => {
    const state: FilterState = {
      conjunction: "and",
      rows: [{ id: "1", field: mockConfig.fields[2], operator: "between", value: ["10", "50"] }],
    };
    const params = serializeFiltersToUrl(state, mockConfig);
    expect(params.toString()).toBe("price__range=10%2C50"); // 10,50 encoded
  });

  it("should serialize boolean correctly", () => {
    const state: FilterState = {
      conjunction: "and",
      rows: [{ id: "1", field: mockConfig.fields[3], operator: "is", value: false }],
    };
    const params = serializeFiltersToUrl(state, mockConfig);
    expect(params.toString()).toBe("is_published=false");
  });

  it("should ignore empty rows", () => {
    const state: FilterState = {
      conjunction: "and",
      rows: [
        { id: "1", field: mockConfig.fields[0], operator: "is", value: "" }, // Invalid
        { id: "2", field: mockConfig.fields[2], operator: "gte", value: "10" }, // Valid
      ],
    };
    const params = serializeFiltersToUrl(state, mockConfig);
    expect(params.toString()).toBe("price__gte=10");
  });
});

describe("deserializeUrlToFilters", () => {
  it("should deserialize simple filters", () => {
    const params = new URLSearchParams("status=active");
    const state = deserializeUrlToFilters(params, mockConfig);

    expect(state.conjunction).toBe("and");
    expect(state.rows).toHaveLength(1);
    expect(state.rows[0].field?.name).toBe("status");
    expect(state.rows[0].operator).toBe("is");
    expect(state.rows[0].value).toBe("active");
  });

  it("should deserialize multiple and complex operators", () => {
    const params = new URLSearchParams("status=active&name__icontains=shirt&price__range=10,50");
    const state = deserializeUrlToFilters(params, mockConfig);

    expect(state.rows).toHaveLength(3);

    const nameFilter = state.rows.find((r) => r.field?.name === "name");
    expect(nameFilter?.operator).toBe("contains");
    expect(nameFilter?.value).toBe("shirt");

    const priceFilter = state.rows.find((r) => r.field?.name === "price");
    expect(priceFilter?.operator).toBe("between");
    expect(priceFilter?.value).toEqual(["10", "50"]);
  });

  it("should handle boolean values", () => {
    const params = new URLSearchParams("is_published=true");
    const state = deserializeUrlToFilters(params, mockConfig);

    expect(state.rows[0].field?.name).toBe("is_published");
    expect(state.rows[0].operator).toBe("is");
    // The current implementation might leave it as string "true" or parse it.
    // We should ensure value can handle the string "true" or we parse it.
    // In our implementation, values from URL are usually strings or arrays of strings. Let's just check equality.
    expect(String(state.rows[0].value)).toBe("true");
  });

  it("should ignore unknown keys that do not match field definitions", () => {
    const params = new URLSearchParams("status=active&unknown_field=test");
    const state = deserializeUrlToFilters(params, mockConfig);

    expect(state.rows).toHaveLength(1);
    expect(state.rows[0].field?.name).toBe("status");
  });
});
