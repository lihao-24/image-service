import {
  getDailyUsage,
  incrementDailyUsage,
  logGeneration,
  type GenerationLog,
  type GenerationLogInput,
  type ImageDatabase
} from "@/lib/db";

export const QUOTA_EXCEEDED = "quota_exceeded" as const;

export type DailyQuotaResult =
  | {
      ok: true;
      generationCount: number;
      limit: number;
    }
  | {
      ok: false;
      code: typeof QUOTA_EXCEEDED;
      generationCount: number;
      limit: number;
    };

export type WriteGenerationLogInput = Omit<GenerationLogInput, "promptLength"> & {
  prompt: string;
  imageB64Json?: string | null;
};

export function getUsageDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDailyLimit(env: NodeJS.ProcessEnv = process.env): number {
  const rawLimit = env.IMAGE_DAILY_LIMIT?.trim();
  if (!rawLimit) {
    return 20;
  }

  const parsed = Number(rawLimit);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error("IMAGE_DAILY_LIMIT 必须是大于等于 0 的整数。");
  }

  return parsed;
}

export function checkDailyQuota(
  db: ImageDatabase,
  userId: string,
  usageDate: string,
  limit: number
): DailyQuotaResult {
  const generationCount = getDailyUsage(db, userId, usageDate);

  if (generationCount >= limit) {
    return {
      ok: false,
      code: QUOTA_EXCEEDED,
      generationCount,
      limit
    };
  }

  return {
    ok: true,
    generationCount,
    limit
  };
}

export function shouldEnforceDailyQuota(model: string): boolean {
  return !model.startsWith("gpt-image-");
}

export function incrementSuccessfulGenerationUsage(
  db: ImageDatabase,
  userId: string,
  usageDate: string
): number {
  return incrementDailyUsage(db, userId, usageDate);
}

export function writeGenerationLog(
  db: ImageDatabase,
  userId: string,
  input: WriteGenerationLogInput
): GenerationLog {
  return logGeneration(db, userId, {
    provider: input.provider,
    model: input.model,
    mode: input.mode,
    size: input.size,
    quality: input.quality,
    outputFormat: input.outputFormat,
    status: input.status,
    errorCode: input.errorCode,
    durationMs: input.durationMs,
    promptLength: input.prompt.length,
    hasReferenceImage: input.hasReferenceImage
  });
}
