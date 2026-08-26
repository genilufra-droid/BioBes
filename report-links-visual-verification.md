# Verifikim vizual — lidhjet dhe navigimi i raporteve

Data: 2026-08-23

U kontrolluan në preview desktop 1280×720 rrugët `/purchase-invoices?tab=report`, `/purchase-invoices?tab=receipts` dhe `/reports`.

Rezultatet e verifikuara:

- Moduli Blerje hapet në tab-in e kërkuar nga URL-ja dhe shfaq filtrat, metrikat dhe tabelën e raportit.
- Tab-i Pranime hapet pa ngecje, me butonin “Pranim i ri”, tabelën dhe dalje të qartë të modulit.
- Qendra e Raporteve hapet me navigimin Odoo-style, filtrat, modulet dhe listën e raporteve.
- Në kod, numrat e Pranimeve/Kthimeve përdorin `SourceDocumentLink` dhe raporti i Blerjeve përdor të njëjtin komponent për Faturë, Porosi, Pranim dhe Kthim.
- Linku i një Porosie nga raporti vendos URL-në `openOrder` dhe workspace-i i Porosive e lexon atë për të hapur dialogun burimor.
- Dialogu i detajit të raportit ka `Mbyll` dhe, kur metadata e burimit ekziston, shfaq `Hap burimin`.

Shënim: Screenshot-et konfirmuan shell-in dhe rrugët e navigimit; tabelat bosh në Pranime janë gjendje reale e dataset-it aktual, jo placeholder i fabrikuar.

## Verifikim shtesë live

Më 2026-08-23 u hap dashboard-i live në preview. Dashboard-i ngarkoi me sukses shell-in Odoo-style, KPI-t, faturat reale të blerjes dhe 16 aplikacionet. Në konsolën e browser-it nuk u gjet output gabimi. Kjo verifikon që gabimi i raportuar më herët `TRPCClientError: Failed to fetch` nuk u riprodhua në gjendjen aktuale të preview-t; log-u i fundit i serverit përmbante vetëm një `request aborted`, jo një dështim të API-së së dashboard-it.

## Kontroll i databazës për magazinat

Kontrolli read-only i databazës më 2026-08-23 konfirmoi se krijimi i faturave të reja është i mbrojtur nga validator-i server-side dhe router-i kërkon integer pozitiv. Në dataset-in historik aktual ka 6 fatura blerjeje të vjetra me `warehouseId` NULL dhe 0 fatura shitjeje; ato nuk u ndryshuan automatikisht, sepse backfill-i do të ishte ndryshim i të dhënave reale pa autorizim. Faturat e reja nuk mund të ruhen pa magazinë dhe përdorin magazinën e kompanisë aktive.

## Shënime nga PDF-të reference

PDF-ja `fatura_4319.pdf` është dokument dyfaqësh në format letër/portret. Faqja e parë ka titullin qendror `FATURË`, tre blloqe të kufizuara me vija për shitësin, metadata fiskale dhe blerësin, pastaj tabelën e artikujve me totalet dhe shpërndarjen e TVSH-së. Faqja e dytë ka të dhënat e pagesës dhe QR-në; kërkesa aktive e përdoruesit është që formati i cloud-it të ndjekë këtë strukturë, por pa QR.

PDF-ja `crfurnitorkartela.pdf` është raport horizontal shumë i ngjeshur me titull qendror `KARTELA E FURNITORIT ne MB`, periudhë në qendër, metadata sipër në një rresht të vetëm dhe tabelë me header të grupuar `Monedhe Baze` dhe `Monedhe Llogarie`. Faqja e dytë përmban vetëm rreshtat e totalit/finalizimit dhe footer-in numerik të faqes. Këto elemente duhen ruajtur në krahasimet e ardhshme kundrejt renderer-it të cloud-it.

## Verifikim mobile

Në preview mobile 390×844 u kontrolluan `/purchase-invoices?tab=report` dhe `/reports`. Raporti i Blerjeve ruan header-in kompakt, KPI-t, tab-et në dy kolona, filtrat e vendosur vertikalisht dhe butonin `Shfaq raportet` pa tejmbushje horizontale. Qendra e Raporteve ruan search-in, filtrat e datës, modulet dhe shigjetat reference në listë; layout-i kalon në një kolonë të lexueshme.

