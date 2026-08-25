# BioBes — Sistemi Genit Cloud

BioBes është source code-i i Sistemi Genit Cloud: një ERP cloud multi-user dhe multi-company me React 19, TypeScript, Vite, Express, tRPC 11, Drizzle ORM dhe MySQL/TiDB. Repository përfshin frontend-in, backend-in, schema/migrimet, formularët, raportet, testet, modulin Pagat, CI, Docker dhe wrapper-in Windows.

> **Shënim transparence:** Repository përmban source code-in e aplikacionit dhe mjeteve të tij. Nuk përmban secrets, `.env` reale, `node_modules`, `dist`, log-e, dump-e database ose të dhëna personale reale. Këto nuk janë heqje modulesh; janë materiale që nuk duhet të publikohen.

## Quick start

Kërkohen Node.js 22+ dhe pnpm. Ekzekuto `pnpm install`, konfiguro variables sipas [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md), pastaj përdor `pnpm check`, `pnpm test`, `pnpm build` dhe `pnpm dev`. Për deployment përdor [docs/INSTALL.md](docs/INSTALL.md), [docs/DEPLOY-CLOUD.md](docs/DEPLOY-CLOUD.md), `Dockerfile` ose `docker-compose.yml`.

## Lista e plotë e moduleve

| Modul | Faqe/source kryesor | Backend/API |
|---|---|---|
| Auth dhe RBAC | `client/src/_core`, `DashboardLayout` | `server/_core`, auth/company roles |
| Multi-company | company settings dhe workspace | `company`, `userCompanies`, settings |
| Klientë/Partnerë | customer/partner pages | `customer`, `supplier`, `issuer` |
| Artikuj dhe katalogë | product/category/unit pages | `product`, `category`, `unit`, `costCenter` |
| Shitje | `SalesInvoices.tsx` dhe sales pages | `salesInvoice`, `salesQuotation`, `salesOrder`, `delivery`, `salesReturn`, `salesReport` |
| Blerje | purchase pages | `purchaseInvoice`, `purchaseOrder`, `purchaseReceipt`, `purchaseReturn`, `purchaseReport` |
| Magazina dhe stok | inventory/warehouse pages | `warehouse`, `stockLocation`, `stockMovement`, `stockBalance`, `stockTransfer`, `inventoryAdjustment`, `stockReport` |
| Arka dhe pagesa | payment/cash flows | `payment` |
| Banka | banking pages | `bankAccount`, `bankStatement`, `bankTransfer`, `bankTransaction`, `bankReport` |
| Kontabilitet | accounting pages | `chartOfAccount`, `journal`, `journalEntry`, `accountingReport`, `taxRate` |
| CRM | lead/activity pages | `crmLead`, `crmActivity`, `crmReport` |
| Transport dhe peshore | cargo/weight pages | `cargoLoad`, `weightForm`, `agent`, `vehicle` |
| Raporte dhe kërkim | report center, PDF/Excel | `reportCenter`, `globalSearch`, `salesReport`, audit/report routers |
| Konfigurime | configuration/settings pages | reference catalog procedures |
| Audit dhe dokumente | audit/document flows | `auditLog`, `creditNotes`, `employeeDocuments` |
| **Pagat** | `client/src/pages/Payroll.tsx`, `client/src/lib/payroll*` | `server/payroll.ts`, `payroll` router |
| Windows desktop | `desktop/main.cjs`, `desktop/preload.cjs` | përdor të njëjtin frontend web |

## Struktura e databazës

Schema autoritative është `drizzle/schema.ts`, marrëdhëniet janë në `drizzle/relations.ts` dhe migrimet janë në `drizzle/0000_*.sql` deri `drizzle/0040_*.sql`.

