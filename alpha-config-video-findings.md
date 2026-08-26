# Gjetje nga videoja Alpha Platinum Business

## Burimi
Playlista: https://www.youtube.com/playlist?list=PLE41B725C42DE1F68
Videoja e Konfigurimeve: https://www.youtube.com/watch?v=Q_AJHvpbmZ0
Titulli i videos: **Konfigurimet për mënyrën e të punuarit në Alpha Business**, kohëzgjatje 10:45.

## Evidenca e lexueshme nga analiza e videos
Analiza automatike e videos identifikon se menuja **Konfigurime** përmban këto dritare: **Artikuj / Lista e Artikujve**, **Çmime Shitjeje / Përcaktim Çmimesh Shitjeje**, **Zbritje Analitike / Përcaktim Zbritjesh për Artikuj**, **Klientë / Furnitorë / Lista e Klientëve dhe Furnitorëve**, **Emetuesit / Emetuesit e Instrumenteve Financiare**, **Qendra e Kostos / Qendrat e Kostos**, dhe **Grupim Dokumentash / Grupe Dokumentash**.

Lista e Artikujve ka kolonat Kod, Emërtimi, Njësia, Lloji dhe Grupi, si edhe veprimet Shto, Ndrysho dhe Fshi. Përcaktimi i çmimeve ka filtra për Grupin, NënGrupin dhe Artikullin dhe një tabelë me nivele të shumëfishta çmimesh. Zbritjet analitike përcaktojnë përqindje zbritjeje sipas artikullit ose grupit. Lista e klientëve/furnitorëve shfaq Klient/Furnitor, Kod, Emërtimi, NIPT, Qyteti dhe Adresa. Emetuesit kanë Kodi, Emërtimi dhe Aktive. Grupet e dokumenteve kanë Kodi, Emërtimi dhe Lloji.

## Kufizim i detyrueshëm
Videoja përmend **Pagat**, por kjo pjesë është jashtë këtij auditi dhe nuk do të hapet, testohet, ndryshohet apo rindërtohet. Vetëm konfigurimet jo-payroll do të krahasohen me cloud-in.

## Gjendja e cloud-it
Cloud-i aktual ka dritaren klasike të Konfigurimeve me skedat Ndërmarrja, Konfigurime, Backup automatik dhe Fusha shtesë. Skeda Fusha shtesë ruan flamujt realë për Klientë, Furnitorë dhe Artikuj. Dallimet e videos që duhen verifikuar më tej janë menutë/dritaret e artikujve, çmimeve, zbritjeve analitike, listës së partnerëve, emetuesve, qendrave të kostos dhe grupeve të dokumenteve.

Këto janë gjetje paraprake nga analiza e videos; tekstet e paqarta vizualisht nuk do të shpiken pa verifikim të mëtejshëm.

## Verifikim live i implementimit
Më 25 gusht 2026, navbar-i live shfaq menunë **Konfigurime** me 11 hyrje dhe ikona në rendin e auditimit, pa hyrje Pagat. Hyrja **Çmime Shitjeje** hap `/config-pricing?mode=prices` me dritare klasike, filtrin e grupit, kërkim sipas kodit/emërtimit, tabelë me Kod/Emërtim/Njësi/Çmimi 1/Çmimi 2/Zbritja 1/Zbritja 2, ruajtje për rresht dhe eksport. Hyrja **Zbritje Analitike** hap të njëjtën dritare në modalitetin e konfigurimit të zbritjeve dhe përdor të njëjtat të dhëna reale të artikujve. U verifikuan gjithashtu mbyllja dhe rifreskimi i dritares.

## Analizë e dytë: formatet e dokumenteve
Analiza e drejtpërdrejtë e videos konfirmoi modelin standard Alpha: titlebar, toolbar me Shto/Modifiko/Pastro/Fshi/Ruaj/Ruaj-Mbyll/Ndihmë, header dokumenti me Nr/Data/Pika/Referenca dhe Klient/Furnitor/Monedha/Kursi, grid me Artikulli/Kodi/Emërtimi/Njësia/Sasia/Çmimi/Vlera pa TVSH/TVSH/Vlera me TVSH, si dhe footer me totale e seksion pagese. Listat kanë panel filtrash sipër tabelës dhe buton Kërko. U identifikuan gjithashtu Shpërndarja e Shpenzimeve të Blerjes, Regjistrime në Qendrat e Kostos dhe Raporte Kontabël. Pjesa e Pagave u përjashtua sipas kërkesës.

## Verifikim i formatit të faturës
Në preview live u hap fatura reale `bl-01` nga regjistri i blerjeve. Dritarja u shfaq full-screen me titlebar **Regjistrim Faturë Blerje — bl-01**, toolbar klasik me Mbyll, Paguaj Cash, Paguaj Bankë, Më vonë, Fshi, Excel, PDF dhe Print, si dhe dokumenti A4 i vendosur në qendër. Dokumenti përmban koka, furnitorin, datën, artikullin, sasitë, çmimet, TVSH-në, totalet dhe seksionin **TË DHËNAT E PAGESËS**. U verifikua se mbyllja dhe veprimet mbeten të dukshme pa u humbur rruga e kthimit në regjistër.

## Verifikim pas korrigjimit të parser-it
Pas rinisjes së serverit, preview live u ngarkua pa overlay Vite. Fatura reale `bl-01` hapet me **Regjistrim Faturë Blerje — bl-01**, butonat Mbyll/Paguaj Cash/Paguaj Bankë/Më vonë/Fshi/Excel/PDF/Print dhe dokumentin A4 të shfaqur. Build-i pas ndryshimit kaloi me sukses.