## Test live i faturës së blerjes — problem i riprodhuar

Më 2026-08-23 u hap `/purchase-invoices?openInvoice=120001` për faturën `TEST-FG-20260823`. Shell-i i Blerjeve u ngarkua, por dialogu full-screen mbeti në `Po ngarkohet fatura…` dhe nuk shfaqi furnitorin, magazinën, artikujt apo totalet. Ky është një problem real i riprodhuar në preview dhe kërkon kontroll të kërkesës `purchaseInvoice.get` në log-et e rrjetit/serverit para se të vlerësohet pamja PDF.

## Diagnostikë e ngarkimit të faturës

Në testin live, URL-ja me `openInvoice=120001` hap dialogun full-screen dhe shfaq butonin `Close`, por query-ja e detajit mbetet në loading. Konsola e browser-it nuk dha stack trace të ri; log-u i serverit aktual nuk shfaq një error tRPC për këtë query. Kjo sugjeron se parametri i URL-së hap dialogun, por request-i i detajit duhet testuar më tej me rrjedhën normale të klikimit në regjistër, jo vetëm me deep-link të futur manualisht.

## Network profiling i faturës test

Profiling-u i browser-it konfirmoi se kërkesa batch për Blerjet përmban `purchaseInvoice.get` me `id: 120001` dhe ka duration rreth 114 sekonda pa përfunduar, ndërsa `auth.me` dhe `company.list` përfundojnë normalisht. Pra problemi i shfaqjes nuk është CSS i faturës; batch-i i detajit po ngec para se të japë payload-in e faturës.

## Izolimi i API-së

Kërkesa individuale `purchaseInvoice.get` me `id: 120001` përfundoi me status 200 në rreth 847 ms dhe ktheu faturën `TEST-FG-20260823`, rreshtin e artikullit dhe `warehouseId: null` në të dhënat historike. Ngecja e pamjes vjen nga batch-i paralel i faqes, ku një kërkesë tjetër e modulit mban të bllokuar të gjithë grupin; nuk është defekt i query-së individuale të faturës.

## Krahasim real i faturës së blerjes me fatura_4319.pdf

Krahasimi i screenshot-it të Cloud me dy faqet e PDF-së konfirmoi mospërputhje të dukshme. PDF-ja reference ka faqe A4 me titull të qendërzuar `FATURË`, blloqe me kufij të plotë për shitësin, metadata-n e faturës dhe blerësin, tabelë të gjerë me 10 kolona dhe rreshta zbritjeje, pastaj tabela të TVSH-së; faqja e dytë ka metadata pagese dhe tabelën e mënyrës së pagesës. Pamja aktuale e dialogut Cloud është workspace full-screen me header veprimesh, kartela të vogla me fusha dhe tabelë 5-kolonëshe, pra nuk është vizualisht identike me PDF-në reference. Kjo mospërputhje është reale dhe duhet korrigjuar vetëm te renderer-i/detaji i faturës së blerjes.

## Verifikim pas patch-it të preview-t

Pas restart-it dhe hapjes së faturës test, pamja e dukshme në browser mbeti workspace-i i vjetër me kartela të vogla dhe tabelë 5-kolonëshe; nuk u shfaq preview-i HTML dyfaqësh i renderer-it reference. Të dhënat e faturës u ngarkuan, por ndryshimi UI nuk u reflektua në preview live. Kjo duhet hetuar si cache/bundle ose si rrjedhë tjetër e komponentit, dhe nuk duhet deklaruar si e zgjidhur pa u parë në browser.

## Verifikim live pas checkpoint-it 3e3d73f8
Screenshot-i i preview-it aktual në `/purchase-invoices?openInvoice=120001&refresh=4` konfirmoi se dialogu shfaq dokumentin fiskal: titulli FATURË, blloku i shitësit, metadata e faturës, magazina, blloku i blerësit, tabela e artikujve, totalet dhe zona e faqes së pagesës. Dokumenti është i paraqitur brenda iframe-it me scroll për dyfaqëshin; fatura test historike ka warehouseId NULL dhe prandaj shfaq `—` te magazina. Fatura e Shitjes ka të njëjtin renderer, por nuk ka dokument real aktiv për test live.

