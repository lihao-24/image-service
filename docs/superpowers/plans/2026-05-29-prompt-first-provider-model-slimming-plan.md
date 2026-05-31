# Prompt-First Provider Model Slimming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 image-service 生图链路收敛为供应商、模型、prompt 和可选参考图，并接入二级 provider-model 配置，为 FastCode 与 Gemini 调用方式预留可调试路径。

**Architecture:** 配置层改为 `providers -> models`，API 只校验 provider/model/prompt/能力，provider adapter 只发送极简请求体。前端从公开配置派生供应商和模型选择，移除尺寸、质量、格式、背景和 moderation 控件；旧 recipe/log 字段保留读取兼容，新写入逐步脱离旧参数。

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, SQLite, Supabase Auth, OpenAI-compatible Images API, Gemini generateContent-compatible adapter.

---

## File Map

- Modify: `src/lib/config/index.ts`  
  负责 provider/model 二级配置解析、旧配置兼容、默认模型校验、公开配置投影和按 mode 校验模型能力。
- Modify: `src/lib/images/index.ts`  
  负责生成 API 入参瘦身，允许旧参数存在但不再要求它们。
- Modify: `src/lib/providers/index.ts`  
  负责 OpenAI-compatible 极简请求体、Gemini generateContent 请求体、响应归一化和安全诊断摘要。
- Modify: `src/app/api/images/generations/route.ts`  
  负责文生图 route 切换到极简参数、按 provider type 选择 adapter、日志占位兼容。
- Modify: `src/app/api/images/edits/route.ts`  
  负责参考图生图 route 切换到极简参数、按 provider type 选择 adapter、日志占位兼容。
- Modify: `src/lib/recipes/index.ts`  
  负责旧 recipe 兼容读取、新 recipe 不再要求或写入旧参数字段。
- Modify: `src/app/image-workbench.tsx`  
  负责工作台状态瘦身、请求体瘦身、provider/model fallback。
- Modify: `src/app/workbench/chat-sidebar.tsx`  
  负责 UI 只展示供应商与模型选择，移除旧参数控件。
- Modify: `src/app/workbench/types.ts` and `src/app/workbench/helpers.ts`  
  负责前端类型与旧模板/recipe 参数兼容。
- Modify: `src/app/workbench/message-list.tsx`  
  负责消息中不再展示质量/尺寸等标签，只展示 provider/model。
- Modify: `.env.example`, `env/image-service.local.env.example`, `env/image-service.production.env.example`, `README.md`  
  负责配置模板和运行说明同步。
- Test: `tests/config/public-config.test.ts`
- Test: `tests/images/reference-image-validation.test.ts`
- Test: `tests/providers/openai-compatible-images.test.ts`
- Test: `tests/api/text-to-image-route.test.ts`
- Test: `tests/api/reference-image-route.test.ts`
- Test: `tests/recipes/recipe-helper.test.ts`
- Test: `tests/app/image-workbench.test.tsx`

---

### Task 1: Config 二级 Provider-Model 结构

**Files:**
- Modify: `src/lib/config/index.ts`
- Test: `tests/config/public-config.test.ts`

- [ ] **Step 1: Write failing config tests**

Add tests covering:

```ts
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
  expect(JSON.stringify(config)).not.toContain("apiKeyEnv");
});
```

Add compatibility test:

```ts
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
```

Add model ability tests:

```ts
it("按 route mode 校验模型能力", () => {
  const config = parseImageServiceConfig({
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
      config,
      { mode: "text-to-image" }
    ).ok
  ).toBe(true);
  expect(
    validateImageGenerationParams(
      { provider: "fastcode", model: "text-only-image-model" },
      config,
      { mode: "image-edit" }
    )
  ).toMatchObject({ ok: false, field: "model" });
});
```

- [ ] **Step 2: Run config tests to verify failure**

Run:

```bash
pnpm test tests/config/public-config.test.ts
```

Expected: FAIL because `defaultProviderId`, model object config, and mode-aware validation do not exist yet.

