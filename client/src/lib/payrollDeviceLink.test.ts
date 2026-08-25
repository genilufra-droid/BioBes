import { describe, expect, it } from "vitest";
import { findEmployeeByDeviceId } from "./payrollDeviceLink";

describe("lidhja pajisje–punonjës", () => {
  const employees = [{ id: 3, employeeNumber: "3" }, { id: 38, employeeNumber: "38" }, { id: 45, employeeNumber: "45" }];
  it("lidh ID-në e pajisjes me numrin identik të punonjësit", () => expect(findEmployeeByDeviceId("45", employees, {})).toEqual(employees[2]));
  it("nuk pranon lidhje të ruajtur me numër pajisjeje tjetër", () => expect(findEmployeeByDeviceId("45", employees, { "45": 38 })).toEqual(employees[2]));
  it("mbështet ID-të jo numerike të krijuara automatikisht", () => expect(findEmployeeByDeviceId("A-17", [{ id: 9, employeeNumber: "AUTOA-17" }], {})).toEqual({ id: 9, employeeNumber: "AUTOA-17" }));
});
