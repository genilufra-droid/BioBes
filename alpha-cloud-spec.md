# Alpha → Cloud — specifikim zbatimi

## Parim drejtues

Sistemi Genit Cloud do të përdorë **Kontabiliteti Alpha / Alpha Platinum Business** si referencë për strukturën e ekranit, emërtimet, renditjen e fushave, toolbar-in, filtrat, regjistrat dhe rrjedhat e punës. Cloud-i ruan avantazhet e veta: multi-user, multi-company, akses nga shfletuesi, audit dhe të dhëna reale. Moduli i Pagave nuk ndryshohet në këtë punë.

## Burimet referencë

| Burimi | Përdorimi në projekt |
|---|---|
| `ManualiKontabilitetiAlpha.pdf` | Rregullat e dokumenteve, postimit, filtrimit, regjistrave, monedhave dhe rolit të magazinës. |
| Playlist `Alpha Platinum Business` nga IMB | Pamja, menuja, toolbar-et dhe rrjedha operative e moduleve. |
| Video “Moduli i Shitjeve” | Faturë Shitjeje, ofertë, faturë eksporti/doganimi, pagesa, regjistra dhe raporte. |
| Video “Moduli Inventarit” | Njësi administrative, kartela e artikullit, hyrje/dalje, metoda e kostos dhe raporte magazine. |

## Video-referencat e drejtpërdrejta

| Referenca | URL | Gjetja kryesore |
|---|---|---|
| Playlist Alpha Platinum Business | `https://www.youtube.com/playlist?list=PLE41B725C42DE1F68` | Përmban 13 video, përfshirë Shitjet, Blerjet, Inventarin, Likuiditetet, Prodhimin, Konfigurimet, Skedarë, import/eksport dhe mbyllje viti. |
| Moduli i Shitjeve | `https://www.youtube.com/watch?v=xyyWKvF7YIk` | Toolbar: Mbyll, Ruaj, I ri, Kërko, Fshi, Print, Postim, Ofertë, Dërgesë, Export, Ndihmë; faturë me klient, monedhë/kurs, artikuj, TVSH, pagesë, total në dy monedha dhe lidhje me daljen e magazinës/doganën. |
| Moduli Inventarit | `https://www.youtube.com/watch?v=qfYqrpAjet8` | Njësi administrative, kartelë artikulli, hyrje fillestare/blerje, lookup për magazinë-artikull-furnitor, metodë kostoje dhe raporte Kartela/Gjendja/Lëvizjet. |

## Pamja kryesore Alpha — specifikim i verifikuar nga videoja

Ekrani kryesor i Alpha është një shell desktop ERP me densitet të lartë informacioni, jo dashboard me karta të mëdha. Në cloud duhet të ruhet e njëjta hierarki dhe renditje, ndërsa dritarja e shfletuesit zëvendëson vetëm kornizën Windows.

| Zonë Alpha | Përbërja e verifikuar | Target cloud |
|---|---|---|
| Shirit i sipërm | Menu tekstuale: **Skedar**, **Konfigurime**, **Regjistrime**, **Raporte**, **Instrumenta**, **Ndihmë** | Navbar horizontal i ngjeshur, me submenu/panelet përkatëse |
| Paneli majtas | Lidhje të shpejta: Guida, IMB Support, Manual online, Print Screen, AlphaWEB, Zgjidh ndërmarrje; pastaj module vertikale | Sidebar/accordion me të njëjtin rend dhe me përzgjedhje të kompanisë cloud |
| Modulet majtas | Klientë dhe Shitje, Furnitorë dhe Blerje, Magazina, Arka dhe Banka, Punonjësit, Qendrat e Kostos, Kontabiliteti, Analizat | Module cloud të lidhura me faqet reale; Pagat/ Punonjësit nuk ndryshohen |
| Ambienti qendror | Harta e procesit me ikona dhe shigjeta: Klientë → Shitje → Veprime Klientë → Shitje Analitike; Kthim Shitje, Arkëtime, Dërgesa E-mail, Konfigurime, Raporte | Harta klikueshme që hap format/regjistrat përkatës |
| Paneli djathtas | Filtër i ngjeshur për partner, periudhë, klient, monedhë, vlerë, vërejtje; grid dokumentesh | Filter bar Alpha-style që ndryshon dataset-in e regjistrit |
| Fundi i ambientit | Raporte të shpejta dhe grafik mujor Shitje pa TVSH | Linke raportesh reale plus grafik nga fakturat reale |
| Status bar | Versioni dhe periudha aktive | Kompania aktive, viti/periudha aktive, përdoruesi dhe gjendja cloud |