| Fusha | Tabelat |
|---|---|
| Identitet/multi-company | `users`, `companies`, `userCompanies`, `settings` |
| Partnerë/katalog | `customers`, `suppliers`, `categories`, `issuers`, `documentGroups`, `costCenters`, `units`, `products`, `agents`, `vehicles` |
| Magazinë/stok | `warehouses`, `stockLocations`, `stockMovements`, `stockBalances`, `stockTransfers`, `stockTransferItems`, `inventoryAdjustments`, `inventoryAdjustmentItems` |
| Kontabilitet | `chartOfAccounts`, `journals`, `journalEntries`, `journalEntryLines`, `taxRates` |
| Bankë/likuiditet | `payments`, `bankAccounts`, `bankStatements`, `bankTransfers`, `bankTransactions` |
| CRM | `crmLeads`, `crmActivities` |
| Blerje | `purchaseInvoices`, `purchaseItems`, `purchaseOrders`, `purchaseOrderItems`, `purchaseOrderAttachments`, `purchaseReceipts`, `purchaseReceiptItems`, `purchaseReturns`, `purchaseReturnItems` |
| Shitje | `salesInvoices`, `salesItems`, `salesQuotations`, `salesQuotationItems`, `salesOrders`, `salesOrderItems`, `deliveryNotes`, `deliveryItems`, `salesReturns`, `salesReturnItems`, `creditNotes` |
| Transport/dokumente | `cargoLoads`, `cargoLoadDocuments`, `weightForms`, `weightFormLines`, `employeeDocuments` |
| **Pagat** | `payrollEmployees`, `payrollLeaveAbsences`, `payrollDeviceMappings`, `payrollSettings`, `payrollPeriods`, `payrollPeriodBonuses`, `payrollAttendance`, `payrollEntries` |
| Audit | `auditLogs` |

Lidhjet multi-company përdorin `companyId`; rreshtat e dokumenteve lidhen me dokumentin prind dhe produktin; lëvizjet e stokut lidhen me magazinën; entries e Pagave lidhen me punonjësin dhe periudhën. Shih [docs/DATABASE.md](docs/DATABASE.md) për rregullat, migrimet dhe sigurinë.

## API

API-ja serviret nën `/api/trpc`. Router-at kryesorë dhe kontratat dokumentohen te [docs/API.md](docs/API.md). Input-et validohen me Zod, procedurat protected kërkojnë session dhe operacionet multi-company duhet të kufizohen sipas kompanisë aktive.

## Pagat

Moduli Pagat është i përfshirë në source dhe dokumentohet te [docs/PAYROLL.md](docs/PAYROLL.md). Ai mbulon punonjës, dokumente, mapping pajisjesh, settings, periudha, frekuentim, leje/mungesa, bonuse, gjenerim dhe entries.

## Verifikimi i integritetit

Skripti `scripts/verify_biobes_integrity.py` krahason listën dhe SHA-256 hash-et e source project-it me tree-n lokale të export-it:

```bash
python3 scripts/verify_biobes_integrity.py --source /path/to/sistemi-genit-cloud --export /path/to/biobes
```

Ai raporton skedarët `MISSING`, `REMOTE_ONLY` dhe `HASH_MISMATCH`; përjashton vetëm direktoritë e gjeneruara/lokale të specifikuara në dokumentacion. Për auditin e fundit shih [docs/EXPORT-AUDIT.md](docs/EXPORT-AUDIT.md).

## Udhëzime zhvillimi

Për module, raporte dhe forma shih [docs/ADD-MODULE.md](docs/ADD-MODULE.md), [docs/ADD-REPORT.md](docs/ADD-REPORT.md) dhe [docs/ADD-FORM.md](docs/ADD-FORM.md). Çdo ndryshim i database-s kërkon schema, migration, helper, procedure dhe test. Para pull request ekzekuto `pnpm check`, `pnpm test` dhe `pnpm build`.

## Siguria dhe licenca

Kodi licencohet me MIT. Mos commit-o password, tokena, certifikata private, connection strings, dump-e, backup-e ose të dhëna personale. Raporto dobësitë privatisht te administratori i repository-t.

## Self-hosted pa Manus

BioBes ka adapterë alternativë për deployment të pavarur. Vendos `AUTH_PROVIDER=local`, `VITE_AUTH_PROVIDER=local` dhe `STORAGE_PROVIDER=local`; përdor `LOCAL_AUTH_USERS_JSON` me passwordHash scrypt dhe volume persistent për `LOCAL_STORAGE_DIR`. Login-i është `/login`, endpoint-i është `POST /api/local-auth/login`, ndërsa skedarët shërbehen nga `/local-storage/*`. Profili default `manus` ruan kompatibilitetin me OAuth Manus dhe Forge/S3. Detajet janë te [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md).
