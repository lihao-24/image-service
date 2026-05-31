# gpt-image-2 与用量体验加固实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不接入 Google/Gemini 直连、不大改 UI 的前提下，加固 `gpt-image-2` 配置、OpenAI-compatible adapter 错误处理、用量读取 API 和侧边栏用量体验。

**Architecture:** 保留现有 `sub2api` + `openai-compatible-images` provider 路径。配置层扩展 `gpt-image-2` 参数 allowlist，并保持旧环境变量向后兼容；尺寸使用前端“比例 + 分辨率档位”语义，再映射到符合官方自定义尺寸规则的 `WIDTHxHEIGHT`。用量策略集中在 `src/lib/usage/`，生成 routes 调用该策略决定是否拦截；`GET /api/usage` 只读取当前用户今日统计；前端复用当前侧边栏状态和样式。

**Tech Stack:** Next.js App Router, React, TypeScript, SQLite, Vitest.

---

## 文件范围

- Modify: `src/lib/usage/index.ts`
  - 增加模型额度策略 helper，例如 `isUnlimitedUsageModel` / `shouldEnforceDailyQuota`。
- Modify: `src/lib/config/index.ts`
  - 扩展 `gpt-image-2` 参数 allowlist：前端比例 + 分辨率档位、质量、输出格式、背景、moderation，并将语义尺寸映射为 provider 实际 `size`。
- Modify: `src/lib/images/index.ts`
  - 扩展请求校验和 `createTemporaryImageResponse` 的 `daily_usage` meta，支持新增参数与 `limit: null` / `limited`。
- Modify: `src/app/api/images/generations/route.ts`
  - `gpt-image-*` 成功后统计但不做额度拦截。
- Modify: `src/app/api/images/edits/route.ts`
  - 参考图生图采用同一额度策略。
- Create: `src/app/api/usage/route.ts`
  - 登录后读取当前用户今日用量。
- Modify: `src/lib/providers/index.ts`
  - 归一化 OpenAI-compatible provider 非 2xx 错误。
- Modify: `src/app/workbench/types.ts`
  - 扩展 `DailyUsage` 类型。
- Modify: `src/app/workbench/helpers.ts`
  - 调整用量文案和进度百分比逻辑。
- Modify: `src/app/workbench/chat-sidebar.tsx`
  - 加入可点击用量区域和 Usage Modal。
- Modify: `src/app/workbench/helpers.ts`
  - 增加浏览器端参考图压缩 helper。
- Modify: `src/app/image-workbench.tsx`
  - 初始化时拉取 `/api/usage`，生成成功后仍使用生成 API 返回的最新用量；图生图提交前压缩参考图。
- Test: `tests/usage/quota-log.test.ts`
- Test: `tests/config/public-config.test.ts`
- Test: `tests/images/temporary-response.test.ts` 或现有相关测试文件
- Test: `tests/providers/openai-compatible-images.test.ts`
- Test: `tests/api/text-to-image-route.test.ts`
- Test: `tests/api/reference-image-route.test.ts`
- Create: `tests/api/usage-route.test.ts`
- Test: `tests/app/image-workbench.test.tsx`
- Modify docs after code: `docs/reference/openai-compatible-images-api.md`, `docs/reference/data-and-storage.md`

## Task 1: gpt-image-2 官方参数 allowlist

**Files:**
- Modify: `src/lib/config/index.ts`
- Modify: `src/lib/images/index.ts`
- Test: `tests/config/public-config.test.ts`

- [ ] **Step 1: 写失败测试**

在 `tests/config/public-config.test.ts` 增加或扩展公开配置测试：

