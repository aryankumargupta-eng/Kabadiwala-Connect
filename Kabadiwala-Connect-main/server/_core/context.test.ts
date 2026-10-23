import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { COOKIE_NAME } from "@shared/const";
import { getUserFromSessionToken } from "../auth";
import type { User } from "./context";
import { createContext } from "./trpc";

vi.mock("../auth", () => ({
  getUserFromSessionToken: vi.fn(),
}));

const mockedGetUserFromSessionToken = vi.mocked(getUserFromSessionToken);

describe("createContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves the user from the session cookie", async () => {
    const user: User = {
      id: 1,
      openId: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: "user",
    };
    mockedGetUserFromSessionToken.mockResolvedValue(user);

    const req = {
      headers: { cookie: `${COOKIE_NAME}=session-token` },
    } as Request;
    const res = { locals: {} } as Response;

    const context = await createContext({ req, res });

    expect(mockedGetUserFromSessionToken).toHaveBeenCalledWith("session-token");
    expect(context).toEqual({ req, res, user });
  });

  it("keeps requests without a session unauthenticated", async () => {
    mockedGetUserFromSessionToken.mockResolvedValue(null);

    const req = { headers: {} } as Request;
    const res = { locals: {} } as Response;

    const context = await createContext({ req, res });

    expect(mockedGetUserFromSessionToken).toHaveBeenCalledWith(undefined);
    expect(context).toEqual({ req, res, user: null });
  });
});
