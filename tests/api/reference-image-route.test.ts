import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { EditImageRequest, ProviderConfig, ProviderImageResult } from "@/lib/providers";

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
    createImagesAdapterForProvider: vi.fn()
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
const { getDailyUsage, listGenerationLogs } = await import("@/lib/db");
const { createImagesAdapterForProvider } = await import("@/lib/providers");
const { checkDailyQuota, getUsageDate } = await import("@/lib/usage");
const { POST } = await import("@/app/api/images/edits/route");
const actualDb = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
const actualUsage = await vi.importActual<typeof import("@/lib/usage")>("@/lib/usage");

const mockCreateServerSupabaseClient = createServerSupabaseClient as Mock;
const mockOpenDatabase = openDatabase as Mock;
const mockCreateAdapter = createImagesAdapterForProvider as Mock;
const mockCheckDailyQuota = checkDailyQuota as Mock;
let currentDb: import("@/lib/db").ImageDatabase;

const validFields = {
  provider: "toioto",
  model: "gpt-image-2",
  prompt: "把参考图改成柔和自然光产品照",
  size: "2:3",
  resolution: "standard",
  quality: "high",
  output_format: "png"
};

function createMultipartRequest(options: {
  fields?: Record<string, string>;
  file?: File | null;
} = {}) {
  const form = new FormData();
  const fields = options.fields ?? validFields;

  for (const [key, value] of Object.entries(fields)) {
    form.set(key, value);
  }

  if (options.file !== null) {
    form.set(
      "image",
      options.file ??
        new File(["reference-bytes"], "reference.png", {
          type: "image/png"
        })
    );
  }

  return new Request("http://localhost/api/images/edits", {
    method: "POST",
    body: form
  });
}

function mockUser(userId = "user-w08") {
  mockCreateServerSupabaseClient.mockResolvedValueOnce({
    auth: {
      getUser: async () => ({
        data: { user: { id: userId, email: "w08@example.test" } },
        error: null
      })
    }
  });
}

