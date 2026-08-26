# Audit i dokumenteve të Shitjes — 25 gusht 2026

U verifikuan në preview live dy dokumente reale të kompanisë në `sales-invoices?openInvoice=`.

| Dokument | ID | Formati | Rezultati |
|---|---:|---|---|
| 540 | 30068 | EXPORT / EUR / kurs 94.140000 | Dialogu full-screen hapet; toolbar-i shfaq Mbyll, Print, Excel, PDF dhe Pamje vendase; iframe shfaq dokumentin BioBes në A4 portrait me rreshtat reale të faturës. |
| 375 | 30004 | DOMESTIC / ALL | I njëjti dialog full-screen hapet; iframe shfaq formatin vendas A4 me strukturën `FATURE`, të dhënat reale, artikullin dhe seksionin `TË DHËNAT E PAGESËS`. |

Gjatë auditit u konfirmua se dokumenti EXPORT dhe ai vendas nuk përdorin të njëjtin template: EXPORT ka BioBes invoice me fushat e transportit, peshave, bankës dhe totalit në monedhë të huaj; vendasi përdor formatin vendas Alpha me informacionin e pagesës. Butonat e pagesës shfaqen vetëm për faturat POSTED pas patch-it Draft → Posto → Paguaj. Ky audit nuk ndryshoi të dhëna biznesi dhe Pagat nuk u prekën.

## Audit i Raporteve

Në preview live të `/reports?module=Shitje&report=sales_by_customer_pdf`, dritarja Alpha shfaq tani filtrin `Klienti` me input dhe lupë `Kërko klientin`, si dhe filtrat `Kartela` dhe `Magazina` me lookup-et përkatëse. Kjo korrigjon rastin ku raporti shfaqte vetëm datat. Butonat `Mbyll`, `Shiko`, `Printo`, `Excel`, `PDF` dhe `ENTER – Shiko` janë të pranishëm në dialog; rezultatet nuk gjenerohen pa shtypur Shiko/Enter.

## Audit i Raportit të Blerjeve

Në raportin live `purchase_supplier_card_format3_pdf`, filtrat e dritares përfshijnë Shuma (Sasia/Cmimi/Vlefta), Min/Max, numër dokumenti, lloj dokumenti, monedhë, datat, Kartela, Furnitori me lupë dhe Magazinë me lupë. Pas `Shiko`, dokumenti u shfaq me të dhëna reale: Furnitorët, datat, llojet FB, numrat e dokumenteve, debi/kredi/progresiv dhe gjendjen përfundimtare `DEBITOR`. Numrat e dokumenteve u shfaqën me shigjetën `↗` si lidhje burimore. Toolbar-i i rezultatit kishte Mbyll, Printo, Excel dhe PDF.

## Audit i Eksporteve

Nga historiku real i shfletuesit u konfirmua shkarkimi `purchase_supplier_card_format3_pdf_2026-08-25.xlsx`. Historiku përmban gjithashtu eksportet e mëparshme `Regjistri_Faturave_Shitjes.xlsx`, `Export_Invoice_540.pdf`, `inventory_stock_by_location_2026-08-24.xlsx/.pdf`, `accounting_trial_balance_2026-08-24.xlsx/.pdf`, `purchase_invoice_payment_register_pdf_2026-08-24.pdf` dhe `sales_by_customer_pdf_2026-08-24.xlsx`. Kjo konfirmon se eksportet Excel/PDF po krijohen nga rrjedha aktive e raporteve.

## Audit i Raporteve të Magazinës

Në preview live të `inventory_stock_by_location`, dritarja Alpha shfaq filtrat reale `Kartela` dhe `Magazina` me lupa, së bashku me periudhën. Pas ekzekutimit u shfaqën kolonat `Lokacioni`, `Dokumente` dhe `Sasia`; në të dhënat aktuale të kompanisë lokacionet janë të agreguara te `I përgjithshëm`, me totalin real `-358,707` dhe 85 dokumente. Ky rezultat vjen nga balancat reale të stokut dhe nuk u ndryshua me SQL.

U kontrollua gjithashtu se `inventory_stock_by_location` përdor bazën `inventory_balances`, ndërsa `inventory_stock_by_product` përdor bazën `inventory_stock`; variantet nuk përdorin të njëjtin grupim pa dallim.

