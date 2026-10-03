import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { fetchMunicipalZones } from "./ingestion/municipal";
import { fetchSatelliteFlaggedZones } from "./ingestion/satellite";

function authenticatedContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "recovery-zone-test-user",
      name: "Recovery Zone Test",
      email: "recovery-zone-test@example.com",
      role: "user",
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("recovery zones router", () => {
  it("filters by source and status and creates a manual recovery zone", async () => {
    const caller = appRouter.createCaller(authenticatedContext());
    const externalRef = `manual-router-${Date.now()}`;

    const created = await caller.recoveryZones.create({
      externalRef,
      name: "Nagar Market scrap pocket",
      address: "Near Nagar Market, East Delhi",
      latitude: 28.65,
      longitude: 77.24,
      wasteType: "plastic",
      estimatedVolume: "medium",
      recyclabilityScore: 83,
      status: "active",
      source: "manual",
      reportedBy: "Router test",
      lastReportedAt: new Date("2026-09-05T10:00:00Z"),
      notes: "Router test entry",
    });

    expect(created).toMatchObject({
      externalRef,
      source: "manual",
      status: "active",
      recyclabilityScore: 83,
    });

    const bySource = await caller.recoveryZones.list({ source: "manual" });
    expect(bySource.some((zone) => zone.id === created.id)).toBe(true);
    expect(bySource.every((zone) => zone.source === "manual")).toBe(true);

    const byStatus = await caller.recoveryZones.list({ status: "active" });
    expect(byStatus.some((zone) => zone.id === created.id)).toBe(true);
    expect(byStatus.every((zone) => zone.status === "active")).toBe(true);
  });
});

describe("recovery zone ingestion adapters", () => {
  it("reads the municipal fixture and normalizes to municipal zones", async () => {
    const zones = await fetchMunicipalZones();

    expect(zones.length).toBeGreaterThan(0);
    expect(zones).toHaveLength(5);
    expect(zones.every((zone) => zone.source === "municipal")).toBe(true);
    expect(zones.every((zone) => zone.status === "active" || zone.status === "verified")).toBe(true);
  });

  it("reads the satellite fixture and marks all candidates as unverified", async () => {
    const zones = await fetchSatelliteFlaggedZones();

    expect(zones.length).toBeGreaterThan(0);
    expect(zones).toHaveLength(5);
    expect(zones.every((zone) => zone.source === "satellite")).toBe(true);
    expect(zones.every((zone) => zone.status === "unverified")).toBe(true);
    expect(zones.every((zone) => typeof zone.confidence === "number")).toBe(true);
  });
});
