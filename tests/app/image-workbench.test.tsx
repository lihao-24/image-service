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

beforeEach(() => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: 1024
  });
  vi.stubGlobal("fetch", vi.fn());
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:reference-preview"),
      revokeObjectURL: vi.fn()
    })
  );
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) }
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ImageWorkbench chat canvas", () => {
  it("桌面默认显示 sidebar，点击汉堡后完全隐藏", async () => {
    mockFetchByRoute();

    renderWorkbench();

    expect(await screen.findByRole("complementary", { name: "工作台侧边栏" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "隐藏侧边栏" }));

    expect(screen.queryByRole("complementary", { name: "工作台侧边栏" })).toBeNull();
    expect(screen.getByRole("button", { name: "显示侧边栏" })).toBeTruthy();
  });

  it("侧边栏设置区默认只展示尺寸，展开后展示完整参数", async () => {
    mockFetchByRoute();

    renderWorkbench();
    const sidebar = await screen.findByRole("complementary", { name: "工作台侧边栏" });

    expect(within(sidebar).getByLabelText("尺寸")).toBeTruthy();
    expect(within(sidebar).queryByLabelText("Model")).toBeNull();
    expect(within(sidebar).queryByLabelText("质量")).toBeNull();
    expect(within(sidebar).queryByLabelText("输出格式")).toBeNull();

    fireEvent.click(within(sidebar).getByRole("button", { name: "展开设置" }));

    expect(within(sidebar).getByLabelText("Model")).toBeTruthy();
    expect(within(sidebar).getByLabelText("质量")).toBeTruthy();
    expect(within(sidebar).getByLabelText("输出格式")).toBeTruthy();
  });

  it("移动端侧边栏使用 drawer 语义，遮罩和关闭按钮可关闭", async () => {
    mockFetchByRoute();
    window.innerWidth = 375;

    renderWorkbench();
    expect(await screen.findByRole("complementary", { name: "工作台侧边栏" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "显示侧边栏" }));

    const sidebars = screen.getAllByRole("complementary", { name: "工作台侧边栏" });
    expect(sidebars.length).toBe(2);
    expect(screen.getByRole("button", { name: "关闭侧边栏遮罩" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "关闭侧边栏面板" }));

    expect(screen.getAllByRole("complementary", { name: "工作台侧边栏" }).length).toBe(1);
  });

  it("初始空状态显示，首次生成后插入用户消息和 AI loading，并清空输入框", async () => {
    const deferred = createDeferred<Response>();
    mockFetchByRoute({ generationResponse: deferred.promise });

    renderWorkbench();

    expect(await screen.findByText("今天想生成什么？")).toBeTruthy();
    const promptInput = screen.getByLabelText("Prompt") as HTMLTextAreaElement;
    fireEvent.change(promptInput, { target: { value: "一只透明玻璃杯，柔和自然光" } });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));

    expect(screen.queryByText("今天想生成什么？")).toBeNull();
    expect(screen.getByText("一只透明玻璃杯，柔和自然光")).toBeTruthy();
    expect(screen.getByText("AI 正在生成图片...")).toBeTruthy();
    expect(promptInput.value).toBe("");

    deferred.resolve(successGenerationResponse());
    await screen.findByRole("img", { name: "AI 生成图片" });
  });

  it("文生图成功后 loading 替换为 AI 图片消息", async () => {
    mockFetchByRoute();

    renderWorkbench();
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "一张安静的书桌" }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));

    const image = await screen.findByRole("img", { name: "AI 生成图片" });
    expect(image.getAttribute("src")).toBe(`data:image/png;base64,${tinyPng}`);
    expect(screen.queryByText("AI 正在生成图片...")).toBeNull();
    expect(screen.getByRole("button", { name: "保存配置" })).toBeTruthy();
  });

  it("生成失败后显示脱敏错误卡片", async () => {
    mockFetchByRoute({
      generationResponse: Promise.resolve(
        jsonResponse(
          {
            error: "provider_request_failed",
            message: "provider 认证失败 https://sub2api.toioto.org/v1 sk-secret stack trace"
          },
          502
        )
      )
    });

    renderWorkbench();
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "一张安静的书桌" }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));

    expect(await screen.findByText("图片生成服务暂时不可用，请稍后再试。")).toBeTruthy();
    expect(screen.getByText("请调整 prompt 或稍后重试。")).toBeTruthy();
    expect(screen.queryByText(/sub2api\.toioto/)).toBeNull();
    expect(screen.queryByText(/sk-secret/)).toBeNull();
    expect(screen.queryByText(/stack trace/)).toBeNull();
  });

  it("用户消息编辑回填 prompt 和参数", async () => {
    mockFetchByRoute();

    renderWorkbench();
    fireEvent.click(await screen.findByRole("button", { name: "展开设置" }));
    fireEvent.change(screen.getByLabelText("尺寸"), { target: { value: "1536x1024" } });
    fireEvent.change(screen.getByLabelText("质量"), { target: { value: "medium" } });
    fireEvent.change(screen.getByLabelText("输出格式"), { target: { value: "webp" } });
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "横版社媒封面，蓝色玻璃质感" }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));
    await screen.findByRole("img", { name: "AI 生成图片" });

    fireEvent.change(screen.getByLabelText("Prompt"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "编辑用户消息" }));

    expect((screen.getByLabelText("Prompt") as HTMLTextAreaElement).value).toBe(
      "横版社媒封面，蓝色玻璃质感"
    );
    expect((screen.getByLabelText("尺寸") as HTMLSelectElement).value).toBe("1536x1024");
    expect((screen.getByLabelText("质量") as HTMLSelectElement).value).toBe("medium");
    expect((screen.getByLabelText("输出格式") as HTMLSelectElement).value).toBe("webp");
  });

  it("参考图消息编辑提示重新选择参考图，不回填 File", async () => {
    mockFetchByRoute();

    renderWorkbench();
    fireEvent.click(screen.getByRole("button", { name: "参考图" }));
    fireEvent.change(screen.getByLabelText("参考图文件"), {
      target: {
        files: [new File(["image"], "reference.png", { type: "image/png" })]
      }
    });
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "保留构图，改成清晨窗边光线" }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));
    await screen.findByRole("img", { name: "AI 生成图片" });

    fireEvent.click(screen.getByRole("button", { name: "编辑用户消息" }));

    expect(await screen.findByText("参考图需要重新选择。")).toBeTruthy();
    expect((screen.getByLabelText("参考图文件") as HTMLInputElement).files?.length ?? 0).toBe(0);
  });

  it("模板分类入口打开 Modal，使用模板写入输入框且不调用生成 API", async () => {
    const fetchMock = mockFetchByRoute();

    renderWorkbench();
    fireEvent.click(await screen.findByRole("button", { name: "打开模板分类 电商产品" }));

    const modal = await screen.findByRole("dialog", { name: "电商产品模板" });
    fireEvent.click(within(modal).getByRole("button", { name: "电商白底质感主图" }));
    fireEvent.change(within(modal).getByLabelText("商品名称"), {
      target: { value: "透明玻璃杯" }
    });
    fireEvent.change(within(modal).getByLabelText("核心卖点"), {
      target: { value: "耐热玻璃" }
    });
    fireEvent.click(within(modal).getByRole("button", { name: "使用模板" }));

    expect((screen.getByLabelText("Prompt") as HTMLTextAreaElement).value).toContain(
      "透明玻璃杯"
    );
    expect((screen.getByLabelText("Prompt") as HTMLTextAreaElement).value).toContain(
      "耐热玻璃"
    );
    expect(fetchMock.mock.calls.some(([url]) => url === "/api/images/generations")).toBe(false);
    expect(fetchMock.mock.calls.some(([url]) => url === "/api/images/edits")).toBe(false);
  });

  it("AI 图片消息重新生成使用消息关联 prompt 和参数调用生成 API", async () => {
    const fetchMock = mockFetchByRoute();

    renderWorkbench();
    fireEvent.click(await screen.findByRole("button", { name: "展开设置" }));
    fireEvent.change(screen.getByLabelText("尺寸"), { target: { value: "1536x1024" } });
    fireEvent.change(screen.getByLabelText("质量"), { target: { value: "medium" } });
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "横版社媒封面，蓝色玻璃质感" }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));
    await screen.findByRole("img", { name: "AI 生成图片" });

    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "这个草稿不应该用于重新生成" }
    });
    fireEvent.click(screen.getByRole("button", { name: "重新生成" }));
    await waitFor(() => {
      expect(generationCalls(fetchMock).length).toBe(2);
    });

    const body = JSON.parse(String(generationCalls(fetchMock)[1][1]?.body));
    expect(body).toMatchObject({
      prompt: "横版社媒封面，蓝色玻璃质感",
      size: "1536x1024",
      quality: "medium"
    });
  });

  it("AI 图片消息保存配置打开 Modal，recipe 请求不包含图片、base64 或参考图", async () => {
    const fetchMock = mockFetchByRoute({
      afterSaveLibrary: createTemplateLibraryResponse({ mine: [mineTemplate] })
    });

    renderWorkbench();
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "透明玻璃杯，产品摄影" }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));
    await screen.findByRole("img", { name: "AI 生成图片" });
    fireEvent.click(screen.getByRole("button", { name: "保存配置" }));

    const modal = await screen.findByRole("dialog", { name: "保存配置" });
    fireEvent.change(within(modal).getByLabelText("配置名称"), {
      target: { value: "玻璃杯配置" }
    });
    fireEvent.click(within(modal).getByRole("button", { name: "保存" }));

    await screen.findByText("配置已保存。");
    const recipeCall = fetchMock.mock.calls.find(([url]) => url === "/api/recipes");
    expect(recipeCall).toBeTruthy();
    const body = JSON.parse(String(recipeCall?.[1]?.body));
    expect(body).toMatchObject({
      title: "玻璃杯配置",
      prompt: "透明玻璃杯，产品摄影",
      mode: "text-to-image",
      provider: "sub2api",
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      output_format: "png",
      reference_mode: null
    });
    expect(body).not.toHaveProperty("image");
    expect(body).not.toHaveProperty("b64_json");
    expect(body).not.toHaveProperty("base64");
    expect(body).not.toHaveProperty("thumbnail");
    expect(body).not.toHaveProperty("referenceImage");
    expect(body).not.toHaveProperty("reference_preview");
  });

  it("页面不渲染 provider baseUrl、apiKeyEnv 或 API key", async () => {
    mockFetchByRoute();

    renderWorkbench();
    await screen.findByRole("complementary", { name: "工作台侧边栏" });

    expect(screen.queryByText(/https:\/\/sub2api\.toioto\.org/)).toBeNull();
    expect(screen.queryByText(/apiKeyEnv/)).toBeNull();
    expect(screen.queryByText(/SUB2API_API_KEY/)).toBeNull();
    expect(screen.queryByText(/sk-secret/)).toBeNull();
  });
});

