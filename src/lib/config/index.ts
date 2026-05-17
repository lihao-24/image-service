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

export type ImageServiceConfig = {
  defaultProvider: string;
  defaults: {
    model: string;
    size: string;
    quality: string;
    outputFormat: string;
  };
  providers: ProviderConfig[];
  options: {
    sizes: string[];
    qualities: string[];
    outputFormats: string[];
  };
};

export type ImageGenerationParams = {
  provider: string;
  model: string;
  size: string;
  quality: string;
  output_format?: string;
  outputFormat?: string;
};

export type ValidatedImageGenerationParams = {
  provider: string;
  model: string;
  size: string;
  quality: string;
  outputFormat: string;
};

export type ImageGenerationParamsValidationResult =
  | { ok: true; params: ValidatedImageGenerationParams; provider: ProviderConfig }
  | { ok: false; code: "invalid_generation_params"; message: string; field: string };

type ProviderOptionInput = {
  id?: unknown;
  label?: unknown;
  type?: unknown;
  baseUrl?: unknown;
  apiKeyEnv?: unknown;
  models?: unknown;
};

type ImageConfigEnv = Record<string, string | undefined>;

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

export function parseImageServiceConfig(env: ImageConfigEnv = process.env): ImageServiceConfig {
  const providers = parseProviderOptions(
    env.IMAGE_PROVIDER_OPTIONS ?? DEFAULT_PROVIDER_OPTIONS,
    env
  );
  const options = {
    sizes: parseCsvOption(env.IMAGE_SIZE_OPTIONS ?? DEFAULT_SIZE_OPTIONS, "IMAGE_SIZE_OPTIONS"),
    qualities: parseCsvOption(
      env.IMAGE_QUALITY_OPTIONS ?? DEFAULT_QUALITY_OPTIONS,
      "IMAGE_QUALITY_OPTIONS"
    ),
    outputFormats: parseCsvOption(
      env.IMAGE_OUTPUT_FORMAT_OPTIONS ?? DEFAULT_OUTPUT_FORMAT_OPTIONS,
      "IMAGE_OUTPUT_FORMAT_OPTIONS"
    )
  };
  const config: ImageServiceConfig = {
    defaultProvider: env.IMAGE_DEFAULT_PROVIDER?.trim() || DEFAULT_PROVIDER,
    defaults: {
      model: env.IMAGE_DEFAULT_MODEL?.trim() || DEFAULT_MODEL,
      size: env.IMAGE_DEFAULT_SIZE?.trim() || DEFAULT_SIZE,
      quality: env.IMAGE_DEFAULT_QUALITY?.trim() || DEFAULT_QUALITY,
      outputFormat: env.IMAGE_DEFAULT_OUTPUT_FORMAT?.trim() || DEFAULT_OUTPUT_FORMAT
    },
    providers,
    options
  };

  assertDefaultConfigIsAllowed(config);

  return config;
}

export function toPublicImageConfig(config: ImageServiceConfig): PublicImageConfig {
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

export function getPublicImageConfig(env: ImageConfigEnv = process.env): PublicImageConfig {
  return toPublicImageConfig(parseImageServiceConfig(env));
}

export function validateImageGenerationParams(
  params: ImageGenerationParams,
  config: ImageServiceConfig = parseImageServiceConfig()
): ImageGenerationParamsValidationResult {
  const provider = config.providers.find((item) => item.id === params.provider);

  if (!provider) {
    return invalidParam("provider", "请选择有效的 provider。");
  }

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
  const provider = config.providers.find((item) => item.id === config.defaultProvider);

  if (!provider) {
    throw new Error("默认 provider 必须存在于 provider allowlist。");
  }

  if (!provider.models.includes(config.defaults.model)) {
    throw new Error("默认 model 必须存在于默认 provider 的 model allowlist。");
  }

  if (!config.options.sizes.includes(config.defaults.size)) {
    throw new Error("默认 size 必须存在于 size allowlist。");
  }

  if (!config.options.qualities.includes(config.defaults.quality)) {
    throw new Error("默认 quality 必须存在于 quality allowlist。");
  }

  if (!config.options.outputFormats.includes(config.defaults.outputFormat)) {
    throw new Error("默认 output_format 必须存在于 output_format allowlist。");
  }
}

function readRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${fieldName} 必须是非空字符串。`);
  }

  return value.trim();
}

function readStringArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} 必须是字符串数组。`);
  }

  const values = value.map((item) => readRequiredString(item, fieldName));
  const uniqueValues = [...new Set(values)];

  if (uniqueValues.length === 0) {
    throw new Error(`${fieldName} 必须至少包含一个值。`);
  }

  return uniqueValues;
}

function invalidParam(field: string, message: string): ImageGenerationParamsValidationResult {
  return {
    ok: false,
    code: "invalid_generation_params",
    field,
    message
  };
}
