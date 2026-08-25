# Audit teknik i BioBes dhe kërkesa finale për developerin

Data e auditit: 25 gusht 2026  
Repository: https://github.com/genilufra-droid/BioBes  
Commit i audituar: `bd2cc1fb44e1f307f557cdb2b57ad24155bb2c7f`

## Përfundimi

Repository përmban një sasi reale dhe të konsiderueshme source code-i: frontend React/TypeScript, backend Express/tRPC, schema dhe 41 migrime Drizzle/MySQL, teste, Docker, CI dhe wrapper Electron. Nuk është thjesht një build i kompiluar apo një projekt bosh.

Megjithatë, ai **nuk është source i plotë, i pavarur dhe i gatshëm për ngritje cloud nga zero**. Nuk mund të pranohet si dorëzim final production-ready. Nuk mund të provohet as që asnjë source tjetër nuk mbahet jashtë repository-t, sepse skripti i deklaruar për krahasimin me source-in origjinal nuk punon në klonimin aktual dhe source-i origjinal privat nuk është pjesë e auditit.

## Çfarë u verifikua

- 506 skedarë të gjurmuar në Git.
- Rreth 38,125 rreshta TypeScript/JavaScript/Python/SQL.
- 35 skedarë te faqet e frontend-it dhe 65 skedarë serveri.
- 68 tabela të deklaruara në schema dhe 41 migrime SQL (`0000`–`0040`).
- 87 skedarë testesh, gjithsej 308 teste të ekzekutuara.
- `pnpm install --frozen-lockfile`: kalon.
- `pnpm check`: kalon.
- `pnpm build`: kalon, por me paralajmërime dhe konfigurim OAuth të pavlefshëm kur ndërtohet sipas Docker-it aktual.
- `pnpm test`: **dështon** — 307 teste kalojnë, 1 dështon.
- `pnpm integrity:verify`: **dështon** — skripti kërkon referencën Git `github/main`, e cila nuk ekziston në një klonim normal me remote `origin`.
- `pnpm audit --prod`: 85 dobësi të raportuara — 1 kritike, 23 të larta, 51 mesatare dhe 10 të ulëta.
- `drizzle-kit check`: struktura e migrimeve kalon kontrollin statik. Nuk ka test real integrimi mbi një MySQL bosh në repository/CI.

## Boshllëqet bllokuese

### 1. Varësi private nga Manus/Forge

Autentikimi nuk është i pavarur. Frontend-i dhe serveri përdorin portalin dhe endpoint-et specifike të Manus (`VITE_OAUTH_PORTAL_URL`, `OAUTH_SERVER_URL`, `VITE_APP_ID`, `manus-cookie`, `WebDevAuthPublicService`). Nuk ka login lokal, password hash, OIDC standard të konfigurueshëm apo provider alternativ.

Ngarkimi dhe leximi i dokumenteve përdor `BUILT_IN_FORGE_API_URL` dhe `BUILT_IN_FORGE_API_KEY`. Paketat AWS S3 janë të instaluara, por source-i i storage-it nuk përdor një klient S3 të pavarur. Pa shërbimin privat Forge, arkiva e dokumenteve nuk punon.

### 2. Docker-i aktual nuk prodhon login funksional

Vite i fikson variablat `VITE_*` gjatë build-it. Dockerfile ekzekuton build-in pa këto variabla, ndërsa `docker-compose.yml` i vendos vetëm në runtime. Build-i i provuar prodhoi kod me `new URL("undefined/app-auth")`. Gjithashtu, placeholder-at e analytics mbeten në `dist/public/index.html`.

### 3. Nuk ka bootstrap për instalim bosh

Nuk ka rrjedhë të plotë “first run” për të krijuar pronarin, kompaninë e parë dhe lidhjen `userCompanies`. `company.create` krijon vetëm kompaninë dhe nuk krijon membership `owner`. Frontend-i pret që përdoruesi të ketë tashmë një kompani; në DB bosh ngelet te “Po hapet kompania…”.

Docker/CI nuk aplikojnë migrimet dhe nuk ekzekutojnë seed/bootstrap automatik. Nuk ka seed të sigurt me të dhëna demo të anonimizuara.

### 4. Izolimi multi-company dhe RBAC janë të paplotë

Shumë endpoint-e marrin `companyId` nga klienti pa verifikuar membership-in. Shembuj të qartë janë listimi/krijimi/ndryshimi/fshirja e furnitorëve dhe klientëve, listimi i produkteve, formularët e peshës dhe disa endpoint-e të faturave të blerjes/shitjes.

