import { eq, and, desc, count, inArray, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, companies, userCompanies, suppliers, customers, 
  products, categories, units, warehouses, agents, weightForms, weightFormLines,
  purchaseInvoices, purchaseItems, purchaseOrders, purchaseOrderItems, purchaseOrderAttachments,
  purchaseReceipts, purchaseReceiptItems, purchaseReturns, purchaseReturnItems,
  salesInvoices, salesItems, salesQuotations, salesQuotationItems, salesOrders, salesOrderItems,
  deliveryNotes, deliveryItems, salesReturns, salesReturnItems, stockLocations, stockMovements,
  stockBalances, stockTransfers, stockTransferItems, inventoryAdjustments, inventoryAdjustmentItems, auditLogs, settings,
  chartOfAccounts, journals, journalEntries, journalEntryLines, taxRates, payments,
  crmLeads, crmActivities, bankAccounts, bankStatements, bankTransfers, bankTransactions, vehicles, cargoLoads, cargoLoadDocuments,
  payrollEmployees, payrollPeriods, payrollPeriodBonuses, payrollAttendance, payrollEntries, payrollDeviceMappings, payrollSettings, payrollLeaveAbsences, creditNotes, employeeDocuments, issuers, documentGroups, costCenters
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { summarizeDocumentStatuses } from "./purchase";
import { canCancelSalesOrder, canCancelSalesQuotation, canCancelSalesStockDocument, canConvertQuotation, canDeleteSalesDraft, canInvoiceDelivery, canInvoiceSalesOrder } from "./sales";
import { calculatePurchaseOrderCargoWeightKg, canCancelCargoLoad, canDeleteCargoLoadDraft, shouldCreateCargoLoad } from "./transportActions";
import { calculatePayrollEntry, countPayrollAbsenceDays, parsePayrollBonusSettings, resolvePayrollBonusCents, type PayrollTaxBracket } from "./payroll";
import { calculateInventoryDifference, canCancelInventoryDocument, canDeleteInventoryDraft, canTransferBetweenWarehouses, canValidateInventoryDocument, validateRequiredWarehouseId } from "./inventory";
import { calculateProfitAndLoss, canCancelAccountingDraft, canDeleteAccountingDraft, canPostJournalEntry, getPaymentPostingLines, summarizeJournalLines } from "./accounting";
import { calculateBankBalanceDelta, calculateTransferBalances, canAddBankTransaction, canCancelBankDraft, canCancelCrmActivity, canCancelCrmLead, canConvertLead, canCreateBankStatement, canDeleteBankDraft, canDeleteCrmActivity, canDeleteCrmLead, canFinalizeBankStatement, canPostBankTransfer, canReconcileBankTransaction, crmStageProbabilities } from "./crmBanking";
import { resolveLiquidityRemovalMode } from "./liquidityUnits";
import { canDeleteUnitMeasure, unitMeasureKey } from "./unitMeasures";
import { canDeleteCreditNote, canSetCreditNoteStatus } from "./creditNotes";
import { REPORT_BASE_KEYS } from "../shared/reportCatalog";
import { storagePut } from "./storage";
import { calculateSalesLineAmounts, formatSalesCustomerLabel, getSalesCustomerAggregationKey } from "./salesReportMath";

let _db: ReturnType<typeof drizzle> | null = null;

export const normalizeDocumentNumber = (value: string) => String(value ?? "").trim().toLocaleLowerCase("sq-AL");

async function assertUniqueDocumentNumber(db: any, table: any, companyId: number, rawNumber: string, label: string, excludeId?: number) {
  const normalized = normalizeDocumentNumber(rawNumber);
  if (!normalized) throw new Error(`${label} kërkon numër dokumenti.`);
  const existing = await db.select({ id: table.id, docNumber: table.docNumber }).from(table).where(eq(table.companyId, companyId));
  const duplicate = existing.find((row: { id: number; docNumber: string }) => row.id !== excludeId && normalizeDocumentNumber(row.docNumber) === normalized);
  if (duplicate) throw new Error(`${label} me numrin "${String(rawNumber).trim()}" ekziston tashmë në këtë kompani.`);
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
  return result.length > 0 ? result[0] : undefined;
}


// ============================================================
// COMPANY & USER MANAGEMENT
// ============================================================

export async function getUserCompanies(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(userCompanies)
    .where(eq(userCompanies.userId, userId));
  
  return result;
}

export async function getCompanyUsers(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, name: users.name, email: users.email, globalRole: users.role, companyRole: userCompanies.role, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(userCompanies).innerJoin(users, eq(users.id, userCompanies.userId)).where(eq(userCompanies.companyId, companyId)).orderBy(users.name);
}

export async function getCompanyMembership(companyId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [membership] = await db.select().from(userCompanies).where(and(eq(userCompanies.companyId, companyId), eq(userCompanies.userId, userId))).limit(1);
  return membership;
}

export async function updateCompanyUserRole(companyId: number, userId: number, role: "owner" | "admin" | "user" | "viewer") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userCompanies).set({ role }).where(and(eq(userCompanies.companyId, companyId), eq(userCompanies.userId, userId)));
  return getCompanyMembership(companyId, userId);
}

export async function searchRegisteredUsers(search: string) {
  const db = await getDb();
  if (!db) return [];
  const pattern = `%${search.trim()}%`;
  return db.select({ id: users.id, name: users.name, email: users.email, globalRole: users.role }).from(users).where(or(like(users.name, pattern), like(users.email, pattern))).orderBy(users.name).limit(8);
}

export async function addCompanyUser(companyId: number, userId: number, role: "admin" | "user" | "viewer") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getCompanyMembership(companyId, userId);
  if (existing) throw new Error("Përdoruesi është tashmë anëtar i kompanisë.");
  await db.insert(userCompanies).values({ companyId, userId, role });
  return getCompanyMembership(companyId, userId);
}

export async function removeCompanyUser(companyId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(userCompanies).where(and(eq(userCompanies.companyId, companyId), eq(userCompanies.userId, userId)));
  return { success: true };
}

export async function getCompanyById(companyId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createCompany(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(companies).values(data);
  return result;
}
export async function createCompanyWithOwner(userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.transaction(async tx => {
    const [result] = await tx.insert(companies).values(data);
    const companyId = Number(result.insertId);
    await tx.insert(userCompanies).values({ userId, companyId, role: "owner" });
    return { companyId };
  });
}

export async function bootstrapLocalOwner(data: { email: string; name: string; passwordHash: string; companyName: string; nipt?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.transaction(async tx => {
    const existing = await tx.select({ id: users.id }).from(users).limit(1);
    if (existing.length > 0) throw new Error("Local owner bootstrap is already completed");
    const openId = `local:${data.email}`;
    const [userResult] = await tx.insert(users).values({ openId, email: data.email, name: data.name, loginMethod: "local", role: "admin", passwordHash: data.passwordHash });
    const userId = Number(userResult.insertId);
    const [companyResult] = await tx.insert(companies).values({ name: data.companyName, nipt: data.nipt || null });
    const companyId = Number(companyResult.insertId);
    await tx.insert(userCompanies).values({ userId, companyId, role: "owner" });
    return { userId, companyId, openId };
  });
}

export async function updateCompany(companyId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(companies).set(data).where(eq(companies.id, companyId));
  return { success: true };
}

export async function createUserCompany(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(userCompanies).values(data);
}

// ============================================================
// CONFIGURATION CATALOGS
// ============================================================

export async function getIssuers(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(issuers).where(eq(issuers.companyId, companyId));
}

export async function createIssuer(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(issuers).values(data);
  const [created] = await db.select().from(issuers).where(eq(issuers.id, Number(result.insertId))).limit(1);
  if (!created) throw new Error("Emetuesi nuk u krijua");
  return created;
}

export async function getCostCenters(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(costCenters).where(eq(costCenters.companyId, companyId));
}

export async function updateCostCenter(id: number, companyId: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(costCenters).set(data).where(and(eq(costCenters.id, id), eq(costCenters.companyId, companyId)));
  const [updated] = await db.select().from(costCenters).where(and(eq(costCenters.id, id), eq(costCenters.companyId, companyId))).limit(1);
  if (!updated) throw new Error("Qendra e kostos nuk u gjet");
  return updated;
}

export async function deleteCostCenter(id: number, companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(costCenters).where(and(eq(costCenters.id, id), eq(costCenters.companyId, companyId)));
  return { id, deleted: true };
}

export async function createCostCenter(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(costCenters).values(data);
  const [created] = await db.select().from(costCenters).where(eq(costCenters.id, Number(result.insertId))).limit(1);
  if (!created) throw new Error("Qendra e kostos nuk u krijua");
  return created;
}

export async function updateIssuer(id: number, companyId: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(issuers).set(data).where(and(eq(issuers.id, id), eq(issuers.companyId, companyId)));
  const [updated] = await db.select().from(issuers).where(and(eq(issuers.id, id), eq(issuers.companyId, companyId))).limit(1);
  if (!updated) throw new Error("Emetuesi nuk u gjet");
  return updated;
}

export async function deleteIssuer(id: number, companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(issuers).where(and(eq(issuers.id, id), eq(issuers.companyId, companyId)));
  return { id, deleted: true };
}

export async function getDocumentGroups(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documentGroups).where(eq(documentGroups.companyId, companyId));
}

export async function updateDocumentGroup(id: number, companyId: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(documentGroups).set(data).where(and(eq(documentGroups.id, id), eq(documentGroups.companyId, companyId)));
  const [updated] = await db.select().from(documentGroups).where(and(eq(documentGroups.id, id), eq(documentGroups.companyId, companyId))).limit(1);
  if (!updated) throw new Error("Grupi i dokumenteve nuk u gjet");
  return updated;
}

export async function deleteDocumentGroup(id: number, companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(documentGroups).where(and(eq(documentGroups.id, id), eq(documentGroups.companyId, companyId)));
  return { id, deleted: true };
}

export async function createDocumentGroup(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(documentGroups).values(data);
  const [created] = await db.select().from(documentGroups).where(eq(documentGroups.id, Number(result.insertId))).limit(1);
  if (!created) throw new Error("Grupi i dokumenteve nuk u krijua");
  return created;
}

// SUPPLIERS & CUSTOMERS
// ============================================================

export async function getSuppliers(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(suppliers)
    .where(eq(suppliers.companyId, companyId));
}

export async function getCustomers(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(customers)
    .where(eq(customers.companyId, companyId));
}

export async function globalSearch(companyId: number, searchTerm: string) {
  const query = searchTerm.trim().toLocaleLowerCase();
  if (query.length < 2) return [];
  const matches = (...values: Array<string | null | undefined>) => values.some(value => value?.toLocaleLowerCase().includes(query));
  const [companySuppliers, companyCustomers, companyProducts, companyWarehouses, purchaseDocs, salesDocs, purchaseOrders, salesOrders, stockMovements, crmRecords, bankAccountRecords, bankTransactionRecords, paymentRecords, journalRecords] = await Promise.all([
    getSuppliers(companyId), getCustomers(companyId), getProducts(companyId), getWarehouses(companyId), getPurchaseInvoices(companyId), getSalesInvoices(companyId), getPurchaseOrders(companyId), getSalesOrders(companyId), getStockMovements(companyId), getCrmLeads(companyId), getBankAccounts(companyId), getBankTransactions(companyId), getPayments(companyId), getJournalEntries(companyId),
  ]);
  const results = [
    ...companySuppliers.filter(item => matches(item.name, item.code, item.email, item.phone)).map(item => ({ type: "Furnitor", title: item.name, subtitle: item.code || item.email || item.phone || "Partner furnitor", path: "/partners" })),
    ...companyCustomers.filter(item => matches(item.name, item.code, item.email, item.phone)).map(item => ({ type: "Klient", title: item.name, subtitle: item.code || item.email || item.phone || "Partner klient", path: "/partners" })),
    ...companyProducts.filter(item => matches(item.name, item.code, item.barcode)).map(item => ({ type: "Artikull", title: item.name, subtitle: item.code || item.barcode || "Artikull", path: "/products" })),
    ...companyWarehouses.filter(item => matches(item.name, item.code)).map(item => ({ type: "Magazinë", title: item.name, subtitle: item.code || "Magazinë", path: "/inventory" })),
    ...purchaseDocs.filter(item => matches(item.docNumber, item.supplierName)).map(item => ({ type: "Faturë blerje", title: item.docNumber, subtitle: `${item.supplierName || "Pa furnitor"} · ${item.status}`, path: "/purchase-invoices" })),
    ...salesDocs.filter(item => matches(item.docNumber, item.customerName)).map(item => ({ type: "Faturë shitje", title: item.docNumber, subtitle: `${item.customerName || "Pa klient"} · ${item.status}`, path: "/sales-invoices" })),
    ...purchaseOrders.filter(item => matches(item.docNumber, item.supplierName)).map(item => ({ type: "Porosi blerje", title: item.docNumber, subtitle: `${item.supplierName || "Pa furnitor"} · ${item.status}`, path: "/purchase-invoices" })),
    ...salesOrders.filter(item => matches(item.docNumber, item.customerName)).map(item => ({ type: "Porosi shitje", title: item.docNumber, subtitle: `${item.customerName || "Pa klient"} · ${item.status}`, path: "/sales-invoices" })),
    ...stockMovements.filter(item => matches(item.docNumber, item.productName, item.notes)).map(item => ({ type: "Lëvizje stoku", title: item.docNumber, subtitle: `${item.productName} · ${item.movementType}`, path: "/inventory" })),
    ...crmRecords.filter(item => matches(item.leadNumber, item.name, item.companyName, item.email, item.phone)).map(item => ({ type: item.leadType === "OPPORTUNITY" ? "Opportunity" : "Lead", title: item.name, subtitle: `${item.leadNumber} · ${item.stage}`, path: "/crm" })),
    ...bankAccountRecords.filter(item => matches(item.accountName, item.bankName, item.iban)).map(item => ({ type: "Llogari bankare", title: item.accountName, subtitle: item.bankName || item.iban || item.accountType, path: "/banks" })),
    ...bankTransactionRecords.filter(item => matches(item.reference, item.description, item.notes)).map(item => ({ type: "Transaksion bankar", title: item.reference || item.description, subtitle: `${item.transactionType} · ${item.status}`, path: "/banks" })),
    ...paymentRecords.filter(item => matches(item.paymentNumber, item.partnerName, item.reference)).map(item => ({ type: "Pagesë", title: item.paymentNumber, subtitle: `${item.partnerName || "Pa partner"} · ${item.status}`, path: "/accounting" })),
    ...journalRecords.filter(item => matches(item.entryNumber, item.reference, item.notes)).map(item => ({ type: "Regjistrim kontabël", title: item.entryNumber, subtitle: `${item.reference || "Pa referencë"} · ${item.status}`, path: "/accounting" })),
  ];
  return results.slice(0, 12);
}

export async function createSupplier(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(suppliers).values(data);
  const [createdSupplier] = await db.select().from(suppliers).where(eq(suppliers.id, Number(result.insertId))).limit(1);
  if (!createdSupplier) throw new Error("Furnitori i krijuar nuk u gjet");
  return createdSupplier;
}

export async function createCustomer(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(customers).values(data);
  const [createdCustomer] = await db.select().from(customers).where(eq(customers.id, Number(result.insertId))).limit(1);
  if (!createdCustomer) throw new Error("Klienti i krijuar nuk u gjet");
  return createdCustomer;
}

export async function updateSupplier(id: number, companyId: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(suppliers).set(data).where(and(eq(suppliers.id, id), eq(suppliers.companyId, companyId)));
  const [updated] = await db.select().from(suppliers).where(and(eq(suppliers.id, id), eq(suppliers.companyId, companyId))).limit(1);
  if (!updated) throw new Error("Furnitori nuk u gjet për kompaninë aktive");
  return updated;
}

export async function updateCustomer(id: number, companyId: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set(data).where(and(eq(customers.id, id), eq(customers.companyId, companyId)));
  const [updated] = await db.select().from(customers).where(and(eq(customers.id, id), eq(customers.companyId, companyId))).limit(1);
  if (!updated) throw new Error("Klienti nuk u gjet për kompaninë aktive");
  return updated;
}

export async function deleteSupplier(id: number, companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(suppliers).where(and(eq(suppliers.id, id), eq(suppliers.companyId, companyId)));
  return { id, deleted: true };
}

export async function deleteCustomer(id: number, companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(customers).where(and(eq(customers.id, id), eq(customers.companyId, companyId)));
  return { id, deleted: true };
}

// ============================================================
// PRODUCTS & MASTER DATA
// ============================================================

export async function getProducts(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  const [companyProducts, purchaseCostRows] = await Promise.all([
    db.select().from(products).where(eq(products.companyId, companyId)),
    db.select({
      productId: purchaseItems.productId,
      quantity: purchaseItems.quantity,
      unitPrice: purchaseItems.unitPrice,
      invoiceDate: purchaseInvoices.date,
      itemId: purchaseItems.id,
    })
      .from(purchaseItems)
      .innerJoin(purchaseInvoices, eq(purchaseInvoices.id, purchaseItems.purchaseInvoiceId))
      .where(eq(purchaseInvoices.companyId, companyId))
      .orderBy(desc(purchaseInvoices.date), desc(purchaseItems.id)),
  ]);

  const costByProduct = new Map<number, { weightedTotal: number; quantity: number; lastPrice: number }>();
  for (const row of purchaseCostRows) {
    if (!row.productId) continue;
    const quantity = Number(row.quantity || 0);
    const unitPrice = Number(row.unitPrice || 0);
    const current = costByProduct.get(row.productId) ?? { weightedTotal: 0, quantity: 0, lastPrice: unitPrice };
    if (current.quantity === 0 && unitPrice > 0) current.lastPrice = unitPrice;
    if (quantity > 0 && unitPrice > 0) {
      current.weightedTotal += quantity * unitPrice;
      current.quantity += quantity;
    }
    costByProduct.set(row.productId, current);
  }

  return companyProducts.map(product => {
    const fallback = costByProduct.get(product.id);
    const avgPrice = Number(product.avgPrice || 0) || (fallback?.quantity ? Math.round(fallback.weightedTotal / fallback.quantity) : 0);
    const lastPrice = Number(product.lastPrice || 0) || fallback?.lastPrice || 0;
    return { ...product, avgPrice, lastPrice };
  });
}

export async function getCategories(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(categories)
    .where(eq(categories.companyId, companyId));
}

export async function getUnits(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(units)
    .where(eq(units.companyId, companyId));
}

export async function createUnit(companyId: number, name: string, abbreviation?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const key = unitMeasureKey({ name, abbreviation });
  const existing = await db.select({ id: units.id }).from(units).where(and(eq(units.companyId, companyId), or(eq(units.name, name), eq(units.abbreviation, key))));
  if (existing.length) throw new Error("Njësia e matjes ekziston tashmë.");
  return db.insert(units).values({ companyId, name, abbreviation: abbreviation?.trim() || null });
}

export async function updateUnit(companyId: number, id: number, name: string, abbreviation?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const current = (await db.select().from(units).where(and(eq(units.companyId, companyId), eq(units.id, id))).limit(1))[0];
  if (!current) throw new Error("Njësia e matjes nuk u gjet.");
  const nextKey = unitMeasureKey({ name, abbreviation });
  const duplicate = await db.select({ id: units.id }).from(units).where(and(eq(units.companyId, companyId), or(eq(units.name, name), eq(units.abbreviation, nextKey))));
  if (duplicate.some(row => row.id !== id)) throw new Error("Njësia e matjes ekziston tashmë.");
  const oldKeys = [current.name, current.abbreviation].filter(Boolean) as string[];
  await db.transaction(async tx => {
    await tx.update(units).set({ name, abbreviation: abbreviation?.trim() || null }).where(eq(units.id, id));
    if (oldKeys.length) await tx.update(products).set({ baseUnit: nextKey }).where(and(eq(products.companyId, companyId), inArray(products.baseUnit, oldKeys)));
  });
  return (await db.select().from(units).where(eq(units.id, id)).limit(1))[0];
}

export async function deleteUnit(companyId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const unit = (await db.select().from(units).where(and(eq(units.companyId, companyId), eq(units.id, id))).limit(1))[0];
  if (!unit) throw new Error("Njësia e matjes nuk u gjet.");
  const keys = [unit.name, unit.abbreviation].filter(Boolean) as string[];
  const usedByProducts = keys.length ? await db.select({ id: products.id }).from(products).where(and(eq(products.companyId, companyId), inArray(products.baseUnit, keys))).limit(1) : [];
  if (!canDeleteUnitMeasure(usedByProducts.length)) throw new Error("Njësia e matjes përdoret nga artikujt dhe nuk mund të fshihet.");
  return db.delete(units).where(eq(units.id, id));
}

export type AdministrativeUnitInput = {
  companyId: number;
  name: string;
  code?: string;
  unitType?: "WAREHOUSE" | "POINT_OF_SALE" | "OFFICE" | "OTHER";
  active?: number;
  address?: string;
  location?: string;
  contact?: string;
  notes?: string;
  inventoryMethod?: "INTERMEDIATE" | "CONTINUOUS" | "INVENTORY";
  supplyPointOfSale?: number;
  allowNegativeStock?: number;
};

export async function getWarehouses(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(warehouses)
    .where(eq(warehouses.companyId, companyId))
    .orderBy(warehouses.name);
}

export async function createWarehouse(data: AdministrativeUnitInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const name = data.name.trim();
  const code = data.code?.trim() || undefined;
  if (!name) throw new Error("Magazina kërkon emër.");
  const existing = await db.select({ id: warehouses.id, name: warehouses.name, code: warehouses.code }).from(warehouses).where(eq(warehouses.companyId, data.companyId));
  if (existing.some(item => item.name.trim().toLocaleLowerCase("sq-AL") === name.toLocaleLowerCase("sq-AL"))) {
    throw new Error("Kjo magazinë ekziston tashmë në kompaninë aktive.");
  }
  if (code && existing.some(item => item.code?.trim().toLocaleLowerCase("sq-AL") === code.toLocaleLowerCase("sq-AL"))) {
    throw new Error("Kodi i njësisë ekziston tashmë në kompaninë aktive.");
  }
  return db.insert(warehouses).values({
    companyId: data.companyId,
    name,
    code,
    unitType: data.unitType ?? "WAREHOUSE",
    active: data.active ?? 1,
    address: data.address?.trim() || null,
    location: data.location?.trim() || null,
    contact: data.contact?.trim() || null,
    notes: data.notes?.trim() || null,
    inventoryMethod: data.inventoryMethod ?? "INTERMEDIATE",
    supplyPointOfSale: data.supplyPointOfSale ?? 0,
    allowNegativeStock: data.allowNegativeStock ?? 0,
  });
}

export async function updateWarehouse(id: number, data: AdministrativeUnitInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const name = data.name.trim();
  const code = data.code?.trim() || undefined;
  if (!name) throw new Error("Njësia kërkon përshkrim.");
  const existing = await db.select({ id: warehouses.id, name: warehouses.name, code: warehouses.code }).from(warehouses).where(eq(warehouses.companyId, data.companyId));
  if (existing.some(item => item.id !== id && item.name.trim().toLocaleLowerCase("sq-AL") === name.toLocaleLowerCase("sq-AL"))) throw new Error("Kjo njësi ekziston tashmë në kompaninë aktive.");
  if (code && existing.some(item => item.id !== id && item.code?.trim().toLocaleLowerCase("sq-AL") === code.toLocaleLowerCase("sq-AL"))) throw new Error("Kodi i njësisë ekziston tashmë në kompaninë aktive.");
  const result = await db.update(warehouses).set({
    name, code, unitType: data.unitType ?? "WAREHOUSE", active: data.active ?? 1,
    address: data.address?.trim() || null, location: data.location?.trim() || null,
    contact: data.contact?.trim() || null, notes: data.notes?.trim() || null,
    inventoryMethod: data.inventoryMethod ?? "INTERMEDIATE",
    supplyPointOfSale: data.supplyPointOfSale ?? 0, allowNegativeStock: data.allowNegativeStock ?? 0,
  }).where(and(eq(warehouses.id, id), eq(warehouses.companyId, data.companyId)));
  if (Number((result as any)[0]?.affectedRows ?? 0) === 0) throw new Error("Njësia administrative nuk u gjet.");
  return result;
}

export async function deleteWarehouse(companyId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [warehouse] = await db.select().from(warehouses).where(and(eq(warehouses.id, id), eq(warehouses.companyId, companyId))).limit(1);
  if (!warehouse) throw new Error("Njësia administrative nuk u gjet.");
  const [purchaseReferences, salesReferences, movements, balances, transfers] = await Promise.all([
    db.select({ id: purchaseInvoices.id }).from(purchaseInvoices).where(and(eq(purchaseInvoices.companyId, companyId), eq(purchaseInvoices.warehouseId, id))).limit(1),
    db.select({ id: salesInvoices.id }).from(salesInvoices).where(and(eq(salesInvoices.companyId, companyId), eq(salesInvoices.warehouseId, id))).limit(1),
    db.select({ id: stockMovements.id }).from(stockMovements).where(and(eq(stockMovements.companyId, companyId), eq(stockMovements.warehouseId, id))).limit(1),
    db.select({ id: stockBalances.id }).from(stockBalances).where(and(eq(stockBalances.companyId, companyId), eq(stockBalances.warehouseId, id))).limit(1),
    db.select({ id: stockTransfers.id }).from(stockTransfers).where(and(eq(stockTransfers.companyId, companyId), or(eq(stockTransfers.sourceWarehouseId, id), eq(stockTransfers.destinationWarehouseId, id)))).limit(1),
  ]);
  if (purchaseReferences.length || salesReferences.length || movements.length || balances.length || transfers.length) throw new Error("Njësia nuk mund të fshihet sepse përdoret nga dokumente ose stok real.");
  await db.delete(warehouses).where(and(eq(warehouses.id, id), eq(warehouses.companyId, companyId)));
  return { success: true };
}

// ============================================================
// INVENTORY: LOCATIONS, MOVEMENTS, TRANSFERS & ADJUSTMENTS
// ============================================================

export async function getStockLocations(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stockLocations)
    .where(eq(stockLocations.companyId, companyId))
    .orderBy(stockLocations.name);
}

export async function createStockLocation(data: {
  companyId: number; warehouseId: number; code?: string; name: string;
  locationType: "INTERNAL" | "INPUT" | "OUTPUT" | "VIRTUAL";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(stockLocations).values(data);
}

export async function getStockMovements(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stockMovements)
    .where(eq(stockMovements.companyId, companyId))
    .orderBy(desc(stockMovements.movementDate), desc(stockMovements.id));
}

export async function getStockBalances(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stockBalances)
    .where(eq(stockBalances.companyId, companyId))
    .orderBy(stockBalances.warehouseId, stockBalances.productId);
}

export async function getStockReport(
  companyId: number,
  filters: { dateFrom?: Date; dateTo?: Date; warehouseId?: number; productId?: number },
) {
  const [movements, balances, companyProducts] = await Promise.all([
    getStockMovements(companyId), getStockBalances(companyId), getProducts(companyId),
  ]);
  const matches = (movement: typeof movements[number]) => {
    const date = movement.movementDate.getTime();
    return (!filters.dateFrom || date >= filters.dateFrom.getTime())
      && (!filters.dateTo || date <= filters.dateTo.getTime() + 86_399_999)
      && (!filters.warehouseId || movement.warehouseId === filters.warehouseId)
      && (!filters.productId || movement.productId === filters.productId);
  };
  const filteredMovements = movements.filter(matches);
  const filteredBalances = balances.filter(balance =>
    (!filters.warehouseId || balance.warehouseId === filters.warehouseId)
      && (!filters.productId || balance.productId === filters.productId),
  );
  const productsById = new Map(companyProducts.map(product => [product.id, product]));
  const byProduct = new Map<number, { productId: number; productName: string; inQuantity: number; outQuantity: number; transferQuantity: number; adjustmentQuantity: number; movementCount: number }>();
  const byType: Record<string, { count: number; quantity: number }> = {};

  filteredMovements.forEach(movement => {
    const item = byProduct.get(movement.productId) ?? {
      productId: movement.productId,
      productName: productsById.get(movement.productId)?.name ?? movement.productName,
      inQuantity: 0, outQuantity: 0, transferQuantity: 0, adjustmentQuantity: 0, movementCount: 0,
    };
    item.movementCount += 1;
    if (movement.movementType === "IN") item.inQuantity += movement.quantity;
    if (movement.movementType === "OUT") item.outQuantity += movement.quantity;
    if (movement.movementType === "TRANSFER") item.transferQuantity += movement.quantity;
    if (movement.movementType === "ADJUSTMENT") item.adjustmentQuantity += movement.quantity;
    byProduct.set(movement.productId, item);
    const typeSummary = byType[movement.movementType] ?? { count: 0, quantity: 0 };
    typeSummary.count += 1;
    typeSummary.quantity += movement.quantity;
    byType[movement.movementType] = typeSummary;
  });

  return {
    movements: filteredMovements,
    balances: filteredBalances,
    metrics: {
      movementCount: filteredMovements.length,
      receivedQuantity: filteredMovements.filter(item => item.movementType === "IN").reduce((sum, item) => sum + item.quantity, 0),
      issuedQuantity: filteredMovements.filter(item => item.movementType === "OUT").reduce((sum, item) => sum + item.quantity, 0),
      onHandQuantity: filteredBalances.reduce((sum, item) => sum + item.quantity, 0),
      transferCount: filteredMovements.filter(item => item.movementType === "TRANSFER").length,
      adjustmentCount: filteredMovements.filter(item => item.movementType === "ADJUSTMENT").length,
    },
    byProduct: Array.from(byProduct.values()).sort((a, b) => b.movementCount - a.movementCount),
    byType,
  };
}

async function resolveWarehouseId(tx: any, companyId: number, warehouseId?: number | null) {
  if (warehouseId) {
    const warehouse = (await tx.select().from(warehouses)
      .where(and(eq(warehouses.id, warehouseId), eq(warehouses.companyId, companyId))).limit(1))[0];
    if (!warehouse) throw new Error("Magazina e zgjedhur nuk i përket kompanisë");
    return warehouse.id;
  }
  const warehouse = (await tx.select().from(warehouses)
    .where(eq(warehouses.companyId, companyId)).limit(1))[0];
  if (!warehouse) throw new Error("Krijoni së pari një magazinë për të menaxhuar stokun");
  return warehouse.id;
}

async function requireWarehouseId(tx: any, companyId: number, warehouseId?: number | null) {
  return resolveWarehouseId(tx, companyId, validateRequiredWarehouseId(warehouseId));
}

async function resolveStockLocationId(tx: any, companyId: number, warehouseId: number, locationId?: number | null) {
  if (!locationId) return 0;
  const location = (await tx.select().from(stockLocations).where(and(
    eq(stockLocations.id, locationId), eq(stockLocations.companyId, companyId), eq(stockLocations.warehouseId, warehouseId),
  )).limit(1))[0];
  if (!location) throw new Error("Lokacioni i zgjedhur nuk i përket magazinës");
  return location.id;
}

async function getWarehouseBalance(tx: any, companyId: number, warehouseId: number, productId: number, locationId = 0) {
  return (await tx.select().from(stockBalances).where(and(
    eq(stockBalances.companyId, companyId), eq(stockBalances.warehouseId, warehouseId),
    eq(stockBalances.locationId, locationId), eq(stockBalances.productId, productId),
  )).limit(1))[0];
}

async function getEffectiveWarehouseStock(tx: any, companyId: number, warehouseId: number, productId: number, locationId = 0) {
  const balance = await getWarehouseBalance(tx, companyId, warehouseId, productId, locationId);
  if (balance) return balance.quantity;
  const existingBalances = await tx.select().from(stockBalances).where(and(
    eq(stockBalances.companyId, companyId), eq(stockBalances.productId, productId),
  ));
  if (existingBalances.length > 0) return 0;
  const product = (await tx.select().from(products).where(eq(products.id, productId)).limit(1))[0];
  return product?.stock ?? 0;
}

async function applyWarehouseStockDelta(tx: any, data: { companyId: number; warehouseId: number; productId: number; delta: number; locationId?: number }, options: { allowNegative?: boolean } = {}) {
  const locationId = data.locationId ?? 0;
  const balance = await getWarehouseBalance(tx, data.companyId, data.warehouseId, data.productId, locationId);
  const currentQuantity = await getEffectiveWarehouseStock(tx, data.companyId, data.warehouseId, data.productId, locationId);
  const nextQuantity = currentQuantity + data.delta;
  if (nextQuantity < 0 && !options.allowNegative) throw new Error("Stok i pamjaftueshëm në magazinën burim");
  if (balance) {
    await tx.update(stockBalances).set({ quantity: nextQuantity }).where(eq(stockBalances.id, balance.id));
  } else {
    await tx.insert(stockBalances).values({ companyId: data.companyId, warehouseId: data.warehouseId, locationId, productId: data.productId, quantity: nextQuantity });
  }
  const balances = await tx.select().from(stockBalances).where(and(
    eq(stockBalances.companyId, data.companyId), eq(stockBalances.productId, data.productId),
  ));
  await tx.update(products).set({ stock: balances.reduce((sum: number, item: any) => sum + item.quantity, 0) })
    .where(eq(products.id, data.productId));
}

export async function getStockTransfers(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stockTransfers)
    .where(eq(stockTransfers.companyId, companyId))
    .orderBy(desc(stockTransfers.transferDate), desc(stockTransfers.id));
}

export async function getStockTransferItems(stockTransferId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stockTransferItems)
    .where(eq(stockTransferItems.stockTransferId, stockTransferId));
}

export async function getStockTransferById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(stockTransfers).where(eq(stockTransfers.id, id)).limit(1))[0];
}

export async function createStockTransfer(
  data: { companyId: number; docNumber: string; transferDate: Date; sourceWarehouseId: number; destinationWarehouseId: number; sourceLocationId?: number; destinationLocationId?: number; notes?: string },
  items: { productId: number; productName: string; quantity: number; unit?: string }[],
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await assertUniqueDocumentNumber(db, stockTransfers, data.companyId, data.docNumber, "Transferi");
  if (!canTransferBetweenWarehouses(data.sourceWarehouseId, data.destinationWarehouseId)) throw new Error("Burimi dhe destinacioni nuk mund të jenë të njëjtë");
  if (items.length === 0) throw new Error("Transferi duhet të përmbajë të paktën një artikull");
  const result = await db.insert(stockTransfers).values(data);
  const stockTransferId = Number((result as unknown as [{ insertId: number }])[0].insertId);
  await db.insert(stockTransferItems).values(items.map(item => ({ ...item, stockTransferId })));
  return { id: stockTransferId };
}

export async function validateStockTransfer(stockTransferId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const transfer = (await db.select().from(stockTransfers).where(eq(stockTransfers.id, stockTransferId)).limit(1))[0];
  if (!transfer) throw new Error("Transferi nuk u gjet");
  if (transfer.status === "VALIDATED") return { success: true, alreadyValidated: true };
  if (transfer.status === "CANCELLED") throw new Error("Transferi i anuluar nuk mund të validohet");
  if (!canValidateInventoryDocument(transfer.status)) throw new Error("Transferi nuk është në status draft");
  const items = await getStockTransferItems(stockTransferId);

  await db.transaction(async tx => {
    await tx.select({ id: stockTransfers.id }).from(stockTransfers).where(eq(stockTransfers.id, transfer.id)).for("update").limit(1);
    const applied = await tx.select({ id: stockMovements.id }).from(stockMovements).where(and(eq(stockMovements.companyId, transfer.companyId), eq(stockMovements.referenceType, "STOCK_TRANSFER"), eq(stockMovements.referenceId, transfer.id))).limit(1);
    if (applied.length > 0) {
      await tx.update(stockTransfers).set({ status: "VALIDATED" }).where(eq(stockTransfers.id, transfer.id));
      return;
    }
    const sourceLocationId = await resolveStockLocationId(tx, transfer.companyId, transfer.sourceWarehouseId, transfer.sourceLocationId);
    const destinationLocationId = await resolveStockLocationId(tx, transfer.companyId, transfer.destinationWarehouseId, transfer.destinationLocationId);
    for (const item of items) {
      const product = (await tx.select().from(products).where(eq(products.id, item.productId)).limit(1))[0];
      if (!product) throw new Error(`Artikulli ${item.productName} nuk u gjet`);
      await applyWarehouseStockDelta(tx, { companyId: transfer.companyId, warehouseId: transfer.sourceWarehouseId, locationId: sourceLocationId, productId: item.productId, delta: -item.quantity });
      await applyWarehouseStockDelta(tx, { companyId: transfer.companyId, warehouseId: transfer.destinationWarehouseId, locationId: destinationLocationId, productId: item.productId, delta: item.quantity });
      await tx.insert(stockMovements).values({
        companyId: transfer.companyId, docNumber: transfer.docNumber, movementDate: transfer.transferDate,
        movementType: "TRANSFER", productId: item.productId, productName: item.productName, quantity: item.quantity,
        warehouseId: transfer.destinationWarehouseId, referenceType: "STOCK_TRANSFER", referenceId: transfer.id,
        sourceLocationId: sourceLocationId || null, destinationLocationId: destinationLocationId || null,
        notes: `Transfer nga magazina #${transfer.sourceWarehouseId} në magazinën #${transfer.destinationWarehouseId}`,
      });
    }
    await tx.update(stockTransfers).set({ status: "VALIDATED" }).where(eq(stockTransfers.id, transfer.id));
  });
  return { success: true };
}

export async function cancelStockTransfer(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const transfer = await getStockTransferById(id);
  if (!transfer) throw new Error("Transferi nuk u gjet");
  if (transfer.status === "CANCELLED") return { success: true, alreadyCancelled: true };
  if (!canCancelInventoryDocument(transfer.status)) throw new Error("Transferi i validuar nuk mund të anulohet. Krijo dokument korrigjues.");
  await db.update(stockTransfers).set({ status: "CANCELLED" }).where(eq(stockTransfers.id, id));
  await auditDocumentAction(transfer.companyId, userId, "CANCEL", "STOCK_TRANSFER", id, `U anulua transferi ${transfer.docNumber}`);
  return { success: true };
}

export async function deleteStockTransferDraft(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const transfer = await getStockTransferById(id);
  if (!transfer) throw new Error("Transferi nuk u gjet");
  if (!canDeleteInventoryDraft(transfer.status)) throw new Error("Vetëm transfertat Draft mund të fshihen.");
  await auditDocumentAction(transfer.companyId, userId, "DELETE", "STOCK_TRANSFER", id, `U fshi transferi Draft ${transfer.docNumber}`);
  await db.delete(stockTransferItems).where(eq(stockTransferItems.stockTransferId, id));
  await db.delete(stockTransfers).where(eq(stockTransfers.id, id));
  return { success: true };
}

export async function getInventoryAdjustments(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inventoryAdjustments)
    .where(eq(inventoryAdjustments.companyId, companyId))
    .orderBy(desc(inventoryAdjustments.adjustmentDate), desc(inventoryAdjustments.id));
}

export async function getInventoryAdjustmentItems(inventoryAdjustmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inventoryAdjustmentItems)
    .where(eq(inventoryAdjustmentItems.inventoryAdjustmentId, inventoryAdjustmentId));
}

export async function getInventoryAdjustmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(inventoryAdjustments).where(eq(inventoryAdjustments.id, id)).limit(1))[0];
}

export async function createInventoryAdjustment(
  data: { companyId: number; docNumber: string; adjustmentDate: Date; warehouseId?: number; locationId?: number; notes?: string },
  items: { productId: number; productName: string; countedQuantity: number }[],
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await assertUniqueDocumentNumber(db, inventoryAdjustments, data.companyId, data.docNumber, "Inventarizimi");
  if (items.length === 0) throw new Error("Inventarizimi duhet të përmbajë të paktën një artikull");
  return db.transaction(async tx => {
    const warehouseId = await resolveWarehouseId(tx, data.companyId, data.warehouseId);
    const locationId = await resolveStockLocationId(tx, data.companyId, warehouseId, data.locationId);
    const result = await tx.insert(inventoryAdjustments).values({ ...data, warehouseId, locationId: locationId || null });
    const inventoryAdjustmentId = Number((result as unknown as [{ insertId: number }])[0].insertId);
    const adjustmentItems = [];
    for (const item of items) {
      const product = (await tx.select().from(products).where(eq(products.id, item.productId)).limit(1))[0];
      if (!product) throw new Error(`Artikulli ${item.productName} nuk u gjet`);
      adjustmentItems.push({
        inventoryAdjustmentId, productId: product.id, productName: product.name,
        countedQuantity: item.countedQuantity, systemQuantity: await getEffectiveWarehouseStock(tx, data.companyId, warehouseId, product.id, locationId),
      });
    }
    await tx.insert(inventoryAdjustmentItems).values(adjustmentItems);
    return { id: inventoryAdjustmentId };
  });
}

export async function validateInventoryAdjustment(inventoryAdjustmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const adjustment = (await db.select().from(inventoryAdjustments).where(eq(inventoryAdjustments.id, inventoryAdjustmentId)).limit(1))[0];
  if (!adjustment) throw new Error("Inventarizimi nuk u gjet");
  if (adjustment.status === "VALIDATED") return { success: true, alreadyValidated: true };
  if (adjustment.status === "CANCELLED") throw new Error("Inventarizimi i anuluar nuk mund të validohet");
  if (!canValidateInventoryDocument(adjustment.status)) throw new Error("Inventarizimi nuk është në status draft");
  const items = await getInventoryAdjustmentItems(inventoryAdjustmentId);

  await db.transaction(async tx => {
    await tx.select({ id: inventoryAdjustments.id }).from(inventoryAdjustments).where(eq(inventoryAdjustments.id, adjustment.id)).for("update").limit(1);
    const applied = await tx.select({ id: stockMovements.id }).from(stockMovements).where(and(eq(stockMovements.companyId, adjustment.companyId), eq(stockMovements.referenceType, "INVENTORY_ADJUSTMENT"), eq(stockMovements.referenceId, adjustment.id))).limit(1);
    if (applied.length > 0) {
      await tx.update(inventoryAdjustments).set({ status: "VALIDATED" }).where(eq(inventoryAdjustments.id, adjustment.id));
      return;
    }
    const warehouseId = await resolveWarehouseId(tx, adjustment.companyId, adjustment.warehouseId);
    const locationId = await resolveStockLocationId(tx, adjustment.companyId, warehouseId, adjustment.locationId);
    for (const item of items) {
      const currentQuantity = await getEffectiveWarehouseStock(tx, adjustment.companyId, warehouseId, item.productId, locationId);
      const difference = calculateInventoryDifference(currentQuantity, item.countedQuantity);
      await applyWarehouseStockDelta(tx, { companyId: adjustment.companyId, warehouseId, locationId, productId: item.productId, delta: difference });
      if (difference !== 0) {
        await tx.insert(stockMovements).values({
          companyId: adjustment.companyId, docNumber: adjustment.docNumber, movementDate: adjustment.adjustmentDate,
          movementType: "ADJUSTMENT", productId: item.productId, productName: item.productName, quantity: Math.abs(difference),
          warehouseId, destinationLocationId: locationId || null, referenceType: "INVENTORY_ADJUSTMENT", referenceId: adjustment.id,
          notes: difference > 0 ? "Korrigjim pozitiv inventari" : "Korrigjim negativ inventari",
        });
      }
    }
    await tx.update(inventoryAdjustments).set({ status: "VALIDATED" }).where(eq(inventoryAdjustments.id, adjustment.id));
  });
  return { success: true };
}

// ============================================================
// ACCOUNTING: ACCOUNTS, JOURNALS, PAYMENTS & FINANCIAL REPORTS
// ============================================================

export async function cancelInventoryAdjustment(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const adjustment = await getInventoryAdjustmentById(id);
  if (!adjustment) throw new Error("Inventarizimi nuk u gjet");
  if (adjustment.status === "CANCELLED") return { success: true, alreadyCancelled: true };
  if (!canCancelInventoryDocument(adjustment.status)) throw new Error("Inventarizimi i validuar nuk mund të anulohet. Krijo dokument korrigjues.");
  await db.update(inventoryAdjustments).set({ status: "CANCELLED" }).where(eq(inventoryAdjustments.id, id));
  await auditDocumentAction(adjustment.companyId, userId, "CANCEL", "INVENTORY_ADJUSTMENT", id, `U anulua inventarizimi ${adjustment.docNumber}`);
  return { success: true };
}

export async function deleteInventoryAdjustmentDraft(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const adjustment = await getInventoryAdjustmentById(id);
  if (!adjustment) throw new Error("Inventarizimi nuk u gjet");
  if (!canDeleteInventoryDraft(adjustment.status)) throw new Error("Vetëm inventarizimet Draft mund të fshihen.");
  await auditDocumentAction(adjustment.companyId, userId, "DELETE", "INVENTORY_ADJUSTMENT", id, `U fshi inventarizimi Draft ${adjustment.docNumber}`);
  await db.delete(inventoryAdjustmentItems).where(eq(inventoryAdjustmentItems.inventoryAdjustmentId, id));
  await db.delete(inventoryAdjustments).where(eq(inventoryAdjustments.id, id));
  return { success: true };
}

export async function getChartOfAccounts(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chartOfAccounts)
    .where(eq(chartOfAccounts.companyId, companyId))
    .orderBy(chartOfAccounts.code);
}

export async function createChartOfAccount(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(chartOfAccounts).values(data);
}

const defaultAccountingAccounts = [
  { code: "1000", name: "Arkë", accountType: "ASSET" as const },
  { code: "1100", name: "Banka", accountType: "ASSET" as const },
  { code: "1200", name: "Klientë për t’u arkëtuar", accountType: "ASSET" as const },
  { code: "2000", name: "Furnitorë për t’u paguar", accountType: "LIABILITY" as const },
  { code: "3000", name: "Kapitali", accountType: "EQUITY" as const },
  { code: "4000", name: "Të ardhura nga shitjet", accountType: "INCOME" as const },
  { code: "5000", name: "Kosto dhe shpenzime", accountType: "EXPENSE" as const },
];
const defaultAccountingJournals = [
  { code: "GEN", name: "Ditar i përgjithshëm", journalType: "GENERAL" as const },
  { code: "SHIT", name: "Ditar i shitjeve", journalType: "SALE" as const },
  { code: "BLER", name: "Ditar i blerjeve", journalType: "PURCHASE" as const },
  { code: "BANK", name: "Ditar banke", journalType: "BANK" as const },
  { code: "ARKE", name: "Ditar arke", journalType: "CASH" as const },
];

export function getDefaultAccountingSetupBlueprint() {
  return { accounts: defaultAccountingAccounts, journals: defaultAccountingJournals };
}

async function ensureDefaultAccountingSetup(tx: any, companyId: number) {
  const { accounts: defaultAccounts, journals: defaultJournals } = getDefaultAccountingSetupBlueprint();
  const [existingAccounts, existingJournals] = await Promise.all([
    tx.select({ code: chartOfAccounts.code }).from(chartOfAccounts).where(eq(chartOfAccounts.companyId, companyId)),
    tx.select({ code: journals.code }).from(journals).where(eq(journals.companyId, companyId)),
  ]);
  const accountCodes = new Set(existingAccounts.map((item: { code: string }) => item.code));
  const journalCodes = new Set(existingJournals.map((item: { code: string }) => item.code));
  const missingAccounts = defaultAccounts.filter(item => !accountCodes.has(item.code)).map(item => ({ ...item, companyId }));
  const missingJournals = defaultJournals.filter(item => !journalCodes.has(item.code)).map(item => ({ ...item, companyId }));
  if (missingAccounts.length) await tx.insert(chartOfAccounts).values(missingAccounts);
  if (missingJournals.length) await tx.insert(journals).values(missingJournals);
  return { accountsCreated: missingAccounts.length, journalsCreated: missingJournals.length };
}

export async function seedDefaultAccountingSetup(companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.transaction(tx => ensureDefaultAccountingSetup(tx, companyId));
}

export async function getJournals(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(journals)
    .where(eq(journals.companyId, companyId))
    .orderBy(journals.code);
}

export async function createJournal(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(journals).values(data);
}

export async function getJournalEntries(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(journalEntries)
    .where(eq(journalEntries.companyId, companyId))
    .orderBy(desc(journalEntries.entryDate), desc(journalEntries.id));
}

export async function getJournalEntryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(journalEntries).where(eq(journalEntries.id, id)).limit(1))[0];
}

export async function getJournalEntryLines(journalEntryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(journalEntryLines)
    .where(eq(journalEntryLines.journalEntryId, journalEntryId));
}

export async function createJournalEntry(
  data: { companyId: number; journalId: number; entryNumber: string; entryDate: Date; reference?: string; notes?: string },
  lines: { accountId: number; description?: string; debit: number; credit: number; partnerType?: "SUPPLIER" | "CUSTOMER"; partnerId?: number }[],
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const summary = summarizeJournalLines(lines);
  if (!summary.isBalanced) throw new Error("Regjistrimi duhet të jetë i balancuar: debit = kredit dhe vlera duhet të jetë pozitive");
  return db.transaction(async tx => {
    const journal = (await tx.select().from(journals).where(and(eq(journals.id, data.journalId), eq(journals.companyId, data.companyId))).limit(1))[0];
    if (!journal) throw new Error("Ditari i zgjedhur nuk i përket kompanisë");
    for (const line of lines) {
      const account = (await tx.select().from(chartOfAccounts).where(and(eq(chartOfAccounts.id, line.accountId), eq(chartOfAccounts.companyId, data.companyId))).limit(1))[0];
      if (!account) throw new Error("Një nga llogaritë e zgjedhura nuk i përket kompanisë");
    }
    const result = await tx.insert(journalEntries).values({ ...data, totalDebit: summary.totalDebit, totalCredit: summary.totalCredit });
    const journalEntryId = Number((result as unknown as [{ insertId: number }])[0].insertId);
    await tx.insert(journalEntryLines).values(lines.map(line => ({ ...line, journalEntryId })));
    return { id: journalEntryId };
  });
}

export async function postJournalEntry(journalEntryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const entry = await getJournalEntryById(journalEntryId);
  if (!entry) throw new Error("Regjistrimi kontabël nuk u gjet");
  if (entry.status === "POSTED") return { success: true, alreadyPosted: true };
  if (entry.status === "CANCELLED") throw new Error("Regjistrimi i anuluar nuk mund të postohet");
  const lines = await getJournalEntryLines(journalEntryId);
  if (!canPostJournalEntry(entry.status, lines)) throw new Error("Regjistrimi nuk është i balancuar");
  await db.update(journalEntries).set({ status: "POSTED" }).where(eq(journalEntries.id, journalEntryId));
  return { success: true };
}

export async function cancelJournalEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const entry = await getJournalEntryById(id);
  if (!entry) throw new Error("Regjistrimi kontabël nuk u gjet");
  if (entry.status === "CANCELLED") return { success: true, alreadyCancelled: true };
  if (!canCancelAccountingDraft(entry.status)) throw new Error("Regjistrimi i postuar nuk mund të anulohet. Krijo regjistrim korrigjues.");
  await db.update(journalEntries).set({ status: "CANCELLED" }).where(eq(journalEntries.id, id));
  await auditDocumentAction(entry.companyId, userId, "CANCEL", "JOURNAL_ENTRY", id, `U anulua regjistrimi ${entry.entryNumber}`);
  return { success: true };
}

export async function deleteJournalEntryDraft(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const entry = await getJournalEntryById(id);
  if (!entry) throw new Error("Regjistrimi kontabël nuk u gjet");
  if (!canDeleteAccountingDraft(entry.status)) throw new Error("Vetëm regjistrimet Draft mund të fshihen.");
  await auditDocumentAction(entry.companyId, userId, "DELETE", "JOURNAL_ENTRY", id, `U fshi regjistrimi Draft ${entry.entryNumber}`);
  await db.delete(journalEntryLines).where(eq(journalEntryLines.journalEntryId, id));
  await db.delete(journalEntries).where(eq(journalEntries.id, id));
  return { success: true };
}

export async function getTaxRates(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(taxRates).where(eq(taxRates.companyId, companyId)).orderBy(taxRates.code);
}

export async function createTaxRate(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(taxRates).values(data);
}

export async function getPayments(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments)
    .where(eq(payments.companyId, companyId))
    .orderBy(desc(payments.paymentDate), desc(payments.id));
}

export async function createPayment(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(payments).values(data);
  const [payment] = await db.select().from(payments).where(eq(payments.id, Number(result.insertId))).limit(1);
  if (!payment) throw new Error("Pagesa nuk u krijua.");
  return payment;
}

export async function getPaymentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(payments).where(eq(payments.id, id)).limit(1))[0];
}

export async function postPayment(paymentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const payment = (await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1))[0];
  if (!payment) throw new Error("Pagesa nuk u gjet");
  if (payment.status === "POSTED") return { success: true, alreadyPosted: true };
  if (payment.status === "CANCELLED") throw new Error("Pagesa e anuluar nuk mund të postohet");
  if (payment.amount <= 0) throw new Error("Vlera e pagesës duhet të jetë pozitive");
  return db.transaction(async tx => {
    await ensureDefaultAccountingSetup(tx, payment.companyId);
    const [companyAccounts, companyJournals] = await Promise.all([
      tx.select().from(chartOfAccounts).where(eq(chartOfAccounts.companyId, payment.companyId)),
      tx.select().from(journals).where(eq(journals.companyId, payment.companyId)),
    ]);
    const cashCode = payment.method === "BANK" ? "1100" : "1000";
    const counterpartCode = payment.paymentType === "INBOUND" ? "1200" : "2000";
    const cashAccount = companyAccounts.find(account => account.code === cashCode);
    const counterpartAccount = companyAccounts.find(account => account.code === counterpartCode);
    if (!cashAccount || !counterpartAccount) throw new Error("Konfiguro planin bazë kontabël para postimit të pagesës");
    const journal = payment.journalId
      ? companyJournals.find(item => item.id === payment.journalId)
      : companyJournals.find(item => item.journalType === (payment.method === "BANK" ? "BANK" : "CASH")) ?? companyJournals.find(item => item.journalType === "GENERAL");
    if (!journal) throw new Error("Konfiguro së paku një ditar kontabël para postimit të pagesës");
    const lines = getPaymentPostingLines(payment.paymentType, payment.amount, cashAccount.id, counterpartAccount.id);
    const result = await tx.insert(journalEntries).values({
      companyId: payment.companyId, journalId: journal.id, entryNumber: `PAY-${payment.paymentNumber}`, entryDate: payment.paymentDate,
      reference: payment.reference ?? payment.paymentNumber, status: "POSTED", totalDebit: payment.amount, totalCredit: payment.amount,
      notes: `Postim automatik i pagesës ${payment.paymentNumber}`,
    });
    const journalEntryId = Number((result as unknown as [{ insertId: number }])[0].insertId);
    await tx.insert(journalEntryLines).values(lines.map(line => ({ ...line, journalEntryId, description: payment.partnerName ?? "Pagesë" })));
    await tx.update(payments).set({ status: "POSTED" }).where(eq(payments.id, paymentId));
    return { success: true, journalEntryId };
  });
}

export async function cancelPayment(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const payment = await getPaymentById(id);
  if (!payment) throw new Error("Pagesa nuk u gjet");
  if (payment.status === "CANCELLED") return { success: true, alreadyCancelled: true };
  if (!canCancelAccountingDraft(payment.status)) throw new Error("Pagesa e postuar nuk mund të anulohet. Krijo dokument korrigjues.");
  await db.update(payments).set({ status: "CANCELLED" }).where(eq(payments.id, id));
  await auditDocumentAction(payment.companyId, userId, "CANCEL", "PAYMENT", id, `U anulua pagesa ${payment.paymentNumber}`);
  return { success: true };
}

export async function deletePaymentDraft(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const payment = await getPaymentById(id);
  if (!payment) throw new Error("Pagesa nuk u gjet");
  if (!canDeleteAccountingDraft(payment.status)) throw new Error("Vetëm pagesat Draft mund të fshihen.");
  await auditDocumentAction(payment.companyId, userId, "DELETE", "PAYMENT", id, `U fshi pagesa Draft ${payment.paymentNumber}`);
  await db.delete(payments).where(eq(payments.id, id));
  return { success: true };
}

export async function payPurchaseInvoice(invoiceId: number, method: "CASH" | "BANK" | "CARD" | "OTHER" = "CASH") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const invoice = await getPurchaseInvoiceById(invoiceId);
  if (!invoice) throw new Error("Fatura e blerjes nuk u gjet");
  if (invoice.status === "PAID") return { success: true, alreadyPaid: true };
  const paymentNumber = `PB-${invoice.docNumber}-${Date.now().toString().slice(-6)}`.slice(0, 50);
  const result = await db.insert(payments).values({
    companyId: invoice.companyId,
    paymentNumber,
    paymentDate: new Date(),
    paymentType: "OUTBOUND",
    partnerType: "SUPPLIER",
    partnerId: invoice.supplierId ?? undefined,
    partnerName: invoice.supplierName ?? undefined,
    amount: (invoice.totalAmount ?? 0) + (invoice.vatAmount ?? 0),
    method,
    reference: invoice.docNumber,
    notes: `Pagesë për faturën e blerjes ${invoice.docNumber}`,
    status: "DRAFT",
  });
  const paymentId = Number((result as unknown as [{ insertId: number }])[0].insertId);
  await postPayment(paymentId);
  await db.update(purchaseInvoices).set({ status: "PAID", paymentStatus: "PAID" }).where(eq(purchaseInvoices.id, invoiceId));
  return { success: true, paymentId };
}

export async function postSalesInvoice(invoiceId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const invoice = await getSalesInvoiceById(invoiceId);
  if (!invoice) throw new Error("Fatura e shitjes nuk u gjet");
  if (invoice.status === "CANCELLED") throw new Error("Fatura e anuluar nuk mund të postohet.");
  if (invoice.status === "PAID") return { success: true, alreadyPosted: true };
  if (invoice.status === "POSTED") return { success: true, alreadyPosted: true };
  const items = await getSalesItems(invoiceId);
  await db.transaction(async tx => {
    await ensureSalesInvoiceStock(tx, { ...invoice, status: "POSTED" }, items);
    await tx.update(salesInvoices).set({ status: "POSTED" }).where(eq(salesInvoices.id, invoiceId));
  });
  await auditDocumentAction(invoice.companyId, userId, "POST", "SALES_INVOICE", invoiceId, `U postua fatura ${invoice.docNumber}`);
  return { success: true };
}

export async function paySalesInvoice(invoiceId: number, method: "CASH" | "BANK" | "CARD" | "OTHER" = "CASH") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const invoice = await getSalesInvoiceById(invoiceId);
  if (!invoice) throw new Error("Fatura e shitjes nuk u gjet");
  if (invoice.status === "PAID") return { success: true, alreadyPaid: true };
  const paymentNumber = `PS-${invoice.docNumber}-${Date.now().toString().slice(-6)}`.slice(0, 50);
  const result = await db.insert(payments).values({
    companyId: invoice.companyId,
    paymentNumber,
    paymentDate: new Date(),
    paymentType: "INBOUND",
    partnerType: "CUSTOMER",
    partnerId: invoice.customerId ?? undefined,
    partnerName: invoice.customerName ?? undefined,
    amount: invoice.totalAmount ?? 0,
    method,
    reference: invoice.docNumber,
    notes: `Pagesë për faturën e shitjes ${invoice.docNumber}`,
    status: "DRAFT",
  });
  const paymentId = Number((result as unknown as [{ insertId: number }])[0].insertId);
  await postPayment(paymentId);
  const items = await getSalesItems(invoiceId);
  await db.transaction(async tx => {
    await ensureSalesInvoiceStock(tx, { ...invoice, status: "PAID" }, items);
    await tx.update(salesInvoices).set({ status: "PAID", paymentStatus: "PAID" }).where(eq(salesInvoices.id, invoiceId));
  });
  return { success: true, paymentId };
}

export async function setSalesInvoicePaymentStatus(invoiceId: number, paymentStatus: "UNPAID" | "LATER") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const invoice = await getSalesInvoiceById(invoiceId);
  if (!invoice) throw new Error("Fatura e shitjes nuk u gjet");
  if (invoice.status === "PAID" || invoice.paymentStatus === "PAID") throw new Error("Fatura e paguar nuk mund të kalojë te faturat e papaguara");
  return db.update(salesInvoices).set({ paymentStatus }).where(eq(salesInvoices.id, invoiceId));
}

export async function setPurchaseInvoicePaymentStatus(invoiceId: number, paymentStatus: "UNPAID" | "LATER") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const invoice = await getPurchaseInvoiceById(invoiceId);
  if (!invoice) throw new Error("Fatura e blerjes nuk u gjet");
  if (invoice.status === "PAID") throw new Error("Fatura e paguar nuk mund të kalojë te faturat e papaguara");
  return db.update(purchaseInvoices).set({ paymentStatus }).where(eq(purchaseInvoices.id, invoiceId));
}

export async function getAccountingReport(companyId: number, filters: { dateFrom?: Date; dateTo?: Date }) {
  const [accounts, entries, companyPayments, taxes] = await Promise.all([
    getChartOfAccounts(companyId), getJournalEntries(companyId), getPayments(companyId), getTaxRates(companyId),
  ]);
  const inRange = (date: Date) => (!filters.dateFrom || date.getTime() >= filters.dateFrom.getTime())
    && (!filters.dateTo || date.getTime() <= filters.dateTo.getTime() + 86_399_999);
  const postedEntries = entries.filter(entry => entry.status === "POSTED" && inRange(entry.entryDate));
  const linesByEntry = await Promise.all(postedEntries.map(entry => getJournalEntryLines(entry.id)));
  const balanceByAccount = new Map<number, { debit: number; credit: number }>();
  linesByEntry.flat().forEach(line => {
    const current = balanceByAccount.get(line.accountId) ?? { debit: 0, credit: 0 };
    current.debit += line.debit;
    current.credit += line.credit;
    balanceByAccount.set(line.accountId, current);
  });
  const trialBalance = accounts.map(account => {
    const totals = balanceByAccount.get(account.id) ?? { debit: 0, credit: 0 };
    return { accountId: account.id, code: account.code, name: account.name, accountType: account.accountType, debit: totals.debit, credit: totals.credit, balance: totals.debit - totals.credit };
  }).filter(item => item.debit !== 0 || item.credit !== 0);
  const revenue = trialBalance.filter(item => item.accountType === "INCOME").reduce((sum, item) => sum + (item.credit - item.debit), 0);
  const expenses = trialBalance.filter(item => item.accountType === "EXPENSE").reduce((sum, item) => sum + (item.debit - item.credit), 0);
  const postedPayments = companyPayments.filter(payment => payment.status === "POSTED" && inRange(payment.paymentDate));
  const paymentInLek = (payment: typeof postedPayments[number]) => Math.round(payment.amount * (payment.currency === "ALL" ? 1 : Number(payment.exchangeRate || 1)));
  return {
    trialBalance,
    metrics: {
      postedEntries: postedEntries.length,
      totalDebit: trialBalance.reduce((sum, item) => sum + item.debit, 0),
      totalCredit: trialBalance.reduce((sum, item) => sum + item.credit, 0),
      revenue, expenses, netProfit: calculateProfitAndLoss(revenue, expenses),
      inboundPayments: postedPayments.filter(item => item.paymentType === "INBOUND").reduce((sum, item) => sum + paymentInLek(item), 0),
      outboundPayments: postedPayments.filter(item => item.paymentType === "OUTBOUND").reduce((sum, item) => sum + paymentInLek(item), 0),
      activeTaxRates: taxes.filter(item => item.active === 1).length,
    },
  };
}

// ============================================================
// CRM: LEADS, OPPORTUNITIES AND ACTIVITIES
// ============================================================

export async function getCrmLeads(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(crmLeads).where(eq(crmLeads.companyId, companyId)).orderBy(desc(crmLeads.updatedAt));
}

export async function getCrmLeadById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(crmLeads).where(eq(crmLeads.id, id)).limit(1))[0];
}

export async function createCrmLead(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(crmLeads).values(data);
}

export async function updateCrmLeadStage(id: number, stage: "NEW" | "QUALIFIED" | "PROPOSAL" | "WON" | "LOST", probability?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const lead = await getCrmLeadById(id);
  if (!lead) throw new Error("Lead-i nuk u gjet");
  await db.update(crmLeads).set({ stage, probability: probability ?? crmStageProbabilities[stage] }).where(eq(crmLeads.id, id));
  return { success: true };
}

export async function convertCrmLeadToOpportunity(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const lead = await getCrmLeadById(id);
  if (!lead) throw new Error("Lead-i nuk u gjet");
  if (lead.leadType === "OPPORTUNITY") return { success: true, alreadyConverted: true };
  if (!canConvertLead(lead.leadType, lead.stage)) throw new Error("Lead-i i humbur nuk mund të konvertohet");
  await db.update(crmLeads).set({ leadType: "OPPORTUNITY", stage: lead.stage === "NEW" ? "QUALIFIED" : lead.stage, probability: lead.probability || 35 }).where(eq(crmLeads.id, id));
  return { success: true };
}

export async function cancelCrmLead(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const lead = await getCrmLeadById(id);
  if (!lead) throw new Error("Lead-i nuk u gjet");
  if (!canCancelCrmLead(lead.stage)) return { success: true, alreadyCancelled: true };
  await db.update(crmLeads).set({ stage: "LOST", probability: 0 }).where(eq(crmLeads.id, id));
  await auditDocumentAction(lead.companyId, userId, "CANCEL", "CRM_LEAD", id, `U anulua lead-i ${lead.leadNumber}`);
  return { success: true };
}

export async function deleteCrmLead(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const lead = await getCrmLeadById(id);
  if (!lead) throw new Error("Lead-i nuk u gjet");
  const activities = await getCrmActivities(lead.companyId, id);
  if (!canDeleteCrmLead(lead.stage, activities.length > 0)) throw new Error(activities.length > 0 ? "Lead-i me aktivitete të lidhura nuk mund të fshihet." : "Vetëm lead-et e reja pa aktivitete mund të fshihen.");
  await auditDocumentAction(lead.companyId, userId, "DELETE", "CRM_LEAD", id, `U fshi lead-i ${lead.leadNumber}`);
  await db.delete(crmLeads).where(eq(crmLeads.id, id));
  return { success: true };
}

export async function getCrmActivities(companyId: number, leadId?: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(crmActivities).where(leadId ? and(eq(crmActivities.companyId, companyId), eq(crmActivities.leadId, leadId)) : eq(crmActivities.companyId, companyId)).orderBy(crmActivities.dueDate);
}

export async function createCrmActivity(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const lead = await getCrmLeadById(data.leadId);
  if (!lead || lead.companyId !== data.companyId) throw new Error("Lead-i nuk i përket kompanisë");
  return db.insert(crmActivities).values(data);
}

export async function getCrmActivityById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(crmActivities).where(eq(crmActivities.id, id)).limit(1))[0];
}

export async function completeCrmActivity(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(crmActivities).set({ status: "DONE", completedAt: new Date() }).where(eq(crmActivities.id, id));
  return { success: true };
}

export async function cancelCrmActivity(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const activity = await getCrmActivityById(id);
  if (!activity) throw new Error("Aktiviteti nuk u gjet");
  if (!canCancelCrmActivity(activity.status)) throw new Error("Vetëm aktivitetet e planifikuara mund të anulohen.");
  await db.update(crmActivities).set({ status: "CANCELLED" }).where(eq(crmActivities.id, id));
  await auditDocumentAction(activity.companyId, userId, "CANCEL", "CRM_ACTIVITY", id, `U anulua aktiviteti ${activity.subject}`);
  return { success: true };
}

export async function deleteCrmActivity(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const activity = await getCrmActivityById(id);
  if (!activity) throw new Error("Aktiviteti nuk u gjet");
  if (!canDeleteCrmActivity(activity.status)) throw new Error("Vetëm aktivitetet e planifikuara mund të fshihen.");
  await auditDocumentAction(activity.companyId, userId, "DELETE", "CRM_ACTIVITY", id, `U fshi aktiviteti ${activity.subject}`);
  await db.delete(crmActivities).where(eq(crmActivities.id, id));
  return { success: true };
}

export async function getCrmReport(companyId: number) {
  const [leads, activities] = await Promise.all([getCrmLeads(companyId), getCrmActivities(companyId)]);
  const stages = ["NEW", "QUALIFIED", "PROPOSAL", "WON", "LOST"] as const;
  const pipeline = stages.map(stage => {
    const records = leads.filter(lead => lead.stage === stage);
    return { stage, count: records.length, expectedRevenue: records.reduce((sum, lead) => sum + lead.expectedRevenue, 0), weightedRevenue: records.reduce((sum, lead) => sum + Math.round(lead.expectedRevenue * lead.probability / 100), 0) };
  });
  return {
    pipeline,
    metrics: {
      totalLeads: leads.filter(lead => lead.leadType === "LEAD").length,
      opportunities: leads.filter(lead => lead.leadType === "OPPORTUNITY").length,
      openRevenue: leads.filter(lead => !["WON", "LOST"].includes(lead.stage)).reduce((sum, lead) => sum + lead.expectedRevenue, 0),
      wonRevenue: leads.filter(lead => lead.stage === "WON").reduce((sum, lead) => sum + lead.expectedRevenue, 0),
      plannedActivities: activities.filter(activity => activity.status === "PLANNED").length,
    },
  };
}

// ============================================================
// BANKING: ACCOUNTS, STATEMENTS, TRANSACTIONS AND RECONCILIATION
// ============================================================

export async function getBankAccounts(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bankAccounts).where(eq(bankAccounts.companyId, companyId)).orderBy(bankAccounts.accountName);
}

export async function getBankAccountById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(bankAccounts).where(eq(bankAccounts.id, id)).limit(1))[0];
}

export async function createBankAccount(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(bankAccounts).values({ ...data, currentBalance: data.openingBalance ?? 0 });
}

export async function updateBankAccount(companyId: number, id: number, data: { accountName: string; bankName?: string; iban?: string; currency: string; active: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = (await db.select().from(bankAccounts).where(and(eq(bankAccounts.companyId, companyId), eq(bankAccounts.id, id))).limit(1))[0];
  if (!existing) throw new Error("Njësia e likuidimit nuk u gjet.");
  await db.update(bankAccounts).set({ accountName: data.accountName, bankName: data.bankName ?? null, iban: data.iban ?? null, currency: data.currency, active: data.active }).where(eq(bankAccounts.id, id));
  return (await db.select().from(bankAccounts).where(eq(bankAccounts.id, id)).limit(1))[0];
}

export async function removeBankAccountSafely(companyId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const account = (await db.select().from(bankAccounts).where(and(eq(bankAccounts.companyId, companyId), eq(bankAccounts.id, id))).limit(1))[0];
  if (!account) throw new Error("Njësia e likuidimit nuk u gjet.");
  const [statementRows, transferRows] = await Promise.all([
    db.select({ id: bankStatements.id }).from(bankStatements).where(and(eq(bankStatements.companyId, companyId), eq(bankStatements.bankAccountId, id))).limit(1),
    db.select({ id: bankTransfers.id }).from(bankTransfers).where(and(eq(bankTransfers.companyId, companyId), or(eq(bankTransfers.sourceBankAccountId, id), eq(bankTransfers.destinationBankAccountId, id)))).limit(1),
  ]);
  const mode = resolveLiquidityRemovalMode({ statementCount: statementRows.length, transferCount: transferRows.length });
  if (mode === "DELETE") await db.delete(bankAccounts).where(eq(bankAccounts.id, id));
  else await db.update(bankAccounts).set({ active: 0 }).where(eq(bankAccounts.id, id));
  return { mode, account };
}

export async function getBankStatements(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bankStatements).where(eq(bankStatements.companyId, companyId)).orderBy(desc(bankStatements.dateTo));
}

export async function getBankTransfers(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bankTransfers).where(eq(bankTransfers.companyId, companyId)).orderBy(desc(bankTransfers.transferDate));
}

export async function getBankTransferById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(bankTransfers).where(eq(bankTransfers.id, id)).limit(1))[0];
}

export async function createBankTransfer(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.sourceBankAccountId === data.destinationBankAccountId) throw new Error("Llogaritë burim dhe destinacion duhet të jenë të ndryshme");
  const [source, destination] = await Promise.all([getBankAccountById(data.sourceBankAccountId), getBankAccountById(data.destinationBankAccountId)]);
  if (!source || !destination || source.companyId !== data.companyId || destination.companyId !== data.companyId) throw new Error("Llogaritë e zgjedhura nuk i përkasin kompanisë");
  return db.insert(bankTransfers).values(data);
}

export async function postBankTransfer(transferId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const transfer = await getBankTransferById(transferId);
  if (!transfer) throw new Error("Transferi bankar nuk u gjet");
  if (transfer.status === "POSTED") return { success: true, alreadyPosted: true };
  if (transfer.status === "CANCELLED") throw new Error("Transferi i anuluar nuk mund të postohet");
  return db.transaction(async tx => {
    const [source, destination] = await Promise.all([
      tx.select().from(bankAccounts).where(and(eq(bankAccounts.id, transfer.sourceBankAccountId), eq(bankAccounts.companyId, transfer.companyId))).limit(1),
      tx.select().from(bankAccounts).where(and(eq(bankAccounts.id, transfer.destinationBankAccountId), eq(bankAccounts.companyId, transfer.companyId))).limit(1),
    ]);
    const sourceAccount = source[0];
    const destinationAccount = destination[0];
    if (!sourceAccount || !destinationAccount) throw new Error("Llogaritë e transfertës nuk u gjetën");
    if (!canPostBankTransfer(sourceAccount.currentBalance, transfer.amount, sourceAccount.id, destinationAccount.id)) throw new Error("Balanca e llogarisë burim nuk mjafton për transferin");
    const balances = calculateTransferBalances(sourceAccount.currentBalance, destinationAccount.currentBalance, transfer.amount);
    await tx.update(bankAccounts).set({ currentBalance: balances.source }).where(eq(bankAccounts.id, sourceAccount.id));
    await tx.update(bankAccounts).set({ currentBalance: balances.destination }).where(eq(bankAccounts.id, destinationAccount.id));
    await tx.update(bankTransfers).set({ status: "POSTED" }).where(eq(bankTransfers.id, transferId));
    return { success: true };
  });
}

export async function cancelBankTransfer(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const transfer = await getBankTransferById(id);
  if (!transfer) throw new Error("Transferi bankar nuk u gjet");
  if (transfer.status === "CANCELLED") return { success: true, alreadyCancelled: true };
  if (!canCancelBankDraft(transfer.status)) throw new Error("Transferi i postuar nuk mund të anulohet. Krijo dokument korrigjues.");
  await db.update(bankTransfers).set({ status: "CANCELLED" }).where(eq(bankTransfers.id, id));
  await auditDocumentAction(transfer.companyId, userId, "CANCEL", "BANK_TRANSFER", id, `U anulua transferi bankar ${transfer.transferNumber}`);
  return { success: true };
}

export async function deleteBankTransferDraft(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const transfer = await getBankTransferById(id);
  if (!transfer) throw new Error("Transferi bankar nuk u gjet");
  if (!canDeleteBankDraft(transfer.status)) throw new Error("Vetëm transfertat bankare Draft mund të fshihen.");
  await auditDocumentAction(transfer.companyId, userId, "DELETE", "BANK_TRANSFER", id, `U fshi transferi bankar Draft ${transfer.transferNumber}`);
  await db.delete(bankTransfers).where(eq(bankTransfers.id, id));
  return { success: true };
}

export async function getBankStatementById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(bankStatements).where(eq(bankStatements.id, id)).limit(1))[0];
}

export async function createBankStatement(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const account = await getBankAccountById(data.bankAccountId);
  if (!account || account.companyId !== data.companyId) throw new Error("Llogaria bankare nuk i përket kompanisë");
  if (!canCreateBankStatement(data.dateFrom, data.dateTo)) throw new Error("Periudha e ekstraktit nuk është e vlefshme");
  return db.insert(bankStatements).values(data);
}

export async function cancelBankStatement(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const statement = await getBankStatementById(id);
  if (!statement) throw new Error("Ekstrakti bankar nuk u gjet");
  const transactions = await getBankTransactions(statement.companyId, id);
  if (statement.status === "CANCELLED") return { success: true, alreadyCancelled: true };
  if (!canCancelBankDraft(statement.status, transactions.length > 0)) throw new Error(transactions.length > 0 ? "Ekstrakti me transaksione nuk mund të anulohet." : "Ekstrakti i pajtuar nuk mund të anulohet.");
  await db.update(bankStatements).set({ status: "CANCELLED" }).where(eq(bankStatements.id, id));
  await auditDocumentAction(statement.companyId, userId, "CANCEL", "BANK_STATEMENT", id, `U anulua ekstrakti ${statement.statementNumber}`);
  return { success: true };
}

export async function deleteBankStatementDraft(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const statement = await getBankStatementById(id);
  if (!statement) throw new Error("Ekstrakti bankar nuk u gjet");
  const transactions = await getBankTransactions(statement.companyId, id);
  if (!canDeleteBankDraft(statement.status, transactions.length > 0)) throw new Error(transactions.length > 0 ? "Ekstrakti Draft me transaksione nuk mund të fshihet." : "Vetëm ekstraktet Draft mund të fshihen.");
  await auditDocumentAction(statement.companyId, userId, "DELETE", "BANK_STATEMENT", id, `U fshi ekstrakti Draft ${statement.statementNumber}`);
  await db.delete(bankStatements).where(eq(bankStatements.id, id));
  return { success: true };
}

export async function getBankTransactions(companyId: number, bankStatementId?: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bankTransactions).where(bankStatementId ? and(eq(bankTransactions.companyId, companyId), eq(bankTransactions.bankStatementId, bankStatementId)) : eq(bankTransactions.companyId, companyId)).orderBy(desc(bankTransactions.transactionDate));
}

export async function getBankTransactionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(bankTransactions).where(eq(bankTransactions.id, id)).limit(1))[0];
}

export async function createBankTransaction(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const statement = await getBankStatementById(data.bankStatementId);
  if (!statement || statement.companyId !== data.companyId || !canAddBankTransaction(statement.status, data.amount)) throw new Error("Ekstrakti bankar nuk është i disponueshëm për transaksione");
  return db.insert(bankTransactions).values(data);
}

export async function reconcileBankTransaction(transactionId: number, paymentId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const transaction = await getBankTransactionById(transactionId);
  if (!transaction) throw new Error("Transaksioni bankar nuk u gjet");
  if (transaction.status === "RECONCILED") return { success: true, alreadyReconciled: true };
  return db.transaction(async tx => {
    const statement = (await tx.select().from(bankStatements).where(eq(bankStatements.id, transaction.bankStatementId)).limit(1))[0];
    if (!statement || !canReconcileBankTransaction(statement.status)) throw new Error("Ekstrakti nuk është i hapur për pajtim");
    if (paymentId) {
      const payment = (await tx.select().from(payments).where(and(eq(payments.id, paymentId), eq(payments.companyId, transaction.companyId))).limit(1))[0];
      if (!payment || !canReconcileBankTransaction(statement.status, payment.status)) throw new Error("Zgjidhni një pagesë të postuar nga e njëjta kompani");
    }
    const account = (await tx.select().from(bankAccounts).where(eq(bankAccounts.id, statement.bankAccountId)).limit(1))[0];
    if (!account) throw new Error("Llogaria bankare nuk u gjet");
    const delta = calculateBankBalanceDelta(transaction.transactionType, transaction.amount);
    await tx.update(bankTransactions).set({ status: "RECONCILED", paymentId: paymentId ?? null }).where(eq(bankTransactions.id, transactionId));
    await tx.update(bankAccounts).set({ currentBalance: account.currentBalance + delta }).where(eq(bankAccounts.id, account.id));
    return { success: true };
  });
}

export async function reconcileBankStatement(statementId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const statement = await getBankStatementById(statementId);
  if (!statement) throw new Error("Ekstrakti bankar nuk u gjet");
  const transactions = await getBankTransactions(statement.companyId, statementId);
  if (!canFinalizeBankStatement(transactions.map(transaction => transaction.status))) throw new Error("Pajtoni të gjitha transaksionet para mbylljes së ekstraktit");
  await db.update(bankStatements).set({ status: "RECONCILED" }).where(eq(bankStatements.id, statementId));
  return { success: true };
}

export async function getBankReport(companyId: number) {
  const [accounts, statements, transactions] = await Promise.all([getBankAccounts(companyId), getBankStatements(companyId), getBankTransactions(companyId)]);
  return {
    accounts,
    metrics: {
      accountBalance: accounts.reduce((sum, account) => sum + account.currentBalance, 0),
      unreconciledTransactions: transactions.filter(transaction => transaction.status === "UNRECONCILED").length,
      reconciledTransactions: transactions.filter(transaction => transaction.status === "RECONCILED").length,
      incoming: transactions.filter(transaction => transaction.transactionType === "CREDIT").reduce((sum, transaction) => sum + transaction.amount, 0),
      outgoing: transactions.filter(transaction => transaction.transactionType === "DEBIT").reduce((sum, transaction) => sum + transaction.amount, 0),
      openStatements: statements.filter(statement => statement.status === "DRAFT").length,
    },
  };
}

// ============================================================
// CENTRAL ODOO-STYLE REPORTING CATALOG
// ============================================================

type OdooReportResult = { columns: string[]; rows: Record<string, unknown>[]; metrics: { label: string; value: number }[]; meta?: Record<string, string> };

const numberValue = (value: unknown) => typeof value === "number" ? value : Number(value) || 0;

function aggregateRows(rows: Record<string, unknown>[], groupColumn: string, amountColumn?: string): OdooReportResult {
  const totals = new Map<string, { count: number; amount: number }>();
  rows.forEach(row => {
    const group = String(row[groupColumn] ?? "—");
    const current = totals.get(group) ?? { count: 0, amount: 0 };
    current.count += 1;
    current.amount += amountColumn ? numberValue(row[amountColumn]) : 0;
    totals.set(group, current);
  });
  const columns = amountColumn ? [groupColumn, "Dokumente", amountColumn] : [groupColumn, "Dokumente"];
  const resultRows = Array.from(totals.entries()).map(([group, value]) => {
    const groupedRows = rows.filter(row => String(row[groupColumn] ?? "—") === group);
    const source = groupedRows[0];
    const sourceMeta = source ? Object.fromEntries(Object.entries(source).filter(([key]) => key.startsWith("__"))) : {};
    for (const key of ["__warehouse", "__warehouseName"]) {
      const values = Array.from(new Set(groupedRows.map(row => String(row[key] ?? "").trim()).filter(Boolean)));
      if (values.length > 0) sourceMeta[key] = values.join(", ");
    }
    return amountColumn ? { [groupColumn]: group, Dokumente: value.count, [amountColumn]: value.amount, ...sourceMeta } : { [groupColumn]: group, Dokumente: value.count, ...sourceMeta };
  });
  return { columns, rows: resultRows, metrics: [{ label: "Grupime", value: resultRows.length }, { label: "Dokumente", value: rows.length }, ...(amountColumn ? [{ label: "Vlera totale", value: rows.reduce((sum, row) => sum + numberValue(row[amountColumn]), 0) }] : [])] };
}

export function applyReportVariant(reportKey: string, baseReport: OdooReportResult): OdooReportResult {
  const rows = baseReport.rows;
  if (reportKey.endsWith("_pdf")) return baseReport;
  const withVariant = (nextRows: Record<string, unknown>[], label: string): OdooReportResult => ({
    ...baseReport,
    rows: nextRows,
    metrics: [...baseReport.metrics, { label, value: nextRows.length }],
  });
  const amountColumn = baseReport.columns.find(column => ["Vlera", "Të ardhura", "Bilanci", "Debi", "Kredi"].includes(column) || column.toLocaleLowerCase("sq-AL").includes("vlera"));

  if (/_status$/.test(reportKey)) return aggregateRows(rows, "Statusi", amountColumn);
  if (reportKey === "accounting_revenue_summary") return withVariant(rows.filter(row => String(row.Kategoria) === "Të ardhura"), "Të ardhura");
  if (reportKey === "accounting_expense_summary") return withVariant(rows.filter(row => String(row.Kategoria) === "Shpenzime"), "Shpenzime");
  if (reportKey === "accounting_net_result") return withVariant(rows.filter(row => String(row.Kategoria).includes("neto")), "Rezultat neto");
  if (/(volume|trend|today|summary|forecast|analysis)$/.test(reportKey) && baseReport.columns.includes("Data")) return aggregateRows(rows, "Data", amountColumn);
  if (/(top_|statement|supplier_count|customer_statement)/.test(reportKey) && amountColumn) return withVariant([...rows].sort((left, right) => numberValue(right[amountColumn]) - numberValue(left[amountColumn])), "Renditur sipas vlerës");
  if (["accounting_balance_sheet", "accounting_debit_credit", "accounting_account_register"].includes(reportKey)) return aggregateRows(rows, "Tipi", "Bilanci");
  if (reportKey === "bank_cash_flow") return aggregateRows(rows, "Lloji", "Vlera");
  if (reportKey === "bank_reconciled_register") return withVariant(rows.filter(row => String(row.Statusi) === "RECONCILED"), "Të pajtuara");
  if (reportKey === "crm_overdue_activities") return withVariant(rows.filter(row => {
    const deadline = row.Afati ? new Date(String(row.Afati)).getTime() : Number.POSITIVE_INFINITY;
    return deadline < Date.now() && String(row.Statusi) !== "DONE";
  }), "Të vonuara");
  if (reportKey === "crm_activity_schedule") return aggregateRows(rows, "Lloji");
  if (reportKey === "inventory_stock_by_product") return aggregateRows(rows, "Artikulli", "Stoku");
  if (reportKey === "inventory_stock_by_location") return aggregateRows(rows, "Lokacioni", "Sasia");
  if (reportKey === "inventory_movement_in") return withVariant(rows.filter(row => String(row.Lloji || row["Lloj Dok."] || "").toUpperCase() === "IN"), "Hyrje");
  if (reportKey === "inventory_movement_out") return withVariant(rows.filter(row => String(row.Lloji || row["Lloj Dok."] || "").toUpperCase() === "OUT"), "Dalje");
  if (reportKey === "inventory_transfer_status") return aggregateRows(rows, "Statusi");
  if (reportKey === "inventory_adjustment_status") return aggregateRows(rows, "Statusi");
  if (reportKey === "inventory_negative_stock") return withVariant(rows.filter(row => numberValue(row.Stoku) < 0), "Stok negativ");
  if (reportKey === "inventory_value_by_product") return aggregateRows(rows, "Artikulli", "Vlera");
  if (reportKey === "inventory_stock_summary") {
    const totalStock = rows.reduce((sum, row) => sum + numberValue(row.Stoku), 0);
    const totalValue = rows.reduce((sum, row) => sum + numberValue(row.Stoku) * numberValue(row["Çmimi mesatar"]), 0);
    return { columns: ["Artikuj", "Njësi në stok", "Vlera e vlerësuar"], rows: [{ Artikuj: rows.length, "Njësi në stok": totalStock, "Vlera e vlerësuar": totalValue }], metrics: [{ label: "Artikuj", value: rows.length }, { label: "Njësi", value: totalStock }, { label: "Vlera", value: totalValue }] };
  }
  if (/(open|unreconciled|overdue|negative|low|reorder)/.test(reportKey)) {
    const statusRows = baseReport.columns.includes("Statusi") ? rows.filter(row => !["POSTED", "PAID", "VALIDATED", "RECONCILED", "DONE", "WON"].includes(String(row.Statusi))) : rows;
    const stockRows = baseReport.columns.includes("Stoku") ? statusRows.filter(row => numberValue(row.Stoku) <= 0 || numberValue(row.Mungesa) > 0) : statusRows;
    return withVariant(stockRows, "Kërkojnë veprim");
  }
  if (/(movement_in|transactions_in|payment_inbound|incoming)/.test(reportKey)) return withVariant(rows.filter(row => ["IN", "INBOUND", "CREDIT"].includes(String(row.Lloji))), "Hyrje");
  if (/(movement_out|transactions_out|payment_outbound|outgoing)/.test(reportKey)) return withVariant(rows.filter(row => ["OUT", "OUTBOUND", "DEBIT"].includes(String(row.Lloji))), "Dalje");
  if (/(active_taxes)/.test(reportKey)) return withVariant(rows.filter(row => String(row.Aktive) === "Po"), "Norma aktive");
  if (/(won_revenue|won_register)/.test(reportKey)) return withVariant(rows.filter(row => String(row.Faza) === "WON"), "Të fituara");
  if (/(lost_opportunities)/.test(reportKey)) return withVariant(rows.filter(row => ["LOST", "CANCELLED"].includes(String(row.Faza))), "Të humbura");
  if (/(opportunities)/.test(reportKey)) return withVariant(rows.filter(row => String(row.Tipi) === "OPPORTUNITY"), "Opportunity");
  if (/(leads_register|lead_status|contact_register|probability)/.test(reportKey)) return withVariant(rows.filter(row => String(row.Tipi) === "LEAD"), "Lead-e");
  if (/(register|ledger|entries|control)/.test(reportKey)) return {
    columns: ["Nr. rreshti", ...baseReport.columns],
    rows: rows.map((row, index) => ({ "Nr. rreshti": index + 1, ...row })),
    metrics: [...baseReport.metrics, { label: "Rreshta të regjistrit", value: rows.length }],
  };
  return baseReport;
}

const REFERENCE_COLUMN_SCHEMAS: Record<string, string[]> = {
  purchase_supplier_card_pdf: ["Nr Rend", "Data Rregj", "Lloj Dok", "Nr Dok", "Data Dok", "Përshkrimi i Veprimit", "Debi", "Kredi", "Progresivi", "Debi llogari", "Kredi llogari", "Progresivi llogari"],
  purchase_supplier_card_format3_pdf: ["Nr Rend", "Data Rregj", "Lloj Dok", "Nr Dok", "Data Dok", "Përshkrimi i Veprimit", "Debi", "Kredi", "Progresivi"],
  purchase_supplier_maturity_pdf: ["Dt. Dok", "Nr Dok", "Lloj Dok", "Date Maturimi", "Dite Maturimi", "Tejkaluar", "0", "1-30", "30-60", "60-90", "90-180", ">", "Totali"],
  purchase_supplier_maturity_summary_pdf: ["Kod Klienti", "Emri", "Llogaria", "Mon Lig", "Total", "0", "1-30", "30-60", "60-90", "90-180", "Mbi 180"],
  inventory_product_summary_pdf: ["Kartelë", "Përshkrimi", "Grupi", "Njësia", "Llog. Inventar", "Gjendje Mbartur", "Hyrje", "Dalje", "Gjendje", "Kosto", "Vlefta"],
  inventory_warehouse_status_pdf: ["Kartelë", "Përshkrimi", "Grupi", "Njësia", "Llog. Inventar", "Hyrje", "Dalje", "Gjendje", "Kosto", "Vlefta", "Në %"],
  inventory_article_analysis_pdf: ["Kartela", "Emërtimi", "Njësia", "Gjendje me Pare", "Hyrje nga Blerjet", "Hyrje të Tjera", "Dalje për Shitje", "Dalje të Tjera", "Gjendje", "Çmimi mesatar", "Vlefta"],
  purchase_supplier_situation_pdf: ["Nr Rend", "Kodi", "Emertimi i Furnitorit", "Nr Llogarie", "Kategoria", "Shuma Debi", "Shuma Kredi", "Detyrimi", "Pesha %"],
  purchase_supplier_situation_category_pdf: ["Kodi", "Emërtimi", "Mon", "Qyteti", "Debi", "Kredi", "Detyrimi", "Debi bazë", "Kredi bazë", "Detyrimi bazë"],
  purchase_customs_import_register_pdf: ["Ref.", "Nr.Fl.Dog.", "Dt Fl.Dog.", "Vl.Fatures", "Monedha", "Kursi", "Vlefta", "Transport", "Siguracion", "Refer./Tjera", "Vl.Dogane", "Dog", "Akciz", "Vl pa TVSH", "TVSH"],
  purchase_invoice_payment_register_pdf: ["Fature", "Pagese", "Numer", "Date", "Pershkrimi", "Faturuar", "Paguar", "Diferenca"],
  purchase_summary_register_pdf: ["Nr. rend", "Lloji", "Nr.", "Dt. Dok", "Monedha", "Kursi", "Kodi", "Emertimi", "Nentotal", "Zbritje", "TVSH", "Totali", "TVSH bazë", "Totali bazë"],
  sales_by_customer_pdf: ["Kodi", "Emërtimi", "Qyteti", "Fatura", "Vlefta"],
  sales_by_city_pdf: ["Qyteti", "Klientë", "Fatura", "Vlera"],
  sales_unsold_items_pdf: ["Nr. Blerje", "Dt.", "Njësia", "Kartelë", "Emërtimi i Artikullit", "Kod Bar", "Gjendja"],
  sales_summary_register_pdf: ["Nr Rend", "Lloj", "Nr", "Date", "Mon", "Kod i Klientit", "Kodi Artikulli", "Vlefta Artikulli", "Zbritje Anal.", "Zbritje Tot.", "Zbritje %", "Zbritje Gjithsej Vlefta", "Vlera me Zbritje pa TVSH", "Vlera me Zbritje me TVSH", "Vlera në Mon Baze pa TVSH", "Vlera në Mon Baze TVSH"],
  sales_quantity_pdf: ["Artikulli", "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"],
  sales_quantity_total_pdf: ["Artikulli", "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"],
  sales_items_sold_pdf: ["Kartelë", "Emërtimi", "Njësia", "Sasia", "Çmimi", "Vlefta pa TVSH", "Vlefta me TVSH", "Në %", "Vlefta pa TVSH me Zbritje", "Vlefta me TVSH me Zbritje", "Në % Analitike"],
  sales_discount_analysis_pdf: ["Kartela", "Emërtimi", "Njësia", "Sasia", "Çmimi", "Vlefta pa TVSH", "Vlefta me TVSH", "Në %", "Vlefta pa TVSH me Zbritje", "Vlefta me TVSH me Zbritje", "Në % Analitike"],
  sales_product_card_pdf: ["Nr Kartele", "Kodbar", "Grup Malli", "Nën Grupi", "Klienti", "Nr. Dok", "Dt. Dok", "Lloj Dok", "Njësia", "Sasia", "Çmimi", "Vlera Pa TVSH", "Vlera Me TVSH", "Progresiv Sasi"],
  sales_returns_pdf: ["Nr.Dok", "Dt.Dok", "Numer FS.Ref", "Date FS.Ref", "Artikulli", "Sasi Fature", "Sasi e Kthyer", "Çmimi", "Zbritje %", "Vlefta e Kthyer me TVSH", "Monedha", "Kursi", "Vlefta e kthyer me TVSH ne MB"],
  sales_margin_pdf: ["Kartela", "Emërtimi i Artikullit", "Njësia", "Sasia e Shitur", "Kosto/Njesi", "KMSH", "Çmimi i shitjes", "Vlera Shitjes", "Marzhi Bruto me Zbritje", "Marzhi Bruto % me Zbritje", "Marzhi Bruto", "Marzhi Bruto %"],
  sales_margin_detail_pdf: ["Kodi", "Emërtimi", "Grupi", "Nën Grupi", "Kodi artikulli", "Emërtimi artikulli", "Sasia", "Volumi Shitjeve(%)", "Vlera e Shitjes", "KMSH", "Marzhi", "Marzhi në %", "Mark up", "Sales"],
  sales_by_product_pdf: ["Klienti", "Sasia", "Çmimi", "Grupi", "Emërtimi", "Nën Grupi", "Kodi", "Volumi i Shitjeve në %", "Vlere(MB)"],
  sales_price_list_pdf: ["Kartela", "Kodbari", "Emërtimi i Artikullit", "Njesia", "Grupi", "Nengrupi", "Cmimi 1", "Cmimi 2", "Cmimi 3", "Cmimi 4", "Cmimi 5"],
  sales_comparison_pdf: ["Lloj", "Kod i Klientit", "Vlefte Artikulli", "Zbritje", "pa Tvsh", "me Tvsh", "pa Tvsh Baze", "Tvsh Baze"],
  sales_analytic_register_pdf: ["Rend", "Lloj", "Kodi", "Nr", "Dt", "Kodi Klienti", "Emertimi", "Njesia", "Monedha", "Cmimi", "Sasia", "Vlera Gjithsej", "Zbr. Art%", "Vlera me Zbritje Art", "Zbr. Tot%", "Vlera Me Zbritje Tot%", "Kursi", "Vlera Me TVSH Mon. Fature", "Vlera Me Zbritje Mon. Baze"],
  inventory_minimum_status_pdf: ["Kartela", "Përshkrimi", "Grupi", "Njësia", "Llog. Inventare", "Minimum", "Mungesat", "Hyrje", "Dalje", "Gjendje", "Kosto", "Vlefta", "Furnitori"],
  inventory_warehouse_detail_pdf: ["Kartela", "Përshkrimi", "Grupi", "Njësia", "Llog. Inventar", "Hyrje", "Dalje", "Gjendje", "Kosto", "Vlefta", "Në %"],
  inventory_product_card_pdf: ["Lloj Dok.", "Nr Dokumenti", "Dt Dokumenti", "Magazina", "Njësia", "Hyrje", "Çmimi Hyrje", "Vlefta Hyrje", "Dalje", "Çmimi Dalje", "Vlefta Dalje", "Gjendje", "Vlefta"],
  inventory_analytic_register_pdf: ["Lloji", "Numri", "Data", "Dt Regj", "Kartela", "Përshkrimi", "Njësia", "Sasia", "Çmimi", "Vlefta"],
};

const REFERENCE_FIELD_ALIASES: Record<string, string[]> = {
  "Ref.": ["Dokumenti"], "Nr.Fl.Dog.": ["Dokumenti"], "Dt Fl.Dog.": ["Data"], "Vl.Fatures": ["Vlera"], "Vlefta": ["Vlera"],
  "Emërtimi": ["Furnitori", "Klienti", "Artikulli"], "Kodi": ["Kodi i Klientit", "Kartelë", "Kodi"], "Kartela": ["Kodi", "Kartelë"], "Artikulli": ["Artikulli"], "Përshkrimi": ["Përshkrimi", "Artikulli"],
  "Fatura": ["Fatura"], "Vlefta e Kthyer me TVSH": ["Vlera"], "Vlefta e kthyer me TVSH ne MB": ["Vlera"], "Vlera e Shitjes": ["Vlera", "Vlera pa TVSH"],
  "Sasia": ["Sasia"], "Çmimi": ["Çmimi", "Çmimi mesatar"], "Njësia": ["Njësia"], "Nr. Dok": ["Nr. dokumentit", "Dokumenti"], "Nr Dok": ["Nr. dokumentit", "Dokumenti"],
  "Data Rregj": ["Data"], "Data Dok": ["Data"], "Dt. Dok": ["Data"], "Dt.Dok": ["Data"], "Përshkrimi i Veprimit": ["Përshkrimi"], "Nr Rend": [],
  "Lloj": ["Lloj Dok"], "Lloj Dok": ["Lloj", "Përshkrimi"], "Klienti": ["Partneri", "Klienti"], "Furnitori": ["Partneri", "Furnitori"], "Vlera Pa TVSH": ["Vlera"], "Vlera Me TVSH": ["Vlera"],
  "Gjendje": ["Gjendje", "Sasia", "Stoku"], "Kosto": ["Çmimi mesatar", "Kosto"], "Hyrje": ["Hyrje"], "Hyrje nga Blerjet": ["Hyrje"], "Dalje": ["Dalje"], "Dalje për Shitje": ["Dalje"], "Mungesat": ["Mungesa"], "Minimum": ["Minimumi"],
};

export type ReportInvoicePaymentRecord = {
  id: number;
  docNumber: string;
  totalAmount?: number | null;
  vatAmount?: number | null;
  currency?: string | null;
  exchangeRate?: number | string | null;
  paymentStatus?: string | null;
  status?: string | null;
  supplierId?: number | null;
  customerId?: number | null;
};

export type ReportPaymentRecord = {
  reference?: string | null;
  paymentType: string;
  partnerType?: string | null;
  amount: number;
  currency?: string | null;
  exchangeRate?: number | string | null;
  status?: string | null;
};

export type ReportInvoicePaymentTotals = { paid: number; paidBase: number };

/** Matches company-scoped payments to invoices by reference for live report balances. */
export function buildReportInvoicePaymentTotals(
  invoices: ReportInvoicePaymentRecord[],
  payments: ReportPaymentRecord[],
  paymentType: "INBOUND" | "OUTBOUND",
  partnerType: "CUSTOMER" | "SUPPLIER",
): Map<number, ReportInvoicePaymentTotals> {
  const invoiceByReference = new Map<string, ReportInvoicePaymentRecord>();
  invoices.forEach(invoice => {
    const reference = normalizeDocumentNumber(invoice.docNumber);
    if (reference) invoiceByReference.set(reference, invoice);
  });
  const totals = new Map<number, ReportInvoicePaymentTotals>();
  payments.forEach(payment => {
    if (payment.paymentType !== paymentType || payment.partnerType !== partnerType || payment.status === "CANCELLED") return;
    const invoice = invoiceByReference.get(normalizeDocumentNumber(payment.reference || ""));
    if (!invoice) return;
    const paymentRate = Number(payment.exchangeRate || 1);
    const invoiceRate = Number(invoice.exchangeRate || 1);
    const paidBase = Math.round(Number(payment.amount || 0) * paymentRate);
    const paid = Math.round(paidBase / invoiceRate);
    const current = totals.get(invoice.id) ?? { paid: 0, paidBase: 0 };
    current.paid += paid;
    current.paidBase += paidBase;
    totals.set(invoice.id, current);
  });
  return totals;
}

export function getReportInvoiceAmount(invoice: ReportInvoicePaymentRecord): number {
  return Number(invoice.totalAmount || 0) + Number(invoice.vatAmount || 0);
}

export function resolveReportInvoicePayment(invoice: ReportInvoicePaymentRecord, totals: Map<number, ReportInvoicePaymentTotals>) {
  const billed = getReportInvoiceAmount(invoice);
  const rate = Number(invoice.exchangeRate || 1);
  const measured = totals.get(invoice.id) ?? { paid: 0, paidBase: 0 };
  const isPaid = invoice.status === "PAID" || invoice.paymentStatus === "PAID";
  const paid = isPaid ? Math.max(measured.paid, billed) : measured.paid;
  const paidBase = isPaid ? Math.max(measured.paidBase, Math.round(billed * rate)) : measured.paidBase;
  return { billed, billedBase: Math.round(billed * rate), paid, paidBase, remaining: billed - paid, remainingBase: Math.round(billed * rate) - paidBase };
}

export function getReportPaymentStatus(invoice: ReportInvoicePaymentRecord, remaining: number): string {
  if (invoice.status === "CANCELLED") return "Anuluar";
  if (remaining <= 0 || invoice.status === "PAID" || invoice.paymentStatus === "PAID") return "E paguar";
  if (remaining < getReportInvoiceAmount(invoice)) return "Pjesërisht";
  if (invoice.paymentStatus === "LATER") return "Më vonë";
  return "E papaguar";
}

export function calculateSupplierSituationAmounts(totalAmount: number, exchangeRate: number, paid: boolean) {
  const debit = Number(totalAmount || 0);
  const debitBase = Math.round(debit * Number(exchangeRate || 1));
  const credit = paid ? debit : 0;
  const creditBase = paid ? debitBase : 0;
  return { debit, credit, debitBase, creditBase, balance: debit - credit, balanceBase: debitBase - creditBase };
}

export function mapPurchaseCustomsFields(invoice: { inventoryReference?: string | null; docNumber: string; date: Date; totalAmount?: number | null; currency?: string | null; exchangeRate?: number | string | null; carrierName?: string | null; vehiclePlate?: string | null; vatAmount?: number | null }) {
  const total = Number(invoice.totalAmount || 0);
  const vat = Number(invoice.vatAmount || 0);
  return { "Ref.": invoice.inventoryReference || invoice.docNumber, "Nr.Fl.Dog.": invoice.inventoryReference || "", "Dt Fl.Dog.": invoice.date, "Vl.Fatures": total, Monedha: invoice.currency || "ALL", Kursi: invoice.exchangeRate ?? "", Vlefta: total, Transport: invoice.carrierName || "", Siguracion: invoice.vehiclePlate || "", "Refer./Tjera": invoice.inventoryReference || "", "Vl.Dogane": "", Dog: "", Akciz: "", "Vl pa TVSH": total - vat, TVSH: vat };
}

export function normalizePurchasePaymentAmount(amount: number, exchangeRate: number) {
  return Math.round(Number(amount || 0) * Number(exchangeRate || 1));
}

export function getSupplierMaturityBucket(days: number) {
  const safeDays = Math.max(0, Math.floor(Number(days) || 0));
  return safeDays === 0 ? "0" : safeDays <= 30 ? "1-30" : safeDays <= 60 ? "30-60" : safeDays <= 90 ? "60-90" : safeDays <= 180 ? "90-180" : "Mbi 180";
}

export function getInventoryRunningKey(warehouseId: number | null | undefined, productId: number) {
  return `${String(warehouseId ?? 0)}:${productId}`;
}

export function applyInventoryValuePercent(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  const totalValue = rows.reduce((sum, row) => sum + Math.abs(numberValue(row.Vlefta)), 0);
  return rows.map(row => ({ ...row, "Në %": totalValue > 0 ? Number(((Math.abs(numberValue(row.Vlefta)) / totalValue) * 100).toFixed(2)) : 0 }));
}

export function shapeReferenceReport(reportKey: string, report: OdooReportResult): OdooReportResult {
  const schema = REFERENCE_COLUMN_SCHEMAS[reportKey];
  if (!schema) return report;
  const rows = report.rows.map(row => ({
    ...Object.fromEntries(schema.map(column => {
      const aliases = [column, ...(REFERENCE_FIELD_ALIASES[column] ?? [])];
      const source = aliases.find(alias => Object.prototype.hasOwnProperty.call(row, alias));
      return [column, source ? row[source] : ""];
    })),
    ...Object.fromEntries(Object.entries(row).filter(([key]) => key.startsWith("__"))),
  }));
  return { ...report, columns: schema, rows };
}

type OdooReportFilterInput = {
  dateFrom?: Date;
  dateTo?: Date;
  documentFilter?: string;
  documentFilterEnd?: string;
  partnerFilter?: string;
  categoryFilter?: string;
  statusFilter?: string;
  currencyFilter?: string;
  documentTypeFilter?: string;
  warehouseFilter?: string;
  unitFilter?: string;
  amountMin?: string;
  amountMax?: string;
};

export function applyOdooReportFilters(report: OdooReportResult, filters: OdooReportFilterInput): OdooReportResult {
  const active = [
    ["Furnitor / Klient", filters.partnerFilter], ["Nr. dokumenti", filters.documentFilter], ["Nr. dokumenti deri", filters.documentFilterEnd], ["Kategori / Artikull", filters.categoryFilter], ["Status", filters.statusFilter], ["Monedha", filters.currencyFilter], ["Lloj dokumenti", filters.documentTypeFilter], ["Magazina", filters.warehouseFilter], ["Njësia", filters.unitFilter], ["Shuma minimale", filters.amountMin], ["Shuma maksimale", filters.amountMax],
  ].filter(([, value]) => String(value ?? "").trim().length > 0) as [string, string][];
  if (active.length === 0) return report;
  const normalized = active.map(([label, value]) => [label, value.trim().toLocaleLowerCase("sq-AL")] as const);
  const min = filters.amountMin?.trim() ? Number(filters.amountMin) : undefined;
  const max = filters.amountMax?.trim() ? Number(filters.amountMax) : undefined;
  const rowText = (row: Record<string, unknown>) => Object.values(row).map(value => String(value ?? "")).join(" ").toLocaleLowerCase("sq-AL");
  const rowFieldText = (row: Record<string, unknown>, keys: string[]) => keys.map(key => String(row[key] ?? "")).join(" ").toLocaleLowerCase("sq-AL");
  const amountColumn = report.columns.find(column => ["Vlera", "Vlefta", "Totali", "Detyrimi", "Debi", "Kredi", "Vlera në Lek", "Vlefta në Lek", "Vlera totale në Lek", "Vlefta Shitjes", "Vlere(MB)"].includes(column));
  const documentRangeMatch = (row: Record<string, unknown>) => {
    const start = filters.documentFilter?.trim().toLocaleLowerCase("sq-AL") ?? "";
    const end = filters.documentFilterEnd?.trim().toLocaleLowerCase("sq-AL") ?? "";
    const document = rowFieldText(row, ["__documentNumber", "Dokumenti", "Nr Dok", "Nr. Dok", "Nr dokumenti", "Nr", "Fatura"]).trim();
    if (!end) return !start || document.includes(start);
    const trailingNumber = (item: string) => item.match(/(\d+)(?!.*\d)/)?.[1];
    const valueNumber = trailingNumber(document);
    const startNumber = trailingNumber(start);
    const endNumber = trailingNumber(end);
    if (valueNumber && endNumber && (!start || startNumber)) {
      const value = Number(valueNumber);
      return (!startNumber || value >= Number(startNumber)) && value <= Number(endNumber);
    }
    return (!start || document >= start) && document <= end;
  };
  const rows = report.rows.filter(row => {
    const text = rowText(row);
    const amountValue = amountColumn ? row[amountColumn] : undefined;
    const numeric = typeof amountValue === "number" ? amountValue : Number(amountValue);
    const amount = Number.isFinite(numeric) ? numeric : Number.NaN;
    return normalized.every(([label, value]) => {
      if (label === "Shuma minimale" || label === "Shuma maksimale") return true;
      if (label === "Furnitor / Klient") {
        const partnerText = rowFieldText(row, ["__partnerName", "Partneri", "Furnitori", "Klienti", "Emërtimi", "Emërtimi i Artikullit"]);
        return partnerText.includes(value);
      }
      if (label === "Nr. dokumenti") {
        return documentRangeMatch(row);
      }
      if (label === "Nr. dokumenti deri") {
        return true;
      }
      if (label === "Monedha") {
        const currencyText = rowFieldText(row, ["Monedha", "Mon", "Currency"]);
        return currencyText.includes(value);
      }
      if (label === "Lloj dokumenti") {
        const documentTypeText = rowFieldText(row, ["__documentType", "Lloj Dok", "Lloj", "Përshkrimi i Veprimit"]);
        return documentTypeText.includes(value);
      }
      if (label === "Magazina") {
        const warehouseText = rowFieldText(row, ["Magazina", "Magazinë", "Warehouse", "__warehouseName", "__warehouse", "warehouseName"]);
        return warehouseText.includes(value);
      }
      if (label === "Njësia") {
        const unitText = rowFieldText(row, ["Njësia", "Njesia", "__unitName"]);
        return unitText.includes(value);
      }
      return text.includes(value);
    }) && (min === undefined || (Number.isFinite(amount) && amount >= min)) && (max === undefined || (Number.isFinite(amount) && amount <= max));
  });
  const metrics = report.metrics.map(metric => {
    if (["Dokumente", "Fatura", "Grupime", "Rreshta të regjistrit", "Kërkojnë veprim"].includes(metric.label)) return { ...metric, value: rows.length };
    if (amountColumn && ["Vlera", "Vlefta", "Totali", "Detyrim", "Shpenzim", "Vlera totale në Lek"].includes(metric.label)) return { ...metric, value: rows.reduce((sum, row) => sum + Number(row[amountColumn] || 0), 0) };
    return metric;
  });
  const meta = { ...(report.meta ?? {}), ...Object.fromEntries(active) };
  if (filters.partnerFilter?.trim()) {
    const partners = Array.from(new Set(rows.map(row => String(row.__partnerName ?? row.Partneri ?? row.Furnitori ?? row.Klienti ?? "").trim()).filter(Boolean)));
    if (Object.prototype.hasOwnProperty.call(meta, "Furnitori") || partners.length > 0) meta.Furnitori = partners.join(", ") || filters.partnerFilter.trim();
    if (Object.prototype.hasOwnProperty.call(meta, "Klienti")) meta.Klienti = partners.join(", ") || filters.partnerFilter.trim();
  }
  return { ...report, rows, metrics, meta };
}

export const PURCHASE_DEDICATED_REPORT_KEYS = new Set([
  "purchase_summary_register_pdf", "purchase_invoices", "purchase_document_register", "purchase_product_card_alpha",
  "purchase_items_detail_alpha", "purchase_items_expiry_alpha", "purchase_customs_import_register_pdf", "purchase_items_alpha",
  "purchase_items_by_branch_alpha", "purchase_analytic_register_format2_alpha", "purchase_contract_conversion_alpha",
  "purchase_analytic_register_format3_alpha", "purchase_analytic_alpha", "purchase_product_card_format2_alpha",
  "purchase_analytic_detail_alpha", "purchase_monthly_ledger_alpha", "purchase_price_list_alpha", "purchase_invoice_payment_register_pdf",
]);

export function resolveOdooBaseReportKey(reportKey: string) {
  return PURCHASE_DEDICATED_REPORT_KEYS.has(reportKey) ? reportKey : REPORT_BASE_KEYS[reportKey];
}

export async function getOdooReport(companyId: number, reportKey: string, filters: OdooReportFilterInput) {
  const baseKey = resolveOdooBaseReportKey(reportKey);
  if (!baseKey) throw new Error("Raporti i kërkuar nuk ekziston");
  const baseReport = await getOdooBaseReport(companyId, baseKey, filters);
  return applyOdooReportFilters(shapeReferenceReport(reportKey, applyReportVariant(reportKey, baseReport)), filters);
}

async function getOdooBaseReport(companyId: number, reportKey: string, filters: { dateFrom?: Date; dateTo?: Date }): Promise<OdooReportResult> {
  const inRange = (value: Date | null | undefined) => {
    if (!value) return true;
    const time = new Date(value).getTime();
    return (!filters.dateFrom || time >= filters.dateFrom.getTime()) && (!filters.dateTo || time <= filters.dateTo.getTime() + 86_399_999);
  };
  const result = (columns: string[], rows: Record<string, unknown>[], metrics: { label: string; value: number }[] = [], meta?: Record<string, string>) => ({ columns, rows, metrics, ...(meta ? { meta } : {}) });
  const documentRows = (records: any[], dateField: string, partnerField: string, amountField?: string, documentType?: string) => {
    const filtered = records.filter(record => inRange(record[dateField]));
    const paymentInLek = (record: any) => Math.round((record[amountField!] ?? 0) * (record.currency === "ALL" || !record.currency ? 1 : Number(record.exchangeRate || 1)));
    return result(
      ["Dokumenti", "Data", "Partneri", ...(amountField ? ["Vlera", "Monedha", "Kursi", "Vlera në Lek"] : []), "Statusi"],
      filtered.map(record => ({ Dokumenti: record.docNumber, Data: record[dateField], Partneri: record[partnerField] || "—", ...(amountField ? { Vlera: record[amountField] ?? 0, Monedha: record.currency || "ALL", Kursi: Number(record.exchangeRate || 1).toFixed(6), "Vlera në Lek": paymentInLek(record) } : {}), Statusi: record.status, __documentId: record.id, __documentType: documentType })),
      [{ label: "Dokumente", value: filtered.length }, ...(amountField ? [{ label: "Vlera totale në Lek", value: filtered.reduce((sum, record) => sum + paymentInLek(record), 0) }] : [])],
    );
  };
  const paymentAwareInvoiceRows = (records: ReportInvoicePaymentRecord[], partnerField: "supplierName" | "customerName", paymentRecords: ReportPaymentRecord[], paymentType: "INBOUND" | "OUTBOUND", partnerType: "CUSTOMER" | "SUPPLIER", documentType: string) => {
    const filtered = records.filter(record => inRange((record as any).date));
    const paymentTotals = buildReportInvoicePaymentTotals(records, paymentRecords, paymentType, partnerType);
    const rows = filtered.map(record => {
      const payment = resolveReportInvoicePayment(record, paymentTotals);
      return {
        Dokumenti: record.docNumber,
        Data: (record as any).date,
        Partneri: (record as any)[partnerField] || "—",
        Vlera: payment.billed,
        Paguar: payment.paid,
        Mbetur: payment.remaining,
        Monedha: record.currency || "ALL",
        Kursi: Number(record.exchangeRate || 1).toFixed(6),
        "Vlera në Lek": payment.billedBase,
        Statusi: getReportPaymentStatus(record, payment.remaining),
        __documentId: record.id,
        __documentType: documentType,
        __documentNumber: record.docNumber,
        __partnerName: (record as any)[partnerField] || "—",
        __currency: record.currency || "ALL",
        __paidAmount: payment.paid,
        __remainingAmount: payment.remaining,
        __paidBaseAmount: payment.paidBase,
        __remainingBaseAmount: payment.remainingBase,
      };
    });
    return result(["Dokumenti", "Data", "Partneri", "Vlera", "Paguar", "Mbetur", "Monedha", "Kursi", "Vlera në Lek", "Statusi"], rows, [
      { label: "Dokumente", value: rows.length },
      { label: "Vlera totale në Lek", value: rows.reduce((sum, row) => sum + numberValue(row["Vlera në Lek"]), 0) },
      { label: "Paguar", value: rows.reduce((sum, row) => sum + numberValue(row.Paguar), 0) },
      { label: "Mbetur", value: rows.reduce((sum, row) => sum + numberValue(row.Mbetur), 0) },
    ]);
  };
  const salesItemsForPeriod = async () => {
    const invoices = (await getSalesInvoices(companyId)).filter(invoice => inRange(invoice.date));
    const grouped = await Promise.all(invoices.map(async invoice => ({ invoice, items: await getSalesItems(invoice.id) })));
    return grouped.flatMap(({ invoice, items }) => items.map(item => ({ invoice, item })));
  };
  const salesLineAmounts = calculateSalesLineAmounts;
  const monthNames = ["Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"];
  const purchaseInvoiceLinesForPeriod = async () => {
    const [invoices, supplierRecords, productRecords, warehouseRecords] = await Promise.all([getPurchaseInvoices(companyId), getSuppliers(companyId), getProducts(companyId), getWarehouses(companyId)]);
    const supplierMap = new Map(supplierRecords.map(supplier => [supplier.id, supplier]));
    const productMap = new Map(productRecords.map(product => [product.id, product]));
    const warehouseMap = new Map(warehouseRecords.map(warehouse => [warehouse.id, warehouse.name]));
    const lineGroups = await Promise.all(invoices.filter(invoice => inRange(invoice.date)).map(async invoice => ({ invoice, items: await getPurchaseItems(invoice.id) })));
    return lineGroups.flatMap(({ invoice, items }) => items.map(item => ({
      invoice,
      item,
      supplier: invoice.supplierId ? supplierMap.get(invoice.supplierId) : undefined,
      product: item.productId ? productMap.get(item.productId) : undefined,
      warehouseName: invoice.warehouseId ? warehouseMap.get(invoice.warehouseId) || `#${invoice.warehouseId}` : "",
    })));
  };
  const purchaseInvoiceAmounts = (invoice: { totalAmount?: number | null; vatAmount?: number | null; exchangeRate?: number | string | null }) => {
    const total = Number(invoice.totalAmount || 0);
    const vat = Number(invoice.vatAmount || 0);
    const rate = Number(invoice.exchangeRate || 1);
    return { total, vat, net: total - vat, rate, totalBase: Math.round(total * rate) };
  };

  switch (reportKey) {
    case "purchase_document_register": {
      const invoices = (await getPurchaseInvoices(companyId)).filter(invoice => inRange(invoice.date));
      const rows = invoices.map((invoice, index) => {
        const amounts = purchaseInvoiceAmounts(invoice);
        return { "Nr. rend": index + 1, Dokumenti: invoice.docNumber, Data: invoice.date, Furnitori: invoice.supplierName || "Pa furnitor", "Vlera pa TVSH": amounts.net, TVSH: amounts.vat, Totali: amounts.total, Monedha: invoice.currency || "ALL", Kursi: amounts.rate, Statusi: invoice.status, __partnerName: invoice.supplierName || "Pa furnitor", __documentNumber: invoice.docNumber, __status: invoice.status, __currency: invoice.currency || "ALL", __warehouseName: invoice.warehouseId ? String(invoice.warehouseId) : "", __documentId: invoice.id, __documentType: "purchase-invoice" };
      });
      return result(["Nr. rend", "Dokumenti", "Data", "Furnitori", "Vlera pa TVSH", "TVSH", "Totali", "Monedha", "Kursi", "Statusi"], rows, [{ label: "Fatura", value: rows.length }, { label: "Totali", value: rows.reduce((sum, row) => sum + numberValue(row.Totali), 0) }]);
    }
    case "purchase_product_card_alpha": {
      const lines = (await purchaseInvoiceLinesForPeriod()).sort((left, right) => new Date(left.invoice.date).getTime() - new Date(right.invoice.date).getTime() || left.invoice.id - right.invoice.id);
      const progressive = new Map<number | string, number>();
      const rows = lines.map(({ invoice, item, product, supplier, warehouseName }) => {
        const key = String(item.productId ?? item.productName ?? "Pa artikull");
        const balance = (progressive.get(key) || 0) + Number(item.quantity || 0);
        progressive.set(key, balance);
        return { Kartela: product?.code || product?.barcode || "—", Artikulli: product?.name || item.productName || "Pa artikull", "Nr. faturës": invoice.docNumber, Data: invoice.date, Furnitori: invoice.supplierName || supplier?.name || "Pa furnitor", Hyrje: item.quantity || 0, "Çmimi blerjes": item.unitPrice || 0, Vlefta: item.totalPrice || 0, Gjendje: balance, Magazina: warehouseName, __partnerName: invoice.supplierName || supplier?.name || "Pa furnitor", __documentNumber: invoice.docNumber, __warehouseName: warehouseName, __documentId: invoice.id, __documentType: "purchase-invoice" };
      });
      return result(["Kartela", "Artikulli", "Nr. faturës", "Data", "Furnitori", "Hyrje", "Çmimi blerjes", "Vlefta", "Gjendje", "Magazina"], rows, [{ label: "Rreshta", value: rows.length }, { label: "Hyrje", value: rows.reduce((sum, row) => sum + numberValue(row.Hyrje), 0) }, { label: "Vlefta", value: rows.reduce((sum, row) => sum + numberValue(row.Vlefta), 0) }]);
    }
    case "purchase_items_detail_alpha":
    case "purchase_items_expiry_alpha": {
      const includeExpiry = reportKey === "purchase_items_expiry_alpha";
      const rows = (await purchaseInvoiceLinesForPeriod()).map(({ invoice, item, product, supplier, warehouseName }) => ({ Dokumenti: invoice.docNumber, Data: invoice.date, Furnitori: invoice.supplierName || supplier?.name || "Pa furnitor", Kartela: product?.code || product?.barcode || "—", Artikulli: product?.name || item.productName || "Pa artikull", Njësia: item.unit || product?.baseUnit || "", Sasia: item.quantity || 0, "Çmimi blerjes": item.unitPrice || 0, Vlefta: item.totalPrice || 0, ...(includeExpiry ? { Seria: "", "Data e skadencës": "" } : {}), Magazina: warehouseName, __partnerName: invoice.supplierName || supplier?.name || "Pa furnitor", __documentNumber: invoice.docNumber, __warehouseName: warehouseName, __documentId: invoice.id, __documentType: "purchase-invoice" }));
      const columns = ["Dokumenti", "Data", "Furnitori", "Kartela", "Artikulli", "Njësia", "Sasia", "Çmimi blerjes", "Vlefta", ...(includeExpiry ? ["Seria", "Data e skadencës"] : []), "Magazina"];
      return result(columns, rows, [{ label: "Rreshta", value: rows.length }, { label: "Sasi", value: rows.reduce((sum, row) => sum + numberValue(row.Sasia), 0) }, { label: "Vlefta", value: rows.reduce((sum, row) => sum + numberValue(row.Vlefta), 0) }]);
    }
    case "purchase_items_alpha":
    case "purchase_product_card_format2_alpha": {
      const grouped = new Map<string, { code: string; name: string; unit: string; quantity: number; value: number; lastPrice: number; sourceId: number; sourceDoc: string }>();
      (await purchaseInvoiceLinesForPeriod()).forEach(({ invoice, item, product }) => {
        const key = String(item.productId ?? item.productName ?? "Pa artikull");
        const current = grouped.get(key) ?? { code: product?.code || product?.barcode || "—", name: product?.name || item.productName || "Pa artikull", unit: item.unit || product?.baseUnit || "", quantity: 0, value: 0, lastPrice: 0, sourceId: invoice.id, sourceDoc: invoice.docNumber };
        current.quantity += Number(item.quantity || 0); current.value += Number(item.totalPrice || 0); current.lastPrice = Number(item.unitPrice || current.lastPrice); grouped.set(key, current);
      });
      const rows = Array.from(grouped.values()).map(item => reportKey === "purchase_product_card_format2_alpha"
        ? ({ Kartela: item.code, Artikulli: item.name, Njësia: item.unit, "Sasia e blerë": item.quantity, "Çmimi mesatar": item.quantity ? item.value / item.quantity : 0, "Çmimi i fundit": item.lastPrice, Vlefta: item.value, __documentId: item.sourceId, __documentNumber: item.sourceDoc, __documentType: "purchase-invoice" })
        : ({ Kartela: item.code, Artikulli: item.name, Njësia: item.unit, Sasia: item.quantity, "Çmimi mesatar": item.quantity ? item.value / item.quantity : 0, Vlefta: item.value, __documentId: item.sourceId, __documentNumber: item.sourceDoc, __documentType: "purchase-invoice" }));
      const columns = reportKey === "purchase_product_card_format2_alpha" ? ["Kartela", "Artikulli", "Njësia", "Sasia e blerë", "Çmimi mesatar", "Çmimi i fundit", "Vlefta"] : ["Kartela", "Artikulli", "Njësia", "Sasia", "Çmimi mesatar", "Vlefta"];
      return result(columns, rows, [{ label: "Artikuj", value: rows.length }, { label: "Vlefta", value: rows.reduce((sum, row) => sum + numberValue(row.Vlefta), 0) }]);
    }
    case "purchase_items_by_branch_alpha": {
      const grouped = new Map<string, { warehouse: string; code: string; product: string; quantity: number; value: number; sourceId: number; sourceDoc: string }>();
      (await purchaseInvoiceLinesForPeriod()).forEach(({ invoice, item, product, warehouseName }) => {
        const key = `${warehouseName}|${String(item.productId ?? item.productName)}`;
        const current = grouped.get(key) ?? { warehouse: warehouseName || "Pa magazinë", code: product?.code || product?.barcode || "—", product: product?.name || item.productName || "Pa artikull", quantity: 0, value: 0, sourceId: invoice.id, sourceDoc: invoice.docNumber };
        current.quantity += Number(item.quantity || 0); current.value += Number(item.totalPrice || 0); grouped.set(key, current);
      });
      const rows = Array.from(grouped.values()).map(item => ({ Magazina: item.warehouse, Kartela: item.code, Artikulli: item.product, Sasia: item.quantity, Vlefta: item.value, __warehouseName: item.warehouse, __documentId: item.sourceId, __documentNumber: item.sourceDoc, __documentType: "purchase-invoice" }));
      return result(["Magazina", "Kartela", "Artikulli", "Sasia", "Vlefta"], rows, [{ label: "Rreshta", value: rows.length }, { label: "Vlefta", value: rows.reduce((sum, row) => sum + numberValue(row.Vlefta), 0) }]);
    }
    case "purchase_analytic_register_format2_alpha": {
      const invoices = (await getPurchaseInvoices(companyId)).filter(invoice => inRange(invoice.date));
      const rows = invoices.map((invoice, index) => { const amounts = purchaseInvoiceAmounts(invoice); return { Rend: index + 1, Dokumenti: invoice.docNumber, Data: invoice.date, Furnitori: invoice.supplierName || "Pa furnitor", "Vlera pa TVSH": amounts.net, TVSH: amounts.vat, "Vlera me TVSH": amounts.total, Monedha: invoice.currency || "ALL", Kursi: amounts.rate, Statusi: invoice.status, __partnerName: invoice.supplierName || "Pa furnitor", __documentNumber: invoice.docNumber, __status: invoice.status, __currency: invoice.currency || "ALL", __documentId: invoice.id, __documentType: "purchase-invoice" }; });
      return result(["Rend", "Dokumenti", "Data", "Furnitori", "Vlera pa TVSH", "TVSH", "Vlera me TVSH", "Monedha", "Kursi", "Statusi"], rows, [{ label: "Fatura", value: rows.length }, { label: "Vlefta", value: rows.reduce((sum, row) => sum + numberValue(row["Vlera me TVSH"]), 0) }]);
    }
    case "purchase_analytic_register_format3_alpha": {
      const rows = (await purchaseInvoiceLinesForPeriod()).map(({ invoice, item, product, supplier, warehouseName }, index) => ({ Rend: index + 1, Dokumenti: invoice.docNumber, Data: invoice.date, Furnitori: invoice.supplierName || supplier?.name || "Pa furnitor", Kartela: product?.code || product?.barcode || "—", Artikulli: product?.name || item.productName || "Pa artikull", Njësia: item.unit || product?.baseUnit || "", Sasia: item.quantity || 0, Çmimi: item.unitPrice || 0, Vlefta: item.totalPrice || 0, Monedha: invoice.currency || "ALL", Magazina: warehouseName, __partnerName: invoice.supplierName || supplier?.name || "Pa furnitor", __documentNumber: invoice.docNumber, __warehouseName: warehouseName, __documentId: invoice.id, __documentType: "purchase-invoice" }));
      return result(["Rend", "Dokumenti", "Data", "Furnitori", "Kartela", "Artikulli", "Njësia", "Sasia", "Çmimi", "Vlefta", "Monedha", "Magazina"], rows, [{ label: "Rreshta", value: rows.length }, { label: "Vlefta", value: rows.reduce((sum, row) => sum + numberValue(row.Vlefta), 0) }]);
    }
    case "purchase_contract_conversion_alpha": {
      const [orders, receipts] = await Promise.all([getPurchaseOrders(companyId), getPurchaseReceipts(companyId)]);
      const receiptItemGroups = await Promise.all(receipts.map(async receipt => ({ purchaseOrderId: receipt.purchaseOrderId, quantity: (await getPurchaseReceiptItems(receipt.id)).reduce((sum, item) => sum + Number(item.quantity || 0), 0) })));
      const receivedByOrder = new Map<number, number>();
      receiptItemGroups.forEach(group => { if (group.purchaseOrderId) receivedByOrder.set(group.purchaseOrderId, (receivedByOrder.get(group.purchaseOrderId) || 0) + group.quantity); });
      const rows = orders.filter(order => inRange(order.orderDate)).map(order => { const received = receivedByOrder.get(order.id) || 0; return { Porosia: order.docNumber, Data: order.orderDate, Furnitori: order.supplierName || "Pa furnitor", Statusi: order.status, "Sasi porositur": order.orderedQuantity, "Sasi pranuar": received, "Sasi në proces": Math.max(0, Number(order.orderedQuantity || 0) - received), Vlefta: order.totalAmount || 0, __partnerName: order.supplierName || "Pa furnitor", __documentNumber: order.docNumber, __status: order.status, __documentId: order.id, __documentType: "purchase-order" }; });
      return result(["Porosia", "Data", "Furnitori", "Statusi", "Sasi porositur", "Sasi pranuar", "Sasi në proces", "Vlefta"], rows, [{ label: "Porosi", value: rows.length }, { label: "Vlefta", value: rows.reduce((sum, row) => sum + numberValue(row.Vlefta), 0) }]);
    }
    case "purchase_analytic_alpha": {
      const grouped = new Map<string, { code: string; supplier: string; invoices: number; net: number; vat: number; total: number; sourceId: number; sourceDoc: string }>();
      const suppliers = new Map((await getSuppliers(companyId)).map(supplier => [supplier.id, supplier]));
      (await getPurchaseInvoices(companyId)).filter(invoice => inRange(invoice.date)).forEach(invoice => { const supplier = invoice.supplierId ? suppliers.get(invoice.supplierId) : undefined; const key = String(invoice.supplierId ?? invoice.supplierName ?? "Pa furnitor"); const current = grouped.get(key) ?? { code: supplier?.code || "—", supplier: invoice.supplierName || supplier?.name || "Pa furnitor", invoices: 0, net: 0, vat: 0, total: 0, sourceId: invoice.id, sourceDoc: invoice.docNumber }; const amounts = purchaseInvoiceAmounts(invoice); current.invoices += 1; current.net += amounts.net; current.vat += amounts.vat; current.total += amounts.total; grouped.set(key, current); });
      const rows = Array.from(grouped.values()).map(item => ({ Kodi: item.code, Furnitori: item.supplier, Fatura: item.invoices, "Vlera pa TVSH": item.net, TVSH: item.vat, Totali: item.total, __partnerName: item.supplier, __documentId: item.sourceId, __documentNumber: item.sourceDoc, __documentType: "purchase-invoice" }));
      return result(["Kodi", "Furnitori", "Fatura", "Vlera pa TVSH", "TVSH", "Totali"], rows, [{ label: "Furnitorë", value: rows.length }, { label: "Totali", value: rows.reduce((sum, row) => sum + numberValue(row.Totali), 0) }]);
    }
    case "purchase_analytic_detail_alpha": {
      const [receipts, supplierRecords, productRecords, warehouseRecords] = await Promise.all([getPurchaseReceipts(companyId), getSuppliers(companyId), getProducts(companyId), getWarehouses(companyId)]);
      const supplierMap = new Map(supplierRecords.map(supplier => [supplier.id, supplier])); const productMap = new Map(productRecords.map(product => [product.id, product])); const warehouseMap = new Map(warehouseRecords.map(warehouse => [warehouse.id, warehouse.name]));
      const groups = await Promise.all(receipts.filter(receipt => inRange(receipt.receiptDate)).map(async receipt => ({ receipt, items: await getPurchaseReceiptItems(receipt.id) })));
      const rows = groups.flatMap(({ receipt, items }) => items.map(item => ({ Pranimi: receipt.docNumber, Data: receipt.receiptDate, Furnitori: receipt.supplierName || (receipt.supplierId ? supplierMap.get(receipt.supplierId)?.name : "") || "Pa furnitor", Kartela: item.productId ? productMap.get(item.productId)?.code || "—" : "—", Artikulli: item.productName || (item.productId ? productMap.get(item.productId)?.name : "") || "Pa artikull", Njësia: item.unit || (item.productId ? productMap.get(item.productId)?.baseUnit : "") || "", Sasia: item.quantity || 0, Magazina: receipt.warehouseId ? warehouseMap.get(receipt.warehouseId) || `#${receipt.warehouseId}` : "", Statusi: receipt.status, __partnerName: receipt.supplierName || (receipt.supplierId ? supplierMap.get(receipt.supplierId)?.name : "") || "Pa furnitor", __documentNumber: receipt.docNumber, __status: receipt.status, __warehouseName: receipt.warehouseId ? warehouseMap.get(receipt.warehouseId) || `#${receipt.warehouseId}` : "", __documentId: receipt.id, __documentType: "purchase-receipt" })));
      return result(["Pranimi", "Data", "Furnitori", "Kartela", "Artikulli", "Njësia", "Sasia", "Magazina", "Statusi"], rows, [{ label: "Rreshta", value: rows.length }, { label: "Sasi", value: rows.reduce((sum, row) => sum + numberValue(row.Sasia), 0) }]);
    }
    case "purchase_monthly_ledger_alpha": {
      const grouped = new Map<string, { month: string; invoices: number; net: number; vat: number; total: number; sourceId: number; sourceDoc: string }>();
      (await getPurchaseInvoices(companyId)).filter(invoice => inRange(invoice.date)).forEach(invoice => { const month = new Date(invoice.date).toLocaleDateString("sq-AL", { month: "long", year: "numeric" }); const current = grouped.get(month) ?? { month, invoices: 0, net: 0, vat: 0, total: 0, sourceId: invoice.id, sourceDoc: invoice.docNumber }; const amounts = purchaseInvoiceAmounts(invoice); current.invoices += 1; current.net += amounts.net; current.vat += amounts.vat; current.total += amounts.total; grouped.set(month, current); });
      const rows = Array.from(grouped.values()).map(item => ({ Muaji: item.month, Fatura: item.invoices, "Vlera pa TVSH": item.net, TVSH: item.vat, Totali: item.total, __documentId: item.sourceId, __documentNumber: item.sourceDoc, __documentType: "purchase-invoice" }));
      return result(["Muaji", "Fatura", "Vlera pa TVSH", "TVSH", "Totali"], rows, [{ label: "Muaj", value: rows.length }, { label: "Totali", value: rows.reduce((sum, row) => sum + numberValue(row.Totali), 0) }]);
    }
    case "purchase_price_list_alpha": {
      const byProduct = new Map<string, { code: string; product: string; unit: string; price: number; date: Date; supplier: string; sourceId: number; sourceDoc: string }>();
      (await purchaseInvoiceLinesForPeriod()).forEach(({ invoice, item, product, supplier }) => { const key = String(item.productId ?? item.productName ?? "Pa artikull"); const current = byProduct.get(key); const date = new Date(invoice.date); if (!current || date >= current.date) byProduct.set(key, { code: product?.code || product?.barcode || "—", product: product?.name || item.productName || "Pa artikull", unit: item.unit || product?.baseUnit || "", price: Number(item.unitPrice || 0), date, supplier: invoice.supplierName || supplier?.name || "Pa furnitor", sourceId: invoice.id, sourceDoc: invoice.docNumber }); });
      const rows = Array.from(byProduct.values()).map(item => ({ Kartela: item.code, Artikulli: item.product, Njësia: item.unit, "Çmimi i fundit": item.price, "Data e fundit": item.date, Furnitori: item.supplier, __partnerName: item.supplier, __documentId: item.sourceId, __documentNumber: item.sourceDoc, __documentType: "purchase-invoice" }));
      return result(["Kartela", "Artikulli", "Njësia", "Çmimi i fundit", "Data e fundit", "Furnitori"], rows, [{ label: "Artikuj", value: rows.length }]);
    }
    case "purchase_summary_register_pdf": {
      const [invoiceRecords, supplierRecords] = await Promise.all([getPurchaseInvoices(companyId), getSuppliers(companyId)]);
      const suppliersById = new Map(supplierRecords.map(supplier => [supplier.id, supplier]));
      const rows = invoiceRecords.filter(invoice => inRange(invoice.date)).map((invoice, index) => {
        const supplier = invoice.supplierId ? suppliersById.get(invoice.supplierId) : undefined;
        const total = Number(invoice.totalAmount ?? 0);
        const vat = Number(invoice.vatAmount ?? 0);
        const exchangeRate = Number(invoice.exchangeRate || 1);
        const net = total - vat;
        const baseVat = Math.round(vat * exchangeRate);
        const baseTotal = Math.round(total * exchangeRate);
        const supplierName = invoice.supplierName || supplier?.name || "Pa furnitor";
        return {
          "Nr. rend": index + 1,
          Lloji: "FB",
          "Nr.": invoice.docNumber,
          "Dt. Dok": invoice.date,
          Monedha: invoice.currency || "ALL",
          Kursi: exchangeRate,
          Kodi: supplier?.code || "—",
          Emertimi: supplierName,
          Nentotal: net,
          Zbritje: 0,
          TVSH: vat,
          Totali: total,
          "TVSH bazë": baseVat,
          "Totali bazë": baseTotal,
          __partnerName: supplierName,
          __documentNumber: invoice.docNumber,
          __status: invoice.status,
          __currency: invoice.currency || "ALL",
          __warehouseName: invoice.warehouseId ? String(invoice.warehouseId) : "",
          __documentId: invoice.id,
          __documentType: "purchase-invoice",
        };
      });
      return result(["Nr. rend", "Lloji", "Nr.", "Dt. Dok", "Monedha", "Kursi", "Kodi", "Emertimi", "Nentotal", "Zbritje", "TVSH", "Totali", "TVSH bazë", "Totali bazë"], rows, [
        { label: "Fatura", value: rows.length },
        { label: "Nëntotal", value: rows.reduce((sum, row) => sum + numberValue(row.Nentotal), 0) },
        { label: "TVSH", value: rows.reduce((sum, row) => sum + numberValue(row.TVSH), 0) },
        { label: "Totali", value: rows.reduce((sum, row) => sum + numberValue(row.Totali), 0) },
      ], { Nenkategori: "FB", Ndermarrja: "Kompania aktive", "Dt. Dok.": "Sipas filtrit", "Dt. Regj.": "Sipas filtrit" });
    }
    case "purchase_supplier_situation_pdf": {
      const [invoices, supplierRecords, paymentRecords] = await Promise.all([getPurchaseInvoices(companyId), getSuppliers(companyId), getPayments(companyId)]);
      const suppliersById = new Map(supplierRecords.map(supplier => [supplier.id, supplier]));
      const paymentTotals = buildReportInvoicePaymentTotals(invoices, paymentRecords, "OUTBOUND", "SUPPLIER");
      const grouped = new Map<number | string, { supplierId: number | null; code: string; name: string; account: string; category: string; debit: number; credit: number; balance: number; sourceDocumentId: number | null; sourceDocumentNumber: string; sourceStatus: string | null; sourceCurrency: string }>();
      invoices.filter(invoice => inRange(invoice.date)).forEach(invoice => {
        const supplier = invoice.supplierId ? suppliersById.get(invoice.supplierId) : undefined;
        const key = invoice.supplierId ?? invoice.supplierName ?? "Pa furnitor";
        let profile: Record<string, unknown> = {};
        if (supplier?.profileData) {
          try { profile = JSON.parse(supplier.profileData) as Record<string, unknown>; } catch { profile = {}; }
        }
        const current = grouped.get(key) ?? { supplierId: invoice.supplierId ?? null, code: supplier?.code || "", name: invoice.supplierName || supplier?.name || "Pa furnitor", account: typeof profile.accountNumber === "string" ? profile.accountNumber : "", category: typeof profile.category === "string" ? profile.category : typeof profile.supplierCategory === "string" ? profile.supplierCategory : "", debit: 0, credit: 0, balance: 0, sourceDocumentId: invoice.id, sourceDocumentNumber: invoice.docNumber, sourceStatus: invoice.status, sourceCurrency: invoice.currency || "ALL" };
        const payment = resolveReportInvoicePayment(invoice, paymentTotals);
        current.debit += payment.billed;
        current.credit += payment.paid;
        current.balance += payment.remaining;
        grouped.set(key, current);
      });
      const totalBalance = Array.from(grouped.values()).reduce((sum, item) => sum + Math.max(0, item.balance), 0);
      const rows = Array.from(grouped.values()).map((item, index) => ({ "Nr Rend": index + 1, Kodi: item.code, "Emertimi i Furnitorit": item.name, "Nr Llogarie": item.account, Kategoria: item.category, "Shuma Debi": item.debit, "Shuma Kredi": item.credit, Detyrimi: item.balance, "Pesha %": totalBalance > 0 ? Number(((Math.max(0, item.balance) / totalBalance) * 100).toFixed(2)) : 0, __partnerName: item.name, __documentNumber: item.sourceDocumentNumber, __status: item.sourceStatus, __currency: item.sourceCurrency, __documentId: item.sourceDocumentId, __documentType: "purchase-invoice" }));
      return result(["Nr Rend", "Kodi", "Emertimi i Furnitorit", "Nr Llogarie", "Kategoria", "Shuma Debi", "Shuma Kredi", "Detyrimi", "Pesha %"], rows, [{ label: "Furnitorë", value: rows.length }, { label: "Detyrimi", value: rows.reduce((sum, row) => sum + numberValue(row.Detyrimi), 0) }], { Periudha: "Sipas filtrit" });
    }
    case "purchase_supplier_situation_category_pdf": {
      const [invoices, supplierRecords, paymentRecords] = await Promise.all([getPurchaseInvoices(companyId), getSuppliers(companyId), getPayments(companyId)]);
      const suppliersById = new Map(supplierRecords.map(supplier => [supplier.id, supplier]));
      const paymentTotals = buildReportInvoicePaymentTotals(invoices, paymentRecords, "OUTBOUND", "SUPPLIER");
      const grouped = new Map<string, { supplierId: number | null; name: string; city: string; currency: string; count: number; debit: number; credit: number; debitBase: number; creditBase: number; sourceDocumentId: number | null; sourceDocumentNumber: string; sourceStatus: string | null; sourceCurrency: string }>();
      invoices.filter(invoice => inRange(invoice.date)).forEach(invoice => {
        const supplier = invoice.supplierId ? suppliersById.get(invoice.supplierId) : undefined;
        const currency = invoice.currency || "ALL";
        const key = `${String(invoice.supplierId ?? invoice.supplierName ?? "Pa furnitor")}|${currency}`;
        const current = grouped.get(key) ?? { supplierId: invoice.supplierId ?? null, name: invoice.supplierName || supplier?.name || "Pa furnitor", city: supplier?.city || "—", currency, count: 0, debit: 0, credit: 0, debitBase: 0, creditBase: 0, sourceDocumentId: invoice.id, sourceDocumentNumber: invoice.docNumber, sourceStatus: invoice.status, sourceCurrency: currency };
        const payment = resolveReportInvoicePayment(invoice, paymentTotals);
        current.count += 1;
        current.debit += payment.billed;
        current.debitBase += payment.billedBase;
        current.credit += payment.paid;
        current.creditBase += payment.paidBase;
        grouped.set(key, current);
      });
      const rows = Array.from(grouped.values()).map(item => ({ Kodi: item.supplierId ? suppliersById.get(item.supplierId)?.code || "—" : "—", Emërtimi: item.name, Mon: item.currency, Qyteti: item.city, Debi: item.debit, Kredi: item.credit, Detyrimi: item.debit - item.credit, "Debi bazë": item.debitBase, "Kredi bazë": item.creditBase, "Detyrimi bazë": item.debitBase - item.creditBase, __partnerName: item.name, __documentNumber: item.sourceDocumentNumber, __status: item.sourceStatus, __currency: item.sourceCurrency, __documentId: item.sourceDocumentId, __documentType: "purchase-invoice" }));
      return result(["Kodi", "Emërtimi", "Mon", "Qyteti", "Debi", "Kredi", "Detyrimi", "Debi bazë", "Kredi bazë", "Detyrimi bazë"], rows, [{ label: "Furnitorë", value: rows.length }, { label: "Detyrim", value: rows.reduce((sum, row) => sum + numberValue(row.Detyrimi), 0) }], { Kategoria: "Të gjitha", "Monedha e furnitorit": Array.from(new Set(rows.map(row => String(row.Mon || "ALL")))).join(", ") || "ALL", "Monedha bazë": "ALL" });
    }
    case "purchase_customs_import_register_pdf": {
      const invoices = (await getPurchaseInvoices(companyId)).filter(invoice => inRange(invoice.date));
      const rows = invoices.map(invoice => ({ ...mapPurchaseCustomsFields(invoice), __partnerName: invoice.supplierName || "Pa furnitor", __documentNumber: invoice.docNumber, __status: invoice.status, __currency: invoice.currency || "ALL", __warehouseName: invoice.warehouseId ? String(invoice.warehouseId) : "", __documentId: invoice.id, __documentType: "purchase-invoice" }));
      return result(["Ref.", "Nr.Fl.Dog.", "Dt Fl.Dog.", "Vl.Fatures", "Monedha", "Kursi", "Vlefta", "Transport", "Siguracion", "Refer./Tjera", "Vl.Dogane", "Dog", "Akciz", "Vl pa TVSH", "TVSH"], rows, [{ label: "Fatura", value: rows.length }, { label: "Vlefta", value: rows.reduce((sum, row) => sum + numberValue(row.Vlefta), 0) }], { "Import / Eksport": "Import", Monedha: "ALL" });
    }
    case "purchase_supplier_card_pdf": {
      const [invoiceRecords, supplierRecords, paymentRecords] = await Promise.all([getPurchaseInvoices(companyId), getSuppliers(companyId), getPayments(companyId)]);
      const suppliersById = new Map(supplierRecords.map(supplier => [supplier.id, supplier]));
      const invoices = invoiceRecords.filter(invoice => inRange(invoice.date));
      const supplierPayments = paymentRecords.filter(payment => payment.paymentType === "OUTBOUND" && payment.partnerType === "SUPPLIER" && payment.status !== "CANCELLED" && inRange(payment.paymentDate));
      const invoiceByNumber = new Map(invoices.map(invoice => [normalizeDocumentNumber(invoice.docNumber), invoice]));
      const events = [
        ...invoices.map(invoice => ({ date: new Date(invoice.createdAt ?? invoice.date), kind: "invoice" as const, invoice })),
        ...supplierPayments.map(payment => ({ date: new Date(payment.paymentDate), kind: "payment" as const, payment })),
      ].sort((a, b) => a.date.getTime() - b.date.getTime());
      let progressive = 0;
      const rows = events.map((event, index) => {
        if (event.kind === "invoice") {
          const invoice = event.invoice;
          const amount = getReportInvoiceAmount(invoice);
          const supplierName = invoice.supplierName || (invoice.supplierId ? suppliersById.get(invoice.supplierId)?.name : undefined) || "Pa furnitor";
          progressive += amount;
          return { "Nr Rend": index + 1, "Data Rregj": invoice.createdAt ?? invoice.date, "Lloj Dok": "FB", "Nr Dok": invoice.docNumber, "Data Dok": invoice.date, "Përshkrimi i Veprimit": "Faturë blerjeje", Debi: amount, Kredi: 0, Progresivi: progressive, "Debi llogari": amount, "Kredi llogari": 0, "Progresivi llogari": progressive, __partnerName: supplierName, __documentNumber: invoice.docNumber, __status: invoice.status, __currency: invoice.currency || "ALL", __warehouseName: invoice.warehouseId ? String(invoice.warehouseId) : "", __documentId: invoice.id, __documentType: "purchase-invoice" };
        }
        const payment = event.payment;
        const linkedInvoice = payment.reference ? invoiceByNumber.get(normalizeDocumentNumber(payment.reference)) : undefined;
        const supplierName = payment.partnerName || (payment.partnerId ? suppliersById.get(payment.partnerId)?.name : undefined) || linkedInvoice?.supplierName || "Pa furnitor";
        const amount = Number(payment.amount || 0) * Number(payment.exchangeRate || 1);
        progressive -= amount;
        return { "Nr Rend": index + 1, "Data Rregj": payment.createdAt ?? payment.paymentDate, "Lloj Dok": "PAG", "Nr Dok": payment.paymentNumber, "Data Dok": payment.paymentDate, "Përshkrimi i Veprimit": "Pagesë furnitori", Debi: 0, Kredi: amount, Progresivi: progressive, "Debi llogari": 0, "Kredi llogari": amount, "Progresivi llogari": progressive, __partnerName: supplierName, __documentNumber: payment.paymentNumber, __status: payment.status, __currency: payment.currency || "ALL", __documentId: payment.id, __documentType: "accounting-payment", __reference: payment.reference || "" };
      });
      return result(["Nr Rend", "Data Rregj", "Lloj Dok", "Nr Dok", "Data Dok", "Përshkrimi i Veprimit", "Debi", "Kredi", "Progresivi", "Debi llogari", "Kredi llogari", "Progresivi llogari"], rows, [{ label: "Dokumente", value: rows.length }, { label: "Detyrim", value: progressive }], { Furnitori: Array.from(new Set(rows.map(row => String(row.__partnerName || "")).filter(Boolean))).join(", ") || "Të gjithë", "Nr Llogarie": "—", Mon: "ALL", Titulli: "Kartelë furnitori", NIPTI: "—" });
    }
    case "purchase_supplier_card_format3_pdf": {
      const [invoiceRecords, supplierRecords, paymentRecords] = await Promise.all([getPurchaseInvoices(companyId), getSuppliers(companyId), getPayments(companyId)]);
      const suppliersById = new Map(supplierRecords.map(supplier => [supplier.id, supplier]));
      const invoices = invoiceRecords.filter(invoice => inRange(invoice.date));
      const supplierPayments = paymentRecords.filter(payment => payment.paymentType === "OUTBOUND" && payment.partnerType === "SUPPLIER" && payment.status !== "CANCELLED" && inRange(payment.paymentDate));
      const invoiceByNumber = new Map(invoices.map(invoice => [normalizeDocumentNumber(invoice.docNumber), invoice]));
      const events = [
        ...invoices.map(invoice => ({ date: new Date(invoice.createdAt ?? invoice.date), kind: "invoice" as const, invoice })),
        ...supplierPayments.map(payment => ({ date: new Date(payment.paymentDate), kind: "payment" as const, payment })),
      ].sort((a, b) => a.date.getTime() - b.date.getTime());
      let progressive = 0;
      const rows = events.map((event, index) => {
        if (event.kind === "invoice") {
          const invoice = event.invoice;
          const amount = getReportInvoiceAmount(invoice);
          const supplierName = invoice.supplierName || (invoice.supplierId ? suppliersById.get(invoice.supplierId)?.name : undefined) || "Pa furnitor";
          progressive += amount;
          return { "Nr Rend": index + 1, "Data Rregj": invoice.createdAt ?? invoice.date, "Lloj Dok": "FB", "Nr Dok": invoice.docNumber, "Data Dok": invoice.date, "Përshkrimi i Veprimit": "Faturë blerjeje", Debi: amount, Kredi: 0, Progresivi: progressive, __partnerName: supplierName, __documentNumber: invoice.docNumber, __status: invoice.status, __currency: invoice.currency || "ALL", __warehouseName: invoice.warehouseId ? String(invoice.warehouseId) : "", __documentId: invoice.id, __documentType: "purchase-invoice" };
        }
        const payment = event.payment;
        const linkedInvoice = payment.reference ? invoiceByNumber.get(normalizeDocumentNumber(payment.reference)) : undefined;
        const supplierName = payment.partnerName || (payment.partnerId ? suppliersById.get(payment.partnerId)?.name : undefined) || linkedInvoice?.supplierName || "Pa furnitor";
        const amount = Number(payment.amount || 0) * Number(payment.exchangeRate || 1);
        progressive -= amount;
        return { "Nr Rend": index + 1, "Data Rregj": payment.createdAt ?? payment.paymentDate, "Lloj Dok": "PAG", "Nr Dok": payment.paymentNumber, "Data Dok": payment.paymentDate, "Përshkrimi i Veprimit": "Pagesë furnitori", Debi: 0, Kredi: amount, Progresivi: progressive, __partnerName: supplierName, __documentNumber: payment.paymentNumber, __status: payment.status, __currency: payment.currency || "ALL", __documentId: payment.id, __documentType: "accounting-payment", __reference: payment.reference || "" };
      });
      return result(["Nr Rend", "Data Rregj", "Lloj Dok", "Nr Dok", "Data Dok", "Përshkrimi i Veprimit", "Debi", "Kredi", "Progresivi"], rows, [{ label: "Dokumente", value: rows.length }, { label: "Detyrim", value: progressive }], { Furnitori: Array.from(new Set(rows.map(row => String(row.__partnerName || "")).filter(Boolean))).join(", ") || "Të gjithë", "Nr Llogarie": "—", Mon: "ALL", Titulli: "Kartelë furnitori", NIPTI: "—" });
    }
    case "purchase_supplier_maturity_summary_pdf": {
      const [invoices, supplierRecords, paymentRecords] = await Promise.all([getPurchaseInvoices(companyId), getSuppliers(companyId), getPayments(companyId)]);
      const supplierMap = new Map(supplierRecords.map(supplier => [supplier.id, supplier]));
      const paymentTotals = buildReportInvoicePaymentTotals(invoices, paymentRecords, "OUTBOUND", "SUPPLIER");
      const grouped = new Map<number | string, { code: string; name: string; account: string; currency: string; total: number; buckets: Record<string, number>; sourceDocumentId: number | null }>();
      invoices.filter(invoice => inRange(invoice.date) && resolveReportInvoicePayment(invoice, paymentTotals).remaining > 0).forEach(invoice => {
        const supplier = invoice.supplierId ? supplierMap.get(invoice.supplierId) : undefined;
        const key = invoice.supplierId ?? invoice.supplierName ?? "Pa furnitor";
        const current = grouped.get(key) ?? { code: supplier?.code || "", name: invoice.supplierName || supplier?.name || "Pa furnitor", account: "", currency: invoice.currency || "ALL", total: 0, buckets: { "0": 0, "1-30": 0, "30-60": 0, "60-90": 0, "90-180": 0, "Mbi 180": 0 }, sourceDocumentId: invoice.id };
        const amount = resolveReportInvoicePayment(invoice, paymentTotals).remaining;
        const due = invoice.dueDate ? new Date(invoice.dueDate) : null;
        const days = due ? Math.max(0, Math.floor((Date.now() - due.getTime()) / 86_400_000)) : 0;
        const bucket = getSupplierMaturityBucket(days);
        current.total += amount; current.buckets[bucket] += amount; grouped.set(key, current);
      });
      const rows = Array.from(grouped.values()).map(item => ({ "Kod Klienti": item.code, Emri: item.name, Llogaria: item.account, "Mon Lig": item.currency, Total: item.total, "0": item.buckets["0"], "1-30": item.buckets["1-30"], "30-60": item.buckets["30-60"], "60-90": item.buckets["60-90"], "90-180": item.buckets["90-180"], "Mbi 180": item.buckets["Mbi 180"], __documentId: item.sourceDocumentId, __documentType: "purchase-invoice" }));
      return result(["Kod Klienti", "Emri", "Llogaria", "Mon Lig", "Total", "0", "1-30", "30-60", "60-90", "90-180", "Mbi 180"], rows, [{ label: "Furnitorë", value: rows.length }, { label: "Totali", value: rows.reduce((sum, row) => sum + numberValue(row.Total), 0) }], { "Data Raportimi": new Date().toLocaleDateString("sq-AL"), "Periudha e Maturimit": "Të gjitha afatet", "Data e Maturimit": "Sipas dokumentit" });
    }
    case "purchase_supplier_maturity_pdf": {
      const [invoiceRecords, paymentRecords] = await Promise.all([getPurchaseInvoices(companyId), getPayments(companyId)]);
      const paymentTotals = buildReportInvoicePaymentTotals(invoiceRecords, paymentRecords, "OUTBOUND", "SUPPLIER");
      const invoices = invoiceRecords.filter(invoice => inRange(invoice.date) && resolveReportInvoicePayment(invoice, paymentTotals).remaining > 0);
      const rows = invoices.map(invoice => {
        const amount = resolveReportInvoicePayment(invoice, paymentTotals).remaining;
        const due = invoice.dueDate ? new Date(invoice.dueDate) : null;
        const days = due ? Math.max(0, Math.floor((Date.now() - due.getTime()) / 86_400_000)) : 0;
        const bucket = getSupplierMaturityBucket(days);
        return { "Dt. Dok": invoice.date, "Nr Dok": invoice.docNumber, "Lloj Dok": "FB", "Date Maturimi": due, "Dite Maturimi": days, Tejkaluar: days > 0 ? amount : 0, "0": bucket === "0" ? amount : 0, "1-30": bucket === "1-30" ? amount : 0, "30-60": bucket === "30-60" ? amount : 0, "60-90": bucket === "60-90" ? amount : 0, "90-180": bucket === "90-180" ? amount : 0, ">": bucket === "Mbi 180" ? amount : 0, Totali: amount, __partnerName: invoice.supplierName || "Pa furnitor", __documentNumber: invoice.docNumber, __status: invoice.status, __currency: invoice.currency || "ALL", __documentId: invoice.id, __documentType: "purchase-invoice" };
      });
      return result(["Dt. Dok", "Nr Dok", "Lloj Dok", "Date Maturimi", "Dite Maturimi", "Tejkaluar", "0", "1-30", "30-60", "60-90", "90-180", ">", "Totali"], rows, [{ label: "Fatura", value: rows.length }, { label: "Totali", value: rows.reduce((sum, row) => sum + numberValue(row.Totali), 0) }], { "Data e raportimit": new Date().toLocaleDateString("sq-AL"), "Periudha e maturimit": "Të gjitha afatet", "Data e maturimit": "Sipas dokumentit" });
    }
    case "purchase_invoice_payment_register_pdf": {
      const [invoices, companyPayments] = await Promise.all([getPurchaseInvoices(companyId), getPayments(companyId)]);
      const filteredInvoices = invoices.filter(invoice => inRange(invoice.date));
      const invoiceNumbers = new Set(filteredInvoices.map(invoice => normalizeDocumentNumber(invoice.docNumber)));
      const supplierPayments = companyPayments.filter(payment => payment.paymentType === "OUTBOUND" && payment.partnerType === "SUPPLIER" && payment.status !== "CANCELLED" && inRange(payment.paymentDate));
      const paymentByReference = new Map<string, number>();
      supplierPayments.forEach(payment => {
        const reference = normalizeDocumentNumber(payment.reference || "");
        const amountInBase = normalizePurchasePaymentAmount(payment.amount, Number(payment.exchangeRate || 1));
        if (reference) paymentByReference.set(reference, (paymentByReference.get(reference) || 0) + amountInBase);
      });
      const rows = [
        ...filteredInvoices.map(invoice => {
          const billed = normalizePurchasePaymentAmount(getReportInvoiceAmount(invoice), Number(invoice.exchangeRate || 1));
          const paid = paymentByReference.get(normalizeDocumentNumber(invoice.docNumber)) || (invoice.paymentStatus === "PAID" ? billed : 0);
          return { Fature: "✓", Pagese: "", Numer: invoice.docNumber, Date: invoice.date, Pershkrimi: invoice.supplierName || "Faturë blerjeje", Faturuar: billed, Paguar: paid, Diferenca: billed - paid, __partnerName: invoice.supplierName || "Pa furnitor", __documentNumber: invoice.docNumber, __status: invoice.status, __currency: invoice.currency || "ALL", __warehouseName: invoice.warehouseId ? String(invoice.warehouseId) : "", __documentId: invoice.id, __documentType: "purchase-invoice" };
        }),
        ...supplierPayments.filter(payment => !payment.reference || !invoiceNumbers.has(normalizeDocumentNumber(payment.reference))).map(payment => { const amountInBase = normalizePurchasePaymentAmount(payment.amount, Number(payment.exchangeRate || 1)); return { Fature: "", Pagese: "✓", Numer: payment.paymentNumber, Date: payment.paymentDate, Pershkrimi: payment.partnerName || "Pagesë furnitori", Faturuar: 0, Paguar: amountInBase, Diferenca: -amountInBase, __partnerName: payment.partnerName || "Pa furnitor", __documentNumber: payment.paymentNumber, __status: payment.status, __currency: "ALL", __documentId: payment.id, __documentType: "accounting-payment" }; })
      ];
      return result(["Fature", "Pagese", "Numer", "Date", "Pershkrimi", "Faturuar", "Paguar", "Diferenca"], rows, [{ label: "Faturuar", value: rows.reduce((sum, row) => sum + numberValue(row.Faturuar), 0) }, { label: "Paguar", value: rows.reduce((sum, row) => sum + numberValue(row.Paguar), 0) }, { label: "Diferenca", value: rows.reduce((sum, row) => sum + numberValue(row.Diferenca), 0) }], { Furnitori: Array.from(new Set(rows.map(row => String(row.__partnerName || "")).filter(Boolean))).join(", ") || "Të gjithë", Monedha: "ALL" });
    }
    case "purchase_invoices": {
      const [invoices, paymentRecords] = await Promise.all([getPurchaseInvoices(companyId), getPayments(companyId)]);
      return paymentAwareInvoiceRows(invoices, "supplierName", paymentRecords, "OUTBOUND", "SUPPLIER", "purchase-invoice");
    }
    case "purchase_orders": return documentRows(await getPurchaseOrders(companyId), "orderDate", "supplierName", "totalAmount", "purchase-order");
    case "purchase_receipts": return documentRows(await getPurchaseReceipts(companyId), "receiptDate", "supplierName", undefined, "purchase-receipt");
    case "purchase_returns": return documentRows(await getPurchaseReturns(companyId), "returnDate", "supplierName", undefined, "purchase-return");
    case "purchase_suppliers": {
      const invoices = (await getPurchaseInvoices(companyId)).filter(item => inRange(item.date));
      const totals = new Map<string, { count: number; amount: number }>();
      invoices.forEach(item => { const key = item.supplierName || "Pa furnitor"; const value = totals.get(key) ?? { count: 0, amount: 0 }; value.count += 1; value.amount += item.totalAmount ?? 0; totals.set(key, value); });
      return result(["Furnitori", "Fatura", "Vlera"], Array.from(totals.entries()).map(([Furnitori, value]) => ({ Furnitori, Fatura: value.count, Vlera: value.amount })), [{ label: "Furnitorë", value: totals.size }, { label: "Shpenzim", value: invoices.reduce((sum, item) => sum + (item.totalAmount ?? 0), 0) }]);
    }
    case "sales_by_city_pdf": {
      const [invoices, customerRecords] = await Promise.all([getSalesInvoices(companyId), getCustomers(companyId)]);
      const customerCities = new Map(customerRecords.map(customer => [customer.id, customer.city || "Pa qytet"]));
      const grouped = new Map<string, { customers: Set<string>; invoices: number; amount: number; sourceDocumentId: number | null }>();
      invoices.filter(invoice => inRange(invoice.date)).forEach(invoice => { const city = invoice.customerId ? customerCities.get(invoice.customerId) || "Pa qytet" : "Pa qytet"; const value = grouped.get(city) ?? { customers: new Set<string>(), invoices: 0, amount: 0, sourceDocumentId: invoice.id }; if (invoice.customerName) value.customers.add(invoice.customerName); value.invoices += 1; value.amount += invoice.totalAmount ?? 0; grouped.set(city, value); });
      const rows = Array.from(grouped, ([Qyteti, value]) => ({ Qyteti, Klientë: value.customers.size, Fatura: value.invoices, Vlera: value.amount, __documentId: value.sourceDocumentId, __documentType: "sales-invoice" }));
      return result(["Qyteti", "Klientë", "Fatura", "Vlera"], rows, [{ label: "Qytete", value: rows.length }, { label: "Fatura", value: rows.reduce((sum, row) => sum + numberValue(row.Fatura), 0) }, { label: "Vlera", value: rows.reduce((sum, row) => sum + numberValue(row.Vlera), 0) }]);
    }
    case "sales_by_customer_pdf": {
      const [invoices, customerRecords] = await Promise.all([getSalesInvoices(companyId), getCustomers(companyId)]);
      const customerMap = new Map(customerRecords.map(customer => [customer.id, customer]));
      const grouped = new Map<string, { code: string; name: string; city: string; count: number; amount: number; sourceDocumentId: number | null }>();
      invoices.filter(invoice => inRange(invoice.date)).forEach(invoice => {
        const customer = invoice.customerId ? customerMap.get(invoice.customerId) : undefined;
        const key = String(invoice.customerId ?? invoice.customerName ?? "Pa klient");
        const current = grouped.get(key) ?? { code: customer?.code || (customer?.id != null ? `K${String(customer.id).padStart(3, "0")}` : "—"), name: invoice.customerName || customer?.name || "Pa klient", city: customer?.city || "—", count: 0, amount: 0, sourceDocumentId: invoice.id };
        current.count += 1;
        current.amount += invoice.totalAmount ?? 0;
        grouped.set(key, current);
      });
      const rows = Array.from(grouped.values()).map(item => ({ Kodi: item.code, Emërtimi: item.name, Qyteti: item.city, Fatura: item.count, Vlefta: item.amount, __documentId: item.sourceDocumentId, __documentType: "sales-invoice" }));
      return result(["Kodi", "Emërtimi", "Qyteti", "Fatura", "Vlefta"], rows, [{ label: "Klientë", value: rows.length }, { label: "Vlefta", value: rows.reduce((sum, row) => sum + numberValue(row.Vlefta), 0) }]);
    }
    case "sales_quantity_pdf": {
      const [pairs, products, categories, customers] = await Promise.all([salesItemsForPeriod(), getProducts(companyId), getCategories(companyId), getCustomers(companyId)]);
      const productMap = new Map(products.map(product => [product.id, product]));
      const categoryMap = new Map(categories.map(category => [category.id, category.name]));
      const customerMap = new Map(customers.map(customer => [customer.id, customer]));
      const totals = new Map<string, { name: string; customerCode: string; customerName: string; group: string; subgroup: string; months: number[]; total: number }>();
      pairs.forEach(({ invoice, item }) => {
        const product = item.productId ? productMap.get(item.productId) : undefined;
        const customer = invoice.customerId ? customerMap.get(invoice.customerId) : undefined;
        const key = `${invoice.customerId ?? invoice.customerName ?? "Pa klient"}|${item.productId ?? item.productName ?? "Pa artikull"}`;
        const current = totals.get(key) ?? { name: product?.name || item.productName || "Pa artikull", customerCode: customer?.code || (customer?.id != null ? `K${String(customer.id).padStart(3, "0")}` : "—"), customerName: invoice.customerName || customer?.name || "Pa klient", group: product?.categoryId ? categoryMap.get(product.categoryId) || "Pa Grup" : "Pa Grup", subgroup: "Pa Nengrup", months: Array(12).fill(0), total: 0 };
        const quantity = Number(item.quantity || 0);
        const month = new Date(invoice.date).getMonth();
        current.months[month] += quantity;
        current.total += quantity;
        totals.set(key, current);
      });
      const rows = Array.from(totals.values()).map(value => ({ Artikulli: value.name, ...Object.fromEntries(monthNames.map((month, index) => [month, value.months[index]])), __customerCode: value.customerCode, __customerName: value.customerName, __group: value.group, __subgroup: value.subgroup }));
      return result(["Artikulli", ...monthNames], rows, [{ label: "Artikuj", value: rows.length }, { label: "Sasi totale", value: Array.from(totals.values()).reduce((sum, item) => sum + item.total, 0) }], { Grupi: Array.from(new Set(rows.map(row => String(row.__group)))).join(", ") || "Të gjitha", Nengrupi: Array.from(new Set(rows.map(row => String(row.__subgroup)))).join(", ") || "Të gjitha", Klienti: Array.from(new Set(rows.map(row => `${row.__customerCode} ${row.__customerName}`))).join(", ") || "Të gjithë" });
    }
    case "sales_discount_analysis_pdf": {
      const [pairs, products, categories] = await Promise.all([salesItemsForPeriod(), getProducts(companyId), getCategories(companyId)]);
      const productMap = new Map(products.map(product => [product.id, product]));
      const categoryMap = new Map(categories.map(category => [category.id, category.name]));
      const totals = new Map<string, { code: string; name: string; unit: string; quantity: number; value: number; vatValue: number; category: string; sourceDocumentId: number | null }>();
      pairs.forEach(({ invoice, item }) => {
        const product = item.productId ? productMap.get(item.productId) : undefined;
        const key = String(item.productId ?? item.productName ?? "Pa artikull");
        const current = totals.get(key) ?? { code: product?.code || product?.barcode || "", name: product?.name || item.productName || "Pa artikull", unit: product?.baseUnit || item.unit || "", quantity: 0, value: 0, vatValue: 0, category: product?.categoryId ? categoryMap.get(product.categoryId) || "" : "", sourceDocumentId: invoice.id };
        const amounts = salesLineAmounts(invoice, item);
        current.quantity += Number(item.quantity || 0);
        current.value += amounts.net;
        current.vatValue += amounts.gross;
        totals.set(key, current);
      });
      const rows = Array.from(totals.values()).map(item => ({ Kartela: item.code, Emërtimi: item.name, Njësia: item.unit, Sasia: item.quantity, Çmimi: item.quantity ? item.value / item.quantity : 0, "Vlefta pa TVSH": item.value, "Vlefta me TVSH": item.vatValue, "Në %": "", "Vlefta pa TVSH me Zbritje": "", "Vlefta me TVSH me Zbritje": "", "Në % Analitike": "", __Grupi: item.category, __documentId: item.sourceDocumentId, __documentType: "sales-invoice" }));
      return result(["Kartela", "Emërtimi", "Njësia", "Sasia", "Çmimi", "Vlefta pa TVSH", "Vlefta me TVSH", "Në %", "Vlefta pa TVSH me Zbritje", "Vlefta me TVSH me Zbritje", "Në % Analitike"], rows, [{ label: "Artikuj", value: rows.length }, { label: "Vlefta", value: rows.reduce((sum, row) => sum + numberValue(row["Vlefta me TVSH"]), 0) }]);
    }
    case "sales_product_card_pdf": {
      const [pairs, products, categories, customers] = await Promise.all([salesItemsForPeriod(), getProducts(companyId), getCategories(companyId), getCustomers(companyId)]);
      const productMap = new Map(products.map(product => [product.id, product]));
      const categoryMap = new Map(categories.map(category => [category.id, category.name]));
      const customerMap = new Map(customers.map(customer => [customer.id, customer]));
      const progressive = new Map<number | string, number>();
      const rows = pairs.map(({ invoice, item }) => {
        const product = item.productId ? productMap.get(item.productId) : undefined;
        const key = item.productId ?? item.productName ?? "Pa artikull";
        const quantity = Number(item.quantity || 0);
        const next = (progressive.get(key) || 0) + quantity;
        const amounts = salesLineAmounts(invoice, item);
        const customer = invoice.customerId ? customerMap.get(invoice.customerId) : undefined;
        progressive.set(key, next);
        return { "Nr Kartele": product?.code || product?.barcode || "", Kodbar: product?.barcode || "", "Grup Malli": product?.categoryId ? categoryMap.get(product.categoryId) || "" : "", "Nën Grupi": "", Klienti: invoice.customerName || customer?.name || "", "Nr. Dok": invoice.docNumber, "Dt. Dok": invoice.date, "Lloj Dok": "FS", Njësia: item.unit || product?.baseUnit || "", Sasia: quantity, Çmimi: item.unitPrice || 0, "Vlera Pa TVSH": amounts.net, "Vlera Me TVSH": amounts.gross, "Progresiv Sasi": next, __documentId: invoice.id, __documentType: "sales-invoice" };
      });
      return result(["Nr Kartele", "Kodbar", "Grup Malli", "Nën Grupi", "Klienti", "Nr. Dok", "Dt. Dok", "Lloj Dok", "Njësia", "Sasia", "Çmimi", "Vlera Pa TVSH", "Vlera Me TVSH", "Progresiv Sasi"], rows, [{ label: "Rreshta", value: rows.length }, { label: "Sasi", value: rows.reduce((sum, row) => sum + numberValue(row.Sasia), 0) }]);
    }
    case "sales_returns_pdf": {
      const returns = (await getSalesReturns(companyId)).filter(item => inRange(item.returnDate));
      const rows = (await Promise.all(returns.map(async returnDocument => {
        const items = await getSalesReturnItems(returnDocument.id);
        return items.map(item => ({ "Nr.Dok": returnDocument.docNumber, "Dt.Dok": returnDocument.returnDate, "Numer FS.Ref": "", "Date FS.Ref": "", Artikulli: item.productName, "Sasi Fature": "", "Sasi e Kthyer": item.quantity, "Çmimi": "", "Zbritje %": "", "Vlefta e Kthyer me TVSH": "", Monedha: "", Kursi: "", "Vlefta e kthyer me TVSH ne MB": "", __documentId: returnDocument.id, __documentType: "sales-return" }));
      }))).flat();
      return result(["Nr.Dok", "Dt.Dok", "Numer FS.Ref", "Date FS.Ref", "Artikulli", "Sasi Fature", "Sasi e Kthyer", "Çmimi", "Zbritje %", "Vlefta e Kthyer me TVSH", "Monedha", "Kursi", "Vlefta e kthyer me TVSH ne MB"], rows, [{ label: "Kthime", value: rows.length }, { label: "Sasi e kthyer", value: rows.reduce((sum, row) => sum + numberValue(row["Sasi e Kthyer"]), 0) }]);
    }
    case "sales_margin_pdf": {
      const [pairs, products] = await Promise.all([salesItemsForPeriod(), getProducts(companyId)]);
      const productMap = new Map(products.map(product => [product.id, product]));
      const totals = new Map<string, { code: string; name: string; unit: string; quantity: number; sales: number; cost: number; sourceDocumentId: number | null }>();
      pairs.forEach(({ invoice, item }) => {
        const product = item.productId ? productMap.get(item.productId) : undefined;
        const key = String(item.productId ?? item.productName ?? "Pa artikull");
        const current = totals.get(key) ?? { code: product?.code || product?.barcode || "", name: product?.name || item.productName || "Pa artikull", unit: product?.baseUnit || item.unit || "", quantity: 0, sales: 0, cost: 0, sourceDocumentId: invoice.id };
        const quantity = Number(item.quantity || 0);
        const amounts = salesLineAmounts(invoice, item);
        const sales = amounts.baseGross;
        current.quantity += quantity;
        current.sales += sales;
        current.cost += (product?.avgPrice ?? 0) * quantity * amounts.rate;
        totals.set(key, current);
      });
      const rows = Array.from(totals.values()).map(item => { const margin = item.sales - item.cost; const marginPct = item.sales ? (margin / item.sales) * 100 : 0; return { Kartela: item.code, "Emërtimi i Artikullit": item.name, Njësia: item.unit, "Sasia e Shitur": item.quantity, "Kosto/Njesi": item.quantity ? item.cost / item.quantity : 0, KMSH: item.cost, "Çmimi i shitjes": item.quantity ? item.sales / item.quantity : 0, "Vlera Shitjes": item.sales, "Marzhi Bruto me Zbritje": "", "Marzhi Bruto % me Zbritje": "", "Marzhi Bruto": margin, "Marzhi Bruto %": marginPct, __documentId: item.sourceDocumentId, __documentType: "sales-invoice" }; });
      return result(["Kartela", "Emërtimi i Artikullit", "Njësia", "Sasia e Shitur", "Kosto/Njesi", "KMSH", "Çmimi i shitjes", "Vlera Shitjes", "Marzhi Bruto me Zbritje", "Marzhi Bruto % me Zbritje", "Marzhi Bruto", "Marzhi Bruto %"], rows, [{ label: "Artikuj", value: rows.length }, { label: "Marzhi", value: rows.reduce((sum, row) => sum + numberValue(row["Marzhi Bruto"]), 0) }]);
    }
    case "sales_margin_detail_pdf": {
      const [pairs, products, categories] = await Promise.all([salesItemsForPeriod(), getProducts(companyId), getCategories(companyId)]);
      const productMap = new Map(products.map(product => [product.id, product]));
      const categoryMap = new Map(categories.map(category => [category.id, category.name]));
      const totalSales = pairs.reduce((sum, pair) => sum + salesLineAmounts(pair.invoice, pair.item).baseGross, 0);
      const rows = pairs.map(({ invoice, item }) => { const product = item.productId ? productMap.get(item.productId) : undefined; const amounts = salesLineAmounts(invoice, item); const sales = amounts.baseGross; const quantity = Number(item.quantity || 0); const cost = (product?.avgPrice ?? 0) * quantity * amounts.rate; const margin = sales - cost; return { Kodi: product?.code || product?.barcode || "", Emërtimi: product?.name || item.productName || "Pa artikull", Grupi: product?.categoryId ? categoryMap.get(product.categoryId) || "" : "", "Nën Grupi": "", "Kodi artikulli": product?.code || "", "Emërtimi artikulli": product?.name || item.productName || "Pa artikull", Sasia: quantity, "Volumi Shitjeve(%)": totalSales ? (sales / totalSales) * 100 : 0, "Vlera e Shitjes": sales, KMSH: cost, Marzhi: margin, "Marzhi në %": sales ? (margin / sales) * 100 : 0, "Mark up": cost ? (margin / cost) * 100 : 0, Sales: totalSales ? (sales / totalSales) * 100 : 0, __documentId: invoice.id, __documentType: "sales-invoice" }; });
      return result(["Kodi", "Emërtimi", "Grupi", "Nën Grupi", "Kodi artikulli", "Emërtimi artikulli", "Sasia", "Volumi Shitjeve(%)", "Vlera e Shitjes", "KMSH", "Marzhi", "Marzhi në %", "Mark up", "Sales"], rows, [{ label: "Rreshta", value: rows.length }, { label: "Vlefta", value: totalSales }]);
    }
    case "sales_by_product_pdf": {
      const [pairs, products, categories, customers] = await Promise.all([salesItemsForPeriod(), getProducts(companyId), getCategories(companyId), getCustomers(companyId)]);
      const productMap = new Map(products.map(product => [product.id, product]));
      const categoryMap = new Map(categories.map(category => [category.id, category.name]));
      const customerMap = new Map(customers.map(customer => [customer.id, customer]));
      const totalSales = pairs.reduce((sum, pair) => sum + salesLineAmounts(pair.invoice, pair.item).baseGross, 0);
      const totals = new Map<string, { client: string; code: string; name: string; group: string; quantity: number; value: number; sourceDocumentId: number | null }>();
      pairs.forEach(({ invoice, item }) => { const product = item.productId ? productMap.get(item.productId) : undefined; const customer = invoice.customerId ? customerMap.get(invoice.customerId) : undefined; const amounts = salesLineAmounts(invoice, item); const key = `${String(invoice.customerId ?? invoice.customerName ?? "Pa klient")}|${String(item.productId ?? item.productName ?? "Pa artikull")}`; const current = totals.get(key) ?? { client: formatSalesCustomerLabel(customer?.code || (invoice.customerId ? String(invoice.customerId) : null), invoice.customerName || customer?.name), code: product?.code || product?.barcode || "", name: product?.name || item.productName || "Pa artikull", group: product?.categoryId ? categoryMap.get(product.categoryId) || "" : "", quantity: 0, value: 0, sourceDocumentId: invoice.id }; current.quantity += Number(item.quantity || 0); current.value += amounts.baseGross; totals.set(key, current); });
      const rows = Array.from(totals.values()).map(item => ({ Klienti: item.client, Sasia: item.quantity, Çmimi: item.quantity ? item.value / item.quantity : 0, Grupi: item.group, Emërtimi: item.name, "Nën Grupi": "", Kodi: item.code, "Volumi i Shitjeve në %": totalSales ? (item.value / totalSales) * 100 : 0, "Vlere(MB)": item.value, __documentId: item.sourceDocumentId, __documentType: "sales-invoice" }));
      return result(["Klienti", "Sasia", "Çmimi", "Grupi", "Emërtimi", "Nën Grupi", "Kodi", "Volumi i Shitjeve në %", "Vlere(MB)"], rows, [{ label: "Artikuj", value: rows.length }, { label: "Vlefta", value: rows.reduce((sum, row) => sum + numberValue(row["Vlere(MB)" ]), 0) }]);
    }
    case "sales_analytic_register_pdf": {
      const [pairs, products, customers] = await Promise.all([salesItemsForPeriod(), getProducts(companyId), getCustomers(companyId)]);
      const productMap = new Map(products.map(product => [product.id, product]));
      const customerMap = new Map(customers.map(customer => [customer.id, customer]));
      const rows = pairs.map(({ invoice, item }, index) => {
        const product = item.productId ? productMap.get(item.productId) : undefined;
        const customer = invoice.customerId ? customerMap.get(invoice.customerId) : undefined;
        const amounts = salesLineAmounts(invoice, item);
        return { Rend: index + 1, Lloj: "FS", Kodi: product?.barcode || product?.code || "", Nr: invoice.docNumber, Dt: invoice.date, "Kodi Klienti": customer?.code || (invoice.customerId ? String(invoice.customerId) : ""), Emertimi: product?.name || item.productName || "", Njesia: item.unit || product?.baseUnit || "", Monedha: invoice.currency || "ALL", Cmimi: Number(item.unitPrice || 0), Sasia: Number(item.quantity || 0), "Vlera Gjithsej": amounts.gross, "Zbr. Art%": "", "Vlera me Zbritje Art": "", "Zbr. Tot%": "", "Vlera Me Zbritje Tot%": "", Kursi: amounts.rate, "Vlera Me TVSH Mon. Fature": amounts.gross, "Vlera Me Zbritje Mon. Baze": "", __documentId: invoice.id, __documentType: "sales-invoice" };
      });
      return result(["Rend", "Lloj", "Kodi", "Nr", "Dt", "Kodi Klienti", "Emertimi", "Njesia", "Monedha", "Cmimi", "Sasia", "Vlera Gjithsej", "Zbr. Art%", "Vlera me Zbritje Art", "Zbr. Tot%", "Vlera Me Zbritje Tot%", "Kursi", "Vlera Me TVSH Mon. Fature", "Vlera Me Zbritje Mon. Baze"], rows, [{ label: "Rreshta", value: rows.length }, { label: "Vlera në Lek", value: rows.reduce((sum, row) => sum + numberValue(row["Vlera Me Zbritje Mon. Baze"]), 0) }], { "Pike Shijte": "—", Shitesi: "—", Monedha: "ALL" });
    }
    case "sales_comparison_pdf": {
      const [invoices, customers] = await Promise.all([getSalesInvoices(companyId), getCustomers(companyId)]);
      const customerMap = new Map(customers.map(customer => [customer.id, customer]));
      const filteredInvoices = invoices.filter(invoice => inRange(invoice.date));
      const rows = filteredInvoices.map(invoice => {
        const amount = invoice.totalAmount ?? 0;
        const rate = invoice.currency === "ALL" || !invoice.currency ? 1 : Number(invoice.exchangeRate || 1);
        const baseAmount = Math.round(amount * rate);
        const net = Math.max(0, amount - Number(invoice.vatAmount || 0));
        const vat = Number(invoice.vatAmount || 0);
        const customer = invoice.customerId ? customerMap.get(invoice.customerId) : undefined;
        return { Lloj: "FS", "Kod i Klientit": formatSalesCustomerLabel(customer?.code || (invoice.customerId ? String(invoice.customerId) : null), invoice.customerName || customer?.name), "Vlefte Artikulli": amount, Zbritje: "", "pa Tvsh": net, "me Tvsh": amount, "pa Tvsh Baze": Math.round(net * rate), "Tvsh Baze": baseAmount, __documentId: invoice.id, __documentType: "sales-invoice" };
      });
      return result(["Lloj", "Kod i Klientit", "Vlefte Artikulli", "Zbritje", "pa Tvsh", "me Tvsh", "pa Tvsh Baze", "Tvsh Baze"], rows, [{ label: "Fatura", value: rows.length }, { label: "Vlera në Lek", value: rows.reduce((sum, row) => sum + numberValue(row["Tvsh Baze"]), 0) }], { "Pike shitje": "—", Shitesi: "—" });
    }
    case "sales_price_list_pdf": {
      const [productRecords, categories] = await Promise.all([getProducts(companyId), getCategories(companyId)]);
      const categoryMap = new Map(categories.map(category => [category.id, category.name]));
      const rows = productRecords.map(product => ({
        Kartela: product.code || "",
        Kodbari: product.barcode || "",
        "Emërtimi i Artikullit": product.name,
        Njesia: product.baseUnit || "",
        Grupi: product.categoryId ? categoryMap.get(product.categoryId) || "" : "",
        Nengrupi: "",
        "Cmimi 1": Number(product.lastPrice || 0),
        "Cmimi 2": "",
        "Cmimi 3": "",
        "Cmimi 4": "",
        "Cmimi 5": "",
        __documentId: product.id,
        __documentType: "product",
      }));
      return result(["Kartela", "Kodbari", "Emërtimi i Artikullit", "Njesia", "Grupi", "Nengrupi", "Cmimi 1", "Cmimi 2", "Cmimi 3", "Cmimi 4", "Cmimi 5"], rows, [{ label: "Artikuj", value: rows.length }]);
    }
    case "sales_invoices": {
      const [invoices, paymentRecords] = await Promise.all([getSalesInvoices(companyId), getPayments(companyId)]);
      return paymentAwareInvoiceRows(invoices, "customerName", paymentRecords, "INBOUND", "CUSTOMER", "sales-invoice");
    }
    case "sales_quotations": return documentRows(await getSalesQuotations(companyId), "quotationDate", "customerName", "totalAmount", "sales-quotation");
    case "sales_orders": return documentRows(await getSalesOrders(companyId), "orderDate", "customerName", "totalAmount", "sales-order");
    case "sales_deliveries": return documentRows(await getDeliveryNotes(companyId), "deliveryDate", "customerName", undefined, "sales-delivery");
    case "sales_returns": return documentRows(await getSalesReturns(companyId), "returnDate", "customerName", undefined, "sales-return");
    case "sales_customer_statement": {
      const [invoiceRecords, customerRecords, paymentRecords] = await Promise.all([getSalesInvoices(companyId), getCustomers(companyId), getPayments(companyId)]);
      const customersById = new Map(customerRecords.map(customer => [customer.id, customer]));
      const invoices = invoiceRecords.filter(invoice => inRange(invoice.date));
      const customerPayments = paymentRecords.filter(payment => payment.paymentType === "INBOUND" && payment.partnerType === "CUSTOMER" && payment.status !== "CANCELLED" && inRange(payment.paymentDate));
      const invoiceByNumber = new Map(invoices.map(invoice => [normalizeDocumentNumber(invoice.docNumber), invoice]));
      const events = [
        ...invoices.map(invoice => ({ date: new Date(invoice.createdAt ?? invoice.date), kind: "invoice" as const, invoice })),
        ...customerPayments.map(payment => ({ date: new Date(payment.paymentDate), kind: "payment" as const, payment })),
      ].sort((a, b) => a.date.getTime() - b.date.getTime());
      let progressive = 0;
      const rows = events.map((event, index) => {
        if (event.kind === "invoice") {
          const invoice = event.invoice;
          const amount = getReportInvoiceAmount(invoice) * Number(invoice.exchangeRate || 1);
          const customerName = invoice.customerName || (invoice.customerId ? customersById.get(invoice.customerId)?.name : undefined) || "Pa klient";
          progressive += amount;
          return { "Nr Rend": index + 1, "Data Rregj": invoice.createdAt ?? invoice.date, "Lloj Dok": "FS", "Nr Dok": invoice.docNumber, "Data Dok": invoice.date, "Përshkrimi i Veprimit": "Faturë shitjeje", Debi: amount, Kredi: 0, Progresivi: progressive, __partnerName: customerName, __documentNumber: invoice.docNumber, __status: invoice.status, __currency: invoice.currency || "ALL", __warehouseName: invoice.warehouseId ? String(invoice.warehouseId) : "", __documentId: invoice.id, __documentType: "sales-invoice" };
        }
        const payment = event.payment;
        const linkedInvoice = payment.reference ? invoiceByNumber.get(normalizeDocumentNumber(payment.reference)) : undefined;
        const customerName = payment.partnerName || (payment.partnerId ? customersById.get(payment.partnerId)?.name : undefined) || linkedInvoice?.customerName || "Pa klient";
        const amount = Number(payment.amount || 0) * Number(payment.exchangeRate || 1);
        progressive -= amount;
        return { "Nr Rend": index + 1, "Data Rregj": payment.createdAt ?? payment.paymentDate, "Lloj Dok": "PAG", "Nr Dok": payment.paymentNumber, "Data Dok": payment.paymentDate, "Përshkrimi i Veprimit": "Pagesë klienti", Debi: 0, Kredi: amount, Progresivi: progressive, __partnerName: customerName, __documentNumber: payment.paymentNumber, __status: payment.status, __currency: payment.currency || "ALL", __documentId: payment.id, __documentType: "accounting-payment", __reference: payment.reference || "" };
      });
      return result(["Nr Rend", "Data Rregj", "Lloj Dok", "Nr Dok", "Data Dok", "Përshkrimi i Veprimit", "Debi", "Kredi", "Progresivi"], rows, [{ label: "Dokumente", value: rows.length }, { label: "Tepricë", value: progressive }], { Klienti: Array.from(new Set(rows.map(row => String(row.__partnerName || "")).filter(Boolean))).join(", ") || "Të gjithë", "Nr Llogarie": "—", Mon: "ALL", Titulli: "Kartelë klienti", NIPTI: "—" });
    }
    case "sales_customers": {
      const [invoices, customers] = await Promise.all([getSalesInvoices(companyId), getCustomers(companyId)]);
      const inRangeInvoices = invoices.filter(item => inRange(item.date));
      const customerMap = new Map(customers.map(customer => [customer.id, customer]));
      const totals = new Map<string, { label: string; count: number; amount: number; sourceDocumentId: number | null }>();
      inRangeInvoices.forEach(item => {
        const customer = item.customerId ? customerMap.get(item.customerId) : undefined;
        const key = getSalesCustomerAggregationKey(item.customerId, item.customerName);
        const value = totals.get(key) ?? { label: formatSalesCustomerLabel(customer?.code || (item.customerId ? String(item.customerId) : null), item.customerName || customer?.name), count: 0, amount: 0, sourceDocumentId: item.id };
        value.count += 1;
        value.amount += item.totalAmount ?? 0;
        totals.set(key, value);
      });
      const rows = Array.from(totals.values()).map(item => ({ Klienti: item.label, Fatura: item.count, "Të ardhura": item.amount, __documentId: item.sourceDocumentId, __documentType: "sales-invoice" }));
      return result(["Klienti", "Fatura", "Të ardhura"], rows, [{ label: "Klientë", value: rows.length }, { label: "Të ardhura", value: inRangeInvoices.reduce((sum, item) => sum + (item.totalAmount ?? 0), 0) }]);
    }
    case "sales_quantity_total_pdf": {
      const pairs = await salesItemsForPeriod();
      const totals = new Map<string, { unit: string; months: number[]; total: number }>();
      pairs.forEach(({ invoice, item }) => {
        const key = String(item.productName || "Pa artikull");
        const value = totals.get(key) ?? { unit: String(item.unit || ""), months: Array(12).fill(0), total: 0 };
        const month = new Date(invoice.date).getMonth();
        const quantity = Number(item.quantity || 0);
        value.months[month] += quantity;
        value.total += quantity;
        totals.set(key, value);
      });
      const rows = Array.from(totals, ([Artikulli, value]) => ({ Artikulli, ...Object.fromEntries(monthNames.map((month, index) => [month, value.months[index]])) }));
      return result(["Artikulli", ...monthNames], rows, [{ label: "Artikuj", value: rows.length }, { label: "Sasi totale", value: Array.from(totals.values()).reduce((sum, item) => sum + item.total, 0) }]);
    }
    case "sales_items_sold_pdf": {
      const [pairs, products] = await Promise.all([salesItemsForPeriod(), getProducts(companyId)]);
      const productById = new Map(products.map(product => [product.id, product]));
      const totals = new Map<string, { code: string; name: string; unit: string; quantity: number; value: number; sourceDocumentId: number | null }>();
      pairs.forEach(({ invoice, item }) => {
        const product = item.productId ? productById.get(item.productId) : undefined;
        const key = String(item.productId ?? item.productName ?? "Pa artikull");
        const value = totals.get(key) ?? { code: product?.code || product?.barcode || "—", name: product?.name || item.productName || "Pa artikull", unit: product?.baseUnit || item.unit || "", quantity: 0, value: 0, sourceDocumentId: invoice.id };
        const amounts = salesLineAmounts(invoice, item);
        value.quantity += Number(item.quantity || 0);
        value.value += amounts.gross;
        (value as any).net = ((value as any).net || 0) + amounts.net;
        totals.set(key, value);
      });
      const totalValue = Array.from(totals.values()).reduce((sum, row) => sum + row.value, 0);
      const rows = Array.from(totals.values()).map(value => {
        const share = totalValue ? (value.value / totalValue) * 100 : 0;
        const unitPrice = value.quantity ? value.value / value.quantity : 0;
        const net = Number((value as any).net || 0);
        return { Kartelë: value.code, Emërtimi: value.name, Njësia: value.unit, Sasia: value.quantity, Çmimi: unitPrice, "Vlefta pa TVSH": net, "Vlefta me TVSH": value.value, "Në %": share, "Vlefta pa TVSH me Zbritje": net, "Vlefta me TVSH me Zbritje": value.value, "Në % Analitike": share, __documentId: value.sourceDocumentId, __documentType: "sales-invoice" };
      });
      return result(["Kartelë", "Emërtimi", "Njësia", "Sasia", "Çmimi", "Vlefta pa TVSH", "Vlefta me TVSH", "Në %", "Vlefta pa TVSH me Zbritje", "Vlefta me TVSH me Zbritje", "Në % Analitike"], rows, [{ label: "Artikuj", value: rows.length }, { label: "Sasi", value: rows.reduce((sum, row) => sum + numberValue(row.Sasia), 0) }, { label: "Vlefta", value: totalValue }]);
    }
    case "sales_unsold_items_pdf": {
      const [products, pairs] = await Promise.all([getProducts(companyId), salesItemsForPeriod()]);
      const soldIds = new Set(pairs.map(({ item }) => item.productId).filter((id): id is number => typeof id === "number"));
      const soldNames = new Set(pairs.map(({ item }) => String(item.productName || "").trim().toLocaleLowerCase("sq-AL")));
      const rows = products.filter(product => !soldIds.has(product.id) && !soldNames.has(product.name.trim().toLocaleLowerCase("sq-AL"))).map(product => ({ "Nr. Blerje": "", "Dt.": "", "Njësia": product.baseUnit || "", "Kartelë": product.code || "", "Emërtimi i Artikullit": product.name, "Kod Bar": product.barcode || "", Gjendja: product.stock ?? 0 }));
      return result(["Nr. Blerje", "Dt.", "Njësia", "Kartelë", "Emërtimi i Artikullit", "Kod Bar", "Gjendja"], rows, [{ label: "Artikuj të pashitur", value: rows.length }]);
    }
    case "sales_summary_register_pdf": {
      const [pairs, customers] = await Promise.all([salesItemsForPeriod(), getCustomers(companyId)]);
      const customerMap = new Map(customers.map(customer => [customer.id, customer]));
      const rows = pairs.map(({ invoice, item }, index) => {
        const amounts = salesLineAmounts(invoice, item);
        const customer = invoice.customerId ? customerMap.get(invoice.customerId) : undefined;
        return { "Nr Rend": index + 1, Lloj: "FS", Nr: invoice.docNumber, Date: invoice.date, Mon: invoice.currency || "ALL", "Kod i Klientit": formatSalesCustomerLabel(customer?.code || (invoice.customerId ? String(invoice.customerId) : null), invoice.customerName || customer?.name), "Kodi Artikulli": item.productId ? String(item.productId) : item.productName || "Pa artikull", "Vlefta Artikulli": amounts.gross, "Zbritje Anal.": "", "Zbritje Tot.": "", "Zbritje %": "", "Zbritje Gjithsej Vlefta": "", "Vlera me Zbritje pa TVSH": amounts.net, "Vlera me Zbritje me TVSH": amounts.gross, "Vlera në Mon Baze pa TVSH": amounts.baseNet, "Vlera në Mon Baze TVSH": amounts.baseGross, __documentId: invoice.id, __documentType: "sales-invoice", __invoiceTotalAmount: Number(invoice.totalAmount || 0), __invoiceVatAmount: Number(invoice.vatAmount || 0), __invoiceBaseTotalAmount: Math.round(Number(invoice.totalAmount || 0) * amounts.rate), __partnerName: formatSalesCustomerLabel(customer?.code || (invoice.customerId ? String(invoice.customerId) : null), invoice.customerName || customer?.name) };
      });
      return result(["Nr Rend", "Lloj", "Nr", "Date", "Mon", "Kod i Klientit", "Kodi Artikulli", "Vlefta Artikulli", "Zbritje Anal.", "Zbritje Tot.", "Zbritje %", "Zbritje Gjithsej Vlefta", "Vlera me Zbritje pa TVSH", "Vlera me Zbritje me TVSH", "Vlera në Mon Baze pa TVSH", "Vlera në Mon Baze TVSH"], rows, [{ label: "Rreshta", value: rows.length }, { label: "Vlefta", value: rows.reduce((sum, row) => sum + numberValue(row["Vlera me Zbritje me TVSH"]), 0) }]);
    }
    case "inventory_minimum_status_pdf": {
      const [products, movements, balances, warehouses, categories] = await Promise.all([getProducts(companyId), getStockMovements(companyId), getStockBalances(companyId), getWarehouses(companyId), getCategories(companyId)]);
      const categoryMap = new Map(categories.map(category => [category.id, category.name]));
      const rows = products.flatMap(product => {
        const productBalances = balances.filter(balance => balance.productId === product.id);
        const scopes = productBalances.length > 0 ? productBalances : [{ warehouseId: 0, quantity: product.stock ?? 0 }];
        return scopes.map(scope => {
          const warehouseName = scope.warehouseId ? warehouses.find(warehouse => warehouse.id === scope.warehouseId)?.name || `#${scope.warehouseId}` : "";
          const stock = scope.quantity ?? 0;
          if (!((product.minStock ?? 0) > 0 && stock <= (product.minStock ?? 0))) return null;
          const related = movements.filter(movement => movement.productId === product.id && (!scope.warehouseId || movement.warehouseId === scope.warehouseId) && inRange(movement.movementDate));
          const incoming = related.filter(movement => movement.movementType === "IN").reduce((sum, movement) => sum + movement.quantity, 0);
          const outgoing = related.filter(movement => movement.movementType === "OUT").reduce((sum, movement) => sum + movement.quantity, 0);
          const cost = product.avgPrice ?? 0;
          return { Kartela: product.code || product.barcode || "", Përshkrimi: product.name, Grupi: product.categoryId ? categoryMap.get(product.categoryId) || "" : "", Njësia: product.baseUnit || "", "Llog. Inventare": "", Minimum: product.minStock ?? 0, Mungesat: Math.max(0, (product.minStock ?? 0) - stock), Hyrje: incoming, Dalje: outgoing, Gjendje: stock, Kosto: cost, Vlefta: stock * cost, Furnitori: "", __warehouse: warehouseName, __documentId: product.id, __documentType: "product" };
        }).filter(Boolean) as Record<string, unknown>[];
      });
      return result(["Kartela", "Përshkrimi", "Grupi", "Njësia", "Llog. Inventare", "Minimum", "Mungesat", "Hyrje", "Dalje", "Gjendje", "Kosto", "Vlefta", "Furnitori"], rows, [{ label: "Artikuj nën minimum", value: rows.length }, { label: "Mungesa", value: rows.reduce((sum, row) => sum + numberValue(row.Mungesat), 0) }]);
    }
    case "inventory_warehouse_detail_pdf": {
      const [products, warehouses, balances, movements, categories] = await Promise.all([getProducts(companyId), getWarehouses(companyId), getStockBalances(companyId), getStockMovements(companyId), getCategories(companyId)]);
      const categoryMap = new Map(categories.map(category => [category.id, category.name]));
      const expandedRows = balances.flatMap(balance => {
        const product = products.find(item => item.id === balance.productId);
        const warehouseName = warehouses.find(warehouse => warehouse.id === balance.warehouseId)?.name || `#${balance.warehouseId}`;
        const related = movements.filter(movement => movement.productId === balance.productId && movement.warehouseId === balance.warehouseId && inRange(movement.movementDate));
        const incoming = related.filter(movement => movement.movementType === "IN").reduce((sum, movement) => sum + movement.quantity, 0);
        const outgoing = related.filter(movement => movement.movementType === "OUT").reduce((sum, movement) => sum + movement.quantity, 0);
        const cost = product?.avgPrice ?? 0;
        const master = { Kartela: product?.code || product?.barcode || "", Përshkrimi: product?.name || `#${balance.productId}`, Grupi: product?.categoryId ? categoryMap.get(product.categoryId) || "" : "", Njësia: product?.baseUnit || "", "Llog. Inventar": "", Hyrje: incoming, Dalje: outgoing, Gjendje: balance.quantity, Kosto: cost, Vlefta: balance.quantity * cost, "Në %": 0, __rowType: "master", __warehouse: warehouseName, __documentId: product?.id, __documentType: "product" };
        const detailRows = related.map(movement => {
          const isIncoming = movement.movementType === "IN";
          const quantity = movement.quantity;
          return { Kartela: "", Përshkrimi: "Pa Detajme", Grupi: "", Njësia: product?.baseUnit || "", "Llog. Inventar": "", Hyrje: isIncoming ? quantity : 0, Dalje: isIncoming ? 0 : quantity, Gjendje: "", Kosto: "", Vlefta: isIncoming ? quantity * cost : -quantity * cost, "Në %": "", __rowType: "detail", __warehouse: warehouseName, __documentId: movement.id, __documentType: "stock-movement" };
        });
        const subtotal = { Kartela: "", Përshkrimi: "Totali", Grupi: "", Njësia: "", "Llog. Inventar": "", Hyrje: "", Dalje: "", Gjendje: "", Kosto: "", Vlefta: detailRows.reduce((sum, row) => sum + numberValue(row.Vlefta), 0), "Në %": "", __rowType: "subtotal", __warehouse: warehouseName, __documentId: product?.id, __documentType: "product" };
        return [master, ...detailRows, subtotal];
      });
      const rows = applyInventoryValuePercent(expandedRows.filter(row => row.__rowType === "master")).concat(expandedRows.filter(row => row.__rowType !== "master"));
      return result(["Kartela", "Përshkrimi", "Grupi", "Njësia", "Llog. Inventar", "Hyrje", "Dalje", "Gjendje", "Kosto", "Vlefta", "Në %"], rows, [{ label: "Balanca", value: balances.length }, { label: "Detaje", value: movements.length }, { label: "Vlefta", value: rows.reduce((sum, row) => sum + numberValue(row.Vlefta), 0) }]);
    }
    case "inventory_product_card_pdf": {
      const [movements, products, warehouses, categories] = await Promise.all([getStockMovements(companyId), getProducts(companyId), getWarehouses(companyId), getCategories(companyId)]);
      const categoryMap = new Map(categories.map(category => [category.id, category.name]));
      const orderedMovements = movements.filter(movement => inRange(movement.movementDate)).sort((left, right) => new Date(left.movementDate).getTime() - new Date(right.movementDate).getTime() || left.id - right.id);
      const runningByProduct = new Map<string, number>();
      const rows = orderedMovements.map(movement => {
        const product = products.find(item => item.id === movement.productId);
        const quantity = movement.quantity;
        const warehouseKey = String(movement.warehouseId ?? 0);
        const price = product?.avgPrice ?? 0;
        const isIncoming = movement.movementType === "IN";
        const isOutgoing = movement.movementType === "OUT";
        const runningKey = getInventoryRunningKey(movement.warehouseId, movement.productId);
        const previous = runningByProduct.get(runningKey) ?? 0;
        const running = previous + (isIncoming ? quantity : isOutgoing ? -quantity : 0);
        runningByProduct.set(runningKey, running);
        const referenceType = String(movement.referenceType || "");
        const documentType = referenceType.startsWith("PURCHASE_INVOICE") ? "purchase-invoice" : referenceType === "PURCHASE_RECEIPT" ? "purchase-receipt" : referenceType === "PURCHASE_RETURN" ? "purchase-return" : referenceType.startsWith("SALES_INVOICE") ? "sales-invoice" : referenceType === "SALES_RETURN" ? "sales-return" : "stock-movement";
        const documentId = documentType === "stock-movement" ? movement.id : Number(movement.referenceId || movement.id);
        return { "Lloj Dok.": movement.movementType, "Nr Dokumenti": movement.docNumber, "Dt Dokumenti": movement.movementDate, Magazina: movement.warehouseId ? warehouses.find(warehouse => warehouse.id === movement.warehouseId)?.name || `#${movement.warehouseId}` : "", "Njësia": product?.baseUnit || "", Hyrje: isIncoming ? quantity : 0, "Çmimi Hyrje": isIncoming ? price : "", "Vlefta Hyrje": isIncoming ? quantity * price : "", Dalje: isOutgoing ? quantity : 0, "Çmimi Dalje": isOutgoing ? price : "", "Vlefta Dalje": isOutgoing ? quantity * price : "", Gjendje: running, Vlefta: running * price, __productName: product?.name || `#${movement.productId}`, __productCode: product?.code || product?.barcode || `#${movement.productId}`, __productBarcode: product?.barcode || product?.code || `#${movement.productId}`, __productGroup: product?.categoryId ? categoryMap.get(product.categoryId) || "—" : "—", __productSubgroup: "—", __warehouse: movement.warehouseId ? warehouses.find(warehouse => warehouse.id === movement.warehouseId)?.name || `#${movement.warehouseId}` : "", __documentId: documentId, __documentType: documentType, __referenceType: referenceType, __referenceId: movement.referenceId };
      });
      return result(["Lloj Dok.", "Nr Dokumenti", "Dt Dokumenti", "Magazina", "Njësia", "Hyrje", "Çmimi Hyrje", "Vlefta Hyrje", "Dalje", "Çmimi Dalje", "Vlefta Dalje", "Gjendje", "Vlefta"], rows, [{ label: "Lëvizje", value: rows.length }, { label: "Hyrje", value: rows.reduce((sum, row) => sum + numberValue(row.Hyrje), 0) }, { label: "Dalje", value: rows.reduce((sum, row) => sum + numberValue(row.Dalje), 0) }]);
    }
    case "inventory_stock": {
      const [products, balances, warehouses] = await Promise.all([getProducts(companyId), getStockBalances(companyId), getWarehouses(companyId)]);
      const rows = products.flatMap(item => { const productBalances = balances.filter(balance => balance.productId === item.id); if (productBalances.length > 0) return productBalances.map(balance => { const warehouseName = warehouses.find(warehouse => warehouse.id === balance.warehouseId)?.name || `#${balance.warehouseId}`; return { Kodi: item.code || "—", Artikulli: item.name, Stoku: balance.quantity, Minimumi: item.minStock ?? 0, "Çmimi mesatar": item.avgPrice ?? 0, Magazina: warehouseName, __warehouse: warehouseName, __documentId: item.id, __documentType: "product" }; }); return [{ Kodi: item.code || "—", Artikulli: item.name, Stoku: item.stock ?? 0, Minimumi: item.minStock ?? 0, "Çmimi mesatar": item.avgPrice ?? 0, Magazina: "", __warehouse: "", __documentId: item.id, __documentType: "product" }]; });
      return result(["Kodi", "Artikulli", "Stoku", "Minimumi", "Çmimi mesatar", "Magazina"], rows, [{ label: "Artikuj", value: rows.length }, { label: "Njësi", value: rows.reduce((sum, item) => sum + numberValue(item.Stoku), 0) }]);
    }
    case "inventory_balances": {
      const [balances, products, warehouses, locations] = await Promise.all([getStockBalances(companyId), getProducts(companyId), getWarehouses(companyId), getStockLocations(companyId)]);
      return result(["Magazina", "Lokacioni", "Artikulli", "Sasia", "Përditësuar"], balances.map(item => ({ Magazina: warehouses.find(warehouse => warehouse.id === item.warehouseId)?.name || `#${item.warehouseId}`, Lokacioni: item.locationId ? locations.find(location => location.id === item.locationId)?.name || `#${item.locationId}` : "I përgjithshëm", Artikulli: products.find(product => product.id === item.productId)?.name || `#${item.productId}`, Sasia: item.quantity, Përditësuar: item.updatedAt, __warehouse: warehouses.find(warehouse => warehouse.id === item.warehouseId)?.name || `#${item.warehouseId}`, __documentId: item.productId, __documentType: "product" })), [{ label: "Balanca", value: balances.length }, { label: "Njësi", value: balances.reduce((sum, item) => sum + item.quantity, 0) }]);
    }
    case "inventory_movements": {
      const [movements, warehouses] = await Promise.all([getStockMovements(companyId), getWarehouses(companyId)]);
      const filtered = movements.filter(item => inRange(item.movementDate));
      const rows = filtered.map(item => { const warehouseName = item.warehouseId ? warehouses.find(warehouse => warehouse.id === item.warehouseId)?.name || `#${item.warehouseId}` : ""; return { Data: item.movementDate, Dokumenti: item.docNumber, Lloji: item.movementType, Artikulli: item.productName, Sasia: item.quantity, Magazina: warehouseName, __warehouse: warehouseName, __documentId: item.id, __documentType: "stock-movement" }; });
      return result(["Data", "Dokumenti", "Lloji", "Artikulli", "Sasia", "Magazina"], rows, [{ label: "Lëvizje", value: rows.length }, { label: "Sasi", value: rows.reduce((sum, item) => sum + numberValue(item.Sasia), 0) }]);
    }
    case "inventory_low_stock": {
      const [products, balances, warehouses] = await Promise.all([getProducts(companyId), getStockBalances(companyId), getWarehouses(companyId)]);
      const rows = products.flatMap(item => { const productBalances = balances.filter(balance => balance.productId === item.id); const scopes = productBalances.length > 0 ? productBalances : [{ warehouseId: 0, quantity: item.stock ?? 0 }]; return scopes.map(scope => { const warehouseName = scope.warehouseId ? warehouses.find(warehouse => warehouse.id === scope.warehouseId)?.name || `#${scope.warehouseId}` : ""; const stock = scope.quantity ?? 0; return (item.minStock ?? 0) > 0 && stock <= (item.minStock ?? 0) ? { Kodi: item.code || "—", Artikulli: item.name, Stoku: stock, Minimumi: item.minStock ?? 0, Mungesa: Math.max(0, (item.minStock ?? 0) - stock), Magazina: warehouseName, __warehouse: warehouseName } : null; }).filter(Boolean) as Record<string, unknown>[]; });
      return result(["Kodi", "Artikulli", "Stoku", "Minimumi", "Mungesa", "Magazina"], rows, [{ label: "Artikuj me alarm", value: rows.length }]);
    }
    case "inventory_transfers": {
      const [transfers, warehouses] = await Promise.all([getStockTransfers(companyId), getWarehouses(companyId)]);
      const rows = transfers.filter(item => inRange(item.transferDate)).map(item => { const source = warehouses.find(warehouse => warehouse.id === item.sourceWarehouseId)?.name || `#${item.sourceWarehouseId}`; const destination = warehouses.find(warehouse => warehouse.id === item.destinationWarehouseId)?.name || `#${item.destinationWarehouseId}`; return { Dokumenti: item.docNumber, Data: item.transferDate, Magazina: `${source} → ${destination}`, Burimi: source, Destinacioni: destination, Statusi: item.status, __warehouse: `${source} ${destination}`, __documentId: item.id, __documentType: "inventory-transfer" }; });
      return result(["Dokumenti", "Data", "Magazina", "Burimi", "Destinacioni", "Statusi"], rows, [{ label: "Transferta", value: rows.length }]);
    }
    case "inventory_adjustments": {
      const [adjustments, warehouses] = await Promise.all([getInventoryAdjustments(companyId), getWarehouses(companyId)]);
      const rows = adjustments.filter(item => inRange(item.adjustmentDate)).map(item => { const warehouseName = item.warehouseId ? warehouses.find(warehouse => warehouse.id === item.warehouseId)?.name || `#${item.warehouseId}` : ""; return { Dokumenti: item.docNumber, Data: item.adjustmentDate, Magazina: warehouseName, Statusi: item.status, Shënime: item.notes || "", __warehouse: warehouseName, __documentId: item.id, __documentType: "inventory-adjustment" }; });
      return result(["Dokumenti", "Data", "Magazina", "Statusi", "Shënime"], rows, [{ label: "Inventarizime", value: rows.length }]);
    }
    case "inventory_warehouse_status_pdf": {
      const [products, warehouses, balances, movements, categories] = await Promise.all([getProducts(companyId), getWarehouses(companyId), getStockBalances(companyId), getStockMovements(companyId), getCategories(companyId)]);
      const categoryMap = new Map(categories.map(category => [category.id, category.name]));
      const rows = applyInventoryValuePercent(balances.map(balance => {
        const product = products.find(item => item.id === balance.productId);
        const warehouse = warehouses.find(item => item.id === balance.warehouseId);
        const related = movements.filter(item => item.warehouseId === balance.warehouseId && item.productId === balance.productId && inRange(item.movementDate));
        const incoming = related.filter(item => item.movementType === "IN").reduce((sum, item) => sum + item.quantity, 0);
        const outgoing = related.filter(item => item.movementType === "OUT").reduce((sum, item) => sum + item.quantity, 0);
        const cost = product?.avgPrice ?? 0;
        return { Kartelë: product?.code || "—", Përshkrimi: product?.name || `#${balance.productId}`, Grupi: product?.categoryId ? categoryMap.get(product.categoryId) || "" : "", Njësia: product?.baseUnit || "", "Llog. Inventar": "", Hyrje: incoming, Dalje: outgoing, Gjendje: balance.quantity, Kosto: cost, Vlefta: balance.quantity * cost, "Në %": product?.minStock ? (balance.quantity / product.minStock) * 100 : 0, __warehouse: warehouse?.name || `#${balance.warehouseId}`, __documentId: product?.id, __documentType: "product" };
      }));
      return result(["Kartelë", "Përshkrimi", "Grupi", "Njësia", "Llog. Inventar", "Hyrje", "Dalje", "Gjendje", "Kosto", "Vlefta", "Në %"], rows, [{ label: "Rreshta", value: rows.length }, { label: "Vlefta", value: rows.reduce((sum, row) => sum + numberValue(row.Vlefta), 0) }], { Magazina: Array.from(new Set(rows.map(row => String(row.__warehouse || "")).filter(Boolean))).join(", ") || "—" });
    }
    case "inventory_analytic_register_pdf": {
      const [products, movements, warehouses] = await Promise.all([getProducts(companyId), getStockMovements(companyId), getWarehouses(companyId)]);
      const rows = movements.filter(item => inRange(item.movementDate)).map(item => { const product = products.find(productItem => productItem.id === item.productId); const warehouseName = item.warehouseId ? warehouses.find(warehouse => warehouse.id === item.warehouseId)?.name || `#${item.warehouseId}` : ""; const price = product?.avgPrice ?? 0; const signedQuantity = item.movementType === "OUT" ? -item.quantity : item.quantity; const referenceType = String(item.referenceType || ""); const documentType = referenceType.startsWith("PURCHASE_INVOICE") ? "purchase-invoice" : referenceType === "PURCHASE_RECEIPT" ? "purchase-receipt" : referenceType === "PURCHASE_RETURN" ? "purchase-return" : referenceType.startsWith("SALES_INVOICE") ? "sales-invoice" : referenceType === "SALES_RETURN" ? "sales-return" : "stock-movement"; const documentId = documentType === "stock-movement" ? item.id : Number(item.referenceId || item.id); return { Lloji: item.movementType, Numri: item.docNumber, Data: item.movementDate, "Dt Regj": item.createdAt, Kartela: product?.code || "—", Përshkrimi: item.productName || product?.name || `#${item.productId}`, Njësia: product?.baseUnit || "", Sasia: item.quantity, Çmimi: price, Vlefta: signedQuantity * price, __warehouse: warehouseName, __documentId: documentId, __documentType: documentType }; });
      return result(["Lloji", "Numri", "Data", "Dt Regj", "Kartela", "Përshkrimi", "Njësia", "Sasia", "Çmimi", "Vlefta"], rows, [{ label: "Lëvizje", value: rows.length }, { label: "Sasi", value: rows.reduce((sum, row) => sum + numberValue(row.Sasia), 0) }, { label: "Vlefta", value: rows.reduce((sum, row) => sum + numberValue(row.Vlefta), 0) }]);
    }
    case "inventory_product_summary_pdf": {
      const [products, balances, warehouses, movements, categories] = await Promise.all([getProducts(companyId), getStockBalances(companyId), getWarehouses(companyId), getStockMovements(companyId), getCategories(companyId)]);
      const categoryMap = new Map(categories.map(category => [category.id, category.name]));
      const rows = products.flatMap(product => {
        const productBalances = balances.filter(balance => balance.productId === product.id);
        const scopes = productBalances.length > 0 ? productBalances : [{ warehouseId: 0, quantity: product.stock ?? 0 }];
        return scopes.map(scope => {
          const warehouseName = scope.warehouseId ? warehouses.find(warehouse => warehouse.id === scope.warehouseId)?.name || `#${scope.warehouseId}` : "";
          const related = movements.filter(movement => movement.productId === product.id && (!scope.warehouseId || movement.warehouseId === scope.warehouseId) && inRange(movement.movementDate));
          const incoming = related.filter(movement => movement.movementType === "IN").reduce((sum, movement) => sum + movement.quantity, 0);
          const outgoing = related.filter(movement => movement.movementType === "OUT").reduce((sum, movement) => sum + movement.quantity, 0);
          const current = Number(scope.quantity ?? 0);
          const opening = current - incoming + outgoing;
          const cost = product.avgPrice ?? 0;
          return { "Kartelë": product.code || product.barcode || "—", "Përshkrimi": product.name, Grupi: product.categoryId ? categoryMap.get(product.categoryId) || "" : "", "Njësia": product.baseUnit || "", "Llog. Inventar": "", "Gjendje Mbartur": opening, Hyrje: incoming, Dalje: outgoing, Gjendje: current, Kosto: cost, Vlefta: current * cost, __warehouse: warehouseName, __documentId: product.id, __documentType: "product" };
        });
      });
      return result(["Kartelë", "Përshkrimi", "Grupi", "Njësia", "Llog. Inventar", "Gjendje Mbartur", "Hyrje", "Dalje", "Gjendje", "Kosto", "Vlefta"], rows, [{ label: "Artikuj", value: rows.length }, { label: "Gjendje", value: rows.reduce((sum, row) => sum + numberValue(row.Gjendje), 0) }, { label: "Vlefta", value: rows.reduce((sum, row) => sum + numberValue(row.Vlefta), 0) }], { Magazina: Array.from(new Set(rows.map(row => String(row.__warehouse || "")).filter(Boolean))).join(", ") || "—" });
    }
    case "inventory_article_analysis_pdf": {
      const [products, movements, balances, warehouses, categories] = await Promise.all([getProducts(companyId), getStockMovements(companyId), getStockBalances(companyId), getWarehouses(companyId), getCategories(companyId)]);
      const categoryMap = new Map(categories.map(category => [category.id, category.name]));
      const rows = products.flatMap(product => {
        const productBalances = balances.filter(balance => balance.productId === product.id);
        const scopes = productBalances.length > 0 ? productBalances : [{ warehouseId: 0, quantity: product.stock ?? 0 }];
        return scopes.map(scope => {
          const warehouseName = scope.warehouseId ? warehouses.find(warehouse => warehouse.id === scope.warehouseId)?.name || `#${scope.warehouseId}` : "";
          const related = movements.filter(movement => movement.productId === product.id && (!scope.warehouseId || movement.warehouseId === scope.warehouseId) && inRange(movement.movementDate));
          const incomingFromPurchases = related.filter(movement => movement.movementType === "IN" && String(movement.referenceType || "").startsWith("PURCHASE_")).reduce((sum, movement) => sum + movement.quantity, 0);
          const incomingOther = related.filter(movement => movement.movementType === "IN" && !String(movement.referenceType || "").startsWith("PURCHASE_")).reduce((sum, movement) => sum + movement.quantity, 0);
          const outgoingForSales = related.filter(movement => movement.movementType === "OUT" && String(movement.referenceType || "").startsWith("SALES_")).reduce((sum, movement) => sum + movement.quantity, 0);
          const outgoingOther = related.filter(movement => movement.movementType === "OUT" && !String(movement.referenceType || "").startsWith("SALES_")).reduce((sum, movement) => sum + movement.quantity, 0);
          const incoming = incomingFromPurchases + incomingOther;
          const outgoing = outgoingForSales + outgoingOther;
          const current = Number(scope.quantity ?? 0);
          const opening = current - incoming + outgoing;
          const cost = product.avgPrice ?? 0;
          return { Kartela: product.code || product.barcode || "—", Emërtimi: product.name, "Njësia": product.baseUnit || "", "Gjendje me Pare": opening, "Hyrje nga Blerjet": incomingFromPurchases, "Hyrje të Tjera": incomingOther, "Dalje për Shitje": outgoingForSales, "Dalje të Tjera": outgoingOther, Gjendje: current, "Çmimi mesatar": cost, Vlefta: current * cost, __warehouse: warehouseName, __productGroup: product.categoryId ? categoryMap.get(product.categoryId) || "" : "", __documentId: product.id, __documentType: "product" };
        });
      });
      return result(["Kartela", "Emërtimi", "Njësia", "Gjendje me Pare", "Hyrje nga Blerjet", "Hyrje të Tjera", "Dalje për Shitje", "Dalje të Tjera", "Gjendje", "Çmimi mesatar", "Vlefta"], rows, [{ label: "Artikuj", value: rows.length }, { label: "Hyrje", value: rows.reduce((sum, row) => sum + numberValue(row["Hyrje nga Blerjet"]) + numberValue(row["Hyrje të Tjera"]), 0) }, { label: "Dalje", value: rows.reduce((sum, row) => sum + numberValue(row["Dalje për Shitje"]) + numberValue(row["Dalje të Tjera"]), 0) }, { label: "Vlefta", value: rows.reduce((sum, row) => sum + numberValue(row.Vlefta), 0) }], { Magazina: Array.from(new Set(rows.map(row => String(row.__warehouse || "")).filter(Boolean))).join(", ") || "—" });
    }
    case "inventory_valuation": {
      const [products, balances, warehouses] = await Promise.all([getProducts(companyId), getStockBalances(companyId), getWarehouses(companyId)]);
      const rows = products.flatMap(item => {
        const productBalances = balances.filter(balance => balance.productId === item.id);
        if (productBalances.length > 0) return productBalances.map(balance => { const warehouseName = warehouses.find(warehouse => warehouse.id === balance.warehouseId)?.name || `#${balance.warehouseId}`; return { Kodi: item.code || "—", Artikulli: item.name, Sasia: balance.quantity, "Çmimi mesatar": item.avgPrice ?? 0, Vlera: balance.quantity * (item.avgPrice ?? 0), Magazina: warehouseName, __warehouse: warehouseName, __documentId: item.id, __documentType: "product" }; });
        return [{ Kodi: item.code || "—", Artikulli: item.name, Sasia: item.stock ?? 0, "Çmimi mesatar": item.avgPrice ?? 0, Vlera: (item.stock ?? 0) * (item.avgPrice ?? 0), Magazina: "", __warehouse: "", __documentId: item.id, __documentType: "product" }];
      });
      return result(["Kodi", "Artikulli", "Sasia", "Çmimi mesatar", "Vlera", "Magazina"], rows, [{ label: "Vlera e stokut", value: rows.reduce((sum, item) => sum + numberValue(item.Vlera), 0) }]);
    }
    case "accounting_trial_balance": {
      const report = await getAccountingReport(companyId, filters);
      return result(["Kodi", "Llogaria", "Tipi", "Debi", "Kredi", "Bilanci"], report.trialBalance.map(item => ({ Kodi: item.code, Llogaria: item.name, Tipi: item.accountType, Debi: item.debit, Kredi: item.credit, Bilanci: item.balance })), [{ label: "Debi", value: report.metrics.totalDebit }, { label: "Kredi", value: report.metrics.totalCredit }]);
    }
    case "accounting_profit_loss": {
      const report = await getAccountingReport(companyId, filters);
      return result(["Kategoria", "Vlera"], [{ Kategoria: "Të ardhura", Vlera: report.metrics.revenue }, { Kategoria: "Shpenzime", Vlera: report.metrics.expenses }, { Kategoria: "Fitim / Humbje neto", Vlera: report.metrics.netProfit }], [{ label: "Fitim neto", value: report.metrics.netProfit }]);
    }
    case "accounting_payments": {
      const payments = (await getPayments(companyId)).filter(item => inRange(item.paymentDate));
      const paymentInLek = (item: typeof payments[number]) => Math.round(item.amount * (item.currency === "ALL" ? 1 : Number(item.exchangeRate || 1)));
      return result(["Nr.", "Data", "Partneri", "Lloji", "Vlera", "Monedha", "Kursi", "Vlera në Lek", "Metoda", "Statusi"], payments.map(item => ({ "Nr.": item.paymentNumber, Data: item.paymentDate, Partneri: item.partnerName || "—", Lloji: item.paymentType, Vlera: item.amount, Monedha: item.currency || "ALL", Kursi: item.exchangeRate || "1.000000", "Vlera në Lek": paymentInLek(item), Metoda: item.method, Statusi: item.status, __documentId: item.id, __documentType: "accounting-payment" })), [{ label: "Pagesa", value: payments.length }, { label: "Hyrje në Lek", value: payments.filter(item => item.paymentType === "INBOUND").reduce((sum, item) => sum + paymentInLek(item), 0) }, { label: "Dalje në Lek", value: payments.filter(item => item.paymentType === "OUTBOUND").reduce((sum, item) => sum + paymentInLek(item), 0) }]);
    }
    case "accounting_taxes": {
      const taxes = await getTaxRates(companyId);
      return result(["Kodi", "Emri", "Norma", "Zbatimi", "Aktive"], taxes.map(item => ({ Kodi: item.code, Emri: item.name, Norma: `${item.rate}%`, Zbatimi: item.taxType, Aktive: item.active === 1 ? "Po" : "Jo" })), [{ label: "Norma aktive", value: taxes.filter(item => item.active === 1).length }]);
    }
    case "accounting_journals": {
      const [entries, companyJournals] = await Promise.all([getJournalEntries(companyId), getJournals(companyId)]);
      const filtered = entries.filter(item => inRange(item.entryDate));
      return result(["Nr.", "Data", "Ditari", "Debi", "Kredi", "Statusi"], filtered.map(item => ({ "Nr.": item.entryNumber, Data: item.entryDate, Ditari: companyJournals.find(journal => journal.id === item.journalId)?.name || `#${item.journalId}`, Debi: item.totalDebit, Kredi: item.totalCredit, Statusi: item.status, __documentId: item.id, __documentType: "accounting-entry" })), [{ label: "Regjistrime", value: filtered.length }]);
    }
    case "partner_customer_situation_pdf":
    case "partner_customer_card_pdf":
    case "partner_customer_card_base_pdf": {
      const [customerRecords, invoiceRecords, paymentRecords] = await Promise.all([getCustomers(companyId), getSalesInvoices(companyId), getPayments(companyId)]);
      const customerMap = new Map(customerRecords.map(customer => [customer.id, customer]));
      const paymentTotals = buildReportInvoicePaymentTotals(invoiceRecords, paymentRecords, "INBOUND", "CUSTOMER");
      const balances = new Map<string, { balance: number; sourceDocumentId: number | null; sourceDocumentNumber: string }>();
      const keyFor = (customerId: number | null | undefined, customerName: string | null | undefined) => {
        if (customerId) return `id:${customerId}`;
        const normalized = normalizeDocumentNumber(customerName || "");
        return normalized ? `name:${normalized}` : "name:pa klient";
      };
      invoiceRecords.filter(invoice => inRange(invoice.date)).forEach(invoice => {
        const key = keyFor(invoice.customerId, invoice.customerName);
        const payment = resolveReportInvoicePayment(invoice, paymentTotals);
        const current = balances.get(key) ?? { balance: 0, sourceDocumentId: invoice.id, sourceDocumentNumber: invoice.docNumber };
        current.balance += payment.remaining;
        balances.set(key, current);
      });
      const invoiceReferences = new Set(invoiceRecords.map(invoice => normalizeDocumentNumber(invoice.docNumber)).filter(Boolean));
      paymentRecords.filter(payment => payment.paymentType === "INBOUND" && payment.partnerType === "CUSTOMER" && payment.status !== "CANCELLED" && !invoiceReferences.has(normalizeDocumentNumber(payment.reference || ""))).forEach(payment => {
        const key = keyFor(payment.partnerId, payment.partnerName);
        const current = balances.get(key) ?? { balance: 0, sourceDocumentId: null, sourceDocumentNumber: payment.reference || "" };
        current.balance -= Math.round(Number(payment.amount || 0) * Number(payment.exchangeRate || 1));
        balances.set(key, current);
      });
      const rows = customerRecords.map(item => {
        const aggregate = balances.get(keyFor(item.id, item.name));
        return { Kodi: item.code || `#${item.id}`, Emërtimi: item.name, NIPT: item.nipt || "—", Qyteti: item.city || "—", Telefoni: item.phone || "—", Balanca: aggregate?.balance || 0, __partnerName: item.name, __documentId: aggregate?.sourceDocumentId || item.id, __documentNumber: aggregate?.sourceDocumentNumber || "", __documentType: "sales-invoice" };
      });
      return result(["Kodi", "Emërtimi", "NIPT", "Qyteti", "Telefoni", "Balanca"], rows, [{ label: "Klientë", value: rows.length }, { label: "Balanca", value: rows.reduce((sum, row) => sum + Number(row.Balanca || 0), 0) }], { Titulli: reportKey === "partner_customer_situation_pdf" ? "Situacioni i klientit" : "Kartela e klientit", Mon: reportKey.endsWith("_base_pdf") ? "ALL" : "Të gjitha" });
    }
    case "partner_supplier_situation_pdf":
    case "partner_supplier_card_pdf":
    case "partner_supplier_card_base_pdf": {
      const [supplierRecords, invoiceRecords, paymentRecords] = await Promise.all([getSuppliers(companyId), getPurchaseInvoices(companyId), getPayments(companyId)]);
      const paymentTotals = buildReportInvoicePaymentTotals(invoiceRecords, paymentRecords, "OUTBOUND", "SUPPLIER");
      const balances = new Map<string, { balance: number; sourceDocumentId: number | null; sourceDocumentNumber: string }>();
      const keyFor = (supplierId: number | null | undefined, supplierName: string | null | undefined) => {
        if (supplierId) return `id:${supplierId}`;
        const normalized = normalizeDocumentNumber(supplierName || "");
        return normalized ? `name:${normalized}` : "name:pa furnitor";
      };
      invoiceRecords.filter(invoice => inRange(invoice.date)).forEach(invoice => {
        const key = keyFor(invoice.supplierId, invoice.supplierName);
        const payment = resolveReportInvoicePayment(invoice, paymentTotals);
        const current = balances.get(key) ?? { balance: 0, sourceDocumentId: invoice.id, sourceDocumentNumber: invoice.docNumber };
        current.balance += payment.remaining;
        balances.set(key, current);
      });
      const invoiceReferences = new Set(invoiceRecords.map(invoice => normalizeDocumentNumber(invoice.docNumber)).filter(Boolean));
      paymentRecords.filter(payment => payment.paymentType === "OUTBOUND" && payment.partnerType === "SUPPLIER" && payment.status !== "CANCELLED" && !invoiceReferences.has(normalizeDocumentNumber(payment.reference || ""))).forEach(payment => {
        const key = keyFor(payment.partnerId, payment.partnerName);
        const current = balances.get(key) ?? { balance: 0, sourceDocumentId: null, sourceDocumentNumber: payment.reference || "" };
        current.balance -= Math.round(Number(payment.amount || 0) * Number(payment.exchangeRate || 1));
        balances.set(key, current);
      });
      const rows = supplierRecords.map(item => {
        const aggregate = balances.get(keyFor(item.id, item.name));
        return { Kodi: item.code || `#${item.id}`, Emërtimi: item.name, NIPT: item.nipt || "—", Qyteti: item.city || "—", Telefoni: item.phone || "—", Balanca: aggregate?.balance || 0, __partnerName: item.name, __documentId: aggregate?.sourceDocumentId || item.id, __documentNumber: aggregate?.sourceDocumentNumber || "", __documentType: "purchase-invoice" };
      });
      return result(["Kodi", "Emërtimi", "NIPT", "Qyteti", "Telefoni", "Balanca"], rows, [{ label: "Furnitorë", value: rows.length }, { label: "Balanca", value: rows.reduce((sum, row) => sum + Number(row.Balanca || 0), 0) }], { Titulli: reportKey === "partner_supplier_situation_pdf" ? "Situacioni i furnitorit" : "Kartela e furnitorit", Mon: reportKey.endsWith("_base_pdf") ? "ALL" : "Të gjitha" });
    }
    case "partner_billing_payment_register_pdf": {
      const [sales, purchases, payments] = await Promise.all([getSalesInvoices(companyId), getPurchaseInvoices(companyId), getPayments(companyId)]);
      const rows = [
        ...sales.filter(item => inRange(item.date)).map(item => ({ Data: item.date, Dokumenti: item.docNumber, Partneri: item.customerName || "Pa klient", Lloji: "Faturë shitje", Debi: getReportInvoiceAmount(item), Kredi: 0, __partnerName: item.customerName || "Pa klient", __documentId: item.id, __documentType: "sales-invoice" })),
        ...purchases.filter(item => inRange(item.date)).map(item => ({ Data: item.date, Dokumenti: item.docNumber, Partneri: item.supplierName || "Pa furnitor", Lloji: "Faturë blerje", Debi: 0, Kredi: getReportInvoiceAmount(item), __partnerName: item.supplierName || "Pa furnitor", __documentId: item.id, __documentType: "purchase-invoice" })),
        ...payments.filter(item => item.status !== "CANCELLED" && inRange(item.paymentDate)).map(item => { const amountInBase = Math.round(Number(item.amount || 0) * Number(item.exchangeRate || 1)); return { Data: item.paymentDate, Dokumenti: item.paymentNumber, Partneri: item.partnerName || "Pa partner", Lloji: "Pagesë", Debi: item.paymentType === "OUTBOUND" ? amountInBase : 0, Kredi: item.paymentType === "INBOUND" ? amountInBase : 0, __partnerName: item.partnerName || "Pa partner", __documentId: item.id, __documentType: "accounting-payment" }; }),
      ];
      return result(["Data", "Dokumenti", "Partneri", "Lloji", "Debi", "Kredi"], rows, [{ label: "Dokumente", value: rows.length }, { label: "Debi", value: rows.reduce((sum, row) => sum + Number(row.Debi || 0), 0) }, { label: "Kredi", value: rows.reduce((sum, row) => sum + Number(row.Kredi || 0), 0) }]);
    }
    case "crm_pipeline": {
      const report = await getCrmReport(companyId);
      return result(["Faza", "Mundësi", "Vlera e pritur", "Vlera e peshuar"], report.pipeline.map(item => ({ Faza: item.stage, Mundësi: item.count, "Vlera e pritur": item.expectedRevenue, "Vlera e peshuar": item.weightedRevenue })), [{ label: "Vlera e hapur", value: report.metrics.openRevenue }, { label: "E fituar", value: report.metrics.wonRevenue }]);
    }
    case "crm_leads": {
      const leads = await getCrmLeads(companyId);
      return result(["Nr.", "Kontakti", "Kompania", "Tipi", "Faza", "Vlera", "Probabiliteti"], leads.map(item => ({ "Nr.": item.leadNumber, Kontakti: item.name, Kompania: item.companyName || "—", Tipi: item.leadType, Faza: item.stage, Vlera: item.expectedRevenue, Probabiliteti: `${item.probability}%`, __documentId: item.id, __documentType: "crm-lead" })), [{ label: "Lead-e", value: leads.filter(item => item.leadType === "LEAD").length }, { label: "Opportunity", value: leads.filter(item => item.leadType === "OPPORTUNITY").length }]);
    }
    case "crm_activities": {
      const [activities, leads] = await Promise.all([getCrmActivities(companyId), getCrmLeads(companyId)]);
      return result(["Afati", "Kontakti", "Lloji", "Subjekti", "Statusi"], activities.map(item => ({ Afati: item.dueDate, Kontakti: leads.find(lead => lead.id === item.leadId)?.name || `#${item.leadId}`, Lloji: item.activityType, Subjekti: item.subject, Statusi: item.status })), [{ label: "Planifikuara", value: activities.filter(item => item.status === "PLANNED").length }, { label: "Kryera", value: activities.filter(item => item.status === "DONE").length }]);
    }
    case "crm_won": {
      const leads = (await getCrmLeads(companyId)).filter(item => item.stage === "WON");
      return result(["Nr.", "Kontakti", "Kompania", "Vlera", "Probabiliteti"], leads.map(item => ({ "Nr.": item.leadNumber, Kontakti: item.name, Kompania: item.companyName || "—", Vlera: item.expectedRevenue, Probabiliteti: `${item.probability}%`, __documentId: item.id, __documentType: "crm-lead" })), [{ label: "Mundësi", value: leads.length }, { label: "Të ardhura", value: leads.reduce((sum, item) => sum + item.expectedRevenue, 0) }]);
    }
    case "bank_balances": {
      const accounts = await getBankAccounts(companyId);
      return result(["Llogaria", "Banka", "IBAN", "Lloji", "Balanca"], accounts.map(item => ({ Llogaria: item.accountName, Banka: item.bankName || "—", IBAN: item.iban || "—", Lloji: item.accountType, Balanca: item.currentBalance })), [{ label: "Balanca totale", value: accounts.reduce((sum, item) => sum + item.currentBalance, 0) }]);
    }
    case "bank_statements": {
      const [statements, accounts] = await Promise.all([getBankStatements(companyId), getBankAccounts(companyId)]);
      const filtered = statements.filter(item => inRange(item.dateTo));
      return result(["Nr. ekstraktit", "Llogaria", "Prej datës", "Deri më datën", "Balanca mbyllëse", "Statusi"], filtered.map(item => ({ "Nr. ekstraktit": item.statementNumber, Llogaria: accounts.find(account => account.id === item.bankAccountId)?.accountName || `#${item.bankAccountId}`, "Prej datës": item.dateFrom, "Deri më datën": item.dateTo, "Balanca mbyllëse": item.closingBalance, Statusi: item.status, __documentId: item.id, __documentType: "bank-statement" })), [{ label: "Ekstrakte", value: filtered.length }, { label: "Të hapura", value: filtered.filter(item => item.status === "DRAFT").length }]);
    }
    case "bank_transactions": {
      const transactions = (await getBankTransactions(companyId)).filter(item => inRange(item.transactionDate));
      return result(["Data", "Përshkrimi", "Lloji", "Vlera", "Statusi"], transactions.map(item => ({ Data: item.transactionDate, Përshkrimi: item.description, Lloji: item.transactionType, Vlera: item.amount, Statusi: item.status, __documentId: item.id, __documentType: "bank-transaction" })), [{ label: "Hyrje", value: transactions.filter(item => item.transactionType === "CREDIT").reduce((sum, item) => sum + item.amount, 0) }, { label: "Dalje", value: transactions.filter(item => item.transactionType === "DEBIT").reduce((sum, item) => sum + item.amount, 0) }]);
    }
    case "bank_reconciliation": {
      const transactions = (await getBankTransactions(companyId)).filter(item => item.status === "UNRECONCILED");
      return result(["Data", "Përshkrimi", "Lloji", "Vlera", "Referenca"], transactions.map(item => ({ Data: item.transactionDate, Përshkrimi: item.description, Lloji: item.transactionType, Vlera: item.amount, Referenca: item.reference || "—" })), [{ label: "Për pajtim", value: transactions.length }]);
    }
    case "bank_transfers": {
      const [transfers, accounts] = await Promise.all([getBankTransfers(companyId), getBankAccounts(companyId)]);
      const filtered = transfers.filter(item => inRange(item.transferDate));
      return result(["Nr.", "Data", "Burim", "Destinacion", "Vlera", "Statusi"], filtered.map(item => ({ "Nr.": item.transferNumber, Data: item.transferDate, Burim: accounts.find(account => account.id === item.sourceBankAccountId)?.accountName || `#${item.sourceBankAccountId}`, Destinacion: accounts.find(account => account.id === item.destinationBankAccountId)?.accountName || `#${item.destinationBankAccountId}`, Vlera: item.amount, Statusi: item.status, __documentId: item.id, __documentType: "bank-transfer" })), [{ label: "Transferta", value: filtered.length }, { label: "Vlera", value: filtered.reduce((sum, item) => sum + item.amount, 0) }]);
    }
    default: throw new Error("Raporti i kërkuar nuk ekziston");
  }
}

export async function getAgents(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(agents)
    .where(eq(agents.companyId, companyId));
}

export async function createAgent(data: { companyId: number; code?: string; name: string; phone?: string; licenseNumber?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(agents).values(data);
  const [created] = await db.select().from(agents).where(eq(agents.id, Number(result.insertId))).limit(1);
  if (!created) throw new Error("Shoferi i krijuar nuk u gjet");
  return created;
}

export async function getVehicles(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vehicles).where(eq(vehicles.companyId, companyId));
}

export async function createVehicle(data: { companyId: number; plateNumber: string; vehicleType?: string; makeModel?: string; capacityKg?: number; driverId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(vehicles).values(data);
  const [created] = await db.select().from(vehicles).where(eq(vehicles.id, Number(result.insertId))).limit(1);
  if (!created) throw new Error("Mjeti i krijuar nuk u gjet");
  return created;
}

async function ensureCargoLoadForLoadedPurchaseOrder(db: any, order: any) {
  const existing = await db.select({ id: cargoLoads.id }).from(cargoLoads).where(eq(cargoLoads.companyId, order.companyId));
  const alreadyLinked = existing.length > 0 ? await db.select({ loadNumber: cargoLoads.loadNumber }).from(cargoLoads).where(eq(cargoLoads.companyId, order.companyId)) : [];
  if (!shouldCreateCargoLoad(alreadyLinked.map((load: { loadNumber: string }) => load.loadNumber), order.docNumber)) return;
  const items = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, order.id));
  const weightKg = calculatePurchaseOrderCargoWeightKg(items);
  await db.insert(cargoLoads).values({
    companyId: order.companyId,
    loadNumber: order.docNumber,
    loadDate: order.orderDate,
    customerName: order.supplierName || undefined,
    purchaseOrderId: order.id,
    destination: order.customerReference || undefined,
    weightKg,
    status: "ASSIGNED",
    notes: `Burim: Porosia e blerjes ${order.docNumber}${order.notes ? ` · ${order.notes}` : ""}`,
  });
}

export async function getCargoLoads(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  const loadedOrders = await db.select().from(purchaseOrders).where(eq(purchaseOrders.companyId, companyId));
  for (const order of loadedOrders.filter(item => item.operationalStatus === "LOADED")) {
    await ensureCargoLoadForLoadedPurchaseOrder(db, order);
  }
  return db.select().from(cargoLoads).where(eq(cargoLoads.companyId, companyId));
}

export async function getCargoLoadById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(cargoLoads).where(eq(cargoLoads.id, id)).limit(1))[0];
}

export async function getCargoLoadDocuments(cargoLoadId: number, companyId: number) {
  const db = await getDb();
  if (!db) return [];
  const load = (await db.select().from(cargoLoads).where(and(eq(cargoLoads.id, cargoLoadId), eq(cargoLoads.companyId, companyId))).limit(1))[0];
  if (!load) return [];
  const ownDocuments = await db.select().from(cargoLoadDocuments)
    .where(and(eq(cargoLoadDocuments.cargoLoadId, cargoLoadId), eq(cargoLoadDocuments.companyId, companyId)))
    .orderBy(desc(cargoLoadDocuments.createdAt));
  if (!load.purchaseOrderId) return ownDocuments.map(file => ({ ...file, source: "NGARKESË" as const }));
  const orderDocuments = await db.select().from(purchaseOrderAttachments)
    .where(eq(purchaseOrderAttachments.purchaseOrderId, load.purchaseOrderId))
    .orderBy(desc(purchaseOrderAttachments.createdAt));
  return [
    ...ownDocuments.map(file => ({ ...file, source: "NGARKESË" as const })),
    ...orderDocuments.map(file => ({ ...file, documentType: "POROSI / FATURË", companyId, cargoLoadId, purchaseOrderId: load.purchaseOrderId, source: "POROSI" as const })),
  ];
}

export async function addCargoLoadDocument(input: { companyId: number; cargoLoadId: number; purchaseOrderId?: number; purchaseInvoiceId?: number; salesOrderId?: number; salesInvoiceId?: number; documentType: string; fileName: string; mimeType?: string; fileSize: number; bytes: Buffer; uploadedBy: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const stored = await storagePut(`cargo-loads/${input.companyId}/${input.cargoLoadId}/${Date.now()}-${safeName}`, input.bytes, input.mimeType || "application/octet-stream");
  const result = await db.insert(cargoLoadDocuments).values({
    companyId: input.companyId,
    cargoLoadId: input.cargoLoadId,
    purchaseOrderId: input.purchaseOrderId,
    purchaseInvoiceId: input.purchaseInvoiceId,
    salesOrderId: input.salesOrderId,
    salesInvoiceId: input.salesInvoiceId,
    documentType: input.documentType,
    fileName: input.fileName,
    fileKey: stored.key,
    fileUrl: stored.url,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
    uploadedBy: input.uploadedBy,
  });
  return { id: Number((result as unknown as [{ insertId: number }])[0].insertId), ...stored };
}

export async function createCargoLoad(data: { companyId: number; loadNumber: string; loadDate: Date; customerId?: number; customerName?: string; driverId?: number; vehicleId?: number; purchaseOrderId?: number; origin?: string; destination?: string; weightKg?: number; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select({ loadNumber: cargoLoads.loadNumber }).from(cargoLoads).where(eq(cargoLoads.companyId, data.companyId));
  if (!shouldCreateCargoLoad(existing.map((load: { loadNumber: string }) => load.loadNumber), data.loadNumber)) throw new Error("Ekziston tashmë një ngarkesë me këtë numër në kompaninë aktive.");
  const [result] = await db.insert(cargoLoads).values(data);
  const [created] = await db.select().from(cargoLoads).where(eq(cargoLoads.id, Number(result.insertId))).limit(1);
  if (!created) throw new Error("Ngarkesa e krijuar nuk u gjet");
  return created;
}

export async function cancelCargoLoad(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [load] = await db.select().from(cargoLoads).where(eq(cargoLoads.id, id)).limit(1);
  if (!load) throw new Error("Ngarkesa nuk u gjet");
  if (load.status === "CANCELLED") return { success: true, alreadyCancelled: true };
  if (!canCancelCargoLoad(load.status)) throw new Error("Ngarkesa e dorëzuar nuk mund të anulohet. Krijo dokument korrigjues.");
  await db.update(cargoLoads).set({ status: "CANCELLED" }).where(eq(cargoLoads.id, id));
  await auditDocumentAction(load.companyId, userId, "CANCEL", "CARGO_LOAD", id, `U anulua ngarkesa ${load.loadNumber}`);
  return { success: true };
}

export async function deleteCargoLoadDraft(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [load] = await db.select().from(cargoLoads).where(eq(cargoLoads.id, id)).limit(1);
  if (!load) throw new Error("Ngarkesa nuk u gjet");
  if (!canDeleteCargoLoadDraft(load.status)) throw new Error("Vetëm ngarkesat Draft mund të fshihen.");
  await auditDocumentAction(load.companyId, userId, "DELETE", "CARGO_LOAD", id, `U fshi ngarkesa Draft ${load.loadNumber}`);
  await db.delete(cargoLoads).where(eq(cargoLoads.id, id));
  return { success: true };
}

const DEFAULT_PAYROLL_TAX_BRACKETS: PayrollTaxBracket[] = [
  { upto: 80, rateBp: 0 },
  { upto: 250, rateBp: 400 },
  { upto: 450, rateBp: 800 },
  { upto: null, rateBp: 1000 },
];

export function getPayrollTaxBrackets(value?: string | null): PayrollTaxBracket[] {
  if (!value) return DEFAULT_PAYROLL_TAX_BRACKETS;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed) && parsed.every(item => typeof (item as any)?.rateBp === "number" && (typeof (item as any)?.upto === "number" || (item as any)?.upto === null))) {
      return parsed as PayrollTaxBracket[];
    }
    if (parsed && typeof parsed === "object") {
      const settings = parsed as Record<string, unknown>;
      const taxEnabled = settings.taxEnabled !== false;
      const hasTaxConfiguration = ["taxBand1", "taxBand2", "taxBand3", "taxOverRate", "taxEnabled"].some(key => key in settings);
      const taxOverRate = Number(settings.taxOverRate);
      if (!taxEnabled || (Number.isFinite(taxOverRate) && taxOverRate === 0)) return [{ upto: null, rateBp: 0 }];
      if (hasTaxConfiguration) {
        const band1 = Number(settings.taxBand1);
        const band2 = Number(settings.taxBand2);
        const band3 = Number(settings.taxBand3);
        const overRate = Number.isFinite(taxOverRate) ? taxOverRate : 10;
        if ([band1, band2, band3, overRate].every(item => Number.isFinite(item) && item >= 0) && band1 <= band2 && band2 <= band3) {
          return [
            { upto: band1, rateBp: 0 },
            { upto: band2, rateBp: 400 },
            { upto: band3, rateBp: 800 },
            { upto: null, rateBp: Math.round(overRate * 100) },
          ];
        }
      }
    }
  } catch { /* uses the configured defaults */ }
  return DEFAULT_PAYROLL_TAX_BRACKETS;
}

export async function getPayrollEmployees(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payrollEmployees).where(eq(payrollEmployees.companyId, companyId));
}

export async function createPayrollEmployee(data: typeof payrollEmployees.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.employeeNumber) {
    const existing = await db.select().from(payrollEmployees).where(and(eq(payrollEmployees.companyId, data.companyId), eq(payrollEmployees.employeeNumber, data.employeeNumber))).limit(1);
    if (existing.length > 0) {
      throw new Error(`Numri i listëpagesës '${data.employeeNumber}' ekziston tashmë në regjistër. Nuk lejohen dublikata.`);
    }
  }
  const [result] = await db.insert(payrollEmployees).values(data);
  const [employee] = await db.select().from(payrollEmployees).where(eq(payrollEmployees.id, Number(result.insertId))).limit(1);
  if (!employee) throw new Error("Punonjësi nuk u gjet pas ruajtjes.");
  return employee;
}

export async function createPayrollEmployeesBulk(companyId: number, rows: Array<{ employeeNumber: string; firstName: string; lastName?: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const uniqueRows = Array.from(new Map(rows
    .filter(row => row.employeeNumber.trim() && row.firstName.trim())
    .map(row => [row.employeeNumber.trim(), { employeeNumber: row.employeeNumber.trim(), firstName: row.firstName.trim(), lastName: row.lastName?.trim() || null }])).values());
  if (!uniqueRows.length) return [];
  const numbers = uniqueRows.map(row => row.employeeNumber);
  const existing = await db.select({ employeeNumber: payrollEmployees.employeeNumber }).from(payrollEmployees).where(and(eq(payrollEmployees.companyId, companyId), inArray(payrollEmployees.employeeNumber, numbers)));
  const existingNumbers = new Set(existing.map(row => row.employeeNumber));
  const missingRows = uniqueRows.filter(row => !existingNumbers.has(row.employeeNumber));
  if (missingRows.length) await db.insert(payrollEmployees).values(missingRows.map(row => ({ companyId, ...row })));
  return db.select().from(payrollEmployees).where(and(eq(payrollEmployees.companyId, companyId), inArray(payrollEmployees.employeeNumber, numbers)));
}

export async function updatePayrollEmployeePayment(id: number, data: {
  regularRateCents: number;
  overtimeRateCents: number;
  baseSalaryCents: number;
  advanceCents: number;
  dailyRateCents: number;
  paymentMethod: "BANK" | "CASH";
  bankName?: string;
  bankAccount?: string;
  isForeign: number;
  shiftCode: "A" | "B" | "C";
  active: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(payrollEmployees).set({
    regularRateCents: data.regularRateCents,
    overtimeRateCents: data.overtimeRateCents,
    baseSalaryCents: data.baseSalaryCents,
    advanceCents: data.advanceCents,
    dailyRateCents: data.dailyRateCents,
    paymentMethod: data.paymentMethod,
    bankName: data.bankName || null,
    bankAccount: data.bankAccount || null,
    isForeign: data.isForeign,
    shiftCode: data.shiftCode,
    active: data.active,
  }).where(eq(payrollEmployees.id, id));
  const [employee] = await db.select().from(payrollEmployees).where(eq(payrollEmployees.id, id)).limit(1);
  if (!employee) throw new Error("Punonjësi nuk u gjet pas përditësimit.");
  return employee;
}

export async function updatePayrollEmployeeImportData(companyId: number, rows: Array<{
  id: number;
  regularRateCents: number;
  overtimeRateCents: number;
  baseSalaryCents: number;
  bankPaymentCents: number;
  cashPaymentCents: number;
  paymentMethod: "BANK" | "CASH";
  isForeign: number;
  dailyRateCents: number;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const cleanRows = rows.filter(row => Number.isInteger(row.id) && row.id > 0);
  if (!cleanRows.length) return { updated: 0 };
  const ids = Array.from(new Set(cleanRows.map(row => row.id)));
  const existing = await db.select({ id: payrollEmployees.id }).from(payrollEmployees).where(and(eq(payrollEmployees.companyId, companyId), inArray(payrollEmployees.id, ids)));
  if (existing.length !== ids.length) throw new Error("Importi përmban punonjës që nuk i përkasin kompanisë aktive.");
  const uniqueRows = Array.from(new Map(cleanRows.map(row => [row.id, row])).values());
  const columns = ["regularRateCents", "overtimeRateCents", "baseSalaryCents", "bankPaymentCents", "cashPaymentCents", "paymentMethod", "isForeign", "dailyRateCents"] as const;
  const safeInteger = (value: number, allowNegative = false) => {
    if (!Number.isSafeInteger(value) || (!allowNegative && value < 0)) throw new Error("Importi përmban vlerë monetare të pavlefshme.");
    return String(value);
  };
  const setClauses = columns.map(column => {
    const cases = uniqueRows.map(row => {
      const value = column === "paymentMethod" ? JSON.stringify(row.paymentMethod) : safeInteger(row[column], column === "cashPaymentCents");
      return `WHEN ${safeInteger(row.id)} THEN ${value}`;
    }).join(" ");
    return `\`${column}\` = CASE \`id\` ${cases} ELSE \`${column}\` END`;
  }).join(", ");
  const idsSql = uniqueRows.map(row => safeInteger(row.id)).join(",");
  await db.execute(sql.raw(`UPDATE payrollEmployees SET ${setClauses} WHERE companyId = ${safeInteger(companyId)} AND id IN (${idsSql})`));
  return { updated: uniqueRows.length };
}

export async function getPayrollDeviceMappings(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payrollDeviceMappings).where(eq(payrollDeviceMappings.companyId, companyId));
}

export async function savePayrollDeviceMapping(data: typeof payrollDeviceMappings.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [existing] = await db.select().from(payrollDeviceMappings).where(and(eq(payrollDeviceMappings.companyId, data.companyId), eq(payrollDeviceMappings.deviceId, data.deviceId))).limit(1);
  if (existing) {
    await db.update(payrollDeviceMappings).set({ payrollEmployeeId: data.payrollEmployeeId, active: data.active ?? 1 }).where(eq(payrollDeviceMappings.id, existing.id));
    return { ...existing, payrollEmployeeId: data.payrollEmployeeId, active: data.active ?? 1 };
  }
  const [result] = await db.insert(payrollDeviceMappings).values(data);
  const [mapping] = await db.select().from(payrollDeviceMappings).where(eq(payrollDeviceMappings.id, Number(result.insertId))).limit(1);
  if (!mapping) throw new Error("Lidhja e pajisjes nuk u ruajt.");
  return mapping;
}

export async function getPayrollSettings(companyId: number) {
  const db = await getDb();
  if (!db) return null;
  const [settings] = await db.select().from(payrollSettings).where(eq(payrollSettings.companyId, companyId)).orderBy(desc(payrollSettings.id)).limit(1);
  return settings || null;
}

export async function savePayrollSettings(data: typeof payrollSettings.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [existing] = await db.select().from(payrollSettings).where(eq(payrollSettings.companyId, data.companyId)).orderBy(desc(payrollSettings.id)).limit(1);
  if (existing) {
    await db.update(payrollSettings).set({ paramsJson: data.paramsJson }).where(eq(payrollSettings.id, existing.id));
    return { ...existing, paramsJson: data.paramsJson };
  }
  const [result] = await db.insert(payrollSettings).values(data);
  const [settings] = await db.select().from(payrollSettings).where(eq(payrollSettings.id, Number(result.insertId))).limit(1);
  if (!settings) throw new Error("Parametrat e pagave nuk u ruajtën.");
  return settings;
}

export async function getPayrollPeriods(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payrollPeriods).where(eq(payrollPeriods.companyId, companyId));
}

export async function getCreditNotes(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(creditNotes).where(eq(creditNotes.companyId, companyId)).orderBy(desc(creditNotes.noteDate));
}

export async function createCreditNote(data: typeof creditNotes.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(creditNotes).values(data);
  const [note] = await db.select().from(creditNotes).where(and(eq(creditNotes.companyId, data.companyId), eq(creditNotes.creditNoteNumber, data.creditNoteNumber))).limit(1);
  if (!note) throw new Error("Nota e kreditit nuk u ruajt.");
  return note;
}

export async function setCreditNoteStatus(companyId: number, id: number, status: "POSTED" | "CANCELLED") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [note] = await db.select().from(creditNotes).where(and(eq(creditNotes.id, id), eq(creditNotes.companyId, companyId))).limit(1);
  if (!note) throw new Error("Nota e kreditit nuk u gjet.");
  if (!canSetCreditNoteStatus(note.status, status)) throw new Error("Vetëm notat Draft mund të postohen ose anulohen.");
  await db.update(creditNotes).set({ status }).where(eq(creditNotes.id, id));
  const [updated] = await db.select().from(creditNotes).where(eq(creditNotes.id, id)).limit(1);
  if (!updated) throw new Error("Statusi i notës së kreditit nuk u përditësua.");
  return updated;
}

export async function deleteCreditNoteDraft(companyId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [note] = await db.select().from(creditNotes).where(and(eq(creditNotes.id, id), eq(creditNotes.companyId, companyId))).limit(1);
  if (!note) throw new Error("Nota e kreditit nuk u gjet.");
  if (!canDeleteCreditNote(note.status)) throw new Error("Vetëm Nota e Kreditit Draft mund të fshihet.");
  await db.delete(creditNotes).where(and(eq(creditNotes.id, id), eq(creditNotes.companyId, companyId)));
  return note;
}

export async function getPayrollPeriodHistory(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: payrollPeriods.id,
    month: payrollPeriods.month,
    year: payrollPeriods.year,
    status: payrollPeriods.status,
    generatedAt: payrollPeriods.generatedAt,
    createdAt: payrollPeriods.createdAt,
    employeeCount: count(payrollEntries.id),
  }).from(payrollPeriods).leftJoin(payrollEntries, eq(payrollEntries.payrollPeriodId, payrollPeriods.id)).where(eq(payrollPeriods.companyId, companyId)).groupBy(payrollPeriods.id, payrollPeriods.month, payrollPeriods.year, payrollPeriods.status, payrollPeriods.generatedAt, payrollPeriods.createdAt).orderBy(desc(payrollPeriods.year), desc(payrollPeriods.month));
}

export async function getPayrollBackup(companyId: number) {
  const db = await getDb();
  if (!db) return { employees: [], periods: [], attendance: [], entries: [], periodBonuses: [], leaveAbsences: [], settings: [], mappings: [] };
  const [employees, periods, leaveAbsences, settings, mappings] = await Promise.all([
    db.select().from(payrollEmployees).where(eq(payrollEmployees.companyId, companyId)),
    db.select().from(payrollPeriods).where(eq(payrollPeriods.companyId, companyId)),
    db.select().from(payrollLeaveAbsences).where(eq(payrollLeaveAbsences.companyId, companyId)),
    db.select().from(payrollSettings).where(eq(payrollSettings.companyId, companyId)),
    db.select().from(payrollDeviceMappings).where(eq(payrollDeviceMappings.companyId, companyId)),
  ]);
  const periodIds = periods.map(period => period.id);
  const [attendance, entries, periodBonuses] = periodIds.length ? await Promise.all([
    db.select().from(payrollAttendance).where(inArray(payrollAttendance.payrollPeriodId, periodIds)),
    db.select().from(payrollEntries).where(inArray(payrollEntries.payrollPeriodId, periodIds)),
    db.select().from(payrollPeriodBonuses).where(inArray(payrollPeriodBonuses.payrollPeriodId, periodIds)),
  ]) : [[], [], []];
  return { employees, periods, attendance, entries, periodBonuses, leaveAbsences, settings, mappings };
}

export async function restorePayrollBackup(companyId: number, payload: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!Array.isArray(payload?.employees) || !Array.isArray(payload?.periods) || !Array.isArray(payload?.attendance) || !Array.isArray(payload?.entries)) throw new Error("Backup-i nuk ka strukturë të vlefshme.");
  return db.transaction(async tx => {
    const oldPeriods = await tx.select({ id: payrollPeriods.id }).from(payrollPeriods).where(eq(payrollPeriods.companyId, companyId));
    const oldEmployees = await tx.select({ id: payrollEmployees.id }).from(payrollEmployees).where(eq(payrollEmployees.companyId, companyId));
    const oldPeriodIds = oldPeriods.map(row => row.id);
    const oldEmployeeIds = oldEmployees.map(row => row.id);
    if (oldPeriodIds.length) {
      await tx.delete(payrollPeriodBonuses).where(inArray(payrollPeriodBonuses.payrollPeriodId, oldPeriodIds));
      await tx.delete(payrollAttendance).where(inArray(payrollAttendance.payrollPeriodId, oldPeriodIds));
      await tx.delete(payrollEntries).where(inArray(payrollEntries.payrollPeriodId, oldPeriodIds));
    }
    await tx.delete(payrollDeviceMappings).where(eq(payrollDeviceMappings.companyId, companyId));
    await tx.delete(payrollLeaveAbsences).where(eq(payrollLeaveAbsences.companyId, companyId));
    await tx.delete(payrollSettings).where(eq(payrollSettings.companyId, companyId));
    await tx.delete(payrollPeriods).where(eq(payrollPeriods.companyId, companyId));
    await tx.delete(payrollEmployees).where(eq(payrollEmployees.companyId, companyId));
    const employeeMap = new Map<number, number>();
    for (const item of payload.employees) {
      const { id, companyId: _companyId, createdAt, updatedAt, ...values } = item;
      const [result] = await tx.insert(payrollEmployees).values({ ...values, companyId });
      employeeMap.set(Number(id), Number(result.insertId));
    }
    const periodMap = new Map<number, number>();
    for (const item of payload.periods) {
      const { id, companyId: _companyId, createdAt, updatedAt, ...values } = item;
      const [result] = await tx.insert(payrollPeriods).values({ ...values, companyId });
      periodMap.set(Number(id), Number(result.insertId));
    }
    for (const item of payload.periodBonuses || []) {
      const { id, payrollPeriodId, payrollEmployeeId, createdAt, updatedAt, ...values } = item;
      const periodId = periodMap.get(Number(payrollPeriodId)); const employeeId = employeeMap.get(Number(payrollEmployeeId));
      if (periodId && employeeId) await tx.insert(payrollPeriodBonuses).values({ ...values, payrollPeriodId: periodId, payrollEmployeeId: employeeId });
    }
    for (const item of payload.attendance) {
      const { id, payrollPeriodId, payrollEmployeeId, createdAt, updatedAt, ...values } = item;
      const periodId = periodMap.get(Number(payrollPeriodId)); const employeeId = employeeMap.get(Number(payrollEmployeeId));
      if (periodId && employeeId) await tx.insert(payrollAttendance).values({ ...values, payrollPeriodId: periodId, payrollEmployeeId: employeeId });
    }
    for (const item of payload.entries) {
      const { id, payrollPeriodId, payrollEmployeeId, createdAt, updatedAt, ...values } = item;
      const periodId = periodMap.get(Number(payrollPeriodId)); const employeeId = employeeMap.get(Number(payrollEmployeeId));
      if (periodId && employeeId) await tx.insert(payrollEntries).values({ ...values, payrollPeriodId: periodId, payrollEmployeeId: employeeId });
    }
    for (const item of payload.leaveAbsences || []) { const { id, companyId: _companyId, payrollEmployeeId, createdAt, updatedAt, ...values } = item; const employeeId = employeeMap.get(Number(payrollEmployeeId)); if (employeeId) await tx.insert(payrollLeaveAbsences).values({ ...values, companyId, payrollEmployeeId: employeeId }); }
    for (const item of payload.settings || []) { const { id, companyId: _companyId, createdAt, updatedAt, ...values } = item; await tx.insert(payrollSettings).values({ ...values, companyId }); }
    for (const item of payload.mappings || []) { const { id, companyId: _companyId, payrollEmployeeId, createdAt, updatedAt, ...values } = item; const employeeId = employeeMap.get(Number(payrollEmployeeId)); if (employeeId) await tx.insert(payrollDeviceMappings).values({ ...values, companyId, payrollEmployeeId: employeeId }); }
    return { employees: employeeMap.size, periods: periodMap.size, attendance: payload.attendance.length, entries: payload.entries.length };
  });
}

export async function getPayrollPeriodAccess(payrollPeriodId: number) {
  const database = await getDb();
  if (!database) return null;
  const [period] = await database.select({ id: payrollPeriods.id, companyId: payrollPeriods.companyId, status: payrollPeriods.status }).from(payrollPeriods).where(eq(payrollPeriods.id, payrollPeriodId)).limit(1);
  return period ?? null;
}

export async function createPayrollPeriod(data: typeof payrollPeriods.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select({ id: payrollPeriods.id }).from(payrollPeriods).where(eq(payrollPeriods.companyId, data.companyId)).limit(50);
  if (existing.length) {
    const periods = await db.select().from(payrollPeriods).where(eq(payrollPeriods.companyId, data.companyId));
    if (periods.some(period => period.year === data.year && period.month === data.month)) throw new Error("Periudha e pagave ekziston tashmë për këtë kompani.");
  }
  const [result] = await db.insert(payrollPeriods).values(data);
  const [period] = await db.select().from(payrollPeriods).where(eq(payrollPeriods.id, Number(result.insertId))).limit(1);
  if (!period) throw new Error("Periudha e pagave nuk u gjet pas ruajtjes.");
  return period;
}

export async function getPayrollEntries(payrollPeriodId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payrollEntries).where(eq(payrollEntries.payrollPeriodId, payrollPeriodId));
}

export async function getPayrollContributionHistory(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    payrollPeriodId: payrollEntries.payrollPeriodId,
    payrollEmployeeId: payrollEntries.payrollEmployeeId,
    employeeNumber: payrollEntries.employeeNumber,
    employeeName: payrollEntries.employeeName,
    grossCents: payrollEntries.grossCents,
    socialEmployeeCents: payrollEntries.socialEmployeeCents,
    socialEmployerCents: payrollEntries.socialEmployerCents,
    taxCents: payrollEntries.taxCents,
    netCents: payrollEntries.netCents,
    payableCents: payrollEntries.payableCents,
    month: payrollPeriods.month,
    year: payrollPeriods.year,
  }).from(payrollEntries).innerJoin(payrollPeriods, eq(payrollEntries.payrollPeriodId, payrollPeriods.id)).where(eq(payrollPeriods.companyId, companyId)).orderBy(desc(payrollPeriods.year), desc(payrollPeriods.month), payrollEntries.employeeName);
}

export async function getPayrollAttendance(payrollPeriodId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payrollAttendance).where(eq(payrollAttendance.payrollPeriodId, payrollPeriodId));
}

export async function getPayrollPeriodBonuses(payrollPeriodId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payrollPeriodBonuses).where(eq(payrollPeriodBonuses.payrollPeriodId, payrollPeriodId));
}

export async function upsertPayrollPeriodBonuses(payrollPeriodId: number, rows: Array<{ payrollEmployeeId: number; bonusCents: number }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [period] = await db.select({ id: payrollPeriods.id, companyId: payrollPeriods.companyId, status: payrollPeriods.status }).from(payrollPeriods).where(eq(payrollPeriods.id, payrollPeriodId)).limit(1);
  if (!period) throw new Error("Periudha e pagave nuk u gjet.");
  if (period.status === "POSTED") throw new Error("Periudha e postuar nuk mund të ndryshohet.");
  const uniqueRows = Array.from(new Map(rows.map(row => [row.payrollEmployeeId, row])).values());
  if (!uniqueRows.length) return { saved: 0 };
  if (uniqueRows.some(row => !Number.isInteger(row.payrollEmployeeId) || row.payrollEmployeeId <= 0 || !Number.isSafeInteger(row.bonusCents) || row.bonusCents < 0)) throw new Error("Bonusi duhet të jetë numër i plotë jo negativ në Lek.");
  const employeeIds = uniqueRows.map(row => row.payrollEmployeeId);
  const employees = await db.select({ id: payrollEmployees.id }).from(payrollEmployees).where(and(eq(payrollEmployees.companyId, period.companyId), inArray(payrollEmployees.id, employeeIds)));
  if (employees.length !== employeeIds.length) throw new Error("Bonusi përmban punonjës që nuk i përkasin kompanisë aktive.");
  await db.insert(payrollPeriodBonuses).values(uniqueRows.map(row => ({ payrollPeriodId, payrollEmployeeId: row.payrollEmployeeId, bonusCents: row.bonusCents }))).onDuplicateKeyUpdate({
    set: {
      bonusCents: sql`VALUES(${payrollPeriodBonuses.bonusCents})`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    },
  });
  return { saved: uniqueRows.length };
}

export async function getPayrollLeaveAbsences(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payrollLeaveAbsences).where(eq(payrollLeaveAbsences.companyId, companyId)).orderBy(desc(payrollLeaveAbsences.startDate), desc(payrollLeaveAbsences.createdAt));
}

export async function createPayrollLeaveAbsence(data: typeof payrollLeaveAbsences.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(payrollLeaveAbsences).values(data);
  const [row] = await db.select().from(payrollLeaveAbsences).where(eq(payrollLeaveAbsences.id, Number(result.insertId))).limit(1);
  if (!row) throw new Error("Leja ose mungesa nuk u gjet pas ruajtjes.");
  return row;
}

export async function createPayrollAttendance(data: typeof payrollAttendance.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(payrollAttendance).values(data);
  const [attendance] = await db.select().from(payrollAttendance).where(eq(payrollAttendance.id, Number(result.insertId))).limit(1);
  if (!attendance) throw new Error("Prezença nuk u gjet pas ruajtjes.");
  return attendance;
}

export async function createPayrollAttendanceBulk(rows: Array<typeof payrollAttendance.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!rows.length) return { inserted: 0 };
  await db.insert(payrollAttendance).values(rows);
  return { inserted: rows.length };
}

export async function upsertPayrollAttendanceBulk(rows: Array<typeof payrollAttendance.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!rows.length) return { saved: 0 };

  await db.insert(payrollAttendance).values(rows).onDuplicateKeyUpdate({
    set: {
      attendanceCode: sql`VALUES(${payrollAttendance.attendanceCode})`,
      normalMinutes: sql`VALUES(${payrollAttendance.normalMinutes})`,
      overtimeMinutes: sql`VALUES(${payrollAttendance.overtimeMinutes})`,
      note: sql`VALUES(${payrollAttendance.note})`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    },
  });
  return { saved: rows.length };
}

export async function clearPayrollManualAttendance(payrollPeriodId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [period] = await db.select().from(payrollPeriods).where(eq(payrollPeriods.id, payrollPeriodId)).limit(1);
  if (!period) throw new Error("Periudha e pagave nuk u gjet.");
  if (period.status === "POSTED") throw new Error("Periudha e postuar nuk mund të pastrohet.");
  const result = await db.delete(payrollAttendance).where(and(eq(payrollAttendance.payrollPeriodId, payrollPeriodId), eq(payrollAttendance.note, "Listëprezencë manuale")));
  return { cleared: Number((result as unknown as { affectedRows?: number }).affectedRows || 0) };
}

export async function generatePayrollPeriod(payrollPeriodId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [period] = await db.select().from(payrollPeriods).where(eq(payrollPeriods.id, payrollPeriodId)).limit(1);
  if (!period) throw new Error("Periudha e pagave nuk u gjet.");
  if (period.status === "POSTED") throw new Error("Periudha e postuar nuk mund të rigjenerohet.");
  const employees = (await getPayrollEmployees(period.companyId)).filter(employee => employee.active === 1);
  const attendance = await db.select().from(payrollAttendance).where(eq(payrollAttendance.payrollPeriodId, payrollPeriodId));
  if (!employees.length) throw new Error("Nuk ka punonjës aktivë. Shto punonjësit përpara krijimit të Pagave.");
  if (!attendance.length) throw new Error("Nuk ka Listëprezencë për këtë periudhë. Ngarko Logs ose plotëso prezencën përpara krijimit të Pagave.");
  const [settings] = await db.select().from(payrollSettings).where(eq(payrollSettings.companyId, period.companyId)).orderBy(desc(payrollSettings.id)).limit(1);
  const bonusSettings = parsePayrollBonusSettings(settings?.paramsJson);
  const [storedBonuses, previousEntries] = await Promise.all([
    db.select().from(payrollPeriodBonuses).where(eq(payrollPeriodBonuses.payrollPeriodId, payrollPeriodId)),
    db.select().from(payrollEntries).where(eq(payrollEntries.payrollPeriodId, payrollPeriodId)),
  ]);
  const bonusByEmployee = new Map<number, number>(storedBonuses.map(row => [row.payrollEmployeeId, row.bonusCents]));
  // Backward compatibility for a period already generated before bonuses became period-specific.
  if (!storedBonuses.length) previousEntries.forEach(entry => bonusByEmployee.set(entry.payrollEmployeeId, Math.max(0, entry.bonusCents || 0)));
  const brackets = getPayrollTaxBrackets(period.taxRulesJson || settings?.paramsJson);
  await db.delete(payrollEntries).where(eq(payrollEntries.payrollPeriodId, payrollPeriodId));
  const entries = employees.map(employee => {
    const rows = attendance.filter(row => row.payrollEmployeeId === employee.id);
    const normalMinutes = rows.reduce((total, row) => total + row.normalMinutes, 0);
    const overtimeMinutes = rows.reduce((total, row) => total + row.overtimeMinutes, 0);
    const workDays = rows.filter(row => row.normalMinutes > 0 || row.overtimeMinutes > 0).length;
    const absenceCount = countPayrollAbsenceDays(rows);
    const manualBonusCents = resolvePayrollBonusCents({ isForeign: employee.isForeign, workDays, dailyRateCents: employee.dailyRateCents, periodBonusCents: bonusByEmployee.get(employee.id), absenceCount, overtimeMinutes, bonusSettings });
    const calculated = calculatePayrollEntry({ normalMinutes, overtimeMinutes, regularRateCents: employee.isForeign === 1 ? 0 : employee.regularRateCents, overtimeRateCents: employee.overtimeRateCents, baseSalaryCents: manualBonusCents, advanceCents: employee.advanceCents, socialEmployeeRateBp: period.socialEmployeeRateBp, socialEmployerRateBp: period.socialEmployerRateBp, taxBrackets: brackets });
    const hasImportedSplit = employee.bankPaymentCents > 0 || employee.cashPaymentCents > 0;
    const bankPaymentCents = hasImportedSplit ? employee.bankPaymentCents : employee.paymentMethod === "BANK" ? calculated.payableCents : 0;
    const cashPaymentCents = hasImportedSplit ? employee.cashPaymentCents : employee.paymentMethod === "CASH" ? calculated.payableCents : 0;
    return { payrollPeriodId, payrollEmployeeId: employee.id, employeeNumber: employee.employeeNumber, employeeName: `${employee.firstName} ${employee.lastName || ""}`.trim(), normalMinutes, overtimeMinutes, bonusCents: manualBonusCents, advanceCents: employee.advanceCents, bankPaymentCents, cashPaymentCents, paymentMethod: employee.paymentMethod, status: "GENERATED" as const, ...calculated };
  });
  if (entries.length) await db.insert(payrollEntries).values(entries);
  await db.update(payrollPeriods).set({ status: "GENERATED", generatedAt: new Date() }).where(eq(payrollPeriods.id, payrollPeriodId));
  await auditDocumentAction(period.companyId, userId, "GENERATE", "PAYROLL_PERIOD", payrollPeriodId, `U gjeneruan pagat për ${period.month}/${period.year}`);
  return entries;
}

export async function createProduct(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.code) {
    const existingCode = await db.select({ id: products.id }).from(products)
      .where(and(eq(products.companyId, data.companyId), eq(products.code, data.code)))
      .limit(1);
    if (existingCode.length > 0) throw new Error(`Artikulli me kodin '${data.code}' ekziston tashmë në këtë kompani.`);
  }
  const existingName = await db.select({ id: products.id }).from(products)
    .where(and(eq(products.companyId, data.companyId), eq(products.name, data.name)))
    .limit(1);
  if (existingName.length > 0) throw new Error(`Artikulli me emrin '${data.name}' ekziston tashmë në këtë kompani.`);

  const [result] = await db.insert(products).values(data);
  const [createdProduct] = await db.select().from(products).where(eq(products.id, Number(result.insertId))).limit(1);
  if (!createdProduct) throw new Error("Artikulli i krijuar nuk u gjet");
  return createdProduct;
}

export async function updateProduct(id: number, companyId: number, data: { code?: string; name: string; barcode?: string; categoryId?: number; baseUnit?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [current] = await db.select().from(products).where(and(eq(products.id, id), eq(products.companyId, companyId))).limit(1);
  if (!current) throw new Error("Artikulli nuk u gjet në kompaninë aktive.");
  if (data.code) {
    const [duplicateCode] = await db.select({ id: products.id }).from(products)
      .where(and(eq(products.companyId, companyId), eq(products.code, data.code))).limit(1);
    if (duplicateCode && duplicateCode.id !== id) throw new Error(`Artikulli me kodin '${data.code}' ekziston tashmë në këtë kompani.`);
  }
  const [duplicateName] = await db.select({ id: products.id }).from(products)
    .where(and(eq(products.companyId, companyId), eq(products.name, data.name))).limit(1);
  if (duplicateName && duplicateName.id !== id) throw new Error(`Artikulli me emrin '${data.name}' ekziston tashmë në këtë kompani.`);
  await db.update(products).set({
    code: data.code || null,
    name: data.name,
    barcode: data.barcode || null,
    categoryId: data.categoryId ?? null,
    baseUnit: data.baseUnit || null,
  }).where(and(eq(products.id, id), eq(products.companyId, companyId)));
  const [updated] = await db.select().from(products).where(and(eq(products.id, id), eq(products.companyId, companyId))).limit(1);
  if (!updated) throw new Error("Artikulli i përditësuar nuk u gjet.");
  return updated;
}

export async function deleteProduct(id: number, companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [product] = await db.select().from(products).where(and(eq(products.id, id), eq(products.companyId, companyId))).limit(1);
  if (!product) throw new Error("Artikulli nuk u gjet në kompaninë aktive.");
  const references = await Promise.all([
    db.select({ id: purchaseItems.id }).from(purchaseItems).where(eq(purchaseItems.productId, id)).limit(1),
    db.select({ id: salesItems.id }).from(salesItems).where(eq(salesItems.productId, id)).limit(1),
    db.select({ id: purchaseOrderItems.id }).from(purchaseOrderItems).where(eq(purchaseOrderItems.productId, id)).limit(1),
    db.select({ id: salesOrderItems.id }).from(salesOrderItems).where(eq(salesOrderItems.productId, id)).limit(1),
    db.select({ id: purchaseReceiptItems.id }).from(purchaseReceiptItems).where(eq(purchaseReceiptItems.productId, id)).limit(1),
    db.select({ id: purchaseReturnItems.id }).from(purchaseReturnItems).where(eq(purchaseReturnItems.productId, id)).limit(1),
    db.select({ id: deliveryItems.id }).from(deliveryItems).where(eq(deliveryItems.productId, id)).limit(1),
    db.select({ id: salesReturnItems.id }).from(salesReturnItems).where(eq(salesReturnItems.productId, id)).limit(1),
    db.select({ id: stockMovements.id }).from(stockMovements).where(and(eq(stockMovements.companyId, companyId), eq(stockMovements.productId, id))).limit(1),
    db.select({ id: stockBalances.id }).from(stockBalances).where(and(eq(stockBalances.companyId, companyId), eq(stockBalances.productId, id))).limit(1),
    db.select({ id: stockTransferItems.id }).from(stockTransferItems).where(eq(stockTransferItems.productId, id)).limit(1),
    db.select({ id: inventoryAdjustmentItems.id }).from(inventoryAdjustmentItems).where(eq(inventoryAdjustmentItems.productId, id)).limit(1),
  ]);
  if (references.some(rows => rows.length > 0) || Number(product.stock || 0) !== 0) {
    throw new Error("Artikulli nuk mund të fshihet sepse ka lëvizje, stok ose dokumente të lidhura. Përdor Edito për ta përditësuar.");
  }
  await db.delete(products).where(and(eq(products.id, id), eq(products.companyId, companyId)));
  return { id };
}

// ============================================================
// WEIGHT FORMS
// ============================================================

export async function getWeightForms(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(weightForms)
    .where(eq(weightForms.companyId, companyId))
    .orderBy(desc(weightForms.createdAt));
}

export async function getWeightFormById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(weightForms)
    .where(eq(weightForms.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createWeightForm(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await assertUniqueDocumentNumber(db, weightForms, data.companyId, data.docNumber, "Formulari i peshës");
  return db.insert(weightForms).values(data);
}

// ============================================================
// PURCHASE INVOICES
// ============================================================

export async function getPurchaseInvoices(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const rows = await db
    .select({ invoice: purchaseInvoices, linkedSupplierName: suppliers.name })
    .from(purchaseInvoices)
    .leftJoin(suppliers, eq(suppliers.id, purchaseInvoices.supplierId))
    .where(eq(purchaseInvoices.companyId, companyId))
    .orderBy(desc(purchaseInvoices.createdAt));
  return rows.map(({ invoice, linkedSupplierName }) => ({
    ...invoice,
    supplierName: invoice.supplierName || linkedSupplierName || null,
  }));
}

export async function getPurchaseInvoiceRegister(companyId: number) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      invoiceId: purchaseInvoices.id,
      docNumber: purchaseInvoices.docNumber,
      date: purchaseInvoices.date,
      supplierId: purchaseInvoices.supplierId,
      supplierName: purchaseInvoices.supplierName,
      linkedSupplierName: suppliers.name,
      invoiceTotalAmount: purchaseInvoices.totalAmount,
      currency: purchaseInvoices.currency,
      exchangeRate: purchaseInvoices.exchangeRate,
      vatAmount: purchaseInvoices.vatAmount,
      carrierName: purchaseInvoices.carrierName,
      vehiclePlate: purchaseInvoices.vehiclePlate,
      inventoryReference: purchaseInvoices.inventoryReference,
      status: purchaseInvoices.status,
      paymentStatus: purchaseInvoices.paymentStatus,
      itemId: purchaseItems.id,
      productId: purchaseItems.productId,
      productName: purchaseItems.productName,
      quantity: purchaseItems.quantity,
      unit: purchaseItems.unit,
      unitPrice: purchaseItems.unitPrice,
      lineTotalAmount: purchaseItems.totalPrice,
    })
    .from(purchaseInvoices)
    .leftJoin(purchaseItems, eq(purchaseItems.purchaseInvoiceId, purchaseInvoices.id))
    .leftJoin(suppliers, eq(suppliers.id, purchaseInvoices.supplierId))
    .where(eq(purchaseInvoices.companyId, companyId))
    .orderBy(desc(purchaseInvoices.date), desc(purchaseInvoices.id), purchaseItems.id);

  return rows.map(({ linkedSupplierName, ...row }) => ({
    ...row,
    supplierName: row.supplierName || linkedSupplierName || null,
  }));
}

export async function getPurchaseInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const rows = await db
    .select({ invoice: purchaseInvoices, linkedSupplierName: suppliers.name })
    .from(purchaseInvoices)
    .leftJoin(suppliers, eq(suppliers.id, purchaseInvoices.supplierId))
    .where(eq(purchaseInvoices.id, id))
    .limit(1);

  const row = rows[0];
  return row ? { ...row.invoice, supplierName: row.invoice.supplierName || row.linkedSupplierName || null } : undefined;
}

async function ensurePurchaseInvoiceStock(tx: any, invoice: any, items: any[]) {
  if (!invoice.warehouseId) return;
  // Lock the source invoice row so concurrent post operations serialize before the idempotency check.
  await tx.select({ id: purchaseInvoices.id })
    .from(purchaseInvoices)
    .where(and(eq(purchaseInvoices.companyId, invoice.companyId), eq(purchaseInvoices.id, invoice.id)))
    .for("update")
    .limit(1);
  const existing = await tx.select({ id: stockMovements.id })
    .from(stockMovements)
    .where(and(
      eq(stockMovements.companyId, invoice.companyId),
      eq(stockMovements.referenceType, "PURCHASE_INVOICE"),
      eq(stockMovements.referenceId, invoice.id),
    ))
    .limit(1);
  if (existing.length > 0) return;
  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity <= 0) continue;
    await applyWarehouseStockDelta(tx, {
      companyId: invoice.companyId,
      warehouseId: invoice.warehouseId,
      productId: item.productId,
      delta: item.quantity,
    });
    await tx.insert(stockMovements).values({
      companyId: invoice.companyId,
      docNumber: invoice.docNumber,
      movementDate: invoice.date,
      movementType: "IN",
      productId: item.productId,
      productName: item.productName || "Artikull",
      quantity: item.quantity,
      warehouseId: invoice.warehouseId,
      referenceType: "PURCHASE_INVOICE",
      referenceId: invoice.id,
      notes: "Hyrje nga faturë blerjeje",
    });
  }
}

export async function createPurchaseInvoice(data: any, items: any[] = []) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await assertUniqueDocumentNumber(db, purchaseInvoices, data.companyId, data.docNumber, "Fatura e blerjes");
  const warehouseId = data.warehouseId ? await requireWarehouseId(db, data.companyId, data.warehouseId) : undefined;
  const companyProducts = await db.select({ id: products.id, name: products.name })
    .from(products)
    .where(eq(products.companyId, data.companyId));
  const normalizedSourceItems = items.map(item => {
    const product = item.productId
      ? companyProducts.find(candidate => candidate.id === item.productId)
      : companyProducts.find(candidate => candidate.name.trim().toLocaleLowerCase("sq-AL") === String(item.productName || "").trim().toLocaleLowerCase("sq-AL"));
    if (!product) throw new Error(`Artikulli ${item.productName || "i zgjedhur"} nuk u gjet në kompaninë aktive`);
    return { ...item, productId: product.id, productName: product.name };
  });

  return db.transaction(async tx => {
    const result = await tx.insert(purchaseInvoices).values({ ...data, warehouseId });
    const invoiceId = Number((result as unknown as [{ insertId: number }])[0].insertId);
    const normalizedItems = normalizedSourceItems.map(item => ({
      purchaseInvoiceId: invoiceId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }));
    if (normalizedItems.length > 0) await tx.insert(purchaseItems).values(normalizedItems);
    await ensurePurchaseInvoiceStock(tx, { ...data, id: invoiceId, warehouseId }, normalizedSourceItems);
    return { id: invoiceId };
  });
}

export async function getPurchaseItems(invoiceId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(purchaseItems)
    .where(eq(purchaseItems.purchaseInvoiceId, invoiceId));
}

async function auditDocumentAction(companyId: number, userId: number, action: string, entityType: string, entityId: number, details: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values({ companyId, userId, action, entityType, entityId, details });
}

export async function cancelPurchaseInvoice(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const invoice = await getPurchaseInvoiceById(id);
  if (!invoice) throw new Error("Fatura e blerjes nuk u gjet");
  if (invoice.status === "PAID" || invoice.paymentStatus === "PAID") throw new Error("Fatura e paguar nuk mund të anulohet. Krijo dokument kundër.");
  if (invoice.status === "CANCELLED") return { success: true, alreadyCancelled: true };
  await db.transaction(async tx => {
    const reversal = await tx.select({ id: stockMovements.id }).from(stockMovements).where(and(
      eq(stockMovements.companyId, invoice.companyId), eq(stockMovements.referenceType, "PURCHASE_INVOICE_CANCEL"), eq(stockMovements.referenceId, invoice.id),
    )).limit(1);
    if (reversal.length === 0 && invoice.warehouseId) {
      const items = await tx.select().from(purchaseItems).where(eq(purchaseItems.purchaseInvoiceId, invoice.id));
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) continue;
        await applyWarehouseStockDelta(tx, { companyId: invoice.companyId, warehouseId: invoice.warehouseId, productId: item.productId, delta: -item.quantity });
        await tx.insert(stockMovements).values({ companyId: invoice.companyId, docNumber: invoice.docNumber, movementDate: new Date(), movementType: "OUT", productId: item.productId, productName: item.productName || "Artikull", quantity: item.quantity, warehouseId: invoice.warehouseId, referenceType: "PURCHASE_INVOICE_CANCEL", referenceId: invoice.id, notes: "Kundërveprim anulimi fature blerjeje" });
      }
    }
    await tx.update(purchaseInvoices).set({ status: "CANCELLED" }).where(eq(purchaseInvoices.id, id));
  });
  await auditDocumentAction(invoice.companyId, userId, "CANCEL", "PURCHASE_INVOICE", id, `U anulua fatura ${invoice.docNumber}`);
  return { success: true };
}

export async function deletePurchaseInvoiceDraft(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const invoice = await getPurchaseInvoiceById(id);
  if (!invoice) throw new Error("Fatura e blerjes nuk u gjet");
  if (invoice.status !== "DRAFT") throw new Error("Vetëm faturat Draft mund të fshihen.");
  await auditDocumentAction(invoice.companyId, userId, "DELETE", "PURCHASE_INVOICE", id, `U fshi fatura Draft ${invoice.docNumber}`);
  await db.delete(purchaseItems).where(eq(purchaseItems.purchaseInvoiceId, id));
  await db.delete(purchaseInvoices).where(eq(purchaseInvoices.id, id));
  return { success: true };
}

// ============================================================
// PURCHASE WORKFLOW: ORDERS, RECEIPTS & RETURNS
// ============================================================

export async function getPurchaseOrders(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  const orders = await db.select().from(purchaseOrders)
    .where(eq(purchaseOrders.companyId, companyId))
    .orderBy(desc(purchaseOrders.createdAt));
  if (!orders.length) return [];
  const [items, attachments] = await Promise.all([
    db.select().from(purchaseOrderItems),
    db.select().from(purchaseOrderAttachments),
  ]);
  return orders.map(order => {
    const orderItems = items.filter(item => item.purchaseOrderId === order.id);
    return {
      ...order,
      orderedQuantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      loadedQuantity: orderItems.reduce((sum, item) => sum + item.loadedQuantity, 0),
      attachmentCount: attachments.filter(attachment => attachment.purchaseOrderId === order.id).length,
    };
  });
}

export async function getPurchaseOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(purchaseOrders)
    .where(eq(purchaseOrders.id, id)).limit(1);
  return result[0];
}

export async function getPurchaseOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(purchaseOrderItems)
    .where(eq(purchaseOrderItems.purchaseOrderId, orderId));
}

export async function getPurchaseOrderAttachments(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(purchaseOrderAttachments)
    .where(eq(purchaseOrderAttachments.purchaseOrderId, orderId))
    .orderBy(desc(purchaseOrderAttachments.createdAt));
}

export async function addPurchaseOrderAttachment(input: { purchaseOrderId: number; fileName: string; mimeType?: string; fileSize: number; bytes: Buffer }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const stored = await storagePut(`purchase-orders/${input.purchaseOrderId}/${safeName}`, input.bytes, input.mimeType || "application/octet-stream");
  const result = await db.insert(purchaseOrderAttachments).values({
    purchaseOrderId: input.purchaseOrderId,
    fileName: input.fileName,
    fileKey: stored.key,
    fileUrl: stored.url,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
  });
  return { id: Number((result as unknown as [{ insertId: number }])[0].insertId), ...stored };
}

export async function createPurchaseOrder(data: any, items: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await assertUniqueDocumentNumber(db, purchaseOrders, data.companyId, data.docNumber, "Porosia");

  const result = await db.insert(purchaseOrders).values(data);
  const orderId = Number((result as unknown as [{ insertId: number }])[0].insertId);
  if (items.length > 0) {
    await db.insert(purchaseOrderItems).values(items.map(item => ({
      purchaseOrderId: orderId,
      productId: item.productId,
      productName: item.productName,
      plantType: item.plantType,
      productCode: item.productCode,
      sackCount: item.sackCount,
      grossWeightKg: item.grossWeightKg,
      netWeightKg: item.netWeightKg,
      quantity: item.quantity,
      loadedQuantity: item.loadedQuantity ?? 0,
      receivedQuantity: 0,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      notes: item.notes,
    })));
  }
  return { id: orderId };
}

export async function updatePurchaseOrderDraft(id: number, data: any, items: any[], userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const order = await getPurchaseOrderById(id);
  if (!order) throw new Error("Porosia nuk u gjet");
  if (order.status !== "DRAFT") throw new Error("Vetëm porositë Draft mund të modifikohen.");

  await assertUniqueDocumentNumber(db, purchaseOrders, order.companyId, data.docNumber, "Porosia", id);

  await db.transaction(async tx => {
    await tx.update(purchaseOrders).set({
      docNumber: data.docNumber,
      orderDate: data.orderDate,
      expectedDate: data.expectedDate,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      customerReference: data.customerReference,
      operationalStatus: data.operationalStatus,
      notes: data.notes,
      preparationResponsible: data.preparationResponsible,
      loadingResponsible: data.loadingResponsible,
      documentationResponsible: data.documentationResponsible,
      verifierName: data.verifierName,
      totalAmount: data.totalAmount,
    }).where(eq(purchaseOrders.id, id));
    await tx.delete(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, id));
    await tx.insert(purchaseOrderItems).values(items.map(item => ({
      purchaseOrderId: id,
      productId: item.productId,
      productName: item.productName,
      plantType: item.plantType,
      productCode: item.productCode,
      sackCount: item.sackCount,
      grossWeightKg: item.grossWeightKg,
      netWeightKg: item.netWeightKg,
      quantity: item.quantity,
      loadedQuantity: item.loadedQuantity ?? 0,
      receivedQuantity: 0,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      notes: item.notes,
    })));
  });
  await auditDocumentAction(order.companyId, userId, "UPDATE", "PURCHASE_ORDER", id, `U modifikua porosia Draft ${data.docNumber}`);
  return { success: true };
}

export async function updatePurchaseOrderStatus(id: number, status: "DRAFT" | "CONFIRMED" | "RECEIVED" | "CANCELLED") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(purchaseOrders).set({ status }).where(eq(purchaseOrders.id, id));
  return { success: true };
}

export async function updatePurchaseOrderOperationalStatus(id: number, operationalStatus: "IN_PROGRESS" | "LOADED" | "SENT" | "COMPLETED") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const order = await getPurchaseOrderById(id);
  if (!order) throw new Error("Porosia nuk u gjet");
  await db.update(purchaseOrders).set({ operationalStatus }).where(eq(purchaseOrders.id, id));
  if (operationalStatus === "LOADED") await ensureCargoLoadForLoadedPurchaseOrder(db, { ...order, operationalStatus });
  return { success: true };
}

export async function cancelPurchaseOrder(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const order = await getPurchaseOrderById(id);
  if (!order) throw new Error("Porosia nuk u gjet");
  if (order.status === "RECEIVED") throw new Error("Porosia e mbyllur nga pranimi nuk mund të anulohet.");
  if (order.status === "CANCELLED") return { success: true, alreadyCancelled: true };
  await db.update(purchaseOrders).set({ status: "CANCELLED" }).where(eq(purchaseOrders.id, id));
  await auditDocumentAction(order.companyId, userId, "CANCEL", "PURCHASE_ORDER", id, `U anulua porosia ${order.docNumber}`);
  return { success: true };
}

export async function deletePurchaseOrderDraft(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const order = await getPurchaseOrderById(id);
  if (!order) throw new Error("Porosia nuk u gjet");
  if (order.status !== "DRAFT") throw new Error("Vetëm porositë Draft mund të fshihen.");
  const linkedReceipt = await db.select({ id: purchaseReceipts.id }).from(purchaseReceipts).where(eq(purchaseReceipts.purchaseOrderId, id)).limit(1);
  if (linkedReceipt.length > 0) throw new Error("Porosia ka pranime të lidhura dhe nuk mund të fshihet.");
  await auditDocumentAction(order.companyId, userId, "DELETE", "PURCHASE_ORDER", id, `U fshi porosia Draft ${order.docNumber}`);
  await db.delete(purchaseOrderAttachments).where(eq(purchaseOrderAttachments.purchaseOrderId, id));
  await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, id));
  await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
  return { success: true };
}

export async function getPurchaseReceipts(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(purchaseReceipts)
    .where(eq(purchaseReceipts.companyId, companyId))
    .orderBy(desc(purchaseReceipts.createdAt));
}

export async function getPurchaseReceiptById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(purchaseReceipts)
    .where(eq(purchaseReceipts.id, id)).limit(1);
  return result[0];
}

export async function getPurchaseReceiptItems(receiptId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(purchaseReceiptItems)
    .where(eq(purchaseReceiptItems.purchaseReceiptId, receiptId));
}

export async function createPurchaseReceipt(data: any, items: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await assertUniqueDocumentNumber(db, purchaseReceipts, data.companyId, data.docNumber, "Pranimi");

  const result = await db.insert(purchaseReceipts).values(data);
  const receiptId = Number((result as unknown as [{ insertId: number }])[0].insertId);
  if (items.length > 0) {
    await db.insert(purchaseReceiptItems).values(items.map(item => ({
      purchaseReceiptId: receiptId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unit: item.unit,
    })));
  }
  return { id: receiptId };
}

export async function validatePurchaseReceipt(receiptId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const receipt = (await db.select().from(purchaseReceipts)
    .where(eq(purchaseReceipts.id, receiptId)).limit(1))[0];
  if (!receipt) throw new Error("Pranimi nuk u gjet");
  if (receipt.status === "VALIDATED") return { success: true, alreadyValidated: true };
  if (receipt.status === "CANCELLED") throw new Error("Pranimi i anuluar nuk mund të validohet");

  const items = await db.select().from(purchaseReceiptItems)
    .where(eq(purchaseReceiptItems.purchaseReceiptId, receiptId));
  await db.transaction(async tx => {
    const warehouseId = await resolveWarehouseId(tx, receipt.companyId, receipt.warehouseId);
    if (receipt.warehouseId !== warehouseId) {
      await tx.update(purchaseReceipts).set({ warehouseId }).where(eq(purchaseReceipts.id, receipt.id));
    }
    for (const item of items) {
      if (item.productId) {
        const product = (await tx.select().from(products)
          .where(eq(products.id, item.productId)).limit(1))[0];
        if (product) {
          await applyWarehouseStockDelta(tx, { companyId: receipt.companyId, warehouseId, productId: product.id, delta: item.quantity });
          await tx.insert(stockMovements).values({
            companyId: receipt.companyId, docNumber: receipt.docNumber, movementDate: receipt.receiptDate,
            movementType: "IN", productId: product.id, productName: product.name, quantity: item.quantity,
            warehouseId, referenceType: "PURCHASE_RECEIPT", referenceId: receipt.id,
          });
        }
      }
    }
    await tx.update(purchaseReceipts).set({ status: "VALIDATED" })
      .where(eq(purchaseReceipts.id, receiptId));
    if (receipt.purchaseOrderId) {
      await tx.update(purchaseOrders).set({ status: "RECEIVED" })
        .where(eq(purchaseOrders.id, receipt.purchaseOrderId));
    }
  });
  return { success: true };
}

export async function getPurchaseReturns(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(purchaseReturns)
    .where(eq(purchaseReturns.companyId, companyId))
    .orderBy(desc(purchaseReturns.createdAt));
}

export async function getPurchaseReturnById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(purchaseReturns)
    .where(eq(purchaseReturns.id, id)).limit(1);
  return result[0];
}

export async function createPurchaseReturn(data: any, items: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await assertUniqueDocumentNumber(db, purchaseReturns, data.companyId, data.docNumber, "Kthimi i blerjes");
  const result = await db.insert(purchaseReturns).values(data);
  const returnId = Number((result as unknown as [{ insertId: number }])[0].insertId);
  if (items.length > 0) {
    await db.insert(purchaseReturnItems).values(items.map(item => ({
      purchaseReturnId: returnId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unit: item.unit,
    })));
  }
  return { id: returnId };
}

export async function validatePurchaseReturn(returnId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const purchaseReturn = (await db.select().from(purchaseReturns)
    .where(eq(purchaseReturns.id, returnId)).limit(1))[0];
  if (!purchaseReturn) throw new Error("Kthimi nuk u gjet");
  if (purchaseReturn.status === "VALIDATED") return { success: true, alreadyValidated: true };
  if (purchaseReturn.status === "CANCELLED") throw new Error("Kthimi i anuluar nuk mund të validohet");

  const items = await db.select().from(purchaseReturnItems)
    .where(eq(purchaseReturnItems.purchaseReturnId, returnId));
  await db.transaction(async tx => {
    const originalReceipt = purchaseReturn.purchaseReceiptId
      ? (await tx.select().from(purchaseReceipts).where(eq(purchaseReceipts.id, purchaseReturn.purchaseReceiptId)).limit(1))[0]
      : undefined;
    const warehouseId = await resolveWarehouseId(tx, purchaseReturn.companyId, originalReceipt?.warehouseId);
    for (const item of items) {
      if (item.productId) {
        const product = (await tx.select().from(products)
          .where(eq(products.id, item.productId)).limit(1))[0];
        if (!product) throw new Error(`Artikulli ${item.productName} nuk u gjet`);
        await applyWarehouseStockDelta(tx, { companyId: purchaseReturn.companyId, warehouseId, productId: product.id, delta: -item.quantity });
        await tx.insert(stockMovements).values({
          companyId: purchaseReturn.companyId, docNumber: purchaseReturn.docNumber, movementDate: purchaseReturn.returnDate,
          movementType: "OUT", productId: product.id, productName: product.name, quantity: item.quantity,
          warehouseId, referenceType: "PURCHASE_RETURN", referenceId: purchaseReturn.id,
        });
      }
    }
    await tx.update(purchaseReturns).set({ status: "VALIDATED" })
      .where(eq(purchaseReturns.id, returnId));
  });
  return { success: true };
}

export async function getPurchaseReport(
  companyId: number,
  filters: { dateFrom?: Date; dateTo?: Date; supplierId?: number },
) {
  const db = await getDb();
  if (!db) {
    return { invoices: [], orders: [], receipts: [], returns: [] };
  }

  const [invoices, orders, receipts, returns] = await Promise.all([
    getPurchaseInvoices(companyId),
    getPurchaseOrders(companyId),
    getPurchaseReceipts(companyId),
    getPurchaseReturns(companyId),
  ]);

  const inRange = (value: Date | null, supplierId: number | null) => {
    const time = value?.getTime() ?? 0;
    const fromMatches = !filters.dateFrom || time >= filters.dateFrom.getTime();
    const toMatches = !filters.dateTo || time <= filters.dateTo.getTime() + 86_399_999;
    const supplierMatches = !filters.supplierId || supplierId === filters.supplierId;
    return fromMatches && toMatches && supplierMatches;
  };

  const filteredInvoices = invoices.filter(item => inRange(item.date, item.supplierId));
  const filteredOrders = orders.filter(item => inRange(item.orderDate, item.supplierId));
  const filteredReceipts = receipts.filter(item => inRange(item.receiptDate, item.supplierId));
  const filteredReturns = returns.filter(item => inRange(item.returnDate, item.supplierId));
  const supplierSummary = new Map<number | string, {
    supplierId: number | null;
    supplierName: string;
    invoiceTotal: number;
    orderTotal: number;
    receipts: number;
    returns: number;
  }>();

  const getSupplierBucket = (supplierId: number | null, supplierName: string | null) => {
    const key = supplierId ?? supplierName ?? "unassigned";
    const current = supplierSummary.get(key) ?? {
      supplierId,
      supplierName: supplierName || "Pa furnitor",
      invoiceTotal: 0,
      orderTotal: 0,
      receipts: 0,
      returns: 0,
    };
    supplierSummary.set(key, current);
    return current;
  };

  filteredInvoices.forEach(item => {
    getSupplierBucket(item.supplierId, item.supplierName).invoiceTotal += item.totalAmount ?? 0;
  });
  filteredOrders.forEach(item => {
    getSupplierBucket(item.supplierId, item.supplierName).orderTotal += item.totalAmount ?? 0;
  });
  filteredReceipts.forEach(item => { getSupplierBucket(item.supplierId, item.supplierName).receipts += 1; });
  filteredReturns.forEach(item => { getSupplierBucket(item.supplierId, item.supplierName).returns += 1; });

  return {
    invoices: filteredInvoices,
    orders: filteredOrders,
    receipts: filteredReceipts,
    returns: filteredReturns,
    metrics: {
      invoiceTotal: filteredInvoices.reduce((sum, item) => sum + (item.totalAmount ?? 0), 0),
      orderTotal: filteredOrders.reduce((sum, item) => sum + (item.totalAmount ?? 0), 0),
      receiptsCount: filteredReceipts.length,
      returnsCount: filteredReturns.length,
      openOrdersCount: filteredOrders.filter(item => item.status === "CONFIRMED").length,
      unpaidInvoicesCount: filteredInvoices.filter(item => item.status !== "PAID" && item.status !== "CANCELLED").length,
    },
    bySupplier: Array.from(supplierSummary.values()).sort((a, b) => b.invoiceTotal - a.invoiceTotal),
    byStatus: {
      invoices: summarizeDocumentStatuses(filteredInvoices),
      orders: summarizeDocumentStatuses(filteredOrders),
      receipts: summarizeDocumentStatuses(filteredReceipts),
      returns: summarizeDocumentStatuses(filteredReturns),
    },
  };
}

// ============================================================
// SALES INVOICES
// ============================================================

export async function getSalesInvoices(companyId: number) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({ invoice: salesInvoices, linkedCustomerName: customers.name })
    .from(salesInvoices)
    .leftJoin(customers, eq(customers.id, salesInvoices.customerId))
    .where(eq(salesInvoices.companyId, companyId))
    .orderBy(desc(salesInvoices.createdAt));
  return rows.map(({ invoice, linkedCustomerName }) => ({
    ...invoice,
    customerName: invoice.customerName || linkedCustomerName || null,
  }));
}

export async function getSalesInvoiceRegister(companyId: number) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      invoiceId: salesInvoices.id,
      docNumber: salesInvoices.docNumber,
      date: salesInvoices.date,
      customerId: salesInvoices.customerId,
      customerName: salesInvoices.customerName,
      linkedCustomerName: customers.name,
      invoiceTotalAmount: salesInvoices.totalAmount,
      currency: salesInvoices.currency,
      exchangeRate: salesInvoices.exchangeRate,
      invoiceFormat: salesInvoices.invoiceFormat,
      exportDetails: salesInvoices.exportDetails,
      vatAmount: salesInvoices.vatAmount,
      warehouseId: salesInvoices.warehouseId,
      warehouseName: warehouses.name,
      salesOrderId: salesInvoices.salesOrderId,
      deliveryNoteId: salesInvoices.deliveryNoteId,
      status: salesInvoices.status,
      paymentStatus: salesInvoices.paymentStatus,
      itemId: salesItems.id,
      productId: salesItems.productId,
      productName: salesItems.productName,
      quantity: salesItems.quantity,
      unit: salesItems.unit,
      unitPrice: salesItems.unitPrice,
      lineTotalAmount: salesItems.totalPrice,
    })
    .from(salesInvoices)
    .leftJoin(salesItems, eq(salesItems.salesInvoiceId, salesInvoices.id))
    .leftJoin(customers, eq(customers.id, salesInvoices.customerId))
    .leftJoin(warehouses, eq(warehouses.id, salesInvoices.warehouseId))
    .where(eq(salesInvoices.companyId, companyId))
    .orderBy(desc(salesInvoices.date), desc(salesInvoices.id), salesItems.id);

  return rows.map(({ linkedCustomerName, ...row }) => ({
    ...row,
    customerName: row.customerName || linkedCustomerName || null,
  }));
}

export async function getSalesInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const rows = await db
    .select({ invoice: salesInvoices, linkedCustomerName: customers.name })
    .from(salesInvoices)
    .leftJoin(customers, eq(customers.id, salesInvoices.customerId))
    .where(eq(salesInvoices.id, id))
    .limit(1);

  const row = rows[0];
  return row ? { ...row.invoice, customerName: row.invoice.customerName || row.linkedCustomerName || null } : undefined;
}

async function ensureSalesInvoiceStock(tx: any, invoice: any, items: any[], options: { allowNegative?: boolean } = {}) {
  if (!invoice.warehouseId || invoice.deliveryNoteId) return;
  if (!(invoice.status === "POSTED" || invoice.status === "PAID")) return;
  // Lock the source invoice row so concurrent post operations serialize before the idempotency check.
  await tx.select({ id: salesInvoices.id })
    .from(salesInvoices)
    .where(and(eq(salesInvoices.companyId, invoice.companyId), eq(salesInvoices.id, invoice.id)))
    .for("update")
    .limit(1);
  const existing = await tx.select({ id: stockMovements.id })
    .from(stockMovements)
    .where(and(
      eq(stockMovements.companyId, invoice.companyId),
      eq(stockMovements.referenceType, "SALES_INVOICE"),
      eq(stockMovements.referenceId, invoice.id),
    ))
    .limit(1);
  if (existing.length > 0) return;
  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity <= 0) continue;
    await applyWarehouseStockDelta(tx, {
      companyId: invoice.companyId,
      warehouseId: invoice.warehouseId,
      productId: item.productId,
      delta: -item.quantity,
    }, options);
    await tx.insert(stockMovements).values({
      companyId: invoice.companyId,
      docNumber: invoice.docNumber,
      movementDate: invoice.date,
      movementType: "OUT",
      productId: item.productId,
      productName: item.productName || "Artikull",
      quantity: item.quantity,
      warehouseId: invoice.warehouseId,
      referenceType: "SALES_INVOICE",
      referenceId: invoice.id,
      notes: "Dalje nga faturë shitjeje",
    });
  }
}

const normalizeImportedProductName = (value: unknown) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("sq-AL").replace(/[^a-z0-9]+/g, "");

export async function syncImportedSalesInventory(companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const invoices = await getSalesInvoices(companyId);
  const result = { invoicesChecked: 0, productsLinked: 0, productsCreated: 0, movementsCreated: 0 };
  for (const invoice of invoices) {
    if (!(["POSTED", "PAID"] as string[]).includes(String(invoice.status)) || invoice.deliveryNoteId) continue;
    let source: { sourceSheet?: string } = {};
    try { source = JSON.parse(invoice.exportDetails || "{}"); } catch { continue; }
    if (source.sourceSheet !== "EKSPORTI" && source.sourceSheet !== "SHITJET B V NE LEKE & EURO") continue;
    result.invoicesChecked += 1;
    await db.transaction(async tx => {
      const rows = await tx.select().from(salesItems).where(eq(salesItems.salesInvoiceId, invoice.id));
      const companyProducts = await tx.select().from(products).where(eq(products.companyId, companyId));
      const productsByName = new Map(companyProducts.map(product => [normalizeImportedProductName(product.name), product]));
      for (const row of rows) {
        let product = row.productId ? companyProducts.find(candidate => candidate.id === row.productId) : undefined;
        if (!product) product = productsByName.get(normalizeImportedProductName(row.productName));
        if (!product && row.productName) {
          const inserted = await tx.insert(products).values({ companyId, name: row.productName, baseUnit: row.unit || "Kg", stock: 0, minStock: 0, avgPrice: 0, lastPrice: 0 });
          const created = await tx.select().from(products).where(eq(products.id, Number((inserted as unknown as [{ insertId: number }])[0].insertId))).limit(1);
          product = created[0];
          if (product) { productsByName.set(normalizeImportedProductName(product.name), product); result.productsCreated += 1; }
        }
        if (product && row.productId !== product.id) {
          await tx.update(salesItems).set({ productId: product.id }).where(eq(salesItems.id, row.id));
          result.productsLinked += 1;
        }
      }
      const refreshedItems = await tx.select().from(salesItems).where(eq(salesItems.salesInvoiceId, invoice.id));
      const before = await tx.select({ id: stockMovements.id }).from(stockMovements).where(and(eq(stockMovements.referenceType, "SALES_INVOICE"), eq(stockMovements.referenceId, invoice.id)));
      await ensureSalesInvoiceStock(tx, invoice, refreshedItems, { allowNegative: true });
      const after = await tx.select({ id: stockMovements.id }).from(stockMovements).where(and(eq(stockMovements.referenceType, "SALES_INVOICE"), eq(stockMovements.referenceId, invoice.id)));
      result.movementsCreated += Math.max(0, after.length - before.length);
    });
  }
  return result;
}

export async function createSalesInvoice(data: any, items: any[] = []) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await assertUniqueDocumentNumber(db, salesInvoices, data.companyId, data.docNumber, "Fatura e shitjes");
  const warehouseId = await requireWarehouseId(db, data.companyId, data.warehouseId);

  return db.transaction(async tx => {
    const result = await tx.insert(salesInvoices).values({ ...data, warehouseId });
    const invoiceId = Number((result as unknown as [{ insertId: number }])[0].insertId);
    const normalizedItems = items.map(item => ({
      salesInvoiceId: invoiceId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }));
    if (normalizedItems.length > 0) await tx.insert(salesItems).values(normalizedItems);
    await ensureSalesInvoiceStock(tx, { ...data, id: invoiceId, warehouseId }, items);
    return { id: invoiceId };
  });
}

export async function repairImportedSalesInvoice(invoiceId: number, data: any, items: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getSalesInvoiceById(invoiceId);
  if (!existing || existing.invoiceFormat !== "EXPORT") throw new Error("Vetëm faturat EXPORT të importuara mund të riparohen.");
  await db.transaction(async tx => {
    const movements = await tx.select({ id: stockMovements.id }).from(stockMovements).where(and(
      eq(stockMovements.referenceType, "SALES_INVOICE"),
      eq(stockMovements.referenceId, invoiceId),
    )).limit(1);
    if (movements.length > 0) throw new Error("Fatura ka dalje stoku dhe nuk mund të riparohet automatikisht.");
    await tx.update(salesInvoices).set({
      date: data.date,
      customerId: data.customerId ?? existing.customerId,
      customerName: data.customerName ?? existing.customerName,
      warehouseId: existing.warehouseId ?? data.warehouseId,
      currency: data.currency,
      exchangeRate: data.exchangeRate,
      invoiceFormat: "EXPORT",
      exportDetails: data.exportDetails,
      totalAmount: data.totalAmount,
      vatAmount: data.vatAmount ?? 0,
    }).where(eq(salesInvoices.id, invoiceId));
    await tx.delete(salesItems).where(eq(salesItems.salesInvoiceId, invoiceId));
    if (items.length > 0) await tx.insert(salesItems).values(items.map(item => ({
      salesInvoiceId: invoiceId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })));
  });
  return { id: invoiceId, repaired: true };
}

export async function getSalesItems(invoiceId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(salesItems)
    .where(eq(salesItems.salesInvoiceId, invoiceId));
}

export async function cancelSalesInvoice(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const invoice = await getSalesInvoiceById(id);
  if (!invoice) throw new Error("Fatura e shitjes nuk u gjet");
  if (invoice.status === "PAID") throw new Error("Fatura e paguar nuk mund të anulohet. Krijo dokument kundër.");
  if (invoice.status === "CANCELLED") return { success: true, alreadyCancelled: true };
  await db.transaction(async tx => {
    const reversal = await tx.select({ id: stockMovements.id }).from(stockMovements).where(and(
      eq(stockMovements.companyId, invoice.companyId), eq(stockMovements.referenceType, "SALES_INVOICE_CANCEL"), eq(stockMovements.referenceId, invoice.id),
    )).limit(1);
    if (reversal.length === 0 && invoice.warehouseId && !invoice.deliveryNoteId) {
      const items = await tx.select().from(salesItems).where(eq(salesItems.salesInvoiceId, invoice.id));
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) continue;
        await applyWarehouseStockDelta(tx, { companyId: invoice.companyId, warehouseId: invoice.warehouseId, productId: item.productId, delta: item.quantity });
        await tx.insert(stockMovements).values({ companyId: invoice.companyId, docNumber: invoice.docNumber, movementDate: new Date(), movementType: "IN", productId: item.productId, productName: item.productName || "Artikull", quantity: item.quantity, warehouseId: invoice.warehouseId, referenceType: "SALES_INVOICE_CANCEL", referenceId: invoice.id, notes: "Kundërveprim anulimi fature shitjeje" });
      }
    }
    await tx.update(salesInvoices).set({ status: "CANCELLED" }).where(eq(salesInvoices.id, id));
  });
  await auditDocumentAction(invoice.companyId, userId, "CANCEL", "SALES_INVOICE", id, `U anulua fatura ${invoice.docNumber}`);
  return { success: true };
}

export async function deleteSalesInvoiceDraft(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const invoice = await getSalesInvoiceById(id);
  if (!invoice) throw new Error("Fatura e shitjes nuk u gjet");
  if (invoice.status !== "DRAFT") throw new Error("Vetëm faturat Draft mund të fshihen.");
  await auditDocumentAction(invoice.companyId, userId, "DELETE", "SALES_INVOICE", id, `U fshi fatura Draft ${invoice.docNumber}`);
  await db.delete(salesItems).where(eq(salesItems.salesInvoiceId, id));
  await db.delete(salesInvoices).where(eq(salesInvoices.id, id));
  return { success: true };
}

// ============================================================
// SALES WORKFLOW: QUOTATIONS, ORDERS, DELIVERIES & RETURNS
// ============================================================

export async function getSalesQuotations(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(salesQuotations)
    .where(eq(salesQuotations.companyId, companyId))
    .orderBy(desc(salesQuotations.createdAt));
}

export async function getSalesQuotationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(salesQuotations).where(eq(salesQuotations.id, id)).limit(1))[0];
}

export async function getSalesQuotationItems(quotationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(salesQuotationItems).where(eq(salesQuotationItems.salesQuotationId, quotationId));
}

export async function createSalesQuotation(data: any, items: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await assertUniqueDocumentNumber(db, salesQuotations, data.companyId, data.docNumber, "Oferta");
  const result = await db.insert(salesQuotations).values(data);
  const quotationId = Number((result as unknown as [{ insertId: number }])[0].insertId);
  if (items.length > 0) {
    await db.insert(salesQuotationItems).values(items.map(item => ({
      salesQuotationId: quotationId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })));
  }
  return { id: quotationId };
}

export async function updateSalesQuotationStatus(id: number, status: "DRAFT" | "SENT" | "ACCEPTED" | "EXPIRED" | "CANCELLED") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(salesQuotations).set({ status }).where(eq(salesQuotations.id, id));
  return { success: true };
}

export async function cancelSalesQuotation(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const quotation = await getSalesQuotationById(id);
  if (!quotation) throw new Error("Oferta nuk u gjet");
  if (quotation.status === "CANCELLED") return { success: true, alreadyCancelled: true };
  const linkedOrder = await db.select({ id: salesOrders.id }).from(salesOrders).where(eq(salesOrders.quotationId, id)).limit(1);
  if (!canCancelSalesQuotation(quotation.status, linkedOrder.length > 0)) throw new Error(linkedOrder.length > 0 ? "Oferta nuk mund të anulohet sepse është lidhur me një porosi." : "Vetëm ofertat Draft ose të dërguara mund të anulohen.");
  await db.update(salesQuotations).set({ status: "CANCELLED" }).where(eq(salesQuotations.id, id));
  await auditDocumentAction(quotation.companyId, userId, "CANCEL", "SALES_QUOTATION", id, `U anulua oferta ${quotation.docNumber}`);
  return { success: true };
}

export async function deleteSalesQuotationDraft(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const quotation = await getSalesQuotationById(id);
  if (!quotation) throw new Error("Oferta nuk u gjet");
  const linkedOrder = await db.select({ id: salesOrders.id }).from(salesOrders).where(eq(salesOrders.quotationId, id)).limit(1);
  if (!canDeleteSalesDraft(quotation.status, linkedOrder.length > 0)) throw new Error(linkedOrder.length > 0 ? "Oferta Draft nuk mund të fshihet sepse është lidhur me një porosi." : "Vetëm ofertat Draft mund të fshihen.");
  await auditDocumentAction(quotation.companyId, userId, "DELETE", "SALES_QUOTATION", id, `U fshi oferta Draft ${quotation.docNumber}`);
  await db.delete(salesQuotationItems).where(eq(salesQuotationItems.salesQuotationId, id));
  await db.delete(salesQuotations).where(eq(salesQuotations.id, id));
  return { success: true };
}

export async function getSalesOrders(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(salesOrders)
    .where(eq(salesOrders.companyId, companyId))
    .orderBy(desc(salesOrders.createdAt));
}

export async function getSalesOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(salesOrders).where(eq(salesOrders.id, id)).limit(1))[0];
}

export async function getSalesOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(salesOrderItems).where(eq(salesOrderItems.salesOrderId, orderId));
}

export async function createSalesOrder(data: any, items: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await assertUniqueDocumentNumber(db, salesOrders, data.companyId, data.docNumber, "Porosia e shitjes");
  const result = await db.insert(salesOrders).values(data);
  const orderId = Number((result as unknown as [{ insertId: number }])[0].insertId);
  if (items.length > 0) {
    await db.insert(salesOrderItems).values(items.map(item => ({
      salesOrderId: orderId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      deliveredQuantity: 0,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })));
  }
  return { id: orderId };
}

export async function updateSalesOrderStatus(id: number, status: "DRAFT" | "CONFIRMED" | "DELIVERED" | "CANCELLED") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(salesOrders).set({ status }).where(eq(salesOrders.id, id));
  return { success: true };
}

export async function cancelSalesOrder(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const order = await getSalesOrderById(id);
  if (!order) throw new Error("Porosia nuk u gjet");
  if (order.status === "CANCELLED") return { success: true, alreadyCancelled: true };
  const [linkedDelivery, linkedInvoice] = await Promise.all([
    db.select({ id: deliveryNotes.id }).from(deliveryNotes).where(eq(deliveryNotes.salesOrderId, id)).limit(1),
    db.select({ id: salesInvoices.id }).from(salesInvoices).where(eq(salesInvoices.salesOrderId, id)).limit(1),
  ]);
  if (!canCancelSalesOrder(order.status, linkedDelivery.length > 0 || linkedInvoice.length > 0)) throw new Error(linkedDelivery.length > 0 || linkedInvoice.length > 0 ? "Porosia nuk mund të anulohet sepse ka dërgesa ose fatura të lidhura." : "Vetëm porositë Draft ose të konfirmuara mund të anulohen.");
  await db.update(salesOrders).set({ status: "CANCELLED" }).where(eq(salesOrders.id, id));
  await auditDocumentAction(order.companyId, userId, "CANCEL", "SALES_ORDER", id, `U anulua porosia ${order.docNumber}`);
  return { success: true };
}

export async function deleteSalesOrderDraft(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const order = await getSalesOrderById(id);
  if (!order) throw new Error("Porosia nuk u gjet");
  const [linkedDelivery, linkedInvoice] = await Promise.all([
    db.select({ id: deliveryNotes.id }).from(deliveryNotes).where(eq(deliveryNotes.salesOrderId, id)).limit(1),
    db.select({ id: salesInvoices.id }).from(salesInvoices).where(eq(salesInvoices.salesOrderId, id)).limit(1),
  ]);
  if (!canDeleteSalesDraft(order.status, linkedDelivery.length > 0 || linkedInvoice.length > 0)) throw new Error(linkedDelivery.length > 0 || linkedInvoice.length > 0 ? "Porosia Draft nuk mund të fshihet sepse ka dërgesa ose fatura të lidhura." : "Vetëm porositë Draft mund të fshihen.");
  await auditDocumentAction(order.companyId, userId, "DELETE", "SALES_ORDER", id, `U fshi porosia Draft ${order.docNumber}`);
  await db.delete(salesOrderItems).where(eq(salesOrderItems.salesOrderId, id));
  await db.delete(salesOrders).where(eq(salesOrders.id, id));
  return { success: true };
}

export async function createSalesOrderFromQuotation(data: { quotationId: number; docNumber: string; orderDate: Date; expectedDate?: Date; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const quotation = await getSalesQuotationById(data.quotationId);
  if (!quotation) throw new Error("Oferta nuk u gjet");
  const existingOrder = await db.select().from(salesOrders).where(eq(salesOrders.quotationId, quotation.id)).limit(1);
  if (!canConvertQuotation(quotation.status, existingOrder.length > 0)) {
    throw new Error(existingOrder.length > 0 ? "Kjo ofertë është konvertuar tashmë në porosi" : "Oferta nuk mund të konvertohet në porosi");
  }
  await assertUniqueDocumentNumber(db, salesOrders, quotation.companyId, data.docNumber, "Porosia e shitjes");
  const items = await getSalesQuotationItems(data.quotationId);
  if (items.length === 0) throw new Error("Oferta nuk ka artikuj");
  return db.transaction(async tx => {
    const result = await tx.insert(salesOrders).values({
      companyId: quotation.companyId,
      docNumber: data.docNumber,
      orderDate: data.orderDate,
      expectedDate: data.expectedDate,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      quotationId: quotation.id,
      totalAmount: quotation.totalAmount,
      notes: data.notes ?? quotation.notes,
    });
    const orderId = Number((result as unknown as [{ insertId: number }])[0].insertId);
    await tx.insert(salesOrderItems).values(items.map(item => ({
      salesOrderId: orderId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      deliveredQuantity: 0,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })));
    await tx.update(salesQuotations).set({ status: "ACCEPTED" }).where(eq(salesQuotations.id, quotation.id));
    return { id: orderId };
  });
}

export async function getDeliveryNotes(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deliveryNotes)
    .where(eq(deliveryNotes.companyId, companyId))
    .orderBy(desc(deliveryNotes.createdAt));
}

export async function getDeliveryNoteById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(deliveryNotes).where(eq(deliveryNotes.id, id)).limit(1))[0];
}

export async function getDeliveryItems(deliveryNoteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deliveryItems).where(eq(deliveryItems.deliveryNoteId, deliveryNoteId));
}

export async function createDeliveryNote(data: any, items: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await assertUniqueDocumentNumber(db, deliveryNotes, data.companyId, data.docNumber, "Fletë-dalja");
  const result = await db.insert(deliveryNotes).values(data);
  const deliveryNoteId = Number((result as unknown as [{ insertId: number }])[0].insertId);
  if (items.length > 0) {
    await db.insert(deliveryItems).values(items.map(item => ({
      deliveryNoteId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unit: item.unit,
    })));
  }
  return { id: deliveryNoteId };
}

export async function validateDeliveryNote(deliveryNoteId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const delivery = await getDeliveryNoteById(deliveryNoteId);
  if (!delivery) throw new Error("Fletë-dalja nuk u gjet");
  if (delivery.status === "VALIDATED") return { success: true, alreadyValidated: true };
  if (delivery.status === "CANCELLED") throw new Error("Fletë-dalja e anuluar nuk mund të validohet");
  const items = await getDeliveryItems(deliveryNoteId);

  await db.transaction(async tx => {
    await tx.select({ id: deliveryNotes.id }).from(deliveryNotes).where(eq(deliveryNotes.id, delivery.id)).for("update").limit(1);
    const applied = await tx.select({ id: stockMovements.id }).from(stockMovements).where(and(eq(stockMovements.companyId, delivery.companyId), eq(stockMovements.referenceType, "DELIVERY_NOTE"), eq(stockMovements.referenceId, delivery.id))).limit(1);
    if (applied.length > 0) {
      await tx.update(deliveryNotes).set({ status: "VALIDATED" }).where(eq(deliveryNotes.id, delivery.id));
      return;
    }
    const warehouseId = await resolveWarehouseId(tx, delivery.companyId, delivery.warehouseId);
    if (delivery.warehouseId !== warehouseId) {
      await tx.update(deliveryNotes).set({ warehouseId }).where(eq(deliveryNotes.id, delivery.id));
    }
    for (const item of items) {
      if (!item.productId) continue;
      const product = (await tx.select().from(products).where(eq(products.id, item.productId)).limit(1))[0];
      if (!product) throw new Error(`Artikulli ${item.productName} nuk u gjet`);
      await applyWarehouseStockDelta(tx, { companyId: delivery.companyId, warehouseId, productId: product.id, delta: -item.quantity });
      await tx.insert(stockMovements).values({
        companyId: delivery.companyId, docNumber: delivery.docNumber, movementDate: delivery.deliveryDate,
        movementType: "OUT", productId: product.id, productName: product.name, quantity: item.quantity,
        warehouseId, referenceType: "DELIVERY_NOTE", referenceId: delivery.id,
      });
    }
    await tx.update(deliveryNotes).set({ status: "VALIDATED" }).where(eq(deliveryNotes.id, deliveryNoteId));
    if (delivery.salesOrderId) {
      await tx.update(salesOrders).set({ status: "DELIVERED" }).where(eq(salesOrders.id, delivery.salesOrderId));
    }
  });
  return { success: true };
}

export async function cancelDeliveryNote(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const delivery = await getDeliveryNoteById(id);
  if (!delivery) throw new Error("Fletë-dalja nuk u gjet");
  if (delivery.status === "CANCELLED") return { success: true, alreadyCancelled: true };
  if (!canCancelSalesStockDocument(delivery.status)) throw new Error("Fletë-dalja e validuar nuk mund të anulohet. Krijo dokument korrigjues.");
  const linkedInvoice = await db.select({ id: salesInvoices.id }).from(salesInvoices).where(eq(salesInvoices.deliveryNoteId, id)).limit(1);
  if (linkedInvoice.length > 0) throw new Error("Fletë-dalja nuk mund të anulohet sepse ka faturë të lidhur.");
  await db.update(deliveryNotes).set({ status: "CANCELLED" }).where(eq(deliveryNotes.id, id));
  await auditDocumentAction(delivery.companyId, userId, "CANCEL", "DELIVERY_NOTE", id, `U anulua fletë-dalja ${delivery.docNumber}`);
  return { success: true };
}

export async function deleteDeliveryDraft(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const delivery = await getDeliveryNoteById(id);
  if (!delivery) throw new Error("Fletë-dalja nuk u gjet");
  const linkedInvoice = await db.select({ id: salesInvoices.id }).from(salesInvoices).where(eq(salesInvoices.deliveryNoteId, id)).limit(1);
  if (!canDeleteSalesDraft(delivery.status, linkedInvoice.length > 0)) throw new Error(linkedInvoice.length > 0 ? "Fletë-dalja Draft nuk mund të fshihet sepse ka faturë të lidhur." : "Vetëm fletë-daljet Draft mund të fshihen.");
  await auditDocumentAction(delivery.companyId, userId, "DELETE", "DELIVERY_NOTE", id, `U fshi fletë-dalja Draft ${delivery.docNumber}`);
  await db.delete(deliveryItems).where(eq(deliveryItems.deliveryNoteId, id));
  await db.delete(deliveryNotes).where(eq(deliveryNotes.id, id));
  return { success: true };
}

export async function getSalesReturns(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(salesReturns)
    .where(eq(salesReturns.companyId, companyId))
    .orderBy(desc(salesReturns.createdAt));
}

export async function getSalesReturnById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(salesReturns).where(eq(salesReturns.id, id)).limit(1))[0];
}

export async function getSalesReturnItems(salesReturnId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(salesReturnItems).where(eq(salesReturnItems.salesReturnId, salesReturnId));
}

export async function createSalesReturn(data: any, items: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await assertUniqueDocumentNumber(db, salesReturns, data.companyId, data.docNumber, "Kthimi i shitjes");
  const result = await db.insert(salesReturns).values(data);
  const salesReturnId = Number((result as unknown as [{ insertId: number }])[0].insertId);
  if (items.length > 0) {
    await db.insert(salesReturnItems).values(items.map(item => ({
      salesReturnId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unit: item.unit,
    })));
  }
  return { id: salesReturnId };
}

export async function validateSalesReturn(salesReturnId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const salesReturn = await getSalesReturnById(salesReturnId);
  if (!salesReturn) throw new Error("Kthimi nuk u gjet");
  if (salesReturn.status === "VALIDATED") return { success: true, alreadyValidated: true };
  if (salesReturn.status === "CANCELLED") throw new Error("Kthimi i anuluar nuk mund të validohet");
  const items = await db.select().from(salesReturnItems).where(eq(salesReturnItems.salesReturnId, salesReturnId));
  await db.transaction(async tx => {
    await tx.select({ id: salesReturns.id }).from(salesReturns).where(eq(salesReturns.id, salesReturn.id)).for("update").limit(1);
    const applied = await tx.select({ id: stockMovements.id }).from(stockMovements).where(and(eq(stockMovements.companyId, salesReturn.companyId), eq(stockMovements.referenceType, "SALES_RETURN"), eq(stockMovements.referenceId, salesReturn.id))).limit(1);
    if (applied.length > 0) {
      await tx.update(salesReturns).set({ status: "VALIDATED" }).where(eq(salesReturns.id, salesReturn.id));
      return;
    }
    const originalDelivery = salesReturn.deliveryNoteId
      ? (await tx.select().from(deliveryNotes).where(eq(deliveryNotes.id, salesReturn.deliveryNoteId)).limit(1))[0]
      : undefined;
    const warehouseId = await resolveWarehouseId(tx, salesReturn.companyId, originalDelivery?.warehouseId);
    for (const item of items) {
      if (item.productId) {
        const product = (await tx.select().from(products).where(eq(products.id, item.productId)).limit(1))[0];
        if (product) {
          await applyWarehouseStockDelta(tx, { companyId: salesReturn.companyId, warehouseId, productId: product.id, delta: item.quantity });
          await tx.insert(stockMovements).values({
            companyId: salesReturn.companyId, docNumber: salesReturn.docNumber, movementDate: salesReturn.returnDate,
            movementType: "IN", productId: product.id, productName: product.name, quantity: item.quantity,
            warehouseId, referenceType: "SALES_RETURN", referenceId: salesReturn.id,
          });
        }
      }
    }
    await tx.update(salesReturns).set({ status: "VALIDATED" }).where(eq(salesReturns.id, salesReturnId));
  });
  return { success: true };
}

export async function cancelSalesReturn(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const salesReturn = await getSalesReturnById(id);
  if (!salesReturn) throw new Error("Kthimi nuk u gjet");
  if (salesReturn.status === "CANCELLED") return { success: true, alreadyCancelled: true };
  if (!canCancelSalesStockDocument(salesReturn.status)) throw new Error("Kthimi i validuar nuk mund të anulohet. Krijo dokument korrigjues.");
  await db.update(salesReturns).set({ status: "CANCELLED" }).where(eq(salesReturns.id, id));
  await auditDocumentAction(salesReturn.companyId, userId, "CANCEL", "SALES_RETURN", id, `U anulua kthimi ${salesReturn.docNumber}`);
  return { success: true };
}

export async function deleteSalesReturnDraft(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const salesReturn = await getSalesReturnById(id);
  if (!salesReturn) throw new Error("Kthimi nuk u gjet");
  if (!canDeleteSalesDraft(salesReturn.status)) throw new Error("Vetëm kthimet Draft mund të fshihen.");
  await auditDocumentAction(salesReturn.companyId, userId, "DELETE", "SALES_RETURN", id, `U fshi kthimi Draft ${salesReturn.docNumber}`);
  await db.delete(salesReturnItems).where(eq(salesReturnItems.salesReturnId, id));
  await db.delete(salesReturns).where(eq(salesReturns.id, id));
  return { success: true };
}

export async function createSalesInvoiceFromDelivery(data: { companyId: number; docNumber: string; date: Date; deliveryNoteId: number; warehouseId: number; currency: string; exchangeRate: number }) {
  const delivery = await getDeliveryNoteById(data.deliveryNoteId);
  if (!delivery || delivery.companyId !== data.companyId) throw new Error("Fletë-dalja nuk i përket kompanisë");
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existingInvoice = await db.select().from(salesInvoices).where(eq(salesInvoices.deliveryNoteId, delivery.id)).limit(1);
  if (!canInvoiceDelivery(delivery.status, existingInvoice.length > 0)) {
    throw new Error(existingInvoice.length > 0 ? "Kjo fletë-dalje është faturuar tashmë" : "Fletë-dalja duhet të validohet para faturimit");
  }
  const items = await getDeliveryItems(delivery.id);
  const orderItems = delivery.salesOrderId ? await getSalesOrderItems(delivery.salesOrderId) : [];
  const prices = new Map(orderItems.map(item => [item.productId, item.unitPrice]));
  const invoiceItems = items.map(item => {
    const unitPrice = item.productId ? prices.get(item.productId) ?? 0 : 0;
    return { productId: item.productId, productName: item.productName, quantity: item.quantity, unit: item.unit, unitPrice, totalPrice: item.quantity * unitPrice };
  });
  return createSalesInvoice({
    companyId: data.companyId,
    docNumber: data.docNumber,
    date: data.date,
    customerId: delivery.customerId,
    customerName: delivery.customerName,
    warehouseId: data.warehouseId,
    salesOrderId: delivery.salesOrderId,
    deliveryNoteId: delivery.id,
    currency: data.currency,
    exchangeRate: data.exchangeRate.toFixed(6),
    totalAmount: invoiceItems.reduce((sum, item) => sum + item.totalPrice, 0),
  }, invoiceItems);
}

export async function createSalesInvoiceFromOrder(data: { companyId: number; docNumber: string; date: Date; salesOrderId: number; warehouseId: number; currency: string; exchangeRate: number }) {
  const order = await getSalesOrderById(data.salesOrderId);
  if (!order || order.companyId !== data.companyId) throw new Error("Porosia nuk i përket kompanisë");
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existingInvoice = await db.select().from(salesInvoices).where(eq(salesInvoices.salesOrderId, order.id)).limit(1);
  if (!canInvoiceSalesOrder(order.status, existingInvoice.length > 0)) {
    throw new Error(existingInvoice.length > 0 ? "Kjo porosi është faturuar tashmë" : "Porosia duhet të konfirmohet para faturimit");
  }
  const orderItems = await getSalesOrderItems(order.id);
  if (orderItems.length === 0) throw new Error("Porosia nuk ka artikuj");
  const invoiceItems = orderItems.map(item => ({ productId: item.productId, productName: item.productName, quantity: item.quantity, unit: item.unit, unitPrice: item.unitPrice, totalPrice: item.totalPrice }));
  return createSalesInvoice({
    companyId: data.companyId,
    docNumber: data.docNumber,
    date: data.date,
    customerId: order.customerId,
    customerName: order.customerName,
    warehouseId: data.warehouseId,
    salesOrderId: order.id,
    currency: data.currency,
    exchangeRate: data.exchangeRate.toFixed(6),
    totalAmount: order.totalAmount,
  }, invoiceItems);
}

export async function getSalesReport(
  companyId: number,
  filters: { dateFrom?: Date; dateTo?: Date; customerId?: number },
) {
  const db = await getDb();
  if (!db) return { invoices: [], quotations: [], orders: [], deliveries: [], returns: [], metrics: { invoiceTotal: 0, orderTotal: 0, deliveriesCount: 0, returnsCount: 0, openOrdersCount: 0 }, byCustomer: [], byStatus: { invoices: {}, quotations: {}, orders: {}, deliveries: {}, returns: {} } };
  const [invoices, quotations, orders, deliveries, returns] = await Promise.all([
    getSalesInvoices(companyId), getSalesQuotations(companyId), getSalesOrders(companyId), getDeliveryNotes(companyId), getSalesReturns(companyId),
  ]);
  const inRange = (value: Date | null, customerId: number | null) => {
    const time = value?.getTime() ?? 0;
    return (!filters.dateFrom || time >= filters.dateFrom.getTime()) && (!filters.dateTo || time <= filters.dateTo.getTime() + 86_399_999) && (!filters.customerId || customerId === filters.customerId);
  };
  const filteredInvoices = invoices.filter(item => inRange(item.date, item.customerId));
  const filteredQuotations = quotations.filter(item => inRange(item.quotationDate, item.customerId));
  const filteredOrders = orders.filter(item => inRange(item.orderDate, item.customerId));
  const filteredDeliveries = deliveries.filter(item => inRange(item.deliveryDate, item.customerId));
  const filteredReturns = returns.filter(item => inRange(item.returnDate, item.customerId));
  const byCustomer = new Map<number | string, { customerId: number | null; customerName: string; invoiceTotal: number; orderTotal: number; deliveries: number; returns: number }>();
  const bucket = (customerId: number | null, customerName: string | null) => {
    const key = customerId ?? customerName ?? "unassigned";
    const value = byCustomer.get(key) ?? { customerId, customerName: customerName || "Pa klient", invoiceTotal: 0, orderTotal: 0, deliveries: 0, returns: 0 };
    byCustomer.set(key, value); return value;
  };
  filteredInvoices.forEach(item => { bucket(item.customerId, item.customerName).invoiceTotal += item.totalAmount ?? 0; });
  filteredOrders.forEach(item => { bucket(item.customerId, item.customerName).orderTotal += item.totalAmount ?? 0; });
  filteredDeliveries.forEach(item => { bucket(item.customerId, item.customerName).deliveries += 1; });
  filteredReturns.forEach(item => { bucket(item.customerId, item.customerName).returns += 1; });
  return {
    invoices: filteredInvoices, quotations: filteredQuotations, orders: filteredOrders, deliveries: filteredDeliveries, returns: filteredReturns,
    metrics: { invoiceTotal: filteredInvoices.reduce((sum, item) => sum + (item.totalAmount ?? 0), 0), orderTotal: filteredOrders.reduce((sum, item) => sum + (item.totalAmount ?? 0), 0), deliveriesCount: filteredDeliveries.length, returnsCount: filteredReturns.length, openOrdersCount: filteredOrders.filter(item => item.status === "CONFIRMED").length },
    byCustomer: Array.from(byCustomer.values()).sort((a, b) => b.invoiceTotal - a.invoiceTotal),
    byStatus: { invoices: summarizeDocumentStatuses(filteredInvoices), quotations: summarizeDocumentStatuses(filteredQuotations), orders: summarizeDocumentStatuses(filteredOrders), deliveries: summarizeDocumentStatuses(filteredDeliveries), returns: summarizeDocumentStatuses(filteredReturns) },
  };
}

// ============================================================
// AUDIT & SETTINGS
// ============================================================

export async function getSettings(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(settings)
    .where(eq(settings.companyId, companyId));
}

export async function getSetting(companyId: number, key: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(settings)
    .where(and(eq(settings.companyId, companyId), eq(settings.key, key)))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createAuditLog(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(auditLogs).values(data);
}

export async function getAuditLogEntries(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: auditLogs.id,
    companyId: auditLogs.companyId,
    userId: auditLogs.userId,
    action: auditLogs.action,
    entityType: auditLogs.entityType,
    entityId: auditLogs.entityId,
    details: auditLogs.details,
    createdAt: auditLogs.createdAt,
    userName: users.name,
  }).from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .where(eq(auditLogs.companyId, companyId))
    .orderBy(desc(auditLogs.createdAt));
}

export async function getEmployeeDocuments(companyId: number, employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employeeDocuments).where(and(eq(employeeDocuments.companyId, companyId), eq(employeeDocuments.employeeId, employeeId)));
}

export async function getStorageObjectCompanyId(fileKey: string): Promise<number | null> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const cargo = await database.select({ companyId: cargoLoadDocuments.companyId }).from(cargoLoadDocuments).where(eq(cargoLoadDocuments.fileKey, fileKey)).limit(1);
  if (cargo[0]?.companyId) return cargo[0].companyId;
  const purchase = await database.select({ companyId: purchaseOrders.companyId }).from(purchaseOrderAttachments).innerJoin(purchaseOrders, eq(purchaseOrderAttachments.purchaseOrderId, purchaseOrders.id)).where(eq(purchaseOrderAttachments.fileKey, fileKey)).limit(1);
  if (purchase[0]?.companyId) return purchase[0].companyId;
  const employee = await database.select({ companyId: employeeDocuments.companyId }).from(employeeDocuments).where(eq(employeeDocuments.fileKey, fileKey)).limit(1);
  return employee[0]?.companyId ?? null;
}

export async function createEmployeeDocument(data: { companyId: number; employeeId: number; documentType: string; documentName: string; fileUrl: string; fileKey: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const [res] = await db.insert(employeeDocuments).values(data);
  return { id: res.insertId, ...data };
}

export async function deleteEmployeeDocument(companyId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  await db.delete(employeeDocuments).where(and(eq(employeeDocuments.companyId, companyId), eq(employeeDocuments.id, id)));
  return { success: true };
}

export async function resetPayrollData(companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  // Fshin të dhënat e testimit të pagave për kompaninë aktive, duke respektuar integritetin e referencave
  const periods = await db.select({ id: payrollPeriods.id }).from(payrollPeriods).where(eq(payrollPeriods.companyId, companyId));
  for (const period of periods) {
    await db.delete(payrollPeriodBonuses).where(eq(payrollPeriodBonuses.payrollPeriodId, period.id));
    await db.delete(payrollEntries).where(eq(payrollEntries.payrollPeriodId, period.id));
    await db.delete(payrollAttendance).where(eq(payrollAttendance.payrollPeriodId, period.id));
  }
  await db.delete(payrollPeriods).where(eq(payrollPeriods.companyId, companyId));
  await db.delete(payrollLeaveAbsences).where(eq(payrollLeaveAbsences.companyId, companyId));
  await db.delete(payrollDeviceMappings).where(eq(payrollDeviceMappings.companyId, companyId));
  await db.delete(payrollEmployees).where(eq(payrollEmployees.companyId, companyId));
  return { success: true };
}
