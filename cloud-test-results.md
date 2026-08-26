# Rezultatet e testimit cloud

## Baseline teknik i fundit

| Kontrolli | Rezultati |
|---|---|
| Teste Vitest | 58 skedarë, 206 teste të kaluara |
| Testet e filtrimit | 10 teste të kaluara, përfshirë filtrat kolonë-për-kolonë |
| TypeScript | Pa gabime në kontrollin e tipave |
| Build production | I suksesshëm me Vite dhe esbuild |
| Preview i raporteve | 149 raporte, filtrat, modulet dhe linket ↗ u ngarkuan live |
| Baseline cloud | `b94b4617` |

## Statusi funksional

Rezultati teknik është i gjelbër, por nuk zëvendëson testimin modul më modul me të dhëna biznesi reale. Skenarët e blerjes, shitjes, stokut, valutave, pagesave, pagave, dokumenteve të ngarkesës, raporteve, multi-company dhe eksportit duhet të verifikohen veçmas sipas `cloud-test-plan.md`.

## Rregull migrimi

Nuk përgatitet ose dorëzohet paketë PHP si zëvendësim i cloud-it pa baseline të ri të ruajtur pas përfundimit të skenarëve funksionalë dhe verifikimit të regresionit.

## Ekzekutim teknik pas baseline-it

Më 23 gusht 2026 u ekzekutua sërish suite-i i plotë: 58 skedarë dhe 206 teste kaluan, bashkë me kontrollin TypeScript. Build-i production i baseline-it të mëparshëm ishte i suksesshëm. Kontrolli i logut lokal `browserConsole.log` nuk u krye sepse skedari nuk ekziston në working tree; kjo nuk u trajtua si sukses i rremë dhe duhet të verifikohet nga preview/live logs gjatë testimit funksional.

## Blloku funksional ERP 1

U ekzekutua blloku i blerjeve, shitjeve, stokut, valutave, pagesave, raporteve dhe RBAC. U përfshinë testet e `PurchaseInvoices`, `Inventory`, `currency`, `reportFiltering`, `purchase`, `sales`, `inventory`, `server/currency`, `paymentAudit`, `creditNotes` dhe `rbac.reader`. Suite-i përfundoi me 58 skedarë dhe 206 teste të kaluara. Ky rezultat mbulon kontratat automatike; verifikimi me klikime dhe të dhëna ekzistuese në browser mbetet pjesë e hapit funksional live.

## Kontrolli live i moduleve kryesore

Preview-i live u kontrollua për `/reports`, `/purchase-invoices`, `/inventory`, `/sales-invoices` dhe `/payroll`. Të pesë rrugët u renderuan me navigimin global, kërkimin përkatës dhe përmbajtjen e moduleve. U panë 149 raporte në katalog, 8 fatura blerjeje në dashboard, 3 artikuj/124 njësi në pasqyrën e magazinës, 1 faturë shitjeje dhe workspace-i i Pagave me import Logs, Print/PDF, Excel, Listëprezenca, Bordero, Bankë, Cash, Fletëpagesat dhe Listëprezencë Manuale. Ky është kontroll vizual i hyrjes së moduleve; rrjedhat e ruajtjes dhe dataset-et e filtruar duhen verifikuar me skenarë interaktivë.

## Verifikimi live pas rinisjes së serverit

Pas rinisjes, `/reports`, `/purchase-invoices`, `/inventory` dhe `/sales-invoices` u renderuan me navigimin dhe përmbajtjen kryesore. Në kapjen e parë të `/payroll` u shfaq përkohësisht mesazhi `Po hapet workspace-i...`; ky skenar nuk shënohet si i kaluar pa një kontroll pasues të ngarkimit të plotë të workspace-it dhe pa verifikuar tab-et e pagave.

## Pagat — verifikim live i dytë