```ts
it("gpt-image-2 默认公开配置包含官方主流参数选项且不泄露密钥", () => {
  const config = getPublicImageConfig({
    SUB2API_API_KEY: "test-key"
  });

  expect(config.defaultProvider).toBe("sub2api");
  expect(config.defaults).toEqual({
    model: "gpt-image-2",
    size: "auto",
    quality: "auto",
    outputFormat: "png"
  });
  expect(config.options.sizes).toEqual(
    [
      "auto",
      "1:1",
      "3:2",
      "2:3",
      "16:9",
      "9:16"
    ]
  );
  expect(config.options.resolutions).toEqual(["auto", "standard", "hd", "4k"]);
  expect(config.options.qualities).toEqual(["auto", "high", "medium", "low"]);
  expect(config.options.outputFormats).toEqual(
    expect.arrayContaining(["png", "jpeg", "webp"])
  );
  expect(JSON.stringify(config)).not.toContain("test-key");
  expect(JSON.stringify(config)).not.toContain("apiKeyEnv");
  expect(JSON.stringify(config)).not.toContain("baseUrl");
});
```

如果本阶段决定把 `background` 和 `moderation` 加入公开配置，则同一测试还应断言：

```ts
expect(config.options.backgrounds).toEqual(["auto", "opaque"]);
expect(config.options.moderations).toEqual(["auto", "low"]);
expect(config.defaults.background).toBe("auto");
expect(config.defaults.moderation).toBe("auto");
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
pnpm test tests/config/public-config.test.ts
```

Expected: FAIL，当前尺寸不包含新增官方尺寸，也没有新增参数选项。

- [ ] **Step 3: 扩展配置类型与默认值**

在 `src/lib/config/index.ts` 中：

- `DEFAULT_SIZE_OPTIONS` 改为：

```ts
const DEFAULT_SIZE_OPTIONS = "auto,1:1,3:2,2:3,16:9,9:16";
const DEFAULT_RESOLUTION_OPTIONS = "auto,standard,hd,4k";
```

- `DEFAULT_QUALITY_OPTIONS` 改为：

```ts
const DEFAULT_QUALITY_OPTIONS = "auto,high,medium,low";
```

如果加入新增公开参数，则扩展 `PublicImageConfig["options"]` 与 `ImageServiceConfig["options"]`：

```ts
backgrounds: string[];
moderations: string[];
resolutions: string[];
```

默认值：

```ts
const DEFAULT_BACKGROUND_OPTIONS = "auto,opaque";
const DEFAULT_MODERATION_OPTIONS = "auto,low";
const DEFAULT_BACKGROUND = "auto";
const DEFAULT_MODERATION = "auto";
```

新增 provider/model 尺寸映射 helper：

```ts
export function mapImageSizeForProvider(model: string, size: string, resolution: string): string {
  if (!model.startsWith("gpt-image-")) {
    return size;
  }

  if (size === "auto" || resolution === "auto") {
    return "auto";
  }

  const map: Record<string, Record<string, string>> = {
    "1:1": {
      standard: "1024x1024",
      hd: "2048x2048"
    },
    "3:2": {
      standard: "1536x1024",
      hd: "2304x1536"
    },
    "2:3": {
      standard: "1024x1536",
      hd: "1536x2304"
    },
    "16:9": {
      standard: "1536x864",
      hd: "2048x1152",
      "4k": "3840x2160"
    },
    "9:16": {
      standard: "864x1536",
      hd: "1152x2048",
      "4k": "2160x3840"
    }
  };

  const mappedSize = map[size]?.[resolution];
  if (!mappedSize) {
    throw new Error("invalid_generation_size_resolution");
  }

  return mappedSize;
}
```

- [ ] **Step 4: 扩展请求类型和校验**

在 `src/lib/config/index.ts` 的 `ImageGenerationParams` 和 `ValidatedImageGenerationParams` 中增加可选字段：

```ts
background?: string;
moderation?: string;
```

校验规则：

