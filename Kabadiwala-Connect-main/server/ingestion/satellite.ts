import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type RawZone = {
  externalRef: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  wasteType: "plastic" | "metal" | "paper" | "e-waste" | "mixed" | "organic";
  estimatedVolume: "low" | "medium" | "high";
  recyclabilityScore: number;
  status: "active" | "verified" | "unverified" | "cleared";
  source: "manual" | "municipal" | "satellite";
  confidence?: number | null;
  reportedBy: string;
  lastReportedAt: string;
  notes?: string | null;
};

export async function fetchSatelliteFlaggedZones(): Promise<RawZone[]> {
  // TODO: this is a stub fed by a fixture file. A real implementation would require a scheduled
  // Python / Google Earth Engine pipeline using Sentinel-2 NDVI/NBR change detection to output
  // candidate coordinates and confidence scores, then write the results here for ingestion.
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const fixturePath = path.join(__dirname, "fixtures", "satellite-flagged.json");
  const file = await readFile(fixturePath, "utf8");
  const data = JSON.parse(file) as RawZone[];
  return data.map((zone) => ({
    ...zone,
    source: "satellite",
    status: "unverified",
  }));
}
