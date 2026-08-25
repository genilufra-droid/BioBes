import { describe, expect, it } from "vitest";
import { centsToEuroInput, euroInputToCents } from "./payrollEmployeePayment";

describe("tarifat e punonjësit", () => {
  it("ruan eurot me presje si centë të sakta", () => expect(euroInputToCents("8,75")).toBe(875));
  it("nuk lejon tarifa negative ose vlera të pavlefshme", () => { expect(euroInputToCents("-2")).toBe(0); expect(euroInputToCents("abc")).toBe(0); });
  it("shfaq centët si vlerë për formular", () => expect(centsToEuroInput(1234)).toBe("12.34"));
});
