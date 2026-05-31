import { describe, expect, it } from "vitest";
import {
  AUTH_REQUIRED,
  getRequiredUserId,
  getSessionUser
} from "@/lib/auth";

describe("auth helper", () => {
  it("无 session 时返回 auth_required", async () => {
    const result = await getSessionUser({
      auth: {
        getUser: async () => ({
          data: { user: null },
          error: null
        })
      }
    });

    expect(result).toEqual({
      ok: false,
      code: AUTH_REQUIRED,
      message: "请先登录后再使用 Focal。"
    });
  });

  it("从 Supabase 校验后的 user 中取得 user_id", async () => {
    const result = await getSessionUser({
      auth: {
        getUser: async () => ({
          data: { user: { id: "user_123" } },
          error: null
        })
      }
    });

    expect(result).toEqual({
      ok: true,
      user: { id: "user_123" },
      userId: "user_123"
    });
  });

  it("getRequiredUserId 对未登录返回 null，对已登录返回 user_id", async () => {
    await expect(
      getRequiredUserId({
        auth: {
          getUser: async () => ({
            data: { user: null },
            error: null
          })
        }
      })
    ).resolves.toBeNull();

    await expect(
      getRequiredUserId({
        auth: {
          getUser: async () => ({
            data: { user: { id: "user_456" } },
            error: null
          })
        }
      })
    ).resolves.toBe("user_456");
  });
});
