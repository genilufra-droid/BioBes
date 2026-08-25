# Instalimi

## Lokal

Kërkohen Node.js 22+, pnpm 10+ dhe një MySQL/TiDB bosh. Klono repository-n, ekzekuto `pnpm install`, krijo konfigurimin lokal sipas listës së variables në `server/_core/env.ts`, plotëso `DATABASE_URL`, `JWT_SECRET` dhe OAuth settings, pastaj ekzekuto `pnpm check`, `pnpm test`, `pnpm build` dhe `pnpm dev`. Migrimet ruhen në `drizzle/`; në një ambient të kontrolluar përdor workflow-n e Drizzle të projektit dhe verifiko SQL para aplikimit.

## Docker

Ky eksport nuk vendos secrets në Dockerfile. Përdor një image Node 22, injekto variables nga secret manager-i i serverit, ekzekuto `pnpm install --frozen-lockfile`, `pnpm build` dhe nis `pnpm start`. Database duhet të jetë shërbim i jashtëm MySQL/TiDB me SSL dhe backup aktiv.

## Verifikim

Pas nisjes kontrollo autentikimin, route-in kryesor, një listim real dhe një test formulari. Mos përdor të dhëna reale prodhimi në development.
