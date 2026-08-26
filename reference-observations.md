# Vëzhgime nga Sistemi_Pagave_5.11

Burimi aktiv: `https://8091-i4kjex99jh6tni9vqvo16-9303f068.us4.manus.computer`.

## Logs

Pas ngarkimit të `001_2026_8_MON.XLS`, HTML-i shfaq `80 punonjës` për Gusht 2026. Paraqitja kryesore përdor kolonat `ID Pajisje`, `Emri në pajisje`, `Emër`, `Mbiemër`, `Nr Listëpage`, `Status`, `Loge`; tabela e lidhjeve të përhershme është e ndarë. Tabela `Orët e papërpunuara` përdor kolonat ID, Emri, ditët 1–31, Gjithsej, Normal dhe Shtesë, me rreshtin `TOTALI DITËS`.

Funksioni i eksportit `exportPreviewXLSX` ruan A4 landscape me titull `LOGS TË PAPËRPUNUARA (SI NË EXCEL)`, kolonat ID/EMRI/dinët/totalet dhe totalin ditor. Orët llogariten bruto sipas çifteve të stampimeve; normale kapet në 8 orë (7.5 të dielën) dhe pjesa tjetër trajtohet si shtesë.

## Krijo Pagat

Pamja përmban zinxhirin `Logs → Listëprezenca → Bordero → Listëpagesa Bankë → Listëpagesa Cash → Të Huajt`, zgjedhjen `Mbishkruaj kodet/orët manuale`, butonat `KRIJO PAGAT`, `Hap Listëprezencën`, `Orar i përkohshëm`, dhe bllokuesit kur mungojnë Logs ose punonjësit. Ditët me dy stampime kërkojnë konfirmim të pushimit të drekës nga përdoruesi përpara zbritjes.

## Inventari i plotë i HTML-it 5.11

Referenca ka 19 hyrje kryesore në navigim dhe 22 pamje funksionale: Dashboard; Logs; Krijo Pagat; Listëprezenca; Bordero; Listëpagesa Bankë; Listëpagesa Cash; Fletëpagesat dhe fletëpagesa individuale; Të Huajt; Listëprezencë Manuale; raporti Listëprezenca; Kartela Personale dhe Analitika; Libri i Kontributeve; Punonjësit; Parametra; Leje/Mungesa; Kontroll Gabimesh; Historiku; Backup/Rivendosje.

Çdo pamje do të kontrollohet kundrejt cloud-it për strukturën e tabelës, kërkimin, veprimet, rrjedhën e ruajtjes, lidhjet midis dokumenteve, llogaritjet dhe daljet Excel/PDF/Print Preview. Dokumentet e gjera duhet të ruajnë A4 landscape, kolonat ditore, totalet dhe theksimet e pamjes referencë.

## Audit i rrjedhës kryesore në cloud

Logs në cloud lexon XLS/XLSX real, lidh vetëm sipas ID-së së pajisjes, krijon punonjës të rinj, ruan lidhjet dhe bllokon importin derisa përdoruesi të konfirmojë drekën për çdo rast me dy stampime. Pamja përmban tabelën e orëve të papërpunuara, totalin ditor dhe eksportet A4 landscape. Krijo Pagat tani bllokohet pa periudhë ose Logs të konfirmuara dhe hap drejtpërdrejt Listëprezencën. Listëprezenca përdor titullin ditë/javë, të dielën e theksuar, kërkimin, kodet e mungesave, totalet dhe shfaqjen `8⁴`.

Për zbatim në fazën e korrigjimeve kanë mbetur modaliteti i orarit të përkohshëm dhe opsioni i mbishkrimit të kodeve/orëve manuale në Krijo Pagat; këto duhet të lidhen me ruajtjen e parametrave dhe jo të shfaqen si kontrolle dekorative.

## Audit i dokumenteve të pagave

Bordero në cloud tani përdor kolonat e referencës: Orë Bruto, Orë Pagesë, Orë Normale, kosto/shuma normale, Orë Shtesë, kosto/shuma shtesë, Bonus, Total, Bankë dhe Kesh; tabela ka kërkim dhe rresht total. Banka dhe Cash përdorin titull të periudhës, kërkim, rresht total dhe të njëjtat dalje A4 landscape. Emri në Fletëpagesa hap dokumentin individual me përmbledhjen financiare dhe Excel/PDF/Print Preview.

