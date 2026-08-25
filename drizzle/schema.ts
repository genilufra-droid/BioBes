import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  /** Optional scrypt hash used only by the self-hosted local auth adapter. */
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// MULTI-COMPANY & ORGANIZATION
// ============================================================
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nipt: varchar("nipt", { length: 50 }),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  bank: varchar("bank", { length: 255 }),
  iban: varchar("iban", { length: 50 }),
  currency: varchar("currency", { length: 10 }).default("ALL"),
  invoiceFooter: text("invoiceFooter"),
  accountingPlan: varchar("accountingPlan", { length: 20 }).default("PKP").notNull(),
  postingMode: varchar("postingMode", { length: 20 }).default("INDIRECT").notNull(),
  customerDueEnabled: int("customerDueEnabled").default(0).notNull(),
  supplierDueEnabled: int("supplierDueEnabled").default(0).notNull(),
  salesPriceMode: varchar("salesPriceMode", { length: 20 }).default("NET").notNull(),
  itemDetailing: int("itemDetailing").default(0).notNull(),
  allowDocumentEditAfterSave: int("allowDocumentEditAfterSave").default(0).notNull(),
  archiveEnabled: int("archiveEnabled").default(0).notNull(),
  automaticBackupReminder: int("automaticBackupReminder").default(0).notNull(),
  customFieldsCustomers: int("customFieldsCustomers").default(0).notNull(),
  customFieldsSuppliers: int("customFieldsSuppliers").default(0).notNull(),
  customFieldsProducts: int("customFieldsProducts").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// Link users to companies
