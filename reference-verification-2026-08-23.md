# Verifikim live i raporteve reference — 23/08/2026

Pas restart-it të preview-t, Qendra e Raporteve ngarkohet pa gabim dhe shfaq 145 raporte. Në filtrin Blerje shfaqen 25 raporte, përfshirë Kartela e furnitorit, Kartela e furnitorit — Formati 3, Furnitorët me maturim, Situacioni i furnitorëve sipas kategorive dhe Regjistri i doganimit të importeve. Raporti i Doganimit nuk është hapur ende në këtë kontroll; hapi i ardhshëm është hapja e kartës së raportit dhe verifikimi i renderer-it me 15 kolona, grupime dhe eksportet.


## Rezultati i verifikimit të Regjistrit të Doganimit

Raporti hapet nga Qendra e Blerjeve dhe përdor renderer-in reference. Në ekran shfaqen 15 kolona me katër grupe: Dokumenti doganor, Fatura, Shpenzime dhe Dogana; shfaqen 4 rreshta reale dhe metrikat Fatura 4 dhe Vlefta 14,520. Pamja është A4 landscape me header, periudhë, metrika, header të dyfishtë, total dhe footer. Butoni Excel është aktiv dhe u klikua; shkarkimi duhet kontrolluar në `/home/ubuntu/Downloads`.


## Eksportet e testuara

Excel-i u krijua me sukses si `purchase_customs_import_register_pdf_2026-08-23.xlsx` (7,797 bytes). PDF-ja u krijua me sukses si `purchase_customs_import_register_pdf_2026-08-23.pdf` (20,290 bytes), me 1 faqe A4 landscape. PDF-ja ka titullin, datën, header-in me katër grupe, 15 kolonat, rreshtat reale dhe footer-in me periudhën dhe faqen. Print Preview u hap nga i njëjti raport me të njëjtin header grupor dhe format horizontal.


## Kontroll i raportit të Shitjeve sipas sasisë

Navigimi në raportin `sales_quantity_pdf` nuk dha screenshot dhe pas pritjes browser-i ishte në `about:blank`, sepse Print Preview i mëparshëm hapi një tab/popup të ri. Raporti duhet rihapur në URL-në e preview-t para verifikimit tjetër; kjo nuk tregon gabim të renderer-it.


## Verifikim i Shitjeve sipas sasisë

Raporti hapet me renderer-in reference dhe shfaq header-in me dy nivele: Artikulli dhe Sasitë mujore. Shfaqen kolonat Grupi, Nën Grupi, Artikulli, Janar–Dhjetor dhe Totali (16 kolona). Në periudhën Fillimi — Sot nuk ka rreshta shitjeje, prandaj metrikat janë Artikuj 0 dhe Sasi totale 0; butonat e eksporteve mbeten të çaktivizuar siç duhet kur nuk ka të dhëna.


## Verifikim live — Artikujt e Shitur

Pas restart-it preview u ngarkua saktë në Qendrën e Raporteve dhe raporti `sales_items_sold_pdf` u hap nga karta e Shitjeve. Raporti është i regjistruar si format reference; verifikimi i tabelës me 11 kolonat e PDF-së vazhdon pas zgjedhjes së kartës në këtë tab.


## Kontrolli i fundit i raporteve të Shitjeve

`Artikujt e shitur` shfaq në ekran tre grupe header-i: Artikulli, Vlerat dhe Zbritja analitike, me 11 kolonat e PDF-së. `Shitjet sipas sasisë` u korrigjua që të ketë Artikulli + Janar–Dhjetor dhe fushat sipër Grupi/Nengrupi; `Shitjet sipas sasisë totale` përdor të njëjtën strukturë mujore pa kolonë të shpikur Totali. `Marzhi i shitjeve` u korrigjua në 12 kolonat e PDF-së. `Shitjet sipas artikujve` u zgjerua me Klienti, Sasia, Çmimi, grupet e artikullit, volumin dhe Vlere(MB).


## Verifikim live — Marzhi i Shitjeve

Preview shfaq `Marzhi i shitjeve` me tre grupe: Artikulli, Kosto dhe shitje, Marzhi bruto. Tabela ka 12 kolonat: Kartela, Emërtimi i Artikullit, Njësia, Sasia e Shitur, Kosto/Njesi, KMSH, Çmimi i shitjes, Vlera Shitjes, Marzhi Bruto me Zbritje, Marzhi Bruto % me Zbritje, Marzhi Bruto dhe Marzhi Bruto %. Në periudhën Fillimi — Sot nuk ka rreshta dhe metrikat janë zero.

