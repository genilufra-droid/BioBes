import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Employee Documents Module", () => {
  it("should define employee documents table helpers correctly", async () => {
    expect(typeof db.getEmployeeDocuments).toBe("function");
    expect(typeof db.createEmployeeDocument).toBe("function");
    expect(typeof db.deleteEmployeeDocument).toBe("function");
  });
});
