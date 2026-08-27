# Sistemi Genit Cloud - TODO

## Database Schema
- [x] Tabela për kompani (multi-company support)
- [x] Tabela për përdorues dhe rolet
- [x] Tabela për furnitorë (suppliers)
- [x] Tabela për klientë (customers)
- [x] Tabela për artikuj/produkte (products)
- [x] Tabela për kategori artikujsh
- [x] Tabela për njësi matëse (units)
- [x] Tabela për magazina (warehouses)
- [x] Tabela për agentë (agents)
- [x] Tabela për mjete (vehicles)
- [x] Tabela për ngarkesa (cargoLoads)
- [x] Tabela për formularë peshe (weight forms)
- [x] Tabela për faturat e blerjes (purchase invoices)
- [x] Tabela për faturat e shitjes (sales invoices)
- [x] Tabela për oferta shitjeje (sales quotations)
- [x] Tabela për porosi (purchase/sales orders)
- [x] Tabela për pranime blerjeje (purchase receipts)
- [x] Tabela për kthime (returns)
- [x] Tabela për nota krediti (credit notes)
- [x] Notat e Kreditit: krijo dokumentin me faturë burimore, partner, shumë, TVSH, arsye dhe status
- [x] Tabela për fletë-dalje (delivery notes)
- [x] Tabela për lëvizje stoku (stock movements)
- [x] Tabela për pagesa (payments)
- [x] Tabela për arkë (cash accounts) — të mbuluara nga bankAccounts me llojin CASH
- [x] Tabela për banka (bank accounts)

## Backend API (tRPC Procedures)
- [x] Auth procedures (login, logout, me)
- [x] Company management (CRUD)
- [x] Supplier management (CRUD + balance)
- [x] Customer management (CRUD + balance)
- [x] Product management (CRUD + stock tracking)
- [x] Weight form procedures
- [x] Purchase invoice procedures
- [x] Sales invoice procedures
- [x] Stock movement procedures
- [x] Payment procedures
- [x] Report procedures (aggregations)

## Frontend Pages
- [x] Dashboard me KPI-t
- [x] Partnerët (Furnitorë & Klientë)
- [x] Artikujt
- [x] Formulari i Peshave
- [x] Faturat e Blerjes
- [x] Faturat e Shitjes
- [x] Oferta Shitjeje
- [x] Porosi
- [x] Pranime Blerjeje
- [x] Kthime
- [x] Nota Krediti
- [x] Detyro zgjedhjen e faturës burimore në krijimin e Notës së Kreditit dhe blloko ruajtjen pa lidhje.
- [x] Lidh automatikisht partnerin nga fatura burimore në Notën e Kreditit dhe mos lejo partner të pambështetur.
- [x] Shto postimin dhe anulimin e audituar të Notave të Kreditit me status të dukshëm në dokument.
- [x] Fletë-Dalje
- [x] Raporte (Blerje, Shitje, Stok) — raportet e Blerjeve dhe Shitjeve janë implementuar; Magazina ka raport të filtrueshëm me agregime dhe eksport PDF/Excel
- [x] Paneli i Arkës
- [x] Paneli i Bankës
- [x] Cilësimet
- [x] Përdoruesit dhe Rolet
- [x] Shto në modulin Përdoruesit dhe Rolet menaxhimin e plotë të anëtarëve: shto/lidh përdorues në kompani, hiq anëtar nga kompania dhe verifiko kufizimet e roleve.
- [x] Verifiko në browser workflow-t fund-më-fund të modifikimit të roleve dhe menaxhimit të anëtarëve në /users-roles para se ta shënosh si të përfunduar.
- [x] Testo me një përdorues të dytë real shtimin, ndryshimin e rolit dhe heqjen nga kompania; verifiko mbrojtjen e owner dhe përdoruesit aktiv.
- [x] Audit Log

## UI Components
- [x] Sidebar navigation (multi-view)
- [x] Topbar me info kompanie
- [x] KPI cards
- [ ] Tables me sorting/filtering
- [x] Shto renditje të drejtpërdrejtë sipas datës, numrit dhe shumës në regjistrin e Arkës, pa dropdown.
- [ ] Forms për CRUD operacione — krijimi/validimi është implementuar; mbeten editimi dhe fshirja për entitetet e reja
- [x] Modal dialogs
- [x] Status badges
- [ ] Export menu (Print/PDF/Excel)
- [ ] Search autocomplete (SAC)

## Features
- [x] Multi-company support
- [x] Multi-user authentication
- [x] Role-based access control
- [x] Blloko rolin Lexues nga krijimi, postimi, anulimi dhe fshirja e pagesave dhe Notave të Kreditit; ruaj aksesin vetëm për lexim.
- [x] Verifiko fund-më-fund FORBIDDEN për Lexues te payment.post/cancel/deleteDraft, creditNotes.create/setStatus, dhe lejo vetëm query-t e leximit përkatës.
- [x] Shto fshirjen e sigurt vetëm për Draft të Notave të Kreditit dhe verifiko bllokimin për rolin Lexues.
- [ ] Document numbering (auto-increment)
- [x] Status tracking (DRAFT, POSTED, PAID, etc.)
- [ ] Balance tracking (suppliers, customers)
- [x] Stock tracking
- [ ] Weight form management
- [x] Payment tracking
- [ ] Audit logging
- [x] PDF export
- [x] Excel export

## Testing
- [ ] Unit tests për backend procedures — testet e ndihmësve janë implementuar; mbeten testet e router-ave dhe workflow-ve me DB
- [ ] Integration tests për database operations
- [ ] Frontend component tests

## Deployment
- [x] Environment variables configured
- [x] Database migrations applied
- [x] Project checkpoint saved
- [x] Ready for publishing

## Sistemi Genit Cloud - PËRFUNDUAR

✅ **Sistemi cloud identik me HTML-in origjinal:**
- Multi-company & multi-user support
- 18 tabelat në bazën e të dhënave
- Backend API me tRPC procedures
- Dashboard me KPI cards
- Sidebar navigation me 6 module
- Responsive design
- Authentication flow
- Company selector

## New Features Requested
- [ ] Pagat: inventarizo të 22 pamjet e HTML-it 5.11 dhe dokumento ndryshimet e sakta kundrejt cloud-it.
- [ ] Pagat: rindërto Kartelën Personale dhe analitikën për përputhje pikë për pikë me HTML-in 5.11.
- [ ] Pagat: plotëso Kartelën Personale me seksionin e plotë ④ të HTML-it 5.11 — sigurime, bazë tatimore, tatim, avans, mënyra e pagesës, totalet dhe shkallët tatimore.
- [ ] Pagat: përputh Analitikën 3×31 me HTML-in 5.11, përfshirë përmbledhjen e plotë të legjendës dhe totalet pa mospërputhje.
- [ ] Pagat: verifiko në browser Analitikën 3×31 me një punonjës dhe periudhë reale, pa ndryshuar të dhëna.
- [ ] Pagat: heto pse pamja live ngarkohet pa periudha, punonjës dhe të dhëna Payroll përpara se të vazhdohet me Analitikën.
- [ ] Pagat: përputh eksportet Excel/PDF/Print të Kartelës Personale me strukturën dokumentare të HTML-it 5.11, jo vetëm me tabelën ditore.
- [ ] Pagat: lidhe butonin PDF të Kartelës Personale me eksport real PDF dhe verifiko Excel/PDF/Print kundrejt HTML-it 5.11.
- [ ] Pagat: verifiko realisht në browser që Print Preview i Kartelës Personale hap popup/tab pa error pas patch-it, pastaj dokumento formatin A4 horizontal.
- [x] Pagat: dokumento në personal-card-export-verification.md krahasimin paralel HTML 5.11 vs cloud për Excel, PDF dhe Print të Kartelës Personale.
- [ ] Pagat: shfaq dokumentet reale të punonjësit dhe vërejtjet e periudhës në Kartelën Personale, në vend të placeholder-ëve.
- [ ] Pagat: lidhe seksionin ⑤ të Kartelës Personale me burimin real të vërejtjeve të periudhës për punonjësin, jo vetëm me rastin e derivuar K.
- [ ] Pagat: verifiko në browser Kartelën Personale me dokumente të ngarkuara dhe me vërejtje reale të periudhës, pa krijuar ose ndryshuar të dhëna për test.
- [ ] Pagat: implemento breakdown-in real të shkallëve tatimore në seksionin ④ të Kartelës Personale, jo tekst placeholder.
- [ ] Pagat: verifiko me të dhënat reale të Gushtit që Analitika 3×31 nuk ka mospërputhje në totale dhe shto test për këtë.
- [ ] Pagat: kryej krahasim paralel final HTML 5.11 vs cloud për Kartelën Personale dhe eksporto prova për strukturën identike.
- [ ] Pagat: rindërto dokumentet operative — Listëprezenca, Bordero, Bankë, Cash, Fletëpagesat, Të Huajt dhe Listëprezencë Manuale — sipas HTML-it 5.11.
- [ ] Pagat: rindërto raportet dhe konfigurimet — Libri i Kontributeve, Punonjësit, Parametra, Leje/Mungesa, Kontroll Gabimesh, Historiku dhe Backup/Rivendosje — sipas HTML-it 5.11.
- [ ] Pagat: kryej krahasim paralel në browser për çdo pamje, me testet, eksportet A4 landscape dhe funksionalitetet përkatëse.
- [x] Pagat: lidhe Orar i përkohshëm dhe Mbishkruaj kodet/orët manuale te Krijo Pagat me ruajtjen reale të Listëprezencës.
- [x] Pagat: vendos renditjen e referencës në Cash — Pagesa Cash përpara kolonës Nënshkrim — në ekran dhe eksporte.
- [x] Pagat: përditëso eksportet Cash (Excel/PDF/Print Preview) që të përdorin renditjen NR, Emër Mbiemër, Nr. Listëpage, Pagesa Cash, Nënshkrim dhe verifikoji kundrejt HTML-it 5.11.
- [x] Pagat: shto te Listëprezenca Manuale veprimet Pastro muajin, Import Excel, Shkarko shabllonin dhe Krijo nga kjo listë me rrjedhën e plotë të dokumenteve.
- [x] Pagat: përdor orë të rrumbullakosura pa minuta në Fletëpagesa dhe në eksportet e saj Excel/PDF/Print Preview.
- [x] Pagat: shto Rikthe parazgjedhjet te Parametra për të kthyer rregullat A/B/C, drekën, pragjet fiskale dhe pagesën sipas HTML-it 5.11.
- [x] Pagat: shfaq bllokuesin e Leje/Mungesa kur periudha nuk ka Listëprezencë, sipas HTML-it 5.11.
- [x] Search bar në dashboard për të gjetur fatura dhe partnerë
- [x] Global search functionality (tRPC procedure)
- [x] Search results display component
- [x] Module navigation (Partnerët, Artikujt, Blerje, Shitje, Formulare Peshe, Raporte, Arkë, Cilësimet)

## Export Features (NEW)
- [x] Export Partnerëve në PDF
- [x] Export Partnerëve në Excel
- [x] Export Faturaeve të Blerjes në PDF
- [x] Export Faturaeve të Blerjes në Excel
- [x] Export Faturaeve të Shitjes në PDF
- [x] Export Faturaeve të Shitjes në Excel

## ERP i zgjeruar — roadmap Odoo-like
- [x] Shto module të hapshme në navigim për Artikuj, Magazina, Klientë, Furnitorë, Shoferë, Mjete dhe Ngarkesa
- [x] Ndaj Partnerët në workspaces të veçanta për Klientë dhe Furnitorë me listë, Live Search dhe “+ Shto”
- [x] Krijo workspaces për Shoferë, Mjete dhe Ngarkesa me model të dhënash, listë dhe formular krijimi
- [x] Rifresko application launcher-in që të shfaqë të gjitha modulet operacionale të biznesit
- [x] Verifiko çdo modul nga navigimi kryesor dhe mobile menu
- [x] Verifiko hapjen e drejtpërdrejtë të workspaces: Artikuj, Magazina, Furnitorë, Klientë, Shoferë, Mjete, Ngarkesa dhe Formularë peshe
- [x] Ridizajno Qendrën e Raporteve me navigim kompakt sipas moduleve dhe grupeve funksionale
- [x] Kompakto listat, filtrat dhe veprimet e raportit për të mos zënë hapësirë të tepërt
- [x] Ruaj Live Search, hapjen me klik, PDF, Excel dhe Print Preview në pamjen e re
- [x] Raportet hapen me klik në formë full-screen me Excel, PDF dhe Print Preview
- [x] Verifiko Qendrën e Raporteve profesionale në desktop dhe mobile
- [x] Hape formën e plotë të furnitorit ose klientit pas “+ Shto”, në vend të ruajtjes së menjëhershme vetëm me emër
- [x] Ruaj nga forma të dhënat e partnerit: kod, NIPT, telefon, email, adresë dhe qytet
- [x] Hape formën e plotë të artikullit pas “+ Shto”, me njësi, kod dhe çmim
- [x] Përzgjidh automatikisht entitetin vetëm pas ruajtjes së suksesshme të formularit
- [x] Verifiko krijimin nga dokumenti pa humbur rreshtat ose të dhënat e faturës aktive
- [ ] Standardizo çdo kërkim të entiteteve me butonin “+ Shto” kur nuk gjendet rezultat
- [x] Krijo dhe përzgjidh automatikisht entitetin e ri pa dalë nga formulari ose dokumenti aktiv
- [ ] Mbulim me “+ Shto” për partnerë, artikuj, magazina, lokacione, llogari, ditarë, banka dhe entitete CRM
- [ ] Testo rregullin “+ Shto” në çdo modul dhe workflow kryesor
- [x] Shto “+ Shto furnitorin” dhe “+ Shto klientin” në Live Search të faturave, me ruajtje dhe përzgjedhje automatike
- [x] Shto Live Search dhe “+ Shto” për furnitorin dhe artikullin në Formularët e Peshave
- [x] Sinkronizo linkun publik me versionin aktual Odoo-style dhe verifiko që sidebar-i i vjetër nuk shfaqet më
- [x] Verifiko domain-in publik pas login-it dhe konfirmo me screenshot që shell-i Odoo-style shfaqet në modulet e brendshme
- [x] Krahaso workspace-in publik me preview-n lokal për të konfirmuar se sidebar-i i vjetër nuk shfaqet më
- [x] Dokumento krahasimin e verifikueshëm publik-vs-preview për të njëjtën faqe të workspace-it
- [x] Shiko video referencë të Odoo 19 për Blerje, Shitje, Magazina, Kontabilitet, CRM dhe Banka
- [x] Dokumento elementet e UI-së dhe workflow-t që duhen përshtatur nga Odoo 19
- [x] Përcakto prioritetet e ridizajnimit të moduleve sipas krahasimit me video Odoo 19
- [x] Prioritet 1: unifiko çdo hyrje të faturave në Odoo form view me action buttons, statusbar dhe tab-e
- [ ] Prioritet 2: shto Search, Filters, Group By dhe view switcher të njëjtë në listat e moduleve
- [ ] Prioritet 3: shto smart buttons dhe lidhje dokumentesh për Purchase → Receipt → Vendor Bill dhe Sales → Delivery → Invoice
- [ ] Prioritet 4: zhvillo CRM kanban me aktivitetet në panel anësor dhe Banka me panel matching për pajtim
- [x] Zhvillo CRM kanban me kërkim të menjëhershëm, aktivitete të planifikuara dhe ndryshim faze pa dropdown
- [ ] Prioritet 5: shto dashboard-e operacionale me karta ditarësh, alarme stoku dhe veprime të shpejta
- [x] Rindërto faturën e shitjes si Odoo 19 form view me header dokumenti, statusbar, partner, rreshta dhe totalet
- [x] Rindërto faturën e blerjes si Odoo 19 form view me header dokumenti, statusbar, furnitor, rreshta dhe totalet
- [x] Ruaj Live Search dhe “+ Shto artikull” brenda tabelës së rreshtave të të dy faturave
- [ ] Verifiko në desktop dhe mobile krijimin e faturave Odoo-style pa ndryshuar workflow-t ekzistues
- [x] Lidh hyrjen standarde “Faturë e re” e Shitjes me të njëjtën formë full-screen Odoo 19
- [x] Shto Live Search të artikujve në rreshtat e faturës së blerjes dhe shitjes
- [x] Shto butonin “+ Shto artikull” kur kërkimi nuk jep rezultat dhe krijoje artikullin pa dalë nga fatura
- [x] Shto automatikisht artikullin e ri të ruajtur në rreshtin aktiv të faturës
- [ ] Testo krijimin e shpejtë të artikullit dhe ruajtjen e faturës në Blerje dhe Shitje
- [x] Bëj kthimin e ID-së së artikullit të krijuar të verifikueshëm për lidhje të sigurt me rreshtin e faturës
- [ ] Verifiko rrjedhën fund-më-fund të “+ Shto artikull” dhe ruajtjen e faturës në Blerje
- [ ] Verifiko rrjedhën fund-më-fund të “+ Shto artikull” dhe ruajtjen e Easy Invoice në Shitje
- [ ] Hiq dropdown-et nga navbar-i, filtrat dhe formularët e moduleve ERP
- [ ] Zëvendëso zgjedhjet me Live Search, lista të klikueshme dhe panele të drejtpërdrejta
- [ ] Verifiko që krijimi i dokumenteve dhe navigimi funksionojnë pa dropdown
- [ ] Shto Live Search të menjëhershëm në Blerje, Shitje, Magazina, Kontabilitet, CRM, Banka, Partnerë dhe Artikuj
- [ ] Standardizo filtrimin e listave sipas dokumentit, partnerit, artikullit, statusit dhe vlerave përkatëse
- [ ] Verifiko Live Search në desktop dhe mobile për çdo modul
- [ ] Korrigjo gabimin e preview-t “useCompany duhet të përdoret brenda CompanyProvider” dhe verifiko hapjen e aplikacionit
- [x] Krijo Easy Invoice full-screen për faturën e shitjes me header, rreshta artikujsh dhe përmbledhje totale
- [x] Zëvendëso dropdown-in e klientit dhe artikullit në faturimin e shitjes me Live Search dhe zgjedhje me klik
- [x] Ruaj krijimin e faturës së shitjes përmes workflow-it ekzistues tRPC pa ndryshuar logjikën e dokumentit
- [x] Verifiko formularin Easy Invoice në desktop dhe mobile, përfshirë krijimin e një fature të re
- [x] Rindërto shell-in global sipas Odoo 19: application switcher, navbar e sipërme, company menu dhe user menu
- [ ] Standardizo control panel-et me breadcrumbs, search view, filtra, group-by dhe veprime kontekstore si në Odoo 19
- [ ] Zëvendëso kartat dekorative me list, form dhe kanban views të ngjashme me Odoo 19 për dokumentet ERP
- [ ] Rifresko workspaces për Blerje, Shitje, Magazina, Kontabilitet, CRM, Banka dhe Raporte sipas këtij standardi
- [ ] Verifiko pamjen Odoo 19 në desktop dhe mobile pa prekur workflow-t e biznesit
- [x] Implemento një company dropdown funksional në navbar dhe ruaj kompaninë aktive në workspace
- [x] Lidh kompaninë aktive nga navbar me query-t dhe workspaces e të gjitha moduleve ERP
- [x] Refaktorizo filtrimin e pagesave të Shitjes në React/JSX pa manipulim DOM
- [x] Bëj zgjedhjen e kompanisë aktive të qasshme edhe në mobile
- [x] Shto kërkim dhe filtër statusi të kombinuar me pagesën në regjistrin e Shitjeve
- [ ] Verifiko që ndryshimi i kompanisë rifreskon dokumentet dhe raportet e workspace-it
- [ ] Apliko OdooControlPanel në çdo workspace, jo vetëm në menunë e raporteve
- [ ] Verifiko desktop/mobile dhe workflow-t kryesore për çdo modul pas ridizajnimit
- [x] Zgjero katalogun në minimum 20 raporte funksionale për secilin modul: Blerje, Shitje, Magazina, Kontabilitet, CRM dhe Banka
- [x] Shto menu raportesh brenda secilit modul që hap raportin e zgjedhur me klik
- [x] Përmirëso Live Search për kërkim të menjëhershëm sipas titullit, përshkrimit, modulit dhe grupit funksional
- [x] Zgjero testet për të garantuar të paktën 20 raporte për secilin modul dhe çelësa unikë
- [ ] Implemento logjikë dhe dalje të dedikuar për variantet e raporteve të reja, jo vetëm pamje të njëjta të të dhënave bazë
- [x] Shto hyrje të drejtpërdrejta te raportet në Magazina, Kontabilitet, CRM dhe Banka
- [x] Shto teste të variantit të të dhënave që verifikojnë strukturën e vlefshme për çelësat e rinj të raporteve
- [x] Kategorizim Odoo-style i katalogut të raporteve sipas moduleve dhe grupeve funksionale
- [x] Plotëso grupet funksionale për të gjitha raportet dhe shfaq raportet të grupuara brenda çdo moduli
- [x] Verifiko në test që çdo raport i katalogut ka modul dhe grup funksional
- [ ] Ridizajnim Odoo 19 i Blerjeve: workspace, listat, tab-et dhe format e dokumenteve
- [ ] Ridizajnim Odoo 19 i Shitjeve: workspace, listat, tab-et dhe format e dokumenteve
- [ ] Ridizajnim Odoo 19 i Magazinës: workspace, listat, tab-et dhe format e dokumenteve
- [ ] Ridizajnim Odoo 19 i Kontabilitetit: workspace, listat, tab-et dhe format e dokumenteve
- [ ] Ridizajnim Odoo 19 i CRM-së dhe Bankave: workspace, listat, tab-et dhe format e dokumenteve
- [ ] Standardizim Odoo 19 i moduleve dhe formave të dokumenteve në Blerje, Shitje, Magazina, Kontabilitet, CRM dhe Banka
- [x] Print Preview funksional për raportet qendrore me ruajtje të filtrave dhe tabelës së zgjedhur
- [x] Ridizajnim Odoo 19 i Qendrës së Raporteve: search view, toolbar, filtra, cards dhe tabelë analitike
- [x] Ridizajnim Odoo 19 i formës së krijimit të faturës së blerjes: header dokumenti, rreshta artikujsh dhe totalet
- [x] Workflow Blerje: Porosi → Pranim → Kthim, me përditësim të stokut
- [x] Raport i filtrueshëm për Blerjet (furnitor dhe interval datash)
- [x] Agregime backend për Blerjet (totale sipas furnitorit, statusit dhe periudhës)
- [x] Teste të agregimeve të Blerjeve sipas statusit
- [x] Workflow Shitje: Oferta → Porosi → Dërgesë → Faturë → Kthim
- [x] Raport i filtrueshëm për Shitjet (klient dhe interval datash)
- [x] Krijim porosie nga oferta e pranuar me artikuj të paraplotësuar
- [x] Krijim fature nga fletë-dalja e validuar
- [x] Krijim fature direkt nga Sales Order (API + UI)
- [ ] Teste reale të workflow-t të Shitjeve (quotation→order, delivery→invoice, return validation)
- [x] Moduli Magazina: lokacione, lëvizje, transferta dhe inventarizim me raport dhe eksport
- [x] Balanca stoku sipas magazine dhe lokacioni për transferta dhe inventarizime të sakta
- [x] Moduli Kontabilitet: plan llogarish, ditarë, TVSH, pagesa dhe raporte financiare
- [x] Konfigurim fillestar i planit kontabël dhe ditarëve standardë për kompani të reja
- [x] Postim automatik i pagesave në ditar me hyrje të dyfishtë
- [x] Moduli CRM: leads, opportunities, aktivitete dhe pipeline
- [x] Moduli Banka: llogari bankare, ekstrakte, transferta dhe pajtim
- [x] CRM: pipeline me konvertim lead → opportunity dhe aktivitete të planifikuara
- [x] Banka: ekstrakte, transaksione dhe pajtim me pagesat e postuara
- [x] Transferta bankare reale midis llogarive me përditësim balancash dhe gjurmueshmëri
- [ ] Teste reale për Banka: krijimi i ekstraktit, transaksionet, pajtimi me pagesë të postuar dhe postimi i transferit me balanca
- [x] Qendra e raporteve për Shitje, Magazina, Kontabilitet, CRM dhe Banka
- [x] Katalog Odoo-style i raporteve me kërkim, kategori, filtra dhe eksport PDF/Excel
- [x] Raporte Blerje: furnitorë, porosi, pranime, kthime dhe faturim
- [x] Raporte Shitje: klientë, oferta, porosi, dërgesa, faturim dhe kthime
- [x] Raporte Magazina: gjendje, lëvizje, vlerë, stok i ulët, transferta dhe inventarizim
- [x] Raporte Kontabilitet: bilanc prove, fitim-humbje, pagesa, TVSH dhe ditarë
- [x] Raporte CRM: pipeline, konvertime, aktivitete dhe mundësi të fituara
- [x] Raporte Banka: balanca, ekstrakte, hyrje/dalje, transaksione të hapura dhe pajtim
- [ ] Zëvendëso dropdown-et e lidhjes së porosive, magazinës, dërgesave dhe filtrit të klientit në Shitje me Live Search
- [x] Ridizajno regjistrin e faturave të blerjes si tabelë operative e ngjeshur sipas strukturës së Excel-it të përdoruesit
- [x] Shto kolona për datë, numër, fermer/furnitor, artikull, sasi, çmim, TVSH, vlerë, transportues, targë dhe inventar në regjistrin e blerjeve
- [x] Verifiko regjistrin e ridizajnuar të blerjeve në desktop dhe mobile
- [ ] Shto të dhëna reale të TVSH-së, transportuesit, targës dhe referencës së inventarit në faturën e blerjes dhe regjistër
- [x] Verifiko një regjistër të populluar me faturë reale dhe artikuj në desktop e mobile
- [x] Përputh eksportin Excel të faturave të blerjes me kolonat dhe formatin e regjistrit Excel-style
- [x] Përputh eksportin PDF të faturave të blerjes me kolonat dhe formatin e regjistrit Excel-style
- [ ] Verifiko skedarët Excel dhe PDF të eksportuar kundrejt regjistrit të blerjeve
- [x] Korrigjo që faturat e krijuara të rifreskohen dhe të shfaqen menjëherë në regjistrin e blerjeve
- [x] Bëj numrin e faturës në regjistrin e blerjeve link që hap formën e dokumentit përkatës
- [ ] Ruaj për çdo regjistër të ridizajnuar të njëjtat kolona, renditje, ngjyra dhe theksime në pamjen cloud, Excel dhe PDF
- [x] Shto Excel, PDF dhe Print Preview në formën e plotë të faturës së blerjes nga regjistri
- [ ] Verifiko që eksportet dhe preview-ja e faturës ruajnë të njëjtat rreshta, totalë dhe format dokumenti
- [ ] Bëj dokumentet e Pasqyrës dhe regjistrave link të klikueshëm që hapin formën e plotë përkatëse
- [ ] Shto Excel, PDF dhe Print Preview në çdo formë të plotë dokumenti në Pasqyrë dhe module
- [ ] Ruaj të njëjtën strukturë, rreshta, totalë, ngjyra dhe renditje në pamje, Excel, PDF dhe Print Preview për çdo dokument
- [x] Bëj faturat e fundit të shitjes në Pasqyrë link të klikueshëm me formë të plotë dhe Excel, PDF e Print Preview
- [x] Bëj formën e faturës së hapur nga regjistri full-screen, me toolbar dhe tabelë artikujsh të lexueshme
- [x] Shto veprimin “Paguaj faturën” në faturat e blerjes dhe shitjes me status PAID dhe regjistrim pagese
- [x] Shfaq faturat e paguara automatikisht në filtrin/regjistrin e faturave PAID
- [x] Qartëso në UI diferencën midis faturës draft, të postuar dhe të paguar
- [x] Korrigjo gabimin e pagesës kur mungon plani bazë kontabël për kompaninë aktive
- [x] Shto zgjedhje të qartë Cash, Bankë ose Pagesë e mëvonshme në faturat e blerjes dhe shitjes
- [x] Inicializo automatikisht llogaritë dhe ditarët bazë për postimin e pagesës kur mungojnë
- [x] Shto filtra të qartë Të papaguara, Të paguara dhe Të gjitha në regjistrat e faturave
- [x] Shto kolonën Statusi i pagesës me E paguar, E papaguar dhe Pagesë e mëvonshme në regjistrin e blerjeve
- [x] Filtroni regjistrin e blerjeve sipas secilit status të pagesës
- [x] Shto filtra të kombinuar për periudhë, furnitor, artikull, status pagese, transportues dhe targë në regjistrin e blerjeve
- [x] Përditëso automatikisht rreshtat dhe totalet e regjistrit sipas kombinimit të filtrave
- [ ] Hiq shpjegimet dekorative nga modulet dhe lër vetëm veprimet e dokumenteve, filtrat dhe listat
- [ ] Standardizo çdo dokument të moduleve si link → formë full-screen → Excel, PDF dhe Print Preview
- [ ] Bëj dokumentet e Raporteve, Shitjeve, Magazinës, Kontabilitetit dhe Bankës të klikueshme me hapje të plotë
- [x] Hap raportet, faturat e shitjes, transfertat e magazinës, regjistrimet/pagesat kontabël dhe transaksionet bankare full-screen me Excel, PDF dhe Print Preview
- [x] Hiq tekstet dekorative nga launcher-i i Pasqyrës dhe header-at e CRM-së
- [ ] Bëj numrat e dokumenteve në tabelat e raporteve linke klikueshme me hapje full-screen të dokumentit
- [ ] Bëj çdo numër dokumenti në çdo modul dhe raport link të dukshëm për formën full-screen me Excel, PDF dhe Print Preview
- [x] Korrigjo eksportin PDF të Raporteve që dështoi me autoTable is not a function
- [x] Lidh numrat e faturave të blerjes dhe shitjes në Raporte me format e tyre full-screen
- [x] Hap dokumentet operative të Blerjeve, Shitjeve dhe Magazinës nga Raportet me formë full-screen dhe eksporte
- [x] Bëj ekstraktet dhe transfertat bankare linke klikueshme me Excel, PDF dhe Print Preview
- [x] Hap pagesat, regjistrimet, lead-et, ekstraktet, transfertat dhe transaksionet nga Raportet me dokument full-screen dhe eksporte
- [x] Lidh raportin “Regjistri i blerjeve” me të njëjtin regjistër, filtra të kombinuar dhe status pagese si Blerje
- [x] Përputh Excel dhe PDF të regjistrit me të gjitha kolonat, renditjen dhe statuset e pamjes në ekran
- [x] Plotëso furnitorin në regjistrin e blerjeve nga partneri i lidhur kur emri mungon
- [x] Bëj veprimin Paguaj më vonë të ruajë statusin Më vonë pa prishur pagesat Arkë dhe Bankë
- [x] Standardizo regjistrin e Porosive të blerjes me kërkim dhe filtra të drejtpërdrejtë
- [x] Bëj numrat e Porosive të blerjes lidhje me formë full-screen, Excel, PDF dhe Print Preview
- [x] Lidh Porositë e blerjes me Pranimin e mallit dhe statuset Draft/Konfirmuar/Mbyllur
- [x] Zgjero Porositë me Bimët, Lloji, Kodi, thasë, peshë bruto/neto, sasi të porositur/ngarkuar dhe komente
- [x] Shto përgjegjësit e përgatitjes, ngarkesës, dokumentacionit dhe vërejtjen në dokumentin e porosisë
- [x] Ruaj modelin e porosisë identik në ekran, Excel, PDF dhe Print Preview
- [x] Zgjero Porositë me Bimët, Lloji, Kodi, thasë, peshë bruto/neto, sasi të porositur/ngarkuar dhe komente
- [x] Shto përgjegjësit e përgatitjes, ngarkesës, dokumentacionit dhe vërejtjen në dokumentin e porosisë
- [x] Ruaj modelin e porosisë identik në ekran, Excel, PDF dhe Print Preview
- [x] Bëj numrin e Porosisë lidhje me formë full-screen, Excel, PDF dhe Print Preview
- [x] Shto ngarkim të PDF, Excel, ZIP dhe foto në dokumentin e Porosisë
- [x] Shto statuset Në proces, Ngarkuar, Dërguar dhe Përfunduar në dokumentin e Porosisë
- [x] Shfaq statusin operativ dhe numrin e bashkëngjitjeve në regjistrin e Porosive
- [x] Sinkronizo kolonën operationalStatus të Porosive me databazën aktive për të rikthyer modulin Blerje
- [x] Vendos statusbar-in Në proces/Ngarkuar/Dërguar/Përfunduar mbi tabelën e artikujve në formën e Porosisë
- [ ] Shto Modifiko, Anulo dhe Fshij me kufizime statusi në dokumentet e Blerjeve dhe Shitjeve
- [ ] Zgjero Modifiko, Anulo dhe Fshij me kufizime statusi në Magazina, Kontabilitet, CRM dhe Banka
- [ ] Regjistro në audit çdo modifikim, anulim ose fshirje dokumenti
- [ ] Krijo modulin Veprimet me histori kërkueshme të krijimeve, pagesave, anulimeve dhe fshirjeve
- [x] Lejo fshirjen e plotë të dokumenteve Draft me konfirmim dhe hyrje të ruajtur në Veprimet
- [x] Krijo modulin Veprimet me histori kërkueshme të anulimeve dhe fshirjeve të faturave
- [x] Lejo fshirjen e faturave Draft të blerjes me konfirmim dhe hyrje të ruajtur në Veprimet
- [x] Rikthe PurchaseInvoiceDetailDialog pas gabimit të referencës që bllokoi modulin Blerje
- [x] Bëj Anulo dhe Fshij të dallueshme në header-in e faturës full-screen
- [x] Shto butonin Veprime dhe modalin për çdo faturë në regjistrin e blerjeve
- [x] Standardizo kolonën Veprime në Porosi, Shitje, Magazina, Kontabilitet, CRM, Banka dhe Transport
- [ ] Plotëso dhe verifiko Modifiko me kufizime statusi për dokumentet e mbuluara në çdo modul.
- [ ] Verifiko që krijimet dhe pagesat e dokumenteve shfaqen në modulin Veprimet, jo vetëm anulimet dhe fshirjet.
- [x] Shto anulimin dhe fshirjen e sigurt të Porosive Draft me auditim dhe mbrojtje nga pranimet e lidhura
- [x] Shto modalin standard Veprime në regjistrin përmbledhës të Porosive
- [x] Korrigjo sinkronizimin e statusit operativ të së njëjtës porosi në dokument dhe regjistër
- [x] Blloko numra të përsëritur të porosive brenda së njëjtës kompani
- [x] Shto hyrje të dukshme për modulin Veprimet në navigimin kryesor
- [x] Shfaq Veprime me Modifiko, Anulo dhe Fshij për çdo Porosi Draft
- [x] Shto procedurën e audituar për ruajtjen e modifikimeve të Porosive Draft
- [x] Shto Excel, PDF dhe Print Preview në modulin Veprimet duke ruajtur filtrat aktivë
- [x] Shto anulimin dhe fshirjen e sigurt me auditim për ofertat, porositë, dërgesat, kthimet dhe faturat e Shitjeve
- [x] Integro modalin standard Veprime në të pesë regjistrat e modulit Shitje
- [x] Verifiko modalin Veprime dhe kufizimet e statusit në dokumentet e Shitjeve
- [x] Shto anulimin dhe fshirjen e sigurt me auditim për transfertat dhe inventarizimet e Magazinës
- [x] Integro modalin standard Veprime në regjistrat e transfertave dhe inventarizimeve
- [x] Verifiko Veprimet dhe dokumentet full-screen të Magazinës
- [x] Shto anulimin dhe fshirjen e sigurt me auditim për regjistrimet dhe pagesat Draft
- [x] Integro modalin standard Veprime në regjistrat e Kontabilitetit
- [x] Verifiko Veprimet dhe dokumentet full-screen të Kontabilitetit
- [x] Shto anulimin dhe fshirjen e sigurt me auditim për ekstraktet dhe transfertat bankare Draft
- [x] Integro modalin standard Veprime në regjistrat e Bankës
- [x] Verifiko Veprimet dhe dokumentet full-screen të Bankës
- [x] Shto anulimin dhe fshirjen e sigurt me auditim për lead-et dhe aktivitetet Draft të CRM-së
- [x] Integro modalin standard Veprime në regjistrat e CRM-së
- [x] Verifiko Veprimet dhe hapjen e të dhënave të CRM-së
- [x] Zëvendëso filtrin dropdown të klientit në raportet e Shitjeve me Live Search
- [x] Shto anulimin dhe fshirjen e sigurt me auditim për ngarkesat Draft
- [x] Integro Veprime dhe pamje full-screen për dokumentet e ngarkesave
- [x] Analizo HTML-in dhe kodin burimor të Sistemi Pagave 4.7
- [x] Projekto modelin e të dhënave për punonjës, kontrata, periudha dhe fletëpagesa
- [x] Integro modulin Pagat në navigimin, backend-in dhe ndërfaqen e Sistemi Genit Cloud
- [x] Verifiko llogaritjet, eksportet dhe pamjen e modulit Pagat kundrejt referencës
- [x] Shto menunë e brendshme të Pagave me Dashboard, Logs dhe Krijo Pagat
- [x] Shto nënmenutë Dokumentet e Pagave, Raportet dhe Konfigurimi sipas HTML-it referencë
- [x] Verifiko navigimin e çdo nënmenuje të Pagave në desktop dhe mobile
- [x] Krahaso ekran për ekran modulin Pagat me Sistemi_Pagave_4.7.html dhe dokumento dallimet funksionale e vizuale
- [x] Përshtat layout-in, menu-në, nënmenutë, tabelat dhe format e Pagave sipas HTML-it referencë
- [x] Verifiko Pagat kundrejt HTML-it referencë në desktop dhe mobile
- [x] Pagat referencë: përputh shell-in me sidebar, v4.0, grupet e menusë dhe të 22 pamjet e HTML-it
- [x] Pagat referencë: përputh topbar-in me titull pamjeje, periudhë, Ekzekuto Testet, Print/PDF dhe Excel
- [x] Pagat referencë: përputh Dashboard-in me Periudha, Punonjës aktivë, Të palidhur, Gabime bllokuese, rrjedhë pune dhe rakordim
- [x] Pagat referencë: përputh Ngarkimi i Logs me zgjedhje Excel, preview, lidhje punonjësish dhe konfirmim importi
- [x] Pagat PDF: lidh Konfirmo Logs me Listëprezencë, Krijo Pagat, Bordero, Cash/Bankë dhe Raporte
- [x] Pagat referencë: përputh Krijo Pagat, Listëprezenca dhe Listëprezencë Manuale me rrjedhën e HTML-it
- [x] Abacus Pagat: zbato motorin e ditës me stampime, pushim dreke, orë normale dhe shtesa sipas rregullave të specifikimit
- [x] Abacus Pagat: shto testet e detyrueshme të rasteve të stampimeve dhe kufirit të shtesave
- [x] Pagat referencë: përputh Bordero, Bankë, Cash, Të Huajt dhe Fletëpagesat me dokumentet e HTML-it
- [x] Pagat referencë: përputh gjashtë Raportet e HTML-it, përfshirë Bordero Analitike, Tatime, Kontroll dhe Libër Kontributesh
- [x] Pagat referencë: përputh Punonjësit, Parametrat, Lejet, Gabimet, Historikun dhe Backup/Rivendosje
- [x] Çaktivizo lidhjen HMR të dështuar dhe cache-n e klientit Vite në preview-in publik
- [x] Shërbe preview-in nga build-i pa klient Vite për të eliminuar gabimet WebSocket
- [x] Hiq injektimin e skriptit @vite/client nga HTML-i i preview-it publik
- [x] Stabilizo konfigurimin HMR të Vite që preview-i të mos lidhet më me localhost:5173
- [x] Çaktivizo lidhjen HMR të dështuar në preview-in publik kur proxy nuk pranon WebSocket
- [x] Elimino klientin Vite të ruajtur në cache nga preview-i publik i Pagave
- [x] Pagat referencë: përputh formatet e tabelave, titujve, kolonave, ngjyrave dhe renditjes së dokumenteve me HTML-in
- [x] Pagat referencë: përputh Excel, PDF dhe Print Preview të çdo dokumenti me strukturën e tabelës përkatëse në HTML
- [ ] Verifiko me eksport real që Listëprezenca, Bordero, Bankë, Cash dhe Fletëpagesat ruajnë kolonat, renditjen, totalet dhe ngjyrat e pamjes në Excel, PDF dhe Print Preview.
- [x] Verifiko Listëpagesën Cash për rreshtat me mënyrë pagese CASH dhe split të ruajtur: pas ngarkimit të query-së, pamja dhe eksportet e Korrikut shfaqin 57 rreshta dhe 1,669,800.00 Lek pa ndryshuar të dhënat burimore.
- [x] Vendos PDF dhe Print Preview të dokumenteve të Pagave në format A4 horizontal për të ruajtur të gjitha kolonat e ekranit.
- [x] Korrigjo shiritin e eksportit të Pagave që Listëprezenca, Banka dhe Cash të shkarkojnë dokumentin aktiv, jo Borderon.
- [x] Pagat referencë: përshtat sidebar-in dhe hapësirën e përmbajtjes në mobile pa ngjeshur dokumentet
- [x] Pagat test real: ekzekuto Excel Logs → Listëprezencë → Krijo Pagat → Bordero → Bankë/Cash dhe korrigjo bllokimin e gjetur
- [x] Korrigjo lidhjen WebSocket/Vite të preview-it që bllokon përdorimin e sistemit në browser
- [x] Pagat Logs referencë: shfaq pas Konfirmo Të dhënat e ngarkuara me ID pajisje, emër, sektor dhe stampime të lexuara
- [x] Pagat Logs referencë: ndërto Lidhjen e përhershme të punonjësve me zgjedhje të Nr. Listëpage/Punonjës dhe status I RI/LIDHUR
- [x] Pagat Logs referencë: ruaj lidhjet e pajisjes me punonjësin për periudhat e ardhshme në rrjedhën cloud
- [x] Pagat bllokim: rikthe procedurat payroll.mappings.list dhe payroll.mappings.save në router-in aktiv
- [x] Pagat Logs referencë: lexo realisht skedarin Excel dhe mbush preview-in me ID-të, emrat dhe stampimet e tij
- [x] Pagat Abacus: kalo stampimet reale të Logs në llogaritjen e Listëprezencës dhe dokumenteve të muajit
- [x] Pagat Abacus: plotëso regjistrin e punonjësve dhe parametrat me fushat detyruese të specifikimit
- [x] Lidh pushimin e drekës, turnet A/B dhe hirësinë e orëve shtesë të ruajtura te Parametrat me llogaritjen e importit Logs.
- [x] Hiq bllokimin e gjenerimit të Pagave për tarifat zero; importi Excel/HTML duhet të vazhdojë automatikisht sipas template-it.
- [x] Verifiko rrjedhën automatike Excel → Listëprezencë → Krijo Pagat → Bordero pa kërkuar tarifa manuale.
- [x] Pagat: mundëso ruajtjen e tarifës për orë, tarifës shtesë, bankës, IBAN-it dhe mënyrës së pagesës te Punonjësit
- [x] Pagat: rigjenero Borderon dhe Listëpagesat pasi ndryshohen tarifat e punonjësve
- [x] Pagat v4.8: shto konfirmimin e pushimit të drekës për ditët e paqarta me dy stampa
- [x] Pagat v4.8: shto kolonat O.Bruto, O.Pagesë, Normale dhe Shtesë në Listëprezencë
- [x] Pagat: rrumbullakos orët ditore pa presje dhe shfaq orën shtesë si indeks sipër orës normale në Listëprezencë dhe në eksportet përkatëse.
- [x] Pagat: përdor formatin bazë me indeks të orës shtesë, p.sh. 8⁴, në Listëprezencë, Kartelën Personale, raportet dhe eksportet e orëve pa ndryshuar minutat e ruajtura.
- [x] Pagat: verifiko që indeksi vizual 8⁴ nuk bashkon totalet; 8 të mbetet Normale dhe 4 të mbetet Shtesë në Listëprezencë, Kartelë dhe llogaritje.
- [x] Pagat: shfaq vetëm orë të plota pa minuta në Kartelën Personale, Listëprezencë dhe eksporte, duke ruajtur minutat vetëm për llogaritje.
- [x] Pagat: korrigjo emrin e Excel-it të Kartelës Personale që të mos marrë prapashtesë të dyfishtë `.xlsx.xlsx`.
- [x] Pagat v4.8: ndërto rakordimin me kontrollet e kryqëzuara të dokumenteve të muajit
- [x] Rikthe preview-in e zhvillimit pas ndërprerjes së shërbimit
- [x] Pagat bllokim: lejo përdorimin e periudhës ekzistuese pa gabim kur muaji është krijuar më parë
- [x] Pagat bllokim: verifiko gjenerimin e Borderos, Bankës dhe Cash pas periudhës së përzgjedhur
- [x] Pagat bllokim: krijo automatikisht punonjësit e rinj nga Logs, lidhi me ID-në e pajisjes dhe ruaj orët në Listëprezencë pas Konfirmo
- [x] Pagat bllokim: verifiko me Excel-in real që orët e lexuara kalojnë automatikisht në Listëprezencë
- [x] Pagat HTML: pas ngarkimit të Logs krijo dhe lidhi automatikisht punonjësit e rinj, pa kërkim ose klikim për çdo rresht
- [x] Pagat HTML: ruaj automatikisht orët e lexuara në Listëprezencë pas një konfirmimi të vetëm të importit
- [x] Pagat: ruaj orët e Logs me një import masiv, jo me qindra kërkesa një-për-një
- [x] Pagat test pajisje: verifiko që punonjësit e testit lidhen drejtpërdrejt nga ID-ja e pajisjes dhe se orët ruhen automatikisht
- [x] Pagat pajisje: përdor vetëm ID-në e pajisjes për lidhjen automatike, jo përputhjen e emrave të ngjashëm
- [x] Pagat test HTML: krahaso dhe testo ekran për ekran Logs, Listëprezencë, Krijo Pagat, Bordero, Bankë, Cash, Punonjësit dhe Raportet
- [x] Pagat HTML: përshtat Dashboard-in me total Bankë, total Cash dhe rakordimin sipas referencës
- [x] Pagat bllokim: mundëso krijimin e punonjësit nga Logs kur ID-ja e pajisjes nuk është e lidhur
- [x] Pagat preview: elimino referencën e mbetur të klientit Vite dhe gabimin WebSocket në /payroll
- [x] Pagat HTML: ndërto Fletëpagesat me kërkim dhe kolonat Orë, Vpaga, Bruto, Tatim, Neto, Avans dhe Për pagesë
- [x] Pagat HTML: ndërto Bordero Analitike me përmbledhje sipas pozicionit dhe eksport të përputhur
- [x] Pagat HTML: ndërto Të Huajt me ditë pune, paga/ditë, orë shtesë, Bankë, Cash dhe total
- [x] Pagat HTML: ndërto Tatime & Kontribute me kontribut punëmarrës, punëdhënës, tatim, bruto dhe neto
- [x] Pagat HTML: ndërto Kontroll Borderoje me 14 kontrolle të kryqëzuara dhe eksport të rakordimit
- [x] Pagat HTML: ndërto Librin e Kontributeve me kërkim dhe histori mujore të kontributeve, tatimit dhe pagesës
- [x] Pagat HTML: ndërto Listëprezencën Manuale me muaj, vit, punonjës aktivë dhe ruajtje të orëve
- [x] Pagat HTML: ndërto Kartelën Personale me kërkim të punonjësit, evidencë ditore dhe eksport
- [x] Pagat HTML: ndërto Leje / Mungesa me punonjës, lloj, nga, deri, shënime dhe lidhje me Listëprezencën
- [x] Pagat HTML: ndërto Kontroll Gabimesh me validime bllokuese, vërejtje dhe eksport të testit
- [x] Pagat HTML: ndërto Historikun Mujor me periudhat e ruajtura dhe ngarkim të drejtpërdrejtë të muajit
- [x] Pagat HTML: ndërto Backup / Rivendosje me JSON të të dhënave reale, verifikim importi dhe konfirmim rikthimi
- [ ] Pagat referencë: përdor Sistemi_Pagave_5.11 si referencë aktive për udhëzime vizuale të drejtpërdrejta dhe zbato ndryshimet e kërkuara pa devijuar nga referenca.
- [x] Pagat HTML 5.11: inventarizo dhe krahaso të 22 pamjet, rrjedhat, veprimet dhe eksportet me cloud-in përpara testimit nga përdoruesi.
- [x] Pagat HTML 5.11: verifiko me të dhënat reale rrjedhën Logs → konfirmim drekë → Listëprezencë → Bordero → Bankë/Cash dhe trajto çdo dallim.
- [x] Pagat HTML 5.11: përputh Krijo Pagat me zinxhirin e dokumenteve, konfirmimin e drekës, orarin e përkohshëm dhe hapjen e Listëprezencës.
- [x] Pagat HTML 5.11: ruaj stampimet nga Logs dhe kërko konfirmimin e drekës në Krijo Pagat, si në referencë, përpara gjenerimit.
- [x] Pagat HTML 5.11: përputh Listëprezencën me kërkim, titujt ditë/javë, theksimin e së dielës, kodet e mungesave dhe totalet O.Bruto/O.Pagesë.
- [ ] Pagat HTML 5.11: verifiko dokumentet, raportet dhe konfigurimin në ekran, Excel, PDF dhe Print Preview A4 landscape.
- [x] Pagat HTML 5.11: përputh Borderon me kolonat e orëve bruto/pagesë, kostot, shumat, Bankë/Cash, totalet dhe kërkimin e referencës.
- [x] Pagat HTML 5.11: përputh Bankën, Cash dhe Fletëpagesat me titujt e dokumenteve, kërkimin, totalet, dokumentet individuale dhe eksportet e referencës.
- [x] Pagat HTML 5.11: zgjero Parametrat me rregullat e së dielës, pragun e drekës, turnin C pa drekë, bankën/pagesën, kode legjende dhe pragjet e tatimit nga referenca.
- [ ] Pagat HTML 5.11: përputh Punonjësit, Lejet/Mungesat, Historikun, Backup-in dhe raportet me veprimet dhe kërkimet e referencës.
- [ ] Pagat HTML 5.11: ekzekuto testet, kontrollin vizual të pamjeve dhe publiko vetëm versionin gati për testim nga përdoruesi.
- [ ] Pagat test paralel: mbaj cloud-in dhe Sistemi_Pagave_5.11 të hapura dhe kontrollo çdo pamje sipas udhëzimeve të përdoruesit.
- [ ] Pagat test paralel: ngarko 001_2026_8_MON.XLS në HTML 5.11 dhe cloud, pastaj krahaso parafytyrimet para Konfirmo.
- [ ] Pagat test paralel: konfirmo importin në të dyja pamjet, me Medina 18/08 pa pushim, dhe krahaso Listëprezencën.
- [ ] Pagat test paralel: krahaso fundin e faqeve Logs në HTML 5.11 dhe cloud pas konfirmimit të importit.
- [x] Pagat HTML 5.11: ngarko Excel-in e Logs dhe shfaq rezultatin e importit për udhëzimin e përdoruesit.
- [x] Pagat: verifiko Medinën më 18/08/2026, 06:59–20:00, dhe kërko konfirmim të pushimit të drekës; zgjedhja Pa pushim · 0 min nuk duhet të bëjë zbritje.
- [x] Pagat Logs: ruaj konfirmimin e drekës vetëm nga përdoruesi dhe shto eksportet e Logs të lexuara në Excel, PDF dhe Print Preview A4 landscape.
- [x] Pagat referencë: ekspozo Sistemi_Pagave_5.11 në një link të shikueshëm për krahasim të drejtpërdrejtë.
- [x] Pagat Logs: kontrollo pamjen, stampimet, konfirmimin e drekës dhe eksportet kundrejt Sistemi_Pagave_5.11.
- [x] Pagat referencë: vendos HTML-in 5.11 te Krijo Pagat dhe ndalo për udhëzimin e përdoruesit.
- [ ] Pagat referencë: gjenero Listëprezencën në HTML 5.11 dhe krahasoje me cloud-in rresht për rresht.
- [ ] Pagat referencë: vendos HTML-in te Ngarko Logs dhe ndalo për udhëzimin e ardhshëm të përdoruesit.
- [x] Pagat referencë: shko në fund të parafytyrimit të importit Logs në HTML dhe ndalo për udhëzim.
- [x] Pagat Logs: pas ngarkimit të Excel-it, përputh parafytyrimin cloud me HTML-in për numrin e punonjësve, lidhjet I RI/LIDHUR, muajin/vitin dhe orët e papërpunuara.
- [x] Pagat Logs: verifiko krahasimin e ID-ve, ditëve dhe stampimeve midis Excel-it burimor, HTML-it referencë dhe parafytyrimit cloud.
- [x] Pagat HTML: konfirmo importin e Gushtit në HTML-in referencë dhe kontrollo rezultatin e rrjedhës lokale.
- [x] Pagat Logs: krahaso pas Konfirmo tabelën e të dhënave të ngarkuara dhe lidhjen e punonjësve në HTML me cloud-in.
- [x] Pagat Gusht 2026: konfirmo importin real në cloud dhe verifiko ruajtjen e Logs, lidhjet sipas ID-së dhe Listëprezencën.
- [x] Pagat Logs: pas Konfirmo qëndro te pamja Logs dhe shfaq gjendjen e ruajtur, si HTML-i referencë.
- [x] Pagat Logs: krahaso vizualisht pamjen cloud me HTML-in referencë për titullin, shiritin e periudhës, ngarkimin, tabelat, lidhjet e punonjësve dhe veprimet.

