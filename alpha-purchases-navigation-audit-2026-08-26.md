# Alpha Web — Audit i navigimit të raporteve të blerjeve

Gjatë hyrjes në Alpha Web u verifikua se menuja kryesore ka `Raporte` dhe, pasi hapet, shfaq një nënmenu lineare me rendin: `Arka`, `Banka`, `BI`, `Blerje`, `Fatura Blerjes Einvoice`, `Inventar`, `Klientë dhe furnitorë`, `Kontabilitet`, `Shitje`, `Fatura shitje Einvoice`.

Në këtë fazë u hap vetëm menuja `Raporte`; përpjekja për të hyrë në `Blerje` nga popup-i i nënmenusë u ndërpre nga ridizenjimi i faqes gjatë ngarkimit. Nuk u krye asnjë veprim ndryshues. Hapi i radhës është të përdoret URL-ja e katalogut të Blerjeve/raporteve e evidentuar më parë dhe të krahasohen modelet, filtrat dhe dokumenti me cloud-in.

Qëllimi i implementimit është të mbetet vetëm te `ReportsCenter`, me një rrjedhë: Raporte → Blerje → listë modelesh → filtrat → dokument. Modulet operative të Blerjeve, Shitjeve, Pagave dhe konfigurimeve nuk do të ndryshohen.

## Gjetje DOM

DOM-i i Alpha Web ekspozon tre hyrje të dallueshme nën `Raporte`: `Blerje` (`ASPxSplitter1_ASPxMenu1_DXI4i4_`), `Fatura Blerjes Einvoice` (`DXI4i5_`) dhe `Klientë dhe furnitorë` (`DXI4i9_`). Në menunë operative ekzistojnë gjithashtu `Blerje`, `Shto blerje`, `Klientë` dhe `Furnitorë`; këto nuk duhen përzier me katalogun e Raporteve. Ky është dallimi që do të ruhet në cloud: Raporte/Blerje për katalogun e raporteve, ndërsa navigimi operacional mbetet i pandryshuar.

## Burimi për fazën Klientë dhe furnitorë

URL-ja e përdorur për verifikimin live: https://alpha.al/FaqeKryesore.aspx?google=true&idTheme=17657&scopeID=e9a0afb2-fea0-4450-b287-8eaf085e3373. Hyrja e kategorisë në menunë Raporte është `Klientë dhe furnitorë`; në cloud ajo është e lidhur me modulin e katalogut `CRM`. Kjo do të trajtohet si hap i dytë pas mbylljes së Blerjeve, jo si pjesë e listës së Blerjeve.

## Verifikim cloud i partnerëve

`/reports?module=CRM` tani paraqet emërtimin `Klientë dhe furnitorë`, numërimin `7 raporte` dhe saktësisht shtatë kartat Alpha: Situacioni i klientit, Situacioni i furnitorit, Kartela e klientit, Kartela e Furnitorit, dy kartela në monedhë bazë dhe Regjistri përmbledhës faturime dhe pagesa. URL-ja `/reports?module=CRM&report=partner_customer_card_pdf` hap modalin full-screen me listën e modeleve, filtrat Shuma dhe Datë regjistrimi, si dhe butonat Mbyll/Shiko/Ndihmë/ESC/ENTER.
