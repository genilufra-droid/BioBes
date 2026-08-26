# Gjetje nga fatura_4319.pdf

PDF-ja ka **2 faqe A4 portret** dhe përdor një stil të pastër fiskal me tabela të holla gri/zi dhe tituj të qendërzuar. Kërkesa është të ruhet formati, por të hiqet QR-ja nga faqja e dytë.

Faqja 1 ka titullin `FATURË`, bllokun e shitësit me emër, adresë dhe NUIS, bllokun e të dhënave të lëshimit me datë/orë, numër fature, operator, kodin e vendit të ushtrimit të veprimtarisë dhe llojin e faturës, pastaj bllokun e blerësit me emër, adresë dhe NUIS. Vijon tabela e artikujve me kolonat: Përshkrimi i Mallit ose Shërbimit, Njësia e Matjes, Sasia, Çmimi për njësi pa TVSH, Zbritje %, Norma e TVSH, Vlera pa TVSH (sasi x çmim), TVSH (vlera), Vlera Totale. Në fund ka rreshta për Vlera pa TVSH, Vlera totale e TVSH-së dhe Totali për t'u paguar (LEK). Mbyllet me tabelën Shpërndarja e TVSH-së dhe datën/orën e krijimit së furnizimit.

Faqja 2 ka datën/orën e kryerjes së pagesës, numrin e sigurisë së lëshuesit të faturës (NSLF), numrin identifikues të veçantë të faturës (NIVF), tabelën Mënyra e pagesës me kolonat Lloji dhe Sasi (LEK), dhe në të djathtë QR code. Në formatin e kërkuar QR code duhet të mungojë, ndërsa informacioni fiskal dhe mënyra e pagesës duhet të mbeten.

Vlerat e dukshme në referencë janë në **LEK**, numrat kanë dy shifra dhjetore, TVSH-ja mund të jetë 0, dhe datat shfaqen në format lokal shqiptar. Implementimi duhet të prekë UI-në e faturës së blerjes dhe eksportet PDF/Print Preview/Excel pa ndryshuar logjikën e ruajtjes së faturës. Duhet të verifikohet nëse QR-ja ekzistuese gjenerohet në ndonjë eksport tjetër para se të hiqet vetëm nga ky format.
