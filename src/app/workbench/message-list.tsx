import { parseAspectRatio } from "./helpers";
import {
  CollapseIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  ExpandIcon,
  RefreshIcon,
  SaveIcon
} from "./icons";
import type { WorkbenchMessage, WorkbenchUserMessage } from "./types";

type MessageListProps = {
  messages: WorkbenchMessage[];
  onOpenTemplateCategory: (categoryId: string, title: string) => void;
  onEditUserMessage: (message: WorkbenchUserMessage) => void;
  onRegenerate: (messageId: string) => void;
  onSaveRecipe: (messageId: string) => void;
  onToggleCollapse: (messageId: string) => void;
};

export function MessageList({
  messages,
  onOpenTemplateCategory,
  onEditUserMessage,
  onRegenerate,
  onSaveRecipe,
  onToggleCollapse
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <section className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-5 text-center">
        <h1 className="m-0 text-3xl font-bold text-slate-950 sm:text-4xl">今天想生成什么？</h1>
        <p className="mt-3 text-base text-slate-500">选择模板，或直接描述画面。</p>
        <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
          <button
            className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            onClick={() => onOpenTemplateCategory("ecommerce-product", "电商产品模板")}
            type="button"
          >
            电商主图
          </button>
          <button
            className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            onClick={() => onOpenTemplateCategory("social-cover", "社媒封面模板")}
            type="button"
          >
            社媒封面
          </button>
          <button
            className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            onClick={() => onOpenTemplateCategory("image-edit", "参考图模板")}
            type="button"
          >
            参考图改造
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6">
      {messages.map((message) =>
        message.role === "user" ? (
          <UserMessage
            key={message.id}
            message={message}
            onEdit={() => onEditUserMessage(message)}
            onToggle={() => onToggleCollapse(message.id)}
          />
        ) : (
          <AssistantMessage
            key={message.id}
            message={message}
            onRegenerate={() => onRegenerate(message.id)}
            onSaveRecipe={() => onSaveRecipe(message.id)}
          />
        )
      )}
    </section>
  );
}

function UserMessage({
  message,
  onEdit,
  onToggle
}: {
  message: WorkbenchUserMessage;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const isLong = message.prompt.length > 140 || message.prompt.split("\n").length > 4;
  const text = message.collapsed && isLong ? `${message.prompt.slice(0, 140)}...` : message.prompt;

  return (
    <article className="ml-auto max-w-[82%] rounded-lg bg-slate-950 p-4 text-white">
      <p className="m-0 whitespace-pre-wrap break-words leading-7">{text}</p>
      {message.referencePreviewUrl ? (
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-white/10 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="参考图缩略图"
            className="h-14 w-14 rounded-md object-cover"
            src={message.referencePreviewUrl}
          />
          <span className="truncate text-sm text-slate-200">{message.referenceFileName}</span>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
          <span>{message.mode === "image-edit" ? "参考图" : "文生图"}</span>
          <span>{message.params.size}</span>
          <span>{message.params.quality}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {isLong ? (
            <button
              aria-label={message.collapsed ? "展开" : "收起"}
              className="grid h-10 w-10 place-items-center rounded-lg text-indigo-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-200"
              onClick={onToggle}
              type="button"
            >
              {message.collapsed ? <ExpandIcon className="h-4 w-4" /> : <CollapseIcon className="h-4 w-4" />}
            </button>
          ) : null}
          <button
            aria-label="编辑用户消息"
            className="grid h-10 w-10 place-items-center rounded-lg text-indigo-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-200"
            onClick={onEdit}
            type="button"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button
            aria-label="复制 Prompt"
            className="grid h-10 w-10 place-items-center rounded-lg text-indigo-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-200"
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
  onRegenerate,
  onSaveRecipe
}: {
  message: Extract<WorkbenchMessage, { role: "assistant" }>;
  onRegenerate: () => void;
  onSaveRecipe: () => void;
}) {
  const ratio = parseAspectRatio(message.params.size);

  if (message.status === "loading") {
    return (
      <article className="mr-auto w-full max-w-[720px]">
        <div
          className="grid place-items-center rounded-lg border border-slate-200 bg-slate-100 text-slate-500"
          style={{ aspectRatio: ratio }}
        >
          <span className="font-semibold">AI 正在生成图片...</span>
        </div>
      </article>
    );
  }

  if (message.status === "error") {
    return (
      <article className="mr-auto max-w-[720px] rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="m-0 font-bold text-red-800">{message.errorMessage}</p>
        <p className="m-0 mt-2 text-sm text-red-700">请调整 prompt 或稍后重试。</p>
      </article>
    );
  }

  return (
    <article className="group mr-auto w-full max-w-[720px]">
      <div
        className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
        style={{ aspectRatio: ratio }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="AI 生成图片" className="h-full w-full object-contain" src={message.image?.src} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          aria-label="下载"
          className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
          download={message.image?.filename}
          href={message.image?.src ?? "#"}
        >
          <DownloadIcon />
        </a>
        <button
          aria-label="重新生成"
          className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
          onClick={onRegenerate}
          type="button"
        >
          <RefreshIcon />
        </button>
        <button
          aria-label="复制 Prompt"
          className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
          onClick={() => void navigator.clipboard?.writeText(message.prompt)}
          type="button"
        >
          <CopyIcon />
        </button>
        <button
          aria-label="保存配置"
          className="grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
          onClick={onSaveRecipe}
          type="button"
        >
          <SaveIcon />
        </button>
      </div>
    </article>
  );
}
