# Matrica e krahasimit PDF → Cloud

**Burimi:** 38 PDF me prefiks `cr*` të ngarkuara më 23 gusht 2026. Numri i faqeve u lexua nga metadata e PDF-së dhe kolonat/titujt nga ekstraktimi `pdftotext -layout`. `crarketimearka.pdf` u bashkëngjit dy herë por në filesystem ekziston vetëm një skedar, prandaj nuk llogaritet si dublikatë.

## Furnitorë dhe arkë

| PDF reference | Faqe | ReportKey cloud | Struktura e referencës | Gjendja e krahasimit |
|---|---:|---|---|---|
| crarketimearka.pdf | 1 | accounting_payment_register | Raport arkëtimesh/pagesash me datë, partner, lloj, vlerë, metodë dhe status | Cloud ka tabelën, filtrat dhe eksportet; duhet krahasuar veçmas layout-i i arkës.
| crdoganimeregjimporte.pdf | 1 | purchase_customs_import_register_pdf | Regjistër doganimi importi | Kataloguar në cloud; kërkon verifikim të kolonave doganore kundrejt PDF-së.
| crfurnitorkartela.pdf | 1 | purchase_supplier_card_pdf | Kartela furnitori me datë, dokument, detyrim/kredi dhe saldo | Cloud ka reportKey reference; kërkon audit kolonë-për-kolonë.
| crfurnitorkartelaformat3.pdf | 1 | purchase_supplier_card_format3_pdf | Kartela furnitori, Formati 3 | Cloud ka variantin reference; kërkon kontroll të header/footer.
| crfurnitormaturimi.pdf | 1 | purchase_supplier_maturity_pdf | Maturime furnitorësh me afate dhe shuma | Cloud ka reportKey reference; kërkon kontroll të grupeve të maturimit.
| crfurnitormaturimifushashtese.pdf | 1 | purchase_supplier_maturity_pdf | Maturim me fusha shtesë | Duhet dalluar nga variantet e maturimit në cloud dhe të ruhen kolonat shtesë.
| crfurnitormaturimipermbledhes2.pdf | 1 | purchase_supplier_maturity_summary_pdf | Maturim përmbledhës, Formati 2 | Variant i dedikuar në katalog dhe renderer; kërkon vetëm verifikim vizual kolonë-për-kolonë. |
| crfurnitorsituacion.pdf | 1 | purchase_supplier_statement | Situacion furnitorësh: kategori, debi, kredi, detyrim dhe peshë | Cloud ka pasqyrë furnitori; pesha/kategoritë duhen krahasuar.
| crfurnitorsituacionsipaskateg.pdf | 2 | purchase_supplier_situation_category_pdf | Situacion sipas kategorisë, monedhë dokumenti dhe monedhë bazë | Cloud ka reportKey reference; kërkon verifikim të totalit për kategori dhe të gjitha kategoritë.

## Magazina dhe artikujt

| PDF reference | Faqe | ReportKey cloud | Struktura e referencës | Gjendja e krahasimit |
|---|---:|---|---|---|
| crmaganalizaartikujve.pdf | 3 | inventory_article_analysis_pdf | Kartelë, emërtim, njësi, hyrje/dalje, gjendje, kosto mesatare, vleftë | Cloud ka raportin reference; kosto/vleftë duhet kontrolluar me balancat reale.
| crmagartikujgjendjenegative.pdf | 9 | inventory_negative_stock | Artikuj negativë me datë, magazinë dhe gjendje | Cloud ka variantin bazë; kërkon krahasim të rreshtave negativë dhe magazinës.
| crmaggjendjaartikujveminimum.pdf | 3 | inventory_minimum_status_pdf | Minimum, mungesa, hyrje, dalje, gjendje, kosto, vleftë, furnitor | Cloud ka reportKey reference; duhet ruajtur kolona Furnitor.
| crmaggjendjaartikullit.pdf | 9 | inventory_warehouse_detail_pdf | Gjendje artikulli me llogari/inventar, hyrje, dalje, kosto dhe vleftë | Cloud ka raportin; kërkon variantin detaj sipas magazinës.
| crmaggjendjaartikullitpermbledhur.pdf | 2 | inventory_product_summary_pdf | Gjendje artikulli e përmbledhur me mbartur, hyrje, dalje, kosto dhe vleftë | Cloud ka reportKey reference; kërkon kontroll të totalit dhe mbartjes.
| crmaggjendjamagazines.pdf | 4 | inventory_warehouse_status_pdf | Gjendje magazine me kosto, vleftë dhe përqindje | Cloud ka reportKey reference; kërkon kontroll të kolonës përqindje.
| crmaggjendjamagazinesdetajime.pdf | 6 | inventory_warehouse_detail_pdf | Gjendje magazine sipas detajeve të artikullit | Cloud ka variant reference; kërkon dallim nga warehouse status.
| crmagkartelaartikullit.pdf | 72 | inventory_product_card_pdf | Kartelë artikulli shumëfaqëshe me lëvizje dhe saldo | Cloud ka reportKey reference; kërkon kontroll të pagination dhe header/footer.
| crmagregjanalitik.pdf | 17 | inventory_analytic_register_pdf | Regjistër analitik me lëvizje dhe vlera | Cloud ka reportKey reference; kërkon krahasim të llogarive dhe totalit.
| crmagregjpermbledhes.pdf | 4 | inventory_product_summary_pdf | Regjistër përmbledhës i gjendjes së artikujve | Kërkon verifikim të dallimit nga `crmaggjendjaartikullitpermbledhur.pdf`.

