"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode
} from "react";
import type { PublicImageConfig } from "@/lib/config";
import {
  insertRenderedPrompt,
  renderPromptTemplate,
  type BuiltinPromptTemplate,
  type PromptTemplateVariable
} from "@/lib/prompt-templates";

type GenerationMode = "text-to-image" | "image-edit";
type RequestStatus = "idle" | "loading" | "success" | "error";
type SaveStatus = "idle" | "saving" | "saved" | "error";
type TemplateSourceView = "builtin" | "mine" | "favorites";
type MobilePanel = "templates" | "editor" | "preview";

type TemporaryImage = {
  src: string;
  outputFormat: string;
  filename: string;
};

type GenerateResponse = {
  image?: {
    b64_json?: string;
    output_format?: string;
  };
  meta?: {
    mode?: GenerationMode;
    daily_usage?: {
      generation_count?: number;
      limit?: number;
    };
  };
  message?: string;
};

type DailyUsage = NonNullable<NonNullable<GenerateResponse["meta"]>["daily_usage"]>;

type TemplateCategory = {
  id: string;
  name: string;
  description?: string;
};

type ApiRecommendedParams = {
  model: string;
  size: string;
  quality: string;
  output_format: string;
  reference_mode?: string | null;
};

type BuiltinTemplateRecord = {
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

type MineTemplateRecord = {
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
  quality: string;
  output_format: string;
  prompt: string;
  reference_mode: string | null;
  is_favorite: boolean;
};

type TemplateRecord = BuiltinTemplateRecord | MineTemplateRecord;

type TemplateLibrary = {
  categories: TemplateCategory[];
  templates: {
    builtin: BuiltinTemplateRecord[];
    mine: MineTemplateRecord[];
  };
  favorite_template_ids: string[];
};

type ImageWorkbenchProps = {
  config: PublicImageConfig;
  userLabel: string;
};

const SAFE_PROVIDER_ERROR_MESSAGE = "图片生成服务暂时不可用，请稍后再试。";
const PROVIDER_ERROR_CODES = new Set([
  "provider_request_failed",
  "provider_response_invalid",
  "provider_rate_limited",
  "provider_auth_failed"
]);

export default function ImageWorkbench({ config, userLabel }: ImageWorkbenchProps) {
  const provider = useMemo(
    () =>
      config.providers.find((item) => item.id === config.defaultProvider) ??
      config.providers[0],
    [config.defaultProvider, config.providers]
  );
  const [mode, setMode] = useState<GenerationMode>("text-to-image");
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [model, setModel] = useState(config.defaults.model);
  const [size, setSize] = useState(config.defaults.size);
  const [quality, setQuality] = useState(config.defaults.quality);
  const [outputFormat, setOutputFormat] = useState(config.defaults.outputFormat);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [image, setImage] = useState<TemporaryImage | null>(null);
  const [usageText, setUsageText] = useState("");
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [message, setMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [library, setLibrary] = useState<TemplateLibrary | null>(null);
  const [libraryStatus, setLibraryStatus] = useState<RequestStatus>("loading");
  const [libraryMessage, setLibraryMessage] = useState("");
  const [sourceView, setSourceView] = useState<TemplateSourceView>("builtin");
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("editor");
  const [isTemplatePanelOpen, setIsTemplatePanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [templateError, setTemplateError] = useState("");
  const [templateSuccess, setTemplateSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canGenerate = status !== "loading" && prompt.trim().length > 0;
  const canSave = saveStatus !== "saving" && prompt.trim().length > 0;
  const providerId = provider?.id ?? config.defaultProvider;
  const shouldShowTemplateBody = isTemplatePanelOpen || mobilePanel === "templates";

  const allTemplates = useMemo(
    () => [...(library?.templates.builtin ?? []), ...(library?.templates.mine ?? [])],
    [library]
  );

  const selectedTemplate = useMemo(
    () => allTemplates.find((template) => template.id === selectedTemplateId) ?? null,
    [allTemplates, selectedTemplateId]
  );

  const visibleTemplates = useMemo(() => {
    return allTemplates.filter((template) => {
      if (sourceView === "builtin" && template.source !== "builtin") {
        return false;
      }
      if (sourceView === "mine" && template.source !== "mine") {
        return false;
      }
      if (sourceView === "favorites" && !template.is_favorite) {
        return false;
      }
      if (
        categoryFilter !== "all" &&
        (template.source !== "builtin" || template.category !== categoryFilter)
      ) {
        return false;
      }
      return matchesTemplateQuery(template, searchQuery);
    });
  }, [allTemplates, categoryFilter, searchQuery, sourceView]);

  useEffect(() => {
    void loadTemplateLibrary();
  }, []);

  async function loadTemplateLibrary() {
    setLibraryStatus("loading");
    setLibraryMessage("");

    try {
      const response = await fetch("/api/prompt-templates");
      const payload = (await response.json().catch(() => ({}))) as TemplateLibrary & {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || "提示词库加载失败，请稍后再试。");
      }

      setLibrary(payload);
      setLibraryStatus("success");
      setLibraryMessage("");
    } catch (error) {
      setLibraryStatus("error");
      setLibraryMessage(error instanceof Error ? error.message : "提示词库加载失败，请稍后再试。");
    }
  }

  function selectTemplate(template: TemplateRecord) {
    setSelectedTemplateId(template.id);
    setTemplateError("");
    setTemplateSuccess("");
    setVariableValues(readInitialVariableValues(template));
    if (template.source === "mine") {
      setTitle(template.title);
    }
    setMobilePanel("editor");
  }

  async function toggleBuiltinFavorite(template: BuiltinTemplateRecord) {
    setTemplateError("");
    setTemplateSuccess("");
    const nextFavorite = !template.is_favorite;

    try {
      const response = await fetch(
        nextFavorite
          ? "/api/prompt-templates/favorites"
          : `/api/prompt-templates/favorites/${encodeURIComponent(template.id)}`,
        {
          method: nextFavorite ? "POST" : "DELETE",
          headers: nextFavorite ? { "Content-Type": "application/json" } : undefined,
          body: nextFavorite ? JSON.stringify({ template_id: template.id }) : undefined
        }
      );
      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "收藏更新失败，请稍后再试。");
      }

      setLibrary((current) => updateBuiltinFavorite(current, template.id, nextFavorite));
      setTemplateSuccess(nextFavorite ? "已加入收藏。" : "已取消收藏。");
    } catch (error) {
      setTemplateError(error instanceof Error ? error.message : "收藏更新失败，请稍后再试。");
    }
  }

  function applyTemplate(action: "replace" | "insert") {
    if (!selectedTemplate) {
      setTemplateError("请先选择一个模板。");
      return;
    }

    const rendered =
      selectedTemplate.source === "builtin"
        ? renderSelectedBuiltinTemplate(selectedTemplate, variableValues)
        : { ok: true as const, prompt: selectedTemplate.prompt };

    if (!rendered.ok) {
      setTemplateError(rendered.message);
      setTemplateSuccess("");
      return;
    }

    const nextPromptResult =
      action === "replace"
        ? { ok: true as const, prompt: rendered.prompt }
        : insertRenderedPrompt(prompt, rendered.prompt);

    if (!nextPromptResult.ok) {
      setTemplateError(nextPromptResult.message);
      setTemplateSuccess("");
      return;
    }

    setPrompt(nextPromptResult.prompt);
    applyTemplateParams(selectedTemplate);
    setTemplateError("");
    setTemplateSuccess(`已套用：${selectedTemplate.title}`);
  }

  function applyTemplateParams(template: TemplateRecord) {
    setMode(template.mode);
    if (template.source === "builtin") {
      setModelIfAllowed(template.recommended.model);
      setSizeIfAllowed(template.recommended.size);
      setQualityIfAllowed(template.recommended.quality);
      setOutputFormatIfAllowed(template.recommended.output_format);
      return;
    }

    setModelIfAllowed(template.model);
    setSizeIfAllowed(template.size);
    setQualityIfAllowed(template.quality);
    setOutputFormatIfAllowed(template.output_format);
  }

  function setModelIfAllowed(nextModel: string) {
    if (provider?.models.includes(nextModel)) {
      setModel(nextModel);
    }
  }

  function setSizeIfAllowed(nextSize: string) {
    if (config.options.sizes.includes(nextSize)) {
      setSize(nextSize);
    }
  }

  function setQualityIfAllowed(nextQuality: string) {
    if (config.options.qualities.includes(nextQuality)) {
      setQuality(nextQuality);
    }
  }

  function setOutputFormatIfAllowed(nextFormat: string) {
    if (config.options.outputFormats.includes(nextFormat)) {
      setOutputFormat(nextFormat);
    }
  }

  async function handleGenerate() {
    if (!prompt.trim()) {
      setStatus("error");
      setMessage("请输入 prompt。");
      return;
    }

    if (mode === "image-edit" && !referenceImage) {
      setStatus("error");
      setMessage("请先选择参考图。");
      return;
    }

    setStatus("loading");
    setMessage("生成中...");
    setSaveStatus((current) => (current === "saved" ? "idle" : current));
    setSaveMessage("");

    try {
      const response = await fetchGeneration();
      const payload = (await response.json().catch(() => ({}))) as GenerateResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(readSafeErrorMessage(payload.error, payload.message));
      }

      const b64Json = payload.image?.b64_json?.trim();
      const format = payload.image?.output_format || outputFormat;

      if (!b64Json) {
        throw new Error(SAFE_PROVIDER_ERROR_MESSAGE);
      }

      const nextImage = {
        src: `data:image/${format};base64,${b64Json}`,
        outputFormat: format,
        filename: `image-service-preview.${format === "jpeg" ? "jpg" : format}`
      };

      setImage(nextImage);
      setStatus("success");
      setMessage("生成成功，图片仅保留在当前浏览器页面。");
      setUsageText(formatUsage(payload.meta?.daily_usage));
      setMobilePanel("preview");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : SAFE_PROVIDER_ERROR_MESSAGE);
    }
  }

  async function fetchGeneration() {
    const baseFields = {
      provider: providerId,
      model,
      prompt: prompt.trim(),
      size,
      quality,
      output_format: outputFormat
    };

    if (mode === "text-to-image") {
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
    if (referenceImage) {
      formData.set("image", referenceImage);
    }

    return fetch("/api/images/edits", {
      method: "POST",
      body: formData
    });
  }

  async function handleSaveRecipe() {
    if (!prompt.trim()) {
      setSaveStatus("error");
      setSaveMessage("请输入 prompt 后再保存。");
      return;
    }

    setSaveStatus("saving");
    setSaveMessage("保存中...");

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "未命名配置",
          prompt: prompt.trim(),
          mode,
          provider: providerId,
          model,
          size,
          quality,
          output_format: outputFormat,
          reference_mode: mode === "image-edit" ? "single-image" : null
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

  function handleReferenceImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setReferenceImage(null);
      return;
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setReferenceImage(null);
      setStatus("error");
      setMessage("参考图仅支持 PNG、JPEG 或 WebP。");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setReferenceImage(file);
    setStatus((current) => (current === "error" ? "idle" : current));
    setMessage("");
  }

  function toggleTemplatePanel() {
    if (mobilePanel === "templates" && !isTemplatePanelOpen) {
      setMobilePanel("editor");
      return;
    }

    setIsTemplatePanelOpen((current) => !current);
  }

  return (
    <main className="workbench-shell">
      <header className="workbench-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            IS
          </span>
          <div>
            <p className="eyebrow">image-service</p>
            <p className="workbench-title">生图工作台</p>
          </div>
        </div>
        <div className="account-bar">
          {usageText ? <span className="usage-pill">{usageText}</span> : null}
          <span className="account-email">{userLabel}</span>
          <form action="/auth/logout" method="post">
            <button className="secondary-button compact-button" type="submit">
              退出
            </button>
          </form>
        </div>
      </header>

      <nav className="mobile-panel-switch" aria-label="工作台分区">
        {[
          ["templates", "模板"],
          ["editor", "编辑"],
          ["preview", "预览"]
        ].map(([panel, label]) => (
          <button
            aria-pressed={mobilePanel === panel}
            className={mobilePanel === panel ? "is-active" : ""}
            key={panel}
            onClick={() => setMobilePanel(panel as MobilePanel)}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="workbench-layout">
        <section
          aria-label="提示词库"
          className={[
            "template-panel",
            shouldShowTemplateBody ? "is-expanded" : "is-collapsed",
            mobilePanel === "templates" ? "is-mobile-active" : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="template-panel-top">
            <button
              aria-expanded={shouldShowTemplateBody}
              aria-label={shouldShowTemplateBody ? "收起提示词库" : "展开提示词库"}
              className="template-toggle-button"
              onClick={toggleTemplatePanel}
              type="button"
            >
              <span aria-hidden="true">{shouldShowTemplateBody ? "‹" : "›"}</span>
              <span>{shouldShowTemplateBody ? "收起" : "模板"}</span>
            </button>
            {shouldShowTemplateBody ? (
              <SectionHeader title="提示词库" meta={`${visibleTemplates.length} 个模板`} />
            ) : (
              <div className="template-rail-summary">
                <strong>{visibleTemplates.length}</strong>
                <span>模板</span>
              </div>
            )}
          </div>

          {shouldShowTemplateBody ? (
            <div className="template-panel-body">
              <div className="source-switch" role="group" aria-label="模板来源">
                {[
                  ["builtin", "内置模板"],
                  ["mine", "我的模板"],
                  ["favorites", "收藏"]
                ].map(([source, label]) => (
                  <button
                    aria-pressed={sourceView === source}
                    className={sourceView === source ? "is-active" : ""}
                    key={source}
                    onClick={() => setSourceView(source as TemplateSourceView)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <label className="field compact-field">
                <span>搜索模板</span>
                <input
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="搜索标题、标签或 prompt"
                  value={searchQuery}
                />
              </label>

              <label className="field compact-field">
                <span>分类筛选</span>
                <select
                  disabled={sourceView === "mine"}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  value={categoryFilter}
                >
                  <option value="all">全部分类</option>
                  {library?.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              {libraryStatus === "loading" ? (
                <p className="empty-state">提示词库加载中...</p>
              ) : null}
              {libraryStatus === "error" ? (
                <p className="status-message error">{libraryMessage}</p>
              ) : null}
              {libraryStatus === "success" && visibleTemplates.length === 0 ? (
                <p className="empty-state">暂无匹配模板，请调整搜索或筛选。</p>
              ) : null}

              <ul className="template-list" aria-label="模板列表">
                {visibleTemplates.map((template) => (
                  <li className="template-item" key={template.id}>
                    <button
                      aria-label={`选择模板 ${template.title}`}
                      className={
                        selectedTemplateId === template.id
                          ? "template-select is-selected"
                          : "template-select"
                      }
                      onClick={() => selectTemplate(template)}
                      type="button"
                    >
                      <span className="template-title">{template.title}</span>
                      <span className="template-meta">
                        {template.category_name} ·{" "}
                        {template.mode === "image-edit" ? "参考图" : "文生图"}
                      </span>
                      <span className="template-tags">{template.tags.slice(0, 3).join(" / ")}</span>
                    </button>
                    {template.source === "builtin" ? (
                      <button
                        aria-label={`${template.is_favorite ? "取消收藏" : "收藏"} ${template.title}`}
                        className={
                          template.is_favorite ? "favorite-button is-favorite" : "favorite-button"
                        }
                        onClick={() => void toggleBuiltinFavorite(template)}
                        type="button"
                      >
                        {template.is_favorite ? "已收藏" : "收藏"}
                      </button>
                    ) : (
                      <span className="mine-badge">{template.is_favorite ? "收藏" : "我的"}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section
          aria-label="Prompt 编辑和参数"
          className={mobilePanel === "editor" ? "control-panel is-mobile-active" : "control-panel"}
        >
          <SectionHeader
            title="编辑"
            meta={selectedTemplate ? `已选择：${selectedTemplate.title}` : "未选择模板"}
          />

          <div className="mode-switch" role="radiogroup" aria-label="生成模式">
            <label>
              <input
                checked={mode === "text-to-image"}
                name="generation-mode"
                onChange={() => setMode("text-to-image")}
                type="radio"
              />
              文生图
            </label>
            <label>
              <input
                checked={mode === "image-edit"}
                name="generation-mode"
                onChange={() => setMode("image-edit")}
                type="radio"
              />
              参考图
            </label>
          </div>

          <label className="field prompt-field">
            <span>Prompt</span>
            <textarea
              aria-label="Prompt"
              maxLength={4000}
              onChange={(event) => setPrompt(event.target.value)}
              rows={9}
              value={prompt}
            />
            <span className="field-hint">{prompt.length}/4000 字</span>
          </label>

          <div className="template-detail" aria-label="模板变量">
            <div className="template-detail-head">
              <h2>模板变量</h2>
              <span>{selectedTemplate ? selectedTemplate.title : "先从左侧选择模板"}</span>
            </div>
            {selectedTemplate ? (
              <>
                <p className="template-prompt-preview">{selectedTemplate.prompt}</p>
                {selectedTemplate.source === "builtin" && selectedTemplate.variables.length > 0 ? (
                  <div className="variable-grid">
                    {selectedTemplate.variables.map((variable) => (
                      <label className="field compact-field" key={variable.key}>
                        <span>
                          {variable.label}
                          {variable.required ? " *" : ""}
                        </span>
                        <input
                          aria-label={variable.label}
                          maxLength={variable.maxLength}
                          onChange={(event) =>
                            setVariableValues((current) => ({
                              ...current,
                              [variable.key]: event.target.value
                            }))
                          }
                          placeholder={variable.placeholder}
                          value={variableValues[variable.key] ?? ""}
                        />
                        {variable.helperText ? (
                          <span className="field-hint">{variable.helperText}</span>
                        ) : null}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state compact-empty">我的模板会直接套用保存时的 prompt。</p>
                )}
                <div className="template-actions">
                  <button
                    className="secondary-button"
                    onClick={() => applyTemplate("replace")}
                    type="button"
                  >
                    替换当前 prompt
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => applyTemplate("insert")}
                    type="button"
                  >
                    插入到当前 prompt
                  </button>
                </div>
              </>
            ) : (
              <p className="empty-state compact-empty">
                点击模板只会填入 prompt 和推荐参数，不会生成图片或保存配置。
              </p>
            )}
            {templateError ? <p className="status-message error">{templateError}</p> : null}
            {templateSuccess ? <p className="status-message saved">{templateSuccess}</p> : null}
          </div>

          {mode === "image-edit" ? (
            <label className="field">
              <span>参考图文件</span>
              <input
                aria-label="参考图文件"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleReferenceImageChange}
                ref={fileInputRef}
                type="file"
              />
              {referenceImage ? (
                <span className="field-hint">{referenceImage.name}</span>
              ) : (
                <span className="field-hint">参考图只在本次请求中使用，不会持久化保存。</span>
              )}
            </label>
          ) : null}

          <div className="parameter-grid">
            <label className="field">
              <span>Model</span>
              <select onChange={(event) => setModel(event.target.value)} value={model}>
                {provider?.models.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>尺寸</span>
              <select onChange={(event) => setSize(event.target.value)} value={size}>
                {config.options.sizes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>质量</span>
              <select onChange={(event) => setQuality(event.target.value)} value={quality}>
                {config.options.qualities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>输出格式</span>
              <select
                onChange={(event) => setOutputFormat(event.target.value)}
                value={outputFormat}
              >
                {config.options.outputFormats.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span>配置名称</span>
            <input
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
          </label>

          <div className="action-row">
            <button
              className="primary-button"
              disabled={!canGenerate}
              onClick={handleGenerate}
              type="button"
            >
              {status === "loading" ? "生成中..." : "生成图片"}
            </button>
            <button
              className="secondary-button"
              disabled={!canSave}
              onClick={handleSaveRecipe}
              type="button"
            >
              {saveStatus === "saving" ? "保存中..." : "保存配置"}
            </button>
          </div>

          {message ? (
            <p className={status === "error" ? "status-message error" : "status-message"}>
              {message}
            </p>
          ) : null}
          {saveMessage ? (
            <p
              className={
                saveStatus === "error" ? "status-message error" : "status-message saved"
              }
            >
              {saveMessage}
            </p>
          ) : null}
        </section>

        <section
          aria-label="临时预览"
          className={mobilePanel === "preview" ? "preview-panel is-mobile-active" : "preview-panel"}
        >
          <SectionHeader title="预览" meta={usageText || "今日用量将在生成后显示"} />
          <div className="preview-frame">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="当前生成图片预览" src={image.src} />
            ) : (
              <div className="empty-preview">等待生成</div>
            )}
          </div>
          <div className="preview-footer">
            <span>图片只在当前页面临时展示，不会写入模板、日志或浏览器存储。</span>
            <a
              aria-disabled={!image}
              className={image ? "download-link" : "download-link disabled"}
              download={image?.filename}
              href={image?.src ?? "#"}
              onClick={(event) => {
                if (!image) {
                  event.preventDefault();
                }
              }}
            >
              下载图片
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionHeader({ title, meta }: { title: string; meta: ReactNode }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      <span>{meta}</span>
    </div>
  );
}

function renderSelectedBuiltinTemplate(
  template: BuiltinTemplateRecord,
  values: Record<string, string>
) {
  return renderPromptTemplate(
    {
      id: template.id,
      title: template.title,
      category: template.category,
      tags: template.tags,
      mode: template.mode,
      recommended: {
        model: "gpt-image-2",
        size: template.recommended.size,
        quality: template.recommended.quality,
        outputFormat: template.recommended.output_format,
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
    } as BuiltinPromptTemplate,
    values
  );
}

function readInitialVariableValues(template: TemplateRecord) {
  if (template.source === "mine") {
    return {};
  }

  return Object.fromEntries(
    template.variables.map((variable) => [variable.key, variable.defaultValue ?? ""])
  );
}

function updateBuiltinFavorite(
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

function matchesTemplateQuery(template: TemplateRecord, query: string) {
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

function formatUsage(usage?: DailyUsage): string {
  if (!usage?.generation_count || !usage.limit) {
    return "";
  }

  return `今日用量 ${usage.generation_count}/${usage.limit}`;
}

function readSafeErrorMessage(errorCode?: string, message?: string): string {
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

function containsSensitiveDetails(message: string): boolean {
  return /(https?:\/\/|api[_-]?key|sk-[a-z0-9_-]+|stack trace|baseUrl|apiKeyEnv)/i.test(
    message
  );
}
