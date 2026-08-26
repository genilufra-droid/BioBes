# Specifikimi i rrjedhës së Shitjeve nga workbook-u 2026

## Parim i modelit

Sheet-i `FATURAT 2026` do të trajtohet si burim i faturave hyrëse nga fermerët, jo si shitje klientësh. Moduli **Shitje** do të marrë dokumentet nga `SHITJET B V NE LEKE & EURO` për shitje vendase dhe nga `EKSPORTI` për shitje eksporti. Kjo ruan kuptimin e saktë të të dhënave dhe shmang paraqitjen e blerjeve si xhiro.

## Harta e burimeve në modelin e sistemit

| Burimi Excel | Entitet sistemi | Grupimi i dokumentit | Efekti i validimit |
|---|---|---|---|
| `SHITJET B V NE LEKE & EURO` | `salesInvoices` + `salesInvoiceItems` | `Nr. Fature` | Dalje nga magazina, të ardhura dhe TVSH |
| `EKSPORTI` | `salesInvoices` + `salesInvoiceItems` me `invoiceFormat=EXPORT` | `Nr. Fature` | Dalje nga magazina, EUR dhe ekuivalent LEK |
| `LISTE KLIENTESH` | `customers` | Kodi klientit | Lidhje me faturën |
| `PRODUKTET` | `products` | Kodi produktit | Artikulli, njësia, kosto dhe stok |
| `FATURAT 2026` | `purchaseInvoices` + rreshta blerjeje | `NR` | Hyrje në magazinë dhe detyrim ndaj fermerit |

## Fushat e faturës së shitjes

Fatura standarde do të ketë numër dokumenti, datë, klient, magazinë burimore, monedhë, kurs këmbimi, status dokumenti, status pagese, total pa TVSH, TVSH, total me TVSH dhe shënime. Fatura e eksportit do të ruajë gjithashtu shtetin, statusin doganor, deklaratën doganore, datën e deklaratës, lotin, cilësinë/thasët, transportin, datën e likuidimit dhe shumën për likuidim.

## Fushat e rreshtit

Çdo rresht ruan kodin e artikullit, emërtimin e normalizuar nga master-data, sasinë, njësinë, çmimin, vlerën pa TVSH, TVSH-në dhe vlerën me TVSH. Në import nuk do të humben vlerat origjinale të workbook-ut; kur kodi i produktit mungon ose formula kthen `#N/A`, rreshti do të shënohet për rishikim në vend që të krijohet artikull i rremë.

## Rrjedha operative

Përdoruesi mund të krijojë ofertë, porosi, fletë-dalje, faturë dhe kthim. Kur dokumenti kalon në validim, sistemi kontrollon magazinën dhe artikujt, krijon lëvizjen e stokut, lidh dokumentet burimore dhe përditëson raportet. Pagesa e faturës ndryshon vetëm statusin e pagesës dhe nuk ndryshon totalin e faturës. Për eksportet në EUR ruhet kursi dhe llogaritet ekuivalenti në LEK.

## Rregulla të importit

Numri i faturës ruhet si tekst për të pranuar vlera si `1/2026` dhe për të mos humbur zerot ose formatin. Rreshtat me të njëjtin numër dhe datë grupohen në një faturë. Datat që nuk janë data reale raportohen si gabime importi. Importi do të jetë idempotent përmes një çelësi të burimit Excel dhe numrit të faturës, në mënyrë që i njëjti skedar të mos krijojë dyfishime.

## Raportet që duhet të lidhen me këtë rrjedhë

Raportet e shitjeve do të filtrohen sipas periudhës, numrit të dokumentit, klientit, artikullit, magazinës, monedhës, statusit të dokumentit dhe statusit të pagesës. Çdo numër dokumenti do të ketë shigjetën ↗ drejt faturës reale, ndërsa përmbledhjet do të grupojnë faturat një herë dhe jo çdo rresht artikulli veçmas.

## Verifikimet numerike

Para importit të shitjeve, do të kontrollohet që totali i çdo fature të jetë shuma e rreshtave dhe që TVSH + neto = bruto. Për eksportet do të kontrollohet bruto EUR × kursi = ekuivalenti LEK. Për faturat me disa rreshta do të kontrollohet që numri i dokumentit të shfaqet një herë në përmbledhje dhe artikujt të shfaqen të gjithë në detaj.
