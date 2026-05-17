import { NextResponse, type NextRequest } from "next/server";
import { AUTH_REQUIRED, getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { parseImageServiceConfig, validateImageGenerationParams } from "@/lib/config";
import { closeDatabase, initializeDatabase, openDatabase } from "@/lib/db";
import {
  createTemporaryImageResponse,
  INVALID_GENERATION_PARAMS,
  validateReferenceImageFormData
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

const IMAGE_EDIT_MODE = "image-edit" as const;

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

  const formResult = validateReferenceImageFormData(await readFormData(request));
  if (!formResult.ok) {
    return NextResponse.json(
      {
        error: formResult.code,
        message: formResult.message
      },
      { status: 400 }
    );
  }

  const config = parseImageServiceConfig();
  const paramsResult = validateImageGenerationParams(formResult.body, config);
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
        mode: IMAGE_EDIT_MODE,
        size: paramsResult.params.size,
        quality: paramsResult.params.quality,
        outputFormat: paramsResult.params.outputFormat,
        status: "rejected",
        errorCode: QUOTA_EXCEEDED,
        durationMs: elapsedMs(startedAt),
        prompt: formResult.body.prompt,
        hasReferenceImage: true
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
    let result: Awaited<ReturnType<typeof adapter.editImage>>;

    try {
      result = await adapter.editImage(paramsResult.provider, {
        model: paramsResult.params.model,
        prompt: formResult.body.prompt,
        image: formResult.body.image,
        imageFilename: formResult.body.imageFilename,
        size: paramsResult.params.size,
        quality: paramsResult.params.quality,
        outputFormat: paramsResult.params.outputFormat
      });
    } catch (error) {
      const errorCode = normalizeProviderErrorCode(error);
      writeGenerationLog(db, userResult.userId, {
        provider: paramsResult.params.provider,
        model: paramsResult.params.model,
        mode: IMAGE_EDIT_MODE,
        size: paramsResult.params.size,
        quality: paramsResult.params.quality,
        outputFormat: paramsResult.params.outputFormat,
        status: "failed",
        errorCode,
        durationMs: elapsedMs(startedAt),
        prompt: formResult.body.prompt,
        hasReferenceImage: true
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
      mode: IMAGE_EDIT_MODE,
      size: paramsResult.params.size,
      quality: paramsResult.params.quality,
      outputFormat: paramsResult.params.outputFormat,
      status: "success",
      errorCode: null,
      durationMs: elapsedMs(startedAt),
      prompt: formResult.body.prompt,
      imageB64Json: result.b64Json,
      hasReferenceImage: true
    });

    return NextResponse.json(
      createTemporaryImageResponse(
        result.b64Json,
        paramsResult.params,
        {
          generationCount,
          limit: dailyLimit
        },
        { mode: IMAGE_EDIT_MODE }
      )
    );
  } finally {
    closeDatabase(db);
  }
}

async function readFormData(request: NextRequest | Request): Promise<FormData> {
  try {
    return await request.formData();
  } catch {
    return new FormData();
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
