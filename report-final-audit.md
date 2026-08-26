# Auditimi final i Raportit të Kartelës së Furnitorit

Më 24 gusht 2026 u verifikua në preview lokal raporti `purchase_supplier_card_format3_pdf`.

Filtri `Furnitor / Klient: Ana` u aplikua nga formulari para `Shiko`. Pas ekzekutimit, formulari u mbyll dhe u shfaq vetëm dokumenti i raportit. Header-i i dokumentit u përditësua në `Furnitori: Ana`, ndërsa dataset-i përmbante vetëm dokumentet 556767, BL-05, BL-01 dhe bl-01. Totali i shfaqur ishte 26,160 dhe Kreditor 24,000.

Dokumenti përdori layout-in horizontal reference: vit sipër majtas, titull në qendër, periudha, identifikimi i furnitorit/llogarisë/monedhës/titullit/NIPT-it, tabelë e verdhë me grupin `Monedhe Baze`, kolonat Debi/Kredi/Progresivi, totalet dhe linket `↗` te dokumentet burimore.

U shtua eksporti i posaçëm PDF për Kartelën e Furnitorit Formati i Thjeshtë dhe Print Preview kopjon fletën reference nga DOM-i, në vend të tabelës moderne. TypeScript, 59 skedarë testi dhe 211 teste kaluan; build production kaloi.

Mbetet të kontrollohet nga përdoruesi pamja e skedarit të shkarkuar PDF në viewer-in lokal, sepse klikimi i browser-it e nis download-in por viewer-i nuk hapet brenda të njëjtit preview.

## Verifikimi pas korrigjimit të eksportit

Eksporti PDF u shkarkua si `purchase_supplier_card_format3_pdf_2026-08-24.pdf`; `pdfinfo` konfirmoi 1 faqe dhe përmasën A4 landscape `841.89 x 595.28 pt`. Preview-ja pas restart-it konfirmoi përsëri rrjedhën vetëm-dokument, kolonat e grupuara dhe linket `↗`. U korrigjua formatimi i datave ISO në `dd/mm/yyyy` dhe u kufizua shiriti `Filtra aktive` vetëm te filtrat e përdoruesit, pa futur `Mon`, `Titulli` ose meta të tjera në filtrin aktiv.

## Verifikimi i linkeve në PDF

PDF-ja e fundit u renderua në një faqe A4 landscape. Shigjetat tani paraqiten si vektorë të dukshëm në kolonën `Nr Dok`, pa glyph të dëmtuar. `pdftohtml` konfirmoi link-ankorat reale për të 8 dokumentet, me URL-të `/purchase-invoices?openInvoice=...` për dokumentet 7067, TEST-BL-WH-20260823, TEST-FG-20260823, 556767, 685, BL-05, BL-01 dhe bl-01.

## Fillimi i auditimit të Shitjeve

U verifikua se moduli Shitje hap listën e vet me 36 raporte, formularin legacy dhe pa dokument para `Shiko`. Raporti `sales_summary_register_pdf` me `Klienti: Ana` shfaq `Nuk ka të dhëna`, ndërsa ekzekutimi pa filtër shfaq faturën reale `TEST-SH-OUT-20260823`; kjo tregon se filtri i klientit po aplikohet dhe nuk po shpik rreshta. Linku `↗` i faturës u klikua dhe hapi `/sales-invoices?openInvoice=1`, ku u shfaq dokumenti real i shitjes së Anës. Ky audit i Shitjeve mbetet i hapur për përputhjen e PDF/Print me PDF-të reference.

## Regjistri Përmbledhës i Shitjeve — renderer reference

U shtua renderer-i i veçantë për `sales_summary_register_pdf` sipas `crshitjeregjistripermbledhes.pdf`: titull kapital, vit, periudhë e normalizuar `01/01/2026-31/12/2026`, grupimet `Dokumenti`, `Vlefte Artikulli`, `Zbritje`, `Vlera me Zbritje` dhe `Vlera ne Mon Baze`, rreshti numerik i kolonave, totalet dhe linku burimor `↗`. Në preview live u verifikua një faturë reale `TEST-SH-OUT-20260823`, dokumenti hapet vetëm pas `Shiko`, dhe faqja pas dialogut nuk shfaqet. Suite-i pas ndryshimit: 59 skedarë, 212 teste të kaluara, `pnpm check` dhe `pnpm build` pa gabime.

## Eksporti PDF i Shitjeve

Eksporti `sales_summary_register_pdf_2026-08-24 (1).pdf` u verifikua si 1 faqe A4 landscape, me datën `8/23/2026`, periudhën `01/01/2026-31/12/2026`, header-in me grupime dhe 16 numra kolonash, totalet dhe footer-in. Layout-i është i njëjtë me renderer-in cloud dhe nuk përdor më tabelën moderne gjenerike. Linku burimor është ruajtur në qelizën e dokumentit përmes zonës PDF të klikueshme.

