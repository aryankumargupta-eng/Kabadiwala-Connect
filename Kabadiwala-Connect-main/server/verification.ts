import { createHash, randomInt } from "node:crypto";
import { eq, and, gt } from "drizzle-orm";
import { getDb } from "./db";
import { users, verificationTokens } from "../drizzle/schema";

const CODE_LENGTH = 6;
const CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function generateCode(): string {
  const min = Math.pow(10, CODE_LENGTH - 1);
  const max = Math.pow(10, CODE_LENGTH) - 1;
  return String(randomInt(min, max + 1));
}

/**
 * Creates a verification code for a user.
 * Removes any existing tokens of the same type before creating a new one.
 */
export async function createVerificationCode(
  userId: number,
  type: "email" | "phone"
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");

  // Remove any existing tokens of this type for this user
  await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.userId, userId),
        eq(verificationTokens.type, type)
      )
    );

  const code = generateCode();
  const tokenHash = hashCode(code);
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MS);

  await db.insert(verificationTokens).values({
    userId,
    type,
    tokenHash,
    expiresAt,
  });

  return code;
}

/**
 * Validates a verification code for a user.
 * On success, marks the user as verified and cleans up the token.
 */
export async function validateVerificationCode(
  userId: number,
  type: "email" | "phone",
  code: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");

  const tokenHash = hashCode(code.trim());
  const now = new Date();

  const rows = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.userId, userId),
        eq(verificationTokens.type, type),
        eq(verificationTokens.tokenHash, tokenHash),
        gt(verificationTokens.expiresAt, now)
      )
    )
    .limit(1);

  if (!rows[0]) return false;

  // Mark user as verified
  if (type === "email") {
    await db
      .update(users)
      .set({ emailVerifiedAt: now, updatedAt: now })
      .where(eq(users.id, userId));
  } else {
    await db
      .update(users)
      .set({ phoneVerifiedAt: now, updatedAt: now })
      .where(eq(users.id, userId));
  }

  // Clean up used token
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.id, rows[0].id));

  return true;
}

/**
 * Sends an email verification code.
 * In production, integrate with an email service (SendGrid, SES, etc.).
 * Currently logs to console for development.
 */
export async function sendEmailVerificationCode(
  email: string,
  code: string,
  _locale = "en"
): Promise<void> {
  // TODO: Replace with actual email service integration
  console.log(
    `[Email Verification] Code for ${email}: ${code} (expires in 10 minutes)`
  );
}

/**
 * Sends a phone verification code using Twilio Verify.
 * Reuses the existing OTP infrastructure.
 */
export async function sendPhoneVerificationCode(
  phone: string,
  locale = "en"
): Promise<void> {
  // Use the existing Twilio-based OTP sender from otp.ts
  const { sendOtp } = await import("./otp");
  await sendOtp(phone, locale);
}

/**
 * Verifies a phone code using Twilio Verify.
 * Reuses the existing OTP infrastructure.
 */
export async function verifyPhoneCode(
  phone: string,
  code: string
): Promise<boolean> {
  const { verifyOtp } = await import("./otp");
  return verifyOtp(phone, code);
}
