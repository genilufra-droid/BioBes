import { describe, expect, it } from "vitest";
import { getLegacyReportFilterVisibility } from "./reportFilterProfile";

describe("legacy report filter visibility", () => {
  it("keeps only warehouse/product/date filters for stock-by-product", () => {
    expect(getLegacyReportFilterVisibility("Magazina", "inventory_stock_by_product")).toEqual({
      documentNumber: false,
      documentType: false,
      currency: false,
      genericAmountSidebar: false,
    });
  });

  it("keeps currency for valuation reports", () => {
    expect(getLegacyReportFilterVisibility("Magazina", "inventory_valuation")).toEqual({
      documentNumber: false,
      documentType: false,
      currency: true,
      genericAmountSidebar: false,
    });
  });

  it("hides unsupported filters for bank balance and transaction reports", () => {
    for (const reportKey of ["bank_balances", "bank_account_register", "bank_statements", "bank_transactions", "bank_reconciliation", "bank_transfers"]) {
      expect(getLegacyReportFilterVisibility("Banka", reportKey)).toEqual({
        documentNumber: false,
        documentType: false,
        currency: false,
        genericAmountSidebar: false,
      });
    }
  });

  it("hides unsupported filters for the CRM pipeline", () => {
    expect(getLegacyReportFilterVisibility("CRM", "crm_pipeline")).toEqual({
      documentNumber: false,
      documentType: false,
      currency: false,
      genericAmountSidebar: false,
    });
  });

  it("hides unsupported filters for CRM activity reports", () => {
    for (const reportKey of ["crm_activities", "crm_activity_schedule", "crm_overdue_activities", "crm_won", "crm_pipeline_value", "crm_pipeline_forecast", "crm_won_revenue", "crm_won_register", "crm_lost_opportunities", "crm_conversion_analysis", "crm_probability_analysis", "crm_stage_analysis", "crm_performance_summary"]) {
      expect(getLegacyReportFilterVisibility("CRM", reportKey)).toEqual({
        documentNumber: false,
        documentType: false,
        currency: false,
        genericAmountSidebar: false,
      });
    }
  });

  it("hides unsupported filters for sales by customer aggregates", () => {
    expect(getLegacyReportFilterVisibility("Shitje", "sales_by_customer_pdf")).toEqual({
      documentNumber: false,
      documentType: false,
      currency: false,
      genericAmountSidebar: false,
    });
  });

  it("keeps only real document, currency and amount filters for sales reference registers", () => {
    for (const reportKey of ["sales_summary_register_pdf", "sales_analytic_register_pdf"]) {
      expect(getLegacyReportFilterVisibility("Shitje", reportKey)).toEqual({
        documentNumber: true,
        documentType: false,
        currency: true,
        genericAmountSidebar: true,
      });
    }
  });

  it("keeps the Alpha document filter set for every purchase workspace model", () => {
    for (const reportKey of ["purchase_summary_register_pdf", "purchase_product_card_alpha", "purchase_items_detail_alpha", "purchase_items_expiry_alpha", "purchase_items_alpha", "purchase_items_by_branch_alpha", "purchase_analytic_register_format2_alpha", "purchase_contract_conversion_alpha", "purchase_analytic_register_format3_alpha", "purchase_analytic_alpha", "purchase_product_card_format2_alpha", "purchase_analytic_detail_alpha", "purchase_monthly_ledger_alpha", "purchase_price_list_alpha", "purchase_customs_import_register_pdf", "purchase_invoice_payment_register_pdf"]) {
      expect(getLegacyReportFilterVisibility("Blerje", reportKey)).toEqual({
        documentNumber: true,
        documentType: true,
        currency: true,
        genericAmountSidebar: true,
      });
    }
  });

  it("hides generic filters for accounting date-based reports and variants", () => {
    for (const reportKey of ["accounting_trial_balance", "accounting_profit_loss", "accounting_payments", "accounting_journals", "accounting_balance_sheet", "accounting_general_ledger", "accounting_journal_entries", "accounting_journal_status", "accounting_payment_inbound", "accounting_payment_outbound", "accounting_payment_status", "accounting_revenue_summary", "accounting_expense_summary", "accounting_net_result", "accounting_debit_credit"]) {
      expect(getLegacyReportFilterVisibility("Kontabilitet", reportKey)).toEqual({
        documentNumber: false,
        documentType: false,
        currency: false,
        genericAmountSidebar: false,
      });
    }
  });

  it("hides generic filters for accounting tax and account reports", () => {
    for (const reportKey of ["accounting_taxes", "accounting_tax_summary", "accounting_active_taxes", "accounting_account_register"]) {
      expect(getLegacyReportFilterVisibility("Kontabilitet", reportKey)).toEqual({
        documentNumber: false,
        documentType: false,
        currency: false,
        genericAmountSidebar: false,
      });
    }
  });

  it("keeps only supplier and currency filters for supplier purchase reports", () => {
    expect(getLegacyReportFilterVisibility("Blerje", "purchase_supplier_card_pdf")).toEqual({
      documentNumber: false,
      documentType: false,
      currency: true,
      genericAmountSidebar: true,
    });
  });

  it("keeps document filters for purchase document reports", () => {
    expect(getLegacyReportFilterVisibility("Blerje", "purchase_invoices")).toEqual({
      documentNumber: true,
      documentType: true,
      currency: true,
      genericAmountSidebar: true,
    });
  });
});