- [ ] **Step 3: Implement config types and parser**

In `src/lib/config/index.ts`:

- Add `ImageModelFamily`, `ImageProviderAuthStyle`, `ImageProviderType`.
- Change `ProviderConfig.models` from `string[]` to `ProviderModelConfig[]`.
- Keep legacy public aliases only if needed for incremental compile.
- Add `defaultProviderId/defaultModelId` while keeping `defaultProvider/defaults.model` compatibility only if frontend still needs it during transition.
- Add `normalizeProviderModelOption()` that accepts either string or object:

```ts
function normalizeProviderModelOption(rawModel: unknown, fieldName: string): ProviderModelConfig {
  if (typeof rawModel === "string" && rawModel.trim()) {
    return {
      id: rawModel.trim(),
      label: rawModel.trim(),
      family: "chatgpt",
      enabled: true,
      supportsTextToImage: true,
      supportsImageToImage: true
    };
  }

  if (!rawModel || typeof rawModel !== "object") {
    throw new Error(`${fieldName} 必须是字符串或对象。`);
  }

  const model = rawModel as Record<string, unknown>;
  const id = readRequiredString(model.id, `${fieldName}.id`);
  return {
    id,
    label: readRequiredString(model.label, `${fieldName}.label`),
    family: readModelFamily(model.family, `${fieldName}.family`),
    enabled: readBoolean(model.enabled, true),
    supportsTextToImage: readBoolean(model.supportsTextToImage, false),
    supportsImageToImage: readBoolean(model.supportsImageToImage, false),
    note: readOptionalString(model.note)
  };
}
```

Add helpers `readModelFamily`, `readBoolean`, `readOptionalString`, and validate provider `type` supports `openai-compatible-images` or `gemini-generate-content`.

- [ ] **Step 4: Implement public projection and mode-aware validation**

Change `toPublicImageConfig()` to project only enabled models:

```ts
providers: config.providers.map((provider) => ({
  id: provider.id,
  label: provider.label,
  models: provider.models
    .filter((model) => model.enabled)
    .map(({ id, label, family, supportsTextToImage, supportsImageToImage }) => ({
      id,
      label,
      family,
      supportsTextToImage,
      supportsImageToImage
    }))
}))
```

Change `validateImageGenerationParams(params, config, options)` so only `provider` and `model` are required. It should:

- reject missing provider/model.
- reject disabled model.
- reject unsupported mode.
- return `{ provider, model, size: "auto", resolution: "auto", quality: "auto", outputFormat: "auto", background: "auto", moderation: "auto" }` for log/schema compatibility.

- [ ] **Step 5: Run config tests**

Run:

```bash
pnpm test tests/config/public-config.test.ts
```

Expected: PASS.

---

### Task 2: Request Validation 与 Provider Adapter 瘦身

**Files:**
- Modify: `src/lib/images/index.ts`
- Modify: `src/lib/providers/index.ts`
- Test: `tests/images/reference-image-validation.test.ts`
- Test: `tests/providers/openai-compatible-images.test.ts`

- [ ] **Step 1: Write request validation tests**

In `tests/images/reference-image-validation.test.ts`, add:

```ts
it("文生图请求只要求 provider、model 和 prompt", () => {
  expect(
    validateTextToImageRequestBody({
      provider: "fastcode",
      model: "gpt-image-2-2k",
      prompt: "生成白底商品主图"
    })
  ).toMatchObject({ ok: true });
});
```

Add:

```ts
it("参考图请求不要求旧图片参数", () => {
  const formData = new FormData();
  formData.set("provider", "fastcode");
  formData.set("model", "gpt-image-2-2k");
  formData.set("prompt", "把参考图改成白底商品主图");
  formData.set("image", new File(["abc"], "reference.png", { type: "image/png" }));

  expect(validateReferenceImageFormData(formData)).toMatchObject({ ok: true });
});
```

- [ ] **Step 2: Write adapter tests**

In `tests/providers/openai-compatible-images.test.ts`, update/add:

```ts
it("OpenAI-compatible 文生图只发送 model 和 prompt", async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    Response.json({ data: [{ b64_json: "abc" }] })
  );
  const adapter = createOpenAICompatibleImagesAdapter({ fetch: fetchMock });

  await adapter.generateImage(provider, {
    model: "gpt-image-2-2k",
    prompt: "生成白底商品主图"
  });

  expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
    model: "gpt-image-2-2k",
    prompt: "生成白底商品主图"
  });
});
```

Add Gemini response parsing test:

```ts
it("Gemini generateContent 响应可归一化为 b64Json", async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    Response.json({
      candidates: [
        {
          content: {
            parts: [
              {
                inlineData: {
                  mimeType: "image/png",
                  data: "abc"
                }
              }
            ]
          }
        }
      ]
    })
  );
  const adapter = createGeminiGenerateContentAdapter({ fetch: fetchMock });

  await expect(
    adapter.generateImage(
      { ...provider, type: "gemini-generate-content", authStyle: "api-key-header" },
      { model: "gemini-3.1-flash-image-preview", prompt: "生成白底商品主图" }
    )
  ).resolves.toMatchObject({ b64Json: "abc", mimeType: "image/png" });
});
```

- [ ] **Step 3: Run tests to verify failure**

Run:

```bash
pnpm test tests/images/reference-image-validation.test.ts tests/providers/openai-compatible-images.test.ts
```

Expected: FAIL because old request validation still requires size/quality/output format and Gemini adapter does not exist.

- [ ] **Step 4: Implement slim request validation**

In `src/lib/images/index.ts`:

- Make `size`, `resolution`, `quality`, `output_format`, `background`, `moderation` optional in `TextToImageRequestBody`.
- `validateTextToImageRequestBody()` should only require prompt/provider/model.
- Keep optional old fields in returned body only if present, but downstream must ignore them for provider requests.
- `createTemporaryImageResponse()` should accept `outputFormat?: string` and fallback to `"auto"` if provider did not return a format.

- [ ] **Step 5: Implement OpenAI-compatible adapter slim body**

In `src/lib/providers/index.ts`:

- Change `GenerateImageRequest` to `{ model: string; prompt: string }`.
- Change `EditImageRequest` to include only model/prompt/image/imageFilename.
- Change JSON body builder:

```ts
function buildImageRequestBody(request: GenerateImageRequest): Record<string, string> {
  return {
    model: request.model,
    prompt: request.prompt
  };
}
```

- Change edits FormData to set only `model`, `prompt`, `image`.

- [ ] **Step 6: Add Gemini adapter**

In `src/lib/providers/index.ts`, add `createGeminiGenerateContentAdapter()` or split to `src/lib/providers/gemini.ts` if the file becomes too large. Implement:

- URL: `${provider.baseUrl.replace(/\/+$/, "")}/models/${request.model}:generateContent` if baseUrl ends at `/v1beta`; otherwise document and test exact join behavior.
- Headers:
  - `x-goog-api-key` when `authStyle === "api-key-header"`.
  - `authorization: Bearer ...` when `authStyle === "bearer"`.
- Body with `contents[0].parts`.
- For image edit, convert `File/Blob` to base64 via `Buffer.from(await image.arrayBuffer()).toString("base64")`.
- Parse `inlineData` and `inline_data`.
- Throw `provider_response_invalid` when no image part exists.

- [ ] **Step 7: Run adapter tests**

Run:

```bash
pnpm test tests/images/reference-image-validation.test.ts tests/providers/openai-compatible-images.test.ts
```

Expected: PASS.

---

### Task 3: API Routes Use Minimal Params and Provider Type Dispatch

**Files:**
- Modify: `src/app/api/images/generations/route.ts`
- Modify: `src/app/api/images/edits/route.ts`
- Test: `tests/api/text-to-image-route.test.ts`
- Test: `tests/api/reference-image-route.test.ts`

- [ ] **Step 1: Write route tests for minimal request body**

In text route tests, add a case where JSON body omits size/quality/output format:

