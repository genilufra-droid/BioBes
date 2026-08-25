# BioBes — Raport transparence i pranimit teknik

**Data:** 25 gusht 2026  
**Repository:** https://github.com/genilufra-droid/BioBes  
**Commit i fundit:** `8cf58e7`  
**Tag i fundit i publikuar:** `v1.2.2`

## Rezultate të provuara

Klonimi dhe krahasimi source-versus-export tani funksionon pa emër remote të hardkoduar. `scripts/verify_biobes_integrity.py` zbulon automatikisht `origin/main` ose remote-in `github`, ndërsa `SOURCE_MANIFEST.json` përmban madhësi dhe SHA-256 për skedarët e dorëzimit. Në auditin final u gjetën 611 skedarë lokalë të krahasueshëm, 0 source-code të munguar, 0 hash mismatch dhe 0 remote-only pas përjashtimit të manifestit të gjeneruar; 97 skedarë jo-source janë të dokumentuar si të përjashtuar.

U shtuan local auth me scrypt/JWT, first-run company setup me owner membership në transaction, storage local dhe S3-compatible AWS/MinIO, Docker multi-stage me non-root user, `.dockerignore`, healthcheck `/healthz`, migration `0041` dhe dokumentimi i konfigurimit. Pas një dështimi real të Cloud Build nga mungesa e `patches/wouter@3.7.1.patch`, Dockerfile tani kopjon `patches/` në builder dhe runtime përpara `pnpm install --frozen-lockfile`. U përditësuan tRPC në 11.18.0 dhe Drizzle ORM në 0.45.2. Pas startup failure `ERR_MODULE_NOT_FOUND` në runtime, u identifikua se bundle-i server importon `vite` dhe `vite-plugin-manus-runtime`; ato u zhvendosën në production dependencies që runtime stage t'i instalojë. `pnpm install --lockfile-only`, `pnpm check`, 88 test files/309 teste dhe production build kaluan.

## Kufizime që nuk deklarohen si të mbyllura

Ky raport nuk e deklaron sistemin production-ready 100%. Nuk është kryer ende integration/E2E me MySQL bosh dhe Docker smoke test lokal në këtë sandbox, sepse Docker CLI nuk është i disponueshëm. Deployment-i i menaxhuar provoi patch fix-in, por dështoi më pas në startup me `ERR_MODULE_NOT_FOUND`; pas importit runtime URL, log-et e Cloud Run konfirmuan `Server running on http://localhost:3000/` dhe nuk raportuan më `ERR_MODULE_NOT_FOUND`. U mbyllën FK-të core dhe unique membership, si dhe unique `(companyId, docNumber)` për porosi, pranime, kthime, oferta, porosi shitje dhe fatura shitje përmes migration 0043. Faturat e blerjes nuk u përfshinë sepse auditimi gjeti dy fatura reale në të njëjtën kompani me `bl-01`/`BL-01` dhe nuk u ndryshuan pa konfirmim. Mbeten gjithashtu disa guard-a individuale multi-company/RBAC; procedurat Payroll që marrin vetëm `payrollPeriodId` nuk u prekën sipas kufizimit të modulit të Pagave dhe kërkojnë refaktorim të dedikuar. Mbeten edhe idempotenca e çdo workflow-je të stokut, backup/restore drill, rate limiting, OIDC standard, password recovery dhe të gjitha provat e formateve PDF/Excel/Print në desktop/mobile.

Profili `manus` mbetet kompatibil për preview-n ekzistues; profili i pavarur kërkon `AUTH_PROVIDER=local` ose `STORAGE_PROVIDER=local|s3` dhe variables të dokumentuara. Këto janë kërkesa konfigurimi të deklaruara, jo secrets të përfshira në repository. `pnpm audit --prod` pas përditësimit raporton 1 critical, 21 high, 51 moderate dhe 10 low; `xlsx` nuk ka patch upstream dhe disa probleme janë transitive, ndaj dependency gate nuk konsiderohet i mbyllur.

## Komandat e verifikuara

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
python3 scripts/verify_biobes_integrity.py --source /path/to/sistemi-genit-cloud --export /path/to/biobes
```

Rezultati i fundit: `MISSING_SOURCE_CODE=0`, `HASH_MISMATCH=0`, `REMOTE_ONLY=0`, `INTEGRITY_EXIT=0`.
