import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { collectors, handovers, InsertUser, InsertRecoveryZone, materialLots, priceObservations, recoveryZones, recyclers, users } from "../drizzle/schema";
import { ENV } from './_core/env';

const memoryRecoveryZones = new Map<string, InsertRecoveryZone & { id: number }>();

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (_db) return _db;

  try {
    const url = process.env.DATABASE_URL || ENV.databaseUrl || "file:./data/kabadiwala.db";
    const authToken = process.env.DATABASE_AUTH_TOKEN;

    const client = createClient({
      url,
      authToken,
    });

    _db = drizzle(client);
  } catch (error) {
    console.warn("[Database] Failed to open SQLite database:", error);
    _db = null;
  }

  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.openId, user.openId)).limit(1);
    const values: InsertUser = { ...user, lastSignedIn: user.lastSignedIn ?? new Date() };

    if (user.openId === ENV.ownerOpenId && values.role === undefined) {
      values.role = "admin";
    }

    if (existing[0]) {
      await db.update(users).set({
        name: values.name,
        email: values.email,
        phone: values.phone,
        phoneVerifiedAt: values.phoneVerifiedAt,
        preferredLanguage: values.preferredLanguage,
        loginMethod: values.loginMethod,
        role: values.role,
        lastSignedIn: values.lastSignedIn,
        passwordHash: values.passwordHash,
      }).where(eq(users.id, existing[0].id));
      return;
    }

    await db.insert(users).values(values);
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMaterialLot(input: typeof materialLots.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(materialLots).values(input);
  const rows = await db.select().from(materialLots).where(eq(materialLots.lotId, input.lotId)).limit(1);
  return rows[0];
}

export async function createHandover(input: typeof handovers.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(handovers).values(input);
  const rows = await db.select().from(handovers).where(eq(handovers.handoverReference, input.handoverReference)).limit(1);
  return rows[0];
}

export async function getFieldData() {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const [collectorRows, lotRows, priceRows, recyclerRows] = await Promise.all([
    db.select().from(collectors).limit(50),
    db.select().from(materialLots).orderBy(materialLots.collectedAt).limit(50),
    db.select().from(priceObservations).orderBy(priceObservations.observedAt).limit(100),
    db.select().from(recyclers).limit(50),
  ]);
  return { collectors: collectorRows, lots: lotRows, prices: priceRows, recyclers: recyclerRows };
}

export async function listRecoveryZones(filters: {
  wasteType?: string;
  status?: string;
  source?: string;
  minRecyclabilityScore?: number;
} = {}) {
  const db = await getDb();
  if (!db) {
    return [...memoryRecoveryZones.values()].filter((row) => {
      const matchesWaste = !filters.wasteType || row.wasteType === filters.wasteType;
      const matchesStatus = !filters.status || row.status === filters.status;
      const matchesSource = !filters.source || row.source === filters.source;
      const matchesScore = !filters.minRecyclabilityScore || Number(row.recyclabilityScore ?? 0) >= filters.minRecyclabilityScore;
      return matchesWaste && matchesStatus && matchesSource && matchesScore;
    });
  }

  const rows = await db.select().from(recoveryZones);
  return rows.filter((row) => {
    const matchesWaste = !filters.wasteType || row.wasteType === filters.wasteType;
    const matchesStatus = !filters.status || row.status === filters.status;
    const matchesSource = !filters.source || row.source === filters.source;
    const matchesScore = filters.minRecyclabilityScore === undefined || Number(row.recyclabilityScore) >= filters.minRecyclabilityScore;
    return matchesWaste && matchesStatus && matchesSource && matchesScore;
  });
}

export async function getRecoveryZoneById(id: number) {
  const db = await getDb();
  if (!db) return memoryRecoveryZones.get(`id:${id}`) ?? null;
  const rows = await db.select().from(recoveryZones).where(eq(recoveryZones.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function upsertRecoveryZone(input: InsertRecoveryZone & { id?: number }) {
  const db = await getDb();
  const row = {
    ...input,
    externalRef: input.externalRef ?? `manual-${Date.now()}`,
    lastReportedAt: input.lastReportedAt ?? new Date(),
    status: input.status ?? "unverified",
    source: input.source ?? "manual",
    confidence: input.confidence ?? null,
    notes: input.notes ?? null,
  };

  if (!db) {
    const key = `${row.source}:${row.externalRef}`;
    const record = { ...row, id: memoryRecoveryZones.get(key)?.id ?? Date.now() };
    memoryRecoveryZones.set(key, record);
    memoryRecoveryZones.set(`id:${record.id}`, record);
    return record;
  }

  const matches = await db.select().from(recoveryZones).where(and(
    eq(recoveryZones.source, row.source),
    eq(recoveryZones.externalRef, row.externalRef!),
  )).limit(1);

  if (matches.length > 0) {
    await db.update(recoveryZones).set({
      name: row.name,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude,
      wasteType: row.wasteType,
      estimatedVolume: row.estimatedVolume,
      recyclabilityScore: row.recyclabilityScore,
      status: row.status,
      source: row.source,
      confidence: row.confidence,
      reportedBy: row.reportedBy,
      lastReportedAt: row.lastReportedAt,
      notes: row.notes,
      updatedAt: new Date(),
    }).where(eq(recoveryZones.id, matches[0].id));

    const [updated] = await db.select().from(recoveryZones).where(eq(recoveryZones.id, matches[0].id)).limit(1);
    return updated;
  }

  await db.insert(recoveryZones).values(row);
  const [fresh] = await db.select().from(recoveryZones).where(and(
    eq(recoveryZones.source, row.source),
    eq(recoveryZones.externalRef, row.externalRef!),
  )).limit(1);
  return fresh;
}

export async function createRecoveryZone(input: InsertRecoveryZone) {
  const row = {
    ...input,
    externalRef: input.externalRef ?? `manual-${Date.now()}`,
    status: input.status ?? "active",
    source: input.source ?? "manual",
    lastReportedAt: input.lastReportedAt ?? new Date(),
  };
  return upsertRecoveryZone(row);
}