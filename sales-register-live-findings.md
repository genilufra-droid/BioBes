# Sales register live findings

- Timestamp: 2026-08-24 13:24 Europe/Berlin.
- Navigimi te `/sales-invoices` u përgjigj, por screenshot-i i preview-it ishte bosh.
- Console browser nuk kishte output.
- Log-et e rrjetit treguan përgjigje HTTP 200 për customer.list, delivery.list, salesOrder.list, salesReport.summary dhe salesQuotation.list.
- Në fragmentin e log-ut të kontrolluar nuk u pa ende kërkesa `salesInvoice.register`; duhet verifikuar nëse komponenti renderohet dhe nëse query i ri po dërgohet.
- `pnpm check` dhe testet regresive të regjistrit kishin kaluar para këtij verifikimi.


## Second live check

Pas rifreskimit të preview-it dhe hapjes së skedës `Faturat`, regjistri renderohet. U konfirmuan butonat `Excel`, `PDF` dhe `Faturë e re`; paneli me filtrat sipas kolonave; kolonat vertikale në stilin e regjistrit të Blerjeve; një rresht real `TEST-SH-OUT-20260823`; statusi i pagesës me ngjyrë; totalet e faturave, sasisë dhe vlerës; si dhe shigjeta `↗` me hint për hapjen e faturës A4.

U konfirmua gjithashtu se importet e vjetra nuk u hoqën: fatura reale ekzistuese del në regjistrin e ri dhe numri i faturave në header mbetet i saktë.


## Document-link check

Klikimi i shigjetës `↗ TEST-SH-OUT-20260823` hapi dokumentin real në pamje A4 Portrait fullscreen. Dokumenti shfaqi klientin Ana, datën, magazinën, monedhën ALL, kursin dhe rreshtin e artikullit. Klikimi `Mbyll` e riktheu përdoruesin në regjistrin e Shitjeve pa dead-end.


## Column-filter check

Në fushën `Klienti` u vendos `Ana` dhe u shtyp `Shfaq rezultatet`. Paneli u mbyll, shfaqet `Shfaq filtrat (1)`, përmbledhja ruajti `Klienti: Ana`, dhe rreshti real i faturës mbeti i filtruar. Kjo verifikon sjelljen Excel-like të filtrave të regjistrit.


## Workbook import check after parser patch

Workbook-u real u ngarkua me sukses dhe preview-i lexoi 84 fatura shitjeje, 342 rreshta artikujsh dhe 930 rreshta blerjesh të anashkaluara. Megjithatë, preview-i ende shfaqi gabimet e vjetra për rreshtat 24 dhe 36 me `Nr. Fature`, edhe pse parseri u ndryshua për t'i kapërcyer header-at e përsëritur. Kjo tregon se preview-i i hapur po përdor bundle/shërbim të vjetër dhe kërkon restart të dev serverit për verifikim të pastër.


## After restart

Pas restart-it, aplikacioni u ngarkua normalisht pas një momenti pritjeje dhe nuk shfaqet më faqja bosh. U kthye në skedën fillestare `Oferta`; testi i importit duhet përsëritur duke hapur `Faturat` dhe duke ngarkuar workbook-un real pas restart-it.


## Import dialog after restart

Pas restart-it skeda `Faturat` dhe dialogu `Importo shitjet nga Excel` hapen normalisht. Input-i i workbook-ut dhe zgjedhja e magazinës janë të pranishme; testi i preview-t vijon me ngarkimin e skedarit real.


## Parser verification after restart

Pas restart-it dhe ringarkimit të workbook-ut real, preview-i shfaqi mesazhin `84 fatura u lexuan për preview` pa dy gabimet e mëparshme për rreshtat 24 dhe 36. U ruajtën paralajmërimet reale për klientë/artikuj që nuk kanë ende lidhje me master-data dhe u shfaqën 930 rreshta blerjesh të anashkaluara. Lista e magazinave shfaqi `Magazina Test ERP` si zgjedhje reale.


## Confirmed real import

Pas konfirmimit u ekzekutua `importBatch` me `Magazina Test ERP`. Log-u i rrjetit konfirmon përgjigje pa gabim (`error: null`, duration rreth 660 ms) dhe kthen faturat e krijuara me `status: POSTED`, `warehouseId: 1`, `warehouseName: Magazina Test ERP`, si dhe rreshtat e lidhur me daljet e stokut. Dialogu në preview mbeti vizualisht i hapur pas përfundimit, ndaj duhet të verifikohet rifreskimi/mbyllja e UI-së dhe numri i faturave në regjistër.


