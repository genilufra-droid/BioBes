import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { MAX_CARGO_DOCUMENT_BYTES, validateCargoDocumentInput } from "./cargoDocumentValidation";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { calculatePurchaseTotal } from "./purchase";
import { COOKIE_NAME } from "../shared/const";
import { canAssignCompanyRole, canManageCompanyRoles, canWriteCompany } from "./companyRoles";
import { paymentAuditDetails } from "./paymentAudit";
import { normalizeInvoiceCurrency } from "./currency";
import { allocateSalesImportDocNumber, normalizeSalesImportValue, salesImportRowsOverlap, salesInvoiceImportIdentity } from "./salesImportIdentity";

const purchaseLineSchema = z.object({
  productId: z.number().int().positive().optional(),
  productName: z.string().min(1).max(255),
  plantType: z.string().max(100).optional(),
  productCode: z.string().max(100).optional(),
  sackCount: z.number().int().min(0).optional(),
  grossWeightKg: z.number().int().min(0).optional(),
  netWeightKg: z.number().int().min(0).optional(),
  loadedQuantity: z.number().int().min(0).optional(),
  notes: z.string().max(5000).optional(),
  quantity: z.number().int().positive(),
  unit: z.string().max(50).optional(),
  unitPrice: z.number().int().min(0).default(0),
});

const stockLineSchema = z.object({
  productId: z.number().int().positive(),
  productName: z.string().min(1).max(255),
  quantity: z.number().int().positive(),
  unit: z.string().max(50).optional(),
});

const journalLineSchema = z.object({
  accountId: z.number().int().positive(),
  description: z.string().max(500).optional(),
  debit: z.number().int().min(0),
  credit: z.number().int().min(0),
  partnerType: z.enum(["SUPPLIER", "CUSTOMER"]).optional(),
  partnerId: z.number().int().positive().optional(),
});

async function assertCompanyAccess(userId: number, companyId: number) {
  const memberships = await db.getUserCompanies(userId);
  if (!memberships.some(membership => membership.companyId === companyId)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Nuk keni akses në këtë kompani." });
  }
}

