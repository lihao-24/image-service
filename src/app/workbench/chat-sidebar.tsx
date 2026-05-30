import Image from "next/image";
import { useState } from "react";
import type { PublicImageConfig, PublicProviderConfig } from "@/lib/config";
import type {
  GenerationMode,
  GenerationParamsSnapshot,
  MineTemplateRecord,
  TemplateCategory,
  TemplateModalState
} from "./types";
import { usagePercent } from "./helpers";
import { XIcon } from "./icons";

type ChatSidebarProps = {
  className?: string;
  config: PublicImageConfig;
  provider?: PublicProviderConfig;
  mode: GenerationMode;
  params: GenerationParamsSnapshot;
  userLabel: string;
  usageText: string;
  onParamChange: (params: Partial<GenerationParamsSnapshot>) => void;
  categories: TemplateCategory[];
  mineTemplates: MineTemplateRecord[];
  onOpenTemplates: (state: Extract<TemplateModalState, { open: true }>) => void;
  onClose?: () => void;
};

type TemplateListView = "default" | "mine";

export function ChatSidebar({
  className = "flex h-full w-[280px] shrink-0 flex-col overflow-hidden bg-slate-950 px-4 py-4 text-slate-100 shadow-2xl",
  config,
  provider,
  mode,
  params,
  userLabel,
  usageText,
  onParamChange,
  categories,
  mineTemplates,
  onOpenTemplates,
  onClose
}: ChatSidebarProps) {
  const [templateListView, setTemplateListView] = useState<TemplateListView>("default");
  const [usageOpen, setUsageOpen] = useState(false);
  const modelOptions =
    provider?.models.filter((item) =>
      mode === "image-edit" ? item.supportsImageToImage : item.supportsTextToImage
    ) ?? [];

  return (
    <aside
      aria-label="工作台侧边栏"
      className={className}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            alt="Focal"
            className="h-12 w-12 rounded-xl"
            height={48}
            priority
            src="/focal-icon-light.png"
            width={48}
          />
          <div className="min-w-0">
            <p className="m-0 text-sm font-bold text-white">Focal</p>
            <p className="m-0 text-xs text-slate-400">AI 生图工作台</p>
          </div>
        </div>
        {onClose ? (
          <button
            aria-label="关闭侧边栏面板"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-300 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
            onClick={onClose}
            type="button"
          >
            <XIcon />
          </button>
        ) : null}
      </div>

      <section className="shrink-0 rounded-xl border border-white/10 bg-white/[0.04] p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="m-0 text-sm font-semibold text-white">设置</h2>
        </div>

        <div className="grid gap-2.5">
          <label className="grid gap-1.5 text-sm font-semibold text-slate-300">
            <span>供应商</span>
            <select
              aria-label="供应商"
              className="min-h-10 min-w-0 w-full max-w-full truncate rounded-lg border border-white/10 bg-slate-900 px-3 text-sm text-white focus:border-indigo-300 focus:outline-none"
              onChange={(event) => onParamChange({ provider: event.target.value })}
              value={params.provider}
            >
              {config.providers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-semibold text-slate-300">
            <span>模型</span>
            <select
              aria-label="模型"
              className="min-h-10 min-w-0 w-full max-w-full truncate rounded-lg border border-white/10 bg-slate-900 px-3 text-sm text-white focus:border-indigo-300 focus:outline-none"
              onChange={(event) => onParamChange({ model: event.target.value })}
              value={params.model}
            >
              {modelOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section
        aria-label="模板"
        className="mt-4 flex min-h-[220px] min-w-0 flex-1 flex-col overflow-hidden"
      >
        <h2 className="mb-2 min-w-0 truncate text-sm font-semibold text-slate-300">模板</h2>
        <div className="mb-2 grid min-w-0 shrink-0 grid-cols-2 gap-2">
          <button
            aria-pressed={templateListView === "default"}
            className={`min-h-9 min-w-0 rounded-lg px-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300 ${
              templateListView === "default"
                ? "bg-white text-slate-950"
                : "bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white"
            }`}
            onClick={() => setTemplateListView("default")}
            type="button"
          >
            默认
          </button>
          <button
            aria-pressed={templateListView === "mine"}
            className={`min-h-9 min-w-0 rounded-lg px-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300 ${
              templateListView === "mine"
                ? "bg-white text-slate-950"
                : "bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white"
            }`}
            onClick={() => setTemplateListView("mine")}
            type="button"
          >
            我的
          </button>
        </div>
        <div className="template-scrollbar min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto pr-1" data-template-scroll>
          {templateListView === "default" ? (
            <div className="grid min-w-0 gap-2">
              {categories.map((category) => (
                <button
                  aria-label={`打开模板分类 ${category.name}`}
                  className="min-h-10 min-w-0 w-full overflow-hidden rounded-lg px-2.5 py-1.5 text-left text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
                  key={category.id}
                  onClick={() =>
                    onOpenTemplates({
                      open: true,
                      source: "category",
                      title: `${category.name}模板`,
                      categoryId: category.id
                    })
                  }
                  type="button"
                >
                  <span className="block min-w-0 truncate overflow-hidden">{category.name}</span>
                  {category.description ? (
                    <span className="block min-w-0 truncate overflow-hidden text-xs font-normal text-slate-500">
                      {category.description}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid min-w-0 gap-2">
              {mineTemplates.length === 0 ? (
                <p className="m-0 min-w-0 overflow-hidden rounded-lg border border-dashed border-white/10 bg-white/5 px-3 py-3 text-sm leading-5 text-slate-400">
                  暂无我的模板
                </p>
              ) : null}
              {mineTemplates.map((template) => (
                <button
                  aria-label={`打开我的模板 ${template.title}`}
                  className="min-h-10 min-w-0 w-full overflow-hidden rounded-lg px-2.5 py-1.5 text-left text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
                  key={template.id}
                  onClick={() =>
                    onOpenTemplates({
                      open: true,
                      source: "mine",
                      title: "我的模板"
                    })
                  }
                  type="button"
                >
                  <span className="block min-w-0 truncate overflow-hidden">{template.title}</span>
                  <span className="block min-w-0 truncate overflow-hidden text-xs font-normal text-slate-500">
                    {template.provider ? `${template.provider} · ` : ""}
                    {template.model}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-4 shrink-0 border-t border-white/10 pt-3">
        <p className="m-0 truncate text-sm font-semibold text-white">{userLabel}</p>
        <button
          aria-label="查看今日用量"
          className="mt-2 block w-full rounded-lg p-0 text-left transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
          onClick={() => setUsageOpen(true)}
          type="button"
        >
          <span className="block h-2 overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full rounded-full bg-indigo-400"
              style={{ width: `${usagePercent(usageText)}%` }}
            />
          </span>
          <span className="mt-2 block truncate text-xs text-slate-400">
            {usageText || "今日尚未生成"}
          </span>
        </button>
        <form action="/auth/logout" method="post">
          <button
            className="mt-3 min-h-9 w-full rounded-lg border border-white/10 px-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
            type="submit"
          >
            退出
          </button>
        </form>
      </section>

      {usageOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-4">
          <div
            aria-label="今日用量"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950 p-5 text-slate-100 shadow-2xl"
            role="dialog"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="m-0 text-base font-bold text-white">今日用量</h2>
              <button
                className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
                onClick={() => setUsageOpen(false)}
                type="button"
              >
                关闭
              </button>
            </div>
            <p className="m-0 mt-4 text-sm font-semibold text-white">
              {usageText || "今日尚未生成"}
            </p>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-400">
              GPT Image 系列当前仅统计用量，不做每日额度拦截。
            </p>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