## Menuja Skedar — specifikim i verifikuar nga videoja

Menuja **Skedar** është dropdown-i i parë në krye. Paneli hapet direkt nën etiketë, ka gjerësi afërsisht 220px, ikona majtas, ndarëse horizontale dhe hover blu të hapur. Nënmenuja e vetme e dukshme është te **Veprime**, e cila hapet në të djathtë.

| Rendi | Etiketa Alpha | Sjellja cloud e kërkuar |
|---:|---|---|
| 1 | Zgjedh Ndërmarrje | Hap listën/panelin real të kompanive aktive cloud |
| 2 | Backup/Restore | Hap zonën ekzistuese të backup/rivendosjes ose njoftim të qartë kur nuk është e disponueshme |
| 3 | Njesi Administrative | Hap cilësimet e strukturës së kompanisë |
| 4 | Njesi Lokale | Hap cilësimet e lokacioneve/magazinave |
| 5 | Konfigurim Softueri | Hap Cilësimet cloud |
| 6 | Grup & Njesi Artikujsh | Hap katalogun e artikujve |
| 7 | Gjenerim Katalogu | Hap katalogun e artikujve për krijim/eksport katalogu |
| 8 | Veprime → Arkivim i Dokumentave | Hap arkivën e dokumenteve/ngarkesave |
| 9 | Veprime → Import/Export | Hap Veprimet për import/eksport |
| 10 | Mbyllje Viti | Hap dialogun e Mbylljes së Vitit Ushtrimor; nëse backend nuk e mbështet, shfaq status të qartë pa ndryshuar të dhëna |
| 11 | Dalje | Ekzekuton logout real |

## Menuja Skedar — audit literal i videos, 2026-08-24

Ky audit zëvendëson interpretimet e mëparshme kur etiketat ndryshojnë. Videoja shfaq një menu Windows-style të bardhë/gri, me kufi të hollë të errët, gjerësi rreth 200–250px, ikonë të vogël majtas për çdo rresht dhe highlight blu të hapur në hover. **Nuk shfaq asnjë shortcut tastiere në tekst.**

| Rendi | Etiketa e dukshme në video | Shënimi literal |
|---:|---|---|
| 1 | Ndërmarrje | Ikonë majtas |
| 2 | Zgjidh Ndërmarrje | Ikonë majtas |
| 3 | Backup/Restore | Pas ndarëses |
| 4 | Njësi Administrative | Ikonë majtas |
| 5 | Njësi Lokale | Ikonë majtas |
| 6 | Konfigurim Skedarësh | Ikonë majtas |
| 7 | Grup & Njësi Artikujsh | Ikonë majtas |
| 8 | Gjenerim Kategorish | Ikonë majtas |
| 9 | Përdorues | Ikonë majtas |
| 10 | Arkiva e Dokumentave | Ka shigjetë nënmenuje |
| 11 | Mbyllje e Vitit | Ikonë majtas |
| 12 | Dil | Ikonë majtas dhe ndarëse sipër |

Nënmenuja e **Arkiva e Dokumentave** shfaq vetëm **Lidh** dhe **Hiq**. Dialogu i **Mbyllje e Vitit Ushtrimor** përmban `Viti 2013`, `Posto Vitin`, `Azhornim Llogarish`, tekst udhëzues të gjelbër, butonat `Ndihmë`, `Kontrollo`, `Mbyll Vitin Ushtrimor` dhe kontrollin e mbylljes me X të kuqe. Këto janë kriteret e pranimit; nuk duhen shtuar shortcut-e si tekst në menu.

