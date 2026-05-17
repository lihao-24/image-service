import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

export type ImageDatabase = DatabaseSync;

export type GenerationMode = "text-to-image" | "image-edit" | (string & {});
export type GenerationStatus = "success" | "failed" | "rejected" | (string & {});

export interface PromptRecipeInput {
  title: string;
  prompt: string;
  negativePrompt: string | null;
  mode: GenerationMode;
  provider: string;
  model: string;
  size: string;
  quality: string;
  outputFormat: string;
  params: Record<string, unknown>;
  referenceMode: string | null;
  isFavorite: boolean;
}

export interface PromptRecipe {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  negativePrompt: string | null;
  mode: string;
  provider: string;
  model: string;
  size: string;
  quality: string;
  outputFormat: string;
  params: Record<string, unknown>;
  referenceMode: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationLogInput {
  provider: string;
  model: string;
  mode: GenerationMode;
  size: string;
  quality: string;
  outputFormat: string;
  status: GenerationStatus;
  errorCode: string | null;
  durationMs: number | null;
  promptLength: number;
  hasReferenceImage: boolean;
}

export interface GenerationLog {
  id: string;
  userId: string;
  provider: string;
  model: string;
  mode: string;
  size: string;
  quality: string;
  outputFormat: string;
  status: string;
  errorCode: string | null;
  durationMs: number | null;
  promptLength: number;
  hasReferenceImage: boolean;
  createdAt: string;
}

export function getDatabasePath(env: NodeJS.ProcessEnv = process.env) {
  return env.IMAGE_SERVICE_SQLITE_PATH ?? "./data/image-service.sqlite";
}

export function openDatabase(databasePath = getDatabasePath()): ImageDatabase {
  if (databasePath !== ":memory:") {
    mkdirSync(dirname(databasePath), { recursive: true });
  }

  const db = new DatabaseSync(databasePath);
  db.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
  return db;
}

export function closeDatabase(db: ImageDatabase) {
  db.close();
}

export function initializeDatabase(db: ImageDatabase) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS prompt_recipes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      prompt TEXT NOT NULL,
      negative_prompt TEXT,
      mode TEXT NOT NULL,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      size TEXT NOT NULL,
      quality TEXT NOT NULL,
      output_format TEXT NOT NULL,
      params_json TEXT NOT NULL DEFAULT '{}',
      reference_mode TEXT,
      is_favorite INTEGER NOT NULL DEFAULT 0 CHECK (is_favorite IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE INDEX IF NOT EXISTS idx_prompt_recipes_user_updated
      ON prompt_recipes (user_id, updated_at DESC);

    CREATE TABLE IF NOT EXISTS generation_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      mode TEXT NOT NULL,
      size TEXT NOT NULL,
      quality TEXT NOT NULL,
      output_format TEXT NOT NULL,
      status TEXT NOT NULL,
      error_code TEXT,
      duration_ms INTEGER,
      prompt_length INTEGER NOT NULL,
      has_reference_image INTEGER NOT NULL CHECK (has_reference_image IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE INDEX IF NOT EXISTS idx_generation_logs_user_created
      ON generation_logs (user_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS daily_usage (
      user_id TEXT NOT NULL,
      usage_date TEXT NOT NULL,
      generation_count INTEGER NOT NULL DEFAULT 0 CHECK (generation_count >= 0),
      PRIMARY KEY (user_id, usage_date)
    );
  `);
}

export function createPromptRecipe(
  db: ImageDatabase,
  userId: string,
  input: PromptRecipeInput
): PromptRecipe {
  const id = crypto.randomUUID();
  db.prepare(
    `
      INSERT INTO prompt_recipes (
        id, user_id, title, prompt, negative_prompt, mode, provider, model,
        size, quality, output_format, params_json, reference_mode, is_favorite
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).run(
    id,
    userId,
    input.title,
    input.prompt,
    input.negativePrompt,
    input.mode,
    input.provider,
    input.model,
    input.size,
    input.quality,
    input.outputFormat,
    JSON.stringify(input.params),
    input.referenceMode,
    input.isFavorite ? 1 : 0
  );

  const recipe = getPromptRecipeById(db, userId, id);
  if (!recipe) {
    throw new Error("保存 Prompt 配方失败");
  }
  return recipe;
}

export function getPromptRecipeById(
  db: ImageDatabase,
  userId: string,
  recipeId: string
): PromptRecipe | null {
  const row = db
    .prepare("SELECT * FROM prompt_recipes WHERE user_id = ? AND id = ?")
    .get(userId, recipeId);

  return row ? mapPromptRecipeRow(row) : null;
}

export function listPromptRecipes(db: ImageDatabase, userId: string): PromptRecipe[] {
  return db
    .prepare("SELECT * FROM prompt_recipes WHERE user_id = ? ORDER BY updated_at DESC, id DESC")
    .all(userId)
    .map(mapPromptRecipeRow);
}

export function logGeneration(
  db: ImageDatabase,
  userId: string,
  input: GenerationLogInput
): GenerationLog {
  const id = crypto.randomUUID();
  db.prepare(
    `
      INSERT INTO generation_logs (
        id, user_id, provider, model, mode, size, quality, output_format,
        status, error_code, duration_ms, prompt_length, has_reference_image
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).run(
    id,
    userId,
    input.provider,
    input.model,
    input.mode,
    input.size,
    input.quality,
    input.outputFormat,
    input.status,
    input.errorCode,
    input.durationMs,
    input.promptLength,
    input.hasReferenceImage ? 1 : 0
  );

  const log = db
    .prepare("SELECT * FROM generation_logs WHERE user_id = ? AND id = ?")
    .get(userId, id);
  if (!log) {
    throw new Error("写入生成日志失败");
  }
  return mapGenerationLogRow(log);
}

export function listGenerationLogs(db: ImageDatabase, userId: string): GenerationLog[] {
  return db
    .prepare("SELECT * FROM generation_logs WHERE user_id = ? ORDER BY created_at DESC, id DESC")
    .all(userId)
    .map(mapGenerationLogRow);
}

export function getDailyUsage(db: ImageDatabase, userId: string, usageDate: string): number {
  const row = db
    .prepare(
      "SELECT generation_count FROM daily_usage WHERE user_id = ? AND usage_date = ?"
    )
    .get(userId, usageDate);

  return row ? Number(row.generation_count) : 0;
}

export function incrementDailyUsage(
  db: ImageDatabase,
  userId: string,
  usageDate: string
): number {
  db.prepare(
    `
      INSERT INTO daily_usage (user_id, usage_date, generation_count)
      VALUES (?, ?, 1)
      ON CONFLICT(user_id, usage_date)
      DO UPDATE SET generation_count = generation_count + 1
    `
  ).run(userId, usageDate);

  return getDailyUsage(db, userId, usageDate);
}

function mapPromptRecipeRow(row: Record<string, unknown>): PromptRecipe {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title),
    prompt: String(row.prompt),
    negativePrompt: nullableString(row.negative_prompt),
    mode: String(row.mode),
    provider: String(row.provider),
    model: String(row.model),
    size: String(row.size),
    quality: String(row.quality),
    outputFormat: String(row.output_format),
    params: parseParamsJson(String(row.params_json)),
    referenceMode: nullableString(row.reference_mode),
    isFavorite: Number(row.is_favorite) === 1,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapGenerationLogRow(row: Record<string, unknown>): GenerationLog {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    provider: String(row.provider),
    model: String(row.model),
    mode: String(row.mode),
    size: String(row.size),
    quality: String(row.quality),
    outputFormat: String(row.output_format),
    status: String(row.status),
    errorCode: nullableString(row.error_code),
    durationMs: nullableNumber(row.duration_ms),
    promptLength: Number(row.prompt_length),
    hasReferenceImage: Number(row.has_reference_image) === 1,
    createdAt: String(row.created_at)
  };
}

function parseParamsJson(value: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }
  return parsed as Record<string, unknown>;
}

function nullableString(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

function nullableNumber(value: unknown): number | null {
  return value === null || value === undefined ? null : Number(value);
}
