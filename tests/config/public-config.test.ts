import { describe, expect, it } from "vitest";
import {
  getPublicImageConfig,
  mapImageSizeForProvider,
  parseImageServiceConfig,
  validateImageGenerationParams
} from "@/lib/config";

describe("getPublicImageConfig", () => {
  it("公开配置暴露二级 provider model 配置且不暴露密钥字段", () => {
    const config = getPublicImageConfig({
      SUB2API_API_KEY: "test-key",
      FASTCODE_API_KEY: "fastcode-key",
      IMAGE_DEFAULT_PROVIDER: "toioto",
      IMAGE_DEFAULT_MODEL: "gpt-image-2",
      IMAGE_PROVIDER_OPTIONS: JSON.stringify([
        {
          id: "toioto",
          label: "Toioto",
          type: "openai-compatible-images",
          baseUrl: "https://sub2api.toioto.org/v1",
          apiKeyEnv: "SUB2API_API_KEY",
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
        },
        {
          id: "fastcode",
          label: "FastCode",
          type: "openai-compatible-images",
          baseUrl: "https://timebackward.com",
          apiKeyEnv: "FASTCODE_API_KEY",
          models: [
            {
              id: "gemini-3.1-flash-image-preview",
              label: "Gemini 3.1 Flash Image Preview",
              family: "gemini",
              enabled: true,
              supportsTextToImage: true,
              supportsImageToImage: true
            }
          ]
        }
      ])
    });

    expect(config.defaultProviderId).toBe("toioto");
    expect(config.defaultModelId).toBe("gpt-image-2");
    expect(config.providers[0]).toMatchObject({
      id: "toioto",
      label: "Toioto",
      models: [
        {
          id: "gpt-image-2",
          label: "GPT Image 2",
          family: "chatgpt",
          supportsTextToImage: true,
          supportsImageToImage: true
        }
      ]
    });
    expect(JSON.stringify(config)).not.toContain("test-key");
    expect(JSON.stringify(config)).not.toContain("fastcode-key");
    expect(JSON.stringify(config)).not.toContain("apiKey");
    expect(JSON.stringify(config)).not.toContain("apiKeyEnv");
    expect(JSON.stringify(config)).not.toContain("baseUrl");
  });
});