## Import result in register

Pas ekzekutimit real, dialogu u mbyll dhe regjistri rifreskoi të dhënat. Dashboard-i shfaq `44 Fatura`, ndërsa rreshtat e regjistrit kanë magazinën `Magazina Test ERP`, status `E papaguar` për importet dhe formatin `EXPORT` me EUR/kurs. Log-u backend kishte konfirmuar 84 fatura të preview-t të përpunuara pa gabim. Diferenca 84 preview kundrejt 44 fatura të dukshme duhet audituar për grupimin/numërimin e dokumenteve dhe dublikatat e numrave para se importi të konsiderohet përfundimtar.


## Invoice reference visual findings

PDF-ja `fatura_4319.pdf` ka 2 faqe A4. Faqja e parë përdor titullin `FATURË` në qendër, tre kuti të plota për Shitësi, të dhënat e lëshimit dhe Blerësi, pastaj tabelën e artikujve me kolonat përshkrim, njësi, sasi, çmim pa TVSH, zbritje, normë TVSH, vlerë pa TVSH, TVSH dhe vlerë totale. Në fund ka rreshtat e totalit, shpërndarjen e TVSH-së dhe datën e furnizimit. Faqja e dytë ka të dhënat e pagesës në krye, tabelën e mënyrës së pagesës dhe QR në të djathtë.

Ky PDF referencë është format fiskal i faturës shqiptare dhe nuk është i njëjtë me invoice-in e huaj EXPORT. Për eksportin duhet ruajtur kërkesa e veçantë e përdoruesit dhe të përdoret invoice-i i huaj i referencës kur të identifikohet mes imazheve/skedarëve të ngarkuar.


## Foreign invoice / CMR identification pass

Nga fotot e kontrolluara, `pasted_file_skQMyY_image.png` është formular porosie BioBes i plotësuar: `POROSIA 69 NR KLIENTIT 7013`, me artikujt, peshat, sasinë e porositur/ngarkuar dhe personat përgjegjës. `pasted_file_kLHRq5_image.png` është pamja e formularit të porosisë në sistem, jo invoice final dhe jo CMR. Dokumenti `crdoganimeregjimporte.pdf` është regjistër doganor eksporti me kolonat Ref., nr. fletë dog., Vlera faturës, monedha, kursi, vlera, transport, siguracion, doganë, akcizë dhe TVSH; nuk është CMR.

Invoice-i i huaj EXPORT dhe CMR final nuk janë identifikuar ende nga këto skedarë të kontrolluar. Nuk do të përdoret porosia BioBes ose regjistri doganor si template invoice pa konfirmim vizual të dokumentit të saktë.


## Additional reference inspection

`Screenshot_20260822_175848_AnyDesk.jpg` është dritarja legacy `Raporte Magazine` me listën e raporteve dhe filtrat e magazinës/artikullit. `Screenshot_20260822_180453_AnyDesk.jpg` është dritarja legacy `Raporte te Furnitoreve` me `FATURIME DHE PAGESA` dhe filtrat e furnitorit. Të dyja janë referenca për raportet, jo invoice EXPORT dhe jo CMR.


## Full-resolution photo check

`pasted_file_ZCGnWX_image.png` është modal i fletëpagesës për KUDRETE NDONI në korrik 2026. `pasted_file_f3Lsye_image.png` është formulari i faturës së blerjes në `/purchase-invoices`, me furnitorin, artikullin, TVSH-në, transportin dhe inventarin. Asnjëra nuk është invoice-i në anglisht ose CMR-ja.


## Further photo check

`pasted_file_01bE4i_image.png` është tabela `Lidhja e përhershme e punonjësve` me listë pagash/punonjësish. `pasted_file_2jGylr_image.png` është Excel `LISTËPREZENCA MANUALE — 7/2026`. Asnjëra nuk është dokumenti invoice në anglisht ose CMR.


## Final photo checks in this pass

`pasted_file_vBXfHY_image.png` është dritarja legacy `Raporte Blerjeje` me filtrat dhe listën e raporteve. `Screenshot_20260823_215644_Gallery.jpg` është lista legacy e raporteve të shitjeve, ku duken `REGJISTRI PËRMBLEDHËS I SHITJEVE`, `REGJISTRI ANALITIK I SHITJEVE ME ARTIKUJ`, `ARTIKUJ TË SHITUR`, `LIBRI I SHITJEVE`, `KTHIME NGA SHITJET`, `MARZHI I SHITJES`, `LISTE ÇMIMESH SHITJEJE` dhe raporte të tjera. Nuk janë invoice-i anglisht ose CMR.