async function assertCompanyRoleManager(user: { id: number; role: "admin" | "user" }, companyId: number) {
  await assertCompanyAccess(user.id, companyId);
  const membership = await db.getCompanyMembership(companyId, user.id);
  if (!canManageCompanyRoles(user.role, membership?.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Nuk keni të drejtë të menaxhoni rolet e kësaj kompanie." });
}

async function assertCompanyWriteAccess(user: { id: number; role: "admin" | "user" }, companyId: number) {
  await assertCompanyAccess(user.id, companyId);
  const membership = await db.getCompanyMembership(companyId, user.id);
  if (!canWriteCompany(user.role, membership?.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Roli Lexues ka vetëm akses për lexim." });
}

export const appRouter = router({
  creditNotes: router({
    list: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => { await assertCompanyAccess(ctx.user.id, input.companyId); return db.getCreditNotes(input.companyId); }),
    create: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), creditNoteNumber: z.string().min(1).max(50), noteDate: z.date(), sourceType: z.enum(["PURCHASE", "SALE"]), sourceInvoiceId: z.number().int().positive(), sourceInvoiceNumber: z.string().min(1).max(50), partnerName: z.string().min(1).max(255), amount: z.number().int().nonnegative(), vatAmount: z.number().int().nonnegative().default(0), reason: z.string().max(5000).optional() })).mutation(async ({ ctx, input }) => {
      await assertCompanyWriteAccess(ctx.user, input.companyId);
      const source = input.sourceType === "PURCHASE" ? await db.getPurchaseInvoiceById(input.sourceInvoiceId) : await db.getSalesInvoiceById(input.sourceInvoiceId);
      if (!source || source.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Fatura burimore nuk u gjet për kompaninë aktive." });
      const sourceInvoiceNumber = source.docNumber;
      const partnerName = input.sourceType === "PURCHASE"
        ? (source as Awaited<ReturnType<typeof db.getPurchaseInvoiceById>>)?.supplierName
        : (source as Awaited<ReturnType<typeof db.getSalesInvoiceById>>)?.customerName;
      if (!partnerName) throw new TRPCError({ code: "BAD_REQUEST", message: "Fatura burimore nuk ka partner të vlefshëm." });
      return db.createCreditNote({ ...input, sourceInvoiceNumber, partnerName });
    }),
    setStatus: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive(), status: z.enum(["POSTED", "CANCELLED"]) })).mutation(async ({ input, ctx }) => {
      await assertCompanyWriteAccess(ctx.user, input.companyId);
      const note = await db.setCreditNoteStatus(input.companyId, input.id, input.status);
      await db.createAuditLog({ companyId: input.companyId, userId: ctx.user.id, action: input.status === "POSTED" ? "POST" : "CANCEL", entityType: "CREDIT_NOTE", entityId: note.id, details: `${note.creditNoteNumber} · ${input.status === "POSTED" ? "Postuar" : "Anuluar"}` });
      return note;
    }),
    deleteDraft: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
      await assertCompanyWriteAccess(ctx.user, input.companyId);
      const note = await db.deleteCreditNoteDraft(input.companyId, input.id);
      await db.createAuditLog({ companyId: input.companyId, userId: ctx.user.id, action: "DELETE", entityType: "CREDIT_NOTE", entityId: note.id, details: `${note.creditNoteNumber} · Fshirë Draft` });
      return { success: true };
    }),
  }),
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================================
  // COMPANY & USER MANAGEMENT
  // ============================================================
  company: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const userCompanies = await db.getUserCompanies(ctx.user.id);
      const companies = await Promise.all(
        userCompanies.map(uc => db.getCompanyById(uc.companyId))
      );
      return companies.filter(Boolean);
    }),

    get: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getCompanyById(input.companyId);
      }),

    users: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      await assertCompanyRoleManager(ctx.user, input.companyId);
      return db.getCompanyUsers(input.companyId);
    }),

    setUserRole: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), userId: z.number().int().positive(), role: z.enum(["admin", "user", "viewer"]) })).mutation(async ({ ctx, input }) => {
      await assertCompanyRoleManager(ctx.user, input.companyId);
      const membership = await db.getCompanyMembership(input.companyId, input.userId);
      if (!membership) throw new TRPCError({ code: "NOT_FOUND", message: "Përdoruesi nuk është anëtar i kompanisë." });
      if (!canAssignCompanyRole(membership.role, input.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Roli owner nuk mund të ndryshohet nga ky panel." });
      await db.updateCompanyUserRole(input.companyId, input.userId, input.role);
      await db.createAuditLog({ companyId: input.companyId, userId: ctx.user.id, action: "UPDATE", entityType: "USER_COMPANY_ROLE", entityId: input.userId, details: `Roli i përdoruesit u ndryshua në ${input.role}.` });
      return { success: true };
    }),

    findUsers: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), search: z.string().min(2).max(320) })).query(async ({ ctx, input }) => {
      await assertCompanyRoleManager(ctx.user, input.companyId);
      return db.searchRegisteredUsers(input.search);
    }),

    addUser: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), userId: z.number().int().positive(), role: z.enum(["admin", "user", "viewer"]) })).mutation(async ({ ctx, input }) => {
      await assertCompanyRoleManager(ctx.user, input.companyId);
      await db.addCompanyUser(input.companyId, input.userId, input.role);
      await db.createAuditLog({ companyId: input.companyId, userId: ctx.user.id, action: "CREATE", entityType: "USER_COMPANY_ROLE", entityId: input.userId, details: `Përdoruesi u shtua me rolin ${input.role}.` });
      return { success: true };
    }),

    removeUser: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), userId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await assertCompanyRoleManager(ctx.user, input.companyId);
      const membership = await db.getCompanyMembership(input.companyId, input.userId);
      if (!membership) throw new TRPCError({ code: "NOT_FOUND", message: "Përdoruesi nuk është anëtar i kompanisë." });
      if (!canAssignCompanyRole(membership.role, "viewer") || input.userId === ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Pronarët dhe përdoruesi aktiv nuk mund të hiqen nga ky panel." });
      await db.removeCompanyUser(input.companyId, input.userId);
      await db.createAuditLog({ companyId: input.companyId, userId: ctx.user.id, action: "DELETE", entityType: "USER_COMPANY_ROLE", entityId: input.userId, details: "Përdoruesi u hoq nga kompania." });
      return { success: true };
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        nipt: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const created = await db.createCompanyWithOwner(ctx.user.id, input);
        return { success: true, companyId: created.companyId };
      }),
    update: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), name: z.string().min(1).max(255), nipt: z.string().max(100).optional(), address: z.string().max(500).optional(), city: z.string().max(100).optional(), phone: z.string().max(50).optional(), email: z.string().email().max(320).optional().or(z.literal("")), accountingPlan: z.enum(["PKP", "SKK"]).optional(), postingMode: z.enum(["DIRECT", "INDIRECT"]).optional(), customerDueEnabled: z.number().int().min(0).max(1).optional(), supplierDueEnabled: z.number().int().min(0).max(1).optional(), salesPriceMode: z.enum(["NET", "GROSS"]).optional(), itemDetailing: z.number().int().min(0).max(1).optional(), allowDocumentEditAfterSave: z.number().int().min(0).max(1).optional(), archiveEnabled: z.number().int().min(0).max(1).optional(), automaticBackupReminder: z.number().int().min(0).max(1).optional(), customFieldsCustomers: z.number().int().min(0).max(1).optional(), customFieldsSuppliers: z.number().int().min(0).max(1).optional(), customFieldsProducts: z.number().int().min(0).max(1).optional() }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        const { companyId, email, ...data } = input;
        return db.updateCompany(companyId, { ...data, email: email || null });
      }),
  }),

  // ============================================================
  // SUPPLIERS
  // ============================================================
  supplier: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getSuppliers(input.companyId);
      }),

    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        code: z.string().optional(),
        name: z.string(),
        nipt: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        profileData: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createSupplier(input);
      }),
    update: protectedProcedure.input(z.object({ companyId: z.number(), id: z.number(), code: z.string().optional(), name: z.string(), nipt: z.string().optional(), phone: z.string().optional(), email: z.string().optional(), address: z.string().optional(), city: z.string().optional(), profileData: z.string().optional() })).mutation(async ({ input }) => { const { companyId, id, ...data } = input; return db.updateSupplier(id, companyId, data); }),
    delete: protectedProcedure.input(z.object({ companyId: z.number(), id: z.number() })).mutation(async ({ input }) => db.deleteSupplier(input.id, input.companyId)),
  }),

  // ============================================================
  // CUSTOMERS
  // ============================================================
  customer: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getCustomers(input.companyId);
      }),

    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        code: z.string().optional(),
        name: z.string(),
        nipt: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        profileData: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createCustomer(input);
      }),
    update: protectedProcedure.input(z.object({ companyId: z.number(), id: z.number(), code: z.string().optional(), name: z.string(), nipt: z.string().optional(), phone: z.string().optional(), email: z.string().optional(), address: z.string().optional(), city: z.string().optional(), profileData: z.string().optional() })).mutation(async ({ input }) => { const { companyId, id, ...data } = input; return db.updateCustomer(id, companyId, data); }),
    delete: protectedProcedure.input(z.object({ companyId: z.number(), id: z.number() })).mutation(async ({ input }) => db.deleteCustomer(input.id, input.companyId)),
  }),

  // ============================================================
  // CONFIGURATION CATALOGS
  // ============================================================
  issuer: router({
    list: protectedProcedure.input(z.object({ companyId: z.number() })).query(async ({ ctx, input }) => { await assertCompanyAccess(ctx.user.id, input.companyId); return db.getIssuers(input.companyId); }),
    create: protectedProcedure.input(z.object({ companyId: z.number(), code: z.string().min(1).max(50), name: z.string().min(1).max(255), active: z.number().int().min(0).max(1).default(1) })).mutation(async ({ ctx, input }) => { await assertCompanyWriteAccess(ctx.user, input.companyId); return db.createIssuer(input); }),
    update: protectedProcedure.input(z.object({ companyId: z.number(), id: z.number(), code: z.string().min(1).max(50), name: z.string().min(1).max(255), active: z.number().int().min(0).max(1) })).mutation(async ({ ctx, input }) => { await assertCompanyWriteAccess(ctx.user, input.companyId); const { companyId, id, ...data } = input; return db.updateIssuer(id, companyId, data); }),
    delete: protectedProcedure.input(z.object({ companyId: z.number(), id: z.number() })).mutation(async ({ ctx, input }) => { await assertCompanyWriteAccess(ctx.user, input.companyId); return db.deleteIssuer(input.id, input.companyId); }),
  }),
  documentGroup: router({
    list: protectedProcedure.input(z.object({ companyId: z.number() })).query(async ({ ctx, input }) => { await assertCompanyAccess(ctx.user.id, input.companyId); return db.getDocumentGroups(input.companyId); }),
    create: protectedProcedure.input(z.object({ companyId: z.number(), code: z.string().min(1).max(50), name: z.string().min(1).max(255), documentType: z.string().min(1).max(50) })).mutation(async ({ ctx, input }) => { await assertCompanyWriteAccess(ctx.user, input.companyId); return db.createDocumentGroup(input); }),
    update: protectedProcedure.input(z.object({ companyId: z.number(), id: z.number(), code: z.string().min(1).max(50), name: z.string().min(1).max(255), documentType: z.string().min(1).max(50) })).mutation(async ({ ctx, input }) => { await assertCompanyWriteAccess(ctx.user, input.companyId); const { companyId, id, ...data } = input; return db.updateDocumentGroup(id, companyId, data); }),
    delete: protectedProcedure.input(z.object({ companyId: z.number(), id: z.number() })).mutation(async ({ ctx, input }) => { await assertCompanyWriteAccess(ctx.user, input.companyId); return db.deleteDocumentGroup(input.id, input.companyId); }),
  }),
  costCenter: router({
    list: protectedProcedure.input(z.object({ companyId: z.number() })).query(async ({ ctx, input }) => { await assertCompanyAccess(ctx.user.id, input.companyId); return db.getCostCenters(input.companyId); }),
    create: protectedProcedure.input(z.object({ companyId: z.number(), code: z.string().min(1).max(50), name: z.string().min(1).max(255), active: z.number().int().min(0).max(1).default(1), mainProduction: z.number().int().min(0).max(1).default(0) })).mutation(async ({ ctx, input }) => { await assertCompanyWriteAccess(ctx.user, input.companyId); return db.createCostCenter(input); }),
    update: protectedProcedure.input(z.object({ companyId: z.number(), id: z.number(), code: z.string().min(1).max(50), name: z.string().min(1).max(255), active: z.number().int().min(0).max(1), mainProduction: z.number().int().min(0).max(1) })).mutation(async ({ ctx, input }) => { await assertCompanyWriteAccess(ctx.user, input.companyId); const { companyId, id, ...data } = input; return db.updateCostCenter(id, companyId, data); }),
    delete: protectedProcedure.input(z.object({ companyId: z.number(), id: z.number() })).mutation(async ({ ctx, input }) => { await assertCompanyWriteAccess(ctx.user, input.companyId); return db.deleteCostCenter(input.id, input.companyId); }),
  }),

  // ============================================================
  // PRODUCTS
  // ============================================================
  product: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getProducts(input.companyId);
      }),

    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        code: z.string().optional(),
        name: z.string(),
        barcode: z.string().optional(),
        categoryId: z.number().optional(),
        baseUnit: z.string().optional(),
        itemType: z.enum(["QARKULLUES", "AFATGJATE", "SHERBIM"]).optional(),
        lastPrice: z.number().int().nonnegative().optional(),
        price1: z.number().int().nonnegative().optional(),
        price2: z.number().int().nonnegative().optional(),
        discount1: z.number().int().min(0).max(10000).optional(),
        discount2: z.number().int().min(0).max(10000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        const product = await db.createProduct(input);
        return { id: product.id };
      }),

    update: protectedProcedure
      .input(z.object({
        companyId: z.number().int().positive(),
        id: z.number().int().positive(),
        code: z.string().optional(),
        name: z.string().trim().min(1),
        barcode: z.string().optional(),
        categoryId: z.number().int().positive().optional(),
        baseUnit: z.string().optional(),
        itemType: z.enum(["QARKULLUES", "AFATGJATE", "SHERBIM"]).optional(),
        price1: z.number().int().nonnegative().optional(),
        price2: z.number().int().nonnegative().optional(),
        discount1: z.number().int().min(0).max(10000).optional(),
        discount2: z.number().int().min(0).max(10000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        const { id, companyId, ...data } = input;
        return db.updateProduct(id, companyId, data);
      }),

    delete: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.deleteProduct(input.id, input.companyId);
      }),
  }),

  // ============================================================
  // MASTER DATA
  // ============================================================
  category: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getCategories(input.companyId);
      }),
  }),

  unit: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getUnits(input.companyId);
      }),
    create: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), name: z.string().trim().min(1).max(50), abbreviation: z.string().trim().max(10).optional() })).mutation(async ({ ctx, input }) => {
      await assertCompanyWriteAccess(ctx.user, input.companyId);
      const result = await db.createUnit(input.companyId, input.name, input.abbreviation);
      await db.createAuditLog({ companyId: input.companyId, userId: ctx.user.id, action: "CREATE", entityType: "UNIT_MEASURE", entityId: Number(result[0].insertId), details: `Njësi matje: ${input.name}` });
      return result;
    }),
    update: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive(), name: z.string().trim().min(1).max(50), abbreviation: z.string().trim().max(10).optional() })).mutation(async ({ ctx, input }) => {
      await assertCompanyWriteAccess(ctx.user, input.companyId);
      const result = await db.updateUnit(input.companyId, input.id, input.name, input.abbreviation);
      await db.createAuditLog({ companyId: input.companyId, userId: ctx.user.id, action: "UPDATE", entityType: "UNIT_MEASURE", entityId: input.id, details: `Njësi matje: ${result.name}` });
      return result;
    }),
    delete: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await assertCompanyWriteAccess(ctx.user, input.companyId);
      await db.deleteUnit(input.companyId, input.id);
      await db.createAuditLog({ companyId: input.companyId, userId: ctx.user.id, action: "DELETE", entityType: "UNIT_MEASURE", entityId: input.id, details: "Njësi matje u fshi" });
      return { success: true };
    }),
  }),

  warehouse: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getWarehouses(input.companyId);
      }),
    create: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), name: z.string().trim().min(1).max(255), code: z.string().trim().max(50).optional(), unitType: z.enum(["WAREHOUSE", "POINT_OF_SALE", "OFFICE", "OTHER"]).optional(), active: z.number().int().min(0).max(1).optional(), address: z.string().trim().max(255).optional(), location: z.string().trim().max(255).optional(), contact: z.string().trim().max(255).optional(), notes: z.string().trim().max(5000).optional(), inventoryMethod: z.enum(["INTERMEDIATE", "CONTINUOUS", "INVENTORY"]).optional(), supplyPointOfSale: z.number().int().min(0).max(1).optional(), allowNegativeStock: z.number().int().min(0).max(1).optional() }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyWriteAccess(ctx.user, input.companyId);
        return db.createWarehouse(input);
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number().int().positive(), companyId: z.number().int().positive(), name: z.string().trim().min(1).max(255), code: z.string().trim().max(50).optional(), unitType: z.enum(["WAREHOUSE", "POINT_OF_SALE", "OFFICE", "OTHER"]), active: z.number().int().min(0).max(1), address: z.string().trim().max(255).optional(), location: z.string().trim().max(255).optional(), contact: z.string().trim().max(255).optional(), notes: z.string().trim().max(5000).optional(), inventoryMethod: z.enum(["INTERMEDIATE", "CONTINUOUS", "INVENTORY"]), supplyPointOfSale: z.number().int().min(0).max(1), allowNegativeStock: z.number().int().min(0).max(1) }))
      .mutation(async ({ ctx, input }) => { await assertCompanyWriteAccess(ctx.user, input.companyId); const { id, ...data } = input; return db.updateWarehouse(id, data); }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int().positive(), companyId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => { await assertCompanyWriteAccess(ctx.user, input.companyId); return db.deleteWarehouse(input.companyId, input.id); }),
  }),

  // ============================================================
  // INVENTORY & WAREHOUSE
  // ============================================================
  stockLocation: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getStockLocations(input.companyId);
      }),
    create: protectedProcedure
      .input(z.object({
        companyId: z.number().int().positive(), warehouseId: z.number().int().positive(),
        code: z.string().max(50).optional(), name: z.string().min(1).max(255),
        locationType: z.enum(["INTERNAL", "INPUT", "OUTPUT", "VIRTUAL"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.createStockLocation(input);
      }),
  }),

  stockMovement: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getStockMovements(input.companyId);
      }),
  }),

  stockBalance: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getStockBalances(input.companyId);
      }),
  }),

  stockReport: router({
    get: protectedProcedure
      .input(z.object({
        companyId: z.number().int().positive(),
        dateFrom: z.date().optional(), dateTo: z.date().optional(),
        warehouseId: z.number().int().positive().optional(), productId: z.number().int().positive().optional(),
      }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        const { companyId, ...filters } = input;
        return db.getStockReport(companyId, filters);
      }),
  }),

  stockTransfer: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getStockTransfers(input.companyId);
      }),
    items: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), stockTransferId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        const transfer = (await db.getStockTransfers(input.companyId)).find(item => item.id === input.stockTransferId);
        if (!transfer) throw new TRPCError({ code: "NOT_FOUND", message: "Transferi nuk u gjet." });
        return db.getStockTransferItems(input.stockTransferId);
      }),
    create: protectedProcedure
      .input(z.object({
        companyId: z.number().int().positive(), docNumber: z.string().min(1).max(50), transferDate: z.date(),
        sourceWarehouseId: z.number().int().positive(), destinationWarehouseId: z.number().int().positive(),
        sourceLocationId: z.number().int().positive().optional(), destinationLocationId: z.number().int().positive().optional(),
        notes: z.string().max(5000).optional(), items: z.array(stockLineSchema).min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        const { items, ...data } = input;
        return db.createStockTransfer(data, items);
      }),
    validate: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        const transfer = (await db.getStockTransfers(input.companyId)).find(item => item.id === input.id);
        if (!transfer) throw new TRPCError({ code: "NOT_FOUND", message: "Transferi nuk u gjet." });
        return db.validateStockTransfer(input.id);
      }),
    cancel: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const transfer = await db.getStockTransferById(input.id);
        if (!transfer || transfer.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Transferi nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, input.companyId);
        try { return await db.cancelStockTransfer(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Transferi nuk mund të anulohet." }); }
      }),
    deleteDraft: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const transfer = await db.getStockTransferById(input.id);
        if (!transfer || transfer.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Transferi nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, input.companyId);
        try { return await db.deleteStockTransferDraft(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Transferi nuk mund të fshihet." }); }
      }),
  }),

  inventoryAdjustment: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getInventoryAdjustments(input.companyId);
      }),
    items: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), inventoryAdjustmentId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        const adjustment = (await db.getInventoryAdjustments(input.companyId)).find(item => item.id === input.inventoryAdjustmentId);
        if (!adjustment) throw new TRPCError({ code: "NOT_FOUND", message: "Inventarizimi nuk u gjet." });
        return db.getInventoryAdjustmentItems(input.inventoryAdjustmentId);
      }),
    create: protectedProcedure
      .input(z.object({
        companyId: z.number().int().positive(), docNumber: z.string().min(1).max(50), adjustmentDate: z.date(),
        warehouseId: z.number().int().positive(), locationId: z.number().int().positive().optional(), notes: z.string().max(5000).optional(),
        items: z.array(z.object({
          productId: z.number().int().positive(), productName: z.string().min(1).max(255),
          countedQuantity: z.number().int().min(0),
        })).min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        const { items, ...data } = input;
        return db.createInventoryAdjustment(data, items);
      }),
    validate: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        const adjustment = (await db.getInventoryAdjustments(input.companyId)).find(item => item.id === input.id);
        if (!adjustment) throw new TRPCError({ code: "NOT_FOUND", message: "Inventarizimi nuk u gjet." });
        return db.validateInventoryAdjustment(input.id);
      }),
    cancel: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const adjustment = await db.getInventoryAdjustmentById(input.id);
        if (!adjustment || adjustment.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Inventarizimi nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, input.companyId);
        try { return await db.cancelInventoryAdjustment(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Inventarizimi nuk mund të anulohet." }); }
      }),
    deleteDraft: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const adjustment = await db.getInventoryAdjustmentById(input.id);
        if (!adjustment || adjustment.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Inventarizimi nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, input.companyId);
        try { return await db.deleteInventoryAdjustmentDraft(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Inventarizimi nuk mund të fshihet." }); }
      }),
  }),

  agent: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getAgents(input.companyId);
      }),
    create: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), code: z.string().max(50).optional(), name: z.string().min(1).max(255), phone: z.string().max(50).optional(), licenseNumber: z.string().max(100).optional() }))
      .mutation(async ({ input }) => db.createAgent(input)),
  }),

  vehicle: router({
    list: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ input }) => db.getVehicles(input.companyId)),
    create: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), plateNumber: z.string().min(1).max(50), vehicleType: z.string().max(100).optional(), makeModel: z.string().max(255).optional(), capacityKg: z.number().int().nonnegative().optional(), driverId: z.number().int().positive().optional() })).mutation(async ({ input }) => db.createVehicle(input)),
  }),

  cargoLoad: router({
    list: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ input }) => db.getCargoLoads(input.companyId)),
    create: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), loadNumber: z.string().min(1).max(50), loadDate: z.coerce.date(), customerId: z.number().int().positive().optional(), customerName: z.string().max(255).optional(), driverId: z.number().int().positive().optional(), vehicleId: z.number().int().positive().optional(), origin: z.string().max(255).optional(), destination: z.string().max(255).optional(), weightKg: z.number().int().nonnegative().optional(), notes: z.string().max(5000).optional() })).mutation(async ({ input }) => db.createCargoLoad(input)),
    cancel: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => db.cancelCargoLoad(input.id, ctx.user.id)),
    deleteDraft: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => db.deleteCargoLoadDraft(input.id, ctx.user.id)),
    documents: router({
      list: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), cargoLoadId: z.number().int().positive() })).query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        const load = await db.getCargoLoadById(input.cargoLoadId);
        if (!load || load.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Ngarkesa nuk u gjet në kompaninë aktive." });
        return db.getCargoLoadDocuments(input.cargoLoadId, input.companyId);
      }),
      upload: protectedProcedure.input(z.object({
        companyId: z.number().int().positive(),
        cargoLoadId: z.number().int().positive(),
        documentType: z.string().min(1).max(80),
        fileName: z.string().min(1).max(255),
        mimeType: z.string().max(180).optional(),
        fileSize: z.number().int().positive().max(25 * 1024 * 1024),
        base64: z.string().min(1).max(35_000_000),
        purchaseOrderId: z.number().int().positive().optional(),
        purchaseInvoiceId: z.number().int().positive().optional(),
        salesOrderId: z.number().int().positive().optional(),
        salesInvoiceId: z.number().int().positive().optional(),
      })).mutation(async ({ ctx, input }) => {
        await assertCompanyWriteAccess(ctx.user, input.companyId);
        const load = await db.getCargoLoadById(input.cargoLoadId);
        if (!load || load.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Ngarkesa nuk u gjet në kompaninë aktive." });
        const bytes = Buffer.from(input.base64, "base64");
        const validationError = validateCargoDocumentInput(input.fileName, input.fileSize, bytes.length);
        if (validationError) throw new TRPCError({ code: "BAD_REQUEST", message: validationError });
        if (bytes.length > MAX_CARGO_DOCUMENT_BYTES) throw new TRPCError({ code: "BAD_REQUEST", message: "Skedari është bosh ose tejkalon 25 MB." });
        return db.addCargoLoadDocument({ ...input, bytes, uploadedBy: ctx.user.id });
      }),
    }),
  }),

  payroll: router({
    employees: router({
      list: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => { await assertCompanyAccess(ctx.user.id, input.companyId); return db.getPayrollEmployees(input.companyId); }),
      create: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), employeeNumber: z.string().min(1).max(50), firstName: z.string().min(1).max(100), lastName: z.string().max(100).optional(), position: z.string().max(150).optional(), regularRateCents: z.number().int().nonnegative().default(0), overtimeRateCents: z.number().int().nonnegative().default(0), baseSalaryCents: z.number().int().nonnegative().default(0), advanceCents: z.number().int().nonnegative().default(0), paymentMethod: z.enum(["BANK", "CASH"]).default("BANK"), bankName: z.string().max(150).optional(), bankAccount: z.string().max(100).optional(), isForeign: z.number().int().min(0).max(1).default(0), shiftCode: z.enum(["A", "B", "C"]).default("A"), dailyRateCents: z.number().int().nonnegative().default(0), active: z.number().int().min(0).max(1).default(1) })).mutation(async ({ ctx, input }) => { await assertCompanyWriteAccess(ctx.user, input.companyId); return db.createPayrollEmployee(input); }),
      createBulk: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), rows: z.array(z.object({ employeeNumber: z.string().min(1).max(50), firstName: z.string().min(1).max(100), lastName: z.string().max(100).optional() })).max(500) })).mutation(async ({ ctx, input }) => { await assertCompanyWriteAccess(ctx.user, input.companyId); return db.createPayrollEmployeesBulk(input.companyId, input.rows); }),
      update: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive(), regularRateCents: z.number().int().nonnegative(), overtimeRateCents: z.number().int().nonnegative(), baseSalaryCents: z.number().int().nonnegative(), advanceCents: z.number().int().nonnegative(), dailyRateCents: z.number().int().nonnegative(), paymentMethod: z.enum(["BANK", "CASH"]), bankName: z.string().max(150).optional(), bankAccount: z.string().max(100).optional(), isForeign: z.number().int().min(0).max(1), shiftCode: z.enum(["A", "B", "C"]), active: z.number().int().min(0).max(1) })).mutation(async ({ ctx, input }) => { await assertCompanyWriteAccess(ctx.user, input.companyId); const employee = (await db.getPayrollEmployees(input.companyId)).find(item => item.id === input.id); if (!employee) throw new Error("Punonjësi nuk u gjet për kompaninë aktive."); return db.updatePayrollEmployeePayment(input.id, input); }),
      importData: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), rows: z.array(z.object({ id: z.number().int().positive(), regularRateCents: z.number().int().nonnegative(), overtimeRateCents: z.number().int().nonnegative(), baseSalaryCents: z.number().int().nonnegative(), bankPaymentCents: z.number().int().nonnegative(), cashPaymentCents: z.number().int(), paymentMethod: z.enum(["BANK", "CASH"]), isForeign: z.number().int().min(0).max(1), dailyRateCents: z.number().int().nonnegative() })).max(500) })).mutation(async ({ ctx, input }) => { await assertCompanyWriteAccess(ctx.user, input.companyId); return db.updatePayrollEmployeeImportData(input.companyId, input.rows); }),
    }),
    documents: router({
      list: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), employeeId: z.number().int().positive() })).query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        const employee = (await db.getPayrollEmployees(input.companyId)).find(item => item.id === input.employeeId);
        if (!employee) throw new TRPCError({ code: "NOT_FOUND", message: "Punonjësi nuk u gjet në kompaninë aktive." });
        return db.getEmployeeDocuments(input.companyId, input.employeeId);
      }),
      create: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), employeeId: z.number().int().positive(), documentType: z.string().min(1).max(40), documentName: z.string().min(1).max(255), fileUrl: z.string().min(1).max(25_000_000), fileKey: z.string().min(1).max(255) })).mutation(async ({ ctx, input }) => {
        await assertCompanyWriteAccess(ctx.user, input.companyId);
        const employee = (await db.getPayrollEmployees(input.companyId)).find(item => item.id === input.employeeId);
        if (!employee) throw new TRPCError({ code: "NOT_FOUND", message: "Punonjësi nuk u gjet në kompaninë aktive." });
        return db.createEmployeeDocument(input);
      }),
      delete: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
        await assertCompanyWriteAccess(ctx.user, input.companyId);
        return db.deleteEmployeeDocument(input.companyId, input.id);
      }),
    }),
    // Lidhje të përhershme pajisje biometrike → punonjës për importin e Logs.
    mappings: router({
      list: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => { await assertCompanyAccess(ctx.user.id, input.companyId); return db.getPayrollDeviceMappings(input.companyId); }),
      save: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), deviceId: z.string().min(1).max(100), payrollEmployeeId: z.number().int().positive(), active: z.number().int().min(0).max(1).default(1) })).mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        const employee = (await db.getPayrollEmployees(input.companyId)).find(item => item.id === input.payrollEmployeeId);
        if (!employee) throw new TRPCError({ code: "NOT_FOUND", message: "Punonjësi nuk u gjet në kompaninë aktive." });
        return db.savePayrollDeviceMapping(input);
      }),
    }),
    settings: router({
      get: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => { await assertCompanyAccess(ctx.user.id, input.companyId); return db.getPayrollSettings(input.companyId); }),
      save: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), paramsJson: z.string().min(2).max(20000) })).mutation(async ({ ctx, input }) => { await assertCompanyWriteAccess(ctx.user, input.companyId); return db.savePayrollSettings(input); }),
    }),
    periods: router({
      list: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => { await assertCompanyAccess(ctx.user.id, input.companyId); return db.getPayrollPeriods(input.companyId); }),
      history: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => { await assertCompanyAccess(ctx.user.id, input.companyId); return db.getPayrollPeriodHistory(input.companyId); }),
      create: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), year: z.number().int().min(2020).max(2100), month: z.number().int().min(1).max(12), currency: z.string().min(1).max(10).default("ALL"), taxRulesJson: z.string().max(10000).optional(), socialEmployeeRateBp: z.number().int().nonnegative().default(0), socialEmployerRateBp: z.number().int().nonnegative().default(0), notes: z.string().max(5000).optional() })).mutation(async ({ ctx, input }) => { await assertCompanyWriteAccess(ctx.user, input.companyId); return db.createPayrollPeriod(input); }),
      generate: protectedProcedure.input(z.object({ payrollPeriodId: z.number().int().positive() })).mutation(async ({ ctx, input }) => db.generatePayrollPeriod(input.payrollPeriodId, ctx.user.id)),
      entries: protectedProcedure.input(z.object({ payrollPeriodId: z.number().int().positive() })).query(async ({ input }) => db.getPayrollEntries(input.payrollPeriodId)),
      contributionHistory: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => { await assertCompanyAccess(ctx.user.id, input.companyId); return db.getPayrollContributionHistory(input.companyId); }),
      attendance: protectedProcedure.input(z.object({ payrollPeriodId: z.number().int().positive() })).query(async ({ input }) => db.getPayrollAttendance(input.payrollPeriodId)),
      bonuses: protectedProcedure.input(z.object({ payrollPeriodId: z.number().int().positive() })).query(async ({ input }) => db.getPayrollPeriodBonuses(input.payrollPeriodId)),
      upsertBonuses: protectedProcedure.input(z.object({ payrollPeriodId: z.number().int().positive(), rows: z.array(z.object({ payrollEmployeeId: z.number().int().positive(), bonusCents: z.number().int().nonnegative() })).min(1).max(1000) })).mutation(async ({ input }) => db.upsertPayrollPeriodBonuses(input.payrollPeriodId, input.rows)),
      addAttendance: protectedProcedure.input(z.object({ payrollPeriodId: z.number().int().positive(), payrollEmployeeId: z.number().int().positive(), day: z.number().int().min(1).max(31), attendanceCode: z.string().min(1).max(10).default("8"), normalMinutes: z.number().int().nonnegative().default(0), overtimeMinutes: z.number().int().nonnegative().default(0), note: z.string().max(500).optional() })).mutation(async ({ input }) => db.createPayrollAttendance(input)),
      addAttendanceBulk: protectedProcedure.input(z.object({ payrollPeriodId: z.number().int().positive(), rows: z.array(z.object({ payrollEmployeeId: z.number().int().positive(), day: z.number().int().min(1).max(31), attendanceCode: z.string().min(1).max(10).default("8"), normalMinutes: z.number().int().nonnegative().default(0), overtimeMinutes: z.number().int().nonnegative().default(0), note: z.string().max(500).optional() })).min(1).max(2000) })).mutation(async ({ input }) => {
        return db.createPayrollAttendanceBulk(input.rows.map(row => ({ ...row, payrollPeriodId: input.payrollPeriodId })));
      }),
      upsertAttendanceBulk: protectedProcedure.input(z.object({ payrollPeriodId: z.number().int().positive(), rows: z.array(z.object({ payrollEmployeeId: z.number().int().positive(), day: z.number().int().min(1).max(31), attendanceCode: z.string().min(1).max(10).default("8"), normalMinutes: z.number().int().nonnegative().default(0), overtimeMinutes: z.number().int().nonnegative().default(0), note: z.string().max(500).optional() })).min(1).max(2000) })).mutation(async ({ input }) => {
        return db.upsertPayrollAttendanceBulk(input.rows.map(row => ({ ...row, payrollPeriodId: input.payrollPeriodId })));
      }),
      clearManualAttendance: protectedProcedure.input(z.object({ payrollPeriodId: z.number().int().positive() })).mutation(async ({ input }) => db.clearPayrollManualAttendance(input.payrollPeriodId)),
    }),
    leaveAbsences: router({
      list: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => { await assertCompanyAccess(ctx.user.id, input.companyId); return db.getPayrollLeaveAbsences(input.companyId); }),
      create: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), payrollEmployeeId: z.number().int().positive(), leaveType: z.string().min(1).max(40), startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), notes: z.string().max(500).optional() })).mutation(async ({ ctx, input }) => {
        await assertCompanyWriteAccess(ctx.user, input.companyId);
        if (input.endDate < input.startDate) throw new Error("Data deri duhet të jetë pas datës nga.");
        return db.createPayrollLeaveAbsence(input);
      }),
    }),
    backup: router({
      get: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ input }) => db.getPayrollBackup(input.companyId)),
      restore: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), payload: z.any() })).mutation(async ({ input }) => db.restorePayrollBackup(input.companyId, input.payload)),
      reset: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
        await assertCompanyWriteAccess(ctx.user, input.companyId);
        return db.resetPayrollData(input.companyId);
      }),
    }),
  }),

  // ============================================================
  // WEIGHT FORMS
  // ============================================================
  weightForm: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getWeightForms(input.companyId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getWeightFormById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        docNumber: z.string(),
        date: z.date(),
        supplierId: z.number().optional(),
        productId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createWeightForm(input);
      }),
  }),

  // ============================================================
  // PURCHASE INVOICES
  // ============================================================
  purchaseInvoice: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getPurchaseInvoices(input.companyId);
      }),

    register: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getPurchaseInvoiceRegister(input.companyId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const invoice = await db.getPurchaseInvoiceById(input.id);
        if (!invoice) return undefined;
        const items = await db.getPurchaseItems(invoice.id);
        return { ...invoice, items };
      }),

    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        docNumber: z.string(),
        date: z.date(),
        supplierId: z.number().optional(),
        supplierName: z.string().optional(),
        warehouseId: z.number().int().positive(),
        currency: z.string().min(3).max(10).default("ALL"),
        exchangeRate: z.union([z.number(), z.string()]).optional(),
        vatAmount: z.number().int().min(0).optional(),
        carrierName: z.string().max(255).optional(),
        vehiclePlate: z.string().max(50).optional(),
        inventoryReference: z.string().max(100).optional(),
        items: z.array(purchaseLineSchema).default([]),
      }))
      .mutation(async ({ input }) => {
        const currency = normalizeInvoiceCurrency(input.currency, input.exchangeRate);
        const totalAmount = input.items.length > 0 ? calculatePurchaseTotal(input.items) : 0;
        return db.createPurchaseInvoice({
          companyId: input.companyId,
          docNumber: input.docNumber,
          date: input.date,
          supplierId: input.supplierId,
          supplierName: input.supplierName,
          warehouseId: input.warehouseId,
          currency: currency.currency,
          exchangeRate: currency.exchangeRate.toFixed(6),
          totalAmount,
          vatAmount: input.vatAmount ?? 0,
          carrierName: input.carrierName,
          vehiclePlate: input.vehiclePlate,
          inventoryReference: input.inventoryReference,
        }, input.items.map(item => ({ ...item, totalPrice: item.quantity * item.unitPrice })));
      }),

    pay: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive(), method: z.enum(["CASH", "BANK", "CARD", "OTHER"]).default("CASH") }))
      .mutation(async ({ ctx, input }) => {
        const invoice = await db.getPurchaseInvoiceById(input.id);
        if (!invoice || invoice.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Fatura nuk u gjet në kompaninë aktive." });
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.payPurchaseInvoice(input.id, input.method);
      }),

    setPaymentStatus: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive(), paymentStatus: z.enum(["UNPAID", "LATER"]) }))
      .mutation(async ({ ctx, input }) => {
        const invoice = await db.getPurchaseInvoiceById(input.id);
        if (!invoice || invoice.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Fatura nuk u gjet në kompaninë aktive." });
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.setPurchaseInvoicePaymentStatus(input.id, input.paymentStatus);
      }),
    cancel: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const invoice = await db.getPurchaseInvoiceById(input.id);
        if (!invoice || invoice.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Fatura nuk u gjet në kompaninë aktive." });
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.cancelPurchaseInvoice(input.id, ctx.user.id);
      }),
    deleteDraft: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const invoice = await db.getPurchaseInvoiceById(input.id);
        if (!invoice || invoice.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Fatura nuk u gjet në kompaninë aktive." });
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.deletePurchaseInvoiceDraft(input.id, ctx.user.id);
      }),
  }),

  // ============================================================
  // PURCHASE WORKFLOW: PO → RECEIPT → RETURN
  // ============================================================
  purchaseOrder: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getPurchaseOrders(input.companyId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getPurchaseOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Porosia nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, order.companyId);
        const [items, attachments] = await Promise.all([db.getPurchaseOrderItems(order.id), db.getPurchaseOrderAttachments(order.id)]);
        return { ...order, items, attachments };
      }),

    create: protectedProcedure
      .input(z.object({
        companyId: z.number().int().positive(),
        docNumber: z.string().min(1).max(50),
        orderDate: z.coerce.date(),
        expectedDate: z.coerce.date().optional(),
        supplierId: z.number().int().positive().optional(),
        supplierName: z.string().max(255).optional(),
        customerReference: z.string().max(100).optional(),
        operationalStatus: z.enum(["IN_PROGRESS", "LOADED", "SENT", "COMPLETED"]).optional(),
        notes: z.string().max(5000).optional(),
        preparationResponsible: z.string().max(255).optional(),
        loadingResponsible: z.string().max(255).optional(),
        documentationResponsible: z.string().max(255).optional(),
        verifierName: z.string().max(255).optional(),
        items: z.array(purchaseLineSchema).min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        const totalAmount = calculatePurchaseTotal(input.items);
        return db.createPurchaseOrder({
          companyId: input.companyId,
          docNumber: input.docNumber,
          orderDate: input.orderDate,
          expectedDate: input.expectedDate,
          supplierId: input.supplierId,
          supplierName: input.supplierName,
          customerReference: input.customerReference,
          operationalStatus: input.operationalStatus,
          notes: input.notes,
          preparationResponsible: input.preparationResponsible,
          loadingResponsible: input.loadingResponsible,
          documentationResponsible: input.documentationResponsible,
          verifierName: input.verifierName,
          totalAmount,
        }, input.items.map(item => ({ ...item, totalPrice: item.quantity * item.unitPrice })));
      }),

    updateDraft: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        docNumber: z.string().min(1).max(50),
        orderDate: z.coerce.date(),
        expectedDate: z.coerce.date().optional(),
        supplierId: z.number().int().positive().optional(),
        supplierName: z.string().max(255).optional(),
        customerReference: z.string().max(100).optional(),
        operationalStatus: z.enum(["IN_PROGRESS", "LOADED", "SENT", "COMPLETED"]),
        notes: z.string().max(5000).optional(),
        preparationResponsible: z.string().max(255).optional(),
        loadingResponsible: z.string().max(255).optional(),
        documentationResponsible: z.string().max(255).optional(),
        verifierName: z.string().max(255).optional(),
        items: z.array(purchaseLineSchema).min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const order = await db.getPurchaseOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Porosia nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, order.companyId);
        try {
          return await db.updatePurchaseOrderDraft(input.id, {
            ...input,
            totalAmount: calculatePurchaseTotal(input.items),
          }, input.items.map(item => ({ ...item, totalPrice: item.quantity * item.unitPrice })), ctx.user.id);
        } catch (error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Porosia nuk mund të modifikohet." });
        }
      }),

    setStatus: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        status: z.enum(["DRAFT", "CONFIRMED", "RECEIVED", "CANCELLED"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const order = await db.getPurchaseOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Porosia nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, order.companyId);
        return db.updatePurchaseOrderStatus(input.id, input.status);
      }),
    setOperationalStatus: protectedProcedure
      .input(z.object({ id: z.number().int().positive(), operationalStatus: z.enum(["IN_PROGRESS", "LOADED", "SENT", "COMPLETED"]) }))
      .mutation(async ({ ctx, input }) => {
        const order = await db.getPurchaseOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Porosia nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, order.companyId);
        return db.updatePurchaseOrderOperationalStatus(input.id, input.operationalStatus);
      }),
    cancel: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const order = await db.getPurchaseOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Porosia nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, order.companyId);
        try { return await db.cancelPurchaseOrder(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Porosia nuk mund të anulohet." }); }
      }),
    deleteDraft: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const order = await db.getPurchaseOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Porosia nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, order.companyId);
        try { return await db.deletePurchaseOrderDraft(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Porosia nuk mund të fshihet." }); }
      }),
    uploadAttachment: protectedProcedure
      .input(z.object({ id: z.number().int().positive(), fileName: z.string().min(1).max(255), mimeType: z.string().max(150).optional(), fileSize: z.number().int().positive().max(15 * 1024 * 1024), base64: z.string().min(1).max(21 * 1024 * 1024) }))
      .mutation(async ({ ctx, input }) => {
        const order = await db.getPurchaseOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Porosia nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, order.companyId);
        const bytes = Buffer.from(input.base64, "base64");
        if (bytes.length !== input.fileSize || bytes.length > 15 * 1024 * 1024) throw new TRPCError({ code: "BAD_REQUEST", message: "Skedari duhet të jetë deri në 15 MB." });
        return db.addPurchaseOrderAttachment({ purchaseOrderId: order.id, fileName: input.fileName, mimeType: input.mimeType, fileSize: input.fileSize, bytes });
      }),
  }),

  purchaseReceipt: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getPurchaseReceipts(input.companyId);
      }),

    getItems: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const receipt = await db.getPurchaseReceiptById(input.id);
        if (!receipt) throw new TRPCError({ code: "NOT_FOUND", message: "Pranimi nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, receipt.companyId);
        return db.getPurchaseReceiptItems(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        companyId: z.number().int().positive(),
        docNumber: z.string().min(1).max(50),
        receiptDate: z.coerce.date(),
        purchaseOrderId: z.number().int().positive().optional(),
        supplierId: z.number().int().positive().optional(),
        supplierName: z.string().max(255).optional(),
        warehouseId: z.number().int().positive().optional(),
        notes: z.string().max(5000).optional(),
        items: z.array(purchaseLineSchema.omit({ unitPrice: true })).min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        if (input.purchaseOrderId) {
          const order = await db.getPurchaseOrderById(input.purchaseOrderId);
          if (!order || order.companyId !== input.companyId) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Porosia e zgjedhur nuk i përket kompanisë." });
          }
        }
        return db.createPurchaseReceipt({
          companyId: input.companyId,
          docNumber: input.docNumber,
          receiptDate: input.receiptDate,
          purchaseOrderId: input.purchaseOrderId,
          supplierId: input.supplierId,
          supplierName: input.supplierName,
          warehouseId: input.warehouseId,
          notes: input.notes,
        }, input.items);
      }),

    validate: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const receipt = await db.getPurchaseReceiptById(input.id);
        if (!receipt) throw new TRPCError({ code: "NOT_FOUND", message: "Pranimi nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, receipt.companyId);
        return db.validatePurchaseReceipt(input.id);
      }),
  }),

  purchaseReturn: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getPurchaseReturns(input.companyId);
      }),

    create: protectedProcedure
      .input(z.object({
        companyId: z.number().int().positive(),
        docNumber: z.string().min(1).max(50),
        returnDate: z.coerce.date(),
        supplierId: z.number().int().positive().optional(),
        supplierName: z.string().max(255).optional(),
        purchaseReceiptId: z.number().int().positive().optional(),
        reason: z.string().max(5000).optional(),
        items: z.array(purchaseLineSchema.omit({ unitPrice: true })).min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.createPurchaseReturn({
          companyId: input.companyId,
          docNumber: input.docNumber,
          returnDate: input.returnDate,
          supplierId: input.supplierId,
          supplierName: input.supplierName,
          purchaseReceiptId: input.purchaseReceiptId,
          reason: input.reason,
        }, input.items);
      }),

    validate: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const purchaseReturn = await db.getPurchaseReturnById(input.id);
        if (!purchaseReturn) throw new TRPCError({ code: "NOT_FOUND", message: "Kthimi nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, purchaseReturn.companyId);
        return db.validatePurchaseReturn(input.id);
      }),
  }),

  purchaseReport: router({
    summary: protectedProcedure
      .input(z.object({
        companyId: z.number().int().positive(),
        dateFrom: z.coerce.date().optional(),
        dateTo: z.coerce.date().optional(),
        supplierId: z.number().int().positive().optional(),
      }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getPurchaseReport(input.companyId, input);
      }),
  }),

  // ============================================================
  // SALES INVOICES
  // ============================================================
  salesInvoice: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getSalesInvoices(input.companyId);
      }),

    register: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getSalesInvoiceRegister(input.companyId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const invoice = await db.getSalesInvoiceById(input.id);
        if (!invoice) return undefined;
        const items = await db.getSalesItems(invoice.id);
        return { ...invoice, items };
      }),

    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        docNumber: z.string(),
        date: z.date(),
        customerId: z.number().optional(),
        customerName: z.string().optional(),
        warehouseId: z.number().int().positive(),
        currency: z.string().min(3).max(10).default("ALL"),
        exchangeRate: z.union([z.number(), z.string()]).optional(),
        invoiceFormat: z.enum(["DOMESTIC", "EXPORT"]).default("DOMESTIC"),
        exportDetails: z.string().optional(),
        deliveryNoteId: z.number().int().positive().optional(),
        salesOrderId: z.number().int().positive().optional(),
        items: z.array(purchaseLineSchema).default([]),
        vatAmount: z.number().int().nonnegative().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        const currency = normalizeInvoiceCurrency(input.currency, input.exchangeRate);
        if (input.deliveryNoteId) {
          const delivery = await db.getDeliveryNoteById(input.deliveryNoteId);
          if (!delivery || delivery.companyId !== input.companyId) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Fletë-dalja e zgjedhur nuk i përket kompanisë." });
          }
          return db.createSalesInvoiceFromDelivery({ companyId: input.companyId, docNumber: input.docNumber, date: input.date, deliveryNoteId: input.deliveryNoteId, warehouseId: input.warehouseId, currency: currency.currency, exchangeRate: currency.exchangeRate });
        }
        if (input.salesOrderId) {
          const order = await db.getSalesOrderById(input.salesOrderId);
          if (!order || order.companyId !== input.companyId) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Porosia e zgjedhur nuk i përket kompanisë." });
          }
          return db.createSalesInvoiceFromOrder({ companyId: input.companyId, docNumber: input.docNumber, date: input.date, salesOrderId: input.salesOrderId, warehouseId: input.warehouseId, currency: currency.currency, exchangeRate: currency.exchangeRate });
        }
        const totalAmount = input.items.length > 0 ? calculatePurchaseTotal(input.items) : 0;
        return db.createSalesInvoice({
          companyId: input.companyId,
          docNumber: input.docNumber,
          date: input.date,
          customerId: input.customerId,
          customerName: input.customerName,
          warehouseId: input.warehouseId,
          currency: currency.currency,
          exchangeRate: currency.exchangeRate.toFixed(6),
          invoiceFormat: input.invoiceFormat,
          exportDetails: input.exportDetails,
          totalAmount,
        }, input.items.map(item => ({ ...item, totalPrice: item.quantity * item.unitPrice })));
      }),

    importBatch: protectedProcedure
      .input(z.object({
        companyId: z.number().int().positive(),
        warehouseId: z.number().int().positive(),
        invoices: z.array(z.object({
          docNumber: z.string().min(1).max(50),
          date: z.coerce.date(),
          customerCode: z.string().max(100).optional(),
          customerName: z.string().max(255).optional(),
          currency: z.string().min(3).max(10),
          exchangeRate: z.union([z.number(), z.string()]),
          invoiceFormat: z.enum(["DOMESTIC", "EXPORT"]),
          exportDetails: z.string().max(50000).optional(),
          totalAmount: z.number().int().nonnegative(),
          vatAmount: z.number().int().nonnegative().default(0),
          items: z.array(purchaseLineSchema).min(1),
        })).min(1).max(500),
      }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyWriteAccess(ctx.user, input.companyId);
        const [existingInvoices, companyProducts, companyCustomers] = await Promise.all([
          db.getSalesInvoices(input.companyId),
          db.getProducts(input.companyId),
          db.getCustomers(input.companyId),
        ]);
        const existingNumbers = new Set(existingInvoices.map(invoice => normalizeSalesImportValue(invoice.docNumber)));
        const existingSourceIdentities = new Set<string>();
        for (const existing of existingInvoices) {
          if (!existing.exportDetails) continue;
          try {
            const source = JSON.parse(existing.exportDetails) as { sourceSheet?: string; sourceRows?: number[]; customerName?: string; currency?: string; exchangeRate?: string | number };
            if (source.sourceSheet && Array.isArray(source.sourceRows)) {
              existingSourceIdentities.add(`${source.sourceSheet}::${source.sourceRows.join(",")}`);
            } else {
              existingSourceIdentities.add(salesInvoiceImportIdentity({ docNumber: existing.docNumber, date: existing.date, invoiceFormat: existing.invoiceFormat, customerName: existing.customerName }));
            }
          } catch {
            // Legacy documents may have non-JSON export details; the document number fallback remains active.
          }
        }
        const imported: string[] = [];
        const skipped: Array<{ docNumber: string; reason: string }> = [];
        const errors: Array<{ docNumber: string; message: string }> = [];
        for (const invoice of input.invoices) {
          const sourceIdentity = `${invoice.exportDetails ? (() => { try { return (JSON.parse(invoice.exportDetails) as { sourceSheet?: string }).sourceSheet; } catch { return undefined; } })() : undefined}::${invoice.exportDetails ? (() => { try { return ((JSON.parse(invoice.exportDetails) as { sourceRows?: number[] }).sourceRows ?? []).join(","); } catch { return ""; } })() : ""}`;
          if (existingSourceIdentities.has(sourceIdentity) || (!invoice.exportDetails && existingNumbers.has(normalizeSalesImportValue(invoice.docNumber)))) {
            skipped.push({ docNumber: invoice.docNumber, reason: "Dokumenti nga ky burim ekziston tashmë." });
            continue;
          }
          const incomingSource = (() => {
            try { return JSON.parse(invoice.exportDetails || "{}"); } catch { return {}; }
          })() as { sourceSheet?: string; sourceRows?: number[] };
          const partialExisting = incomingSource.sourceSheet && Array.isArray(incomingSource.sourceRows)
            ? existingInvoices.find(existing => {
                if (existing.invoiceFormat !== "EXPORT" || normalizeSalesImportValue(existing.docNumber) !== normalizeSalesImportValue(invoice.docNumber) || normalizeSalesImportValue(existing.customerName) !== normalizeSalesImportValue(invoice.customerName)) return false;
                try {
                  const source = JSON.parse(existing.exportDetails || "{}");
                  return source.sourceSheet === incomingSource.sourceSheet && Array.isArray(source.sourceRows) && source.sourceRows.length < incomingSource.sourceRows!.length && salesImportRowsOverlap(source.sourceRows, incomingSource.sourceRows!);
                } catch { return false; }
              })
            : undefined;
          const docNumber = partialExisting?.docNumber || allocateSalesImportDocNumber(invoice.docNumber, invoice.date, existingNumbers);
          const customer = companyCustomers.find(record =>
            (invoice.customerCode && record.code && normalizeSalesImportValue(record.code) === normalizeSalesImportValue(invoice.customerCode)) ||
            (invoice.customerName && normalizeSalesImportValue(record.name) === normalizeSalesImportValue(invoice.customerName)),
          );
          const items = invoice.items.map(item => {
            const product = companyProducts.find(record =>
              (item.productCode && record.code && normalizeSalesImportValue(record.code) === normalizeSalesImportValue(item.productCode)) ||
              normalizeSalesImportValue(record.name) === normalizeSalesImportValue(item.productName),
            );
            return { ...item, productId: item.productId ?? product?.id, totalPrice: item.quantity * item.unitPrice };
          });
          try {
            if (partialExisting) {
              await db.repairImportedSalesInvoice(partialExisting.id, {
                companyId: input.companyId,
                date: invoice.date,
                customerId: customer?.id,
                customerName: invoice.customerName || customer?.name,
                warehouseId: input.warehouseId,
                currency: invoice.currency,
                exchangeRate: Number(invoice.exchangeRate || 1).toFixed(6),
                invoiceFormat: invoice.invoiceFormat,
                exportDetails: invoice.exportDetails,
                totalAmount: invoice.totalAmount,
                vatAmount: invoice.vatAmount,
              }, items);
              imported.push(partialExisting.docNumber);
              existingSourceIdentities.add(sourceIdentity);
              continue;
            }
            await db.createSalesInvoice({
              companyId: input.companyId,
              docNumber,
              date: invoice.date,
              customerId: customer?.id,
              customerName: invoice.customerName || customer?.name,
              warehouseId: input.warehouseId,
              currency: invoice.currency,
              exchangeRate: Number(invoice.exchangeRate || 1).toFixed(6),
              invoiceFormat: invoice.invoiceFormat,
              exportDetails: invoice.exportDetails,
              totalAmount: invoice.totalAmount,
              vatAmount: invoice.vatAmount,
              status: "POSTED",
              paymentStatus: "UNPAID",
            }, items);
            imported.push(docNumber);
            existingSourceIdentities.add(sourceIdentity);
          } catch (error) {
            errors.push({ docNumber: invoice.docNumber, message: error instanceof Error ? error.message : "Importi i faturës dështoi." });
          }
        }
        let inventorySync: Awaited<ReturnType<typeof db.syncImportedSalesInventory>> | undefined;
        try {
          inventorySync = await db.syncImportedSalesInventory(input.companyId);
        } catch (error) {
          errors.push({ docNumber: "MAGAZINA", message: error instanceof Error ? error.message : "Sinkronizimi i magazinës dështoi." });
        }
        return { imported, skipped, errors, inventorySync };
      }),

    post: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const invoice = await db.getSalesInvoiceById(input.id);
        if (!invoice || invoice.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Fatura nuk u gjet në kompaninë aktive." });
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.postSalesInvoice(input.id, ctx.user.id);
      }),
    pay: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive(), method: z.enum(["CASH", "BANK", "CARD", "OTHER"]).default("CASH") }))
      .mutation(async ({ ctx, input }) => {
        const invoice = await db.getSalesInvoiceById(input.id);
        if (!invoice || invoice.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Fatura nuk u gjet në kompaninë aktive." });
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.paySalesInvoice(input.id, input.method);
      }),
    setPaymentStatus: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive(), paymentStatus: z.enum(["UNPAID", "LATER"]) }))
      .mutation(async ({ ctx, input }) => {
        const invoice = await db.getSalesInvoiceById(input.id);
        if (!invoice || invoice.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Fatura nuk u gjet në kompaninë aktive." });
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.setSalesInvoicePaymentStatus(input.id, input.paymentStatus);
      }),
    cancel: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const invoice = await db.getSalesInvoiceById(input.id);
        if (!invoice || invoice.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Fatura nuk u gjet në kompaninë aktive." });
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.cancelSalesInvoice(input.id, ctx.user.id);
      }),
    deleteDraft: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const invoice = await db.getSalesInvoiceById(input.id);
        if (!invoice || invoice.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Fatura nuk u gjet në kompaninë aktive." });
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.deleteSalesInvoiceDraft(input.id, ctx.user.id);
      }),
  }),

  // ============================================================
  // SALES WORKFLOW: QUOTATION → ORDER → DELIVERY → RETURN
  // ============================================================
  salesQuotation: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getSalesQuotations(input.companyId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const quotation = await db.getSalesQuotationById(input.id);
        if (!quotation) throw new TRPCError({ code: "NOT_FOUND", message: "Oferta nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, quotation.companyId);
        return { ...quotation, items: await db.getSalesQuotationItems(input.id) };
      }),

    create: protectedProcedure
      .input(z.object({
        companyId: z.number().int().positive(),
        docNumber: z.string().min(1).max(50),
        quotationDate: z.coerce.date(),
        validityDate: z.coerce.date().optional(),
        customerId: z.number().int().positive().optional(),
        customerName: z.string().max(255).optional(),
        notes: z.string().max(5000).optional(),
        items: z.array(purchaseLineSchema).min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        const totalAmount = calculatePurchaseTotal(input.items);
        return db.createSalesQuotation({
          companyId: input.companyId,
          docNumber: input.docNumber,
          quotationDate: input.quotationDate,
          validityDate: input.validityDate,
          customerId: input.customerId,
          customerName: input.customerName,
          notes: input.notes,
          totalAmount,
        }, input.items.map(item => ({ ...item, totalPrice: item.quantity * item.unitPrice })));
      }),

    setStatus: protectedProcedure
      .input(z.object({ id: z.number().int().positive(), status: z.enum(["DRAFT", "SENT", "ACCEPTED", "EXPIRED", "CANCELLED"]) }))
      .mutation(async ({ ctx, input }) => {
        const quotation = await db.getSalesQuotationById(input.id);
        if (!quotation) throw new TRPCError({ code: "NOT_FOUND", message: "Oferta nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, quotation.companyId);
        return db.updateSalesQuotationStatus(input.id, input.status);
      }),
    cancel: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const quotation = await db.getSalesQuotationById(input.id);
        if (!quotation) throw new TRPCError({ code: "NOT_FOUND", message: "Oferta nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, quotation.companyId);
        try { return await db.cancelSalesQuotation(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Oferta nuk mund të anulohet." }); }
      }),
    deleteDraft: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const quotation = await db.getSalesQuotationById(input.id);
        if (!quotation) throw new TRPCError({ code: "NOT_FOUND", message: "Oferta nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, quotation.companyId);
        try { return await db.deleteSalesQuotationDraft(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Oferta nuk mund të fshihet." }); }
      }),
  }),

  salesOrder: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getSalesOrders(input.companyId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getSalesOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Porosia nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, order.companyId);
        return { ...order, items: await db.getSalesOrderItems(input.id) };
      }),

    create: protectedProcedure
      .input(z.object({
        companyId: z.number().int().positive(),
        docNumber: z.string().min(1).max(50),
        orderDate: z.coerce.date(),
        expectedDate: z.coerce.date().optional(),
        customerId: z.number().int().positive().optional(),
        customerName: z.string().max(255).optional(),
        quotationId: z.number().int().positive().optional(),
        notes: z.string().max(5000).optional(),
        items: z.array(purchaseLineSchema).min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        if (input.quotationId) {
          const quotation = await db.getSalesQuotationById(input.quotationId);
          if (!quotation || quotation.companyId !== input.companyId) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Oferta e zgjedhur nuk i përket kompanisë." });
          }
        }
        const totalAmount = calculatePurchaseTotal(input.items);
        return db.createSalesOrder({
          companyId: input.companyId,
          docNumber: input.docNumber,
          orderDate: input.orderDate,
          expectedDate: input.expectedDate,
          customerId: input.customerId,
          customerName: input.customerName,
          quotationId: input.quotationId,
          notes: input.notes,
          totalAmount,
        }, input.items.map(item => ({ ...item, totalPrice: item.quantity * item.unitPrice })));
      }),

    setStatus: protectedProcedure
      .input(z.object({ id: z.number().int().positive(), status: z.enum(["DRAFT", "CONFIRMED", "DELIVERED", "CANCELLED"]) }))
      .mutation(async ({ ctx, input }) => {
        const order = await db.getSalesOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Porosia nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, order.companyId);
        return db.updateSalesOrderStatus(input.id, input.status);
      }),

    cancel: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const order = await db.getSalesOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Porosia nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, order.companyId);
        try { return await db.cancelSalesOrder(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Porosia nuk mund të anulohet." }); }
      }),
    deleteDraft: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const order = await db.getSalesOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Porosia nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, order.companyId);
        try { return await db.deleteSalesOrderDraft(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Porosia nuk mund të fshihet." }); }
      }),

    createFromQuotation: protectedProcedure
      .input(z.object({ quotationId: z.number().int().positive(), docNumber: z.string().min(1).max(50), orderDate: z.coerce.date(), expectedDate: z.coerce.date().optional(), notes: z.string().max(5000).optional() }))
      .mutation(async ({ ctx, input }) => {
        const quotation = await db.getSalesQuotationById(input.quotationId);
        if (!quotation) throw new TRPCError({ code: "NOT_FOUND", message: "Oferta nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, quotation.companyId);
        return db.createSalesOrderFromQuotation(input);
      }),
  }),

  delivery: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getDeliveryNotes(input.companyId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const delivery = await db.getDeliveryNoteById(input.id);
        if (!delivery) throw new TRPCError({ code: "NOT_FOUND", message: "Fletë-dalja nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, delivery.companyId);
        return { ...delivery, items: await db.getDeliveryItems(input.id) };
      }),

    getItems: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const delivery = await db.getDeliveryNoteById(input.id);
        if (!delivery) throw new TRPCError({ code: "NOT_FOUND", message: "Fletë-dalja nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, delivery.companyId);
        return db.getDeliveryItems(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        companyId: z.number().int().positive(),
        docNumber: z.string().min(1).max(50),
        deliveryDate: z.coerce.date(),
        salesOrderId: z.number().int().positive().optional(),
        customerId: z.number().int().positive().optional(),
        customerName: z.string().max(255).optional(),
        warehouseId: z.number().int().positive().optional(),
        notes: z.string().max(5000).optional(),
        items: z.array(purchaseLineSchema.omit({ unitPrice: true })).min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        if (input.salesOrderId) {
          const order = await db.getSalesOrderById(input.salesOrderId);
          if (!order || order.companyId !== input.companyId) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Porosia e zgjedhur nuk i përket kompanisë." });
          }
        }
        return db.createDeliveryNote({
          companyId: input.companyId,
          docNumber: input.docNumber,
          deliveryDate: input.deliveryDate,
          salesOrderId: input.salesOrderId,
          customerId: input.customerId,
          customerName: input.customerName,
          warehouseId: input.warehouseId,
          notes: input.notes,
        }, input.items);
      }),

    validate: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const delivery = await db.getDeliveryNoteById(input.id);
        if (!delivery) throw new TRPCError({ code: "NOT_FOUND", message: "Fletë-dalja nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, delivery.companyId);
        return db.validateDeliveryNote(input.id);
      }),
    cancel: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const delivery = await db.getDeliveryNoteById(input.id);
        if (!delivery) throw new TRPCError({ code: "NOT_FOUND", message: "Fletë-dalja nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, delivery.companyId);
        try { return await db.cancelDeliveryNote(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Fletë-dalja nuk mund të anulohet." }); }
      }),
    deleteDraft: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const delivery = await db.getDeliveryNoteById(input.id);
        if (!delivery) throw new TRPCError({ code: "NOT_FOUND", message: "Fletë-dalja nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, delivery.companyId);
        try { return await db.deleteDeliveryDraft(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Fletë-dalja nuk mund të fshihet." }); }
      }),
  }),

  salesReturn: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getSalesReturns(input.companyId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const salesReturn = await db.getSalesReturnById(input.id);
        if (!salesReturn) throw new TRPCError({ code: "NOT_FOUND", message: "Kthimi nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, salesReturn.companyId);
        return { ...salesReturn, items: await db.getSalesReturnItems(input.id) };
      }),

    create: protectedProcedure
      .input(z.object({
        companyId: z.number().int().positive(),
        docNumber: z.string().min(1).max(50),
        returnDate: z.coerce.date(),
        customerId: z.number().int().positive().optional(),
        customerName: z.string().max(255).optional(),
        deliveryNoteId: z.number().int().positive().optional(),
        reason: z.string().max(5000).optional(),
        items: z.array(purchaseLineSchema.omit({ unitPrice: true })).min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.createSalesReturn({
          companyId: input.companyId,
          docNumber: input.docNumber,
          returnDate: input.returnDate,
          customerId: input.customerId,
          customerName: input.customerName,
          deliveryNoteId: input.deliveryNoteId,
          reason: input.reason,
        }, input.items);
      }),

    validate: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const salesReturn = await db.getSalesReturnById(input.id);
        if (!salesReturn) throw new TRPCError({ code: "NOT_FOUND", message: "Kthimi nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, salesReturn.companyId);
        return db.validateSalesReturn(input.id);
      }),
    cancel: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const salesReturn = await db.getSalesReturnById(input.id);
        if (!salesReturn) throw new TRPCError({ code: "NOT_FOUND", message: "Kthimi nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, salesReturn.companyId);
        try { return await db.cancelSalesReturn(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Kthimi nuk mund të anulohet." }); }
      }),
    deleteDraft: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const salesReturn = await db.getSalesReturnById(input.id);
        if (!salesReturn) throw new TRPCError({ code: "NOT_FOUND", message: "Kthimi nuk u gjet." });
        await assertCompanyAccess(ctx.user.id, salesReturn.companyId);
        try { return await db.deleteSalesReturnDraft(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Kthimi nuk mund të fshihet." }); }
      }),
  }),

  // ============================================================
  // ACCOUNTING
  // ============================================================
  chartOfAccount: router({
    list: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.getChartOfAccounts(input.companyId);
    }),
    seedDefaults: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.seedDefaultAccountingSetup(input.companyId);
    }),
    create: protectedProcedure.input(z.object({
      companyId: z.number().int().positive(), code: z.string().min(1).max(30), name: z.string().min(1).max(255),
      accountType: z.enum(["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"]), parentId: z.number().int().positive().optional(),
    })).mutation(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.createChartOfAccount(input);
    }),
  }),

  journal: router({
    list: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.getJournals(input.companyId);
    }),
    create: protectedProcedure.input(z.object({
      companyId: z.number().int().positive(), code: z.string().min(1).max(20), name: z.string().min(1).max(255),
      journalType: z.enum(["SALE", "PURCHASE", "BANK", "CASH", "GENERAL"]),
      defaultDebitAccountId: z.number().int().positive().optional(), defaultCreditAccountId: z.number().int().positive().optional(),
    })).mutation(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.createJournal(input);
    }),
  }),

  journalEntry: router({
    list: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.getJournalEntries(input.companyId);
    }),
    items: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), journalEntryId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      const entry = await db.getJournalEntryById(input.journalEntryId);
      if (!entry || entry.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Regjistrimi kontabël nuk u gjet." });
      return db.getJournalEntryLines(input.journalEntryId);
    }),
    create: protectedProcedure.input(z.object({
      companyId: z.number().int().positive(), journalId: z.number().int().positive(), entryNumber: z.string().min(1).max(50), entryDate: z.date(),
      reference: z.string().max(100).optional(), notes: z.string().max(5000).optional(), lines: z.array(journalLineSchema).min(2),
    })).mutation(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      const { lines, ...data } = input;
      return db.createJournalEntry(data, lines);
    }),
    post: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      const entry = await db.getJournalEntryById(input.id);
      if (!entry || entry.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Regjistrimi kontabël nuk u gjet." });
      return db.postJournalEntry(input.id);
    }),
    cancel: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const entry = await db.getJournalEntryById(input.id);
      if (!entry || entry.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Regjistrimi kontabël nuk u gjet." });
      await assertCompanyAccess(ctx.user.id, input.companyId);
      try { return await db.cancelJournalEntry(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Regjistrimi nuk mund të anulohet." }); }
    }),
    deleteDraft: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const entry = await db.getJournalEntryById(input.id);
      if (!entry || entry.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Regjistrimi kontabël nuk u gjet." });
      await assertCompanyAccess(ctx.user.id, input.companyId);
      try { return await db.deleteJournalEntryDraft(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Regjistrimi nuk mund të fshihet." }); }
    }),
  }),

  taxRate: router({
    list: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.getTaxRates(input.companyId);
    }),
    create: protectedProcedure.input(z.object({
      companyId: z.number().int().positive(), code: z.string().min(1).max(30), name: z.string().min(1).max(255), rate: z.number().int().min(0).max(100),
      taxType: z.enum(["SALE", "PURCHASE", "BOTH"]),
    })).mutation(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.createTaxRate(input);
    }),
  }),

  payment: router({
    list: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.getPayments(input.companyId);
    }),
    create: protectedProcedure.input(z.object({
      companyId: z.number().int().positive(), paymentNumber: z.string().min(1).max(50), paymentDate: z.date(), paymentType: z.enum(["INBOUND", "OUTBOUND"]),
      partnerType: z.enum(["SUPPLIER", "CUSTOMER"]).optional(), partnerId: z.number().int().positive().optional(), partnerName: z.string().max(255).optional(),
      journalId: z.number().int().positive().optional(), amount: z.number().int().positive(), currency: z.enum(["ALL", "EUR", "USD", "GBP"]).default("ALL"), exchangeRate: z.number().positive().default(1), method: z.enum(["CASH", "BANK", "CARD", "OTHER"]),
      reference: z.string().max(100).optional(), notes: z.string().max(5000).optional(),
    })).mutation(async ({ ctx, input }) => {
      await assertCompanyWriteAccess(ctx.user, input.companyId);
      const payment = await db.createPayment(input);
      await db.createAuditLog({ companyId: input.companyId, userId: ctx.user.id, action: "CREATE", entityType: "PAYMENT", entityId: payment.id, details: paymentAuditDetails(payment.paymentNumber, "CREATE") });
      return payment;
    }),
    post: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await assertCompanyWriteAccess(ctx.user, input.companyId);
      const payment = (await db.getPayments(input.companyId)).find(item => item.id === input.id);
      if (!payment) throw new TRPCError({ code: "NOT_FOUND", message: "Pagesa nuk u gjet." });
      const result = await db.postPayment(input.id);
      if (!("alreadyPosted" in result && result.alreadyPosted)) await db.createAuditLog({ companyId: input.companyId, userId: ctx.user.id, action: "POST", entityType: "PAYMENT", entityId: payment.id, details: paymentAuditDetails(payment.paymentNumber, "POST") });
      return result;
    }),
    cancel: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await assertCompanyWriteAccess(ctx.user, input.companyId);
      const payment = await db.getPaymentById(input.id);
      if (!payment || payment.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Pagesa nuk u gjet." });
      try { return await db.cancelPayment(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Pagesa nuk mund të anulohet." }); }
    }),
    deleteDraft: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await assertCompanyWriteAccess(ctx.user, input.companyId);
      const payment = await db.getPaymentById(input.id);
      if (!payment || payment.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Pagesa nuk u gjet." });
      try { return await db.deletePaymentDraft(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Pagesa nuk mund të fshihet." }); }
    }),
  }),

  accountingReport: router({
    get: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), dateFrom: z.date().optional(), dateTo: z.date().optional() })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.getAccountingReport(input.companyId, { dateFrom: input.dateFrom, dateTo: input.dateTo });
    }),
  }),

  // ============================================================
  // CRM
  // ============================================================
  crmLead: router({
    list: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.getCrmLeads(input.companyId);
    }),
    create: protectedProcedure.input(z.object({
      companyId: z.number().int().positive(), leadNumber: z.string().min(1).max(50), leadType: z.enum(["LEAD", "OPPORTUNITY"]), name: z.string().min(1).max(255),
      companyName: z.string().max(255).optional(), email: z.string().email().max(320).optional().or(z.literal("")), phone: z.string().max(50).optional(), source: z.string().max(100).optional(),
      expectedRevenue: z.number().int().min(0).default(0), probability: z.number().int().min(0).max(100).default(0), nextActivityDate: z.coerce.date().optional(), notes: z.string().max(5000).optional(),
    })).mutation(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.createCrmLead({ ...input, email: input.email || undefined });
    }),
    updateStage: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive(), stage: z.enum(["NEW", "QUALIFIED", "PROPOSAL", "WON", "LOST"]), probability: z.number().int().min(0).max(100).optional() })).mutation(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      const lead = await db.getCrmLeadById(input.id);
      if (!lead || lead.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Lead-i nuk u gjet." });
      return db.updateCrmLeadStage(input.id, input.stage, input.probability);
    }),
    convert: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      const lead = await db.getCrmLeadById(input.id);
      if (!lead || lead.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Lead-i nuk u gjet." });
      return db.convertCrmLeadToOpportunity(input.id);
    }),
    cancel: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const lead = await db.getCrmLeadById(input.id);
      if (!lead || lead.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Lead-i nuk u gjet." });
      await assertCompanyAccess(ctx.user.id, input.companyId);
      try { return await db.cancelCrmLead(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Lead-i nuk mund të anulohet." }); }
    }),
    delete: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const lead = await db.getCrmLeadById(input.id);
      if (!lead || lead.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Lead-i nuk u gjet." });
      await assertCompanyAccess(ctx.user.id, input.companyId);
      try { return await db.deleteCrmLead(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Lead-i nuk mund të fshihet." }); }
    }),
  }),

  crmActivity: router({
    list: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), leadId: z.number().int().positive().optional() })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.getCrmActivities(input.companyId, input.leadId);
    }),
    create: protectedProcedure.input(z.object({
      companyId: z.number().int().positive(), leadId: z.number().int().positive(), activityType: z.enum(["CALL", "EMAIL", "MEETING", "TODO"]),
      subject: z.string().min(1).max(255), dueDate: z.coerce.date(), notes: z.string().max(5000).optional(),
    })).mutation(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.createCrmActivity(input);
    }),
    complete: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      const activity = (await db.getCrmActivities(input.companyId)).find(item => item.id === input.id);
      if (!activity) throw new TRPCError({ code: "NOT_FOUND", message: "Aktiviteti nuk u gjet." });
      return db.completeCrmActivity(input.id);
    }),
    cancel: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const activity = await db.getCrmActivityById(input.id);
      if (!activity || activity.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Aktiviteti nuk u gjet." });
      await assertCompanyAccess(ctx.user.id, input.companyId);
      try { return await db.cancelCrmActivity(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Aktiviteti nuk mund të anulohet." }); }
    }),
    delete: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const activity = await db.getCrmActivityById(input.id);
      if (!activity || activity.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Aktiviteti nuk u gjet." });
      await assertCompanyAccess(ctx.user.id, input.companyId);
      try { return await db.deleteCrmActivity(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Aktiviteti nuk mund të fshihet." }); }
    }),
  }),

  crmReport: router({
    get: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.getCrmReport(input.companyId);
    }),
  }),

  // ============================================================
  // BANKING
  // ============================================================
  bankAccount: router({
    list: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.getBankAccounts(input.companyId);
    }),
    create: protectedProcedure.input(z.object({
      companyId: z.number().int().positive(), accountName: z.string().min(1).max(255), bankName: z.string().max(255).optional(), iban: z.string().max(64).optional(),
      currency: z.string().min(3).max(10).default("EUR"), openingBalance: z.number().int().default(0), accountType: z.enum(["BANK", "CASH"]),
    })).mutation(async ({ ctx, input }) => {
      await assertCompanyWriteAccess(ctx.user, input.companyId);
      const created = await db.createBankAccount(input);
      await db.createAuditLog({ companyId: input.companyId, userId: ctx.user.id, action: "CREATE", entityType: "LIQUIDITY_UNIT", entityId: Number(created[0].insertId), details: `${input.accountType === "CASH" ? "Arkë" : "Bankë"}: ${input.accountName}` });
      return created;
    }),
    update: protectedProcedure.input(z.object({
      companyId: z.number().int().positive(), id: z.number().int().positive(), accountName: z.string().min(1).max(255), bankName: z.string().max(255).optional(), iban: z.string().max(64).optional(), currency: z.string().min(3).max(10), active: z.boolean(),
    })).mutation(async ({ ctx, input }) => {
      await assertCompanyWriteAccess(ctx.user, input.companyId);
      const updated = await db.updateBankAccount(input.companyId, input.id, { ...input, active: input.active ? 1 : 0 });
      await db.createAuditLog({ companyId: input.companyId, userId: ctx.user.id, action: "UPDATE", entityType: "LIQUIDITY_UNIT", entityId: input.id, details: `Përditësim njësie likuidimi: ${updated.accountName}` });
      return updated;
    }),
    remove: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await assertCompanyWriteAccess(ctx.user, input.companyId);
      const result = await db.removeBankAccountSafely(input.companyId, input.id);
      await db.createAuditLog({ companyId: input.companyId, userId: ctx.user.id, action: result.mode === "DELETE" ? "DELETE" : "DEACTIVATE", entityType: "LIQUIDITY_UNIT", entityId: input.id, details: `${result.account.accountName}: ${result.mode === "DELETE" ? "fshirë" : "çaktivizuar sepse ka veprime"}` });
      return result;
    }),
  }),

  bankStatement: router({
    list: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.getBankStatements(input.companyId);
    }),
    create: protectedProcedure.input(z.object({
      companyId: z.number().int().positive(), bankAccountId: z.number().int().positive(), statementNumber: z.string().min(1).max(50), dateFrom: z.coerce.date(), dateTo: z.coerce.date(),
      openingBalance: z.number().int().default(0), closingBalance: z.number().int().default(0), notes: z.string().max(5000).optional(),
    })).mutation(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.createBankStatement(input);
    }),
    reconcile: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      const statement = await db.getBankStatementById(input.id);
      if (!statement || statement.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Ekstrakti nuk u gjet." });
      return db.reconcileBankStatement(input.id);
    }),
    cancel: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const statement = await db.getBankStatementById(input.id);
      if (!statement || statement.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Ekstrakti nuk u gjet." });
      await assertCompanyAccess(ctx.user.id, input.companyId);
      try { return await db.cancelBankStatement(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Ekstrakti nuk mund të anulohet." }); }
    }),
    deleteDraft: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const statement = await db.getBankStatementById(input.id);
      if (!statement || statement.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Ekstrakti nuk u gjet." });
      await assertCompanyAccess(ctx.user.id, input.companyId);
      try { return await db.deleteBankStatementDraft(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Ekstrakti nuk mund të fshihet." }); }
    }),
  }),

  bankTransfer: router({
    list: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.getBankTransfers(input.companyId);
    }),
    create: protectedProcedure.input(z.object({
      companyId: z.number().int().positive(), transferNumber: z.string().min(1).max(50), transferDate: z.coerce.date(),
      sourceBankAccountId: z.number().int().positive(), destinationBankAccountId: z.number().int().positive(), amount: z.number().int().positive(),
      reference: z.string().max(100).optional(), notes: z.string().max(5000).optional(),
    })).mutation(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.createBankTransfer(input);
    }),
    post: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      const transfer = await db.getBankTransferById(input.id);
      if (!transfer || transfer.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Transferi bankar nuk u gjet." });
      return db.postBankTransfer(input.id);
    }),
    cancel: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const transfer = await db.getBankTransferById(input.id);
      if (!transfer || transfer.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Transferi bankar nuk u gjet." });
      await assertCompanyAccess(ctx.user.id, input.companyId);
      try { return await db.cancelBankTransfer(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Transferi bankar nuk mund të anulohet." }); }
    }),
    deleteDraft: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const transfer = await db.getBankTransferById(input.id);
      if (!transfer || transfer.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Transferi bankar nuk u gjet." });
      await assertCompanyAccess(ctx.user.id, input.companyId);
      try { return await db.deleteBankTransferDraft(input.id, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Transferi bankar nuk mund të fshihet." }); }
    }),
  }),

  bankTransaction: router({
    list: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), bankStatementId: z.number().int().positive().optional() })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.getBankTransactions(input.companyId, input.bankStatementId);
    }),
    create: protectedProcedure.input(z.object({
      companyId: z.number().int().positive(), bankStatementId: z.number().int().positive(), transactionDate: z.coerce.date(), reference: z.string().max(100).optional(),
      description: z.string().min(1).max(500), transactionType: z.enum(["CREDIT", "DEBIT"]), amount: z.number().int().positive(), notes: z.string().max(5000).optional(),
    })).mutation(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.createBankTransaction(input);
    }),
    reconcile: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), id: z.number().int().positive(), paymentId: z.number().int().positive().optional() })).mutation(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      const transaction = await db.getBankTransactionById(input.id);
      if (!transaction || transaction.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND", message: "Transaksioni nuk u gjet." });
      return db.reconcileBankTransaction(input.id, input.paymentId);
    }),
  }),

  bankReport: router({
    get: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.getBankReport(input.companyId);
    }),
  }),

  auditLog: router({
    list: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.getAuditLogEntries(input.companyId);
    }),
  }),

  reportCenter: router({
    get: protectedProcedure.input(z.object({
      companyId: z.number().int().positive(), reportKey: z.string().min(1).max(100), dateFrom: z.coerce.date().optional(), dateTo: z.coerce.date().optional(),
      documentFilter: z.string().max(255).optional(), partnerFilter: z.string().max(255).optional(), categoryFilter: z.string().max(255).optional(), statusFilter: z.string().max(100).optional(), currencyFilter: z.string().max(20).optional(), documentTypeFilter: z.string().max(100).optional(), warehouseFilter: z.string().max(255).optional(), unitFilter: z.string().max(100).optional(), amountMin: z.string().max(50).optional(), amountMax: z.string().max(50).optional(),
    })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.getOdooReport(input.companyId, input.reportKey, input);
    }),
  }),

  globalSearch: router({
    query: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), term: z.string().max(100) })).query(async ({ ctx, input }) => {
      await assertCompanyAccess(ctx.user.id, input.companyId);
      return db.globalSearch(input.companyId, input.term);
    }),
  }),

  salesReport: router({
    summary: protectedProcedure
      .input(z.object({ companyId: z.number().int().positive(), dateFrom: z.coerce.date().optional(), dateTo: z.coerce.date().optional(), customerId: z.number().int().positive().optional() }))
      .query(async ({ ctx, input }) => {
        await assertCompanyAccess(ctx.user.id, input.companyId);
        return db.getSalesReport(input.companyId, input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
