# Harta e verifikimit të PDF-ve reference

Data: 2026-08-23

Ky dokument ndan qartë **implementimin e skemës së raportit** nga **krahasimi vizual një nga një**. Kjo shmang shënimin e rremë si “identik” kur është kontrolluar vetëm struktura e kolonave.

| Grup | PDF reference të disponueshme | Statusi i skemës në Cloud | Statusi vizual i kësaj faze |
|---|---|---|---|
| Blerje | `crfurnitorkartela.pdf`, `crfurnitorkartelaformat3.pdf`, `crfurnitormaturimifushashtese.pdf`, `crfurnitorsituacionsipaskateg.pdf`, `crdoganimeregjimporte.pdf` | Kolonat reference dhe metadata e burimit mbulohen nga `shapeReferenceReport`; testet e katalogut kalojnë | Kartela e furnitorit u pa drejtpërdrejt; raportet e tjera kërkojnë krahasim individual |
| Shitje | `crmarkshitjetsipassasise.pdf`, `crmarkshitjetsipasklienteve.pdf`, `crmarkshitjetsipasqyteteve.pdf`, `crmarkshitjetsipassasisetotal.pdf`, `crshitjeartikuj.pdf`, `crshitjeartikujpashitur.pdf`, `crshitjeartikujzbritjeanalitike.pdf`, `crshitjekartelaartikullit.pdf`, `crshitjekthime.pdf`, `crshitjemarzhi.pdf`, `crshitjemarzhi_2.pdf`, `crshitjeregjistripermbledhes.pdf`, `crshitjesipasartikujve.pdf` | Skemat e katalogut dhe kolonat reference janë të testuara në `server/reportCatalog.test.ts` | Krahasimi vizual individual mbetet për fazën pasuese |
| Magazina | `crmaggjendjamagazines.pdf`, `crmaggjendjamagazinesdetajime.pdf`, `crmaggjendjaartikullitpermbledhur.pdf`, `crmagregjanalitik.pdf`, `crmagkartelaartikullit.pdf`, `crmaganalizaartikujve.pdf`, `crmaggjendjaartikujveminimum.pdf` | Skemat reference dhe kolonat kryesore janë të testuara në katalog | Krahasimi vizual individual mbetet për fazën pasuese |
| Fatura | `fatura_4319.pdf` | Renderer-i i blerjes/shitjes përdor A4 portret dyfaqësh, warehouse info dhe pa QR sipas kërkesës aktive; mbulohet nga testet e `invoiceReference` | PDF-ja burimore është letër/portret dhe ka QR në faqen e dytë; Cloud ndjek strukturën, por ruan kërkesën pa QR |

## Kontrollet e kryera

Katalogu përmban 145 raporte me çelësa unikë dhe variantet reference kanë teste për kolonat dhe rendin e tyre. PDF-të reference horizontale të raporteve kanë dimension tipik 842 × 204 pt, ndërsa `fatura_4319.pdf` ka 612 × 792 pt. Ky dallim është ruajtur në analizë dhe nuk interpretohet si mospërputhje e fshehur.

## Punë e mbetur

Mbetet krahasimi vizual një nga një i 13 raporteve reference të shënuara në todo.md, duke kontrolluar titullin, metadata-n, header-et e grupuara, gjerësitë e kolonave, rreshtin TOTALI, footer-in, numërimin e faqeve dhe orientimin. Pas çdo krahasimi duhet të ruhet një shënim konkret me emrin e PDF-së dhe rezultatet, pa përdorur dataset të fabrikuar.