- `background` 未传则不写入 validated params；传了必须在 `backgrounds` 中。
- `moderation` 未传则使用默认值 `auto`；传了必须在 `moderations` 中。
- `resolution` 未传时默认 `auto`；传了必须在 `resolutions` 中。
- `size=auto` 时只允许或归一为 `resolution=auto`。
- `resolution=auto` 时发送 `size=auto`，不强行推断具体像素。
- `background` 默认值为 `auto`。
- `moderation` 默认值为 `auto`。
- `outputCompression` 本阶段不作为官方参数实现，不展示、不校验、不发送。
- routes 调用 adapter 前使用 `mapImageSizeForProvider(paramsResult.params.model, paramsResult.params.size, paramsResult.params.resolution)`，日志和 UI meta 仍保留前端选择的比例和分辨率语义。

- [ ] **Step 5: 运行配置测试**

Run:

```bash
pnpm test tests/config/public-config.test.ts
```

Expected: PASS。

## Task 2: gpt-image-2 配置与额度策略 helper

**Files:**
- Modify: `src/lib/usage/index.ts`
- Test: `tests/usage/quota-log.test.ts`

- [ ] **Step 1: 写失败测试**

在 `tests/usage/quota-log.test.ts` 增加：

```ts
it("GPT Image 官方模型只统计用量，不做每日额度拦截", () => {
  expect(shouldEnforceDailyQuota("gpt-image-2")).toBe(false);
  expect(shouldEnforceDailyQuota("gpt-image-1")).toBe(false);
  expect(shouldEnforceDailyQuota("gpt-image-1-mini")).toBe(false);
  expect(shouldEnforceDailyQuota("imagen-4")).toBe(true);
});
```

