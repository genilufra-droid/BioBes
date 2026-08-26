# Verifikim Listëprezenca Manuale — 22.08.2026

- Workbook-u i testit: `07.PAGATMUAJIKORRIK2026.xlsx`, sheet `ORET E PUNES`.
- Para korrigjimit të key-ve: UI raportoi `1 punonjës · 2077 qeliza`, me 5 rreshta të palidhur; DOM-i kishte qeliza bosh dhe përmbledhje 0.
- Databaza pas importit: 67 punonjës të krijuar në kompaninë 1; periudha Korrik 2026 kishte `payrollPeriodId = 180001`; `payrollAttendance` kishte 0 rreshta sepse Ruaj nuk ishte klikuar.
- Formati i ri i gridës: 31 ditë + O.Bruto + O.Pagesë + Normale + Shtesë + L/M/NM/NV + Total orë.
- U shtua ruajtja me lote 500 rreshta për të mos kaluar kufirin e API-së prej 2000 rreshtash.
- U korrigjua parser-i që `values` të kthejë key sipas numrit burim të listëpagesës, jo ID negative.
- Testet pas ndryshimeve: 42 file testesh, 119 teste kaluan; `pnpm build` kaloi.
- Hapi vijues i verifikimit: riimporto workbook-un pas korrigjimit, kontrollo DOM-in për vlera reale, kliko Ruaj, dhe kontrollo databazën që attendanceRows > 0.

## Verifikimi pas korrigjimit të parser-it

Pas ndryshimit të key-ve, riimporti në preview shfaqi `67 punonjës · 2077 qeliza`; inputet e gridës kishin vlera reale si 8, 0 dhe 4, ndërsa përmbledhja tregonte vlera të llogaritura. Kjo e konfirmon se importi në browser dhe mapimi i rreshtave u rregulluan.

U klikua `Ruaj Listëprezencën`, por pas rreth 17 sekondash UI vazhdonte të shfaqte `Po ruhet…` dhe `Po krijohet…`; nuk u shfaq ende njoftim suksesi. Duhet kontrolluar nëse kërkesat e loteve po presin, dështojnë pa u shfaqur, ose nëse mutation-i mbetet pending.
