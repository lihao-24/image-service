import type { PromptTemplateVariable } from "@/lib/prompt-templates";

export type GenerationMode = "text-to-image" | "image-edit";
export type RequestStatus = "idle" | "loading" | "success" | "error";
export type TemplateSourceView = "builtin" | "mine" | "favorites" | "category";

export type GenerationParamsSnapshot = {
  provider: string;
  model: string;
  size: string;
  resolution?: string;
  quality: string;
  outputFormat: string;
  background?: string;
  moderation?: string;
};

export type TemporaryImage = {
  src: string;
  outputFormat: string;
  filename: string;
};

export type WorkbenchUserMessage = {
  id: string;
  role: "user";
  prompt: string;
  mode: GenerationMode;
  params: GenerationParamsSnapshot;
  referencePreviewUrl?: string;
  referenceFileName?: string;
  collapsed: boolean;
  createdAt: string;
};

export type WorkbenchAssistantMessage = {
  id: string;
  role: "assistant";
  status: "loading" | "success" | "error";
  prompt: string;
  mode: GenerationMode;
  params: GenerationParamsSnapshot;
  image?: TemporaryImage;
  errorMessage?: string;
  createdAt: string;
};

export type WorkbenchMessage = WorkbenchUserMessage | WorkbenchAssistantMessage;

export type TemplateModalState =
  | { open: false }
  | {
      open: true;
      source: TemplateSourceView;
      title: string;
      categoryId?: string;
    };

export type TemplateCategory = {
  id: string;
  name: string;
  description?: string;
};

export type ApiRecommendedParams = {
  model: string;
  size: string;
  quality: string;
  output_format: string;
  reference_mode?: string | null;
};

export type BuiltinTemplateRecord = {
  source: "builtin";
  id: string;
  title: string;
  category: string;
  category_name: string;
  tags: string[];
  mode: GenerationMode;
  recommended: ApiRecommendedParams;
  prompt: string;
  variables: PromptTemplateVariable[];
  source_metadata?: {
    type: string;
    name: string;
    referenceUrl?: string;
    note: string;
  };
  safety_notes?: string[];
  is_favorite: boolean;
};

export type MineTemplateRecord = {
  source: "mine";
  id: string;
  title: string;
  category: null;
  category_name: "我的模板";
  tags: string[];
  mode: GenerationMode;
  provider?: string;
  model: string;
  size: string;
  resolution?: string | null;
  quality: string;
  output_format: string;
  background?: string | null;
  moderation?: string | null;
  prompt: string;
  reference_mode: string | null;
  is_favorite: boolean;
};

export type TemplateRecord = BuiltinTemplateRecord | MineTemplateRecord;

export type TemplateLibrary = {
  categories: TemplateCategory[];
  templates: {
    builtin: BuiltinTemplateRecord[];
    mine: MineTemplateRecord[];
  };
  favorite_template_ids: string[];
};

export type DailyUsage = {
  date?: string;
  generation_count?: number;
  limit?: number | null;
  limited?: boolean;
};