并从 `@/lib/usage` import `shouldEnforceDailyQuota`。

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
pnpm test tests/usage/quota-log.test.ts
```

Expected: FAIL，提示 `shouldEnforceDailyQuota` 未导出或不是函数。

- [ ] **Step 3: 最小实现**

在 `src/lib/usage/index.ts` 增加：

```ts
export function shouldEnforceDailyQuota(model: string): boolean {
  return !model.startsWith("gpt-image-");
}
```

- [ ] **Step 4: 运行测试确认通过**

Run:

```bash
pnpm test tests/usage/quota-log.test.ts
```

Expected: PASS。

## Task 3: 生成响应 daily_usage meta 扩展

**Files:**
- Modify: `src/lib/images/index.ts`
- Test: `tests/images/temporary-response.test.ts`

- [ ] **Step 1: 写失败测试**

如果没有 `tests/images/temporary-response.test.ts`，创建该文件：

```ts
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
          outputFormat: "png"
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
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
pnpm test tests/images/temporary-response.test.ts
```

Expected: FAIL，因为 `createTemporaryImageResponse` 当前不接受 `null` limit，也不返回 `limited`。

- [ ] **Step 3: 最小实现**

在 `src/lib/images/index.ts` 中将 `dailyUsage` 参数类型改为：

```ts
dailyUsage: { generationCount: number; limit: number | null; limited: boolean }
```

并返回：

```ts
daily_usage: {
  generation_count: dailyUsage.generationCount,
  limit: dailyUsage.limit,
  limited: dailyUsage.limited
}
```

- [ ] **Step 4: 更新现有调用点编译错误**

暂时在两个 route 里维持现有受限语义：

```ts
{
  generationCount,
  limit: dailyLimit,
  limited: true
}
```

Task 4 会再改为按模型策略传入。

- [ ] **Step 5: 运行相关测试**

Run:

```bash
pnpm test tests/images/temporary-response.test.ts tests/api/text-to-image-route.test.ts tests/api/reference-image-route.test.ts
```

Expected: PASS，若 API 测试断言旧结构失败，先在 Task 3 一并更新断言。

## Task 4: gpt-image-2 生成/编辑只统计不拦截

**Files:**
- Modify: `src/app/api/images/generations/route.ts`
- Modify: `src/app/api/images/edits/route.ts`
- Test: `tests/api/text-to-image-route.test.ts`
- Test: `tests/api/reference-image-route.test.ts`

- [ ] **Step 1: 写文生图失败测试**

在 `tests/api/text-to-image-route.test.ts` 增加：

```ts
it("gpt-image-2 不受每日额度拦截，但成功后仍统计用量", async () => {
  mockUser();
  process.env.IMAGE_DAILY_LIMIT = "0";
  const generateImage = vi.fn(async () => ({
    b64Json: "base64-image",
    raw: { data: [{ b64_json: "base64-image" }] }
  }));
  mockCreateAdapter.mockReturnValue({ generateImage });

  const response = await POST(createRequest(validBody));
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(mockCheckDailyQuota).not.toHaveBeenCalled();
  expect(generateImage).toHaveBeenCalledTimes(1);
  expect(body.meta.daily_usage).toEqual({
    generation_count: 1,
    limit: null,
    limited: false
  });
  expect(getDailyUsage(currentDb, "user-w07", getUsageDate())).toBe(1);
});
```

- [ ] **Step 2: 写参考图失败测试**

在 `tests/api/reference-image-route.test.ts` 增加：

```ts
it("gpt-image-2 参考图生图不受每日额度拦截，但成功后仍统计用量", async () => {
  mockUser();
  process.env.IMAGE_DAILY_LIMIT = "0";
  const editImage = vi.fn(async () => ({
    b64Json: "edited-base64-image",
    raw: { data: [{ b64_json: "edited-base64-image" }] }
  }));
  mockCreateAdapter.mockReturnValue({ editImage });

  const response = await POST(createMultipartRequest());
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(mockCheckDailyQuota).not.toHaveBeenCalled();
  expect(editImage).toHaveBeenCalledTimes(1);
  expect(body.meta.daily_usage).toEqual({
    generation_count: 1,
    limit: null,
    limited: false
  });
  expect(getDailyUsage(currentDb, "user-w08", getUsageDate())).toBe(1);
});
```

- [ ] **Step 3: 运行测试确认失败**

Run:

```bash
pnpm test tests/api/text-to-image-route.test.ts tests/api/reference-image-route.test.ts
```

Expected: FAIL，当前 `IMAGE_DAILY_LIMIT=0` 会返回 `quota_exceeded`。

- [ ] **Step 4: 实现 route 策略**

在两个 route 中 import：

```ts
shouldEnforceDailyQuota
```

计算：

```ts
const quotaLimited = shouldEnforceDailyQuota(paramsResult.params.model);
```

只在 `quotaLimited` 为 `true` 时执行 `checkDailyQuota` 和拒绝逻辑。

成功响应传：

```ts
{
  generationCount,
  limit: quotaLimited ? dailyLimit : null,
  limited: quotaLimited
}
```

- [ ] **Step 5: 更新旧断言**

现有成功测试里 `daily_usage` 从：

```ts
{
  generation_count: 1,
  limit: 20
}
```

改为：

```ts
{
  generation_count: 1,
  limit: null,
  limited: false
}
```

保留额度用尽测试用于未来受限模型时，需要把测试 body 改成受限模型并提供对应 provider allowlist env；或者将该测试下沉到 `checkDailyQuota` helper 层。推荐本阶段保留 helper 层测试，route 层不再断言 `gpt-image-2` 会被额度拦截。

- [ ] **Step 6: 运行测试确认通过**

Run:

```bash
pnpm test tests/api/text-to-image-route.test.ts tests/api/reference-image-route.test.ts tests/usage/quota-log.test.ts
```

Expected: PASS。

## Task 5: OpenAI-compatible adapter 请求参数与错误归一化

**Files:**
- Modify: `src/lib/providers/index.ts`
- Test: `tests/providers/openai-compatible-images.test.ts`

- [ ] **Step 1: 写请求体字段测试**

在文生图测试中追加：

```ts
expect(JSON.parse(String((calls[0]?.[1] as RequestInit).body))).toEqual({
  model: "gpt-image-2",
  prompt: "一只玻璃茶杯",
  size: "1024x1536",
  quality: "auto",
  output_format: "png"
});
```

再增加可选参数请求体测试：

```ts
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
```

- [ ] **Step 2: 写错误归一化失败测试**

在 `tests/providers/openai-compatible-images.test.ts` 增加：

```ts
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
```

再增加认证和限流测试：

```ts
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
```

- [ ] **Step 3: 运行测试确认失败**

Run:

```bash
pnpm test tests/providers/openai-compatible-images.test.ts
```

Expected: FAIL，当前统一抛 `provider_request_failed`。

- [ ] **Step 4: 实现错误归一化**

在 `src/lib/providers/index.ts` 给 `ImagesApiResponse` 增加错误类型：

```ts
type ImagesApiResponse = {
  data?: Array<{
    b64_json?: unknown;
  }>;
  error?: {
    code?: unknown;
    message?: unknown;
    type?: unknown;
  };
};
```

新增：

```ts
function normalizeProviderError(response: Response, json: ImagesApiResponse): Error {
  const code = typeof json.error?.code === "string" ? json.error.code : "";
  const type = typeof json.error?.type === "string" ? json.error.type : "";
  const normalized = `${code} ${type}`.toLowerCase();

  if (normalized.includes("content_policy_violation")) {
    return new Error("provider_content_policy_violation");
  }

  if (response.status === 401 || response.status === 403 || normalized.includes("api_key")) {
    return new Error("provider_auth_failed");
  }

  if (response.status === 429 || normalized.includes("rate_limit")) {
    return new Error("provider_rate_limited");
  }

  return new Error("provider_request_failed");
}
```

在 `readProviderJson` 的 `!response.ok` 分支改为：

```ts
throw normalizeProviderError(response, json as ImagesApiResponse);
```

- [ ] **Step 5: 让 routes 识别新错误码**

在两个 route 的 `normalizeProviderErrorCode` switch 中加入：

```ts
case "provider_content_policy_violation":
```

- [ ] **Step 6: 运行测试**

Run:

```bash
pnpm test tests/providers/openai-compatible-images.test.ts tests/api/text-to-image-route.test.ts tests/api/reference-image-route.test.ts
```

Expected: PASS。

## Task 6: GET /api/usage

**Files:**
- Create: `src/app/api/usage/route.ts`
- Test: `tests/api/usage-route.test.ts`

- [ ] **Step 1: 写失败测试**

创建 `tests/api/usage-route.test.ts`，测试未登录和已登录：

```ts
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
const { incrementDailyUsage } = await import("@/lib/db");
const { getUsageDate } = await import("@/lib/usage");
const actualDb = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
const { GET } = await import("@/app/api/usage/route");

