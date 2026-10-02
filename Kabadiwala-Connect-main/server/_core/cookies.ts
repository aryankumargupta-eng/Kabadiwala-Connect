import type { CookieOptions, Request } from "express";

export function getSessionCookieOptions(req?: Request): CookieOptions {
  const isHttps =
    req?.protocol === "https" ||
    req?.headers?.["x-forwarded-proto"] === "https" ||
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: Boolean(isHttps),
    sameSite: "lax",
    path: "/",
  };
}
