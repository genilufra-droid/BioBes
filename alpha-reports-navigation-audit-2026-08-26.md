# Alpha Web — Audit i navigimit të Raporteve

Data: 2026-08-26
Burimi live: https://alpha.al/FaqeKryesore.aspx?google=true&idTheme=17657&scopeID=e9a0afb2-fea0-4450-b287-8eaf085e3373

## Gjetjet e verifikuara

Në Alpha Web, menuja kryesore `Raporte` hap një nënmenu sipas fushës funksionale. Nënmenuja e vëzhguar përmban: `Arka`, `Banka`, `BI`, `Blerje`, `Fatura Blerjes Einvoice`, `Inventar`, `Klientë dhe furnitorë`, `Kontabilitet`, `Shitje` dhe `Fatura shitje Einvoice`.

Raportet hapen në një dritare pune të veçantë sipas kategorisë së zgjedhur. Në pamjen e verifikuar, hyrja `Shitje` është pjesë e nënmenusë Raporte dhe pas zgjedhjes së saj ngarkohet faqja/dritarja e raporteve të shitjeve. Kjo është e ndryshme nga vendosja e të gjitha raporteve në një listë të vetme të sheshtë.

Në faqen kryesore të Alpha Web shfaqen gjithashtu workspace-t e lidhura `Blerje dhe shitje`, `Arka dhe Banka`, `Kontabilitet`, `Inventar` dhe `Raporte`, por ndryshimi i kërkuar për këtë cikël kufizohet vetëm te menuja dhe modelet e Raporteve.

## Kufiri i implementimit

Ky audit nuk autorizon ndryshime në `Skedarë`, `Konfigurime`, `Çelje`, `Regjistrime`, `Paga` ose module të tjera. Këto gjetje do të përdoren vetëm për përshtatjen e `ReportsCenter`, katalogut të raporteve dhe renderer-ave PDF/HTML/Print/Excel.

## Nënmenuja Raporte e verifikuar live

Nënmenyja horizontale e Alpha Web shfaq këto hyrje në këtë rend: `Arka`, `Banka`, `BI`, `Blerje`, `Fatura Blerjes Einvoice`, `Inventar`, `Klientë dhe furnitorë`, `Kontabilitet`, `Shitje`, `Fatura shitje Einvoice`. Nga HTML-ja e faqes u verifikuan lidhjet `Raportet.aspx?idmod=...` për këto kategori; Alpha i hap raportet përmes një faqeje/dritareje të dedikuar sipas modulit, jo si një tabelë e vetme e përzier.

Për kategorinë `Shitje`, hyrja e saktë është elementja `Shitje` dhe jo `Fatura shitje Einvoice`. Kjo duhet të ruhet si dallim në menu dhe në katalogun e cloud-it.

## Faqja e dedikuar `Raportet.aspx`

Me URL-në live `Raportet.aspx?idmod=19&google=true&scopeID=...`, Alpha Web hap një ekran të veçantë Raportet me kërkim `Kerko`, komandat `Ndihme`, `Minimizo`, `Maksimizo`, accordion/grupin `Kryesore` dhe grupin `Te Tjera 2`. Brenda grupit Kryesore shfaqen kartat `Shitje`, `Magazina`, `Blerje`, `Kontabiliteti` dhe `Listepagesat`. Grupi i dytë ka hyrjen `SHTO KETU...`.

Klikimi mbi kartën `Shitje` e navigon Alpha-n te një `Raport_PivotGrid.aspx` të veçantë për modulin e zgjedhur. Kjo tregon se modeli i Alpha-s është: Raporte → grup kryesor → kartë moduli → ekran/listë e modeleve të atij moduli, me ndarje të qartë nga modulet operative.

## Ekrani i modeleve të Raporteve

Pas zgjedhjes së kartës `Shitje`, Alpha Web hap `Raport_PivotGrid.aspx` me toolbar-in `Ruaj`, `Shiko`, `Shto`, `Klono`, `Modifiko`, `Fshi`, komandat `Ndihme`, `Minimizo`, `Maksimizo`, fushën `Kerko...` dhe tab-et `Te pergjithshme`, `Konfigurimi`, `Raporti`. Ekrani ka tabelë konfigurimi me kolonat `Kodi`, `Pershkrimi`, `#` dhe `Autorizime`, si dhe funksionin për tërheqjen e kolonave për grupim.

