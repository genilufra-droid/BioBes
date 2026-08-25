# Audit i eksportit BioBes

Ky audit krahason source project-in e Sistemi Genit Cloud me tree-n e repository-t BioBes. Në kontrollin e fundit source project kishte 600 skedarë të lexueshëm jashtë `.git`, ndërsa repository kishte 472 skedarë para këtij përditësimi. Diferenca përbëhej kryesisht nga materiale pune, audit-e, log-e, binary dhe metadata lokale; nuk ishte fshehje e moduleve të aplikacionit.

## Source code i përfshirë

U kontrolluan dhe u shtuan në eksport të gjitha skedarët e mbetur me prapashtesa kodi, përfshirë skriptet `.mjs`, `.mts`, `.ts`, `.py` dhe testet e importit/frekuentimit. Source code-i i Pagave është i pranishëm në `server/payroll.ts`, `server/payroll.test.ts`, `server/payrollDocuments.test.ts`, `client/src/pages/Payroll.tsx`, helpers `client/src/lib/payroll*.ts` dhe komponentët Payroll.

## Çfarë nuk publikohet

Nuk publikohen `.project-config.json`, `client/public/__manus__/version.json`, `.env`, secrets, `node_modules`, `dist`, log-e, dump-e dhe backup-e. Skedarët Excel, imazhet reference, JSON/TSV me rezultate reale dhe shënimet e auditit që mund të përmbajnë emra klientësh, punonjësish ose të dhëna financiare nuk publikohen në repository public. Këto janë të dhëna ose materiale pune, jo source code i aplikacionit.

## Verifikimi

Pas shtimit u ekzekutuan `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test` dhe `pnpm build`; rezultati ishte 87 test files dhe 308 teste të kaluara. U krye secrets scan pa gjetje për tokena tipikë, private keys ose connection strings reale. Repository përmban schema, migrime, router-at, module, formularë, raporte, testet dhe wrapper-in Windows.

Ky raport synon transparencë: çdo përjashtim është i emërtuar sipas kategorisë dhe nuk fsheh source code të moduleve të aplikacionit.
