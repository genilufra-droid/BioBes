# Verifikim live i Shitjeve

Më 23 gusht 2026 u hap preview-i live i Sistemi Genit Cloud dhe moduli `/sales-invoices`. Skeda **Faturat** shfaq filtrat e kërkimit, klientit, monedhës, intervalit të datave, statusit të pagesës dhe statusit të dokumentit. Tabela shfaq kolonat Nr., Klienti, Data, Monedha, Kursi, Vlera, Vlera në Lek, Statusi, Pagesa dhe Veprime.

Gjendja reale në verifikim ishte 0 fatura shitjeje; sistemi shfaqi boshllëk real dhe nuk u krijua të dhënë testuese. U konfirmua gjithashtu se filtri i monedhës ka opsionet ALL, EUR, USD dhe GBP dhe se përmbledhja e vlerës së dokumentit dhe ekuivalentit në Lek është e pranishme.

Ky verifikim nuk provon ende rrjedhën e një fature reale Shitjeje me magazinë dhe dalje stoku; ajo mbetet test integrues i veçantë kur autorizohet krijimi i një dokumenti testues.


## Faturë reale Shitjeje

U krijua në preview live dokumenti `TEST-SH-OUT-20260823` me klientin `Ana`, magazinën `Magazina Test ERP · MAG-TEST-01`, artikullin Ferre, sasi 1 dhe çmim 120 minor units. Fatura u shfaq në regjistër me numër të klikueshëm, monedhë ALL, kurs 1.000000, vlerë 1.20 ALL dhe ekuivalent 1.20 L.

Kontrolli read-only konfirmoi `stockMovement.movementType=OUT`, `referenceType=SALES_INVOICE`, sasi 1 dhe balancë të magazinës 124 pas zbritjes nga 125. Dokumenti u ruajt si Draft; nuk u postua apo pagua automatikisht.


## Pagesa dhe statusi final

Pas konfirmimit u regjistrua pagesa me arkë. Verifikimi read-only konfirmoi `status=PAID`, `paymentStatus=PAID`, `paymentCount=1`, `paidAmount=120`, `paymentMethod=CASH` dhe `paymentReference=TEST-SH-OUT-20260823`. Pagesa është e lidhur me faturën me referencën e dokumentit dhe nuk ka dublikatë.


## Verifikim pas bug-ut schema-database

Pas shtimit të kolonave `invoiceFormat` dhe `exportDetails` në databazën aktive dhe restart-it të serverit, regjistri i Shitjeve u hap pa `Failed query`. Fatura `TEST-SH-OUT-20260823` u shfaq me status `E paguar`, vlerë `1.20 ALL`, ekuivalent `1.20 L`, filtër monedhe dhe numër dokumenti të klikueshëm.
