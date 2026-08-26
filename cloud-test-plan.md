# Plan testimi cloud — Sistemi Genit Cloud

Ky plan zbatohet përpara çdo migrimi në PHP. Çdo skenar duhet të kalojë në të dhëna reale ose në të dhëna ekzistuese të testueshme, pa sajuar klientë, furnitorë apo shifra biznesi. Rezultatet do të dokumentohen bashkë me versionin e cloud-it.

| Faza | Moduli | Kontrolli kryesor | Kriteri i kalimit |
|---|---|---|---|
| 1 | Autentikim dhe RBAC | Admin, anëtar kompanie dhe Viewer; leximi/shkrimi | Viewer lexon, por nuk shkruan; të dhënat izolohen sipas kompanisë |
| 2 | Kompanitë dhe partnerët | Kompani aktive, furnitorë, klientë, kërkim live | Asnjë rekord i kompanisë tjetër nuk shfaqet |
| 3 | Artikujt dhe magazinat | Artikuj, njësi, depo, lokacione dhe kosto | Formularët kërkojnë magazinë kur dokumenti prek stokun |
| 4 | Blerjet | Faturë, porosi, pranim, kthim, pagesë dhe dokument link | Fatura reflektohet në stok, raporte dhe kartelë furnitori |
| 5 | Shitjet | Kuotim, porosi, ngarkesë/delivery, faturë, kthim dhe pagesë | Shitja zbrit stokun dhe lidhet me dokumentet e rrjedhës |
| 6 | Monedhat | ALL/EUR/USD/GBP, kursi dhe ekuivalenti Lek | Totale të huaja nuk përzihen; përmbledhjet konvertohen në Lek |
| 7 | Stoku | Hyrje, dalje, transferim, inventarizim dhe anulim | Bilanci pasqyron çdo lëvizje reale dhe anulimi krijon kundërveprim |
| 8 | Pagesat dhe Cash/Bankë | Cash, bankë, statusi i pagesës, postimi | Pagesat ndikojnë vetëm dokumentin përkatës dhe përmbledhjet në Lek |
| 9 | Pagat | Import template, orë, turne, mungesa, bonus, bankë/cash | Importi raporton qelizat e pasakta dhe fletëpagesat llogariten pa valuta të gabuara |
| 10 | Raportet | Filtra globalë, filtra kolonash, renditje, total, link dhe dokument | Raporti reflekton të dhënat reale dhe eksportet marrin dataset-in e filtruar |
| 11 | Print dhe eksporte | Excel, PDF, Print Preview, A4 portrait/landscape | Header/footer, totalet, pagination dhe linket ruhen sipas referencës |
| 12 | Dokumentet e ngarkesës | Foto, PDF, ZIP, Word, Excel dhe arkivimi | Dokumentet ruhen në storage dhe lidhen me ngarkesën përkatëse |
| 13 | Kontroll regresioni | Suite Vitest, TypeScript, build, preview dhe deploy | Të gjitha testet kalojnë dhe nuk ka gabime aktive të serverit |

## Rregullat e verifikimit

Çdo rezultat duhet të ketë modul, skenar, input, rezultat të pritshëm, rezultat real, status dhe version checkpoint-i. Një modul shënohet i përfunduar vetëm kur kalojnë UI-ja, backend-i, databaza, filtrat, eksportet dhe kontrolli multi-company përkatës.

## Kushti për migrimin PHP

Migrimi në PHP fillon vetëm pasi ky plan të jetë ekzekutuar, rezultatet të jenë dokumentuar, baseline-i cloud të jetë ruajtur dhe kontrata e databazës/API-ve të jetë nxjerrë nga versioni i testuar. Zhvillimi PHP nuk zëvendëson testimin cloud dhe nuk duhet të prekë baseline-in.
