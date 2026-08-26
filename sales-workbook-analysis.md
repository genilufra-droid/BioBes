# Analiza e workbook-ut të Shitjeve

## Përfundimi kryesor

Workbook-u nuk ka vetëm një lloj dokumenti. Sheet-i `FATURAT 2026` është baza e faturave të blerjes nga fermerët, ndërsa shitjet e klientëve ndodhen në `SHITJET B V NE LEKE & EURO` dhe shitjet e eksportit në `EKSPORTI`. Për këtë arsye, në sistem duhet të ruhen si rrjedha të ndara por të lidhura: **blerje nga fermerët**, **shitje vendase** dhe **shitje eksporti**.

## Sheet-et dhe roli i tyre

| Sheet | Roli i identifikuar | Të dhëna kryesore |
|---|---|---|
| `FATURAT 2026` | Blerje/fatura hyrëse nga fermerët | Datë, nr. faturë, kodi fermerit, produkt, sasi kg, çmim, vlerë pa TVSH, TVSH, vlerë me TVSH, transportues, targë, NIVF |
| `SHITJET B V NE LEKE & EURO` | Shitje vendase | Datë, nr. faturë, kodi produktit, produkt, sasi kg, çmim në lekë, neto, TVSH, total, kompani/klient |
| `EKSPORTI` | Shitje eksporti | Nr. faturë, datë, kod/produkt, sasi kg, çmim EUR, shumë EUR, kompani, shtet, status, kurs, vlerë në lekë, lot, cilësi/thasë, transport |
| `LISTE KLIENTESH` | Master-data klientësh | Kod, klient, shtet |
| `PRODUKTET` | Master-data dhe përmbledhje produktesh | Kod, produkt, stok, kosto mesatare, shitje, turnover lek/euro |
| `PERMBLEDHJA E LIKUJDIMEVE` | Përmbledhje detyrimesh ndaj fermerëve | Fermer, faturat, vlerë e tatueshme, TVSH, bankë, mbetje |
| `LIKUJDIMET NE BANKE` | Pagesa bankare ndaj fermerëve | Datë, kod fermeri, fermer, shumë në bankë, komente |

## Strukturë e faturave hyrëse

`FATURAT 2026` ka header real në rreshtin e tretë. Në të dhënat e lexueshme u gjetën 194 rreshta me datë dhe 173 numra fature të dallueshëm. Fushat bazë janë `Data / Date`, `NR`, `KODI I FERMEREVE`, `Kodi / Code`, `Produkti (Anglisht) / Product (English)`, `SASIA NE KG`, `CMIMI`, `VLERA PA TVSH`, `TVSH`, `VLERA ME TVSH`, `TRANSPORTUESI`, `TARGA` dhe `NIVF`.

Kjo strukturë duhet të përdoret për importin e blerjeve nga fermerët, jo të kopjohet verbërisht si formati i faturës së shitjes. Në sistem, furnitori duhet të lidhet me `KODI I FERMEREVE`, ndërsa artikulli me `Kodi / Code`; rreshtat me të njëjtin numër fature duhet të grupohen në një dokument me disa artikuj.

## Strukturë e shitjeve vendase

`SHITJET B V NE LEKE & EURO` përmban një seksion shitjesh vendase në lekë me kolonat `Data`, `Nr. Fature`, `kodi`, `Produkti`, `Sasia (kg)`, `Cmimi (LEK)`, `Vlera PA TVSH`, `TVSH`, `SHUMA` dhe `Kompania`. Kjo është rrjedha më e drejtpërdrejtë për faturat e shitjes vendase dhe duhet të lidhet me `LISTE KLIENTESH` dhe `PRODUKTET`.

## Strukturë e shitjeve të eksportit

`EKSPORTI` ka faturë me shumë rreshta për artikujt dhe përmban monedhë EUR në çmim, kurs këmbimi, total në EUR dhe vlerë në lekë. Fushat `SHTETI`, `STATUSI`, `KODI` i lotit, `CILESIA/ THASE`, `TRANSPORTI`, `VL E FATURES`, `DT E LIK` dhe `PER LIKUIDIM` kërkojnë të mbahen si detaje të eksportit dhe nuk duhet të humbasin në faturën standarde vendase.

## Probleme të identifikuara gjatë importit

Disa rreshta të `FATURAT 2026` kanë datë të konvertuar gabim si `1900-01-12`, disa produkte dalin `#N/A`, ka emra produktesh me kapitalizim të ndryshëm dhe disa numra fature nuk janë numerikë (`1/2026`, `bl-01` në të dhëna të tjera). Importi duhet të ruajë numrin si tekst, të raportojë datat e pavlefshme për korrigjim dhe të mos krijojë artikull të ri automatikisht nga `#N/A`.

## Rrjedha që do të ndërtohet

1. Importi fillon me master-data të klientëve dhe artikujve, duke ruajtur kodet e workbook-ut.
2. Faturat e blerjes nga fermerët regjistrojnë hyrje në magazinë dhe detyrim ndaj fermerit.
3. Faturat vendase dhe të eksportit regjistrojnë dalje nga magazina, të ardhura, TVSH, klientin, monedhën dhe kursin.
4. Fatura me të njëjtin numër grupon të gjithë rreshtat e artikujve në një dokument.
5. Pagesat lidhen me faturën dhe ndryshojnë statusin e saj; për eksportin ruhet edhe ekuivalenti në lekë.
6. Raportet e shitjeve filtrohen sipas datës, klientit, artikullit, numrit të faturës, monedhës, statusit dhe magazinës, me linkun ↗ drejt dokumentit burimor.

## Kontroll numerik fillestar

Nga rreshtat e lexueshëm të `FATURAT 2026` u llogaritën 253,314 kg, 95,262,595 lekë pa TVSH, 250,000 lekë TVSH dhe 95,512,595 lekë me TVSH. Këto janë kontrolle të faturave hyrëse dhe nuk duhen paraqitur si xhiro shitjesh. Shitjet vendase dhe eksportet do të llogariten veçmas nga sheet-et përkatëse.
