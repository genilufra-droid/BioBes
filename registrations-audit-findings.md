## Verifikimi i fundit

Workspace-i `/registrations` u verifikua në desktop dhe mobile me regjistra realë. Kartat shfaqin numrin real të rreshtave për shitje, blerje, lëvizje magazine, kontabilitet dhe pagesa. Tabela shfaq kërkim, total dhe indikatorë sortimi në kolona; faturat e shitjes dhe blerjes kanë shigjetë/lidhje me parametrin real `openInvoice`. Verifikimi i linkut të faturës së blerjes hapi dokumentin full-screen A4. Accounting u kontrollua me `openEntry`/`openPayment`; route-i tani vendos tab-in përkatës dhe zgjedh dokumentin kur ID-ja ekziston. Mbetet të standardizohet full-screen-i për dialogët kontabël dhe të verifikohet CRUD/postimi i çdo regjistri nga workspace-i.
## Gjetje reale nga kontrolli live

Në `/registrations`, workspace-i hapet realisht dhe kartat ngarkohen, por regjistri i shitjeve shfaq të njëjtin dokument disa herë: për shembull dokumenti 697 dhe dokumentet e tjera përsëriten në rreshta të njëpasnjëshëm me të njëjtën datë, partner, monedhë dhe vlerë. Kjo duhet korrigjuar si deduplikim/agregim në burimin e Regjistrimeve; nuk do të konsiderohet mbyllje e auditimit pa u rregulluar. Hapja me `openInvoice` duhet të testohet mbi një rresht unik, pastaj mbyllja duhet të kthejë përdoruesin te regjistri.
## Test real i draftit 7067

Nga route-i `purchase-invoices?tab=invoices&openInvoice=180001`, drafti real 7067 u hap në dokument full-screen A4. Toolbar-i real shfaq `Mbyll`, `Paguaj Cash`, `Paguaj Bankë`, `Më vonë`, `Fshi`, `Excel`, `PDF`, `Print` dhe statusin `Draft`. Kjo konfirmon hapjen dhe veprimet e dokumentit; nuk u krye asnjë veprim shkatërrues mbi të dhënat reale. Për testin e ndryshimit të statusit duhet përdorur vetëm një draft që përdoruesi autorizon ose një draft i veçantë prove, jo të fshihet/anulohet pa konfirmim.
## Verifikimi i veprimit të statusit

Me autorizim të përdoruesit u përdor drafti real i blerjes 7067 (`id=180001`). Veprimi `Paguaj Cash` u krye me sukses. Sistemi shfaqi njoftimin se pagesa u postua dhe fatura kaloi te faturat e paguara. Pas kthimit te regjistri, dokumenti 7067 u reflektua si `E paguar`; përmbledhja ndryshoi nga 343.60 L të paguara në 463.60 L dhe pagesat u rritën nga 6 në 7. Nuk u krye fshirje ose anulim.
## Referenca e videos Alpha

Playlista zyrtare `Alpha Platinum Business` përmban videon `Moduli i Shitjeve` (12:03) dhe video të veçanta për Eksport/Import, Konfigurimet, Likuiditetet dhe Inventarin. Për ambientin kryesor të shitjeve, pamja e videos tregon një sidebar të majtë me modulet, një panel procesesh me ikona dhe shigjeta, një regjistër dokumentesh në të djathtë me filtra në krye, si dhe raporte/grafikë poshtë. Përshkrimi i videos thotë se moduli përfshin regjistrimet përkatëse për çdo ambient dhe në shitje përfshin faturat me artikuj dhe pa artikuj. Këto janë kriteret e layout-it që duhet të pasqyrojë Regjistrime; nuk mjafton vetëm një tabelë me karta.
## Korrigjimi vizual i grid-it

Screenshot-i desktop pas korrigjimit konfirmoi që kolonat Dokumenti, Data, Partneri, Monedha, Vlera dhe Statusi tani janë qeliza të veçanta dhe rreshtohen me header-in; shigjeta e dokumentit dhe `Hap` janë të dukshme. Në mobile, workspace-i ruan toolbar-in dhe workflow-n, ndërsa regjistri shfaqet me scroll horizontal për kolonat e dendura Alpha. Ky është kompromis responsive i nevojshëm për të mos fshehur të dhënat operative.