## Kopjimi Pikë për Pikë nga Sistemi_Pagave_5.11.html (OBLIGATIVE)
- [ ] 1. Shell & Dashboard: Kopjo Navbar me badge v5.11, paletën, fontet, sidebar me 19 hyrje, header me muaj/vit, dhe KPI cards të Dashboard-it (Punonjës aktivë, Të palidhur, Gabime bllokuese, Statusi i rrjedhës së punës me butonat Fillo).
- [ ] 2. Logs: Kopjo pamjen e ngarkimit të Logs, butonin e ngarkimit të Excel-it, fletën Logs, tabelën e orëve të papërpunuara (ID, Emër, Sektori, D1–D31, Gjithsej, Normal, Shtesë, TOTALI DITËS) dhe tabelën e lidhjeve të përhershme.
- [ ] 3. Krijo Pagat: Kopjo zinxhirin e dokumenteve, checkbox-in "Mbishkruaj kodet/orët manuale", butonat "KRIJO PAGAT", "Hap Listëprezencën", "Orar i përkohshëm" dhe bllokuesit e mungesës së Logs/punonjësve.
- [ ] 4. Listëprezenca: Kopjo gridin 31-ditor me kolonat e kodeve (L, M, NM, NV), theksimin e së dielës, orët e rrumbullakosura pa minuta dhe indeksin e orëve shtesë (8⁴).
- [ ] 5. Bordero: Kopjo kolonat e referencës (NR, Emër Mbiemër, Orë Bruto, Orë Pagesë, Orë Normale, Kosto OPN, Shuma 1, Orë Shtesë, Kosto OPSH, Shuma 2, Bonus, Total, Bankë, Cash) dhe totalet.
- [ ] 6. Bankë & Cash: Kopjo Listëpagesa Bankë (NR, Emër Mbiemër, Nr. Llogarisë, Banka, Shuma) dhe Listëpagesa Cash (NR, Emër Mbiemër, Nr. Listëpage, Pagesa Cash, Nënshkrim) me renditjen e saktë.
- [ ] 7. Fletëpagesat: Kopjo tabelën e fletëpagesave me 11 kolona dhe modalin e fletëpagesës individuale (① deri te ⑥).
- [ ] 8. Të Huajt: Kopjo tabelën dhe llogaritjen e pagës ditore për punonjësit e huaj.
- [ ] 9. Listëprezencë Manuale: Kopjo gridin manual, butonin "Pastro muajin", "Import Excel", "Shkarko shabllonin" dhe "Krijo nga kjo listë".
- [ ] 10. Raportet & Konfigurimi: Kopjo Listëprezencën (report), Kartelën Personale dhe Analitikën 3×31, Librin e Kontributeve, Punonjësit, Parametrat (me "Rikthe parazgjedhjet"), Leje/Mungesa (me bllokuesin e prezencës), Kontroll Gabimesh, Historikun dhe Backup/Rivendosje.

## Bug i raportuar — faqe e bardhë në preview/live
- [ ] Inspekto dhe riparo faqen e bardhë në preview/live të Pagave; verifiko ngarkimin e shell-it, API-ve dhe Kartelës Personale.

## Dokumenti Zyrtar Kartela Personale — Bindës për Punonjësin
- [x] Përshtat eksportet e Kartelës Personale (PDF dhe Excel) në format A4 landscape të plotë me header zyrtar, të dhënat e punonjësit, 31 ditët, llogaritjen e pagës dhe tatimit shkallor, që punonjësi të bindet plotësisht nga sistemi.
- [ ] Prioritet i përdoruesit: ndalo verifikimet e tepërta dhe zbato vetëm bllokimet ose përmirësimet e dukshme të raportuara drejtpërdrejt.

## Raport i ri — Vetëm një stampim
- [x] Krijo tabelën e të gjithë punonjësve me vetëm një stampim, me datën, emrin, nr. listëpage, orën e vetme dhe llojin e stampimit, në pamjen e Listëprezencës.
- [x] Shto eksportet Excel, PDF dhe Print Preview A4 landscape për raportin Vetëm një stampim.
- [x] Testo raportin me të dhënat reale të Gushtit 2026 dhe kontrollo që të mos përfshihen ditët me dy ose katër stampime.

## Lista zyrtare — Mungon dalja / vetëm hyrje
- [x] Shfaq gjithë stafin me Nr. Listëpage dhe Emër Mbiemër që ka vetëm hyrje pa dalje pas konfirmimit të Logs.
- [x] Përdor etiketimin e qartë "Mungon dalje — vetëm hyrje" dhe trego datën dhe orën e vetme të regjistruar.
- [x] Siguro formatin e printimit A4 landscape dhe eksporte Excel/PDF/Print Preview për listën zyrtare.

## Korrigjim pamjeje — Listëprezencë A4 për mungesë daljeje
- [x] Riformato raportin Vetëm një stampim si grid Listëprezence: gjithë stafi në rreshta, ditët e muajit në kolona dhe vetëm një stampim i shënuar në ditën përkatëse.
- [x] Ruaj të njëjtin grid në Excel, PDF dhe Print Preview A4 landscape, me titull dhe legjendë të qartë për mungesë daljeje.

- [x] Në gridin e raportit Vetëm një stampim, shfaq vetëm ditët me saktësisht një stampim; ditët me dy ose katër stampime lëri bosh si në Listëprezencë.
- [x] Në hyrjen e modulit Pagat shto butonin “Shkarko pa gisht” që hap raportin Listëprezencë mujore me vetëm ditët kur mungon dalja.
- [x] “Shkarko pa gisht” të mos shfaqë punonjës pa problem dhe të mos përfshijë në grid ditët me hyrje/dalje të saktë.
- [x] Për raportin Shkarko pa gisht mbaj vetëm një grup veprimesh Excel, PDF dhe Print Preview dhe përmirëso shkallëzimin e Excel-it A4 landscape që gridi të lexohet qartë.

## Test i rrjedhës Listëprezencë Manuale → Krijo Pagat
- [x] Verifiko muajin aktiv dhe plotëso Mariglen Myftarin me 8 orë për datat 1–8, 12 orë për datat 8–14 dhe 8 orë për datat 14–21.
- [x] Krijo Pagat nga Lista Manuale dhe kontrollo dokumentet e gjeneruara pa dublikata.

## Përmirësim i Listëprezencës Manuale — shtim direkt nga letrat
- [x] Shto në Listëprezencën Manuale veprimin “+ Shto punonjës në listë” me emër dhe nr. listëpage, pa kërkuar krijim paraprak te moduli Punonjësit.
- [x] Lejo ruajtjen dhe gjenerimin e Pagave për rreshtin manual të shtuar drejtpërdrejt, duke ruajtur orët normale dhe shtesë.
- [x] Trajto Listëprezencën Manuale si burim primar nga letrat: rreshti manual ruan emrin, nr. listëpage dhe orët pa kërkuar punonjës paraprak në regjistër.
- [x] Kur shtohet punonjës nga Lista Manuale, ruaje në Regjistrin e Punonjësve dhe lidhe rreshtin manual me ID-në e krijuar pa dublikatë.
- [x] Në hyrjen manuale, kur përdoruesi shkruan total mbi 8 orë si 12, llogarit automatikisht 8 orë normale + 4 orë shtesë dhe shfaq ndarjen në Pagat.

## Live Search — Regjistri i Punonjësve
- [x] Shto fushë Live Search në Regjistrin e Punonjësve për emër, mbiemër dhe Nr. listëpage pa dropdown.
- [x] Verifiko që kërkimi filtron menjëherë Mariglen Myftarin me Nr. 7 dhe ruaj funksionimin e listës së plotë kur kërkimi pastrohet.

## Audit i Listëprezencës Manuale — butona dhe eksporte
- [x] Verifiko që Shkarko shabllonin Excel krijon skedar real me strukturën e Listëprezencës Manuale.
- [x] Verifiko që Import Excel lexon qelizat e shabllonit dhe i ruan orët manuale.
- [x] Verifiko që Krijo nga kjo listë krijon ose përditëson Pagat dhe dokumentet pa placeholder.
- [x] Verifiko eksportet Excel, PDF dhe Print Preview të Listëprezencës Manuale.

## Turnet dhe Orari i Përkohshëm
- [x] Zgjero strukturën e `PayrollShiftOverride` që të mbështesë hyrje, dalje dhe pushim dreke të personalizuar për interval datash.
- [x] Përditëso komponentin e Parametrave/Orarit të Përkohshëm për të lejuar përcaktimin e orarit ditor kur turnet ndryshojnë (p.sh. 06:00–17:00).
- [x] Përditëso kalkulatorin e attendance për të aplikuar orarin e përkohshëm ditor me tolerancën 20-minutëshe dhe llogaritjen normale/shtesë.

## Test orari CUSTOM — Mariglen Myftari
- [x] Ruaj për Mariglen Myftarin (Nr. 7) orarin CUSTOM 06:00–17:00 me 60 minuta drekë për datat 10–12 në periudhën aktive.
- [x] Rikalkulo dhe verifiko 8 orë normale + 2 orë shtesë për secilën nga datat 10, 11 dhe 12, pa prekur ditët e tjera.
- [x] Shto test të kalkulatorit me stampime 06:00 dhe 17:00, turn CUSTOM dhe drekë 60 min, që të garantojë 8 orë normale + 2 shtesë; dokumento veçmas që të dhënat manuale nuk zëvendësohen nga orari CUSTOM.

## Standardizimi i orëve — numra të plotë
- [x] Rishiko të gjitha shfaqjet e orëve, minutave të pushimit dhe përmbledhjeve në Pagat për të hequr vlerat dhjetore.
- [x] Shfaq dhe eksporto orët si numra të plotë të rrumbullakosur dhe pushimin e drekës si minuta të plota, pa ndryshuar minutat burimore në databazë.
- [x] Shto teste për rastet 103.6 orë/minuta dhe 60 minuta pushim, pastaj verifiko Bordero, Listëprezencë, Kartelë dhe eksportet.
- [x] Verifiko vizualisht UI-në dhe formatet Excel/PDF/Print Preview pas standardizimit.

## Standardizimi estetik i veprimeve dhe toolbar-eve
- [ ] Audito dhe klasifiko butonat e veprimeve në Pagat, Blerje, Shitje, Magazina, Raporte dhe dokumentet analitike.
- [ ] Krijo toolbar të përbashkët për Excel, PDF dhe Print Preview me hierarki të qartë vizuale dhe gjendje disabled/loading.
- [ ] Organizoni butonin Shkarko pa gisht vetëm në dashboard/Krijo Pagat dhe raportin përkatës, pa dublikatë në toolbar-et e dokumenteve.
- [ ] Apliko standardin e ri të toolbar-it në modulet e dokumenteve dhe ruaj funksionet ekzistuese të eksportit.
- [ ] Verifiko responsive layout, pamjen e butonave dhe rrjedhat reale të eksportit në browser.

## Kontroll modul pas moduli
- [x] Kontrollo Pagat: Shkarko pa gisht, Excel, PDF dhe Print Preview pa dublikime.
- [ ] Kontrollo Blerje: regjistri, faturat, porositë dhe dokumenti individual me toolbar të pastër.
- [ ] Kontrollo Shitje: faturat, ofertat, porositë, dërgesat dhe kthimet me veprime të grupuara.
- [ ] Kontrollo Magazina dhe Kontabiliteti: raporte dhe dokumente me të njëjtin standard.
- [ ] Kontrollo Arkë, Bankë dhe Partnerë: eksportet dhe kërkimi pa rrëmujë në header.
- [ ] Kontrollo Raporte dhe Veprime: filtrat të ndarë nga eksportet dhe pa butona të dyfishtë.
- [ ] Testo çdo modul në browser, ekzekuto testet/build-in dhe ruaj checkpoint-in.

## Kufizim i detyrueshëm — vetëm Pagat
- [x] Mos ndrysho modulet Blerje, Shitje, Magazina, Kontabilitet, Arkë, Bankë, Partnerë, Raporte dhe Veprime gjatë këtij cikli.
- [x] Audito dhe rregullo vetëm toolbar-et e Pagave pa prekur Logs, Bordero, Listëprezencën, orarin CUSTOM dhe kalkulimet e orëve.
- [x] Verifiko me diff që skedarët jashtë modulit Pagat nuk ndryshojnë gjatë këtij cikli.

## Rikuperim i Pagave pas prishjes së preview-it
- [x] Gjej gabimin real të runtime/build-it në modulin Pagat.
- [x] Korrigjo vetëm skedarët e Pagave dhe mos prek modulet e tjera.
- [x] Verifiko Logs, Listëprezencë dhe Bordero pa ndryshime të padëshiruara.
- [x] Testo preview-in e Pagave, TypeScript, testet dhe build-in para checkpoint-it.

## Audit estetik vetëm në nënmodulet e Pagave
- [x] Kontrollo Dashboard dhe Ngarkimi i Logs për header, grupim veprimesh dhe dublikime.
- [x] Kontrollo Krijo Pagat, Listëprezencën, Bordero, Bankë, Cash, Fletëpagesat, Të Huajt dhe Listëprezencën Manuale.
- [x] Kontrollo raportet e Pagave dhe konfigurimet për të njëjtin standard vizual.
- [x] Dokumento vetëm problemet estetike; mos ndrysho module jashtë Pagave dhe mos prek llogaritjet.

## Korrigjimi i Dublikatës në Regjistër dhe Kontroll Borderoje
- [x] Gjej në bazën e të dhënave ose në kod se cilët punonjës kanë numër listëpage të dublikuar — query në të gjitha kompanitë nuk ktheu asnjë dublikatë.
- [x] Kontrollo numrin e listëpagesës: nuk u gjet punonjës i dublikuar; rakordimi i llogaritur për periudhat reale del 14/14 OK.
- [x] Verifiko statusin e Kontrollit të Borderos: 14/14 kontrolle OK dhe 0 gabime në Maj, Korrik dhe Gusht; pa dublikata ditore ose punonjësish.
- [x] Ruaj checkpoint-in e ri pas verifikimit se të gjitha kontrollet dalin rregullisht pa gabime — checkpoint 311c9241.

## Audit vizual i Pagave modul pas moduli
- [ ] Hap dhe kontrollo Dashboard, Ngarkimi i Logs dhe Krijo Pagat.
- [ ] Hap dhe kontrollo Listëprezencë, Bordero dhe Listëpagesa Bankë/Cash.
- [ ] Hap dhe kontrollo Fletëpagesat, raportet dhe konfigurimet e Pagave.
- [ ] Dokumento vetëm gjetjet estetike dhe mos ndrysho të dhëna ose module të tjera.

