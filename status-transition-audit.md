# Status Transition Audit

Ky dokument përmbledh rregullat e verifikuara nga kodi aktual. Faturat e blerjes dhe shitjes bllokojnë anulimin pasi janë `PAID`; pagesat kanë mbrojtje idempotente për `POSTED`; Notat e Kreditit lejojnë kalim nga `DRAFT` në `POSTED` ose `CANCELLED` dhe fshirja lejohet vetëm për `DRAFT`. Dokumentet e shitjes përdorin rregulla të veçanta për quotation/order/delivery/return sipas lidhjeve të tyre.

## Kufijtë e auditimit

Ky është audit statik i rregullave dhe testeve ekzistuese. Një verifikim i plotë me databazë për çdo lloj dokumenti, si dhe një matricë e vetme e statusit për të gjitha modulet, mbetet detyrë e hapur në `todo.md`. Nuk janë krijuar ose ndryshuar të dhëna reale gjatë këtij auditimi.
