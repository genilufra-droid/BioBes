import { describe, expect, it } from "vitest";
import { canAssignCompanyRole, canManageCompanyRoles, canWriteCompany } from "./companyRoles";

describe("company role rules", () => {
  it("lejon menaxhimin për adminin global, owner-in dhe adminin e kompanisë", () => {
    expect(canManageCompanyRoles("admin", "viewer")).toBe(true);
    expect(canManageCompanyRoles("user", "owner")).toBe(true);
    expect(canManageCompanyRoles("user", "admin")).toBe(true);
  });

  it("mbron rolin owner nga ndryshimi në panel", () => {
    expect(canManageCompanyRoles("user", "viewer")).toBe(false);
    expect(canAssignCompanyRole("owner", "admin")).toBe(false);
    expect(canAssignCompanyRole("user", "owner")).toBe(false);
    expect(canAssignCompanyRole("user", "viewer")).toBe(true);
  });

  it("lejon shkrimin vetëm për rolet operative të kompanisë", () => {
    expect(canWriteCompany("user", "viewer")).toBe(false);
    expect(canWriteCompany("user", "user")).toBe(true);
    expect(canWriteCompany("admin", "viewer")).toBe(true);
  });
});
