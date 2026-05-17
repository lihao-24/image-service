import { NextRequest, NextResponse } from "next/server";
import { describe, expect, it, type Mock, vi } from "vitest";
import { proxy } from "@/proxy";

vi.mock("@/lib/auth/middleware", () => ({
  updateSupabaseSession: vi.fn()
}));

const { updateSupabaseSession } = await import("@/lib/auth/middleware");
const mockUpdateSupabaseSession = updateSupabaseSession as Mock;

function createRequest(pathname: string) {
  return new NextRequest(new URL(`https://image.local${pathname}`));
}

describe("proxy route guard", () => {
  it("未登录访问首页时跳转登录页", async () => {
    mockUpdateSupabaseSession.mockResolvedValueOnce({
      response: NextResponse.next(),
      user: null
    });

    const response = await proxy(createRequest("/"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://image.local/auth/login?redirectTo=%2F"
    );
  });

  it("已登录访问首页时放行", async () => {
    const passThrough = NextResponse.next();
    mockUpdateSupabaseSession.mockResolvedValueOnce({
      response: passThrough,
      user: { id: "user_123" }
    });

    const response = await proxy(createRequest("/"));

    expect(response).toBe(passThrough);
  });
});