## Njësi Administrative — audit literal i videos së Inventarit

Videoja e Inventarit (`qfYqrpAjet8`) hap **Skedar → Njësi Administrative** te 00:20–00:23, shfaq dialogun **Çelësi i Njësisë** te 00:24–01:30 dhe rihap modifikimin te 04:15–04:24. Ekrani fillestar është një dritare liste me toolbar të ngjeshur dhe një grilë filtrash sipas kolonave.

| Zonë | Elementet e dukshme në video |
|---|---|
| Toolbar | I ri, Ndrysho, Fshi, Rifresko, Printo, Eksporto në Excel. |
| Filtrat e grilës | Kodi, Përshkrimi, Lloji, Aktiv, Adresa. |
| Kolonat | Kodi, Përshkrimi, Lloji, Aktiv, Adresa. |
| Dialogu Çelësi i Njësisë | Kodi, Përshkrimi, Aktiv, Lloji, Vendndodhja, Kontakti, Shënime; butonat Ruaj dhe Mbyll. |
| Opsionet e magazinës | Metoda e inventarizimit: Intermjetëm, I vazhdueshëm, Inventar; Pike shitje furnizimi; Pa ndjekje gjendje. |
| Sjellja | I ri hap dialogun bosh; Ndrysho hap rreshtin e zgjedhur; Fshi kërkon konfirmim; Rifresko rifreskon listën; Printo/Excel përdorin dataset-in e filtruar. Zgjedhja Intermjetëm kërkon konfirmim sipas videos. |

Këto janë kriteret e pranimit për këtë ekran. Në cloud, njësitë duhet të jenë të kufizuara sipas ndërmarrjes aktive dhe lidhja e magazinës duhet të ruajë rrjedhën ekzistuese të stokut.

## Skedar — audit kohor shtesë i videos së mbylljes së vitit (në verifikim)

Analiza e segmentit 02:39–03:55 të videos `SuTvCHYXYzw` evidenton rendin: Ndërmarrje; Zgjidh Ndërmarrje; Backup/Restore; Njësi Administrative; Konfigurim Sektori; Grup & Njësi Artikulli; Gjener. Kategoritë; Analitikë; Arkiva e Dokumentave; Mbyllje viti; Dil. Segmenti hap **Mbyllja e Vitit Ushtrimor** në 02:41 dhe **Lista e Ndërmarrjeve** në 03:49. Ka konflikt në dy emërtime dhe në praninë e ikonave krahas auditit të mëparshëm të menusë; për këtë arsye **nuk ndryshohet ende kodi nga ky rezultat automatik**. Duhet verifikim pamje-për-pamje i segmenteve 02:39, 02:41, 03:47 dhe 03:49; më pas përdoret vetëm lista e konfirmuar vizualisht.

## Skedar dhe Njësi Administrative — verifikim live, 2026-08-24

Për rrjedhën e videos së Inventarit, `qfYqrpAjet8`, menuja live u kontrollua me rendin: Hap; Mbyll; Backup/Restore; Njësi Administrative; Magazina; Grupe & Kategori; Njësi matje; Konfigurim; Arkivë e Dokumentave; Import nga skedarë; Mbyllje Viti; Dil. Hapja **Njësi Administrative → I ri** shfaqi dialogun me toolbar Ruaj, Ruaj & I ri, Anullo, Dalje dhe fushat Kodi, Aktive, Lloji, Përshkrimi, Vendndodhja, Kontakti, Adresa, Shënime, si edhe Opsione Magazine me Metoda Inventarizimit, Pikë shitje furnizimi dhe Pa ndjekje gjendje. Kjo rrjedhë u verifikua në browser me listën reale të kompanisë aktive; nuk u krijuan të dhëna testuese të reja gjatë kontrollit.