## Shitjet sipas Sasisë Total — specifikimi reference

PDF-ja `/home/ubuntu/upload/crmarkshitjetsipassasisetotal.pdf` është 35 faqe me format horizontal shumë të ulët `842 x 204 pt`, pra raport rreshtash me një artikull ose grup artikujsh për faqe. Header-i përmban vitin, titullin `SHITJET SIPAS SASISE TOTAL`, periudhën `01/01/2026-31/12/2026`, muajt Janar–Dhjetor dhe një rresht për artikull me sasitë mujore në dy shifra dhjetore. Footer-i ka datën e printimit, burimin dhe numrin e faqes. Ky format nuk është tabelë moderne standarde dhe kërkon renderer horizontal me kolonat e muajve.

## Test filtri — Shitjet sipas Sasisë Total

U vendos filtri `Data deri: 2026-08-22` në formular dhe pas `ENTER–Shiko` dokumenti shfaqi vetëm PDF-në e raportit, me filtrin aktiv në header. Fatura reale e datës `2026-08-23` u përjashtua dhe dokumenti shfaqi `Nuk ka të dhëna`, duke konfirmuar se filtri kalon në query/dataset dhe jo vetëm në pamje.

## Përfundim i auditimit — Sasia Total

Renderer-i live dhe eksporti PDF përdorin të njëjtin format horizontal reference `842×204 pt`. Dokumenti ka vitin, titullin, periudhën, 12 muajt, artikullin, vlerat me dy shifra dhjetore dhe footer-in me burimin/faqen. Testi i filtrit `Data deri: 2026-08-22` hoqi shitjen e 23 gushtit dhe shfaq vetëm dokumentin e filtruar. Build-i dhe suite-i kaluan me 212 teste; moduli i Pagave nuk u prek. Ky rezultat mbetet draft dhe nuk është publikuar me checkpoint.

## Shitjet sipas Sasisë — specifikimi reference

PDF-ja `/home/ubuntu/upload/crmarkshitjetsipassasise.pdf` është 19 faqe me format `842×204 pt`. Titulli është `SHITJET SIPAS SASISE`, me periudhën poshtë. Dokumenti ka segmente sipas `Klienti`, `Grupi` dhe `Nengrupi`, pastaj 12 muajt Janar–Dhjetor. Për çdo segment ka rreshta artikujsh dhe rreshta `Totali per nengrupin` / `Totali per grupin`, me footer-in e printimit dhe numrin e faqes.

### 2026-08-24 — Auditimi i raporteve të shitjeve

**Marzhi i Shitjeve (`sales_margin_pdf`)** u hap fillimisht si formulari legacy me listë uppercase dhe filtra. Pas `Shiko`, formulari u zëvendësua me dokumentin e vetëm reference me titullin `MARZHI I SHITJEVE`, header-in e vitit/periudhës, grupimet `Artikulli`, `Kosto dhe shitje`, `Marzhi bruto`, rreshtin real `Ferre` dhe totalin e raportit. U verifikuan shigjetat `↗105` dhe `↗Ferre`, që tregojnë se rreshti i agreguar mban faturën reale burimore. Print/Excel/PDF mbeten aktive në toolbar-in e dokumentit.

Dataset-i i shitjeve tani ruan `__documentId`/`__documentType` edhe për raportet agregate të zbritjeve, marzhit, marzhit të detajuar, shitjeve sipas artikullit dhe artikujve të shitur. Titujt e raporteve reference të shitjeve u standardizuan uppercase.

### 2026-08-24 — Auditimi i Magazinas

**Gjendja e Magazinas (`inventory_warehouse_status_pdf`)** u hap fillimisht me formularin legacy të Magazinas, listën uppercase me 27 raporte dhe filtra të njëjtë me referencën. Pas `Shiko`, formulari u zëvendësua me dokumentin e vetëm reference `GJENDJA E MAGAZINËS`. Dokumenti shfaqi meta `Magazina: Magazina Test ERP`, grupimet `Artikulli`, `Lëvizja`, `Vlerësimi`, artikullin real `105 / Ferre / Kg`, hyrje `125`, dalje `1`, gjendje `124`, kosto `110`, vleftë `13,640`, totalin e raportit dhe footer-in. Print/Excel/PDF mbeten aktive.

### 2026-08-24 — Auditimi i Blerjeve