## File screenshot check

`Screenshot_20260823_220606_MyFiles.jpg` paraqet raportin `KARTELA E FURNITORIT (Formati i Thjeshtë)` me periudhën 01/01/2026–31/12/2026, jo skedarët e invoice-it ose CMR-së. Kërkimi në tekstin e PDF-ve gjeti vetëm regjistrin doganor të eksportit dhe raportin `FATURIME DHE PAGESA`; nuk gjeti dokumentin anglisht `INVOICE` ose `CMR`.

## Sales reports audit after data-link patch
- Report Center Shitje → Regjistri përmbledhës u verifikua me rreshta realë dhe shigjeta burimore.
- U korrigjuan kolonat që dilnin bosh: kur mungon lidhja master, regjistri përdor emrin real të klientit dhe artikullit të importuar si fallback.
- U korrigjuan Monedha, vlera pa TVSH, vlera me TVSH dhe ekuivalenti në monedhë bazë; u shtuan teste regresive me 249 teste të kaluara.
- Duhet të kryhet një reload/gjenerim përfundimtar dhe të kontrollohen edhe raportet e tjera të Shitjeve, jo vetëm regjistri përmbledhës.

## Live verification after sales-report patch
- Regjistri përmbledhës tani shfaq monedhën reale `EUR`, klientët e importuar si `WALDLAND`, `BAHARATE`, `AGREST`, `BIO HERBS DE MEXICO`, `NUTRECO` etj., dhe emrat e artikujve si fallback kur mungon lidhja master.
- Shigjetat ↗ vazhdojnë të shfaqen te dokumentet e faturave.
- U hap raporti `Të ardhurat sipas klientit`; në momentin e parë ishte ende në gjendje loading dhe kërkon një kontroll pas përfundimit të query-t.

## Verifikim live pas checkpoint-it 826dfdf9
- Report Center u hap pas restart-it pa gabim runtime; moduli Shitje shfaq 36 raporte dhe dritarja e filtrave është aktive.
- Lista përfshin raportet e faturave, klientëve, artikujve, regjistrit analitik dhe marzhit; raporti aktual është REGJISTRI PËRMBLEDHËS I SHITJEVE.
- Raporti përmbledhës dhe raporti Të ardhurat sipas klientit përdorin faturat reale të importuara; u shtuan fallback-et për klient/artikull kur mungon ID master dhe llogaritjet në monedhë bazë.
- Template-i i faturës EXPORT u zgjerua sipas BioBes Invoice 686/2026: CN code, Packing No., Weight of bag, Description of goods, Type, Gross weight, Net weight, Price, Total amount, si dhe Delivery place, transporti, kushtet, purchase order, seal number dhe bank/SWIFT/IBAN.
- Filtri i klientit në regjistrin e Shitjeve tani merr sugjerime nga të gjithë emrat realë të faturave të importuara.

## Raport përmbledhës live pas reload-it
- Raporti u gjenerua me rreshta realë të faturave të importuara, monedhë EUR dhe linka ↗ si për numrin e faturës, ashtu edhe për klientin.
- U shfaqën klientë realë si WALDLAND, BAHARATE, AGREST, BIO HERBS DE MEXICO, MENEXOPOULOS, SONNENTOR dhe NUTRECO, me artikujt dhe vlerat e tyre.
- U dallua një datë e dyshimtë `7/15/2030` te fatura 540, që duhet auditim i të dhënave burimore të workbook-ut dhe jo maskim në raport.

## Parser real pas korrigjimit të datave dhe grupimit
- Verifikimi me workbook-un real nxori 76 fatura shitjeje, 0 gabime dhe 1 paralajmërim të kontrolluar.
- Invoice EXPORT 540 / NUTRECO tani ruhet si një dokument me datën bazë 2026-07-15 dhe 6 rreshta: katër rreshta GJETHE FERRE, PALETA dhe KOSTO NGARKIMI.
- Datat e rreshtave 2027–2031 nuk krijojnë më dokumente të veçanta; sistemi ruan paralajmërimin se përdoret data e rreshtit të parë.
- Testet e projektit kaluan: 67 skedarë testesh dhe 250 teste; TypeScript pa gabime.
