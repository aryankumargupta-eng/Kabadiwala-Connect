import { z } from "zod";

export const wasteTypeEnum = z.enum(["plastic", "metal", "paper", "e-waste", "mixed", "organic"]);
export const estimatedVolumeEnum = z.enum(["low", "medium", "high"]);
export const recoveryZoneStatusEnum = z.enum(["active", "verified", "unverified", "cleared"]);
export const recoveryZoneSourceEnum = z.enum(["manual", "municipal", "satellite"]);

export const recoveryZoneSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(2).max(160),
  address: z.string().min(2).max(220),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  wasteType: wasteTypeEnum,
  estimatedVolume: estimatedVolumeEnum,
  recyclabilityScore: z.number().int().min(0).max(100),
  status: recoveryZoneStatusEnum,
  source: recoveryZoneSourceEnum,
  confidence: z.number().int().min(0).max(100).nullable().optional(),
  reportedBy: z.string().min(2).max(200),
  lastReportedAt: z.coerce.date(),
  notes: z.string().max(2000).nullable().optional(),
  externalRef: z.string().min(1).max(255).optional(),
});

export const recoveryZoneCreateSchema = z.object({
  name: z.string().min(2).max(160),
  address: z.string().min(2).max(220),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  wasteType: wasteTypeEnum,
  estimatedVolume: estimatedVolumeEnum,
  recyclabilityScore: z.number().int().min(0).max(100),
  status: recoveryZoneStatusEnum.default("active"),
  source: recoveryZoneSourceEnum.default("manual"),
  confidence: z.number().int().min(0).max(100).nullable().optional(),
  reportedBy: z.string().min(2).max(200),
  lastReportedAt: z.coerce.date().optional(),
  notes: z.string().max(2000).nullable().optional(),
  externalRef: z.string().min(1).max(255).optional(),
});

export const recoveryZoneListSchema = z.object({
  wasteType: wasteTypeEnum.optional(),
  status: recoveryZoneStatusEnum.optional(),
  source: recoveryZoneSourceEnum.optional(),
  minRecyclabilityScore: z.number().int().min(0).max(100).optional(),
});

export type RecoveryZone = z.infer<typeof recoveryZoneSchema>;
export type RecoveryZoneCreateInput = z.infer<typeof recoveryZoneCreateSchema>;
export type RecoveryZoneListInput = z.infer<typeof recoveryZoneListSchema>;
