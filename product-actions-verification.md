# Artikujt — verifikim i bug-ut

- Riprodhimi fillestar i `/products` me versionin e parë të patch-it dha crash React `TypeError: Cannot read properties of null (reading 'useMemo')` te AlertDialog.
- AlertDialog u hoq dhe konfirmimi i fshirjes u kalua në Dialog standard, pas së cilës lista reale u ngarkua me 3 artikuj: Gg, Ferre dhe Murriz.
- Ikonat e Veprimeve u bënë interactive: `Edito Gg`, `Fshi Gg`, `Edito Ferre`, `Fshi Ferre`, `Edito Murriz`, `Fshi Murriz`.
- Klikimi `Edito Gg` hapi dialogun me fushat Kodi, Emri, Barcode, Kategoria, Njësia Bazë dhe `Ruaj ndryshimet`.
- X i dialogut të editimit e riktheu tabelën pa overlay.
- `/products?openProduct=30001` hapi Kartelën reale të Ferre; X e mbylli dhe URL u kthye në `/products`, ndërsa tabela mbeti aktive.
- U shtuan procedurat tRPC/backend `product.update` dhe `product.delete`; fshirja bllokohet në mënyrë të sigurt për artikuj me stok, lëvizje ose dokumente të lidhura.
