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
});