const mockCreateServerSupabaseClient = createServerSupabaseClient as Mock;
const mockOpenDatabase = openDatabase as Mock;
let currentDb: import("@/lib/db").ImageDatabase;

function mockUser(userId = "user-usage") {
  mockCreateServerSupabaseClient.mockResolvedValueOnce({
    auth: {
      getUser: async () => ({
        data: { user: { id: userId, email: "usage@example.test" } },
        error: null
      })
    }
  });
}

describe("GET /api/usage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentDb = actualDb.openDatabase(":memory:");
    actualDb.initializeDatabase(currentDb);
    mockOpenDatabase.mockReturnValue(currentDb);
  });

  it("未登录返回 auth_required", async () => {
    mockCreateServerSupabaseClient.mockResolvedValueOnce({
      auth: {
        getUser: async () => ({
          data: { user: null },
          error: null
        })
      }
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("auth_required");
    expect(mockOpenDatabase).not.toHaveBeenCalled();
  });

  it("返回当前用户今日成功生成次数", async () => {
    mockUser();
    incrementDailyUsage(currentDb, "user-usage", getUsageDate());
    incrementDailyUsage(currentDb, "other-user", getUsageDate());

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      usage: {
        date: getUsageDate(),
        generation_count: 1,
        limit: null,
        limited: false
      }
    });
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
pnpm test tests/api/usage-route.test.ts
```

Expected: FAIL，route 文件不存在。

- [ ] **Step 3: 实现 route**

创建 `src/app/api/usage/route.ts`：

```ts
import { NextResponse } from "next/server";
import { AUTH_REQUIRED, getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { closeDatabase, getDailyUsage, initializeDatabase, openDatabase } from "@/lib/db";
import { getUsageDate } from "@/lib/usage";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const userResult = await getSessionUser(supabase);

  if (!userResult.ok) {
    return NextResponse.json(
      {
        error: AUTH_REQUIRED,
        message: userResult.message
      },
      { status: 401 }
    );
  }

  const db = openDatabase();
  initializeDatabase(db);

  try {
    const date = getUsageDate();
    return NextResponse.json({
      usage: {
        date,
        generation_count: getDailyUsage(db, userResult.userId, date),
        limit: null,
        limited: false
      }
    });
  } finally {
    closeDatabase(db);
  }
}
```

- [ ] **Step 4: 运行测试**

Run:

```bash
pnpm test tests/api/usage-route.test.ts
```

Expected: PASS。

## Task 7: 前端参数控件、用量文案与 Usage Modal

**Files:**
- Modify: `src/app/workbench/types.ts`
- Modify: `src/app/workbench/helpers.ts`
- Modify: `src/app/workbench/chat-sidebar.tsx`
- Modify: `src/app/image-workbench.tsx`
- Test: `tests/app/image-workbench.test.tsx`

- [ ] **Step 1: 扩展类型**

在 `DailyUsage` 中加入：

```ts
date?: string;
limit?: number | null;
limited?: boolean;
```

在 `GenerationParamsSnapshot` 中按实现范围加入：

```ts
resolution?: string;
background?: string;
moderation?: string;
```

- [ ] **Step 2: 写 helper 测试**

在现有 app 测试或新建 helper 测试中覆盖：

```ts
expect(formatUsage({ generation_count: 12, limit: null, limited: false })).toBe(
  "今日生成 12 次 · 不限额"
);
expect(formatUsage({ generation_count: 3, limit: 20, limited: true })).toBe(
  "今日额度 3/20"
);
expect(usagePercent("今日生成 12 次 · 不限额")).toBe(0);
expect(usagePercent("今日额度 3/20")).toBe(15);
```

- [ ] **Step 3: 运行测试确认失败**

Run:

```bash
pnpm test tests/app/image-workbench.test.tsx
```

Expected: FAIL，当前文案不匹配。

- [ ] **Step 4: 实现 helper**

`formatUsage`：

```ts
export function formatUsage(usage?: DailyUsage): string {
  const count = usage?.generation_count ?? 0;

  if (!usage?.limited) {
    return count > 0 ? `今日生成 ${count} 次 · 不限额` : "";
  }

  if (!usage.limit) {
    return count > 0 ? `今日生成 ${count} 次` : "";
  }

  return `今日额度 ${count}/${usage.limit}`;
}
```

`usagePercent` 可继续按 `数字/数字` 解析。

- [ ] **Step 5: 侧边栏加入 gpt-image-2 可选参数控件**

保持当前侧边栏结构，在质量和输出格式附近增加：

- `size` 选项：`auto`、`1:1`、`3:2`、`2:3`、`16:9`、`9:16`
- `resolution` 选项：`auto`、`standard`、`hd`、`4k`
  - 默认 `auto`
  - `size=auto` 时只展示或自动使用 `resolution=auto`
  - `1:1` 可选 `standard`、`hd`
  - `3:2` 可选 `standard`、`hd`
  - `2:3` 可选 `standard`、`hd`
  - `16:9` 可选 `standard`、`hd`、`4k`
  - `9:16` 可选 `standard`、`hd`、`4k`
- `background` select：`auto`、`opaque`
- `moderation` select：`auto`、`low`
  - 参数标签和选项必须显示中文，提交值仍使用英文枚举。
  - `size` 标签显示为“画面比例”：`auto=自动`、`1:1=方图 1:1`、`3:2=横图 3:2`、`2:3=竖图 2:3`、`16:9=宽屏 16:9`、`9:16=竖屏 9:16`
  - `resolution` 标签显示为“分辨率”：`auto=自动`、`standard=标准`、`hd=高清`、`4k=4K`
  - `quality` 标签显示为“画质”：`auto=自动`、`low=草稿`、`medium=标准`、`high=高质量`
  - `output_format` 标签显示为“输出格式”：`png=PNG`、`jpeg=JPEG`、`webp=WebP`
  - `background` 标签显示为“背景”：`auto=自动`、`opaque=不透明`
  - `moderation` 标签显示为“安全审核”：`auto=自动`、`low=宽松`

不展示 `transparent`、`outputCompression`、`input_fidelity`、`stream` / `partial_images`。

- [ ] **Step 6: 图生图提交前压缩参考图**

在 `src/app/workbench/helpers.ts` 增加浏览器端 helper，使用 `createImageBitmap` + `canvas.toBlob`：

```ts
export async function compressReferenceImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const image = await createImageBitmap(file);
  const maxSide = 2048;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));

  if (scale === 1 && file.size <= 2 * 1024 * 1024) {
    image.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    image.close();
    return file;
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.9)
  );

  if (!blob || blob.size >= file.size) {
    return file;
  }

  return new File([blob], replaceExtension(file.name || "reference-image", "jpg"), {
    type: "image/jpeg"
  });
}
```

同时增加 `replaceExtension` 小 helper。压缩失败时返回原文件，不影响现有服务端校验。

在 `image-workbench.tsx` 的参考图提交路径中，调用 `compressReferenceImageForUpload(referenceFile)`，只把压缩后的临时 File 放进本次 `FormData`；预览仍可沿用用户原始选择的 object URL。

- [ ] **Step 7: 侧边栏加入 Modal**

在 `chat-sidebar.tsx` 内新增本地状态：

```ts
const [usageOpen, setUsageOpen] = useState(false);
```

将底部用量区域包装为 button，点击打开 modal。Modal 文案：

```tsx
{usageOpen ? (
  <div role="dialog" aria-modal="true" aria-label="今日用量">
    <h2>今日用量</h2>
    <p>{usageText || "今日尚未生成"}</p>
    <p>GPT Image 系列当前仅统计用量，不做每日额度拦截。</p>
    <button type="button" onClick={() => setUsageOpen(false)}>关闭</button>
  </div>
) : null}
```

样式复用现有深色面板，不引入新依赖。

- [ ] **Step 8: 初始化拉取 /api/usage**

在 `image-workbench.tsx` 初始 effect 中 fetch `/api/usage`，成功后将 `payload.usage` 传给 `formatUsage`。生成成功后继续使用生成 API 返回的 `meta.daily_usage` 覆盖展示。

- [ ] **Step 9: 测试 UI 行为**

在 `tests/app/image-workbench.test.tsx` 增加断言：

```ts
expect(await screen.findByText("今日生成 2 次 · 不限额")).toBeInTheDocument();
await user.click(screen.getByText("今日生成 2 次 · 不限额"));
expect(screen.getByRole("dialog", { name: "今日用量" })).toBeInTheDocument();
expect(screen.getByText("GPT Image 系列当前仅统计用量，不做每日额度拦截。")).toBeInTheDocument();
```

- [ ] **Step 9: 运行测试**

Run:

```bash
pnpm test tests/app/image-workbench.test.tsx
```

Expected: PASS。

## Task 8: 文档同步

**Files:**
- Modify: `docs/reference/openai-compatible-images-api.md`
- Modify: `docs/reference/data-and-storage.md`

- [ ] **Step 1: 更新 OpenAI-compatible reference**

补充：

- `gpt-image-2` 当前作为默认 GPT Image 模型，通过 `sub2api` OpenAI-compatible provider 调用。
- 文生图/参考图请求必须使用 `output_format`。
- 记录前端尺寸显示为比例 + 分辨率档位，后端为 `gpt-image-2` 映射到官方自定义尺寸规则内的 API `size`。
- 记录映射表：`auto+auto=auto`、`1:1+standard=1024x1024`、`1:1+hd=2048x2048`、`3:2+standard=1536x1024`、`3:2+hd=2304x1536`、`2:3+standard=1024x1536`、`2:3+hd=1536x2304`、`16:9+standard=1536x864`、`16:9+hd=2048x1152`、`16:9+4k=3840x2160`、`9:16+standard=864x1536`、`9:16+hd=1152x2048`、`9:16+4k=2160x3840`。
- 记录默认值：`size=auto`、`resolution=auto`、`quality=auto`、`output_format=png`、`background=auto`、`moderation=auto`。
- 记录暂不开放 `n`、`stream`、`partial_images` 和 `input_fidelity` 的原因。
- 错误归一化增加 `provider_content_policy_violation`。

- [ ] **Step 2: 更新 data-and-storage reference**

补充：

- `daily_usage` 继续记录成功生成次数。
- GPT Image 系列当前只统计，不做每日额度拦截。
- 未来受限模型接入时再启用请求前额度拦截。

- [ ] **Step 3: 检查文档差异**

Run:

```bash
git diff -- docs/reference/openai-compatible-images-api.md docs/reference/data-and-storage.md
```

Expected: 只包含上述说明，不引入真实密钥、运行数据或 provider 私有信息。

## Task 9: 全量验证

**Files:** all changed files

- [ ] **Step 1: 运行相关测试**

Run:

```bash
pnpm test tests/config/public-config.test.ts tests/usage/quota-log.test.ts tests/images/temporary-response.test.ts tests/providers/openai-compatible-images.test.ts tests/api/text-to-image-route.test.ts tests/api/reference-image-route.test.ts tests/api/usage-route.test.ts tests/app/image-workbench.test.tsx
```

Expected: PASS。

- [ ] **Step 2: 运行类型检查**

Run:

```bash
pnpm typecheck
```

Expected: PASS。

- [ ] **Step 3: 运行 lint**

Run:

```bash
pnpm lint
```

Expected: PASS。

- [ ] **Step 4: 空白检查**

Run:

```bash
git diff --check
```

Expected: no output, exit 0。

## 执行前确认项

开始编码前，请用户确认：

- 是否同意 `gpt-image-*` 系列“只统计不拦截”的策略。
- 是否同意前端尺寸展示为比例 + 分辨率档位：比例 `auto,1:1,3:2,2:3,16:9,9:16`，分辨率 `auto,standard,hd,4k`，默认都为 `auto`，后端按 provider/model 映射真实尺寸。
- 是否同意默认值：`size=auto`、`resolution=auto`、`quality=auto`、`output_format=png`、`background=auto`、`moderation=auto`。
- 是否同意前端所有参数用中文展示，提交值仍使用英文枚举。
- 是否同意新增官方已确认的 `background` 和 `moderation` 可选参数，并暂不开放 `outputCompression`、`n`、`stream`、`partial_images` 和 `input_fidelity`。
- 是否同意图生图提交前压缩参考图：最长边 `2048px`、`image/jpeg`、质量 `0.9`，压缩失败或压缩后更大则回退原图。
- 是否同意 `/api/usage` 第一版只返回今日总成功生成次数，不做按模型拆分。
- 是否同意 Usage Modal 只做轻量说明，不引入图表。
