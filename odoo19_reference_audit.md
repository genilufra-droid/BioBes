# Referencë dizajni dhe workflow-sh — Odoo 19

Kjo përmbledhje bazohet në analiza të videove publike për Odoo 19 të kryera më 18 gusht 2026. Ajo përdoret si standard implementimi për Sistemi Genit Cloud.

| Modul | Modele UI të vëzhguara | Workflow kryesor që duhet ruajtur |
|---|---|---|
| Shitje | List view i personalizueshëm, kanban për oferta, control bar me Search/Filters/Group By, forma me action buttons, statusbar dhe tab-e | Quotation → Sent → Sales Order → Invoice → Payment |
| Blerje | Dashboard me karta statusi, listë RFQ/PO, forma me produkte, statusbar dhe smart buttons | RFQ → RFQ Sent → Purchase Order → Receipt → Vendor Bill |
| Magazina | Karta për operacionet, indikatorë "To Receive/To Process", forecast i zgjerueshëm dhe kontroll granular i transferta-ve | Receipt/Delivery/Internal Transfer → Validate → Update Stock |
| Kontabilitet | Kanban dashboard për ditarët, karta me balanca dhe veprime të shpejta, listë Journal Items me debi/kredi | Customer Invoice/Vendor Bill → Post → Payment → Reconcile |
| CRM | Kanban me etapa, karta opportunity me vlerë, prioritet dhe aktivitet, panel aktivitetesh | Lead → Qualified → Proposal → Won → Sales Order |
| Banka | Karta ditari, transaksione me sinjale pajtimi, panel matching me kërkim dhe balancë në kohë reale | Import statement → Suggest/Match → Reconcile → Mark reconciled |

## Rregulla të përbashkëta të dizajnit

1. Çdo listë kryesore duhet të nisë me **Search**, **Filters**, **Group By**, **Favorites** dhe view switcher.
2. Çdo formë dokumenti duhet të ketë **action buttons** në header, **statusbar** në anën e djathtë, **smart buttons** kur ekzistojnë dokumente të lidhura dhe **tab-e** për rreshta/informacion shtesë/shënime.
3. Dashboard-et e moduleve duhet të përdorin karta operacionale me numërues dhe veprime të qarta, jo karta dekorative.
4. Dokumentet duhet të kenë progres të dukshëm dhe lidhje direkte me pasojën e workflow-t në modulin pasardhës, p.sh. porosia e blerjes me pranim dhe fatura e furnitorit.
5. Elementet me densitet të lartë të të dhënave duhet të përdorin tabela të pastra me status cues, ndërsa pipeline përdor kanban.

## Prioritete për Sistemi Genit Cloud

1. Unifikimi i çdo hyrjeje të faturave në një **Odoo form view**.
2. Control panel i njëjtë Search/Filters/Group By në çdo modul.
3. Smart buttons dhe lidhje dokumentesh për workflow-t Purchase, Sales dhe Inventory.
4. CRM kanban me activity sidebar dhe status të mundësisë.
5. Banka me reconciliation panel dhe sugjerime për pajtim.

## Burimet e analizuara

- Odoo, *Getting started | Odoo Accounting* — https://www.youtube.com/watch?v=CZOXYz73gZM
- Odoo, *Odoo 19 Sales Overview* — https://www.youtube.com/watch?v=5dCZvuLelMY
- Odoo, *Meet Odoo 19's best features* — https://www.youtube.com/watch?v=OZLP-SCHW7A
- Odoo, *Bank reconciliation | Odoo Accounting* — https://www.youtube.com/watch?v=P8EItiKqm5k
- Odoo 19 Purchase workflow guide — https://www.youtube.com/watch?v=jL7C1bvqsS4