type MockFetchOptions = {
  initialLibrary?: unknown;
  afterSaveLibrary?: unknown;
  generationResponse?: Promise<Response>;
  editResponse?: Promise<Response>;
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
      return options.generationResponse ?? Promise.resolve(successGenerationResponse());
    }

    if (url === "/api/images/edits") {
      return (
        options.editResponse ??
        Promise.resolve(
          jsonResponse({
            image: { b64_json: tinyPng, output_format: "webp" },
            meta: { daily_usage: { generation_count: 1, limit: 20 } }
          })
        )
      );
    }

    if (url === "/api/recipes") {
      return Promise.resolve(
        jsonResponse({
          recipe: { id: "recipe_saved", title: "玻璃杯配置" }
        })
      );
    }

    return Promise.reject(new Error(`未 mock 的请求：${url}`));
  });

  return fetchMock;
}

function generationCalls(fetchMock: ReturnType<typeof mockFetchByRoute>) {
  return fetchMock.mock.calls.filter(([url]) => url === "/api/images/generations");
}

function createTemplateLibraryResponse(overrides: { mine?: unknown[] } = {}) {
  return {
    categories: [
      { id: "ecommerce-product", name: "电商产品", description: "商品主图" },
      { id: "social-cover", name: "社媒封面", description: "封面和活动图" },
      { id: "infographic", name: "信息图表", description: "知识卡片" }
    ],
    templates: {
      builtin: [ecommerceTemplate, infographicTemplate],
      mine: overrides.mine ?? []
    },
    favorite_template_ids: [infographicTemplate.id]
  };
}

function successGenerationResponse(): Response {
  return jsonResponse({
    image: { b64_json: tinyPng, output_format: "png" },
    meta: { daily_usage: { generation_count: 1, limit: 20 } }
  });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
}