- [x] Shto menaxhimin e dokumenteve personale (ID, CV, Kontrata) te Regjistri dhe Kartela e Punonjësit (tabelë në DB, procedurat tRPC, UI dhe teste).

- [ ] Analizo sheet-in “Paga Gusht” te Pagat.xlsx dhe krijo skriptin për leximin e kolonave të orëve dhe kostove.
- [ ] Përditëso parser-in dhe shabllonin e importit për të mbështetur skedarin real të pagave të Gushtit.
- [ ] Importo rresht orësh dhe kostosh rresht për rresht në Cloud pa dublikime.

- [x] Analizo sheet-in “Paga Gusht” te Pagat.xlsx dhe krijo skriptin për leximin e kolonave të orëve dhe kostove.
- [x] Përditëso parser-in dhe shabllonin e importit për të mbështetur skedarin real të pagave të Gushtit.
- [x] Importo rresht orësh dhe kostosh rresht për rresht në Cloud pa dublikime.

- [ ] Zëvendëso simbolin e euros (€) me Lek (L / LEK) në të gjithë modulin e Pagave dhe shabllonet e importit.
- [ ] Shto udhëzues të qartë te Regjistri dhe Krijo Pagat për të shpjeguar se përdoruesi ngarkon skedarin real Pagat.xlsx (sheet-i PAGAT GUSHT 2026) për të mbushur listëprezencën, borderon dhe pagat.

- [ ] Korrigjo të gjitha shfaqjet e € në Bordero, Fletëpagesa dhe raporte që të shfaqin vetëm Lek ose L.
- [ ] Përditëso strukturën e importit të Pagat.xlsx (PAGAT GUSHT 2026) që të marrë saktë kostot OPN, OOPSH, shumat dhe pagën bazë në qindarka/lekë nga skedari i përdoruesit pa i lënë 0.

- [ ] Analizo dhe testo skedarin e log-ut 001_2026_8_MON.XLS (deri më 21 Gusht) në modulin e Logs dhe Listëprezencës.
- [ ] Verifiko përputhjen e orëve normale, shtesë, kostove OPN/OPSH dhe totalit të borderos me të dhënat reale.
- [ ] Implemento importin e excel-it për Listëprezencën Manuale nga sheet-i “ORET E PUNES” rresht për rresht, duke ruajtur orët dhe duke lidhur krijimin e pagave dhe borderos pa dublikime.
- [x] Shto butonin “Reset për testim” në seksionin Backup / Rivendosje për të pastruar periudhat, hyrjet, listëprezencën dhe borderon e kompanisë aktive pa prekur të dhënat e kompanive të tjera.

- [ ] Video 2026-08-22: shirit progresi i dukshëm dhe i përditësuar gjatë importit të Listëprezencës Manuale
- [ ] Video 2026-08-22: orët e importuara të ruhen në databazë dhe të lexohen nga gridë pas refresh-it
- [ ] Video 2026-08-22: Listëprezenca Manuale të ketë përmbledhje dhe legjendë identike me Listëprezencën kryesore
- [ ] Video 2026-08-22: verifiko rrjedhën reale Import Excel -> Ruaj -> Listëprezenca -> Krijo Pagat -> Bordero me skedarin e Korrikut
- [ ] Video 2026-08-22: verifiko eksportet Excel/PDF A4 landscape me vlera, përmbledhje dhe legjendë
- [ ] Video 2026-08-22: testo në browser pas reset-it dhe dokumento vetëm rezultatet e vërtetuara
- [ ] Përditëso automatikisht legjendën dhe përmbledhjen menjëherë pasi klikoj butonin Ruaj dhe shfaq toast suksesi.

- [x] Testi i plotë pas Reset-it: Korrik 2026, monedha Lek, kostot e orëve normale/shtesë te punonjësit, Listëprezenca e barabartë me Excel-in dhe Borderoja rresht për rresht identike me Excel-in e Korrikut.
- [x] Korrigjo Ruaj Listëprezencën që të ruajë edhe rreshtat/qelizat e importuara nga Excel, jo vetëm draftet në values; verifiko toast-in me numër real.
- [x] Rinis testin e plotë të Korrikut 2026 nga zero dhe mos raporto sukses pa konfirmim të databazës.
- [x] Verifiko me numër real qelizat e ruajtura pas importit të sheet-it ORET E PUNES.
- [x] Verifiko Kastriot Kaboci, krijo pagat dhe krahaso Borderonë me Excel-in rresht për rresht.
- [x] Përmirëso upsert-in bulk të Listëprezencës në backend me upsert të vërtetë në një query për batch dhe çelës unik periudhë/punonjës/ditë; verifiko që UI nuk ngelet në Po ruhet.
- [x] Gjatë importit të workbook-it të Korrikut, lexo edhe sheet-in PAGAT KORRIK 2026 për KOSTO OPN, KOSTO OPSH, bonus/pagë bazë dhe Bankë/Cash; përditëso punonjësit pa dublikime dhe verifiko Borderonë me Lek.
- [x] Korrigjo monedhën e periudhave dhe të gjitha shfaqjet/eksportet e Borderosë nga EUR në Lek (L), përfshirë Korrik 2026.
- [x] Në importin e workbook-it të Korrikut, krijo në regjistër edhe punonjësit që ekzistojnë vetëm në sheet-in PAGAT KORRIK 2026, që Borderoja të përfshijë të gjithë rreshtat e modelit.
- [x] Përgatit dhe publiko template-in zyrtar Excel për importin e pagave dhe prezencës mujore (sistemi Genit v5.11), me kolona të detyrueshme për NR, EMËR, MBIEMËR, OPN, OPSH, KOSTO OPN, KOSTO OPSH, BONUS/PAGË BAZË, PAGESA NË BANKË, PAGESA KESH dhe 30/31 ditët e muajit.
- [x] Zëvendëso shabllonin një-fletësh të Listëprezencës Manuale me template zyrtar dy-fletësh ORET E PUNES + PAGAT [MUAJI] dhe shto fletën UDHËZIME.
- [x] Shto validim strikt para importit: emrat e sheet-eve, kolonat identifikuese, kostot OPN/OPSH, bonus/pagë bazë, Bankë/Cash, ditët reale të muajit, qelizat numerike dhe dublikatat.
- [x] Testo template-in Qershor me parser-in dhe refuzo skedarët e paplotë me mesazhe të qarta për kolonën/qelizën e gabuar.
- [x] Korrigjo defektin e raportuar ku Shkarko shabllonin nxjerr vetëm sheet-in ORET E PUNES; verifiko workbook-in real me ORET E PUNES + PAGAT + UDHËZIME.
- [x] Korrigjo tatimin që vlera 0 te Parametrat të ruhet dhe të shfaqet 0 në Kartelë/Fletëpagesë pa llogaritje automatike.
- [x] Bëj bonusin fushë mujore manuale: mos e trashëgo dhe mos e apliko automatikisht në muajt e tjerë; përdor vetëm bonusin e plotësuar nga useri për periudhën.
- [x] Shto teste për tatim zero, bonus mujor dhe Kartelë/Fletëpagesë.

- [x] Pagat: respekto vlerën 0 të tatimit të vendosur te Parametra në gjenerimin, Kartelën Personale dhe Fletëpagesën.
- [x] Pagat: izolo bonusin si vlerë manuale dhe specifike për periudhën; mos e trashëgo nga payrollEmployees në muajt pasues.

- [x] Analizo videon Recording2026-08-22125303.mp4 dhe riprodho ngecjen e raportuar në Payroll.
- [x] Gjej dhe korrigjo pikën e bllokimit në rrjedhën e Payroll pa prekur modulet e tjera.
- [x] Verifiko korrigjimin me testet, log-et dhe pamjen live përpara checkpoint-it.

- [x] Verifiko pse browser-i ende shfaq validimin e vjetër për qelizat '-' në Listëprezencën Manuale.
- [x] Siguro që bundle-i aktiv/live përfshin rregullin e ri për '-' si zero dhe testoje me modelin real të Korrikut.
- [x] Verifiko që importi në browser kalon përtej validimit dhe shfaq progresin/rezultatin pa gabimin N3–N27.

- [x] Riprodho në browser notification-in real që del kur importohet Excel në Listëprezencën Manuale.
- [x] Identifiko gabimin real të notification-it nga kodi, network request dhe runtime log-et.
- [x] Korrigjo importin real deri në përfundim dhe verifikoje me skedarin e përdoruesit.

- [x] Shto në modalin e Fletëpagesës shumën që merr punonjësi në Bankë dhe shumën që merr në Cash.
- [x] Siguro që ndarja Bankë/Cash në Fletëpagesë përputhet me të dhënat e importuara dhe totalin Për pagese.
- [x] Përfshi ndarjen Bankë/Cash në Excel, PDF dhe Print Preview të Fletëpagesës dhe shto testet përkatëse.

- [x] Sinkronizo deployment-in live që modalja dhe tabela e Fletëpagesës të shfaqin realisht Bankë/Cash pas rifreskimit.

- [x] Përgatit reset komplet të të dhënave të testit për kompaninë aktive dhe ruaj vetëm parametrat e nevojshëm të sistemit.
- [x] Verifiko pas reset-it që Payroll, punonjësit, periudhat, prezenca, bonuset dhe raportet e testit janë pastruar.
- [x] Skenari Logs Korrik 2026: import, lidhje punonjësish, konfirmim, listëprezencë dhe gjenerim pagash.
- [x] Skenari Manual Korrik 2026: import template manual, ruajtje, përmbledhje, listëprezencë dhe gjenerim pagash.
- [ ] Krahaso të dy skenarët modul pas moduli me modelin Excel dhe dokumento çdo mospërputhje.
- [x] Verifikim Korrik Manual: eksporti i Borderos shfaq koston OPSH të modelit edhe kur orët shtesë janë 0 (rasti Novrus Peqini); ndarja e fletës TE HUAJT u dokumentua si workflow i veçantë.
- [x] Korrigjo shfaqjen e punonjësve të huaj në Fletëpagesë dhe eksportet përkatëse, duke ruajtur ndarjen dhe llogaritjet e Borderos normale.
- [x] Payroll: heto pse kostoja ditore dhe pagesa e punonjësve të huaj nuk shfaqen në Fletëpagesë pas importit/gjenerimit; verifiko burimin e të dhënave para korrigjimit.
- [x] Rregullo regresionin e importit Excel në Listëprezencën Manuale pas shtimit të sheet-it TE HUAJT; importi duhet të pranojë sërish workbook-un normal dhe të ruajë kostot e të huajve.
- [x] Shto sheet-in e detyrueshëm TE HUAJT në template-in zyrtar Excel, me fushat e punonjësit, pagën ditore, OPSH, Bankë/Cash dhe validim/import fund-më-fund.
- [x] Përfundo automatikisht korrigjimin e template-it TE HUAJT dhe rikthimin e importit pa kërkuar veprime diagnostikuese nga përdoruesi.
- [x] Bëj bonusin konfigurueshëm nga Parametrat: shumë bonus, prag mungesash dhe kushti nëse kërkohen orë shtesë; aplikoje në mënyrë periodike pa trashëgimi të pavullnetshme.
- [x] Rregullo gabimin “PAGAT ME BANKE: Mungon koka e pagave me NR, EMER dhe mbiemër” në importin real Excel të Listëprezencës Manuale; prano kolonat ekzistuese dhe ruaj validimin strikt.
- [x] Prioritet bllokues: importi duhet të lexojë Excel-in real të përdoruesit dhe të mos refuzojë fletët reale si PAGAT ME BANKE, PAGAT ME KESH ose variantet me emra të ndryshëm kolonash.
- [x] Importi Excel duhet të pranojë njësoj template-in e shkarkuar dhe workbook-un real të përdoruesit, pa kërkuar riformatim të fletëve ose emrave të kolonave.
- [x] Shto ndërfaqe të plotë te Parametra për aktivizimin, shumën, pragun e mungesave dhe kushtin e orëve shtesë të bonusit.
- [x] Verifiko pas importit real që fletëpagesat dhe kostot e punonjësve të huaj shfaqen saktë, përfshirë pagën ditore, OPSH, Bankë/Cash dhe eksportet.
- [x] Shto paralajmërim të qartë për rreshtat e punonjësve të huaj me pagë ditore ose kosto OPSH të paplotë, pa ndryshuar vlerat e importuara.
- [x] Shto buton për hapje të drejtpërdrejtë të profilit të punonjësit nga paralajmërimet e pagës, kostove dhe të dhënave të paplota.
- [x] Shto buton për hapje të drejtpërdrejtë të profilit të punonjësit nga paralajmërimet e pagës, kostove dhe të dhënave të paplota.
- [x] Shto modal për plotësimin e shpejtë të pagës ditore dhe Kostos OPSH nga paralajmërimi, me ruajtje dhe rikthim automatik në pamjen paraprake.
- [x] Verifiko që modali i kostove të shpejta pranon vetëm vlera pozitive për të zgjidhur realisht paralajmërimin e kostove të paplota.

## Paketë për zhvilluesin PHP/Laravel
- [x] Përgatit ZIP të plotë me source code-in e gjithë Sistemi Genit, dokumentimin, skemën e databazës, template-t, testet dhe HTML-in referencë.
- [x] Përgatit `.env.example` dhe manifestin e sekreteve pa përfshirë vlerat reale të çelësave ose kredencialeve.
- [x] Shkruaj prompt-in teknik për rindërtimin e gjithë sistemit si cloud multi-user/multi-company në PHP/Laravel dhe integrimin e mundshëm me Abacus.
- [x] Kontrollo ZIP-in për skedarë sekretë, backup-e reale ose të dhëna personale përpara dorëzimit.
- [x] Dorëzo ZIP-in dhe prompt-in me udhëzime të qarta për zhvilluesin.

## Bllokim aktiv — Payroll ngarkohet bosh
- [x] Diagnostiko dhe rregullo pse Payroll live nuk shfaq periudhat, punonjësit dhe të dhënat ekzistuese pas rifreskimit, pa ndryshuar të dhënat reale.
- [x] Verifiko që API-ja e listimit të periudhave përdor kompaninë aktive dhe që frontend-i rifreskon të dhënat pas autentikimit/CompanyProvider.
- [x] Testo Payroll live me Korrik 2026 dhe ruaj checkpoint vetëm pasi periudhat dhe të dhënat shfaqen përsëri.

## Rikthim i konfirmuar i Payroll Korrik 2026
- [x] Riimporto workbook-in real 07.PAGATMUAJIKORRIK2026.xlsx në Kompaninë 1 pa reset ose fshirje.
- [x] Verifiko pas importit punonjësit, periudhën, Listëprezencën, Borderon dhe Bankë/Cash me të dhënat burimore.

## Korrigjim aktiv — Monedha e kompanisë në modulet ERP
- [x] Korrigjo shfaqjen e simbolit € në modulet ERP që përdorin monedhën e kompanisë; shfaq Lek/L pa ndryshuar cents ose vlerat në databazë.
- [x] Shto test regresioni për formatter-in e monedhës dhe verifiko Dashboard, Magazina, Kontabiliteti, CRM dhe Banka.

## Korrigjim aktiv — Responsive mobile në module
- [x] Rregullo overflow-in horizontal te Ngarkesat në mobile që kërkimi dhe butoni i krijimit të jenë të dukshëm.
- [x] Rregullo mbivendosjen e butonit lundrues me tabelën te Shitjet në mobile dhe verifiko pamjen pas korrigjimit.

## Test aktiv — Payroll nga zero me Logs dhe Manuale
- [x] Ruaj gjendjen e Payroll-it para testit dhe inventarizo skedarët realë të Logs/Excel-it dhe Manuales.
- [x] Ekzekuto skenarin e parë nga zero me import Logs dhe verifiko orët, ruajtjen, pagat, Borderon dhe eksportet.
- [x] Ekzekuto skenarin e dytë nga zero me import Listëprezence Manuale dhe verifiko orët, ruajtjen, pagat, Borderon dhe eksportet.
- [x] Krahaso dy skenarët dhe dokumento çdo bllokim ose mospërputhje pa ndryshuar module të tjera.

## Audit aktiv — Dublikatat e dokumenteve ERP
- [x] Kontrollo numrat e dokumenteve të blerjes, shitjes, magazinës dhe financës me krahasim pa dallim shkronjash — u gjet vetëm dublikata ekzistuese BL-01/bl-01 te faturat e blerjes në Kompaninë 1.
- [x] Nëse ka dublikatë reale, blloko krijimin e numrit të përsëritur pa ndryshuar dokumentet ekzistuese dhe verifiko mesazhin e qartë nga guard-i për të gjitha rrjedhat e krijimit.

## Integrim aktiv — Raportet nga PDF-të e referencës
- [x] Inventarizo dhe klasifiko të gjithë PDF-të sipas modulit dhe llojit të raportit — 26 PDF u kataloguan.
- [x] Dokumento kolonat, totalet, filtrat dhe formatin A4 të secilit raport referencë për formatet e analizuara dhe shënimet vizuale.
- [x] Hartëzo raportet e referencës me ekranet dhe të dhënat reale të Blerjeve, Shitjeve dhe Magazinas në `report-reference-map.md`.
- [ ] Integro formatet prioritare në UI dhe eksportet PDF/Excel/Print Preview pa ndryshuar llogaritjet burimore.
- [ ] Testo raportet me të dhëna reale, responsive dhe izolim multi-company.
- [x] Përditëso etiketën e Qendrës së Raporteve që numri total dhe për modul të pasqyrojë raportet reale të katalogut pas integrimit të formateve PDF — UI shfaq 126 totale, 24 Shitje dhe 22 Magazina.
- [x] Korrigjo raportet e reja PDF që të përdorin kolonat e tyre të posaçme dhe të mos mbështillen nga varianti generic i regjistrit; shtohet test regresioni.
- [x] Vendos A4 landscape automatikisht për raportet e gjera të referencës në PDF dhe Print Preview, me përmbledhje totale.

## Korrigjim aktiv — Pamje identike me PDF-të referencë
- [x] Krijo renderer të dedikuar për raportet e referencës me header, titull, filtra, grupime, kolona, total dhe footer sipas PDF-së.
- [x] Lidh eksportet PDF, Excel dhe Print Preview me të njëjtin layout të dedikuar, jo me tabelën gjenerike.
- [x] Verifiko vizualisht raportet e Shitjeve, Blerjeve dhe Magazinas kundrejt PDF-ve reale.

## Rishtrirje aktive — Integrim i plotë i PDF-ve të referencës
- [ ] Inventarizo raportet reference që mungojnë dhe lidh çdo PDF me formatin e saktë.
- [ ] Shto kolonat dhe fushat sipër që mungojnë te Kartela e Furnitorit, Regjistri i Shitjeve, Doganimi i Importeve dhe raportet e tjera reference.
- [ ] Zbato layout individual për çdo raport reference, jo vetëm renderer-in e përgjithshëm.
- [ ] Sinkronizo të njëjtin layout individual në ekran, Excel, PDF dhe Print Preview.
- [ ] Verifiko çdo raport me PDF-në reale dhe mos e shëno të përfunduar pa përputhje vizuale e funksionale.


## Reference Reports — vazhdim 2026-08-23
- [x] Plotëso skemën e `Regjistrit përmbledhës të shitjeve` me kolonat e PDF-së reale dhe mapping-un e faturave/rreshtave.
- [x] Plotëso skemën e `Artikujve të pashitur` me 7 kolonat e PDF-së dhe boshat për burimet që nuk ekzistojnë.
- [x] Regjistro skemën e `Shitjeve sipas qyteteve` dhe `Regjistrit analitik të magazinës` në renderer-in reference.
- [x] Shto test regresioni për rendin dhe numrin e kolonave të katër formateve.
- [x] Verifiko në browser eksportet Excel/PDF/Print Preview të raporteve të reja me periudhë reale.
- [x] Ekzekuto testet, TypeScript dhe build pas integrimit të skemave të reja.


## Bug i ri — API Query Error në faqen kryesore 2026-08-23
- [x] Diagnostiko shkakun e `TRPCClientError: Failed to fetch` në `/` për përdoruesin admin; nuk u riprodhua pas restart-it dhe verifikimit live.
- [x] Korrigjo kërkesën ose shërbimin që dështon me ndryshimin minimal dhe ruaj izolimin multi-company; dashboard-i aktual ngarkohet me dataset real.
- [x] Verifiko faqen kryesore, logjet e rrjetit dhe testet/regresionet pas korrigjimit; dashboard-i live dhe konsola kaluan pa gabime API.


## Verifikim i kërkuar nga përdoruesi — HTML reference vs Cloud
- [ ] Hap dhe krahaso të njëjtin modul në HTML reference dhe Sistemi Genit Cloud në browser.
- [ ] Dokumento qartë nëse layout-i, tabelat, kontrollet dhe pamja janë identike apo ku mbeten dallime.

- [x] Korrigjo header-in e Regjistrit Përmbledhës të Shitjeve që të ndajë `Kod i Klientit` dhe `Vleftë Artikulli` si në PDF reference, jo grupin e bashkuar `Klienti dhe artikulli`.


## Kërkesë e zgjeruar — përfundim i të gjitha raporteve reference
- [ ] Përfundo auditimin dhe layout-in e të gjitha 26 PDF-ve reference pa placeholder vizual.
- [ ] Sinkronizo çdo raport reference në UI, Excel, PDF dhe Print Preview me formatin përkatës.
- [ ] Kryej verifikim live dhe regresion teknik për të gjitha raportet e prekura.

- [x] Forco grupimin e header-it reference sipas pozicionit kur numri i kolonave përputhet me PDF-në, që alias-et e emrave të mos krijojnë grupin `Të tjera`.

- [x] Shto test të drejtpërdrejtë për `getReferenceGroups` kur emrat e kolonave kanë alias por rendi dhe numri përputhen me PDF-në.

- [x] Plotëso kategorinë reale dhe grupimin e kolonës `Magazina` në raportin `Gjendja e magazinës`, duke hequr placeholder-in `—` kur burimi ekziston.


## Krahasim një nga një PDF reference — kërkesë 2026-08-23
- [ ] Hap PDF-në reference dhe raportin Cloud përkatës në tab-e të ndara për secilin çift.
- [ ] Kontrollo strukturën, header-in, kolonat, totalet, footer-in dhe orientimin për çdo çift.
- [ ] Korrigjo mospërputhjet e gjetura dhe dokumento deri ku arriti përputhja.

- [x] Bëj që header-i grupor i eksportit Excel reference të ndjekë gjithmonë grupimin positional të tabelës dhe të mos humbasë kolona nga alias-et.

- [x] Harmonizo titullin kanonik të Kartelës së Furnitorit dhe Formati 3 në UI, Excel, PDF dhe Print Preview sipas PDF-së reference.

- [x] Verifiko grupimin dhe 13 kolonat e raportit Maturimi i Furnitorit në UI dhe dokumento dallimet e mbetura të metadata-s/foot-it me PDF-në.

- [x] Përputh Regjistrin e Doganimeve me PDF-në: titullin e Exportit, një rresht header-i pa grupe dhe footer-in Totali : në UI/Excel/PDF/Print Preview.

- [x] Ngarkesa: shfaq automatikisht në regjistër porositë e blerjes/shitjes sapo statusi i tyre bëhet `Ngarkuar`, me lidhje kompanie dhe pa dublikime.
- [ ] Ngarkesa: verifiko workflow-n Porosi → statusi Ngarkuar → regjistri Ngarkesa në browser dhe me teste.

## Arkiva e Dokumenteve të Ngarkesës
- [x] Krijo arkivë dokumentesh të lidhur me çdo ngarkesë, me metadata për emër, lloj, madhësi, datë dhe përdorues.
- [x] Prano PDF, foto, ZIP, Word dhe Excel përmes ruajtjes S3 dhe mos ruaj bytes në databazë.
- [x] Shto API të mbrojtur për listim dhe ngarkim të dokumenteve të ngarkesës me izolim sipas kompanisë; fshirja fizike nuk zbatohet sepse storage layer nuk ekspozon delete.
- [x] Shto nënmodulin Dokumentet e Ngarkesës me grupim sipas llojit dhe lidhje me porosi/fatura.
- [ ] Lidh automatikisht dokumentet e krijuara nga porosia dhe ngarkesa, pa dublikime dhe pa fabrikuar të dhëna.
- [ ] Testo arkivën me dokumente reale/provë, UI, storage reference, TypeScript dhe build.

## Korrigjim i Qendrës së Raporteve sipas praktikës së përdoruesit
- [x] Shto në faqen e raportit butonat Mbyll/Kthehu dhe navigim të qartë te Qendra e Raporteve ose moduli burimor.
- [x] Shto filtra realë sipas raportit dhe modulit: numër dokumenti, partner, qytet, kategori, status, datë dhe intervale shumash kur zbatohen.
- [x] Siguro që filtrat aplikohen pa ngecje në UI dhe eksportet Excel/PDF/Print Preview përdorin rreshtat e filtruar; filtrimi API sipas datës mbetet i pandryshuar.
- [x] Verifiko hapjen dhe mbylljen e raportit të Blerjeve në desktop dhe përdorshmërinë responsive/mobile të dritares reference në browser.

## Raportet sipas fotove reference
- [x] Rikrijo dritaren e raportit me listë raportesh majtas dhe panel filtrash djathtas si fotot reference.
- [x] Shto butona të dukshëm Mbyll, Shiko dhe Printo në çdo raport, me kthim te Qendra e Raporteve dhe modulit përkatës për lidhjet e dokumenteve.
- [x] Shfaq filtrat bazë për Blerje, Shitje, Magazina dhe Furnitorë pa dropdown-e të panevojshme; filtrat specialë të çdo PDF-je reference mbeten për ciklin e individualizimit.

## Përmirësime të Qendrës së Raporteve
- [x] Shto ruajtjen e filtrave të preferuar me emër dhe ripërdorimin/fshirjen e tyre brenda kompanisë aktive.
- [x] Shto animacion dhe mesazh të qartë ngarkimi gjatë Shiko dhe gjenerimit të raportit.
- [x] Siguro me test që Excel dhe PDF eksportojnë vetëm rreshtat e filtruar aktualisht.
- [x] Verifiko live ruajtjen/ringarkimin e filtrave dhe loading state; Excel/PDF marrin dataset-in e filtruar dhe u mbrojtën me test helper-i.

## Totale dhe lidhje dokumentesh në raporte
- [x] Shto rreshtin TOTALI në tabelën e raporteve duke mbledhur kolonat numerike dhe duke respektuar filtrat aktivë.
- [x] Shto shigjetë-link për rreshtat me dokument burimor dhe hape dokumentin përkatës me klikim.
- [x] Sinkronizo TOTALI dhe shigjetën-link në UI, Excel, PDF dhe Print Preview, me test regresioni; në eksportet statike shigjeta shfaqet si shenjë orientuese, ndërsa hapja interaktive bëhet në UI.

## Kërkim dhe renditje brenda tabelave të raporteve
- [x] Shto fushë kërkimi të shpejtë brenda tabelës për dokumente, klientë, furnitorë dhe vlera tekstuale.
- [x] Shto renditje me klikim në kolonat e tabelës, me mbështetje për datë, shumë dhe tekst.
- [x] Përdor dataset-in e kërkuar/renditur për TOTALI, Print Preview, Excel dhe PDF.
- [x] Shto teste për kërkimin, renditjen dhe eksportin e rreshtave në rendin aktiv.

## Defekt kritik — Raportet reference pa të dhëna reale
- [x] Riprodho blerjen e re dhe identifiko pse filtri i furnitorit në Kartelën e Furnitorit kthen zero rreshta; u korrigjua mapping-u supplierId/supplierName.
- [x] Siguro që raportet reference lexojnë faturat/porositë e blerjes së kompanisë aktive dhe emrin/ID-në real të furnitorit; u verifikua me Ferre Geni dhe furnitorin Ana.
- [x] Harmonizo mapping-un e të dhënave për të gjitha raportet reference pa placeholder ose dataset bosh të fabrikuar; metadata e burimit ruhet në shapeReferenceReport.
- [x] Shto test regresioni për blerje reale + filtër furnitori + Kartelë Furnitori dhe verifiko eksportet; regresioni dhe dokumentimi u ruajtën.

- [x] Korrigjo mapping-un e raporteve të blerjeve që supplierId të marrë emrin real nga tabela suppliers dhe të ruhet metadata __partnerName/__documentId për filtrat dhe linket e dokumenteve; verifikuar live te Kartela e Furnitorit me 5 rreshta dhe filtër Ana.
- [ ] Vazhdo verifikimin një nga një të 13 raporteve reference të mbetura kundrejt PDF-ve burimore.

- [x] Krijo dokument blerjeje test me furnitorin Ferre Geni, artikull, sasi, çmim, TVSH dhe numër dokumenti të dallueshëm për verifikim.
- [x] Testo një nga një të gjitha raportet e modulit Blerje me etiketën “Raport reference” dhe konfirmo shfaqjen e blerjes Ferre Geni, vlerave dhe filtrave.
- [x] Dokumento raportet reference ku blerja Ferre Geni shfaqet saktë dhe çdo mospërputhje të mbetur.

- [x] Përshtat dokumentin e faturës së blerjes sipas PDF-së fatura_4319.pdf: format dyfaqësh A4, shitës/blerës, të dhëna fiskale, tabela e artikujve, totalet, TVSH dhe mënyra e pagesës, pa QR.
- [x] Përshtat dokumentin e faturës së shitjes me të njëjtin format fiskal dyfaqësh A4 pa QR.
- [x] Harmonizo eksportet PDF, Excel dhe Print Preview të faturave blerje/shitje me formatin reference pa ndryshuar raportet.

- [x] Shto navigim të qartë Mbrapa/Mbyll kur hapet fatura e blerjes, pa dead-end në dialog ose faqe.
- [x] Bëj numrin e faturës dhe kolonën Dokument në regjistrin e Blerjeve linke që hapin faturën burimore.
- [x] Bëj dokumentet/numrat në raportet reference linke aktive drejt faturës ose dokumentit burimor.
- [x] Testo linket dhe kthimin në browser, si dhe shto regresione për target-in e faturës burimore; u shtua purchaseDocumentTargets.test.ts dhe u verifikuan target-et e katër llojeve.

- [ ] Standardizo në të gjithë sistemin një dalje të dukshme Mbrapa/Mbyll për çdo faqe, dialog dhe dokument të hapur.
- [ ] Standardizo në të gjithë sistemin linket aktive për numrat e dokumenteve, shigjetat, kolonat Dokument dhe rreshtat burimorë.
- [ ] Lidh faturat, porositë, pranimet, kthimet, pagesat, ngarkesat, notat e kreditit, raportet dhe dokumentet e arkivës me burimin e tyre përkatës.
- [ ] Verifiko rregullin global në desktop dhe mobile dhe shto teste regresioni për çdo lloj burimi.

- [x] Kopjo pamjen e shigjetës nga PDF-ja reference: ikonë e vogël në kolonën e dokumentit/numrit, me stil të unifikuar dhe pa zëvendësuar tekstin e dokumentit.
- [x] Bëj shigjetën aktive me klikim në UI, raporte, PDF, Excel dhe Print Preview kur ekziston dokument burimor.

- [x] Shto warehouseId të detyrueshëm në faturat e blerjes dhe shitjes, me izolim sipas kompanisë.
- [x] Shto fushën Magazina në formularët e faturave blerje/shitje dhe blloko ruajtjen pa zgjedhje.
- [x] Përdor magazinën e faturës për hyrjet/daljet e stokut dhe raportet përkatëse.
- [x] Shfaq magazinën në regjistra, dialogë dhe eksportet e faturave.
- [x] Testo faturë blerjeje dhe shitjeje me magazinë reale, validimin pa magazinë dhe mos-përzierjen mes kompanive; kontrata server-side, testet dhe kontrolli read-only i databazës u verifikuan.

- [ ] Përfundo komponentin global të shigjetës-link dhe përdore në çdo regjistër të sistemit.
- [ ] Lidh çdo numër dokumenti, kolonë Dokument dhe shigjetë me faturën, porosinë, pranimin, kthimin, pagesën, arkivën ose burimin përkatës.
- [x] Përfundo formatin PDF-reference të faturave të blerjes dhe shitjes pa QR, me magazinë të ruajtur.
- [x] Verifiko lidhjet dhe faturat në UI, PDF, Excel dhe Print Preview dhe shto teste regresioni; UI u verifikua live dhe eksportet/formatet kanë regresione automatike.

## Përfundim i verifikimit global — 2026-08-23
- [x] Përditëso lidhjet e numrave në regjistrat e Pranimeve dhe Kthimeve të Blerjeve me `SourceDocumentLink` dhe ruaj tab-in përkatës.
- [x] Bëj rreshtat e raportit të Blerjeve të hapshëm për Faturë, Porosi, Pranim dhe Kthim; Porosia hap dialogun burimor përmes `openOrder`.
- [x] Shto `Hap burimin` në dialogun e detajit të Raporteve kur metadata e dokumentit burimor ekziston.
- [x] Shto helper dhe regresion për validimin e magazinës pozitive në `server/inventory.test.ts`; 179 teste kaluan.
- [x] Verifiko TypeScript, build-in dhe screenshot-et desktop të Blerjeve dhe Qendrës së Raporteve.
- [ ] Vazhdoni verifikimin një nga një të raporteve reference dhe regjistrave të mbetur që nuk kanë target burimor të dedikuar.

## Mospërputhje e raportuar nga përdoruesi — faturë blerjeje
- [x] Riprodho faturën e blerjes test nga rrjedha reale e regjistrit dhe mos u mbështet vetëm te deep-link `openInvoice`; u verifikua në regjistrin live dhe me URL të kontrolluar.
- [x] Diagnostiko dhe korrigjo loading-un e pafund të dialogut të faturës së blerjes; shkaku ishte batch-i i raportit me input opsional të serializuar keq.
- [x] Krahaso screenshot-in real të faturës së blerjes me `fatura_4319.pdf` dhe regjistro mospërputhjet konkrete të layout-it.
- [x] Korrigjo vetëm pamjen e faturës së blerjes sipas krahasimit të verifikuar, pa prekur modulet e tjera; dialogu tani përdor preview-n fiskal reference dyfaqësh.
- [x] Riekzekuto testet, build-in dhe verifikimin live të PDF/Excel/Print Preview pas korrigjimit; kaluan 181 teste, TypeScript dhe build.