Në testin live, menuja Skedar mbi **Lista e Njësive** u hap dhe rreshti **Njësi Administrative** qëndron në pozicionin e katërt pas Hap, Mbyll dhe Backup/Restore. Dialogu i krijimit u mbyll pa ruajtur; lista ruajti njësinë ekzistuese të kompanisë aktive.

Rreshti **Mbyllje Viti** u testua gjithashtu live: hap dialogun Mbyllje e Vitit Ushtrimor me vitin aktiv, Posto Vitin, Azhornim Llogarish, tekst udhëzues të gjelbër dhe butonat Ndihmë, Kontrollo, Mbyll Vitin Ushtrimor. Dialogu u mbyll me X pa ndryshuar të dhëna; mbyllja reale kontabël mbetet e bllokuar me mbrojtje.

## Skedar → Magazina — gjetje nga video dhe manual

Në videon e Inventarit `qfYqrpAjet8`, rreshti **Magazina** është i dukshëm te Skedar (00:20 dhe 04:11), por nuk zgjidhet. Videoja zgjedh **Njësi Administrative**, e cila çel dhe menaxhon entitetin magazinë në **Lista e Njësive**. Manuali e konfirmon se magazina e çelur ka kod, emër dhe vendndodhje; ky kod zgjidhet më pas te dokumentet FH/FD si adresë e dokumentit dhe te raportet e magazinës. Prandaj, në këtë version Alpha, nuk ka provë që Skedar → Magazina çel një formë të dytë të pavarur nga Njësi Administrative; këto duhet të përdorin të njëjtin master-data të magazinave, ndërsa **Regjistrime → Magazina** është ambienti operacional për hyrje/dalje/transferta dhe **Kërkesa → Magazina** është raportimi. Lokacionet e brendshme cloud janë nënndarje shtesë për stok dhe nuk duhet të zëvendësojnë magazinën Alpha.

## Skedar — audit autoritativ nga videoja “Administrimi menusë Skedarë”

Videoja `Pf4jEJIRmLs` është referenca e duhur për këtë menu. Renditja e menu-së kryesore është: Ndrysho Ndërmarrje; Zgjidh Ndërmarrje; Backup Restore; Strukturë Administrative; Njësi Administrative; Njësi Likujdimi; Konfigurim fushash; Grup & Njësi Artikulli; Qytete & Kategori; Postimi; Arkiva e Dokumentave; Import të dhënash; Mbyllje Viti; Dalje. Ka ndarëse pas Backup Restore dhe para Dalje. Çdo zë përdor ikonë të vogël majtas; Njësi Administrative, Njësi Likujdimi, Grup & Njësi Artikulli, Qytete & Kategori, Postimi dhe Import të dhënash kanë shigjetë nënmenuje.

| Nënmenu | Elementet e verifikuara nga videoja |
|---|---|
| Njësi Administrative | Pika Shitje; Pika Furnizimi; Magazina; Njësi Prodhim; Njësi të tjera. |
| Njësi Likujdimi | Arka; Banka. |
| Grup & Njësi Artikulli | Grupe / NënGrupe; Njësi Matje; Kodifikim Artikulli; Detajimi Artikullit; Nivelet e TVSH; Kufiri i gjendjes. |
| Qytete & Kategori | Qytete; Kategori Klienti/Furnitori; Afate Maturimi; Kategori Zbritje. |
| Postimi | Postimi i Pakthyeshëm; Postimi i Kthyeshëm; Kthim Postimi. |
| Import të dhënash | Importi standard; Import Nga Skeda; Konfigurim Format Importi; Grupon Importin; Importim. |

Manuali Alpha Business 8.0 konfirmon se **Skedarë → Qytete & Kategori → Qytete** çel qytetet dhe zonat për adresat e klientëve/furnitorëve, ndërsa **Skedarë → Njësi Likujdimi** çel njësitë kryesore Arka/Banka dhe nënnjësitë e tyre sipas monedhës me llogarinë kontabël, gjendjen fillestare dhe kursin. Ky audit zëvendëson menunë e gabuar të versionit të mëparshëm.

