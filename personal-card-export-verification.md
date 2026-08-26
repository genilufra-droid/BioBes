# Verifikimi i Kartelës Personale — Korrik 2026

## Rast i verifikuar

Kartela Personale e **Mariglen Myftarit**, Nr. Listëpage **13**, u hap me të dhënat reale të periudhës **Korrik 2026**. Pamja ruan seksionet e punonjësit, përmbledhjen mujore, 31 ditët e evidencës, llogaritjen e pagës, shkallët tatimore, vërejtjet dhe dokumentet, pa ndryshuar të dhënat e punonjësit ose të periudhës.

| Kontrolli | Rezultati i vërtetuar |
| --- | --- |
| Orët e Kartelës | 18 ditë pune, 144 orë normale dhe 0 orë shtesë |
| Pagesa | 48,000.00 Lek për pagesë në Cash |
| Excel | U krijua `Kartela_13_Korrik_2026.xlsx` me fletët **Përmbledhje**, **Detaje ditore** dhe **Tatimi shkallor**, të konfiguruara horizontalisht |
| PDF | U krijua `Kartela_13_Korrik_2026 (2).pdf`, **3 faqe A4 landscape**, me seksionet ①–⑥, llogaritjen e pagës dhe tatimin shkallor |
| Print Preview | U hap pa gabim nga Kartela Personale dhe përdor format A4 horizontal |

PDF-ja e plotë përfshin identitetin e punonjësit, përmbledhjen mujore, tabelën ditore, llogaritjen e pagës, tatimin shkallor, vërejtjet dhe listën e dokumenteve. Vlerat pa dokumente ose pa vërejtje paraqiten qartë, pa krijuar të dhëna artificiale.

## Kontrollet teknike

U ekzekutuan **149 teste Vitest**, kontrolli TypeScript dhe build-i i prodhimit pa gabime. Verifikimi i dokumenteve të ngarkuara reale mbetet detyrë më vete, pasi nuk ka dokument të tillë të disponueshëm në të dhënat aktive.

## Krahasimi me referencën HTML 5.11

Krahasimi u bë me implementimin `renderReportCard`, `showPersonalCard` dhe `exportPersonalCardExcel` të referencës HTML 5.11. Cloud ruan rrjedhën e njëjtë të kërkimit të punonjësit, hapjes së kartelës, analitikës dhe eksportit.

| Elementi | HTML 5.11 | Cloud i verifikuar |
| --- | --- | --- |
| Struktura e kartelës | Seksionet ①–⑥ | Seksionet ①–⑥, përfshirë vërejtjet dhe dokumentet |
| Evidenca ditore | 31 ditë, total orësh, normale, shtesë, pushim dhe status | Të njëjtat kolona dhe rreshti TOTAL, me orë të rrumbullakosura |
| Llogaritja e pagës | Orë, tarifë, bruto, sigurime, bazë tatimore, TAP, neto, avans, për pagesë | E njëjta rrjedhë e llogaritjes, plus tabela e plotë e shkallëve tatimore në PDF/Excel |
| Excel | Përmbledhje, detaje ditore, tatim | Të njëjtat tre fletë: **Përmbledhje**, **Detaje ditore**, **Tatimi shkallor** |
| Print / PDF | Printim nga dokumenti i kartelës | Print Preview u hap pa gabim; PDF-ja e dedikuar A4 horizontal ka 3 faqe dhe përfshin të gjitha seksionet |

Dokumenti që ndërton Print Preview u kontrollua pa ndryshuar të dhënat: përmban emrin e punonjësit, të gjashtë seksionet ①–⑥ dhe rregullin `@page{size:A4 landscape;margin:10mm}`. Automatizimi i hapjes së dialogut të printimit/popup-it kërkon kontroll të mëtejshëm në browser; kjo mbetet e shënuar si detyrë e hapur në `todo.md`. Përputhja funksionale e strukturës së dokumentit u konfirmua pa përdorur të dhëna të simuluara.
