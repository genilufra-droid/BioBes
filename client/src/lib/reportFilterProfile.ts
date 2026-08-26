import type { ReportModule } from "../../../shared/reportCatalog";

const inventoryDocumentFilterKeys = new Set([
  "inventory_movements",
  "inventory_transfers",
  "inventory_adjustments",
  "inventory_movement_in",
  "inventory_movement_out",
  "inventory_transfer_status",
  "inventory_transfer_register",
  "inventory_adjustment_status",
  "inventory_adjustment_register",
  "inventory_movement_register",
  "inventory_product_card_pdf",
  "inventory_analytic_register_pdf",
]);

const inventoryCurrencyFilterKeys = new Set(["inventory_valuation", "inventory_value_by_product"]);

const accountingDateOnlyKeys = new Set([
  "accounting_trial_balance",
  "accounting_profit_loss",
  "accounting_payments",
  "accounting_journals",
  "accounting_balance_sheet",
  "accounting_general_ledger",
  "accounting_journal_entries",
  "accounting_journal_status",
  "accounting_payment_inbound",
  "accounting_payment_outbound",
  "accounting_payment_status",
  "accounting_revenue_summary",
  "accounting_expense_summary",
  "accounting_net_result",
  "accounting_debit_credit",
]);

const accountingNoFilterKeys = new Set([
  "accounting_taxes",
  "accounting_tax_summary",
  "accounting_active_taxes",
  "accounting_account_register",
]);

export function getLegacyReportFilterVisibility(module: ReportModule, reportKey: string) {
  if (module === "Banka" && ["bank_balances", "bank_account_register", "bank_statements", "bank_transactions", "bank_reconciliation", "bank_transfers"].includes(reportKey)) {
    return { documentNumber: false, documentType: false, currency: false, genericAmountSidebar: false };
  }
  if (module === "CRM" && ["partner_customer_situation_pdf", "partner_supplier_situation_pdf", "partner_customer_card_pdf", "partner_supplier_card_pdf", "partner_customer_card_base_pdf", "partner_supplier_card_base_pdf"].includes(reportKey)) {
    return { documentNumber: false, documentType: false, currency: true, genericAmountSidebar: true };
  }
  if (module === "CRM" && reportKey === "partner_billing_payment_register_pdf") {
    return { documentNumber: true, documentType: true, currency: true, genericAmountSidebar: true };
  }
  if (module === "CRM" && ["crm_pipeline", "crm_activities", "crm_activity_schedule", "crm_overdue_activities", "crm_won", "crm_pipeline_value", "crm_pipeline_forecast", "crm_won_revenue", "crm_won_register", "crm_lost_opportunities", "crm_conversion_analysis", "crm_probability_analysis", "crm_stage_analysis", "crm_performance_summary"].includes(reportKey)) {
    return { documentNumber: false, documentType: false, currency: false, genericAmountSidebar: false };
  }
  if (module === "Shitje" && reportKey === "sales_by_customer_pdf") {
    return { documentNumber: false, documentType: false, currency: false, genericAmountSidebar: false };
  }
  if (module === "Shitje" && ["sales_summary_register_pdf", "sales_analytic_register_pdf"].includes(reportKey)) {
    return { documentNumber: true, documentType: false, currency: true, genericAmountSidebar: true };
  }
  if (module === "Kontabilitet") {
    if (accountingDateOnlyKeys.has(reportKey)) {
      return { documentNumber: false, documentType: false, currency: false, genericAmountSidebar: false };
    }
    if (accountingNoFilterKeys.has(reportKey)) {
      return { documentNumber: false, documentType: false, currency: false, genericAmountSidebar: false };
    }
  }
  if (module === "Blerje") {
    const documentReports = new Set([
      "purchase_invoices", "purchase_orders", "purchase_receipts", "purchase_returns", "purchase_invoice_status",
      "purchase_open_invoices", "purchase_invoice_volume", "purchase_orders_open", "purchase_orders_status",
      "purchase_receipts_by_supplier", "purchase_receipts_timeline", "purchase_returns_analysis", "purchase_returns_status",
      "purchase_spend_trend", "purchase_document_register", "purchase_receipt_control", "purchase_summary_register_pdf",
      "purchase_customs_import_register_pdf", "purchase_invoice_payment_register_pdf",
      "purchase_product_card_alpha", "purchase_items_detail_alpha", "purchase_items_expiry_alpha", "purchase_items_alpha",
      "purchase_items_by_branch_alpha", "purchase_analytic_register_format2_alpha", "purchase_contract_conversion_alpha",
      "purchase_analytic_register_format3_alpha", "purchase_analytic_alpha", "purchase_product_card_format2_alpha",
      "purchase_analytic_detail_alpha", "purchase_monthly_ledger_alpha", "purchase_price_list_alpha",
    ]);
    const supplierReports = new Set([
      "purchase_suppliers", "purchase_supplier_statement", "purchase_top_suppliers", "purchase_supplier_count",
      "purchase_supplier_card_pdf", "purchase_supplier_card_format3_pdf", "purchase_supplier_maturity_pdf",
      "purchase_supplier_maturity_summary_pdf", "purchase_supplier_situation_pdf", "purchase_supplier_situation_category_pdf",
    ]);
    if (supplierReports.has(reportKey)) return { documentNumber: false, documentType: false, currency: true, genericAmountSidebar: true };
    if (documentReports.has(reportKey)) return { documentNumber: true, documentType: true, currency: true, genericAmountSidebar: true };
    return { documentNumber: false, documentType: false, currency: false, genericAmountSidebar: false };
  }
  if (module !== "Magazina") {
    return { documentNumber: true, documentType: true, currency: true, genericAmountSidebar: true };
  }

  return {
    documentNumber: inventoryDocumentFilterKeys.has(reportKey),
    documentType: inventoryDocumentFilterKeys.has(reportKey),
    currency: inventoryCurrencyFilterKeys.has(reportKey),
    genericAmountSidebar: false,
  };
}
