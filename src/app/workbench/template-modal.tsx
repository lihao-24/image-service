import { useMemo, useState } from "react";
import { renderPromptTemplate } from "@/lib/prompt-templates";
import {
  filterTemplates,
  readInitialVariableValues,
  readTemplateParams,
  toBuiltinPromptTemplate
} from "./helpers";
import type {
  GenerationMode,
  GenerationParamsSnapshot,
  TemplateLibrary,
  TemplateModalState,
  TemplateRecord
} from "./types";

type TemplateModalProps = {
  library: TemplateLibrary | null;
  modal: TemplateModalState;
  currentParams: GenerationParamsSnapshot;
  onClose: () => void;
  onUseTemplate: (payload: {
    prompt: string;
    mode: GenerationMode;
    params: GenerationParamsSnapshot;
  }) => void;
};

export function TemplateModal({
  library,
  modal,
  currentParams,
  onClose,
  onUseTemplate
}: TemplateModalProps) {
  const [query, setQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateRecord | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const templates = useMemo(() => filterTemplates(library, modal, query), [library, modal, query]);

  if (!modal.open) {
    return null;
  }

  function selectTemplate(template: TemplateRecord) {
    setSelectedTemplate(template);
    setVariableValues(readInitialVariableValues(template));
    setError("");
  }

  function useTemplate() {
    if (!selectedTemplate) {
      setError("请先选择一个模板。");
      return;
    }

    const rendered =
      selectedTemplate.source === "builtin"
        ? renderPromptTemplate(toBuiltinPromptTemplate(selectedTemplate), variableValues)
        : { ok: true as const, prompt: selectedTemplate.prompt };

    if (!rendered.ok) {
      setError(rendered.message);
      return;
    }

    onUseTemplate({
      prompt: rendered.prompt,
      mode: selectedTemplate.mode,
      params: readTemplateParams(selectedTemplate, currentParams)
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/45 p-4 max-md:items-start max-md:overflow-y-auto">
      <div
        aria-label={modal.title}
        aria-modal="true"
        className="grid max-h-[86dvh] w-full max-w-5xl grid-cols-[minmax(0,0.9fr)_minmax(320px,0.7fr)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl max-md:max-h-none max-md:grid-cols-1 max-md:overflow-visible"
        role="dialog"
      >
        <div className="min-h-0 border-r border-slate-200 p-5 max-md:border-b max-md:border-r-0">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="m-0 break-words text-xl font-bold text-slate-950">{modal.title}</h2>
              <p className="m-0 mt-1 text-sm text-slate-500">使用模板只会填入 prompt 和参数。</p>
            </div>
            <button
              className="min-h-9 shrink-0 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
              onClick={onClose}
              type="button"
            >
              关闭
            </button>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            <span>搜索模板</span>
            <input
              className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 transition focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索标题、标签或 prompt"
              value={query}
            />
          </label>

          <div className="template-scrollbar mt-4 grid max-h-[52dvh] gap-2 overflow-auto pr-1">
            {templates.length === 0 ? (
              <p className="m-0 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                暂无匹配模板。换个关键词试试，或从左侧选择其他分类。
              </p>
            ) : null}
            {templates.map((template) => (
              <button
                aria-label={template.title}
                className={`min-w-0 rounded-xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                  selectedTemplate?.id === template.id
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
                key={template.id}
                onClick={() => selectTemplate(template)}
                type="button"
              >
                <span className="block min-w-0 truncate font-bold text-slate-950">
                  {template.title}
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  {template.category_name} · {template.mode === "image-edit" ? "图生图" : "文生图"}
                </span>
                <span className="mt-2 block text-xs font-semibold text-slate-500">
                  {template.tags.slice(0, 3).join(" / ")}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="template-scrollbar min-h-0 overflow-auto p-5">
          {selectedTemplate ? (
            <>
              <h3 className="m-0 break-words text-lg font-bold text-slate-950">
                {selectedTemplate.title}
              </h3>
              <p className="template-scrollbar mt-3 max-h-32 overflow-auto rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                {selectedTemplate.prompt}
              </p>

              {selectedTemplate.source === "builtin" && selectedTemplate.variables.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {selectedTemplate.variables.map((variable) => (
                    <label
                      className="grid gap-2 text-sm font-semibold text-slate-700"
                      key={variable.key}
                    >
                      <span>
                        {variable.label}
                        {variable.required ? " *" : ""}
                      </span>
                      <input
                        aria-label={variable.label}
                        className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 transition focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
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
                    </label>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  我的模板会直接套用保存时的 prompt 和参数。
                </p>
              )}
            </>
          ) : (
            <p className="m-0 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              请选择一个模板。
            </p>
          )}

          {error ? (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex justify-end gap-3">
            <button
              className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
              onClick={onClose}
              type="button"
            >
              取消
            </button>
            <button
              className="min-h-10 rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
              disabled={!selectedTemplate}
              onClick={useTemplate}
              type="button"
            >
              使用模板
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