## Verifikim live — Regjistri Përmbledhës i Shitjeve

Preview u ngarkua pa error runtime pas patch-it. Renderer-i është gati për skemën me 16 kolona dhe grupet: Dokumenti, Klienti dhe artikulli, Zbritje, Vlera me zbritje dhe Vlera në Mon Baze. Pamja e Qendrës së Raporteve vazhdon të përdorë layout-in e reference me faqe të bardhë dhe header vjollcë.


## Verifikim live — Regjistri Analitik i Magazinas

Raporti u hap me 10 kolonat e sakta dhe orientim horizontal. U vu re një grupim vizual `Të tjera` vetëm mbi kolonën `Dt Regj`, ndërmjet grupeve `Dokumenti` dhe `Artikulli`; kjo kërkon kontroll të source/runtime të emrit të kolonës dhe një rifreskim të serverit para checkpoint-it. Metrikat ishin zero në periudhën Fillimi — Sot.

## Kontroll pas restart-it — Regjistri Analitik i Magazinas

Pas restart-it, preview u hap sërish pa gabim, me 10 kolonat e raportit. Në runtime ende u shfaqën grupet `Dokumenti`, `Të tjera`, `Artikulli`, `Sasitë dhe vlerat`, megjithëse source-i i renderer-it tashmë përdor `Dt Regj`. Ky është një problem i identifikimit të runtime/proxy-t ose i emrit të kolonës së kthyer dhe duhet izoluar para checkpoint-it final.

## Diagnostikë DOM — Regjistri Analitik

DOM-i live konfirmoi kolonat `Lloji`, `Numri`, `Data`, `Dt Regj`, `Kartela`, `Përshkrimi`, `Njësia`, `Sasia`, `Çmimi`, `Vlefta`. Grupet e renderuara janë `Dokumenti` (3 kolona), `Të tjera` (1 kolonë), `Artikulli` (3 kolona) dhe `Sasitë dhe vlerat` (3 kolona). Pra mospërputhja është vetëm te emri i kolonës së grupit: source-i i preview-t në runtime ende përdor `Dt Reg` ose version të vjetër; duhet normalizuar me alias të qëndrueshëm ose rifreskuar build-i i klientit.

## Verifikim DOM pas hot reload-it

DOM-i vazhdon të raportojë grupet `Dokumenti` (3), `Të tjera` (1), `Artikulli` (3), `Sasitë dhe vlerat` (3), ndërsa header-i real mbetet `Lloji`, `Numri`, `Data`, `Dt Regj`, `Kartela`, `Përshkrimi`, `Njësia`, `Sasia`, `Çmimi`, `Vlefta`. Për të shmangur çdo mospërputhje të mbetur, grupimi duhet të lidhet sipas renditjes së kolonave dhe të mos varet vetëm nga lookup-i i tekstit.

## Rezultat i fallback-ut sipas pozicionit

Testi unit kalon, por preview-ja live ende shfaq `Dokumenti` (3), `Të tjera` (1), `Artikulli` (3), `Sasitë dhe vlerat` (3). Kjo konfirmon se URL-ja e browser-it po shërben një bundle të klientit që nuk përmban ndryshimin e fundit; patch-i i ardhshëm do të shmangë këtë varësi duke e ndërtuar grupimin edhe nga CSS/DOM? Para përdorimit të një zgjidhjeje, kontrollohet mënyra e menaxhuar e preview-t dhe versioni aktiv.

## Verifikim me cache-bust

Rihapja me query cache-bust dhe klikimi i kartës nuk e ndryshuan grupimin live: `Dokumenti`, `Të tjera`, `Artikulli`, `Sasitë dhe vlerat`. Source-i dhe testet lokale janë të sakta; kontrolli i radhës është të verifikohet bundle-i/URL-ja e preview-t aktiv, jo të zgjerohet më tej logjika e raportit pa prova.

## Status pas rindërtimit të dist

`pnpm build` krijoi bundle të ri statik (`index-C6zqOffG.js`) dhe serveri u rinis. Preview i menaxhuar u hap sërish me 145 raporte; modal-i i raportit duhet të hapet nga karta për të konfirmuar grupet e bundle-it të ri.

## Verifikim përfundimtar — Regjistri Analitik i Magazinas

