# Verifikim publik dhe preview — shell Odoo-style

**Data:** 18 gusht 2026  
**Version i publikuar:** `7b636172`

U krahasuan dashboard-i publik pas login-it (screenshot i përdoruesit) dhe preview-ja lokale në të njëjtën rrugë `/` në desktop.

| Element | Domain publik | Preview lokal | Rezultati |
|---|---|---|---|
| Navigimi kryesor | Navbar horizontale vjollcë në krye | Navbar horizontale vjollcë në krye | Përputhet |
| Sidebar-i i vjetër | Nuk shfaqet | Nuk shfaqet | Përputhet |
| Breadcrumb | `Aplikacionet / Pasqyra` | `Aplikacionet / Pasqyra` | Përputhet |
| Kompania aktive | Shfaqet në të djathtë | Shfaqet në të djathtë | Përputhet |
| Live Search | Shfaqet në zonën e workspace-it | Shfaqet në zonën e workspace-it | Përputhet |
| KPI dhe aplikacionet | KPI të rreshtuara dhe launcher modulësh | KPI të rreshtuara dhe launcher modulësh | Përputhet |

Domain-i publik tani shërben shell-in aktual Odoo-style; pamja e mëparshme me sidebar të majtë nuk është më pjesë e workspace-it të publikuar.
