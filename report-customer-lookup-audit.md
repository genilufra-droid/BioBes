# Audit i kërkimit të klientit

Pas restart-it, Qendra e Raporteve u hap në viewport 390x844 pa faqe gri dhe pa gabim TypeScript/transform. Header-i, kërkimi global, kërkimi i raporteve, modulet, datat dhe lista e raporteve u shfaqën normalisht.

Kërkimi i klientit tani përdor listën e klientëve master së bashku me `customerName` nga faturat reale të shitjes, sepse invoice-t e importuara mund të kenë `customerId` bosh. Modalja mund të kërkojë me emër, kod, email ose telefon. Verifikimi i klikimit manual në modal mbetet i hapur.

## Referenca vizuale e gjetur

Dy skedarët `report_export_audit.png` dhe `report_export_audit_latest.png` rezultojnë të jenë **Kartela e Furnitorit**, jo BioBes EXPORT Invoice. Prandaj nuk përdoren si model për kopjen e faturës. Duhet përdorur reference invoice e ngarkuar në sesionin e mëparshëm ose pamja/PDF-ja e invoice EXPORT e ruajtur në browser/session assets.

## Analizë e PDF-ve të ngarkuara

`/home/ubuntu/upload/fatura_4319.pdf` është faturë vendase A4 me titullin Faturë, me blloqe për shitësin, datën/numrin/operatorin, blerësin, tabelën e artikujve, TVSH-në dhe totalin në LEK. `crshitjefaturimedhepagesa.pdf` është raport “Faturime dhe Pagesa”, jo invoice. Asnjëri nga këta dy skedarë nuk është referenca BioBes EXPORT në anglisht.

## Verifikim live invoice 540

Deep-link-u `sales-invoices?openInvoice=30068` hap faturën reale 540 me klientin NUTRECO, datën 15/07/2026, magazinën Magazina Test ERP, EUR dhe kursin 94.140000. Klikimi i `Export Invoice` shfaq dokumentin anglisht, me header, Seller/Bill To, metadata, Goods Description, peshat, totals dhe footer. Ky verifikim konfirmon routing-un e saktë EXPORT; krahasimi 1:1 me foton origjinale mbetet i kufizuar sepse reference invoice në skedarët e sesionit nuk u gjet.