Pas rindërtimit të dist, browser-i ngarkoi `assets/index-C6zqOffG.js`. DOM-i konfirmoi grupet `Dokumenti` (4 kolona), `Artikulli` (3 kolona) dhe `Sasitë dhe vlerat` (3 kolona), pa grupin `Të tjera`. Header-i është `Lloji`, `Numri`, `Data`, `Dt Regj`, `Kartela`, `Përshkrimi`, `Njësia`, `Sasia`, `Çmimi`, `Vlefta`.

## Verifikim përfundimtar — Regjistri Përmbledhës i Shitjeve

Preview dhe DOM konfirmuan pesë grupe: `Dokumenti` (5), `Klienti dhe artikulli` (3), `Zbritje` (4), `Vlera me zbritje` (2) dhe `Vlera në Mon Baze` (2). Të 16 kolonat janë në rendin e PDF-së: Nr Rend, Lloj, Nr, Date, Mon, Kod i Klientit, Kodi Artikulli, Vlefta Artikulli, Zbritje Anal., Zbritje Tot., Zbritje %, Zbritje Gjithsej Vlefta, Vlera me Zbritje pa TVSH, Vlera me Zbritje me TVSH, Vlera në Mon Baze pa TVSH, Vlera në Mon Baze TVSH.

## Verifikim live — Artikujt e Pashitur

Raporti u hap me të dhëna reale dhe paraqet vizualisht kolonat `Nr. Blerje`, `Dt`, `Njësia`, `Kartelë`, `Emërtimi i Artikullit`, `Kodi Bar` dhe `Gjendje`, me 3 artikuj dhe rresht `TOTALI I RAPORTIT`. Header-i i sipërm ende etiketohet `Të dhënat e raportit`, sepse ky format nuk ka grupim të regjistruar në renderer; duhet shtuar grupi i posaçëm i PDF-së me këto 7 kolona.

## Statusi i bundle-it — Artikujt e Pashitur

Pas rindërtimit dhe restart-it, Qendra e Raporteve u ngarkua saktë me 145 raporte. Modal-i i Artikujve të Pashitur do të kontrollohet tani për të konfirmuar grupin `Të dhënat e raportit` dhe shtatë kolonat e PDF-së.

## Diagnostikë DOM — Artikujt e Pashitur

Bundle-i i ri është aktiv (`index-C68hM1J_.js`). Kolonat reale të runtime-it janë `Nr. Blerje`, `Dt.`, `Njësia`, `Kartelë`, `Emërtimi i Artikullit`, `Kod Bar`, `Gjendja`. Skema e renderer-it përdorte emrat `Dt`, `Kodi Bar` dhe `Gjendje`, ndaj header-i u nda në `Të dhënat e raportit`, `Të tjera`, `Të dhënat e raportit`, `Të tjera`. Mapping-u duhet korrigjuar me emrat realë të kolonave.

## Statusi final i preview-t — Artikujt e Pashitur

Bundle-i i ri u ngarkua pa gabim në Qendrën e Raporteve dhe shfaq 145 raporte. Modal-i është gati për verifikim të grupit të vetëm `Të dhënat e raportit` dhe shtatë kolonave reference.

## Verifikim përfundimtar — Artikujt e Pashitur

Bundle-i final (`index-CWgnPBx3.js`) shfaq saktë një grup të vetëm `Të dhënat e raportit` me `colSpan=7`. Kolonat DOM janë `Nr. Blerje`, `Dt.`, `Njësia`, `Kartelë`, `Emërtimi i Artikullit`, `Kod Bar`, `Gjendja`; 3 rreshtat reale dhe `TOTALI I RAPORTIT` mbeten të pranishëm.

## Statusi i verifikimit — Shitjet sipas Qyteteve

Qendra e Raporteve u ngarkua saktë me 145 raporte pas build-it final. Karta e Shitjeve sipas Qyteteve është gati të hapet për të konfirmuar kolonat `Qyteti`, `Klientë`, `Fatura`, `Vlera` dhe strukturën e header-it reference.

## Verifikim përfundimtar — Shitjet sipas Qyteteve

Preview dhe DOM konfirmuan grupin e vetëm `Të dhënat e raportit` me `colSpan=4` dhe kolonat `Qyteti`, `Klientë`, `Fatura`, `Vlera`. Raporti shfaq metrikat Qytete, Fatura dhe Vlera, si dhe footer-in reference; periudha Fillimi — Sot nuk kishte rreshta shitjeje.

## Krahasim live PDF reference vs Cloud — Regjistri Përmbledhës i Shitjeve

