# Auditimi Konfigurime: video kundrejt cloud-it

| Elementi i videos | Gjendja aktuale në cloud | Vendimi |
|---|---|---|
| Ndërmarrja | Ekziston si skedë reale me CRUD të të dhënave bazë | Ruhet |
| Konfigurime të ndërmarrjes | Ekzistojnë plani kontabël, ngurtësimi, çmimet, maturimet, detajimi dhe arkivimi | Ruhet |
| Backup automatik | Ekziston si skedë me ruajtje të arkivimit dhe sinjalizimit | Ruhet |
| Fusha shtesë | Ekziston me tre flamuj realë dhe ruajtje për kompaninë aktive | Ruhet |
| Artikuj / Lista e Artikujve | Ekziston te moduli Artikuj me CRUD, kërkim dhe forma | Lidhet nga menuja e Konfigurimeve |
| Çmime Shitjeje | Nuk ka dritare të dedikuar të Konfigurimeve; ekzistojnë çmime bazë të artikujve | Krijohet dritare e dedikuar me filtra dhe ruajtje reale |
| Zbritje Analitike | Nuk ka dritare të dedikuar | Krijohet dritare me përqindje dhe ruajtje reale |
| Klientë / Furnitorë | Workspaces ekzistuese me CRUD | Lidhen nga menuja |
| Emetuesit | Nuk u gjet dritare apo tabelë e dedikuar | Kërkon model të ri; implementohet vetëm pas verifikimit të fushave të videos |
| Qendra e Kostos | Hyrje ekzistuese në navigim, por jo e lidhur nga Konfigurime | Lidhet nga menuja dhe auditohet më tej |
| Grupim Dokumentash | Nuk u gjet dritare e dedikuar | Kërkon model të ri; nuk do të simulohet me placeholder |

## Kufizim
Asnjë element i Pagave nuk do të hapet, testohet, ndryshohet ose migrohet. Për elementet që nuk kanë prova të mjaftueshme për fushat e formës, do të përdoren vetëm lidhje reale ose do të dokumentohen si në pritje, jo të dhëna të shpikura.

## Hapi i implementimit
Së pari do të shtohet menuja klasike e Konfigurimeve dhe lidhjet e saj me Artikuj, Çmime Shitjeje, Zbritje Analitike, Partnerë dhe Qendra Kostosh. Pastaj do të shtohen vetëm dritaret që kanë kontratë të qartë të të dhënave dhe testim të mundshëm.
