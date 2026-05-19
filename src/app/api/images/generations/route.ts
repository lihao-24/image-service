import { NextResponse, type NextRequest } from "next/server";
import { AUTH_REQUIRED, getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/auth/server";
import {
  mapImageSizeForProvider,
  parseImageServiceConfig,
  validateImageGenerationParams
} from "@/lib/config";
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
      const providerSize = mapImageSizeForProvider(
        paramsResult.params.model,
        paramsResult.params.size,
        paramsResult.params.resolution
      );
      result = await adapter.generateImage(paramsResult.provider, {
        model: paramsResult.params.model,
        prompt: bodyResult.body.prompt,
        size: providerSize,
        quality: paramsResult.params.quality,
        outputFormat: paramsResult.params.outputFormat,
        background: paramsResult.params.background,
        moderation: paramsResult.params.moderation
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
      case "provider_content_policy_violation":
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