describe("parseImageServiceConfig", () => {
  it("兼容旧 models 字符串数组配置", () => {
    const config = parseImageServiceConfig({
      SUB2API_API_KEY: "test-key",
      IMAGE_PROVIDER_OPTIONS:
        '[{"id":"toioto","label":"Toioto","type":"openai-compatible-images","baseUrl":"https://sub2api.toioto.org/v1","apiKeyEnv":"SUB2API_API_KEY","models":["gpt-image-2"]}]',
      IMAGE_DEFAULT_PROVIDER: "toioto",
      IMAGE_DEFAULT_MODEL: "gpt-image-2"
    });

    expect(config.providers[0].models[0]).toMatchObject({
      id: "gpt-image-2",
      label: "gpt-image-2",
      family: "chatgpt",
      enabled: true,
      supportsTextToImage: true,
      supportsImageToImage: true
    });
  });

  it("从环境变量解析服务端 provider 配置，并要求默认值都存在于 allowlist", () => {
    const config = parseImageServiceConfig({
      IMAGE_DEFAULT_PROVIDER: "sub2api",
      IMAGE_PROVIDER_OPTIONS:
        '[{"id":"sub2api","label":"Sub2API","type":"openai-compatible-images","baseUrl":"https://example.test/v1","apiKeyEnv":"SUB2API_API_KEY","models":["gpt-image-2"]}]',
      SUB2API_API_KEY: "test-key",
      IMAGE_DEFAULT_MODEL: "gpt-image-2",
      IMAGE_DEFAULT_SIZE: "3:2",
      IMAGE_DEFAULT_RESOLUTION: "hd",
      IMAGE_DEFAULT_QUALITY: "medium",
      IMAGE_DEFAULT_OUTPUT_FORMAT: "png",
      IMAGE_DEFAULT_BACKGROUND: "opaque",
      IMAGE_DEFAULT_MODERATION: "low",
      IMAGE_SIZE_OPTIONS: "auto,1:1,3:2",
      IMAGE_RESOLUTION_OPTIONS: "auto,standard,hd",
      IMAGE_QUALITY_OPTIONS: "auto,high,medium,low",
      IMAGE_OUTPUT_FORMAT_OPTIONS: "png,jpeg,webp",
      IMAGE_BACKGROUND_OPTIONS: "auto,opaque",
      IMAGE_MODERATION_OPTIONS: "auto,low"
    });

    expect(config.defaultProvider).toBe("sub2api");
    expect(config.defaults).toEqual({
      model: "gpt-image-2",
      size: "3:2",
      resolution: "hd",
      quality: "medium",
      outputFormat: "png",
      background: "opaque",
      moderation: "low"
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
        IMAGE_DEFAULT_PROVIDER: "sub2api",
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
    IMAGE_DEFAULT_PROVIDER: "sub2api",
    IMAGE_DEFAULT_MODEL: "gpt-image-2",
    IMAGE_PROVIDER_OPTIONS:
      '[{"id":"sub2api","label":"Sub2API","type":"openai-compatible-images","baseUrl":"https://example.test/v1","apiKeyEnv":"SUB2API_API_KEY","models":["gpt-image-2"]}]',
    SUB2API_API_KEY: "test-key"
  });

  it("接受完整合法参数", () => {
    const result = validateImageGenerationParams(
      {
        provider: "sub2api",
        model: "gpt-image-2",
        size: "3:2",
        resolution: "hd",
        quality: "high",
        output_format: "png",
        background: "opaque",
        moderation: "low"
      },
      config
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params).toEqual({
        provider: "sub2api",
        model: "gpt-image-2",
        size: "auto",
        resolution: "auto",
        quality: "auto",
        outputFormat: "auto",
        background: "auto",
        moderation: "auto"
      });
    }
  });

  it("默认 resolution、background 和 moderation 为 auto", () => {
    const result = validateImageGenerationParams(
      {
        provider: "sub2api",
        model: "gpt-image-2",
        size: "auto",
        quality: "auto",
        output_format: "png"
      },
      config
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params).toMatchObject({
        size: "auto",
        resolution: "auto",
        background: "auto",
        moderation: "auto"
      });
    }
  });

  it("size 为 auto 时将 resolution 归一为 auto", () => {
    const result = validateImageGenerationParams(
      {
        provider: "sub2api",
        model: "gpt-image-2",
        size: "auto",
        resolution: "hd",
        quality: "auto",
        output_format: "png"
      },
      config
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params.resolution).toBe("auto");
    }
  });

  it.each([
    ["provider", { provider: "evil" }],
    ["model", { model: "gpt-image-1" }]
  ])("拒绝非法 %s", (_field, override) => {
    const result = validateImageGenerationParams(
      {
        provider: "sub2api",
        model: "gpt-image-2",
        size: "3:2",
        resolution: "hd",
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

  it("按 route mode 校验模型能力", () => {
    const modeConfig = parseImageServiceConfig({
      FASTCODE_API_KEY: "fastcode-key",
      IMAGE_DEFAULT_PROVIDER: "fastcode",
      IMAGE_DEFAULT_MODEL: "text-only-image-model",
      IMAGE_PROVIDER_OPTIONS: JSON.stringify([
        {
          id: "fastcode",
          label: "FastCode",
          type: "openai-compatible-images",
          baseUrl: "https://timebackward.com",
          apiKeyEnv: "FASTCODE_API_KEY",
          models: [
            {
              id: "text-only-image-model",
              label: "Text Only",
              family: "chatgpt",
              enabled: true,
              supportsTextToImage: true,
              supportsImageToImage: false
            }
          ]
        }
      ])
    });

    expect(
      validateImageGenerationParams(
        { provider: "fastcode", model: "text-only-image-model" },
        modeConfig,
        { mode: "text-to-image" }
      ).ok
    ).toBe(true);
    expect(
      validateImageGenerationParams(
        { provider: "fastcode", model: "text-only-image-model" },
        modeConfig,
        { mode: "image-edit" }
      )
    ).toMatchObject({ ok: false, field: "model" });
  });
});

describe("mapImageSizeForProvider", () => {
  it.each([
    ["auto", "auto", "auto"],
    ["auto", "hd", "auto"],
    ["3:2", "standard", "1536x1024"],
    ["3:2", "hd", "2304x1536"],
    ["2:3", "standard", "1024x1536"],
    ["2:3", "hd", "1536x2304"],
    ["16:9", "standard", "1536x864"],
    ["16:9", "hd", "2048x1152"],
    ["16:9", "4k", "3840x2160"],
    ["9:16", "standard", "864x1536"],
    ["9:16", "hd", "1152x2048"],
    ["9:16", "4k", "2160x3840"]
  ])("映射 gpt-image-2 %s + %s 为 %s", (size, resolution, providerSize) => {
    expect(mapImageSizeForProvider("gpt-image-2", size, resolution)).toBe(providerSize);
  });

  it("非 gpt-image 模型保留原始 size", () => {
    expect(mapImageSizeForProvider("custom-model", "1024x1024", "hd")).toBe("1024x1024");
  });

  it("非法 gpt-image-2 组合抛 invalid_generation_size_resolution", () => {
    expect(() => mapImageSizeForProvider("gpt-image-2", "1:1", "4k")).toThrow(
      "invalid_generation_size_resolution"
    );
  });
});
