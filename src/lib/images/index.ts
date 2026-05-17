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

export type TextToImageRequestValidationResult =
  | { ok: true; body: TextToImageRequestBody }
  | { ok: false; code: typeof INVALID_GENERATION_PARAMS; message: string; field: string };

export type ReferenceImageRequestBody = TextToImageRequestBody & {
  image: File;
  imageFilename: string;
};

export type ReferenceImageRequestValidationResult =
  | { ok: true; body: ReferenceImageRequestBody }
  | {
      ok: false;
      code: typeof INVALID_GENERATION_PARAMS | typeof INVALID_REFERENCE_IMAGE;
      message: string;
      field: string;
    };

type ReferenceImageValidationResult =
  | { ok: true; image: File }
  | {
      ok: false;
      code: typeof INVALID_REFERENCE_IMAGE;
      field: string;
      message: string;
    };

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

export function validateReferenceImageFormData(
  formData: FormData
): ReferenceImageRequestValidationResult {
  const imageResult = validateReferenceImage(formData.get("image"));
  if (!imageResult.ok) {
    return imageResult;
  }

  const bodyResult = validateTextToImageRequestBody({
    provider: formData.get("provider"),
    model: formData.get("model"),
    prompt: formData.get("prompt"),
    size: formData.get("size"),
    quality: formData.get("quality"),
    output_format: formData.get("output_format") ?? formData.get("outputFormat")
  });

  if (!bodyResult.ok) {
    return bodyResult;
  }

  return {
    ok: true,
    body: {
      ...bodyResult.body,
      image: imageResult.image,
      imageFilename: imageResult.image.name || "reference-image"
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

function validateReferenceImage(value: FormDataEntryValue | null): ReferenceImageValidationResult {
  if (!(value instanceof File) || value.size === 0) {
    return invalidReferenceImage("image", "请上传参考图。");
  }

  if (value.size > REFERENCE_IMAGE_MAX_BYTES) {
    return invalidReferenceImage("image", "参考图不能超过 10MB。");
  }

  if (!REFERENCE_IMAGE_ALLOWED_MIME_TYPES.includes(
    value.type as (typeof REFERENCE_IMAGE_ALLOWED_MIME_TYPES)[number]
  )) {
    return invalidReferenceImage("image", "参考图仅支持 PNG、JPEG 或 WebP。");
  }

  return {
    ok: true,
    image: value
  };
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

function invalidReferenceImage(
  field: string,
  message: string
): ReferenceImageValidationResult {
  return {
    ok: false,
    code: INVALID_REFERENCE_IMAGE,
    field,
    message
  };
}
