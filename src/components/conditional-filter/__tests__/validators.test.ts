import { describe, expect, it } from "vitest";
import { getValidFilterRows, isValidFilterRow } from "../helpers/validators";
import type { FilterRow } from "../types";

describe("isValidFilterRow", () => {
  it("should return false if row is missing field or operator", () => {
    expect(isValidFilterRow({ id: "1", field: null, operator: null, value: null })).toBe(false);
    expect(
      isValidFilterRow({ id: "1", field: { name: "name", label: "Name", type: "text" }, operator: null, value: null }),
    ).toBe(false);
  });

  it("should return true for is_empty and is_not_empty even without value", () => {
    expect(
      isValidFilterRow({
        id: "1",
        field: { name: "name", label: "Name", type: "text" },
        operator: "is_empty",
        value: null,
      }),
    ).toBe(true);
    expect(
      isValidFilterRow({
        id: "1",
        field: { name: "name", label: "Name", type: "text" },
        operator: "is_not_empty",
        value: undefined,
      }),
    ).toBe(true);
  });

  it("should return false for list operators (in, not_in) if value is empty array", () => {
    expect(
      isValidFilterRow({
        id: "1",
        field: { name: "status", label: "Status", type: "select" },
        operator: "in",
        value: [],
      }),
    ).toBe(false);
    expect(
      isValidFilterRow({
        id: "1",
        field: { name: "status", label: "Status", type: "select" },
        operator: "in",
        value: ["active"],
      }),
    ).toBe(true);
  });

  it("should return false for between operator if missing min or max", () => {
    expect(
      isValidFilterRow({
        id: "1",
        field: { name: "price", label: "Price", type: "number" },
        operator: "between",
        value: ["10"],
      }),
    ).toBe(false);
    expect(
      isValidFilterRow({
        id: "1",
        field: { name: "price", label: "Price", type: "number" },
        operator: "between",
        value: ["", "10"],
      }),
    ).toBe(false);
    expect(
      isValidFilterRow({
        id: "1",
        field: { name: "price", label: "Price", type: "number" },
        operator: "between",
        value: ["10", "20"],
      }),
    ).toBe(true);
  });

  it("should return true for valid single-value operators", () => {
    expect(
      isValidFilterRow({
        id: "1",
        field: { name: "name", label: "Name", type: "text" },
        operator: "is",
        value: "test",
      }),
    ).toBe(true);
    expect(
      isValidFilterRow({
        id: "1",
        field: { name: "is_published", label: "Published", type: "boolean" },
        operator: "is",
        value: false,
      }),
    ).toBe(true);
    expect(
      isValidFilterRow({
        id: "1",
        field: { name: "price", label: "Price", type: "number" },
        operator: "greater",
        value: 0,
      }),
    ).toBe(true);
  });
});

describe("getValidFilterRows", () => {
  it("should filter out invalid rows", () => {
    const rows: FilterRow[] = [
      { id: "1", field: { name: "name", label: "Name", type: "text" }, operator: "is", value: "test" },
      { id: "2", field: { name: "status", label: "Status", type: "select" }, operator: null, value: null },
      { id: "3", field: { name: "price", label: "Price", type: "number" }, operator: "between", value: ["10"] },
      { id: "4", field: { name: "category", label: "Category", type: "select" }, operator: "is_empty", value: null },
    ];

    const validRows = getValidFilterRows(rows);
    expect(validRows).toHaveLength(2);
    expect(validRows[0].id).toBe("1");
    expect(validRows[1].id).toBe("4");
  });
});
