## Verifikimi vizual 1

### crfurnitorkartela.pdf

PDF njëfaqësh, me layout horizontal dhe tabelë me kufij të hollë. Header-i ka vitin në të majtë, titullin e qendërzuar “KARTELA E FURNITORIT te MB”, periudhën poshtë titullit dhe fusha Furnitori, Nr Llogarie, Mon, Titulli dhe NIPTI. Tabela ndahet në “Monedhë Baze” dhe “Monedhë Llogarie”, secila me Debi, Kredi dhe Progresivi. Ka rreshta të veçantë për Gjendje në Fillim, Totali dhe Debitor/Kreditor. Footer-i ka datën majtas, “Printuar nga Alpha Platinium www.imb.al” dhe numrin e faqes djathtas.

### crmaganalizaartikujve.pdf

PDF me 3 faqe, faqja e parë e parë vizualisht është horizontalisht orientuar dhe përdor tabelë të dendur me titull “ANALIZA E ARTIKUJVE”. Header-i ka vitin, periudhën dhe kolonat e grupuara Gjendje me Pare, Hyrje, Dalje dhe Çmimi. Kolonat konkrete janë Kartela, Emërtimi, Njësia, Gjendje me Pare, Nga Blerjet (FB), Të Tjerat, Për Shitje (FS), Të Tjerat, Gjendje, Çmimi mesatar dhe Vlefta. Rreshtat kanë vlera me dy shifra dhjetore dhe footer-i përsërit datën, burimin dhe numrin e faqes. Kjo nuk është pamje e thjeshtë card; kërkon tabelë analitike me grupime kolonash dhe pagination.
## Verifikimi vizual 2

### crfurnitormaturimi.pdf

PDF njëfaqësh horizontal me titull të qendërzuar “MATURIMI I FURNITORIT”. Header-i përfshin datën e raportimit, periudhën e maturimit dhe një bllok filtri të dukshëm me datë e maturimit. Tabela ka Kod Furnitori, Emër Furnitori, Llog Furnitori, Monedhë Llogarie, Monedha, datat e dokumentit/maturimit, Tejkaluar dhe grupime të “Koha e Maturimit” në 0, 1–30, 30–60, 60–90, 90–180 dhe >, plus Totali. Raporti përdor shumë hapësirë të bardhë dhe footer standard me datë/burim/faqe.

### crshitjemarzhi.pdf

PDF me 2 faqe; faqja e parë është horizontalisht orientuar dhe ka tabelë analitike shumë të dendur me titull “MARZHI I SHITJEVE”. Kolonat janë Kartela, Emërtimi i Artikullit, Njësia, Sasia e Shitur, Kosto/Njësi, KMSH, Çmimi i shitjes, Vlera e Shitjes, Marzhi Bruto dhe Marzhi Bruto %. Tabela përdor numra me dy shifra dhjetore, vijë ndarëse të fortë para vlerës së shitjes dhe footer standard. Ky format kërkon raport me kosto reale dhe llogaritje të marzhit, jo vetëm total shitjesh.
## Verifikim live pas integrimit

Pamja live e `/reports` shfaq katalogun me 149 raporte, ndarë sipas moduleve, me kërkim global, interval datash, tab-et Blerje/Shitje/Magazina/Kontabilitet/CRM/Banka dhe shigjetat ↗ për hapjen e raportit. Integrimi i formateve të reja nuk ndryshoi navigimin ekzistues ose layout-in e katalogut.
## Verifikim vizual i dytë live

Pas checkpoint-it 46d355cb, `/reports` u hap pa gabim dhe shfaq 149 raporte, tab-et e moduleve, kërkimin, intervalin e datave dhe shigjetat e navigimit. Katalogu mbetet funksional dhe ndryshimi i pagination-it nuk ndryshoi pamjen e navigimit.
## Regjistri Analitik i Shitjeve — verifikim live

Raporti i ri hapet në dialog me titullin `Regjistri analitik i shitjeve`, filtrat reference, kërkimin brenda tabelës, butonat `Pastro filtrat`, `Print Preview`, `Excel`, `PDF` dhe mbylljen e qartë. Tabela raportoi 1 rresht real në momentin e verifikimit; layout-i i preview-t të dokumentit mbetet më i ngushtë se PDF-ja reference dhe kërkon auditim të mëtejshëm pikë për pikë.
## Kontroll live pas rinisjes së serverit

Faqja e publikuar `/reports` u ngarkua me sukses pas rinisjes. U verifikuan navigimi i moduleve, kërkimi global, filtrat e datës, tab-et Blerje/Shitje/Magazina/Kontabilitet/CRM/Banka, rivendosja dhe lista reference; katalogu shfaq 149 raporte (26 për Blerje në pamjen e kontrolluar).
## Verifikim publik pas checkpoint-it 6346159e

Publikimi i fundit u hap dhe, pas pritjes së ngarkimit, shfaq shell-in e Sistemi Genit, katalogun e Raporteve me 149 raporte, filtrat globalë dhe të datës, gjashtë modulet e raporteve, 26 raporte Blerje në pamjen aktive dhe shigjetat ↗ në çdo hyrje.
## Kartela e Artikullit — mospërputhje live pas checkpoint-it 47e3b2ec

Kontrolli live në `/reports?report=inventory_product_card_pdf` shfaqi ende modalin/renderer-in gjenerik: metadatat e artikullit dolën bosh, të tre lëvizjet u paraqitën në një tabelë të vetme dhe footer-i u shfaq si `Printuar nga Sistemi Genit Cloud`, jo si footer-i i PDF-së reference `Printuar nga Alpha Platinium www.imb.al`. Kjo nuk përputhet me PDF-në reale, e cila ka një artikull për faqe, bllok identifikimi me vlera, kolonat e sakta dhe footer-in reference. Implementimi i ri ekziston në kodin lokal, por verifikimi live tregon se duhet të kontrollohet rrjedha e të dhënave/route-it dhe të mos deklarohet ende 1:1.
## Kartela e Artikullit — verifikim live pas korrigjimit f73fbdce/48645666

Preview-i lokal në `/reports?report=inventory_product_card_pdf` tani shfaq `KARTELA ARTIKULLIT`, vlerat reale Kartela `105`, Kodbar `4545566556`, Përshkrimi `Ferre`, Njësia `Kg`, kolonat reference dhe dokumentet me shigjetë ↗. Rreshtat janë kronologjikë: IN 25 → Gjendje 25, IN 100 → Gjendje 125, OUT 1 → Gjendje 124; Totali ka Hyrje 125, Dalje 1, Gjendje finale 124 dhe Vlefta 13,640. Footer-i shfaq burimin Alpha Platinium. Filtrat UI tani kanë emërtimet kontekstuale `Artikull`, `Magazinë` dhe `Dokumenti burimor` për këtë reportKey. Mbetet krahasimi pixel-perfect i hapësirave dhe eksportit PDF real.
