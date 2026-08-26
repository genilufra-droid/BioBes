# Audit global i linkeve të dokumenteve

| Zona | Skedari | Kontrolli |
|---|---|---|
| Dashboard | `client/src/pages/Home.tsx` | Numrat e faturave të fundit duhet të kenë link vetëm kur ekziston burimi real. |
| Blerje | `client/src/pages/PurchaseInvoices.tsx` | Numrat e faturave, raporti dhe përmbledhjet duhet të hapin dokumentin burimor. |
| Shitje | `client/src/pages/SalesInvoices.tsx` | Numrat e faturave dhe dokumenteve duhet të hapin dokumentin përkatës. |
| Magazina | `client/src/pages/Inventory.tsx` | Lëvizjet, transfertat dhe inventarizimet duhet të lidhen me burimin real. |
| Raporte | `client/src/pages/ReportsCenter.tsx` / `ReferenceReportView.tsx` | Kolonat e dokumenteve duhet të shfaqin shigjetën dhe të kenë dalje nga dialogu. |
| Kontabilitet | `client/src/pages/Accounting.tsx` | Regjistrimet dhe faturat burimore duhet të hapen me klik. |
| Banka/Arkë | `client/src/pages/Banks.tsx` / `Cash.tsx` | Pagesat dhe dokumentet e lidhura duhet të kenë link kur burimi ekziston. |
| CRM | `client/src/pages/CRM.tsx` | Dokumentet e lidhura me klientin duhet të jenë të navigueshme. |
| Ngarkesa | `client/src/pages/CargoLoads.tsx` | Porosia, fatura dhe dokumentet e ngarkesës duhet të jenë të navigueshme. |
| Peshat | `client/src/pages/WeightForms.tsx` | Dokumenti burimor i formularit të peshës duhet të jetë i hapshëm. |
| Veprimet | `client/src/pages/Actions.tsx` | Veprimet e dokumenteve duhet të kenë navigim pa dead-end. |

## Parim zbatimi

Çdo shigjetë do të shfaqet vetëm kur rreshti përmban identifikues real të dokumentit burimor. Kur nuk ka burim real, UI do të shfaqë tekst normal ose “—”, jo link të sajuar. Çdo dialog i hapur nga raporti duhet të ketë buton Mbyll dhe të kthejë përdoruesin te lista pa ekran bosh.


## Verifikim vizual pas standardizimit të shigjetave

Pamjet live konfirmuan se dashboard-i shfaq shigjetën e dukshme pranë çdo numri faturë; regjistri i Blerjeve ka filtrat kolonë-për-kolonë dhe numrat e faturave; regjistri i Shitjeve shfaq filtrat dhe dokumentin testues. Katalogu i Raporteve shfaq 25 raporte Blerje, 33 raporte Shitje dhe 27 raporte Magazina. Shigjeta e dukshme përdoret nga komponenti i përbashkët `SourceDocumentLink`, ndërsa raportet pa burim real mbeten pa link fals.
