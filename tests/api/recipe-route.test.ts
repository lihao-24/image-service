import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

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

const { createServerSupabaseClient } = await import("@/lib/auth/server");
const { openDatabase } = await import("@/lib/db");
const {
  createPromptRecipe,
  listPromptRecipes
} = await import("@/lib/db");
const recipesRoute = await import("@/app/api/recipes/route");
const recipeDetailRoute = await import("@/app/api/recipes/[recipeId]/route");
const actualDb = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");

const mockCreateServerSupabaseClient = createServerSupabaseClient as Mock;
const mockOpenDatabase = openDatabase as Mock;
let currentDb: import("@/lib/db").ImageDatabase;

const validRecipeBody = {
  title: "海边晚霞",
  prompt: "一张海边晚霞产品照片",
  negative_prompt: "低清晰度",
  mode: "text-to-image",
  provider: "sub2api",
  model: "gpt-image-2",
  size: "1024x1536",
  quality: "high",
  output_format: "png",
  params: { seed: 123 },
  reference_mode: "none",
  is_favorite: true
};

function createJsonRequest(url: string, body: Record<string, unknown>, method = "POST") {
  return new Request(url, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

function mockUser(userId = "user-a") {
  mockCreateServerSupabaseClient.mockResolvedValueOnce({
    auth: {
      getUser: async () => ({
        data: { user: { id: userId, email: `${userId}@example.test` } },
        error: null
      })
    }
  });
}

function mockAnonymous() {
  mockCreateServerSupabaseClient.mockResolvedValueOnce({
    auth: {
      getUser: async () => ({
        data: { user: null },
        error: null
      })
    }
  });
}

describe("Prompt recipe API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUB2API_API_KEY = "test-key";
    currentDb = actualDb.openDatabase(":memory:");
    actualDb.initializeDatabase(currentDb);
    mockOpenDatabase.mockReturnValue(currentDb);
  });

  it("未登录保存 recipe 返回 auth_required", async () => {
    mockAnonymous();

    const response = await recipesRoute.POST(
      createJsonRequest("http://localhost/api/recipes", validRecipeBody)
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("auth_required");
    expect(mockOpenDatabase).not.toHaveBeenCalled();
  });

  it("保存 recipe 时忽略客户端 user_id，只使用服务端 auth 用户", async () => {
    mockUser("server-user");

    const response = await recipesRoute.POST(
      createJsonRequest("http://localhost/api/recipes", {
        ...validRecipeBody,
        user_id: "client-user"
      })
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.recipe).toMatchObject({
      user_id: "server-user",
      title: "海边晚霞",
      prompt: "一张海边晚霞产品照片",
      output_format: "png"
    });
    expect(listPromptRecipes(currentDb, "server-user")).toHaveLength(1);
    expect(listPromptRecipes(currentDb, "client-user")).toHaveLength(0);
    expect(JSON.stringify(body)).not.toContain("client-user");
  });

  it.each([
    ["provider", { provider: "evil-provider" }],
    ["model", { model: "unknown-model" }],
    ["size", { size: "2048x2048" }],
    ["quality", { quality: "ultra" }],
    ["output_format", { output_format: "gif" }]
  ])("保存 recipe 时拒绝非法 %s allowlist 参数", async (_field, patch) => {
    mockUser("user-a");

    const response = await recipesRoute.POST(
      createJsonRequest("http://localhost/api/recipes", {
        ...validRecipeBody,
        ...patch
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("invalid_recipe_params");
    expect(listPromptRecipes(currentDb, "user-a")).toHaveLength(0);
  });

  it("只列出当前用户自己的 recipes", async () => {
    createPromptRecipe(currentDb, "user-a", dbRecipeInput({ title: "A 的配置" }));
    createPromptRecipe(currentDb, "user-b", dbRecipeInput({ title: "B 的配置" }));
    mockUser("user-a");

    const response = await recipesRoute.GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.recipes).toHaveLength(1);
    expect(body.recipes[0]).toMatchObject({
      user_id: "user-a",
      title: "A 的配置"
    });
    expect(JSON.stringify(body)).not.toContain("B 的配置");
    expect(JSON.stringify(body)).not.toContain("user-b");
  });

  it("用户 A 不能读取、更新或删除用户 B 的 recipe", async () => {
    const recipeB = createPromptRecipe(
      currentDb,
      "user-b",
      dbRecipeInput({ title: "B 的配置" })
    );

    mockUser("user-a");
    const readResponse = await recipeDetailRoute.GET(
      new Request(`http://localhost/api/recipes/${recipeB.id}`),
      { params: Promise.resolve({ recipeId: recipeB.id }) }
    );

    mockUser("user-a");
    const updateResponse = await recipeDetailRoute.PATCH(
      createJsonRequest(
        `http://localhost/api/recipes/${recipeB.id}`,
        { title: "A 试图修改", prompt: "越权修改" },
        "PATCH"
      ),
      { params: Promise.resolve({ recipeId: recipeB.id }) }
    );

    mockUser("user-a");
    const deleteResponse = await recipeDetailRoute.DELETE(
      new Request(`http://localhost/api/recipes/${recipeB.id}`, { method: "DELETE" }),
      { params: Promise.resolve({ recipeId: recipeB.id }) }
    );

    expect(readResponse.status).toBe(404);
    expect((await readResponse.json()).error).toBe("recipe_not_found");
    expect(updateResponse.status).toBe(404);
    expect((await updateResponse.json()).error).toBe("recipe_not_found");
    expect(deleteResponse.status).toBe(404);
    expect((await deleteResponse.json()).error).toBe("recipe_not_found");
    expect(actualDb.getPromptRecipeById(currentDb, "user-b", recipeB.id)).toMatchObject({
      title: "B 的配置",
      prompt: "一张海边晚霞产品照片"
    });
  });
});

function dbRecipeInput(patch: Partial<Parameters<typeof createPromptRecipe>[2]> = {}) {
  return {
    title: "海边晚霞",
    prompt: "一张海边晚霞产品照片",
    negativePrompt: "低清晰度",
    mode: "text-to-image",
    provider: "sub2api",
    model: "gpt-image-2",
    size: "1024x1536",
    quality: "high",
    outputFormat: "png",
    params: { seed: 123 },
    referenceMode: "none",
    isFavorite: true,
    ...patch
  };
}
