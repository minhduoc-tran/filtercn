import { describe, expect, it } from "vitest";
import { buildRestQuery } from "../helpers/query-builder";
import type { FilterConfig, FilterRow } from "../types";

const mockConfig: FilterConfig = {
  fields: [
    { name: "status", label: "Status", type: "select" },
    { name: "price", label: "Price", type: "number" },
  ],
};

describe("buildRestQuery", () => {
  it("should build underscore style queries correctly (default)", () => {
    const rows: FilterRow[] = [
      { id: "1", field: mockConfig.fields[0], operator: "is", value: "active" },
      { id: "2", field: mockConfig.fields[1], operator: "gte", value: "100" },
      { id: "3", field: mockConfig.fields[1], operator: "between", value: ["10", "50"] },
    ];

    const result = buildRestQuery(rows, { ...mockConfig, paramStyle: "underscore" });

    expect(result).toEqual({
      status: "active",
      price__gte: "100",
      price__range: "10,50",
    });
  });

  it("should build bracket style queries correctly", () => {
    const rows: FilterRow[] = [
      { id: "1", field: mockConfig.fields[0], operator: "is", value: "active" },
      { id: "2", field: mockConfig.fields[1], operator: "gte", value: "100" },
    ];

    const result = buildRestQuery(rows, { ...mockConfig, paramStyle: "bracket" });

    expect(result).toEqual({
      "filter[status]": "active",
      "filter[price][gte]": "100",
    });
  });

  it("should use customParamBuilder if provided", () => {
    const rows: FilterRow[] = [{ id: "1", field: mockConfig.fields[0], operator: "is", value: "active" }];

    const customConfig: FilterConfig = {
      ...mockConfig,
      customParamBuilder: (field, operator, value) => {
        return { [`custom_${field}_${operator}`]: String(value) };
      },
    };

    const result = buildRestQuery(rows, customConfig);
    expect(result).toEqual({
      custom_status_is: "active",
    });
  });

  it("should safely ignore empty valid rows (e.g. operator: is_empty)", () => {
    const rows: FilterRow[] = [{ id: "1", field: mockConfig.fields[0], operator: "is_empty", value: null }];

    const result = buildRestQuery(rows, mockConfig);
    // Underscore style for is_empty is usually field__isnull=true
    expect(result).toEqual({
      status__isnull: "true",
    });
  });
});
