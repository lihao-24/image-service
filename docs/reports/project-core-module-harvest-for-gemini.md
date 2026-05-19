# 项目核心模块资产盘点：image-service

> 目的：在重构生图引擎到 Google Imagen 4 系列前，为 Gemini 提供当前项目核心架构、后端调用链、前端请求 payload 和配置读取逻辑。
>
> 安全说明：本文未读取真实 `.env.local` / `.env.production`，所有密钥和私有值均以 `YOUR_KEY_HERE` 或占位 URL 表示。

---

### 1. 项目当前技术栈与文件结构简述

当前项目是一个 **Next.js App Router + React + TypeScript** 的个人生图服务。

核心技术栈：

- 前端：React Client Component、Next.js App Router、Tailwind CSS
- 后端：Next.js Route Handler
- 鉴权：Supabase Auth + Server Cookie Session
- 数据层：SQLite，使用 Node `node:sqlite`
- 测试：Vitest + Testing Library
- 当前生图 provider：OpenAI-compatible Images API
- 当前模型：`gpt-image-2`
- 当前 provider id：`sub2api`
- 当前生成接口：
  - 文生图：`POST /api/images/generations`
  - 参考图生图：`POST /api/images/edits`
- 前端配置入口：`GET /api/image-options`
- 服务端配置入口：`src/lib/config/index.ts`
- provider 调用适配器：`src/lib/providers/index.ts`

核心文件结构：

```txt
src/app/image-workbench.tsx
src/app/workbench/chat-sidebar.tsx
src/app/workbench/prompt-composer.tsx
src/app/workbench/types.ts

src/app/api/image-options/route.ts
src/app/api/images/generations/route.ts
src/app/api/images/edits/route.ts

src/lib/config/index.ts
src/lib/providers/index.ts
src/lib/images/index.ts
src/lib/usage/index.ts
src/lib/db/index.ts
src/lib/auth/env.ts
src/lib/auth/server.ts
```

---

### 2. 后端核心接口源码

`文件名: src/app/api/images/generations/route.ts`

