# Harta e integrimit të raporteve nga PDF-të e referencës

Ky dokument lidh çdo PDF të dërguar me modulin, raportin e synuar, burimin e të dhënave dhe formatin e eksportit. Raportet do të hapen nga Qendra e Raporteve dhe do të ruajnë të njëjtën strukturë në UI, Excel, PDF dhe Print Preview.

| PDF reference | Moduli | Raporti në cloud | Burimi kryesor | Veçori e detyrueshme |
|---|---|---|---|---|
| `crdoganimeregjimporte.pdf` | Blerje / Doganë | Regjistri i doganimeve të importeve | Faturat e blerjes dhe fushat doganore | 15 kolona, Total, landscape |
| `crfurnitorkartela.pdf` | Blerje | Kartela e furnitorit | Fatura/pagesa sipas furnitorit | Debi, Kredi, Progresiv në monedhë bazë dhe llogarie |
| `crfurnitorkartelaformat3.pdf` | Blerje | Kartela e furnitorit — Formati 3 | Fatura/pagesa sipas furnitorit | Variant i dytë i kartelës |
| `crfurnitormaturimifushashtese.pdf` | Blerje | Furnitorët me maturim / fusha shtesë | Faturat dhe afatet e pagesës | Të dhëna sipas furnitorit dhe afatit |
| `crfurnitorsituacionsipaskateg.pdf` | Blerje | Situacioni i furnitorëve sipas kategorisë | Faturat e blerjes | Grupim dhe total sipas kategorisë |
| `crmarkshitjetsipasklienteve.pdf` | Shitje | Shitjet sipas klientëve | Faturat e shitjes | Vleftë, numër dokumentesh dhe peshë |
| `crmarkshitjetsipasqyteteve.pdf` | Shitje | Shitjet sipas qyteteve | Klientët dhe faturat | Grupim sipas qytetit |
| `crmarkshitjetsipassasise.pdf` | Shitje | Shitjet sipas sasisë | Artikujt e faturave | Sasi dhe vleftë sipas klientit/artikullit |
| `crmarkshitjesipassasisetotal.pdf` | Shitje | Shitjet sipas sasisë totale | Artikujt e faturave | 12 muaj si kolona dhe total vjetor |
| `crshitjeartikuj.pdf` | Shitje | Artikuj të shitur | Artikujt e faturave | Sasi, çmim, vleftë pa/me TVSH |
| `crshitjeartikujpashitur.pdf` | Shitje | Artikuj të pashitur | Katalogu i artikujve + shitjet | Artikuj me zero shitje |
| `crshitjeartikujzbritjeanalitike.pdf` | Shitje | Artikuj të shitur me zbritje analitike | Artikujt e faturave | Zbritje analitike dhe totale |
| `crshitjekartelaartikullit.pdf` | Shitje | Kartela e artikullit | Artikulli, dokumentet dhe lëvizjet | Gjendje/progresiv dhe dokumentet |
| `crshitjekthime.pdf` | Shitje | Kthime nga shitjet | Kthimet e shitjes | Dokument, artikull, sasi, çmim, zbritje, TVSH |
| `crshitjemarzhi.pdf` | Shitje | Marzhi i shitjeve | Faturat dhe kostoja e artikujve | Sasi, çmim, vleftë dhe marzh |
| `crshitjemarzhi_2.pdf` | Shitje | Marzhi i shitjeve — Formati i Ri | Faturat dhe kostoja e artikujve | Variant me klient dhe volum |
| `crshitjeregjistripermbledhes.pdf` | Shitje | Regjistri përmbledhës i shitjeve | Faturat dhe rreshtat e tyre | 15 kolona, zbritje, TVSH, monedhë bazë |
| `crshitjesipasartikujve.pdf` | Shitje | Shitjet sipas artikujve | Rreshtat e faturave | Grupim artikulli/klienti |
| `crmaganalizaartikujve.pdf` | Magazina | Analiza e artikujve | Artikujt dhe stoket | Gjendje, minimum, vlerë |
| `crmaggjendjaartikujveminimum.pdf` | Magazina | Gjendja e artikujve nën minimum | Artikujt dhe minimumet | Alarm i rimbushjes |
| `crmaggjendjaartikullitpermbledhur.pdf` | Magazina | Gjendja e artikullit — Përmbledhur | Stoku sipas artikullit | Sasi dhe vleftë e përmbledhur |
| `crmaggjendjamagazines.pdf` | Magazina | Gjendja e magazinës | Stoku sipas magazine | Hyrje, dalje, gjendje, kosto, vleftë |
| `crmaggjendjamagazinesdetajime.pdf` | Magazina | Gjendja e magazinës — Detaje | Balancat dhe artikujt | Detaj sipas magazine/lokacioni |
| `crmagkartelaartikullit.pdf` | Magazina | Kartela e artikullit në magazinë | Lëvizjet e stokut | Lloji, dokumenti, datat, sasia, çmimi, vlefta |
| `crmagregjanalitik.pdf` | Magazina | Regjistri analitik i magazinës | Lëvizjet e stokut | 10 kolona dhe grupim magazine |

## Rregullat e përbashkëta

Të gjitha raportet do të përdorin kompaninë aktive nga `CompanyProvider`, do të filtrojnë sipas periudhës, do të kenë rresht total kur raporti është agregues dhe do të eksportohen në format horizontal kur numri i kolonave e kërkon. Vlerat monetare shfaqen në **Lek (L)**, ndërsa llogaritjet dhe vlerat burimore nuk shkallëzohen gjatë eksportit. Dokumentet ekzistuese nuk ndryshohen; integrimi shton vetëm pamje raportimi dhe lidhje me burimet e të dhënave.

## Statusi i verifikimit të plotë

Katalogu i Qendrës së Raporteve tani përfshin 145 raporte dhe të gjitha 26 referencat PDF janë të identifikuara. Megjithatë, kjo nuk do të thotë se të gjitha janë kopjuar plotësisht: 13 formatet e shtuara rishtazi përdorin për momentin burimin më të afërt të të dhënave dhe kërkojnë ende kolonat burimore specifike të PDF-së, filtrat dhe rreshtat e tyre realë. Vetëm pas këtij përfundimi do të konsiderohen të integruara.

| Gjendja | Formate |
|---|---|
| Renderer reference dhe të dhëna të dedikuara ekzistuese | Kartela e furnitorit, Kartela e furnitorit Formati 3, Furnitorët me maturim, Shitjet sipas sasisë totale, Artikuj të shitur, Artikuj të pashitur, Regjistri përmbledhës i shitjeve, Shitjet sipas qyteteve, Gjendja e magazinës, Regjistri analitik i magazinës, Gjendja e artikullit — Përmbledhur, Analiza e artikujve |
| Të kataloguara dhe me renderer reference, por kërkojnë implementim të plotë të fushave të PDF-së | Regjistri i doganimit të importeve, Situacioni i furnitorëve sipas kategorive, Shitjet sipas klientëve, Shitjet sipas sasisë, Artikujt me zbritje analitike, Kartela e artikullit të shitjes, Regjistri i kthimeve, Marzhi i shitjeve, Marzhi i shitjeve Formati 2, Shitjet sipas artikujve, Gjendja e artikujve minimum, Gjendja e magazinës sipas detajeve, Kartela e artikullit në magazinë |