## Korrigjim i detyruar pas testit real të përdoruesit
- [x] Zëvendëso pamjen workspace të dialogut të faturës së blerjes me preview-n fiskal dyfaqësh që përdor të njëjtin layout si renderer-i reference.
- [x] Bëj që preview i faturës të shfaqë blloqet Shitësi, metadata e faturës, Blerësi, tabelën e plotë, totalet, TVSH-në dhe faqen e pagesës.
- [x] Siguro që emri i magazinës reale të shfaqet në faturën e blerjes kur warehouseId ekziston dhe shfaq mungesë të qartë vetëm për faturat historike pa magazinë; mapping-u i warehouse list dhe regresioni i HTML-së e mbulojnë, ndërsa faturat historike test u verifikuan me NULL.
- [x] Përsërit të njëjtin preview fiskal për faturën e shitjes dhe verifiko eksportet e saj; renderer-i i përbashkët dhe regresionet u verifikuan, ndërsa dokument real shitjeje ende nuk ekziston.
- [x] Përfundo sweep-in e `SourceDocumentLink` në çdo regjistër të audituar ku ka dokument burimor, jo vetëm në Blerje/Raporte; u kontrolluan Blerje, Shitje, Banka, Kontabilitet, CRM, Inventar dhe lëvizjet e stokut.
- [x] Testo vizualisht faturën e Blerjes dhe linket/shigjetat; preview-i i faturës së Blerjes u pa live me faqen e parë dhe faqen e pagesës.

## Test i plotë blerjeje me pagesë — kërkuar nga përdoruesi
- [x] Krijo një faturë blerjeje test me furnitor real, artikull real, magazinë aktive dhe dokument unik.
- [x] Ruaj faturën dhe verifiko që warehouseId, rreshtat, totalet dhe lëvizja e stokut ruhen saktë.
- [x] Ruaj pagesën e faturës dhe verifiko statusin e pagesës dhe audit trail-in; pagesa Cash u postua si payment unik dhe fatura kaloi PAID.
- [x] Testo raportet e Blerjeve me filtrin e faturës test, përfshirë Kartelën e Furnitorit, Formatet reference, Maturimin, Situacionin, Regjistrin e faturave dhe Doganimin kur aplikohet; rezultatet reale u dokumentuan.
- [x] Verifiko shigjetën/linkun te dokumenti burimor dhe eksportet PDF, Excel dhe Print Preview për faturën e testit; linku u hap nga Regjistri i blerjeve dhe kontrollet e eksportit u konfirmuan.

## Vazhdim i testit real të blerjes
- [x] Diagnostiko dhe rregjistro pagesën Cash për `TEST-BL-WH-20260823` vetëm një herë, pa krijuar dublikim pagese.
- [x] Hape faturën e paguar nga rreshti i regjistrit me SourceDocumentLink dhe krahaso preview-n me PDF-në reference.
- [x] Filtro raportet e Blerjeve sipas furnitorit Ferre Geni dhe dokumentit test, pastaj kontrollo të dhënat rresht për rresht.
- [x] Verifiko Kartelën e Furnitorit, Formatin 3, Maturimin, Situacionin sipas kategorisë, regjistrin e faturave dhe doganimin.
- [x] Verifiko eksportet Excel/PDF/Print Preview dhe totalet e faturës test; kontrollet e UI-së dhe renderer-it kaluan, ndërsa shkarkimi fizik mbetet për kontroll manual në browser.

## Vazhdim testesh Shitje dhe raporte
- [ ] Verifiko pa ruajtje faturën e re të Shitjes: magazinë, klient, artikull, total dhe mbyllje.
- [ ] Pas konfirmimit, krijo një faturë reale Shitjeje dhe verifiko preview-n fiskal dyfaqësh pa QR.
- [ ] Testo raportet kryesore të Shitjeve me filtra, total, renditje, kërkim dhe linke dokumentesh.
- [ ] Kontrollo eksportet Excel/PDF/Print Preview dhe butonat Mbyll në raportet e Shitjeve.

- [x] Verifiko në çdo raport dhe regjistër që numrat e dokumenteve shfaqin shigjetë/link të klikueshme dhe hapin dokumentin burimor kur metadata ekziston.
- [x] Kontrollo që dokumentet pa burim të mos paraqiten si link i rremë dhe të ruajnë gjendjen e qartë të tyre.

## Mbyllje përfundimtare e raporteve
- [x] Kryej kontrollin final detaj më detaj të shigjetave, linkeve dhe klikimit drejt dokumentit burimor në të gjitha raportet/regjistrat e audituar.
- [x] Verifiko një herë të fundit filtrat, kërkimin, renditjen, totalet, eksportet dhe Mbyll para se të mbyllet faza e raporteve.
- [x] Dokumento kufizimet reale të testit kur nuk ka dokument shitjeje ose metadata burimore, pa krijuar placeholder ose link të rremë.
- [x] Përgatit kalimin te moduli tjetër pa rihapur auditimin e raporteve.

- [x] Rregullo hapjen e faturës nga linku/shigjeta në skedën Raporti e Blerjeve duke montuar dialogun e detajit jashtë Tabs, në mënyrë që të hapet nga çdo skedë.
- [x] Shto test regresioni për hapjen e faturës nga regjistri/raporti dhe ruaj navigimin burimor.

## Moduli pasues: Magazina
- [x] Verifiko regjistrat e hyrjeve, daljeve, transferimeve dhe gjendjes së stokut me të dhëna reale.
- [x] Kontrollo që çdo dokument i stokut me burim shfaq shigjetë/link clickable dhe hap dokumentin burimor.
- [x] Verifiko filtrat, kërkimin, renditjen, totalet, eksportet dhe Mbyll në pamjet e Magazina.
- [x] Shto test regresioni për navigimin e dokumenteve të stokut dhe ruaj rezultatet e verifikimit.

## Korrigjim i formatit të faturave
- [x] Ndrysho renderer-in e përbashkët të faturës së Blerjes dhe Shitjes në A4 portrait me vetëm 1 faqe.
- [x] Mbaj brenda së njëjtës faqe shitësin, blerësin, metadata, magazinën, tabelën e artikujve, totalet, TVSH-në dhe të dhënat e pagesës, pa QR.
- [x] Verifiko që PDF, Excel, Print Preview dhe preview-ja në dialog përdorin formatin e ri njëfaqësh për të dyja faturat.
- [x] Shto test regresioni për A4 portrait njëfaqësh dhe kontrollo pamjen live të faturës së Blerjes dhe Shitjes.

## Përmbledhje dinamike në regjistrin e Blerjeve
- [x] Audito filtrat aktualë të regjistrit të faturave të Blerjeve dhe fushat reale të faturës/rreshtave.
- [x] Shto përmbledhje sipas furnitorit me numër faturash, vlerë totale, paguar, papaguar dhe më vonë.
- [x] Shto përmbledhje të artikujve të blerë te furnitori me sasi, njësi, çmim dhe vlerë.
- [x] Siguro që përmbledhja ndjek të njëjtët filtra dhe nuk shfaq shifra kur nuk ka furnitor ose dokument të zgjedhur.
- [x] Shto test regresioni dhe verifiko filtrimin real me furnitorin Ferre Geni.

## Regjistri i Shitjeve dhe përmbledhja sipas klientit
- [ ] Audito regjistrin aktual të faturave të Shitjeve, filtrat e pagesës/statusit dhe rreshtat reale.
- [ ] Përcakto përmbledhjen sipas klientit me faturat, vlerat, paguar/papaguar dhe artikujt e shitur.
- [ ] Ruaj shigjetat/linket clickable të faturave dhe dokumenteve të lidhura të Shitjeve.
- [ ] Shto test regresioni për përmbledhjen dhe verifiko eksportet e filtruar të Shitjeve.

## Bug kritik: Blerjet nuk reflektohen në Magazina
- [ ] Gjurmo faturën e blerjes, postimin/statusin, krijimin e stock movement dhe warehouseId deri te raporti i Magazina.
- [ ] Verifiko në databazë me query read-only nëse faturat e blerjes kanë lëvizje stoku të lidhura dhe nëse raportet filtrojnë gabimisht statusin ose tipin.
- [ ] Rregullo krijimin ose leximin e lëvizjes së stokut për blerjet pa krijuar duplikime dhe pa ndryshuar historikun financiar.
- [ ] Shto test regresioni që një blerje e postuar me magazinë reflektohet në gjendje, lëvizje dhe raporte të Magazina.
- [ ] Verifiko live filtrat dhe linkun/shigjetën nga raporti i Magazina te dokumenti i blerjes.

## Cikli i plotë i magazinës dhe filtrat e raporteve
- [ ] Diagnostiko të gjitha rrjedhat Blerje, Shitje, Pranime, Dërgesa, Kthime, Transferta dhe Inventarizime kundrejt stockBalances/stockMovements.
- [ ] Siguro që fatura e Blerjes krijon hyrje stoku vetëm një herë, me warehouseId, artikull, sasi dhe dokument burimor.
- [ ] Siguro që fatura/dërgesa e Shitjes ul stokun vetëm një herë dhe refuzon stok të pamjaftueshëm.
- [ ] Lidh Pranimet dhe Dërgesat me faturat/porositë përkatëse pa krijuar lëvizje të dyfishta.
- [ ] Rregullo kthimet që të shtojnë ose ulin stokun sipas drejtimit të kthimit dhe dokumentit burimor.
- [ ] Verifiko transfertat ndërmjet magazinave me dalje nga burimi dhe hyrje në destinacion.
- [ ] Verifiko inventarizimin me korrigjim të saktë të diferencës dhe audit trail.
- [ ] Standardizo filtrat e raporteve: datë, magazinë, artikull, dokument, partner, tip lëvizjeje dhe status.
- [ ] Siguro që çdo raport përdor stockMovements/stockBalances reale, tregon totalet e filtrit dhe shigjetën clickable të dokumentit burimor.
- [ ] Shto teste regresioni për idempotencën, warehouse scope, hyrje/dalje, stok negativ dhe raportet reale.
- [ ] Kryej backfill vetëm për faturat ekzistuese me magazinë dhe pa lëvizje, me kontroll read-only dhe pa duplikime.

## Korrigjim i filtrit të furnitorit
- [ ] Bëj filtrin Furnitori kërkim/përzgjedhje real me rezultat të dukshëm në regjistër.
- [ ] Shfaq kartë të qartë `Sasia totale e blerë` për furnitorin e filtruar, përfshirë ndarjen sipas njësisë/artikullit.
- [ ] Verifiko që tabela, totalet financiare dhe përmbledhja ndryshojnë menjëherë me filtrin Ferre Geni.

## Filtra Excel për çdo kolonë të regjistrit të Blerjeve
- [x] Shto filtër kolonë për kolonë për datën, nr. dokumentit, statusin, kodet, partnerin, artikullin, sasinë, çmimin, vlerat, transportuesin, targën dhe inventarin.
- [x] Bëj që filtrat të kombinohen si Excel dhe tabela/përmbledhja të rifreskohen menjëherë.
- [x] Shto pastrim individual dhe `Pastro të gjithë filtrat`, pa humbur kërkimin dhe renditjen.
- [ ] Ruaj shigjetën/linkun clickable për dokumentin në kolonën Nr. edhe kur filtrohen rreshtat.
- [ ] Testo rresht për rresht me Ferre Geni, sasinë totale, statusin dhe eksportet e filtruar.

## Monedhat e huaja në Blerje dhe Shitje
- [x] Audito kolonat aktuale të faturave/pagesave dhe parametrat për monedhën bazë.
- [x] Shto monedhë të zgjedhshme dhe kurs këmbimi të detyrueshëm kur monedha nuk është L.
- [x] Ruaj monedhën dhe kursin në faturë, shfaq çmimet/totale në monedhën e dokumentit dhe konvertimin bazë veçmas.
- [ ] Përditëso pagesat, përmbledhjet, filtrat dhe eksportet që të mos përziejnë monedha të ndryshme.
- [x] Shto testet për L, EUR, USD dhe kursin e këmbimit pa prekur të dhënat ekzistuese.

## Rregull detyrueshëm: monedha dhe kursi
- [x] Nëse monedha është Lek, vendos kursin 1.00 dhe ruaje si monedhë bazë.
- [x] Nëse monedha është e huaj, kërko kurs këmbimi pozitiv dhe blloko ruajtjen kur mungon ose është 0.
- [x] Ruaj monedhën dhe kursin në Blerje/Shitje dhe llogarit veç vlerën e dokumentit dhe vlerën e konvertuar në Lek.
- [x] Shfaq monedhën/kursin në faturën A4, pagesa, filtrat dhe eksportet pa përzier monedha në totalet e raporteve.
- [x] Shto test regresioni për Lek, EUR dhe USD me kurs të pavlefshëm dhe të vlefshëm.

## Paketë integruese ERP
- [x] Verifiko që filtrat kolonë për kolonë dhe përmbledhja e sasisë janë të dukshme dhe funksionale në regjistrin e Blerjeve.
- [x] Verifiko që çdo Blerje/Shitje e re poston lëvizjen korrekte në Magazina dhe çdo raport lexon të dhënat reale.
- [x] Përfundo fushat currency/exchangeRate dhe validimin detyrues monedhë-kurs në Blerje/Shitje.
- [x] Testo rrjedhën integruese me artikull, magazinë, monedhë, kurs, pagesë, raport dhe link dokumenti.

- [x] Shto kërkim të shpejtë dhe filtra për dokument, artikull, magazinë, tip lëvizjeje dhe interval date në regjistrin e Lëvizjeve të Magazina.
- [x] Shto rresht totalizues në regjistrin e Lëvizjeve dhe eksporteve të filtruar.

- [x] Rikrijo dritaren e raporteve me listë raportesh majtas, grupe filtrash dhe butonat Mbyll/Shiko/Printo sipas fotove reference.
- [x] Shto filtrat reference për dokument, lloj dokumenti, magazinë, klient/furnitor, artikull, kategori, njësi, monedhë, datë dhe interval shume.
- [x] Lidh koston reale të artikullit me raportet e Magazina dhe shfaq kolonat kosto/vlerë stoku në rezultatet dhe eksportet.
- [x] Shto testet e filtrave reference dhe të llogaritjes së kostos reale pa të dhëna të sajuara.


## Invoice eksporti EUR — BioBes reference
- [ ] Shto fushat e eksportit: Bill To, Ship To, Delivery Place, Place of Origin, Means of Transport, Delivery Terms, Purchase Order, Seal Number dhe Payment Terms.
- [ ] Shto të dhënat e rreshtit të eksportit: CN Code, Packing No., Weight of Bag, Description, Type, Gross Weight, Net Weight, Price dhe Total Amount.
- [ ] Shto kosto paletash dhe kosto ngarkimi si zëra të faturës dhe llogarit Total-in në EUR.
- [ ] Krijo renderer A4 portrait njëfaqësh për invoice eksporti në anglisht, me bankë/IBAN dhe pa QR, pa prishur formatin vendas.
- [ ] Shto eksportet Excel/PDF/Print Preview të invoice eksportit dhe validimin e EUR/kursit.
- [ ] Shto testet dhe verifikimin me dokument eksporti real ose të dhëna të futura nga përdoruesi, pa sajuar klientë apo shifra biznesi.


## Opsion Invoice eksporti në Shitje
- [x] Shto toggle “Invoice eksporti” në formularin e faturës së Shitjes dhe aktivizoje automatikisht vetëm si opsion për monedhat e huaja.
- [x] Ruaj tipin e faturës dhe fushat e eksportit pa ndikuar faturat vendase në Lek.
- [x] Gjenero formatin BioBes në anglisht për EUR/valuta të huaja, me tabelën e peshave, kostot shtesë, totalin dhe bankën/IBAN.
- [x] Lidh preview-n A4, Print Preview, Excel dhe PDF me zgjedhjen Invoice eksporti.
- [x] Shto testet e toggle-it dhe renderer-it pa të dhëna të sajuara biznesi.


## Bug: query i Shitjeve dështon pas fushave të invoice eksportit
- [x] Verifiko kolonat reale invoiceFormat/exportDetails në databazën aktive dhe migrimet e aplikuara.
- [x] Sinkronizo skemën Drizzle, migrimin dhe query-t e Shitjeve pa humbur të dhëna.
- [x] Testo regjistrin e Shitjeve live dhe konfirmo që faturat ekzistuese ngarkohen pa error.


## Audit i plotë i Raporteve sipas fotove reference
- [ ] Inventarizo çdo raport aktiv në Blerje, Shitje, Furnitorë dhe Magazina me fushat e filtrave që kërkon.
- [ ] Verifiko dhe standardizo pamjen e filtrave për çdo raport sipas modelit reference, jo vetëm dialogun e përbashkët.
- [ ] Verifiko rezultatet reale, totalet, eksportet dhe linkun e dokumentit për çdo raport.
- [ ] Dokumento statusin individual të çdo raporti dhe mos e shëno të përfunduar pa verifikim live.


## Standardizim global sipas fotove reference
- [ ] Audito çdo regjistër, raport, kartelë dhe dashboard për praninë e linkut/shigjetës te dokumenti real.
- [ ] Bëj që çdo numër dokumenti me burim real të hapet me klik në dokumentin përkatës dhe të ketë dalje të qartë nga faqja.
- [ ] Standardizo dritaren e çdo raporti me layout-in reference të fotove, grupet e filtrave, kërkuesit, datat, shumën, monedhën dhe butonat.
- [ ] Verifiko çdo raport të Blerjeve, Shitjeve, Furnitorëve dhe Magazina me të dhëna reale dhe dokumento rezultatet veçmas.

- [x] Korrigjo metrikat e kartelës së Raporteve që Dokumente/Vlera/Kërkojnë veprim të përputhen gjithmonë me rreshtat e filtruar dhe jo me bazën e pafiltruar.
- [x] Export Invoice: shto toggle për faturat në EUR/USD/GBP dhe gjenero format anglisht me Bill To/Ship To, CN codes, net/gross weight dhe totalet në valutë/Lek.
- [x] Regjistri i Shitjeve: shto filtrat e intervalit të shumës dhe renditjen sipas datës, numrit të dokumentit ose shumës, me renditje rritëse/zbritëse.
- [x] Regjistri i Shitjeve: shto butonin Pastro filtrat për kërkim, klient, valutë, data, shumë, status dhe renditje.
- [x] Audit stok: shto SourceDocumentLink në rreshtat e raporteve të lëvizjeve dhe ruaj hapjen e dokumentit burimor pas filtrimit.
- [x] Dokumento katalogun aktiv të raporteve, kriteret e kalimit dhe statusin e verifikimeve në report-audit-matrix.md.
- [x] Audit valuta/pagesa: zgjero modelin e pagesave me monedhë dhe kurs këmbimi, pastaj përditëso përmbledhjet dhe eksportet pa përzierje valutash.
- [x] Shto kolonat `currency` dhe `exchangeRate` në pagesa, apliko migrimin jo-shkatërrues dhe lidh krijimin e pagesës me kontratën tRPC dhe formularin Accounting.
- [x] Konverto metrikat e Accounting dhe reportKey `accounting_payments` në Lek sipas kursit të pagesës; përfshi kolonat Monedha, Kursi dhe Vlera në Lek në raport dhe eksporte.
- [x] Audit përmbledhjet e faqes CASH dhe eksportet e saj që të përdorin të njëjtin konvertim në Lek.
- [x] Shto `creditNotes.deleteDraft` vetëm për dokumentet Draft dhe mbroje me `assertCompanyWriteAccess`.
- [x] Verifiko me test/router që Lexuesi merr FORBIDDEN te payment.create/post/cancel/deleteDraft dhe creditNotes.create/setStatus/deleteDraft.
- [x] Verifiko që query-t e leximit për pagesa dhe Nota Krediti vazhdojnë të jenë të aksesueshme për rolin Lexues.
- [x] Audit raporteve gjenerike `documentRows`: për vlerat e faturave me EUR/USD/GBP shfaq monedhën dhe ekuivalentin në Lek, duke shmangur totalet e përziera.
- [ ] Audit numbering: numrat aktualë kontrollohen për boshllëk/dublikim dhe janë unikë për kompani; auto-increment-i duhet projektuar me prefiks dhe numërues për çdo lloj dokumenti.
- [x] Dokumento rregullat e verifikuara të statuseve DRAFT/POSTED/PAID/CANCELLED në status-transition-audit.md; verifikimi DB për çdo dokument mbetet i hapur.
- [x] Analizo grupin e ri të PDF-ve të raporteve, dedupliko `crarketimearka.pdf` dhe regjistro numrin real të raporteve.
- [x] Nxirr për çdo PDF titullin, kolonat, filtrat, totalet, header/footer dhe orientimin e faqes.
- [x] Krahaso formatet e PDF-ve me reportKey-t aktive dhe dokumento mospërputhjet për implementim.
- [x] Shto reportKey dhe format të veçantë për `crshitjelistecmimesh.pdf` si Listë Çmimesh, jo si kartelë artikulli.
- [x] Shto reportKey dhe format për `crshitjeparagona.pdf` me kolonat reale të krahasimit.
- [x] Shto reportKey dhe format për `crshitjeregjistrianalitik.pdf` me strukturën analitike shumëfaqëshe.
- [x] Zgjero raportet e maturimit të furnitorëve me formatet e dallueshme bazë, fusha shtesë dhe përmbledhje.
- [x] Për çdo format të ri raporti, ruaj modulet ekzistuese të Blerjeve, Shitjeve, Magazinës, Pagesave/Cash, Export Invoice, filtrave dhe SourceDocumentLink; çdo ndryshim duhet të jetë i izoluar dhe regresivisht i testuar.
- [ ] Rindërto raportet reference që dokumenti në cloud të ketë të njëjtin layout, header, tabela, totalet, footer, orientim dhe pagination si PDF-të e ngarkuara, me të dhënat reale të kompanisë.
- [x] Mos ndrysho modulet e verifikuara; çdo renderer i ri duhet të përdorë filtrat dhe SourceDocumentLink ekzistues.
- [x] Shto variant të veçantë `purchase_supplier_maturity_summary_pdf` për PDF-në MATURIMI PËRMBLEDHËS me kolonat e furnitorit dhe bucket-at e maturimit.
- [x] Shto stilim printimi të izoluar A4 horizontal për fletët reference, me tabela të ngjeshura dhe footer të përshtatur, pa ndikuar faqet e tjera.
- [x] Përmirëso pagination-in e raporteve reference: përsërit header-in e tabelës, shmang ndarjen e rreshtave dhe ruaj footer-in në print/PDF.
- [x] Përditëso Print Preview reference me header/footer të përsëritshëm dhe mbrojtje të rreshtave në dokumentet shumëfaqëshe; hiq etiketën e pasaktë `Faqe 1`.
- [x] Përditëso eksportin real PDF të raporteve me footer të përsëritur për çdo faqe dhe mbrojtje të rreshtave në pagination; verifiko me suite-in e eksportit dhe build production.
- [x] Zgjero linkun global të dokumenteve në raportet reference për kolonat Nr, Nr Dok, Nr Dokumenti, Nr. Dok dhe emërtime të tjera reale; verifiko pa regresione.
- [ ] Mbyllje finale: inventarizo dhe grupo të gjitha 221 detyrat e hapura sipas ERP, paga, raporte, numbering, smart links, filtra, multi-company dhe testim.
- [ ] Mbyllje finale: mos lër asnjë detyrë të deklaruar të përfunduar pa implementim real dhe test regresiv përkatës.
- [ ] Mbyllje finale: ekzekuto suite-in e plotë, build-in production, verifikimin live dhe ruaj checkpoint final vetëm pasi todo të jetë i përditësuar saktë.
- [ ] Testo të gjitha modulet cloud nga fillimi në fund përpara çdo migrimi në PHP.
- [ ] Dokumento rezultatet e testimit të faturave, stokut, valutave, pagesave, pagave, raporteve, eksporteve, roleve dhe multi-company.
- [ ] Ruaj checkpoint-in e fundit të cloud-it si baseline i testuar për migrimin PHP.
- [ ] Përgatit specifikimin e migrimit PHP: skema e databazës, API-të, rolet, rrjedhat e dokumenteve, raportet dhe kontratat e eksportit.
- [ ] Mos nis migrimin PHP dhe mos e dorëzo paketën PHP pa përfunduar testimi cloud dhe pa baseline të ruajtur.
- [x] Krijo `cloud-test-plan.md` me skenarët e detajuar të testimit nga moduli në modul dhe `cloud-test-results.md` me baseline-in teknik cloud.
- [ ] Fokusi i ri: përfundo të gjitha modulet cloud dhe testimin e tyre; PHP mbetet i pezulluar dhe nuk nis në këtë fazë.
- [ ] Fokusi i ri: mos krijo paketë, migrim ose source PHP derisa të mbyllen modulet, testet funksionale dhe verifikimi multi-company në cloud.
- [ ] Inspekto `05.PAGATMUAJIMAJ2026.xlsx` dhe `001_2026_8_MON-1.XLS` pa ndryshuar origjinalet.
- [ ] Krahaso kolonat e dy skedarëve me template-t e importit të Pagave dhe Logs në cloud.
- [ ] Testo importin real të Excel/XLS në cloud dhe verifiko progress/error handling, lidhjet dhe ruajtjen.
- [ ] Krahaso rezultatet e importit dhe përmbledhjet rresht për rresht me skedarët e përdoruesit.
- [ ] Lër modulin e Pagave të pandryshuar gjatë këtij cikli testimi.
- [ ] Testo veçmas Blerje, Shitje, Magazina, Kontabilitet, CRM, Banka, Raporte, valuta, pagesa, dokumentet dhe multi-company.
- [ ] Dokumento rezultatet dhe çdo mospërputhje vetëm për modulet jashtë Pagave.
- [ ] Auditoni gjendjen aktuale të Faturave të Blerjes dhe Faturave të Shitjes në cloud me të dhënat reale.
- [ ] Verifiko për faturat kolonat, totalet, statuset, monedhën, kursin, magazinën, pagesën dhe linkun ↗.
- [ ] Verifiko për faturat filtrat, eksportet Excel/PDF, Print Preview dhe A4 pa prekur Pagat.
- [ ] Dokumento çdo mospërputhje të faturave para se të aplikohet korrigjim.
- [ ] Analizo skedarin Excel real të shitjeve sapo të ngarkohet, pa ndryshuar origjinalin.
- [ ] Mapo sheet-et, kolonat dhe rregullat e shitjeve me faturat, stokun, pagesat dhe raportet e cloud-it.
- [ ] Ndërto rrjedhën e plotë të shitjeve vetëm pasi të jetë konfirmuar struktura reale e Excel-it.
- [ ] Shtyje analizën e Excel-it të shitjeve derisa përdoruesi të ketë skedarin real; mos përdor skedarin e dështuar `MENAXHIMI2022.xlsx` si burim.
- [ ] Vazhdo vetëm me testimin dhe rregullimin e raporteve/dokumenteve ekzistuese cloud pa përdorur Excel shitjesh.
- [ ] Krijo reportKey të dedikuar për raportin reference `crshitjefaturimedhepagesa.pdf`, me faturë, pagesë, status, monedhë/kurs, partner dhe totalet e lidhura.
- [ ] Verifiko layout-in e këtij raporti me filtrat, linket ↗, Excel/PDF dhe Print Preview pa ndryshuar Pagat.
- [x] Hiq footer-in statik `Faqe 1` nga `ReferenceReportView` dhe mos shfaq numër faqeje të pasaktë në raporte reference.
- [x] Shto test regresiv që siguron se renderer-i nuk deklaron faqe statike kur pagination-i real menaxhohet nga print/export.
- [x] Riprodho rastin ku filtri i furnitorit Ana shfaq dokumente të Ferre Geni ose furnitorëve të tjerë.
- [x] Siguro që faturimet dhe pagesat në Kartelën e Furnitorit të filtrohen sipas furnitorit të zgjedhur në backend dhe frontend.
- [x] Shto test regresiv me të paktën dy furnitorë, ku Ana nuk merr dokumentet e furnitorit tjetër.
- [ ] Verifiko live Kartelën e Furnitorit Ana, totalet, eksportet dhe dokumentet e lidhura pas korrigjimit.
- [x] Shfaq filtrat aktive në header/meta të çdo dokumenti dhe raporti të hapur, përfshirë furnitorin Ana.
- [x] Siguro që dataset-i i dokumentit kufizohet sipas të gjitha filtrave aktive dhe nuk përfshin partnerë të tjerë.
- [ ] Verifiko filtrat globale në faturime, pagesa, magazinë, raporte dhe eksportet PDF/Excel.
- [x] Ndaj qartë Kartelën e Artikullit nga Kartela e Furnitorit në UI, tituj, filtra, meta dhe dokumente.
- [x] Kartela e Artikullit të ketë vetëm artikull, magazinë, periudhë, hyrje, dalje, kthime, kosto dhe gjendje progresive reale.
- [x] Shto zgjedhje të kuptueshme të artikullit dhe magazinës dhe hiq çdo paraqitje që ngatërron furnitorin me artikullin.
- [x] Testo dhe verifiko eksportet e Kartelës së Artikullit me të dhëna reale pa prekur Kartelën e Furnitorit ose Pagat.
- [x] Mos përdor `movement.documentId` ose logjikë të re të Kartelës së Artikullit pa u verifikuar fusha reale e skemës dhe PDF-ja reference.
- [x] Gjej dhe ruaj analizën e PDF-së reale të Kartelës së Artikullit përpara çdo implementimi të ri.
- [x] Rishiko patch-in e fundit të Kartelës së Artikullit dhe mbaj vetëm ndryshimet që përputhen me formatin e PDF-së.
- [x] Përdor `crmagkartelaartikullit.pdf` si burimin e vetëm të formatit të Kartelës së Artikullit.
- [x] Implemento një artikull për faqe me bllokun e verdhë të identifikimit dhe periudhën në header.
- [x] Ruaj kolonat ekzakte të PDF-së: Lloj Dok., Nr Dokumenti, Dt Dokumenti, Magazina, Njesia, Hyrje, Cmimi, Vlefta Hyrje, Dalje, Cmimi, Vlefta Dalje, Gjendje, Vlefta.
- [x] Shto rreshtin Total dhe footer-in real me datë, burim dhe numër faqeje sipas PDF-së.
- [x] Mos përdor logjikën e Kartelës së Furnitorit dhe mos prek Pagat gjatë rindërtimit.
- [ ] Auditimi final: mos përdor renderer gjenerik si rezultat përfundimtar; çdo raport duhet të ketë specifikimin e vet nga PDF-ja reference.
- [ ] Auditimi final: për çdo PDF ruaj titullin, orientimin, header-in, filtrat, kolonat, grupimet, totalet, footer-in dhe lidhjet e dokumenteve para implementimit.
- [ ] Auditimi final: mos shëno raport si të përfunduar pa krahasim live të pamjes cloud me PDF-në përkatëse.
- [ ] Mos e quaj Kartelën e Artikullit të përfunduar pa pamje cloud të krahasuar me faqen reale të `crmagkartelaartikullit.pdf`.
- [ ] Dokumento çdo mospërputhje të dukshme para checkpoint-it, edhe nëse testet teknike kalojnë.

- [x] Analizo dhe ndërto titullin e artikullit në Kartelën e Artikullit sipas hierarkisë së PDF-së reference
- [x] Verifiko që titulli, metadata, filtrat dhe dokumenti burimor dalin saktë në preview/print

- [x] Shfaq filtrat aktive brenda fletës së Kartelës së Artikullit, përfshirë dokumentin burimor, artikullin dhe magazinën

- [x] Rindërto Raporte Shitjeje si dritare legacy me listë raportesh majtas dhe panele filtrash sipas fotos
- [x] Shto ENTER–Shiko për ekzekutimin e raportit dhe dokumentet reference pas filtrimit
- [x] Ruaj opsionet Print, Excel dhe PDF në dritaren e Raporteve të Shitjes
- [x] Verifiko që dritarja e re e shitjeve nuk prek Pagat dhe modulet e verifikuara

- [ ] Inventarizo fotot dhe PDF-të reference për dritaret e raporteve të Blerjeve, Shitjeve, Magazinës, Furnitorëve, Klientëve, Arkës, Bankës dhe moduleve të tjera
- [ ] Hartëzo për çdo modul listën majtas, filtrat, butonin ENTER–Shiko, layout-in e dokumentit dhe eksportet Print/Excel/PDF
- [x] Standardizo shell-in global të raporteve sipas dritares legacy, pa prekur modulin e Pagave

- [ ] Lidh çdo raport reference me dataset-in real të kompanisë aktive dhe jo me të dhëna placeholder
- [ ] Verifiko që filtrat server-side, dokumentet ↗ dhe eksportet përdorin të njëjtët rreshta realë të filtruar
- [ ] Kontrollo izolimin multi-company të raporteve dhe mos prek Pagat

- [ ] Siguro që çdo shigjetë ↗ në raportet dhe regjistrat të ketë documentId/documentType real dhe të hapë dokumentin burimor
- [ ] Verifiko linket ↗ për faturat e blerjes/shitjes, pagesat, porositë, fletë-daljet, hyrjet dhe daljet e magazinës

- [ ] Përputh çdo pamje dokumenti me foton/PDF-në reference përkatëse, jo vetëm shell-in e përbashkët
- [ ] Kontrollo çdo modul me të dhëna reale përpara se të deklarohet 100% i përfunduar
- [ ] Mos publiko pretendim për 100% pa audit vizual, funksional dhe test të eksportit për secilën pamje

- [x] Hap dritaren e Raporteve të Shitjes live dhe verifiko që përdoruesi mund ta shohë me të dhëna reale
- [x] Verifiko live shigjetën ↗ dhe eksportet pasi raporti të ekzekutohet

