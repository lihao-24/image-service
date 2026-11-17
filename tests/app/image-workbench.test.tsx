// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import ImageWorkbench from "@/app/image-workbench";
import { formatUsage, usagePercent } from "@/app/workbench/helpers";
import type { PublicImageConfig } from "@/lib/config";

const publicConfig: PublicImageConfig = {
  defaultProviderId: "toioto",
  defaultModelId: "gpt-image-2",
  defaultProvider: "toioto",
  defaults: {
    model: "gpt-image-2",
    size: "auto",
    resolution: "auto",
    quality: "auto",
    outputFormat: "png",
    background: "auto",
    moderation: "auto"
  },
  providers: [
    {
      id: "toioto",
      label: "Toioto",
      models: [
        {
          id: "gpt-image-2",
          label: "GPT Image 2",
          family: "chatgpt",
          supportsTextToImage: true,
          supportsImageToImage: true
        }
      ]
    }
  ],
  options: {
    sizes: ["auto", "1:1", "3:2", "2:3", "16:9", "9:16"],
    resolutions: ["auto", "standard", "hd", "4k"],
    qualities: ["auto", "low", "medium", "high"],
    outputFormats: ["png", "jpeg", "webp"],
    backgrounds: ["auto", "opaque"],
    moderations: ["auto", "low"]
  }
};

