import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import {
  closeDatabase,
  createPromptRecipe,
  getDailyUsage,
  getPromptRecipeById,
  incrementDailyUsage,
  initializeDatabase,
  listGenerationLogs,
  listPromptRecipes,
  logGeneration,
  openDatabase
} from "@/lib/db";

const TEST_ROOT = join(tmpdir(), "image-service-sqlite-tests");

describe("SQLite 数据层", () => {
  let dbPath: string;

  beforeEach(async () => {
    await mkdir(TEST_ROOT, { recursive: true });
    dbPath = join(TEST_ROOT, `test-${crypto.randomUUID()}.sqlite`);
  });

  afterEach(async () => {
    await rm(dbPath, { force: true });
    await rm(`${dbPath}-shm`, { force: true });
    await rm(`${dbPath}-wal`, { force: true });
  });

  test("初始化三张表并包含关键列", () => {
    const db = openDatabase(dbPath);
    try {
      initializeDatabase(db);

      expect(tableColumns(db, "prompt_recipes")).toEqual(
        expect.arrayContaining([
          "id",
          "user_id",
          "title",
          "prompt",
          "negative_prompt",
          "mode",
          "provider",
          "model",
          "size",
          "quality",
          "output_format",
          "params_json",
          "reference_mode",
          "is_favorite",
          "created_at",
          "updated_at"
        ])
      );
      expect(tableColumns(db, "generation_logs")).toEqual(
        expect.arrayContaining([
          "id",
          "user_id",
          "provider",
          "model",
          "mode",
          "size",
          "quality",
          "output_format",
          "status",
          "error_code",
          "duration_ms",
          "prompt_length",
          "has_reference_image",
          "created_at"
        ])
      );
      expect(tableColumns(db, "daily_usage")).toEqual(
        expect.arrayContaining(["user_id", "usage_date", "generation_count"])
      );
    } finally {
      closeDatabase(db);
    }
  });

  test("generation_logs 不包含 prompt 全文或图片字段", () => {
    const db = openDatabase(dbPath);
    try {
      initializeDatabase(db);

      const columns = tableColumns(db, "generation_logs");

      expect(columns).not.toEqual(expect.arrayContaining(["prompt", "negative_prompt"]));
      expect(columns.some((column) => column.includes("image"))).toBe(true);
      expect(columns).not.toEqual(
        expect.arrayContaining([
          "image",
          "image_bytes",
          "image_b64",
          "generated_image",
          "reference_image",
          "reference_image_bytes",
          "provider_api_key",
          "api_key"
        ])
      );
    } finally {
      closeDatabase(db);
    }
  });

  test("Prompt 配方 helper 只能读取当前用户数据", () => {
    const db = openDatabase(dbPath);
    try {
      initializeDatabase(db);

      const userARecipe = createPromptRecipe(db, "user-a", {
        title: "海边晚霞",
        prompt: "一张海边晚霞照片",
        negativePrompt: "低清晰度",
        mode: "text-to-image",
        provider: "sub2api",
        model: "gpt-image-2",
        size: "1024x1536",
        quality: "high",
        outputFormat: "png",
        params: { seed: 123 },
        referenceMode: "none",
        isFavorite: true
      });
      createPromptRecipe(db, "user-b", {
        title: "城市夜景",
        prompt: "雨夜霓虹城市",
        negativePrompt: null,
        mode: "text-to-image",
        provider: "sub2api",
        model: "gpt-image-2",
        size: "1024x1024",
        quality: "medium",
        outputFormat: "jpeg",
        params: {},
        referenceMode: "none",
        isFavorite: false
      });

      expect(listPromptRecipes(db, "user-a")).toHaveLength(1);
      expect(listPromptRecipes(db, "user-a")[0]?.title).toBe("海边晚霞");
      expect(getPromptRecipeById(db, "user-a", userARecipe.id)?.prompt).toBe("一张海边晚霞照片");
      expect(getPromptRecipeById(db, "user-b", userARecipe.id)).toBeNull();
    } finally {
      closeDatabase(db);
    }
  });

  test("generation log 和 daily usage helper 按用户隔离", () => {
    const db = openDatabase(dbPath);
    try {
      initializeDatabase(db);

      logGeneration(db, "user-a", {
        provider: "sub2api",
        model: "gpt-image-2",
        mode: "text-to-image",
        size: "1024x1536",
        quality: "high",
        outputFormat: "png",
        status: "success",
        errorCode: null,
        durationMs: 850,
        promptLength: 12,
        hasReferenceImage: false
      });
      logGeneration(db, "user-b", {
        provider: "sub2api",
        model: "gpt-image-2",
        mode: "image-edit",
        size: "1024x1024",
        quality: "medium",
        outputFormat: "webp",
        status: "failed",
        errorCode: "provider_error",
        durationMs: 1200,
        promptLength: 8,
        hasReferenceImage: true
      });
      incrementDailyUsage(db, "user-a", "2026-05-17");
      incrementDailyUsage(db, "user-a", "2026-05-17");
      incrementDailyUsage(db, "user-b", "2026-05-17");

      expect(listGenerationLogs(db, "user-a")).toMatchObject([
        {
          userId: "user-a",
          mode: "text-to-image",
          status: "success",
          hasReferenceImage: false
        }
      ]);
      expect(listGenerationLogs(db, "user-b")).toMatchObject([
        {
          userId: "user-b",
          mode: "image-edit",
          status: "failed",
          hasReferenceImage: true
        }
      ]);
      expect(getDailyUsage(db, "user-a", "2026-05-17")).toBe(2);
      expect(getDailyUsage(db, "user-b", "2026-05-17")).toBe(1);
      expect(getDailyUsage(db, "user-a", "2026-05-18")).toBe(0);
    } finally {
      closeDatabase(db);
    }
  });
});

function tableColumns(db: ReturnType<typeof openDatabase>, tableName: string) {
  return db.prepare(`PRAGMA table_info(${tableName})`).all().map((row) => String(row.name));
}
