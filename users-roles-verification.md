# Verifikimi — Përdoruesit dhe Rolet

Data e kontrollit: 20 gusht 2026.

Faqja `/users-roles` u kontrollua në preview desktop. Ajo ngarkon anëtarët e kompanisë aktive, shfaq rolin global dhe rolin e kompanisë, ofron kërkim të menjëhershëm dhe hap formën e plotë të përdoruesit me Excel, PDF dhe Print Preview.

Administratorët dhe pronarët mund të caktojnë drejtpërdrejt rolet Administrator, Përdorues ose Lexues. Roli Pronar është i mbrojtur; ndryshimet e roleve ruhen edhe në audit.

Butoni **Shto përdorues** hap panelin full-screen me Live Search sipas emrit ose email-it të një përdoruesi të regjistruar. Përdoruesi lidhet me kompaninë me rol të drejtpërdrejtë; një anëtar jo-pronar mund të hiqet me konfirmim. Backend-i bllokon heqjen e pronarit ose të përdoruesit aktiv dhe regjistron edhe këto veprime në audit.

Rrjedha fund-më-fund u provua pa lënë të dhëna testimi: u gjet përdoruesi real i dytë, u lidh me kompaninë si Lexues, iu ndryshua roli në Administrator, u hoq nga kompania dhe u verifikua bllokimi i heqjes së pronarit. Verifikimi përdori të njëjtën kontratë tRPC të UI-së dhe krijoi hyrjet përkatëse në Audit Log.

U provua shprehimisht edhe mbrojtja e përdoruesit aktiv: një anëtar Administrator tentoi të hiqte veten nga kompania dhe API-ja e bllokoi me `FORBIDDEN`. Testi pastroi lidhjen e përkohshme në fund.

Kontrolli mobile në 375 px konfirmoi hyrjen e dukshme **Shto përdorues**, kërkimin dhe eksportet; tabela e anëtarëve ruan lëvizjen horizontale për kolonat shtesë.

Verifikimi i plotë RBAC konfirmoi që Lexuesi mund të lexojë regjistrat e Pagesave dhe Notave të Kreditit, por bllokohet me `FORBIDDEN` nga krijimi, postimi, anulimi dhe fshirja e pagesës, si edhe krijimi dhe postimi i Notës së Kreditit. Testi përdori përdoruesin real të dytë dhe pastroi lidhjen e përkohshme.