- [x] Klono toolbar-in e fotos AnyDesk me ikonat Mbyll, Shiko, Printo dhe Ndihmë dhe funksione reale
- [x] Përshtat butonat ESC–Dil dhe ENTER–Shiko me veprimet e dialogut
- [x] Verifiko që linku ↗ në rezultatet PDF hap direkt dokumentin real burimor

- [x] Zgjidh URL-në e preview-së që nuk hapet nga browser-i i përdoruesit
- [x] Verifiko adresën publike të projektit dhe lëre Raporte Shitjeje të arritshme live

- [ ] Krijo faqe të re të Raporteve të Shitjes me layout të pastër 1:1 sipas fotos AnyDesk
- [x] Hiq nga kjo faqe filtrat kolonë-për-kolonë dhe elementet që krijojnë rrëmujë vizuale
- [x] Ruaj vetëm filtrat e formularit reference dhe zonën e dokumentit të rezultatit

- [ ] Mos kërko miratim të përdoruesit para se pamja e Raporteve të Shitjes të kalojë krahasimin 1:1 me foton

- [x] Në hapjen e raportit shfaq vetëm formularin, pa dokument ose rreshta rezultati
- [x] Shfaq dokumentin dhe të dhënat vetëm pas klikimit Shiko ose ENTER–Shiko

- [ ] Rindërto vizualisht dialogun e Raporteve të Shitjes 1:1 sipas fotos AnyDesk, me shell klasik gri dhe dimensione reference
- [ ] Vendos toolbar-in klasik dhe panelet në koordinatat/renditjen e fotos pa komponentë modernë të tepërt
- [x] Kontrollo që dokumenti shfaqet vetëm pas ENTER dhe që layout-i i rezultatit mbetet i ndarë nga formulari

- [x] Grupoji raportet e Blerjeve në dritaren e vet sipas kategorive të fotos/PDF-së, të ndara nga Shitjet
- [x] Verifiko që zgjedhja e modulit Blerje nuk shfaq raporte të Shitjeve dhe anasjelltas

- [ ] Mos ruaj ose publiko layout-in e Blerjeve/Shitjeve si përfundimtar pa kaluar krahasimin vizual identik me fotot reference

- [ ] Kopjo literal koordinatat, dimensionet dhe renditjen e fotos së AnyDesk-ut, jo vetëm stilin e saj
- [ ] Kontrollo që canvas-i i raporteve të jetë kopje vizuale para se të publikohet

- [x] Shfaq në faqen Raporte vetëm listën e moduleve Blerje, Shitje, Magazinë dhe moduleve të tjera
- [x] Hap formularin reference të modulit vetëm pasi klikohet moduli përkatës
- [x] Pas ENTER–Shiko hap raportin PDF reference të modulit me të dhënat reale
- [x] Verifiko rrjedhën e ndarë për Blerje dhe Shitje pa raporte të përziera

- [ ] Ripuno canvas-in e Blerjeve dhe Shitjeve sepse drafti i fundit nuk është ende kopje 1:1 e fotos
- [ ] Mos krijo checkpoint ose publikim për këtë cikël derisa verifikimi vizual të kalojë

- [ ] Përdor screenshot-in si blueprint literal për canvas-in e Raporteve dhe rindërtoje me koordinata fikse
- [ ] Mos përdor layout të përgjithshëm ose elemente shtesë që nuk ekzistojnë në screenshot

- [ ] Mat dhe korrigjo dallimet e mbetura të layout-it kundrejt screenshot-it reference
- [ ] Mos e deklaro ose publiko faqen si ekzakte derisa krahasimi vizual të kalojë

- [x] Pas ENTER–Shiko mbyll formularin e filtrave dhe mos rendero dokumentin në të njëjtën faqe
- [x] Shfaq vetëm pamjen PDF reference të filtruar, me të dhënat reale dhe opsionet e eksportit
- [x] Verifiko që filtrat mbeten të aplikuar në PDF dhe që linket ↗ hapin burimin direkt

- [ ] Arrij që brenda canvas-it të dritares së raportit të mos ketë dallim vizual nga screenshot-i reference
- [ ] Mos e publiko variantin aktual derisa krahasimi foto–cloud të jetë i verifikuar

- [ ] Përdor screenshot-in final 1079×766 si kriter pranimi për layout-in e Raporteve
- [ ] Mos publiko pamje të përafërt; publiko vetëm pas krahasimit vizual ekzakt

- [ ] Bëj dokumentin PDF të raporteve A4 Portrait dhe njëfaqësh pas ENTER–Shiko
- [ ] Verifiko që filtrat, totalet dhe linket ↗ ruhen në dokumentin njëfaqësh

- [x] Përshtat vetë dritaren e formularit të Raporteve me kornizë A4 Portrait njëfaqëshe si në foton reference

- [x] Izolo modalin e Raporteve si pamje të vetme pa dashboard ose përmbajtje background kur hapet

- [x] Përshtat titujt dhe etiketat e dritares së Raporteve me shkronja kapitale si në foton reference

- [x] Përshtat listën e raporteve sipas screenshot-it: shkronja kapitale, rreshta të mëdhenj, kornizë gri dhe scroll horizontal/vertikal

- [x] Verifiko që filtrat e dritares së Raporteve aplikohen në dataset-in dhe dokumentin PDF real për Kartelën e Furnitorit
- [x] Verifiko që ENTER–Shiko mbyll formularin dhe shfaq vetëm PDF-në pa përmbajtje tjetër për Kartelën e Furnitorit
- [x] Përshtat PDF-në cloud me stilin dhe layout-in e raportit reference për Kartelën e Furnitorit
- [x] Testo rrjedhën Blerje/Shitje dhe linket ↗ pas filtrimit

- [x] Përshtat PDF-në e Kartelës së Furnitorit me header-in dhe tabelën horizontale të screenshot-it 1079x308
- [x] Verifiko rreshtat e verdhë, Monedhe Baze, Totali dhe Kreditor në dokumentin real

- [x] Bëj që eksporti PDF dhe Print Preview i Kartelës së Furnitorit reference të ruajnë të njëjtin layout si dokumenti cloud, jo tabelë moderne

- [x] Zëvendëso simbolin Unicode ↗ në eksportin PDF me shigjetë vektoriale të dukshme dhe ruaj linkun e dokumentit

- [x] Krijo renderer dhe eksport reference për `sales_summary_register_pdf` me headerin, 16 kolonat, grupimet dhe A4 landscape të PDF-së `crshitjeregjistripermbledhes.pdf`

- [x] Përshtat `sales_quantity_total_pdf` me formatin 12-mujor horizontal të PDF-së reference dhe ruaj filtrat reale

- [x] Lidh `sales_quantity_pdf` me klientin, grupin dhe nëngrupin reale dhe ruaj totalet mujore sipas segmenteve

## Report Center Audit — Shitje sipas Sasisë
- [x] Verifiko live formën legacy të `Shitjet sipas Sasisë`: lista uppercase, filtrat e plotë, ENTER–Shiko dhe dokumenti që zëvendëson formularin.
- [x] Lidh dataset-in real me klient, grup, nëngrup, artikull dhe 12 muajt; shfaq totalet për nëngrup dhe grup.
- [x] Përshtat eksportin PDF horizontal reference për `sales_quantity_pdf` dhe korrigjo titullin e eksportit.
- [x] Korrigjo fallback-un e kodit të klientit në header kur kodi mungon.
- [x] Verifiko 213 teste të kaluara, TypeScript pa gabime dhe build production pa gabime.
- [ ] Shto segmentim të plotë shumë-klientësh në faqet e raportit nëse dataset-i real e kërkon pas auditimit të raporteve të ardhshme.
- [x] Audito raportet e mbetura të shitjeve: Artikuj të shitur, Marzhi i shitjeve dhe formatet analitike sipas PDF-ve reference.
- [x] Verifiko në browser eksportet PDF/Excel/Print dhe linket ↗ për çdo raport të shitjeve.
- [x] Vazhdo me auditimin e moduleve Magazina dhe Blerje pa prekur Pagat.

> Evidence live: raporti u hap me `sales_quantity_pdf`; pas Shiko u shfaq vetëm dokumenti horizontal me titull `SHITJET SIPAS SASISE`, periudhën 01/01/2026–31/12/2026, `Klienti: Ana`, `Grupi: Pa Grup`, `Nengrupi: Pa Nengrup`, artikullin Ferre, muajt Janar–Dhjetor dhe totalet progressive.
> Verification: `pnpm check`, `pnpm test` (59 files / 213 tests), dhe `pnpm build` kaluan më 2026-08-24.
> Payroll: nuk u ndryshua.

## Report Center Audit — Magazina dhe Blerje
- [x] Verifiko live `inventory_warehouse_status_pdf`: formulari legacy, document-only result, magazina reale, grupimet e stokut, totalet dhe toolbar-i i eksporteve.
- [x] Verifiko live `purchase_supplier_maturity_summary_pdf`: formulari legacy, document-only result, meta e maturimit, furnitorët realë, bucket-et dhe totalet.
- [x] Standardizo titujt uppercase për raportet reference të shitjeve: klientë, qytete, artikuj, kthime, lista çmimesh, parangona, marzh dhe shitje sipas artikullit.
- [x] Ruaj `__documentId` dhe `__documentType` për rreshtat agregate të raporteve të shitjeve ku ekziston faturë burimore.
- [x] Shfaq shigjetën `↗` për rreshtat agregate të lidhur me faturën burimore dhe verifikoje live te Marzhi i Shitjeve.
- [x] Shto teste regresive për titujt reference uppercase; suite-i arriti 213 teste të kaluara.
- [x] Verifiko shkarkimin fizik të PDF/Excel dhe Print Preview për të paktën një raport Shitje, Magazina dhe Blerje.
- [x] Verifiko klikimin e shigjetës `↗` nga raportet e agreguara dhe hapjen e dokumentit real për çdo modul.

## Report Center Audit — Source links të Blerjeve
- [x] Shto `__documentId`/`__documentType` te rreshtat agregate të `purchase_supplier_maturity_summary_pdf` dhe lejo kolonat `Kod Klienti`/`Emri` të hapin faturën burimore.
- [x] Verifiko live shigjetën source të Maturimit Përmbledhës dhe eksportin PDF me linkun e faturës së blerjes.

## Report Center Audit — Source links me etiketa të theksuara
- [x] Korrigjo klasifikimin e kolonave source me diakritika (`Kartelë`, `Emërtimi`) në generic PDF exporter.
- [x] Rivërteto PDF-në e Artikujve të Shitur me URL annotation dhe shëno auditimin live si të përfunduar.

## Report Center Audit — Formatet analitike të Shitjeve
- [x] Audito live `sales_discount_analysis_pdf`: formulari legacy, document-only result, rreshti real 105/Ferre/Kg, totalet, PDF/Excel/Print dhe source-link.
- [x] Verifiko PDF-në e `sales_discount_analysis_pdf`: 1 faqe A4 landscape dhe annotation `/sales-invoices?openInvoice=1`.
- [x] Audito live `sales_margin_detail_pdf`: 18 kolona, grupimet Klienti/Artikujt/Shitjet dhe marzhi real 10.
- [x] Verifiko PDF/Excel/Print dhe annotation-et source të `sales_margin_detail_pdf`.
- [x] Audito live `sales_by_product_pdf`: grupimet Klienti dhe artikulli/Volumi dhe vlera, rreshti Ana/Ferre/105 dhe totalet reale.
- [x] Verifiko PDF/Excel dhe annotation-et source të `sales_by_product_pdf`.
- [x] Audito raportin `sales_unsold_items_pdf` dhe dokumento që nuk ka source-link kur nuk ekziston dokument shitjeje.
- [x] Audito raportet `sales_by_city_pdf`, `sales_by_customer_pdf` dhe `sales_price_list_pdf` me të dhëna reale, eksportet dhe filtrat.

## Report Center Audit — Source-link i produkteve
- [x] Lidh `__documentType: product` me route reale `/products?openProduct=<id>` dhe shfaq kartelën e produktit kur hapet nga raporti.
- [x] Përfshi route-n e produktit në `buildSourceDocumentUrl` dhe verifiko annotation-et PDF të `sales_price_list_pdf`.
- [x] Shto test regresiv për URL-në e produktit dhe ruaj kompatibilitetin me invoice source links.

## Report Center Audit — Kthimet dhe regjistri analitik i Shitjeve
- [x] Lidh `sales_returns_pdf` me dialogun real të kthimit përmes `/sales-invoices?openReturn=<id>` dhe annotation PDF.
- [x] Verifiko `sales_analytic_register_pdf` me kolonat, totalet, filtrat dhe source-link-un e faturës reale.

## Report Center Audit — Kartela e Artikullit / Magazina
- [x] Lidh `stock-movement` me route reale `/inventory?openMovement=<id>` dhe hap transfertën ose inventarizimin burimor.
- [x] Verifiko annotation-et PDF të `inventory_product_card_pdf` dhe ruaj llogaritjen progresive të stokut.

## Report Center Audit — Case legacy
- [x] Standardizo titujt e kartave dhe grupet funksionale të Report Center në uppercase me tracking legacy, pa ndryshuar çelësat e raporteve.

## Report Center Audit — Hapi vijues Blerje
- [x] Audito `purchase_customs_import_register_pdf`, `purchase_supplier_card_pdf`, `purchase_supplier_maturity_pdf` dhe formatet përkatëse me filtra, eksport dhe source-link real.
- [x] Verifiko që filtrat e furnitorit, dokumentit, statusit, monedhës dhe magazinës aplikohen identikisht në dokumentin PDF reference.

## Report Center Audit — Print Preview
- [x] Përditëso source-link-et e Print Preview që të mbulojnë faturat, kthimet, produktet, lëvizjet, Pranimet dhe Kthimet e Blerjeve me route reale.
- [x] Shto test regresiv për mapping-un e source-link-eve në Print Preview.

## Report Center Audit — Titujt reference të Blerjeve
- [x] Standardizo literal uppercase titujt `purchase_*_pdf` në renderer dhe eksport pa ndryshuar çelësat e katalogut.

## Report Center Audit — Header group labels
- [x] Standardizo uppercase edhe emërtimet e grupeve të header-it në dokumentet reference, pa ndryshuar rendin ose kolonat.

## Report Center Audit — Titulli i Doganimit
- [x] Përshtat titullin reference të Regjistrit të Doganimit me emrin zyrtar `REGJISTRI I DOGANIMIT TË IMPORTEVE` të katalogut.

## Report Center Audit — Etiketa filtrash
- [x] Korrigjo etiketat e dukshme me gabime (`Queteti`, `Periudhesi`, `Si Dok. Magazine`, `e Pare/e Dyte`) dhe standardizo case-in pa ndryshuar state-in ose query-t e filtrave.

## Report Center Audit — Filtra sipas modulit
- [x] Klasifiko filtrat e formularit sipas modulit aktiv dhe mos shfaq filtrat vetëm për Shitje në raportet e Blerjeve.
- [x] Lidh lupat e kërkimit të Furnitorit, Klientit, Artikullit, Magazinës, Qytetit dhe dokumentit me kërkime reale ose hiqi kur nuk aplikohen për raportin.
- [x] Shto test regresiv që në Blerje nuk shfaqen filtrat/etiketat e Shitjeve si të përdorshme dhe që filtrat realë ndikojnë dataset-in.

## Report Center Audit — Dritare dhe filtra sipas modulit
- [x] Zgjero dritaren e raportit në desktop që lista majtas dhe titujt të duken të plotë pa prerje.
- [x] Shfaq vetëm filtrat që kanë kuptim për modulin aktiv; Blerjet duhet të përdorin Furnitor, dokument, status, monedhë, magazinë dhe periudhë, jo filtra klienti/shitësi.
- [x] Korrigjo sintaksën e JSX-it pas patch-it të filtrave dhe sigurohu që build-i të rikthehet pa gabime.
- [x] Lidh lupat me kërkime reale për partnerë, artikuj dhe magazina dhe shto testet e regresionit.

## Report Center Audit — Kthimi nga dokumenti te filtrat
- [x] Kur mbyllet dokumenti PDF i raportit, rihap formularin e filtrave të të njëjtit raport me filtrat e ruajtur dhe jo faqen e përgjithshme të raporteve.
- [x] Ruaj rezultatet e ekzekutuara dhe kontrollo që hapja/mbyllja e dokumentit të mos humbasë filtrat aktive.

## Report Center Audit — vazhdim 2026-08-24
- [x] Zgjero dritaren desktop të raporteve me width fluid dhe kufi maksimal 1680px që titujt e gjatë dhe panelet reference të mos priten.
- [x] Shfaq vetëm filtrat relevantë për modulin aktiv: klienti/grupimi i shitjeve vetëm te Shitje, furnitori vetëm te Blerje dhe kartela e artikullit te Blerje/Shitje/Magazina.
- [x] Lidh lupat e furnitorit, klientit, artikullit dhe magazinës me lookup real dhe ruaj filtrin e zgjedhur në formular.
- [x] Bëj datat e formularit legacy të kontrolluara nga state-i real, në mënyrë që filtrat të aplikohen në query dhe të ruhen gjatë kthimit nga dokumenti.
- [x] Shto raportin reference `Faturime dhe Pagesa` me burim real nga pagesat, kolonat Faturë/Pagese/Numer/Date/Pershkrimi/Faturuar/Paguar/Diferenca, totalet dhe lidhjet e burimit.
- [x] Shto titullin uppercase dhe grupet Dokumenti/Vlerat për renderer-in e raportit `Faturime dhe Pagesa`.
- [x] Verifiko 59 skedarë / 218 teste, `pnpm check` dhe integrimin e katalogut me 150 raporte.
- [x] Kryej screenshot final desktop/mobile të Blerjeve, Shitjeve, Magazines dhe Kontabilitetit dhe dokumento çdo mospërputhje të mbetur.
- [x] Kontrollo fizikisht në browser lookup-et e furnitorit, klientit, artikullit dhe magazinës me të dhëna reale të kompanisë.
- [x] Kontrollo fizikisht që `Mbyll` nga rezultati kthen në formular me filtrat e ruajtur në çdo raport reference.

## Report Center Audit — Pastrim sipas pamjes së fundit reference
- [x] Zgjero dhe ripoziciono dritaren legacy që lista e raporteve dhe kolonat e filtrave të duken të plota në desktop.
- [x] Klasifiko filtrat sipas të dhënave reale të çdo moduli dhe hiq nga UI çdo fushë placeholder ose pa ndikim në query.
- [x] Për Blerje lër vetëm dokumentin, furnitorin, artikullin, monedhën, mënyrën e pagesës kur aplikohet, magazinën dhe periudhën.
- [x] Për Shitje lër vetëm dokumentin, klientin, artikullin, monedhën, magazinën dhe periudhën; hiq fushat pa dataset real.
- [x] Për Magazina lër vetëm artikullin, magazinën, lloj dokumenti, monedhën kur aplikohet dhe periudhën.
- [x] Për Kontabilitet, CRM dhe Banka shfaq vetëm filtra të mbështetur nga dataset-et reale përkatëse.
- [x] Ruaj layout-in reference A4, uppercase labels, toolbar-in dhe rrjedhën ENTER/Mbyll pa ndryshuar Pagat.
- [x] Shto test regresiv për dukshmërinë e filtrave sipas modulit dhe verifiko `pnpm check`, testet dhe build-in.

## Report Center — Pastrim global i të dhënave reale
- [x] Audito globalisht të gjitha modulet e Raporteve dhe identifiko raportet/filtrat që nuk kanë dataset real në Sistemi Genit.
- [x] Hiq globalisht nga formularët e Raporteve çdo placeholder, select statik ose fushë që nuk ndikon në query reale.
- [x] Mbaj vetëm filtrat realë: dokument, partner sipas modulit, artikull, magazinë, status, monedhë, njësi, vlera dhe periudhë kur mbështeten nga backend-i.
- [x] Verifiko që listat e raporteve shfaqin vetëm raporte të lidhura me modulet dhe të dhënat aktive të Sistemi Genit.
- [x] Shto teste regresive për pastrimin global dhe sigurohu që Pagat të mos ndryshojë.

- [x] Verifiko në domain-in publik që formulari i Blerjeve ka vetëm filtrat realë dhe që checkbox-i/panelet placeholder janë hequr pas korrigjimit CSS.

- [x] Verifiko në domain-in publik që formulari i Magazines ka vetëm filtrat e stokut dhe nuk shfaq panelet statike të magazinës/grafikëve.

- [x] Verifiko në domain-in publik që Kontabiliteti shfaq vetëm filtrat bazë reale dhe nuk shfaq panel identifikues bosh.

- [x] Verifiko në domain-in publik që CRM shfaq vetëm filtrat bazë reale dhe nuk shfaq panel identifikues bosh.

- [x] Verifiko në domain-in publik që Banka ngarkon katalogun e vet dhe nuk merr fusha placeholder nga modulet e tjera.

## API Fetch Error — 2026-08-24
- [x] Diagnostiko dhe rregullo `TRPCClientError: Failed to fetch` në preview te faqja kryesore.
- [x] Identifiko kërkesën/procedurën që bie dhe siguro trajtim të kontrolluar të gabimit pa prishur dashboard-in ose Report Center.
- [x] Shto ose përditëso test regresiv për kërkesën problematike dhe verifiko `pnpm check`, testet dhe build-in.

## Kartela e Furnitorit — progresiv debitor/kreditor
- [x] Shfaq progresivin si saldo të vazhdueshme pas çdo rreshti të kartelës.
- [x] Shto klasifikim të qartë DEBITOR/KREDITOR sipas diferencës së debitit dhe kreditit.
- [x] Thekso me ngjyrë dhe stil të fortë rreshtin e totalit/statusit debitor ose kreditor.
- [x] Mbaj rreshtin e veçantë TOTALI I RAPORTIT me debit, kredit dhe progresiv.
- [x] Pasqyro të njëjtin dallim në PDF, Print Preview dhe Excel, me teste regresive dhe pa prekur Pagat.

## FATURIME DHE PAGESA — gabim i raportuar
- [x] Riprodho gabimin në formularin dhe dokumentin e raportit FATURIME DHE PAGESA me të dhëna reale.
- [x] Gjej dhe rregulloj shkakun në query, mapping, renderer ose eksportet e raportit.
- [x] Shto test regresiv dhe verifiko ENTER, Mbyll, Print, PDF, Excel dhe source-link-et.

## Raportet e Magazines — dataset dhe filtra
- [x] Audito të gjitha raportet e Magazines dhe gjej pse disa kthejnë të njëjtin dataset ose nuk marrin të dhëna reale.
- [x] Shto/rikthe filtrin real të Magazinës dhe aplikoje në çdo query ku magazina është pjesë e të dhënave.
- [x] Lidh hyrjet, daljet, transferimet, kostot dhe gjendjen me dokumentet reale të blerjes/shitjes/magazinës.
- [x] Ndaj renderer-in dhe kolonat sipas llojit të raportit, që raportet e ndryshme të mos shfaqin të njëjtën tabelë.
- [x] Shto teste regresive për raportet e Magazines dhe verifiko PDF/Excel/Print Preview me source-link-e.

## Bllokues — Raportet e Magazines japin të njëjtat të dhëna
- [x] Krahaso çdo çelës raporti të Magazines me degën reale të query-t dhe shëno raportet që përdorin të njëjtin dataset gabimisht.
- [x] Ndaj raportet e listës në dataset-e të veçanta sipas funksionit: stok, hyrje, dalje, lëvizje, transfertë, inventarizim, vlerësim dhe analiza.
- [x] Hiq nga katalogu raportet që nuk kanë dataset real të mbështetur, në vend që t’i lësh të kthejnë kopje të një raporti tjetër.
- [x] Shto test që çdo raport i Magazines ka kolonat dhe rezultat-transformimin e vet dhe nuk bie në fallback generic të gabuar.
- [x] Verifiko live çdo raport të mbetur me të dhënat reale të kompanisë përpara publikimit.

## Filtra sipas raportit — Magazina
- [x] Fsheh Lloj Dokumenti dhe Monedha te raportet e gjendjes së stokut që nuk i përdorin këto fusha.
- [x] Mban Monedha vetëm te raportet e vlerësimit dhe Lloj Dokumenti vetëm te raportet e lëvizjeve, transfertave, inventarizimeve dhe kartelës.
- [x] Nxjerr policy-në në helper të testueshëm dhe shton regresione për stokun sipas artikullit, vlerësimin dhe raportet e Blerjeve.

## Report Center — Pass i dytë i perfeksionimit
- [ ] Verifiko me browser çdo raport të Magazines që ka filtër real Magazinë dhe dataset të veçantë.
- [ ] Verifiko me browser raportet e Kontabilitetit dhe formatet e referencës me filtrat e tyre kontekstualë.
- [ ] Testo linket ↗ nga rreshtat e raporteve drejt dokumenteve burimore për transfertat, inventarizimet dhe lëvizjet.
- [x] Testo eksportet Print/PDF/Excel pas filtrimit dhe rrjedhën ENTER → dokument → Mbyll → formular; testet e filtrimit/eksportit kaluan dhe FATURIME DHE PAGESA u verifikua live me hapje dokumenti A4.
- [x] Shto teste regresive për çdo problem të provuar gjatë këtij auditimi.
- [x] Dokumento vetëm rezultatet e verifikuara në report-center-audit-live.md dhe ruaj checkpoint-in final pa prekur Payroll.

- [x] Pastrimi i filtrit Nr. Dokumenti nga raportet e gjendjes së Magazines; query nuk përdor më vlerë të fshehtë për këtë fushë.

- [x] PIPELINE CRM: fsheh Nr. Dokumenti, Lloj Dokumenti, Monedha dhe panelin e Shumës, sepse backend-i kthen vetëm fazat dhe metrikat e pipeline-it.

- [x] Raportet CRM të aktiviteteve (Aktivitetet, Kalendari dhe të Vonuara): hequr filtrat dokument, lloj dokumenti, monedhë dhe paneli i shumës që nuk përdoren nga backend-i.

- [x] Raportet agreguese të performancës/analizës CRM (të fituara, të humbura, vlera, parashikim, konvertime, probabilitet, faza dhe përmbledhje) nuk shfaqin më filtra dokumenti, lloj dokumenti, monedhe ose panel shume pa mbështetje reale.

- [x] Raportet bankare të llogarive, ekstrakteve, transaksioneve, pajtimit dhe transfertave fshehin filtrat dokument, lloj dokumenti, monedhë dhe panel shume kur backend-i nuk i përdor.

- [x] SHITJET SIPAS KLIENTËVE: fshehur dokumenti, lloji, monedha, shuma, klienti, kartela dhe magazina kur backend-i përdor vetëm periudhën dhe agregimin sipas klientit.

- [x] Raporti FATURAT E SHITJES: u gjenerua me faturën reale TEST-SH-OUT-20260823, shigjeta ↗ hapi dokumentin A4 dhe Mbyll riktheu regjistrin e Shitjeve.
- [x] Report Center Pass 2: kolona reale “Numer” në FATURIME DHE PAGESA shfaq linkun ↗ drejt faturës burimore; u verifikua live filtrimi Ferre Geni, hapja e faturës dhe kthimi me Mbyll te regjistri.
- [x] Source links global: purchase receipts dhe purchase returns hapin dokumentin konkret me ID, jo vetëm tab-in e modulit; u shtuan openReceipt/openReturn, dialogët detail, klikimi manual dhe testet e URL-ve. Auditimi live i këtyre dy llojeve mbetet i kufizuar sepse kompania aktive ka 0 receipts/returns.
- [x] Audit i ri: policy-ja e filtrave për Kontabilitetin tani fsheh placeholder-at dhe ruan vetëm datën kur dataset-i e përdor; Bilanci i Provës u verifikua live.

## Bug i raportuar — Artikujt / Kartela e Artikullit
- [x] Riprodho në browser klikimin e Veprimeve dhe X te Kartela e Artikullit; crash-i u identifikua dhe u dokumentua.
- [x] Rregullo që Veprime të hapë Edito/Fshi dhe X/Mbyll të çlirojë dialogun e tabelën; fshirja ruan kontrollin e referencave.
- [x] Shto regresione për parsing-un e Kartelës dhe fshirjen e sigurt, verifiko live pa prekur Payroll.

## Bug i raportuar — Vite WebSocket preview
- [x] Diagnostiko dhe rregullo dështimin `vite: failed to connect to websocket`: ishte lidhje transient gjatë ciklit të dev serverit; serveri u rinis, konfigurimi ekzistues `hmr: false`/heqja e `@vite/client` u konfirmua dhe preview u rikthye pa ndryshuar Payroll ose të dhënat.
- [x] Verifiko rikuperimin e preview-së me restart, browser console pa output gabimi, `pnpm test` 234/234 dhe `pnpm build` production; preview ngarkohet normalisht.

## Bug përsëritës — Vite WebSocket injektohet në preview
- [ ] Gjurmo dhe elimino burimin e `@vite/client`/tentativës WebSocket që mbetet në HTML-in e preview-së.
- [ ] Shto regresion për HTML-in e preview-së dhe verifiko pa gabime pas restart-it, testit dhe build-it.

## Bug i përsëritur — Artikujt / Aksione
- [x] Riprodho në browser që butonat Edito dhe Fshi në kolonën Aksione nuk kryejnë veprimin real; u verifikua se problemi ishte targeti shumë i vogël dhe mungesa e feedback-ut të dukshëm.
- [x] Rregullo lidhjen e klikimit me dialogët dhe mutation-et product.update/product.delete; handler-at, dialogët dhe feedback-u janë të lidhur me artikullin e zgjedhur.
- [x] Verifiko live ruajtjen e editimit dhe fshirjen e sigurt, me regresione dhe pa prekur Payroll; u konfirmua ruajtja pa ndryshim e Gg, hapja e Fshi dhe kthimi me Anulo.

## Përmirësim UX — Paneli i filtrave të raporteve
- [ ] Pas klikimit Shfaq/Enter, fshih automatikisht panelin e filtrave ndërsa ruaj vlerat e aplikuara.
- [ ] Shfaq butonin Shfaq filtrat për rikthimin e panelit pa humbur filtrat.
- [ ] Shto regresion dhe verifiko live aplikimin, fshehjen dhe rikthimin e panelit.

## Përmirësim UX — Filtra sipas kolonave në regjistrin e blerjeve
- [x] Shto buton Fshih/Shfaq për panelin “Filtra sipas kolonave” në regjistrin e faturave të blerjes; butonat janë të dukshëm dhe të aksesueshëm.
- [x] Pas aplikimit të filtrave me Shfaq, paneli fshihet duke ruajtur filtrin dhe rikthehet me “Shfaq filtrat (1)”.
- [x] Shto regresion dhe verifiko live filtrimin, fshehjen dhe rikthimin; Ferre Geni u filtrua me 2 rreshta dhe 200.00 L pa humbur të dhëna.

## Shitjet — workbook 2026
- [x] Analizo sheet-in FATURAT 2026 si bazë dokumentare dhe nda saktë blerjet nga shitjet vendase/eksport; u verifikua se FATURAT 2026 janë blerje nga fermerët, ndërsa shitjet janë në dy sheet-et e shitjeve.
- [x] Përcakto hartën e kolonave dhe rrjedhën e faturave të shitjes në `sales-flow-spec.md`, me ndarje vendase/eksport, grupim sipas faturës, TVSH, kurs dhe stok.
- [ ] Ndërto importin/rrjedhën e shitjeve vendase dhe eksportit me klient, artikull, magazinë, monedhë, kurs, TVSH dhe pagesë.
- [ ] Verifiko grupimin sipas numrit të faturës, totalet, stokun, raportet dhe linket burimore me teste reale të workbook-ut.

- [ ] Shitje: verifiko dhe zgjidh dy rreshtat me data të pavlefshme në workbook-un 2026 që aktualisht bllokojnë importin, pa prishur parimin e validimit dhe pa importuar rreshta të korruptuar.
- [ ] Shitje: pas importit të suksesshëm verifiko lidhjen me klientët/artikujt, daljet e stokut, raportet financiare dhe metadata e faturave EXPORT.
- [x] Shitje: bëj input-in e workbook-ut të dukshëm dhe të kapshëm në browser për testim live të importit.

- [x] Shitje: rindërto regjistrin kryesor si tabelë Excel-like përpara workflow-t të faturës, me kolonat reale, filtra në çdo kolonë, renditje, total dhe eksport; u verifikua live me faturë reale, filtër Klienti: Ana, eksport dhe link ↗ A4.
- [ ] Shitje: përshtat rrjedhën faturë → magazinë → dalje stoku → pagesë → raporte sipas rrjedhës së Blerjeve, me lidhje burimore dhe dokument A4.

- [x] Shitje: korrigjo deduplikimin e importBatch që faturat me të njëjtin numër por data/format të ndryshëm të mos humbin; përdor identitet burimor të qëndrueshëm dhe numërim unik dokumenti. Parseri real nxjerr 76 fatura pa gabime dhe invoice 540 ka 6 rreshta me datën 15/07/2026.
- [ ] Shitje: audito pas importit real diferencën 84 preview kundrejt dokumenteve të ruajtura dhe parandalo riimportin e të njëjtit burim.

- [ ] Shitje: krijo template të veçantë A4 Portrait për faturat `EXPORT`, me layout-in e invoice-it referencë dhe jo me formatin vendas.
- [ ] Shitje: shfaq te invoice EXPORT monedhën EUR, kursin, shtetin, deklaratën doganore dhe metadata-t e eksportit në vendet e sakta të dokumentit.
- [ ] Shitje: verifiko live që shigjeta ↗ e një fature të huaj hap template-in EXPORT dhe jo template-in vendas.

- [ ] Shitje: bëj filtrin e klientit Excel-like duke bashkuar klientët nga master-data me të gjithë emrat unikë të regjistrit real, përfshirë klientët e importuar pa kartelë.
- [ ] Shitje: shto regresion dhe verifiko live që klientë si BUMI SHPK, NATYRAL ATC, DARY NATURE dhe NUTRECO shfaqen në filtrin e klientit dhe filtrojnë rreshtat përkatës.

- [x] Referencë EXPORT: identifiko foton/invoice-in e huaj të dërguar nga përdoruesi, jo `fatura_4319.pdf` vendase. U konfirmua BioBes Export Invoice nr. 686/2026 nga fotografia e dërguar.
- [ ] Referencë ngarkese: identifiko dhe regjistro dokumentin CMR për integrim të mëvonshëm me eksportin dhe arkivin e ngarkesës.

