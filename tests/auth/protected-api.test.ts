import { describe, expect, it, type Mock, vi } from "vitest";
import { GET } from "@/app/api/auth/me/route";

vi.mock("@/lib/auth/server", () => ({
  createServerSupabaseClient: vi.fn()
}));

const { createServerSupabaseClient } = await import("@/lib/auth/server");
const mockCreateServerSupabaseClient = createServerSupabaseClient as Mock;

describe("GET /api/auth/me", () => {
  it("无 session 时返回 auth_required", async () => {
    mockCreateServerSupabaseClient.mockResolvedValueOnce({
      auth: {
        getUser: async () => ({
          data: { user: null },
          error: null
        })
      }
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      error: "auth_required",
      message: "请先登录后再使用 image-service。"
    });
  });
});
