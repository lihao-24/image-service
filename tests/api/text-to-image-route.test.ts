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

vi.mock("@/lib/providers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/providers")>();
  return {
    ...actual,
    createOpenAICompatibleImagesAdapter: vi.fn()
  };
});

vi.mock("@/lib/usage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/usage")>();
  return {
    ...actual,
    checkDailyQuota: vi.fn(actual.checkDailyQuota)
  };
});

const { createServerSupabaseClient } = await import("@/lib/auth/server");
const { openDatabase } = await import("@/lib/db");
const { getDailyUsage, listGenerationLogs, listPromptRecipes } = await import("@/lib/db");
const { createOpenAICompatibleImagesAdapter } = await import("@/lib/providers");
const { checkDailyQuota, getUsageDate } = await import("@/lib/usage");
const { POST } = await import("@/app/api/images/generations/route");
const actualDb = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
const actualUsage = await vi.importActual<typeof import("@/lib/usage")>("@/lib/usage");

const mockCreateServerSupabaseClient = createServerSupabaseClient as Mock;
const mockOpenDatabase = openDatabase as Mock;
const mockCreateAdapter = createOpenAICompatibleImagesAdapter as Mock;
const mockCheckDailyQuota = checkDailyQuota as Mock;
let currentDb: import("@/lib/db").ImageDatabase;

function createRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/images/generations", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

function mockUser(userId = "user-w07") {
  mockCreateServerSupabaseClient.mockResolvedValueOnce({
    auth: {
      getUser: async () => ({
        data: { user: { id: userId, email: "w07@example.test" } },
        error: null
      })
    }
  });
}

const validBody = {
  provider: "sub2api",
  model: "gpt-image-2",
  prompt: "一只玻璃茶杯放在木桌上",
  size: "1024x1536",
  quality: "high",
  output_format: "png"
};

describe("POST /api/images/generations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUB2API_API_KEY = "test-key";
    process.env.IMAGE_DAILY_LIMIT = "20";
    currentDb = actualDb.openDatabase(":memory:");
    actualDb.initializeDatabase(currentDb);
    mockOpenDatabase.mockReturnValue(currentDb);
  });

  it("未登录请求返回 auth_required", async () => {
    mockCreateServerSupabaseClient.mockResolvedValueOnce({
      auth: {
        getUser: async () => ({
          data: { user: null },
          error: null
        })
      }
    });

    const response = await POST(createRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("auth_required");
    expect(mockCreateAdapter).not.toHaveBeenCalled();
    expect(mockOpenDatabase).not.toHaveBeenCalled();
  });

  it("非法参数返回 invalid_generation_params", async () => {
    mockUser();

    const response = await POST(
      createRequest({
        ...validBody,
        size: "2048x2048"
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("invalid_generation_params");
    expect(mockCreateAdapter).not.toHaveBeenCalled();
    expect(mockOpenDatabase).not.toHaveBeenCalled();
  });

  it("额度用尽返回 quota_exceeded，写拒绝日志且不调用 provider", async () => {
    mockUser();
    process.env.IMAGE_DAILY_LIMIT = "0";

    const response = await POST(createRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.error).toBe("quota_exceeded");
    expect(mockCreateAdapter).not.toHaveBeenCalled();
    expect(getDailyUsage(currentDb, "user-w07", getUsageDate())).toBe(0);
    const logs = listGenerationLogs(currentDb, "user-w07");
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      status: "rejected",
      errorCode: "quota_exceeded",
      promptLength: validBody.prompt.length,
      hasReferenceImage: false
    });
  });

  it("成功文生图调用 adapter，写成功日志，递增用量，只返回临时图片数据", async () => {
    mockUser();
    const events: string[] = [];
    mockCheckDailyQuota.mockImplementationOnce((...args: Parameters<typeof checkDailyQuota>) => {
      events.push("quota");
      return actualUsage.checkDailyQuota(...args);
    });
    const generateImage = vi.fn(async () => {
      events.push("provider");
      return {
        b64Json: "base64-image",
        raw: { data: [{ b64_json: "base64-image" }] }
      };
    });
    mockCreateAdapter.mockReturnValue({ generateImage });

    const response = await POST(createRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(events).toEqual(["quota", "provider"]);
    expect(generateImage).toHaveBeenCalledTimes(1);
    expect(generateImage).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "sub2api",
        baseUrl: "https://sub2api.toioto.org/v1",
        apiKey: "test-key"
      }),
      {
        model: "gpt-image-2",
        prompt: validBody.prompt,
        size: "1024x1536",
        quality: "high",
        outputFormat: "png"
      }
    );
    expect(body).toEqual({
      image: {
        b64_json: "base64-image",
        output_format: "png"
      },
      meta: {
        provider: "sub2api",
        model: "gpt-image-2",
        size: "1024x1536",
        quality: "high",
        output_format: "png",
        mode: "text-to-image",
        daily_usage: {
          generation_count: 1,
          limit: 20
        }
      }
    });
    expect(JSON.stringify(body)).not.toContain(validBody.prompt);
    const logs = listGenerationLogs(currentDb, "user-w07");
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      status: "success",
      errorCode: null,
      promptLength: validBody.prompt.length,
      hasReferenceImage: false
    });
    expect(JSON.stringify(logs)).not.toContain(validBody.prompt);
    expect(JSON.stringify(logs)).not.toContain("base64-image");
    expect(JSON.stringify(logs)).not.toContain("test-key");
    expect(JSON.stringify(logs)).not.toContain("Bearer");
    expect(getDailyUsage(currentDb, "user-w07", getUsageDate())).toBe(1);
    expect(listPromptRecipes(currentDb, "user-w07")).toHaveLength(0);
  });

  it("provider 失败写失败日志，不递增 daily_usage", async () => {
    mockUser();
    const generateImage = vi.fn(async () => {
      throw new Error("provider_request_failed");
    });
    mockCreateAdapter.mockReturnValue({ generateImage });

    const response = await POST(createRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toBe("provider_request_failed");
    expect(body.message).not.toContain("provider.internal");
    expect(body.message).not.toContain("test-key");
    expect(body.message).not.toContain("Error:");
    expect(getDailyUsage(currentDb, "user-w07", getUsageDate())).toBe(0);
    const logs = listGenerationLogs(currentDb, "user-w07");
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      status: "failed",
      errorCode: "provider_request_failed",
      promptLength: validBody.prompt.length,
      hasReferenceImage: false
    });
    expect(JSON.stringify(logs)).not.toContain(validBody.prompt);
    expect(JSON.stringify(logs)).not.toContain("test-key");
    expect(JSON.stringify(logs)).not.toContain("Error:");
  });

  it("provider 返回空图片时写失败日志，不递增 daily_usage", async () => {
    mockUser();
    const generateImage = vi.fn(async () => ({
      b64Json: "",
      raw: { data: [{ b64_json: "" }] }
    }));
    mockCreateAdapter.mockReturnValue({ generateImage });

    const response = await POST(createRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toBe("provider_response_invalid");
    expect(getDailyUsage(currentDb, "user-w07", getUsageDate())).toBe(0);
    const logs = listGenerationLogs(currentDb, "user-w07");
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      status: "failed",
      errorCode: "provider_response_invalid",
      promptLength: validBody.prompt.length,
      hasReferenceImage: false
    });
    expect(JSON.stringify(logs)).not.toContain(validBody.prompt);
  });
});
