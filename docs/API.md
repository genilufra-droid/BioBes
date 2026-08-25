# API dhe procedurat e disponueshme

API-ja është tRPC-first dhe serviret nën `/api/trpc`. Emrat dhe input-et autoritare ndodhen në `server/routers.ts` dhe skedarët e moduleve. Procedurat `protectedProcedure` kërkojnë session; procedurat administrative kërkojnë rolin përkatës. Çdo query biznesi duhet të respektojë `companyId`.

## Router-at kryesorë

| Router | Fushë |
|---|---|
| `auth`, `company` | identitet, sesion, kompani dhe user-company |
| `customer`, `supplier`, `issuer`, `documentGroup`, `costCenter` | partnerë dhe katalogë |
| `product`, `category`, `unit`, `warehouse`, `stockLocation`, `stockMovement`, `stockBalance`, `stockReport`, `stockTransfer`, `inventoryAdjustment` | katalog artikujsh dhe stok |
| `purchaseInvoice`, `purchaseOrder`, `purchaseReceipt`, `purchaseReturn`, `purchaseReport` | blerje |
| `salesInvoice`, `salesQuotation`, `salesOrder`, `delivery`, `salesReturn`, `salesReport` | shitje |
| `chartOfAccount`, `journal`, `journalEntry`, `taxRate`, `payment`, `accountingReport` | kontabilitet dhe pagesa |
| `crmLead`, `crmActivity`, `crmReport` | CRM |
| `bankAccount`, `bankStatement`, `bankTransfer`, `bankTransaction`, `bankReport` | banka |
| `cargoLoad`, `weightForm`, `agent`, `vehicle` | transport dhe peshore |
| `reportCenter`, `globalSearch`, `auditLog`, `creditNotes` | raporte, kërkim, audit dhe kreditime |
| `payroll` | Pagat |

## Pagat

Router-i `payroll` përmban grupet reale `documents`, `employees`, `mappings`, `settings`, `periods`, `leaveAbsences` dhe `backup`. Procedurat përfshijnë listim/krijim/modifikim të punonjësve, dokumente personale, lidhje pajisjesh, konfigurime, histori dhe krijim të periudhave; `generate` llogarit periudhën, ndërsa `entries`, `contributionHistory`, `attendance`, `bonuses`, `upsertBonuses`, `addAttendance`, `addAttendanceBulk`, `upsertAttendanceBulk` dhe `clearManualAttendance` menaxhojnë pagat dhe frekuentimin. `leaveAbsences.list/create`, backup dhe restaurimi i konfigurimit janë gjithashtu pjesë e router-it.

## Kontratat dhe gabimet

Input-et kontrollohen me Zod dhe përgjigjet tipizohen automatikisht në frontend. Gabimet e zakonshme janë `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `BAD_REQUEST` dhe `INTERNAL_SERVER_ERROR`. Për një endpoint të ri shto input schema, procedure, helper database, test dhe invalidim cache në UI; mos dokumento endpoint-e që nuk ekzistojnë në router.

## Shembull frontend

```ts
const employees = trpc.payroll.employees.list.useQuery({ companyId });
const createPeriod = trpc.payroll.periods.create.useMutation();
await createPeriod.mutateAsync({ companyId, year, month, currency: "ALL" });
```

Shembulli kërkon session dhe `companyId` të vlefshëm. Për parametrat e plotë përdor tipet e gjeneruara nga router-i, jo kopje manuale.