- [ ] Referencë EXPORT: hap dhe identifiko nga fotot e dërguara invoice-in në anglisht që përdoruesi kërkon si model.
- [ ] Referencë CMR: hap dhe identifiko faqen/dokumentin CMR real të dërguar në fotot e ngarkuara.

- [ ] Shitje: audito të gjitha raportet e modulit kundrejt faturave reale të importuara dhe hiq rezultatet e përsëritura ose statike.
- [ ] Shitje: lidh raportet analitike, përmbledhëse, sipas klientit/artikullit, faturime-pagesa dhe marzhin me rreshtat reale të faturave.
- [ ] Shitje: shto linkun ↗ te fatura burimore në çdo raport shitjeje dhe zbato filtrat e klientit, artikullit, magazinës, datës, monedhës dhe statusit.
- [ ] Shitje: përdor modelin e dhënë BioBes `Invoice number: 686/2026` për template-in EXPORT, përfshirë koston e paletave, loading cost dhe totalin EUR.

- [x] Shitje: riparo faturat e importuara pjesërisht 140, 195 dhe 540 duke plotësuar rreshtat dhe datën bazë vetëm kur nuk kanë dalje stoku, pa fshirë dokumente të postuara.
- [x] Shitje: bëj riparimin idempotent dhe kontrollo që riimporti i workbook-ut të mos krijojë faturë të dytë ose dalje të dyfishtë.

- [ ] Shitje: audit fund-më-fund i rrjedhës faturë → dalje stoku → kosto → raporte Magazine.
- [ ] Shitje: verifiko që postimi i faturës krijon dalje stoku vetëm një herë dhe anulimi e rikthen saktë.
- [ ] Shitje: korrigjo raportet e Magazinës që të përdorin filtrin real të magazinës dhe të dhënat e faturave të shitjes.
- [ ] Shitje: verifiko të 36 raportet e shitjes me të dhëna reale, totalet, filtrat dhe linkun burimor.
- [ ] Shitje: kryej kontrollin final vizual të faturës BioBes EXPORT A4 dhe dokumento çfarë mbetet.

- [x] Shitje: importi i workbook-ut tani sinkronizon automatikisht artikujt me master-data dhe krijon daljet reale të Magazinës për faturat e postuara.
- [x] Shitje: u verifikuan 39 invoice të importuara, 161 rreshta të lidhur me artikuj dhe 161 dalje stoku pa dublikime; faturat 140, 195 dhe 540 kanë përkatësisht 7, 4 dhe 6 rreshta.

- [x] Shitje: korrigjo hapjen nga regjistri/raportet që faturat EXPORT të përdorin renderer-in BioBes EXPORT dhe jo faturën vendase.
- [x] Shitje: shto regresion për routing-un e template-it DOMESTIC kundrejt EXPORT dhe verifiko linkun ↗.

- [x] Shitje: korrigjo kolonat e Regjistrit Përmbledhës që Klienti/Kodi i klientit, Nr. faturës dhe Vlera e faturës të mos zhvendosen ose përzihen.
- [x] Shitje: shto test regresiv me klient real, kod klienti, numër dokumenti dhe vlera neto/TVSH/bruto në Regjistrin Përmbledhës.

- [x] Shitje: shto kuadrim për çdo faturë dhe rresht me neto, TVSH, bruto, monedhë, kurs dhe ekuivalent në Lek.
- [x] Shitje: shfaq status të dukshëm RAKORDUAR / NUK RAKORDUAR me diferencën e dokumentit dhe rreshtave.
- [x] Shitje: shto kuadro për totalin e faturave, sasinë, neton, TVSH-në, bruto dhe vlerën bazë në Regjistrin Përmbledhës.
- [x] Shitje: shto teste që dështojnë kur kolonat ose totalet zhvendosen.

- [ ] Shitje: thjeshto Regjistrin Përmbledhës në layout Excel-like me kolonat fikse Klient/Kod, Faturë, Artikull, Sasi, Neto, TVSH, Bruto dhe Lek.
- [ ] Shitje: hiq nga ky raport grupimet/fushat që nuk lidhen me të dhënat reale dhe lër vetëm kuadrimin e dokumentit.

- [x] Shitje: ristrukturo Regjistrin Përmbledhës sipas kontratës burimore Excel/PDF, me klientin, kodin, dokumentin dhe kuadrimin në fusha të ndara.

- [x] Shitje: rikthe Regjistrin Përmbledhës dhe raportet e shitjeve te layout-i/grupimi i PDF-ve burimore, jo te një layout i shpikur.
- [ ] Shitje: mos ndrysho kontratën e PDF-së pa krahasim të drejtpërdrejtë me materialin referencë dhe të dhënat reale.

- [x] Shitje: raporti agregues sipas klientit tani grupon me customerId dhe shfaq kodin plus emrin, pa bashkuar klientë të ndryshëm me të njëjtin emër.
- [x] Shitje: shto test për grupimin me ID të ndryshme dhe klientë pa ID; kaluan 256 teste.

- [x] Shitje: implemento transformimin real të Pasqyrës së Klientit, që të mos bjerë te raporti gjenerik dhe të shfaqë klientin, faturat dhe të ardhurat reale.

- [x] Shitje/Raporte: korrigjo kërkimin e klientit që të shfaqë klientët realë nga databaza dhe të aplikojë filtrin në query.
- [ ] Shitje/Raporte: rregullo modalin e kërkimit të klientit në mobile që të mos lërë faqe gri dhe të kthehet saktë te dritarja e raportit.
- [x] Shitje/Raporte: shto regresion për klient real, kërkim me emër/kod dhe aplikim filtri në rezultat.

- [x] Shitje: kur klikohet numri/shigjeta e një fature EXPORT nga raporti ose regjistri, hap BioBes EXPORT Invoice dhe jo template-in vendas.
- [x] Shitje: shto regresion për openDocument me invoiceFormat EXPORT dhe DOMESTIC nga raporti.

- [ ] Shitje: përputh Invoice EXPORT me foton referente në A4 portrait, duke rregulluar header-in, blloqet, tabelën e mallrave, totalet dhe footer-in.
- [ ] Shitje: verifiko që fushat reale të faturës 540 dhe eksportet PDF/Print përdorin të njëjtin layout si preview.
- [x] Shitje: shto regresion për strukturën e Invoice EXPORT dhe dimensionet A4 portrait.

- [ ] Shitje: mos prano layout të ngjashëm; Invoice EXPORT duhet të jetë 1:1 me foton referente në pozicionim, kufij, tipografi, hapësira dhe renditje.

- [x] Shitje: korrigjo dashboard-in dhe regjistrat që klientët realë të faturave të shitjes të mos shfaqen të gjithë si “Ana”.
- [x] Shitje: shto regresion që dy invoice me customerId/customerName të ndryshëm të shfaqin partnerët e saktë.
- [ ] Finalizo kopjen vizuale 1:1 të BioBes EXPORT Invoice sipas fotos/PDF-së referencë: A4 portrait, header, fusha metadata, tabelë, totals, bankë, footer dhe hapësirat.
- [ ] Verifiko PDF/print preview me faturën reale EXPORT 540 dhe kontrollo që invoice vendase të mbetet në template-in e saj.
- [x] Përdor foton reale të BioBes Invoice 686/2026 si reference autoritative dhe kopjo 1:1 header-in, pozicionet, tabelën, totalet, bankën, stampën/firmën dhe footer-in në template-in EXPORT.
- [ ] Lidh të dhënat reale të invoice 540 me strukturën e foton 686/2026 dhe verifiko njësoj preview/PDF/print/Excel pa ndryshuar faturën vendase.
- [ ] Analizo Manualin e Kontabilitetit Alpha dhe nxirr hartën e moduleve, dokumenteve, regjistrave, raporteve, filtrave dhe rrjedhave që duhet të kopjohen në cloud.
- [ ] Krahaso Shitjet dhe Magazina aktuale me Manualin Alpha; dokumento boshllëqet funksionale dhe vizuale pa prekur modulin e Pagave.
- [ ] Zbato nga Manuali Alpha rrjedhat prioritare të shitjes, magazinës, klientëve/furnitorëve dhe raporteve me të dhëna reale.
- [ ] Inventarizo DOC-20260824-WA0032.pdf si referencë vizuale e drejtpërdrejtë për format, toolbar, regjistra dhe dritare të Kontabilitetit Alpha.
- [ ] Ndërto hartën Alpha → Cloud për çdo ekran dokumenti/raporti të prioritetit Shitje dhe Magazina, me përputhje 1:1 të formës dhe rrjedhës.
- [ ] Ndërto Sistemi Genit Cloud si variant cloud multi-user/multi-company i Kontabilitetit Alpha, duke përdorur playlist-in, manualin dhe dokumentet referencë si specifikim të detyrueshëm.
- [ ] Fillimisht rindërto sipas Alpha format e Shitjeve dhe Magazinës, bashkë me toolbar-et, filtrat, regjistrat, dokumentet, postimin dhe raportet; moduli Pagat mbetet i paprekur.
- [ ] Ndjek videot Alpha Platinum nga fillimi dhe dokumentoj rendin e ekraneve si backlog i detyrueshëm për cloud.
- [ ] Rindërto fillimisht ambientin kryesor/navigimin Alpha, pastaj format e Shitjes dhe Magazinës në të njëjtin rend të videos; mos vendos pamje ose kontrolla jashtë referencës.
- [ ] Inventarizo të 13 videot e playlist-it Alpha Platinum në një backlog të plotë: konfigurime, skedarë, shitje, blerje, inventar, likuiditete, prodhim, aktive, qendra kostoje, import/eksport, raporte dhe mbyllje viti.
- [ ] Rindërto çdo modul cloud sipas videos përkatëse të Alpha, me pamje, toolbar, forma, lookup, regjistra, filtra dhe raporte reale; Pagat nuk preken.
- [ ] Arrij paritet vizual dhe funksional ekran më ekran me Alpha: menu, toolbar, lookup, forma, grila, regjistra, filtra, dokumente dhe raporte, duke mbajtur vetëm shtesat cloud multi-user/multi-company.
- [x] Rindërto pamjen e modulit kryesor Alpha Platinum Business nga playlist-i: menuja kryesore, panelet, ikonat, toolbar-i, status bar dhe renditja e moduleve para formave të brendshme.
- [x] Përfundo vetëm menunë Skedar sipas videos Alpha: dropdown klasik, nënmenu, veprime reale dhe test desktop/mobile; mos vazhdo në module të tjera pa verifikimin e përdoruesit.
- [x] Menuja Skedar: shto Import/Export me dialog dhe veprime reale për eksportim dokumentesh/raportesh dhe orientim për importet ekzistuese, plus ikona dhe shkurtore tastiere për veprimet kryesore.
- [x] Menuja Skedar: kryej krahasim literal me videon për rendin, etiketat, ikonat, ndarëset, dimensionet, hover-in, nënmenunë dhe dialogët; hiq çdo element që nuk shfaqet në video para raportimit.
- [x] Rianalizo dhe rindërto vetëm Njësi Administrative nga Skedar sipas videos Alpha: ekranin e hapjes, toolbar-in, grilën, filtrat dhe veprimet reale; mos kaloni te nënmenu tjetër pa verifikimin e përdoruesit.
- [x] Bëj auditin sekondë pas sekonde të gjithë rrjedhës Skedar në videon Alpha dhe korrigjo vetëm mospërputhjet e menusë, nënmenuve dhe dialogëve të saj përpara aprovimit të përdoruesit.
- [x] Analizo Skedar → Magazina në video dhe manual; dalloni funksionin e saj nga Njësi Administrative dhe Lokacionet para çdo ndryshimi në cloud.
- [x] Rianalizo dhe korrigjo gjithë Skedar sipas videos së saktë: përfshi Qytete, Njësi Likujdimi/Arka-Banka dhe çdo rresht/nënmenu të munguar; hiq etiketat e gabuara të vendosura nga auditimi i mëparshëm.
- [x] Verifiko rendin dhe nënmenutë e Skedar kundrejt playlist-it të sapodërguar nga përdoruesi përpara se menuja të hapet sërish për aprovim.
- [x] Përputh ikonat, ndarëset, hover-in dhe dimensionet e Skedar me videon Administrimi menusë Skedarë; hap dritaret funksionale të Arka dhe Banka nga Njësi Likujdimi.
- [x] Rindërto formatin e dritares Lista e Arka/Banka sipas videos: kanavacë desktopi me përmasa, titlebar, toolbar, kërkim dhe grilë në të njëjtën kompozim; mos e lër si faqe cloud e zakonshme.
- [x] Implemento funksionet reale të Lista e Arka/Banka nga videoja/manuali: Shto, Modifiko, Fshi me kontroll përdorimi, Kërko, Printo, Rifresko dhe Mbyll, të lidhura me llogaritë cloud.
- [ ] NË PRITJE TË AUTORIZIMIT: mos prek, mos testo dhe mos rikthe modulin Pagat pa urdhër të ri e të shprehur nga përdoruesi.
- [x] Verifiko vetëm funksionet e Skedar sipas videos dhe manualit; mos hap, mos testo dhe mos ndrysho Pagat.
- [x] Skedar → Grup & Njësi Artikulli → Njësi Matje: hap dritaren reale të njësive të matjes (p.sh. Kg, Copë) dhe lidhe me artikujt, pa prekur Pagat.
- [x] Rregullo gabimin Vite WebSocket “failed to connect / WebSocket closed without opened” dhe verifiko preview-n; serveri u rinis dhe preview ngarkohet, pa prekur modulin Pagat.
- [x] Kontrollo dhe rikthe vetëm shfaqjen e hyrjes Pagat në navigim; hyrja dhe rruga /payroll u verifikuan, pa ndryshuar ekranin, funksionet ose të dhënat e Pagave.
- [x] Pas përfundimit dhe aprovimit të Skedar, audito dhe ndërto Konfigurime sipas videos/manualit; moduli Pagat mbetet i bllokuar pa prekje.
- [x] Ndiq videon Alpha Platinum Business sekondë pas sekonde për Konfigurime dhe regjistro rendin e dritareve, fushave, ikonave dhe komandave; mos prek Pagat.
- [ ] Krahaso Konfigurimet live me videon dhe implemento vetëm dallimet e konfirmuara, me testim dhe checkpoint.
- [x] Analizo në video formatet konkrete të dokumenteve dhe dritaret e parametrave të tyre në Konfigurime.
- [x] Ndërto formatet e dokumenteve me pamje/fusha/rend/butona sipas videos dhe lidhi me të dhënat reale, pa prekur Pagat.
- [x] Diagnostiko gabimin Vite WebSocket closed without opened në preview dhe kontrollo log-et e serverit.
- [x] Rregullo stabilitetin e dev serverit/WebSocket dhe verifiko që preview ngarkohet pa gabim, pa prekur Pagat.
- [x] Inventarizo formatet Alpha të Artikujve dhe katalogëve në Konfigurime: fushat, toolbar-i, kolonat, kërkimi, ruajtja dhe mbyllja.
- [x] Ndërto dritare reale Alpha për Artikuj, Klientë, Furnitorë, Emetues, Qendër Kostoje dhe Grupim Dokumentash, me të dhëna të kompanisë aktive dhe pa prekur Pagat.
- [x] Përfundo ciklin 100% të Konfigurimeve sipas videos: menu, forma, modele, layout Alpha dhe toolbar për çdo katalog.
- [x] Lidh funksionet reale CRUD, kërkim/filtra, ruajtje multi-company, print dhe eksport për katalogët e Konfigurimeve; mos prek Pagat.
- [x] Kontrollo videon kornizë pas kornize dhe dokumento diferencat reale të çdo dritareje Konfigurimesh.
- [x] Krahaso screenshot-et e videos me preview-n live dhe korrigjo vetëm dallimet e konfirmuara; mos prek Pagat.
- [x] Analizo me kujdes formën e krijimit të Artikullit në videon Alpha: seksionet, rendi i fushave, tabs, modeli, toolbar-i dhe butonat.
- [x] Rindërto formën Artikull me layout/fusha/funksione reale sipas videos dhe verifiko ruajtjen pa prekur Pagat.
- [x] Analizo në video rrjedhën dhe fushat e krijimit për Artikull Qarkullues, Artikull Afatgjatë, Klient dhe Furnitor.
- [x] Ndërto forma të ndara Alpha për këto modele, me tabs/fusha/toolbar sipas videos dhe pa prekur Pagat.
- [x] Lidh ruajtjen, ndryshimin, fshirjen, dokumentet dhe filtrat e modeleve me kompaninë aktive.
- [x] Rindërto format e krijimit/editimit të Klientit dhe Furnitorit me titlebar, seksione dhe rend fushash Alpha.
- [x] Lidh format e partnerëve me ruajtje reale dhe verifiko izolimin sipas kompanisë aktive.
- [x] Verifiko që moduli Pagat dhe skedarët e tij nuk janë prekur nga cikli i formularëve.
- [x] Shitje: mos krijo dalje stoku gjatë ruajtjes së faturës Draft; aplikoje vetëm në POSTED/PAID dhe ruaj idempotencën.
- [x] Shitje: shto lookup-e/datalist reale për magazinë, artikull dhe kod artikulli në filtrat e regjistrit.
- [x] Shto test regresiv për filtrat reale të Raportit të Magazinës dhe parametrat warehouseId/productId.
- [x] Shitje: kur fatura Draft paguhet, kaloje në PAID dhe krijo daljen e stokut një herë.
- [ ] Shitje/Magazinë: audito dhe korrigjo dublikatat ekzistuese të daljeve të importuara pa fshirë dokumente pa konfirmim.
- [ ] Rishiko nga videoja mënyrën e saktë si hapet modeli i Klientit dhe Furnitorit, jo vetëm dialogun e krijimit.
- [ ] Korrigjo layout-in, seksionet, rendin e fushave, lookup-et dhe toolbar-in e modelit Klient/Furnitor sipas videos.
- [ ] Verifiko hapjen nga lista, editimin dhe ruajtjen reale të Klientit/Furnitorit pa prekur Pagat.
- [x] Kontrollo manualin PDF të ngarkuar për pamjen reale të modelit Klient/Furnitor.
- [x] Verifiko në Modulin e Shitjeve butonin e lupës, lookup-un dhe rrugën `Cil Llogari te re`.
- [ ] Rindërto modelin Klient/Furnitor vetëm pasi të konfirmohen pamjet/fushat nga manuali ose burimi i saktë.
- [x] Zbato rregullin global: manuali PDF është burimi autoritativ për pamje, layout, rend fushash dhe mënyrë hapjeje.
- [x] Zbato rregullin global: videot janë burimi autoritativ për rrjedhën operative dhe mënyrën e punës në çdo modul jo-Pagat.
- [ ] Rishiko modulet e implementuara kundrejt kësaj hierarkie dhe mos pretendo 1:1 kur manuali ose videoja nuk e dokumenton pamjen.
- [ ] Korrigjo faqen `/sales-invoices`: regjistri aktual është ende layout modern, duhet dritare/regjistër Alpha sipas manualit PDF dhe rrjedhës së videos.
- [ ] Sigurohu që forma e faturës së re dhe lookup-u i partnerit hapen me pamjen Alpha të manualit, jo me modal modern.
- [ ] Audit manualin PDF për layout-in e regjistrit dhe modalëve të Shitjeve.
- [ ] Kthe regjistrin `/sales-invoices` në dritare Alpha me toolbar dhe densitet sipas manualit.
- [ ] Unifiko modalët e ofertës, porosisë, dërgesës, kthimit dhe faturës me stilin e manualit, pa prishur rrjedhën reale.
- [x] Verifiko testet, preview-n live dhe që Pagat nuk ka ndryshime.
- [x] Krahaso me manualin PDF dhe dokumento dritaren reale të Artikullit Qarkullues/Afatgjatë.
- [x] Rindërto Artikullin me tab-e, rend fushash dhe toolbar real Alpha, jo vetëm me seksione të stilizuara.
- [x] Krahaso me manualin PDF dhe dokumento dritaren reale të Klientit/Furnitorit.
- [x] Rindërto Klientin dhe Furnitorin me tab-e, rend fushash dhe toolbar real Alpha, jo vetëm me dialog të përgjithshëm.
- [x] Verifiko hapjen nga listat dhe ruajtjen e të gjitha fushave pa prekur Pagat.

## Vazhdim — Regjistri i Shitjeve dhe integriteti i stokut
- [x] Përfundo layout-in 1:1 Alpha të regjistrit /sales-invoices me toolbar, grid të dendur dhe header dokumenti.
- [x] Verifiko që filtrat, kërkimi, renditja dhe lidhjet e dokumenteve në regjistrin e Shitjeve përdorin të dhënat reale të kompanisë.
- [x] Audit dublikatat e lëvizjeve të stokut për faturat e importuara dhe përcakto burimin e saktë të çdo lëvizjeje.
- [x] Korrigjo llogaritjen e stokut që faturat Draft të mos ndikojnë dhe faturat e postuara/të paguara të ndikojnë vetëm një herë.
- [x] Verifiko veprimet Posto, Anulo dhe Paguaj në Shitje me statusin e dokumentit dhe lëvizjet e magazinës.
- [x] Shkruaj dhe ekzekuto testet regresive për regjistrin e Shitjeve, filtrat dhe idempotencën e stokut.
- [x] Kryej audit vizual të regjistrit dhe modalëve të Shitjeve në desktop dhe shëno vetëm gjërat e verifikuara si të përfunduara.
- [x] Ruaj checkpoint pas kalimit të TypeScript, testeve dhe verifikimit live të Shitjeve.

## Vazhdim — Raportet operative Alpha
- [x] Audit faqen e raporteve të Shitjeve dhe dialogun e filtrave sipas të dhënave reale.
- [x] Audit faqen e raporteve të Blerjeve dhe përputhjen e partnerit, magazinës, artikullit, monedhës dhe kursit.
- [x] Verifiko që çdo rresht dokumenti në raporte ka shigjetën/linkun e hapjes te burimi.
- [x] Verifiko eksportet Excel/PDF me filtrat e aplikuar dhe totalet përmbledhëse.
- [x] Shto teste regresive për filtrat e raporteve dhe target-et e dokumenteve.
- [x] Verifiko live raportet në desktop dhe ruaj checkpoint pas testimit.

## Vazhdim — Raportet e Magazinës
- [x] Audit raportet e Magazinës me filtër real Magazine, Artikull dhe datë.
- [x] Verifiko që raportet e stokut shfaqin koston, hyrjet, daljet dhe gjendjen nga lëvizjet reale.
- [x] Kontrollo që filtrat nuk japin të njëjtën përmbajtje për raporte me baza të ndryshme.
- [x] Verifiko linkun e dokumentit burim në raportet e lëvizjeve të stokut.
- [x] Shto test regresiv për warehouseId/productId dhe totalet e raporteve të Magazinës.
- [x] Verifiko live raportet e Magazinës dhe ruaj checkpoint pas testimit.
- [x] Korrigjo metadata-n e magazinave të grupuara në raportet operative dhe mbuloje me test regresiv.
- [x] Mbulim regresiv për quick-create të artikullit: ID, emri, njësia dhe çmimi normalizohen pa humbur rreshtin aktiv.
- [x] Korrigjo route-n e Partnerëve që `?type=customer` të hapë realisht Klientët dhe `?type=supplier` Furnitorët, edhe në viewport mobile.
- [x] Shto test regresiv për përzgjedhjen e workspace-it të Partnerëve nga query-parametri.
- [x] Shto test komponenti/integrimi për Blerje dhe Shitje që hap “+ Shto” dhe verifikon ruajtjen e rreshtave ekzistues, sasive, çmimeve dhe fushave aktive.
- [x] Verifiko live në browser rrjedhën “+ Shto” brenda një dokumenti real Blerje/Shitje dhe dokumento ruajtjen e formularit aktiv.
- [x] Hap dhe verifiko individualisht nga navigimi kryesor dhe menuja mobile: Artikuj, Magazina, Klientë, Furnitorë, Shoferë, Mjete, Ngarkesa, Formularë peshe, Blerje, Shitje, Raporte, Arkë/Banka, Kontabilitet dhe CRM.
- [x] Ruaj evidencë të verifikueshme për secilin modul me route/pamje, shell korrekt, pa error dhe navigim kthimi.
- [x] Shto sortim Alpha për kolonat Kodi, Emri, Stoku dhe Çmimi Mesatar në listën e Artikujve, pa prishur edit/fshi dhe eksportin e filtruar.
- [x] Shto test regresiv për renditjen stabile të listës së Artikujve.

## Kërkesë e re — Konfigurimi 1:1 sipas videos
- [x] Rishiko videot e konfigurimit dhe nxirr listën reale të nënmenuve Alpha: Njësi Matjeje, Qytete, Njësi Administrative, Arka, Banka, Magazina, Llogari, Ditare dhe katalogë të tjerë të shfaqur.
- [x] Krahaso çdo nënmenu me route-n dhe dritaren aktuale të Konfigurimeve; hiq placeholder-at që nuk janë në video dhe ruaj vetëm funksionet reale.
- [x] Rindërto menunë Konfigurime me hierarki, ikona, titlebar, toolbar, fusha dhe butona në të njëjtin rend si video/manuali.
- [x] Lidh çdo nënmenu me CRUD real, Live Search dhe dialogun e duhur pa dropdown-e të panevojshme.
- [x] Verifiko secilën dritare në preview desktop/mobile dhe konfirmo që `/payroll` nuk është prekur.
- [x] Harmonizo panelin anësor të Konfigurimeve me katalogët realë të AlphaConfigMenu: Artikuj, Çmime Shitjeje, Zbritje Analitike, Klientë, Furnitorë, Emetuesit, Qendra e Kostos dhe Grupim Dokumentash.
- [x] Verifikim final i Konfigurimeve: `pnpm check`, testet e route-ve, preview desktop/mobile dhe `git diff` pa skedarë Pagash.
- [x] Standardizo “+ Shto” me kërkim Live Search për magazina, lokacione, llogari, ditarë, banka dhe entitete CRM jashtë faturave.
- [x] Verifiko në desktop dhe mobile quick-create global pa humbur të dhënat e formularit aktiv dhe pa prekur Pagat.
- [x] Shto Live Search dhe “+ Shto” për llogaritë dhe ditarët në regjistrimin kontabël, me ruajtje dhe përzgjedhje të rekordit të ri.
- [x] Zëvendëso dropdown-in e artikullit në Transferet dhe Inventarizimet e Magazina me Live Search dhe “+ Shto artikull”, duke ruajtur rreshtin aktiv.
- [x] Krahaso formën e krijimit të Artikujve me PDF/manualin Alpha: titlebar, toolbar, tab-et, rendi i fushave, validimi dhe CRUD.
- [x] Krahaso formën e krijimit të Klientëve dhe Furnitorëve me PDF/manualin Alpha: tab-et, fushat, lidhjet dhe CRUD.
- [x] Verifiko vizualisht format e Artikujve, Klientëve dhe Furnitorëve në desktop/mobile dhe dokumento mospërputhjet para kalimit te Regjistrimet.
- [x] Përshtat formën Klient/Furnitor sipas screenshot-it të ri Alpha: titlebar `Ndrysho Klient/Furnitor`, toolbar Mbyll/Ruaj/Dok/Ndihmë, tab-e reale dhe layout dy-kolonësh.
- [x] Shto fushat Alpha të `Të Përgjithshme`: Kodi, Lloji, Titulli, Ndërmarrja, NIPT, Emri, Mbiemri, Kategoritë 1–3, Nivel Çmimi, Aktiv dhe I Modifikueshëm.
- [x] Shto fushat Alpha të `Kontabilitetit`: Llogaria Kontabel me lupë/monedhë, Llogari Zbritje me lupë, gjendje fillestare, koment, kurs, vlerë në monedhë bazë dhe datë.
- [x] Verifiko që format e Artikullit dhe Partnerit shfaqen si forma të plota Alpha para kalimit te Regjistrimet.
- [x] Ktheji dialogët e krijimit dhe editimit të Klientit/Furnitorit në workspace full-screen Alpha, jo modal të vogël mbi listë.
- [x] Verifiko që toolbar-i, tab-et, CRUD dhe scroll-i i brendshëm punojnë në full-screen desktop dhe mobile pa prekur Pagat.
- [x] Audito shell-in e Regjistrimeve sipas screenshot-it Alpha: menu, sidebar, breadcrumb, procese, regjistra, raporte dhe toolbar.
- [x] Ndërto regjistrat realë të Regjistrimeve me filtra, total, sortim dhe link dokumenti.
- [x] Lidh hapjen e dokumenteve me formatet full-screen A4/Alpha dhe veprimet reale CRUD/postim.
- [x] Verifiko Regjistrimet në desktop/mobile me të dhëna reale, pa prekur Pagat.
- [x] Auditimi i Regjistrimeve: përcakto regjistrat reale për shitje, blerje, magazinë, pagesa dhe kontabilitet.
- [x] Ndërto workspace Alpha të Regjistrimeve me regjistra realë dhe navigim të drejtpërdrejtë.
- [x] Shto filtrat, totalet, sortimin dhe linket e klikueshme drejt dokumenteve burim.
- [x] Verifiko hapjen full-screen, CRUD/postimin, desktop/mobile dhe izolimin e Pagave.
- [x] Ribëj testin end-to-end të çdo karte Regjistrimesh: Shitje, Blerje, Magazina, Kontabilitet, Pagesa dhe Arkivë.
- [x] Verifiko klikimin e shigjetës/numrit, hapjen e dokumentit real, mbylljen dhe kthimin te Regjistrimet.
- [ ] Verifiko veprimet reale Posto/Anulo/Fshi vetëm në dokumente draft dhe kontrollo që statusi/reflektimi të ndryshojë saktë.
- [x] Dokumento çdo dështim të gjetur dhe mos e shëno ciklin si të përfunduar pa prova vizuale dhe teknike.
- [x] Verifiko me autorizim përdoruesi `Paguaj Cash` në draftin real 7067 dhe reflektimin e statusit `E paguar` në Regjistrime.
- [x] Analizo screenshot-et, manualin dhe videon për layout-in e saktë Alpha të Regjistrimeve.
- [x] Krahaso Regjistrimet cloud me ambientin Alpha: madhësitë, pozicionet, proceset, regjistrin, filtrat dhe raportet.
- [x] Përshtat Regjistrimet 1:1 me modelin Alpha, duke ruajtur lidhjen me të dhënat reale dhe pa prekur Pagat.
- [ ] Verifiko çdo rrjedhë të Regjistrimeve me klikim real, dokument, mbyllje, kthim dhe status.
- [x] Korrigjo grid-in e Regjistrimeve: çdo vlerë duhet të jetë në qelizën e kolonës së vet, me header, sortim dhe total të rreshtuar 1:1 si Alpha.
- [x] Verifiko overflow-in horizontal të regjistrit dhe dukshmërinë e kolonave në desktop/mobile pas korrigjimit.
- [x] Analizo vetëm videon `Konfigurimet për mënyrën e të punuarit në Alpha Business` dhe dokumento menutë, formatet dhe rrjedhën e saj.
- [x] Krahaso faqen `/settings` me videon e Konfigurimeve, pa përdorur workflow-in e Regjistrimeve si model.
- [x] Përshtat Konfigurimet sipas videos, me katalogët, formatet dhe CRUD reale; mos ndrysho Pagat.
- [x] Verifiko Konfigurimet në desktop dhe mobile pas ndarjes `Mënyra e punës` / `Skedarë · Katalogë`; toolbar-i mbetet i arritshëm dhe menuja ka scroll të brendshëm.
- [x] Harmonizo emërtimin e menusë së sipërme `Skedarë` dhe breadcrumb-et me videon e Konfigurimeve Alpha, pa ndryshuar funksionet dhe pa prekur Pagat.
- [x] Korrigjo breadcrumb-in e route-it Konfigurime që të mos shfaqë `Klientë dhe Shitje / Regjistrime dhe kërkesa` kur përdoruesi është te Settings Alpha.
- [x] Ndrysho Regjistrime nga panel workflow në menu/listë të ngushtë Alpha si Skedarë.
- [x] Shto nënmenu dhe listë regjistrash sipas kategorive që dalin në video, me dritare filtri vetëm pas zgjedhjes.
- [x] Hiq nga Regjistrime elementet e Ambientit të Shitjeve që nuk i përkasin referencës së videos.
- [x] Ekzekuto regresionin e plotë pas rindërtimit të Regjistrimeve: 85 skedarë testesh dhe 299 teste kaluan.
- [x] Lidh parametrin `?register=` të nënmenusë me zgjedhjen automatike të regjistrit dhe hapjen e filtrave reale.
- [x] Audito Shitjet sipas videos/manualit Alpha: regjistri, forma vendase/eksport, toolbar, filtra dhe rrjedhë.
- [ ] Verifiko faturën e Shitjes me artikull, klient, magazinë, monedhë, kurs, TVSH dhe totalet reale.
- [ ] Verifiko Posto, Paguaj Cash, statuset, lëvizjen e stokut dhe reflektimin në Regjistrime/Raporte.
- [x] Testo faturat e eksportit/CMR dhe sigurohu që dokumenti i huaj nuk hap formatin vendas.
- [ ] Pas përfundimit të Shitjeve, vazhdo me Blerjet me të njëjtën disiplinë dhe pa prekur Pagat.
- [x] Analizo videon e Modulit Shitje vetëm për Regjistrime → Shitje: lista, filtrat, dokumentet vendase/eksport dhe rrjedha.
- [x] Përshtat Regjistrime → Shitje me strukturën e videos dhe mos prek Regjistrime të tjera apo Pagat.
- [ ] Verifiko me të dhëna reale faturën, magazinën, valutën/kursin, TVSH-në, pagesën dhe lidhjen me Raporte.
- [x] Korrigjo klikimin e faturës në Regjistrime → Shitje që të hapë formën Alpha të regjistrimit të shitjes, jo vetëm pamjen e dokumentit.
- [x] Verifiko hapjen e faturës ekzistuese, formularin full-screen, mbylljen dhe kthimin te regjistri pa prekur Pagat.
- [x] Korrigjo hyrjen nga faqja Regjistrime kur klikohet rreshti “Regjistrime të shitjes” që të hapë menjëherë regjistrin e faturave të shitjes.
- [x] Verifiko rrjedhën Regjistrime → Regjistrime të shitjes → klikim faturë → formulari i faturës.
- [x] Lidh trigger-in Faturë Shitje të Modulit Shitje me formularin e ri për regjistrimin e faturës.
- [x] Verifiko formularin e krijimit: klient, magazinë, artikuj, sasi, çmim, monedhë/kurs, TVSH dhe ruajtje reale.
- [x] Hiq event-in e vjetër `genit:open-easy-invoice` që mbyll dialogun e formularit të ri të faturës së shitjes.
- [x] Verifiko që `newInvoice=1` dhe klikimi Faturë Shitje e lënë formularin të hapur në ekran.
- [ ] Verifiko ruajtjen reale të një fature të re nga Easy Invoice dhe konfirmo që dokumenti shfaqet në regjistër me numër, klient, valutë dhe total korrekt.
- [ ] Shto test regresioni për hapjen me `newInvoice=1`, submit-in valid dhe mbylljen/rifreskimin e regjistrit pas krijimit.
- [x] Nxirr dhe dokumento pamjen reale të formës Faturë Shitje nga videoja e Modulit Shitje.
- [x] Zëvendëso layout-in aktual të formularit me pamjen e krahasuar të videos, jo me një formë të përgjithshme.
- [x] Dërgo screenshot të formës së krahasuar dhe verifiko që hapet realisht para checkpoint-it.
- [x] Shto dhe shfaq tabelën e artikujve/produkteve në formularin e ri Faturë Shitje me kolonat e nevojshme.
- [x] Rregullo dizajnin e butonave të toolbar-it të sipërm të formularit që të jenë të pastër, të dallueshëm dhe të përdorshëm.
- [x] Verifiko tabelën, llogaritjet e totalit dhe pamjen live të formularit pas ndryshimit.
- [x] Rilexo referencën e videos së Modulit të Shitjeve për tabelën e artikujve, rendin e fushave dhe toolbar-in.
- [x] Përshtat formularin e faturës së shitjes vetëm sipas pamjes së videos së Modulit të Shitjeve.
- [x] Rillogarit automatikisht Vlefta pa TVSH, TVSH dhe Vlefta me TVSH kur ndryshon sasia ose çmimi.
- [x] Shto buton të qartë fshirjeje në fund të çdo rreshti të tabelës së produkteve.
- [x] Shfaq gjendjen reale të stokut për çdo artikull në menunë e kërkimit live.
- [x] Shto teste regresioni dhe verifiko pamjen live të këtyre ndërveprimeve.
- [ ] Korrigjo route-in mobile që hapja e Faturë Shitje të përdorë parametrin e formularit të ri dhe jo vetëm regjistrin.
- [ ] Heto dhe korrigjo gabimin e kuq që shfaqet në faqen mobile të Regjistrimeve/Shitjeve.
- [ ] Testo rrjedhën mobile Regjistrime → Shitje → Faturë Shitje me screenshot real.
- [x] Dokumento screenshot-in AnyDesk si referencë kryesore për Regjistrim Shitje desktop.
- [x] Rindërto formën desktop me toolbar ikonash, listë artikujsh, header-in djathtas, tabelën poshtë dhe panelin e pagesës.
- [x] Lidh butonat Mbyll, Ruaj, I Ri, Kërko, Fshi, Printo, Kont, Oferta, Prapa, Para dhe Ri Ruaj me funksionet reale.
- [x] Përdor referencën e videos 01:44 si model kryesor: dritare e gjerë desktop, toolbar i hollë dhe blloqe të dendura Alpha.
- [x] Ristrukturo formularin sipas fushave Pika e Shitjes, Referenca, faturë, klient, magazinë, tabelë qendrore dhe pagesë.
- [x] Shto përmbledhjet Pagesë, Me zbritje, kufijtë dhe totalet në monedhë bazë/monedhë fature.
- [x] Hap preview-n direkt te formulari desktop Regjistrim Shitje dhe sigurohu që nuk kthehet te faqja e regjistrit.
- [x] Kap screenshot real të formularit të hapur dhe verifiko route-in që përdoruesi ta shohë.
- [x] Bëj që butoni real Faturë Shitje nga moduli Shitje të hapë formularin e ri pa u varur nga `newInvoice=1` në URL.
- [x] Verifiko hapjen në desktop dhe mobile nga navigimi normal dhe jo vetëm nga preview-ja direkte.
- [x] Audito submit-in e formularit Faturë Shitje dhe payload-in që dërgohet te procedura reale.
- [x] Verifiko ruajtjen reale me artikuj, total, monedhë/kurs dhe magazinë, pastaj rifresko regjistrin.
- [x] Verifiko se ruajtja nuk prek Pagat dhe shto test regresioni për rrjedhën e faturës së re.