Kjo konfirmon se Alpha ndan qartë katalogun/konfigurimin e modeleve nga pamja e dokumentit të gjeneruar. Për cloud-in do të ruhet e njëjta ndarje brenda modulit Raporte, ndërsa të dhënat e modeleve do të vijnë nga katalogu dhe query-t realë të kompanisë aktive.

## Verifikim krahasues në cloud

Në preview-in e Sistemi Genit Cloud, `/reports` tani nis me kartat e moduleve `Shitje`, `Magazina`, `Blerje`, `Kontabiliteti` në grupin `Kryesore` dhe `CRM`, `Banka` në `Te Tjera 2`. Klikimi i kartës `Shitje` ndryshon URL-në në `reports?module=Shitje&report=sales_summary_register_pdf`, shfaq listën e modeleve të Shitjeve dhe nuk hap filtrat automatikisht. Kjo përputhet me rrjedhën e Alpha-s ku karta e modulit hap ekranin/listën e modeleve dhe modeli i zgjedhur hap dritaren e punës.

## Dritarja e filtrave e verifikuar

Pas klikimit të modelit `REGJISTRI PËRMBLEDHËS I SHITJEVE`, cloud-i hap një dritare pune me titull `Raporte Shitjeje`, toolbar `Mbyll`, `Shiko`, `Ndihmë`, `Printo`, `Excel`, `PDF`, listën anësore `Emri i Raportit`, blloqet `Shuma`, `Numer Dokumenti`, `Monedha`, `Klienti`, `DATË REGJISTRIMI`, `Identifikues`, `MAGAZINA`, si dhe veprimet `ESC - Dil` dhe `ENTER - Shiko`. Lista anësore ruan modelet e modulit Shitje dhe nuk rikthen menjëherë në menu.

Në cloud, kontakti me `Shitje` u verifikua se hap vetëm këtë dritare pas klikimit të modelit; kjo përputhet me rrjedhën e Alpha Web. Ky kontrakt do të përdoret për kontrollin e filtrave dhe të pamjes dokumentare.

## Kartela e Klientit — verifikim live

Cloud-i e shfaq `KARTELA E KLIENTIT` në dokument të veçantë me toolbar `Mbyll`, `Printo`, `Excel`, `PDF`; vitin dhe periudhën në header; rreshtin e ndërmarrjes, datën e dokumentit dhe datën e regjistrimit; identifikimin `Klienti`, `Mon`, `Nr. Llogarie`, `NIPT`; tabelën me kolonat `Nr Rend`, `Data Rregj`, `Lloj Dok`, `Nr Dok`, `Data Dok`, `Përshkrimi i Veprimit`, grupin `Monedhe Llogarie` me `Debi`, `Kredi`, `Progresivi`; rreshtin `Gjendja ne fillim`, rreshtin `Totali` dhe statusin `Debitor/Kreditor`.

Në verifikimin aktual nuk kishte të dhëna për klientin e zgjedhur, prandaj rreshtat ishin bosh dhe totalet zero. Struktura dhe progresivi u shfaqën; nuk u përdorën të dhëna të fabrikuara.

## Referencat PDF të Magazinës

`crmagregjpermbledhes.pdf` është dokument A4 me paraqitje portret dhe titullin `REGJISTRI PERMBLEDHES I MAGAZINES`. Header-i ka vitin në të majtë, titullin në qendër dhe periudhën në të djathtë. Tabela përdor kolonat `Lloji`, `Numri`, `Data`, `Dt Regj`, `Lloji Destinacioni`, `Përshkrimi`, `Vlefta`; rreshtat grupohen sipas magazinës dhe dokumentit, me shenjë të lëvizjes në kolonën e parë, dhe dokumenti ka footer me datë printimi dhe numër faqeje.