```ts
const response = await POST(
  new Request("http://test.local/api/images/generations", {
    method: "POST",
    body: JSON.stringify({
      provider: "toioto",
      model: "gpt-image-2",
      prompt: "生成白底商品主图"
    })
  })
);
expect(response.status).toBe(200);
```

Assert mocked adapter receives:

```ts
expect(generateImage).toHaveBeenCalledWith(expect.anything(), {
  model: "gpt-image-2",
  prompt: "生成白底商品主图"
});
```

In reference route tests, add equivalent multipart case and assert no `size`, `quality`, `outputFormat`, `background`, or `moderation` keys.

- [ ] **Step 2: Run API route tests to verify failure**

Run:

```bash
pnpm test tests/api/text-to-image-route.test.ts tests/api/reference-image-route.test.ts
```

Expected: FAIL due to old validation and adapter call shapes.

- [ ] **Step 3: Implement adapter dispatch helper**

In route files or provider index, add:

```ts
function createImagesAdapterForProvider(provider: ProviderConfig, requestId: string) {
  if (provider.type === "gemini-generate-content") {
    return createGeminiGenerateContentAdapter({ logger: console, requestId });
  }

  return createOpenAICompatibleImagesAdapter({ logger: console, requestId });
}
```

Prefer exporting this from `src/lib/providers/index.ts` if both routes need it.

- [ ] **Step 4: Update text route**

In `generations/route.ts`:

- Remove `mapImageSizeForProvider`.
- Call `validateImageGenerationParams(bodyResult.body, config, { mode: "text-to-image" })`.
- Build log context with compatibility values:

```ts
size: "auto",
resolution: "auto",
providerSize: "auto",
quality: "auto",
outputFormat: "auto",
background: "auto",
moderation: "auto"
```

- Call adapter:

```ts
result = await adapter.generateImage(paramsResult.provider, {
  model: paramsResult.params.model,
  prompt: bodyResult.body.prompt
});
```

- Write generation log with `size: "auto"`, `quality: "auto"`, `outputFormat: result.outputFormat ?? "auto"`.

- [ ] **Step 5: Update edit route**

Mirror text route changes:

- Validate with `{ mode: "image-edit" }`.
- Remove size mapping.
- Call adapter:

```ts
result = await adapter.editImage(paramsResult.provider, {
  model: paramsResult.params.model,
  prompt: formResult.body.prompt,
  image: formResult.body.image,
  imageFilename: formResult.body.imageFilename
});
```

- Keep reference image validation unchanged.

- [ ] **Step 6: Run API tests**

Run:

```bash
pnpm test tests/api/text-to-image-route.test.ts tests/api/reference-image-route.test.ts
```

Expected: PASS.

---

### Task 4: Recipe and Template Compatibility

**Files:**
- Modify: `src/lib/recipes/index.ts`
- Modify: `src/app/workbench/helpers.ts`
- Modify: `src/app/workbench/types.ts`
- Test: `tests/recipes/recipe-helper.test.ts`

- [ ] **Step 1: Write recipe tests**

Add create test:

```ts
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
```

Add legacy read compatibility test:

```ts
it("旧 recipe API record 仍返回旧字段用于兼容读取", () => {
  const record = toRecipeApiRecord(existingRecipeWithLegacyParams);
  expect(record.size).toBeDefined();
  expect(record.quality).toBeDefined();
  expect(record.output_format).toBeDefined();
});
```

- [ ] **Step 2: Run recipe tests to verify failure**

Run:

```bash
pnpm test tests/recipes/recipe-helper.test.ts
```

Expected: FAIL because recipe validation still requires old fields.

- [ ] **Step 3: Update recipe validation**

In `src/lib/recipes/index.ts`:

- `validateRecipeRequestBody()` should require provider/model but not size/quality/output_format.
- For `PromptRecipeInput`, if DB helper type still requires size/quality/outputFormat, use a transitional function:

```ts
function withLegacyRecipePlaceholders(input: PromptRecipeInput): PromptRecipeInput {
  return {
    ...input,
    size: input.size ?? "auto",
    quality: input.quality ?? "auto",
    outputFormat: input.outputFormat ?? "auto",
    params: {
      ...input.params
    }
  };
}
```