**Maturimi Përmbledhës i Furnitorëve (`purchase_supplier_maturity_summary_pdf`)** u hap me formularin legacy të Blerjeve dhe 26 raporte. Pas `Shiko`, formulari u zëvendësua me dokumentin reference `MATURIMI PËRMBLEDHËS`. Header-i shfaqi vitin/periudhën dhe meta `Data Raportimi: 24.8.2026`, `Periudha e Maturimit: Të gjitha afatet`, `Data e Maturimit: Sipas dokumentit`. Tabela kishte grupimet `Furnitori` dhe `Koha e Maturimit`, furnitorët realë Nutreco, Ferre Geni, Ana dhe Floreta Merdani, totalin `58,520` dhe bucket-et e maturimit. Toolbar-i Printo/Excel/PDF mbeti aktiv.

### Eksportet e Blerjeve — verifikim fizik

Për `purchase_supplier_maturity_summary_pdf`, klikimi i `PDF` krijoi `/home/ubuntu/Downloads/purchase_supplier_maturity_summary_pdf_2026-08-24.pdf` me 1 faqe A4 landscape `841.89 × 595.28 pt`; `pdftotext -layout` konfirmoi titullin `MATURIMI PËRMBLEDHËS`, furnitorët realë, totalin `58,520` dhe footer-in. Klikimi i `Excel` krijoi `/home/ubuntu/Downloads/purchase_supplier_maturity_summary_pdf_2026-08-24.xlsx` me 7,639 bytes. Klikimi i `Printo` u ekzekutua nga toolbar-i pa toast/error në raportin e hapur.

### Eksportet e Shitjeve — Marzhi i Shitjeve

Për `sales_margin_pdf`, dokumenti live shfaqi shigjetat `↗105` dhe `↗Ferre`. PDF-ja e shkarkuar `/home/ubuntu/Downloads/sales_margin_pdf_2026-08-24.pdf` ka 1 faqe A4 landscape `841.89 × 595.28 pt`; `pdftotext -layout` konfirmoi `MARZHI I SHITJEVE`, grupimet, rreshtin real `105 / Ferre / Kg`, vlerat `110`, `120`, marzhin `10` dhe totalin. Excel-i `/home/ubuntu/Downloads/sales_margin_pdf_2026-08-24.xlsx` u krijua me 7,611 bytes.

### Eksportet e Magazinas — Gjendja e Magazinas

Për `inventory_warehouse_status_pdf`, PDF-ja `/home/ubuntu/Downloads/inventory_warehouse_status_pdf_2026-08-24.pdf` u krijua me 1 faqe A4 landscape `841.89 × 595.28 pt`; teksti konfirmoi `Gjendja e magazinës`, magazinën `Magazina Test ERP`, artikullin `105 / Ferre / Kg`, hyrje `125`, dalje `1`, gjendje `124`, kosto `110`, vleftë `13,640` dhe totalin. Excel-i `/home/ubuntu/Downloads/inventory_warehouse_status_pdf_2026-08-24.xlsx` u krijua me 7,505 bytes.

### Verifikimi i linkut source të Shitjeve

Në `sales_margin_pdf`, pas `Shiko`, rreshti i artikullit shfaqi `↗105` dhe `↗Ferre`. Klikimi i shigjetës `↗105` navigoi në `/sales-invoices?openInvoice=1` dhe hapi dokumentin real `Faturë shitjeje — TEST-SH-OUT-20260823`, me klientin Ana, datën 8/23/2026, magazinën Magazina Test ERP, monedhën ALL dhe pamjen A4 të faturës. Kjo konfirmon lidhjen nga raporti agregat te dokumenti burimor real.

### Verifikimi i source link-ut te Maturimi Përmbledhës i Furnitorëve

Pas ekzekutimit të `purchase_supplier_maturity_summary_pdf`, rreshtat e furnitorëve shfaqën `↗` në kolonat `Kod Klienti` dhe `Emri`. Klikimi i `↗Nutreco` hapi `/purchase-invoices?openInvoice=180001` dhe dokumentin real të blerjes `7067`, me furnitorin Nutreco, datën 8/23/2026, magazinën Magazina Test ERP, monedhën L dhe vlerën 120.00 L. Kjo konfirmon lidhjen e rreshtit agregat me faturën reale burimore.

### Verifikimi i PDF-së me source annotations

PDF-ja e fundit `purchase_supplier_maturity_summary_pdf_2026-08-24 (2).pdf` u shkarkua nga toolbar-i i raportit dhe u validua me `pdfinfo`/`pdftotext`: 1 faqe, A4 landscape, titull `MATURIMI PËRMBLEDHËS`, të dhëna reale dhe totalet e furnitorëve. Kontrolli raw i PDF-së konfirmoi annotation-et `/purchase-invoices?openInvoice=180001`, `150001`, `90001` dhe `60001`; pra linku burimor ruhet edhe në eksportin fizik, jo vetëm në dokumentin e shfaqur.

### PDF source-link implementation

