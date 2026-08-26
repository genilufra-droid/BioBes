# Verifikim i raporteve reference të Blerjeve

## Dokumenti testues

U krijua në kompaninë aktive një faturë blerjeje draft me furnitorin **Ferre Geni** dhe të dhënat e mëposhtme:

| Fusha | Vlera |
|---|---:|
| Numri i faturës | TEST-FG-20260823 |
| Data | 23/08/2026 |
| Furnitori | Ferre Geni |
| Kodi i furnitorit | 120001 |
| Artikulli | Ferre |
| Sasia | 25 Kg |
| Çmimi | 4.00 L |
| Vlera pa TVSH | 100.00 L |
| TVSH | 0.00 L |
| Vlera me TVSH | 100.00 L |
| Referenca e inventarit | TEST-FG-REF |
| Statusi i pagesës | E papaguar |

Pas ruajtjes, regjistri i faturave të blerjes u rrit nga 5 në 6 rreshta dhe dokumenti i ri u shfaq në krye të listës.

## Rezultatet sipas raportit

| Raporti reference | Rezultati i testit | Gjendja |
|---|---|---|
| Kartela e Furnitorit | Dokumenti TEST-FG-20260823 u shfaq si rreshti i parë; furnitori Ferre Geni u përfshi në kokën e raportit; 6 rreshta gjithsej | Kalon |
| Kartela e Furnitorit — Formati 3 | Dokumenti i ri u shfaq në formatin e thjeshtë reference; 6 rreshta dhe kolonat e formatit u ruajtën | Kalon |
| Furnitorët me maturim | Dokumenti TEST-FG-20260823 u shfaq me datën 23/08/2026 dhe fushat e maturimit u gjeneruan | Kalon |
| Situacioni i Furnitorëve sipas Kategorisë | Ferre Geni u shfaq si furnitor më vete me monedhën ALL; agregimi përfshiu vlerën e faturës | Kalon |
| Regjistri i Doganimit të Importeve | Raporti shfaq totalin e agreguar, por nuk krijon rresht doganimi për faturën e testit sepse dokumenti nuk ka numër/datë doganimi, transport, siguracion ose vlera doganore | Kërkon dokument doganor për test të plotë |

## Përfundim

Mapping-u i furnitorit funksionon: `supplierId = 120001` lidhet me emrin **Ferre Geni**, edhe kur fusha e vjetër `supplierName` është bosh. Blerja e re shfaqet në katër raportet reference të bazuara në faturat dhe furnitorët. Raporti i doganimit sillet si raport i specializuar dhe kërkon fusha doganore të plotësuara për të prodhuar rresht të detajuar; me faturën aktuale ai shfaq vetëm agregimin, jo një rresht doganimi.