Verifikim kundrejt playlist-it të përdoruesit `PLE41B725C42DE1F68`: videoja nr. 5 është “Administrimi menusë Skedarë” (`Pf4jEJIRmLs`). Kontrata aktuale `alphaFileMenu.ts` ruan të njëjtin rend të menusë dhe gjashtë nënmenutë e audituara; nuk rezultoi mospërputhje tekstuale tjetër në këtë kontroll.

Kontrolli i playlist-it të ridërguar nga përdoruesi më 2026-08-24 konfirmon të njëjtin ID playlist dhe të njëjtën video nr. 5 “Administrimi menusë Skedarë”; kjo mbetet burimi autoritativ për Skedar.

Verifikimi live i 2026-08-24: dropdown-i shfaqi të 14 rreshtat në rendin e videos dhe klikimi te **Njësi Administrative** shfaqi nënmenunë Pika Shitje, Pika Furnizimi, Magazina, Njësi Prodhim dhe Njësi të tjera. Ky kontroll u bë në ambientin cloud pa modifikuar të dhëna.

### Kontrata vizuale e Skedar dhe Arka/Banka

Videoja tregon dropdown rreth 220 px të gjerë, rreshta rreth 22 px, sfond gri të çelur, kufi gri 1 px dhe ndarëse horizontale 1 px. Hover-i është gradient blu i çelur me kufi blu; teksti Tahoma/Segoe UI rreth 9 pt mbetet i zi. Ikonat janë funksionale, shumëngjyrëshe, rreth 16×16 px në kolonë të majtë; nënmenuja tregohet me trekëndësh të zi të plotë dhe hapet menjëherë djathtas, e rreshtuar me rreshtin prind. **Lista e Arka/Banka** përdor titull klasik blu, toolbar Shto/Modifiko/Fshi/Printo/Rifresko/Mbyll, zonë kërkimi dhe grilë me kolonat Kod, Përshkrimi, Lloji, Adresa.

Kontrolli paraprak live pas ndryshimit ngarkoi ambientin e kompanisë aktive pa gabim; hapi vijues është verifikimi i dropdown-it dhe navigimit Njësi Likujdimi → Arka/Banka.

Verifikim live i dropdown-it: Skedar shfaqi ikonat me ngjyra, trekëndëshat e zinj në rreshtat me nënmenu dhe nënmenuja Njësi Likujdimi shfaqi Arka dhe Banka në pozicionin djathtas të rreshtit prind.

Verifikim live i navigimit: Arka hap `/liquidity-units?type=CASH` me titullin Lista e Arka dhe Banka hap `/liquidity-units?type=BANK` me titullin Lista e Banka. Të dyja faqet shfaqin toolbar Shto/Modifiko/Fshi/Printo/Rifresko/Mbyll, kërkim dhe grilën e filtruar sipas llojit; nuk u krijuan të dhëna testimi.

Verifikim i formularit: Shto në Lista e Banka hap formularin Çelje Bankë me Kod/IBAN, Përshkrimi, Banka/Adresa, Monedha dhe Gjendja fillestare; formulari u mbyll me Anullo pa ruajtur asnjë rresht.

### Kontrata funksionale e Njësi Likujdimi

Videoja e Skedar tregon dritaren **Lista e Arka/Banka** me toolbar Shto, Modifiko, Fshi, Rifresko, Printo dhe Mbyll; kërkim me fushë **Kërko** dhe buton **Kërko**; si dhe grilën Nr., Kodi, Përshkrimi, Lloji, Adresa. Manuali e sqaron rrjedhën: krijohet njësia kryesore Arkë/Bankë me kod (i pandryshueshëm), përshkrim dhe kontakt; butoni Shto hap nënnjësitë e monedhës. Nënnjësia ruan emërtim, monedhë, llogari kontabël, kufizimin për kundërparti me të njëjtën monedhë, status aktiv, gjendje fillestare, kurs, vlerë në monedhë bazë dhe datë. Fshirja lejohet vetëm kur nuk janë kryer veprime; përndryshe njësia çaktivizohet dhe mbetet në raporte. Banka shton numrin e llogarisë bankare. Ruajtja kërkon Ruaj te nënnjësia dhe pastaj te njësia.