const modeFallbackConfig: PublicImageConfig = {
  ...publicConfig,
  providers: [
    {
      id: "toioto",
      label: "Toioto",
      models: [
        {
          id: "text-only-model",
          label: "Text Only",
          family: "chatgpt",
          supportsTextToImage: true,
          supportsImageToImage: false
        },
        {
          id: "edit-capable-model",
          label: "Edit Capable",
          family: "chatgpt",
          supportsTextToImage: false,
          supportsImageToImage: true
        }
      ]
    }
  ],
  defaultModelId: "text-only-model",
  defaults: {
    ...publicConfig.defaults,
    model: "text-only-model"
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
    size: "3:2",
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

const imageEditIdPhotoTemplate = {
  source: "builtin",
  id: "builtin-image-edit-id-photo",
  title: "根据图片生成证件照",
  category: "image-edit",
  category_name: "图生图",
  tags: ["图生图", "证件照", "人像"],
  mode: "image-edit",
  recommended: {
    model: "gpt-image-2",
    size: "1024x1536",
    quality: "high",
    output_format: "jpeg",
    reference_mode: "single-image"
  },
  prompt: "基于上传人像照片生成一张标准证件照，保留人物身份特征，使用纯色背景。",
  variables: [],
  source_metadata: {
    type: "original",
    name: "Focal",
    referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
    note: "原创中文图生图模板。"
  },
  safety_notes: [],
  is_favorite: false
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
  size: "2:3",
  resolution: "standard",
  quality: "medium",
  output_format: "webp",
  background: "opaque",
  moderation: "low",
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

function renderWorkbenchWithConfig(config: PublicImageConfig) {
  return render(<ImageWorkbench config={config} userLabel="hao@example.com" />);
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

describe("workbench usage helpers", () => {
  it("格式化无限额和受限用量文案", () => {
    expect(formatUsage({ generation_count: 12, limit: null, limited: false })).toBe(
      "今日生成 12 次 · 不限额"
    );
    expect(formatUsage({ generation_count: 3, limit: 20, limited: true })).toBe(
      "今日额度 3/20"
    );
    expect(formatUsage({ generation_count: 0, limit: null, limited: false })).toBe("");
    expect(usagePercent("今日生成 12 次 · 不限额")).toBe(0);
    expect(usagePercent("今日额度 3/20")).toBe(15);
  });
});

describe("ImageWorkbench chat canvas", () => {
  it("桌面默认显示 sidebar，点击汉堡后完全隐藏", async () => {
    mockFetchByRoute();

    renderWorkbench();

    expect(await screen.findByRole("complementary", { name: "工作台侧边栏" })).toBeTruthy();
    const hideSidebarButton = screen.getByRole("button", { name: "隐藏侧边栏" });
    expect(hideSidebarButton.textContent?.trim()).toBe("");
    fireEvent.click(hideSidebarButton);

    expect(screen.queryByRole("complementary", { name: "工作台侧边栏" })).toBeNull();
    const showSidebarButton = screen.getByRole("button", { name: "显示侧边栏" });
    expect(showSidebarButton).toBeTruthy();
    expect(showSidebarButton.textContent?.trim()).toBe("");
  });

  it("顶部、生成和 AI 图片动作使用 icon-only 按钮但保留 aria-label", async () => {
    mockFetchByRoute();

    renderWorkbench();

    await screen.findByRole("complementary", { name: "工作台侧边栏" });
    expect(screen.getByRole("button", { name: "隐藏侧边栏" }).textContent?.trim()).toBe("");
    expect(screen.getByRole("button", { name: "更多" }).textContent?.trim()).toBe("");

    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "一张安静的书桌" }
    });
    const generateButton = screen.getByRole("button", { name: "生成图片" });
    expect(generateButton.textContent?.trim()).toBe("");
    fireEvent.click(generateButton);

    await screen.findByRole("img", { name: "AI 生成图片" });
    for (const label of ["下载", "重新生成", "保存配置"]) {
      const action =
        label === "下载"
          ? screen.getByRole("link", { name: label })
          : screen.getByRole("button", { name: label });
      expect(action.textContent?.trim()).toBe("");
    }
    const copyActions = screen.getAllByRole("button", { name: "复制 Prompt" });
    expect(copyActions.length).toBeGreaterThanOrEqual(2);
    copyActions.forEach((action) => {
      expect(action.textContent?.trim()).toBe("");
    });
  });

  it("侧边栏只展示供应商和模型选择，不展示旧参数控件", async () => {
    mockFetchByRoute();

    renderWorkbench();
    const sidebar = await screen.findByRole("complementary", { name: "工作台侧边栏" });

    expect(within(sidebar).getByLabelText("供应商")).toBeTruthy();
    expect(within(sidebar).getByLabelText("模型")).toBeTruthy();
    expect(within(sidebar).queryByLabelText("画面比例")).toBeNull();
    expect(within(sidebar).queryByLabelText("分辨率")).toBeNull();
    expect(within(sidebar).queryByLabelText("画质")).toBeNull();
    expect(within(sidebar).queryByLabelText("输出格式")).toBeNull();
    expect(within(sidebar).queryByLabelText("背景")).toBeNull();
    expect(within(sidebar).queryByLabelText("安全审核")).toBeNull();
  });

  it("侧边栏 provider/model 下拉选中值在窄侧栏内可截断", async () => {
    mockFetchByRoute();

    renderWorkbench();
    const sidebar = await screen.findByRole("complementary", { name: "工作台侧边栏" });
    const providerSelect = within(sidebar).getByLabelText("供应商");
    const modelSelect = within(sidebar).getByLabelText("模型");

    expect(providerSelect.className).toContain("min-w-0");
    expect(providerSelect.className).toContain("w-full");
    expect(providerSelect.className).toContain("max-w-full");
    expect(providerSelect.className).toContain("truncate");
    expect(modelSelect.className).toContain("min-w-0");
    expect(modelSelect.className).toContain("w-full");
    expect(modelSelect.className).toContain("max-w-full");
    expect(modelSelect.className).toContain("truncate");
  });

  it("移动端侧边栏使用 drawer 语义，遮罩和关闭按钮可关闭", async () => {
    mockFetchByRoute();
    window.innerWidth = 375;

    renderWorkbench();

    await screen.findByText("今天想生成什么？");
    expect(screen.queryByRole("complementary", { name: "工作台侧边栏" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "显示侧边栏" }));

    expect(screen.getByRole("complementary", { name: "工作台侧边栏" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "关闭侧边栏遮罩" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "关闭侧边栏面板" }));

    expect(screen.queryByRole("complementary", { name: "工作台侧边栏" })).toBeNull();
  });

  it("初始空状态显示，首次生成后插入用户消息和 AI loading，并清空输入框", async () => {
    const deferred = createDeferred<Response>();
    mockFetchByRoute({ generationResponse: deferred.promise });

    renderWorkbench();

    expect(await screen.findByText("今天想生成什么？")).toBeTruthy();
    expect(screen.queryByText("Focal workspace")).toBeNull();
    const promptInput = screen.getByLabelText("Prompt") as HTMLTextAreaElement;
    fireEvent.change(promptInput, { target: { value: "一只透明玻璃杯，柔和自然光" } });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));

    expect(screen.queryByText("今天想生成什么？")).toBeNull();
    expect(screen.getByText("一只透明玻璃杯，柔和自然光")).toBeTruthy();
    expect(screen.getByText("AI 正在生成图片...")).toBeTruthy();
    expect(screen.getByLabelText("图片生成占位状态")).toBeTruthy();
    expect(promptInput.value).toBe("");

    deferred.resolve(successGenerationResponse());
    await screen.findByRole("img", { name: "AI 生成图片" });
  });

  it("文生图成功后 loading 替换为 AI 图片消息", async () => {
    const fetchMock = mockFetchByRoute();

    renderWorkbench();
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "生成白底商品主图" }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));

    const image = await screen.findByRole("img", { name: "AI 生成图片" });
    expect(image.getAttribute("src")).toBe(`data:image/png;base64,${tinyPng}`);
    expect(screen.queryByText("AI 正在生成图片...")).toBeNull();
    expect(screen.getByRole("button", { name: "保存配置" })).toBeTruthy();
    expect(generationCalls(fetchMock)[0][1]?.method).toBe("POST");
    expect(generationCalls(fetchMock)[0][1]?.headers).toEqual({
      "Content-Type": "application/json"
    });
    expect(JSON.parse(String(generationCalls(fetchMock)[0][1]?.body))).toEqual({
      provider: "toioto",
      model: "gpt-image-2",
      prompt: "生成白底商品主图"
    });
  });

  it.each([undefined, tinyPng])("CDN URL 优先展示、预览并使用独立附件链接下载 (%s)", async (base64) => {
    const url = "https://img.lihao66.top/focal/test.png?e=123&token=preview";
    const downloadUrl = "https://img.lihao66.top/focal/test.png?attname=focal-preview.png&e=123&token=download";
    mockFetchByRoute({ generationResponse: Promise.resolve(jsonResponse({
      image: { url, download_url: downloadUrl, b64_json: base64, output_format: "png" }
    })) });
    renderWorkbench();
    fireEvent.change(screen.getByLabelText("Prompt"), { target: { value: "CDN 测试图片" } });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));
    const image = await screen.findByRole("img", { name: "AI 生成图片" });
    expect(image.getAttribute("src")).toBe(url);
    expect(screen.getByRole("link", { name: "下载" }).getAttribute("href")).toBe(downloadUrl);
    fireEvent.click(image);
    const dialog = screen.getByRole("dialog", { name: "图片预览" });
    expect(within(dialog).getByRole("img", { name: "AI 生成图片预览" }).getAttribute("src")).toBe(url);
  });

  it("点击聊天图片后打开大图预览并可关闭", async () => {
    mockFetchByRoute();

    renderWorkbench();
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "一张安静的书桌" }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));

    const image = await screen.findByRole("img", { name: "AI 生成图片" });
    fireEvent.click(image);

    const preview = screen.getByRole("dialog", { name: "图片预览" });
    expect(
      within(preview).getByRole("img", { name: "AI 生成图片预览" }).getAttribute("src")
    ).toBe(`data:image/png;base64,${tinyPng}`);

    fireEvent.click(within(preview).getByRole("button", { name: "关闭预览" }));
    expect(screen.queryByRole("dialog", { name: "图片预览" })).toBeNull();
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
    expect(screen.getByRole("button", { name: "编辑失败请求" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "复制失败请求 Prompt" })).toBeTruthy();
    expect(screen.queryByText(/sub2api\.toioto/)).toBeNull();
    expect(screen.queryByText(/sk-secret/)).toBeNull();
    expect(screen.queryByText(/stack trace/)).toBeNull();
  });

  it("失败消息可回填 prompt，便于调整后重试", async () => {
    mockFetchByRoute({
      generationResponse: Promise.resolve(
        jsonResponse({ error: "provider_request_failed", message: "provider failed" }, 502)
      )
    });

    renderWorkbench();
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "一张安静的书桌" }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));

    await screen.findByText("图片生成服务暂时不可用，请稍后再试。");
    fireEvent.click(screen.getByRole("button", { name: "编辑失败请求" }));

    expect((screen.getByLabelText("Prompt") as HTMLTextAreaElement).value).toBe(
      "一张安静的书桌"
    );
  });

  it("用户消息编辑回填 prompt 和供应商模型", async () => {
    mockFetchByRoute();

    renderWorkbench();
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
    expect((screen.getByLabelText("供应商") as HTMLSelectElement).value).toBe("toioto");
    expect((screen.getByLabelText("模型") as HTMLSelectElement).value).toBe("gpt-image-2");
  });

  it("图生图消息编辑提示重新选择参考图，不回填 File", async () => {
    mockFetchByRoute();

    renderWorkbench();
    fireEvent.click(screen.getAllByRole("button", { name: "图生图" }).at(-1)!);
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

    expect(screen.getByRole("img", { name: "参考图缩略图" }).getAttribute("src")).toBe(
      "blob:reference-preview"
    );
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith("blob:reference-preview");

    fireEvent.click(screen.getByRole("button", { name: "编辑用户消息" }));

    expect(await screen.findByText("参考图需要重新选择。")).toBeTruthy();
    expect((screen.getByLabelText("参考图文件") as HTMLInputElement).files?.length ?? 0).toBe(0);
  });

  it("初始拉取今日用量并可打开用量弹窗", async () => {
    mockFetchByRoute({
      usageResponse: {
        usage: {
          date: "2026-05-19",
          generation_count: 2,
          limit: null,
          limited: false
        }
      }
    });

    renderWorkbench();

    expect(await screen.findByText("今日生成 2 次 · 不限额")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "查看今日用量" }));

    expect(screen.getByRole("dialog", { name: "今日用量" })).toBeTruthy();
    expect(screen.getByText("GPT Image 系列当前仅统计用量，不做每日额度拦截。")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "关闭" }));
    expect(screen.queryByRole("dialog", { name: "今日用量" })).toBeNull();
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

    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));
    await screen.findByRole("img", { name: "AI 生成图片" });
    const body = JSON.parse(String(generationCalls(fetchMock)[0][1]?.body));
    expect(body).toEqual({
      provider: "toioto",
      model: "gpt-image-2",
      prompt: "为「透明玻璃杯」生成一张电商主图，突出「耐热玻璃」，纯净浅色背景，商品居中，柔和棚拍光。"
    });
  });

  it("主页和侧边栏图生图入口打开带模板内容的 Modal", async () => {
    mockFetchByRoute();

    renderWorkbench();
    const quickActions = await screen.findAllByRole("button", { name: "图生图" });
    fireEvent.click(quickActions[0]);

    const modal = await screen.findByRole("dialog", { name: "图生图模板" });
    expect(within(modal).getByRole("button", { name: "根据图片生成证件照" })).toBeTruthy();
    fireEvent.click(within(modal).getByRole("button", { name: "关闭" }));

    const sidebar = await screen.findByRole("complementary", { name: "工作台侧边栏" });
    expect(within(sidebar).getByRole("button", { name: "打开模板分类 图生图" })).toBeTruthy();

    fireEvent.click(within(sidebar).getByRole("button", { name: "打开模板分类 图生图" }));
    const sidebarModal = await screen.findByRole("dialog", { name: "图生图模板" });
    expect(within(sidebarModal).getByRole("button", { name: "根据图片生成证件照" })).toBeTruthy();
  });

  it("应用图生图模板时 provider/model 不可用会按目标模式回退模型", async () => {
    const fetchMock = mockFetchByRoute({
      initialLibrary: createTemplateLibraryResponse({
        mine: [
          {
            ...mineTemplate,
            id: "recipe_edit_unsupported",
            title: "旧图生图配置",
            mode: "image-edit",
            provider: "missing-provider",
            model: "missing-model",
            reference_mode: "single-image"
          }
        ]
      })
    });

    renderWorkbenchWithConfig(modeFallbackConfig);
    const sidebar = await screen.findByRole("complementary", { name: "工作台侧边栏" });
    expect((within(sidebar).getByLabelText("模型") as HTMLSelectElement).value).toBe(
      "text-only-model"
    );

    fireEvent.click(within(sidebar).getByRole("button", { name: "我的" }));
    fireEvent.click(within(sidebar).getByRole("button", { name: "打开我的模板 旧图生图配置" }));
    const modal = await screen.findByRole("dialog", { name: "我的模板" });
    fireEvent.click(within(modal).getByRole("button", { name: "旧图生图配置" }));
    fireEvent.click(within(modal).getByRole("button", { name: "使用模板" }));

    expect((screen.getByLabelText("模型") as HTMLSelectElement).value).toBe("edit-capable-model");
    fireEvent.change(screen.getByLabelText("参考图文件"), {
      target: {
        files: [new File(["image"], "reference.png", { type: "image/png" })]
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));
    await screen.findByRole("img", { name: "AI 生成图片" });

    const editBody = fetchMock.mock.calls.find(([url]) => url === "/api/images/edits")?.[1]
      ?.body as FormData;
    expect(editBody.get("provider")).toBe("toioto");
    expect(editBody.get("model")).toBe("edit-capable-model");
    expect(editBody.get("prompt")).toBe("透明玻璃杯，产品摄影，浅色背景");
    expect(editBody.get("image")).toBeInstanceOf(File);
    expect(Array.from(editBody.keys()).sort()).toEqual(["image", "model", "prompt", "provider"]);
  });

  it("切换到图生图时自动选择支持图生图的模型并提交", async () => {
    const fetchMock = mockFetchByRoute();

    renderWorkbenchWithConfig(modeFallbackConfig);
    expect((screen.getByLabelText("模型") as HTMLSelectElement).value).toBe("text-only-model");

    fireEvent.click(screen.getAllByRole("button", { name: "图生图" }).at(-1)!);

    const modelSelect = screen.getByLabelText("模型") as HTMLSelectElement;
    expect(modelSelect.value).toBe("edit-capable-model");
    expect(Array.from(modelSelect.options).map((option) => option.value)).toEqual([
      "edit-capable-model"
    ]);

    fireEvent.change(screen.getByLabelText("参考图文件"), {
      target: {
        files: [new File(["image"], "reference.png", { type: "image/png" })]
      }
    });
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "保留构图改成清晨光线" }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));

    await screen.findByRole("img", { name: "AI 生成图片" });
    const editBody = fetchMock.mock.calls.find(([url]) => url === "/api/images/edits")?.[1]
      ?.body as FormData;
    expect(editBody.get("provider")).toBe("toioto");
    expect(editBody.get("model")).toBe("edit-capable-model");
    expect(editBody.get("prompt")).toBe("保留构图改成清晨光线");
    expect(editBody.get("image")).toBeInstanceOf(File);
  });

  it("移动端模板 Modal 使用整窗滚动避免内容被裁切", async () => {
    mockFetchByRoute();
    window.innerWidth = 375;

    renderWorkbench();
    await screen.findByText("今天想生成什么？");
    fireEvent.click(screen.getByRole("button", { name: "显示侧边栏" }));
    fireEvent.click(await screen.findByRole("button", { name: "打开模板分类 电商产品" }));

    const modal = await screen.findByRole("dialog", { name: "电商产品模板" });
    const overlay = modal.parentElement;

    expect(overlay?.className).toContain("max-md:items-start");
    expect(overlay?.className).toContain("max-md:overflow-y-auto");
    expect(modal.className).toContain("max-md:max-h-none");
    expect(modal.className).toContain("max-md:overflow-visible");
  });

  it("默认和我的模板按钮只切换侧边栏列表，不打开 Modal", async () => {
    mockFetchByRoute({
      initialLibrary: createTemplateLibraryResponse({ mine: [mineTemplate] })
    });

    renderWorkbench();
    const sidebar = await screen.findByRole("complementary", { name: "工作台侧边栏" });

    expect(within(sidebar).getByRole("button", { name: "默认" })).toBeTruthy();
    expect(within(sidebar).getByRole("button", { name: "我的" })).toBeTruthy();
    expect(within(sidebar).getByRole("button", { name: "打开模板分类 电商产品" })).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(within(sidebar).getByRole("button", { name: "我的" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(within(sidebar).getByRole("button", { name: "打开我的模板 我的玻璃杯配置" })).toBeTruthy();
    expect(within(sidebar).queryByRole("button", { name: "打开模板分类 电商产品" })).toBeNull();

    fireEvent.click(within(sidebar).getByRole("button", { name: "默认" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(within(sidebar).getByRole("button", { name: "打开模板分类 电商产品" })).toBeTruthy();
    expect(within(sidebar).queryByRole("button", { name: "打开我的模板 我的玻璃杯配置" })).toBeNull();
  });

  it("侧边栏模板列表限制横向溢出并截断长文本", async () => {
    mockFetchByRoute({
      initialLibrary: createTemplateLibraryResponse({
        categories: [
          {
            id: "ecommerce-product",
            name: "很长很长的电商产品分类名称用于验证侧边栏不会被撑宽",
            description: "这是一段很长很长的分类描述文本，用于验证模板侧边栏内容超出时隐藏并显示省略号。"
          }
        ]
      })
    });

    renderWorkbench();
    const sidebar = await screen.findByRole("complementary", { name: "工作台侧边栏" });
    const templateButton = within(sidebar).getByRole("button", {
      name: "打开模板分类 很长很长的电商产品分类名称用于验证侧边栏不会被撑宽"
    });
    const scrollContainer = templateButton.closest("[data-template-scroll]");
    const title = within(templateButton).getByText("很长很长的电商产品分类名称用于验证侧边栏不会被撑宽");
    const description = within(templateButton).getByText(
      "这是一段很长很长的分类描述文本，用于验证模板侧边栏内容超出时隐藏并显示省略号。"
    );

    expect(scrollContainer?.className).toContain("overflow-x-hidden");
    expect(scrollContainer?.className).toContain("min-w-0");
    expect(templateButton.className).toContain("w-full");
    expect(templateButton.className).toContain("min-w-0");
    expect(templateButton.className).toContain("overflow-hidden");
    expect(title.className).toContain("truncate");
    expect(description.className).toContain("truncate");
  });

  it("侧边栏模板区保留固定头部并使用更紧凑按钮尺寸", async () => {
    mockFetchByRoute();

    renderWorkbench();
    const sidebar = await screen.findByRole("complementary", { name: "工作台侧边栏" });
    const templateRegion = within(sidebar).getByRole("region", { name: "模板" });
    const scrollContainer = templateRegion.querySelector("[data-template-scroll]");
    const defaultButton = within(templateRegion).getByRole("button", { name: "默认" });
    const categoryButton = within(templateRegion).getByRole("button", { name: "打开模板分类 电商产品" });

    expect(templateRegion.className).toContain("min-h-[220px]");
    expect(templateRegion.className).toContain("overflow-hidden");
    expect(scrollContainer?.className).toContain("flex-1");
    expect(scrollContainer?.className).toContain("overflow-y-auto");
    expect(scrollContainer?.className).toContain("template-scrollbar");
    expect(defaultButton.className).toContain("min-h-9");
    expect(categoryButton.className).toContain("min-h-10");
  });

  it("我的模板列表为空时显示简短空状态", async () => {
    mockFetchByRoute();

    renderWorkbench();
    const sidebar = await screen.findByRole("complementary", { name: "工作台侧边栏" });

    fireEvent.click(within(sidebar).getByRole("button", { name: "我的" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(within(sidebar).getByText("暂无我的模板")).toBeTruthy();
  });

  it("AI 图片消息重新生成使用消息关联 prompt 和供应商模型调用生成 API", async () => {
    const fetchMock = mockFetchByRoute();

    renderWorkbench();
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
    expect(body).toEqual({
      provider: "toioto",
      model: "gpt-image-2",
      prompt: "横版社媒封面，蓝色玻璃质感",
    });
  });

  it("从文生图状态编辑图生图历史消息会保留图生图模型", async () => {
    const fetchMock = mockFetchByRoute();

    renderWorkbenchWithConfig(modeFallbackConfig);
    fireEvent.click(screen.getAllByRole("button", { name: "图生图" }).at(-1)!);
    fireEvent.change(screen.getByLabelText("参考图文件"), {
      target: {
        files: [new File(["image"], "reference.png", { type: "image/png" })]
      }
    });
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "保留构图改成清晨光线" }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));
    await screen.findByRole("img", { name: "AI 生成图片" });

    fireEvent.click(screen.getByRole("button", { name: "文生图" }));
    expect((screen.getByLabelText("模型") as HTMLSelectElement).value).toBe("text-only-model");
    fireEvent.click(screen.getByRole("button", { name: "编辑用户消息" }));

    expect((screen.getByLabelText("模型") as HTMLSelectElement).value).toBe("edit-capable-model");
    expect(await screen.findByText("参考图需要重新选择。")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("参考图文件"), {
      target: {
        files: [new File(["image-2"], "reference-2.png", { type: "image/png" })]
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));

    await waitFor(() => {
      expect(fetchMock.mock.calls.filter(([url]) => url === "/api/images/edits").length).toBe(2);
    });
    const editBodies = fetchMock.mock.calls
      .filter(([url]) => url === "/api/images/edits")
      .map(([, init]) => init?.body as FormData);
    expect(editBodies[1].get("provider")).toBe("toioto");
    expect(editBodies[1].get("model")).toBe("edit-capable-model");
    expect(editBodies[1].get("prompt")).toBe("保留构图改成清晨光线");
    expect(editBodies[1].get("image")).toBeInstanceOf(File);
  });

  it("图生图提交前压缩参考图但预览仍使用原始文件 URL", async () => {
    const fetchMock = mockFetchByRoute();
    const originalCreateElement = document.createElement.bind(document);
    const drawImage = vi.fn();
    const close = vi.fn();
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => ({
        width: 4096,
        height: 2048,
        close
      }))
    );
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: () => ({ drawImage }),
          toBlob: (callback: BlobCallback) =>
            callback(new Blob(["compressed-reference"], { type: "image/jpeg" }))
        } as unknown as HTMLCanvasElement;
      }

      return originalCreateElement(tagName);
    });

    renderWorkbench();
    fireEvent.click(screen.getAllByRole("button", { name: "图生图" }).at(-1)!);
    const originalFile = new File([new Uint8Array(5 * 1024 * 1024)], "reference.png", {
      type: "image/png"
    });
    fireEvent.change(screen.getByLabelText("参考图文件"), {
      target: { files: [originalFile] }
    });
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "保留构图，改成清晨窗边光线" }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));

    await screen.findByRole("img", { name: "AI 生成图片" });
    const editBody = fetchMock.mock.calls.find(([url]) => url === "/api/images/edits")?.[1]
      ?.body as FormData;
    const uploadedFile = editBody.get("image") as File;

    expect(createImageBitmap).toHaveBeenCalledWith(originalFile);
    expect(drawImage).toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
    expect(uploadedFile).toBeInstanceOf(File);
    expect(uploadedFile.name).toBe("reference.jpg");
    expect(uploadedFile.type).toBe("image/jpeg");
    expect(uploadedFile).not.toBe(originalFile);
    expect(screen.getByRole("img", { name: "参考图缩略图" }).getAttribute("src")).toBe(
      "blob:reference-preview"
    );
  });

  it("参考图长文件名会被截断且保留完整 title", async () => {
    mockFetchByRoute();

    renderWorkbench();
    fireEvent.click(screen.getAllByRole("button", { name: "图生图" }).at(-1)!);
    const fileName =
      "this-is-a-very-long-reference-image-name-used-to-verify-mobile-truncation.png";
    fireEvent.change(screen.getByLabelText("参考图文件"), {
      target: {
        files: [new File(["image"], fileName, { type: "image/png" })]
      }
    });

    const fileChip = screen.getByTitle(fileName);
    expect(fileChip.className).toContain("truncate");
    expect(fileChip.textContent).toContain(fileName);
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
      provider: "toioto",
      model: "gpt-image-2",
      reference_mode: null
    });
    expect(body).not.toHaveProperty("size");
    expect(body).not.toHaveProperty("resolution");
    expect(body).not.toHaveProperty("quality");
    expect(body).not.toHaveProperty("output_format");
    expect(body).not.toHaveProperty("background");
    expect(body).not.toHaveProperty("moderation");
    expect(body).not.toHaveProperty("image");
    expect(body).not.toHaveProperty("b64_json");
    expect(body).not.toHaveProperty("base64");
    expect(body).not.toHaveProperty("thumbnail");
    expect(body).not.toHaveProperty("referenceImage");
    expect(body).not.toHaveProperty("reference_preview");
  });

  it("保存配置时保存按钮展示禁用加载态", async () => {
    const deferred = createDeferred<Response>();
    mockFetchByRoute({
      recipeResponse: deferred.promise,
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
    fireEvent.click(within(modal).getByRole("button", { name: "保存" }));

    const savingButton = within(modal).getByRole("button", { name: "保存中..." });
    expect(savingButton).toHaveProperty("disabled", true);

    deferred.resolve(jsonResponse({ recipe: { id: "recipe_saved", title: "玻璃杯配置" } }));
    await screen.findByText("配置已保存。");
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
  usageResponse?: unknown;
  generationResponse?: Promise<Response>;
  editResponse?: Promise<Response>;
  recipeResponse?: Promise<Response>;
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

    if (url === "/api/usage") {
      return Promise.resolve(
        jsonResponse(
          options.usageResponse ?? {
            usage: { date: "2026-05-19", generation_count: 0, limit: null, limited: false }
          }
        )
      );
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
            meta: { daily_usage: { generation_count: 1, limit: null, limited: false } }
          })
        )
      );
    }

    if (url === "/api/recipes") {
      return (
        options.recipeResponse ??
        Promise.resolve(
          jsonResponse({
            recipe: { id: "recipe_saved", title: "玻璃杯配置" }
          })
        )
      );
    }

    return Promise.reject(new Error(`未 mock 的请求：${url}`));
  });

  return fetchMock;
}

function generationCalls(fetchMock: ReturnType<typeof mockFetchByRoute>) {
  return fetchMock.mock.calls.filter(([url]) => url === "/api/images/generations");
}

function createTemplateLibraryResponse(
  overrides: { categories?: unknown[]; mine?: unknown[] } = {}
) {
  return {
    categories: overrides.categories ?? [
      { id: "ecommerce-product", name: "电商产品", description: "商品主图" },
      { id: "ui-interface", name: "UI与界面", description: "应用界面和社媒截图" },
      { id: "image-edit", name: "图生图", description: "参考图转换和人像改造" },
      { id: "infographic", name: "信息图表", description: "知识卡片" }
    ],
    templates: {
      builtin: [ecommerceTemplate, infographicTemplate, imageEditIdPhotoTemplate],
      mine: overrides.mine ?? []
    },
    favorite_template_ids: [infographicTemplate.id]
  };
}

function successGenerationResponse(): Response {
  return jsonResponse({
    image: { b64_json: tinyPng, output_format: "png" },
    meta: { daily_usage: { generation_count: 1, limit: null, limited: false } }
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