export const userCompanies = mysqlTable("userCompanies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["owner", "admin", "user", "viewer"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [uniqueIndex("userCompanies_user_company_unique").on(table.userId, table.companyId)]);

export type UserCompany = typeof userCompanies.$inferSelect;
export type InsertUserCompany = typeof userCompanies.$inferInsert;

// ============================================================
// MASTER DATA
// ============================================================
export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  nipt: varchar("nipt", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  profileData: text("profileData"), // JSON: titulli, kontaktet, kategoritë, maturimi, kreditë, zbritjet, autorizimi
  balance: int("balance").default(0), // in cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  nipt: varchar("nipt", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  profileData: text("profileData"), // JSON: titulli, kontaktet, kategoritë, maturimi, kreditë, zbritjet, autorizimi
  balance: int("balance").default(0), // in cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const issuers = mysqlTable("issuers", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Issuer = typeof issuers.$inferSelect;
export type InsertIssuer = typeof issuers.$inferInsert;

export const documentGroups = mysqlTable("document_groups", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  documentType: varchar("documentType", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DocumentGroup = typeof documentGroups.$inferSelect;
export type InsertDocumentGroup = typeof documentGroups.$inferInsert;

export const costCenters = mysqlTable("cost_centers", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  active: int("active").default(1).notNull(),
  mainProduction: int("mainProduction").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CostCenter = typeof costCenters.$inferSelect;
export type InsertCostCenter = typeof costCenters.$inferInsert;

export const units = mysqlTable("units", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  abbreviation: varchar("abbreviation", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Unit = typeof units.$inferSelect;
export type InsertUnit = typeof units.$inferInsert;

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  barcode: varchar("barcode", { length: 100 }),
  categoryId: int("categoryId").references(() => categories.id, { onDelete: "set null" }),
  baseUnit: varchar("baseUnit", { length: 50 }),
  itemType: mysqlEnum("itemType", ["QARKULLUES", "AFATGJATE", "SHERBIM"]).default("QARKULLUES").notNull(),
  stock: int("stock").default(0),
  minStock: int("minStock").default(0),
  avgPrice: int("avgPrice").default(0), // in cents
  lastPrice: int("lastPrice").default(0), // in cents
  price1: int("price1").default(0), // in cents
  price2: int("price2").default(0), // in cents
  discount1: int("discount1").default(0), // basis points
  discount2: int("discount2").default(0), // basis points
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const warehouses = mysqlTable("warehouses", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  unitType: mysqlEnum("unitType", ["WAREHOUSE", "POINT_OF_SALE", "OFFICE", "OTHER"]).default("WAREHOUSE").notNull(),
  active: int("active").default(1).notNull(),
  address: varchar("address", { length: 255 }),
  location: varchar("location", { length: 255 }),
  contact: varchar("contact", { length: 255 }),
  notes: text("notes"),
  inventoryMethod: mysqlEnum("inventoryMethod", ["INTERMEDIATE", "CONTINUOUS", "INVENTORY"]).default("INTERMEDIATE").notNull(),
  supplyPointOfSale: int("supplyPointOfSale").default(0).notNull(),
  allowNegativeStock: int("allowNegativeStock").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = typeof warehouses.$inferInsert;

export const stockLocations = mysqlTable("stockLocations", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  warehouseId: int("warehouseId").notNull().references(() => warehouses.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  locationType: mysqlEnum("locationType", ["INTERNAL", "INPUT", "OUTPUT", "VIRTUAL"]).default("INTERNAL").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StockLocation = typeof stockLocations.$inferSelect;
export type InsertStockLocation = typeof stockLocations.$inferInsert;

export const stockMovements = mysqlTable("stockMovements", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  docNumber: varchar("docNumber", { length: 50 }).notNull(),
  movementDate: timestamp("movementDate").notNull(),
  movementType: mysqlEnum("movementType", ["IN", "OUT", "TRANSFER", "ADJUSTMENT"]).notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  warehouseId: int("warehouseId"),
  sourceLocationId: int("sourceLocationId"),
  destinationLocationId: int("destinationLocationId"),
  referenceType: varchar("referenceType", { length: 50 }),
  referenceId: int("referenceId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = typeof stockMovements.$inferInsert;

export const stockBalances = mysqlTable("stockBalances", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  warehouseId: int("warehouseId").notNull(),
  // Lokacioni 0 përfaqëson stokun e magazinës kur një dokument nuk cakton zonë fizike.
  locationId: int("locationId").default(0).notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  uniqueIndex("stockBalances_company_warehouse_location_product_unique").on(table.companyId, table.warehouseId, table.locationId, table.productId),
]);

export type StockBalance = typeof stockBalances.$inferSelect;
export type InsertStockBalance = typeof stockBalances.$inferInsert;

export const stockTransfers = mysqlTable("stockTransfers", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  docNumber: varchar("docNumber", { length: 50 }).notNull(),
  transferDate: timestamp("transferDate").notNull(),
  sourceWarehouseId: int("sourceWarehouseId").notNull(),
  destinationWarehouseId: int("destinationWarehouseId").notNull(),
  sourceLocationId: int("sourceLocationId"),
  destinationLocationId: int("destinationLocationId"),
  status: mysqlEnum("status", ["DRAFT", "VALIDATED", "CANCELLED"]).default("DRAFT").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StockTransfer = typeof stockTransfers.$inferSelect;
export type InsertStockTransfer = typeof stockTransfers.$inferInsert;

export const stockTransferItems = mysqlTable("stockTransferItems", {
  id: int("id").autoincrement().primaryKey(),
  stockTransferId: int("stockTransferId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  unit: varchar("unit", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StockTransferItem = typeof stockTransferItems.$inferSelect;
export type InsertStockTransferItem = typeof stockTransferItems.$inferInsert;

export const inventoryAdjustments = mysqlTable("inventoryAdjustments", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  docNumber: varchar("docNumber", { length: 50 }).notNull(),
  adjustmentDate: timestamp("adjustmentDate").notNull(),
  warehouseId: int("warehouseId"),
  locationId: int("locationId"),
  status: mysqlEnum("status", ["DRAFT", "VALIDATED", "CANCELLED"]).default("DRAFT").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InventoryAdjustment = typeof inventoryAdjustments.$inferSelect;
export type InsertInventoryAdjustment = typeof inventoryAdjustments.$inferInsert;

export const inventoryAdjustmentItems = mysqlTable("inventoryAdjustmentItems", {
  id: int("id").autoincrement().primaryKey(),
  inventoryAdjustmentId: int("inventoryAdjustmentId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  countedQuantity: int("countedQuantity").notNull(),
  systemQuantity: int("systemQuantity").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InventoryAdjustmentItem = typeof inventoryAdjustmentItems.$inferSelect;
export type InsertInventoryAdjustmentItem = typeof inventoryAdjustmentItems.$inferInsert;

// ============================================================
// ACCOUNTING
// ============================================================

export const chartOfAccounts = mysqlTable("chartOfAccounts", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  code: varchar("code", { length: 30 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  accountType: mysqlEnum("accountType", ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"]).notNull(),
  parentId: int("parentId"),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("chartOfAccounts_company_code_unique").on(table.companyId, table.code)]);

export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type InsertChartOfAccount = typeof chartOfAccounts.$inferInsert;

export const journals = mysqlTable("journals", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  journalType: mysqlEnum("journalType", ["SALE", "PURCHASE", "BANK", "CASH", "GENERAL"]).notNull(),
  defaultDebitAccountId: int("defaultDebitAccountId"),
  defaultCreditAccountId: int("defaultCreditAccountId"),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [uniqueIndex("journals_company_code_unique").on(table.companyId, table.code)]);

export type Journal = typeof journals.$inferSelect;
export type InsertJournal = typeof journals.$inferInsert;

export const journalEntries = mysqlTable("journalEntries", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  journalId: int("journalId").notNull(),
  entryNumber: varchar("entryNumber", { length: 50 }).notNull(),
  entryDate: timestamp("entryDate").notNull(),
  reference: varchar("reference", { length: 100 }),
  status: mysqlEnum("status", ["DRAFT", "POSTED", "CANCELLED"]).default("DRAFT").notNull(),
  totalDebit: int("totalDebit").default(0).notNull(),
  totalCredit: int("totalCredit").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("journalEntries_company_number_unique").on(table.companyId, table.entryNumber)]);

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

export const journalEntryLines = mysqlTable("journalEntryLines", {
  id: int("id").autoincrement().primaryKey(),
  journalEntryId: int("journalEntryId").notNull(),
  accountId: int("accountId").notNull(),
  description: varchar("description", { length: 500 }),
  debit: int("debit").default(0).notNull(),
  credit: int("credit").default(0).notNull(),
  partnerType: mysqlEnum("partnerType", ["SUPPLIER", "CUSTOMER"]),
  partnerId: int("partnerId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JournalEntryLine = typeof journalEntryLines.$inferSelect;
export type InsertJournalEntryLine = typeof journalEntryLines.$inferInsert;

export const taxRates = mysqlTable("taxRates", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  code: varchar("code", { length: 30 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  rate: int("rate").notNull(),
  taxType: mysqlEnum("taxType", ["SALE", "PURCHASE", "BOTH"]).default("BOTH").notNull(),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [uniqueIndex("taxRates_company_code_unique").on(table.companyId, table.code)]);

export type TaxRate = typeof taxRates.$inferSelect;
export type InsertTaxRate = typeof taxRates.$inferInsert;

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  paymentNumber: varchar("paymentNumber", { length: 50 }).notNull(),
  paymentDate: timestamp("paymentDate").notNull(),
  paymentType: mysqlEnum("paymentType", ["INBOUND", "OUTBOUND"]).notNull(),
  partnerType: mysqlEnum("partnerType", ["SUPPLIER", "CUSTOMER"]),
  partnerId: int("partnerId"),
  partnerName: varchar("partnerName", { length: 255 }),
  journalId: int("journalId"),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("ALL").notNull(),
  exchangeRate: decimal("exchangeRate", { precision: 18, scale: 6 }).default("1.000000").notNull(),
  method: mysqlEnum("method", ["CASH", "BANK", "CARD", "OTHER"]).default("CASH").notNull(),
  reference: varchar("reference", { length: 100 }),
  status: mysqlEnum("status", ["DRAFT", "POSTED", "CANCELLED"]).default("DRAFT").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("payments_company_number_unique").on(table.companyId, table.paymentNumber)]);

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// ============================================================
// CRM
// ============================================================

export const crmLeads = mysqlTable("crmLeads", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  leadNumber: varchar("leadNumber", { length: 50 }).notNull(),
  leadType: mysqlEnum("leadType", ["LEAD", "OPPORTUNITY"]).default("LEAD").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  companyName: varchar("companyName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  source: varchar("source", { length: 100 }),
  stage: mysqlEnum("stage", ["NEW", "QUALIFIED", "PROPOSAL", "WON", "LOST"]).default("NEW").notNull(),
  expectedRevenue: int("expectedRevenue").default(0).notNull(),
  probability: int("probability").default(0).notNull(),
  assignedUserId: int("assignedUserId"),
  customerId: int("customerId"),
  nextActivityDate: timestamp("nextActivityDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("crmLeads_company_number_unique").on(table.companyId, table.leadNumber)]);

export type CrmLead = typeof crmLeads.$inferSelect;
export type InsertCrmLead = typeof crmLeads.$inferInsert;

export const crmActivities = mysqlTable("crmActivities", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  leadId: int("leadId").notNull(),
  activityType: mysqlEnum("activityType", ["CALL", "EMAIL", "MEETING", "TODO"]).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  dueDate: timestamp("dueDate").notNull(),
  status: mysqlEnum("status", ["PLANNED", "DONE", "CANCELLED"]).default("PLANNED").notNull(),
  notes: text("notes"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CrmActivity = typeof crmActivities.$inferSelect;
export type InsertCrmActivity = typeof crmActivities.$inferInsert;

// ============================================================
// BANKING
// ============================================================

export const bankAccounts = mysqlTable("bankAccounts", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  accountName: varchar("accountName", { length: 255 }).notNull(),
  bankName: varchar("bankName", { length: 255 }),
  iban: varchar("iban", { length: 64 }),
  currency: varchar("currency", { length: 10 }).default("EUR").notNull(),
  openingBalance: int("openingBalance").default(0).notNull(),
  currentBalance: int("currentBalance").default(0).notNull(),
  accountType: mysqlEnum("accountType", ["BANK", "CASH"]).default("BANK").notNull(),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = typeof bankAccounts.$inferInsert;

export const bankStatements = mysqlTable("bankStatements", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  bankAccountId: int("bankAccountId").notNull(),
  statementNumber: varchar("statementNumber", { length: 50 }).notNull(),
  dateFrom: timestamp("dateFrom").notNull(),
  dateTo: timestamp("dateTo").notNull(),
  openingBalance: int("openingBalance").default(0).notNull(),
  closingBalance: int("closingBalance").default(0).notNull(),
  status: mysqlEnum("status", ["DRAFT", "RECONCILED", "CANCELLED"]).default("DRAFT").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("bankStatements_company_number_unique").on(table.companyId, table.statementNumber)]);

export type BankStatement = typeof bankStatements.$inferSelect;
export type InsertBankStatement = typeof bankStatements.$inferInsert;

export const bankTransfers = mysqlTable("bankTransfers", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  transferNumber: varchar("transferNumber", { length: 50 }).notNull(),
  transferDate: timestamp("transferDate").notNull(),
  sourceBankAccountId: int("sourceBankAccountId").notNull(),
  destinationBankAccountId: int("destinationBankAccountId").notNull(),
  amount: int("amount").notNull(),
  status: mysqlEnum("status", ["DRAFT", "POSTED", "CANCELLED"]).default("DRAFT").notNull(),
  reference: varchar("reference", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("bankTransfers_company_number_unique").on(table.companyId, table.transferNumber)]);

export type BankTransfer = typeof bankTransfers.$inferSelect;
export type InsertBankTransfer = typeof bankTransfers.$inferInsert;

export const bankTransactions = mysqlTable("bankTransactions", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  bankStatementId: int("bankStatementId").notNull(),
  transactionDate: timestamp("transactionDate").notNull(),
  reference: varchar("reference", { length: 100 }),
  description: varchar("description", { length: 500 }).notNull(),
  transactionType: mysqlEnum("transactionType", ["CREDIT", "DEBIT"]).notNull(),
  amount: int("amount").notNull(),
  status: mysqlEnum("status", ["UNRECONCILED", "RECONCILED"]).default("UNRECONCILED").notNull(),
  paymentId: int("paymentId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BankTransaction = typeof bankTransactions.$inferSelect;
export type InsertBankTransaction = typeof bankTransactions.$inferInsert;

export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  code: varchar("code", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  licenseNumber: varchar("licenseNumber", { length: 100 }),
  status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  plateNumber: varchar("plateNumber", { length: 50 }).notNull(),
  vehicleType: varchar("vehicleType", { length: 100 }),
  makeModel: varchar("makeModel", { length: 255 }),
  capacityKg: int("capacityKg").default(0),
  driverId: int("driverId"),
  status: mysqlEnum("status", ["ACTIVE", "MAINTENANCE", "INACTIVE"]).default("ACTIVE").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

export const cargoLoads = mysqlTable("cargoLoads", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  loadNumber: varchar("loadNumber", { length: 50 }).notNull(),
  loadDate: timestamp("loadDate").notNull(),
  customerId: int("customerId"),
  customerName: varchar("customerName", { length: 255 }),
  driverId: int("driverId"),
  vehicleId: int("vehicleId"),
  purchaseOrderId: int("purchaseOrderId"),
  origin: varchar("origin", { length: 255 }),
  destination: varchar("destination", { length: 255 }),
  weightKg: int("weightKg").default(0),
  status: mysqlEnum("status", ["DRAFT", "ASSIGNED", "IN_TRANSIT", "DELIVERED", "CANCELLED"]).default("DRAFT").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CargoLoad = typeof cargoLoads.$inferSelect;
export type InsertCargoLoad = typeof cargoLoads.$inferInsert;

export const cargoLoadDocuments = mysqlTable("cargoLoadDocuments", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  cargoLoadId: int("cargoLoadId").notNull(),
  purchaseOrderId: int("purchaseOrderId"),
  purchaseInvoiceId: int("purchaseInvoiceId"),
  salesOrderId: int("salesOrderId"),
  salesInvoiceId: int("salesInvoiceId"),
  documentType: varchar("documentType", { length: 80 }).default("OTHER").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 700 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 900 }).notNull(),
  mimeType: varchar("mimeType", { length: 180 }),
  fileSize: int("fileSize").default(0).notNull(),
  uploadedBy: int("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [uniqueIndex("cargoLoadDocuments_company_key_unique").on(table.companyId, table.fileKey)]);

export type CargoLoadDocument = typeof cargoLoadDocuments.$inferSelect;
export type InsertCargoLoadDocument = typeof cargoLoadDocuments.$inferInsert;

// ============================================================
// WEIGHT FORMS (Formulari i Peshave)
// ============================================================
export const weightForms = mysqlTable("weightForms", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  docNumber: varchar("docNumber", { length: 50 }).notNull(),
  date: timestamp("date").notNull(),
  supplierId: int("supplierId"),
  productId: int("productId"),
  supplierName: varchar("supplierName", { length: 255 }),
  productName: varchar("productName", { length: 255 }),
  grossWeightTotal: int("grossWeightTotal").default(0), // in grams
  netWeightAfterPercent: int("netWeightAfterPercent").default(0), // in grams
  totalBagCount: int("totalBagCount").default(0),
  status: mysqlEnum("status", ["DRAFT", "POSTED", "CANCELLED"]).default("DRAFT"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WeightForm = typeof weightForms.$inferSelect;
export type InsertWeightForm = typeof weightForms.$inferInsert;

export const weightFormLines = mysqlTable("weightFormLines", {
  id: int("id").autoincrement().primaryKey(),
  weightFormId: int("weightFormId").notNull(),
  bagCount: int("bagCount"),
  sacks: int("sacks"),
  grossWeight: int("grossWeight"), // in grams
  netWeight: int("netWeight"), // in grams
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeightFormLine = typeof weightFormLines.$inferSelect;
export type InsertWeightFormLine = typeof weightFormLines.$inferInsert;

// ============================================================
// PURCHASE DOCUMENTS
// ============================================================
export const purchaseInvoices = mysqlTable("purchaseInvoices", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  docNumber: varchar("docNumber", { length: 50 }).notNull(),
  date: timestamp("date").notNull(),
  dueDate: timestamp("dueDate"),
  supplierId: int("supplierId"),
  supplierName: varchar("supplierName", { length: 255 }),
  warehouseId: int("warehouseId"),
  currency: varchar("currency", { length: 10 }).default("ALL").notNull(),
  exchangeRate: decimal("exchangeRate", { precision: 14, scale: 6 }).default("1.000000").notNull(),
  totalAmount: int("totalAmount").default(0), // in cents of document currency
  vatAmount: int("vatAmount").default(0), // in cents
  carrierName: varchar("carrierName", { length: 255 }),
  vehiclePlate: varchar("vehiclePlate", { length: 50 }),
  inventoryReference: varchar("inventoryReference", { length: 100 }),
  status: mysqlEnum("status", ["DRAFT", "POSTED", "PAID", "CANCELLED"]).default("DRAFT"),
  paymentStatus: mysqlEnum("paymentStatus", ["UNPAID", "PAID", "LATER"]).default("UNPAID").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PurchaseInvoice = typeof purchaseInvoices.$inferSelect;
export type InsertPurchaseInvoice = typeof purchaseInvoices.$inferInsert;

export const purchaseItems = mysqlTable("purchaseItems", {
  id: int("id").autoincrement().primaryKey(),
  purchaseInvoiceId: int("purchaseInvoiceId").notNull(),
  productId: int("productId"),
  productName: varchar("productName", { length: 255 }),
  quantity: int("quantity").default(0),
  unit: varchar("unit", { length: 50 }),
  unitPrice: int("unitPrice").default(0), // in cents
  totalPrice: int("totalPrice").default(0), // in cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PurchaseItem = typeof purchaseItems.$inferSelect;
export type InsertPurchaseItem = typeof purchaseItems.$inferInsert;

// Purchase workflow: Purchase Order → Receipt → Vendor Bill / Return
export const purchaseOrders = mysqlTable("purchaseOrders", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  docNumber: varchar("docNumber", { length: 50 }).notNull(),
  orderDate: timestamp("orderDate").notNull(),
  expectedDate: timestamp("expectedDate"),
  supplierId: int("supplierId"),
  supplierName: varchar("supplierName", { length: 255 }),
  customerReference: varchar("customerReference", { length: 100 }),
  totalAmount: int("totalAmount").default(0).notNull(),
  status: mysqlEnum("status", ["DRAFT", "CONFIRMED", "RECEIVED", "CANCELLED"]).default("DRAFT").notNull(),
  operationalStatus: mysqlEnum("operationalStatus", ["IN_PROGRESS", "LOADED", "SENT", "COMPLETED"]).default("IN_PROGRESS").notNull(),
  notes: text("notes"),
  preparationResponsible: varchar("preparationResponsible", { length: 255 }),
  loadingResponsible: varchar("loadingResponsible", { length: 255 }),
  documentationResponsible: varchar("documentationResponsible", { length: 255 }),
  verifierName: varchar("verifierName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;

export const purchaseOrderItems = mysqlTable("purchaseOrderItems", {
  id: int("id").autoincrement().primaryKey(),
  purchaseOrderId: int("purchaseOrderId").notNull(),
  productId: int("productId"),
  productName: varchar("productName", { length: 255 }).notNull(),
  plantType: varchar("plantType", { length: 100 }),
  productCode: varchar("productCode", { length: 100 }),
  sackCount: int("sackCount"),
  grossWeightKg: int("grossWeightKg"),
  netWeightKg: int("netWeightKg"),
  quantity: int("quantity").default(0).notNull(),
  loadedQuantity: int("loadedQuantity").default(0).notNull(),
  receivedQuantity: int("receivedQuantity").default(0).notNull(),
  unit: varchar("unit", { length: 50 }),
  unitPrice: int("unitPrice").default(0).notNull(),
  totalPrice: int("totalPrice").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = typeof purchaseOrderItems.$inferInsert;

export const purchaseOrderAttachments = mysqlTable("purchaseOrderAttachments", {
  id: int("id").autoincrement().primaryKey(),
  purchaseOrderId: int("purchaseOrderId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 700 }).notNull(),
  mimeType: varchar("mimeType", { length: 150 }),
  fileSize: int("fileSize").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PurchaseOrderAttachment = typeof purchaseOrderAttachments.$inferSelect;
export type InsertPurchaseOrderAttachment = typeof purchaseOrderAttachments.$inferInsert;

export const purchaseReceipts = mysqlTable("purchaseReceipts", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  docNumber: varchar("docNumber", { length: 50 }).notNull(),
  receiptDate: timestamp("receiptDate").notNull(),
  purchaseOrderId: int("purchaseOrderId"),
  supplierId: int("supplierId"),
  supplierName: varchar("supplierName", { length: 255 }),
  warehouseId: int("warehouseId"),
  status: mysqlEnum("status", ["DRAFT", "VALIDATED", "CANCELLED"]).default("DRAFT").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PurchaseReceipt = typeof purchaseReceipts.$inferSelect;
export type InsertPurchaseReceipt = typeof purchaseReceipts.$inferInsert;

export const purchaseReceiptItems = mysqlTable("purchaseReceiptItems", {
  id: int("id").autoincrement().primaryKey(),
  purchaseReceiptId: int("purchaseReceiptId").notNull(),
  productId: int("productId"),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: int("quantity").default(0).notNull(),
  unit: varchar("unit", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PurchaseReceiptItem = typeof purchaseReceiptItems.$inferSelect;
export type InsertPurchaseReceiptItem = typeof purchaseReceiptItems.$inferInsert;

export const purchaseReturns = mysqlTable("purchaseReturns", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  docNumber: varchar("docNumber", { length: 50 }).notNull(),
  returnDate: timestamp("returnDate").notNull(),
  supplierId: int("supplierId"),
  supplierName: varchar("supplierName", { length: 255 }),
  purchaseReceiptId: int("purchaseReceiptId"),
  status: mysqlEnum("status", ["DRAFT", "VALIDATED", "CANCELLED"]).default("DRAFT").notNull(),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PurchaseReturn = typeof purchaseReturns.$inferSelect;
export type InsertPurchaseReturn = typeof purchaseReturns.$inferInsert;

export const purchaseReturnItems = mysqlTable("purchaseReturnItems", {
  id: int("id").autoincrement().primaryKey(),
  purchaseReturnId: int("purchaseReturnId").notNull(),
  productId: int("productId"),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: int("quantity").default(0).notNull(),
  unit: varchar("unit", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PurchaseReturnItem = typeof purchaseReturnItems.$inferSelect;
export type InsertPurchaseReturnItem = typeof purchaseReturnItems.$inferInsert;

export const creditNotes = mysqlTable("creditNotes", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  creditNoteNumber: varchar("creditNoteNumber", { length: 50 }).notNull(),
  noteDate: timestamp("noteDate").notNull(),
  sourceType: mysqlEnum("sourceType", ["PURCHASE", "SALE"]).notNull(),
  sourceInvoiceId: int("sourceInvoiceId"),
  sourceInvoiceNumber: varchar("sourceInvoiceNumber", { length: 50 }),
  partnerName: varchar("partnerName", { length: 255 }),
  amount: int("amount").default(0).notNull(),
  vatAmount: int("vatAmount").default(0).notNull(),
  reason: text("reason"),
  status: mysqlEnum("status", ["DRAFT", "POSTED", "CANCELLED"]).default("DRAFT").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("creditNotes_company_number_unique").on(table.companyId, table.creditNoteNumber)]);

export type CreditNote = typeof creditNotes.$inferSelect;
export type InsertCreditNote = typeof creditNotes.$inferInsert;

// ============================================================
// SALES DOCUMENTS
// ============================================================
export const salesInvoices = mysqlTable("salesInvoices", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  docNumber: varchar("docNumber", { length: 50 }).notNull(),
  date: timestamp("date").notNull(),
  dueDate: timestamp("dueDate"),
  customerId: int("customerId"),
  customerName: varchar("customerName", { length: 255 }),
  warehouseId: int("warehouseId"),
  salesOrderId: int("salesOrderId"),
  deliveryNoteId: int("deliveryNoteId"),
  currency: varchar("currency", { length: 10 }).default("ALL").notNull(),
  exchangeRate: decimal("exchangeRate", { precision: 14, scale: 6 }).default("1.000000").notNull(),
  invoiceFormat: varchar("invoiceFormat", { length: 20 }).default("DOMESTIC").notNull(), // DOMESTIC or EXPORT
  exportDetails: text("exportDetails"), // JSON metadata for export invoice only
  totalAmount: int("totalAmount").default(0), // in cents of document currency
  vatAmount: int("vatAmount").default(0).notNull(), // in cents of document currency
  status: mysqlEnum("status", ["DRAFT", "POSTED", "PAID", "CANCELLED"]).default("DRAFT"),
  paymentStatus: mysqlEnum("paymentStatus", ["UNPAID", "PAID", "LATER"]).default("UNPAID").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SalesInvoice = typeof salesInvoices.$inferSelect;
export type InsertSalesInvoice = typeof salesInvoices.$inferInsert;

export const salesItems = mysqlTable("salesItems", {
  id: int("id").autoincrement().primaryKey(),
  salesInvoiceId: int("salesInvoiceId").notNull(),
  productId: int("productId"),
  productName: varchar("productName", { length: 255 }),
  quantity: int("quantity").default(0),
  unit: varchar("unit", { length: 50 }),
  unitPrice: int("unitPrice").default(0), // in cents
  totalPrice: int("totalPrice").default(0), // in cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SalesItem = typeof salesItems.$inferSelect;
export type InsertSalesItem = typeof salesItems.$inferInsert;

// Sales workflow: Quotation → Sales Order → Delivery → Invoice / Return
export const salesQuotations = mysqlTable("salesQuotations", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  docNumber: varchar("docNumber", { length: 50 }).notNull(),
  quotationDate: timestamp("quotationDate").notNull(),
  validityDate: timestamp("validityDate"),
  customerId: int("customerId"),
  customerName: varchar("customerName", { length: 255 }),
  totalAmount: int("totalAmount").default(0).notNull(),
  status: mysqlEnum("status", ["DRAFT", "SENT", "ACCEPTED", "EXPIRED", "CANCELLED"]).default("DRAFT").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SalesQuotation = typeof salesQuotations.$inferSelect;
export type InsertSalesQuotation = typeof salesQuotations.$inferInsert;

export const salesQuotationItems = mysqlTable("salesQuotationItems", {
  id: int("id").autoincrement().primaryKey(),
  salesQuotationId: int("salesQuotationId").notNull(),
  productId: int("productId"),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: int("quantity").default(0).notNull(),
  unit: varchar("unit", { length: 50 }),
  unitPrice: int("unitPrice").default(0).notNull(),
  totalPrice: int("totalPrice").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SalesQuotationItem = typeof salesQuotationItems.$inferSelect;
export type InsertSalesQuotationItem = typeof salesQuotationItems.$inferInsert;

export const salesOrders = mysqlTable("salesOrders", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  docNumber: varchar("docNumber", { length: 50 }).notNull(),
  orderDate: timestamp("orderDate").notNull(),
  expectedDate: timestamp("expectedDate"),
  customerId: int("customerId"),
  customerName: varchar("customerName", { length: 255 }),
  quotationId: int("quotationId"),
  totalAmount: int("totalAmount").default(0).notNull(),
  status: mysqlEnum("status", ["DRAFT", "CONFIRMED", "DELIVERED", "CANCELLED"]).default("DRAFT").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SalesOrder = typeof salesOrders.$inferSelect;
export type InsertSalesOrder = typeof salesOrders.$inferInsert;

export const salesOrderItems = mysqlTable("salesOrderItems", {
  id: int("id").autoincrement().primaryKey(),
  salesOrderId: int("salesOrderId").notNull(),
  productId: int("productId"),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: int("quantity").default(0).notNull(),
  deliveredQuantity: int("deliveredQuantity").default(0).notNull(),
  unit: varchar("unit", { length: 50 }),
  unitPrice: int("unitPrice").default(0).notNull(),
  totalPrice: int("totalPrice").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SalesOrderItem = typeof salesOrderItems.$inferSelect;
export type InsertSalesOrderItem = typeof salesOrderItems.$inferInsert;

export const deliveryNotes = mysqlTable("deliveryNotes", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  docNumber: varchar("docNumber", { length: 50 }).notNull(),
  deliveryDate: timestamp("deliveryDate").notNull(),
  salesOrderId: int("salesOrderId"),
  customerId: int("customerId"),
  customerName: varchar("customerName", { length: 255 }),
  warehouseId: int("warehouseId"),
  status: mysqlEnum("status", ["DRAFT", "VALIDATED", "CANCELLED"]).default("DRAFT").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DeliveryNote = typeof deliveryNotes.$inferSelect;
export type InsertDeliveryNote = typeof deliveryNotes.$inferInsert;

export const deliveryItems = mysqlTable("deliveryItems", {
  id: int("id").autoincrement().primaryKey(),
  deliveryNoteId: int("deliveryNoteId").notNull(),
  productId: int("productId"),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: int("quantity").default(0).notNull(),
  unit: varchar("unit", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DeliveryItem = typeof deliveryItems.$inferSelect;
export type InsertDeliveryItem = typeof deliveryItems.$inferInsert;

export const salesReturns = mysqlTable("salesReturns", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  docNumber: varchar("docNumber", { length: 50 }).notNull(),
  returnDate: timestamp("returnDate").notNull(),
  customerId: int("customerId"),
  customerName: varchar("customerName", { length: 255 }),
  deliveryNoteId: int("deliveryNoteId"),
  status: mysqlEnum("status", ["DRAFT", "VALIDATED", "CANCELLED"]).default("DRAFT").notNull(),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SalesReturn = typeof salesReturns.$inferSelect;
export type InsertSalesReturn = typeof salesReturns.$inferInsert;

export const salesReturnItems = mysqlTable("salesReturnItems", {
  id: int("id").autoincrement().primaryKey(),
  salesReturnId: int("salesReturnId").notNull(),
  productId: int("productId"),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: int("quantity").default(0).notNull(),
  unit: varchar("unit", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SalesReturnItem = typeof salesReturnItems.$inferSelect;
export type InsertSalesReturnItem = typeof salesReturnItems.$inferInsert;

// ============================================================
// PAYROLL (Pagat)
// Monetary values are stored as cents to preserve accounting precision.
// ============================================================
export const payrollEmployees = mysqlTable("payrollEmployees", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  employeeNumber: varchar("employeeNumber", { length: 50 }).notNull(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }),
  position: varchar("position", { length: 150 }),
  regularRateCents: int("regularRateCents").default(0).notNull(),
  overtimeRateCents: int("overtimeRateCents").default(0).notNull(),
  baseSalaryCents: int("baseSalaryCents").default(0).notNull(),
  advanceCents: int("advanceCents").default(0).notNull(),
  bankPaymentCents: int("bankPaymentCents").default(0).notNull(),
  cashPaymentCents: int("cashPaymentCents").default(0).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["BANK", "CASH"]).default("BANK").notNull(),
  bankName: varchar("bankName", { length: 150 }),
  bankAccount: varchar("bankAccount", { length: 100 }),
  isForeign: int("isForeign").default(0).notNull(),
  shiftCode: varchar("shiftCode", { length: 10 }).default("A").notNull(),
  dailyRateCents: int("dailyRateCents").default(0).notNull(),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PayrollEmployee = typeof payrollEmployees.$inferSelect;
export type InsertPayrollEmployee = typeof payrollEmployees.$inferInsert;

export const payrollLeaveAbsences = mysqlTable("payrollLeaveAbsences", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  payrollEmployeeId: int("payrollEmployeeId").notNull(),
  leaveType: varchar("leaveType", { length: 40 }).notNull(),
  startDate: varchar("startDate", { length: 10 }).notNull(),
  endDate: varchar("endDate", { length: 10 }).notNull(),
  notes: varchar("notes", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PayrollLeaveAbsence = typeof payrollLeaveAbsences.$inferSelect;
export type InsertPayrollLeaveAbsence = typeof payrollLeaveAbsences.$inferInsert;

export const payrollDeviceMappings = mysqlTable("payrollDeviceMappings", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  deviceId: varchar("deviceId", { length: 100 }).notNull(),
  payrollEmployeeId: int("payrollEmployeeId").notNull(),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const payrollSettings = mysqlTable("payrollSettings", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  paramsJson: text("paramsJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const payrollPeriods = mysqlTable("payrollPeriods", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  year: int("year").notNull(),
  month: int("month").notNull(),
  status: mysqlEnum("status", ["DRAFT", "GENERATED", "POSTED", "CANCELLED"]).default("DRAFT").notNull(),
  currency: varchar("currency", { length: 10 }).default("ALL").notNull(),
  taxRulesJson: text("taxRulesJson"),
  socialEmployeeRateBp: int("socialEmployeeRateBp").default(0).notNull(),
  socialEmployerRateBp: int("socialEmployerRateBp").default(0).notNull(),
  notes: text("notes"),
  generatedAt: timestamp("generatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PayrollPeriod = typeof payrollPeriods.$inferSelect;
export type InsertPayrollPeriod = typeof payrollPeriods.$inferInsert;

// Manual bonuses belong to a payroll period, not to the employee master record.
export const payrollPeriodBonuses = mysqlTable("payrollPeriodBonuses", {
  id: int("id").autoincrement().primaryKey(),
  payrollPeriodId: int("payrollPeriodId").notNull(),
  payrollEmployeeId: int("payrollEmployeeId").notNull(),
  bonusCents: int("bonusCents").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("payrollPeriodBonuses_period_employee_unique").on(table.payrollPeriodId, table.payrollEmployeeId)]);

export type PayrollPeriodBonus = typeof payrollPeriodBonuses.$inferSelect;
export type InsertPayrollPeriodBonus = typeof payrollPeriodBonuses.$inferInsert;

export const payrollAttendance = mysqlTable("payrollAttendance", {
  id: int("id").autoincrement().primaryKey(),
  payrollPeriodId: int("payrollPeriodId").notNull(),
  payrollEmployeeId: int("payrollEmployeeId").notNull(),
  day: int("day").notNull(),
  attendanceCode: varchar("attendanceCode", { length: 10 }).default("8").notNull(),
  normalMinutes: int("normalMinutes").default(0).notNull(),
  overtimeMinutes: int("overtimeMinutes").default(0).notNull(),
  note: varchar("note", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("payrollAttendance_period_employee_day_unique").on(table.payrollPeriodId, table.payrollEmployeeId, table.day)]);

export type PayrollAttendance = typeof payrollAttendance.$inferSelect;
export type InsertPayrollAttendance = typeof payrollAttendance.$inferInsert;

export const payrollEntries = mysqlTable("payrollEntries", {
  id: int("id").autoincrement().primaryKey(),
  payrollPeriodId: int("payrollPeriodId").notNull(),
  payrollEmployeeId: int("payrollEmployeeId").notNull(),
  employeeNumber: varchar("employeeNumber", { length: 50 }).notNull(),
  employeeName: varchar("employeeName", { length: 255 }).notNull(),
  normalMinutes: int("normalMinutes").default(0).notNull(),
  overtimeMinutes: int("overtimeMinutes").default(0).notNull(),
  regularPayCents: int("regularPayCents").default(0).notNull(),
  overtimePayCents: int("overtimePayCents").default(0).notNull(),
  bonusCents: int("bonusCents").default(0).notNull(),
  grossCents: int("grossCents").default(0).notNull(),
  socialEmployeeCents: int("socialEmployeeCents").default(0).notNull(),
  socialEmployerCents: int("socialEmployerCents").default(0).notNull(),
  taxableCents: int("taxableCents").default(0).notNull(),
  taxCents: int("taxCents").default(0).notNull(),
  netCents: int("netCents").default(0).notNull(),
  advanceCents: int("advanceCents").default(0).notNull(),
  payableCents: int("payableCents").default(0).notNull(),
  bankPaymentCents: int("bankPaymentCents").default(0).notNull(),
  cashPaymentCents: int("cashPaymentCents").default(0).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["BANK", "CASH"]).default("BANK").notNull(),
  status: mysqlEnum("status", ["DRAFT", "GENERATED", "PAID", "CANCELLED"]).default("DRAFT").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PayrollEntry = typeof payrollEntries.$inferSelect;
export type InsertPayrollEntry = typeof payrollEntries.$inferInsert;

// ============================================================
// AUDIT & SETTINGS
// ============================================================
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId"),
  action: varchar("action", { length: 100 }),
  entityType: varchar("entityType", { length: 100 }),
  entityId: int("entityId"),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;


export const employeeDocuments = mysqlTable('employee_documents', {
  id: int('id').autoincrement().primaryKey(),
  companyId: int('company_id').notNull(),
  employeeId: int('employee_id').notNull(),
  documentType: varchar('document_type', { length: 50 }).notNull(), // 'ID', 'CV', 'Kontrate', 'Tjeter'
  documentName: varchar('document_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  fileKey: varchar('file_key', { length: 255 }).notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});