Verifikim live pas rindërtimit: Lista e Banka shfaqet si dritare klasike e punës me titlebar, toolbar në rendin Shto/Modifiko/Fshi/Rifresko/Printo/Mbyll, kërkim Kërko dhe grilë Nr./Kodi/Përshkrimi/Lloji/Adresa. Dritarja ruan të dhënat cloud dhe nuk përdor placeholder-e testimi.

Verifikim i Shto: formulari Çelja e bankë u hap mbi dritaren e listës dhe përmban Llogari bankare/IBAN, Përshkrimi, Banka/Adresa, Monedha, Aktiv dhe Vlera fillestare. U mbyll me Anullo pa krijuar të dhëna testimi.

### Audit funksional i Skedar — video Administrimi menusë Skedarë

Rendi i verifikuar në video: Ndërmarrje, Zgjidh Ndërmarrje, Backup Restore, Strukturë Administrative, Njësi Administrative, Njësi Likuidimi, Konfigurim fushash, Grup & Njësi Artikulli, Qytete & Kategori, Postimi, Arkiva e Dokumentave, Import të dhënash, Mbyllje Viti dhe Dalje. Videoja hap: modifikimin e ndërmarrjes me tabet Të përgjithshme/Konfigurim/Arkivim/Logo; listën e ndërmarrjeve aktive; strukturën Departamente/Sektorë; listat e njësive administrative dhe likuiduese; konfigurimin me checkbox të fushave të klientëve/artikujve; detajimet e artikullit, TVSH-në dhe kufijtë e gjendjes; kategoritë e klientëve, afatet e maturimit dhe zbritjet; arkivën e dokumenteve me filtra; dhe mbylljen e vitit me Posto Vitin/Azhurno Llogaritë. Importi, backup/restore, postimi, krijimi, fshirja dhe printimi nuk demonstrohen funksionalisht në këtë video dhe nuk duhen pretenduar si të verifikuara prej saj.

Verifikim live i Skedar → Grup & Njësi Artikulli → Njësi Matje: hap dritaren klasike Njësi Matje me toolbar Shto/Modifiko/Fshi/Rifresko/Printo/Mbyll, kërkim dhe grilë Nr./Kodi/Përshkrimi. Lista është e lidhur me tabelën reale units të kompanisë dhe nuk u krijuan të dhëna testimi.

Verifikim i formularit: Shto hap Çelja e Njësisë së Matjes me Kod dhe Përshkrimi, me udhëzime për shembujt Kg/Kilogram dhe copë/Copë. Formulari u mbyll me Anullo pa ruajtur të dhëna testimi.

## Struktura që duhet të ruhet

| Alpha | Cloud target | Statusi aktual |
|---|---|---|
| Skedarë / Ndërmarrje | Përzgjedhje dhe konfigurim multi-company | Pjesërisht ekziston |
| Çelje / Magazina, Artikuj, Klientë, Furnitorë | Master-data me lookup, kode dhe kartela | Ekziston, duhet përputhur vizualisht |
| Regjistrime / Shitje-Blerje | Ofertë, Faturë Shitje, Faturë Blerje, shërbime, eksport/doganë | Pjesërisht ekziston |
| Regjistrime / Magazina | FH, FD, FHF, FDF, transfer, proces-verbal | Pjesërisht ekziston |
| Postim | Dokument i ruajtur → postuar → i pandryshueshëm | Duhet standardizuar |
| Kërkesa / Shitje-Blerje | Regjistra, libër, analitikë, klient/artikull, eksport | Pjesërisht ekziston, kërkon audit Alpha |
| Kërkesa / Magazina | Kartelë, gjendje, lëvizje, regjistra, inventar | Pjesërisht ekziston, kërkon audit Alpha |

## Kontrata e dokumentit të Shitjes