## Shitje

| PDF reference | Faqe | ReportKey cloud | Struktura e referencës | Gjendja e krahasimit |
|---|---:|---|---|---|
| crmarkshitjetsipasklienteve.pdf | 3 | sales_by_customer_pdf | Shitje sipas klientëve, dokumente dhe vlera | Cloud ka reportKey reference; kërkon kontroll grupimi dhe subtotalesh.
| crmarkshitjetsipasqyteteve.pdf | 2 | sales_by_city_pdf | Shitje sipas qyteteve | Cloud ka reportKey reference; kërkon kontroll të qytetit dhe totalit.
| crmarkshitjetsipassasise.pdf | 19 | sales_quantity_pdf | Shitje sipas sasisë me artikull, njësi dhe vlerë | Cloud ka reportKey reference; kërkon kontroll të faqosjes.
| crmarkshitjetsipassasisetotal.pdf | 35 | sales_quantity_total_pdf | Shitje sipas sasisë totale | Cloud ka reportKey reference; kërkon kontroll të totalit global.
| crrapashthjeshteformat1.pdf | 1 | sales_summary_register_pdf | Raport i thjeshtë përmbledhës, Formati 1 | Kërkon variant të veçantë nëse kolonat ndryshojnë nga regjistri bazë.
| crrapashthjeshteformat2.pdf | 1 | sales_summary_register_pdf | Raport i thjeshtë përmbledhës, Formati 2 | Kërkon variant të veçantë nëse kolonat ndryshojnë nga Formati 1.
| crshitjeartikuj.pdf | 3 | sales_by_product_pdf | Shitje sipas artikujve | Cloud ka reportKey reference; kërkon kontroll të grupimit.
| crshitjeartikujpashitur.pdf | 1 | sales_unsold_items_pdf | Artikuj të pashitur | Cloud ka reportKey reference; kërkon kontroll të filtrit zero-shitje.
| crshitjeartikujzbritjeanalitike.pdf | 18 | sales_discount_analysis_pdf | Artikuj me zbritje analitike | Cloud ka reportKey reference; kërkon kontroll të zbritjes dhe totalit.
| crshitjefaturimedhepagesa.pdf | 1 | accounting_payment_register | Fatura dhe pagesa të lidhura | Nuk duhet trajtuar si regjistër i thjeshtë pagesash; kërkon report variant për faturë-pagesë.
| crshitjekartelaartikullit.pdf | 70 | sales_product_card_pdf | Kartelë artikulli e shitjeve, shumëfaqëshe | Cloud ka reportKey reference; kërkon kontroll të lëvizjeve dhe faqosjes.
| crshitjekthime.pdf | 1 | sales_returns_pdf | Regjistër kthimesh | Cloud ka reportKey reference; kërkon kontroll të statusit dhe totalit.
| crshitjelistecmimesh.pdf | 121 | sales_price_list_pdf | Listë çmimesh e gjatë, me shumë faqe | ReportKey i posaçëm dhe grupime reference janë implementuar; mbetet auditimi vizual i 121 faqeve dhe pagination-it. |
| crshitjemarzhi.pdf | 2 | sales_margin_pdf | Marzhi i shitjeve | Cloud ka reportKey reference; kërkon kontroll të kostos, fitimit dhe përqindjes.
| crshitjemarzhi_2.pdf | 3 | sales_margin_detail_pdf | Marzhi i shitjeve, Formati 2/detaj | Cloud ka variant reference; kërkon kontroll të kolonave shtesë.
| crshitjeparagona.pdf | 4 | sales_comparison_pdf | Paragona/krahasim shitjesh | ReportKey i dedikuar dhe rreshta nga faturat reale janë implementuar; mbetet auditimi i kolonave/subtotaleve. |
| crshitjeregjistrianalitik.pdf | 27 | sales_analytic_register_pdf | Regjistër analitik shitjesh | ReportKey i dedikuar dhe rreshta reale me monedhë/kurs/VAT janë implementuar; mbetet auditimi vizual 1:1. |
| crshitjeregjistripermbledhes.pdf | 5 | sales_summary_register_pdf | Regjistër përmbledhës shitjesh | Cloud ka reportKey reference; kërkon krahasim me formatet e thjeshta.
| crshitjesipasartikujve.pdf | 2 | sales_by_product_pdf | Shitje sipas artikujve | Cloud ka reportKey reference; kërkon kontroll të kolonave dhe subtotalit.

## Përfundim i fazës së krahasimit

Katalogu aktiv mbulon shumicën e raporteve reference me reportKey të posaçëm. Tre boshllëqet e mëparshme — **listë çmimesh**, **paragona/krahasimi** dhe **regjistri analitik i shitjeve** — tani kanë reportKey dhe renderer të izoluar; mbetet verifikimi vizual kundrejt PDF-ve. Formatet e furnitorëve me maturime dhe formatet e thjeshta të shitjeve kanë variante të shumta dhe nuk mund të konsiderohen identike vetëm nga emri.

Raportet aktuale të cloud-it tashmë kanë filtrat, përmbledhjet dhe eksportet bazë; përputhja vizuale pikë për pikë kërkon verifikim të mëtejshëm të screenshot/PDF për secilin grup, veçanërisht header-in, footer-in, orientimin, pagination, totalet dhe tekstet e kolonave.
