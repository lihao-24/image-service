import type { ChangeEvent, FormEvent } from "react";
import { LoaderIcon, SendIcon } from "./icons";
import type { GenerationMode } from "./types";

type PromptComposerProps = {
  mode: GenerationMode;
  prompt: string;
  referenceImage: File | null;
  referencePreviewUrl: string;
  generating: boolean;
  onModeChange: (mode: GenerationMode) => void;
  onPromptChange: (prompt: string) => void;
  onReferenceImageChange: (file: File | null) => void;
  onSubmit: () => void;
};

export function PromptComposer({
  mode,
  prompt,
  referenceImage,
  referencePreviewUrl,
  generating,
  onModeChange,
  onPromptChange,
  onReferenceImageChange,
  onSubmit
}: PromptComposerProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    onReferenceImageChange(event.target.files?.[0] ?? null);
    event.target.value = "";
  }

  return (
    <div className="border-t border-slate-200 bg-gradient-to-t from-white via-white to-white/70 px-4 pb-4 pt-3">
      <form className="mx-auto max-w-4xl" onSubmit={handleSubmit}>
        <div className="mb-2 inline-flex rounded-full bg-slate-100 p-1">
          <button
            aria-pressed={mode === "text-to-image"}
            className={`min-h-9 rounded-full px-3 text-sm font-semibold ${
              mode === "text-to-image" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
            }`}
            onClick={() => onModeChange("text-to-image")}
            type="button"
          >
            文生图
          </button>
          <button
            aria-pressed={mode === "image-edit"}
            className={`min-h-9 rounded-full px-3 text-sm font-semibold ${
              mode === "image-edit" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
            }`}
            onClick={() => onModeChange("image-edit")}
            type="button"
          >
            图生图
          </button>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/70">
          {mode === "image-edit" ? (
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <label className="inline-flex min-h-9 cursor-pointer items-center rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <span>上传参考图</span>
                <input
                  aria-label="参考图文件"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  key={referenceImage ? referenceImage.name : "empty-reference"}
                  onChange={handleFileChange}
                  type="file"
                />
              </label>
              {referenceImage ? (
                <span className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1 text-sm text-slate-600">
                  {referencePreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="参考图预览"
                      className="h-9 w-9 rounded-md object-cover"
                      src={referencePreviewUrl}
                    />
                  ) : null}
                  {referenceImage.name}
                </span>
              ) : (
                <span className="text-sm text-slate-500">图生图参考图只用于本次请求。</span>
              )}
            </div>
          ) : null}

          <div className="flex items-end gap-3">
            <label className="sr-only" htmlFor="workbench-prompt">
              Prompt
            </label>
            <textarea
              aria-label="Prompt"
              className="max-h-48 min-h-24 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-base leading-7 text-slate-950 outline-none placeholder:text-slate-400"
              id="workbench-prompt"
              maxLength={4000}
              onChange={(event) => onPromptChange(event.target.value)}
              placeholder="描述你想生成的画面..."
              value={prompt}
            />
            <button
              aria-label="生成图片"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              disabled={generating || prompt.trim().length === 0}
              type="submit"
            >
              {generating ? <LoaderIcon className="h-5 w-5 animate-spin" /> : <SendIcon />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
