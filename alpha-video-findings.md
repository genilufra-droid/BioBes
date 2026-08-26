## Burim i rishikuar: playlista Alpha Platinum Business

Playlistë: https://youtube.com/playlist?list=PLE41B725C42DE1F68

Nga lista e videos u konfirmua se playlist-a ka 13 video dhe përfshin videon `Konfigurimet për mënyrën e të punuarit në Alpha Business` (10:45), URL: https://www.youtube.com/watch?v=Q_AJHvpbmZ0&list=PLE41B725C42DE1F68&index=4 dhe videon `Administrimi menusë Skedarë` (10:05), URL: https://www.youtube.com/watch?v=Pf4jEJIRmLs&list=PLE41B725C42DE1F68&index=5. Për modelin e Klientit/Furnitorit, auditimi duhet të kryhet brenda videos së Konfigurimeve, duke ndjekur ekranin e katalogut dhe hapjen e skedës së partnerit, jo vetëm pamjen e listës së partnerëve.

Titujt e konfirmuar të playlistës: `Moduli i Shitjeve`, `Moduli i Eksport/Importit të të dhënave`, `Konfigurimet për mënyrën e të punuarit në Alpha Business`, `Moduli i Aktiveve Afatgjata`, `Moduli i Likuiditeteve`, `Moduli Inventarit`, `Moduli i Prodhimit` dhe video të mbylljes së vitit ushtrimor.
## Burim i dytë: Moduli i Shitjeve

Video: https://www.youtube.com/watch?v=xyyWKvF7YIk

Videoja nuk shfaq formularin e plotë të krijimit të Klientit/Furnitorit. Ajo shfaq dritaren reale `Kerkim Kliente/Furnitore`, e hapur me ikonën e lupës pranë fushës Klient ose Kodi Klient/Furnitor. Rrjedha e dritares është: sipër fusha Kodi, Emri, Mbiemri, Monedha dhe Nipt; në të djathtë checkbox `Kerko sapo shkruaj` dhe butoni `Kerko`; në qendër grid me kolonat Kodi, Emri, Mbiemri, Nipt; poshtë komandat `Ok`, `Mbyll` dhe `Cil Llogari te re`. Butoni i krijimit të llogarisë së re përmendet por nuk klikohet në video, ndaj forma e plotë e regjistrimit nuk është e verifikueshme nga kjo video.

Për implementim të sigurt, modeli duhet të ndajë dy rrjedha: (1) lista/katalogu Klientë-Furnitor me toolbar dhe filtra; (2) lookup modal me lupë, kërkim, grid, përzgjedhje me Ok, Mbyll dhe hyrje për llogari të re. Nuk duhet të pretendohet 1:1 për fushat e formularit të krijimit pa pamje reale të atij formulari.
## Manuali PDF DOC-20260824-WA0032.pdf — kontrolli fillestar

U verifikuan faqet 1–5 të manualit. Këto faqe përmbajnë vetëm kopertinën, faqet hyrëse dhe hyrjen e përgjithshme të manualit Alpha Business; ende nuk shfaqin modelin e Klientit/Furnitorit. Hapi i radhës është kërkimi i faqeve ku përmenden `Klient`, `Furnitor`, `Kerkim Kliente/Furnitore` ose rrjedha `Cil Llogari te re` brenda manualit.
## Manuali PDF — kapitulli 05, çelja e Klientit

Manuali e përcakton rrjedhën: Konfigurime → Klientë/Furnitorë → lista e partnerëve → butoni I ri. Formulari hapet me tabin `Të përgjithshme`; Figura 5.2 tregon identifikimin me kod/emër dhe zgjedhjen e llojit.

Fushat e tabit `Të përgjithshme`, sipas rendit të manualit, janë: `Kodi` (unik dhe nuk ndryshohet më vonë), `Lloji` (Klient ose Furnitor; për çeljen e klientit zgjidhet Klient), `Titulli` (person fizik, sh.p.k., shoqëri anonime, etj.), `Ndërmarrja`, `Nipt`, `Emri`, `Mbiemri`, `I modifikueshëm`, `Kategoria 1`, `Kategoria 2`, `Kategoria 3`, `Nivel çmimi`, `Kategori maturimi`, `Ditë maturimi`, `Kategori zbritje`, `Zbritja në %`, `Zbritje analitike artikulli`, `Maturim bllokues`, `Limiti i kredisë — paralajmërim`, `Limiti i kredisë — blloko`, `Aktiv` dhe `Autorizimi`.

Manuali përshkruan gjithashtu tabin `Kontakti` për adresën dhe kontaktin. Formulari aktual i cloud-it ka vetëm Kodi, Emri, NIPT, Telefon, Email, Adresë dhe Qytet; prandaj nuk është 1:1 me manualin. Duhet të shtohen të paktën tab-et Të përgjithshme dhe Kontakti, fusha Lloji/Titulli/Ndërmarrja/Emri/Mbiemri, kategoritë, niveli i çmimit, maturimi, zbritjet, kufijtë e kredisë, Aktiv dhe Autorizimi, ndërsa fushat që nuk kanë model backend duhet të lidhen me skemën para se të pretendohet ruajtje reale.
## Standardi global i burimeve

