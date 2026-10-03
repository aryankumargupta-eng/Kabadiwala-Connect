import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { createHandover, createMaterialLot, createRecoveryZone, getFieldData, getRecoveryZoneById, listRecoveryZones, upsertRecoveryZone } from "./db";
import { createSession, deleteSession, hashPassword, normalizeEmail, validatePassword, verifyPassword } from "./auth";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { parse as parseCookie } from "cookie";
import { fetchMunicipalZones } from "./ingestion/municipal";
import { fetchSatelliteFlaggedZones } from "./ingestion/satellite";
import { recoveryZoneCreateSchema, recoveryZoneListSchema } from "../shared/recoveryZones";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { middleware, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { normalizePhone, sendOtp, verifyOtp } from "./otp";
import { rateLimitAuthAttempt } from "./rateLimit";
import { createVerificationCode, validateVerificationCode, sendEmailVerificationCode, sendPhoneVerificationCode, verifyPhoneCode } from "./verification";
import type { TrpcContext } from "./_core/context";

const requireAuth = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in to continue." });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const protectedProcedure = publicProcedure.use(requireAuth);

async function withDatabaseError<T>(operation: string, message: string, action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    console.error(`[${operation}] DB error:`, error);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message, cause: error });
  }
}

function setSessionCookie(ctx: TrpcContext, token: string, maxAgeSeconds: number) {
  const options = getSessionCookieOptions(ctx.req);
  ctx.res.cookie(COOKIE_NAME, token, { ...options, maxAge: maxAgeSeconds * 1000 });
}

