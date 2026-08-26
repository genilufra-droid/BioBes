type Metric = { label: string; value: number };
import { reportMetricValue, sumNumericColumn, type ReportSort } from "@/lib/reportFiltering";
import SourceDocumentLink from "@/components/SourceDocumentLink";

type Row = Record<string, unknown>;

type Props = {
  reportKey: string;
  module: string;
  title: string;
  period: string;
  columns: string[];
  rows: Row[];
  metrics: Metric[];
  meta?: Record<string, string>;
  isLoading: boolean;
  cellValue: (value: unknown) => string;
  isLinkedDocument: (row: Row, column: string) => boolean;
  onOpenDocument: (row: Row) => void;
  sort: ReportSort;
  onSort: (column: string) => void;
};

export type ReferenceHeaderGroup = { label: string; columns: string[] };

export const REPORT_REFERENCE_TITLES: Record<string, string> = {
  partner_customer_situation_pdf: "SITUACIONI I KLIENTIT",
  partner_supplier_situation_pdf: "SITUACIONI I FURNITORIT",
  partner_customer_card_pdf: "KARTELA E KLIENTIT",
  partner_supplier_card_pdf: "KARTELA E FURNITORIT",
  partner_customer_card_base_pdf: "KARTELA E KLIENTIT NË MONEDHË BAZË",
  partner_supplier_card_base_pdf: "KARTELA E FURNITORIT NË MONEDHË BAZË",
  partner_billing_payment_register_pdf: "REGJISTRI PËRMBLEDHËS FATURIME DHE PAGESA",
  purchase_supplier_card_pdf: "KARTELA E FURNITORIT",
  purchase_supplier_card_format3_pdf: "KARTELA E FURNITORIT",
  purchase_supplier_maturity_pdf: "MATURIMI I FURNITORIT",
  purchase_supplier_maturity_summary_pdf: "MATURIMI I PERMBLEDHES",
  purchase_supplier_situation_pdf: "SITUACION I FURNITOREVE",
  purchase_supplier_situation_category_pdf: "SITUACION I FURNITOREVE (sipas Kategorise)",
  purchase_customs_import_register_pdf: "REGJISTRI I DOGANIMIT TË IMPORTEVE",
  purchase_invoice_payment_register_pdf: "FATURIME DHE PAGESA",
  purchase_summary_register_pdf: "REGJISTRI PËRMBLEDHËS I BLERJEVE",
  sales_by_city_pdf: "SHITJET SIPAS QYTETEVE",
  sales_by_customer_pdf: "SHITJET SIPAS KLIENTEVE",
  sales_items_sold_pdf: "ARTIKUJT E SHITUR",
  sales_unsold_items_pdf: "ARTIKUJT E PASHITUR",
  sales_discount_analysis_pdf: "ARTIKUJT ME ZBRITJE ANALITIKE",
  sales_product_card_pdf: "KARTELA E ARTIKULLIT TË SHITJES",
  sales_customer_statement: "KARTELA E KLIENTIT",
  sales_returns_pdf: "REGJISTRI I KTHIMEVE",
  sales_price_list_pdf: "LISTA E ÇMIMEVE",
  sales_comparison_pdf: "PARAGONA E SHITJEVE",
  sales_analytic_register_pdf: "REGJISTRI ANALITIK I SHITJEVE",
  sales_margin_pdf: "MARZHI I SHITJEVE",
  sales_margin_detail_pdf: "MARZHI I SHITJEVE — FORMATI 2",
  sales_by_product_pdf: "SHITJET SIPAS ARTIKUJVE",
  sales_quantity_pdf: "SHITJET SIPAS SASISË",
  sales_quantity_total_pdf: "SHITJET SIPAS SASISË TOTAL",
  inventory_warehouse_status_pdf: "GJENDJA E MAGAZINES",
  inventory_analytic_register_pdf: "REGJISTRI ANALITIK I MAGAZINES",
  inventory_product_summary_pdf: "GJENDJA E ARTIKUJVE E PERMBLEDHUR",
  inventory_article_analysis_pdf: "ANALIZA E ARTIKUJVE",
  inventory_minimum_status_pdf: "GJENDJA E ARTIKUJVE MINIMUM",
  inventory_warehouse_detail_pdf: "GJENDJA E MAGAZINES SIPAS DETAJIMEVE TE ARTIKUJVE",
  inventory_product_card_pdf: "KARTELA ARTIKULLIT",
};

export function getReferenceTitle(reportKey: string, fallback: string) {
  return REPORT_REFERENCE_TITLES[reportKey] ?? fallback;
}

export function getReferenceTotalLabel(reportKey: string) {
  return reportKey === "purchase_customs_import_register_pdf" ? "Totali :" : "TOTALI I RAPORTIT";
}

/** Page numbers are injected by the browser/PDF pagination layer, never hardcoded in the report body. */
export function getReferenceStaticPageLabel() {
  return "";
}

export function getReferenceColumnLabel(reportKey: string, column: string) {
  if (reportKey === "purchase_supplier_situation_category_pdf") {
    return column === "Debi bazë" ? "Debi" : column === "Kredi bazë" ? "Kredi" : column === "Detyrimi bazë" ? "Detyrimi" : column;
  }
  return column;
}

export const REPORT_REFERENCE_META: Record<string, string[]> = {
  partner_customer_situation_pdf: ["Klienti", "NIPTI", "Mon"],
  partner_customer_card_pdf: ["Klienti", "NIPTI", "Mon"],
  partner_customer_card_base_pdf: ["Klienti", "NIPTI", "Mon"],
  partner_supplier_situation_pdf: ["Furnitori", "NIPTI", "Mon"],
  partner_supplier_card_pdf: ["Furnitori", "NIPTI", "Mon"],
  partner_supplier_card_base_pdf: ["Furnitori", "NIPTI", "Mon"],
  partner_billing_payment_register_pdf: ["Mon"],
  purchase_supplier_card_pdf: ["Furnitori", "Mon", "Nr Llogarie", "NIPTI"],
  purchase_supplier_card_format3_pdf: ["Furnitori", "Mon", "Nr Llogarie", "NIPTI"],
  sales_customer_statement: ["Klienti", "Mon", "Nr Llogarie", "NIPTI"],
  purchase_supplier_maturity_pdf: ["Data e raportimit", "Periudha e maturimit", "Data e maturimit"],
  purchase_supplier_maturity_summary_pdf: ["Data Raportimi", "Periudha e Maturimit", "Data e Maturimit"],
  purchase_supplier_situation_pdf: ["Periudha"],
  purchase_supplier_situation_category_pdf: ["Kategoria", "Monedha e furnitorit", "Monedha bazë"],
  purchase_invoice_payment_register_pdf: ["Furnitori", "Monedha"],
  purchase_customs_import_register_pdf: ["Periudha", "Import / Eksport", "Monedha"],
  sales_quantity_pdf: ["Grupi", "Nengrupi"],
  sales_price_list_pdf: ["Grupi", "Nengrupi"],
  sales_comparison_pdf: ["Pike shitje", "Shitesi"],
  sales_analytic_register_pdf: ["Pike Shijte", "Shitesi", "Monedha"],
  sales_product_card_pdf: ["Nr Kartele", "Kodbar", "Grup Malli", "Nën Grupi", "Artikulli"],
  inventory_product_card_pdf: ["Kartela", "Kodbar", "Grupi", "Nën Grupi", "Përshkrimi", "Njësia"],
  inventory_analytic_register_pdf: ["Magazina"],
  inventory_warehouse_status_pdf: ["Magazina"],
  inventory_warehouse_detail_pdf: ["Magazina"],
  inventory_minimum_status_pdf: ["Kartela", "Magazina"],
  inventory_product_summary_pdf: ["Kartela"],
  inventory_article_analysis_pdf: ["Magazina"],
};

