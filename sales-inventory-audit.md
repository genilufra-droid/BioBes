## Audit 2026-08-25 — faturë shitjeje 540

- Kompania 1 ka 2 hyrje stoku nga blerje me gjithsej 125 njësi.
- Ka 163 dalje stoku nga SALES_INVOICE me gjithsej 358832 njësi, prandaj pasqyra tregon stok negativ.
- Fatura 540 (salesInvoice id 30068) ka 6 rreshta artikujsh, por vetëm 4 lëvizje OUT për artikullin GJETHE FERRE: 6750, 6750, 4250, 2500. Dy rreshta 6750 janë të dyfishtë krahasuar me salesItems; sasia e lëvizjeve është 20250 ndërsa rreshtat për këtë artikull janë 6750 + 6750 + 4250 + 2500 = 20250. Ky duhet të auditohet në nivel importi/rreshti para çdo fshirjeje.
- Nuk u krye asnjë ndryshim destruktiv në databazë.