## Krahasim i drejtpërdrejtë — dokumentet operative

- **Listëpagesa Bankë**: titulli i periudhës, nën-rresht për kod institucioni/bankë, përshkrimi dhe data e pagesës; kolonat `NR`, `EMËR MBIEMËR`, `NR LLOGARISË`, `BANKA`, `SHUMA`; rreshti `TOTALI PËR BANKË`.
- **Listëpagesa Cash**: kolonat `NR`, `EMËR MBIEMËR`, `NR LISTËPAGE`, `PAGESA CASH`, `NËNSHKRIM`; rreshti `TOTALI CASH`.
- **Fletëpagesat**: kolonat `NR`, `PUNONJËSI`, `ORË NORM.`, `ORË SHT.`, `VPAGA NORM.`, `VPAGA SHT.`, `BRUTO (7)`, `TATIMI (8)`, `NETO (9)`, `AVANS`, `PËR PAGESË`; kërkimi dhe komandat Print/PDF e Excel ruhen në krye.

## Krahasim i drejtpërdrejtë — Listëprezenca Manuale

Burimi: `https://8091-i4kjex99jh6tni9vqvo16-9303f068.us4.manus.computer/`.

- Referenca ka muaj/vit të drejtpërdrejtë, komandat **Pastro muajin**, **Import Excel**, **Shkarko shabllonin** dhe **Krijo nga kjo listë**.
- Gridi fillon me `NR.`, `Emri`, `Mbiemri`, pastaj ditët e muajit; pranon orë numerike dhe kodet `M`, `L`, `NM`, `NV`.
- Komanda **Krijo nga kjo listë** duhet të gjenerojë Listëprezencën, Borderon, Fletëpagesat dhe Bankë/Cash, njësoj si rrjedha nga Logs.
- Cloud ka tani gridi me ruajtje, **Pastro muajin** me konfirmim (fshin vetëm rreshtat manualë, jo Logs), **Import Excel**, **Shkarko shabllonin** A4 horizontal dhe **Krijo nga kjo listë** që ruan dhe gjeneron dokumentet e Pagave. U verifikuan veprimet në preview.

## Audit i raporteve dhe konfigurimit

Raportet cloud kanë Listëprezencë, Kartelë Personale, Bordero Analitike, Tatime/Kontribute, Kontroll Borderoje dhe Libër Kontributesh, me kërkim dhe eksportet përkatëse. Pamjet e Kartelës ruajnë formatin e orëve pa minuta dhe indeksin e shtesave. Konfigurimi aktual ruan turnet A/B, drekën, hirësinë e orëve shtesë dhe kontributet, por referenca 5.11 përmban rregulla të plota për të dielën, pragun e drekës, turnin C 12:00–20:00 pa drekë, detajet e bankës/pagesës dhe kodet e legjendës. Këto fusha duhet të futen në kontratën e parametrave për përputhje të plotë.

## Krahasim i drejtpërdrejtë — Kartela Personale

HTML-i 5.11 përdor kërkim me sugjerime dhe komandat **Shfaq kartelën** / **Analitikë**. Dokumenti i hapur ka titullin `KARTELA PERSONALE — Emri`, metadatat e periudhës, numrit të listëpagesës dhe pozicionit, seksionin e të dhënave të punonjësit, shtatë tregues të përmbledhjes mujore, tabelën 31-ditore me kolonat `Dita`, `D.`, `Oraret nga pajisja`, `Orë`, `Normale`, `Shtesë`, `Pushim`, `Statusi / Kodi`, vërejtjet, bashkëngjitjet dhe veprimet Print/PDF, Analitikë 3×31 dhe Excel.

Cloud-i aktual shfaq kërkim dhe një dokument pune me eksportet Excel/PDF/Print, kartat `Nr. listëpage`, `Pozicioni`, `Orë normale`, `Orë shtesë`, `Bruto`, `Neto`, `Për pagesë` dhe tabelë të shkurtuar `DITA`, `KODI`, `ORË`, `SHËNIM`. Kjo nuk përputhet ende me strukturën e dokumentit referencë: duhet të rindërtohet me seksionet, kolonat dhe veprimet e plota të HTML-it, duke ruajtur kërkesën e cloud-it që ora e shfaqur të jetë e plotë me shtesën si indeks dhe pa minuta.