Use this only at DB boundary if TypeScript/schema requires it. Do not include old params in API request validation or frontend save payload.

- [ ] **Step 4: Update template param helper**

In `src/app/workbench/helpers.ts`, change `readTemplateParams()`:

- Builtin templates keep prompt/mode but use fallback provider/model unless a configured model exists.
- Mine templates restore provider/model.
- Ignore old `size`, `quality`, `output_format`, `background`, `moderation`.

- [ ] **Step 5: Run recipe tests**

Run:

```bash
pnpm test tests/recipes/recipe-helper.test.ts
```

Expected: PASS.

---

### Task 5: Frontend Workbench UI Slimming

**Files:**
- Modify: `src/app/image-workbench.tsx`
- Modify: `src/app/workbench/chat-sidebar.tsx`
- Modify: `src/app/workbench/message-list.tsx`
- Modify: `src/app/workbench/types.ts`
- Modify: `src/app/workbench/helpers.ts`
- Test: `tests/app/image-workbench.test.tsx`

- [ ] **Step 1: Write UI tests**

Add tests:

```ts
it("侧边栏只展示供应商和模型选择，不展示旧参数控件", () => {
  render(<ImageWorkbench config={publicConfig} userLabel="hao" />);

  expect(screen.getByLabelText("供应商")).toBeInTheDocument();
  expect(screen.getByLabelText("模型")).toBeInTheDocument();
  expect(screen.queryByLabelText("画面比例")).toBeNull();
  expect(screen.queryByLabelText("分辨率")).toBeNull();
  expect(screen.queryByLabelText("画质")).toBeNull();
  expect(screen.queryByLabelText("输出格式")).toBeNull();
  expect(screen.queryByLabelText("背景")).toBeNull();
  expect(screen.queryByLabelText("安全审核")).toBeNull();
});
```

Add generation payload test:

```ts
expect(fetch).toHaveBeenCalledWith(
  "/api/images/generations",
  expect.objectContaining({
    method: "POST",
    body: JSON.stringify({
      provider: "toioto",
      model: "gpt-image-2",
      prompt: "生成白底商品主图"
    })
  })
);
```

- [ ] **Step 2: Run UI tests to verify failure**

Run:

```bash
pnpm test tests/app/image-workbench.test.tsx
```

Expected: FAIL because old controls still render and payload contains old fields.

- [ ] **Step 3: Update frontend public config test fixture**

Update test `publicConfig` shape to:

```ts
const publicConfig: PublicImageConfig = {
  defaultProviderId: "toioto",
  defaultModelId: "gpt-image-2",
  providers: [
    {
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
    }
  ]
};
```

- [ ] **Step 4: Update workbench state and payload**

In `src/app/workbench/types.ts`, reduce `GenerationParamsSnapshot` to:

```ts
export type GenerationParamsSnapshot = {
  provider: string;
  model: string;
};
```

In `src/app/image-workbench.tsx`:

- Initialize provider/model from `defaultProviderId/defaultModelId`.
- Add helpers `findProvider`, `findModel`, `readFallbackParams`.
- `updateParams` should allow provider change and pick first supported model under provider.
- Generation JSON body should only include provider/model/prompt.
- Generation FormData should only include provider/model/prompt/image.
- Save recipe payload should only include title/prompt/mode/provider/model/reference_mode.

- [ ] **Step 5: Update ChatSidebar**

In `src/app/workbench/chat-sidebar.tsx`:

- Remove old label maps and `readResolutionOptions`.
- Remove settings expanded UI for old parameters.
- Render two select controls:

```tsx
<label>
  <span>供应商</span>
  <select aria-label="供应商" value={params.provider} onChange={...}>
    {config.providers.map((item) => (
      <option key={item.id} value={item.id}>{item.label}</option>
    ))}
  </select>
</label>
<label>
  <span>模型</span>
  <select aria-label="模型" value={params.model} onChange={...}>
    {provider?.models.map((item) => (
      <option key={item.id} value={item.id}>{item.label}</option>
    ))}
  </select>
</label>
```

