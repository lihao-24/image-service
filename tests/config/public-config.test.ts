import { describe, expect, it } from "vitest";
import {
  getPublicImageConfig,
  parseImageServiceConfig,
  validateImageGenerationParams
} from "@/lib/config";

describe("getPublicImageConfig", () => {
  it("返回不包含密钥或内部 baseUrl 的默认公开配置", () => {
    const config = getPublicImageConfig({
      SUB2API_API_KEY: "test-key"
    });

    expect(config.defaultProvider).toBe("sub2api");
    expect(config.defaults).toEqual({
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png"
    });
    expect(config.providers).toEqual([
      {
        id: "sub2api",
        label: "Sub2API",
        models: ["gpt-image-2"]
      }
    ]);
    expect(JSON.stringify(config)).not.toContain("apiKey");
    expect(JSON.stringify(config)).not.toContain("apiKeyEnv");
    expect(JSON.stringify(config)).not.toContain("baseUrl");
  });
});

describe("parseImageServiceConfig", () => {
  it("从环境变量解析服务端 provider 配置，并要求默认值都存在于 allowlist", () => {
    const config = parseImageServiceConfig({
      IMAGE_DEFAULT_PROVIDER: "sub2api",
      IMAGE_PROVIDER_OPTIONS:
        '[{"id":"sub2api","label":"Sub2API","type":"openai-compatible-images","baseUrl":"https://example.test/v1","apiKeyEnv":"SUB2API_API_KEY","models":["gpt-image-2"]}]',
      SUB2API_API_KEY: "test-key",
      IMAGE_DEFAULT_MODEL: "gpt-image-2",
      IMAGE_DEFAULT_SIZE: "1024x1536",
      IMAGE_DEFAULT_QUALITY: "high",
      IMAGE_DEFAULT_OUTPUT_FORMAT: "png",
      IMAGE_SIZE_OPTIONS: "1024x1024,1024x1536,1536x1024",
      IMAGE_QUALITY_OPTIONS: "high,medium,low",
      IMAGE_OUTPUT_FORMAT_OPTIONS: "png,jpeg,webp"
    });

    expect(config.defaultProvider).toBe("sub2api");
    expect(config.defaults).toEqual({
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png"
    });
    expect(config.providers[0]).toMatchObject({
      id: "sub2api",
      baseUrl: "https://example.test/v1",
      apiKey: "test-key",
      apiKeyEnv: "SUB2API_API_KEY"
    });
  });

  it("拒绝默认 provider 不在 provider allowlist 中的配置", () => {
    expect(() =>
      parseImageServiceConfig({
        IMAGE_DEFAULT_PROVIDER: "missing",
        IMAGE_PROVIDER_OPTIONS:
          '[{"id":"sub2api","label":"Sub2API","type":"openai-compatible-images","baseUrl":"https://example.test/v1","apiKeyEnv":"SUB2API_API_KEY","models":["gpt-image-2"]}]',
        SUB2API_API_KEY: "test-key"
      })
    ).toThrow(/默认 provider/);
  });

  it("拒绝默认参数不在 allowlist 中的配置", () => {
    expect(() =>
      parseImageServiceConfig({
        IMAGE_PROVIDER_OPTIONS:
          '[{"id":"sub2api","label":"Sub2API","type":"openai-compatible-images","baseUrl":"https://example.test/v1","apiKeyEnv":"SUB2API_API_KEY","models":["gpt-image-2"]}]',
        SUB2API_API_KEY: "test-key",
        IMAGE_DEFAULT_MODEL: "gpt-image-1"
      })
    ).toThrow(/默认 model/);
  });
});

describe("validateImageGenerationParams", () => {
  const config = parseImageServiceConfig({
    IMAGE_PROVIDER_OPTIONS:
      '[{"id":"sub2api","label":"Sub2API","type":"openai-compatible-images","baseUrl":"https://example.test/v1","apiKeyEnv":"SUB2API_API_KEY","models":["gpt-image-2"]}]',
    SUB2API_API_KEY: "test-key"
  });

  it("接受完整合法参数", () => {
    const result = validateImageGenerationParams(
      {
        provider: "sub2api",
        model: "gpt-image-2",
        size: "1024x1536",
        quality: "high",
        output_format: "png"
      },
      config
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params).toEqual({
        provider: "sub2api",
        model: "gpt-image-2",
        size: "1024x1536",
        quality: "high",
        outputFormat: "png"
      });
    }
  });

  it.each([
    ["provider", { provider: "evil" }],
    ["model", { model: "gpt-image-1" }],
    ["size", { size: "2048x2048" }],
    ["quality", { quality: "ultra" }],
    ["output_format", { output_format: "gif" }]
  ])("拒绝非法 %s", (_field, override) => {
    const result = validateImageGenerationParams(
      {
        provider: "sub2api",
        model: "gpt-image-2",
        size: "1024x1536",
        quality: "high",
        output_format: "png",
        ...override
      },
      config
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid_generation_params");
    }
  });
});
