import { describe, expect, it } from "vitest";
import { getOperatorSuffix } from "../helpers/operators";
import type { OperatorType } from "../types";

describe("getOperatorSuffix", () => {
  it('returns empty string for "custom" style regardless of operator', () => {
    expect(getOperatorSuffix("is", "custom")).toBe("");
    expect(getOperatorSuffix("contains", "custom")).toBe("");
    expect(getOperatorSuffix("between", "custom")).toBe("");
  });

  describe("underscore style", () => {
    it("returns correct suffix for all operators", () => {
      const cases: Record<OperatorType, string> = {
        is: "",
        is_not: "__not",
        contains: "__icontains",
        not_contains: "__not_icontains",
        gt: "__gt",
        gte: "__gte",
        lt: "__lt",
        lte: "__lte",
        between: "__range",
        in: "__in",
        not_in: "__not_in",
        is_empty: "__isnull",
        is_not_empty: "__isnull",
      };

      Object.entries(cases).forEach(([op, expected]) => {
        expect(getOperatorSuffix(op as OperatorType, "underscore")).toBe(expected);
      });
    });
  });

  describe("bracket style", () => {
    it("returns correct suffix for all operators", () => {
      const cases: Record<OperatorType, string> = {
        is: "",
        is_not: "[not]",
        contains: "[icontains]",
        not_contains: "[not_icontains]",
        gt: "[gt]",
        gte: "[gte]",
        lt: "[lt]",
        lte: "[lte]",
        between: "[range]",
        in: "[in]",
        not_in: "[not_in]",
        is_empty: "[isnull]",
        is_not_empty: "[isnull]",
      };

      Object.entries(cases).forEach(([op, expected]) => {
        expect(getOperatorSuffix(op as OperatorType, "bracket")).toBe(expected);
      });
    });
  });
});
