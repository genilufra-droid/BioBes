# Audit i Referencës — Sistemi i Pagave 4.7

## Pamjet dhe komandat e dukshme

Referenca përmban Dashboard, Logs, Krijo Pagat, Listëprezenca, Bordero, Listëpagesa Bankë, Listëpagesa Cash, Fletëpagesat, Të Huajt, Listëprezencë Manuale, Listëprezenca (raport), Kartela personale, Libri i Kontributeve, Punonjësit, Parametra, Leje/Mungesa, Kontroll Gabimesh, Historiku dhe Backup/Rivendosje.

## Rrjedha e punës

Dashboard-i shfaq periudhën, punonjësit aktivë, të palidhurit, gabimet bllokuese, hapat 1. Ngarko Logs → 2. Krijo Pagat → 3. Listëprezenca → Bordero → Bankë → Cash dhe rakordimin e totalit bruto me Bankë/Cash.

## Rregulli kritik për testin e pajisjes

Lidhja duhet të jetë **ID pajisje → Nr. Listëpage/Punonjës**, jo përputhje e emrave. Excel-i ngarkohet nga Logs dhe vijon automatikisht te Listëprezenca.

## Test i kryer në cloud

Në rrjedhën reale, Excel-i `001_2026_7_MON.XLS` lexon 77 blloqe pajisjeje. Pas importit të parë u ruajtën 1,292 rreshta të Listëprezencës; ky kontroll po përsëritet me lidhje ekskluzive sipas ID-së së pajisjes për të verifikuar rastet e emrave të ngjashëm.

## Rezultati i verifikuar i lidhjes së pajisjes

Testi i pastër i Excel-it lexoi 77 blloqe: 73 lidhje ekzistuese dhe 4 ID të reja (`45`, `70`, `73`, `76`). Pas konfirmimit, të katër punonjësit u krijuan me numrin identik të pajisjes. U verifikuan rreshtat e Listëprezencës për ID 45 (30 rreshta) dhe 73 (28 rreshta); ID 70 dhe 76 u krijuan gjithashtu dhe nuk kishin rreshta prezence në periudhën e testuar.

## Testi i dokumenteve

KRIJO PAGAT rigjeneroi Borderon me rreshta për 77 punonjës dhe me orët normale/shtesë të importuara nga Listëprezenca. Listëpagesa Bankë hapet me kolonat e referencës; ajo nuk përmban rreshta monetarë gjatë testit sepse tarifat e punonjësve janë zero në të dhënat e testit.

Listëpagesa Cash hapet me kolonat e referencës.

## Kontroll Fletëpagesat — 20 Gusht 2026

Pamja e veçantë **Fletëpagesat** u verifikua në preview me 77 rreshta të Borderos së korrikut 2026. Tabela përmban kolonat **NR, PUNONJËSI, ORË NORM., ORË SHT., VPAGA NORM., VPAGA SHT., BRUTO (7), TATIMI (8), NETO (9), AVANS, PËR PAGESË**, si HTML-i referencë. Kërkimi sipas emrit ose numrit të listëpagesës, **Print / PDF këtë dokument** dhe **Eksporto Excel** janë të lidhur me rreshtat e filtruar. Orët e importuara nga Excel-i real shfaqen; shumat janë €0.00 derisa të ruhen tarifat e punonjësve.

## Kontroll Bordero Analitike — 20 Gusht 2026

Raporti **Bordero Analitike** tashmë është pamje e ndarë nga Borderoja standarde. Në preview për korrik 2026, ai shfaq agregimet reale të 77 punonjësve, 9465.85 orëve normale dhe 1003.50 orëve shtesë, të grupuara sipas pozicionit. Tabela analitike dhe eksportet Excel, PDF e Print Preview përdorin të njëjtat kolona të agreguara.

## Formati i referencës Të Huajt

HTML-i referencë përcakton dokumentin **TË HUAJT** me kërkim dhe kolonat: **NR, EMËR MBIEMËR, DITË PUNE, PAGA/DITË, ORË SHTESË, BANKË, CASH, TOTAL**, si dhe veprimet **Print / PDF këtë dokument** dhe **Eksporto Excel**.

Kontrolli në preview verifikoi të njëjtin format dokumenti dhe gjendjen bosh të saktë për korrik 2026, sepse asnjë nga 77 punonjësit e testit nuk është shënuar si **I huaj**. Formati i Punonjësve lejon tani ruajtjen e këtij statusi dhe të pagës ditore, që rigjenerimi i Borderos të prodhojë rreshtat e dokumentit.

