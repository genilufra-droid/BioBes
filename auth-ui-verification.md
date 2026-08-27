# Verifikim vizual i hyrjes lokale

Data: 2026-08-27

Rrugët `/login`, `/register`, `/activate-local-account`, `/forgot-password` dhe `/change-password` u hapën në desktop dhe mobile. Pamjet treguan fusha të lexueshme, veprime të qarta dhe navigim vetëm me llogari lokale; nuk shfaqet buton ose redirect i Manus në këto rrjedha.

Regjistrimi kërkon emër dhe ndërmarrje dhe shpjegon izolimin e të dhënave. Aktivizimi i pronarit kërkon email, sekret setup-i dhe konfirmim fjalëkalimi. Ndihma për fjalëkalim shpjegon sinqerisht se reset-i me email nuk aktivizohet pa kanal të verifikuar dërgimi.

## Kontroll publik pas checkpoint-it

Domaini publik u kontrollua më 2026-08-27 pas checkpoint-it `1d0822ab`. Rrënja ende shfaqi ekranin e vjetër me butonin `Hyr në sistem`, ndërsa `/activate-local-account` dha 404. Kjo tregon se publikimi i vjetër ose cache-i nuk kishte marrë bundle-in e checkpoint-it; kërkohet diagnostikim i deployment-it përpara se hyrja lokale të deklarohet e arritshme për përdoruesin.

Pas checkpoint-it `4c521ee8` dhe konfirmimit të deployment-it, `https://genitcloud-6uxcgqji.manus.space/activate-local-account` u hap me sukses. U verifikuan publikisht fusha Email, Sekreti i setup-it, Fjalëkalimi, Konfirmo fjalëkalimin dhe butoni `Aktivizo dhe hyr`; nuk u shfaq redirect drejt Manus.
