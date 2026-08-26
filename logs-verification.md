# Verifikimi i Logs — Gusht 2026

Skedari burimor `001_2026_8_MON.XLS`, HTML-i referencë dhe parafytyrimi cloud u krahasuan me të njëjtat ID pajisjeje dhe ditë të lexuara.

| Kontrolli | Burimi Excel | HTML | Cloud | Rezultati |
|---|---:|---:|---:|---|
| Periudha | Gusht 2026 | Gusht 2026 | Gusht 2026 | Përputhet |
| Punonjës / ID pajisjeje | 80 | 80 | 80 | Përputhet |
| Regjistra ditorë me stampime | 784 | 784 | 784 | Përputhet |
| Stampime të lexuara nga burimi | 1,477 | I ruan në parafytyrimin e papërpunuar | I ruan në parafytyrimin e papërpunuar | Përputhet me parser-in e përbashkët |
| Rreshtat fillestarë | 2, 3, 4, 5, 6 | 2, 3, 4, 5, 6 | 2, 3, 4, 5, 6 | Përputhet |
| Rreshtat përfundimtarë | 81, 82, 83, 66, 1 | 81, 82, 83, 66, 1 | 81, 82, 83, 66, 1 | Përputhet |

Cloud-i lidh punonjësit ekzistues sipas ID-së së pajisjes dhe i shfaq si `LIDHUR`; HTML-i referencë pa të dhëna të ruajtura i shfaq të njëjtët rreshta si `I RI`. Ky është ndryshim statusi i pritshëm, jo ndryshim i Logs.

## Paraqitja e orëve — Gusht 2026

Kartela Personale e punonjësit `2 · ardian` u verifikua në cloud. Qelizat ditore shfaqin vetëm orët e plota me shtesën si indeks, për shembull `8⁴`; totalet vazhdojnë të shfaqin `118` orë normale dhe `11` orë shtesë veçmas. Shënimet ditore shfaqin vetëm burimin `Logs 2`, pa minuta, ndërsa minutat ruhen në bazë për llogaritje.
