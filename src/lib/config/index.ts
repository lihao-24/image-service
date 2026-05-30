export type PublicProviderConfig = {
  id: string;
  label: string;
  models: PublicProviderModelConfig[];
};

export type ImageModelFamily = "chatgpt" | "gemini";

export type ProviderType = "openai-compatible-images" | "gemini-generate-content";

export type ImageProviderAuthStyle = "bearer" | "api-key-header" | "query-key";

export type ProviderModelConfig = {
  id: string;
  label: string;
  family: ImageModelFamily;
  enabled: boolean;
  supportsTextToImage: boolean;
  supportsImageToImage: boolean;
  note?: string;
};

export type PublicProviderModelConfig = Omit<ProviderModelConfig, "enabled" | "note">;

export type ProviderConfig = {
  id: string;
  label: string;
  type: ProviderType;
  baseUrl: string;
  apiKeyEnv: string;
  apiKey: string;
  authStyle?: ImageProviderAuthStyle;
  models: ProviderModelConfig[];
};

export type PublicImageConfig = {
  defaultProviderId: string;
  defaultModelId: string;
  defaultProvider: string;
  defaults: {
    model: string;
    size: string;
    resolution?: string;
    quality: string;
    outputFormat: string;
    background?: string;
    moderation?: string;
  };
  providers: PublicProviderConfig[];
  options: {
    sizes: string[];
    resolutions?: string[];
    qualities: string[];
    outputFormats: string[];
    backgrounds?: string[];
    moderations?: string[];
  };
};

export type ImageServiceConfig = {
  defaultProviderId: string;
  defaultModelId: string;
  defaultProvider: string;
  defaults: {
    model: string;
    size: string;
    resolution: string;
    quality: string;
    outputFormat: string;
    background: string;
    moderation: string;
  };
  providers: ProviderConfig[];
  options: {
    sizes: string[];
    resolutions: string[];
    qualities: string[];
    outputFormats: string[];
    backgrounds: string[];
    moderations: string[];
  };
};

export type ImageGenerationParams = {
  provider?: string;
  model?: string;
  size?: string;
  resolution?: string;
  quality?: string;
  output_format?: string;
  outputFormat?: string;
  background?: string;
  moderation?: string;
};

export type ValidatedImageGenerationParams = {
  provider: string;
  model: string;
  size: string;
  resolution: string;
  quality: string;
  outputFormat: string;
  background: string;
  moderation: string;
};

export type ImageGenerationParamsValidationResult =
  | { ok: true; params: ValidatedImageGenerationParams; provider: ProviderConfig }
  | {
      ok: false;
      code: "invalid_generation_params" | "invalid_generation_size_resolution";
      message: string;
      field: string;
    };

type ImageGenerationValidationOptions = {
  mode?: "text-to-image" | "image-edit";
};

type ProviderOptionInput = {
  id?: unknown;
  label?: unknown;
  type?: unknown;
  baseUrl?: unknown;
  apiKeyEnv?: unknown;
  authStyle?: unknown;
  models?: unknown;
};

type ImageConfigEnv = Record<string, string | undefined>;

const DEFAULT_PROVIDER_OPTIONS = JSON.stringify([
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
  }
]);

const DEFAULT_PROVIDER = "toioto";
const DEFAULT_MODEL = "gpt-image-2";
const DEFAULT_SIZE = "auto";
const DEFAULT_RESOLUTION = "auto";
const DEFAULT_QUALITY = "auto";
const DEFAULT_OUTPUT_FORMAT = "png";
const DEFAULT_BACKGROUND = "auto";
const DEFAULT_MODERATION = "auto";
const DEFAULT_SIZE_OPTIONS = "auto,1:1,3:2,2:3,16:9,9:16";
const DEFAULT_RESOLUTION_OPTIONS = "auto,standard,hd,4k";
const DEFAULT_QUALITY_OPTIONS = "auto,high,medium,low";
const DEFAULT_OUTPUT_FORMAT_OPTIONS = "png,jpeg,webp";
const DEFAULT_BACKGROUND_OPTIONS = "auto,opaque";
const DEFAULT_MODERATION_OPTIONS = "auto,low";
const LEGACY_MODEL_LABEL_OVERRIDES: Record<string, string> = {
  "gemini-3.1-flash-image-preview": "Gemini 3.1 Flash"
};
const LEGACY_MODEL_LABEL_VALUES = new Set(["Gemini 3.1 Flash Image Preview"]);

