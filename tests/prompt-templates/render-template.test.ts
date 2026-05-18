import { describe, expect, it } from "vitest";
import {
  insertRenderedPrompt,
  renderPromptTemplate,
  type BuiltinPromptTemplate
} from "@/lib/prompt-templates";

const TEMPLATE: BuiltinPromptTemplate = {
  id: "builtin-test-template",
  title: "测试模板",
  category: "ui-interface",
  tags: ["测试", "模板"],
  mode: "text-to-image",
  recommended: {
    model: "gpt-image-2",
    size: "1536x1024",
    quality: "high",
    outputFormat: "png",
    referenceMode: "none"
  },
  prompt: "为「{{主题}}」生成{{风格}}画面，补充说明：{{说明}}。",
  variables: [
    {
      key: "主题",
      label: "主题",
      placeholder: "例如：城市咖啡节",
      required: true,
      maxLength: 12
    },
    {
      key: "风格",
      label: "风格",
      placeholder: "例如：明亮",
      required: false,
      defaultValue: "清新明亮",
      maxLength: 20
    },
    {
      key: "说明",
      label: "说明",
      placeholder: "例如：适合年轻人",
      required: false,
      maxLength: 40
    }
  ],
  source: {
    type: "original",
    name: "image-service",
    note: "原创测试模板"
  }
};

describe("renderPromptTemplate", () => {
  it("渲染声明变量，trim 用户输入，并使用 defaultValue", () => {
    const result = renderPromptTemplate(TEMPLATE, {
      主题: "  城市咖啡节  ",
      说明: "  适合周末活动  "
    });

    expect(result).toEqual({
      ok: true,
      prompt: "为「城市咖啡节」生成清新明亮画面，补充说明：适合周末活动。"
    });
  });

  it("必填变量缺失时返回中文字段错误", () => {
    const result = renderPromptTemplate(TEMPLATE, {
      风格: "极简"
    });

    expect(result).toEqual({
      ok: false,
      code: "missing_required_variable",
      message: "请填写「主题」。",
      field: "主题"
    });
  });

  it("拒绝超过变量 maxLength 的输入", () => {
    const result = renderPromptTemplate(TEMPLATE, {
      主题: "这是一个非常非常长的主题名称"
    });

    expect(result).toEqual({
      ok: false,
      code: "variable_too_long",
      message: "「主题」不能超过 12 个字符。",
      field: "主题"
    });
  });

  it("拒绝 values 中未声明的变量", () => {
    const result = renderPromptTemplate(TEMPLATE, {
      主题: "城市咖啡节",
      未声明变量: "不应被接受"
    });

    expect(result).toEqual({
      ok: false,
      code: "unknown_variable",
      message: "模板不支持变量「未声明变量」。",
      field: "未声明变量"
    });
  });

  it("拒绝 prompt 中使用未声明占位符的模板", () => {
    const result = renderPromptTemplate(
      {
        ...TEMPLATE,
        prompt: "生成「{{主题}}」，但这里有「{{未声明}}」。"
      },
      {
        主题: "城市咖啡节"
      }
    );

    expect(result).toEqual({
      ok: false,
      code: "undeclared_placeholder",
      message: "模板占位符「未声明」没有对应变量声明。",
      field: "未声明"
    });
  });

  it("拒绝渲染后超过 4000 字符的 prompt", () => {
    const result = renderPromptTemplate(
      {
        ...TEMPLATE,
        prompt: `${"内容".repeat(2000)}{{主题}}`
      },
      {
        主题: "过长"
      }
    );

    expect(result).toMatchObject({
      ok: false,
      code: "prompt_too_long",
      message: "套用后 prompt 超过 4000 字，请缩短变量内容或删除部分文本。"
    });
  });
});

describe("insertRenderedPrompt", () => {
  it("有选区时替换选区内容", () => {
    const result = insertRenderedPrompt("开头 旧内容 结尾", "新内容", 3, 6);

    expect(result).toEqual({
      ok: true,
      prompt: "开头 新内容 结尾"
    });
  });

  it("有光标但无选区时插入到光标位置", () => {
    const result = insertRenderedPrompt("开头结尾", " 中间 ", 2, 2);

    expect(result).toEqual({
      ok: true,
      prompt: "开头 中间 结尾"
    });
  });

  it("没有光标时追加到末尾，并用空行分隔", () => {
    const result = insertRenderedPrompt("已有 prompt", "新增 prompt");

    expect(result).toEqual({
      ok: true,
      prompt: "已有 prompt\n\n新增 prompt"
    });
  });

  it("空 prompt 没有光标时直接使用渲染结果", () => {
    const result = insertRenderedPrompt("   ", "新增 prompt");

    expect(result).toEqual({
      ok: true,
      prompt: "新增 prompt"
    });
  });

  it("拒绝插入后超过 4000 字符", () => {
    const result = insertRenderedPrompt("内容".repeat(1999), "新增");

    expect(result).toEqual({
      ok: false,
      code: "prompt_too_long",
      message: "插入后 prompt 超过 4000 字，请缩短内容后再试。"
    });
  });
});
