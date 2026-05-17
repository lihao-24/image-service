"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import type { PublicImageConfig } from "@/lib/config";

type GenerationMode = "text-to-image" | "image-edit";
type RequestStatus = "idle" | "loading" | "success" | "error";
type SaveStatus = "idle" | "saving" | "saved" | "error";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canGenerate = status !== "loading" && prompt.trim().length > 0;
  const canSave = saveStatus !== "saving" && prompt.trim().length > 0;
  const providerId = provider?.id ?? config.defaultProvider;

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

  return (
    <main className="workbench-shell">
      <header className="workbench-header">
        <div>
          <p className="eyebrow">image-service</p>
          <h1>生图工作台</h1>
        </div>
        <div className="account-bar">
          <span className="account-email">{userLabel}</span>
          <form action="/auth/logout" method="post">
            <button className="secondary-button compact-button" type="submit">
              退出
            </button>
          </form>
        </div>
      </header>

      <div className="workbench-layout">
        <section className="control-panel" aria-label="生图参数">
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

          <label className="field">
            <span>Prompt</span>
            <textarea
              maxLength={4000}
              onChange={(event) => setPrompt(event.target.value)}
              rows={8}
              value={prompt}
            />
          </label>

          {mode === "image-edit" ? (
            <label className="field">
              <span>参考图文件</span>
              <input
                accept="image/png,image/jpeg,image/webp"
                onChange={handleReferenceImageChange}
                ref={fileInputRef}
                type="file"
              />
              {referenceImage ? (
                <span className="field-hint">{referenceImage.name}</span>
              ) : null}
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

        <section className="preview-panel" aria-label="临时预览">
          <div className="preview-frame">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="当前生成图片预览" src={image.src} />
            ) : (
              <div className="empty-preview">等待生成</div>
            )}
          </div>
          <div className="preview-footer">
            <span>{usageText || "今日用量将在生成后显示"}</span>
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
