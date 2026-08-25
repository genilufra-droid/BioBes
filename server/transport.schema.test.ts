import { getTableColumns } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { agents, cargoLoads, vehicles } from "../drizzle/schema";

describe("modelet e transportit", () => {
  it("ruan të dhënat e identifikimit dhe patentës për shoferët", () => {
    const columns = Object.keys(getTableColumns(agents));
    expect(columns).toEqual(expect.arrayContaining(["companyId", "code", "name", "phone", "licenseNumber", "status"]));
  });

  it("përmban lidhjen e mjetit me shoferin dhe kapacitetin", () => {
    const columns = Object.keys(getTableColumns(vehicles));
    expect(columns).toEqual(expect.arrayContaining(["companyId", "plateNumber", "vehicleType", "makeModel", "capacityKg", "driverId", "status"]));
  });

  it("përmban itinerarin, partnerin dhe burimet për një ngarkesë", () => {
    const columns = Object.keys(getTableColumns(cargoLoads));
    expect(columns).toEqual(expect.arrayContaining(["companyId", "loadNumber", "loadDate", "customerId", "driverId", "vehicleId", "origin", "destination", "weightKg", "status"]));
  });
});
