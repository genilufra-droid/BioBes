# Referencë Odoo 19 për workspaces ERP

Ky shënim përkthen elementet e dokumentuara të Odoo 19 në vendime konkrete për Sistemi Genit Cloud. U analizuan video reference për Shitje, Magazina, Kontabilitet dhe CRM; ato mbulojnë gjithashtu workflow-t e Blerjeve dhe Bankave. Shfletimi i drejtpërdrejtë i YouTube u kufizua nga verifikimi i trafikut, ndaj analiza e videos u krye përmes një procesi pasiv të përmbajtjes publike dhe u kryqëzua me dokumentacionin zyrtar të Odoo 19.

| Elementi Odoo 19 | Zbatim në Sistemi Genit Cloud | Përparësia |
| --- | --- | --- |
| Formë dokumenti me gjendje dhe veprime të qarta | Header i ngjeshur, statusbar dhe butona workflow në Blerje e Shitje | E lartë |
| Search view, filtra dhe grupim | Kërkim tekstual i menjëhershëm në çdo listë, me filtra të klikueshëm sipas statusit dhe partnerit | E lartë |
| Rrjedhë dokumentesh të lidhura | Smart buttons për Porosi, Pranim, Dërgesë, Faturë dhe Pagesë | E lartë |
| Pipeline CRM | Kanban sipas fazës me aktivitetet e planifikuara | Mesatare |
| Bank reconciliation | Panel me transaksion bankar, sugjerime pajtimi dhe veprim konfirmimi | Mesatare |
| Raportim i centralizuar | Katalog kompakt, periudhë, drill-down dhe eksport | E përfunduar |

Odoo e përshkruan modulin Purchase si vend për marrëveshjet e blerjes, kërkesat për ofertë, porositë dhe ndjekjen e porosive; kjo mbështet ndarjen e qartë të gjendjeve dhe lidhjeve në workflow-n e Blerjeve.[1] Moduli Accounting mbulon faturat, faturat e furnitorit, pagesat, pajtimin bankar dhe raportet financiare, ndërsa çdo kompani punon mbi të dhënat e saj në një mjedis multi-company.[2] Kjo përputhet me kontekstin aktiv të kompanisë që përdor Sistemi Genit Cloud.

Për Bankat, Odoo përdor një dashboard me karta ditarësh dhe një pamje pajtimi, ku transaksionet e importuara trajtohen me sugjerime ose veprime manuale.[3] Në Sistemi Genit Cloud prioriteti nuk është integrimi automatik me një bankë të jashtme, por qartësimi i panelit ekzistues të ekstrakteve, transaksioneve dhe pajtimit.

## Renditja e punës së mbetur

Hapi i ardhshëm është standardizimi i listave të partnerëve dhe artikujve me kërkim të menjëhershëm dhe me formular të plotë krijimi. Më pas, form-view e Shitjeve duhet të jetë njëjtë e plotë me formën e Blerjeve. Smart buttons për lidhjet Porosi → Pranim → Faturë dhe Ofertë → Porosi → Dërgesë → Faturë e bëjnë gjurmueshmërinë e dokumenteve të dukshme pa përdorur dropdown-e. Në fund, CRM kanban dhe paneli i pajtimit bankar përfitojnë nga një strukturë vizuale e përbashkët e control panel-it.

## Gjetje nga referencat vizuale

| Moduli | Pattern-et e vëzhguara | Përkthimi në projekt |
| --- | --- | --- |
| Blerje dhe Magazina | Listë e dendur, search bar, gjendje Draft → Ready → Done dhe veprime Validate/Return | Ruaj workflow-t ekzistuese dhe shto përkatësisht filtra, statusbar e smart buttons |
| Shitje | Formë oferte/porosie me header partneri, rreshta, tab-e dhe smart buttons për dërgesë/faturë | Unifiko hyrjen standarde të Shitjeve me Easy Invoice dhe bëj të dukshme dokumentet e lidhura |
| Kontabilitet dhe Banka | Karta të ditarëve, status Draft → Posted → In Payment → Paid, pajtim me propozime | Riorganizo bank matching sipas transaksionit dhe pagesës së sugjeruar |
| CRM | Kanban sipas fazave, karta me aktivitet dhe veprime për ofertë/mundësi | Jep përparësi kanban-it me indikatorë aktivitetesh dhe lidhje te ofertat |

## Video-t e shqyrtuara

| Moduli | Video reference | Pika e përdorur për projektin |
| --- | --- | --- |
| Blerje | [Purchase Workflow in Odoo 19](https://www.youtube.com/watch?v=8k7ruiO2QEU) | RFQ → PO → Pranim → Vendor Bill, statusbar dhe smart buttons |
| Shitje | [Odoo 19 Sales Overview](https://www.youtube.com/watch?v=5dCZvuLelMY) | Header i dokumentit, Order Lines, tab-e dhe lidhje për dërgesa/fatura |
| Magazina | [Inventory in Odoo 19](https://www.youtube.com/watch?v=ZlvbYJEGJts) | Operacionet e stokut, gjendjet Draft/Ready/Done dhe validimi |
| Kontabilitet | [Odoo 19 Accounting Full Tutorial](https://www.youtube.com/watch?v=AgWVvBF-XzU) | Karta të ditarëve, statuset financiare dhe filtrat e raportit |
| CRM | [Odoo 19 CRM Overview](https://www.youtube.com/watch?v=S6TapYImcuk) | Kanban, aktivitetet dhe konvertimi i mundësive në oferta |
| Banka | [Bank Reconciliation in Odoo 19](https://www.youtube.com/watch?v=U5P9Hb4rX0M) | Pamja split për pajtim, sugjerimet e përputhjes dhe validimi |

## Referenca

[1]: https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/purchase.html "Odoo 19 – Purchase"
[2]: https://www.odoo.com/documentation/19.0/applications/finance/accounting.html "Odoo 19 – Accounting and Invoicing"
[3]: https://www.odoo.com/documentation/19.0/applications/finance/accounting/bank/bank_synchronization.html "Odoo 19 – Bank synchronization"
