import { describe, expect, it } from "vitest";
import { getPublicImageConfig } from "@/lib/config";

describe("getPublicImageConfig", () => {
  it("返回不包含密钥或内部 baseUrl 的默认公开配置", () => {
    const config = getPublicImageConfig();

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
    expect(JSON.stringify(config)).not.toContain("baseUrl");
  });
});
