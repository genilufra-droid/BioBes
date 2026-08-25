# Module të repository-t

| Modul | Source kryesor | Përshkrim |
|---|---|---|
| Klientë/CRM | client/src/pages dhe customer procedures | Partnerë, kërkim dhe lidhje me dokumente |
| Shitje | client/src/pages/SalesInvoices.tsx dhe server/sales.ts | Fatura, oferta, porosi, dërgesa, kthime, pagesa, import/export dhe raporte |
| Blerje | client/src/pages/Purchases.tsx dhe server/purchase.ts | Fatura dhe regjistër blerjesh |
| Magazina/Stok | client/src/pages/Inventory.tsx dhe server/inventory.ts | Artikuj, njësi, magazina, hyrje/dalje dhe stok |
| Arka/Banka | server/crmBanking.ts | Likuiditete dhe pagesa |
| Kontabilitet | server/accounting.ts | Workspace dhe llogari kontabël |
| Raporte | shared/reportCatalog.ts dhe pages report | Filtra, PDF, Excel dhe lidhje burimi |
| Konfigurime | client/src/pages dhe components | Parametra, kompani dhe katalogë |
| Auth/RBAC | `server/_core`, `server/companyRoles.ts` | OAuth, session, role, permission dhe multi-company |
| Transport/Dokumente | `server/transportActions.ts`, cargo/weight pages | Ngarkesa, peshore, CMR dhe dokumente burimore |
| **Pagat** | `client/src/pages/Payroll.tsx`, `server/payroll.ts` | Punonjës, periudha, frekuentim, leje, bonuse, pajisje, llogaritje dhe pagesa |

Çdo modul përbëhet nga page/component, router/service, helper database, schema/migration kur nevojitet dhe teste. Moduli Pagat përdor tabelat `payrollEmployees`, `payrollPeriods`, `payrollAttendance`, `payrollLeaveAbsences`, `payrollPeriodBonuses`, `payrollEntries`, `payrollDeviceMappings` dhe `payrollSettings`. Varësitë kryesore janë identiteti i kompanisë, role/RBAC, database helpers dhe audit log.
