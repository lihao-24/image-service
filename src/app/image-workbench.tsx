"use client";

import { useEffect, useMemo, useSyncExternalStore, useState } from "react";
import type { PublicImageConfig } from "@/lib/config";
import { ChatSidebar } from "./workbench/chat-sidebar";
import {
  createId,
  formatUsage,
  readSafeErrorMessage,
  SAFE_PROVIDER_ERROR_MESSAGE
} from "./workbench/helpers";
import { MessageList } from "./workbench/message-list";
import { PromptComposer } from "./workbench/prompt-composer";
import { SaveRecipeModal } from "./workbench/save-recipe-modal";
import { TemplateModal } from "./workbench/template-modal";
import type {
  DailyUsage,
  GenerationMode,
  GenerationParamsSnapshot,
  TemplateLibrary,
  TemplateModalState,
  WorkbenchAssistantMessage,
  WorkbenchMessage,
  WorkbenchUserMessage
} from "./workbench/types";

type ImageWorkbenchProps = {
  config: PublicImageConfig;
  userLabel: string;
};

type GenerateResponse = {
  image?: {
    b64_json?: string;
    output_format?: string;
  };
  meta?: {
    mode?: GenerationMode;
    daily_usage?: DailyUsage;
  };
  message?: string;
  error?: string;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function ImageWorkbench({ config, userLabel }: ImageWorkbenchProps) {
  const isMobileViewport = useIsMobileViewport();
  const provider = useMemo(
    () =>
      config.providers.find((item) => item.id === config.defaultProvider) ??
      config.providers[0],
    [config.defaultProvider, config.providers]
  );
  const providerId = provider?.id ?? config.defaultProvider;
  const [params, setParams] = useState<GenerationParamsSnapshot>({
    provider: providerId,
    model: config.defaults.model,
    size: config.defaults.size,
    quality: config.defaults.quality,
    outputFormat: config.defaults.outputFormat
  });
  const [mode, setMode] = useState<GenerationMode>("text-to-image");
  const [prompt, setPrompt] = useState("");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referencePreviewUrl, setReferencePreviewUrl] = useState("");
  const [messages, setMessages] = useState<WorkbenchMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [templateModal, setTemplateModal] = useState<TemplateModalState>({ open: false });
  const [library, setLibrary] = useState<TemplateLibrary | null>(null);
  const [usageText, setUsageText] = useState("");
  const [editNotice, setEditNotice] = useState("");
  const [saveTargetId, setSaveTargetId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    void loadTemplateLibrary();
  }, []);

  useEffect(() => {
    return () => {
      if (referencePreviewUrl) {
        URL.revokeObjectURL(referencePreviewUrl);
      }
    };
  }, [referencePreviewUrl]);

  const saveTarget = messages.find(
    (message): message is WorkbenchAssistantMessage =>
      message.role === "assistant" && message.id === saveTargetId && message.status === "success"
  );

  async function loadTemplateLibrary() {
    try {
      const response = await fetch("/api/prompt-templates");
      const payload = (await response.json().catch(() => ({}))) as TemplateLibrary & {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || "提示词库加载失败，请稍后再试。");
      }

      setLibrary(payload);
    } catch {
      setLibrary({
        categories: [],
        templates: { builtin: [], mine: [] },
        favorite_template_ids: []
      });
    }
  }

  function updateParams(nextParams: Partial<GenerationParamsSnapshot>) {
    setParams((current) => ({ ...current, ...nextParams, provider: providerId }));
  }

  function useTemplate(payload: {
    prompt: string;
    mode: GenerationMode;
    params: GenerationParamsSnapshot;
  }) {
    setPrompt(payload.prompt);
    updateParams({
      model: payload.params.model,
      size: payload.params.size,
      quality: payload.params.quality,
      outputFormat: payload.params.outputFormat
    });
    setMode(payload.mode);
  }

  function handleReferenceImageChange(file: File | null) {
    if (referencePreviewUrl) {
      URL.revokeObjectURL(referencePreviewUrl);
      setReferencePreviewUrl("");
    }

    if (!file) {
      setReferenceImage(null);
      return;
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setReferenceImage(null);
      setEditNotice("参考图仅支持 PNG、JPEG 或 WebP。");
      return;
    }

    setReferenceImage(file);
    setReferencePreviewUrl(URL.createObjectURL(file));
    setEditNotice("");
  }

  async function handleGenerate() {
    await startGeneration({
      prompt: prompt.trim(),
      mode,
      params,
      referenceImage,
      referencePreviewUrl,
      referenceFileName: referenceImage?.name,
      clearComposer: true
    });
  }

  async function startGeneration({
    prompt: promptText,
    mode: generationMode,
    params: generationParams,
    referenceImage: generationReference,
    referencePreviewUrl: generationReferencePreviewUrl,
    referenceFileName,
    clearComposer
  }: {
    prompt: string;
    mode: GenerationMode;
    params: GenerationParamsSnapshot;
    referenceImage: File | null;
    referencePreviewUrl?: string;
    referenceFileName?: string;
    clearComposer: boolean;
  }) {
    if (!promptText) {
      setEditNotice("请输入 prompt。");
      return;
    }

    if (generationMode === "image-edit" && !generationReference) {
      setEditNotice("请先选择参考图。");
      return;
    }

    const userMessageId = createId("user");
    const assistantMessageId = createId("assistant");
    const createdAt = new Date().toISOString();
    const userMessage: WorkbenchUserMessage = {
      id: userMessageId,
      role: "user",
      prompt: promptText,
      mode: generationMode,
      params: generationParams,
      referencePreviewUrl: generationReferencePreviewUrl,
      referenceFileName,
      collapsed: true,
      createdAt
    };
    const loadingMessage: WorkbenchAssistantMessage = {
      id: assistantMessageId,
      role: "assistant",
      status: "loading",
      prompt: promptText,
      mode: generationMode,
      params: generationParams,
      createdAt
    };

    setMessages((current) => [...current, userMessage, loadingMessage]);
    setIsGenerating(true);
    setEditNotice("");

    if (clearComposer) {
      setPrompt("");
      setReferenceImage(null);
      setReferencePreviewUrl("");
    }

    try {
      const response = await fetchGeneration({
        prompt: promptText,
        mode: generationMode,
        params: generationParams,
        referenceImage: generationReference
      });
      const payload = (await response.json().catch(() => ({}))) as GenerateResponse;

      if (!response.ok) {
        throw new Error(readSafeErrorMessage(payload.error, payload.message));
      }

      const b64Json = payload.image?.b64_json?.trim();
      const format = payload.image?.output_format || generationParams.outputFormat;

      if (!b64Json) {
        throw new Error(SAFE_PROVIDER_ERROR_MESSAGE);
      }

      const successMessage: WorkbenchAssistantMessage = {
        ...loadingMessage,
        status: "success",
        image: {
          src: `data:image/${format};base64,${b64Json}`,
          outputFormat: format,
          filename: `image-service-preview.${format === "jpeg" ? "jpg" : format}`
        }
      };

      setMessages((current) =>
        current.map((message) => (message.id === assistantMessageId ? successMessage : message))
      );
      setUsageText(formatUsage(payload.meta?.daily_usage));
    } catch (error) {
      const errorMessage: WorkbenchAssistantMessage = {
        ...loadingMessage,
        status: "error",
        errorMessage: error instanceof Error ? error.message : SAFE_PROVIDER_ERROR_MESSAGE
      };
      setMessages((current) =>
        current.map((message) => (message.id === assistantMessageId ? errorMessage : message))
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function fetchGeneration({
    prompt: promptText,
    mode: generationMode,
    params: generationParams,
    referenceImage: generationReference
  }: {
    prompt: string;
    mode: GenerationMode;
    params: GenerationParamsSnapshot;
    referenceImage: File | null;
  }) {
    const baseFields = {
      provider: generationParams.provider,
      model: generationParams.model,
      prompt: promptText,
      size: generationParams.size,
      quality: generationParams.quality,
      output_format: generationParams.outputFormat
    };

    if (generationMode === "text-to-image") {
      return fetch("/api/images/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(baseFields)
      });
    }

    const formData = new FormData();
    Object.entries(baseFields).forEach(([key, value]) => {
      formData.set(key, value);
    });
    if (generationReference) {
      formData.set("image", generationReference);
    }

    return fetch("/api/images/edits", {
      method: "POST",
      body: formData
    });
  }

  function editUserMessage(message: WorkbenchUserMessage) {
    setPrompt(message.prompt);
    setMode(message.mode);
    updateParams(message.params);

    if (message.mode === "image-edit") {
      setReferenceImage(null);
      setReferencePreviewUrl("");
      setEditNotice("参考图需要重新选择。");
    }
  }

  function regenerate(assistantMessageId: string) {
    const assistantMessage = messages.find(
      (message): message is WorkbenchAssistantMessage =>
        message.role === "assistant" && message.id === assistantMessageId
    );
    if (!assistantMessage || assistantMessage.status !== "success") {
      return;
    }

    void startGeneration({
      prompt: assistantMessage.prompt,
      mode: assistantMessage.mode,
      params: assistantMessage.params,
      referenceImage: null,
      clearComposer: false
    });
  }

  async function saveRecipe(title: string) {
    if (!saveTarget) {
      return;
    }

    setSaveStatus("saving");
    setSaveMessage("");

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "未命名配置",
          prompt: saveTarget.prompt,
          mode: saveTarget.mode,
          provider: saveTarget.params.provider,
          model: saveTarget.params.model,
          size: saveTarget.params.size,
          quality: saveTarget.params.quality,
          output_format: saveTarget.params.outputFormat,
          reference_mode: saveTarget.mode === "image-edit" ? "single-image" : null
        })
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        throw new Error(readSafeErrorMessage(undefined, payload.message));
      }

      setSaveStatus("saved");
      setSaveMessage("配置已保存。");
      await loadTemplateLibrary();
    } catch (error) {
      setSaveStatus("error");
      setSaveMessage(error instanceof Error ? error.message : "配置保存失败，请稍后再试。");
    }
  }

  function toggleMessageCollapse(messageId: string) {
    setMessages((current) =>
      current.map((message) =>
        message.role === "user" && message.id === messageId
          ? { ...message, collapsed: !message.collapsed }
          : message
      )
    );
  }

  return (
    <main className="flex h-dvh w-screen overflow-hidden bg-white text-slate-950">
      {sidebarOpen ? (
        <ChatSidebar
          className="hidden h-full w-[280px] shrink-0 flex-col bg-slate-950 px-4 py-4 text-slate-100 shadow-2xl md:flex"
          categories={library?.categories ?? []}
          config={config}
          onOpenTemplates={setTemplateModal}
          onParamChange={updateParams}
          onSettingsExpandedChange={setSettingsExpanded}
          params={params}
          provider={provider}
          settingsExpanded={settingsExpanded}
          usageText={usageText}
          userLabel={userLabel}
        />
      ) : null}

      {isMobileViewport && mobileDrawerOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="关闭侧边栏遮罩"
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setMobileDrawerOpen(false)}
            type="button"
          />
          <ChatSidebar
            className="relative z-10 flex h-full w-[min(84vw,320px)] flex-col bg-slate-950 px-4 py-4 text-slate-100 shadow-2xl"
            categories={library?.categories ?? []}
            config={config}
            onClose={() => setMobileDrawerOpen(false)}
            onOpenTemplates={(state) => {
              setTemplateModal(state);
              setMobileDrawerOpen(false);
            }}
            onParamChange={updateParams}
            onSettingsExpandedChange={setSettingsExpanded}
            params={params}
            provider={provider}
            settingsExpanded={settingsExpanded}
            usageText={usageText}
            userLabel={userLabel}
          />
        </div>
      ) : null}

      <section className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="flex min-h-16 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-3">
            <button
              className="min-h-11 rounded-lg px-3 font-semibold text-slate-700 hover:bg-slate-100"
              onClick={() => {
                if (isMobileViewport) {
                  setMobileDrawerOpen((current) => !current);
                  return;
                }
                setSidebarOpen((current) => !current);
              }}
              type="button"
            >
              {isMobileViewport
                ? mobileDrawerOpen
                  ? "隐藏侧边栏"
                  : "显示侧边栏"
                : sidebarOpen
                  ? "隐藏侧边栏"
                  : "显示侧边栏"}
            </button>
            <span className="text-sm font-bold text-slate-950">chat</span>
          </div>
          <button
            className="min-h-11 rounded-lg px-3 text-sm font-semibold text-slate-500 hover:bg-slate-100"
            type="button"
          >
            更多
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white">
          <MessageList
            messages={messages}
            onEditUserMessage={editUserMessage}
            onOpenTemplateCategory={(categoryId, title) =>
              setTemplateModal({ open: true, source: "category", categoryId, title })
            }
            onRegenerate={regenerate}
            onSaveRecipe={(messageId) => {
              setSaveTargetId(messageId);
              setSaveStatus("idle");
              setSaveMessage("");
            }}
            onToggleCollapse={toggleMessageCollapse}
          />
        </div>

        {editNotice ? (
          <p className="mx-auto mb-2 w-full max-w-4xl px-4 text-sm font-semibold text-amber-700">
            {editNotice}
          </p>
        ) : null}

        <PromptComposer
          generating={isGenerating}
          mode={mode}
          onModeChange={setMode}
          onPromptChange={setPrompt}
          onReferenceImageChange={handleReferenceImageChange}
          onSubmit={handleGenerate}
          prompt={prompt}
          referenceImage={referenceImage}
          referencePreviewUrl={referencePreviewUrl}
        />
      </section>

      <TemplateModal
        currentParams={params}
        library={library}
        modal={templateModal}
        onClose={() => setTemplateModal({ open: false })}
        onUseTemplate={useTemplate}
      />

      <SaveRecipeModal
        key={saveTarget?.id ?? "save-recipe-modal"}
        message={saveMessage}
        onClose={() => setSaveTargetId(null)}
        onSave={(title) => void saveRecipe(title)}
        open={Boolean(saveTarget)}
        prompt={saveTarget?.prompt ?? ""}
        saving={saveStatus === "saving"}
      />
    </main>
  );
}

function useIsMobileViewport() {
  return useSyncExternalStore(subscribeViewport, readIsMobileViewport, () => false);
}

function subscribeViewport(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

function readIsMobileViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.innerWidth < 768;
}
