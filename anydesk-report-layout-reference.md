# AnyDesk report window reference

Source: user-provided screenshot `Screenshot_20260822_181006_AnyDesk.jpg` (1079 × 766 px), shown in the conversation.

## Required visual hierarchy

- Classic Windows-style grey report window titled `Raporte Shitjeje`.
- Thin title bar across the top with window controls at the far right.
- Toolbar at upper left with four vertical icon actions: `Mbyll`, `Shiko`, `Printo`, `Ndihme`.
- Three-column form layout below the toolbar:
  - Left column: `Emri i Raportit` list, then `Shuma` group, then `Grupi Sipas` group.
  - Middle column: document filters, sales-point filters, currency, payment method, sales grouping, checkbox for invoice-linked payments, client/customer fields, period and document dates, and printer field.
  - Right column: active/inactive/all radio buttons, identification fields, card/group/subgroup/code filters, supplier/serial/unit controls, warehouse controls and graphic filters.
- Bottom-right action is the large `ENTER-Shiko` button; bottom-left/center has `ESC - Dil`.
- Result document must not be rendered under the form. Pressing `ENTER-Shiko` closes the filter window and opens only the filtered PDF/reference document view.
- PDF result uses real company data, active filters and source-document arrows `↗`. Clicking an arrow opens the real source invoice/order/payment/warehouse document directly.
- Do not expose the modern column-filter/search blocks inside this legacy form.
- Do not publish a version as 1:1 until a screenshot comparison confirms the same hierarchy, positions, proportions, toolbar placement, panel density and button placement.

## Kontrolli i fundit i draftit
- Referenca finale është screenshot-i AnyDesk 1079×766; nuk rihapet si skedar.
- Rrjedha e kërkuar: Raporte → zgjedh modul Blerje/Shitje → hapet vetëm formulari → ENTER–Shiko mbyll formularin dhe hap vetëm dokumentin PDF reference.
- Drafti live tani shfaq listën e raporteve të modulit Blerje, grupin Shuma/Grupi Sipas majtas, panelet Numer Dokumenti/Klienti/Datat në qendër dhe Identifikues/Magazinë/Grafik në të djathtë.
- Dallimi i mbetur për auditim: përputhja e plotë e koordinatave, përmasave, toolbar-it me ikonat dhe kornizave me screenshot-in; nuk duhet publikuar pa këtë kontroll.
