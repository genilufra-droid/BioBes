# Audit i formave Alpha — Artikuj, Klientë, Furnitorë

## Gjetje nga pamjet e disponueshme

Pamja `pasted_file_KBEXzj_image.png` paraqet një faqe cloud të Partnerëve me sidebar vjollcë, tab-e Furnitorë/Klientë, butona Eksporto dhe krijim të ri; ajo nuk është forma desktop Alpha e krijimit.

Pamja `pasted_file_EOw1R9_image.png` paraqet një workspace të importit të Pagave dhe nuk përdoret si referencë për Artikuj, Klientë ose Furnitorë. Moduli Pagat duhet të mbetet jashtë këtij auditimi.

## Gjendja aktuale e kodit

`Products.tsx` ka dialog Alpha për `Artikull i Ri — Regjistrim`, titlebar, toolbar `Mbyll/Ruaj/Dok/Ndihmë`, shirita tab-esh dhe `AlphaArticleFields` me tab-et `Kartela`, `Llogaritë`, `Fusha shtesë`. Ka CRUD real për krijim, editim dhe fshirje.

`Partners.tsx` ka dialogë Alpha për `Furnitor i Ri — Regjistrim` dhe `Klient i Ri — Regjistrim`, por tab-et e header-it shfaqen si tekst statik ndërsa `AlphaPartnerFields` ka tab-e funksionale `Të përgjithshme`, `Kontakti`, `Kontabiliteti`, `Fusha shtesë`. Forma përfshin CRUD real dhe profileData.

## Pika që duhet verifikuar para implementimit

Duhet gjetur pamja e saktë Alpha/manuali për formën e krijimit, sepse skedari PDF i disponueshëm në upload është i lidhur me Pagat dhe jo me katalogët Alpha. Krahasimi final duhet të mbulojë rendin e fushave, madhësinë e dritares, toolbar-in, tab-et funksionale, butonat dhe ruajtjen pa humbur vlerat.

## Verifikim live i listave

Preview-t live konfirmojnë se Artikujt, Furnitorët dhe Klientët hapen si workspaces Alpha me titlebar, toolbar, buton të kuq mbylljeje dhe veprime reale. Forma e krijimit nuk shfaqet automatikisht në screenshot-in e listës; ajo hapet me komandat `I ri`, `Furnitor i Ri` dhe `Klient i Ri`. Për të deklaruar përputhje 1:1 me PDF-in duhet të krahasohet pamja kur dialogu është realisht i hapur, jo vetëm lista.

Screenshot-et e disponueshme të upload-it të kontrolluara deri tani përfshijnë një listë cloud Partnerësh dhe një tabelë Excel; nuk u gjet ende një pamje e qartë e formularit desktop Alpha të Artikullit/Klientit/Furnitorit.

## Verifikim full-screen sipas screenshot-it të fundit

Dialogët e Klientit dhe Furnitorit tani zënë të gjithë viewport-in në desktop dhe mobile. Toolbar-i qëndron poshtë titlebar-it, mbyllja është në këndin e sipërm, dhe tab-et Alpha janë të vetmet tab-e të formularit.

Forma e Artikullit tani hapet gjithashtu full-screen me titlebar `Artikull i Ri — Regjistrim`, toolbar `Mbyll/Ruaj/Dok/Ndihmë`, tab-et `Kartela/Llogaritë/Fusha shtesë`, dhe fushat e artikullit në layout të dendur. Screenshot-i i desktopit konfirmoi se forma nuk është më modal i vogël mbi listë.