Exporter-i generic reference tani klasifikon kolonat e dokumentit/agregimit, vizaton `↗` mbi qelizën source dhe vendos `doc.link(...)` për faturat `purchase-invoice` dhe `sales-invoice`. U shtuan helper-a të testueshëm për URL-të dhe normalizimin e kolonave. Testet: 59 skedarë / 215 teste të kaluara; `pnpm check` dhe `pnpm build` pa gabime. Pagat nuk u prekën.

## Auditim live — Artikujt e Shitur (`sales_items_sold_pdf`)

U hap formulari legacy i Raporteve të Shitjes dhe rezultati u shfaq vetëm pas ENTER–Shiko. Dokumenti u paraqit me titullin uppercase `ARTIKUJT E SHITUR`, periudhën `Fillimi — Sot`, grupimet `Artikulli`, `Vlerat` dhe `Zbritja analitike`, kolonat reference, rreshtin real `105 / Ferre / Kg` dhe totalet `Sasia 1`, `Vlefta 120`, `Në % 100`.

Shigjetat `↗ 105` dhe `↗ Ferre` u shfaqën në dokument dhe klikimi i shigjetës hapi faturën reale te `/sales-invoices?openInvoice=1`, dokumenti `TEST-SH-OUT-20260823`. PDF-ja fizike e fundit `/home/ubuntu/Downloads/sales_items_sold_pdf_2026-08-24 (3).pdf` u verifikua me `pdfinfo`: 1 faqe, A4 landscape `841.89 x 595.28 pt`, 13,485 bytes. `pdftohtml` konfirmoi annotation-et klikueshme në të dy kolonat source, me URL `http://127.0.0.1:3000/sales-invoices?openInvoice=1`.

Gjatë verifikimit u korrigjua klasifikimi i kolonave source me diakritika (`Kartelë`, `Emërtimi`) dhe u shtua fallback i sigurt për kolonën e parë kur rreshti ka metadata burimore. Pas patch-it: 59 skedarë testesh, 215 teste të kaluara, TypeScript dhe build production pa gabime. Pagat nuk u prekën.

### Gjetje diagnostike — Artikujt me Zbritje Analitike

Formulari legacy dhe document-only result kaluan. Dokumenti shfaqi `ARTIKUJT ME ZBRITJE ANALITIKE`, kolonat reference, rreshtin real `105 / Ferre / Kg`, totalet dhe shigjetat `↗105`/`↗Ferre`. PDF-ja A4 landscape dhe Excel-i u krijuan me të dhënat e njëjta; PDF-ja ruajti annotation-in `sales-invoices?openInvoice=1`. Në verifikimin pasues, targetimi korrekt i butonit `Hap dokumentin 105` navigoi në `/sales-invoices?openInvoice=1` dhe hapi faturën reale `TEST-SH-OUT-20260823`; navigimi i source-link-ut është funksional.

## Auditim live — Marzhi i Shitjeve, Formati 2 (`sales_margin_detail_pdf`)

Formulari legacy u hap pa dokument, pastaj ENTER–Shiko e zëvendësoi me dokumentin reference `MARZHI I SHITJEVE — FORMATI 2`. Dokumenti shfaqi grupet `Klienti`, `Artikujt` dhe `Shitjet dhe marzhi`, 18 kolonat reference, rreshtin real `105 / Ferre`, sasi `1`, volum `100`, vlerë shitjeje `120`, KMSH `110`, marzh `10`, marzh në përqindje `8.333`, mark up `9.091` dhe sales `100`; totalet e raportit u shfaqën në footer.

PDF-ja `/home/ubuntu/Downloads/sales_margin_detail_pdf_2026-08-24.pdf` u verifikua me `pdfinfo`: 1 faqe A4 landscape `841.89 × 595.28 pt`, 16,606 bytes. `pdftotext -layout` konfirmoi header-in, 18 kolonat, totalet dhe footer-in. `pdftohtml` konfirmoi katër annotation-e source me URL `http://127.0.0.1:3000/sales-invoices?openInvoice=1` për kodin/emërtimin e klientit dhe artikullit.

Excel-i `/home/ubuntu/Downloads/sales_margin_detail_pdf_2026-08-24.xlsx` u krijua me 7,503 bytes, sheet-in `MARZHI I SHITJEVE — FORMATI 2`, 18 kolonat reference, rreshtin `105 / Ferre` dhe totalet `1 / 100 / 120 / 110 / 10 / 8.333 / 9.091 / 100`. Print Preview u aktivizua nga toolbar-i i dokumentit pa gabim.

## Auditim live — Shitjet sipas Artikujve (`sales_by_product_pdf`)

