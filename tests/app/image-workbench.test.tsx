// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    sizes: ["1024x1024", "1024x1536"],
    qualities: ["high", "medium"],
    outputFormats: ["png", "webp"]
  }
};

const tinyPng =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";

function renderWorkbench() {
  return render(<ImageWorkbench config={publicConfig} userLabel="hao@example.com" />);
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
  it("使用服务端 allowlist 渲染参数控件", () => {
    renderWorkbench();

    expect(screen.getByRole("option", { name: "gpt-image-2" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "gpt-image-mini" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "1024x1536" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "webp" })).toBeTruthy();
    expect(screen.queryByText("https://sub2api.toioto.org")).toBeNull();
    expect(screen.queryByText("apiKeyEnv")).toBeNull();
  });

  it("文生图成功后展示临时预览且不会自动保存配置", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
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
    );

    renderWorkbench();
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "一只透明玻璃杯，柔和自然光" }
    });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));

    const preview = await screen.findByAltText("当前生成图片预览");
    expect(preview.getAttribute("src")).toBe(`data:image/png;base64,${tinyPng}`);
    expect(screen.getByText("生成成功，图片仅保留在当前浏览器页面。")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/images/generations",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock.mock.calls.some(([url]) => url === "/api/recipes")).toBe(false);
  });

  it("只有点击保存配置才调用 recipe API", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        recipe: { id: "recipe_1", title: "透明玻璃杯" }
      })
    );

    renderWorkbench();
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "透明玻璃杯，产品摄影" }
    });
    fireEvent.change(screen.getByLabelText("配置名称"), {
      target: { value: "透明玻璃杯" }
    });
    fireEvent.click(screen.getByRole("button", { name: "保存配置" }));

    await screen.findByText("配置已保存。");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/recipes",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
    );
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
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
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
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
    );

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
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          error: "provider_request_failed",
          message: "provider 认证失败 https://sub2api.toioto.org/v1 sk-secret stack trace"
        },
        502
      )
    );

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

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
