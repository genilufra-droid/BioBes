# Regjistri i faturave të blerjes

Regjistri i ri përdor modelin e punës të Excel-it të dërguar si referencë, por ruan funksionet e cloud ERP: çdo rresht lidhet me faturën dhe artikullin real, kërkohet menjëherë dhe filtrohet me gjendje pa dropdown.

| Kolona e regjistrit | Burimi real i të dhënave | Sjellja kur mungon informacioni |
| --- | --- | --- |
| Data, numri, furnitori dhe statusi | Fatura e blerjes | Shfaqen drejtpërdrejt nga dokumenti |
| Kodi/emri i artikullit, sasia, njësia, çmimi dhe vlera | Rreshti i artikullit të faturës | Një faturë me shumë artikuj shfaqet në disa rreshta |
| TVSH, transportuesi dhe targa | Fushat `vatAmount`, `carrierName` dhe `vehiclePlate` të faturës së blerjes | TVSH-ja ndahet sipas rreshtave të faturës; transporti dhe targa dalin drejtpërdrejt nga dokumenti |
| Inventari | Fusha `inventoryReference` e faturës së blerjes | Shfaqet si referencë reale e dokumentit të inventarit |

Verifikimi vizual në desktop dhe mobile konfirmoi header-in e ngjeshur me tonalitetin rozë/bezhë të Excel-it, titujt vertikalë të kolonave, toolbar-in e kërkimit, filtrat e klikueshëm dhe scroll-in horizontal të tabelës në ekran të vogël. Kompania aktive e preview-t nuk përmbante ende fatura, ndaj u verifikua empty state dhe ergonomia e kontrolleve. Fatura e re tani ruan TVSH-në, transportuesin, targën dhe referencën e inventarit; një faturë reale me artikuj duhet ende të kontrollohet vizualisht përpara se të mbyllet testi fund-më-fund.