## Test i plotë i blerjes me magazinë — gjendje e ndërmjetme
U krijua nëpërmjet formularit real fatura `TEST-BL-WH-20260823` me furnitorin Ferre Geni, artikullin Ferre, 25 Kg, çmim 400 qindarka, total 100.00 L dhe `warehouseId: 1` për Magazina Test ERP. Fatura u shfaq në regjistër si rreshti i parë. Pagesa Cash u konfirmua nga përdoruesi, por tre tentativa nga Veprime përfunduan me timeout; kontrolli read-only e la faturën `DRAFT / UNPAID` dhe nuk krijoi payment. U provuan restart-i dhe `httpBatchLink maxItems: 1`; timeout-i u përsërit, ndaj pagesa nuk konsiderohet e kryer dhe testet e raporteve nuk kalojnë ende në fazën finale.

## Rezultati i pagesës Cash pas diagnostikimit
Pagesa Cash u verifikua me sukses në backend për faturën `TEST-BL-WH-20260823`: `purchaseInvoices.id = 150001` kaloi në `PAID / PAID`, `warehouseId = 1`, dhe u krijua një payment i vetëm `id = 120001`, `method = CASH`, `status = POSTED`, `amount = 10000` qindarka, me referencë të faturës. Kontrolli i dublikimit ktheu 1 rresht. Klikimi nga browser-i vazhdon të përfundojë me timeout, prandaj ky është një defekt i rrjedhës së UI/tRPC që duhet korrigjuar veçmas; pagesa e testit nuk duhet të përsëritet.

## Verifikim pas pagesës dhe hapje nga regjistri
Pas pagesës server-side, regjistri live shfaqi `TEST-BL-WH-20260823` si `E paguar`. Klikimi mbi numrin e faturës në regjistër hapi dokumentin burimor me dialog full-screen dhe `Mbyll`; preview-i shfaqi formatin fiskal A4 me titull `FATURË`, blloqet e palëve, metadata, magazinën `Magazina Test ERP`, artikullin, totalet dhe seksionin `TË DHËNAT E PAGESËS`. Në header u shfaqën edhe Excel, PDF dhe Print Preview. Pagesa e verifikuar në databazë është një payment i vetëm Cash i postuar.

## Test i raporteve me faturën e paguar
Raporti `Faturat e blerjes` u hap nga lista e 25 raporteve të Blerjeve. Pa filter shfaqi 7 dokumente, përfshirë `TEST-BL-WH-20260823` me Ferre Geni, vlerë 10,000 qindarka dhe status `PAID`, me rresht `TOTALI` 46,520. Pas filtrimit në `Numër dokumenti = TEST-BL-WH-20260823`, raporti shfaqi 1 rresht me vlerë 10,000 dhe total të filtruar 10,000; dokumenti ishte link aktiv me hint `Hap dokumentin TEST-BL-WH-20260823`.

## Verifikim i raporteve reference me TEST-BL-WH-20260823
`Faturat e blerjes`: pas filterit të numrit të dokumentit shfaqi vetëm faturën test, partnerin Ferre Geni, statusin PAID, vlerën 10,000 qindarka dhe totalin e filtruar 10,000; dokumenti është link aktiv. `Kartela e furnitorit`: u hap si raport reference me header-in `KARTELA E FURNITORIT ne MB`, shfaqi rreshtin e faturës test dhe totalin 10,000; filtrat e raportit ruajtën numrin e dokumentit të futur. `Kartela e furnitorit — Formati 3` u hap si raport reference dhe shfaqi rreshtin e faturës test me header-in e thjeshtë dhe totalin 10,000. Raportet u hapën me `Mbyll`, Print Preview, Excel dhe PDF të dukshme.

`Furnitorët me maturim` u hap me formatin reference `MATURIMI I FURNITORIT (me fusha shtese)` dhe shfaqi faturën test `TEST-BL-WH-20260823`, datën 8/23/2026 dhe totalin 10,000. `Situacioni i furnitorëve sipas kategorive` u hap me header-et reference `Furnitori`, `Monedhe Furnitori`, `Monedhe Baze`, por me filtrin e dokumentit të vendosur nuk kishte rresht agregimi; shfaqi qartë `Nuk ka të dhëna` dhe totalin bosh. Kjo është rezultat real i kombinimit të filtrit të dokumentit me raportin agregues, jo placeholder i sajuar.