```ts
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_REQUIRED, getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { parseImageServiceConfig, validateImageGenerationParams } from "@/lib/config";
import { closeDatabase, initializeDatabase, openDatabase } from "@/lib/db";
import {
  createTemporaryImageResponse,
  INVALID_GENERATION_PARAMS,
  validateTextToImageRequestBody
} from "@/lib/images";
import { createOpenAICompatibleImagesAdapter } from "@/lib/providers";
import {
  checkDailyQuota,
  getDailyLimit,
  getUsageDate,
  incrementSuccessfulGenerationUsage,
  QUOTA_EXCEEDED,
  writeGenerationLog
} from "@/lib/usage";

const TEXT_TO_IMAGE_MODE = "text-to-image" as const;

export async function POST(request: NextRequest | Request) {
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

  const bodyResult = validateTextToImageRequestBody(await readJson(request));
  if (!bodyResult.ok) {
    return invalidGenerationParamsResponse(bodyResult.message);
  }

  const config = parseImageServiceConfig();
  const paramsResult = validateImageGenerationParams(bodyResult.body, config);
  if (!paramsResult.ok) {
    return invalidGenerationParamsResponse(paramsResult.message);
  }

  const db = openDatabase();
  initializeDatabase(db);

  const usageDate = getUsageDate();
  const dailyLimit = getDailyLimit();
  const startedAt = performance.now();

  try {
    const quota = checkDailyQuota(db, userResult.userId, usageDate, dailyLimit);
    if (!quota.ok) {
      writeGenerationLog(db, userResult.userId, {
        provider: paramsResult.params.provider,
        model: paramsResult.params.model,
        mode: TEXT_TO_IMAGE_MODE,
        size: paramsResult.params.size,
        quality: paramsResult.params.quality,
        outputFormat: paramsResult.params.outputFormat,
        status: "rejected",
        errorCode: QUOTA_EXCEEDED,
        durationMs: elapsedMs(startedAt),
        prompt: bodyResult.body.prompt,
        hasReferenceImage: false
      });

      return NextResponse.json(
        {
          error: QUOTA_EXCEEDED,
          message: "今日生成额度已用尽，请明天再试。"
        },
        { status: 429 }
      );
    }

    const adapter = createOpenAICompatibleImagesAdapter();
    let result: Awaited<ReturnType<typeof adapter.generateImage>>;

    try {
      result = await adapter.generateImage(paramsResult.provider, {
        model: paramsResult.params.model,
        prompt: bodyResult.body.prompt,
        size: paramsResult.params.size,
        quality: paramsResult.params.quality,
        outputFormat: paramsResult.params.outputFormat
      });
    } catch (error) {
      const errorCode = normalizeProviderErrorCode(error);
      writeGenerationLog(db, userResult.userId, {
        provider: paramsResult.params.provider,
        model: paramsResult.params.model,
        mode: TEXT_TO_IMAGE_MODE,
        size: paramsResult.params.size,
        quality: paramsResult.params.quality,
        outputFormat: paramsResult.params.outputFormat,
        status: "failed",
        errorCode,
        durationMs: elapsedMs(startedAt),
        prompt: bodyResult.body.prompt,
        hasReferenceImage: false
      });

      return NextResponse.json(
        {
          error: errorCode,
          message: "图片生成服务暂时不可用，请稍后再试。"
        },
        { status: 502 }
      );
    }

    if (!isUsableImageB64Json(result.b64Json)) {
      const errorCode = "provider_response_invalid";
      writeGenerationLog(db, userResult.userId, {
        provider: paramsResult.params.provider,
        model: paramsResult.params.model,
        mode: TEXT_TO_IMAGE_MODE,
        size: paramsResult.params.size,
        quality: paramsResult.params.quality,
        outputFormat: paramsResult.params.outputFormat,
        status: "failed",
        errorCode,
        durationMs: elapsedMs(startedAt),
        prompt: bodyResult.body.prompt,
        hasReferenceImage: false
      });

      return NextResponse.json(
        {
          error: errorCode,
          message: "图片生成服务暂时不可用，请稍后再试。"
        },
        { status: 502 }
      );
    }

    const generationCount = incrementSuccessfulGenerationUsage(
      db,
      userResult.userId,
      usageDate
    );

    writeGenerationLog(db, userResult.userId, {
      provider: paramsResult.params.provider,
      model: paramsResult.params.model,
      mode: TEXT_TO_IMAGE_MODE,
      size: paramsResult.params.size,
      quality: paramsResult.params.quality,
      outputFormat: paramsResult.params.outputFormat,
      status: "success",
      errorCode: null,
      durationMs: elapsedMs(startedAt),
      prompt: bodyResult.body.prompt,
      imageB64Json: result.b64Json,
      hasReferenceImage: false
    });

    return NextResponse.json(
      createTemporaryImageResponse(result.b64Json, paramsResult.params, {
        generationCount,
        limit: dailyLimit
      })
    );
  } finally {
    closeDatabase(db);
  }
}

async function readJson(request: NextRequest | Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function invalidGenerationParamsResponse(message: string) {
  return NextResponse.json(
    {
      error: INVALID_GENERATION_PARAMS,
      message
    },
    { status: 400 }
  );
}

function elapsedMs(startedAt: number): number {
  return Math.max(0, Math.round(performance.now() - startedAt));
}

function normalizeProviderErrorCode(error: unknown): string {
  if (error instanceof Error) {
    switch (error.message) {
      case "provider_request_failed":
      case "provider_response_invalid":
      case "provider_rate_limited":
      case "provider_auth_failed":
        return error.message;
      default:
        return "provider_request_failed";
    }
  }

  return "provider_request_failed";
}

function isUsableImageB64Json(value: string): boolean {
  return value.trim().length > 0;
}
```

`文件名: src/lib/providers/index.ts`

