# Krahasim — Sistemi i Pagave v4.7 dhe specifikimi Abacus v4.8

## Burimet e detyrueshme

HTML-i referencë përcakton shell-in vizual: sidebar 245 px me gradient `#17253d → #0f1c31`, topbar të bardhë, tabela me header `#eaf0f7`, kartat KPI, pamjet dhe emërtimet në shqip. PDF-ja Abacus përcakton sjelljen funksionale dhe modelin e të dhënave.

## Pikat e përbashkëta që zbatohen

- Navigimi ka pamjet: Dashboard, Logs, Krijo Pagat, Listëprezenca, Bordero, Listëpagesa Bankë, Listëpagesa Cash, Fletëpagesat, Të Huajt, Listëprezencë Manuale, raportet dhe konfigurimi.
- Lista e prezencës ka një punonjës për rresht, një ditë për kolonë, të dielat të theksuara dhe totalet O.Bruto, O.Pagesë, Normale dhe Shtesë.
- Dokumentet e gjera përdorin A4 landscape; dokumentet e pagesës përdorin A4 portrait. Eksporti Excel ruan renditjen dhe kolonat e ekranit.
- Regjistri i punonjësve ka kërkim të drejtpërdrejtë dhe fushat Nr. listëpage, kosto OPN/OPSH, paga bazë, avans, pagesa, bankë, turn dhe aktiv.

## Rregullat Abacus që kanë përparësi funksionale

- Parseri List of Logs lexon periudhën, gjen header-in më të afërt të ditëve për secilin bllok, mbështet zhvendosje kolonash A/B dhe ndan stampat me `/`.
- Për 2 stampa: O.Bruto është diferenca hyrje–dalje dhe zbritet pushimi 60 minuta kur bruto është të paktën 6 orë, përveç kur ka override.
- Për 4+ stampa: O.Bruto është shuma e intervaleve të çifteve dhe nuk zbritet pushim shtesë.
- Orët normale kufizohen në 8; orët shtesë nisin pas fundit të turnit plus toleranca 30 minuta.
- Formati i punonjësit përfshin shiftCode, iHuaj/pagaDite, banka/llogari dhe dokumente deri në 4 MB.

## Përparësia e implementimit

1. Lidhja e importit real Excel me parserin dhe preview-n e Logs.
2. Ruajtja e prezencës së llogaritur për periudhë dhe gjenerimi i Borderos/Fletëpagesave prej saj.
3. Plotësimi i regjistrit të punonjësve dhe parametrave me fushat Abacus.
