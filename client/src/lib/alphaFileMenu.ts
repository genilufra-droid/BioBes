export const alphaFileMenuLabels = [
  "Ndrysho Ndërmarrje", "Zgjidh Ndërmarrje", "Backup Restore", "Strukturë Administrative", "Njësi Administrative", "Njësi Likujdimi", "Konfigurim fushash", "Grup & Njësi Artikulli", "Qytete & Kategori", "Postimi", "Arkiva e Dokumentave", "Import të dhënash", "Mbyllje Viti", "Dalje",
] as const;

export const alphaFileMenuSubmenus = {
  "Njësi Administrative": ["Pika Shitje", "Pika Furnizimi", "Magazina", "Njësi Prodhim", "Njësi të tjera"],
  "Njësi Likujdimi": ["Arka", "Banka"],
  "Grup & Njësi Artikulli": ["Grupe / NënGrupe", "Njësi Matje", "Kodifikim Artikulli", "Detajimi Artikullit", "Nivelet e TVSH", "Kufiri i gjendjes"],
  "Qytete & Kategori": ["Qytete", "Kategori Klienti/Furnitori", "Afate Maturimi", "Kategori Zbritje"],
  "Postimi": ["Postimi i Pakthyeshëm", "Postimi i Kthyeshëm", "Kthim Postimi"],
  "Import të dhënash": ["Importi standard", "Import Nga Skeda", "Konfigurim Format Importi", "Grupon Importin", "Importim"],
} as const;

export const alphaFileMenuShortcuts = {
  file: "Alt+F",
  company: "Ctrl+Alt+C",
  importExport: "Ctrl+Alt+I / E",
  yearClose: "Ctrl+Alt+Y",
} as const;
