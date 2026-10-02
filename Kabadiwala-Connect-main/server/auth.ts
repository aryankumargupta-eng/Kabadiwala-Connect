import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { eq, lt } from "drizzle-orm";
import { getDb } from "./db";
import { sessions, users } from "../drizzle/schema";

const scrypt = promisify(
  (
    password: Parameters<typeof scryptCallback>[0],
    salt: Parameters<typeof scryptCallback>[1],
    keyLength: number,
    options: { N: number; r: number; p: number },
    callback: Parameters<typeof scryptCallback>[3],
  ) => scryptCallback(password, salt, keyLength, options, callback),
);
const KEY_LENGTH = 64;
const SCRYPT_N = 4096;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const PASSWORD_MAX_BYTES = 1024;
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const SESSION_MAX_AGE = SESSION_COOKIE_MAX_AGE * 1000;
const SHORT_SESSION_MAX_AGE = 60 * 60 * 24 * 1000;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeLogin(value: string) {
  return value.trim().toLowerCase();
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  })) as Buffer;
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  try {
    const [algorithm, n, r, p, saltText, hashText] = encoded.split("$");
    if (algorithm !== "scrypt" || !n || !r || !p || !saltText || !hashText) return false;
    const salt = Buffer.from(saltText, "base64url");
    const expected = Buffer.from(hashText, "base64url");
    const derived = (await scrypt(password, salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    })) as Buffer;
    return expected.length === derived.length && timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

export function validatePassword(password: string) {
  const bytes = Buffer.byteLength(password, "utf8");
  if (bytes < 8) return "Password must be at least 8 characters.";
  if (bytes > PASSWORD_MAX_BYTES) return "Password is too long.";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain at least one letter and one number.";
  }
  return null;
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number, remember: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + (remember ? SESSION_MAX_AGE : SHORT_SESSION_MAX_AGE));
  await db.insert(sessions).values({
    userId,
    tokenHash: hashSessionToken(token),
    expiresAt,
  });

  return { token, expiresAt };
}

export async function getUserFromSessionToken(token?: string) {
  if (!token) return null;
  const db = await getDb();
  if (!db) return null;

  const tokenHash = hashSessionToken(token);
  const rows = await db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      user: {
        id: users.id,
        openId: users.openId,
        name: users.name,
        email: users.email,
        phone: users.phone,
        phoneVerifiedAt: users.phoneVerifiedAt,
        emailVerifiedAt: users.emailVerifiedAt,
        preferredLanguage: users.preferredLanguage,
        loginMethod: users.loginMethod,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        lastSignedIn: users.lastSignedIn,
      },
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  if (row.expiresAt.getTime() <= Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, row.sessionId));
    return null;
  }

  return row.user;
}

export async function deleteSession(token?: string) {
  if (!token) return;
  const db = await getDb();
  if (!db) return;
  await db.delete(sessions).where(eq(sessions.tokenHash, hashSessionToken(token)));
}

export async function purgeExpiredSessions() {
  const db = await getDb();
  if (!db) return;
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

export { normalizeEmail };
