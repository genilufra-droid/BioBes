import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { getUserCompanies, getCompanyMembership } from "../db";
import { canWriteCompany } from "../companyRoles";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

const requireCompanyScope = t.middleware(async opts => {
  const user = opts.ctx.user;
  if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  const input = opts.input as { companyId?: unknown } | undefined;
  const companyId = input && typeof input.companyId === "number" ? input.companyId : undefined;
  if (!companyId) return opts.next();
  const memberships = await getUserCompanies(user.id);
  if (!memberships.some(membership => membership.companyId === companyId)) throw new TRPCError({ code: "FORBIDDEN", message: "Nuk keni akses në këtë kompani." });
  if (opts.type === "mutation") {
    const membership = await getCompanyMembership(companyId, user.id);
    if (!canWriteCompany(user.role, membership?.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Roli Lexues ka vetëm akses për lexim." });
  }
  return opts.next();
});

export const protectedProcedure = t.procedure.use(requireUser).use(requireCompanyScope);

export const adminProcedure = t.procedure.use(requireUser).use(requireCompanyScope).use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
