// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import ImageWorkbench from "@/app/image-workbench";
import type { PublicImageConfig } from "@/lib/config";

const publicConfig: PublicImageConfig = {
  defaultProvider: "sub2api",
  defaults: {
    model: "gpt-image-2",
    size: "1024x1536",
    quality: "high",
    outputFormat: "png"
  },
  providers: [
    {
      id: "sub2api",
      label: "Sub2API",
      models: ["gpt-image-2", "gpt-image-mini"]
    }
  ],
  options: {
    sizes: ["1024x1024", "1024x1536", "1536x1024"],
    qualities: ["high", "medium"],
    outputFormats: ["png", "webp"]
  }
};

const tinyPng =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";

const categories = [
  { id: "all", name: "全部分类", description: "全部模板" },
  { id: "ecommerce-product", name: "电商产品", description: "商品主图" },
  { id: "infographic", name: "信息图表", description: "知识卡片" }
];

const ecommerceTemplate = {
  source: "builtin",
  id: "builtin-ecommerce-clean-packshot",
  title: "电商白底质感主图",
  category: "ecommerce-product",
  category_name: "电商产品",
  tags: ["商品主图", "白底", "质感"],
  mode: "text-to-image",
  recommended: {
    model: "gpt-image-2",
    size: "1024x1536",
    quality: "high",
    output_format: "png",
    reference_mode: "none"
  },
  prompt:
    "为「{{商品名称}}」生成一张电商主图，突出「{{核心卖点}}」，纯净浅色背景，商品居中，柔和棚拍光。",
  variables: [
    {
      key: "商品名称",
      label: "商品名称",
      placeholder: "例如：透明玻璃杯",
      required: true,
      maxLength: 60
    },
    {
      key: "核心卖点",
      label: "核心卖点",
      placeholder: "例如：耐热玻璃",
      required: true,
      maxLength: 120
    }
  ],
  source_metadata: {
    type: "external-inspired",
    name: "awesome-gpt-image-2",
    referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
    note: "中文化改写。"
  },
  safety_notes: [],
  is_favorite: false
};

const infographicTemplate = {
  source: "builtin",
  id: "builtin-infographic-process-card",
  title: "知识流程信息图",
  category: "infographic",
  category_name: "信息图表",
  tags: ["信息图", "流程", "知识卡片"],
  mode: "text-to-image",
  recommended: {
    model: "gpt-image-2",
    size: "1536x1024",
    quality: "high",
    output_format: "png",
    reference_mode: "none"
  },
  prompt: "生成一张中文信息图，主题是「{{主题}}」，采用清晰的三到五步流程结构。",
  variables: [
    {
      key: "主题",
      label: "主题",
      placeholder: "例如：新手如何选择咖啡豆",
      required: true,
      maxLength: 80
    }
  ],
  source_metadata: {
    type: "external-inspired",
    name: "awesome-gpt-image-2",
    referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md",
    note: "中文化改写。"
  },
  safety_notes: [],
  is_favorite: true
};

const mineTemplate = {
  source: "mine",
  id: "recipe_1",
  user_id: "user_1",
  title: "我的玻璃杯配置",
  category: null,
  category_name: "我的模板",
  tags: ["自用"],
  mode: "text-to-image",
  provider: "sub2api",
  model: "gpt-image-2",
  size: "1024x1536",
  quality: "medium",
  output_format: "webp",
  prompt: "透明玻璃杯，产品摄影，浅色背景",
  negative_prompt: null,
  params: {},
  reference_mode: null,
  is_favorite: true,
  created_at: "2026-05-17T00:00:00.000Z",
  updated_at: "2026-05-17T00:00:00.000Z"
};

function renderWorkbench() {
  return render(<ImageWorkbench config={publicConfig} userLabel="hao@example.com" />);
}