`Furnitorët me maturim` shfaqi rreshtin `TEST-BL-WH-20260823`, datën e dokumentit dhe totalin 10,000 qindarka në formatin reference me grupin `Koha e Maturimit`. `Situacioni i furnitorëve sipas kategorive` shfaqi strukturën reference dhe totalin, por nuk dha rresht agregimi nën filtrin e numrit të dokumentit; kjo pritet për raportin agregues dhe u shënua si rezultat real. `Regjistri i doganimit të importeve` u hap me të 15 kolonat reference dhe ktheu `Nuk ka të dhëna`, sepse fatura test nuk ka numër/metadata doganore; nuk u fabrikua regjistër doganimi.

`Regjistri i blerjeve` me filtrin e dokumentit shfaqi 1 rresht, faturën test `TEST-BL-WH-20260823`, Ferre Geni, statusin PAID, vlerën 10,000 dhe totalin 10,000. Klikimi mbi numrin/linkun e dokumentit e çoi në `/purchase-invoices?openInvoice=150001` dhe hapi preview-n fiskal real: titulli `FATURË`, magazina `Magazina Test ERP`, artikulli, totalet, zona `TË DHËNAT E PAGESËS`, butonat Excel/PDF/Print Preview dhe `Mbyll`. Kjo konfirmon lidhjen burimore nga raporti në faturë.

## Milestone: blerje reale, pagesë Cash dhe raporte
Pagesa Cash e faturës `TEST-BL-WH-20260823` u krye dhe u verifikua në databazë si `PAID / PAID`, payment unik Cash i postuar me amount 10,000 qindarka dhe warehouseId 1. Patch-i i UI-së e bën onSuccess të pagesës jo-bllokues: invalidimet rifreskohen në sfond, ndërsa njoftimi i suksesit nuk pret query të ngadalta. Nga regjistri, numri i faturës hapi `/purchase-invoices?openInvoice=150001` dhe preview-n fiskal dyfaqësh.
U testuan me faturën dhe filtrin e dokumentit raportet `Faturat e blerjes`, `Kartela e furnitorit`, `Kartela e furnitorit — Formati 3`, `Furnitorët me maturim`, `Situacioni i furnitorëve sipas kategorive`, `Regjistri i doganimit të importeve` dhe `Regjistri i blerjeve`. Raportet e para, maturimi dhe regjistri shfaqën rreshtin/totalin e faturës; Situacioni dhe Doganimi nuk shfaqën rresht sepse janë agregues/dhe fatura nuk ka metadata doganore. Linku burimor i Regjistrit të blerjeve u verifikua me kthim te fatura.

`Statusi i faturave` u hap dhe shfaqi 2 grupe reale: `PAID` 4 dokumente me vlerë 34,360 qindarka dhe `DRAFT` 3 dokumente me vlerë 12,160, total 7 dokumente dhe 46,520 qindarka. Fatura `TEST-BL-WH-20260823` është përfshirë te PAID pas pagesës Cash. `Faturat e hapura` shfaqi 3 dokumente të pambyllura (`TEST-FG-20260823`, `BL-05`, `bl-01`) me total 12,160 qindarka; fatura e paguar test nuk shfaqet aty, siç pritet. Të dy raportet ruajtën Mbyll, filtrat, totalet dhe eksportet.

`Vëllimi i faturave` u verifikua me 3 grupe datash, 7 dokumente dhe vlerë totale 46,520 qindarka; grupi i datës 23/8/2026 ka 3 dokumente dhe 32,000 qindarka, ku përfshihet fatura test. `Pasqyra e furnitorëve` u verifikua me 3 furnitorë dhe vlerë totale 46,520: Ana 26,160 (4 fatura), Ferre Geni 20,000 (2 fatura), Floreta Merdani 360 (1 faturë). Të dy raportet shfaqën strukturën, filtrat, Mbyll, totalet dhe kontrollet e eksportit.

