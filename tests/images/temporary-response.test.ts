import { describe, expect, it } from "vitest";
import { createTemporaryImageResponse } from "@/lib/images";

describe("createTemporaryImageResponse", () => {
  it("支持无限额模型的用量 meta", () => {
    expect(
      createTemporaryImageResponse(
        "base64-image",
        {
          provider: "sub2api",
          model: "gpt-image-2",
          size: "auto",
          resolution: "auto",
          quality: "auto",
          outputFormat: "png",
          background: "auto",
          moderation: "auto"
        },
        {
          generationCount: 3,
          limit: null,
          limited: false
        }
      ).meta.daily_usage
    ).toEqual({
      generation_count: 3,
      limit: null,
      limited: false
    });
  });
});
