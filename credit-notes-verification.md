# Verifikimi — Notat e Kreditit

Data e kontrollit: 20 gusht 2026.

Faqja `/credit-notes` u kontrollua në preview desktop. Regjistri shfaq kolonat Nr., Data, Lloji, Fatura Burimore, Partneri, Shuma, TVSH, Arsyeja dhe Statusi, së bashku me kërkim të menjëhershëm, krijim dokumenti dhe veprime Excel, PDF dhe Print Preview.

Ruajtja kërkon zgjedhjen e faturës burimore. Backend-i verifikon që fatura i përket kompanisë aktive dhe e merr vetë numrin e faturës dhe partnerin nga dokumenti burimor.

Statusi fillestar ruhet si Draft. Nga forma e plotë e dokumentit, Draft-i mund të postohet ose anulohet; të dy veprimet regjistrohen në audit. Një dokument i postuar ose anuluar nuk mund të ndryshojë sërish status.