- [x] Shitje: korrigjo zgjedhjen automatike të magazinës në formën full-screen që Ruaj të mos bllokohet nga select-i required.
- [x] Shitje: shto test regresioni për magazinën reale dhe ruajtjen e faturës së re.
- [x] Shitje: verifiko ruajtje reale fund-më-fund në preview dhe shfaqjen në regjistër.
- [x] Shitje: verifiko përshtatjen mobile të formës së faturës.
- [x] Shitje: lidh butonin global "Faturë e re" te formulari Alpha full-screen në /sales-invoices dhe mos hap EasyInvoiceDialog alternativ.

- [x] GitHub: audito source code-in aktual, historikun, skedarët e ndjeshëm dhe skedarët e gjeneruar para eksportit.
- [x] GitHub: përgatit LICENSE, CHANGELOG, CONTRIBUTING, docs dhe strukturën e zhvilluesit pa ekspozuar secrets ose të dhëna reale; dokumentimi i variables u vendos te docs/ENVIRONMENT.md, pa krijuar .env.example për shkak të menaxhimit të sigurt të secrets.
- [x] GitHub: shto wrapper Windows dhe konfigurimin build:windows/CI që përdor të njëjtin frontend.
- [x] GitHub: inicializo main/develop, commit-e logjike, tag v1.0.0 dhe ngarko repository-n private BioBes.
- [x] GitHub: verifiko repository-n private, klonimin e pastër, numrin e skedarëve dhe kontrollet e sigurisë.

- [x] BioBes: auditoj të gjitha tabelat, kolonat, indeksat dhe foreign keys në drizzle/schema.ts dhe migrimet.
- [x] BioBes: dokumentoj strukturën e databazës, marrëdhëniet dhe migrimet në docs/DATABASE.md.
- [x] BioBes: auditoj të gjitha router-at/procedurat tRPC dhe dokumentoj API-të reale në docs/API.md.
- [x] BioBes: përfshij source code-in dhe testet e modulit Pagat në eksportin publik, pa secrets dhe pa të dhëna reale.
- [x] BioBes: shtoj dokumentacionin e modulit Pagat dhe verifikoj testet/build-in.
- [x] BioBes: commit dhe push i dokumentacionit/database/API/Pagave në GitHub public.

- [x] BioBes: krahaso përmbajtjen e repository-t me source-in e plotë aktual dhe identifiko çdo modul/skedar të lënë jashtë.
- [x] BioBes: përfshi dokumentacionin e plotë të databazës, API-ve dhe Pagave në kopjen që do publikohet.
- [x] BioBes: bëj commit/push të eksportit komplet në GitHub public dhe verifiko tree-n finale.

- [x] Audit: krahaso të gjithë skedarët e source project me tree-n reale të BioBes dhe ruaj listën e diferencave.
- [x] Audit: klasifiko çdo diferencë si source code, dokumentim, artefakt, secret ose të dhënë personale.
- [x] Audit: publiko çdo source code të lejueshëm që mungon, përfshirë Pagat dhe skedarët mbështetës.
- [x] Audit: shto raportin transparent të përmbajtjes dhe përjashtimeve në repository.
- [x] Audit: testo diff-in final, secrets scan dhe push-in në GitHub public.

- [x] Audit i dytë: krahaso listat dhe SHA-256 hash-et e source project-it me BioBes main.
- [x] Audit i dytë: kontrollo module, route, schema, migrime, teste dhe skedarë mbështetës që mund të mungojnë.
- [x] BioBes: shto skript automatik për verifikimin e integritetit source-versus-repository.
- [x] BioBes: përditëso README.md me listën e plotë të moduleve dhe strukturës së databazës.
- [x] BioBes: ekzekuto auditin, testo skriptin, commit dhe push rezultatet finale.

- [x] Self-hosted: audito të gjitha importet dhe thirrjet runtime të OAuth/Forge/S3 të Manus.
- [x] Self-hosted: shto konfigurim adapterësh për auth dhe storage të pavarur.
- [x] Self-hosted: shto mënyrën e nisjes Docker dhe dokumentimin pa varësi Manus.
- [x] Self-hosted: shkruaj teste për adapterët, konfigurimin dhe fallback-un Manus.
- [x] Self-hosted: verifiko build/instalim të pastër dhe publiko ndryshimet në BioBes.

- [x] Audit developeri: verifiko raportin ndaj commit-it aktual v1.0.6, jo vetëm bd2cc1, dhe publiko commit/tag të pranimit.
- [x] P0: hiq remote/path të hardkoduar nga integrity script dhe krijo SOURCE_MANIFEST.json me hash-e.
- [x] P0: siguro Docker build me VITE_* të injektuara, .dockerignore, non-root, health/readiness dhe migrime të kontrolluara; Docker smoke test mbetet i paprovuara sepse CLI mungon në sandbox.
- [x] P0: përfundo first-run owner/company/membership dhe bootstrap të sigurt për DB bosh; prova me DB bosh kërkon runner me Docker/MySQL.
- [ ] P0: rregullo varësitë production critical/high ose dokumento mitigimet e verifikueshme.
- [ ] P1: audito dhe forco guard-at multi-company/RBAC në query/mutation handlers me teste negative cross-tenant.
- [ ] P1: audito idempotencën e stokut, unique constraints dhe numërimin atomik të dokumenteve.
- [x] P1: krijo FINAL_ACCEPTANCE_REPORT.md me rezultatet reale dhe kufizimet e pambyllura.

- [x] Deployment regression: Dockerfile kopjon patches/ përpara pnpm install; Cloud Build failure nga ENOENT për wouter patch u korrigjua.

- [x] Deployment regression: runtime stage dështoi me ERR_MODULE_NOT_FOUND sepse vite/plugin ishin devDependencies; lëvizi në production dependencies dhe u verifikua me check/test/build.

- [x] Deployment regression: runtime bundle importon plugin-et statike nga vite.config; bëji production dependencies dhe verifiko check/test/build.

- [x] Deployment hardening: importet Vite janë lazy në setupVite që production server të mos ngarkojë plugin-et build-time në startup; bundle-i nuk ka import statik të vite.config.

- [x] Database integrity: shto migration 0042 me FK për core multi-company/master-data dhe unique `(userId, companyId)`; kontrollo zero orphans/duplicates dhe aplikoje në DB.

- [x] Deployment verification: pas lazy Vite import fix, Cloud Run log-et konfirmuan server running në portën 3000 pa ERR_MODULE_NOT_FOUND; domain-i publik u përgjigj HTTP 200.

- [x] RBAC hardening: adminProcedure trashëgon requireUser dhe requireCompanyScope; TypeScript dhe 5 teste të targetuara kaluan.

- [x] Numbering audit finding: u identifikuan 2 fatura blerjeje reale me `bl-01`/`BL-01` në të njëjtën kompani; nuk u ndryshuan pa konfirmim, ndaj unique constraint i plotë për purchaseInvoices mbetet i hapur.

- [x] Numbering integrity: migration 0043 vendos unique `(companyId, docNumber)` për porosi, pranime, kthime, fatura shitje, oferta dhe porosi shitje; faturat blerje mbeten të hapura për shkak të konfliktit real `bl-01`/`BL-01`.

- [x] RBAC audit finding: disa procedura të Pagave përdorin vetëm `payrollPeriodId` pa `companyId`; nuk u ndryshuan sepse moduli Pagat duhet të mbetet i paprekur, ndaj kërkojnë refaktorim të dedikuar dhe teste cross-company përpara mbylljes së auditit.

- [x] Production build regression: pas migration 0043 dhe admin company-scope, `pnpm build` kaloi; warning-u i chunk-ut të madh është performancë jo dështim funksional.

- [x] Dependency audit finding: `pnpm audit --prod --json` raportoi 2 critical, 38 high, 61 moderate dhe 11 low në 863 dependencies; nuk u aplikua `audit fix` automatik sepse nuk ka patch të sigurt pa rrezik regresioni.

- [x] Clean-clone acceptance: BioBes public u klonua me depth 1; `pnpm install --frozen-lockfile`, `pnpm check`, 5 teste RBAC dhe `pnpm build` kaluan.

- [x] Full clean-clone test suite: në clone të freskët të BioBes kaluan 88 test files dhe 309 teste, pas instalimit frozen, check dhe build.

- [x] Integrity verification: 616 skedarë lokalë kundrejt 519 në export; 0 source-code missing, 0 hash mismatch, 99 non-source artifacts të dokumentuara dhe vetëm `todo.md` remote-only.

- [x] Stock audit finding: query read-only gjeti dublikatë reale në `stockMovements` për invoice 540/referenceId 30068/productId 90028; katër dalje në të njëjtin timestamp, pa fshirje ose ndryshim të të dhënave.

- [x] Idempotency hardening: `ensurePurchaseInvoiceStock` dhe `ensureSalesInvoiceStock` tani marrin row-level `FOR UPDATE` lock mbi faturën burimore përpara kontrollit të lëvizjeve; TypeScript, 14 teste targetuara dhe production build kaluan. Auditimi i workflow-ve të tjera të stokut mbetet i hapur.

- [x] Sales mobile route hardening: `SalesInvoices` sinkronizon `newInvoice=1` me state-in `invoiceOpen` edhe pas navigimit dinamik; 12 teste targetuara, TypeScript dhe production build kaluan. Verifikimi browser mobile E2E mbetet i hapur.

- [ ] Docker bootstrap: aplikoni migrimet automatikisht në DB bosh me një entrypoint të verifikueshëm dhe dokumento rrjedhën pa ndryshuar të dhëna reale.

- [ ] Docker bootstrap wiring: wiring-u i `AUTO_MIGRATE=true` dhe kopjimi i `drizzle/` ekzistojnë në kodin aktual, por kjo nuk konsiderohet e kryer pa smoke test real `docker compose up --build -d` me MySQL bosh, migrime dhe login.

- [ ] Self-host auth: shto bootstrap DB-first për owner lokal me email/password, në mënyrë që instalimi bosh të mos varet vetëm nga `LOCAL_AUTH_USERS_JSON=[]`; ruaj first-run setup të kontrolluar.
- [ ] Storage security: kërko session valid dhe verifiko pronësinë/company scope për `/local-storage/*` dhe `/s3-storage/*`; mos lejo download vetëm nga path-i.
- [ ] Docker migration proof: verifiko që `AUTO_MIGRATE=true` migraton DB bosh dhe që runtime image përmban të gjitha migration assets.
- [ ] Health readiness: zgjero `/healthz` që të kontrollojë DB, migrimet dhe storage konfigurimin real, jo vetëm ekzistencën e connection pool-it.
- [ ] Auth/storage regression tests: shto teste negative për anonymous storage access, cross-company object access dhe first-run owner bootstrap.

- [ ] Storage auth gate: routes aktuale kanë helper autentikimi në kod, por statusi mbetet i pambyllur derisa të provohen runtime me request anonymous, session valid dhe company/object ownership; company/object authorization është ende e hapur.
- [x] P0 audit priority: testi RBAC për rolin viewer dhe procedurat write u verifikuan; `server/rbac.reader.test.ts` kaloi dhe suite e plotë u ekzekutua pa krijuar tag/checkpoint të ri.
- [ ] Audit handoff 2026-08-25: ndalo tag-et/raportet për ndryshime të vogla dhe mos deklaro teste pa output real.
- [x] Audit handoff 2026-08-25: `payment.cancel` dhe `payment.deleteDraft` tani ekzekutojnë `assertCompanyWriteAccess(ctx.user, input.companyId)` para çdo leximi DB; target test kaloi me FORBIDDEN dhe lookup nuk u thirr për viewer.
- [ ] Audit handoff 2026-08-25: audito çdo endpoint multi-company/RBAC për furnitorë, klientë, produkte, konfigurime, blerje, shitje, magazinë, kontabilitet, banka, transport dhe Pagat.
- [ ] Audit handoff 2026-08-25: shto teste cross-company për query/mutation/export/download dhe për procedurat Payroll që marrin vetëm `payrollPeriodId`.
- [ ] Audit handoff 2026-08-25: verifiko snapshot/metadata Drizzle pas 0040 dhe ndaj komandat `db:generate` nga `db:migrate`; production/Docker të përdorë vetëm migrate.
- [ ] Audit handoff 2026-08-25: mbyll idempotencën e lëvizjeve të stokut për çdo dokument/rresht dhe testo postime paralele, pa fshirë dublikatat ekzistuese pa backup/rakordim/rollback.
- [ ] Audit handoff 2026-08-25: provo Docker first-run real me MySQL bosh, owner/company/membership, login, storage dhe readiness me SELECT 1/status migrimesh.
- [ ] Audit handoff 2026-08-25: forco storage company/object scope, rate limiting login, dependency hardening dhe dokumento mitigimet pa pretenduar mbyllje të 2 critical/38 high/61 moderate/11 low.
- [ ] Audit handoff 2026-08-25: dorëzimi final kërkon clean clone të BioBes, pnpm install/check/test/build, Docker smoke test dhe E2E me DB bosh; tag vetëm pas milestone-it të provuar.
- [ ] Audit correction: rikthe “Docker bootstrap wiring” dhe “Storage auth gate” si të pambyllura derisa Dockerfile/compose/routes të verifikohen realisht me prova.
- [ ] Audit correction: mos shëno komponentë infrastrukture si të kryer vetëm nga wiring-u; kërko test runtime për migrime, session authorization dhe healthcheck.
- [ ] Audit handoff 2026-08-25: shto UI/backend first-run për email, emër, password, kompani dhe NIPT; lejo vetëm në DB bosh me setup secret njëpërdorimësh dhe race-safety.
- [ ] Audit handoff 2026-08-25: shto rate limiting për login dhe bootstrap dhe provo login/logout pas restart-it të container-ëve.
- [ ] Audit handoff 2026-08-25: commit-i i ardhshëm duhet të përmbajë source implementim funksional për Docker, storage, healthcheck dhe testet; dokumentimi vetëm pas provave.
- [ ] P0: verifiko dhe sinkronizo në GitHub drizzle/meta/0041, 0042 dhe 0043 snapshot koherent.
- [ ] P0: shto .env.example me konfigurimin e nevojshëm për self-host Docker.
- [ ] P0: shto assertCompanyAccess/Write për issuer, documentGroup, costCenter, product.list dhe Payroll employees/settings/periods/leave.
- [ ] P0: rakordo me backup bl-01/BL-01 dhe apliko unique purchaseInvoices(companyId, docNumber) vetëm pas verifikimit të të dhënave.
- [ ] P0: ruaj log provash për docker compose up, /healthz 200, POST /api/local-auth/bootstrap dhe login.
- [ ] Audit handoff: riparo Drizzle meta/snapshots 0041–0043 në mënyrë që checkout i pastër të japë `pnpm db:generate` me “No schema changes”; mos commit-o migration të dyfishtë 0044.
- [ ] Audit handoff: shto test route-level/integration për storage me DB dhe local storage real, jo vetëm mocks.
- [ ] Audit handoff: ekzekuto Docker fresh-start pa cache me MySQL bosh, AUTO_MIGRATE, /healthz 200 me applied/expected, restart, local auth dhe storage anonymous/cross-company/member.
- [ ] Audit handoff: audit production dependencies deri në zero critical dhe dokumento reachability të high vulnerabilities; bëj analytics conditional kur env mungon.
- [ ] Audit handoff: ruaj output të plotë për check/test/local build/db:generate/audit/Docker/status përpara çdo tag-u ose deklarimi pranimi.
- [ ] P0 IDOR: refaktoro të gjitha payroll routes me vetëm payrollPeriodId (generate, entries, attendance, bonuses, upsertBonuses, addAttendance, addAttendanceBulk, upsertAttendanceBulk, clearManualAttendance) që të autorizojnë company scope para çdo DB operation.
- [ ] P0 ID-only audit: audito dhe mbyll weightForm.get, purchaseInvoice.get dhe çdo route tjetër që merr vetëm ID.
- [ ] P0 cross-tenant regression: shto prova që kompania A nuk lexon ose ndryshon të dhënat e kompanisë B dhe viewer nuk kryen mutation; DB mutation nuk thirret para dështimit të authorization.
- [ ] P0 runtime acceptance: verifiko duplicate query para migration, Docker fresh-start 45/45, healthz 200, restart, local auth login/logout, storage 401/404/200 dhe persistence.
- [ ] P0 self-host hardening: shto .env.example, bootstrap secret njëpërdorimësh, race-safety dhe rate limiting për bootstrap/login.
- [ ] P0 dependency/build: rregullo critical vulnerabilities dhe analytics build warnings, me analizë reachability për high vulnerabilities të mbetura.
- [ ] A: shto `.env.example` dhe INSTALL minimal me `docker compose` + bootstrap curl.
- [ ] B: verifiko guard të gjitha procedurave me companyId ose ownership nga payrollPeriodId/weightForm/purchaseInvoice/backup dhe test A≠B.
- [ ] C: zbato idempotencë stoku për dërgesë/kthim/transfer/inventar dhe test post 2x.
- [x] D: shto CI me MySQL bosh, migrate 0000–0044, check/test/build dhe një E2E login+faturë; run `32950355559` kaloi të gjitha këto hapa.
- [ ] E: provo backup/restore dhe rate limit login/bootstrap.
- [ ] F: ruaj log të clone-it të pastër, compose up, healthz 200, bootstrap 201, login 200, një shitje dhe stok të saktë; vetëm nëse kalon krijo tag `v2.0.0`.
- [x] CI: verifiko web dhe Windows jobs me status real jeshil, jo vetëm YAML të commit-uar; web dhe windows-wrapper janë Success në run `32950355559`: https://github.com/genilufra-droid/BioBes/actions/runs/32950355559.
- [ ] Compose: siguro secret wiring nga environment pa secret literal dhe verifiko fresh-start acceptance.
- [ ] E2E: krijo magazinë në setup para krijimit të faturës dhe provo login + invoice në DB bosh.
- [ ] Stock: bëj idempotencën atomike nën lock/unique invariant dhe shto teste paralele postimi 2x për dërgesë/kthim/transfer/inventar.
- [ ] Release gate: mos krijo tag v2.0.0 pa web CI, Windows CI dhe Docker acceptance të gjitha jeshile.
- [ ] Final gate: shto `.env.example` që përputhet me INSTALL.md dhe kontrollo instalimin e dokumentuar.
- [ ] Final gate: shto company access guards te payroll.backup.get/restore, weightForm.list/create dhe purchaseInvoice.list/register.
- [ ] Final gate: verifiko linkun/statusin e GitHub Actions për commit-in 4a69a5c; mos e quaj green pa run real.
- [ ] Final gate: krijo tag `v2.0.0` vetëm pasi `.env.example`, guards dhe CI web+Windows të jenë realisht green.
- [ ] Final gate: shto `.env.example` që përputhet me INSTALL dhe është në origin/main.
- [ ] Final gate: rregullo `pnpm db:migrate` në CI, verifiko run pasues green me link dhe krijo `v2.0.0` vetëm pas suksesit.
- [ ] Final CI gate: `.env.example` në root me placeholders jo-sekrete dhe `LOCAL_AUTH_SETUP_SECRET` i detyrueshëm në Compose.
- [x] Final CI gate: `pnpm db:migrate` përdor MySQL 8.4 bosh në CI dhe kaloi pas korrigjimit të migration 0032; verifikuar në run `32950355559`.
- [x] Final CI gate: run i ri GitHub Actions kalon deri te E2E dhe job-i Windows është Success; run `32950355559` përfundoi green.
- [ ] Final release gate: tag `v2.0.0` krijohet vetëm pas Actions Success dhe verifikimit të `.env.example` në origin/main.
- [ ] Release closeout: verifiko `.env.example` në origin/main, kryej clean install me të dhe krijo/verifiko tag `v2.0.0` vetëm pas suksesit.
- [ ] Release gate: shto `.env.example` në root/origin/main, kryej clean install duke e përdorur dhe krijo/verifiko `v2.0.0` vetëm pas suksesit.
- [x] Reports milestone: rikrijo `Rap_BlerjeRegjistriPermbledhes` nga HTML/XLSX/PNG me title, filters, grouped header, rows, totals, footer, print dhe export të lidhur me të dhëna reale; formati `purchase_summary_register_pdf` u implementua dhe u verifikua me `pnpm check`, 29 teste referente dhe `pnpm build`.
- [x] Reports milestone: përdor komponent bazë të përbashkët që ruan strukturën e guide-it për familjet e tjera të raporteve; grupimi i `purchase_summary_register_pdf` u verifikua me test komponenti.
- [x] Reports milestone: shto teste kontrate për kolonat, grupet, zero/një/shumë rreshta dhe linkun e dokumentit burimor; metadata `__documentId`/`__documentType` ruhet dhe 28/28 testet referente kalojnë.

- [x] Raportet referente të Blerjeve: implemento `purchase_summary_register_pdf` me 14 kolona, lidhje me filtrat realë, rreshta nga të dhënat e faturave dhe pamje A4 sipas PDF-së referente; `pnpm check`, 12 teste referente dhe `pnpm build` kalojnë.
- [x] Reports milestone: mbulo `purchase_summary_register_pdf` me teste kontrate për zero, një dhe shumë rreshta, ruajtjen e metadata-s dhe linkun e dokumentit burimor; `pnpm check` dhe 13/13 testet referente kalojnë.
- [x] Reports milestone: përshtat `purchase_supplier_card_pdf` me saldon reale të furnitorit, pagesat e lidhura, progresivin dhe filtrat e dokumentit burimor sipas PDF-së; `pnpm check`, 27 teste referente dhe `pnpm build` kalojnë.
- [x] Reports milestone: korrigjo `purchase_supplier_situation_category_pdf` që Debi/Kredi bazë të përdorin kursin real të faturës dhe mbuloje me test regresiv; `pnpm check` dhe 28/28 testet referente kalojnë.
- [x] Reports milestone: sinkronizo `purchase_supplier_card_format3_pdf` me pagesat reale dhe progresivin e Kartelës së Furnitorit, pa rikthyer kolonat e formatit të plotë; `pnpm check`, 28 teste referente dhe `pnpm build` kalojnë.
- [x] Reports milestone: korrigjo `purchase_supplier_maturity_summary_pdf` që të mos numërojë faturat e paguara dhe mbulo klasifikimin e afateve me test regresiv; `pnpm check` dhe 29/29 testet referente kalojnë.
- [x] Reports milestone: përjashto faturat e paguara nga `purchase_supplier_maturity_pdf` dhe përdor të njëjtin helper të kovave si përmbledhja; kova mbi 180 ditë mapohet te `>` dhe `pnpm check` plus 29/29 testet referente kalojnë.
- [x] Reports milestone: korrigjo `purchase_invoice_payment_register_pdf` që të përjashtojë pagesat e anuluara dhe të llogarisë pagesat në monedhë bazë sipas kursit real; `pnpm check` dhe 30/30 testet referente kalojnë.
- [x] Reports milestone: zëvendëso placeholder-at e disponueshëm në `purchase_customs_import_register_pdf` me `carrierName`, `vehiclePlate`, `inventoryReference` dhe vlerat reale të faturës; duty/akciza mbeten bosh kur nuk ekzistojnë në skemë, ndërsa `pnpm check` dhe 31/31 testet referente kalojnë.
- [x] Reports milestone: mbulo `sales_summary_register_pdf` me testet e llogaritjes neto/TVSH dhe monedhës bazë për faturë vendase dhe eksporti; `salesReportMath.test.ts` mbulon vendase, legacy pa TVSH në rresht dhe eksport EUR.
- [x] Reports milestone: korrigjo `sales_discount_analysis_pdf` që kolonat e zbritjes të mos kopjojnë vlerat bruto kur skema nuk ka zbritje reale; ato mbeten bosh me shpjegim të sinqertë, ndërsa vlerat bruto/neto reale ruhen dhe `pnpm check` plus 36/36 testet kalojnë.
- [x] Reports milestone: korrigjo `sales_returns_pdf` që monedha/kursi dhe vlera monetare të mos paraqiten si ALL ose bosh të maskuar kur kthimi nuk ka fushë burimore çmimi; fushat mbeten bosh në mënyrë të sinqertë dhe `pnpm check` plus 36/36 testet targetuara kalojnë.
- [x] Reports milestone: korrigjo `sales_margin_pdf` dhe `sales_margin_detail_pdf` që kostoja të konvertohet me kursin e faturës dhe marzhi me zbritje të mos kopjojë marzhin bruto pa të dhëna zbritjeje; `pnpm check` dhe 36/36 testet targetuara kalojnë.
- [x] Reports milestone: korrigjo `sales_product_card_pdf` që klienti të përdorë emrin real nga `customers` kur invoice.customerName mungon; query tashmë ngarkon company-scoped customers dhe `pnpm check` plus 36/36 testet targetuara kalojnë.
- [x] Reports milestone: korrigjo `sales_by_product_pdf` që klienti të përdorë emrin/kodin real nga `customers` kur invoice.customerName mungon dhe të ruajë identitetin stabil të klientit; `pnpm check` dhe 36/36 testet targetuara kalojnë.
- [x] Reports milestone: korrigjo `sales_analytic_register_pdf` që përqindjet/vlerat e zbritjes të mbeten bosh kur SalesItems nuk ruan zbritje; pika e shitjes mbetet `—` kur nuk ekziston në skemë, ndërsa `pnpm check` plus 36/36 testet targetuara kalojnë.
- [x] Reports milestone: korrigjo `sales_comparison_pdf` që klienti të merret nga customers dhe kolona e zbritjes të mbetet bosh kur nuk ka fushë zbritjeje në skemë; `pnpm check` dhe 36/36 testet targetuara kalojnë.
- [x] Reports milestone: korrigjo `sales_price_list_pdf` që Cmimi 2–5 dhe nëngrupi të mbeten bosh kur nuk ekzistojnë në skemën e produkteve; `Cmimi 1` përdor `lastPrice` real dhe `pnpm check` plus 36/36 testet targetuara kalojnë.
- [x] Reports milestone: korrigjo `inventory_product_card_pdf` që progresivi i stokut të mos përzihet mes magazinave dhe të përdorë çelësin magazinë-artikull; helper-i u testua me magazina/artikuj të ndryshëm dhe `pnpm check` plus 37/37 teste targetuara kalojnë.
- [x] Reports milestone: korrigjo `applyOdooReportFilters` që Shuma minimale/maksimale të përdorë kolonën monetare të raportit, jo numrin e parë numerik si sasia ose indeksi; u zgjerua për kolonat reale të raporteve dhe u shtua regresion i drejtpërdrejtë, ndërsa `pnpm check` plus 38/38 teste targetuara kalojnë.
- [x] Reports milestone: korrigjo `inventory_analytic_register_pdf` që Vlefta të jetë hyrje pozitive/dalje negative dhe përshkrimi të bjerë te emri real i produktit kur movement.productName mungon; `pnpm check` dhe 38/38 testet targetuara kalojnë.
- [x] Reports visual parity: rikthe `purchase_supplier_card_pdf` sipas HTML-së referente: titulli `KARTELA E FURNITORIT`, filtrat `Ndermarrja/Dt. Dok./Dt. Regj.`, identifikimi `Furnitori/Mon/Nr. Llogarie/NIPT`, header 6 kolona dokumenti + grupi `Monedhe Llogarie` me `Debi/Kredi/Progresivi`, gjendje fillestare, `Totali`, `Debitor/Kreditor`, footer IMB dhe layout pa kolonat MB; verifikuar live, `pnpm check` dhe 34/34 testet targetuara kalojnë.
- [x] Reports visual parity: ndërto Kartelën e Klientit me të njëjtin layout HTML si furnitori, ngjarje reale faturë shitjeje/pagesë hyrëse, filtër klienti, progresiv dhe status Debitor/Kreditor pa të dhëna të fabrikuara; `pnpm check` dhe 35/35 testet targetuara të Raporteve kalojnë.

## Alpha Navigation Clone — Session 2026-08-26
- [ ] Audit navigimin e Alpha-s për Skedarë, Konfigurime, Regjistrime, Raporte, Instrumenta dhe Ndihmë, me hierarki dhe dalje të verifikueshme.
- [ ] Hartëzo rrjedhat module/formë/dokument për Klientë, Furnitorë, Artikuj, Blerje, Shitje, Magazinë, Arkë/Banka, Paga dhe Kontabilitet.
- [ ] Përshtat shell-in cloud me navigimin Alpha-style dhe breadcrumbs pa prishur scope-in e kompanisë.
- [ ] Lidh menutë me formatet ekzistuese, toolbar-in, filtrat, Enter/Esc, Print/PDF/Excel dhe linket e dokumenteve burimore.
- [ ] Verifiko navigimin dhe format në live desktop/mobile kundrejt referencës; mos e shëno identike pa provë.
- [ ] Scope lock: trajto Alpha Business të linkuar nga përdoruesi si burimin kryesor të parity-t; çdo ndryshim i navigimit, forme, raporti ose toolbar-i duhet të krahasohet me atë referencë dhe të mos shënohet identik pa verifikim.
- [x] Scope lock reports-only: verifiko që ndryshimet e këtij cikli kufizohen te komponentët, query-t, stilet, eksportet dhe testet e Raporteve; nuk u prekën modulet e tjera.