Formulari legacy u hap pa rezultat dhe ENTER–Shiko shfaqi vetëm dokumentin reference `SHITJET SIPAS ARTIKUJVE`. Dokumenti përdori grupet `Klienti dhe artikulli` dhe `Volumi dhe vlera`, rreshtin real `Ana / 1 / 120 / Ferre / 105`, volumin `100%`, vlerën në monedhë bazë `120` dhe totalin e raportit.

PDF-ja `/home/ubuntu/Downloads/sales_by_product_pdf_2026-08-24.pdf` u verifikua si 1 faqe A4 landscape `841.89 × 595.28 pt`, 12,240 bytes. `pdftohtml` konfirmoi tri annotation-e source me URL `http://127.0.0.1:3000/sales-invoices?openInvoice=1` për Ana, Ferre dhe kodin 105. Excel-i `/home/ubuntu/Downloads/sales_by_product_pdf_2026-08-24.xlsx` u krijua me 7,453 bytes dhe përmban sheet-in reference, grupimet, rreshtin real dhe totalet `1 / 120 / 100 / 120`.

## Auditim live — Artikujt e Pashitur (`sales_unsold_items_pdf`)

Formulari legacy u hap pa dokument dhe ENTER–Shiko shfaqi vetëm dokumentin `ARTIKUJT E PASHITUR`. Renderer-i përdori një grup të vetëm `Të dhënat e raportit` dhe kolonat `Nr. Blerje`, `Dt.`, `Njësia`, `Kartelë`, `Emërtimi i Artikullit`, `Kod Bar` dhe `Gjendja`. Dataset-i real shfaqi artikujt e pashitur `copë / Gg` dhe `kg / Murriz`, me `Gjendja 0`; totali i raportit ishte `0`. Nuk u shfaq asnjë shigjetë source, gjë që është e saktë sepse këto rreshta nuk kanë faturë shitjeje burimore (`__documentId`/`__documentType`). Toolbar-i Printo/Excel/PDF mbeti aktiv.
PDF-ja `/home/ubuntu/Downloads/sales_unsold_items_pdf_2026-08-24.pdf` u verifikua me 1 faqe A4 portrait `595.28 × 841.89 pt`, 10,474 bytes. Teksti ruajti titullin, kolonat, artikujt `Gg`/`Murriz`, gjendjet zero dhe totalin zero. Numërimi i annotation-eve source ishte `0`, sipas pritshmërisë për raport pa faturë shitjeje burimore.

## Auditim live — Shitjet sipas Qyteteve (`sales_by_city_pdf`)

Formulari legacy u hap pa dokument dhe ENTER–Shiko shfaqi dokumentin `SHITJET SIPAS QYTETEVE`. Tabela reference kishte kolonat `Qyteti`, `Klientë`, `Fatura`, `Vlera`; dataset-i real shfaqi `Pa qytet`, klientë `1`, faturë `1` dhe vlerë `120`, me totalet identike. Ky raport është agregat sipas qytetit dhe rreshti nuk shfaqi shigjetë source në ekran, ndaj PDF-ja do të kontrollohet për të verifikuar nëse metadata burimore ekziston apo jo.
PDF-ja `/home/ubuntu/Downloads/sales_by_city_pdf_2026-08-24.pdf` u verifikua si 1 faqe A4 portrait `595.28 × 841.89 pt`, 6,927 bytes. Teksti konfirmoi `Pa qytet`, klientë `1`, faturë `1`, vlerë `120` dhe totalet. Nuk u gjetën annotation-e `sales-invoices`/`openInvoice`, në përputhje me agregimin sipas qytetit pa një rresht të drejtpërdrejtë dokumenti.
Excel-i `/home/ubuntu/Downloads/sales_by_city_pdf_2026-08-24.xlsx` u krijua me 7,271 bytes, sheet-in `SHITJET SIPAS QYTETEVE`, kolonat `Qyteti / Klientë / Fatura / Vlera`, rreshtin `Pa qytet / 1 / 1 / 120` dhe totalet identike.

## Auditim live — Shitjet sipas Klientëve (`sales_by_customer_pdf`)

Formulari legacy u hap pa dokument dhe ENTER–Shiko shfaqi `SHITJET SIPAS KLIENTEVE`. Tabela reference përdori grupet `Klienti` dhe `Vlerat`, me kolonat `Kodi`, `Emërtimi`, `Qyteti`, `Fatura`, `Vlefta`. Dataset-i real shfaqi klientin `K30001 / Ana`, qytetin bosh, `1` faturë dhe `120` vlerë; footer-i konfirmoi totalet `1 / 120`. Ky është agregat klientësh dhe rreshti nuk shfaqi shigjetë source në ekran.
PDF-ja `/home/ubuntu/Downloads/sales_by_customer_pdf_2026-08-24.pdf` u verifikua si 1 faqe A4 portrait `595.28 × 841.89 pt`, 7,874 bytes. Teksti konfirmoi `K30001 / Ana`, qytetin `—`, faturën `1`, vlerën `120` dhe totalet. Numërimi i annotation-eve source ishte `0`, në përputhje me rreshtin agregat të klientit pa lidhje direkte dokumenti.
Excel-i `/home/ubuntu/Downloads/sales_by_customer_pdf_2026-08-24.xlsx` u krijua me 7,372 bytes, sheet-in `SHITJET SIPAS KLIENTEVE`, kolonat reference dhe rreshtin `K30001 / Ana / — / 1 / 120`; totalet janë `1 / 120`.

