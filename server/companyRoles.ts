export type CompanyRole = "owner" | "admin" | "user" | "viewer";

export function canManageCompanyRoles(globalRole: "admin" | "user", companyRole: CompanyRole | undefined) {
  return globalRole === "admin" || companyRole === "owner" || companyRole === "admin";
}

export function canWriteCompany(globalRole: "admin" | "user", companyRole: CompanyRole | undefined) {
  return globalRole === "admin" || companyRole === "owner" || companyRole === "admin" || companyRole === "user";
}

export function canAssignCompanyRole(currentRole: CompanyRole, nextRole: CompanyRole) {
  return currentRole !== "owner" && nextRole !== "owner";
}