`crmagregjanalitik.pdf` është dokument A4 me paraqitje landscape dhe titullin `REGJISTRI ANALITIK I MAGAZINES`. Header-i përdor kolonat `Lloji`, `Numri`, `Data`, `Dt Regj`, `Kartela`, `Përshkrimi`, `Njësia`, `Sasia`, `Cmimi`, `Vlefta`. Rreshtat grupohen sipas dokumentit dhe artikullit; brenda grupit shfaqen totalet e dokumentit në të djathtë. Të dyja referencat përdorin sfond të verdhë të zbehtë, tekst të zi, grid të hollë, titull të madh të qendrës dhe footer-in Alpha.

## Dy modele të tjera të Magazinës

`crmaganalizaartikujve.pdf` ka titullin `ANALIZA E ARTIKUJVE` dhe paraqitje landscape. Tabela ka header me grupe shumë-nivelëshe: `Kartela`, `Emërtimi`, `Njësia`; `Gjendje me Pare`; `Hyrje` të ndara në `Nga Blerjet (FB)` dhe `Të Tjerat`; `Dalje` të ndara në `Për Shitje (FS)` dhe `Të Tjerat`; pastaj `Gjendje`, `Cmimi mesatar`, `Vlefta`. Vlerat e hyrjeve/daljeve janë të ndara sipas llojit real të lëvizjes, jo të kopjuara në kolona të njëjta.

`crmaggjendjaartikullitpermbledhur.pdf` ka titullin `GJENDJA E ARTIKUJVE E PERMBLEDHUR` dhe paraqitje landscape. Përmban një panel filtrash në header (`Filtra : Kartela :`) dhe tabelën me kolonat `Kartele`, `Pershkrimi`, `Grupi`, `Njesia`, `Llog. Inventar`, `Gjendje Mbartur`, `Hyrje`, `Dalje`, `Gjendje`, `Kosto`, `Vlefta`. Modeli duhet të përdorë gjendje mbartur/hyrje/dalje/gjendje/kosto reale dhe jo një tabelë të thjeshtuar me shtylla të tjera.

## PivotGrid i Blerjeve — verifikim live

URL-ja e verifikuar ishte `Raport_PivotGrid.aspx?idModuli=11&windowWidth=1280&vjenNga=undefined&scopeID=...`. Alpha hap një workspace të dedikuar me tab-et `Te pergjithshme`, `Konfigurimi` dhe `Raporti`. Në tab-in e përgjithshëm shfaqet kërkimi `Kerko...`, tabela e modeleve me kolonat `Kodi`, `Pershkrimi`, `#` dhe `Autorizime`, si dhe zona `Terhiqni ketu kolonat per t'i grupuar`. Në sesionin e testuar nuk kishte të dhëna të ngarkuara në grid, por struktura dhe kontrollet ishin të verifikueshme.

Kjo do të thotë se cloud-i duhet të ndajë qartë: (1) menunë e kategorive, (2) katalogun/listën e modeleve të Blerjeve, (3) konfigurimin e modelit dhe (4) dritaren e filtrave/dokumentit. Modeli nuk duhet të hapë direkt një tabelë të përmbledhur ose të gjenerojë rezultat pa veprimin `Shiko`.

## Referencat e Blerjeve — Maturimi

`crfurnitormaturimi.pdf` është A4 landscape me titullin `MATURIMI I FURNITORIT`, vitin në krye majtas, datën e raportimit, periudhën e maturimit dhe panelin `Filtra : Data e Maturimit`. Header-i identifikon Kod Furnitori, Emër Furnitori, Llogari Furnitori, Monedhë Llogarie dhe Monedha. Tabela ndahet në Dt. Dok, Nr Dok, Lloj Dok, Datë Maturimi, Ditë Maturimi, Tejkaluar, grupin `Koha e Maturimit` me intervalet 0, 1-30, 30-60, 60-90, 90-180, > dhe kolonën Totali.

`crfurnitormaturimipermbledhes2.pdf` është A4 landscape me titullin `MATURIMI I PERMBLEDHES`. Tabela ndryshon nga modeli i detajuar: Kod Klienti, Emri, Llogaria, Mon Lig, intervalet 0, 1-30, 30-60, 60-90, 90-180, Mbi 180 dhe Total. Poshtë tabelës ka `Totali sipas maturimit` dhe `Totali Gjithsej`. Këto janë dy modele të ndryshme dhe nuk duhet të marrin të njëjtin query ose të njëjtat kolona.