## Auditim live — Lista e Çmimeve të Shitjes (`sales_price_list_pdf`)

Formulari legacy u hap pa dokument; pas ENTER–Shiko u shfaq `LISTA E ÇMIMEVE` me meta `Grupi: —` dhe `Nengrupi: —`. Tabela reference kishte `Kartela`, `Kodbari`, `Emërtimi i Artikullit`, `Njesia`, `Grupi`, `Nengrupi` dhe `Cmimi 1` deri `Cmimi 5`. Dataset-i real shfaqi artikujt pa emërtim/kodbar, `Gg` dhe `Murriz` me njësi `copë`/`kg`, si dhe artikullin `105 / Ferre / 4545566556 / Kg`; çmimi 1 për Ferre ishte `120`, nivelet e tjera zero dhe totalet përputheshin. Shigjetat `↗` u shfaqën për kolonat e kartelës/kodbarit/emërtimit, që hapin kartelën e artikullit burimor.

## Përditësim auditimi — Source-link dhe Print Preview

Pas auditimit fillestar, raportet agregate `sales_by_city_pdf` dhe `sales_by_customer_pdf` u pasuruan me faturën reale burimore kur ekziston, duke mundësuar shigjetën `↗` në UI, PDF dhe Print Preview. Print Preview përdor tani të njëjtin helper route si PDF exporter-i për faturat, kthimet, produktet, lëvizjet e magazinës, Pranimet dhe Kthimet e Blerjeve. `purchase_supplier_situation_category_pdf` ndahet sipas monedhës reale dhe ruan burimin e faturës së parë të çdo grupi. Verifikimi teknik i fundit: 59 skedarë / 217 teste, `pnpm check` dhe `pnpm build` pa gabime.

### Verifikim vizual i formularit të Blerjeve — 24/08/2026
Preview live i `/reports?module=Blerje&report=purchase_supplier_card_format3_pdf` konfirmoi dritaren e izoluar legacy me toolbar Mbyll/Shiko/Ndihmë/Printo, listën e 26 raporteve të Blerjeve, panelet e filtrave dhe etiketat e korrigjuara QYTETI, PERIUDHËSI, SI DOK. MAGAZINE, FURNITORI dhe SERIALI. Formulari hapet pa dokument para ENTER–Shiko.

## Specifikim reference — Faturat dhe Pagesat

Analiza e `crshitjefaturimedhepagesa.pdf` konfirmon 1 faqe në format A4 landscape, me vitin sipër majtas, titullin uppercase `FATURAT DHE PAGESA`, periudhën në qendër, filtrat `Furnitori` dhe `Monedha`, si dhe tabelën me grupet `Lloji`, `Dokumenti` dhe `Vlefta`. Kolonat janë `Fature`, `Pagese`, `Numer`, `Date`, `Pershkrimi`, `Faturuar`, `Paguar`, `Diferenca`; në fund ka `Shuma` dhe `Totali`, plus footer me datën, printerin dhe numrin e faqes.

## Verifikim live 2026-08-24 — Faturime dhe Pagesa

Preview pas checkpoint-it 76d009cb konfirmoi 150 raporte gjithsej dhe 27 raporte në modulin Blerje. Raporti `FATURIME DHE PAGESA` shfaqet në grupin e formateve reference.

Formulari u hap fillimisht pa dokument rezultat dhe me filtra të lidhur me modulin Blerje: Kartela, FURNITORI, dokumenti, monedha, magazina dhe periudha; filtrat e klientit/shitësit të Shitjeve nuk u shfaqën. U konfirmua edhe lookup-u i furnitorit dhe ruajtja e vlerës së futur `Ana`.

Pas `ENTER - Shiko` dokumenti shfaqet i izoluar në pamjen reference A4 me kolonat Fature, Pagese, Numer, Date, Pershkrimi, Faturuar, Paguar dhe Diferenca, grupet DOKUMENTI/VLERAT, rreshtin total dhe toolbar-in Printo/Excel/PDF. Pas `Mbyll`, sistemi kthehet te i njëjti formular i raportit, jo te faqja e përgjithshme.

## Verifikim publik pas pastrimit global — 2026-08-24

