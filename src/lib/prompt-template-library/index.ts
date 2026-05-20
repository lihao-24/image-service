import {
  BUILTIN_PROMPT_TEMPLATES,
  PROMPT_TEMPLATE_CATEGORIES,
  type BuiltinPromptTemplate,
  type PromptTemplateCategoryId,
  type PromptTemplateMode
} from "@/lib/prompt-templates";
import {
  addTemplateFavorite,
  listPromptRecipes,
  listTemplateFavorites,
  removeTemplateFavorite,
  type ImageDatabase,
  type PromptRecipe,
  type TemplateFavorite
} from "@/lib/db";

export const INVALID_TEMPLATE_ID = "invalid_template_id" as const;
export const TEMPLATE_FAVORITE_NOT_FOUND = "template_favorite_not_found" as const;

export type PromptTemplateSourceFilter = "builtin" | "mine";

export type PromptTemplateLibraryFilters = {
  source?: PromptTemplateSourceFilter;
  category?: string;
  mode?: string;
  q?: string;
  favorite?: boolean;
};

export type BuiltinPromptTemplateApiRecord = {
  source: "builtin";
  id: string;
  title: string;
  category: PromptTemplateCategoryId;
  category_name: string;
  tags: string[];
  mode: PromptTemplateMode;
  recommended: {
    model: string;
    size: string;
    quality: string;
    output_format: string;
    reference_mode: string;
  };
  prompt: string;
  variables: BuiltinPromptTemplate["variables"];
  source_metadata: BuiltinPromptTemplate["source"];
  safety_notes: string[];
  is_favorite: boolean;
};

export type MinePromptTemplateApiRecord = {
  source: "mine";
  id: string;
  user_id: string;
  title: string;
  category: null;
  category_name: "我的模板";
  tags: string[];
  mode: string;
  provider: string;
  model: string;
  size: string;
  resolution: string | null;
  quality: string;
  output_format: string;
  background: string | null;
  moderation: string | null;
  prompt: string;
  negative_prompt: string | null;
  params: Record<string, unknown>;
  reference_mode: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type PromptTemplateLibraryResult = {
  categories: typeof PROMPT_TEMPLATE_CATEGORIES;
  templates: {
    builtin: BuiltinPromptTemplateApiRecord[];
    mine: MinePromptTemplateApiRecord[];
  };
  favorite_template_ids: string[];
};

export function getPromptTemplateLibrary(
  db: ImageDatabase,
  userId: string,
  filters: PromptTemplateLibraryFilters = {}
): PromptTemplateLibraryResult {
  const favorites = listTemplateFavorites(db, userId);
  const favoriteIds = favorites.map((favorite) => favorite.templateId);
  const favoriteSet = new Set(favoriteIds);

  const builtin = BUILTIN_PROMPT_TEMPLATES.map((template) =>
    toBuiltinTemplateApiRecord(template, favoriteSet.has(template.id))
  ).filter((template) => matchesFilters(template, filters));

  const mine = listPromptRecipes(db, userId)
    .map(toMineTemplateApiRecord)
    .filter((template) => matchesFilters(template, filters));

  return {
    categories: PROMPT_TEMPLATE_CATEGORIES,
    templates: {
      builtin: filters.source === "mine" ? [] : builtin,
      mine: filters.source === "builtin" ? [] : mine
    },
    favorite_template_ids: favoriteIds
  };
}

export function addBuiltinTemplateFavorite(
  db: ImageDatabase,
  userId: string,
  templateId: string
): TemplateFavorite | null {
  if (!isBuiltinTemplateId(templateId)) {
    return null;
  }

  return addTemplateFavorite(db, userId, templateId);
}

export function removeBuiltinTemplateFavorite(
  db: ImageDatabase,
  userId: string,
  templateId: string
): "deleted" | "invalid_template_id" | "not_found" {
  if (!isBuiltinTemplateId(templateId)) {
    return "invalid_template_id";
  }

  return removeTemplateFavorite(db, userId, templateId) ? "deleted" : "not_found";
}

export function toTemplateFavoriteApiRecord(favorite: TemplateFavorite) {
  return {
    user_id: favorite.userId,
    template_id: favorite.templateId,
    created_at: favorite.createdAt
  };
}

function toBuiltinTemplateApiRecord(
  template: BuiltinPromptTemplate,
  isFavorite: boolean
): BuiltinPromptTemplateApiRecord {
  return {
    source: "builtin",
    id: template.id,
    title: template.title,
    category: template.category,
    category_name: getCategoryName(template.category),
    tags: template.tags,
    mode: template.mode,
    recommended: {
      model: template.recommended.model,
      size: template.recommended.size,
      quality: template.recommended.quality,
      output_format: template.recommended.outputFormat,
      reference_mode: template.recommended.referenceMode
    },
    prompt: template.prompt,
    variables: template.variables,
    source_metadata: template.source,
    safety_notes: template.safetyNotes ?? [],
    is_favorite: isFavorite
  };
}

function toMineTemplateApiRecord(recipe: PromptRecipe): MinePromptTemplateApiRecord {
  return {
    source: "mine",
    id: recipe.id,
    user_id: recipe.userId,
    title: recipe.title,
    category: null,
    category_name: "我的模板",
    tags: readRecipeTags(recipe.params),
    mode: recipe.mode,
    provider: recipe.provider,
    model: recipe.model,
    size: recipe.size,
    resolution: readRecipeParamString(recipe.params.resolution),
    quality: recipe.quality,
    output_format: recipe.outputFormat,
    background: readRecipeParamString(recipe.params.background),
    moderation: readRecipeParamString(recipe.params.moderation),
    prompt: recipe.prompt,
    negative_prompt: recipe.negativePrompt,
    params: recipe.params,
    reference_mode: recipe.referenceMode,
    is_favorite: recipe.isFavorite,
    created_at: recipe.createdAt,
    updated_at: recipe.updatedAt
  };
}

function matchesFilters(
  template: BuiltinPromptTemplateApiRecord | MinePromptTemplateApiRecord,
  filters: PromptTemplateLibraryFilters
) {
  if (filters.source && template.source !== filters.source) {
    return false;
  }

  if (filters.category && template.category !== filters.category) {
    return false;
  }

  if (filters.mode && template.mode !== filters.mode) {
    return false;
  }

  if (filters.favorite === true && !template.is_favorite) {
    return false;
  }

  if (filters.q && !matchesQuery(template, filters.q)) {
    return false;
  }

  return true;
}

function matchesQuery(
  template: BuiltinPromptTemplateApiRecord | MinePromptTemplateApiRecord,
  query: string
) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return true;
  }

  const fields = [
    template.title,
    template.category_name,
    template.mode,
    ...template.tags,
    template.prompt
  ];

  if (template.source === "builtin") {
    for (const variable of template.variables) {
      fields.push(variable.key, variable.label, variable.placeholder);
    }
  }

  return normalizeSearchText(fields.join("\n")).includes(normalizedQuery);
}

function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase("zh-CN");
}

function getCategoryName(categoryId: PromptTemplateCategoryId) {
  return (
    PROMPT_TEMPLATE_CATEGORIES.find((category) => category.id === categoryId)?.name ?? categoryId
  );
}

function isBuiltinTemplateId(templateId: string) {
  return BUILTIN_PROMPT_TEMPLATES.some((template) => template.id === templateId);
}

function readRecipeTags(params: Record<string, unknown>) {
  const tags = params.tags;
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
}

function readRecipeParamString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