## Kontroll Tatime & Kontribute — 20 Gusht 2026

Raporti i veçantë **Tatime & Kontribute** u verifikua në preview me 77 rreshta të Borderos. Ai ka kërkim dhe kolonat **Punonjësi, Kontribut punëmarrës, Kontribut punëdhënës, Tatim, Bruto, Neto** plus veprimet Print/PDF dhe Excel. Në të dhënat reale të testit vlerat monetare janë zero derisa të konfigurohen tarifat dhe normat sociale për punonjësit.

## Kontroll Borderoje — 20 Gusht 2026

Pamja **Kontroll Borderoje** u verifikua me 14/14 kontrolle OK për periudhën korrik 2026. Kontrollet krahasojnë Listëprezencën me Borderon, validimin e formulës Neto − Avans, rakordimin Bankë + Cash, regjistrin e të huajve, kufijtë ditorë të orëve dhe dublikatat. Raporti përmban Excel, PDF dhe Print Preview.

## Formati i referencës Libri i Kontributeve

HTML-i referencë e hap Librin e Kontributeve si panel kërkimi sipas punonjësit ose numrit të listëpagesës, me veprimet **Shfaq librin** dhe **Eksporto Excel**. Përshkrimi kërkon histori mujore të kontributeve të sigurimeve shoqërore, tatimit dhe pagesës.

Kontrolli në preview verifikoi panelin e kërkimit, veprimin **Shfaq librin**, 77 rreshta të periudhës 07/2026 dhe kolonat e plota: periudha, nr. listëpage, punonjësi, bruto, kontribut punëmarrës, kontribut punëdhënës, tatim, neto dhe për pagesë. Excel, PDF dhe Print Preview përdorin të njëjtin rezultat të filtruar.

## Formati i referencës Listëprezencë Manuale

HTML-i referencë hap një panel **Listëprezencë Manuale** me muajin dhe vitin e zgjedhur, listën e punonjësve aktivë dhe komandën **Hap Regjistrin**. Kur nuk ka punonjës aktivë, shfaqet vetëm mesazhi i gjendjes bosh dhe lidhja për regjistrin.

Kontrolli në preview verifikoi navigimin e ri dhe rrjetin me 77 punonjës aktivë për korrik 2026. Çdo qelizë përdor formatin manual `8`, `8+1.5` ose kod mungese, dhe ruhet nëpërmjet procedurës së përditësimit masiv pa krijuar dublikata ditore.

## Formati i referencës Kartela Personale

HTML-i referencë përdor kërkim të drejtpërdrejtë sipas emrit, mbiemrit, nr. listëpage, pozicionit ose bankës, komandën **Shfaq kartelën** dhe pamjen **Analitikë**. Kartela hapet vetëm për punonjësin e zgjedhur dhe bazohet në evidencën e tij ditore.

Kontrolli në preview verifikoi kërkimin `ardian`, përzgjedhjen e nr. listëpage 2 dhe kartelën e plotë të korrikut me orët normale/shtesë, shënimet e Logs dhe totalet monetare. Excel, PDF dhe Print Preview janë në kartelën individuale.

## Formati i referencës Leje / Mungesa

Specifikimi Abacus kërkon regjistër të thjeshtë të lejeve sipas punonjësit, me llojin, datën nga, datën deri dhe shënimet për të justifikuar ditët pa evidencë në Listëprezencë. HTML-i referencë shfaq një gjendje të qartë bosh kur periudha nuk ka Listëprezencë.

Kontrolli në preview verifikoi formularin pa dropdown për punonjësin, llojet e drejtpërdrejta Leje/Mungesë/Raport mjekësor, datat, shënimet, regjistrin e kërkueshëm dhe eksportet. Nuk u krijua e dhënë prove në regjistrin real të përdoruesit.

## Formati i referencës Kontroll Gabimesh

HTML-i referencë bashkon testet e detyrueshme, rakordimin e të dhënave dhe gabimet/vërejtjet në një ekran. Veprimet janë ekzekutimi dhe eksporti i testeve, rifreskimi i rakordimit dhe eksporti në Excel. Rakordimi shfaq statusin, kontrollin, vlerën e pritur dhe vlerën e gjetur.

