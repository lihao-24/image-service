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
  addTemplateFavorite,
  createPromptRecipe,
  listTemplateFavorites
} = await import("@/lib/db");
const promptTemplatesRoute = await import("@/app/api/prompt-templates/route");
const promptTemplateFavoritesRoute = await import("@/app/api/prompt-templates/favorites/route");
const promptTemplateFavoriteDetailRoute = await import(
  "@/app/api/prompt-templates/favorites/[templateId]/route"
);
const actualDb = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");

const mockCreateServerSupabaseClient = createServerSupabaseClient as Mock;
const mockOpenDatabase = openDatabase as Mock;
let currentDb: import("@/lib/db").ImageDatabase;

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

function createJsonRequest(url: string, body: Record<string, unknown>, method = "POST") {
  return new Request(url, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("Prompt template library API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUB2API_API_KEY = "test-key";
    process.env.SUB2API_BASE_URL = "https://provider.example.test/v1";
    currentDb = actualDb.openDatabase(":memory:");
    actualDb.initializeDatabase(currentDb);
    mockOpenDatabase.mockReturnValue(currentDb);
  });

  it("未登录获取模板库返回 auth_required 且不打开数据库", async () => {
    mockAnonymous();

    const response = await promptTemplatesRoute.GET(
      new Request("http://localhost/api/prompt-templates")
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("auth_required");
    expect(body.message).toMatch(/登录/);
    expect(mockOpenDatabase).not.toHaveBeenCalled();
  });

  it("登录后聚合返回分类、内置模板、我的模板和收藏 ids", async () => {
    const recipe = createPromptRecipe(currentDb, "user-a", dbRecipeInput({ title: "我的主图配置" }));
    addTemplateFavorite(currentDb, "user-a", "builtin-ecommerce-clean-packshot");
    mockUser("user-a");

    const response = await promptTemplatesRoute.GET(
      new Request("http://localhost/api/prompt-templates")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.categories).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "ecommerce-product", name: "商品与电商" })])
    );
    expect(body.templates.builtin).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "builtin-ecommerce-clean-packshot",
          source: "builtin",
          is_favorite: true,
          recommended: expect.objectContaining({
            model: "gpt-image-2",
            output_format: "png"
          })
        })
      ])
    );
    expect(body.templates.mine).toEqual([
      expect.objectContaining({
        id: recipe.id,
        source: "mine",
        title: "我的主图配置",
        user_id: "user-a",
        size: "2:3",
        resolution: "standard",
        background: "opaque",
        moderation: "low"
      })
    ]);
    expect(body.favorite_template_ids).toEqual(["builtin-ecommerce-clean-packshot"]);
  });

  it("API 响应不包含 provider baseUrl、apiKeyEnv 或 API key", async () => {
    createPromptRecipe(
      currentDb,
      "user-a",
      dbRecipeInput({
        params: {
          sourceTemplateId: "builtin-ecommerce-clean-packshot"
        }
      })
    );
    mockUser("user-a");

    const response = await promptTemplatesRoute.GET(
      new Request("http://localhost/api/prompt-templates")
    );
    const rawBody = JSON.stringify(await response.json());

    expect(response.status).toBe(200);
    expect(rawBody).not.toContain("baseUrl");
    expect(rawBody).not.toContain("apiKeyEnv");
    expect(rawBody).not.toContain("api_key");
    expect(rawBody).not.toContain("SUB2API_API_KEY");
    expect(rawBody).not.toContain("https://provider.example.test");
  });

  it.each([
    ["source=builtin", "http://localhost/api/prompt-templates?source=builtin", "builtin"],
    ["source=mine", "http://localhost/api/prompt-templates?source=mine", "mine"],
    [
      "category",
      "http://localhost/api/prompt-templates?category=ecommerce-product",
      "ecommerce-product"
    ],
    ["mode", "http://localhost/api/prompt-templates?mode=image-edit", "image-edit"],
    ["q", "http://localhost/api/prompt-templates?q=商品", "商品"],
    ["favorite=true", "http://localhost/api/prompt-templates?favorite=true", "favorite"]
  ])("支持 %s 筛选", async (_label, url, expected) => {
    createPromptRecipe(currentDb, "user-a", dbRecipeInput({ title: "我的商品模板" }));
    addTemplateFavorite(currentDb, "user-a", "builtin-ecommerce-clean-packshot");
    mockUser("user-a");

    const response = await promptTemplatesRoute.GET(new Request(url));
    const body = await response.json();
    const allTemplates = [...body.templates.builtin, ...body.templates.mine];

    expect(response.status).toBe(200);
    expect(allTemplates.length).toBeGreaterThan(0);
    if (expected === "builtin") {
      expect(body.templates.builtin.length).toBeGreaterThan(0);
      expect(body.templates.mine).toHaveLength(0);
    } else if (expected === "mine") {
      expect(body.templates.builtin).toHaveLength(0);
      expect(body.templates.mine.length).toBeGreaterThan(0);
    } else if (expected === "favorite") {
      expect(allTemplates.every((template) => template.is_favorite === true)).toBe(true);
    } else {
      expect(JSON.stringify(allTemplates)).toContain(expected);
    }
  });

  it("收藏不存在的内置模板会被拒绝", async () => {
    mockUser("user-a");

    const response = await promptTemplateFavoritesRoute.POST(
      createJsonRequest("http://localhost/api/prompt-templates/favorites", {
        template_id: "builtin-not-exists"
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: "invalid_template_id",
      message: "请选择有效的内置提示词模板。"
    });
    expect(listTemplateFavorites(currentDb, "user-a")).toHaveLength(0);
  });

  it("收藏内置模板后聚合响应带 is_favorite true，重复收藏保持幂等", async () => {
    mockUser("user-a");
    const firstResponse = await promptTemplateFavoritesRoute.POST(
      createJsonRequest("http://localhost/api/prompt-templates/favorites", {
        template_id: "builtin-ecommerce-clean-packshot"
      })
    );
    const firstBody = await firstResponse.json();

    mockUser("user-a");
    const secondResponse = await promptTemplateFavoritesRoute.POST(
      createJsonRequest("http://localhost/api/prompt-templates/favorites", {
        template_id: "builtin-ecommerce-clean-packshot"
      })
    );

    mockUser("user-a");
    const listResponse = await promptTemplatesRoute.GET(
      new Request("http://localhost/api/prompt-templates?favorite=true")
    );
    const listBody = await listResponse.json();

    expect(firstResponse.status).toBe(201);
    expect(secondResponse.status).toBe(201);
    expect(firstBody.favorite).toMatchObject({
      user_id: "user-a",
      template_id: "builtin-ecommerce-clean-packshot"
    });
    expect(listTemplateFavorites(currentDb, "user-a")).toHaveLength(1);
    expect(listBody.templates.builtin).toEqual([
      expect.objectContaining({
        id: "builtin-ecommerce-clean-packshot",
        is_favorite: true
      })
    ]);
  });

  it("删除收藏只影响当前用户，不存在时返回 404", async () => {
    addTemplateFavorite(currentDb, "user-a", "builtin-ecommerce-clean-packshot");
    addTemplateFavorite(currentDb, "user-b", "builtin-ecommerce-clean-packshot");
    mockUser("user-a");

    const response = await promptTemplateFavoriteDetailRoute.DELETE(
      new Request(
        "http://localhost/api/prompt-templates/favorites/builtin-ecommerce-clean-packshot",
        { method: "DELETE" }
      ),
      { params: Promise.resolve({ templateId: "builtin-ecommerce-clean-packshot" }) }
    );

    mockUser("user-a");
    const missingResponse = await promptTemplateFavoriteDetailRoute.DELETE(
      new Request(
        "http://localhost/api/prompt-templates/favorites/builtin-ecommerce-clean-packshot",
        { method: "DELETE" }
      ),
      { params: Promise.resolve({ templateId: "builtin-ecommerce-clean-packshot" }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(missingResponse.status).toBe(404);
    expect((await missingResponse.json()).error).toBe("template_favorite_not_found");
    expect(listTemplateFavorites(currentDb, "user-a")).toHaveLength(0);
    expect(listTemplateFavorites(currentDb, "user-b")).toHaveLength(1);
  });

  it("用户 A 不能看到用户 B 的收藏", async () => {
    addTemplateFavorite(currentDb, "user-b", "builtin-ecommerce-clean-packshot");
    mockUser("user-a");

    const response = await promptTemplatesRoute.GET(
      new Request("http://localhost/api/prompt-templates?favorite=true")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.favorite_template_ids).toEqual([]);
    expect(body.templates.builtin).toHaveLength(0);
    expect(JSON.stringify(body)).not.toContain("user-b");
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
    size: "2:3",
    quality: "high",
    outputFormat: "png",
    params: {
      seed: 123,
      resolution: "standard",
      background: "opaque",
      moderation: "low"
    },
    referenceMode: "none",
    isFavorite: true,
    ...patch
  };
}