Skanimi statik gjeti 141 mutation handlers; 115 nuk përdorin guard-in e shkrimit `assertCompanyWriteAccess`/menaxhimit të roleve. Nga 81 query handlers, 29 nuk kanë guard eksplicit të kompanisë. Jo çdo endpoint në këto numra duhet të jetë company-scoped, por lista përfshin shumë operacione reale biznesi që duhet të jenë të mbrojtura.

Testi që dështon e konfirmon problemin e rendit të kontrollit: për rolin `viewer`, anulimi/fshirja e pagesës arrin fillimisht te kërkimi i dokumentit dhe kthen `NOT_FOUND`, në vend që të bllokohet menjëherë me `FORBIDDEN`.

### 5. Integriteti i databazës është i pamjaftueshëm për ERP

Schema ka 68 tabela, por nuk deklaron foreign keys me `.references(...)`. Ka vetëm disa unique indexes. Numrat e faturave të blerjes/shitjes dhe disa dokumenteve të tjera kontrollohen me një lexim aplikativ para insert-it, jo me constraint unik dhe numërim atomik. Dy përdorues paralelë mund të krijojnë dublikime.

Rrjedha e stokut kërkon test real: krijimi i faturës së blerjes shton stok menjëherë, ndërsa validimi i pranimit shton gjithashtu stok. Pa lidhje dhe idempotencë të provuar fund-më-fund ka rrezik dublimi. Vetë `todo.md` mban të hapur defektin kritik “Blerjet nuk reflektohen në Magazina”.

### 6. Sistemi dhe raportet nuk janë përfunduar

`todo.md` përmban 357 detyra të pakryera, përfshirë:

- defekt kritik të blerjeve/magazinës;
- faqe të bardhë në Pagat;
- testime reale të shitjeve dhe bankës;
- përputhjen e Pagave me HTML 5.11;
- raporte me të dhëna reale dhe formate reference;
- editim/anulim/fshirje dhe auditim në të gjitha modulet;
- sinkronizim të pamjes me Excel/PDF/Print;
- verifikim desktop/mobile.

Katalogu i raporteve përdor shumë `baseKey` dhe transformime të përgjithshme për të paraqitur variante të ndryshme. Disa raporte reference krijojnë kolona bosh, p.sh. fusha doganore, transporti dhe siguracioni. Kjo është pamje/formë, jo implementim i plotë i të dhënave.

### 7. Testimi dhe deploy-i nuk plotësojnë standardin production

- Një test dështon dhe CI do të dështojë te `pnpm test` në të njëjtën gjendje.
- Nuk ka test real të migrimeve mbi DB bosh.
- Nuk ka teste integrimi të workflow-ve me MySQL dhe nuk ka E2E browser për rrjedhat kryesore.
- Health endpoint kthen vetëm `{ok:true}` dhe nuk kontrollon databazën, migrimet, OAuth-in apo storage-in.
- Mungon `.dockerignore`; një `.env` lokal mund të kopjohet pa dashje në image nga `COPY . .`.
- Dockerfile nuk është multi-stage, nuk ekzekuton si përdorues jo-root dhe nuk ka app healthcheck/readiness.
- Nuk ka backup/restore operational të provuar, monitoring, rate limiting dhe procedurë rollback-u.

### 8. Dorëzimi nuk përmban historikun e plotë të zhvillimit

Repository ka vetëm 6 commit-e, të gjitha brenda rreth 35 minutash më 25 gusht 2026 dhe nga një autor gjenerik lokal. Kjo tregon një export snapshot, jo historikun real të zhvillimit. Nuk ka asnjë PDF/XLSX/imazh reference të gjurmuar. Këto mund të përjashtohen për privatësi, por developer-i duhet të dorëzojë versionet e anonimizuara që janë të nevojshme për të rindërtuar dhe verifikuar formatet.

## Prompt i prerë për developerin

Kopjoje tekstin më poshtë pa ndryshime:

---

**SUBJEKT: DORËZIM FINAL I DETYRUESHËM — SOURCE I PLOTË, SELF-HOSTED DHE I VERIFIKUESHËM I BIOBES**

Repository i dorëzimit është: https://github.com/genilufra-droid/BioBes

Ky nuk është kërkim për raport verbal, screenshot, demo, ZIP të pjesshëm apo premtim se “source është i plotë”. Kërkoj dorëzimin teknik të plotë, të riprodhueshëm nga një kompjuter/server i pastër dhe pa varësi të fshehura. Dorëzimi nuk quhet i pranuar derisa të plotësohen dhe të provohen të gjitha pikat e mëposhtme.

### A. Dorëzo gjithë source-in dhe historikun