describe("POST /api/images/edits", () => {
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

    const response = await POST(createMultipartRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("auth_required");
    expect(mockCreateAdapter).not.toHaveBeenCalled();
    expect(mockOpenDatabase).not.toHaveBeenCalled();
  });

  it("缺少参考图返回 invalid_reference_image", async () => {
    mockUser();

    const response = await POST(createMultipartRequest({ file: null }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("invalid_reference_image");
    expect(mockCreateAdapter).not.toHaveBeenCalled();
    expect(mockOpenDatabase).not.toHaveBeenCalled();
  });

  it("文件过大返回 invalid_reference_image", async () => {
    mockUser();
    const tooLargeImage = new File(
      [new Uint8Array(10 * 1024 * 1024 + 1)],
      "large.png",
      { type: "image/png" }
    );

    const response = await POST(createMultipartRequest({ file: tooLargeImage }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("invalid_reference_image");
    expect(mockCreateAdapter).not.toHaveBeenCalled();
    expect(mockOpenDatabase).not.toHaveBeenCalled();
  });

  it("MIME 不支持返回 invalid_reference_image", async () => {
    mockUser();
    const textFile = new File(["not-image"], "reference.txt", { type: "text/plain" });

    const response = await POST(createMultipartRequest({ file: textFile }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("invalid_reference_image");
    expect(mockCreateAdapter).not.toHaveBeenCalled();
    expect(mockOpenDatabase).not.toHaveBeenCalled();
  });

  it("非法参数返回 invalid_generation_params", async () => {
    mockUser();

    const response = await POST(
      createMultipartRequest({
        fields: {
          ...validFields,
          provider: "missing"
        }
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("invalid_generation_params");
    expect(mockCreateAdapter).not.toHaveBeenCalled();
    expect(mockOpenDatabase).not.toHaveBeenCalled();
  });

  it("最小参考图请求只把 model、prompt 和 image 传给 adapter", async () => {
    mockUser();
    const editImage = vi.fn<
      (provider: ProviderConfig, request: EditImageRequest) => Promise<ProviderImageResult>
    >(async () => ({
      b64Json: "edited-base64-image",
      raw: { data: [{ b64_json: "edited-base64-image" }] }
    }));
    mockCreateAdapter.mockReturnValue({ editImage });

    const response = await POST(
      createMultipartRequest({
        fields: {
          provider: "toioto",
          model: "gpt-image-2",
          prompt: "把参考图改成白底商品主图"
        }
      })
    );

    expect(response.status).toBe(200);
    expect(editImage).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        model: "gpt-image-2",
        prompt: "把参考图改成白底商品主图",
        image: expect.any(File),
        imageFilename: "reference.png"
      })
    );
    const request = editImage.mock.calls[0]?.[1];
    expect(request).not.toHaveProperty("size");
    expect(request).not.toHaveProperty("quality");
    expect(request).not.toHaveProperty("outputFormat");
    expect(request).not.toHaveProperty("background");
    expect(request).not.toHaveProperty("moderation");
  });

  it("gpt-image-2 参考图生图不受每日额度拦截，但成功后仍统计用量", async () => {
    mockUser();
    process.env.IMAGE_DAILY_LIMIT = "0";
    const editImage = vi.fn(async () => ({
      b64Json: "edited-base64-image",
      raw: { data: [{ b64_json: "edited-base64-image" }] }
    }));
    mockCreateAdapter.mockReturnValue({ editImage });

    const response = await POST(createMultipartRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockCheckDailyQuota).not.toHaveBeenCalled();
    expect(editImage).toHaveBeenCalledTimes(1);
    expect(body.meta.daily_usage).toEqual({
      generation_count: 1,
      limit: null,
      limited: false
    });
    expect(getDailyUsage(currentDb, "user-w08", getUsageDate())).toBe(1);
    const logs = listGenerationLogs(currentDb, "user-w08");
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      mode: "image-edit",
      status: "success",
      errorCode: null,
      promptLength: validFields.prompt.length,
      hasReferenceImage: true
    });
  });

  it("成功参考图生图调用 edits adapter，写成功日志，递增用量，只返回临时图片数据", async () => {
    mockUser();
    const events: string[] = [];
    mockCheckDailyQuota.mockImplementationOnce((...args: Parameters<typeof checkDailyQuota>) => {
      events.push("quota");
      return actualUsage.checkDailyQuota(...args);
    });
    const editImage = vi.fn<
      (provider: ProviderConfig, request: EditImageRequest) => Promise<ProviderImageResult>
    >(async () => {
      events.push("provider");
      return {
        b64Json: "edited-base64-image",
        raw: { data: [{ b64_json: "source-image" }, { b64_json: "edited-base64-image" }] }
      };
    });
    mockCreateAdapter.mockReturnValue({ editImage });

    const response = await POST(createMultipartRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(events).toEqual(["provider"]);
    expect(mockCheckDailyQuota).not.toHaveBeenCalled();
    expect(editImage).toHaveBeenCalledTimes(1);
    expect(editImage).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "toioto",
        baseUrl: "https://sub2api.toioto.org/v1",
        apiKey: "test-key"
      }),
      expect.objectContaining({
        model: "gpt-image-2",
        prompt: validFields.prompt,
        image: expect.any(File),
        imageFilename: "reference.png"
      })
    );
    const providerRequest = editImage.mock.calls[0]?.[1];
    expect(providerRequest).toBeDefined();
    if (!providerRequest) {
      throw new Error("缺少 provider 请求参数");
    }
    expect(providerRequest.image.type).toBe("image/png");
    expect(providerRequest.image.size).toBe("reference-bytes".length);
    expect(body).toEqual({
      image: {
        b64_json: "edited-base64-image",
        output_format: "auto"
      },
      meta: {
        provider: "toioto",
        model: "gpt-image-2",
        size: "auto",
        resolution: "auto",
        quality: "auto",
        output_format: "auto",
        background: "auto",
        moderation: "auto",
        mode: "image-edit",
        daily_usage: {
          generation_count: 1,
          limit: null,
          limited: false
        }
      }
    });
    expect(JSON.stringify(body)).not.toContain(validFields.prompt);
    expect(JSON.stringify(body)).not.toContain("reference-bytes");
    const logs = listGenerationLogs(currentDb, "user-w08");
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      status: "success",
      errorCode: null,
      promptLength: validFields.prompt.length,
      hasReferenceImage: true
    });
    expect(JSON.stringify(logs)).not.toContain(validFields.prompt);
    expect(JSON.stringify(logs)).not.toContain("reference-bytes");
    expect(JSON.stringify(logs)).not.toContain("edited-base64-image");
    expect(JSON.stringify(logs)).not.toContain("test-key");
    expect(JSON.stringify(logs)).not.toContain("Bearer");
    expect(getDailyUsage(currentDb, "user-w08", getUsageDate())).toBe(1);
  });

  it("provider 失败写失败日志，不递增 daily_usage", async () => {
    mockUser();
    const warnMock = vi.spyOn(console, "warn").mockImplementation(() => {});
    const editImage = vi.fn(async () => {
      throw new Error("provider_request_failed");
    });
    mockCreateAdapter.mockReturnValue({ editImage });

    const response = await POST(createMultipartRequest());
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toBe("provider_request_failed");
    expect(body.message).not.toContain("toioto");
    expect(body.message).not.toContain("test-key");
    expect(body.message).not.toContain("Error:");
    expect(getDailyUsage(currentDb, "user-w08", getUsageDate())).toBe(0);
    const logs = listGenerationLogs(currentDb, "user-w08");
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      status: "failed",
      errorCode: "provider_request_failed",
      promptLength: validFields.prompt.length,
      hasReferenceImage: true
    });
    expect(JSON.stringify(logs)).not.toContain(validFields.prompt);
    expect(JSON.stringify(logs)).not.toContain("test-key");
    expect(JSON.stringify(logs)).not.toContain("Error:");
    expect(mockCreateAdapter).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "toioto"
      }),
      expect.objectContaining({
        logger: console,
        requestId: expect.stringMatching(/^img_/)
      })
    );
    const requestId = mockCreateAdapter.mock.calls[0]?.[1]?.requestId;
    expect(warnMock).toHaveBeenCalledWith(
      "[image-service] image request failed",
      expect.objectContaining({
        requestId,
        providerId: "toioto",
        model: "gpt-image-2",
        mode: "image-edit",
        hasReferenceImage: true,
        promptLength: validFields.prompt.length,
        errorCode: "provider_request_failed",
        durationMs: expect.any(Number)
      })
    );
    const failedLogContext = warnMock.mock.calls.find(
      ([message]) => message === "[image-service] image request failed"
    )?.[1];
    expect(failedLogContext).not.toHaveProperty("size");
    expect(failedLogContext).not.toHaveProperty("resolution");
    expect(failedLogContext).not.toHaveProperty("providerSize");
    expect(failedLogContext).not.toHaveProperty("quality");
    expect(failedLogContext).not.toHaveProperty("outputFormat");
    expect(failedLogContext).not.toHaveProperty("background");
    expect(failedLogContext).not.toHaveProperty("moderation");
    expect(JSON.stringify(warnMock.mock.calls)).not.toContain(validFields.prompt);
    expect(JSON.stringify(warnMock.mock.calls)).not.toContain("reference-bytes");
    warnMock.mockRestore();
  });

  it("provider 返回空图片时写失败日志，不递增 daily_usage", async () => {
    mockUser();
    const editImage = vi.fn(async () => ({
      b64Json: "",
      raw: { data: [{ b64_json: "" }] }
    }));
    mockCreateAdapter.mockReturnValue({ editImage });

    const response = await POST(createMultipartRequest());
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toBe("provider_response_invalid");
    expect(getDailyUsage(currentDb, "user-w08", getUsageDate())).toBe(0);
    const logs = listGenerationLogs(currentDb, "user-w08");
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      status: "failed",
      errorCode: "provider_response_invalid",
      promptLength: validFields.prompt.length,
      hasReferenceImage: true
    });
    expect(JSON.stringify(logs)).not.toContain(validFields.prompt);
    expect(JSON.stringify(logs)).not.toContain("reference-bytes");
    expect(JSON.stringify(logs)).not.toContain("edited-base64-image");
  });
});
