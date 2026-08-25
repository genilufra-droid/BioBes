export type PayrollDeviceMappingRow = { deviceId: string; payrollEmployeeId: number; active: number };

export function activePayrollDeviceLinks(rows: PayrollDeviceMappingRow[]): Record<string, number> {
  return rows.reduce<Record<string, number>>((links, row) => {
    if (row.active === 1 && row.deviceId && row.payrollEmployeeId) links[row.deviceId] = row.payrollEmployeeId;
    return links;
  }, {});
}