```ts
import type { ProviderConfig } from "@/lib/config";

export type { ProviderConfig } from "@/lib/config";

export type ProviderImageResult = {
  b64Json: string;
  raw: unknown;
};

export type GenerateImageRequest = {
  model: string;
  prompt: string;
  size: string;
  quality: string;
  outputFormat: string;
};

export type EditImageRequest = GenerateImageRequest & {
  image: Blob;
  imageFilename?: string;
};

export type ImagesProviderAdapter = {
  generateImage(
    provider: ProviderConfig,
    request: GenerateImageRequest
  ): Promise<ProviderImageResult>;
  editImage(provider: ProviderConfig, request: EditImageRequest): Promise<ProviderImageResult>;
};

export type OpenAICompatibleImagesAdapterOptions = {
  fetch?: typeof fetch;
};

type ImagesApiResponse = {
  data?: Array<{
    b64_json?: unknown;
  }>;
};

export function createOpenAICompatibleImagesAdapter(
  options: OpenAICompatibleImagesAdapterOptions = {}
): ImagesProviderAdapter {
  const fetchClient = options.fetch ?? fetch;

  return {
    async generateImage(provider, request) {
      const response = await fetchClient(buildProviderUrl(provider, "/images/generations"), {
        method: "POST",
        headers: {
          authorization: `Bearer ${provider.apiKey}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: request.model,
          prompt: request.prompt,
          size: request.size,
          quality: request.quality,
          output_format: request.outputFormat
        })
      });
      const json = await readProviderJson(response);

      return {
        b64Json: requireB64Json(json, 0),
        raw: json
      };
    },

    async editImage(provider, request) {
      const body = new FormData();
      body.set("model", request.model);
      body.set("prompt", request.prompt);
      body.set("size", request.size);
      body.set("quality", request.quality);
      body.set("output_format", request.outputFormat);
      body.set("image", request.image, request.imageFilename ?? "reference-image");

      const response = await fetchClient(buildProviderUrl(provider, "/images/edits"), {
        method: "POST",
        headers: {
          authorization: `Bearer ${provider.apiKey}`
        },
        body
      });
      const json = await readProviderJson(response);

      return {
        b64Json: extractB64Json(json, 1) ?? requireB64Json(json, 0),
        raw: json
      };
    }
  };
}

function buildProviderUrl(provider: ProviderConfig, endpointPath: string): string {
  return `${provider.baseUrl.replace(/\/+$/, "")}${endpointPath}`;
}

async function readProviderJson(response: Response): Promise<ImagesApiResponse> {
  let json: unknown;

  try {
    json = await response.json();
  } catch {
    throw new Error("provider_response_invalid");
  }

  if (!response.ok) {
    throw new Error("provider_request_failed");
  }

  return json as ImagesApiResponse;
}

function requireB64Json(response: ImagesApiResponse, index: number): string {
  const image = extractB64Json(response, index);

  if (!image) {
    throw new Error("provider_response_invalid");
  }

  return image;
}

function extractB64Json(response: ImagesApiResponse, index: number): string | undefined {
  const image = response.data?.[index]?.b64_json;

  if (typeof image !== "string" || image.length === 0) {
    return undefined;
  }

  return image;
}
```

`文件名: src/lib/images/index.ts`

```ts
import type { ValidatedImageGenerationParams } from "@/lib/config";

export const INVALID_GENERATION_PARAMS = "invalid_generation_params" as const;
export const INVALID_REFERENCE_IMAGE = "invalid_reference_image" as const;
export const REFERENCE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const REFERENCE_IMAGE_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp"
] as const;

export type TextToImageRequestBody = {
  provider: string;
  model: string;
  prompt: string;
  size: string;
  quality: string;
  output_format?: string;
  outputFormat?: string;
};

export function validateTextToImageRequestBody(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return invalidGenerationParams("body", "请求体必须是 JSON 对象。");
  }

  const input = body as Record<string, unknown>;
  const prompt = readRequiredString(input.prompt);
  if (!prompt || prompt.length > 4000) {
    return invalidGenerationParams("prompt", "请输入 1 到 4000 个字符的 prompt。");
  }

  const provider = readRequiredString(input.provider);
  if (!provider) {
    return invalidGenerationParams("provider", "请选择有效的 provider。");
  }

  const model = readRequiredString(input.model);
  if (!model) {
    return invalidGenerationParams("model", "请选择有效的 model。");
  }

  const size = readRequiredString(input.size);
  if (!size) {
    return invalidGenerationParams("size", "请选择有效的图片尺寸。");
  }

  const quality = readRequiredString(input.quality);
  if (!quality) {
    return invalidGenerationParams("quality", "请选择有效的图片质量。");
  }

  const outputFormat = readRequiredString(input.output_format ?? input.outputFormat);
  if (!outputFormat) {
    return invalidGenerationParams("output_format", "请选择有效的输出格式。");
  }

  return {
    ok: true,
    body: {
      provider,
      model,
      prompt,
      size,
      quality,
      output_format: outputFormat
    }
  };
}

export function createTemporaryImageResponse(
  b64Json: string,
  params: ValidatedImageGenerationParams,
  dailyUsage: { generationCount: number; limit: number },
  options: { mode?: "text-to-image" | "image-edit" } = {}
) {
  return {
    image: {
      b64_json: b64Json,
      output_format: params.outputFormat
    },
    meta: {
      provider: params.provider,
      model: params.model,
      size: params.size,
      quality: params.quality,
      output_format: params.outputFormat,
      mode: options.mode ?? "text-to-image",
      daily_usage: {
        generation_count: dailyUsage.generationCount,
        limit: dailyUsage.limit
      }
    }
  };
}