`Furnitorët kryesorë` shfaqi të njëjtin agregim të renditur sipas vlerës: Ana 4 fatura/26,160 qindarka, Ferre Geni 2/20,000, Floreta Merdani 1/360, total 7/46,520. Raporti ruajti kolonat Furnitori, Fatura, Vlera, totalin dhe veprimet e eksportit; dokumenti test përfshihet te grupi Ferre Geni.

`Trendi i shpenzimeve` u verifikua me 3 grupe ditore, 7 dokumente dhe vlerë totale 46,520 qindarka; data 23/8/2026 ka 3 dokumente dhe 32,000 qindarka. Fatura test e paguar është pjesë e grupimit të datës së saj. Raporti ka Mbyll, filtra, renditje dhe kontrolle Excel/PDF/Print Preview të dukshme.

## Test i rrjedhës së faturës së Shitjes — pa ruajtje
U hap formulari i faturës së Shitjes dhe u verifikuan fushat e klientit, datës, magazinës së detyrueshme, rreshtit të artikullit, sasisë dhe çmimit. U zgjodh `Magazina Test ERP`; u provua artikulli `Ferre` me sasi 1 dhe çmim 10 L/kg, me total 0.10 L sipas ruajtjes së vlerave në njësitë minimale të sistemit. Meqë nuk pati konfirmim për krijim dokumenti, formulari u anulua me `Anulo` dhe regjistri i faturave të Shitjes mbeti me 0 dokumente. Gjatë provës u krijua dhe u zgjodh klienti `Ferre Geni Klient Test`, sepse kërkimi nuk kishte klient ekzistues me atë emër; nuk u krijua faturë shitjeje.

## Verifikim fillestar i raporteve të Shitjeve
Qendra e Raporteve u hap me modulin `Shitje` dhe 33 raporte. `Statusi i faturave` u ngarkua me filtrat për dokument, partner, kategori, status, datë dhe shumë; ka kërkim brenda tabelës, renditje në kolonat Statusi/Dokumente/Vlera, total, Print Preview, Excel, PDF dhe `Mbyll`. Gjendja reale është 0 rreshta, 0 dokumente dhe vlerë totale 0, sepse fatura e Shitjes nuk u ruajt pa konfirmim. Lista e raporteve përfshin edhe Faturat e sotme, Vëllimin e faturimit, të ardhurat sipas klientit, artikujt e shitur/pashitur, regjistrin përmbledhës dhe formatet reference.

`Faturat e sotme` dhe `Vëllimi i faturimit` u hapën në Shitje. Të dyja shfaqën 0 rreshta, 0 dokumente dhe vlerë totale 0 në mënyrë të saktë për dataset-in aktual; kanë filtrat, kërkimin brenda tabelës, renditjen Data/Dokumente/Vlera, totalin përmbledhës, Printo, Mbyll dhe kontrollet Excel/PDF në header. Këto janë raporte të veçanta nga `Statusi i faturave`, i cili gjithashtu mbeti bosh sepse fatura e Shitjes nuk u ruajt.

`Shitjet sipas sasisë totale` u hap si raport reference me titullin, periudhën Fillimi—Sot, tabelën mujore Janar–Dhjetor, kolonën Artikulli, rreshtin TOTALI I RAPORTIT dhe footer-in e faqes; nuk kishte të dhëna reale shitjeje. `Artikuj të shitur` u hap me header të grupuar `Artikulli`, `Vlerat`, `Zbritja analitike` dhe kolonat Kartelë, Emërtimi, Njësia, Sasia, Çmimi, vlerat pa/me TVSH dhe zbritjet; dataset-i bosh shfaqi qartë Nuk ka të dhëna dhe totalin e raportit. Të dyja ruajtën filtrat, renditjen, Print Preview, Excel, PDF dhe Mbyll.

