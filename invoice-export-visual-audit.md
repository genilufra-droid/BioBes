# Invoice EXPORT — kontroll vizual

Kontrolli live i faturës 540 me ID databaze 30068 konfirmoi se preview përdor formatin BioBes EXPORT në A4 portrait dhe shfaq titullin EXPORT INVOICE, Seller, Bill To, Ship To, tabelën e mallrave dhe totalet. Në mobile 390px preview mbetet i hapshëm me scroll horizontal brenda dokumentit dhe nuk kthehet në template vendas.

Pas zgjerimit të renderer-it PDF, metadata e transportit, porosisë, seal-it, afateve të pagesës dhe bankës përdorin të njëjtin burim `exportDetails` si preview. Build-i dhe testet e renderer-it kaluan. Krahasimi absolut 1:1 me foton origjinale mbetet për verifikim manual përmasë-përmasë.

## Reference 686/2026 supplied by user

The user supplied the authoritative BioBes Invoice 686/2026 reference photo. It shows a portrait A4 document with a BioBes logo/tagline at upper left, company contact block at upper right, centered `Invoice number : 686/2026`, date aligned right below the rule, Bill To and Ship To text blocks, two-column delivery metadata, a nine-column goods table, a Total row, separate pallet and loading costs, EUR Total, administrator/signature area, bank details, and a bottom payment instruction footer.

The current live preview for invoice 540 now renders this same structural order in English and portrait A4: branded header, invoice number/date, parties, delivery metadata, goods table, total row, cost lines, bank/signature block, and footer. The live document opens from `openInvoice=30068` and the `Export Invoice` button shows the export renderer rather than the domestic renderer.

## Preview after Excel layout update

After the Excel renderer was expanded, the live route still opens invoice 540 correctly. The first navigation frame can show the workspace loading state briefly; after the view settles, the invoice dialog is present and `Export Invoice` renders the branded portrait document. The preview remains separate from the domestic invoice flow.

## PDF button verification

The live invoice 540 route shows the EXPORT preview after the workspace settles. The toolbar exposes `Print Preview`, `Excel`, `PDF`, and `Export Invoice`; the PDF control is enabled and remains on the same invoice dialog after activation. The preview uses the updated branded portrait layout.

## Stamp verification

The refreshed invoice 540 EXPORT preview now shows the administrator block with a circular blue BioBes stamp treatment, in addition to the bank details and payment footer. The document remains one portrait A4 page in the live dialog.

## Excel export verification setup

The live invoice 540 EXPORT dialog exposes the Excel control alongside PDF and Export Invoice, and the updated portrait preview remains visible with the BioBes stamp. The Excel download is ready for a separate file-level check of worksheet columns and page setup.

## Excel download audit

The Excel toolbar button is present and clickable in the live EXPORT invoice dialog. In this browser session no `Export_Invoice_540.xlsx` file appeared in Downloads after the click, and the browser console had no error output. The generated Excel function itself passes TypeScript and project tests; a browser-download integration check remains open rather than being marked complete.

## Excel retest preview

After the merged-cell fix, invoice 540 again opens normally after the transient workspace loading state. The dialog shows the updated one-page portrait EXPORT preview with stamp and the Excel button available.
