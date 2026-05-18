import { useState } from "react";
import type { PublicImageConfig, PublicProviderConfig } from "@/lib/config";
import type {
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
  params: GenerationParamsSnapshot;
  userLabel: string;
  usageText: string;
  settingsExpanded: boolean;
  onSettingsExpandedChange: (expanded: boolean) => void;
  onParamChange: (params: Partial<GenerationParamsSnapshot>) => void;
  categories: TemplateCategory[];
  mineTemplates: MineTemplateRecord[];
  onOpenTemplates: (state: Extract<TemplateModalState, { open: true }>) => void;
  onClose?: () => void;
};

type TemplateListView = "default" | "mine";

export function ChatSidebar({
  className = "flex h-full w-[280px] shrink-0 flex-col bg-slate-950 px-4 py-4 text-slate-100 shadow-2xl",
  config,
  provider,
  params,
  userLabel,
  usageText,
  settingsExpanded,
  onSettingsExpandedChange,
  onParamChange,
  categories,
  mineTemplates,
  onOpenTemplates,
  onClose
}: ChatSidebarProps) {
  const [templateListView, setTemplateListView] = useState<TemplateListView>("default");

  return (
    <aside
      aria-label="工作台侧边栏"
      className={className}
    >
      <div className="mb-7 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-black text-slate-950">
            IS
          </span>
          <div className="min-w-0">
            <p className="m-0 text-sm font-bold text-white">image-service</p>
            <p className="m-0 text-xs text-slate-400">AI 生图工作台</p>
          </div>
        </div>
        {onClose ? (
          <button
            aria-label="关闭侧边栏面板"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-slate-300 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
            onClick={onClose}
            type="button"
          >
            <XIcon />
          </button>
        ) : null}
      </div>

      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="m-0 text-sm font-semibold text-white">设置</h2>
          <button
            className="min-h-11 rounded-lg px-3 text-sm font-semibold text-slate-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
            onClick={() => onSettingsExpandedChange(!settingsExpanded)}
            type="button"
          >
            {settingsExpanded ? "收起设置" : "展开设置"}
          </button>
        </div>

        <div className="grid gap-3">
          {settingsExpanded ? (
            <label className="grid gap-1.5 text-sm font-semibold text-slate-300">
              <span>Model</span>
              <select
                aria-label="Model"
                className="min-h-11 rounded-lg border border-white/10 bg-slate-900 px-3 text-base text-white"
                onChange={(event) => onParamChange({ model: event.target.value })}
                value={params.model}
              >
                {provider?.models.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="grid gap-1.5 text-sm font-semibold text-slate-300">
            <span>尺寸</span>
            <select
              aria-label="尺寸"
              className="min-h-11 rounded-lg border border-white/10 bg-slate-900 px-3 text-base text-white"
              onChange={(event) => onParamChange({ size: event.target.value })}
              value={params.size}
            >
              {config.options.sizes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          {settingsExpanded ? (
            <>
              <label className="grid gap-1.5 text-sm font-semibold text-slate-300">
                <span>质量</span>
                <select
                  aria-label="质量"
                  className="min-h-11 rounded-lg border border-white/10 bg-slate-900 px-3 text-base text-white"
                  onChange={(event) => onParamChange({ quality: event.target.value })}
                  value={params.quality}
                >
                  {config.options.qualities.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-sm font-semibold text-slate-300">
                <span>输出格式</span>
                <select
                  aria-label="输出格式"
                  className="min-h-11 rounded-lg border border-white/10 bg-slate-900 px-3 text-base text-white"
                  onChange={(event) => onParamChange({ outputFormat: event.target.value })}
                  value={params.outputFormat}
                >
                  {config.options.outputFormats.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}
        </div>
      </section>

      <section className="mt-5 flex min-h-0 flex-1 flex-col">
        <h2 className="mb-3 text-sm font-semibold text-slate-300">模板</h2>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            aria-pressed={templateListView === "default"}
            className={`min-h-11 rounded-lg px-3 text-sm font-semibold ${
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
            className={`min-h-11 rounded-lg px-3 text-sm font-semibold ${
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
        <div className="min-h-0 overflow-y-auto pr-1">
          {templateListView === "default" ? (
            <div className="grid gap-2">
              {categories.map((category) => (
                <button
                  aria-label={`打开模板分类 ${category.name}`}
                  className="min-h-11 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
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
                  <span className="block">{category.name}</span>
                  {category.description ? (
                    <span className="block truncate text-xs font-normal text-slate-500">
                      {category.description}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid gap-2">
              {mineTemplates.length === 0 ? (
                <p className="m-0 rounded-lg bg-white/5 px-3 py-4 text-sm text-slate-400">
                  暂无我的模板
                </p>
              ) : null}
              {mineTemplates.map((template) => (
                <button
                  aria-label={`打开我的模板 ${template.title}`}
                  className="min-h-11 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
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
                  <span className="block truncate">{template.title}</span>
                  <span className="block truncate text-xs font-normal text-slate-500">
                    {template.size} · {template.quality}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-5 shrink-0 border-t border-white/10 pt-4">
        <p className="m-0 truncate text-sm font-semibold text-white">{userLabel}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-indigo-400"
            style={{ width: `${usagePercent(usageText)}%` }}
          />
        </div>
        <p className="m-0 mt-2 text-xs text-slate-400">{usageText || "今日尚未生成"}</p>
        <form action="/auth/logout" method="post">
          <button
            className="mt-3 min-h-11 w-full rounded-lg border border-white/10 px-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
            type="submit"
          >
            退出
          </button>
        </form>
      </section>
    </aside>
  );
}