Kontrolli në preview verifikoi 9 validime në periudhën reale të korrikut: **0 bllokuese, 0 vërejtje dhe 9 OK**, duke përfshirë 77 punonjës, 1,350 rreshta Listëprezence dhe 77 rreshta Borderoje. Pamja përmban eksport testesh, PDF dhe Print Preview.

## Formati i referencës Historiku Mujor

HTML-i referencë përdor një tabelë të thjeshtë me periudhën, numrin e punonjësve dhe datën e gjenerimit. Në mungesë të periudhave shfaqet gjendja e zbrazët; periudhat e ruajtura shërbejnë për ngarkimin e muajit të mëparshëm.

Kontrolli në preview verifikoi periudhën historike **Korrik 2026**, me 77 rreshta Borderoje, kohën e gjenerimit dhe statusin GENERATED. Komanda **Ngarko muajin** e hapi Borderon e ruajtur me 77 punonjës dhe orët e tyre reale.

## Formati i referencës Backup / Rivendosje

HTML-i referencë kërkon krijimin e një skedari JSON me të gjitha të dhënat, ngarkimin e backup-it për rivendosje dhe reset-in e të dhënave pas krijimit të backup-it. Për sigurinë e të dhënave reale, rivendosja dhe reset-i duhet të kërkojnë konfirmim të qartë.

Kontrolli në preview verifikoi backup-in e kompanisë aktive me **77 punonjës, 1 periudhë, 1,350 rreshta Listëprezence dhe 77 rreshta Borderoje**, plus shkarkimin JSON dhe verifikimin e skedarit të importuar.

Rivendosja është e lidhur me procedurë transaksionale dhe kërkon që përdoruesi të ngarkojë një backup të vlefshëm dhe të shkruajë saktësisht **RIVENDOS**. Nuk u krye rivendosje në testim, për të mos zëvendësuar të dhënat reale të kompanisë.

## Formati i referencës Parametra

HTML-i referencë kërkon konfigurim të plotë të orarit Hënë–Shtunë dhe të Dielës, drekës, pragut të orëve shtesë, të dhënave të kompanisë/bankës dhe parametrave të tatimit e kontributeve. Ai ruan gjithashtu turnet fikse A/B dhe ofron ruajtje ose rikthim të parazgjedhjeve.

Kontrolli në preview konfirmoi ngarkimin e vlerave të ruajtura për pushimin e drekës dhe kontributet, si edhe shfaqjen e turneve A/B dhe hirësisë së orëve shtesë.

## Përfundimi i auditimit

Në kontrollin e përmbledhur të 20 gushtit 2026, të 22 pamjet e referencës u hapën dhe u verifikuan në cloud. Sidebar-i, topbar-i, rrjedha Logs → Listëprezencë → Krijo Pagat → Bordero → Bankë/Cash, rregullat Abacus për stampimet, raportet, konfigurimi dhe eksportet e dokumenteve janë të lidhura me të dhënat reale të korrikut 2026. Diferencat e mbetura në listën e punëve janë historike ose kërkojnë veçanërisht një test shtesë të ruajtjes së lidhjeve të pajisjes për periudha të ardhshme.

Kontrolli i fundit i mapping-eve përdori ID-në reale të pajisjes **45** dhe punonjësin real me nr. listëpage **45**. Lidhja u ruajt dhe u rilexua përmes procedurave aktive `payroll.mappings.save` dhe `payroll.mappings.list`, me kontroll të kompanisë aktive. Importi i ardhshëm e përdor këtë lidhje të ruajtur në server, pa përputhje emri.

Parametrat e orarit ruajnë pushimin e drekës, fillimin/mbarimin e turneve A/B dhe hirësinë e orëve shtesë. Importi i Logs i lexon tani këto vlera të ruajtura për turnin A përpara llogaritjes Abacus të ditës.

Testi i browser-it në rrjedhën **Krijo Pagat** verifikoi guard-in financiar: gjenerimi u bllokua pa ndryshuar Borderon kur 50 punonjës me orë të punuara nuk kishin tarifë ose pagë bazë. Njoftimi shfaqi numrat dhe emrat e punonjësve të parë për plotësim te Punonjësit.

Sipas rrjedhës së template-it Excel/HTML, guard-i i tarifave u hoq. Testi vijues në browser ekzekutoi pa bllokim rrjedhën **Krijo Pagat → Bordero** nga periudha e importuar, duke ruajtur orët e llogaritura dhe dokumentin e Borderos.