Forma e Faturës së Shitjes duhet të ruajë: toolbar me Mbyll, Ruaj, I ri, Kërko, Fshi, Print, Postim, lidhje Ofertë, lidhje Dërgesë/Fletë Dalje, Export dhe Ndihmë; pikë shitje; numër/data/seri; monedhë dhe kurs; shënime; klient me lookup; detyrimi dhe afati; grilë artikujsh; TVSH; mënyrë pagese; totalet në monedhën e faturës dhe në Lek.

Fusha **Dalje nga Magazina / Si Dok Magazine** krijon vetëm një dalje stoku për dokumentin. Fusha **Fletë Doganimi** lejon lidhjen me dokument doganor eksporti. Dokumentet e ruajtura mund të korrigjohen ose fshihen vetëm para postimit; pas postimit qëndrojnë të pandryshueshme.

## Kontrata e dokumentit të Magazinës

Dokumentet kryesore janë Fletë Hyrje (FH), Fletë Dalje (FD), Fletë Hyrje Faturë (FHF) dhe Fletë Dalje Faturë (FDF). Çdo dokument mban magazinën, numrin, datën, origjinën/destinacionin, dokumentet shoqëruese, artikujt, sasinë, çmimin dhe vlerën.

Hyrja mund të vijë nga blerja, prodhimi, magazinë tjetër ose të tjera. Dalja mund të jetë për shitje, prodhim, transfer ose të tjera. Transferi duhet të krijojë hyrjen dhe daljen e lidhur. Dokumenti si faturë nuk krijon duplikim të lëvizjes së stokut.

## Prioriteti i parë i zbatimit

1. Përshtatje 1:1 e formës së Faturës së Shitjes sipas videos Alpha.
2. Përshtatje 1:1 e formës së Fletë Hyrje / Fletë Dalje dhe lidhjes me faturat.
3. Regjistrat Alpha-style për Shitje dhe Magazina me filtrat e dokumentit, datës, partnerit, magazinës, monedhës dhe statusit.
4. Postim dhe bllokim i dokumenteve të postuara; konfrontim i faturës me pagesën dhe me lëvizjen e stokut.
5. Raporte me link te dokumenti burimor, totalet, kuadrimin dhe eksportin PDF/Excel.

## Audit i parë i formës aktuale të faturës

| Element Alpha | Gjendja e gjetur në Cloud | Veprimi i kërkuar |
|---|---|---|
| Toolbar dokumenti | Cloud ka Anulo/Ruaj/Mbyll dhe statuset Draft/Posted/Paid. | Shto veprimet Alpha: I ri, Kërko, Fshi, Print, Postim, Ofertë, Dërgesë, Export, Ndihmë; ruaj gjithashtu escape route Mbyll. |
| Header faturë | Cloud ka numër, klient, datë dhe magazinë. | Shto pikë shitje, seri, monedhë, kurs, shënime dhe checkbox-et Doganë/Dokument Magazine/Auto-print. |
| Klienti | Cloud ka lookup klienti. | Shto detyrim të hapur dhe ditë afati pranë klientit. |
| Rreshtat | Cloud ka artikull, sasi, njësi, çmim dhe vlerë. | Shto kod artikulli, zbritje, neto, TVSH dhe total për rresht. |
| Totalet | Cloud shfaq total pa TVSH. | Shfaq neto, zbritje, TVSH dhe total në monedhën e faturës plus ekuivalentin Lek. |
| Dërgesa/stoku | Cloud ka magazinë të detyrueshme dhe sinkronizim në backend. | Ekspozo opsionin e dukshëm `Si Dok Magazine` dhe lidhjen me dokumentin e daljes pa dublim. |
| Postim | Cloud përdor statuse draft/posted në vende të ndryshme. | Bëj Postimin veprim të qartë dhe blloko editim/fshirje pas postimit. |

## Gjetje vizuale nga manuali Alpha Business — Fatura e shitjes

