# Skenari 2 — Listëprezenca Manuale, Korrik 2026

## Rrjedha e verifikuar

Pas Reset-it të kompanisë aktive u krijua periudha Korrik 2026, u importua workbook-u real `07.PAGATMUAJIKORRIK2026.xlsx`, u ruajtën të dhënat në databazë dhe u gjenerua Borderoja Manuale. Importi lexoi sheet-in `ORET E PUNES`, krijoi ose lidhi punonjësit pa dublikime dhe lexoi kostot, bonuset dhe ndarjen Bankë/Cash nga sheet-i `PAGAT KORRIK 2026`.

## Kontrolli i të dhënave

| Kontrolli | Rezultati |
|---|---:|
| Punonjës realë në `ORET E PUNES` | 72 |
| Punonjës në Borderonë normale Cloud | 64 |
| Punonjës të huaj të ndarë në databazë | 8 |
| Rreshta prezence nga importi | 2,077 qeliza të lexuara në UI |
| Orë ditore nga modeli (`ORET E PUNES`) | 14,623 |
| OPN nga modeli | 13,982 |
| OJO nga modeli | 641 |
| OPN në Borderonë normale Cloud | 12,318 |
| OJO në Borderonë normale Cloud | 497 |

OPN/OJO të Borderos normale përputhen me sheet-in `PAGAT KORRIK 2026`; ndryshimi nga totalet e `ORET E PUNES` vjen nga tetë punonjësit e huaj, të cilët nuk hyjnë në Borderonë normale.

## Krahasimi numerik i Borderos normale

| Metrika | Modeli Excel, rreshtat normalë | Cloud Manual | Diferenca |
|---|---:|---:|---:|
| Orë normale | 12,318 | 12,318 | 0 |
| Orë shtesë | 497 | 497 | 0 |
| Shuma normale | 2,031,420 ALL | 2,031,420 ALL | 0 |
| Shuma shtesë | 130,750 ALL | 130,750 ALL | 0 |
| Bonus i kombinuar | 1,309,703 ALL | 1,309,703 ALL | 0 |
| Total | 3,471,873 ALL | 3,471,873 ALL | 0 |
| Bankë, pa rreshtin agregat të huajve | 1,847,403 ALL | 1,847,403 ALL | 0 |
| Cash | 1,675,400 ALL | 1,675,400 ALL | 0 |

Krahasimi me 63 emrat e përbashkët është pa diferenca në vlerat e orëve, kostove, shumave, bonusit, totalit dhe pagesave. Rasti `BESE RABIA`/`BESE RABIJA` është vetëm ndryshim shkrimi i emrit dhe nuk ndryshon shumën. Rreshti `PUNETORET TE HUAJ` është rresht agregat i modelit dhe nuk është pjesë e Borderos normale.

Gjatë kontrollit u gjet një mospërputhje vetëm në paraqitjen e kolonës `KOSTO OPSH` për `NOVRUS PEQINI`: modeli shfaq 250 ALL edhe me 0 orë shtesë, ndërsa Cloud shfaqte 0. Kjo u korrigjua që Borderoja, Excel-i, PDF-ja dhe Print Preview të marrin normën OPSH nga regjistri i punonjësit edhe kur orët shtesë janë zero. Shuma (2) mbetet 0 ALL, si në model.

## Fleta TE HUAJT

Workbook-u burimor ka edhe sheet-in `TE HUAJT`, me totalin e vet të modelit: 8 punonjës me të dhëna pagash dhe një rresht pa ditë pune; summary i sheet-it tregon 351,768 ALL Bankë, 105,649.50 ALL Cash dhe 40,000 ALL bonus. Kontrata zyrtare e Listëprezencës Manuale aktualisht importon `ORET E PUNES` dhe `PAGAT [MUAJI]`, ndërsa rreshtat agregatë të huajve injorohen për të mos krijuar punonjës fiktivë. Për këtë arsye, kontrolli 100% i kryer këtu është për Borderon normale; importi i detajuar i sheet-it `TE HUAJT` mbetet workflow i veçantë për ta bërë workbook-un e plotë identik edhe në modulin Të Huajt.

## Gjendja pas verifikimit

Importi, ruajtja, rifreskimi i grid-it, përmbledhja, legjenda dhe gjenerimi i Borderos Manuale u kryen pa bllokim. Testet automatike, TypeScript dhe build-i kaluan pas korrigjimit të normës OPSH pa orë shtesë.