async function expandTemplateLibrary() {
  await screen.findByLabelText("搜索模板");
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:preview"),
      revokeObjectURL: vi.fn()
    })
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ImageWorkbench", () => {
  it("桌面提示词库默认完整展示，不再使用折叠 rail", async () => {
    mockFetchByRoute();

    renderWorkbench();

    expect(await screen.findByLabelText("搜索模板")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "展开提示词库" })).toBeNull();
    expect(screen.queryByRole("button", { name: "收起提示词库" })).toBeNull();
  });

  it("顶部使用紧凑状态栏，不再渲染大 H1 生图工作台", () => {
    mockFetchByRoute();

    renderWorkbench();

    expect(screen.queryByRole("heading", { level: 1, name: "生图工作台" })).toBeNull();
    expect(screen.getByText("生图工作台")).toBeTruthy();
  });

  it("桌面不再使用占位分区导航，移动端分区导航语义明确且默认编辑激活", () => {
    mockFetchByRoute();

    renderWorkbench();

    expect(screen.queryByLabelText("工作台分区")).toBeNull();
    const mobileSwitch = screen.getByRole("tablist", { name: "移动端工作台分区" });
    expect(mobileSwitch.className).toContain("mobile-only-panel-switch");
    expect(within(mobileSwitch).getByRole("tab", { name: "模板" }).getAttribute("aria-selected")).toBe(
      "false"
    );
    expect(within(mobileSwitch).getByRole("tab", { name: "编辑" }).getAttribute("aria-selected")).toBe(
      "true"
    );
    expect(within(mobileSwitch).getByRole("tab", { name: "预览" }).getAttribute("aria-selected")).toBe(
      "false"
    );
  });

  it("预览空状态使用稳定画布、SVG 占位并完整展示等待生成", () => {
    mockFetchByRoute();

    renderWorkbench();

    const viewport = screen.getByRole("region", { name: "预览画布" });
    expect(viewport.className).toContain("preview-viewport");
    expect(within(viewport).getByText("等待生成")).toBeTruthy();
    expect(within(viewport).getByRole("img", { name: "等待生成图标" })).toBeTruthy();
  });

  it("Prompt 字数统计位于 prompt 输入结构内", () => {
    mockFetchByRoute();

    renderWorkbench();

    const promptField = screen.getByTestId("prompt-field");
    expect(within(promptField).getByLabelText("Prompt")).toBeTruthy();
    expect(within(promptField).getByText("0/4000 字").className).toContain("prompt-counter");
  });

  it("初始加载模板库并渲染来源切换、分类和模板", async () => {
    mockFetchByRoute();

    renderWorkbench();
    await expandTemplateLibrary();

    expect(await screen.findByRole("button", { name: "内置模板" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "我的模板" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "收藏" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "全部分类" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "电商产品" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /选择模板 电商白底质感主图/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /选择模板 知识流程信息图/ })).toBeTruthy();
  });

  it("搜索和分类筛选能缩小模板列表", async () => {
    mockFetchByRoute();

    renderWorkbench();
    await expandTemplateLibrary();
    await screen.findByRole("button", { name: /选择模板 电商白底质感主图/ });

    fireEvent.change(screen.getByLabelText("搜索模板"), { target: { value: "流程" } });

    expect(screen.queryByRole("button", { name: /选择模板 电商白底质感主图/ })).toBeNull();
    expect(screen.getByRole("button", { name: /选择模板 知识流程信息图/ })).toBeTruthy();

    fireEvent.change(screen.getByLabelText("搜索模板"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "电商产品" }));

    expect(screen.getByRole("button", { name: /选择模板 电商白底质感主图/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /选择模板 知识流程信息图/ })).toBeNull();
  });

  it("点击模板只选择模板，不调用生成 API", async () => {
    const fetchMock = mockFetchByRoute();

    renderWorkbench();
    await expandTemplateLibrary();
    fireEvent.click(await screen.findByRole("button", { name: /选择模板 电商白底质感主图/ }));

    expect(await screen.findByText("模板变量")).toBeTruthy();
    expect(screen.getByText("已选择：电商白底质感主图")).toBeTruthy();
    expect(fetchMock.mock.calls.some(([url]) => url === "/api/images/generations")).toBe(false);
    expect(fetchMock.mock.calls.some(([url]) => url === "/api/images/edits")).toBe(false);
  });

  it("填变量后替换当前 prompt 并应用推荐参数", async () => {
    mockFetchByRoute();

    renderWorkbench();
    await expandTemplateLibrary();
    fireEvent.click(await screen.findByRole("button", { name: /选择模板 电商白底质感主图/ }));

    fireEvent.click(screen.getByRole("button", { name: "替换当前 prompt" }));
    expect(await screen.findByText("请填写「商品名称」。")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("商品名称"), {
      target: { value: "透明玻璃杯" }
    });
    fireEvent.change(screen.getByLabelText("核心卖点"), {
      target: { value: "耐热玻璃" }
    });
    fireEvent.change(screen.getByLabelText("尺寸"), { target: { value: "1024x1024" } });
    fireEvent.change(screen.getByLabelText("质量"), { target: { value: "medium" } });
    fireEvent.change(screen.getByLabelText("输出格式"), { target: { value: "webp" } });
    fireEvent.click(screen.getByRole("button", { name: "替换当前 prompt" }));

    expect((screen.getByLabelText("Prompt") as HTMLTextAreaElement).value).toContain(
      "透明玻璃杯"
    );
    expect((screen.getByLabelText("Prompt") as HTMLTextAreaElement).value).toContain(
      "耐热玻璃"
    );
    expect((screen.getByLabelText("尺寸") as HTMLSelectElement).value).toBe("1024x1536");
    expect((screen.getByLabelText("质量") as HTMLSelectElement).value).toBe("high");
    expect((screen.getByLabelText("输出格式") as HTMLSelectElement).value).toBe("png");
    expect(screen.getByText("已套用：电商白底质感主图")).toBeTruthy();
  });

  it("插入到当前 prompt 会追加渲染结果并应用推荐参数", async () => {
    mockFetchByRoute();

    renderWorkbench();
    await expandTemplateLibrary();
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "保留品牌高级感" }
    });
    fireEvent.click(await screen.findByRole("button", { name: /选择模板 知识流程信息图/ }));
    fireEvent.change(screen.getByLabelText("主题"), {
      target: { value: "新手如何选择咖啡豆" }
    });
    fireEvent.click(screen.getByRole("button", { name: "插入到当前 prompt" }));

    expect((screen.getByLabelText("Prompt") as HTMLTextAreaElement).value).toBe(
      "保留品牌高级感\n\n生成一张中文信息图，主题是「新手如何选择咖啡豆」，采用清晰的三到五步流程结构。"
    );
    expect((screen.getByLabelText("尺寸") as HTMLSelectElement).value).toBe("1536x1024");
    expect(screen.getByText("已套用：知识流程信息图")).toBeTruthy();
  });

  it("收藏内置模板调用 favorites API，不调用生成 API", async () => {
    const fetchMock = mockFetchByRoute();

    renderWorkbench();
    await expandTemplateLibrary();
    const templateButton = await screen.findByRole("button", {
      name: /选择模板 电商白底质感主图/
    });
    const templateItem = templateButton.closest("li");
    expect(templateItem).not.toBeNull();
    fireEvent.click(
      within(templateItem as HTMLElement).getByRole("button", {
        name: "收藏 电商白底质感主图"
      })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/prompt-templates/favorites",
        expect.objectContaining({ method: "POST" })
      );
    });
    expect(fetchMock.mock.calls.some(([url]) => url === "/api/images/generations")).toBe(false);
  });

  it("保存配置成功后刷新模板库，并显示我的模板", async () => {
    const fetchMock = mockFetchByRoute({
      afterSaveLibrary: createTemplateLibraryResponse({ mine: [mineTemplate] })
    });

    renderWorkbench();
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "透明玻璃杯，产品摄影" }
    });
    fireEvent.change(screen.getByLabelText("配置名称"), {
      target: { value: "透明玻璃杯" }
    });
    fireEvent.click(screen.getByRole("button", { name: "保存配置" }));

    await screen.findByText("配置已保存。");
    await expandTemplateLibrary();
    fireEvent.click(screen.getByRole("button", { name: "我的模板" }));

    expect(await screen.findByRole("button", { name: /选择模板 我的玻璃杯配置/ })).toBeTruthy();
    expect(
      fetchMock.mock.calls.filter(([url]) => String(url).startsWith("/api/prompt-templates"))
        .length
    ).toBeGreaterThanOrEqual(2);
  });

  it("使用服务端 allowlist 渲染参数控件", async () => {
    mockFetchByRoute();

    renderWorkbench();

    expect(await screen.findByRole("option", { name: "gpt-image-2" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "gpt-image-mini" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "1024x1536" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "webp" })).toBeTruthy();
    expect(screen.queryByText("https://sub2api.toioto.org")).toBeNull();
    expect(screen.queryByText("apiKeyEnv")).toBeNull();
  });

  it("文生图成功后展示临时预览且不会自动保存配置", async () => {
    const fetchMock = mockFetchByRoute({
      generationResponse: jsonResponse({
        image: { b64_json: tinyPng, output_format: "png" },
        meta: {
          mode: "text-to-image",
          provider: "sub2api",
          model: "gpt-image-2",
          size: "1024x1536",
          quality: "high",
          output_format: "png",
          daily_usage: { generation_count: 1, limit: 20 }
        }
      })
    });

    renderWorkbench();
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "一只透明玻璃杯，柔和自然光" }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));

    const preview = await screen.findByAltText("当前生成图片预览");
    expect(preview.getAttribute("src")).toBe(`data:image/png;base64,${tinyPng}`);
    expect(screen.getByRole("tab", { name: "预览" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("生成成功，图片仅保留在当前浏览器页面。")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/images/generations",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock.mock.calls.some(([url]) => url === "/api/recipes")).toBe(false);
  });

  it("只有点击保存配置才调用 recipe API", async () => {
    const fetchMock = mockFetchByRoute();

    renderWorkbench();
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "透明玻璃杯，产品摄影" }
    });
    fireEvent.change(screen.getByLabelText("配置名称"), {
      target: { value: "透明玻璃杯" }
    });
    fireEvent.click(screen.getByRole("button", { name: "保存配置" }));

    await screen.findByText("配置已保存。");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/recipes",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
    );
    const recipeCall = fetchMock.mock.calls.find(([url]) => url === "/api/recipes");
    expect(JSON.parse(String(recipeCall?.[1]?.body))).toMatchObject({
      title: "透明玻璃杯",
      prompt: "透明玻璃杯，产品摄影",
      mode: "text-to-image",
      provider: "sub2api",
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      output_format: "png"
    });
  });

  it("参考图模式发送合法图片并展示预览", async () => {
    const fetchMock = mockFetchByRoute({
      editResponse: jsonResponse({
        image: { b64_json: tinyPng, output_format: "webp" },
        meta: {
          mode: "image-edit",
          provider: "sub2api",
          model: "gpt-image-2",
          size: "1024x1536",
          quality: "high",
          output_format: "webp",
          daily_usage: { generation_count: 2, limit: 20 }
        }
      })
    });

    renderWorkbench();
    fireEvent.click(screen.getByRole("radio", { name: "参考图" }));
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "保留构图，改成清晨窗边光线" }
    });
    fireEvent.change(screen.getByLabelText("输出格式"), { target: { value: "webp" } });
    fireEvent.change(screen.getByLabelText("参考图文件"), {
      target: {
        files: [new File(["image"], "reference.png", { type: "image/png" })]
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));

    await screen.findByAltText("当前生成图片预览");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/images/edits",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData)
      })
    );
  });

  it("展示脱敏错误，不透出 provider 内部信息", async () => {
    mockFetchByRoute({
      generationResponse: jsonResponse(
        {
          error: "provider_request_failed",
          message: "provider 认证失败 https://sub2api.toioto.org/v1 sk-secret stack trace"
        },
        502
      )
    });

    renderWorkbench();
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "一张安静的书桌" }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));

    await waitFor(() => {
      expect(screen.getByText("图片生成服务暂时不可用，请稍后再试。")).toBeTruthy();
    });
    expect(screen.queryByText(/sub2api\.toioto/)).toBeNull();
    expect(screen.queryByText(/sk-secret/)).toBeNull();
    expect(screen.queryByText(/stack trace/)).toBeNull();
  });
});

