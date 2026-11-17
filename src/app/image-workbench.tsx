"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore, useState } from "react";
import type { PublicImageConfig } from "@/lib/config";
import { ChatSidebar } from "./workbench/chat-sidebar";
import {
  compressReferenceImageForUpload,
  createId,
  formatUsage,
  readSafeErrorMessage,
  SAFE_PROVIDER_ERROR_MESSAGE
} from "./workbench/helpers";
import { MoreIcon, PanelIcon } from "./workbench/icons";
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
    url?: string;
    download_url?: string;
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
  const [params, setParams] = useState<GenerationParamsSnapshot>({
    provider: readInitialProviderId(config),
    model: readInitialModelId(config)
  });
  const provider = useMemo(
    () => findProvider(config, params.provider) ?? config.providers[0],
    [config, params.provider]
  );
  const providerLabels = useMemo(
    () => Object.fromEntries(config.providers.map((item) => [item.id, item.label])),
    [config.providers]
  );
  const [mode, setMode] = useState<GenerationMode>("text-to-image");
  const [prompt, setPrompt] = useState("");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referencePreviewUrl, setReferencePreviewUrl] = useState("");
  const composerPreviewUrlRef = useRef("");
  const messagePreviewUrlsRef = useRef(new Set<string>());
  const [messages, setMessages] = useState<WorkbenchMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [templateModal, setTemplateModal] = useState<TemplateModalState>({ open: false });
  const [library, setLibrary] = useState<TemplateLibrary | null>(null);
  const [usageText, setUsageText] = useState("");
  const [editNotice, setEditNotice] = useState("");
  const [saveTargetId, setSaveTargetId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    void loadTemplateLibrary();
    void loadUsage();
  }, []);

  useEffect(() => {
    const messagePreviewUrls = messagePreviewUrlsRef.current;
    return () => {
      if (composerPreviewUrlRef.current) {
        URL.revokeObjectURL(composerPreviewUrlRef.current);
      }
      for (const url of messagePreviewUrls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

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

  async function loadUsage() {
    try {
      const response = await fetch("/api/usage");
      const payload = (await response.json().catch(() => ({}))) as { usage?: DailyUsage };

      if (response.ok) {
        setUsageText(formatUsage(payload.usage));
      }
    } catch {
      setUsageText("");
    }
  }

  function updateParams(
    nextParams: Partial<GenerationParamsSnapshot>,
    targetMode: GenerationMode = mode
  ) {
    setParams((current) => {
      if (nextParams.provider && nextParams.provider !== current.provider) {
        const nextProvider = findProvider(config, nextParams.provider);
        if (!nextProvider) {
          const currentProvider = findProvider(config, current.provider);
          return {
            provider: current.provider,
            model: readFirstSupportedModelId(currentProvider, targetMode) ?? current.model
          };
        }
        const requestedModel = nextParams.model
          ? findModel(nextProvider, nextParams.model)?.id
          : undefined;
        return {
          provider: nextProvider.id,
          model:
            readSupportedModelId(nextProvider, requestedModel, targetMode) ??
            readFirstSupportedModelId(nextProvider, targetMode) ??
            current.model
        };
      }

      const nextProvider = findProvider(config, current.provider);
      const requestedModel = nextParams.model ?? current.model;
      return {
        provider: current.provider,
        model:
          readSupportedModelId(nextProvider, requestedModel, targetMode) ??
          readFirstSupportedModelId(nextProvider, targetMode) ??
          current.model
      };
    });
  }

  function useTemplate(payload: {
    prompt: string;
    mode: GenerationMode;
    params: GenerationParamsSnapshot;
  }) {
    setPrompt(payload.prompt);
    setMode(payload.mode);
    updateParams(payload.params, payload.mode);
  }

  function handleModeChange(nextMode: GenerationMode) {
    setMode(nextMode);
    updateParams({}, nextMode);
  }

  function handleReferenceImageChange(file: File | null) {
    if (composerPreviewUrlRef.current) {
      URL.revokeObjectURL(composerPreviewUrlRef.current);
      composerPreviewUrlRef.current = "";
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
    const nextPreviewUrl = URL.createObjectURL(file);
    composerPreviewUrlRef.current = nextPreviewUrl;
    setReferencePreviewUrl(nextPreviewUrl);
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
    const messageReferencePreviewUrl =
      generationMode === "image-edit" && generationReference ? generationReferencePreviewUrl : undefined;
    if (messageReferencePreviewUrl) {
      messagePreviewUrlsRef.current.add(messageReferencePreviewUrl);
    }
    const userMessage: WorkbenchUserMessage = {
      id: userMessageId,
      role: "user",
      prompt: promptText,
      mode: generationMode,
      params: generationParams,
      referencePreviewUrl: messageReferencePreviewUrl,
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
      if (
        generationReferencePreviewUrl &&
        composerPreviewUrlRef.current === generationReferencePreviewUrl
      ) {
        composerPreviewUrlRef.current = "";
      }
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
      const imageUrl = payload.image?.url?.trim();
      const format = payload.image?.output_format || "png";

      if (!imageUrl && !b64Json) {
        throw new Error(SAFE_PROVIDER_ERROR_MESSAGE);
      }

      const successMessage: WorkbenchAssistantMessage = {
        ...loadingMessage,
        status: "success",
        image: {
          src: imageUrl || `data:image/${format};base64,${b64Json}`,
          downloadSrc: imageUrl ? payload.image?.download_url || imageUrl : undefined,
          outputFormat: format,
          filename: `focal-preview.${format === "jpeg" ? "jpg" : format}`
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
      prompt: promptText
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
      formData.set("image", await compressReferenceImageForUpload(generationReference));
    }

    return fetch("/api/images/edits", {
      method: "POST",
      body: formData
    });
  }

  function editUserMessage(message: WorkbenchUserMessage) {
    setPrompt(message.prompt);
    setMode(message.mode);
    updateParams(message.params, message.mode);

    if (message.mode === "image-edit") {
      setReferenceImage(null);
      if (composerPreviewUrlRef.current) {
        URL.revokeObjectURL(composerPreviewUrlRef.current);
        composerPreviewUrlRef.current = "";
      }
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

  function editAssistantMessage(assistantMessageId: string) {
    const assistantMessage = messages.find(
      (message): message is WorkbenchAssistantMessage =>
        message.role === "assistant" && message.id === assistantMessageId
    );
    if (!assistantMessage) {
      return;
    }

    setPrompt(assistantMessage.prompt);
    setMode(assistantMessage.mode);
    updateParams(assistantMessage.params, assistantMessage.mode);
    if (assistantMessage.mode === "image-edit") {
      setReferenceImage(null);
      if (composerPreviewUrlRef.current) {
        URL.revokeObjectURL(composerPreviewUrlRef.current);
        composerPreviewUrlRef.current = "";
      }
      setReferencePreviewUrl("");
      setEditNotice("参考图需要重新选择。");
    }
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
    <main className="flex h-dvh w-screen overflow-hidden bg-slate-50 text-slate-950">
      {!isMobileViewport && sidebarOpen ? (
        <ChatSidebar
          className="hidden h-full w-[280px] shrink-0 flex-col overflow-hidden bg-slate-950 px-4 py-4 text-slate-100 shadow-2xl md:flex"
          categories={library?.categories ?? []}
          config={config}
          mineTemplates={library?.templates.mine ?? []}
          mode={mode}
          onOpenTemplates={setTemplateModal}
          onParamChange={updateParams}
          params={params}
          provider={provider}
          usageText={usageText}
          userLabel={userLabel}
        />
      ) : null}

      {isMobileViewport && mobileDrawerOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="关闭侧边栏遮罩"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            onClick={() => setMobileDrawerOpen(false)}
            type="button"
          />
          <ChatSidebar
            className="relative z-10 flex h-full w-[min(84vw,320px)] flex-col overflow-hidden bg-slate-950 px-4 py-4 text-slate-100 shadow-2xl"
            categories={library?.categories ?? []}
            config={config}
            mineTemplates={library?.templates.mine ?? []}
            mode={mode}
            onClose={() => setMobileDrawerOpen(false)}
            onOpenTemplates={(state) => {
              setTemplateModal(state);
              setMobileDrawerOpen(false);
            }}
            onParamChange={updateParams}
            params={params}
            provider={provider}
            usageText={usageText}
            userLabel={userLabel}
          />
        </div>
      ) : null}

      <section className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="flex min-h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              aria-label={
                isMobileViewport
                  ? mobileDrawerOpen
                    ? "隐藏侧边栏"
                    : "显示侧边栏"
                  : sidebarOpen
                    ? "隐藏侧边栏"
                    : "显示侧边栏"
              }
              className="grid h-10 w-10 place-items-center rounded-lg text-slate-700 transition hover:bg-slate-100 active:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
              onClick={() => {
                if (isMobileViewport) {
                  setMobileDrawerOpen((current) => !current);
                  return;
                }
                setSidebarOpen((current) => !current);
              }}
              type="button"
            >
              <PanelIcon />
            </button>
            <span className="text-sm font-bold text-slate-950">chat</span>
          </div>
          <button
            aria-label="更多"
            className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 active:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
            type="button"
          >
            <MoreIcon />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white">
          <MessageList
            messages={messages}
            providerLabels={providerLabels}
            onEditAssistantMessage={editAssistantMessage}
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
          onModeChange={handleModeChange}
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

function findProvider(config: PublicImageConfig, providerId: string) {
  return config.providers.find((item) => item.id === providerId);
}

function findModel(provider: ReturnType<typeof findProvider>, modelId: string) {
  return provider?.models.find((item) => item.id === modelId);
}

function readSupportedModelId(
  provider: ReturnType<typeof findProvider>,
  modelId: string | undefined,
  mode: GenerationMode
) {
  const model = modelId ? findModel(provider, modelId) : undefined;
  if (!model) {
    return undefined;
  }

  if (mode === "image-edit") {
    return model.supportsImageToImage ? model.id : undefined;
  }

  return model.supportsTextToImage ? model.id : undefined;
}

function readInitialProviderId(config: PublicImageConfig) {
  return findProvider(config, config.defaultProviderId)?.id ?? config.providers[0]?.id ?? "";
}

function readInitialModelId(config: PublicImageConfig) {
  const provider = findProvider(config, readInitialProviderId(config));
  return findModel(provider, config.defaultModelId)?.id ?? provider?.models[0]?.id ?? "";
}

function readFirstSupportedModelId(
  provider: ReturnType<typeof findProvider>,
  mode: GenerationMode
) {
  return provider?.models.find((item) =>
    mode === "image-edit" ? item.supportsImageToImage : item.supportsTextToImage
  )?.id;
}