Burimi reference: `/home/ubuntu/upload/crshitjeregjistripermbledhes.pdf`, faqja 1 nga 36. PDF-ja shfaq titullin `REGJISTRI PERMBLEDHES I SHITJEVE`, periudhën `01/01/2026-31/12/2026`, header me grupe `Dokumenti`, `Kod i Klientit`, `Vleftë Artikulli`, `Zbritje`, `Zbritje Gjithsej`, `Vlera me Zbritje`, `Vlera në Mon Bazë`, rreshtin `Pike Shitje: MQ` dhe 15 kolonat e raportit.

Cloud preview URL: `https://3000-i4kjex99jh6tni9vqvo16-9303f068.us4.manus.computer/reports?module=Shitje&report=sales_summary_register_pdf&v=1787474000`. Raporti u hap në Qendrën e Raporteve me modal reference, grupim header-i dhe veprimet Print Preview/Excel/PDF. Krahasimi i plotë i modalit do të vazhdojë pas hapjes së kartës së raportit.

## Rezultati i krahasimit vizual — 2026-08-23

Krahasimi i drejtpërdrejtë i `crshitjeregjistripermbledhes.pdf` me preview-n Cloud tregoi se struktura e brendshme e tabelës tani është afër dhe header-i i Cloud u korrigjua duke ndarë `Kod i Klientit` nga `Vleftë Artikulli`. Megjithatë, raporti nuk është ende 100% identik vizualisht me PDF-në reference: Cloud përdor header vjollcë, kartela metrikash `Rreshta/Vlefta`, titullin `Raport reference`, periudhën `Fillimi — Sot` dhe footer-in `Sistemi Genit Cloud · 8/23/2026`, ndërsa PDF-ja përdor faqe të bardhë me header të verdhë/jeshil, vitin sipër majtas, datën sipër djathtas, rreshtin `Pike Shitje: MQ`, footer-in e printerit dhe formatin e vet të faqosjes. Në Cloud aktualisht ka 16 kolona të skemës API dhe 16 kolona të paraqitura në header-in e modalit; PDF-ja reference shfaq të njëjtin organizim funksional, por me emërtime dhe stil tjetër në disa nën-kolona.

## Verifikim live pas unifikimit të stilit

Pas build-it dhe restart-it, modalja e Regjistrit Përmbledhës të Shitjeve shfaq vitin, periudhën, titullin e centralizuar, tabelën krem me grupet `Dokumenti`, `Kod i Klientit`, `Vleftë Artikulli`, `Zbritje`, `Vlera me zbritje` dhe `Vlera në Mon Baze`, si dhe footer-in e faqes. Eksportet reference tani përdorin ngjyrat krem/dark të header-it dhe aktivizojnë landscape automatikisht kur raporti ka më shumë se 8 kolona.


## Krahasim live në dy tab-e — Regjistri Përmbledhës i Shitjeve

PDF-ja reference `/home/ubuntu/upload/crshitjeregjistripermbledhes.pdf` u hap në tab-in reference dhe raporti `/reports?module=Shitje&report=sales_summary_register_pdf` u hap në tab-in Cloud. Cloud-i tani paraqet 16 kolonat në rendin e PDF-së, header-in krem me grupet e ndara, titullin, vitin, periudhën, totalin dhe footer-in. Përputhja strukturore është e mirë. Mbeten për t’u harmonizuar me burimin reference emërtimet/stili specifik i disa nën-kolonave dhe periudha reale e të dhënave: PDF-ja ka `01/01/2026-31/12/2026` dhe rreshta, ndërsa preview-i aktual u shfaq me `Fillimi — Sot` dhe pa rreshta.


## Krahasim live — Gjendja e Magazinas

Cloud preview u hap në `/reports?module=Magazina&report=inventory_warehouse_status_pdf` dhe tani shfaq `Magazina` si metadata, jo si kolonë. Tabela ka 11 kolonat e PDF-së: `Kartelë`, `Përshkrimi`, `Grupi`, `Njësia`, `Log. Inventar`, `Hyrje`, `Dalje`, `Gjendje`, `Kosto`, `Vlefta`, `Në %`; grupet janë `Artikulli`, `Lëvizja`, `Vlerësimi`. PDF-ja dhe Cloud përputhen në strukturën e header-it dhe orientimin landscape. Periudha e preview-t mbetet `Fillimi — Sot` dhe pa rreshta reale në këtë hap, prandaj krahasimi i vlerave kërkon të njëjtin filtër reference.


## Krahasim live në dy tab-e — Kartela e Furnitorit

