import type { BuiltinPromptTemplate } from "./builtin";

const PROMPT_MAX_LENGTH = 4000;
const PLACEHOLDER_PATTERN = /\{\{([^{}]+)\}\}/g;

export type RenderPromptTemplateValues = Record<string, string | null | undefined>;

export type RenderPromptTemplateResult =
  | { ok: true; prompt: string }
  | {
      ok: false;
      code:
        | "missing_required_variable"
        | "variable_too_long"
        | "unknown_variable"
        | "undeclared_placeholder"
        | "prompt_too_long";
      message: string;
      field?: string;
    };

export type InsertRenderedPromptResult =
  | { ok: true; prompt: string }
  | { ok: false; code: "prompt_too_long"; message: string };

export function renderPromptTemplate(
  template: BuiltinPromptTemplate,
  values: RenderPromptTemplateValues
): RenderPromptTemplateResult {
  const declaredKeys = new Set(template.variables.map((variable) => variable.key));

  for (const key of Object.keys(values)) {
    if (!declaredKeys.has(key)) {
      return {
        ok: false,
        code: "unknown_variable",
        message: `模板不支持变量「${key}」。`,
        field: key
      };
    }
  }

  const placeholderKeys = extractPlaceholderKeys(template.prompt);
  for (const key of placeholderKeys) {
    if (!declaredKeys.has(key)) {
      return {
        ok: false,
        code: "undeclared_placeholder",
        message: `模板占位符「${key}」没有对应变量声明。`,
        field: key
      };
    }
  }

  const renderedValues = new Map<string, string>();

  for (const variable of template.variables) {
    const rawValue = values[variable.key];
    const value =
      typeof rawValue === "string" && rawValue.trim().length > 0
        ? rawValue.trim()
        : variable.defaultValue?.trim() ?? "";

    if (variable.required && value.length === 0) {
      return {
        ok: false,
        code: "missing_required_variable",
        message: `请填写「${variable.label}」。`,
        field: variable.key
      };
    }

    if (variable.maxLength !== undefined && value.length > variable.maxLength) {
      return {
        ok: false,
        code: "variable_too_long",
        message: `「${variable.label}」不能超过 ${variable.maxLength} 个字符。`,
        field: variable.key
      };
    }

    renderedValues.set(variable.key, value);
  }

  const prompt = template.prompt.replace(PLACEHOLDER_PATTERN, (_match, key: string) => {
    return renderedValues.get(key) ?? "";
  });

  if (prompt.length > PROMPT_MAX_LENGTH) {
    return {
      ok: false,
      code: "prompt_too_long",
      message: "套用后 prompt 超过 4000 字，请缩短变量内容或删除部分文本。"
    };
  }

  return {
    ok: true,
    prompt
  };
}

export function insertRenderedPrompt(
  currentPrompt: string,
  renderedPrompt: string,
  selectionStart?: number,
  selectionEnd?: number
): InsertRenderedPromptResult {
  const prompt =
    typeof selectionStart === "number"
      ? insertAtSelection(currentPrompt, renderedPrompt, selectionStart, selectionEnd)
      : appendWithSeparator(currentPrompt, renderedPrompt);

  if (prompt.length > PROMPT_MAX_LENGTH) {
    return {
      ok: false,
      code: "prompt_too_long",
      message: "插入后 prompt 超过 4000 字，请缩短内容后再试。"
    };
  }

  return {
    ok: true,
    prompt
  };
}

function insertAtSelection(
  currentPrompt: string,
  renderedPrompt: string,
  selectionStart: number,
  selectionEnd?: number
) {
  const start = clampIndex(selectionStart, currentPrompt.length);
  const end = clampIndex(selectionEnd ?? selectionStart, currentPrompt.length);
  const normalizedStart = Math.min(start, end);
  const normalizedEnd = Math.max(start, end);

  return `${currentPrompt.slice(0, normalizedStart)}${renderedPrompt}${currentPrompt.slice(
    normalizedEnd
  )}`;
}

function appendWithSeparator(currentPrompt: string, renderedPrompt: string) {
  if (currentPrompt.trim().length === 0) {
    return renderedPrompt;
  }

  return `${currentPrompt}\n\n${renderedPrompt}`;
}

function clampIndex(index: number, maxLength: number) {
  if (!Number.isFinite(index)) {
    return maxLength;
  }

  return Math.min(Math.max(Math.trunc(index), 0), maxLength);
}

function extractPlaceholderKeys(prompt: string) {
  return Array.from(prompt.matchAll(PLACEHOLDER_PATTERN), (match) => match[1]);
}

