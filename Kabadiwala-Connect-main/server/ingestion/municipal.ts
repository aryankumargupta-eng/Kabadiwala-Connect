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

export async function fetchMunicipalZones(): Promise<RawZone[]> {
  // TODO: replace this stub with the live MCD / Delhi municipal data feed when a public API or
  // official export becomes available; until then we are reading a local fixture refreshed from
  // data.gov.in / RTI exports so the app has a realistic ingestion contract.
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const fixturePath = path.join(__dirname, "fixtures", "mcd-gvp.json");
  const file = await readFile(fixturePath, "utf8");
  const data = JSON.parse(file) as RawZone[];
  return data.map((zone) => ({
    ...zone,
    source: "municipal",
    status: zone.status ?? "active",
  }));
}
