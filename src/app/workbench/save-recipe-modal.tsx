import { useState } from "react";
import { createDefaultRecipeTitle } from "./helpers";

type SaveRecipeModalProps = {
  open: boolean;
  prompt: string;
  saving: boolean;
  message: string;
  onClose: () => void;
  onSave: (title: string) => void;
};

export function SaveRecipeModal({
  open,
  prompt,
  saving,
  message,
  onClose,
  onSave
}: SaveRecipeModalProps) {
  const [title, setTitle] = useState(() => createDefaultRecipeTitle(prompt));

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div
        aria-label="保存配置"
        aria-modal="true"
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl"
        role="dialog"
      >
        <h2 className="m-0 text-xl font-bold text-slate-950">保存配置</h2>
        <p className="mt-2 text-sm text-slate-500">只保存 prompt 和参数，不保存图片或参考图。</p>
        <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
          <span>配置名称</span>
          <input
            aria-label="配置名称"
            className="min-h-11 rounded-lg border border-slate-200 px-3 text-base text-slate-950"
            maxLength={120}
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
        </label>
        {message ? <p className="mt-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
        <div className="mt-5 flex justify-end gap-3">
          <button
            className="min-h-11 rounded-lg border border-slate-200 px-4 font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            取消
          </button>
          <button
            className="min-h-11 rounded-lg bg-indigo-600 px-4 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={saving}
            onClick={() => onSave(title)}
            type="button"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
