# Report Center — Audit live (24 Gusht 2026)

## FATURIME DHE PAGESA
- Raporti u hap me filtrin Furnitor/Klient = Ferre Geni.
- Tabela shfaqi dy dokumente reale: TEST-BL-WH-20260823 dhe TEST-FG-20260823.
- Kolona `Numer` shfaq shigjetën `↗` si link aktiv.
- Klikimi hapi `purchase-invoices?openInvoice=150001` dhe dokumentin A4 të faturës.
- `Mbyll` ktheu përdoruesin te regjistri i faturave të blerjes.

## CRM
- `crm_pipeline` shfaq vetëm filtrin `DATË REGJISTRIMI`.
- Nuk u shfaqën panele placeholder për dokument, lloj dokumenti, monedhë ose shumë.
- Gjenerimi ktheu tabelën specifike të pipeline-it me fazat NEW, QUALIFIED, PROPOSAL, WON, LOST dhe metrikat përkatëse.
- Të dhënat reale të pipeline-it ishin zero në kompaninë aktive; nuk u krijua të dhënë test.

## Banka
- `bank_transactions` shfaq vetëm filtrin `DATË REGJISTRIMI`.
- Nuk u shfaqën filtra të pambështetur për dokument, lloj dokumenti, monedhë ose shumë.
- Gjenerimi ktheu tabelën specifike `Data / Përshkrimi / Lloji / Vlera / Statusi` me gjendje bosh reale.

## Magazina
- `inventory_balances` shfaq filtrin real `Magazina` dhe filtrin `Kartela`.
- Filtri `Magazina: Qendrore` u aplikua dhe u shfaq si filtër aktiv në dokument.
- Tabela e raportit kishte kolonat specifike `Magazina / Lokacioni / Artikulli / Sasia / Përditësuar`; pa Nr. Dokumenti, Lloj Dokumenti ose Monedha.
- Kompania aktive nuk kishte rreshta realë për `Qendrore`, ndaj raporti shfaqi “Nuk ka të dhëna.” pa fabrikim.

## Magazina — verifikim i zgjeruar
- Emri real i magazinës në databazë është `Magazina Test ERP`; kërkimi me `Qendrore` ishte bosh sepse nuk ekziston si magazinë reale.
- Me filtrin real `Magazina Test ERP`, `inventory_balances` ktheu `Ferre`, lokacionin `I përgjithshëm` dhe sasinë `124`, me shigjetë ↗ mbi artikullin.
- `inventory_movements` ktheu tre lëvizje reale: dalje 1, hyrje 100 dhe hyrje 25, të gjitha në `Magazina Test ERP`.
- Dokumentet TEST-SH-OUT-20260823, 7067 dhe TEST-BL-WH-20260823 shfaqën linket ↗; edhe artikulli Ferre shfaqet si burim i klikueshëm.

## Blerje — FATURIME DHE PAGESA pas patch-it
- Forma u ngarkua pa gabim pas restart-it dhe shfaq vetëm filtrat e mbështetur nga raporti: shumë, nr. dokumenti, lloj dokumenti, monedhë, datë, kartelë, furnitor dhe magazinë.
- Gjenerimi ktheu 8 rreshta reale me kolonat Fature, Pagese, Numer, Date, Pershkrimi, Faturuar, Paguar dhe Diferenca.
- Shigjetat ↗ u shfaqën mbi numrat 7067, TEST-BL-WH-20260823, TEST-FG-20260823, 556767, 685, BL-05, BL-01 dhe bl-01.
- Klikimi i shigjetës 7067 hapi `/purchase-invoices?openInvoice=180001` dhe shfaq dokumentin A4 me veprimet Mbyll, pagesë Cash/Bankë/Më vonë, Anulo, Fshij, Excel, PDF dhe Print Preview.
- Përmbledhja e regjistrit të faturave tregoi 585.20 L vlerë faturash, 343.60 L të paguara dhe 241.60 L të papaguara; raporti dhe regjistri përdorën të njëjtët rreshta realë.

## Kontabilitet — BILANCI I PROVËS
- Formulari shfaq filtrat klasikë të raportit dhe gjenerimi nuk kthen panel placeholder.
- Raporti ktheu rreshta realë me kolonat Kodi, Llogaria, Tipi, Debi, Kredi dhe Bilanci.
- Të dhënat reale përfshinë Arkë, Banka, Klientë për t’u arkëtuar dhe Furnitorë për t’u paguar; bilancet shfaqen me shenjë pozitive/negative sipas të dhënave të kontabilitetit.

## Blerje — KARTELA E FURNITORIT
- Filtri real `Ferre Geni` u shfaq në krye të dokumentit reference si filtër aktiv.
- Raporti ktheu dy dokumente reale me Nr Rend, Data Rregj, Lloj Dok, Nr Dok, Debi, Kredi dhe Progresivi.
- Përmbledhja e dokumentit shfaqi `Gjendja përfundimtare: DEBITOR` me vlerat e llogaritura nga rreshtat.
- Shigjeta ↗ mbi dokumentet hapi faturën reale `TEST-BL-WH-20260823` dhe dokumenti burimor u paraqit në format A4 me Mbyll/Excel/PDF/Print Preview.

## Kontabilitet — PAGESAT
- Formulari tani shfaq vetëm DATË REGJISTRIMI me Aktuale/Viti Ushtrimor.
- Gjenerimi ktheu 6 pagesa reale me Nr., Data, Partneri, Lloji, Vlera, Monedha, Kursi, Vlera në Lek, Metoda dhe Statusi.
- Shigjetat ↗ u shfaqën për çdo pagesë dhe dataset-i përfshiu hyrje/dalje, CASH/BANK dhe POSTED/DRAFT.
