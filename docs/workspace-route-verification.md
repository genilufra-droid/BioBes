# Verifikimi i workspaces operacionale

Më 18 gusht 2026 u krye verifikimi vizual i hapjes së workspaces të biznesit në preview desktop. Të gjitha rrugët e mëposhtme ngarkuan shell-in Odoo-style pa gabime të dukshme të renderimit dhe shfaqën action-in e krijimit ose një empty state të qartë.

| Workspace | Rruga | Rezultati i vëzhguar |
| --- | --- | --- |
| Artikuj | `/products` | Listë produktesh, alarm stoku dhe buton për artikull të ri |
| Magazina | `/inventory` | Operacionet e stokut, tab-et dhe raportet e modulit |
| Furnitorë | `/suppliers` | Live Search, eksporte PDF/Excel dhe formular krijimi |
| Klientë | `/customers` | Live Search, eksporte PDF/Excel dhe formular krijimi |
| Shoferë | `/agents` | Listë transporti, kërkim dhe veprim “Shto shofer” |
| Mjete | `/vehicles` | Listë flote, kërkim dhe veprim “Shto mjet” |
| Ngarkesa | `/cargo-loads` | Listë ngarkesash, kërkim dhe veprim “Shto ngarkesë” |
| Formularë peshe | `/weight-forms` | Metrika dokumentesh, listë dhe veprim për formular të ri |

Ky kontroll vërteton që workspaces janë të arritshme drejtpërdrejt përmes rrugëve të tyre. Verifikimi i ndërveprimit të menuve mobile dhe i rrjedhave të krijimit mbetet pjesë e checklistës së testimit fund-më-fund.

## Kontrolli mobile

Pamja mobile me viewport 375 × 812 u verifikua për launcher-in e pasqyrës dhe për workspaces `/agents`, `/vehicles` dhe `/cargo-loads`. Launcher-i kalon në listë vertikale të lexueshme. Të tre workspaces e transportit ruajnë Live Search, butonin e krijimit me gjerësi të plotë dhe tabelat/empty states pa mbivendosje të dukshme.