export function parseImageServiceConfig(env: ImageConfigEnv = process.env): ImageServiceConfig {
  const providers = parseProviderOptions(
    env.IMAGE_PROVIDER_OPTIONS ?? DEFAULT_PROVIDER_OPTIONS,
    env
  );
  const options = {
    sizes: parseCsvOption(env.IMAGE_SIZE_OPTIONS ?? DEFAULT_SIZE_OPTIONS, "IMAGE_SIZE_OPTIONS"),
    resolutions: parseCsvOption(
      env.IMAGE_RESOLUTION_OPTIONS ?? DEFAULT_RESOLUTION_OPTIONS,
      "IMAGE_RESOLUTION_OPTIONS"
    ),
    qualities: parseCsvOption(
      env.IMAGE_QUALITY_OPTIONS ?? DEFAULT_QUALITY_OPTIONS,
      "IMAGE_QUALITY_OPTIONS"
    ),
    outputFormats: parseCsvOption(
      env.IMAGE_OUTPUT_FORMAT_OPTIONS ?? DEFAULT_OUTPUT_FORMAT_OPTIONS,
      "IMAGE_OUTPUT_FORMAT_OPTIONS"
    ),
    backgrounds: parseCsvOption(
      env.IMAGE_BACKGROUND_OPTIONS ?? DEFAULT_BACKGROUND_OPTIONS,
      "IMAGE_BACKGROUND_OPTIONS"
    ),
    moderations: parseCsvOption(
      env.IMAGE_MODERATION_OPTIONS ?? DEFAULT_MODERATION_OPTIONS,
      "IMAGE_MODERATION_OPTIONS"
    )
  };
  const config: ImageServiceConfig = {
    defaultProviderId: env.IMAGE_DEFAULT_PROVIDER?.trim() || DEFAULT_PROVIDER,
    defaultModelId: env.IMAGE_DEFAULT_MODEL?.trim() || DEFAULT_MODEL,
    defaultProvider: env.IMAGE_DEFAULT_PROVIDER?.trim() || DEFAULT_PROVIDER,
    defaults: {
      model: env.IMAGE_DEFAULT_MODEL?.trim() || DEFAULT_MODEL,
      size: env.IMAGE_DEFAULT_SIZE?.trim() || DEFAULT_SIZE,
      resolution: env.IMAGE_DEFAULT_RESOLUTION?.trim() || DEFAULT_RESOLUTION,
      quality: env.IMAGE_DEFAULT_QUALITY?.trim() || DEFAULT_QUALITY,
      outputFormat: env.IMAGE_DEFAULT_OUTPUT_FORMAT?.trim() || DEFAULT_OUTPUT_FORMAT,
      background: env.IMAGE_DEFAULT_BACKGROUND?.trim() || DEFAULT_BACKGROUND,
      moderation: env.IMAGE_DEFAULT_MODERATION?.trim() || DEFAULT_MODERATION
    },
    providers,
    options
  };

  assertDefaultConfigIsAllowed(config);

  return config;
}

export function toPublicImageConfig(config: ImageServiceConfig): PublicImageConfig {
  return {
    defaultProviderId: config.defaultProviderId,
    defaultModelId: config.defaultModelId,
    defaultProvider: config.defaultProvider,
    defaults: config.defaults,
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
    })),
    options: config.options
  };
}

export function getPublicImageConfig(env: ImageConfigEnv = process.env): PublicImageConfig {
  return toPublicImageConfig(parseImageServiceConfig(env));
}

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

export function validateImageGenerationParams(
  params: ImageGenerationParams,
  config: ImageServiceConfig = parseImageServiceConfig(),
  options: ImageGenerationValidationOptions = {}
): ImageGenerationParamsValidationResult {
  if (!params.provider) {
    return invalidParam("provider", "请选择有效的 provider。");
  }

  if (!params.model) {
    return invalidParam("model", "请选择当前 provider 支持的 model。");
  }

  const provider = config.providers.find((item) => item.id === params.provider);

  if (!provider) {
    return invalidParam("provider", "请选择有效的 provider。");
  }

  const model = provider.models.find((item) => item.id === params.model);

  if (!model || !model.enabled) {
    return invalidParam("model", "请选择当前 provider 支持的 model。");
  }

  const mode = options.mode ?? "text-to-image";

  if (mode === "text-to-image" && !model.supportsTextToImage) {
    return invalidParam("model", "请选择支持文生图的 model。");
  }

  if (mode === "image-edit" && !model.supportsImageToImage) {
    return invalidParam("model", "请选择支持参考图生图的 model。");
  }

  return {
    ok: true,
    provider,
    params: {
      provider: provider.id,
      model: params.model,
      size: "auto",
      resolution: "auto",
      quality: "auto",
      outputFormat: "auto",
      background: "auto",
      moderation: "auto"
    }
  };
}

function parseProviderOptions(rawJson: string, env: ImageConfigEnv): ProviderConfig[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error("IMAGE_PROVIDER_OPTIONS 必须是合法 JSON。");
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("IMAGE_PROVIDER_OPTIONS 必须至少包含一个 provider。");
  }

  return parsed.map((provider, index) => normalizeProviderOption(provider, index, env));
}