`Artikuj të pashitur` u hap si format reference dhe shfaqi rreshta realë nga katalogu pa blerje/shitje: njësitë copë/kg, artikujt Gg, Ferre dhe Murriz, me gjendje 0; ka kolonat Nr. Blerje, Dt., Njësia, Kartelë, Emërtimi i Artikullit, Kod Bar, Gjendja dhe TOTALI I RAPORTIT. `Regjistri përmbledhës i shitjeve` u hap me header të grupuar dhe kolonat Nr Rend, Lloj, Nr, Date, Mon, Kod i Klientit, Kodi Artikulli, Vlefta Artikulli, Zbritje Anal., Zbritje Tot., përqindje dhe vlera me/pa TVSH në monedhën bazë; shfaqi 0 rreshta dhe totalin e raportit. Të dyja kanë filtrat, kërkimin, renditjen, Print Preview, Excel, PDF dhe Mbyll.

`Artikujt me zbritje analitike` u hap si format reference me strukturën e njëjtë të artikujve të shitur dhe kolonat për vlerat pa/me TVSH, zbritjen dhe përqindjen analitike; nuk kishte të dhëna. `Shitjet sipas qyteteve` u hap me kolonat Qyteti, Klientë, Fatura dhe Vlera, me totalin e raportit dhe periudhën Fillimi—Sot; gjendja reale është bosh sepse nuk ka faturë shitjeje të ruajtur. Të dyja ruajtën filtrat, renditjen, eksportet dhe Mbyll.

`Shitjet sipas klientëve` u hap si raport reference me kolonat Kodi, Emërtimi, Qyteti, Fatura dhe Vlefta; nuk kishte rreshta shitjeje reale, por header-i, periudha dhe totalet u shfaqën. `Shitjet sipas sasisë` u hap me filtrat e grupit/nën-grupit `Të gjitha`, kolonat mujore Janar–Dhjetor dhe rreshtin TOTALI I RAPORTIT; gjithashtu shfaqi 0 të dhëna reale. Të dyja u verifikuan me kontrollin e renditjes dhe butonat Mbyll, Print Preview, Excel dhe PDF.

`Kartela e artikullit të shitjes` u hap si format reference me fushat Nr Kartele, Kodbar, Grup Malli, Nën Grupi dhe Artikulli, si dhe kolonat e dokumentit, njësisë, sasisë, çmimit, vlerave me/pa TVSH dhe progresivit; nuk kishte të dhëna shitjeje dhe shfaqi `—` për kriteret bosh. `Regjistri i kthimeve` u hap me kolonat Nr.Dok, Dt.Dok, Numër FS.Ref, Date FS.Ref, Artikulli, Sasi Fature, Sasi e Kthyer, Çmimi, Zbritje %, Vlefta e Kthyer me TVSH, Monedha, Kursi dhe vlera në monedhën bazë; nuk kishte kthime reale. Të dy raportet ruajtën pamjen reference, totalin, filtrat, renditjen, eksportet dhe Mbyll.

`Marzhi i shitjeve` u hap si format reference me grupet Artikulli, Kosto dhe shitje, Marzhi bruto dhe kolonat Sasia e Shitur, Kosto/Njësi, KMSH, Çmimi i shitjes, Vlera e Shitjes, marzhi bruto me zbritje dhe përqindjet; nuk kishte të dhëna shitjeje. `Marzhi i shitjeve — Formati 2` u hap me kolonat e zgjeruara Kodi, Emërtimi, Grupi, Nën Grupi, Kodi/Emërtimi artikulli, Sasia, Volumi i Shitjeve (%), Vlera e Shitjes, KMSH, Marzhi, Mark up dhe Sales; gjithashtu bosh me total real 0. Të dyja kanë periudhën, filtrat, renditjen, eksportet dhe Mbyll.

## Verifikim fillestar i raporteve reference të Magazina
`Gjendja e magazinës sipas detajeve` dhe `Gjendja e magazinës` u hapën në modulin Magazina. Të dyja kanë periudhën Fillimi—Sot, filtrat e përgjithshëm, kërkimin brenda tabelës, renditjen, totalin, Print Preview, Excel, PDF dhe `Mbyll`. Raportet reference shfaqën fushën `Magazina: —` dhe 0 rreshta me `Nuk ka të dhëna`, sepse nuk u zgjodh magazinë në raport dhe nuk u ndryshuan të dhënat reale gjatë testit. Formati vizual ruan grupet Artikulli/Lëvizja/Vlerësimi dhe kolonat Kartelë, Përshkrimi, Grupi, Njësia, Llog. Inventar, Hyrje, Dalje, Gjendje, Kosto, Vlefta dhe Në %.

