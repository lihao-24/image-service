import { describe, expect, it, vi } from "vitest";
import {
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
  models: ["gpt-image-2"]
};

describe("createOpenAICompatibleImagesAdapter", () => {
  it("文生图请求使用 /images/generations 且可注入 fetch", async () => {
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify({ data: [{ b64_json: "generated-image" }] }),
      { status: 200, headers: { "content-type": "application/json" } }
    ));
    const adapter = createOpenAICompatibleImagesAdapter({ fetch: fetchMock });

    const result = await adapter.generateImage(provider, {
      model: "gpt-image-2",
      prompt: "一只玻璃茶杯",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png"
    });

    expect(result.b64Json).toBe("generated-image");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calls = fetchMock.mock.calls as unknown[][];
    expect(calls[0]?.[0]).toBe(
      "https://provider.example.test/v1/images/generations"
    );
    expect(JSON.parse(String((calls[0]?.[1] as RequestInit).body))).toEqual({
      model: "gpt-image-2",
      prompt: "一只玻璃茶杯",
      size: "1024x1536",
      quality: "high",
      output_format: "png"
    });
  });

  it("文生图请求传递 gpt-image-2 官方可选参数", async () => {
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify({ data: [{ b64_json: "generated-image" }] }),
      { status: 200, headers: { "content-type": "application/json" } }
    ));
    const adapter = createOpenAICompatibleImagesAdapter({ fetch: fetchMock });

    await adapter.generateImage(provider, {
      model: "gpt-image-2",
      prompt: "一张产品图",
      size: "1024x1536",
      quality: "auto",
      outputFormat: "webp",
      background: "opaque",
      moderation: "auto"
    });

    const calls = fetchMock.mock.calls as unknown[][];
    expect(JSON.parse(String((calls[0]?.[1] as RequestInit).body))).toEqual({
      model: "gpt-image-2",
      prompt: "一张产品图",
      size: "1024x1536",
      quality: "auto",
      output_format: "webp",
      background: "opaque",
      moderation: "auto"
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
      imageFilename: "reference.png",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png"
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
      imageFilename: "reference.png",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png"
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
        prompt: "违规内容",
        size: "1024x1024",
        quality: "auto",
        outputFormat: "png"
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
        prompt: "测试",
        size: "1024x1024",
        quality: "auto",
        outputFormat: "png"
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
        prompt: "测试",
        size: "1024x1024",
        quality: "auto",
        outputFormat: "png"
      })
    ).rejects.toThrow("provider_rate_limited");
  });
});