function readRequiredString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function invalidGenerationParams(field: string, message: string) {
  return {
    ok: false,
    code: INVALID_GENERATION_PARAMS,
    field,
    message
  };
}
```

参考图生图接口：

`文件名: src/app/api/images/edits/route.ts`

```ts
// 核心差异：读取 multipart/form-data，校验 image 文件，然后调用 adapter.editImage。
const formResult = validateReferenceImageFormData(await readFormData(request));

result = await adapter.editImage(paramsResult.provider, {
  model: paramsResult.params.model,
  prompt: formResult.body.prompt,
  image: formResult.body.image,
  imageFilename: formResult.body.imageFilename,
  size: paramsResult.params.size,
  quality: paramsResult.params.quality,
  outputFormat: paramsResult.params.outputFormat
});
```

---

### 3. 前端请求 JSON 负载数据结构 (Payload Schema)

`文件名: src/app/image-workbench.tsx`

```tsx
async function handleGenerate() {
  await startGeneration({
    prompt: prompt.trim(),
    mode,
    params,
    referenceImage,
    referencePreviewUrl,
    referenceFileName: referenceImage?.name,
    clearComposer: true
  });
}

async function fetchGeneration({
  prompt: promptText,
  mode: generationMode,
  params: generationParams,
  referenceImage: generationReference
}: {
  prompt: string;
  mode: GenerationMode;
  params: GenerationParamsSnapshot;
  referenceImage: File | null;
}) {
  const baseFields = {
    provider: generationParams.provider,
    model: generationParams.model,
    prompt: promptText,
    size: generationParams.size,
    quality: generationParams.quality,
    output_format: generationParams.outputFormat
  };

  if (generationMode === "text-to-image") {
    return fetch("/api/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(baseFields)
    });
  }

  const formData = new FormData();
  Object.entries(baseFields).forEach(([key, value]) => {
    formData.set(key, value);
  });
  if (generationReference) {
    formData.set("image", generationReference);
  }

  return fetch("/api/images/edits", {
    method: "POST",
    body: formData
  });
}
```

文生图 JSON payload 示例：

```json
{
  "provider": "sub2api",
  "model": "gpt-image-2",
  "prompt": "一张电影感人像照片，柔和自然光，浅景深，高级灰背景",
  "size": "1024x1536",
  "quality": "high",
  "output_format": "png"
}
```

参考图生图 `FormData` payload 示例：

```txt
provider=sub2api
model=gpt-image-2
prompt=请保持人物主体一致，改成赛博朋克夜景风格
size=1024x1536
quality=high
output_format=png
image=<File: image/png | image/jpeg | image/webp, max 10MB>
```

前端参数类型：

`文件名: src/app/workbench/types.ts`

```ts
export type GenerationMode = "text-to-image" | "image-edit";

export type GenerationParamsSnapshot = {
  provider: string;
  model: string;
  size: string;
  quality: string;
  outputFormat: string;
};
```

前端参数控件来源：

`文件名: src/app/workbench/chat-sidebar.tsx`

```tsx
<select
  aria-label="Model"
  onChange={(event) => onParamChange({ model: event.target.value })}
  value={params.model}
>
  {provider?.models.map((item) => (
    <option key={item} value={item}>{item}</option>
  ))}
</select>

<select
  aria-label="尺寸"
  onChange={(event) => onParamChange({ size: event.target.value })}
  value={params.size}
>
  {config.options.sizes.map((item) => (
    <option key={item} value={item}>{item}</option>
  ))}
</select>

<select
  aria-label="质量"
  onChange={(event) => onParamChange({ quality: event.target.value })}
  value={params.quality}
>
  {config.options.qualities.map((item) => (
    <option key={item} value={item}>{item}</option>
  ))}
</select>

<select
  aria-label="输出格式"
  onChange={(event) => onParamChange({ outputFormat: event.target.value })}
  value={params.outputFormat}
>
  {config.options.outputFormats.map((item) => (
    <option key={item} value={item}>{item}</option>
  ))}
</select>
```

---

### 4. 环境变量与配置模块

`文件名: src/app/api/image-options/route.ts`

```ts
import { NextResponse } from "next/server";
import { getPublicImageConfig } from "@/lib/config";

export async function GET() {
  return NextResponse.json(getPublicImageConfig());
}
```

`文件名: src/lib/config/index.ts`

```ts
export type PublicProviderConfig = {
  id: string;
  label: string;
  models: string[];
};

