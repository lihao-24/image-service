import type {
  BuiltinTemplateRecord,
  DailyUsage,
  GenerationParamsSnapshot,
  MineTemplateRecord,
  TemplateLibrary,
  TemplateModalState,
  TemplateRecord
} from "./types";
import type {
  BuiltinPromptTemplate,
  PromptTemplateCategoryId,
  PromptTemplateOutputFormat,
  PromptTemplateQuality,
  PromptTemplateSize
} from "@/lib/prompt-templates";

export const SAFE_PROVIDER_ERROR_MESSAGE = "图片生成服务暂时不可用，请稍后再试。";

const PROVIDER_ERROR_CODES = new Set([
  "provider_request_failed",
  "provider_response_invalid",
  "provider_rate_limited",
  "provider_auth_failed"
]);

export function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function formatUsage(usage?: DailyUsage): string {
  const count = usage?.generation_count ?? 0;

  if (!usage?.limited) {
    return count > 0 ? `今日生成 ${count} 次 · 不限额` : "";
  }

  if (!usage.limit) {
    return count > 0 ? `今日生成 ${count} 次` : "";
  }

  return `今日额度 ${count}/${usage.limit}`;
}

export function usagePercent(usageText: string): number {
  const match = usageText.match(/(\d+)\/(\d+)/);
  if (!match) {
    return 0;
  }
  const current = Number(match[1]);
  const limit = Number(match[2]);
  return limit > 0 ? Math.min(100, Math.round((current / limit) * 100)) : 0;
}

export function createDefaultRecipeTitle(prompt: string): string {
  const normalized = prompt.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "未命名配置";
  }

  return normalized.slice(0, 20);
}

export function parseAspectRatio(size: string): string {
  if (/^\d+:\d+$/.test(size)) {
    return size.replace(":", " / ");
  }

  const [width, height] = size.split("x").map((part) => Number(part));
  if (!width || !height) {
    return "1 / 1";
  }

  return `${width} / ${height}`;
}

export function readSafeErrorMessage(errorCode?: string, message?: string): string {
  if (errorCode && PROVIDER_ERROR_CODES.has(errorCode)) {
    return SAFE_PROVIDER_ERROR_MESSAGE;
  }

  if (!message) {
    return "请求失败，请稍后再试。";
  }

  if (containsSensitiveDetails(message)) {
    return SAFE_PROVIDER_ERROR_MESSAGE;
  }

  return message;
}

export function containsSensitiveDetails(message: string): boolean {
  return /(https?:\/\/|api[_-]?key|sk-[a-z0-9_-]+|stack trace|baseUrl|apiKeyEnv)/i.test(
    message
  );
}

export function allTemplates(library: TemplateLibrary | null): TemplateRecord[] {
  return [...(library?.templates.builtin ?? []), ...(library?.templates.mine ?? [])];
}

export function filterTemplates(
  library: TemplateLibrary | null,
  modal: TemplateModalState,
  query: string
): TemplateRecord[] {
  if (!modal.open) {
    return [];
  }

  return allTemplates(library).filter((template) => {
    if (modal.source === "category") {
      if (template.source !== "builtin" || template.category !== modal.categoryId) {
        return false;
      }
    }
    if (modal.source === "builtin" && template.source !== "builtin") {
      return false;
    }
    if (modal.source === "mine" && template.source !== "mine") {
      return false;
    }
    if (modal.source === "favorites" && !template.is_favorite) {
      return false;
    }

    return matchesTemplateQuery(template, query);
  });
}

export function matchesTemplateQuery(template: TemplateRecord, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  if (!normalizedQuery) {
    return true;
  }

  const values = [
    template.title,
    template.category_name,
    template.mode,
    ...template.tags,
    template.prompt
  ];

  if (template.source === "builtin") {
    for (const variable of template.variables) {
      values.push(variable.key, variable.label, variable.placeholder);
    }
  }

  return values.join("\n").toLocaleLowerCase("zh-CN").includes(normalizedQuery);
}

export function readInitialVariableValues(template: TemplateRecord) {
  if (template.source === "mine") {
    return {};
  }

  return Object.fromEntries(
    template.variables.map((variable) => [variable.key, variable.defaultValue ?? ""])
  );
}

export function toBuiltinPromptTemplate(template: BuiltinTemplateRecord): BuiltinPromptTemplate {
  return {
    id: template.id,
    title: template.title,
    category: template.category as PromptTemplateCategoryId,
    tags: template.tags,
    mode: template.mode,
    recommended: {
      model: "gpt-image-2",
      size: template.recommended.size as PromptTemplateSize,
      quality: template.recommended.quality as PromptTemplateQuality,
      outputFormat: template.recommended.output_format as PromptTemplateOutputFormat,
      referenceMode:
        template.recommended.reference_mode === "single-image" ? "single-image" : "none"
    },
    prompt: template.prompt,
    variables: template.variables,
    source: {
      type: "external-inspired",
      name: template.source_metadata?.name ?? "image-service",
      referenceUrl: template.source_metadata?.referenceUrl,
      note: template.source_metadata?.note ?? "内置中文模板。"
    },
    safetyNotes: template.safety_notes
  };
}

export function readTemplateParams(
  template: TemplateRecord,
  fallback: GenerationParamsSnapshot
): GenerationParamsSnapshot {
  if (template.source === "builtin") {
    return {
      provider: fallback.provider,
      model: template.recommended.model,
      size: template.recommended.size,
      resolution: fallback.resolution,
      quality: template.recommended.quality,
      outputFormat: template.recommended.output_format,
      background: fallback.background,
      moderation: fallback.moderation
    };
  }

  return {
    provider: template.provider || fallback.provider,
    model: template.model,
    size: template.size,
    resolution: fallback.resolution,
    quality: template.quality,
    outputFormat: template.output_format,
    background: fallback.background,
    moderation: fallback.moderation
  };
}

export function updateBuiltinFavorite(
  library: TemplateLibrary | null,
  templateId: string,
  isFavorite: boolean
): TemplateLibrary | null {
  if (!library) {
    return library;
  }

  const favoriteSet = new Set(library.favorite_template_ids);
  if (isFavorite) {
    favoriteSet.add(templateId);
  } else {
    favoriteSet.delete(templateId);
  }

  return {
    ...library,
    favorite_template_ids: Array.from(favoriteSet),
    templates: {
      ...library.templates,
      builtin: library.templates.builtin.map((template) =>
        template.id === templateId ? { ...template, is_favorite: isFavorite } : template
      )
    }
  };
}

export function isMineTemplate(template: TemplateRecord): template is MineTemplateRecord {
  return template.source === "mine";
}

export async function compressReferenceImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  try {
    const image = await createImageBitmap(file);
    const maxSide = 2048;
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));

    if (scale === 1 && file.size <= 2 * 1024 * 1024) {
      image.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");

    if (!context) {
      image.close();
      return file;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9)
    );

    if (!blob || blob.size >= file.size) {
      return file;
    }

    return new File([blob], replaceExtension(file.name || "reference-image", "jpg"), {
      type: "image/jpeg"
    });
  } catch {
    return file;
  }
}

function replaceExtension(filename: string, extension: string): string {
  const normalizedExtension = extension.startsWith(".") ? extension.slice(1) : extension;
  const baseName = filename.replace(/\.[^.]*$/, "");
  return `${baseName || "reference-image"}.${normalizedExtension}`;
}