## Quick-create live verification — 2026-08-25
Në `/purchase-invoices?tab=bills` u hap një faturë e re pa u ruajtur. Formulari aktiv ruajti fushat Draft/Postuar/Paguar, numrin/datën e faturës, rreshtin fillestar me sasi 1, njësi `copë`, çmim 0, magazinën, monedhën ALL, kursin dhe fushat e transportit/inventarit. Në fushën Furnitori u shkrua `Partner Quick Create Verify`; u shfaq komanda `Shto furnitorin`. Klikimi e hapi dialogun `Shto furnitor të ri` mbi dokumentin aktiv. Pas mbylljes pa ruajtje, dokumenti aktiv dhe rreshti mbetën të hapura. Në fushën Artikulli u shkrua `Artikull Quick Create Verify`; u shfaq komanda `Shto artikull`. Nuk u ruajt të dhënë të re në databazë gjatë këtij kontrolli manual.

## Audit i integritetit të ciklit quick-create — 2026-08-25
U kontrollua diff-i i ciklit aktual me `git diff --name-only`: nuk ka skedarë `Payroll`/`payroll` në ndryshime. Në faturën reale të Blerjeve u verifikua live modal-i i dokumentit dhe komanda `Shto furnitorin`/`Shto artikull`; modal-i hapet mbi formën aktive dhe mbyllja pa ruajtje e lë faturën të hapur. Testet regresive të Blerje/Shitje mbulojnë indeksin e rreshtit aktiv dhe payload-in e partnerit; kontrolli teknik përfundoi me 290 teste dhe build production të suksesshëm.

## Quick-create live verification — Shitje — 2026-08-25
Në `/sales-invoices?tab=invoices` u hap `Faturë e re`. Formulari shfaqi magazinën, numrin/datën, monedhën, kursin, formatin Vendase/Eksport, rreshtin e artikullit dhe totalet. Në fushën e klientit u shkrua `Klient Quick Create Verify`; u shfaq `Shto klientin “Klient Quick Create Verify”` dhe klikimi hapi dialogun `Shto klient të ri` mbi faturën aktive. Dialogu përmban Emër, Kod, NIPT, Telefoni, Email, Adresë, Qytet dhe `Ruaj dhe zgjidh`. Nuk u ruajt partner ose faturë provë; dialogu u përdor vetëm për verifikim të rrjedhës dhe më pas u mbyll.

## Audit individual i moduleve operative — desktop — 2026-08-25
U hapën veçmas me routes reale dhe pa overlay/error: `/agents` (Shoferë), `/vehicles` (Mjete), `/cargo-loads` (Ngarkesa), `/weight-forms` (Formularët e Peshave), `/purchase-invoices?tab=bills` (Blerje), `/sales-invoices?tab=invoices` (Shitje), `/reports` (Raporte) dhe `/cash` (Arka). Screenshot-et konfirmuan shell-in Alpha, sidebar-in, breadcrumb-et, titujt e moduleve, toolbar-et dhe kthimin e kontrolluar te workspace-i. U konstatuan route-t e sakta `/cargo-loads` dhe `/cash`; routes `/loads` dhe `/cash-bank` nuk janë routes të aplikacionit dhe nuk u përdorën më.

## Audit individual i moduleve operative — desktop/mobile — 2026-08-25
U verifikuan veçmas me screenshot-e desktop dhe mobile routes reale: `/products` Artikuj, `/inventory` Magazinë, `/partners?type=customer` Klientë, `/partners?type=supplier` Furnitorë, `/accounting` Kontabilitet, `/crm` CRM, `/banks` Banka, `/settings` Konfigurime, `/agents` Shoferë, `/vehicles` Mjete, `/cargo-loads` Ngarkesa, `/weight-forms` Formularë peshe, `/purchase-invoices?tab=bills` Blerje, `/sales-invoices?tab=invoices` Shitje, `/reports` Raporte dhe `/cash` Arkë. Të gjitha u hapën me shell-in Alpha, pa error runtime në preview, me breadcrumb/titull dhe dalje të kontrolluar; në mobile Klientët dhe Furnitorët u konfirmuan si workspace të ndarë. Route-i i Pagave (`/payroll`) u përjashtua me qëllim dhe nuk u hap apo ndryshua.

## Health check pas sortimit — 2026-08-25
Pas restart-it, `http://127.0.0.1:3000/` ktheu HTTP 200 dhe TypeScript watcher raportoi `Found 0 errors`. Mesazhet e vjetra për `Products.tsx` dhe `request aborted` mbeten vetëm në historikun e logut; nuk u riprodhuan në build production, në preview-t e fundit ose në health check aktual.

