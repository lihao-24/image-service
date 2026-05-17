import type { ValidatedImageGenerationParams } from "@/lib/config";

export const INVALID_GENERATION_PARAMS = "invalid_generation_params" as const;

export type TextToImageRequestBody = {
  provider: string;
  model: string;
  prompt: string;
  size: string;
  quality: string;
  output_format?: string;
  outputFormat?: string;
};

export type TextToImageRequestValidationResult =
  | { ok: true; body: TextToImageRequestBody }
  | { ok: false; code: typeof INVALID_GENERATION_PARAMS; message: string; field: string };

export function validateTextToImageRequestBody(
  body: unknown
): TextToImageRequestValidationResult {
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
  dailyUsage: { generationCount: number; limit: number }
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
      mode: "text-to-image",
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

function invalidGenerationParams(
  field: string,
  message: string
): TextToImageRequestValidationResult {
  return {
    ok: false,
    code: INVALID_GENERATION_PARAMS,
    field,
    message
  };
}