export const REPORT_REFERENCE_GROUPS: Record<string, ReferenceHeaderGroup[]> = {
  partner_customer_situation_pdf: [{ label: "Të dhënat e klientit", columns: ["Kodi", "Emërtimi", "NIPT", "Qyteti", "Telefoni", "Balanca"] }],
  partner_customer_card_pdf: [{ label: "Të dhënat e klientit", columns: ["Kodi", "Emërtimi", "NIPT", "Qyteti", "Telefoni", "Balanca"] }],
  partner_customer_card_base_pdf: [{ label: "Të dhënat e klientit", columns: ["Kodi", "Emërtimi", "NIPT", "Qyteti", "Telefoni", "Balanca"] }],
  partner_supplier_situation_pdf: [{ label: "Të dhënat e furnitorit", columns: ["Kodi", "Emërtimi", "NIPT", "Qyteti", "Telefoni", "Balanca"] }],
  partner_supplier_card_pdf: [{ label: "Të dhënat e furnitorit", columns: ["Kodi", "Emërtimi", "NIPT", "Qyteti", "Telefoni", "Balanca"] }],
  partner_supplier_card_base_pdf: [{ label: "Të dhënat e furnitorit", columns: ["Kodi", "Emërtimi", "NIPT", "Qyteti", "Telefoni", "Balanca"] }],
  partner_billing_payment_register_pdf: [
    { label: "Dokumenti", columns: ["Data", "Dokumenti", "Partneri", "Lloji"] },
    { label: "Vlerat", columns: ["Debi", "Kredi"] },
  ],
  purchase_supplier_card_pdf: [
    { label: "Dokumenti", columns: ["Nr Rend", "Data Rregj", "Lloj Dok", "Nr Dok", "Data Dok", "Përshkrimi i Veprimit"] },
    { label: "Monedhe Llogarie", columns: ["Debi", "Kredi", "Progresivi"] },
  ],
  purchase_supplier_card_format3_pdf: [
    { label: "Dokumenti", columns: ["Nr Rend", "Data Rregj", "Lloj Dok", "Nr Dok", "Data Dok", "Përshkrimi i Veprimit"] },
    { label: "Monedha bazë", columns: ["Debi", "Kredi", "Progresivi"] },
  ],
  sales_customer_statement: [
    { label: "Dokumenti", columns: ["Nr Rend", "Data Rregj", "Lloj Dok", "Nr Dok", "Data Dok", "Përshkrimi i Veprimit"] },
    { label: "Monedhe Llogarie", columns: ["Debi", "Kredi", "Progresivi"] },
  ],
  purchase_supplier_maturity_pdf: [
    { label: "Të dhënat e raportit", columns: ["Dt. Dok", "Nr Dok", "Lloj Dok", "Date Maturimi", "Dite Maturimi"] },
    { label: "Koha e Maturimit", columns: ["Tejkaluar", "0", "1-30", "30-60", "60-90", "90-180", ">", "Totali"] },
  ],
  purchase_supplier_maturity_summary_pdf: [
    { label: "Furnitori", columns: ["Kod Klienti", "Emri", "Llogaria", "Mon Lig"] },
    { label: "Koha e Maturimit", columns: ["Total", "0", "1-30", "30-60", "60-90", "90-180", "Mbi 180"] },
  ],
  sales_unsold_items_pdf: [
    { label: "Të dhënat e raportit", columns: ["Nr. Blerje", "Dt.", "Njësia", "Kartelë", "Emërtimi i Artikullit", "Kod Bar", "Gjendja"] },
  ],
  sales_summary_register_pdf: [
    { label: "Dokumenti", columns: ["Nr Rend", "Lloj", "Nr", "Date", "Mon"] },
    { label: "Kod i Klientit", columns: ["Kod i Klientit"] },
    { label: "Vleftë Artikulli", columns: ["Kodi Artikulli", "Vlefta Artikulli"] },
    { label: "Zbritje", columns: ["Zbritje Anal.", "Zbritje Tot.", "Zbritje %", "Zbritje Gjithsej Vlefta"] },
    { label: "Vlera me zbritje", columns: ["Vlera me Zbritje pa TVSH", "Vlera me Zbritje me TVSH"] },
    { label: "Vlera në Mon Baze", columns: ["Vlera në Mon Baze pa TVSH", "Vlera në Mon Baze TVSH"] },
  ],
  accounting_trial_balance: [
    { label: "Llogaria", columns: ["Kodi", "Llogaria", "Tipi"] },
    { label: "Bilanci", columns: ["Debi", "Kredi", "Bilanci"] },
  ],
  accounting_profit_loss: [
    { label: "Pasqyra", columns: ["Kategoria", "Vlera"] },
  ],
  accounting_payments: [
    { label: "Dokumenti", columns: ["Nr.", "Data", "Partneri", "Lloji"] },
    { label: "Vlerat", columns: ["Vlera", "Monedha", "Kursi", "Vlera në Lek"] },
    { label: "Shlyerja", columns: ["Metoda", "Statusi"] },
  ],
  accounting_taxes: [
    { label: "Norma tatimore", columns: ["Kodi", "Emri", "Norma", "Zbatimi", "Aktive"] },
  ],
  accounting_journals: [
    { label: "Regjistrimi", columns: ["Nr.", "Data", "Ditari"] },
    { label: "Vlerat", columns: ["Debi", "Kredi", "Statusi"] },
  ],
  crm_pipeline: [
    { label: "Faza", columns: ["Faza", "Mundësi"] },
    { label: "Vlerat", columns: ["Vlera e pritur", "Vlera e peshuar"] },
  ],
  crm_leads: [
    { label: "Lead-i", columns: ["Nr.", "Kontakti", "Kompania"] },
    { label: "Vlerësimi", columns: ["Faza", "Vlera e pritur", "Probabiliteti"] },
  ],
  crm_activities: [
    { label: "Aktiviteti", columns: ["Afati", "Kontakti", "Lloji", "Subjekti"] },
    { label: "Statusi", columns: ["Statusi"] },
  ],
  crm_won: [
    { label: "Mundësia", columns: ["Nr.", "Kontakti", "Kompania"] },
    { label: "Vlerat", columns: ["Vlera", "Probabiliteti"] },
  ],
  bank_balances: [
    { label: "Llogaria bankare", columns: ["Llogaria", "Banka", "IBAN", "Lloji"] },
    { label: "Balanca", columns: ["Balanca"] },
  ],
  bank_statements: [
    { label: "Ekstrakti", columns: ["Nr. ekstraktit", "Llogaria", "Prej datës", "Deri më datën"] },
    { label: "Mbyllja", columns: ["Balanca mbyllëse", "Statusi"] },
  ],
  bank_transactions: [
    { label: "Transaksioni", columns: ["Data", "Përshkrimi", "Lloji"] },
    { label: "Vlera", columns: ["Vlera", "Statusi"] },
  ],
  bank_reconciliation: [
    { label: "Pajtimi", columns: ["Data", "Përshkrimi", "Lloji", "Vlera", "Referenca"] },
  ],
  bank_transfers: [
    { label: "Transferimi", columns: ["Nr.", "Data", "Burim", "Destinacion"] },
    { label: "Vlera", columns: ["Vlera", "Statusi"] },
  ],
  inventory_analytic_register_pdf: [
    { label: "Dokumenti", columns: ["Lloji", "Numri", "Data", "Dt Regj"] },
    { label: "Artikulli", columns: ["Kartela", "Përshkrimi", "Njësia"] },
    { label: "Sasitë dhe vlerat", columns: ["Sasia", "Çmimi", "Vlefta"] },
  ],
  inventory_product_summary_pdf: [
    { label: "Artikulli", columns: ["Kartelë", "Përshkrimi", "Grupi", "Njësia", "Llog. Inventar"] },
    { label: "Gjendja", columns: ["Gjendje Mbartur", "Hyrje", "Dalje", "Gjendje"] },
    { label: "Vlerësimi", columns: ["Kosto", "Vlefta"] },
  ],
  inventory_article_analysis_pdf: [
    { label: "Artikulli", columns: ["Kartela", "Emërtimi", "Njësia"] },
    { label: "Hyrje dhe dalje", columns: ["Gjendje me Pare", "Hyrje nga Blerjet", "Hyrje të Tjera", "Dalje për Shitje", "Dalje të Tjera", "Gjendje"] },
    { label: "Vlerësimi", columns: ["Çmimi mesatar", "Vlefta"] },
  ],
  inventory_warehouse_status_pdf: [
    { label: "Artikulli", columns: ["Kartelë", "Përshkrimi", "Grupi", "Njësia", "Llog. Inventar"] },
    { label: "Lëvizja", columns: ["Hyrje", "Dalje", "Gjendje"] },
    { label: "Vlerësimi", columns: ["Kosto", "Vlefta", "Në %"] },
  ],
  inventory_warehouse_detail_pdf: [
    { label: "Artikulli", columns: ["Kartela", "Përshkrimi", "Grupi", "Njësia", "Llog. Inventar"] },
    { label: "Lëvizja", columns: ["Hyrje", "Dalje", "Gjendje"] },
    { label: "Vlerësimi", columns: ["Kosto", "Vlefta", "Në %"] },
  ],
  inventory_product_card_pdf: [
    { label: "Dokumenti", columns: ["Lloj Dok.", "Nr Dokumenti", "Dt Dokumenti", "Magazina", "Njësia"] },
    { label: "Hyrje", columns: ["Hyrje", "Çmimi Hyrje", "Vlefta Hyrje"] },
    { label: "Dalje", columns: ["Dalje", "Çmimi Dalje", "Vlefta Dalje"] },
    { label: "Gjendja", columns: ["Gjendje", "Vlefta"] },
  ],
  purchase_supplier_situation_pdf: [
    { label: "Furnitori", columns: ["Nr Rend", "Kodi", "Emertimi i Furnitorit", "Nr Llogarie", "Kategoria"] },
    { label: "Vlerat", columns: ["Shuma Debi", "Shuma Kredi", "Detyrimi", "Pesha %"] },
  ],
  purchase_supplier_situation_category_pdf: [
    { label: "Furnitori", columns: ["Kodi", "Emërtimi", "Mon", "Qyteti"] },
    { label: "Monedhe Furnitori", columns: ["Debi", "Kredi", "Detyrimi"] },
    { label: "Monedhe Baze", columns: ["Debi bazë", "Kredi bazë", "Detyrimi bazë"] },
  ],
  purchase_customs_import_register_pdf: [
    { label: "Dokumenti doganor", columns: ["Ref.", "Nr.Fl.Dog.", "Dt Fl.Dog."] },
    { label: "Fatura", columns: ["Vl.Fatures", "Monedha", "Kursi", "Vlefta"] },
    { label: "Shpenzime", columns: ["Transport", "Siguracion", "Refer./Tjera"] },
    { label: "Dogana", columns: ["Vl.Dogane", "Dog", "Akciz", "Vl pa TVSH", "TVSH"] },
  ],
  purchase_invoice_payment_register_pdf: [
    { label: "Lloji", columns: ["Fature", "Pagese"] },
    { label: "Dokumenti", columns: ["Numer", "Date", "Pershkrimi"] },
    { label: "Vlefta", columns: ["Faturuar", "Paguar", "Diferenca"] },
  ],
  purchase_summary_register_pdf: [
    { label: "Dokumenti", columns: ["Nr. rend", "Lloji", "Nr.", "Dt. Dok", "Monedha", "Kursi", "Kodi", "Emertimi"] },
    { label: "Monedha Fature", columns: ["Nentotal", "Zbritje", "TVSH", "Totali"] },
    { label: "Monedha Baze", columns: ["TVSH bazë", "Totali bazë"] },
  ],
  sales_by_customer_pdf: [
    { label: "Klienti", columns: ["Kodi", "Emërtimi", "Qyteti"] },
    { label: "Vlerat", columns: ["Fatura", "Vlefta"] },
  ],
  sales_quantity_pdf: [
    { label: "Sasitë mujore", columns: ["Artikulli", "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"] },
  ],
  sales_quantity_total_pdf: [
    { label: "Sasitë mujore", columns: ["Artikulli", "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"] },
  ],
  sales_items_sold_pdf: [
    { label: "Artikulli", columns: ["Kartelë", "Emërtimi", "Njësia", "Sasia", "Çmimi"] },
    { label: "Vlerat", columns: ["Vlefta pa TVSH", "Vlefta me TVSH", "Në %"] },
    { label: "Zbritja analitike", columns: ["Vlefta pa TVSH me Zbritje", "Vlefta me TVSH me Zbritje", "Në % Analitike"] },
  ],
  sales_discount_analysis_pdf: [
    { label: "Artikulli", columns: ["Kartela", "Emërtimi", "Njësia", "Sasia", "Çmimi"] },
    { label: "Vlerat", columns: ["Vlefta pa TVSH", "Vlefta me TVSH", "Në %"] },
    { label: "Zbritja analitike", columns: ["Vlefta pa TVSH me Zbritje", "Vlefta me TVSH me Zbritje", "Në % Analitike"] },
  ],
  sales_product_card_pdf: [
    { label: "Artikulli", columns: ["Nr Kartele", "Kodbar", "Grup Malli", "Nën Grupi", "Klienti"] },
    { label: "Dokumenti", columns: ["Nr. Dok", "Dt. Dok", "Lloj Dok", "Njësia"] },
    { label: "Sasitë dhe vlerat", columns: ["Sasia", "Çmimi", "Vlera Pa TVSH", "Vlera Me TVSH", "Progresiv Sasi"] },
  ],
  sales_returns_pdf: [
    { label: "Dokumenti", columns: ["Nr.Dok", "Dt.Dok", "Numer FS.Ref", "Date FS.Ref", "Artikulli"] },
    { label: "Sasitë", columns: ["Sasi Fature", "Sasi e Kthyer", "Çmimi", "Zbritje %"] },
    { label: "Vlerat e kthyera", columns: ["Vlefta e Kthyer me TVSH", "Monedha", "Kursi", "Vlefta e kthyer me TVSH ne MB"] },
  ],
  sales_margin_pdf: [
    { label: "Artikulli", columns: ["Kartela", "Emërtimi i Artikullit", "Njësia", "Sasia e Shitur"] },
    { label: "Kosto dhe shitje", columns: ["Kosto/Njesi", "KMSH", "Çmimi i shitjes", "Vlera Shitjes"] },
    { label: "Marzhi bruto", columns: ["Marzhi Bruto me Zbritje", "Marzhi Bruto % me Zbritje", "Marzhi Bruto", "Marzhi Bruto %"] },
  ],
  sales_margin_detail_pdf: [
    { label: "Klienti", columns: ["Kodi", "Emërtimi", "Grupi", "Nën Grupi"] },
    { label: "Artikujt", columns: ["Kodi artikulli", "Emërtimi artikulli", "Sasia"] },
    { label: "Shitjet dhe marzhi", columns: ["Volumi Shitjeve(%)", "Vlera e Shitjes", "KMSH", "Marzhi", "Marzhi në %", "Mark up", "Sales"] },
  ],
  sales_by_product_pdf: [
    { label: "Klienti dhe artikulli", columns: ["Klienti", "Sasia", "Çmimi", "Grupi", "Emërtimi", "Nën Grupi", "Kodi"] },
    { label: "Volumi dhe vlera", columns: ["Volumi i Shitjeve në %", "Vlere(MB)"] },
  ],
  sales_price_list_pdf: [
    { label: "Artikulli", columns: ["Kartela", "Kodbari", "Emërtimi i Artikullit", "Njesia", "Grupi", "Nengrupi"] },
    { label: "Çmimet", columns: ["Cmimi 1", "Cmimi 2", "Cmimi 3", "Cmimi 4", "Cmimi 5"] },
  ],
  sales_comparison_pdf: [
    { label: "Dokumenti", columns: ["Lloj", "Kod i Klientit", "Vlefte Artikulli", "Zbritje"] },
    { label: "Vlera me Zbritje", columns: ["pa Tvsh", "me Tvsh"] },
    { label: "Vlera në Mon Baze", columns: ["pa Tvsh Baze", "Tvsh Baze"] },
  ],
  sales_analytic_register_pdf: [
    { label: "Dokumenti", columns: ["Rend", "Lloj", "Kodi", "Nr", "Dt", "Kodi Klienti", "Emertimi"] },
    { label: "Artikulli dhe sasia", columns: ["Njesia", "Monedha", "Cmimi", "Sasia", "Vlera Gjithsej"] },
    { label: "Zbritjet dhe baza", columns: ["Zbr. Art%", "Vlera me Zbritje Art", "Zbr. Tot%", "Vlera Me Zbritje Tot%", "Kursi", "Vlera Me TVSH Mon. Fature", "Vlera Me Zbritje Mon. Baze"] },
  ],
  inventory_minimum_status_pdf: [
    { label: "Artikulli", columns: ["Kartela", "Përshkrimi", "Grupi", "Njësia", "Llog. Inventare"] },
    { label: "Gjendja", columns: ["Minimum", "Mungesat", "Hyrje", "Dalje", "Gjendje"] },
    { label: "Vlerësimi", columns: ["Kosto", "Vlefta", "Furnitori"] },
  ],
};

