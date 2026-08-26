# Verifikimi i eksporteve Payroll — Korrik 2026

## Bordero

Pamja **Bordero — Korrik 2026** shfaqi 63 rreshta të punonjësve të rregullt, kolonat e orëve, kostove, bonusit, totalit dhe ndarjes Bankë/Kesh, si edhe rreshtin e totalit.

Eksporti Excel u krye pa gabim. Historia e shkarkimeve konfirmon krijimin e skedarit `Bordero_Korrik_2026 (3).xlsx` nga instanca aktuale e preview-it.

Pas korrigjimit, u shkarkua `Bordero_Korrik_2026 (4).xlsx` dhe u lexua drejtpërdrejt. Fleta `Bordero` përmban 63 rreshta pune, 14 kolonat e pritshme dhe rreshtin `TOTAL`: **12,567** orë bruto/pagese, **12,070** orë normale, **497** orë shtesë, **3,421,873.00 Lek** total, **1,803,003.00 Lek** Bankë dhe **1,669,800.00 Lek** Kesh.

## Eksporte të verifikuara më parë në të njëjtën periudhë

Historia e shkarkimeve ruan gjithashtu `Listepagesa_Cash_Korrik_2026.xlsx`, `Listepagesa_Cash_Korrik_2026.pdf`, `Listeprezence_Manuale_2026_07.xlsx` dhe `Listeprezence_Manuale_2026_07.pdf`, të krijuara pa gabime nga funksionet përkatëse të Payroll.

## Fletëpagesat

Pamja **Fletëpagesat — Korrik 2026** shfaqi 72 rreshta dhe kolonat e orëve të rrumbullakosura, pagave, Bankë/Cash dhe Për pagesë.

Eksporti fillestar nuk kishte rresht `TOTAL`. Pas korrigjimit, skedari `Fletepagesat_Korrik_2026 (1).xlsx` u lexua drejtpërdrejt: përmban 72 rreshta pune, 13 kolona dhe rreshtin `TOTAL` me **13,982** orë normale, **641** orë shtesë, **3,818,050.00 Lek** bruto/neto/për pagesë, **2,154,771.00 Lek** Bankë dhe **1,775,450.00 Lek** Cash.

Butoni PDF u testua në Korrik 2026 dhe krijoi `Fletepagesat_Korrik_2026.pdf` me madhësi 210,139 byte, duke konfirmuar që eksporti PDF aktivizohet pa gabim.

Veprimi **Print Preview** u aktivizua nga Fletëpagesat e Korrikut pa gabim në pamjen kryesore; dokumenti përdor të njëjtat 13 kolona dhe rreshtat e përgatitur me total nga eksporti.

## Listëprezenca

Pamja e Korrikut përdor 31 kolona ditore dhe kolonat përmbledhëse `O.Bruto`, `O.Pagesë`, `Normale`, `Shtesë`, `L`, `M`, `NM`, `NV` dhe `Total orë`. Eksporti fillestar i Excel-it përmbante vetëm 36 kolona dhe nuk ruante legjendën ose `Total orë`; korrigjimi në proces shton legjendën e konfiguruar dhe të njëjtin formulim të totalit për çdo punonjës.

## Listëpagesa Bankë

Eksporti fillestar i Bankës nuk kishte rresht `TOTALI PËR BANKË`, ndonëse pamja e sistemit e shfaqte. Pas korrigjimit, Excel-i real `Listepagesa_Banke_Korrik_2026 (1).xlsx` përmban 38 rreshta pagese me kolonat `NR`, `EMËR MBIEMËR`, `NR. LLOGARISË`, `BANKA`, `SHUMA` dhe rreshtin `TOTALI PËR BANKË`. Shuma e 38 rreshtave është **1,803,003.00 Lek** dhe përputhet saktë me totalin e eksportit.

PDF-ja `Listepagesa_Banke_Korrik_2026.pdf` u krijua me sukses pas së njëjtës rrjedhë eksporti dhe ruan formatin A4 horizontal.

Print Preview i Listëpagesës Bankë u hap pa gabim nga dokumenti i Korrikut dhe përdor të njëjtën tabelë me rreshtin `TOTALI PËR BANKË`.

## Listëpagesa Cash

Pamja **Listëpagesa Cash — Korrik 2026** u verifikua me **57** rreshta të punonjësve të rregullt, kolonat `NR`, `EMËR MBIEMËR`, `NR. LISTËPAGE`, `PAGESA CASH`, `NËNSHKRIM` dhe rreshtin `TOTALI CASH`: **1,669,800.00 Lek**. Rreshtat ngarkohen saktë pasi query-ja e periudhës përfundon; nuk u ndryshuan të dhëna burimore.

Excel-i real `Listepagesa_Cash_Korrik_2026 (1).xlsx` u lexua drejtpërdrejt: përmban të njëjtat pesë kolona, 57 rreshta pagese dhe rreshtin `TOTALI PËR CASH` me **1,669,800.00 Lek**, identik me shumën e rreshtave.

PDF-ja `Listepagesa_Cash_Korrik_2026 (1).pdf` u krijua me sukses. Ka dy faqe në **A4 horizontal**; Print Preview u hap pa gabim nga e njëjta pamje Cash.
