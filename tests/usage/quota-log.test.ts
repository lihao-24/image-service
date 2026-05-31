import { describe, expect, it } from "vitest";
import {
  getDailyUsage,
  initializeDatabase,
  listGenerationLogs,
  openDatabase
} from "@/lib/db";
import {
  checkDailyQuota,
  incrementSuccessfulGenerationUsage,
  shouldEnforceDailyQuota,
  writeGenerationLog
} from "@/lib/usage";

describe("usage quota/log helpers", () => {
  it("GPT Image 官方模型只统计用量，不做每日额度拦截", () => {
    expect(shouldEnforceDailyQuota("gpt-image-2")).toBe(false);
    expect(shouldEnforceDailyQuota("gpt-image-1")).toBe(false);
    expect(shouldEnforceDailyQuota("gpt-image-1-mini")).toBe(false);
    expect(shouldEnforceDailyQuota("imagen-4")).toBe(true);
  });

  it("按用户和日期检查每日额度", () => {
    const db = openDatabase(":memory:");
    initializeDatabase(db);

    expect(checkDailyQuota(db, "user-a", "2026-05-17", 1)).toEqual({
      ok: true,
      generationCount: 0,
      limit: 1
    });
    expect(incrementSuccessfulGenerationUsage(db, "user-a", "2026-05-17")).toBe(1);
    expect(checkDailyQuota(db, "user-a", "2026-05-17", 1)).toEqual({
      ok: false,
      code: "quota_exceeded",
      generationCount: 1,
      limit: 1
    });
  });

  it("生成日志只保存元信息，不保存 prompt 全文或图片", () => {
    const db = openDatabase(":memory:");
    initializeDatabase(db);
    const prompt = "这是一段不应该进入 generation_logs 的完整 prompt";

    writeGenerationLog(db, "user-a", {
      provider: "sub2api",
      model: "gpt-image-2",
      mode: "text-to-image",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      status: "success",
      errorCode: null,
      durationMs: 123,
      prompt,
      imageB64Json: "base64-image-that-must-not-be-stored",
      hasReferenceImage: false
    });

    const logs = listGenerationLogs(db, "user-a");
    expect(logs).toHaveLength(1);
    expect(logs[0]?.promptLength).toBe(prompt.length);
    expect(JSON.stringify(logs)).not.toContain(prompt);
    expect(JSON.stringify(logs)).not.toContain("base64-image-that-must-not-be-stored");
    expect(getDailyUsage(db, "user-a", "2026-05-17")).toBe(0);
  });
});