const normalize = (value: string) => value.trim().toLocaleLowerCase("sq-AL").replace(/\s+/g, " ").replace(/^dt reg$/, "dt regj");

function getAutoReferenceGroups(columns: string[]): ReferenceHeaderGroup[] {
  const groups: ReferenceHeaderGroup[] = [];
  const classification = (column: string) => {
    const normalized = normalize(column);
    if (/nr|num|date|dat|dok|llog|lloji|referenc|monedh|kurs/.test(normalized)) return "Dokumenti";
    if (/klient|furnitor|partner|artikull|kartel|kod|pershk|emert|grup|kategori|magazin|njesi|qytet/.test(normalized)) return "Partneri dhe artikulli";
    if (/sasi|hyrje|dalje|gjendje|minimum|munges/.test(normalized)) return "Sasitë";
    if (/vleft|vler|cmim|debi|kredi|detyrim|tot|zbrit|kosto|marzh|perqind|%/.test(normalized)) return "Vlerat";
    return "Të tjera";
  };
  columns.forEach(column => {
    const label = classification(column);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.columns.push(column);
    else groups.push({ label, columns: [column] });
  });
  return groups;
}

export function getReferenceGroups(reportKey: string, columns: string[]): ReferenceHeaderGroup[] {
  const uppercaseGroups = (groups: ReferenceHeaderGroup[]) => groups.map(group => ({ ...group, label: group.label.toLocaleUpperCase("sq-AL") }));
  if (reportKey === "inventory_analytic_register_pdf" && columns.length >= 10) {
    return uppercaseGroups([
      { label: "Dokumenti", columns: columns.slice(0, 4) },
      { label: "Artikulli", columns: columns.slice(4, 7) },
      { label: "Sasitë dhe vlerat", columns: columns.slice(7) },
    ]);
  }
  if (reportKey === "sales_summary_register_pdf" && columns.length >= 16) {
    return uppercaseGroups([
      { label: "Dokumenti", columns: columns.slice(0, 5) },
      { label: "Kod i Klientit", columns: columns.slice(5, 6) },
      { label: "Vleftë Artikulli", columns: columns.slice(6, 8) },
      { label: "Zbritje", columns: columns.slice(8, 12) },
      { label: "Vlera me zbritje", columns: columns.slice(12, 14) },
      { label: "Vlera në Mon Baze", columns: columns.slice(14) },
    ]);
  }
  const requested = REPORT_REFERENCE_GROUPS[reportKey];
  if (!requested) return uppercaseGroups(getAutoReferenceGroups(columns));
  const expectedColumnCount = requested.reduce((total, group) => total + group.columns.length, 0);
  if (columns.length === expectedColumnCount) {
    let offset = 0;
    return uppercaseGroups(requested.map(group => {
      const groupColumns = columns.slice(offset, offset + group.columns.length);
      offset += group.columns.length;
      return { label: group.label, columns: groupColumns };
    }));
  }
  const labelForColumn = new Map(requested.flatMap(group => group.columns.map(column => [normalize(column), group.label] as const)));
  const ordered: ReferenceHeaderGroup[] = [];
  columns.forEach(column => {
    const label = labelForColumn.get(normalize(column)) ?? "Të tjera";
    const last = ordered[ordered.length - 1];
    if (last?.label === label) last.columns.push(column);
    else ordered.push({ label, columns: [column] });
  });
  return uppercaseGroups(ordered);
}

