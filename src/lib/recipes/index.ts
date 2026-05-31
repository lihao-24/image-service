import {
  createPromptRecipe,
  deletePromptRecipe,
  getPromptRecipeById,
  listPromptRecipes,
  updatePromptRecipe,
  type ImageDatabase,
  type PromptRecipe,
  type PromptRecipeInput,
  type PromptRecipeUpdateInput
} from "@/lib/db";
import { parseImageServiceConfig, validateImageGenerationParams } from "@/lib/config";

export const INVALID_RECIPE_PARAMS = "invalid_recipe_params" as const;
export const RECIPE_NOT_FOUND = "recipe_not_found" as const;

export type RecipeApiRecord = {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  negative_prompt: string | null;
  mode: string;
  provider: string;
  model: string;
  size: string;
  resolution: string | null;
  quality: string;
  output_format: string;
  background: string | null;
  moderation: string | null;
  params: Record<string, unknown>;
  reference_mode: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type RecipeValidationResult =
  | { ok: true; input: PromptRecipeInput }
  | { ok: false; code: typeof INVALID_RECIPE_PARAMS; field: string; message: string };

export type RecipePatchValidationResult =
  | { ok: true; input: PromptRecipeUpdateInput }
  | { ok: false; code: typeof INVALID_RECIPE_PARAMS; field: string; message: string };

const ALLOWED_MODES = ["text-to-image", "image-edit"] as const;
type RecipeMode = (typeof ALLOWED_MODES)[number];
const FORBIDDEN_CLIENT_KEYS = [
  "providerConfig",
  "provider_config",
  "baseUrl",
  "base_url",
  "apiKey",
  "api_key",
  "apiKeyEnv",
  "api_key_env"
];

export function validateRecipeRequestBody(body: unknown): RecipeValidationResult {
  const objectResult = readObject(body);
  if (!objectResult.ok) {
    return objectResult;
  }

  const forbidden = findForbiddenKey(objectResult.value);
  if (forbidden) {
    return invalidRecipeParams(forbidden, "保存配置不能包含客户端 provider 配置、base URL 或 API key。");
  }

  const title = readOptionalString(objectResult.value.title) ?? "未命名配置";
  if (title.length > 120) {
    return invalidRecipeParams("title", "标题不能超过 120 个字符。");
  }

  const prompt = readRequiredString(objectResult.value.prompt);
  if (!prompt || prompt.length > 4000) {
    return invalidRecipeParams("prompt", "请输入 1 到 4000 个字符的 prompt。");
  }

  const negativePrompt = readNullableString(objectResult.value.negative_prompt);
  if (negativePrompt && negativePrompt.length > 2000) {
    return invalidRecipeParams("negative_prompt", "negative prompt 不能超过 2000 个字符。");
  }

  const mode = readRequiredString(objectResult.value.mode);
  if (!isAllowedMode(mode)) {
    return invalidRecipeParams("mode", "请选择有效的生成模式。");
  }

  const paramResult = validateImageGenerationParams(
    {
      provider: readRequiredString(objectResult.value.provider) ?? "",
      model: readRequiredString(objectResult.value.model) ?? ""
    },
    parseImageServiceConfig(),
    { mode }
  );

  if (!paramResult.ok) {
    return invalidRecipeParams(paramResult.field, paramResult.message);
  }

  return {
    ok: true,
    input: {
      title,
      prompt,
      negativePrompt,
      mode,
      provider: paramResult.params.provider,
      model: paramResult.params.model,
      params: readParams(objectResult.value.params),
      referenceMode: readNullableString(objectResult.value.reference_mode),
      isFavorite: readBoolean(objectResult.value.is_favorite)
    }
  };
}

export function validateRecipePatchBody(body: unknown): RecipePatchValidationResult {
  const objectResult = readObject(body);
  if (!objectResult.ok) {
    return objectResult;
  }

  const forbidden = findForbiddenKey(objectResult.value);
  if (forbidden) {
    return invalidRecipeParams(forbidden, "保存配置不能包含客户端 provider 配置、base URL 或 API key。");
  }

  const input: PromptRecipeUpdateInput = {};

  if ("title" in objectResult.value) {
    const title = readOptionalString(objectResult.value.title);
    if (!title || title.length > 120) {
      return invalidRecipeParams("title", "标题必须是 1 到 120 个字符。");
    }
    input.title = title;
  }

  if ("prompt" in objectResult.value) {
    const prompt = readRequiredString(objectResult.value.prompt);
    if (!prompt || prompt.length > 4000) {
      return invalidRecipeParams("prompt", "请输入 1 到 4000 个字符的 prompt。");
    }
    input.prompt = prompt;
  }

  if ("negative_prompt" in objectResult.value) {
    const negativePrompt = readNullableString(objectResult.value.negative_prompt);
    if (negativePrompt && negativePrompt.length > 2000) {
      return invalidRecipeParams("negative_prompt", "negative prompt 不能超过 2000 个字符。");
    }
    input.negativePrompt = negativePrompt;
  }

  const mode = readOptionalString(objectResult.value.mode);
  if (mode !== undefined) {
    if (!isAllowedMode(mode)) {
      return invalidRecipeParams("mode", "请选择有效的生成模式。");
    }
    input.mode = mode;
  }

  if (hasAnyGenerationParam(objectResult.value)) {
    const currentParams = {
      provider: readRequiredString(objectResult.value.provider) ?? "",
      model: readRequiredString(objectResult.value.model) ?? ""
    };
    const paramResult = validateImageGenerationParams(currentParams, parseImageServiceConfig(), {
      mode: mode ?? "text-to-image"
    });
    if (!paramResult.ok) {
      return invalidRecipeParams(paramResult.field, paramResult.message);
    }
    input.provider = paramResult.params.provider;
    input.model = paramResult.params.model;
    input.params = input.params ?? readParams(objectResult.value.params);
  }

  if ("params" in objectResult.value && !input.params) {
    input.params = readParams(objectResult.value.params);
  }

  if ("reference_mode" in objectResult.value) {
    input.referenceMode = readNullableString(objectResult.value.reference_mode);
  }

  if ("is_favorite" in objectResult.value) {
    input.isFavorite = readBoolean(objectResult.value.is_favorite);
  }

  return { ok: true, input };
}

export function saveRecipeForUser(
  db: ImageDatabase,
  userId: string,
  input: PromptRecipeInput
): PromptRecipe {
  return createPromptRecipe(db, userId, input);
}

export function listRecipesForUser(db: ImageDatabase, userId: string): PromptRecipe[] {
  return listPromptRecipes(db, userId);
}

export function getRecipeForUser(
  db: ImageDatabase,
  userId: string,
  recipeId: string
): PromptRecipe | null {
  return getPromptRecipeById(db, userId, recipeId);
}

export function updateRecipeForUser(
  db: ImageDatabase,
  userId: string,
  recipeId: string,
  input: PromptRecipeUpdateInput
): PromptRecipe | null {
  return updatePromptRecipe(db, userId, recipeId, input);
}

export function deleteRecipeForUser(
  db: ImageDatabase,
  userId: string,
  recipeId: string
): boolean {
  return deletePromptRecipe(db, userId, recipeId);
}

export function toRecipeApiRecord(recipe: PromptRecipe): RecipeApiRecord {
  return {
    id: recipe.id,
    user_id: recipe.userId,
    title: recipe.title,
    prompt: recipe.prompt,
    negative_prompt: recipe.negativePrompt,
    mode: recipe.mode,
    provider: recipe.provider,
    model: recipe.model,
    size: recipe.size,
    resolution: readStoredParamString(recipe.params.resolution),
    quality: recipe.quality,
    output_format: recipe.outputFormat,
    background: readStoredParamString(recipe.params.background),
    moderation: readStoredParamString(recipe.params.moderation),
    params: recipe.params,
    reference_mode: recipe.referenceMode,
    is_favorite: recipe.isFavorite,
    created_at: recipe.createdAt,
    updated_at: recipe.updatedAt
  };
}

function readObject(body: unknown):
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; code: typeof INVALID_RECIPE_PARAMS; field: string; message: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return invalidRecipeParams("body", "请求体必须是 JSON 对象。");
  }

  return { ok: true, value: body as Record<string, unknown> };
}

function findForbiddenKey(input: Record<string, unknown>): string | null {
  return FORBIDDEN_CLIENT_KEYS.find((key) => key in input) ?? null;
}

function hasAnyGenerationParam(input: Record<string, unknown>) {
  return [
    "provider",
    "model"
  ].some((key) => key in input);
}

function isAllowedMode(value: string | null | undefined): value is RecipeMode {
  return ALLOWED_MODES.includes(value as (typeof ALLOWED_MODES)[number]);
}

function readRequiredString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readOptionalString(value: unknown): string | undefined | null {
  if (value === undefined) {
    return undefined;
  }

  return readRequiredString(value);
}

function readNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return readRequiredString(value);
}

function readParams(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function readBoolean(value: unknown): boolean {
  return value === true;
}

function readStoredParamString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function invalidRecipeParams(
  field: string,
  message: string
): { ok: false; code: typeof INVALID_RECIPE_PARAMS; field: string; message: string } {
  return {
    ok: false,
    code: INVALID_RECIPE_PARAMS,
    field,
    message
  };
}