Faqet 158–160 të manualit tregojnë qartë formën bazë që duhet kopjuar në cloud. Dritarja e dokumentit ka një toolbar horizontal klasik me ikona sipër; poshtë tij vjen koka e dokumentit me fushat e identifikimit në të majtë dhe qendër, blloku i klientit në të djathtë dhe fushat operative në brez të veçantë nën to.

| Zonë | Përbërja që shihet në manual | Kërkesa për cloud |
|---|---|---|
| Toolbar sipër | Ikona të dendura të tipit Ruaj, I ri, Kërko, Fshi, Print, Postim dhe veprime ndihmëse | Të rindërtohet si toolbar i ngjeshur Alpha-style, jo si header modern me pak butona të mëdhenj |
| Koka e dokumentit | Pikë shitje, numër/reference, datë dokumenti, numër serial, monedhë, kurs | Të vendosen në rend të ngjashëm me Alpha, në panel kompakt me fusha lineare |
| Blloku i shitësit/blerësit | Subjekti shitës me NIPT/kontakte dhe subjekti blerës me adresë, NIPT, detyrim | Të krijohen dy blloqe të dallueshme, me detyrimin e klientit si fushë informative |
| Fushat operative | Fletë doganimi, dalje nga magazina, magazina, afat maturimi / ditë | Të shfaqen si checkbox-e dhe lookup-e të dukshme në kokën e dokumentit |
| Grila e artikujve | Kod, përshkrim, njësi, sasi, çmim, TVSH, vlerë | Të zgjerohet editori aktual që sot ka vetëm artikull/sasi/njësi/çmim/vlerë |
| Fundi i dokumentit | Total në Lek, kursi, totali i dokumentit dhe totali me TVSH | Të shfaqen totalet në monedhën e faturës dhe ekuivalenti në Lek në formë tabelare kompakte |

Manuali sqaron gjithashtu rregullat funksionale të këtyre fushave: pika e shitjes zgjidhet me lookup; numri i dokumentit mund të konfigurohet automatikisht; kursi lidhet me ndryshimin e monedhës; klienti zgjidhet me lupë; detyrimi dhe ditët e maturimit janë informative; ndërsa për faturat e eksportit aktivizohet fusha e fletës doganore. Këto sjellje duhet të dalin në UI dhe jo të mbeten vetëm logjikë e backend-it.

## Rregulla që nuk duhet të thyhen

- Pagat nuk preken.
- Nuk krijohen forma ose filtra të shpikur jashtë referencave Alpha pa arsye biznesi të dokumentuar.
- Një faturë e shitjes e shënuar si dokument magazine krijon një dalje stoku idempotente.
- Monedha, kursi dhe vlera në Lek ruhen dhe raportohen.
- Filtrat ndikojnë dataset-in e dokumentit dhe jo vetëm dritaren e kërkimit.
- Numri i dokumentit, lloji dhe magazina nuk ndryshohen pas ruajtjes; korrigjimi bëhet me rregulla statusi/postimi.

## Konfigurime — gjetje nga Manuali Alpha Business

Manuali Alpha Business 8.0 e ndan konfigurimin e ndërmarrjes në tabet **Të përgjithshme**, **Konfigurime**, **Arkivimi**, **Logo** dhe **Backup automatik**. Te Të përgjithshme ruhen kodi, forma e shoqërisë, përshkrimi, vendndodhja, qyteti, administratori, lloji i aktivitetit dhe të dhënat fiskale/kontakti. Te Konfigurime përcaktohen plani kontabël (PKP ose plan i lirë SKK), ngurtësimi direkt/indirekt, maturimi i klientëve/furnitorëve, mënyra e çmimeve dhe detajimi i artikujve. Arkivimi zgjedh dokumentet që ruhen në PDF dhe historikun e ndryshimeve; Logo përdoret në dokumente/raporte; Backup automatik paralajmëron kur mungon kopja rezervë.

Burimi: `DOC-20260824-WA0032.pdf` / `alpha_business_text.txt`, Kapitulli 03, faqet 38–53; referenca videoje: playlist Alpha Platinum Business `https://www.youtube.com/playlist?list=PLE41B725C42DE1F68`.