type MockFetchOptions = {
  initialLibrary?: unknown;
  afterSaveLibrary?: unknown;
  generationResponse?: Response;
  editResponse?: Response;
};

function mockFetchByRoute(options: MockFetchOptions = {}) {
  const fetchMock = vi.mocked(fetch);
  let libraryCalls = 0;
  const initialLibrary = options.initialLibrary ?? createTemplateLibraryResponse();
  const afterSaveLibrary = options.afterSaveLibrary ?? initialLibrary;

  fetchMock.mockImplementation((input, init) => {
    const url = String(input);
    const method = init?.method ?? "GET";

    if (url.startsWith("/api/prompt-templates/favorites") && method === "POST") {
      return Promise.resolve(jsonResponse({ favorite: { template_id: ecommerceTemplate.id } }, 201));
    }

    if (url.startsWith("/api/prompt-templates/favorites/") && method === "DELETE") {
      return Promise.resolve(jsonResponse({ ok: true }));
    }

    if (url.startsWith("/api/prompt-templates")) {
      libraryCalls += 1;
      return Promise.resolve(jsonResponse(libraryCalls === 1 ? initialLibrary : afterSaveLibrary));
    }

    if (url === "/api/images/generations") {
      return Promise.resolve(
        options.generationResponse ??
          jsonResponse({
            image: { b64_json: tinyPng, output_format: "png" },
            meta: { daily_usage: { generation_count: 1, limit: 20 } }
          })
      );
    }

    if (url === "/api/images/edits") {
      return Promise.resolve(
        options.editResponse ??
          jsonResponse({
            image: { b64_json: tinyPng, output_format: "webp" },
            meta: { daily_usage: { generation_count: 1, limit: 20 } }
          })
      );
    }

    if (url === "/api/recipes") {
      return Promise.resolve(
        jsonResponse({
          recipe: { id: "recipe_saved", title: "透明玻璃杯" }
        })
      );
    }

    return Promise.reject(new Error(`未 mock 的请求：${url}`));
  });

  return fetchMock;
}

function createTemplateLibraryResponse(overrides: { mine?: unknown[] } = {}) {
  return {
    categories: categories.slice(1),
    templates: {
      builtin: [ecommerceTemplate, infographicTemplate],
      mine: overrides.mine ?? []
    },
    favorite_template_ids: [infographicTemplate.id]
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