`Gjendja e magazinës` shfaqi format reference me fushën Magazina, grupet Artikulli/Lëvizja/Vlerësimi dhe kolonat Kartelë, Përshkrimi, Grupi, Njësia, Llog. Inventar, Hyrje, Dalje, Gjendje, Kosto, Vlefta dhe Në %. `Regjistri analitik i magazinës` shfaqi fushën Magazina, grupet Dokumenti/Artikulli/Sasitë dhe vlerat, si dhe kolonat Lloji, Numri, Data, Dt Regj, Kartela, Përshkrimi, Njësia, Sasia, Çmimi dhe Vlefta. Të dyja janë bosh me të dhëna reale 0, kanë totalin, filtrat, renditjen, eksportet dhe Mbyll.

## Audit final i shigjetave në regjistrin real të Blerjeve
Regjistri `Blerje / Dokumente` u hap me 7 fatura dhe dokumentet e porosive. Çdo numër dokumenti në tabelë është kontroll interaktiv me hint të qartë `Hap faturë ...` ose `Hap porosi ...`: `TEST-BL-WH-20260823`, `TEST-FG-20260823`, `556767`, `70`, `BL-05`, `BL-01`, `bl-01`, `69`, `69-ANULUAR-1` dhe `685`. Kjo konfirmon që numrat nuk janë tekst dekorativ; klikimi duhet të hapë dokumentin burimor përkatës. Regjistri shfaq gjithashtu filtrat e datës/furnitorit, totalin 465.20 L dhe përmbledhjen sipas furnitorit.

## Verifikim live pas rregullimit të linkut
Pas rifreskimit dhe ritestimit nga skeda `Raporti`, klikimi i shigjetës për `TEST-BL-WH-20260823` hapi dialogun `Blerje / Faturë furnitori` me preview fiskal dyfaqësh, butonin `Mbyll`, eksportet Excel/PDF/Print Preview dhe statusin `Paguar`. Preview-ja shfaqi faturën test, magazinën dhe faqen `TË DHËNAT E PAGESËS`; nuk kishte QR. Dialogu tashmë është i montuar jashtë `Tabs`, ndaj mund të hapet edhe kur burimi është skeda `Raporti`.

## Auditimi live i Magazina — Sipas magazine
Pamja `Sipas magazine` u hap dhe u ngarkua pa error. Tabela shfaq kolonat `Magazina`, `Lokacioni`, `Artikulli`, `Sasia` dhe `Përditësuar`. Meqë nuk ka ende balanca të validuara për këtë kompani, sistemi shfaq mesazhin e qartë `Nuk ka balanca sipas magazine ende. Validoni një pranim ose krijoni transferin e parë.` dhe nuk krijon asnjë shigjetë/link të rremë.

## Auditimi live i Magazina — Raporti
Skeda `Raporti` u ngarkua me filtra `Prej datës`, `Deri më datën`, `Magazina` dhe `Artikulli`, si dhe me `Pastro filtrat`, `Excel` dhe `PDF`. KPI-të `Lëvizje`, `Hyrje`, `Dalje` dhe `Stok në dispozicion` shfaqën zero në gjendjen reale aktuale. Tabela e agregimeve ka kolonat `Artikulli`, `Hyrje`, `Dalje`, `Transferta`, `Korrigjime` dhe `Lëvizje`, me mesazh të qartë kur nuk ka të dhëna. Nuk kishte dokument burimor në dataset, prandaj nuk u shfaq link i rremë.

## Verifikim live pas formatit A4 njëfaqësh
Në versionin e publikuar `8585dcab`, preview-ja e faturës `TEST-BL-WH-20260823` u hap nga linku burimor i raportit. Kontrolli i DOM-it konfirmoi `pageCount: 1`, `paymentSectionCount: 1`, `@page{size:A4 portrait`, `page-break-after:auto` dhe mungesën e QR-së. Pamja vizuale shfaq FATURË, blloqet fiskale, magazinën, artikujt, totalet dhe `TË DHËNAT E PAGESËS` brenda së njëjtës faqe.