PDF-ja reference `/home/ubuntu/upload/crfurnitorkartela.pdf` ka 2 faqe dhe faqja e parë paraqet `KARTELA E FURNITORIT ne MB`, vitin 2026 sipër majtas, periudhën `01/01/2026-31/12/2026`, metadata-n Furnitori/Nr Llogarie/Mon/Titulli/NIPTI, si dhe tre grupe: `Dokumenti` me 6 kolona, `Monedha Baze` me 3 kolona dhe `Monedha e Llogarie` me 3 kolona.

Cloud `/reports?module=Blerje&report=purchase_supplier_card_pdf` u hap me të njëjtin rend dhe DOM-i konfirmoi 3 grupe me colSpan 6/3/3, 12 kolonat `Nr Rend`, `Data Rregj`, `Lloj Dok`, `Nr Dok`, `Data Dok`, `Përshkrimi i Veprimit`, `Debi`, `Kredi`, `Progresivi`, `Debi llogari`, `Kredi llogari`, `Progresivi llogari` dhe 4 rreshta. Struktura e tabelës përputhet; mbetet për t’u harmonizuar emërtimi/stili i saktë i titullit dhe periudhës nëse kërkohet kopje pikë për pikë.


## Çifti i tretë — Kartela e Furnitorit Formati 3

Cloud u hap në `/reports?module=Blerje&report=purchase_supplier_card_format3_pdf`. Preview-ja shfaq metadata-n e furnitorit dhe tabelën me grupet `Dokumenti` dhe `Monedha bazë`; DOM-i do të kontrollohet në hapin e krahasimit me PDF-në `crfurnitorkartelaformat3.pdf` për të konfirmuar 9 kolonat dhe footer-in.


## Verifikim Formati 3 — përputhje e header-it

PDF-ja `crfurnitorkartelaformat3.pdf` paraqet `KARTELA E FURNITORIT (Formati i Thjeshtë)` me periudhën 01/01/2026–31/12/2026, metadata-n e furnitorit dhe 9 kolona: 6 nën `Dokumenti` dhe 3 nën `Monedha Baze`. Cloud u verifikua me DOM dhe konfirmoi grupet `Dokumenti` colSpan 6 dhe `Monedha bazë` colSpan 3, kolonat e njëjta në të njëjtin rend dhe 4 rreshta. Struktura e tabelës është identike; ndryshimi i mbetur është vetëm kapitalizimi/teksti i titullit dhe periudhës së shfaqur në UI.

## Verifikim Furnitorët me maturim — 23/08/2026

PDF-ja `crfurnitormaturimifushashtese.pdf` është shumëfaqëshe. Faqja 1 përmban titullin `MATURIMI I FURNITORIT (me fusha shtese)`, datën e raportimit 22/08/2026, periudhën 22/08/2026–31/12/2026 dhe filtrin e datës së maturimit; tabela fillon në faqen 3. Cloud tani ka titullin dhe tabelën reference me 13 kolona, të ndara në grupet `Të dhënat e raportit` (5 kolona) dhe `Koha e Maturimit` (8 kolona), me 4 rreshta dhe total. Përputhja strukturore e header-it u verifikua live; mbeten për t’u harmonizuar metadata/filtri shumëfaqësh dhe footer-i specifik `Printuar nga Alpha Platinium www.imb.al` nëse kërkohet identitet i plotë i PDF-së.

## Verifikim Regjistri i Doganimeve — 23/08/2026

PDF-ja `crdoganimeregjimporte.pdf` paraqet titullin `Regjistri i Doganimeve te Exportit`, vitin 2026 sipër majtas dhe një tabelë me 15 kolona në një rresht të vetëm header-i: `Ref.`, `Nr.Fl.Dog.`, `Dt Fl.Dog.`, `Vl.Fatures`, `M onedha`, `Kursi`, `Vlefta`, `Transport`, `Siguracion`, `Refer./Tjera`, `Vl.Dogane`, `Dog`, `Akciz`, `Vl pa TVSH`, `TVSH`. PDF-ja nuk ka rresht header-grupesh; ka vetëm rreshtin `Totali :` dhe footer-in `Printuar nga Alpha Platinium www.imb.al`. Cloud aktualisht ka të njëjtat 15 kolona, por shfaq grupet shtesë `Dokumenti doganor`, `Fatura`, `Shpenzime`, `Dogana`, titull generic dhe rreshtin `TOTALI I RAPORTIT`; këto janë dallime të dukshme që duhen korrigjuar për kopje më të saktë.
