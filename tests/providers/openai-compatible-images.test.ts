import { describe, expect, it, vi } from "vitest";
import {
  createGeminiGenerateContentAdapter,
  createOpenAICompatibleImagesAdapter,
  type ProviderConfig
} from "@/lib/providers";

const provider: ProviderConfig = {
  id: "sub2api",
  label: "Sub2API",
  type: "openai-compatible-images",
  baseUrl: "https://provider.example.test/v1",
  apiKeyEnv: "SUB2API_API_KEY",
  apiKey: "test-key",
  models: [
    {
      id: "gpt-image-2",
      label: "GPT Image 2",
      family: "chatgpt",
      enabled: true,
      supportsTextToImage: true,
      supportsImageToImage: true
    }
  ]
};

describe("createOpenAICompatibleImagesAdapter", () => {
  it("OpenAI-compatible 文生图只发送 model 和 prompt", async () => {
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify({ data: [{ b64_json: "generated-image" }] }),
      { status: 200, headers: { "content-type": "application/json" } }
    ));
    const adapter = createOpenAICompatibleImagesAdapter({ fetch: fetchMock });

    const result = await adapter.generateImage(provider, {
      model: "gpt-image-2",
      prompt: "一只玻璃茶杯"
    });

    expect(result.b64Json).toBe("generated-image");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calls = fetchMock.mock.calls as unknown[][];
    expect(calls[0]?.[0]).toBe(
      "https://provider.example.test/v1/images/generations"
    );
    expect(JSON.parse(String((calls[0]?.[1] as RequestInit).body))).toEqual({
      model: "gpt-image-2",
      prompt: "一只玻璃茶杯"
    });
  });

  it("Gemini generateContent 响应可归一化为 b64Json", async () => {
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: "abc"
                  }
                }
              ]
            }
          }
        ]
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    ));
    const adapter = createGeminiGenerateContentAdapter({ fetch: fetchMock });

    await expect(
      adapter.generateImage(
        { ...provider, type: "gemini-generate-content", authStyle: "api-key-header" },
        { model: "gemini-3.1-flash-image-preview", prompt: "生成白底商品主图" }
      )
    ).resolves.toMatchObject({ b64Json: "abc", mimeType: "image/png" });

    const calls = fetchMock.mock.calls as unknown[][];
    expect(JSON.parse(String((calls[0]?.[1] as RequestInit).body))).toEqual({
      contents: [
        {
          parts: [
            {
              text: "生成白底商品主图"
            }
          ]
        }
      ]
    });
  });

  it("参考图生图请求使用 /images/edits，优先取 data[1] 的 b64_json", async () => {
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify({
        data: [{ b64_json: "source-image" }, { b64_json: "edited-image" }]
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    ));
    const adapter = createOpenAICompatibleImagesAdapter({ fetch: fetchMock });
    const referenceImage = new Blob(["fake-image"], { type: "image/png" });

    const result = await adapter.editImage(provider, {
      model: "gpt-image-2",
      prompt: "换成暖色背景",
      image: referenceImage,
      imageFilename: "reference.png"
    });

    expect(result.b64Json).toBe("edited-image");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calls = fetchMock.mock.calls as unknown[][];
    expect(calls[0]?.[0]).toBe("https://provider.example.test/v1/images/edits");
  });

  it("参考图生图没有 data[1] 时回退取 data[0] 的 b64_json", async () => {
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify({
        data: [{ b64_json: "fallback-edited-image" }]
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    ));
    const adapter = createOpenAICompatibleImagesAdapter({ fetch: fetchMock });

    const result = await adapter.editImage(provider, {
      model: "gpt-image-2",
      prompt: "保持主体，改成午后光线",
      image: new Blob(["fake-image"], { type: "image/png" }),
      imageFilename: "reference.png"
    });

    expect(result.b64Json).toBe("fallback-edited-image");
  });

  it("provider 内容政策错误归一化为 provider_content_policy_violation", async () => {
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify({
        error: {
          code: "content_policy_violation",
          message: "blocked by provider policy"
        }
      }),
      { status: 400, headers: { "content-type": "application/json" } }
    ));
    const adapter = createOpenAICompatibleImagesAdapter({ fetch: fetchMock });

    await expect(
      adapter.generateImage(provider, {
        model: "gpt-image-2",
        prompt: "违规内容"
      })
    ).rejects.toThrow("provider_content_policy_violation");
  });

  it("provider 认证和限流错误归一化为稳定错误码", async () => {
    const authFetchMock = vi.fn(async () => new Response(
      JSON.stringify({ error: { code: "invalid_api_key" } }),
      { status: 401, headers: { "content-type": "application/json" } }
    ));
    const authAdapter = createOpenAICompatibleImagesAdapter({ fetch: authFetchMock });

    await expect(
      authAdapter.generateImage(provider, {
        model: "gpt-image-2",
        prompt: "测试"
      })
    ).rejects.toThrow("provider_auth_failed");

    const rateLimitFetchMock = vi.fn(async () => new Response(
      JSON.stringify({ error: { code: "rate_limit_exceeded" } }),
      { status: 429, headers: { "content-type": "application/json" } }
    ));
    const rateLimitAdapter = createOpenAICompatibleImagesAdapter({
      fetch: rateLimitFetchMock
    });

    await expect(
      rateLimitAdapter.generateImage(provider, {
        model: "gpt-image-2",
        prompt: "测试"
      })
    ).rejects.toThrow("provider_rate_limited");
  });

  it("provider 返回缺少图片时输出脱敏诊断日志", async () => {
    const infoMock = vi.fn();
    const warnMock = vi.fn();
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify({
        data: [{ revised_prompt: "不要记录 prompt" }],
        error: { code: "empty_result", type: "provider_error", message: "不要记录 message" }
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    ));
    const adapter = createOpenAICompatibleImagesAdapter({
      fetch: fetchMock,
      logger: { info: infoMock, warn: warnMock }
    });

    await expect(
      adapter.generateImage(provider, {
        model: "gpt-image-2",
        prompt: "敏感 prompt 不应进入日志"
      })
    ).rejects.toThrow("provider_response_invalid");

    expect(warnMock).toHaveBeenCalledWith(
      "[image-provider] invalid provider response",
      {
        requestId: "img_untracked",
        providerId: "sub2api",
        endpoint: "/images/generations",
        status: 200,
        statusText: "",
        ok: true,
        contentType: "application/json",
        contentLength: null,
        response: {
          topLevelKeys: ["data", "error"],
          dataLength: 1,
          dataItems: [{ index: 0, keys: ["revised_prompt"], hasB64Json: false }],
          errorCode: "empty_result",
          errorType: "provider_error"
        }
      }
    );
  });

  it("provider 返回非 JSON 时输出响应摘要和脱敏 body 预览", async () => {
    const infoMock = vi.fn();
    const warnMock = vi.fn();
    const fetchMock = vi.fn(async () => new Response(
      "<html><body>Gateway timeout sk-test-secret Bearer token</body></html>",
      {
        status: 504,
        statusText: "Gateway Timeout",
        headers: {
          "content-type": "text/html; charset=utf-8",
          "content-length": "68"
        }
      }
    ));
    const adapter = createOpenAICompatibleImagesAdapter({
      fetch: fetchMock,
      logger: { info: infoMock, warn: warnMock },
      requestId: "img_test_123"
    });

    await expect(
      adapter.generateImage(provider, {
        model: "gpt-image-2",
        prompt: "敏感 prompt 不应进入日志"
      })
    ).rejects.toThrow("provider_response_invalid");

    expect(warnMock).toHaveBeenCalledWith(
      "[image-provider] provider response json parse failed",
      {
        requestId: "img_test_123",
        providerId: "sub2api",
        endpoint: "/images/generations",
        status: 504,
        statusText: "Gateway Timeout",
        ok: false,
        contentType: "text/html; charset=utf-8",
        contentLength: "68",
        bodyPreview: "<html><body>Gateway timeout [REDACTED_SECRET] [REDACTED_AUTH]</body></html>"
      }
    );
  });

  it("provider 非 2xx JSON 响应输出脱敏诊断日志", async () => {
    const infoMock = vi.fn();
    const warnMock = vi.fn();
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify({
        error: {
          code: "rate_limit_exceeded",
          type: "requests",
          message: "不要记录 provider message"
        }
      }),
      { status: 429, statusText: "Too Many Requests", headers: { "content-type": "application/json" } }
    ));
    const adapter = createOpenAICompatibleImagesAdapter({
      fetch: fetchMock,
      logger: { info: infoMock, warn: warnMock },
      requestId: "img_test_456"
    });

    await expect(
      adapter.generateImage(provider, {
        model: "gpt-image-2",
        prompt: "敏感 prompt 不应进入日志"
      })
    ).rejects.toThrow("provider_rate_limited");

    expect(warnMock).toHaveBeenCalledWith(
      "[image-provider] provider error response",
      {
        requestId: "img_test_456",
        providerId: "sub2api",
        endpoint: "/images/generations",
        status: 429,
        statusText: "Too Many Requests",
        ok: false,
        contentType: "application/json",
        contentLength: null,
        response: {
          topLevelKeys: ["error"],
          dataLength: null,
          dataItems: [],
          errorCode: "rate_limit_exceeded",
          errorType: "requests"
        }
      }
    );
  });
});
