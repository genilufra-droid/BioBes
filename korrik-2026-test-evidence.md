# Evidenca e testit Korrik 2026

## Faza 1–2

- Data e testit: 2026-08-22.
- Kompania aktive: Sistemi Genit.
- Para reset-it: 67 punonjës, 1 periudhë, 2077 rreshta listëprezence, 0 bordero.
- Reset-i u krye vetëm pas konfirmimit të përdoruesit me tekstin `RESET`.
- Pas reset-it: 0 punonjës, 0 periudha, 0 listëprezenca, 0 bordero.
- U krijua dhe u përzgjodh periudha Korrik 2026.
- Pas krijimit, sistemi shfaqi bllokuesin që kërkon Logs të konfirmuara përpara gjenerimit.
- Ende nuk është deklaruar sukses për import, ruajtje, paga ose Bordero.

## Faza 3 — importi

- Pas reset-it dhe krijimit të periudhës, u ngarkua `/home/ubuntu/upload/07.PAGATMUAJIKORRIK2026.xlsx`.
- UI konfirmoi sheet-in `ORET E PUNES`.
- UI konfirmoi `67 punonjës · 2077 qeliza`.
- Importi përfundoi me progres 100% dhe qelizat u shfaqën në grid me formatin normal sipër / shtesë poshtë.
- Në këtë pikë të dhënat janë ende vetëm në gjendjen e importit të ekranit; ruajtja në databazë nuk është bërë ende në këtë test.

## Verifikimi teknik i ruajtjes

- Pas klikimit të Ruaj, databaza u kontrollua drejtpërdrejt dhe raportoi `attendance_count = 2077`.
- Kontrolli i grupeve `(payrollPeriodId, payrollEmployeeId, day)` raportoi `duplicate_groups = 0`.
- U aplikua me sukses constraint-i unik `payrollAttendance_period_employee_day_unique`.
- Backend-i u optimizua që batch-i të përdorë `INSERT ... ON DUPLICATE KEY UPDATE` në vend të SELECT/UPDATE/INSERT për çdo qelizë.
- Frontend-i nuk bën më rifreskim pas çdo batch-i; bën një refresh final pasi përfundojnë të gjitha batch-et.

## Persistenca pas restart-it

Pas restart-it të serverit dhe rihapjes së modulit, Listëprezenca Manuale shfaq përsëri rreshtat e Korrikut 2026 nga databaza, përfshirë KASTRIOT KABOÇI dhe totalet 291 bruto, 261 për pagesë, 240 normale dhe 21 shtesë. Kjo konfirmon persistencën e të dhënave të ruajtura, por testi i ri i butonit pas optimizimit do të matet veçmas.

## Testi i Ruajtjes pas optimizimit

Pas riimportit të workbook-it dhe klikimit të saktë te Ruaj Listëprezencën, UI u kthye nga gjendja `Po ruhet…` në butonin normal dhe grid-i mbeti i plotë me 67 punonjës e 2077 qeliza. Të dhënat ekzistuese u përditësuan përmes çelësit unik pa krijuar rreshta të rinj dublikatë. Verifikimi i toast-it dhe numrit final në databazë do të bëhet me kontrollin pasues të rrjedhës.

## Krahasimi i pavarur Excel–databazë

Nga workbook-i real u numëruan 2,077 qeliza ditore jo bosh. Totali i kolonës `TOTAL OPN` është 13,982 orë normale dhe totali i `TOTAL OJO` është 641 orë shtesë, pra 14,623 orë së bashku. Databaza raporton respektivisht 838,920 minuta normale (= 13,982 orë), 38,460 minuta shtesë (= 641 orë) dhe 877,380 minuta të kombinuara (= 14,623 orë). Për KASTRIOT KABOÇI, të dy burimet japin 240 orë normale, 21 orë shtesë dhe 261 orë për pagesë; grid-i jep gjithashtu 291 orë bruto dhe 282 orë total me pagesë plus shtesë sipas logjikës së aplikacionit.

## Verifikimi vizual i KASTRIOT KABOÇI

Pas filtrimit në ekran shfaqet vetëm `KASTRIOT KABOÇI`; përmbledhja e UI është 291 O.Bruto, 261 O.Pagesë, 240 orë normale dhe 21 orë shtesë, me 0 për secilin kod legjende. Qelizat ditore shfaqin formatin vertikal të orëve normale dhe shtesë, pa shenjën `+` në paraqitjen e listës.

## Verifikim final pas optimizimit të importit dhe Borderosë

- Periudha: Korrik 2026, valuta `ALL` / Lek.
- Burimi i orëve: sheet-i `ORET E PUNES`.
- Qeliza ditore të importuara: **2077**.
- Rreshta të pagave nga `PAGAT KORRIK 2026`: **64**.
- Rreshta të klasifikuar si Të Huaj: **8**; rreshti përmbledhës `PUNETORET TE HUAJ` nuk krijon punonjës.
- Përditësim bulk i të dhënave të punonjësve: **72** pa dublikime.
- Totale Excel: **12,318** orë normale, **497** orë shtesë, bruto **3,471,873.00 L**, bankë **1,847,403.00 L**, cash **1,675,400.00 L**.
- Totale Bordero staf normal: **12,318** orë normale, **497** orë shtesë, bruto **3,471,873.00 L**, bankë **1,847,403.00 L**, cash **1,675,400.00 L**.
- Krahasimi rresht për rresht: **64/64 të gjetur, 64/64 bruto, 64/64 bankë, 64/64 cash; allRowsMatch=true**.
- Kastriot Kaboçi: **240 orë normale, 21 orë shtesë; bruto 79,300.00 L; bankë 44,400.00 L; cash 34,900.00 L**.
- Testet automatike: **121 teste kaluan**; TypeScript `tsc --noEmit` kaloi.