## Referencat e Blerjeve — Situacioni i furnitorëve

`crfurnitorsituacionsipaskateg.pdf` ka titullin `SITUACION I FURNITOREVE (sipas Kategorise)` dhe tabelë me header dy-nivelësh: `Furnitori` (Kodi, Emërtimi, Mon, Qyteti), `Monedhe Furnitori` (Debi, KREDI, Detyrimi) dhe `Monedhe Baze` (Debi, Kredi, Detyrimi). Rreshtat grupohen sipas `Kategoria` dhe kanë `Totali per kategorine`.

`crfurnitorsituacion.pdf` është model tjetër, me titullin `SITUACION I FURNITOREVE`; kolonat janë Nr Rend, Kodi, Emertimi i Furnitorit, Nr Llogarie, Kategoria, Shuma Debi, Shuma Kredi, Detyrimi dhe Pesha %, me rresht total. Dy modelet janë të ndryshme dhe duhet të mbeten të ndara në katalog, query dhe renderer.

## Verifikim live në cloud — Situacioni i Furnitorëve

Rruga `/reports?module=Blerje&report=purchase_supplier_situation_pdf` shfaq 29 modele të Blerjeve, me `SITUACIONI I FURNITORËVE` si model të veçantë. Pas `Shiko`, dokumenti hapet në pamjen reference me toolbar `Mbyll`, `Printo`, `Excel`, `PDF`, titullin `SITUACION I FURNITOREVE`, grupet `FURNITORI` dhe `VLERAT`, kolonat e dedikuara dhe rreshtat realë të furnitorëve. Modeli nuk bashkohet me `SITUACIONI I FURNITORËVE SIPAS KATEGORIVE`.

## PDF-të e Gjendjes së Magazinës

`crmaggjendjaartikullit.pdf`/Gjendja e Artikullit dhe `crmaggjendjamagazines.pdf` paraqesin tabelën horizontale me titull `GJENDJA E MAGAZINES`, periudhë në këndin e sipërm djathtas dhe kolonat Kartelë, Përshkrimi, Grupi, Njësia, Llog. Inventar, Hyrje, Dalje, Gjendje, Kosto, Vlefta dhe Në %. Varianti `crmaggjendjamagazinesdetajime.pdf` ka titullin `GJENDJA E MAGAZINES SIPAS DETAJMEVE TE ARTIKUJEVE`, përdor të njëjtat kolona, por grupon çdo artikull me nënrresht `Pa Detajme` dhe subtotal `Totali`. Të dy modelet janë landscape dhe ruajnë totalet reale sipas artikullit/magazinës.

## Verifikim live cloud — dritaret e Raporteve

Në preview të cloud-it, `/reports?module=Magazina&report=inventory_warehouse_status_pdf` dhe `/reports?module=Blerje&report=purchase_invoice_payment_register_pdf` hapin dritare full-screen Alpha-style me toolbar `Mbyll`, `Shiko`, `Ndihmë`, `Printo`, listën e modeleve majtas, filtrat në panele, lookup me ikonë lupë dhe komandat `ESC - Dil`/`ENTER - Shiko`. Dritarja e Magazinës shfaq filtrin e magazinës; dritarja e Blerjeve shfaq Furnitorin, Monedhën, Lloj Dokumenti, datat dhe intervalin e vleftës. Kjo konfirmon se raporti nis në filtrat e modelit dhe jo në tabelë agreguese.

## Verifikim shtesë — 26.08.2026

U verifikua që filtrat e Raporteve përdorin fushat e dedikuara për Partner, Kategori, Status, Monedhë, Dokument dhe Magazinë; filtrat monetarë lexojnë kolonën reale të vlerës. `reportCenter.get` ka kontroll company scope përpara `getOdooReport`, me regresion cross-company që provon se kompania A nuk lexon kompaninë B dhe query-ja nuk thirret pas refuzimit.