## Krahasim i drejtpërdrejtë — Parametra

- Referenca ekspozon fillim/mbarim/prag OP/maksimum normal për Hënë–Shtunë dhe të Dielën, pushimin e drekës dhe pragun e tij.
- Dokumentet Bankë/Bordero marrin emrin e kompanisë, kodin e institucionit, bankën kryesore, përshkrimin, ditën/datën e pagesës dhe monedhën.
- Konfigurimi fiskal kërkon katër pragje tatimore dhe kontributet opsionale për punëmarrësin e punëdhënësin.
- Turnet A/B/C kanë hyrje, dalje, drekë dhe hirësi OP të dukshme, bashkë me Ruaj parametrat dhe Rikthe parazgjedhjet.

### Gjendja cloud

- Cloud përmban rregullat javore/të dielës, drekën, hirësinë OP, turnet A/B/C, kompaninë/pagesën, tatimet, kontributet dhe legjendën e kodeve.
- Ndryshimi i mbetur kundrejt referencës është komanda eksplicite **Rikthe parazgjedhjet** dhe dokumentimi i detajeve të bankës në Fletëpagesa/Bankë nga parametrat e ruajtur.

## Krahasim i drejtpërdrejtë — Libri i Kontributeve

- Referenca përdor kërkim të punonjësit sipas emrit ose numrit të listëpagesës, komandën **Shfaq librin** dhe eksportin Excel.
- Përshkrimi konfirmon se raporti paraqet kontributet, tatimin dhe pagesën muaj pas muaji nga historiku i ruajtur.
- Cloud përputhet me kërkimin dhe komandën **Shfaq librin**; përfshin gjithashtu Excel, PDF dhe Print Preview në A4 horizontal. Butonat aktivizohen vetëm pasi raporti të shfaqet me të dhëna.

## Krahasim i drejtpërdrejtë — Leje/Mungesa

- Kur mungon Listëprezenca, referenca shfaq vetëm bllokuesin: `Nuk ka Listëprezencë. Ngarko Logs dhe shtyp "Krijo Pagat".`
- Cloud përmban formën funksionale me kërkim punonjësi, Leje/Mungesë/Raport mjekësor, intervalin e datave, shënimet, regjistrin dhe Excel/PDF. Duhet të ruhet bllokuesi i referencës vetëm kur periudha s’ka Listëprezencë.

## Krahasim i drejtpërdrejtë — Kontroll Gabimesh

- Referenca ka veprimet **Ekzekuto testet e detyrueshme**, **Eksporto testet**, **Rifresko rakordimin** dhe **Eksporto rakordimin në Excel**.
- Pamja ka rakordimin Listëprezencë–Bordero–Fletëpagesa–Bankë–Cash–Të Huaj, dhe një tabelë të veçantë gabimesh/vërejtjesh me nivelin, mesazhin, pritej dhe u gjet.
- Kur mungon rrjedha, shfaqet problemi `Të dhënat janë gjeneruar` dhe gabimi bllokues `Nuk ka Logs të ngarkuar. Klikoni NGARKO LOGS.`
- Cloud ka tabelën e plotë me nivel, mesazh, pritej dhe u gjet, treguesit Bllokuese/Vërejtje/OK dhe eksportet Excel/PDF/Print Preview. Diferenca e mbetur është vetëm komanda eksplicite e rifreskimit të rakordimit, ndërsa cloud e llogarit rakordimin automatikisht.

## Krahasim i drejtpërdrejtë — Historiku Mujor

- Referenca paraqet një tabelë të përmbledhur me kolonat `Periudha`, `Punonjës`, `Gjeneruar më` dhe rresht bosh kur nuk ka muaj të gjeneruar.
- Cloud përfshin gjithashtu `Statusi`, komandën **Ngarko muajin** për secilën periudhë dhe eksportet Excel/PDF; këto zgjerime ruajnë funksionin e referencës dhe e bëjnë periudhën e ruajtur të hapshme direkt.

## Krahasim i drejtpërdrejtë — Backup / Rivendosje