Domain-i publik `genitcloud-6uxcgqji.manus.space` u kontrollua pas versionit 28726d0a. Preview-i u ngarkua dhe shfaqi 150 raporte gjithsej dhe 27 raporte në Blerje. Formulari i Blerjeve shfaq vetëm Numer Dokumenti, Lloj Dokumenti, Monedha, DATË REGJISTRIMI, Kartela, FURNITORI dhe filtrin real të shumës me Min/Max. Panelet statike SI DOK. MAGAZINE, Filtra Grafiku, Grupi Sipas, date duplicate dhe checkbox-i i kthimeve të vitit paraardhës nuk shfaqen më. Layout-i desktop u zgjerua dhe lista uppercase është e lexueshme.

## Verifikim publik i Shitjeve pas pastrimit global — 2026-08-24

Formulari publik i Shitjeve u kontrollua pas versionit b4949480. Lista shfaq 36 raporte dhe layout-i është i zgjeruar. Pas rregullit CSS final, në pamje mbeten vetëm Numer Dokumenti, Lloj Dokumenti, Monedha, Klienti, Kartela/artikulli, datat dhe filtri real i shumës; fushat statike për Pikën e Shitjes, GRUPIM SHITJE, kthimet e vitit paraardhës, Qytetin, Shitësin, Agjentin, Llogarinë e klientit, kategoritë bosh dhe Periudhësin janë fshehur.

## Verifikim publik i Magazines pas pastrimit global — 2026-08-24

Formulari publik i Magazines u kontrollua pas versionit 12f26546. Lista shfaq 27 raporte. Në formular mbeten Numer Dokumenti, Lloj Dokumenti, Monedha, DATË REGJISTRIMI, Kartela/artikulli dhe filtri i shumës; panelet e magazinës me select statik, filtrat grafikë dhe data e dyfishtë nuk shfaqen. Kjo e mban layout-in legacy të pastër dhe të lidhur vetëm me filtrat e dataset-it të stokut.

## Verifikim publik i Kontabilitetit pas pastrimit global — 2026-08-24

Domain-i publik u kontrollua te Kontabiliteti dhe shfaqi 20 raporte. Pas hapjes së Bilancit të Provës, formulari mban vetëm filtrin real të shumës, numrin/llojin e dokumentit, monedhën dhe DATË REGJISTRIMI. Paneli Identifikues nuk ka më fusha bosh të dukshme, sepse moduli nuk përdor filtrin e artikullit në këtë formular.

## Verifikim publik i CRM-së pas pastrimit global — 2026-08-24

Domain-i publik u kontrollua te CRM dhe shfaqi 20 raporte. Pas hapjes së Pipeline CRM, formulari mban vetëm filtrin real të shumës, numrin/llojin e dokumentit, monedhën dhe DATË REGJISTRIMI. Seksioni Identifikues është i padukshëm kur nuk ka filtër artikulli, klienti ose entiteti të mbështetur për raportin.

## Verifikim publik i Bankës — 2026-08-24

Domain-i publik u kontrollua te Banka dhe shfaqi 20 raporte të organizuara në Llogari, Ekstrakte, Transaksione, Pajtime, Transferta dhe Analizë. Katalogu global u ngarkua saktë me 150 raporte dhe navigimi sipas modulit funksionon. Formulari i raportit ndjek shell-in e përbashkët të filtrave reale bazë; nuk u shfaqën panele të veçanta bosh nga modulet e tjera.

## API Fetch Error — verifikim 2026-08-24

Gabimi `TRPCClientError: Failed to fetch` u riprodhua si gjendje e dështimit të transportit gjatë një cikli restart-i të devserver-it, jo si error i qëndrueshëm i query-t. Log-u tregoi dalje `ELIFECYCLE`/`code -1` dhe rinisje të supervisor-it; pas restart-it të pastër, faqja kryesore u ngarkua me të dhënat reale të dashboard-it, faturat e blerjeve/shitjeve dhe pa output gabimi në browser console. Preview-i u kontrollua përsëri pas restart-it.

## 2026-08-24 — Rregullim i plotë i raporteve të Magazines

U identifikua se filtri i magazinës kërkonte vetëm `Magazina`, `Magazinë`, `Warehouse` dhe `__warehouseName`, ndërsa disa raporte përdornin metadata reale `__warehouse`; kjo sillte rezultate bosh. U shtua alias-i `__warehouse` dhe u rikthye në formulari legacy fusha **MAGAZINA** me lookup real, duke hequr select-et statike të dokumentit të magazinës dhe fletës doganore.