Variantet `accounting_revenue_summary`, `accounting_expense_summary` dhe `accounting_net_result` ekzekutojnë filtrimin e tyre para agregimit të përgjithshëm. Eksportet Excel/PDF/Print përdorin rreshtat pas filtrimit. Verifikimi lokal kaloi me 94 skedarë dhe 350 teste; BioBes u sinkronizua në commit `64f93058d885105f80c54afd0d35b4dc441a5917`, me CI web dhe windows-wrapper green në run-in `32963657526`.

## Verifikim live Alpha Web — nënmenuja Raporte

Pas hyrjes në Alpha Web u verifikua drejtpërdrejt se klikimi i `Raporte` në menunë blu hap një nënmenu horizontale me rendin: `Arka`, `Banka`, `BI`, `Blerje`, `Fatura Blerjes Einvoice`, `Inventar`, `Klientë dhe furnitorë`, `Kontabilitet`, `Shitje`, `Fatura shitje Einvoice`. Kjo nënmenu është e ndarë nga faqja `Raport_PivotGrid.aspx`, e cila hapet vetëm pasi zgjidhet kategoria dhe pastaj menaxhon modelet me `Ruaj`, `Shiko`, `Shto`, `Klono`, `Modifiko`, `Fshi`, tab-et dhe grid-in e konfigurimit.

Gjetja kryesore për cloud-in është që hyrja e Raporteve duhet të ketë një shell të qartë me dy hapa: zgjedhje kategorie dhe më pas workspace të modeleve. Dokumenti i gjeneruar duhet të hapet në një dritare tjetër, jo të bashkohet vizualisht me katalogun e modeleve. Verifikimi live u krye më 26.08.2026 pas hyrjes së suksesshme në Alpha Web.

Në verifikimin live të `Raport_PivotGrid.aspx?idModuli=19`, Alpha shfaq një workspace minimalist me vetëm tab-et `Te pergjithshme`, `Konfigurimi`, `Raporti`, kërkimin `Kerko...`, zonën `Terhiqni ketu kolonat per t'i grupuar` dhe grid-in `Kodi`, `Pershkrimi`, `#`, `Autorizime`. Në këtë hap nuk shfaqen kartat e moduleve dhe as dokumenti final. Kjo ndarje e qartë është referenca për listën e modeleve të cloud-it.

Verifikim live i Blerjeve: `https://alpha.al/Raportet.aspx?idmod=2&google=true&idTheme=17657&scopeID=16240df8-2bf8-479f-a3dc-63be1ca53a19`. Alpha hap direkt ekranin e zgjedhjes së modeleve, me kërkim `Kerko`, komandat Ndihmë/Minimizo/Maksimizo dhe dy grupe accordion: `Kryesore` me Ditari klasik, Lidhja e dokumentave, Lidhja e dokumentave sipas dokumenteve që ulin detyrimin, Ditari Total, Gjendja e përmbledhur e arkës, Arketimet dhe Pagesat; `Te Tjera 2` përmban `SHTO KETU...`. Kjo është strukturë tjetër nga PivotGrid-i i konfigurimit dhe duhet ruajtur si hap i veçantë para dokumentit.

Rrjedha live Blerje → Ditari klasik: nga `Raportet.aspx?idmod=2` klikohet karta `Ditari klasik` dhe hapet `Raporti.aspx?idraporti=133&idmod=2&windowWidth=1280&Filtro=true&scopeID=...`. Dokumenti ka toolbar `Shiko`, `Faqe Re`, `Pastro`, `Lista`, `Vizualizo ne Delta`; seksionet `Filtra kryesorë` dhe `Filtra të avancuar`; periudhat Aktuale/Periudha/Viti Ushtrimor/Gjithë Vitet; data e dokumentit dhe regjistrimit; numra llogarie, dokumenti, përshkrimi, lloj dokumenti, degë administrative, njësi Arka/Bankë, grupime dokumenti dhe kontrollet e ruajtjes. Kjo rrjedhë është më e pasur se filtri i thjeshtë i cloud-it dhe duhet të jetë referenca për Blerjet.
