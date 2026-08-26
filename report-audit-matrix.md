# Matrica e auditimit të raporteve

Ky dokument është lista kontrolluese raport-më-raport. Çdo raport duhet të verifikohet me të njëjtin standard: filtra sipas fotos reference, datë dhe interval, shumë/monedhë kur aplikohet, butonat Mbyll–Shiko–Printo, Excel/PDF, totalet dhe linku i dokumentit kur ka burim real.

| # | Moduli | Raporti | Filtrat reference | Rezultatet/totali | Eksporte/link | Statusi |
|---:|---|---|---|---|---|---|
| 1 | Furnitorë | Kartela e furnitorit | [ ] | [ ] | [ ] | Në pritje |
| 2 | Furnitorë | Kartela e furnitorit – Formati 3 | [ ] | [ ] | [ ] | Në pritje |
| 3 | Furnitorë | Maturimi i furnitorit | [ ] | [ ] | [ ] | Në pritje |
| 4 | Shitje | Artikuj të pashitur | [ ] | [ ] | [ ] | Në pritje |
| 5 | Shitje | Regjistri përmbledhës i shitjeve | [ ] | [ ] | [ ] | Në pritje |
| 6 | Magazina | Regjistri analitik i magazinës | [ ] | [ ] | [ ] | Në pritje |
| 7 | Magazina | Përmbledhje e produkteve | [ ] | [ ] | [ ] | Në pritje |
| 8 | Magazina | Analiza e artikujve | [ ] | [ ] | [ ] | Në pritje |
| 9 | Magazina | Gjendja sipas magazinës | [ ] | [ ] | [ ] | Në pritje |
| 10 | Furnitorë | Situacioni sipas kategorisë | [ ] | [ ] | [ ] | Në pritje |
| 11 | Furnitorë | Regjistri i doganimeve/importit | [ ] | [ ] | [ ] | Në pritje |
| 12 | Shitje | Shitjet sipas klientëve | [ ] | [ ] | [ ] | Në pritje |
| 13 | Shitje | Shitjet sipas sasisë | [ ] | [ ] | [ ] | Në pritje |
| 14 | Shitje | Shitjet sipas sasisë totale | [ ] | [ ] | [ ] | Në pritje |
| 15 | Shitje | Artikujt e shitur | [ ] | [ ] | [ ] | Në pritje |
| 16 | Shitje | Analiza e zbritjeve | [ ] | [ ] | [ ] | Në pritje |
| 17 | Shitje | Kartela e produktit | [ ] | [ ] | [ ] | Në pritje |
| 18 | Shitje | Kthimet | [ ] | [ ] | [ ] | Në pritje |
| 19 | Shitje | Marzhi | [ ] | [ ] | [ ] | Në pritje |
| 20 | Shitje | Marzhi i detajuar | [ ] | [ ] | [ ] | Në pritje |
| 21 | Shitje | Shitjet sipas produktit | [ ] | [ ] | [ ] | Në pritje |
| 22 | Magazina | Gjendja minimale | [ ] | [ ] | [ ] | Në pritje |
| 23 | Magazina | Detajet sipas magazinës | [ ] | [ ] | [ ] | Në pritje |
| 24 | Magazina | Kartela e produktit | [ ] | [ ] | [ ] | Në pritje |

## Rregulli i verifikimit

Një raport kalon vetëm kur kontrollet e filtrave, rezultateve, totalit, eksporteve dhe lidhjeve janë të gjitha të dokumentuara. Gjendja bosh reale nuk konsiderohet dështim; në atë rast shënohet se raporti ngarkohet saktë dhe nuk sajon të dhëna.


## Verifikim live i parë

**Faturat e blerjes** u hap si dialog reference dhe u verifikuan: lista e raporteve majtas, grupet Dokumenti, Partneri dhe klasifikimi, Magazina dhe njësia, Shuma, Datat e dokumentit, Filtrat e preferuar, kërkimi brenda tabelës, sortimi i kolonave, Mbyll/Pastro/Shiko/Printo, Excel/PDF dhe rreshti TOTALI. Në rreshtat me dokumente reale u shfaq shigjeta e dukshme përpara numrit dhe titulli i dokumentit ishte i klikueshëm. Raporti shfaqi 8 rreshta realë dhe totalin 58,520 sipas gjendjes së databazës në momentin e testit.


## Verifikimi live — Porositë e blerjes

Dialogu përdor të njëjtin layout reference si raporti i faturave: listë majtas, filtra në grupe, monedhë, magazinë, njësi, interval shume, data, filtra të preferuar, kërkim, sortim, butona Mbyll/Pastro/Shiko/Printo dhe Excel/PDF. U shfaqën 3 rreshta realë dhe total 0; dokumentet 70, 69 dhe 69-ANULUAR-1 kishin shigjeta të dukshme dhe hapje dokumenti.


## Verifikimi live — Pranimet dhe Kthimet

**Pranimet e mallit** dhe **Kthimet te furnitorët** hapen në të njëjtin dialog reference me listën e raporteve majtas, grupet e filtrave, monedhën, magazinën, njësinë, shumën, datat, kërkimin, sortimin dhe butonat e veprimeve. Për Pranimet u gjetën 0 rreshta realë dhe për Kthimet 0 rreshta realë; tabelat shfaqën gjendje bosh të qartë dhe rresht TOTALI pa sajuar dokumente ose shigjeta.


## Verifikimi live — Statusi dhe Faturat e hapura

**Statusi i faturave** u hap dhe shfaqi grupimin real DRAFT/PAID, 8 dokumente dhe vlerë totale 58,520, me filtra reference, sortim, total dhe eksportet. **Faturat e hapura** kërkoi kontroll shtesë të targetit të navigimit: klikimi i indeksit vizual duhet të përdorë çelësin e saktë të katalogut dhe jo të rikthejë raportin e mëparshëm. Ky rast po shënohet për korrigjim të navigimit raport-më-raport.


