# Audit i rrjedhës së Pagave kundrejt Abacus v4.8

| Faza | Kërkesa e specifikimit | Gjendja cloud | Prioriteti |
|---|---|---|---|
| Logs | Pajisja lidhet përherë me Nr. Listëpage dhe lidhja parangarkohet në muajt vijues. | API ekziston; ekrani Logs ende nuk e përdor ruajtjen e lidhjeve. | Bllokues |
| Gjenerim | “KRIJO PAGAT” bllokohet kur mungojnë Logs, punonjës ose lidhje; sinjalizon pullat e pavlefshme dhe pullën e vetme. | Gjenerimi llogarit direkt rreshtat e punonjësve pa këto kontrolle. | Bllokues |
| Drekë | Ditët me dy stampa mbi prag duhet të kërkojnë konfirmim të pushimit; zgjedhja ruhet për muajin. | Zbritja bëhet automatikisht dhe nuk ka konfirmim apo ruajtje override. | Bllokues |
| Listëprezencë | Ruhen bruto, pagesë, drekë, normale, shtesë dhe kodi i ditës. | Ruhen vetëm minuta normale/shtesë dhe një shënim. | I lartë |
| Bordero | Shfaq orët bruto/pagesë/normale/shtesë, kosto OPN/OPSH, sh1/sh2, bonus dhe ndarjen bankë/cash. | Tabela aktuale është e reduktuar. | I lartë |
| Fletëpagesa | Bruto → kontribute → tatim progresiv → neto → avans → për pagesë. | Motori ekziston, por UI dhe parametrat e normave nuk janë të plota. | I lartë |
| Bankë/Cash | Formohen vetëm për pagesë pozitive, me bankë/IBAN dhe total. | Ekranet aktuale shfaqin rreshta pa kushtin e pagesës pozitive dhe pa të dhëna të lidhura të bankës. | I lartë |
| Të huajt | Ditë pune × pagë ditore + shtesa. | Nuk llogaritet si dokument i dedikuar. | Mesatar |

Rendi i zbatimit: lidhjet e ruajtura → validimi i gjenerimit → konfirmimi i drekës dhe ruajtja e detajeve të prezencës → dokumentet Bordero/Fletëpagesa/Bankë/Cash → punonjësit, parametrat dhe raportet e tjera.