export type ProviderType = "openai-compatible-images";

export type ProviderConfig = {
  id: string;
  label: string;
  type: ProviderType;
  baseUrl: string;
  apiKeyEnv: string;
  apiKey: string;
  models: string[];
};

export type PublicImageConfig = {
  defaultProvider: string;
  defaults: {
    model: string;
    size: string;
    quality: string;
    outputFormat: string;
  };
  providers: PublicProviderConfig[];
  options: {
    sizes: string[];
    qualities: string[];
    outputFormats: string[];
  };
};

const DEFAULT_PROVIDER_OPTIONS = JSON.stringify([
  {
    id: "sub2api",
    label: "Sub2API",
    type: "openai-compatible-images",
    baseUrl: "https://sub2api.toioto.org/v1",
    apiKeyEnv: "SUB2API_API_KEY",
    models: ["gpt-image-2"]
  }
]);

const DEFAULT_PROVIDER = "sub2api";
const DEFAULT_MODEL = "gpt-image-2";
const DEFAULT_SIZE = "1024x1536";
const DEFAULT_QUALITY = "high";
const DEFAULT_OUTPUT_FORMAT = "png";
const DEFAULT_SIZE_OPTIONS = "1024x1024,1024x1536,1536x1024";
const DEFAULT_QUALITY_OPTIONS = "high,medium,low";
const DEFAULT_OUTPUT_FORMAT_OPTIONS = "png,jpeg,webp";

export function parseImageServiceConfig(env: Record<string, string | undefined> = process.env) {
  const providers = parseProviderOptions(
    env.IMAGE_PROVIDER_OPTIONS ?? DEFAULT_PROVIDER_OPTIONS,
    env
  );

  const config = {
    defaultProvider: env.IMAGE_DEFAULT_PROVIDER?.trim() || DEFAULT_PROVIDER,
    defaults: {
      model: env.IMAGE_DEFAULT_MODEL?.trim() || DEFAULT_MODEL,
      size: env.IMAGE_DEFAULT_SIZE?.trim() || DEFAULT_SIZE,
      quality: env.IMAGE_DEFAULT_QUALITY?.trim() || DEFAULT_QUALITY,
      outputFormat: env.IMAGE_DEFAULT_OUTPUT_FORMAT?.trim() || DEFAULT_OUTPUT_FORMAT
    },
    providers,
    options: {
      sizes: parseCsvOption(env.IMAGE_SIZE_OPTIONS ?? DEFAULT_SIZE_OPTIONS, "IMAGE_SIZE_OPTIONS"),
      qualities: parseCsvOption(
        env.IMAGE_QUALITY_OPTIONS ?? DEFAULT_QUALITY_OPTIONS,
        "IMAGE_QUALITY_OPTIONS"
      ),
      outputFormats: parseCsvOption(
        env.IMAGE_OUTPUT_FORMAT_OPTIONS ?? DEFAULT_OUTPUT_FORMAT_OPTIONS,
        "IMAGE_OUTPUT_FORMAT_OPTIONS"
      )
    }
  };

  assertDefaultConfigIsAllowed(config);
  return config;
}

export function toPublicImageConfig(config: ReturnType<typeof parseImageServiceConfig>) {
  return {
    defaultProvider: config.defaultProvider,
    defaults: config.defaults,
    providers: config.providers.map((provider) => ({
      id: provider.id,
      label: provider.label,
      models: provider.models
    })),
    options: config.options
  };
}

export function getPublicImageConfig(env: Record<string, string | undefined> = process.env) {
  return toPublicImageConfig(parseImageServiceConfig(env));
}

export function validateImageGenerationParams(
  params: {
    provider: string;
    model: string;
    size: string;
    quality: string;
    output_format?: string;
    outputFormat?: string;
  },
  config = parseImageServiceConfig()
) {
  const provider = config.providers.find((item) => item.id === params.provider);

  if (!provider) return invalidParam("provider", "请选择有效的 provider。");
  if (!provider.models.includes(params.model)) {
    return invalidParam("model", "请选择当前 provider 支持的 model。");
  }
  if (!config.options.sizes.includes(params.size)) {
    return invalidParam("size", "请选择有效的图片尺寸。");
  }
  if (!config.options.qualities.includes(params.quality)) {
    return invalidParam("quality", "请选择有效的图片质量。");
  }

  const outputFormat = params.output_format ?? params.outputFormat;
  if (!outputFormat || !config.options.outputFormats.includes(outputFormat)) {
    return invalidParam("output_format", "请选择有效的输出格式。");
  }

  return {
    ok: true,
    provider,
    params: {
      provider: provider.id,
      model: params.model,
      size: params.size,
      quality: params.quality,
      outputFormat
    }
  };
}

