import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("@/lib/auth/server", () => ({
  createServerSupabaseClient: vi.fn()
}));

vi.mock("@/lib/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/db")>();
  return {
    ...actual,
    openDatabase: vi.fn(),
    closeDatabase: vi.fn()
  };
});

const { createServerSupabaseClient } = await import("@/lib/auth/server");
const { closeDatabase, getDailyUsage, incrementDailyUsage, openDatabase } =
  await import("@/lib/db");
const { getUsageDate } = await import("@/lib/usage");
const usageRoute = await import("@/app/api/usage/route");
const actualDb = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");

const mockCreateServerSupabaseClient = createServerSupabaseClient as Mock;
const mockOpenDatabase = openDatabase as Mock;
const mockCloseDatabase = closeDatabase as Mock;
let currentDb: import("@/lib/db").ImageDatabase;

function mockUser(userId = "user-a") {
  mockCreateServerSupabaseClient.mockResolvedValueOnce({
    auth: {
      getUser: async () => ({
        data: { user: { id: userId, email: `${userId}@example.test` } },
        error: null
      })
    }
  });
}

function mockAnonymous() {
  mockCreateServerSupabaseClient.mockResolvedValueOnce({
    auth: {
      getUser: async () => ({
        data: { user: null },
        error: null
      })
    }
  });
}

describe("GET /api/usage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentDb = actualDb.openDatabase(":memory:");
    actualDb.initializeDatabase(currentDb);
    mockOpenDatabase.mockReturnValue(currentDb);
  });

  it("未登录返回 auth_required 且不打开数据库", async () => {
    mockAnonymous();

    const response = await usageRoute.GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("auth_required");
    expect(body.message).toBeTruthy();
    expect(mockOpenDatabase).not.toHaveBeenCalled();
    expect(mockCloseDatabase).not.toHaveBeenCalled();
  });

  it("已登录返回当前用户今日成功生成次数", async () => {
    const usageDate = getUsageDate();
    incrementDailyUsage(currentDb, "user-a", usageDate);
    incrementDailyUsage(currentDb, "user-a", usageDate);
    mockUser("user-a");

    const response = await usageRoute.GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      usage: {
        date: usageDate,
        generation_count: 2,
        limit: null,
        limited: false
      }
    });
    expect(mockOpenDatabase).toHaveBeenCalledTimes(1);
    expect(mockCloseDatabase).toHaveBeenCalledWith(currentDb);
  });

  it("只读取当前用户用量，不接受客户端 user_id", async () => {
    const usageDate = getUsageDate();
    incrementDailyUsage(currentDb, "user-a", usageDate);
    incrementDailyUsage(currentDb, "client-user", usageDate);
    incrementDailyUsage(currentDb, "client-user", usageDate);
    mockUser("user-a");

    const response = await usageRoute.GET(
      new Request("http://localhost/api/usage?user_id=client-user")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.usage.generation_count).toBe(1);
    expect(getDailyUsage(currentDb, "client-user", usageDate)).toBe(2);
    expect(JSON.stringify(body)).not.toContain("client-user");
  });
});