function normalizeProviderOption(
  rawProvider: unknown,
  index: number,
  env: ImageConfigEnv
): ProviderConfig {
  if (!rawProvider || typeof rawProvider !== "object") {
    throw new Error(`IMAGE_PROVIDER_OPTIONS[${index}] 必须是对象。`);
  }

  const provider = rawProvider as ProviderOptionInput;
  const id = readRequiredString(provider.id, `IMAGE_PROVIDER_OPTIONS[${index}].id`);
  const label = readRequiredString(provider.label, `IMAGE_PROVIDER_OPTIONS[${index}].label`);
  const type = readProviderType(provider.type, `IMAGE_PROVIDER_OPTIONS[${index}].type`);
  const baseUrl = readRequiredString(
    provider.baseUrl,
    `IMAGE_PROVIDER_OPTIONS[${index}].baseUrl`
  ).replace(/\/+$/, "");
  const apiKeyEnv = readRequiredString(
    provider.apiKeyEnv,
    `IMAGE_PROVIDER_OPTIONS[${index}].apiKeyEnv`
  );
  const authStyle = readOptionalAuthStyle(
    provider.authStyle,
    `IMAGE_PROVIDER_OPTIONS[${index}].authStyle`
  );
  const models = readProviderModels(provider.models, `IMAGE_PROVIDER_OPTIONS[${index}].models`);

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
    authStyle,
    models
  };
}

function parseCsvOption(rawValue: string, variableName: string): string[] {
  const values = rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (values.length === 0) {
    throw new Error(`${variableName} 必须至少包含一个选项。`);
  }

  return [...new Set(values)];
}

function assertDefaultConfigIsAllowed(config: ImageServiceConfig) {
  const provider = config.providers.find((item) => item.id === config.defaultProviderId);

  if (!provider) {
    throw new Error("默认 provider 必须存在于 provider allowlist。");
  }

  const model = provider.models.find((item) => item.id === config.defaultModelId && item.enabled);

  if (!model) {
    throw new Error("默认 model 必须存在于默认 provider 的 model allowlist。");
  }
}

function readProviderType(value: unknown, fieldName: string): ProviderType {
  const type = readRequiredString(value, fieldName);

  if (type !== "openai-compatible-images" && type !== "gemini-generate-content") {
    throw new Error(`${fieldName} 不受支持。`);
  }

  return type;
}

function readModelFamily(value: unknown, fieldName: string): ImageModelFamily {
  const family = readRequiredString(value, fieldName);

  if (family !== "chatgpt" && family !== "gemini") {
    throw new Error(`${fieldName} 不受支持。`);
  }

  return family;
}

function readOptionalAuthStyle(value: unknown, fieldName: string): ImageProviderAuthStyle | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  const authStyle = readRequiredString(value, fieldName);

  if (authStyle !== "bearer" && authStyle !== "api-key-header" && authStyle !== "query-key") {
    throw new Error(`${fieldName} 不受支持。`);
  }

  return authStyle;
}

function readRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${fieldName} 必须是非空字符串。`);
  }

  return value.trim();
}

function readBoolean(value: unknown, defaultValue: boolean): boolean {
  if (value == null) {
    return defaultValue;
  }

  if (typeof value !== "boolean") {
    throw new Error("布尔配置必须是 true 或 false。");
  }

  return value;
}

function readOptionalString(value: unknown): string | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error("可选字符串配置必须是字符串。");
  }

  return value.trim() || undefined;
}

function readProviderModels(value: unknown, fieldName: string): ProviderModelConfig[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} 必须是字符串或对象数组。`);
  }

  const models = value.map((item, index) =>
    normalizeProviderModelOption(item, `${fieldName}[${index}]`)
  );
  const uniqueModels = Array.from(new Map(models.map((model) => [model.id, model])).values());

  if (uniqueModels.length === 0) {
    throw new Error(`${fieldName} 必须至少包含一个值。`);
  }

  return uniqueModels;
}

function normalizeProviderModelOption(rawModel: unknown, fieldName: string): ProviderModelConfig {
  if (typeof rawModel === "string" && rawModel.trim()) {
    const id = rawModel.trim();

    return {
      id,
      label: LEGACY_MODEL_LABEL_OVERRIDES[id] ?? id,
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
  const label = readRequiredString(model.label, `${fieldName}.label`);

  return {
    id,
    label: LEGACY_MODEL_LABEL_VALUES.has(label) ? LEGACY_MODEL_LABEL_OVERRIDES[id] ?? label : label,
    family: readModelFamily(model.family, `${fieldName}.family`),
    enabled: readBoolean(model.enabled, true),
    supportsTextToImage: readBoolean(model.supportsTextToImage, false),
    supportsImageToImage: readBoolean(model.supportsImageToImage, false),
    note: readOptionalString(model.note)
  };
}

function invalidParam(field: string, message: string): ImageGenerationParamsValidationResult {
  return {
    ok: false,
    code: "invalid_generation_params",
    field,
    message
  };
}