- Referenca ndan qartë Krijo backup JSON, Rivendos nga JSON dhe Rikthim në gjendje fillestare me paralajmërim për fshirjen e të gjitha të dhënave.
- Cloud përputhet me backup JSON dhe verifikimin/ngarkimin e tij, si edhe shton tregues të qartë për Punonjës, Periudha, Listëprezencë dhe Bordero. Reset-i total i referencës nuk ekspozohet në cloud për të mbrojtur të dhënat e kompanisë; rikthimi i backup-it ruhet si veprim i kontrolluar.

## Krahasim i drejtpërdrejtë — Krijo Pagat

- Referenca shfaq zinxhirin `Logs → Listëprezenca → Bordero → Bankë → Cash → Të Huajt`, mesazhin për konfirmimin e drekës, opsionin **Mbishkruaj kodet/orët manuale**, komandat **KRIJO PAGAT**, **Hap Listëprezencën**, **Orar i përkohshëm** dhe bllokuesin kur mungojnë Logs.
- Cloud përputhet me zinxhirin, konfirmimin e drekës, gjenerimin, hapjen e Listëprezencës, navigimin te Logs dhe bllokuesit. Diferenca e mbetur është ekspozimi funksional i **Mbishkruaj kodet/orët manuale** dhe **Orar i përkohshëm** në pamjen cloud.

## Krahasim paralel i Krijo Pagat — 21 gusht 2026

- HTML 5.11 shfaq në Krijo Pagat zinxhirin Logs → Listëprezenca → Bordero → Listëpagesa Bankë → Listëpagesa Cash → Të Huajt, checkbox-in `Mbishkruaj kodet/orët manuale`, `KRIJO PAGAT`, `Hap Listëprezencën` dhe `Orar i përkohshëm`; në gjendje bosh shfaq dy bllokues: mungojnë Logs dhe punonjësit.
- Cloud shfaq të njëjtin zinxhir, checkbox-in aktiv të ruajtur, `KRIJO PAGAT`, `Hap Listëprezencën` dhe modalin `Orar i përkohshëm`. Modal-i përmban kërkim punonjësi, turnet A/B/C, intervalin Nga/Deri, shënimin, Shto, listën e ndryshimeve dhe Mbyll & ruaj.
- Dallim vizual i mbetur: cloud shfaq gjithashtu butonat `Krijo periudhë`, `Listëprezencë Manuale`, `Ngarko / kontrollo Logs` dhe mesazhe operative të gjendjes; HTML-i i pastër shfaq vetëm veprimet e mësipërme dhe bllokuesit e dyfishtë. Ky dallim duhet vendosur nëse kërkohet përputhje strikte e gjendjes bosh.
- Preview cloud dhe HTML 5.11 u mbajtën të hapura paralelisht dhe u verifikuan pa ruajtur të dhëna prove.

## Krahasim paralel i Leje / Mungesa — 21 gusht 2026

HTML 5.11 shfaq kur mungon Listëprezenca vetëm mesazhin `Nuk ka Listëprezencë. Ngarko Logs dhe shtyp "Krijo Pagat".` Cloud-i, në të njëjtën periudhë pa rreshta prezence, hap formularin e Leje/Mungesa me kërkim punonjësi, llojet Leje/Mungesë/Raport mjekësor, datat, shënimet, butonin Ruaj dhe tabelën bosh. Kjo tregon se bllokuesi i kërkuar ende nuk po aktivizohet në këtë gjendje të cloud-it, megjithëse komponenti dhe todo e deklarojnë të zbatuar; duhet kontrolluar kushti i periudhës aktive dhe prop-i `attendance` në `LeaveAbsenceWorkspace`.

Kontrolli read-only i bazës së të dhënave konfirmoi se cloud-i ka 1,478 rreshta Listëprezence për Korrik 2026 dhe 784 për Gusht 2026. Për këtë arsye, hapja e Leje/Mungesa në periudhën aktive shfaq formularin dhe jo bllokuesin; kushti i komponentit është i saktë dhe bllokuesi shfaqet vetëm për një periudhë pa rreshta prezence. HTML-i referencë ishte në gjendje bosh pa të dhëna.