1. Push-o në repository të gjithë source code-in e frontend-it, backend-it, databazës, migrimeve, seed/bootstrap-it, autentikimit, storage-it, raporteve, PDF/Excel/Print, Pagave, testeve, CI/CD, Docker-it, wrapper-it Windows dhe çdo scripti që përdoret për build, import, export, deploy, backup ose restore.
2. Përfshi të gjitha branch-et, tag-et dhe historikun real të Git. Nëse historiku i mëparshëm teknikisht nuk mund të eksportohet nga platforma ku është zhvilluar, deklaroje me shkrim dhe jep snapshot-in e plotë të fundit plus manifestin e origjinës së çdo komponenti.
3. Mos mbaj source në repository private, workspace personal, paketë private, server, plugin ose shërbim të tretë pa ma transferuar pronësinë/aksesin dhe pa e dokumentuar. Çdo varësi e tillë duhet të listohet me emër, version, licencë, pronar dhe mënyrën e zëvendësimit.
4. Mos dorëzo vetëm `dist`, minified bundle, executable ose skedarë të gjeneruar. Duhet kodi i lexueshëm dhe i modifikueshëm.
5. Dorëzo `SOURCE_MANIFEST.json` me çdo skedar të pritshëm, madhësinë dhe SHA-256. Rregullo skriptin e integritetit që të punojë në një klonim normal me `origin/main`, pa remote/path të hardkoduar.
6. Dorëzo asetet dhe shabllonet reference të nevojshme për formatet e sistemit në version të anonimizuar: Excel, PDF, logo, imazhe, mapping-e importi dhe data demo. Mos përfshi të dhëna reale personale.

### B. Hiq varësitë e fshehura të platformës

7. Sistemi duhet të ngrihet jashtë Manus. Zëvendëso ose abstrago OAuth-in specifik Manus me autentikim self-hosted ose OIDC/OAuth 2.0 standard, të dokumentuar. Duhet të ketë first-run setup për pronarin e parë, login/logout, rikuperim aksesi, role dhe session security.
8. Zëvendëso Forge storage me storage S3-compatible të pavarur (AWS S3, MinIO ose ekuivalent), përmes konfigurimit standard. Upload/download i dokumenteve duhet të testohet pa `BUILT_IN_FORGE_API_*`.
9. Hiq varësinë e domosdoshme nga `vite-plugin-manus-runtime`, `manus-cookie`, endpoint-et `WebDevAuthPublicService` dhe çdo URL/private API Manus nga rrjedha production.
10. Mos më dërgo dhe mos commit-o passworde, tokena, private keys, `.env` real apo dump production. Dorëzo `.env.example` të plotë me placeholder-a, dokumento çdo variable dhe transfero pronësinë e llogarive/shërbimeve me kanal të sigurt; pas transferimit kredencialet duhen rrotulluar.

### C. Databaza dhe first-run

11. Një `docker compose up --build` mbi DB bosh duhet të aplikojë migrimet në mënyrë të kontrolluar, të krijojë pronarin/kompaninë e parë dhe ta bëjë sistemin të përdorshëm pa ndërhyrje manuale në SQL.
12. `company.create` duhet të krijojë në të njëjtin transaction membership-in `owner` për përdoruesin aktiv.
13. Shto foreign keys, indexes dhe unique constraints për lidhjet kritike. Numërimi i dokumenteve duhet të jetë atomik dhe unik sipas kompanisë/llojit/periudhës, me test konkurrence.
14. Dorëzo seed demo të anonimizuar dhe script-e të provuara `migrate`, `seed`, `backup`, `restore` dhe `rollback`. Migrimi production nuk duhet të gjenerojë migration të re në momentin e deploy-it.

### D. Siguria multi-company dhe rolet

15. Çdo query/mutation biznesi duhet të kontrollojë session-in dhe membership-in e kompanisë në server; asnjë endpoint nuk duhet t’i besojë vetëm `companyId` të ardhur nga browser-i.
16. Çdo mutation duhet të kontrollojë rolin e shkrimit **para** leximit ose ndryshimit të dokumentit. `viewer` duhet të jetë read-only në çdo modul.
17. Rregullo të gjitha endpoint-et, jo vetëm testin aktual: furnitorë, klientë, produkte, katalogë, peshore, blerje, shitje, magazinë, kontabilitet, bankë, CRM, transport, dokumente dhe Pagat.
18. Shto teste negative cross-tenant: përdoruesi i Kompanisë A nuk duhet të lexojë, krijojë, ndryshojë, postojë, anulojë, fshijë, eksportojë apo shkarkojë asgjë të Kompanisë B, edhe kur di ID-në.
19. Kryej dependency/security audit dhe mbyll dobësitë kritike/të larta. Versioni aktual raporton 85 dobësi production, përfshirë 1 kritike dhe 23 të larta. Dorëzo raportin final me zero critical/high ose arsyetim dhe mitigim të miratuar shprehimisht.

### E. Plotëso funksionet reale, pa placeholder

