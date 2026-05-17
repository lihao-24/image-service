import { describe, expect, it } from "vitest";
import { BUILTIN_PROMPT_TEMPLATES, PROMPT_TEMPLATE_CATEGORIES } from "@/lib/prompt-templates";

const EXPECTED_CATEGORIES = [
  ["ecommerce-product", "电商产品"],
  ["social-cover", "社媒封面"],
  ["live-commerce", "直播带货"],
  ["poster-typography", "海报字体"],
  ["photoreal", "摄影写实"],
  ["character", "人物角色"],
  ["illustration-art", "插画艺术"],
  ["infographic", "信息图表"],
  ["brand-visual", "品牌视觉"],
  ["scene-story", "场景叙事"],
  ["guochao-history", "古风国潮"],
  ["document-publishing", "文档出版"]
] as const;

const ALLOWED_SIZES = ["1024x1024", "1024x1536", "1536x1024"];
const ALLOWED_QUALITIES = ["high", "medium", "low"];
const ALLOWED_OUTPUT_FORMATS = ["png", "jpeg", "webp"];

describe("内置提示词模板", () => {
  it("提供 12 个稳定中文分类", () => {
    expect(PROMPT_TEMPLATE_CATEGORIES).toHaveLength(12);
    expect(PROMPT_TEMPLATE_CATEGORIES.map((category) => [category.id, category.name])).toEqual(
      EXPECTED_CATEGORIES
    );
    expect(PROMPT_TEMPLATE_CATEGORIES.every((category) => category.description.length >= 8)).toBe(
      true
    );
  });

  it("每个分类至少有一条中文内置模板，且模板 id 唯一", () => {
    const ids = BUILTIN_PROMPT_TEMPLATES.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(BUILTIN_PROMPT_TEMPLATES.length).toBeGreaterThanOrEqual(12);

    for (const [categoryId] of EXPECTED_CATEGORIES) {
      expect(BUILTIN_PROMPT_TEMPLATES.some((template) => template.category === categoryId)).toBe(
        true
      );
    }
  });

  it("模板字段完整，推荐参数只使用 MVP allowlist 范围", () => {
    for (const template of BUILTIN_PROMPT_TEMPLATES) {
      expect(template.id).toMatch(/^builtin-[a-z0-9-]+$/);
      expect(template.title).toMatch(/[\u4e00-\u9fa5]/);
      expect(template.tags.length).toBeGreaterThanOrEqual(2);
      expect(["text-to-image", "image-edit"]).toContain(template.mode);
      expect(template.recommended).toMatchObject({
        model: "gpt-image-2"
      });
      expect(ALLOWED_SIZES).toContain(template.recommended.size);
      expect(ALLOWED_QUALITIES).toContain(template.recommended.quality);
      expect(ALLOWED_OUTPUT_FORMATS).toContain(template.recommended.outputFormat);
      expect(["none", "single-image"]).toContain(template.recommended.referenceMode);
      expect(template.prompt).toMatch(/[\u4e00-\u9fa5]/);
      expect(template.prompt.length).toBeGreaterThan(80);
      expect(template.prompt.length).toBeLessThanOrEqual(1200);
      expect(template.source.name).toBeTruthy();
      expect(template.source.note).toMatch(/中文|改写|原创|参考/);
      expect(template.source.referenceUrl).toMatch(/^https:\/\/github\.com\/freestylefly\/awesome-gpt-image-2/);
    }
  });

  it("模板变量声明和 prompt 占位符保持一致", () => {
    for (const template of BUILTIN_PROMPT_TEMPLATES) {
      const placeholderKeys = Array.from(template.prompt.matchAll(/\{\{([^{}]+)\}\}/g)).map(
        (match) => match[1]
      );
      const variableKeys = template.variables.map((variable) => variable.key);

      expect(placeholderKeys.length).toBeGreaterThan(0);
      expect(new Set(variableKeys).size).toBe(variableKeys.length);
      expect(new Set(placeholderKeys)).toEqual(new Set(variableKeys));

      for (const variable of template.variables) {
        expect(variable.label).toMatch(/[\u4e00-\u9fa5]/);
        expect(variable.placeholder).toMatch(/[\u4e00-\u9fa5]/);
        expect(typeof variable.required).toBe("boolean");
        if (variable.maxLength !== undefined) {
          expect(variable.maxLength).toBeGreaterThan(0);
          expect(variable.maxLength).toBeLessThanOrEqual(300);
        }
      }
    }
  });
});