Pas pritjes së ngarkimit, workspace-i i Pagave u hap plotësisht në `Ngarkimi i Logs`, me tab-et e muajve, `Shkarko pa gisht`, `Print / PDF`, `Excel`, lidhjen `Zgjidh Excel`, tabelat e pajisjeve dhe lidhjen e përhershme të punonjësve. Menyja anësore shfaq Listëprezencë, Bordero, Listëpagesa Bankë, Listëpagesa Cash, Fletëpagesat, Të Huajt dhe Listëprezencë Manuale. Ky kontroll vizual kaloi për hyrjen dhe renderimin; importi real i skedarit dhe ruajtja në databazë kërkojnë skenar me skedar përdoruesi.

## Pagat — verifikim publik me ngarkim të plotë

Faqja publike `/payroll` u ngarkua plotësisht pas pritjes. U verifikuan menytë e Dashboard, Ngarkimi i Logs, Krijo Pagat, Listëprezenca, Bordero, Listëpagesa Bankë/Cash, Fletëpagesat, Të Huajt, Listëprezencë Manuale, raportet dhe konfigurimet. Në panelin aktiv u panë butonat Shkarko pa gisht, Print/PDF, Excel dhe Zgjidh Excel. Të dhënat ishin bosh në këtë sesion, ndaj importi, lidhja e punonjësve dhe gjenerimi i pagave nuk shënohen ende si të kaluara pa skedar real përdoruesi.

## Blloku i eksporteve, raporteve, valutave dhe RBAC

U ekzekutuan testet e eksportit PDF/Excel, faturave reference, konvertimit të valutave, katalogut të raporteve, roleve të kompanisë, Viewer/RBAC dhe validimit të numrave të dokumenteve. Suite-i kaloi me 58 skedarë dhe 206 teste. Kjo konfirmon kontratat automatike të këtyre fushave; testimi live i eksportimit të një dataset-i të filtruar dhe verifikimi me dy kompani reale mbeten hapa të veçantë.

## Testim i moduleve jashtë Pagave

U ekzekutua blloku i testimit për Blerje, Shitje, Magazina, Kontabilitet/Raportet, CRM/Banka, valuta, pagesa, credit notes, dokumentet dhe filtrat. Suite-i përfundoi me 58 skedarë dhe 206 teste të kaluara. Asnjë skedar i modulit të Pagave nuk u ndryshua në këtë cikël; testet e Pagave u përfshinë vetëm nga suite-i ekzistues regresiv dhe nuk u përdorën për të ndryshuar logjikën e modulit.

## Faturat e Blerjes dhe Shitjes — gjendja aktuale live

Faturat e Blerjes shfaqin 8 fatura dhe kanë kërkim live, karta për porositë/pranimet/faturat, tab-et Faturat/Porositë/Pranimet/Kthimet/Raportet, butonat Excel, PDF dhe Faturë e re, si dhe filtrat kolonë-për-kolonë për datë, dokument, status, furnitor, artikull, sasi, çmim, TVSH, transportues, targë dhe inventar. Faturat e Shitjes shfaqin 1 faturë, kërkim live, karta për ofertat/porositë/faturat, tab-et operative, Faturë e re dhe Faturë e shpejtë; në kapjen aktuale është aktiv tab-i Ofertat me 0 rreshta. Formati vizual i hyrjes është i rregullt, por identiteti 1:1 i dokumentit të faturës, eksporti me dataset të filtruar, totalet dhe linku ↗ duhet kontrolluar duke hapur një faturë ekzistuese.

## Rikontroll pas shtyrjes së Excel-it të shitjeve

Faturat e Blerjes dhe Faturat e Shitjes u kontrolluan përsëri live pas checkpoint-it `66511c35`. Blerjet shfaqin 8 fatura dhe filtrat kolonë-për-kolonë; Shitjet shfaqin 1 faturë dhe tab-et Oferta/Porosi/Dërgesat/Kthimet/Faturat/Raportet. Pamja e kapur është hyrje e modulit dhe jo dokumenti i hapur; për këtë arsye nuk u aplikua patch i ri dhe nuk u prek Pagat.

