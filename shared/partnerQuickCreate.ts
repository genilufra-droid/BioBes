export type QuickPartnerForm = {
  name?: unknown;
  code?: unknown;
  nipt?: unknown;
  phone?: unknown;
  email?: unknown;
  address?: unknown;
  city?: unknown;
};

const text = (value: unknown) => String(value ?? "").trim();

export function buildPartnerQuickCreatePayload(companyId: number, form: QuickPartnerForm) {
  const name = text(form.name);
  if (!name) throw new Error("Emri është i detyrueshëm.");
  return {
    companyId,
    name,
    code: text(form.code) || undefined,
    nipt: text(form.nipt) || undefined,
    phone: text(form.phone) || undefined,
    email: text(form.email) || undefined,
    address: text(form.address) || undefined,
    city: text(form.city) || undefined,
  };
}
