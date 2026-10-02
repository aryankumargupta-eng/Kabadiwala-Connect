import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function publicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("persistent field data procedures", () => {
  it("rejects malformed lot records before touching the database", async () => {
    const caller = appRouter.createCaller(publicContext());
    await expect(caller.lots.create({
      lotId: "x",
      collectorId: "KC-0084",
      category: "PCBs",
      approximateWeight: 3.2,
      collectionLocation: "Pimpri, Pune",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects malformed handover payment states", async () => {
    const caller = appRouter.createCaller(publicContext());
    await expect(caller.handovers.create({
      handoverReference: "KC-LOT-TEST-01",
      lotId: "LOT-TEST-01",
      recyclerCode: "ECR-2047",
      paymentStatus: "not-a-status" as never,
      transactionStatus: "confirmed",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