export function groupProductCardRows(rows: Row[]) {
  return Array.from(rows.reduce((map, row) => {
    const key = String(row.__productCode || row.__productName || "Artikull");
    const current = map.get(key) ?? [];
    current.push(row);
    map.set(key, current);
    return map;
  }, new Map<string, Row[]>()).entries());
}

function ProductCardReferenceView({ props }: { props: Props }) {
  const { reportKey, period, rows, isLoading, cellValue, isLinkedDocument, onOpenDocument, sort, onSort } = props;
  const groups = groupProductCardRows(rows);
  const activeFilterLabels = new Set(["Dokumenti burimor", "Nr. dokumenti", "Artikull", "Kategori / Artikull", "Status", "Monedha", "Lloj dokumenti", "Magazinë", "Magazina", "Njësia", "Shuma minimale", "Shuma maksimale", "Data nga", "Data deri", "Kërkimi në tabelë"]);
  const activeFilters = Object.entries(props.meta ?? {}).filter(([label, value]) => activeFilterLabels.has(label) && String(value ?? "").trim().length > 0);
  const sourceRows = groups.length > 0 ? groups : [["Artikull", []] as [string, Row[]]];
  const tableColumns = ["Lloj Dok.", "Nr Dokumenti", "Dt Dokumenti", "Magazina", "Njësia", "Hyrje", "Çmimi Hyrje", "Vlefta Hyrje", "Dalje", "Çmimi Dalje", "Vlefta Dalje", "Gjendje", "Vlefta"];
  const renderCell = (row: Row, column: string) => isLinkedDocument(row, column) ? <SourceDocumentLink label={cellValue(row[column])} onOpen={() => onOpenDocument(row)} /> : cellValue(row[column]);
  return <div className="space-y-6">
    {sourceRows.map(([key, articleRows], groupIndex) => {
      const first = articleRows[0] ?? {};
      const total = (column: string) => {
        if (column === "Gjendje" || column === "Vlefta") {
          const lastValue = articleRows[articleRows.length - 1]?.[column];
          return typeof lastValue === "number" ? lastValue : null;
        }
        return sumNumericColumn(articleRows, column);
      };
      return <section key={`${key}-${groupIndex}`} className="reference-report-sheet mx-auto max-w-[1480px] bg-white p-5 shadow-sm ring-1 ring-slate-200 print:break-after-page lg:p-7">
        <header className="border-b border-[#4a4a36] pb-3">
          <div className="flex items-start justify-between text-[10px] text-[#25251f]"><span>{new Date().getFullYear()}</span><span>{period}</span></div>
          <h2 className="mt-1 text-center text-base font-bold uppercase text-[#25251f]">KARTELA ARTIKULLIT</h2>
        </header>
        {activeFilters.length > 0 && <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 border-b border-[#8a8a63] bg-[#fffef1] px-2 py-1.5 text-[9px] text-[#25251f]"><strong>Filtra aktive:</strong>{activeFilters.map(([label, value]) => <span key={label}><strong>{label}:</strong> {value}</span>)}</div>}
        <div className="my-3 grid grid-cols-[auto_minmax(10rem,1fr)_auto_minmax(10rem,1fr)] gap-x-3 gap-y-1 border-b border-[#8a8a63] bg-[#fffef1] px-2 py-2 text-[10px] text-[#25251f]">
          <strong>Kartela</strong><span className="border-b border-[#4a4a36]">{String(first.__productCode || key)}</span>
          <strong>Grupi</strong><span className="border-b border-[#4a4a36]">{String(first.__productGroup || "—")}</span>
          <strong>Kodbar</strong><span className="border-b border-[#4a4a36]">{String(first.__productBarcode || first.__productCode || "")}</span>
          <span></span><span></span>
          <strong>Pershkrimi</strong><span className="col-span-3 border-b border-[#4a4a36]">{String(first.__productName || "")}</span>
          <strong>Njesia</strong><span className="border-b border-[#4a4a36]">{String(first["Njësia"] || "")}</span>
          <strong>Nën Grupi</strong><span className="border-b border-[#4a4a36]">{String(first.__productSubgroup || "—")}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse bg-[#fffef1] text-[11px]">
            <thead><tr className="bg-[#e6e5b5] text-[#25251f]">{tableColumns.map(column => <th key={column} className="border border-[#8a8a63] px-2 py-1.5 text-left font-semibold"><button type="button" className="inline-flex items-center gap-1 font-semibold" onClick={() => onSort(column)}>{column === "Çmimi Hyrje" || column === "Çmimi Dalje" ? "Cmimi" : column}<span aria-hidden="true">{sort?.column === column ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>)}</tr></thead>
            <tbody>{isLoading ? <tr><td colSpan={tableColumns.length} className="p-10 text-center">Po ngarkohet...</td></tr> : articleRows.length === 0 ? <tr><td colSpan={tableColumns.length} className="p-10 text-center">Nuk ka të dhëna.</td></tr> : articleRows.map((row, index) => <tr key={index}>{tableColumns.map(column => <td key={column} className="border border-[#8a8a63] px-2 py-1.5">{renderCell(row, column)}</td>)}</tr>)}</tbody>
            {!isLoading && <tfoot><tr className="border border-[#4a4a36] bg-[#f1f0c8] font-bold text-[#25251f]">{tableColumns.map((column, index) => <td key={column} className="border border-[#8a8a63] px-2 py-1.5">{index === 0 ? "Total" : total(column) === null ? "" : cellValue(total(column))}</td>)}</tr></tfoot>}
          </table>
        </div>
        <footer className="mt-5 flex justify-between border-t border-[#4a4a36] pt-2 text-[9px] text-[#25251f]"><span>Printuar nga Alpha Platinium &nbsp; www.imb.al</span><span>{groupIndex + 1}</span></footer>
      </section>;
    })}
  </div>;
}

type SupplierBalanceStatus = "DEBITOR" | "KREDITOR" | "BALANCË";

export function resolveSupplierBalanceStatus(debit: number, credit: number): { status: SupplierBalanceStatus; amount: number } {
  const difference = Number((debit - credit).toFixed(2));
  if (Math.abs(difference) < 0.005) return { status: "BALANCË", amount: 0 };
  return difference > 0 ? { status: "DEBITOR", amount: difference } : { status: "KREDITOR", amount: Math.abs(difference) };
}

function SupplierCardSimpleReferenceView({ props, entity = "supplier" }: { props: Props; entity?: "supplier" | "customer" }) {
  const { period, rows, meta, isLoading, cellValue, isLinkedDocument, onOpenDocument, sort, onSort } = props;
  const tableColumns = ["Nr Rend", "Data Rregj", "Lloj Dok", "Nr Dok", "Data Dok", "Përshkrimi i Veprimit", "Debi", "Kredi", "Progresivi"];
  const activeFilterLabels = new Set(["Furnitor / Klient", "Nr. dokumenti", "Status", "Monedha", "Lloj dokumenti", "Data nga", "Data deri"]);
  const activeFilters = Object.entries(meta ?? {}).filter(([label, value]) => activeFilterLabels.has(label) && String(value ?? "").trim().length > 0);
  const valueFor = (row: Row, column: string) => row[column] ?? "";
  const totalFor = (column: string) => sumNumericColumn(rows, column);
  const totalDebit = totalFor("Debi") ?? 0;
  const totalCredit = totalFor("Kredi") ?? 0;
  const endingProgressive = rows.length > 0 ? Number(rows[rows.length - 1]?.Progresivi ?? totalDebit - totalCredit) : totalDebit - totalCredit;
  const balance = resolveSupplierBalanceStatus(totalDebit, totalCredit);
  const balanceTone = balance.status === "DEBITOR" ? "debitor" : balance.status === "KREDITOR" ? "kreditor" : "balanc";
  const partner = entity === "customer" ? meta?.Klienti || meta?.["Furnitor / Klient"] || "" : meta?.Furnitori || meta?.["Furnitor / Klient"] || "";
  const reportPeriod = period.includes("Fillimi") ? "01/01/2026 - 31/12/2026" : period;
  const balanceDate = reportPeriod.split("-")[0]?.trim() || "01/01/2026";
  return <section className="supplier-card-simple-sheet mx-auto bg-white text-[#191919]">
    <header className="supplier-card-simple-header">
      <span className="supplier-card-simple-year">{new Date().getFullYear()}</span>
      <h2>{entity === "customer" ? "KARTELA E KLIENTIT" : "KARTELA E FURNITORIT"}</h2>
      <p>{reportPeriod}</p>
    </header>
    <div className="supplier-card-simple-report-filters">
      <span>Ndermarrja: <strong>{meta?.Ndermarrja || "Alpha WEB"}</strong></span>
      <span>Dt. Dok.: <strong>{reportPeriod}</strong></span>
      <span>Dt. Regj. <strong>{meta?.["Dt. Regj."] || "01/01/1900 - 31/12/9999"}</strong></span>
    </div>
    <div className="supplier-card-simple-identification">
      <span>{entity === "customer" ? "Klienti" : "Furnitori"}: <strong>{partner}</strong></span>
      <span>Mon <strong>{meta?.Mon || ""}</strong></span>
      <span>Nr. Llogarie <strong>{meta?.["Nr Llogarie"] || ""}</strong></span>
      <span>NIPT <strong>{meta?.NIPTI || ""}</strong></span>
    </div>
    {activeFilters.length > 0 && <div className="supplier-card-simple-filters"><strong>Filtra aktive:</strong>{activeFilters.map(([label, value]) => <span key={label}>{label}: {value}</span>)}</div>}
    <table className="supplier-card-simple-table">
      <thead>
        <tr>{tableColumns.slice(0, 6).map(column => <th key={column} rowSpan={2}><button type="button" onClick={() => onSort(column)}>{column}<span aria-hidden="true">{sort?.column === column ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}</span></button></th>)}<th colSpan={3}>Monedhe Llogarie</th></tr>
        <tr>{tableColumns.slice(6).map(column => <th key={column}><button type="button" onClick={() => onSort(column)}>{column}<span aria-hidden="true">{sort?.column === column ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}</span></button></th>)}</tr>
      </thead>
      <tbody>
        <tr className="supplier-card-simple-balance"><td colSpan={6}>Gjendja ne fillim</td><td colSpan={3}></td></tr>
        {isLoading ? <tr><td colSpan={tableColumns.length}>Po ngarkohet...</td></tr> : rows.length === 0 ? <tr><td colSpan={tableColumns.length}></td></tr> : rows.map((row, index) => <tr key={index} className={index === rows.length - 1 ? "supplier-card-simple-last-row" : undefined}>{tableColumns.map(column => <td key={column}>{isLinkedDocument(row, column) ? <button type="button" className="supplier-card-simple-link" onClick={() => onOpenDocument(row)}>{cellValue(valueFor(row, column))} ↗</button> : cellValue(valueFor(row, column))}</td>)}</tr>)}
      </tbody>
      {!isLoading && <tfoot>
        <tr className="supplier-card-simple-total-row"><td colSpan={6}>Totali</td><td>{cellValue(totalDebit)}</td><td>{cellValue(totalCredit)}</td><td></td></tr>
        <tr className={`supplier-card-simple-balance-summary supplier-card-simple-${balanceTone}`}><td colSpan={6}>Debitor/Kreditor</td><td>{cellValue(balance.status === "DEBITOR" ? balance.amount : 0)}</td><td>{cellValue(balance.status === "KREDITOR" ? balance.amount : 0)}</td><td></td></tr>
      </tfoot>}
    </table>
  </section>;
}

export const SALES_QUANTITY_TOTAL_MONTHS = ["Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"] as const;

function SalesQuantityTotalReferenceView({ props }: { props: Props }) {
  const { columns, rows, period, isLoading, cellValue, sort, onSort } = props;
  const actualFor = (label: string) => columns.find(column => normalize(column) === normalize(label)) ?? label;
  const articleColumn = actualFor("Artikulli");
  const monthColumns = SALES_QUANTITY_TOTAL_MONTHS.map(actualFor);
  const reportPeriod = normalizeSalesSummaryPeriod(period);
  const pages: Row[][] = [];
  for (let index = 0; index < rows.length; index += 4) pages.push(rows.slice(index, index + 4));
  if (pages.length === 0) pages.push([]);
  return <div className="sales-quantity-total-reference-stack">
    {pages.map((pageRows, pageIndex) => <section className="sales-quantity-total-reference-sheet" key={pageIndex}>
      <header className="sales-quantity-total-reference-header"><span>{new Date().getFullYear()}</span><h2>SHITJET SIPAS SASISE TOTAL</h2><p>Periudha nga&nbsp;&nbsp;&nbsp;{reportPeriod}</p></header>
      <table className="sales-quantity-total-reference-table"><thead><tr><th>Artikulli</th>{SALES_QUANTITY_TOTAL_MONTHS.map((month, index) => <th key={month}><button type="button" onClick={() => onSort(monthColumns[index])}>{month}<span aria-hidden="true">{sort?.column === monthColumns[index] ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}</span></button></th>)}</tr></thead><tbody>{isLoading ? <tr><td colSpan={13}>Po ngarkohet...</td></tr> : pageRows.length === 0 ? <tr><td colSpan={13}>Nuk ka të dhëna.</td></tr> : pageRows.map((row, rowIndex) => <tr key={rowIndex}><td>{cellValue(row[articleColumn])}</td>{monthColumns.map(column => <td key={column}>{cellValue(row[column])}</td>)}</tr>)}</tbody></table>
      <footer className="sales-quantity-total-reference-footer"><span>{new Date().toLocaleDateString("sq-AL")} · Printuar nga Alpha Platinium</span><span>www.imb.al&nbsp;&nbsp;&nbsp;{pageIndex + 1}</span></footer>
    </section>)}
  </div>;
}

function SalesQuantityReferenceView({ props }: { props: Props }) {
  const { columns, rows, period, isLoading, cellValue, sort, onSort } = props;
  const actualFor = (label: string) => columns.find(column => normalize(column) === normalize(label)) ?? label;
  const articleColumn = actualFor("Artikulli");
  const monthColumns = SALES_QUANTITY_TOTAL_MONTHS.map(actualFor);
  const reportPeriod = normalizeSalesSummaryPeriod(period);
  const groups = new Map<string, { customerCode: string; customerName: string; group: string; subgroup: string; rows: Row[] }>();
  rows.forEach(row => { const key = `${String(row.__customerCode || "—")}|${String(row.__customerName || "Pa klient")}|${String(row.__group || "Pa Grup")}|${String(row.__subgroup || "Pa Nengrup")}`; const existing = groups.get(key) ?? { customerCode: String(row.__customerCode || "—"), customerName: String(row.__customerName || "Pa klient"), group: String(row.__group || "Pa Grup"), subgroup: String(row.__subgroup || "Pa Nengrup"), rows: [] }; existing.rows.push(row); groups.set(key, existing); });
  const segments = Array.from(groups.values());
  if (segments.length === 0) segments.push({ customerCode: "", customerName: "", group: "", subgroup: "", rows: [] });
  return <div className="sales-quantity-reference-stack">{segments.map((segment, segmentIndex) => <section className="sales-quantity-reference-sheet" key={`${segment.group}-${segment.subgroup}-${segmentIndex}`}>
    <header className="sales-quantity-reference-header"><span>{new Date().getFullYear()}</span><h2>SHITJET SIPAS SASISE</h2><p>Periudha nga&nbsp;&nbsp;&nbsp;{reportPeriod}</p></header>
    {segment.customerName && <div className="sales-quantity-reference-segment">Klienti: <b>{segment.customerCode}</b>&nbsp;&nbsp;&nbsp;<b>{segment.customerName}</b></div>}
    {segment.group && <div className="sales-quantity-reference-segment">Grupi&nbsp;&nbsp;&nbsp;<b>{segment.group}</b></div>}
    {segment.subgroup && <div className="sales-quantity-reference-segment">Nengrupi&nbsp;&nbsp;&nbsp;<b>{segment.subgroup}</b></div>}
    <table className="sales-quantity-reference-table"><thead><tr><th>Artikulli</th>{SALES_QUANTITY_TOTAL_MONTHS.map((month, index) => <th key={month}><button type="button" onClick={() => onSort(monthColumns[index])}>{month}<span aria-hidden="true">{sort?.column === monthColumns[index] ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}</span></button></th>)}</tr></thead><tbody>{isLoading ? <tr><td colSpan={13}>Po ngarkohet...</td></tr> : segment.rows.length === 0 ? <tr><td colSpan={13}></td></tr> : segment.rows.map((row, rowIndex) => <tr key={rowIndex}><td>{cellValue(row[articleColumn])}</td>{monthColumns.map(column => <td key={column}>{cellValue(row[column])}</td>)}</tr>)}</tbody>{segment.rows.length > 0 && <tfoot><tr><td>Totali per nengrupin</td>{monthColumns.map(column => <td key={column}>{segment.rows.reduce((sum, row) => sum + Number(row[column] || 0), 0).toFixed(2)}</td>)}</tr><tr><td>Totali per grupin</td>{monthColumns.map(column => <td key={column}>{segment.rows.reduce((sum, row) => sum + Number(row[column] || 0), 0).toFixed(2)}</td>)}</tr></tfoot>}</table>
    <footer className="sales-quantity-reference-footer"><span>{new Date().toLocaleDateString("sq-AL")} · Printuar nga Alpha Platinium</span><span>www.imb.al&nbsp;&nbsp;&nbsp;{segmentIndex + 1}</span></footer>
  </section>)}</div>;
}

export const SALES_SUMMARY_REFERENCE_COLUMNS = ["Nr Rend", "Lloj", "Nr", "Date", "Mon", "Kod i Klientit", "Kodi Artikulli", "Vlefta Artikulli", "Zbritje Anal.", "Zbritje Tot.", "Zbritje %", "Zbritje Gjithsej Vlefta", "Vlera me Zbritje pa TVSH", "Vlera me Zbritje me TVSH", "Vlera në Mon Baze pa TVSH", "Vlera në Mon Baze TVSH"] as const;

export function getSalesSummaryReconciliation(rows: Row[]) {
  const invoiceTotals = new Map<number, { gross: number; vat: number; baseGross: number }>();
  rows.forEach(row => {
    const id = Number(row.__documentId);
    if (!Number.isFinite(id) || invoiceTotals.has(id)) return;
    invoiceTotals.set(id, { gross: Number(row.__invoiceTotalAmount || 0), vat: Number(row.__invoiceVatAmount || 0), baseGross: Number(row.__invoiceBaseTotalAmount || 0) });
  });
  const lineGross = rows.reduce((sum, row) => sum + Number(row["Vlera me Zbritje me TVSH"] || 0), 0);
  const invoiceGross = Array.from(invoiceTotals.values()).reduce((sum, invoice) => sum + invoice.gross, 0);
  const invoiceVat = Array.from(invoiceTotals.values()).reduce((sum, invoice) => sum + invoice.vat, 0);
  const invoiceBaseGross = Array.from(invoiceTotals.values()).reduce((sum, invoice) => sum + invoice.baseGross, 0);
  const difference = invoiceGross - lineGross;
  return { invoiceCount: invoiceTotals.size, lineCount: rows.length, invoiceGross, lineGross, invoiceVat, invoiceBaseGross, difference, status: Math.abs(difference) <= 1 ? "RAKORDUAR" : "NUK RAKORDUAR" } as const;
}

export function normalizeSalesSummaryPeriod(period: string) {
  return period.includes("Fillimi") ? "01/01/2026-31/12/2026" : period;
}

function SalesSummaryRegisterReferenceView({ props }: { props: Props }) {
  const { columns, rows, period, meta, isLoading, cellValue, isLinkedDocument, onOpenDocument, sort, onSort } = props;
  const reconciliation = getSalesSummaryReconciliation(rows);
  const normalizeKey = (value: string) => normalize(value).replace(/[^a-z0-9]+/g, "");
  const findColumn = (label: string) => columns.find(column => normalizeKey(column) === normalizeKey(label)) ?? label;
  const tableColumns = [...SALES_SUMMARY_REFERENCE_COLUMNS];
  const dataColumns = tableColumns.map(findColumn);
  const totalFor = (column: string) => sumNumericColumn(rows, findColumn(column));
  const metaFilter = meta?.["Pike Shijte"] || meta?.["Pike shitje"] || meta?.["Pike Shitjeje"];
  const reportPeriod = normalizeSalesSummaryPeriod(period);
  const renderCell = (row: Row, label: string, index: number) => {
    const actual = dataColumns[index];
    return isLinkedDocument(row, actual) || (label === "Nr" && Number(row.__documentId) > 0) ? <SourceDocumentLink label={cellValue(row[actual])} onOpen={() => onOpenDocument(row)} /> : cellValue(row[actual]);
  };
  return <section className="sales-summary-reference-sheet mx-auto bg-white text-[#191919]">
    <header className="sales-summary-reference-header"><span>{new Date().getFullYear()}</span><h2>REGJISTRI PERMBLEDHES I SHITJEVE</h2><p>{reportPeriod}</p></header>
    {metaFilter && <div className="sales-summary-reference-meta">Pike Shijte: <strong>{metaFilter}</strong></div>}
    <table className="sales-summary-reference-table">
      <thead>
        <tr><th rowSpan={2}>Nr.</th><th colSpan={4}>Dokumenti</th><th rowSpan={2}>Kod i<br />Klientit</th><th colSpan={2}>Vlefte<br />Artikulli</th><th colSpan={3}>Zbritje</th><th rowSpan={2}>Zbritje Gjithsej<br />Vlefta</th><th colSpan={2}>Vlera me Zbritje</th><th colSpan={2}>Vlera ne Mon Baze</th></tr>
        <tr>{tableColumns.slice(1).map(column => <th key={column}><button type="button" onClick={() => onSort(findColumn(column))}>{column}<span aria-hidden="true">{sort?.column === findColumn(column) ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}</span></button></th>)}</tr>
        <tr className="sales-summary-reference-numbers">{tableColumns.map((_, index) => <th key={index}>{index + 1}</th>)}</tr>
      </thead>
      <tbody>
        {isLoading ? <tr><td colSpan={tableColumns.length}>Po ngarkohet...</td></tr> : rows.length === 0 ? <tr><td colSpan={tableColumns.length}>Nuk ka të dhëna.</td></tr> : rows.map((row, rowIndex) => <tr key={rowIndex}>{tableColumns.map((column, index) => <td key={column}>{renderCell(row, column, index)}</td>)}</tr>)}
      </tbody>
      {!isLoading && <tfoot><tr>{tableColumns.map((column, index) => <td key={column}>{index === 0 ? "TOTALI I RAPORTIT" : cellValue(totalFor(column) ?? "")}</td>)}</tr></tfoot>}
    </table>
    <footer className="sales-summary-reference-footer"><span>Printuar nga Sistemi Genit Cloud</span><span>{new Date().toLocaleDateString("sq-AL")}</span></footer>
  </section>;
}

function PurchaseSummaryRegisterReferenceView({ props }: { props: Props }) {
  const { period, columns, rows, meta, isLoading, cellValue, isLinkedDocument, onOpenDocument, sort, onSort } = props;
  const orderedColumns = ["Nr. rend", "Lloji", "Nr.", "Dt. Dok", "Monedha", "Kursi", "Kodi", "Emertimi", "Nentotal", "Zbritje", "TVSH", "Totali", "TVSH bazë", "Totali bazë"];
  const actualColumn = (column: string) => columns.find(item => normalize(item) === normalize(column)) ?? column;
  const totalFor = (column: string) => sumNumericColumn(rows, actualColumn(column));
  const metaValue = (label: string, fallback: string) => meta?.[label] || fallback;
  const renderCell = (row: Row, column: string) => {
    const actual = actualColumn(column);
    return column === "Nr." && isLinkedDocument(row, actual)
      ? <SourceDocumentLink label={cellValue(row[actual])} onOpen={() => onOpenDocument(row)} />
      : cellValue(row[actual]);
  };
  return <section className="purchase-summary-reference-sheet mx-auto bg-white text-[#008000]">
    <header className="purchase-summary-reference-header">
      <h2>{getReferenceTitle("purchase_summary_register_pdf", "REGJISTRI PËRMBLEDHËS I BLERJEVE")}</h2>
    </header>
    <div className="purchase-summary-reference-filters">
      <strong>Filtrat</strong>
      <div><span>Nenkategori:</span><b>{metaValue("Nenkategori", "FB")}</b><span>Ndermarrja:</span><b>{metaValue("Ndermarrja", "Kompania aktive")}</b><span>Dt. Dok.:</span><b>{metaValue("Dt. Dok.", period)}</b></div>
      <div><span>Dt. Regj.:</span><b>{metaValue("Dt. Regj.", period)}</b></div>
    </div>
    <div className="overflow-x-auto">
      <table className="purchase-summary-reference-table">
        <thead>
          <tr><th rowSpan={2}>Nr.<br />rend</th><th colSpan={7}>Dokumenti</th><th colSpan={4}>Monedha Fature</th><th colSpan={2}>Monedha Baze</th></tr>
          <tr>{orderedColumns.slice(1).map(column => <th key={column}><button type="button" onClick={() => onSort(actualColumn(column))}>{column}<span aria-hidden="true">{sort?.column === actualColumn(column) ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}</span></button></th>)}</tr>
        </thead>
        <tbody>
          {isLoading ? <tr><td colSpan={orderedColumns.length}>Po ngarkohet...</td></tr> : rows.length === 0 ? <tr><td colSpan={orderedColumns.length}></td></tr> : rows.map((row, index) => <tr key={index}>{orderedColumns.map(column => <td key={column}>{renderCell(row, column)}</td>)}</tr>)}
        </tbody>
        {!isLoading && <tfoot><tr>{orderedColumns.map((column, index) => <td key={column}>{index === 7 ? "Totali" : index < 7 ? "" : totalFor(column) === null ? "" : cellValue(totalFor(column))}</td>)}</tr></tfoot>}
      </table>
    </div>
    <footer className="purchase-summary-reference-footer"><span>Copyright © IMB<br />Instituti i Modelimeve ne Biznes<br />www.imb.al</span><span>1/1</span></footer>
  </section>;
}

export function ReferenceReportView({ reportKey, module, title, period, columns, rows, metrics, meta, isLoading, cellValue, isLinkedDocument, onOpenDocument, sort, onSort }: Props) {
  if (reportKey === "inventory_product_card_pdf") return <ProductCardReferenceView props={{ reportKey, module, title, period, columns, rows, metrics, meta, isLoading, cellValue, isLinkedDocument, onOpenDocument, sort, onSort }} />;
  if (reportKey === "purchase_supplier_card_pdf" || reportKey === "purchase_supplier_card_format3_pdf") return <SupplierCardSimpleReferenceView props={{ reportKey, module, title, period, columns, rows, metrics, meta, isLoading, cellValue, isLinkedDocument, onOpenDocument, sort, onSort }} />;
  if (reportKey === "sales_customer_statement") return <SupplierCardSimpleReferenceView entity="customer" props={{ reportKey, module, title, period, columns, rows, metrics, meta, isLoading, cellValue, isLinkedDocument, onOpenDocument, sort, onSort }} />;
  if (reportKey === "sales_summary_register_pdf") return <SalesSummaryRegisterReferenceView props={{ reportKey, module, title, period, columns, rows, metrics, meta, isLoading, cellValue, isLinkedDocument, onOpenDocument, sort, onSort }} />;
  if (reportKey === "purchase_summary_register_pdf") return <PurchaseSummaryRegisterReferenceView props={{ reportKey, module, title, period, columns, rows, metrics, meta, isLoading, cellValue, isLinkedDocument, onOpenDocument, sort, onSort }} />;
  if (reportKey === "sales_quantity_total_pdf") return <SalesQuantityTotalReferenceView props={{ reportKey, module, title, period, columns, rows, metrics, meta, isLoading, cellValue, isLinkedDocument, onOpenDocument, sort, onSort }} />;
  if (reportKey === "sales_quantity_pdf") return <SalesQuantityReferenceView props={{ reportKey, module, title, period, columns, rows, metrics, meta, isLoading, cellValue, isLinkedDocument, onOpenDocument, sort, onSort }} />;
  const displayGroups = getReferenceGroups(reportKey, columns);
  const displayColumns = displayGroups.length > 0 ? displayGroups.flatMap(group => group.columns) : columns;
  const hasDisplayGroups = displayGroups.length > 0;
  const isPdfStyle = reportKey.endsWith("_pdf");
  const displayTitle = getReferenceTitle(reportKey, title);
  const columnFor = (column: string) => columns.find(actual => normalize(actual) === normalize(column)) ?? column;
  const metaValue = (label: string) => meta?.[label] ?? (label === "Periudha" || label === "Periudha e maturimit" || label === "Data e raportimit" ? period : "—");
  const totalFor = (column: string) => sumNumericColumn(rows, columnFor(column));
  const isSupplierCard = reportKey === "purchase_supplier_card_pdf";
  const supplierDebit = isSupplierCard ? totalFor("Debi") ?? 0 : 0;
  const supplierCredit = isSupplierCard ? totalFor("Kredi") ?? 0 : 0;
  const supplierEndingProgressive = isSupplierCard ? Number(rows[rows.length - 1]?.[columnFor("Progresivi")] ?? supplierDebit - supplierCredit) : 0;
  const supplierBalance = resolveSupplierBalanceStatus(supplierDebit, supplierCredit);

  return (
    <div className={`reference-report-sheet mx-auto max-w-[1480px] bg-white shadow-sm ring-1 ring-slate-200 ${isPdfStyle ? "p-5 lg:p-7" : "p-4 lg:p-7"}`}>
      {isPdfStyle ? <header className="border-b border-[#4a4a36] pb-3">
        <div className="flex items-start justify-between text-[10px] text-[#25251f]"><span>{new Date().getFullYear()}</span><span>{period}</span></div>
        <h2 className="mt-1 text-center text-base font-bold uppercase text-[#25251f]">{displayTitle}</h2>
      </header> : <header className="border-b-2 border-[#714b67] pb-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#714b67]">{module} · Raport reference</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">Periudha: {period}</p>
      </header>}

      {(REPORT_REFERENCE_META[reportKey] ?? []).length > 0 && <div className={`my-3 flex flex-wrap gap-x-8 gap-y-1 border-b pb-3 text-[10px] ${isPdfStyle ? "border-[#8a8a63] text-[#25251f]" : "border-slate-200 text-slate-500"}`}>
        {(REPORT_REFERENCE_META[reportKey] ?? []).map(label => <span key={label}><strong>{label}:</strong> {metaValue(label)}</span>)}
      </div>}

      {!isPdfStyle && metrics.length > 0 && <div className="my-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(metric => <div key={metric.label} className="border border-[#d8c5d2] bg-[#fcf8fb] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
          <p className="mt-1 text-lg font-bold text-[#714b67]">{reportMetricValue(metric.label, metric.value, rows, columns).toLocaleString("sq-AL")}</p>
        </div>)}
      </div>}

      <div className="overflow-x-auto">
        <table className={`w-full min-w-[850px] border-collapse text-[11px] ${isPdfStyle ? "bg-[#fffef1]" : ""}`}>
          <thead>
            {hasDisplayGroups && <tr className={`${isPdfStyle ? "bg-[#f1f0c8] text-[#25251f]" : "bg-[#e9dce7] text-[#55394f]"} text-[10px] uppercase tracking-wide`}>
              {displayGroups.map(group => <th key={group.label} colSpan={group.columns.length} className={`border px-2 py-1.5 text-center font-bold ${isPdfStyle ? "border-[#8a8a63]" : "border-[#cbb8c8]"}`}>{group.label}</th>)}
            </tr>}
            <tr className={isPdfStyle ? "bg-[#e6e5b5] text-[#25251f]" : "bg-[#714b67] text-white"}>
              {displayColumns.map(column => <th key={column} className={`border px-2 py-2 text-left font-semibold ${isPdfStyle ? "border-[#8a8a63]" : "border-[#87617d]"}`}><button type="button" className="inline-flex items-center gap-1 font-semibold" onClick={() => onSort(column)}>{getReferenceColumnLabel(reportKey, column)}<span aria-hidden="true">{sort?.column === column ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>)}
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={Math.max(columns.length, 1)} className="p-10 text-center text-slate-500">Po ngarkohet...</td></tr> : rows.length === 0 ? <tr><td colSpan={Math.max(columns.length, 1)} className="p-10 text-center text-slate-500">Nuk ka të dhëna.</td></tr> : rows.map((row, index) => <tr key={index} className={`border-b border-slate-200 odd:bg-white even:bg-[#faf8fb] hover:bg-[#f3ebf2] ${isSupplierCard && index === rows.length - 1 ? "supplier-card-simple-last-row" : ""}`}>
              {displayGroups.flatMap(group => group.columns).map(column => {
                const actual = columnFor(column);
                return <td key={column} className="border-x border-slate-100 px-2 py-2 align-middle">{isLinkedDocument(row, actual) ? <SourceDocumentLink label={cellValue(row[actual])} onOpen={() => onOpenDocument(row)} /> : cellValue(row[actual])}</td>;
              })}
            </tr>)}
          </tbody>
                      {!isLoading && <tfoot>{isSupplierCard ? <><tr className={`supplier-card-simple-balance-summary supplier-card-simple-${supplierBalance.status === "DEBITOR" ? "debitor" : supplierBalance.status === "KREDITOR" ? "kreditor" : "balanc"}`}><td colSpan={Math.max(displayColumns.length - 3, 1)}>Gjendja përfundimtare: <strong>{supplierBalance.status}</strong></td><td colSpan={2}>{cellValue(supplierBalance.amount)}</td><td>{cellValue(supplierEndingProgressive)}</td></tr><tr className="supplier-card-simple-total-row">{displayColumns.map((column, index) => { const total = totalFor(column); return <td key={column} className="border-x border-slate-200 px-2 py-2">{index === 0 ? "TOTALI I RAPORTIT" : column === "Progresivi" || column === "Progresivi llogari" ? cellValue(supplierEndingProgressive) : total === null ? "" : cellValue(total)}</td>; })}</tr></> : <tr className={`border-t-2 font-bold ${isPdfStyle ? "border-[#4a4a36] bg-[#f1f0c8] text-[#25251f]" : "border-[#714b67] bg-[#fcf8fb] text-[#714b67]"}`}>{displayColumns.map((column, index) => { const total = totalFor(column); return <td key={column} className="border-x border-slate-200 px-2 py-2">{index === 0 ? getReferenceTotalLabel(reportKey) : total === null ? "" : cellValue(total)}</td>; })}</tr>}</tfoot>}

        </table>
      </div>

      <footer className={`mt-5 flex flex-wrap justify-between gap-2 border-t pt-2 text-[9px] tracking-wide ${isPdfStyle ? "border-[#4a4a36] text-[#25251f]" : "border-slate-300 uppercase text-slate-500"}`}>
        <span>{isPdfStyle ? `Printuar nga Sistemi Genit Cloud · ${new Date().toLocaleDateString("sq-AL")}` : `Sistemi Genit Cloud · ${new Date().toLocaleDateString("sq-AL")}`}</span>
        <span aria-hidden="true">{getReferenceStaticPageLabel()}</span>
      </footer>
    </div>
  );
}