## Verifikim WebSocket
Pas vendosjes së `server.hmr = false` dhe rinisjes së serverit, workspace-i u ngarkua normalisht në preview live. Faqja kryesore shfaqi menutë, sidebar-in, proceset e shitjes, dokumentet reale dhe raportet pa overlay Vite. Ndryshimi synon vetëm mjedisin e preview-it; aplikacioni vazhdon të rifreskohet përmes rinisjes së dev serverit dhe nuk prek asnjë modul biznesi, veçanërisht Pagat.

## Verifikim live — Qendra e Kostos
Më 25 gusht 2026, `/reference-catalog?type=cost-centers` shfaqi `Lista e Qendrat e Kostos` me toolbar `I ri / Rifresko / Printo / Eksporto / Dalje`, kërkim në të gjitha fushat, tabelë me kolonat Nr., Kodi, Emërtimi, Lloji, Aktive dhe Veprime. Formulari `Qendër Kostoje e Re` u hap me Kodi, Emërtimi, checkbox Aktive dhe butonat Anullo/Ruaj; formulari nuk u ruajt dhe nuk u krijua rekord testues.

## Audit i dytë i plotë i videos — evidencë me intervale
Burimi: https://www.youtube.com/watch?v=Q_AJHvpbmZ0 — `Konfigurimet për mënyrën e të punuarit në Alpha Business`, kohëzgjatje 10:45.

Analiza e videos identifikoi këto intervale dhe elemente të dukshme:

- 00:00–00:08: workspace Alpha me header të sipërm, status-strip, sidebar, flowchart, grid dokumentesh me filtra dhe panel raportesh/grafik.
- 00:09–00:30: menuja Skedar me Zgjidh/Hap Ndërmarrje, Backup Restore, Struktura Administrative, Njësi Administrative, Njësi Likuidimi, Konfigurim fushash, Grup & Njësi Artikujsh, Qytete & Kategori, Zgjedhje postimesh, Arkiva, Importim, Mbyllje Viti, Dalje; dashboard Furnitorë/Blerje me flowchart dhe grid.
- 00:31–01:43: nënmenu për Departamente/Sektorë, Magazina, Arka/Banka, Klientë/Artikuj, Grupe/NënGrupe, Njësi Artikulli, Koeficientë, Njësi Matjeje, Detajime, Nivele TVSH, Kufij Gjendjeje, Qytete/Kategori/Afate/Zbritje, Postime dhe Import.
- 01:44–03:00: Konfigurime për Artikuj Qarkullues/Afatgjatë/Ekzistues, Instrumenta Financiarë, Çmime Shitjeje me filtra Grup/NënGrup/Artikull/Datë, Zbritje Analitike, Klientë/Furnitorë, Emetues, Llogari Kontabël, Skema Qendre Kostoje, Qendra Kostoje me Kod/Përshkrim/Qendër Kryesore Prodhimi, Raporte Financiarë, Modele Skenash, POS dhe Grupim Dokumentash.
- 03:01–03:52: Regjistrime për Magazinë, Fatura pa Artikuj, Instrumenta, Doganim, Shpërndarje Shpenzimesh, Oferta/Urdhërporosi, Likuiditete, Veprime me Partnerë, Prodhim, Qendër Kostoje, Amortizim, Veprime Kontabël dhe Dokumenta Automatikë.
- 03:53–06:56: Raporte të ndara për Likuiditete, Magazina, Prodhim, Shitje, Blerje, dokumente shoqëruese, Kontabilitet dhe raporte financiare/menaxheriale.
- 06:57–08:07: Instrumenta për Monedha/Kurse, Inventar, Amortizim, Tatime, Tabela Kontabilizimi, Konfigurim Raportesh dhe Preferenca.
- 08:08–10:44: Ndihmë me Manual, Manual online, suport, udhëzues, këshilla dhe të reja versioni.

Këto gjetje janë evidencë e jashtme nga videoja dhe duhet të përdoren për auditim; tekstet ose fushat që nuk verifikohen vizualisht nuk duhet të shpiken. Pjesa Pagat u përjashtua plotësisht sipas kërkesës së përdoruesit.

## Krahasim vizual live — 25 gusht 2026
Screenshot-et e preview-t zbuluan dallime që nuk duhet të quhen 1:1: Konfigurimet ka kornizë të ngjashme Alpha, por Artikujt ende kanë buton modern vjollcë dhe kartë të madhe njoftimi; Klientë/Furnitorë përdorin emoji në tabs dhe butona modernë Excel/PDF; Emetuesit dhe Qendrat e Kostos shfaqen bosh pa të dhëna, ndërsa videoja tregon dialogë me etiketa/fusha specifike; Çmime/Zbritje kanë tabelë funksionale, por toolbar-i është më i reduktuar se modeli i videos. Këto dallime do të trajtohen si korrigjime të detyrueshme, pa krijuar të dhëna artificiale dhe pa prekur Pagat.
## Verifikim live pas korrigjimit të kolonave — 25 gusht 2026
Screenshot-et e fundit konfirmuan: Emetuesit shfaqin Nr./Kodi/Emetuesi/Veprime; Qendrat e Kostos shfaqin Nr./Kodi/Emërtimi/Qendra kryesore e prodhimit/Aktive/Veprime; Grupet e Dokumenteve shfaqin Nr./Kodi/Emërtimi/Lloji/Veprime. Artikujt kanë toolbar Alpha dhe titull pa emoji; Klientët/Furnitorët kanë tabs pa emoji, toolbar me numërim dhe veprime reale. Rekordet bosh shfaqen si gjendje reale dhe nuk u mbushën me të dhëna të fabrikuara. Pagat nuk u hapën ose ndryshuan.