## Verifikimi live — Shpenzimi sipas furnitorit

Raporti shfaqi të njëjtin panel reference, 4 furnitorë realë, 8 fatura dhe shpenzim total 58,520. Agregimi u kontrollua sipas furnitorit: Nutreco 1/12,000; Ferre Geni 2/20,000; Ana 4/26,160; Floreta Merdani 1/360. Rreshti TOTALI shfaq 8 fatura dhe 58,520.


## Verifikimi live — Pasqyra e furnitorëve

Raporti u hap me panelin reference dhe agregoi të njëjtat të dhëna reale: 4 furnitorë, 8 fatura dhe vlerë totale 58,520. Renditja sipas vlerës ishte aktive dhe rreshti TOTALI përputhej me Shpenzimi sipas furnitorit.


## Verifikimi live — Furnitorët kryesorë dhe Porositë e hapura

**Furnitorët kryesorë** u hap me panel reference dhe përputhej me Pasqyrën e furnitorëve: 4 furnitorë dhe 58,520. **Porositë e hapura** shfaqi 3 dokumente reale, 3 kërkojnë veprim, vlerë totale 0 dhe shigjetat e dukshme te dokumentet 70, 69 dhe 69-ANULUAR-1. Të dy raportet kishin Mbyll, filtra, kërkim, sortim, TOTALI dhe eksportet.


## Verifikimi live — Statusi i porosive dhe Pranimet sipas furnitorit

**Statusi i porosive** u verifikua me 3 dokumente reale, grupime DRAFT/CANCELLED dhe total 0. **Pranimet sipas furnitorit** u hap me të njëjtin panel reference dhe gjendje bosh reale. Të dyja ruajnë butonat Mbyll/Pastro/Shiko/Printo, kërkimin, sortimin dhe totalin pa krijuar të dhëna artificiale.


## Verifikimi live — Trendi i shpenzimeve dhe Vëllimi i faturave

**Trendi i shpenzimeve** dhe **Vëllimi i faturave** u hapën me URL direkte për të shmangur gabimet e indeksit të klikimit. Të dyja shfaqën grupet reference, filtrat e dokumentit/partnerit/artikullit/monedhës/magazinës/njësisë, intervalet e shumës dhe datës, filtrat e preferuar, kërkimin, sortimin, TOTALI dhe eksportet. Të dhënat reale të agreguara për periudhën e testit ishin 8 dokumente dhe 58,520.


## Verifikimi live — Faturat e shitjes

Raporti i faturave të Shitjes u hap me modelin reference dhe shfaqi të gjitha grupet e filtrave: dokument, partner, artikull/kategori, status, monedhë, magazinë, njësi, interval shume, data, filtra të preferuar, kërkim dhe sortim. U verifikua dokumenti real TEST-SH-OUT-20260823 me Ana, vlerë 120 dhe status PAID; numri ka shigjetë/link të klikueshëm dhe rreshti TOTALI shfaq 120.


## Verifikimi live — Ofertat dhe Të ardhurat sipas klientit

**Ofertat** u hap me layout-in reference dhe gjendje bosh reale. **Të ardhurat sipas klientit** shfaqi 1 klient real, Ana, me 1 faturë dhe të ardhura 120; rreshti TOTALI përputhej me faturën e Shitjes. Të dy raportet kishin filtrat e grupuara, monedhën, datat, shumën, kërkimin, sortimin dhe kontrollet e eksportit/printimit sipas kontratës së përbashkët.


## Verifikimi live — Statusi dhe Faturat e hapura të Shitjes

**Statusi i faturave** shfaqi 1 dokument real PAID, 1 dokument dhe total 120. **Faturat e hapura** shfaqi 0 rreshta të hapur, por përmbledhja raportoi 1 dokument dhe 120 si vlerë kërkuese; kjo është e dokumentuar për kontrollin e semantikës së kartelës së përmbledhjes. Të dyja përdorin grupet reference, kërkimin, sortimin, totalin dhe kontrollet e eksportit/printimit.


## Verifikim i përditësuar — Export Invoice dhe Shitje

Pas korrigjimit të metrikave, raporti **Faturat e hapura të Shitjes** tani përputh kartelat me rreshtat realisht të filtruar. U verifikua se pas aplikimit të filtrit të partnerit metrikat ndryshojnë së bashku me tabelën dhe rreshti TOTALI nuk përdor më bazën e pafiltruar.

Në regjistrin e faturave të Shitjes u verifikuan filtrat e kërkimit, klientit, valutës, datës dhe intervalit të shumës, renditja sipas datës/numrit/shumës në të dy drejtimet, si dhe butoni **Pastro filtrat**. Export Invoice u verifikua për faturat në valuta të huaja me Bill To, Ship To, CN codes, peshë neto/bruto, kushte dorëzimi, bankë, IBAN, kosto shtesë dhe total në valutë me ekuivalent në Lek.

| Kontroll i ri | Rezultati |
|---|---|
| Metrikat e faturave të hapura ndjekin filtrat | Kaloi |
| Export Invoice A4 në anglisht | Kaloi |
| Bankë/IBAN dhe kosto shtesë | Kaloi |
| Filtra dhe renditje në Shitje | Kaloi |
| Pastro filtrat në Shitje | Kaloi |
| Teste automatike | 57 skedarë / 202 teste |
| TypeScript dhe build production | Pa gabime |

Raportet e tjera të katalogut mbeten të shënuara si **në pritje** derisa të bëhet verifikimi individual me të dhëna reale; kjo matricë nuk i konsideron ato të përfunduara vetëm nga ekzistenca e komponentit të përbashkët.
