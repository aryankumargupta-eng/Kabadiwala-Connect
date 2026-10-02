import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

export type Context = TrpcContext;

export const createContext = async ({
  req,
  res,
}: {
  req: any;
  res: any;
}): Promise<TrpcContext> => {
  return {
    req,
    res,
    user: null,
  };
};

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
