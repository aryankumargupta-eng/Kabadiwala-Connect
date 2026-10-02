import { describe, expect, it, beforeEach } from "vitest";
import { hashPassword, verifyPassword, validatePassword } from "./auth";
import { clearAuthRateLimits, rateLimitAuthAttempt } from "./rateLimit";

describe("authentication security helpers", () => {
  beforeEach(() => clearAuthRateLimits());

  it("hashes passwords without storing plaintext and verifies them", async () => {
    const password = "SecurePass123";
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash.startsWith("scrypt$")).toBe(true);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
    await expect(verifyPassword("WrongPass123", hash)).resolves.toBe(false);
  });

  it("hashes quickly enough for a responsive signup flow", async () => {
    const started = Date.now();
    await hashPassword("SecurePass123");
    expect(Date.now() - started).toBeLessThan(1500);
  });

  it("rejects weak passwords", () => {
    expect(validatePassword("short")).toBeTruthy();
    expect(validatePassword("abcdefgh")).toBeTruthy();
    expect(validatePassword("12345678")).toBeTruthy();
    expect(validatePassword("SecurePass123")).toBeNull();
  });

  it("limits repeated authentication attempts", () => {
    expect(rateLimitAuthAttempt("test", 2, 60_000).allowed).toBe(true);
    expect(rateLimitAuthAttempt("test", 2, 60_000).allowed).toBe(true);
    expect(rateLimitAuthAttempt("test", 2, 60_000).allowed).toBe(false);
  });
});