## Auditimi live i Magazina — Lokacionet
Skeda `Lokacionet` u hap pa ngecje dhe shfaq butonin `Lokacion i ri`, tabelën `Kodi`, `Lokacioni`, `Magazina`, `Lloji` dhe mesazhin `Nuk ka lokacione. Krijoni zonën e parë të ruajtjes.` Në dataset-in aktual nuk ka dokument burimor për t'u lidhur, ndaj nuk u shfaq link i rremë.

## Auditimi live i Magazina — Transfertat
Skeda `Transfertat` u hap pa error dhe shfaq butonin `Transfer i ri`, tabelën `Nr.`, `Data`, `Burim`, `Destinacion`, `Statusi` dhe `Veprime`. Në gjendjen reale nuk ka transferta dhe sistemi shfaq `Nuk ka transferta të regjistruara.`; për këtë arsye nuk ka shigjetë/link burimor për t'u hapur dhe nuk u krijua link i rremë.

## Auditimi live i Magazina — Inventarizimi
Skeda `Inventarizimi` u hap dhe u ngarkua pa error. Shfaq butonin `Inventarizim i ri`, kolonat `Nr.`, `Data`, `Magazina`, `Statusi` dhe `Veprime`, si dhe mesazhin `Nuk ka inventarizime të regjistruara.` Meqë nuk ka inventarizime reale në kompani, nuk kishte burim dokumenti për link dhe nuk u paraqit shigjetë e rreme.

## Auditimi live i Magazina — Lëvizjet
Skeda `Lëvizjet` u hap pa ngecje. Përshkrimi sqaron se hyrjet dhe daljet krijohen nga pranimi, dërgesa, kthimi, transferi dhe inventarizimi. Tabela ka kolonat `Data`, `Dokumenti`, `Lloji`, `Artikulli`, `Sasia` dhe `Shënime`; aktualisht shfaq `Nuk ka lëvizje stoku të regjistruara ende.` dhe nuk paraqet link të rremë kur nuk ka dokument burimor.

## Kontrolli i filtrave dhe eksporteve në Magazina
Raporti i Magazina u hap nga skeda përkatëse dhe shfaq filtrat e datës, magazinës dhe artikullit, butonin `Pastro filtrat` dhe veprimet `Excel` dhe `PDF`. Pas kërkesës së raportit u shfaq gjendja e qartë `Po ngarkohet raporti...`; nuk u krijua dokument ose link burimor i rremë gjatë gjendjes së ngarkimit.

## Eksportet e Raportit të Magazina
Raporti i Magazina përfundoi ngarkimin dhe shfaq `Nuk ka lëvizje për filtrat e zgjedhur.`. Filtrat mbeten aktivë dhe butonat `Excel` dhe `PDF` janë të pranishëm e të klikueshëm; u testua klikimi i Excel-it pa ndryshuar të dhënat e sistemit.

## Përmbledhja dinamike e regjistrit të Blerjeve — verifikim live
Në regjistrin e faturave të Blerjeve u vendos filtri `Furnitori = Ferre Geni`. Përmbledhja u rifreskua realisht dhe shfaqi `1 furnitor · 2 fatura`, `Vlera e faturave 200.00 L`, `Paguar 100.00 L`, `Papaguar 100.00 L`, `Pagesë më vonë 0.00 L`, si dhe artikullin `Ferre`, njësi `Kg`, sasi `50`, çmim mesatar `4.00 L` dhe vlerë `200.00 L`. Regjistri shfaqi vetëm dy rreshtat e Ferre Geni dhe totalet u përputhën me filtrin.

## Auditimi live i regjistrit të Shitjeve
Regjistri `/sales-invoices` u hap dhe skeda `Faturat` u verifikua. Aktualisht ka 0 fatura shitjeje reale, ndaj nuk ka numër dokumenti ose shigjetë burimore për t'u klikuar. Ekrani ka kërkim sipas faturës/klientit, filtra `Të gjitha`, `Të papaguara`, `Të paguara`, `Më vonë`, filtra statusi, eksportet `Excel` dhe `PDF`, si dhe tabelën `Nr.`, `Klienti`, `Data`, `Vlera`, `Statusi`, `Pagesa`, `Veprime`. Gjendja bosh shfaqet qartë dhe pa linke të rreme.
