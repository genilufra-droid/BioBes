# Struktura e databazës

BioBes përdor MySQL/TiDB përmes Drizzle ORM. Skema autoritative është `drizzle/schema.ts`; migrimet kronologjike janë `drizzle/0000_*.sql` deri `drizzle/0040_*.sql`, ndërsa snapshot-et janë në `drizzle/meta/`. Timestamps ruhen si Unix milliseconds sipas kontratës së aplikacionit.

## Tabela dhe marrëdhëniet kryesore

| Grup | Tabela |
|---|---|
| Identitet dhe multi-company | `users`, `companies`, `userCompanies`, `settings` |
| Partnerë dhe katalogë | `customers`, `suppliers`, `categories`, `issuers`, `documentGroups`, `costCenters`, `units`, `products`, `agents`, `vehicles` |
| Magazina dhe stok | `warehouses`, `stockLocations`, `stockMovements`, `stockBalances`, `stockTransfers`, `stockTransferItems`, `inventoryAdjustments`, `inventoryAdjustmentItems` |
| Kontabilitet dhe taksa | `chartOfAccounts`, `journals`, `journalEntries`, `journalEntryLines`, `taxRates` |
| Likuiditet | `payments`, `bankAccounts`, `bankStatements`, `bankTransfers`, `bankTransactions` |
| CRM | `crmLeads`, `crmActivities` |
| Blerje | `purchaseInvoices`, `purchaseItems`, `purchaseOrders`, `purchaseOrderItems`, `purchaseOrderAttachments`, `purchaseReceipts`, `purchaseReceiptItems`, `purchaseReturns`, `purchaseReturnItems` |
| Shitje | `salesInvoices`, `salesItems`, `salesQuotations`, `salesQuotationItems`, `salesOrders`, `salesOrderItems`, `deliveryNotes`, `deliveryItems`, `salesReturns`, `salesReturnItems`, `creditNotes` |
| Transport dhe dokumente | `cargoLoads`, `cargoLoadDocuments`, `weightForms`, `weightFormLines`, `employeeDocuments` |
| Audit | `auditLogs` |
| Pagat | `payrollEmployees`, `payrollLeaveAbsences`, `payrollDeviceMappings`, `payrollSettings`, `payrollPeriods`, `payrollPeriodBonuses`, `payrollAttendance`, `payrollEntries` |

## Rregullat e lidhjes

Dokumentet e biznesit lidhen me `companies` përmes `companyId`. Artikujt lidhen me kategorinë dhe njësinë; rreshtat e faturave lidhen me dokumentin dhe produktin; hyrje/dalje të stokut lidhen me magazinën dhe lëvizjen burimore. Blerjet, shitjet, pagesat dhe kontabiliteti duhet të ruajnë referencën e dokumentit burimor. Tabelat Payroll lidhen me kompaninë nëpërmjet punonjësit/periudhës dhe përdorin `payrollEmployeeId` në frekuentim, leje, pajisje dhe entries.

## Migrimet dhe operacionet

Mos ndrysho SQL ekzistues. Për ndryshim të ri përditëso `drizzle/schema.ts`, gjenero migration me Drizzle, rishiko SQL, aplikoje vetëm në ambient të kontrolluar dhe verifiko me `drizzle/meta`. Backup/restore duhet të kryhet nga operatori i database-s; repository nuk përmban dump të të dhënave reale.

## Siguria e të dhënave

Çdo query multi-tenant duhet të kufizohet me kompaninë aktive dhe çdo endpoint i mbrojtur duhet të verifikojë session/role. Mos vendos password, connection string real, eksport personeli ose të dhëna klientësh në Git.
