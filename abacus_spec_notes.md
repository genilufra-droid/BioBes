# Kërkesat Abacus për Sistemi i Pagave

**Burimi:** `/home/ubuntu/upload/Prompt_Abacus_Sistemi_Pagave_EN.pdf`, faqet 1–8, dërguar nga përdoruesi më 19 gusht 2026.

## Rrjedha kryesore

1. Ngarko skedarin biometrik Excel në formatin **List of Logs** dhe lidhe pajisjen me punonjësin.
2. Shfaq orët e papërpunuara në grid me ditët 1–31, fundjavat e theksuara dhe totalet ditore.
3. Krijo Pagat gjeneron Listëprezencë, Bordero, Fletëpagesa, listë Bankë/Cash dhe Të Huajt.
4. Raportet, kartela personale, rakordimi, printimi A4 dhe eksporti Excel përdorin të njëjtën strukturë dokumenti.

## Formati List of Logs

- Periudha lexohet nga rreshti `Period : YYYY/MM/DD ~ MM/DD`.
- Header-i i ditëve përmban të paktën pesë vlera numerike 1–31 dhe mund të fillojë në kolonën A ose B.
- Rreshti i punonjësit përmban `No :`, `Name :` dhe opsionalisht `Dept :`.
- Rreshti pasues jo bosh ka stampimet e ditës; stampimet ndahen me `/` ose rresht të ri.
- Për çdo punonjës përdoret **header-i më i afërt sipër tij**. Nuk lejohet përdorimi i një header-i global, sepse blloqet mund të kenë offset të ndryshëm.

## Rregullat e prezencës

- Dy stampime: bruto = dalje − hyrje; nëse bruto ≥ 6 orë, zbritet pushimi standard 60 minuta, përveç override-it.
- Katër ose më shumë stampime: bruto = shuma e çifteve hyrje/dalje; boshllëku mes çifteve është pushim real dhe nuk zbritet përsëri.
- Orët normale janë maksimumi 8 orë pagesë në ditë.
- Shtesat fillojnë pas fund-turnit plus grace period 30 minuta: Turni A pas 16:30, Turni B pas 17:30.
- Llogaritjet mbajnë minuta reale; rrumbullakimi bëhet vetëm në shfaqje.

## Ekranet dhe termat kërkuar

Pamjet e referencës përfshijnë: `dashboard`, `logs`, `create`, `presence`, `bordero`, `bank`, `cash`, `foreign`, `payroll`, `manual-presence`, raportet, punonjësit, lejet, gabimet, historikun, backup-in dhe parametrat. Termat në UI janë në shqip: **Listëprezenca, O.Bruto, O.Pagesë, Pushim drekë, Orë normale, Orë shtesë, Bordero, Fletëpagesat, Rakordim** dhe **Nr. listëpage**.
