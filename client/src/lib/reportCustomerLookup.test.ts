import { describe, expect, it } from "vitest";
import { filterReportCustomers } from "./reportCustomerLookup";

const customers = [
  { id: 1, name: "NUTRECO", code: "CLI-001", email: "sales@nutreco.test", phone: "+355 69 111 2222" },
  { id: 2, name: "NATURAL ATC", code: "CLI-002", email: "office@natural.test", phone: "+355 69 333 4444" },
];

describe("report customer lookup", () => {
  it("finds real customers by name or code", () => {
    expect(filterReportCustomers(customers, "nutreco").map(customer => customer.id)).toEqual([1]);
    expect(filterReportCustomers(customers, "CLI-002").map(customer => customer.id)).toEqual([2]);
  });

  it("also searches email and phone and returns all for empty term", () => {
    expect(filterReportCustomers(customers, "office@natural.test").map(customer => customer.id)).toEqual([2]);
    expect(filterReportCustomers(customers, "69 111").map(customer => customer.id)).toEqual([1]);
    expect(filterReportCustomers(customers, "")).toHaveLength(2);
  });
});