## Krahasim i drejtpërdrejtë Kartela Personale — Ardian/Nr. 2 — 21 Gusht 2026
- Cloud-i u hap me kërkimin `Ardian`, sugjerimi `ardian · Nr. 2`, dhe dokumenti real për Gusht 2026.
- Cloud shfaq ① Të dhënat e punonjësit, ② Përmbledhje mujore, ③ Detaje ditore — 31 ditë, ④ Llogaritja e pagës, ⑤ Vërejtje & parregullsi dhe ⑥ Dokumentet e bashkangjitura; shfaq gjithashtu Excel, PDF dhe Print Preview.
- Vlerat reale në cloud: 27 ditë pune, 224 h gjithsej, 211 h normale, 13 h shtesë, 0 mungesa, 0 leje dhe 4 ditë me vetëm një pullim.
- HTML-i u hap te e njëjta pamje dhe kërkon të njëjtin kërkim `Ardian`; kontrolli vijues duhet të konfirmojë vlerat dhe rreshtat ditorë kundrejt cloud-it pa ndryshime.

## Verifikim live me Ardian — 21 Gusht 2026
- Cloud-i live u hap te Kartela Personale, kërkimi `Ardian` dha `ardian · Nr. 2`, dhe `Shfaq kartelën` hapi dokumentin e plotë me 27 ditë, 224 h gjithsej, 211 h normale, 13 h shtesë dhe 4 pullime të vetme.
- HTML-i referencë u hap te Kartela Personale, por storage-i i tij i veçantë nuk ka punonjës të ngarkuar; kërkimi `Ardian` shfaq `Asnjë punonjës nuk përputhet`. Nuk u fabrikuan të dhëna në HTML. Krahasimi vizual i strukturës bëhet, ndërsa krahasimi i vlerave kërkon ngarkimin e të njëjtit XLS në storage-in e referencës.

## Verifikim fundi dhe eksportesh — Kartela Ardian/Nr. 2 — 21 Gusht 2026
- U zbrit në fund të dokumentit live dhe u klikua seksioni `Shiko detajet e tatimit shkallor`; tabela me katër shkallë u hap normalisht.
- U klikuan Excel, PDF dhe Print Preview nga Kartela Personale pa gabim në konsolën e browser-it.
- Historia e shkarkimeve konfirmon dy skedarë të gjeneruar nga cloud-i: `Kartela_2_Korrik_2026.pdf` dhe `Kartela_2_Korrik_2026.xlsx`. Print Preview u aktivizua pa e mbyllur dokumentin kryesor.

## Raport Vetëm një stampim — verifikim live Gusht 2026
Cloud-i shfaq raportin e ri në menunë RAPORTE me 115 rreshta për Gusht 2026. Tabela përdor kolonat e HTML-it 5.11: `NR. LISTEPAGE`, `PUNONJËSI`, `DITA`, `KOHA E VETME`, `PROBLEMI`, dhe rreshtat për Ardianin përfshijnë ditën 19 me orën 08:00. Filtrimi i helper-it pranon vetëm shënime Logs me një orë dhe nuk përfshin dy stampime.

Në preview u klikuan Excel, PDF dhe Print Preview. Historia e shkarkimeve konfirmoi `Vetem_nje_stampim_Gusht_2026.xlsx` dhe `Vetem_nje_stampim_Gusht_2026.pdf`; eksportet përdorin opsionin landscape dhe Print Preview përdor `@page { size: A4 landscape; }`.

## Lista zyrtare e mungesës së daljes — Logs
Raporti Vetëm një stampim tani renderohet brenda `PayrollLogsWorkspace` sapo `parsed` krijohet nga skedari Logs, përpara dhe pavarësisht Kartelës Personale. Rreshtat ndërtohen nga blloqet reale të Logs-it me saktësisht një stampim; ditët me dy stampime përjashtohen. Kur punonjësi nuk është lidhur ende, përdoren emri i pajisjes dhe ID-ja e pajisjes; pas lidhjes përdoren Nr. Listëpage dhe Emër Mbiemër.

Etiketimi zyrtar është `Mungon dalje — vetëm hyrje`, me datën dhe orën e vetme. Raporti ka Excel/PDF/Print Preview; Excel/PDF përdorin `landscape: true`, ndërsa Print Preview përdor `printPayrollDocument`, i cili ka `@page { size: A4 landscape; }`. TypeScript, build-i dhe 101 teste kaluan. Pamja e Logs në preview ngarkohet normalisht dhe modulet e tjera nuk u prekën.