Raportet `inventory_stock`, `inventory_product_summary_pdf`, `inventory_valuation`, `inventory_low_stock`, `inventory_minimum_status_pdf`, `inventory_article_analysis_pdf`, `inventory_movements`, `inventory_analytic_register_pdf`, `inventory_transfers` dhe `inventory_adjustments` tani përdorin bilancet dhe emrat reale të magazinave. Transfertat shfaqin burimin dhe destinacionin. Variantet `inventory_movement_in`, `inventory_movement_out`, `inventory_transfer_status`, `inventory_adjustment_status`, `inventory_negative_stock` dhe `inventory_value_by_product` nuk kthejnë më të njëjtën tabelë bazë.

Verifikimi teknik kaloi **60 skedarë / 222 teste**, `pnpm check` dhe `pnpm build`. Rregullimi i fundit duhet të publikohet dhe të testohet live me zgjedhje të një magazine reale; moduli i Pagave nuk u prek.

## 2026-08-24 — Kontrolli i FATURIME DHE PAGESA

Në domain-in live raporti `purchase_invoice_payment_register_pdf` u hap dhe u ekzekutua me `Shiko` pa gabim runtime ose gabim API. Dokumenti shfaqi 8 rreshta realë me numrat 7067, TEST-BL-WH-20260823, TEST-FG-20260823, 556767, 685, BL-05, BL-01 dhe bl-01; totalet e shfaqura ishin Faturuar 58,520, Paguar 70,360 dhe Diferenca -11,840. Toolbar-i shfaqi Printo, Excel dhe PDF. Konsola e browser-it pas klikimit PDF nuk kishte output gabimi. Vërejtje vizuale: kolonat Fature/Pagese përdorin shenjën `✓` për statusin e ekzistencës së dokumentit/pagesës, ndërsa numri dhe përshkrimi shfaqen në kolonat përkatëse.

## Gjetje live — Kartela e Furnitorit

Në domain-in publik, pas ENTER–Shiko, Kartela e Furnitorit shfaq progresivin pas rreshtave dhe totalin, por meta e fundit paraqet vetëm `Kreditor: 34,360` pa etiketë të plotë `DEBITOR/KREDITOR`, pa rresht statusi të dallueshëm me ngjyrë dhe pa kolonën e statusit në tabelë. Kjo është mospërputhje me formatin e kërkuar dhe duhet të korrigjohet në renderer-in reference dhe eksportet.

## 2026-08-24 — Ndarja e raporteve të përsëritura të Magazines

U gjet se disa hyrje të katalogut përdornin të njëjtin `baseKey` pa transformim të dallueshëm. U shtuan variante reale për `Stoku sipas artikullit` dhe `Stoku sipas lokacionit`, ndërsa hyrjet/daljet, stok negativ, statuset e transfertave/inventarizimeve dhe vlera sipas artikullit ndahen sipas funksionit. Regjistrat e transfertave dhe inventarizimeve tashmë përdorin dataset-et e tyre dhe jo tabelën e përgjithshme të dokumenteve. Testi i katalogut verifikon që variantet nxjerrin rreshta/kolona të ndryshme sipas rolit; suite-i kaloi 60 skedarë / 222 teste dhe `pnpm check`.

## 2026-08-24 — Statusi i Kartelës së Furnitorit

U shtua regresion i drejtpërdrejtë për `resolveSupplierBalanceStatus`: diferenca pozitive klasifikohet DEBITOR, diferenca negative KREDITOR me shumë absolute, ndërsa diferenca zero BALANCË. Renderer-i përmban rreshtin e statusit me stil të veçantë dhe rreshtin e veçantë TOTALI I RAPORTIT; CSS-i përdor tone të dallueshme për secilin status. Suite-i kaloi 60 skedarë / 223 teste dhe `pnpm check`.

## Gjetje live pas versionit 6f365c1f

Kontrolli publik i `inventory_stock_by_product` konfirmoi se filtrat reale `Kartela` dhe `Magazina` shfaqen, por formulari ende shfaq globalisht `Shuma`, `Numer Dokumenti`, `Lloj Dokumenti` dhe `Monedha`. Këto fusha nuk janë të gjitha relevante për raportin e stokut sipas artikullit dhe krijojnë përshtypjen se lista po merr filtra të përbashkët në vend të profilit real të raportit. Kërkohet një policy e detajuar sipas llojit të raportit, jo vetëm fshehje CSS me klasa të përgjithshme.

## Status pas policy-së së filtrave

Pas reload-it të preview-it lokal, `inventory_stock_by_product` shfaq vetëm Nr. Dokumenti, Datë Regjistrimi, Kartela dhe Magazina; `Lloj Dokumenti`, `Monedha` dhe paneli Shuma/Grupimi janë hequr. Domain-i publik u kontrollua me cache-buster `v=fc9600c1` dhe ende shfaq versionin e vjetër, sepse policy-ja e re u implementua pas atij checkpoint-i. Kërkohet checkpoint i ri për ta sjellë këtë gjendje në domain publik.
