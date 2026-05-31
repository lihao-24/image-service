import { useEffect, useState } from "react";
import {
  CollapseIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  ExpandIcon,
  RefreshIcon,
  SaveIcon,
  SparkIcon
} from "./icons";
import type { WorkbenchMessage, WorkbenchUserMessage } from "./types";

type ImagePreview = {
  alt: string;
  src: string;
};

type MessageListProps = {
  messages: WorkbenchMessage[];
  providerLabels: Record<string, string>;
  onOpenTemplateCategory: (categoryId: string, title: string) => void;
  onEditUserMessage: (message: WorkbenchUserMessage) => void;
  onEditAssistantMessage: (messageId: string) => void;
  onRegenerate: (messageId: string) => void;
  onSaveRecipe: (messageId: string) => void;
  onToggleCollapse: (messageId: string) => void;
};

export function MessageList({
  messages,
  providerLabels,
  onOpenTemplateCategory,
  onEditAssistantMessage,
  onEditUserMessage,
  onRegenerate,
  onSaveRecipe,
  onToggleCollapse
}: MessageListProps) {
  const [preview, setPreview] = useState<ImagePreview | null>(null);

  useEffect(() => {
    if (!preview) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreview(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [preview]);

  if (messages.length === 0) {
    return (
      <section className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-5 py-10 text-center">
        <h1 className="m-0 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
          今天想生成什么？
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-slate-500">
          直接描述画面，或从一个模板开始。生成结果只保留在当前会话中。
        </p>
        <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
          <button
            className="min-h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/40 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
            onClick={() => onOpenTemplateCategory("ecommerce-product", "电商产品模板")}
            type="button"
          >
            电商主图
          </button>
          <button
            className="min-h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/40 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
            onClick={() => onOpenTemplateCategory("ui-interface", "UI与界面模板")}
            type="button"
          >
            UI界面
          </button>
          <button
            className="min-h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/40 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
            onClick={() => onOpenTemplateCategory("image-edit", "图生图模板")}
            type="button"
          >
            图生图
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 max-sm:px-3">
      {messages.map((message) =>
        message.role === "user" ? (
          <UserMessage
            key={message.id}
            message={message}
            providerLabels={providerLabels}
            onEdit={() => onEditUserMessage(message)}
            onPreviewImage={(image) => setPreview(image)}
            onToggle={() => onToggleCollapse(message.id)}
          />
        ) : (
          <AssistantMessage
            key={message.id}
            message={message}
            providerLabels={providerLabels}
            onEdit={() => onEditAssistantMessage(message.id)}
            onPreviewImage={(image) => setPreview(image)}
            onRegenerate={() => onRegenerate(message.id)}
            onSaveRecipe={() => onSaveRecipe(message.id)}
          />
        )
      )}
      {preview ? (
        <ImagePreviewDialog image={preview} onClose={() => setPreview(null)} />
      ) : null}
    </section>
  );
}

function UserMessage({
  message,
  providerLabels,
  onEdit,
  onPreviewImage,
  onToggle
}: {
  message: WorkbenchUserMessage;
  providerLabels: Record<string, string>;
  onEdit: () => void;
  onPreviewImage: (image: ImagePreview) => void;
  onToggle: () => void;
}) {
  const isLong = message.prompt.length > 140 || message.prompt.split("\n").length > 4;
  const text = message.collapsed && isLong ? `${message.prompt.slice(0, 140)}...` : message.prompt;

  return (
    <article className="ml-auto max-w-[82%] rounded-2xl bg-slate-950 p-4 text-white shadow-sm max-sm:max-w-[92%]">
      <p className="m-0 whitespace-pre-wrap break-words text-[15px] leading-7">{text}</p>
      {message.referencePreviewUrl ? (
        <div className="mt-3 flex min-w-0 items-center gap-3 rounded-xl bg-white/10 p-2">
          <button
            aria-label="预览参考图"
            className="grid h-14 w-14 shrink-0 overflow-hidden rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-200"
            onClick={() =>
              onPreviewImage({
                alt: "参考图预览",
                src: message.referencePreviewUrl ?? ""
              })
            }
            type="button"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="参考图缩略图"
              className="h-full w-full object-cover"
              src={message.referencePreviewUrl}
            />
          </button>
          <span className="min-w-0 truncate text-sm text-slate-200" title={message.referenceFileName}>
            {message.referenceFileName}
          </span>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
          <span>{message.mode === "image-edit" ? "图生图" : "文生图"}</span>
          <span>{formatModelLabel(message.params.provider, message.params.model, providerLabels)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {isLong ? (
            <button
              aria-label={message.collapsed ? "展开" : "收起"}
              className="grid h-10 w-10 place-items-center rounded-lg text-indigo-200 transition hover:bg-white/10 active:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-200"
              onClick={onToggle}
              type="button"
            >
              {message.collapsed ? (
                <ExpandIcon className="h-4 w-4" />
              ) : (
                <CollapseIcon className="h-4 w-4" />
              )}
            </button>
          ) : null}
          <button
            aria-label="编辑用户消息"
            className="grid h-10 w-10 place-items-center rounded-lg text-indigo-200 transition hover:bg-white/10 active:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-200"
            onClick={onEdit}
            type="button"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button
            aria-label="复制 Prompt"
            className="grid h-10 w-10 place-items-center rounded-lg text-indigo-200 transition hover:bg-white/10 active:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-200"
            onClick={() => void navigator.clipboard?.writeText(message.prompt)}
            type="button"
          >
            <CopyIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function AssistantMessage({
  message,
  providerLabels,
  onEdit,
  onPreviewImage,
  onRegenerate,
  onSaveRecipe
}: {
  message: Extract<WorkbenchMessage, { role: "assistant" }>;
  providerLabels: Record<string, string>;
  onEdit: () => void;
  onPreviewImage: (image: ImagePreview) => void;
  onRegenerate: () => void;
  onSaveRecipe: () => void;
}) {
  const modelLabel = formatModelLabel(message.params.provider, message.params.model, providerLabels);
  const previewAspectRatio = "1 / 1";

  if (message.status === "loading") {
    return (
      <article className="mr-auto w-full max-w-[520px]">
        <div
          aria-label="图片生成占位状态"
          className="relative max-h-[min(42dvh,420px)] min-h-[220px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-slate-500 shadow-sm"
          style={{ aspectRatio: previewAspectRatio }}
        >
          <div className="absolute inset-0 animate-[focal-shimmer_1.4s_ease-in-out_infinite] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.72),transparent)]" />
          <div className="relative grid h-full place-items-center p-6">
            <div className="grid gap-3 text-center">
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white text-indigo-600 shadow-sm">
                <SparkIcon className="h-5 w-5" />
              </span>
              <span className="font-semibold">AI 正在生成图片...</span>
              <span className="text-sm text-slate-400">{modelLabel}</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (message.status === "error") {
    return (
      <article className="mr-auto max-w-[520px] rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
        <p className="m-0 font-bold text-red-900">{message.errorMessage}</p>
        <p className="m-0 mt-2 text-sm leading-6 text-red-700">请调整 prompt 或稍后重试。</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            aria-label="编辑失败请求"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-800 transition hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
            onClick={onEdit}
            type="button"
          >
            <EditIcon className="h-4 w-4" />
            编辑
          </button>
          <button
            aria-label="复制失败请求 Prompt"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-800 transition hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
            onClick={() => void navigator.clipboard?.writeText(message.prompt)}
            type="button"
          >
            <CopyIcon className="h-4 w-4" />
            复制 Prompt
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="group mr-auto w-full max-w-[520px]">
      <button
        aria-label="预览生成图片"
        className="block max-h-[min(42dvh,420px)] min-h-[220px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
        onClick={() => {
          if (message.image?.src) {
            onPreviewImage({ alt: "AI 生成图片预览", src: message.image.src });
          }
        }}
        style={{ aspectRatio: previewAspectRatio }}
        type="button"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="AI 生成图片" className="h-full w-full object-contain" src={message.image?.src} />
      </button>
      <div className="mt-3 flex flex-wrap gap-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
        <a
          aria-label="下载"
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
          download={message.image?.filename}
          href={message.image?.src ?? "#"}
        >
          <DownloadIcon />
        </a>
        <button
          aria-label="重新生成"
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
          onClick={onRegenerate}
          type="button"
        >
          <RefreshIcon />
        </button>
        <button
          aria-label="复制 Prompt"
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
          onClick={() => void navigator.clipboard?.writeText(message.prompt)}
          type="button"
        >
          <CopyIcon />
        </button>
        <button
          aria-label="保存配置"
          className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white transition hover:bg-slate-800 active:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
          onClick={onSaveRecipe}
          type="button"
        >
          <SaveIcon />
        </button>
      </div>
    </article>
  );
}

function formatModelLabel(providerId: string, modelId: string, providerLabels: Record<string, string>) {
  const providerLabel = providerLabels[providerId];
  return providerLabel ? `${providerLabel} · ${modelId}` : modelId;
}

function ImagePreviewDialog({
  image,
  onClose
}: {
  image: ImagePreview;
  onClose: () => void;
}) {
  return (
    <div
      aria-label="图片预览"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/85 p-4"
      role="dialog"
    >
      <button
        aria-label="关闭预览背景"
        className="absolute inset-0 cursor-zoom-out"
        onClick={onClose}
        type="button"
      />
      <div className="relative z-10 flex max-h-full w-full max-w-6xl flex-col gap-3">
        <div className="flex justify-end">
          <button
            aria-label="关闭预览"
            className="min-h-10 rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
            onClick={onClose}
            type="button"
          >
            关闭
          </button>
        </div>
        <div className="grid max-h-[calc(100dvh-6rem)] place-items-center overflow-hidden rounded-2xl bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={image.alt}
            className="max-h-[calc(100dvh-6rem)] max-w-full object-contain"
            src={image.src}
          />
        </div>
      </div>
    </div>
  );
}
