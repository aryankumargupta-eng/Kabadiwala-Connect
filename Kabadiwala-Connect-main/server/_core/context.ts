import type { Request, Response } from "express";
import { parse } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import { getUserFromSessionToken } from "../auth";

export interface User {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  phone?: string | null;
  phoneVerifiedAt?: Date | null;
  preferredLanguage?: string;
  loginMethod?: string | null;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastSignedIn?: Date;
  [key: string]: unknown;
}

export interface TrpcContext {
  req: Request;
  res: Response;
  user: User | null;
}

export async function createContext({ req, res }: { req: Request; res: Response }): Promise<TrpcContext> {
  const token = req.headers.cookie ? parse(req.headers.cookie)[COOKIE_NAME] : undefined;
  const user = await getUserFromSessionToken(token);
  return { req, res, user: user as User | null };
}
