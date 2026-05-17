import { describe, expect, it } from "vitest";
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
  updateRecipeForUser,
  validateRecipeRequestBody
} from "@/lib/recipes";

describe("recipe helper", () => {
  it("校验保存请求时不接受 provider 配置、base URL 或 API key 元数据", () => {
    const result = validateRecipeRequestBody({
      title: "危险配置",
      prompt: "一张产品图",
      mode: "text-to-image",
      provider: "sub2api",
      providerConfig: { baseUrl: "https://evil.example", apiKey: "secret" },
      baseUrl: "https://evil.example",
      apiKey: "secret",
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      output_format: "png"
    });

    expect(result).toMatchObject({
      ok: false,
      code: "invalid_recipe_params"
    });
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
        size: "1024x1536",
        quality: "high",
        outputFormat: "png",
        params: {},
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
