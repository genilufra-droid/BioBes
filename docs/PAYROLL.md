# Moduli Pagat

Moduli Pagat është pjesë e plotë e BioBes dhe përfshin source code frontend/backend, helpers, schema, migrime dhe teste. Faqja kryesore është `client/src/pages/Payroll.tsx`; logjika e llogaritjeve është në `server/payroll.ts`; query-t dhe mutation-et e database janë në `server/db.ts`; kontratat janë në `server/routers.ts`.

## Të dhënat

| Tabela | Roli |
|---|---|
| `payrollEmployees` | punonjës, pagë bazë, status dhe të dhëna pune |
| `payrollPeriods` | periudha mujore dhe statusi i gjenerimit |
| `payrollEntries` | rezultati i llogaritjes për punonjës |
| `payrollAttendance` | ditë, kode frekuentimi, minuta normale dhe overtime |
| `payrollLeaveAbsences` | leje dhe mungesa me interval datash |
| `payrollPeriodBonuses` | bonuse sipas periudhës |
| `payrollDeviceMappings` | lidhje punonjës-pajisje/log source |
| `payrollSettings` | rregulla taksash, kontribute dhe konfigurime |
| `employeeDocuments` | dokumente të punonjësve |

## Rrjedha

Krijo ose importo punonjësin, konfiguro normat, krijo periudhën me vit/muaj/monedhë, plotëso frekuentimin dhe bonuset, pastaj përdor `generate`. Rezultati ruhet në `payrollEntries` dhe mund të shfaqet në raporte/export. Lejet kontrollohen sipas intervalit; frekuentimi manual mund të shtohet një rresht ose bulk. Backup-i ruan konfigurimet e modulit dhe duhet të trajtohet si informacion i ndjeshëm.

## Siguria

Të gjitha operacionet kërkojnë session dhe duhet të kufizohen sipas kompanisë aktive. Mos publiko emra, paga, numra personalë, dokumente punonjësish ose backup real. Repository përmban vetëm source code, schema dhe teste; nuk përmban të dhëna personale reale.

## Testimi

Testet relevante gjenden në `server/payroll.test.ts`, `server/payrollDocuments.test.ts` dhe `client/src/lib/payroll*.test.ts`. Para release ekzekuto `pnpm check`, `pnpm test` dhe `pnpm build`.
