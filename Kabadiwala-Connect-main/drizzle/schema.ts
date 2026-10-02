import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const timestamp = (name: string) => integer(name, { mode: "timestamp_ms" });

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  phoneVerifiedAt: timestamp("phoneVerifiedAt"),
  emailVerifiedAt: timestamp("emailVerifiedAt"),
  preferredLanguage: text("preferredLanguage").default("EN").notNull(),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: timestamp("createdAt").default(sql`(unixepoch() * 1000)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(unixepoch() * 1000)`).notNull(),
  lastSignedIn: timestamp("lastSignedIn").default(sql`(unixepoch() * 1000)`).notNull(),
  passwordHash: text("passwordHash"),
}, (table) => ({
  emailUnique: uniqueIndex("users_email_unique").on(table.email),
  phoneUnique: uniqueIndex("users_phone_unique").on(table.phone),
}));

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  tokenHash: text("tokenHash").notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").default(sql`(unixepoch() * 1000)`).notNull(),
});

export const verificationTokens = sqliteTable("verification_tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  type: text("type", { enum: ["email", "phone"] }).notNull(),
  tokenHash: text("tokenHash").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").default(sql`(unixepoch() * 1000)`).notNull(),
});

export const collectors = sqliteTable("collectors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  collectorId: text("collectorId").notNull().unique(),
  displayName: text("displayName").notNull(),
  preferredLanguage: text("preferredLanguage").default("मराठी").notNull(),
  operatingLocation: text("operatingLocation").notNull(),
  userId: integer("userId"),
  createdAt: timestamp("createdAt").default(sql`(unixepoch() * 1000)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(unixepoch() * 1000)`).notNull(),
});

export const recyclers = sqliteTable("recyclers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  recyclerCode: text("recyclerCode").notNull().unique(),
  name: text("name").notNull(),
  facilityLocation: text("facilityLocation").notNull(),
  materialsAccepted: text("materialsAccepted").notNull(),
  authorizationDetails: text("authorizationDetails"),
  authorizationStatus: text("authorizationStatus", { enum: ["authorized", "pending", "expired"] }).default("pending").notNull(),
  contactDetails: text("contactDetails"),
  offeredRates: text("offeredRates"),
  pickupAvailability: text("pickupAvailability"),
  serviceArea: text("serviceArea"),
  createdAt: timestamp("createdAt").default(sql`(unixepoch() * 1000)`).notNull(),
});

export const materialLots = sqliteTable("material_lots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lotId: text("lotId").notNull().unique(),
  collectorId: text("collectorId").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  description: text("description"),
  photoReference: text("photoReference"),
  approximateWeight: real("approximateWeight").notNull(),
  condition: text("condition").default("mixed").notNull(),
  sourceType: text("sourceType").default("informal_collection").notNull(),
  collectionLocation: text("collectionLocation").notNull(),
  estimatedValue: real("estimatedValue"),
  quotedPrice: real("quotedPrice"),
  finalSaleValue: real("finalSaleValue"),
  status: text("status", { enum: ["draft", "matched", "handover_pending", "completed", "cancelled"] }).default("draft").notNull(),
  collectedAt: timestamp("collectedAt").default(sql`(unixepoch() * 1000)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(unixepoch() * 1000)`).notNull(),
});

export const priceObservations = sqliteTable("price_observations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull(),
  location: text("location").notNull(),
  observedAt: timestamp("observedAt").default(sql`(unixepoch() * 1000)`).notNull(),
  buyingPrice: real("buyingPrice").notNull(),
  quotedPrice: real("quotedPrice"),
  unit: text("unit").default("kg").notNull(),
  recyclerCode: text("recyclerCode"),
  source: text("source").default("field_quote").notNull(),
});

export const handovers = sqliteTable("handovers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  handoverReference: text("handoverReference").notNull().unique(),
  lotId: text("lotId").notNull(),
  recyclerCode: text("recyclerCode").notNull(),
  photoReference: text("photoReference"),
  recordedWeight: real("recordedWeight"),
  gpsLocation: text("gpsLocation"),
  handoverCode: text("handoverCode"),
  recyclerConfirmed: integer("recyclerConfirmed").default(0).notNull(),
  paymentStatus: text("paymentStatus", { enum: ["pending", "cash_paid", "digital_paid"] }).default("pending").notNull(),
  transactionStatus: text("transactionStatus", { enum: ["pending", "confirmed", "completed"] }).default("pending").notNull(),
  handedOverAt: timestamp("handedOverAt").default(sql`(unixepoch() * 1000)`).notNull(),
});

export const recoveryZones = sqliteTable("recovery_zones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  externalRef: text("externalRef").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  wasteType: text("wasteType", { enum: ["plastic", "metal", "paper", "e-waste", "mixed", "organic"] }).notNull(),
  estimatedVolume: text("estimatedVolume", { enum: ["low", "medium", "high"] }).notNull(),
  recyclabilityScore: integer("recyclabilityScore").notNull(),
  status: text("status", { enum: ["active", "verified", "unverified", "cleared"] }).default("unverified").notNull(),
  source: text("source", { enum: ["manual", "municipal", "satellite"] }).notNull(),
  confidence: integer("confidence"),
  reportedBy: text("reportedBy").notNull(),
  lastReportedAt: timestamp("lastReportedAt").default(sql`(unixepoch() * 1000)`).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").default(sql`(unixepoch() * 1000)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(unixepoch() * 1000)`).notNull(),
}, (table) => ({
  sourceExternalRefKey: uniqueIndex("recovery_zones_source_external_ref_unique").on(table.source, table.externalRef),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Collector = typeof collectors.$inferSelect;
export type MaterialLot = typeof materialLots.$inferSelect;
export type Recycler = typeof recyclers.$inferSelect;
export type PriceObservation = typeof priceObservations.$inferSelect;
export type Handover = typeof handovers.$inferSelect;
export type RecoveryZoneRow = typeof recoveryZones.$inferSelect;
export type InsertRecoveryZone = typeof recoveryZones.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
