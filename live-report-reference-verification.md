# Verifikim live i dialogut të Raporteve

Data: 2026-08-23

U hap `Raporte > Magazina > Gjendja e stokut` në preview live. Dialogu tani ka listën e raporteve në kolonën e majtë, butonat `Pastro filtrat`, `Print Preview`, `Excel`, `PDF`, `Mbyll`, fushat e dokumentit, partnerit, kategorisë/artikullit, statusit, monedhës, magazinës, njësisë, shumës min/max dhe datave nga/deri. Fushat ndjekin vizualisht modelin e fotove reference me grupe gri, kufij të hollë dhe tituj grupesh.

Rezultati real i raportit të gjendjes shfaq 3 artikujt e regjistruar dhe tabelën me totalin. Ky raport i veçantë përdor kolonat Kodi, Artikulli, Stoku, Minimumi dhe Çmimi mesatar. Kostoja dhe vlera e stokut janë shtuar në raportin agregues `Raporti i Magazinës` te skeda `Raporti` e modulit Magazina, si dhe në eksportet Excel/PDF; nuk shfaqen në raportet që nuk kanë kontratë vlerësimi kostoje.

Filtrat e monedhës, llojit të dokumentit, magazinës dhe njësisë janë të lidhur me filtrimin real të rreshtave dhe ruhen në filtrat e preferuar. Testet e fundit: 198 teste kaluan, TypeScript dhe build production kaluan.


## Screenshot final pas faturës së Shitjes

Pamja live e `Magazina > Pasqyra e stokut` konfirmoi 124 Kg Ferre, `Kosto mesatare 110.00 L` dhe `Vlera e stokut 13,640.00 L`. Kjo tregon se fallback-u nga faturat reale të blerjes tani po shfaqet në UI dhe nuk mbetet më kosto zero. Pamja live e `Raporteve > Magazina` shfaq 27 raporte, kërkim, module dhe kartat e raporteve me lidhje/shigjeta.