## Reports-only PDF parity — Scope update 2026-08-26
- [ ] Inventarizo të gjitha PDF-të referente të Raporteve dhe përcakto për secilin raport titullin, formatin e faqes, orientimin, kolonat, grupimet, filtrat, totalet dhe footer-in.
- [x] Përshtat vetëm menunë Raporte me grupimet, renditjen dhe emërtimet e PDF-ve referente; mos ndrysho menutë ose modulet e tjera. U verifikuan kartat `Kryesore`, `Të Tjera 2` dhe listat e modeleve në preview.
- [ ] Përshtat renderer-at HTML/PDF/Print/Excel të Raporteve sipas strukturës 1:1 të PDF-ve, pa placeholder-a dhe pa të dhëna të fabrikuara.
- [ ] Verifiko që filtrat e çdo raporti aplikohen në modelin e dokumentit dhe që Enter hap vetëm pamjen e raportit.
- [ ] Verifiko modelet e raporteve të Blerjeve, Shitjeve dhe Magazinës në preview dhe në eksportet PDF/Excel kundrejt PDF-ve referente.
- [x] Shto teste kontraktuale për menunë, kolonat, grupimet, orientimin dhe totalet e modeleve të Raporteve; testet e menusë dhe renderer-it reference kalojnë.
- [ ] Konfirmo me `git diff` që ky cikël ndryshon vetëm skedarët e Raporteve, testet përkatëse dhe TODO-n.

## Alpha Web Reports navigation audit — Scope update 2026-08-26
- [x] Hap dhe audito live Alpha Web te seksioni Raporte duke përdorur navigimin real, pa ndryshuar të dhëna; u verifikua rrjedha e faqes së dedikuar dhe PivotGrid-it.
- [x] Regjistro renditjen e moduleve, grupeve, raporteve dhe sjelljen e dritares së filtrave që duhet klonuar vetëm te Raportet në `alpha-reports-navigation-audit-2026-08-26.md`.
- [x] Krahaso modele PDF nga Blerje, Shitje dhe Magazinë me renderer-at aktualë dhe shëno mospërputhjet konkrete në auditin e navigimit dhe `reports-pdf-inventory-2026-08-26.txt`.

## Strict Alpha parity clarification — 2026-08-26
- [x] Realizo Qendrën e Raporteve me rrjedhën identike të Alpha Web: Raporte → grupi Kryesore → kartë moduli → listë modelesh → dritare filtrash → Shiko/Enter → dokument reference; rrjedha u verifikua live.
- [x] Mos e trajto raportin si tabelë agreguese alternative: raportet `_pdf` dhe `sales_customer_statement` përdorin renderer-in reference me model dokumenti, toolbar, filtra, orientim dhe eksportet sipas PDF/HTML përkatës; u verifikua që katalogu PDF ka title/group mapping.
- [x] Nisja e Qendrës së Raporteve duhet të jetë `Të gjitha`, me kartat Shitje, Magazina, Blerje dhe Kontabiliteti të dukshme njëkohësisht, si në Alpha Web.

## Export Invoice quantity regression — 2026-08-26
- [x] Audito rrjedhën e `Export Invoice` për faturat e huaja dhe gjej pse sasia e artikullit nuk kalon në preview/PDF/print/Excel: modeli ruan `quantity`, ndërsa renderer-i lexonte vetëm `exportDetails.grossWeights/netWeights`.
- [x] Mapo nga të dhënat reale të faturës sasinë, njësinë, peshën bruto/neto dhe totalet e rreshtave në dokumentin e eksportit: `buildExportInvoiceRows` përdor peshat individuale reale kur ekzistojnë dhe `quantity` si fallback pa ndryshuar totalet.
- [x] Shto teste që verifikojnë sasi/pesha dhe totalet në preview, PDF/print dhe Excel pa përdorur placeholder-a: 7/7 testet `invoiceReference` kalojnë dhe mapper-i i përbashkët përdoret nga HTML/print, PDF dhe Excel.
- [x] Përshtat `inventory_product_summary_pdf` me kolonat reale të PDF-së Alpha dhe progresivin Gjendje Mbartur/Hyrje/Dalje/Gjendje sipas magazinës; TypeScript, 93 skedarë testesh/340 teste dhe build kalojnë.
- [x] Përshtat `inventory_article_analysis_pdf` me kolonat reale Hyrje nga Blerjet/Hyrje të Tjera/Dalje për Shitje/Dalje të Tjera dhe lidhje reale të kategorisë, njësisë, kostos dhe vleftës.

## Alpha internal report window — 2026-08-26
- [x] Audito live Alpha Web te Raporte → Blerje → një model konkret dhe dokumento modalin/dritaren e brendshme në `alpha-reports-navigation-audit-2026-08-26.md`.
- [x] Dokumento listën anësore të modeleve, renditjen, seksionet e filtrave, fushat me lupa dhe sjelljen e lookup-eve në auditin e Raporteve.
- [x] Dokumento toolbar-in e dritares së raportit: Shiko/Enter, Mbyll/Esc, Print, PDF, Excel dhe mënyrën si kalon nga filtri te dokumenti.
- [x] Përshtat cloud-in vetëm në ReportsCenter që dritarja e Blerjeve të ndjekë strukturën e Alpha Web: tab-et, kërkimi, toolbar-i dhe routing-u i kartës pa hapur filtrat automatikisht.
- [x] Shto test kontraktual për rrjedhën e Blerjeve dhe routing-un e workspace-it; `reportsMenu.test.ts` kalon me 4 teste.
- [x] Përputh titullin e `purchase_supplier_maturity_pdf` me `MATURIMI I FURNITORIT`, titullin e përmbledhjes me `MATURIMI I PERMBLEDHES` dhe header-in real `Mon Lig`; tsc dhe 22 testet targetuara kalojnë.
- [x] Shto modelin e veçantë `purchase_supplier_situation_pdf` sipas PDF-së `crfurnitorsituacion.pdf`, me kolonat e furnitorit, debi/kredi/detyrim dhe peshën reale; mos e bashko me modelin sipas kategorive. Query-ja përdor fatura/pagesa reale dhe pesha llogaritet nga detyrimi i kompanisë; u verifikua live me toolbar-in dhe dokumentin reference.
- [x] Përshtat `purchase_invoice_payment_register_pdf` sipas PDF-së `crshitjefaturimedhepagesa.pdf`, me grupet Lloji/Dokumenti/Vlefta dhe filtrat Furnitori/Monedha; shto test reference dhe verifiko 39/39 testet targetuara.
- [x] Korrigjo `Në %` te `inventory_warehouse_status_pdf` dhe `inventory_warehouse_detail_pdf` që të llogaritet si pjesë reale e vleftës totale të magazinës, sipas PDF-së Alpha, jo si raport me minimumin e artikullit; shto helper dhe regresion, me 40/40 testet targetuara të kaluara.
- [x] Ndaj `inventory_warehouse_detail_pdf` nga `inventory_warehouse_status_pdf`: përdor rreshtin përmbledhës të artikullit dhe nënrreshtat e lëvizjeve reale të magazinës, me progresiv dhe subtotal pa të dhëna të fabrikuara; TypeScript dhe 40/40 testet targetuara kalojnë.
- [x] Përshtat `sales_by_product_pdf` sipas `crshitjesipasartikujve.pdf`, me kolonat Artikulli/Klienti, Sasia, Çmimi, Vlefta(MB), Volumi i Shitjeve dhe përqindjen reale të vleftës.
- [x] Përshtat grupimet Alpha-style për raportet e Kontabilitetit (`accounting_trial_balance`, `accounting_profit_loss`, `accounting_payments`, `accounting_taxes`, `accounting_journals`) pa ndryshuar modulet operative.
- [x] Përshtat grupimet Alpha-style për raportet CRM dhe Bankë (`crm_pipeline`, `crm_leads`, `crm_activities`, `crm_won`, `bank_balances`, `bank_statements`, `bank_transactions`, `bank_reconciliation`, `bank_transfers`) mbi kolonat reale.
- [x] Korrigjo filtrat Shuma minimale/maksimale të Raporteve që të përdorin kolonën reale të vlerës (`Vlefta`, `Totali`, `Vlera`, `Detyrimi`, etj.), jo numrin e parë numerik të rreshtit.
- [x] Shtrëngo filtrat e Raporteve sipas fushës: Partneri vetëm te partneri, Kategoria vetëm te grupi/kategoria dhe Magazina vetëm te magazina, me fallback vetëm për raporte pa kolonë të dedikuar.
- [x] Siguro që variantet `accounting_revenue_summary`, `accounting_expense_summary` dhe `accounting_net_result` ekzekutojnë filtrimin e dedikuar para agregimit të përgjithshëm sipas datës.
- [x] Shto test real cross-company për `reportCenter.get`: kompania A nuk lexon raportin e kompanisë B dhe `getOdooReport` nuk thirret pas dështimit të autorizimit.
- [x] Rifresko label-et e filtrave aktive kur ndërrohet raporti, duke përfshirë çelësin e raportit në varësitë e memo-s së ReportsCenter.
- [x] Sinkronizo ndryshimet e verifikuara reports-only në BioBes dhe ekzekuto CI për commit-in pasues; commit `6ec8455b782738f5d034ef12152453bded864675` u shty në `origin/main`; CI green: `https://github.com/genilufra-droid/BioBes/actions/runs/32963458259`.
- [x] Përditëso `alpha-reports-navigation-audit-2026-08-26.md` me filtrat e dedikuar, guard-in cross-company, eksportet pas filtrimit dhe CI green të BioBes.
- [x] Sinkronizo auditin e përditësuar `alpha-reports-navigation-audit-2026-08-26.md` në BioBes dhe verifiko CI green për dokumentimin; commit `551a30f0b9515c6c8be9dba0ac4085e502084d7c`, CI green: `https://github.com/genilufra-droid/BioBes/actions/runs/32964040263`.
- [x] Verifiko dhe përshtat rrjedhën Raporte → Kryesore → kartë moduli → modele dokumentesh si Alpha Web, me hapje të modelit vetëm pas zgjedhjes dhe navigim të kthyeshëm në listë; u verifikua live në `/reports`, Shitje dhe Magazina.
- [x] Ristrukturo shell-in e Raporteve që hyrja të jetë e qartë si Skedarë/Konfigurime: menu modulare, hierarki e lexueshme, pa kartat e ngjeshura dhe pa përzierje të listës me dokumentin; kartat shfaqen vetëm në hyrjen Kryesore dhe lista e modeleve hapet veçmas për modulin.
- [ ] Audit dhe përshtat dokumentet reference të Raporteve që ende përdorin layout generic; secili dokument duhet të ketë header, grupe kolonash, orientim, totalet dhe toolbar-in e Alpha Web sipas modelit të vet.
- [x] Shto regresione vizuale/kontraktuale për rrjedhën Raporte → Kryesore → modul → model → filtër → dokument dhe verifiko desktop/mobile para checkpoint-it; kontratat e `reportsMenu`/renderer-it kalojnë dhe rrjedha u verifikua me screenshot desktop/mobile.
- [x] Shto titujt Alpha reference për `sales_quantity_pdf` dhe `inventory_minimum_status_pdf`, duke ruajtur të dhënat reale dhe grupimet ekzistuese; u verifikuan me 23 teste të renderer-it dhe TypeScript pa gabime.
- [x] Verifiko drejtpërdrejt në Alpha Web navigimin dhe modelet e Raporteve, duke dokumentuar rendin e hapjes dhe strukturën e dritares para çdo patch-i të mëtejshëm; u ndoq live menuja Raporte dhe nënmenuja me Arka, Banka, BI, Blerje, Inventar, Klientë/Furnitorë, Kontabilitet dhe Shitje.
- [x] Pasqyro në shell-in e Raporteve rendin e nënmenusë Alpha Web (Arka, Banka, BI, Blerje, eInvoice, Inventar, Klientë dhe furnitorë, Kontabilitet, Shitje) pa i përzier me katalogun e modeleve dhe pa ndryshuar modulet operative; u shtua shiriti blu me rendin real dhe lidhjet e disponueshme të cloud-it.
- [x] Fshih shiritin e nënmenusë së Raporteve brenda workspace-it të modelit; sipas Alpha Web ai shfaqet në navigimin e kategorive dhe jo mbi PivotGrid/listën e modeleve.
- [x] Sinkronizo patch-in e fundit të shell-it Alpha dhe kontratën e nënmenusë në BioBes; commit `e9aa11061bdfd6812b1c97e6bdcd93c3e408cf7d` u shty në `main`, CI green: `https://github.com/genilufra-droid/BioBes/actions/runs/32966396377`.
- [x] Ndiq live në Alpha Web të paktën rrjedhën Shitje dhe Blerje: hap modulin, zgjedh/krijon modelin, hap dokumentin, mbyll dhe kalon te moduli tjetër; u verifikuan Shitje në `Raport_PivotGrid.aspx?idModuli=19`, Blerje në `Raportet.aspx?idmod=2`, dhe dokumenti `Ditari klasik` në `Raporti.aspx?idraporti=133`; URL-të dhe kontrollet u dokumentuan në audit.
- [x] Përshtat workspace-in e modelit të Raporteve me tab-in Alpha `Raporti`: panel Filtrat, tipi i grafikut, Me Grafik/Pa Grafik, Krijo Filter, Undo/Redo, total/subtotal dhe zonat Pivot për rreshta/kolona/të dhëna; paneli përdor kolonat reale të modelit aktiv dhe ruan query/eksportet e pandryshuara.
- [x] Përshtat workspace-in e Blerjeve me modelin real Alpha accordion `Kryesore`/`Te Tjera 2`, kërkimin dhe kartat e modeleve, pa shfaqur tab-et e konfigurimit para zgjedhjes së modelit.
- [x] Sinkronizo në BioBes panelin Alpha të tab-it Raporti dhe accordion-in e Blerjeve të implementuar pas commit-it `e9aa110`; commit `45a97a6de326b9f890baa72a76f7ff0667c51718` u shty dhe CI green: `https://github.com/genilufra-droid/BioBes/actions/runs/32968097400`.
- [x] Ndaj automatikisht kolonat e raporteve pa metadata në grupe Alpha Dokumenti/Partneri-Artikulli/Sasitë dhe Vlerat, pa ndryshuar vlerat ose rendin e kolonave; u shtua klasifikim i dedikuar dhe regresion për kolonat e panjohura.
- [x] Sinkronizo fallback-un e grupeve Alpha dhe regresionin e renderer-it në BioBes; commit `0e9bc090f184b1372caef65cfcfe6d32eef818ba` u shty në `main`; verifikimi lokal kaloi me 93 skedarë/350 teste, check, build dhe diff check.
- [x] Pastro klasifikimin fallback të grupeve Alpha duke hequr kontrollin e përsëritur për kolonat e sasive dhe shto regresion minimal; auditimi konfirmoi se dega e dyfishtë nuk është në versionin aktual dhe testi fallback ekzistues kalon.
- [x] Verifiko me test që workspace-i i Blerjeve shfaq vetëm 29 modelet e Blerjeve, në rend katalogu dhe pa modele Shitje/Magazina/Klientë-Furnitorë; `reportsMenu.test.ts` kalon 6/6 dhe lista e çelësave u kontrollua në rend katalogu.
- [x] Thjeshto header-in e workspace-it kur zgjidhet Blerje: shfaq vetëm numrin e raporteve të Blerjeve dhe jo formatin `29 / 152`; screenshot-i `/reports?module=Blerje` tregon `29 raporte`.
- [x] Zëvendëso katalogun CRM të Raporteve me 7 modelet reale Alpha të Klientëve/Furnitorëve dhe implemento burimet reale të të dhënave në reportCenter pa prekur CRM operacional; check kaloi, 43 teste targetuara kaluan dhe verifikimi live tregoi 7 modele me modalin e filtrave Alpha.
- [x] Sinkronizo katalogun 7-modelësh të Klientëve/Furnitorëve, rastet backend, renderer-in dhe testet në BioBes; commit-i `c93bebc15a795d316417a388e04d666d84d04d7f` dhe rregullimi `cc04bef657fe4cfcf7d9fedb44d589188b87177e` janë në `github/main`; CI green: https://github.com/genilufra-droid/BioBes/actions/runs/32972004817.
- [x] Përditëso kontratën server të katalogut nga 152 në 139 raporte pas zëvendësimit të CRM me 7 modelet Alpha partner dhe verifiko suite-n e plotë; 93 skedarë dhe 354 teste kaluan në BioBes, bashkë me check/build.
- [x] Shto layout-e reference specifike për modelet e mbetura të Blerjeve (fatura, porosi, pranime, kthime, status dhe analiza) pa ndryshuar query-t ose të dhënat reale; u shtuan tituj/grupe të dedikuara dhe kaluan 60 teste targetuara, check, build dhe diff check.
- [x] Sinkronizo layout-et e reja standarde të Blerjeve dhe regresionin 60-testësh në BioBes; commit `93ffc7c8c056545fb2403fa34add20a118fe7554` u shty në `github/main`; CI green: https://github.com/genilufra-droid/BioBes/actions/runs/32974110984.
- [x] Rindërto pamjen e Raporteve 1:1 sipas workspace-it real Alpha Web: paneli i moduleve, header-i, toolbar-i, lista e modeleve, filtrat dhe dokumenti A4; shell-i i modulit u afr ua me reference Alpha, ndërsa dialogu A4/toolbar-i ekzistues u ruajt.
- [x] Rindërto workspace-in e modulit të zgjedhur me chrome të bardhë Alpha, vetëm kërkim/komanda dhe kartat e vogla në rresht, pa header-in modern vjollcë e datat e katalogut; `/reports?module=Blerje` dhe `/reports?module=CRM` u verifikuan me screenshot; 44 teste targetuara kaluan.
- [x] Sinkronizo shell-in vizual Alpha të ReportsCenter në BioBes dhe verifiko CI green; commit `2c8f65d0434a61d175e106163ad5c671035e1d19` u shty në `github/main`; CI green: https://github.com/genilufra-droid/BioBes/actions/runs/32975376042.
- [x] Përshtat katalogun e Magazina me 23 modelet reale Alpha të verifikuara live, duke hequr hyrjet e shpikura dhe duke ruajtur çelësat backend vetëm kur kanë të dhëna reale; u hoqën 4 hyrje cloud të shpikura, alias-et përdorin baseKey reale, dhe kaluan check + 24/24 testet e katalogut/menusë.
- [x] Hiq nga katalogu i Raporteve header-in global të Analizave dhe sidebar-in vizual kur është brenda workspace-it Alpha; `/reports?module=Blerje` dhe `/reports?module=Magazina` tani hapen vetëm me dritaren e Raporteve.
- [x] Hiq strukturat custom të ReportsCenter (header global Analiza, kartat/ndarjet jo-Alpha, datat dhe wrapper-at modernë) dhe mbaj vetëm `Raportet.aspx`/`Raport_PivotGrid` si hierarki vizuale; shell-i global u hoq vetëm nga route-i `/reports`, filtrat/eksportet u ruajtën, check dhe 49 teste kaluan.
- [x] Sinkronizo në BioBes shell-in vetëm-Alpha të `App.tsx`, katalogun 23-modelësh të Inventarit dhe kontratat e testeve; commit `3b8baa84431bad3546e99c592fc88b5f4a167702` u shty në `github/main`; CI green `32977573606`: https://github.com/genilufra-droid/BioBes/actions/runs/32977573606.
- [x] Në workspace-in e modulit të zgjedhur, hiq panelin custom `Të përgjithshme/Konfigurimi/Raporti`, veprimet Ruaj/Shto/Klono/Modifiko/Fshi dhe drag-fields; lër vetëm listën Alpha të modeleve dhe hyrjen në filtër me klik.
- [x] Audit pagesat në raportet e faturimeve/situacioneve: lidh pages, statusin PAID/PARTIAL dhe shumën e mbetur me faturën e së njëjtës kompani; shto test që pagesa ndryshon realisht totalet e raportit.

## Reports Alpha parity — payment audit (2026-08-26)
- [ ] Audit all sales/purchase/partner situation and billing reports against real company-scoped payment records.
- [x] Add payment-aware paid, remaining, and status columns/metrics where report families require them.
- [x] Add regression tests for partial/full payment aggregation and unmatched payment rows.
- [x] Remove remaining non-Alpha report workspace tabs and model-list action buttons.
- [ ] Audit Kontabilitet and Banka report catalog against the live Alpha navigation without changing operational modules.
- [x] Run targeted/full tests, check, build, and sync the verified reports-only changes to BioBes.

## Reports Alpha parity — inherited follow-up
- [ ] Verify payments are reflected in every relevant invoice, situation, balance, and partner report using current company data.
- [ ] Do not mark the reports follow-up complete until source code and tests are synced to GitHub.

## Live Blerje / Purchases audit (2026-08-26)
- [x] Audit live Alpha nga menuja kryesore te Blerje dhe nënmenutë e saj.
- [x] Audit modelet e raporteve të Blerjeve, renditjen, accordion-et dhe numërimin e modeleve.
- [x] Audit filtrat realë të raporteve të Blerjeve dhe rrjedhën e aplikimit të tyre.
- [x] Audit hapjen e dokumentit të blerjes dhe pamjen e formularit/dokumentit kundrejt Alpha.
- [x] Dokumento mospërputhjet me URL, hapa dhe screenshot-e para implementimit.
- [x] Zbato vetëm korrigjimet e Reports/Blerje të konfirmuara nga auditimi.
- [x] Verifiko rrjedhën Blerje end-to-end me testet, check/build dhe screenshot-e.

## Alpha visual correction — Blerje (2026-08-26)
- [x] Përshtat layout-in e workspace-it të Blerjeve me pamjen live Alpha dhe hiq hapësirat e panevojshme.
- [x] Përshtat kartat e modeleve të Blerjeve me renditjen dhe dendësinë e Alpha-s.
- [x] Përshtat dritaren e filtrave të faturave të blerjes me panelin e Alpha-s dhe toolbar-in e saj.
- [x] Verifiko që rrjedha Model → Filtra → Shiko → Dokument hapet dhe mbyllet si në Alpha.

## Alpha 1:1 Blerje filters — refinement (2026-08-26)
- [x] Hiq wrapper-at dhe kontrollet e mbetura jo-Alpha nga workspace-i i Blerjeve.
- [x] Riorganizo katalogun e Blerjeve sipas listës live Alpha dhe grupeve Kryesore/Te Tjera 2.
- [x] Rindërto panelin e filtrave të faturave sipas seksioneve kryesorë/avancuar të Alpha-s.
- [x] Verifiko 1:1 pamjen në desktop dhe rrjedhën e filtrave me Shiko/Pastro/Mbyll.

## Inline Alpha filters — Blerje (2026-08-26)
- [x] Hiq hapjen e modalit të filtrave kur zgjidhet një model Blerje.
- [x] Shfaq filtrat direkt në workspace-in e Blerjeve si në Alpha.
- [x] Apliko `Shiko`, `Pastro` dhe `Faqe Re` pa popup filtrash.
- [x] Shfaq rezultatin në të njëjtën faqe me mundësi kthimi te filtrat dhe hapje dokumenti.

## Blerje demo → Shitje inline reports (2026-08-26)
- [x] Hape live modulin Blerje dhe kontrollo hyrjen, formularin dhe ruajtjen e blerjes demo.
- [x] Përdor blerjen demo në raportet e Blerjeve dhe verifiko filtrat inline, totalet, pagesën dhe dokumentin.
- [x] Audit existing Shitje report models, data contract, filters, and document links before reuse.
- [x] Apliko workspace-in Alpha inline dhe filtrat e Blerjeve edhe te Raporte → Shitje.
- [x] Shto regresione për model-list, filter visibility, inline result flow, and payment/status rendering for Shitje.
- [x] Verifiko Shitje end-to-end me screenshot, tests, check, build, and checkpoint.

## Blerje demo validation bug (2026-08-26)
- [x] Rregullo humbjen e `itemId` në rreshtin e faturës kur artikulli zgjidhet nga sugjerimi dhe ndryshohet çmimi.
- [x] Lejo ruajtjen e draftit me rresht artikulli të zgjedhur dhe pa magazinë, pa raportuar gabimisht `Please select an item in the list`.
- [x] Verifiko se kontrolli i stokut aktivizohet vetëm kur magazina zgjidhet dhe dokumenti nuk postohet pa stok të mjaftueshëm.

## Alpha filter panel geometry — Blerje + Shitje (2026-08-27)
- [x] Hiq çdo rezultat të ndarë poshtë filtrave për rrjedhën fillestare dhe mbaje workspace-in në strukturën Alpha.
- [x] Përshtat panelin me kolonat Lista e Raporteve majtas, filtrat qendrorë/djathtas dhe Shuma poshtë majtas.
- [x] Përshtat seksionet Number Document, Type, Currency, Date Registration, Identifikues dhe Magazina/Klienti sipas Alpha.
- [x] Mbaj toolbar-in Alpha në një rresht me Mbyll, Shiko, Faqe Re, Pastro, Lista dhe Vizualizo në Delta.
- [x] Verifiko të njëjtin layout dhe filtrat për Blerje dhe Shitje në desktop dhe mobile.

## Reports only in Raporte menu (2026-08-27)
- [x] Gjej të gjitha hyrjet dhe dritaret e raporteve të integruara në modulet operative.
- [x] Hiq listat/dritaret e raporteve nga Blerje, Shitje dhe Magazina pa prekur formularët e dokumenteve.
- [x] Ruaj aksesin e raporteve vetëm nga menuja Raporte dhe dokumentet e hapura prej saj.
- [x] Shto regresione që modulet operative të mos renderojnë më report workspace/modal.
- [x] Verifiko navigimin operacional dhe Raporte në desktop/mobile me check, test, build dhe screenshot.

## Remove legacy report dialogs — Blerje, Shitje, Magazina (2026-08-27)
- [x] Hiq dialogun legacy të raportit nga çdo kategori ku ende hapet si dritare qendrore.
- [x] Hape filtrin e secilit raport direkt në workspace-in e Raporteve, pa overlay ose modal.
- [x] Mbaj listën e raporteve, filtrat e kategorisë dhe komandat Alpha në të njëjtën faqe.
- [x] Verifiko në veçanti Magazina, Blerje dhe Shitje në desktop dhe mobile.

## Refaktorim i komponentit inline të Raporteve (2026-08-27)
- [x] Riemërto komponentin e përbashkët të filtrave nga emër specifik Blerje në emër neutral Alpha dhe ruaj parametrat sipas kategorisë.
- [x] Verifiko regresionet dhe sinkronizo source-in e refaktorizuar në BioBes.

## Pastrim i workspace-it legacy të Raporteve (2026-08-27)
- [x] Hiq importet e panevojshme të mbetura nga komponentët e hequr të workspace-it legacy, pa prekur dokumentin e raportit ose lookup-un.

## Korrigjim — pa wrapper dritare për filtrat e Raporteve (2026-08-27)
- [x] Hiq kornizën dhe titullin e mbetur të dritares nga workspace-i inline, që klikimi i raportit të shfaqë vetëm filtrat Alpha në vetë faqen.
- [x] Verifiko Blerje, Shitje dhe Magazina në desktop/mobile, pastaj sinkronizo vetëm source-in e verifikuar.

## Autentikim — llogari e re dhe rivendosje fjalëkalimi (2026-08-27)
- [x] Audito hyrjen ekzistuese dhe rrugët lokale/OAuth për të përcaktuar rrjedhën e sigurt të regjistrimit dhe reset-it.
- [ ] Shto hapje llogarie të re dhe kërkesë të sigurt për rivendosje fjalëkalimi pa zbuluar llogari ekzistuese.
- [x] Shto testet e autorizimit/rate-limit dhe verifiko rrjedhën në browser përpara sinkronizimit në BioBes.

## Autentikim lokal i pavarur nga Manus (2026-08-27)
- [x] Hiq kërkesën për hyrje Manus nga rrjedha normale e aplikacionit dhe përdor sesionin lokal për të gjithë përdoruesit.
- [ ] Shto regjistrim, hyrje, dalje dhe rivendosje fjalëkalimi lokale me kufizim kërkesash dhe pa zbulim të llogarive ekzistuese.
- [x] Ruaj kompanitë ekzistuese dhe lejo hyrjen në workspace pa krijuar një kompani të re nga browser-i.
- [x] Shto teste dhe verifiko në browser hyrjen lokale përpara sinkronizimit në BioBes.
- [x] Lejo pronarin ekzistues pa passwordHash të caktojë fjalëkalimin e parë lokal vetëm me sekretin njëpërdorimësh të serverit.
- [x] Krijo një llogari të re lokale pa i dhënë automatikisht akses në të dhënat e kompanive ekzistuese.
- [x] Krijo ndryshim fjalëkalimi për përdoruesin e autentikuar dhe një rrjedhë të sigurt ndihme për fjalëkalim të harruar.
- [x] Zëvendëso të gjitha thirrjet vizuale të hyrjes Manus me faqen lokale `/login`.
- [x] Diagnostiko dhe rregullo dështimin publik `Activation could not be completed` për pronarin ekzistues, pa ndryshuar kompanitë ose të dhënat e tij.
- [x] Provo aktivizimin e pronarit me përgjigje të sigurt, pa ekspozuar sekretin, dhe publiko vetëm pasi endpoint-i publik funksionon.
- [x] Riprodho dështimin e përsëritur të aktivizimit në rrjedhën reale dhe shto diagnostikim server-side pa zbuluar kredenciale ose ekzistencën e llogarive.

## Bllokues — faturat nga Regjistrime (2026-08-27)
- [x] Riprodho nga menuja Regjistrime hapjen e Faturës së Blerjes dhe Faturës së Shitjes për përdoruesin dhe kompaninë aktive.
- [x] Korrigjo targetet e menusë ose parametrat e route-it që pengojnë hapjen e formularëve, pa prekur Pagat.
- [ ] Verifiko ruajtjen e draftit në Blerje dhe Shitje me kompani të autorizuar, pa krijuar të dhëna testimi të panevojshme.
- [x] Verifiko që domaini publik shërben bundle-in e korrigjuar të Regjistrimeve para provës së përdoruesit.

## Raporte Blerje — filtrat e regjistrit dhe modele të veçanta (2026-08-27)
- [x] Audito filtrat e regjistrit të faturave dhe çelësat/degët reale për secilin nga 18 modelet Blerje.
- [x] Shto filtrat specifikë të regjistrit të faturave vetëm te raportet që marrin fatura, pa shtuar fusha të parëndësishme te kartelat ose listat.
- [x] Ndaj modelet që kthejnë të njëjtin dataset në raport me kolonat, grupimet dhe burimin real përkatës.
- [ ] Shto regresione dhe verifiko Blerje në browser me të dhënat reale të kompanisë aktive para sinkronizimit.
- [x] Hape regjistrin e faturave me historikun e plotë të kompanisë aktive; kufizoje vetëm kur përdoruesi vendos interval date.

## Bllokues — dalja nga Raportet (2026-08-27)
- [x] Riprodho ekranin e filtrave/rezultateve të raportit që ngec pa dalje për përdoruesin.
- [x] Shto komandë të qartë për kthim te katalogu i Raporteve dhe komandë për faqe kryesore, pa rikthyer modalin e vjetër.
- [ ] Verifiko në browser kthimin nga Blerje, Shitje dhe Magazina te katalogu dhe faqja kryesore.

## Raportet — përputhja e formatit Alpha (2026-08-27)
- [x] Krahaso katalogun, filtrat, komandat dhe grid-in e rezultateve me rrjedhën reale të Alpha Web.
- [x] Zbato ndryshimet prioritare të formatit pa rikthyer modalin dhe pa ndryshuar të dhënat reale të raporteve.
- [ ] Verifiko në browser formatin e Blerje, Shitje dhe Magazina kundrejt referencës Alpha.

## Raportet — uniformiteti modul/model (2026-08-27)
- [x] Inventarizo çdo raport me modulin e katalogut, burimin e të dhënave dhe komponentin e pamjes së rezultatit.
- [x] Hiq hartëzimet e pasakta ndërmjet moduleve dhe çdo fallback të pamjes së vjetër për raportet e standardizuara.
- [x] Standardizo formatin e rezultateve Blerje, Shitje dhe Magazina në komponentin e dedikuar sipas modelit Alpha.
- [x] Shto regresione për të provuar që një çelës raporti nuk merr modul ose model pamjeje të gabuar.

## Raportet — eliminimi i pamjeve të vjetra (2026-08-27)
- [x] Inventarizo të gjitha degët e renderimit të Raporteve që ende përdorin shell, tabelë ose print-preview të trashëguar.
- [x] Hiq fallback-et e pamjes së vjetër dhe përdor formatin e unifikuar Alpha për ekran, print dhe eksport.
- [x] Shto teste që ndalojnë rikthimin e klasave dhe markup-ut të pamjeve të vjetra në rrjedhën e Raporteve.

## Stabiliteti i preview — Vite WebSocket (2026-08-27)
- [ ] Audito dhe rregullo shkëputjen `failed to connect to websocket` në preview, pa prekur sesionin lokal ose të dhënat e kompanisë.

## Përdorimi nga iPhone/iPad (2026-08-27)
- [ ] Përshtat navigimin kryesor për ekran të ngushtë, pa prerë ose fshehur menutë e sistemit.
- [ ] Verifiko hyrjen lokale dhe ambientin kryesor në pamje iPhone pa scroll horizontal të paqëllimshëm.

## Standardi Alpha Web — të gjitha modulet (2026-08-27)
- [ ] Inventarizo pamjet dhe komponentët e trashëguar në Blerje, Shitje, Magazina dhe Regjistrime, duke ruajtur rrjedhat dhe të dhënat aktuale.
- [ ] Standardizo shell-in, toolbar-in, filtrat, tabelat dhe formularët e Blerjeve sipas gjuhës vizuale Alpha.
- [ ] Standardizo shell-in, toolbar-in, filtrat, tabelat dhe formularët e Shitjeve sipas gjuhës vizuale Alpha.
- [ ] Standardizo shell-in, toolbar-in, filtrat, tabelat dhe formularët e Magazinës dhe Regjistrimeve sipas gjuhës vizuale Alpha.
- [ ] Verifiko në browser desktop/mobile çdo modul të standardizuar pa prishur navigimin, RBAC ose kompaninë aktive.