Për këtë projekt do të përdoret ky rregull: manuali PDF `DOC-20260824-WA0032.pdf` është autoriteti për pamjen, layout-in, rendin e fushave, emrat e kontrolleve, tab-et dhe mënyrën e hapjes së dritareve. Videot e playlistës janë autoriteti për rrjedhën operative, rendin e veprimeve dhe mënyrën si përdoret sistemi gjatë dokumenteve dhe moduleve. Kur një pamje nuk dokumentohet nga burimi përkatës, ajo do të shënohet si e paverifikuar dhe nuk do të deklarohet si 1:1.
## Manuali PDF — verifikimi vizual i faqes 71–74 për modelin e Klientit

Nga pamja reale e manualit, dritarja e Klientit nuk është dialog modern cloud, por një dritare klasike desktop me titlebar, toolbar sipër dhe tab-e të dukshme horizontalisht: `Të përgjithshme`, `Kontakti`, `Kontabiliteti` dhe `Fusha shtesë`.

Në toolbar sipër shihen komandat klasike `Mbyll`, `Ruaj`, `Dok` dhe `Ndihmë`. Kjo do të thotë se modeli aktual në cloud ende nuk është 1:1, sepse i mungon toolbar-i i plotë i sipërm dhe tab-et funksionale sipas manualit.

Faqja 71 (Figura 5.2) konfirmon rendin dhe pozicionimin vizual të tabit `Të përgjithshme`: kolona e majtë fillon me `Kodi`, `Titulli`, `Ndërmarrja`, `Emri`, `Kategoria 1`, `Nivel Çmimi`, `Kategori Maturimi`, `Kategori Zbritje`, `Autorizimi`, `Limiti Kredie Paralajmërim`; kolona e djathtë përmban `Lloji`, checkbox `I modifikueshëm`, `NIPT`, `Mbiemri`, `Kategoria 2`, `Kategoria 3`, zgjedhësin e nivelit, `Ditë Maturimi`, `Zbritja në %`, checkbox `Maturim Bllokues`, `Blloko` dhe checkbox `Aktiv`.

Faqja 74 (Figura 5.3) konfirmon tabin `Kontakti` me rend vizual: `Qyteti`, `Zona`, `Adresa`, `Telefon`, `Fax`, `Email`, `Nr i Shasise`, `Targa`, `Banka`, `Llogari Bankare` dhe `Agjenti`. Kjo duhet të zbatohet si tab i veçantë, jo si vazhdim i thjeshtë i formës bazë.

Për rindërtim 1:1, modelet Klient/Furnitor duhet të kalojnë në dritare Alpha me toolbar klasik sipër, tab-strip real dhe layout dy-kolonash që ndjek figurat 5.2 dhe 5.3.
## Manuali PDF — verifikimi vizual i faqes 102–104 për modelin e Artikullit afatshkurtër

Pamja reale e artikullit qarkullues është një dritare klasike desktop me titlebar dhe toolbar sipër me komandat `Mbyll`, `Ruaj`, `Dok` dhe `Ndihmë`, njësoj si te modeli i Klientit. Tab-et e dukshme janë `Kartela`, `Llogaritë` dhe `Fusha shtesë`.

Figura 6.5 tregon që tabi `Kartela` ka një layout shumë më të ngjeshur dhe më të pasur se forma aktuale cloud. Sipër, seksioni `Identifikuese` përfshin në rreshtin e parë `Kodi`, `Referenca`, `Kod Bar` dhe `Kodi Doganor`; poshtë tyre është `Përshkrimi`, ndërsa në të djathtë shfaqen checkbox-et `Aktiv` dhe `Me detajime`.

Seksioni i poshtëm është me dy kolona të dendura. Nga e majta duken `Klasa`, `Inventar`, `Grupi`, `NenGrupi`, `Kodifikimi`, `Furnitori` dhe checkbox `Shperndarje Shpenzimesh`. Në të djathtë duken `Magazina e Çeljes`, `Njësia Bazë`, `Njësia II`, `Koeficienti`, `Metoda Kosto`, `Pesha` me `Bruto` dhe `Neto`, `Kutij / Gjendje` me `Min` dhe `Max`, `Komenti`, `Vendndodhja`, `Origj. Malli`, `Niveli i TVSH` dhe butoni `Cmimet e Shitjes`.

Kjo e bën të qartë se forma aktuale e Artikullit në cloud nuk është ende 1:1: as rendi, as tab-et dhe as toolbar-i nuk përputhen plotësisht me figurën 6.5 të manualit. Rindërtimi duhet të kalojë në dritare Alpha me tab-et reale `Kartela`, `Llogaritë`, `Fusha shtesë` dhe me grid-in e ngjeshur të fushave sipas kësaj figure.
