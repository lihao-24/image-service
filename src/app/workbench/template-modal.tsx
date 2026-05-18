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
        className="grid max-h-[86dvh] w-full max-w-5xl grid-cols-[minmax(0,0.9fr)_minmax(320px,0.7fr)] overflow-hidden rounded-lg bg-white shadow-2xl max-md:max-h-none max-md:grid-cols-1 max-md:overflow-visible"
        role="dialog"
      >
        <div className="min-h-0 border-r border-slate-200 p-5 max-md:border-b max-md:border-r-0">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="m-0 text-xl font-bold text-slate-950">{modal.title}</h2>
              <p className="m-0 mt-1 text-sm text-slate-500">使用模板只会填入 prompt 和参数。</p>
            </div>
            <button
              className="min-h-9 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              onClick={onClose}
              type="button"
            >
              关闭
            </button>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            <span>搜索模板</span>
            <input
              className="min-h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索标题、标签或 prompt"
              value={query}
            />
          </label>

          <div className="mt-4 grid max-h-[52dvh] gap-2 overflow-auto pr-1">
            {templates.length === 0 ? (
              <p className="m-0 rounded-lg bg-slate-50 p-4 text-slate-500">暂无匹配模板。</p>
            ) : null}
            {templates.map((template) => (
              <button
                aria-label={template.title}
                className={`rounded-lg border p-4 text-left transition ${
                  selectedTemplate?.id === template.id
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
                key={template.id}
                onClick={() => selectTemplate(template)}
                type="button"
              >
                <span className="block font-bold text-slate-950">{template.title}</span>
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

        <div className="min-h-0 overflow-auto p-5">
          {selectedTemplate ? (
            <>
              <h3 className="m-0 text-lg font-bold text-slate-950">{selectedTemplate.title}</h3>
              <p className="mt-3 max-h-32 overflow-auto rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                {selectedTemplate.prompt}
              </p>

              {selectedTemplate.source === "builtin" && selectedTemplate.variables.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {selectedTemplate.variables.map((variable) => (
                    <label className="grid gap-2 text-sm font-semibold text-slate-700" key={variable.key}>
                      <span>
                        {variable.label}
                        {variable.required ? " *" : ""}
                      </span>
                      <input
                        aria-label={variable.label}
                        className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950"
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
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  我的模板会直接套用保存时的 prompt 和参数。
                </p>
              )}
            </>
          ) : (
            <p className="m-0 rounded-lg bg-slate-50 p-4 text-slate-500">请选择一个模板。</p>
          )}

          {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}

          <div className="mt-5 flex justify-end gap-3">
            <button
              className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={onClose}
              type="button"
            >
              取消
            </button>
            <button
              className="min-h-10 rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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