function parseProviderOptions(rawJson: string, env: Record<string, string | undefined>) {
  const parsed = JSON.parse(rawJson);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("IMAGE_PROVIDER_OPTIONS 必须至少包含一个 provider。");
  }

  return parsed.map((provider, index) => normalizeProviderOption(provider, index, env));
}

function normalizeProviderOption(
  rawProvider: unknown,
  index: number,
  env: Record<string, string | undefined>
): ProviderConfig {
  const provider = rawProvider as {
    id?: unknown;
    label?: unknown;
    type?: unknown;
    baseUrl?: unknown;
    apiKeyEnv?: unknown;
    models?: unknown;
  };

  const id = readRequiredString(provider.id, `IMAGE_PROVIDER_OPTIONS[${index}].id`);
  const label = readRequiredString(provider.label, `IMAGE_PROVIDER_OPTIONS[${index}].label`);
  const type = readRequiredString(provider.type, `IMAGE_PROVIDER_OPTIONS[${index}].type`);
  const baseUrl = readRequiredString(
    provider.baseUrl,
    `IMAGE_PROVIDER_OPTIONS[${index}].baseUrl`
  ).replace(/\/+$/, "");
  const apiKeyEnv = readRequiredString(
    provider.apiKeyEnv,
    `IMAGE_PROVIDER_OPTIONS[${index}].apiKeyEnv`
  );
  const models = readStringArray(provider.models, `IMAGE_PROVIDER_OPTIONS[${index}].models`);

  if (type !== "openai-compatible-images") {
    throw new Error(`provider ${id} 的 type 不受支持。`);
  }

  if (!URL.canParse(baseUrl)) {
    throw new Error(`provider ${id} 的 baseUrl 必须是有效 URL。`);
  }

  const apiKey = env[apiKeyEnv]?.trim();

  if (!apiKey) {
    throw new Error(`provider ${id} 缺少服务端 API key 环境变量 ${apiKeyEnv}。`);
  }

  return {
    id,
    label,
    type,
    baseUrl,
    apiKeyEnv,
    apiKey,
    models
  };
}
```

`.env.example` 脱敏版：

```env
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_SUPABASE_DOMAIN"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_KEY_HERE"

IMAGE_DEFAULT_PROVIDER="sub2api"
IMAGE_DEFAULT_MODEL="gpt-image-2"
IMAGE_DEFAULT_SIZE="1024x1536"
IMAGE_DEFAULT_QUALITY="high"
IMAGE_DEFAULT_OUTPUT_FORMAT="png"

IMAGE_PROVIDER_OPTIONS='[{"id":"sub2api","label":"Sub2API","type":"openai-compatible-images","baseUrl":"https://YOUR_PROVIDER_BASE_URL/v1","apiKeyEnv":"SUB2API_API_KEY","models":["gpt-image-2"]}]'
SUB2API_API_KEY="YOUR_KEY_HERE"

IMAGE_SIZE_OPTIONS="1024x1024,1024x1536,1536x1024"
IMAGE_QUALITY_OPTIONS="high,medium,low"
IMAGE_OUTPUT_FORMAT_OPTIONS="png,jpeg,webp"
IMAGE_DAILY_LIMIT="20"

IMAGE_SERVICE_SQLITE_PATH="./data/image-service.sqlite"
```

未来接入 Imagen 4 / Gemini API 时，当前架构里最自然的位置是：

```env
IMAGE_DEFAULT_PROVIDER="google-imagen"
IMAGE_DEFAULT_MODEL="imagen-4"

IMAGE_PROVIDER_OPTIONS='[{"id":"google-imagen","label":"Google Imagen","type":"openai-compatible-images","baseUrl":"https://YOUR_GOOGLE_OR_PROXY_BASE_URL/v1","apiKeyEnv":"GEMINI_API_KEY","models":["imagen-4","imagen-4-ultra","imagen-4-fast"]}]'

GEMINI_API_KEY="YOUR_KEY_HERE"
```

注意：当前 `ProviderType` 只允许 `"openai-compatible-images"`。如果 Google Imagen 4 使用的接口不是 OpenAI-compatible Images API，需要新增 provider type 和 adapter，而不是只改环境变量。
