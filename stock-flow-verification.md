# Verifikim read-only i rrjedhës së stokut

U krye një kontroll read-only i databazës së kompanisë aktive. Rezultati i verifikueshëm është se ekzistojnë lëvizje **IN** të lidhura me `PURCHASE_INVOICE`, me gjithsej 2 lëvizje dhe 125 njësi të regjistruara nga blerjet. Në regjistrin aktual nuk ka faturë shitjeje reale për të verifikuar një lëvizje **OUT** në të dhënat e përdoruesit.

Kodi backend i `ensureSalesInvoiceStock` përdor delta negative për artikujt e faturës direkte të Shitjes dhe krijon `stockMovement` me `movementType = OUT`, `referenceType = SALES_INVOICE`, `referenceId` të faturës dhe magazinën e zgjedhur. Faturat e krijuara nga fletë-dalje nuk gjenerojnë dalje të dytë, sepse fletë-dalja e validuar e ka regjistruar tashmë daljen.

Nuk u futën, ndryshuan ose fshinë të dhëna gjatë këtij kontrolli.

## Korrigjim i kostos

Gjatë verifikimit read-only u konfirmua se artikulli Ferre kishte `avgPrice=0` dhe `lastPrice=0`, megjithëse kishte 531 njësi të blera. Rreshtat realë të `purchaseItems` treguan kosto mesatare të ponderuar 110.2072 në minor units. `getProducts` tani lexon çmimet reale të faturave të blerjes për kompaninë dhe përdor fallback-in e ponderuar vetëm kur kostoja e ruajtur te artikulli është zero. Vlera e stokut përdor balancat reale të magazinave.


## Përputhja e balancës reale

Kontrolli read-only i datës 2026-08-23 konfirmoi për Ferre: `stockBalances=125`, lëvizje hyrëse `IN=125`, dalje `OUT=0`; te fusha historike `products.stock` rezulton 0. Raportet e Magazina përdorin `stockBalances` për vlerën e stokut, ndaj nuk varen nga fusha historike e artikullit. Për Gg dhe Murriz të tre vlerat janë 0. Nuk u ndryshuan të dhëna.