## Module financiare dhe CRM — kontroll live

U kontrolluan live Kontabiliteti, CRM, Banka dhe Arka. Kontabiliteti shfaq regjistrimet e postuara, të ardhurat, shpenzimet, fitim/humbjen, planin e llogarive, ditarët, regjistrimet, pagesat, TVSH-në dhe raportet. CRM shfaq kërkim live, lead-e, opportunity, vlerë të hapur, aktivitete dhe veprimin `Lead i ri`. Banka shfaq balancën, pajtimet, hyrjet, ekstraktet, llogaritë, transfertat, transaksionet dhe raportet. Arka shfaq arkët, balancat, hyrjet/daljet, kërkimin, Excel, PDF, Print Preview dhe numrat me shigjetë ↗. Pamja dhe navigimi u renderuan normalisht; rrjedhat e krijimit/postimit/pajtimit kërkojnë testim interaktiv të veçantë.

## Regresion i përsëritur pa Pagat

U përsëritën testet e Blerjeve, Shitjeve, Magazinës, Valutave, CRM/Banka, Pagesave, Arkës, Notave të Kreditit, Raporteve, Eksporteve PDF/Excel, faturave reference dhe filtrave. Rezultati: 58 skedarë dhe 206 teste të kaluara. Ky është verifikim automatik regresiv; nuk përfshin krijim ose fshirje të të dhënave reale në databazë dhe nuk ndryshoi Pagat.

## Magazina — gjetje gjatë kontrollit live

Në hapjen fillestare të `/inventory` u shfaq përkohësisht gjendje bosh; pas përfundimit të ngarkimit, të dhënat reale u shfaqën: 3 artikuj të monitoruar, 124 njësi në stok, 0 alarme dhe 3 lëvizje. Tabela shfaqi Gg 0 copë, Ferre 124 Kg me kosto 110.00 L dhe vlerë 13,640.00 L, si dhe Murriz 0 kg. Kjo tregon se duhet pritur ngarkimi përpara vlerësimit të boshllëkut; nuk u aplikua patch dhe Pagat nuk u prekën.

## Regresion pas checkpoint-it të Magazinës

U përsërit regresioni për Blerje, Shitje, Magazina, Valuta, Kompani/RBAC, CRM/Banka, Pagesa, Raporte, Filtra, Eksporte dhe Fatura reference. Rezultati mbeti 58 skedarë dhe 206 teste të kaluara. Moduli i Pagave nuk u prek në kod ose në të dhëna; u ruajt vetëm si pjesë e suite-it të projektit për të zbuluar regresione aksidentale.

## Filtra, linke dhe eksporte — verifikim teknik

U verifikuan filtrat Excel-style, filtrimi i regjistrave, eksporti PDF, eksporti i regjistrit të blerjeve, faturat reference, renderer-i reference, katalogu i raporteve dhe validimi anti-duplikim i numrave. Suite-i kaloi me 58 skedarë dhe 206 teste; kontrolli TypeScript përfundoi pa gabime. Ky rezultat mbulon testet automatike dhe nuk pretendon ende përputhje pixel-perfect të të 149 raporteve.
## Kartela e Furnitorit — filtrat aktive

Pas patch-it global, modalin e Kartelës së Furnitorit e hapën fushat Furnitor/Klient, Shiko, Mbyll, Pastro, Print Preview, Excel, PDF dhe filtrat kolonë-për-kolonë. Filtrat aktive pasqyrohen në meta/header dhe në Print Preview, ndërsa rreshtat dhe totalet merren nga dataset-i i filtruar; rasti me `Furnitor / Klient: Ana` është kontrata e testuar. Kontrolli live i screenshot-it ishte para plotësimit të vlerës, ndaj verifikimi interaktiv me Ana mbetet hap i hapur.
