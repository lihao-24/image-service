import { beforeEach, describe, expect, it } from "vitest";
import {
  closeDatabase,
  createPromptRecipe,
  initializeDatabase,
  listPromptRecipes,
  openDatabase
} from "@/lib/db";
import {
  deleteRecipeForUser,
  getRecipeForUser,
  toRecipeApiRecord,
  updateRecipeForUser,
  validateRecipeRequestBody
} from "@/lib/recipes";

describe("recipe helper", () => {
  beforeEach(() => {
    process.env.SUB2API_API_KEY = "test-key";
  });

  it("校验保存请求时不接受 provider 配置、base URL 或 API key 元数据", () => {
    const result = validateRecipeRequestBody({
      title: "危险配置",
      prompt: "一张产品图",
      mode: "text-to-image",
      provider: "toioto",
      providerConfig: { baseUrl: "https://evil.example", apiKey: "secret" },
      baseUrl: "https://evil.example",
      apiKey: "secret",
      model: "gpt-image-2"
    });

    expect(result).toMatchObject({
      ok: false,
      code: "invalid_recipe_params"
    });
  });

  it("保存新 recipe 只要求 provider、model 和 prompt", () => {
    const result = validateRecipeRequestBody({
      title: "白底商品图",
      prompt: "生成白底商品主图",
      mode: "text-to-image",
      provider: "toioto",
      model: "gpt-image-2"
    });

    expect(result).toMatchObject({ ok: true });
    if (result.ok) {
      expect(result.input.provider).toBe("toioto");
      expect(result.input.model).toBe("gpt-image-2");
      expect(result.input.size).toBeUndefined();
      expect(result.input.quality).toBeUndefined();
      expect(result.input.outputFormat).toBeUndefined();
    }
  });

  it("旧 recipe API record 仍返回旧字段用于兼容读取", () => {
    const record = toRecipeApiRecord({
      id: "recipe-legacy",
      userId: "user-a",
      title: "旧配置",
      prompt: "旧 prompt",
      negativePrompt: null,
      mode: "text-to-image",
      provider: "toioto",
      model: "gpt-image-2",
      size: "2:3",
      quality: "high",
      outputFormat: "png",
      params: { resolution: "standard", background: "opaque", moderation: "low" },
      referenceMode: "none",
      isFavorite: false,
      createdAt: "2026-05-29T00:00:00.000Z",
      updatedAt: "2026-05-29T00:00:00.000Z"
    });

    expect(record.size).toBeDefined();
    expect(record.quality).toBeDefined();
    expect(record.output_format).toBeDefined();
  });

  it("用户隔离 helper 不暴露跨用户读取、更新或删除", () => {
    const db = openDatabase(":memory:");
    try {
      initializeDatabase(db);
      const recipeB = createPromptRecipe(db, "user-b", {
        title: "B 的配置",
        prompt: "只属于 B 的 prompt",
        negativePrompt: null,
        mode: "text-to-image",
        provider: "sub2api",
        model: "gpt-image-2",
        size: "2:3",
        quality: "high",
        outputFormat: "png",
        params: { resolution: "standard", background: "opaque", moderation: "low" },
        referenceMode: "none",
        isFavorite: false
      });

      expect(getRecipeForUser(db, "user-a", recipeB.id)).toBeNull();
      expect(
        updateRecipeForUser(db, "user-a", recipeB.id, {
          title: "A 的修改"
        })
      ).toBeNull();
      expect(deleteRecipeForUser(db, "user-a", recipeB.id)).toBe(false);
      expect(listPromptRecipes(db, "user-b")).toMatchObject([
        {
          id: recipeB.id,
          title: "B 的配置",
          prompt: "只属于 B 的 prompt"
        }
      ]);
    } finally {
      closeDatabase(db);
    }
  });
});
