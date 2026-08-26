# Verifikim Porosi → Ngarkesa — 23/08/2026

U kontrollua moduli Blerje/Porositë dhe moduli Ngarkesa në kompaninë aktive. Porositë ekzistuese 69 dhe 69-ANULUAR-1 janë `IN_PROGRESS` dhe nuk u ndryshuan, ndërsa regjistri Ngarkesa hapet normalisht dhe nuk kishte rreshta të krijuar nga porosi të ngarkuara. Për të mos futur të dhëna prove në kompaninë reale, workflow-i u verifikua me testet e rregullave dhe me kontrollin e query-t: çdo porosi blerjeje me `operationalStatus = LOADED` krijon vetëm një ngarkesë me numër të njëjtë, në `companyId` të porosisë, dhe statusi i saj shfaqet në UI si `Ngarkuar`. Krijimi manual i një ngarkese me të njëjtin numër në të njëjtën kompani bllokohet.

Kontrollet automatike: 48 skedarë testesh, 166 teste të kaluara, TypeScript pa gabime dhe build i prodhimit pa gabime. Testi live i ndryshimit real të statusit mbetet për t’u kryer me një porosi që përdoruesi zgjedh ta kalojë në `Ngarkuar`.

## Arkiva e dokumenteve — verifikim live

Pas restart-it, regjistri shfaqi ngarkesën 70 me statusin **Ngarkuar** dhe u hap dialogu i detajeve. Dialogu shfaq nënmodulin **Dokumentet e ngarkesës**, kategoritë Faturë, CMR/Transport, Certifikatë origjine, Fitosanitare, Doganë, Foto plombe dhe Tjetër, si dhe butonin **Shto dokument**. Në këtë ngarkesë nuk kishte ende skedarë, ndaj nuk u ngarkua dokument prove pa kërkesë të përdoruesit. API-ja dhe UI-ja janë të lidhura; dokumentet e ardhshme do të ruhen në S3 dhe metadata në databazë.
