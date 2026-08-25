import { appRouter } from "../server/routers.ts";
import * as db from "../server/db.ts";

const companyId = 1;
const viewerId = 300001;

await db.addCompanyUser(companyId, viewerId, "viewer");
try {
  const viewer = appRouter.createCaller({ user: { id: viewerId, role: "user" } });
  const payments = await viewer.payment.list({ companyId });
  const notes = await viewer.creditNotes.list({ companyId });
  if (!Array.isArray(payments) || !Array.isArray(notes)) throw new Error("Lexuesi nuk mund të lexojë regjistrat e lejuar.");
  const payment = payments[0];
  if (!payment) throw new Error("Nuk ka pagesë reale për verifikimin e roleve.");
  const blocked = async (label, operation) => {
    try { await operation(); } catch (error) { if (error?.code === "FORBIDDEN") return; throw error; }
    throw new Error(`Roli Lexues nuk u bllokua nga ${label}.`);
  };
  await blocked("krijimi i pagesës", () => viewer.payment.create({ companyId, paymentNumber: "RBAC-NO-CREATE", paymentDate: new Date(), paymentType: "INBOUND", amount: 1, method: "CASH" }));
  await blocked("postimi i pagesës", () => viewer.payment.post({ companyId, id: payment.id }));
  await blocked("anulimi i pagesës", () => viewer.payment.cancel({ companyId, id: payment.id }));
  await blocked("fshirja e pagesës", () => viewer.payment.deleteDraft({ companyId, id: payment.id }));
  await blocked("krijimi i Notës së Kreditit", () => viewer.creditNotes.create({ companyId, creditNoteNumber: "RBAC-NO-CREATE", noteDate: new Date(), sourceType: "PURCHASE", sourceInvoiceId: 1, sourceInvoiceNumber: "BL-01", partnerName: "Partner", amount: 1, vatAmount: 0, reason: "Verifikim RBAC" }));
  await blocked("postimi i Notës së Kreditit", () => viewer.creditNotes.setStatus({ companyId, id: 1, status: "POSTED" }));
  await blocked("fshirja e Notës së Kreditit", () => viewer.creditNotes.deleteDraft({ companyId, id: 1 }));
  console.log("Sukses: Lexuesi mund të lexojë regjistrat, por bllokohet nga të gjitha shkrimet financiare.");
} finally {
  await db.removeCompanyUser(companyId, viewerId);
}
