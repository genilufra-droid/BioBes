export type PayrollLinkEmployee = { id: number; employeeNumber: string };

export function findEmployeeByDeviceId(deviceId: string, employees: PayrollLinkEmployee[], savedLinks: Record<string, number>) {
  const validNumber = (employee: PayrollLinkEmployee) => employee.employeeNumber === deviceId || employee.employeeNumber === `AUTO${deviceId}`;
  const stored = savedLinks[deviceId] ? employees.find(employee => employee.id === savedLinks[deviceId]) : undefined;
  if (stored && validNumber(stored)) return stored;
  return employees.find(validNumber);
}