const recoveryZonesRouter = router({
  list: publicProcedure.input(recoveryZoneListSchema.optional()).query(async ({ input }) => {
    return withDatabaseError("recovery-zone.list", "Unable to load recovery zones.", () =>
      listRecoveryZones(input ?? {}),
    );
  }),
  getById: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
    return withDatabaseError("recovery-zone.getById", "Unable to load the recovery zone.", () =>
      getRecoveryZoneById(input.id),
    );
  }),
  create: protectedProcedure.input(recoveryZoneCreateSchema).mutation(async ({ input }) => {
    return withDatabaseError("recovery-zone.create", "Unable to create the recovery zone.", () =>
      createRecoveryZone({
        ...input,
        latitude: input.latitude.toString(),
        longitude: input.longitude.toString(),
        externalRef: input.externalRef ?? `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        source: input.source ?? "manual",
        status: input.status ?? "active",
        lastReportedAt: input.lastReportedAt ?? new Date(),
      }),
    );
  }),
  runIngestion: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access is required to run ingestion." });
    }

    const [municipal, satellite] = await Promise.all([
      fetchMunicipalZones(),
      fetchSatelliteFlaggedZones(),
    ]);

    return withDatabaseError("recovery-zone.runIngestion", "Unable to save ingested recovery zones.", async () => {
      const municipalResults = await Promise.all(municipal.map((zone) => upsertRecoveryZone({
        ...zone,
        latitude: zone.latitude.toString(),
        longitude: zone.longitude.toString(),
        status: zone.status ?? "active",
        source: "municipal",
        confidence: zone.confidence ?? null,
        notes: zone.notes ?? null,
        lastReportedAt: new Date(zone.lastReportedAt),
        externalRef: zone.externalRef,
      })));

      const satelliteResults = await Promise.all(satellite.map((zone) => upsertRecoveryZone({
        ...zone,
        latitude: zone.latitude.toString(),
        longitude: zone.longitude.toString(),
        status: "unverified",
        source: "satellite",
        confidence: zone.confidence ?? null,
        notes: zone.notes ?? null,
        lastReportedAt: new Date(zone.lastReportedAt),
        externalRef: zone.externalRef,
      })));

      return {
        municipal: municipalResults.length,
        satellite: satelliteResults.length,
        total: municipalResults.length + satelliteResults.length,
      };
    });
  }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    signup: publicProcedure.input(z.object({
      name: z.string().trim().min(2).max(120),
      email: z.string().trim().email().max(320),
      phone: z.string().trim().min(8).max(20),
      password: z.string().min(8).max(200),
      confirmPassword: z.string().min(8).max(200),
      remember: z.boolean().default(false),
      preferredLanguage: z.enum(["EN", "हिंदी", "मराठी"]).default("EN"),
    })).mutation(async ({ input, ctx }) => {
      const passwordError = validatePassword(input.password);
      if (passwordError) throw new TRPCError({ code: "BAD_REQUEST", message: passwordError });
      if (input.password !== input.confirmPassword) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Passwords do not match." });
      }

      const email = normalizeEmail(input.email);
      let phone: string;
      try {
        phone = normalizePhone(input.phone);
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Enter a valid mobile number with country code." });
      }
      const passwordHash = await hashPassword(input.password);
      const openId = `local-${randomUUID()}`;
      const created = await withDatabaseError("auth.signup", "Signup failed", async () => {
        const db = await getDb();

        const existingEmail = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
        if (existingEmail.length) throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists." });
        const existingPhone = await db.select({ id: users.id }).from(users).where(eq(users.phone, phone)).limit(1);
        if (existingPhone.length) throw new TRPCError({ code: "CONFLICT", message: "An account with this mobile number already exists." });

        const [created] = await db.insert(users).values({
          openId,
          name: input.name,
          email,
          phone,
          loginMethod: "password",
          role: "user",
          preferredLanguage: input.preferredLanguage,
          passwordHash,
          lastSignedIn: new Date(),
        }).returning({
          id: users.id, openId: users.openId, name: users.name, email: users.email, phone: users.phone,
          phoneVerifiedAt: users.phoneVerifiedAt, preferredLanguage: users.preferredLanguage,
          loginMethod: users.loginMethod, role: users.role, createdAt: users.createdAt,
          updatedAt: users.updatedAt, lastSignedIn: users.lastSignedIn,
        });

        if (!created) throw new Error("Signup insert returned no user");
        return created;
      });

      const session = await withDatabaseError("auth.signup", "Signup failed", () =>
        createSession(created.id, input.remember),
      );
      setSessionCookie(ctx, session.token, Math.round((session.expiresAt.getTime() - Date.now()) / 1000));
      return { user: created, success: true } as const;
    }),

    login: publicProcedure.input(z.object({
      email: z.string().trim().min(3).max(320),
      password: z.string().min(1).max(200),
      remember: z.boolean().default(false),
      preferredLanguage: z.enum(["EN", "हिंदी", "मराठी"]).optional(),
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not configured." });
      const email = normalizeEmail(input.email);
      const loginLimit = rateLimitAuthAttempt(`password-login:${ctx.req.ip || "unknown"}:${email}`, 10, 15 * 60 * 1000);
      if (!loginLimit.allowed) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many login attempts. Please try again later." });
      const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const user = rows[0];
      if (!user || !user.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
      }
      await db.update(users).set({ lastSignedIn: new Date(), ...(input.preferredLanguage ? { preferredLanguage: input.preferredLanguage } : {}) }).where(eq(users.id, user.id));
      const session = await createSession(user.id, input.remember);
      setSessionCookie(ctx, session.token, Math.round((session.expiresAt.getTime() - Date.now()) / 1000));
      const safeUser = {
        id: user.id, openId: user.openId, name: user.name, email: user.email, phone: user.phone,
        phoneVerifiedAt: user.phoneVerifiedAt, preferredLanguage: input.preferredLanguage ?? user.preferredLanguage,
        loginMethod: user.loginMethod, role: user.role, createdAt: user.createdAt,
        updatedAt: user.updatedAt, lastSignedIn: new Date(),
      };
      return { user: safeUser, success: true } as const;
    }),

    sendOtp: publicProcedure.input(z.object({
      phone: z.string().trim().min(8).max(20),
      mode: z.enum(["login", "signup"]),
      language: z.enum(["EN", "हिंदी", "मराठी"]).default("EN"),
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not configured." });
      let phone: string;
      try {
        phone = normalizePhone(input.phone);
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Enter a valid mobile number with country code." });
      }
      const ip = ctx.req.ip || "unknown";
      const rateKey = `${ip}:${phone}`;
      const limit = rateLimitAuthAttempt(`otp-send:${rateKey}`, 3, 15 * 60 * 1000);
      if (!limit.allowed) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many OTP requests. Please try again later." });

      const existing = await db.select({ id: users.id }).from(users).where(eq(users.phone, phone)).limit(1);
      if (input.mode === "signup" && existing[0]) {
        throw new TRPCError({ code: "CONFLICT", message: "An account with this mobile number already exists." });
      }
      if (input.mode === "login" && !existing[0]) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unable to sign in with this mobile number." });
      }
      try {
        return await sendOtp(phone, input.language === "हिंदी" ? "hi" : input.language === "मराठी" ? "mr" : "en");
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unable to send OTP. Please try again." });
      }
    }),

    verifyOtp: publicProcedure.input(z.object({
      phone: z.string().trim().min(8).max(20),
      code: z.string().trim().regex(/^\d{4,10}$/),
      mode: z.enum(["login", "signup"]),
      name: z.string().trim().min(2).max(120).optional(),
      email: z.string().trim().email().max(320).optional(),
      password: z.string().min(8).max(200).optional(),
      confirmPassword: z.string().min(8).max(200).optional(),
      remember: z.boolean().default(false),
      preferredLanguage: z.enum(["EN", "हिंदी", "मराठी"]).default("EN"),
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not configured." });
      let phone: string;
      try {
        phone = normalizePhone(input.phone);
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Enter a valid mobile number with country code." });
      }
      const ip = ctx.req.ip || "unknown";
      const verifyLimit = rateLimitAuthAttempt(`otp-verify:${ip}:${phone}`, 10, 10 * 60 * 1000);
      if (!verifyLimit.allowed) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many OTP attempts. Please request a new OTP later." });

      let approved = false;
      try { approved = await verifyOtp(phone, input.code); } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unable to verify OTP. Please try again." });
      }
      if (!approved) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired OTP." });

      let user = (await db.select().from(users).where(eq(users.phone, phone)).limit(1))[0];
      if (input.mode === "signup") {
        if (user) throw new TRPCError({ code: "CONFLICT", message: "An account with this mobile number already exists." });
        if (!input.name) throw new TRPCError({ code: "BAD_REQUEST", message: "Please enter your full name." });
        if (!input.email || !input.password || !input.confirmPassword) throw new TRPCError({ code: "BAD_REQUEST", message: "Please complete all fields." });
        if (input.password !== input.confirmPassword) throw new TRPCError({ code: "BAD_REQUEST", message: "Passwords do not match." });
        const passwordError = validatePassword(input.password);
        if (passwordError) throw new TRPCError({ code: "BAD_REQUEST", message: passwordError });
        const email = normalizeEmail(input.email);
        const existingEmail = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
        if (existingEmail[0]) throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists." });
        const openId = `local-phone-${randomUUID()}`;
        try {
          await db.insert(users).values({
            openId, name: input.name, email, phone, loginMethod: "otp", role: "user",
            preferredLanguage: input.preferredLanguage, passwordHash: await hashPassword(input.password),
            phoneVerifiedAt: new Date(), lastSignedIn: new Date(),
          });
        } catch {
          throw new TRPCError({ code: "CONFLICT", message: "Unable to create the account because these details are already in use." });
        }
        user = (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0];
      } else {
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Unable to sign in with this mobile number." });
        await db.update(users).set({ lastSignedIn: new Date(), phoneVerifiedAt: new Date(), preferredLanguage: input.preferredLanguage }).where(eq(users.id, user.id));
        user = { ...user, lastSignedIn: new Date(), phoneVerifiedAt: new Date(), preferredLanguage: input.preferredLanguage };
      }
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to create or load account." });
      const session = await createSession(user.id, input.remember);
      setSessionCookie(ctx, session.token, Math.round((session.expiresAt.getTime() - Date.now()) / 1000));
      const safeUser = {
        id: user.id, openId: user.openId, name: user.name, email: user.email, phone: user.phone,
        phoneVerifiedAt: user.phoneVerifiedAt, preferredLanguage: user.preferredLanguage, loginMethod: user.loginMethod,
        role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt, lastSignedIn: user.lastSignedIn,
      };
      return { user: safeUser, success: true } as const;
    }),

    sendEmailCode: protectedProcedure.mutation(async ({ ctx }) => {
      const user = ctx.user;
      if (!user.email) throw new TRPCError({ code: "BAD_REQUEST", message: "No email address on file." });
      if (user.emailVerifiedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Email is already verified." });

      const ip = ctx.req.ip || "unknown";
      const limit = rateLimitAuthAttempt(`email-verify-send:${ip}:${user.id}`, 3, 15 * 60 * 1000);
      if (!limit.allowed) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." });

      const code = await createVerificationCode(user.id, "email");
      const locale = user.preferredLanguage === "हिंदी" ? "hi" : user.preferredLanguage === "मराठी" ? "mr" : "en";
      await sendEmailVerificationCode(user.email, code, locale);
      return { success: true } as const;
    }),

    verifyEmailCode: protectedProcedure.input(z.object({
      code: z.string().trim().regex(/^\d{4,10}$/),
    })).mutation(async ({ input, ctx }) => {
      const user = ctx.user;
      if (user.emailVerifiedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Email is already verified." });

      const ip = ctx.req.ip || "unknown";
      const limit = rateLimitAuthAttempt(`email-verify-check:${ip}:${user.id}`, 10, 10 * 60 * 1000);
      if (!limit.allowed) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts. Please try again later." });

      const valid = await validateVerificationCode(user.id, "email", input.code);
      if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired code. Please try again." });
      return { success: true, emailVerifiedAt: new Date() } as const;
    }),

    sendPhoneCode: protectedProcedure.mutation(async ({ ctx }) => {
      const user = ctx.user;
      if (!user.phone) throw new TRPCError({ code: "BAD_REQUEST", message: "No mobile number on file." });
      if (user.phoneVerifiedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Mobile number is already verified." });

      const ip = ctx.req.ip || "unknown";
      const limit = rateLimitAuthAttempt(`phone-verify-send:${ip}:${user.id}`, 3, 15 * 60 * 1000);
      if (!limit.allowed) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." });

      const locale = user.preferredLanguage === "हिंदी" ? "hi" : user.preferredLanguage === "मराठी" ? "mr" : "en";
      try {
        await sendPhoneVerificationCode(user.phone, locale);
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unable to send OTP. Please try again." });
      }
      return { success: true } as const;
    }),

    verifyPhoneCode: protectedProcedure.input(z.object({
      code: z.string().trim().regex(/^\d{4,10}$/),
    })).mutation(async ({ input, ctx }) => {
      const user = ctx.user;
      if (user.phoneVerifiedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Mobile number is already verified." });

      const ip = ctx.req.ip || "unknown";
      const limit = rateLimitAuthAttempt(`phone-verify-check:${ip}:${user.id}`, 10, 10 * 60 * 1000);
      if (!limit.allowed) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts. Please try again later." });

      let approved = false;
      try {
        approved = await verifyPhoneCode(user.phone!, input.code);
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unable to verify OTP. Please try again." });
      }
      if (!approved) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired code. Please try again." });

      const db = await getDb();
      if (db) {
        const now = new Date();
        await db.update(users).set({ phoneVerifiedAt: now, updatedAt: now }).where(eq(users.id, user.id));
      }
      return { success: true, phoneVerifiedAt: new Date() } as const;
    }),

    logout: publicProcedure.mutation(async ({ ctx }) => {
      const token = ctx.req.headers.cookie ? parseCookie(ctx.req.headers.cookie)[COOKIE_NAME] : undefined;
      await deleteSession(token);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  fieldData: protectedProcedure.query(() => getFieldData()),
  recoveryZones: recoveryZonesRouter,
  lots: router({
    create: protectedProcedure.input(z.object({
      lotId: z.string().min(3).max(32),
      collectorId: z.string().min(2).max(32),
      category: z.string().min(1).max(80),
      subcategory: z.string().max(120).optional(),
      description: z.string().max(2000).optional(),
      photoReference: z.string().max(2000).optional(),
      approximateWeight: z.number().positive(),
      condition: z.string().max(60).default("mixed"),
      sourceType: z.string().max(80).default("informal_collection"),
      collectionLocation: z.string().min(2).max(180),
      estimatedValue: z.number().nonnegative().optional(),
      quotedPrice: z.number().nonnegative().optional(),
      status: z.enum(["draft", "matched", "handover_pending", "completed", "cancelled"]).default("draft"),
    })).mutation(({ input }) => createMaterialLot({
      ...input,
      approximateWeight: input.approximateWeight.toFixed(2),
      estimatedValue: input.estimatedValue?.toFixed(2),
      quotedPrice: input.quotedPrice?.toFixed(2),
    })),
  }),
  handovers: router({
    create: protectedProcedure.input(z.object({
      handoverReference: z.string().min(5).max(48),
      lotId: z.string().min(3).max(32),
      recyclerCode: z.string().min(2).max(32),
      photoReference: z.string().max(2000).optional(),
      recordedWeight: z.number().positive().optional(),
      gpsLocation: z.string().max(180).optional(),
      handoverCode: z.string().max(16).optional(),
      paymentStatus: z.enum(["pending", "cash_paid", "digital_paid"]).default("pending"),
      transactionStatus: z.enum(["pending", "confirmed", "completed"]).default("pending"),
    })).mutation(({ input }) => createHandover({
      ...input,
      recordedWeight: input.recordedWeight?.toFixed(2),
    })),
  }),
});

export type AppRouter = typeof appRouter;