20. Mbyll të gjitha detyrat P0/P1 dhe defektet kritike në `todo.md`. Çdo detyrë e mbetur duhet të listohet qartë si jashtë scope-it dhe kërkon miratimin tim; nuk lejohet të fshihet `todo.md` për të fshehur punën e pambyllur.
21. Verifiko pa dublikim ciklin Blerje: Porosi → Pranim → Faturë furnitori → Pagesë → Stok → Kontabilitet → Kartelë furnitori → Raporte.
22. Verifiko ciklin Shitje: Ofertë → Porosi → Dërgesë → Faturë → Pagesë → Kthim → Stok → Kontabilitet → Kartelë klienti → Raporte.
23. Përcakto qartë kur lëviz stoku. Drafti nuk duhet të ndryshojë stokun pa rregull biznesi të miratuar. Pranimi/fatura dhe dërgesa/fatura nuk duhet të postojnë dy herë të njëjtën sasi. Të gjitha veprimet duhet të jenë transaksionale dhe idempotente.
24. Përfundo Pagat nga Logs/Listëprezencë deri te Bordero, Bankë, Cash, Fletëpagesa, Kontribute, Kartelë Personale, Analitikë, Leje/Mungesa, Historik dhe Backup/Restore. Testo me skedarë reference të anonimizuar.
25. Çdo raport duhet të ketë query dhe llogaritje reale për qëllimin e vet. Nuk pranoj vetëm riemërtim të të njëjtit dataset, kolona bosh, placeholder ose të dhëna të fabrikuara.
26. Pamja në ekran, Excel, PDF dhe Print Preview duhet të ketë të njëjtat rreshta, filtra, renditje, totale, monedhë dhe dokument burimor. Verifiko desktop dhe Android/mobile.
27. Çdo CRUD, status transition, editim, anulim dhe fshirje duhet të respektojë rregullat e dokumentit dhe të regjistrohet në audit log.

### F. Deploy production i riprodhueshëm

28. Rregullo Docker-in që variablat `VITE_*` të jepen në build ose përdor runtime config të sigurt. Nuk pranohet bundle me `undefined/app-auth` apo `%VITE_*%` të pambushura.
29. Shto `.dockerignore`, multi-stage build, përdorues non-root, app healthcheck/readiness që kontrollon DB/migrimet, graceful shutdown dhe version/commit endpoint.
30. Shto CI që ekzekuton install frozen, typecheck, unit tests, integration tests me MySQL bosh, migrime, build, security scan, Docker smoke test dhe E2E të rrjedhave kritike.
31. Dokumento deploy-in në server real: domain/HTTPS, reverse proxy, DB SSL, storage, backup schedule, retention, monitoring, log rotation, restore drill dhe rollback.

### G. Provat e pranimit

32. Para dorëzimit, një person/runner pa akses në workspace-in tënd duhet të bëjë klonim të ri dhe të ekzekutojë me sukses:

```bash
git clone https://github.com/genilufra-droid/BioBes.git
cd BioBes
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
docker compose up --build -d
```

Pastaj duhet të provojë mbi DB bosh: first owner/company, login, kompani të dytë dhe izolim multi-company, të gjitha workflow-t e Blerjes/Shitjes/Magazinës/Bankës/Kontabilitetit/Pagave, upload/download, Excel/PDF/Print, backup dhe restore.

33. Dorëzo një `FINAL_ACCEPTANCE_REPORT.md` që përmban commit SHA, tag-un final, versionet Node/pnpm/MySQL, komandat e ekzekutuara, rezultatin e çdo testi, migrimet e aplikuara, skenarët E2E, security audit dhe çdo kufizim të mbetur.
34. Krijo release/tag final vetëm pasi CI është plotësisht green. Më jep akses `Owner/Admin` te repository, hosting, database, object storage, OAuth provider, DNS dhe CI/CD. Nuk pranoj varësi nga llogaria personale e developerit.

**Kusht përfundimtar:** mos e deklaro sistemin “100% funksional”, “source i plotë” ose “gati për cloud” pa kaluar provat e mësipërme nga një klonim dhe DB bosh. Çdo skedar, modul, shërbim i jashtëm ose kufizim që nuk dorëzohet duhet të deklarohet me emër dhe arsye. Mungesa e deklarimit konsiderohet dorëzim i paplotë.

---

## Çfarë nuk duhet kërkuar në Git

Për të shmangur keqkuptimin: `node_modules`, `dist`, log-et, `.env` real, passwordet, tokenat, private keys, dump-i production dhe të dhënat personale nuk duhet të publikohen. Ajo që duhet dorëzuar është source-i që i gjeneron, lockfiles, `.env.example`, migrimet, seed-i i anonimizuar, dokumentacioni dhe transferimi i sigurt i pronësisë së shërbimeve.
