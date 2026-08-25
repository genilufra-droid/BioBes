import { describe, expect, it } from "vitest";
import { filterPayrollEmployees } from "./payrollEmployeeSearch";

const employees = [
  { id: 1, employeeNumber: "7", firstName: "Mariglen", lastName: "Myftari", position: "Punonjës" },
  { id: 2, employeeNumber: "8", firstName: "Ardian", lastName: "Hoxha", position: "Shofer" },
];

describe("filterPayrollEmployees", () => {
  it("kthen të gjithë rreshtat kur kërkimi është bosh", () => {
    expect(filterPayrollEmployees(employees, "")).toEqual(employees);
  });

  it("gjen punonjësin sipas emrit dhe mbiemrit", () => {
    expect(filterPayrollEmployees(employees, "Mariglen Myftari")).toEqual([employees[0]]);
    expect(filterPayrollEmployees(employees, "myftari")).toEqual([employees[0]]);
  });

  it("gjen punonjësin sipas Nr. të listëpagesës", () => {
    expect(filterPayrollEmployees(employees, "7")).toEqual([employees[0]]);
  });

  it("kthen listë bosh kur nuk ka përputhje", () => {
    expect(filterPayrollEmployees(employees, "999")).toEqual([]);
  });
});