## Burimi i Konfigurimeve Alpha — audit 2026-08-25
Playlistja zyrtare e përdorur për referencë është `Alpha Platinum Business` nga IMB. Videoja relevante është `Konfigurimet për mënyrën e të punuarit në Alpha Business` (10:45, video 4/13, ID `Q_AJHvpbmZ0`). Përshkrimi i videos konfirmon rrjedhën: pas zgjedhjes së ndërmarrjes përdoruesi futet automatikisht në dritaren e punës dhe menuja kryesore në pjesën e sipërme përmban konfigurimet fillestare. Në të njëjtën playlistë janë të ndara videot për `Administrimi menusë Skedarë`, `Moduli i Likuiditeteve`, `Moduli Inventarit` dhe `Moduli i Shitjeve`; këto do të përdoren vetëm si referencë për funksionet përkatëse, jo për të shpikur nënmenu.

Frame-i rreth 5:21 i videos së Konfigurimeve tregon strukturë desktop me menu vertikale në të majtë dhe ambient pune në qendër. Në menu duken grupimet `Klientët dhe Shitjet`, `Furnitorët dhe Blerjet`, `Menaxhimi i Magazinës`, `Kontabiliteti`, `Arka dhe Banka`, si dhe `Zgjidh ndërmarrjen`. Ambienti i moduleve përdor ikona të mëdha në panelin qendror, listë dokumentesh në të djathtë dhe shirita tab/toolbar; kjo është më afër një workspace-je modulare sesa një faqeje settings me vetëm katër tab-e. Konfigurimet cloud duhet të paraqiten në këtë hierarki dhe jo të shtojnë menu të paautorizuara nga videoja.

## Konfigurime — preview desktop pas rindërtimit — 2026-08-25
Preview-t e `/settings?section=configuration`, `/settings?section=company` dhe `/settings?section=fields` shfaqin tani dritare Alpha me titlebar, toolbar sipër, panel të majtë `Konfigurimet Alpha` dhe përmbajtje funksionale në të djathtë. Paneli lidhet me route-t reale `Njësi matjeje` → `/measurement-units`, `Qytete dhe njësi administrative` → `/administrative-units`, `Magazina` → `/inventory`, `Arka dhe banka` → `/cash`, `Llogari dhe ditarë` → `/accounting`, `Përdoruesit` → `/users-roles`. Preview-t e këtyre route-ve reale u hapën pa overlay/error dhe ruajtën shell-in e moduleve të tyre; të dhënat e shfaqura janë të kompanisë aktive, jo fixtures. `pnpm check` raportoi 0 gabime. Ky është përshtatje e skeletit të konfigurimeve sipas strukturës së videos; formatet e veçanta të çdo katalogu vazhdojnë me faqet e tyre ekzistuese.

## Konfigurime — preview mobile — 2026-08-25
Në viewport 375x812 paneli Alpha i Konfigurimeve shfaqet si kolonë e lexueshme me titlebar, toolbar, menu të majtë të adaptuar në gjerësi dhe përmbajtje të seksionit aktiv. U verifikuan `Mënyra e punës`, `Ndërmarrja`, `Fusha shtesë` dhe `Backup automatik`; tab-i aktiv dhe titulli i dritares ndryshojnë sipas query-parametrit. Menuja përfshin vetëm destinacione të lidhura me route reale dhe nuk përmban Pagat. Nëse disa etiketa të toolbar-it preken në gjerësi të vogël, kjo është sjellje e densitetit desktop Alpha; përmbajtja mbetet e navigueshme me scroll horizontal të kontrolluar nga workspace-i.

## Konfigurime — preview final desktop — 2026-08-25
Preview-i live i Konfigurimeve tregon qartë dritaren Alpha: toolbar horizontal me Ndërmarrja, Konfigurime, Backup automatik, Fusha shtesë, Ndihmë dhe Mbyll; panelin anësor me nënmenu reale; dhe formularin aktiv në panelin e djathtë. Seksionet `Mënyra e punës` dhe `Ndërmarrja` shfaqin fushat reale të kompanisë aktive, përfshirë planin kontabël, ngurtësimin, çmimet, maturimet, të dhënat identifikuese dhe butonin Ruaj. Dritarja ruan densitetin, ngjyrat dhe hierarkinë e workspace-it Alpha; nuk shfaq module Pagash.
