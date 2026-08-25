# BioBes — Sistemi Genit Cloud

BioBes është source code-i i Sistemi Genit Cloud, një ERP cloud multi-user dhe multi-company për menaxhimin e klientëve, shitjeve, blerjeve, magazinës, arkës, bankës, kontabilitetit, raporteve dhe konfigurimeve. Projekti përdor React 19, TypeScript, Vite, Express, tRPC, Drizzle ORM dhe MySQL/TiDB. Pamja Alpha Classic dhe formulari i faturës së shitjes janë pjesë e source-it aktual.

> **Gjendja e eksportit:** Ky repository përmban source code-in dhe konfigurimet e projektit aktual, jo secrets, `.env` real, `node_modules`, `dist`, log-e ose të dhëna reale të klientëve. Moduli Pagat mbahet jashtë eksportit të BioBes sipas kufizimit të projektit dhe nuk duhet aktivizuar pa autorizim të veçantë.

## Quick start

1. Klono repository-n dhe instalo Node.js 22+ dhe pnpm 10+.
2. Ekzekuto `pnpm install`.
3. Kopjo `.env.example` në `.env` dhe plotëso vetëm vlerat e ambientit tënd.
4. Ekzekuto `pnpm check`, `pnpm test` dhe `pnpm build`.
5. Për zhvillim përdor `pnpm dev`; aplikacioni hapet në portin e dhënë nga ambienti.

Për Docker, prodhim, migrime, Windows dhe zhvillim modulesh shih [docs/INSTALL.md](docs/INSTALL.md), [docs/DEPLOY-CLOUD.md](docs/DEPLOY-CLOUD.md) dhe [docs/BUILD-WINDOWS.md](docs/BUILD-WINDOWS.md).

## Struktura

| Dosja | Përmbajtja |
|---|---|
| `client/` | React pages, components, formularë, raporte dhe stile |
| `server/` | tRPC routers, shërbime, database helpers dhe teste |
| `shared/` | tipe dhe konstanta të përbashkëta |
| `drizzle/` | schema, relations dhe migrime kronologjike |
| `desktop/` | wrapper Electron për përdorim lokal/Windows |
| `docs/` | udhëzime për instalim, arkitekturë, module, raporte dhe forma |
| `.github/` | CI, template issue dhe pull request |
| `scripts/` | mjete ndihmëse të zhvillimit dhe backup-it |

## Module të përfshira

Klientë dhe partnerë, shitje, blerje, magazinë dhe stok, arka dhe banka, kontabilitet, transport/dokumente, konfigurime, raporte, autentikim/role, multi-company dhe import/export Excel/PDF janë të përfshira në source. Lista e detajuar ndodhet te [docs/MODULES.md](docs/MODULES.md).

## Zhvillimi

Kontratat backend janë tRPC-first. Frontend-i përdor `trpc.*` hooks; database schema mbahet te `drizzle/schema.ts`; çdo ndryshim i rëndësishëm duhet të ketë test Vitest. Për module të reja ndiq [docs/ADD-MODULE.md](docs/ADD-MODULE.md), ndërsa për raporte dhe forma ndiq [docs/ADD-REPORT.md](docs/ADD-REPORT.md) dhe [docs/ADD-FORM.md](docs/ADD-FORM.md).

## Licenca dhe siguria

Kodi licencohet me MIT. Mos commit-o secrets, `.env`, tokena, certifikata private, dump-e të bazës së të dhënave ose të dhëna personale. Raporto dobësitë privatisht te administratori i repository-t.