- Keep visual style close to existing dark sidebar.

- [ ] **Step 6: Update message list display**

In `src/app/workbench/message-list.tsx`:

- Remove quality/size chips.
- Display model as `provider · model` if provider label is available; otherwise model id.
- Avoid exposing base URL or provider internals.

- [ ] **Step 7: Run UI tests**

Run:

```bash
pnpm test tests/app/image-workbench.test.tsx
```

Expected: PASS.

---

### Task 6: Env Templates, Docs, and Full Verification

**Files:**
- Modify: `.env.example`
- Modify: `env/image-service.local.env.example`
- Modify: `env/image-service.production.env.example`
- Modify: `README.md`
- Modify: `docs/specs/2026-05-29-prompt-first-provider-model-slimming-design.md` only if implementation decisions differ from design.

- [ ] **Step 1: Update env examples**

Update provider options to new shape. Example:

```bash
IMAGE_DEFAULT_PROVIDER="toioto"
IMAGE_DEFAULT_MODEL="gpt-image-2"
IMAGE_PROVIDER_OPTIONS='[{"id":"toioto","label":"Toioto","type":"openai-compatible-images","baseUrl":"https://sub2api.toioto.org/v1","apiKeyEnv":"SUB2API_API_KEY","models":[{"id":"gpt-image-2","label":"GPT Image 2","family":"chatgpt","enabled":true,"supportsTextToImage":true,"supportsImageToImage":true}]},{"id":"fastcode","label":"FastCode","type":"openai-compatible-images","baseUrl":"https://timebackward.com","apiKeyEnv":"FASTCODE_API_KEY","models":[{"id":"gpt-image-2-2k","label":"GPT Image 2 2K","family":"chatgpt","enabled":true,"supportsTextToImage":true,"supportsImageToImage":true}]}]'
FASTCODE_API_KEY=""
```

- [ ] **Step 2: Update README configuration section**

Document:

- provider id/display label separation.
- provider-model nested config.
- FastCode base URL.
- API key env var placeholders.
- Gemini models require confirming whether third-party exposes OpenAI-compatible or Gemini generateContent shape.

- [ ] **Step 3: Run targeted tests**

Run:

```bash
pnpm test tests/config/public-config.test.ts tests/images/reference-image-validation.test.ts tests/providers/openai-compatible-images.test.ts tests/api/text-to-image-route.test.ts tests/api/reference-image-route.test.ts tests/recipes/recipe-helper.test.ts tests/app/image-workbench.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Run project checks**

Run:

```bash
pnpm lint
pnpm typecheck
git diff --check
```

Expected: all PASS.

- [ ] **Step 5: Build only if config/docs changed runtime behavior**

Run:

```bash
pnpm build
```

Expected: PASS.

- [ ] **Step 6: Manual browser check**

Start dev server:

```bash
pnpm dev
```

Open local app and verify:

- Sidebar shows supplier/model only.
- Old size/quality/format controls are absent.
- Text generation request payload only includes provider/model/prompt.
- Reference image request payload only includes provider/model/prompt/image.

---

## Self-Review

**Spec coverage:**  
Covered provider-model config, default `toioto / gpt-image-2`, FastCode config, Gemini adapter strategy, minimal request body, frontend slimming, recipe compatibility, env/docs, and verification.

**Placeholder scan:**  
No TBD/TODO placeholders. Gemini exact FastCode behavior remains a runtime verification requirement because third-party API shape is unknown until smoke tested; the plan includes both adapter paths.

**Type consistency:**  
Plan consistently uses `defaultProviderId`, `defaultModelId`, `ProviderModelConfig`, `ImageProviderType`, `ImageProviderAuthStyle`, `supportsTextToImage`, and `supportsImageToImage`.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-29-prompt-first-provider-model-slimming-plan.md`. Two execution options:

1. **Subagent-Driven (recommended)** - dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
