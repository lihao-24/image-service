import { createHmac } from "node:crypto";
import { Readable } from "node:stream";
import qiniu from "qiniu";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadTemporaryImage } from "@/lib/images/qiniu";

const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";
const context = { requestId: "img_test", providerId: "test-provider" };
const result = { b64Json: png, raw: {} };

function uploadResponse(statusCode = 200) {
  return {
    data: { key: "uploaded", hash: "test-hash" },
    resp: { statusCode },
    ok: () => statusCode >= 200 && statusCode < 300,
    needRetry: () => false
  } as qiniu.httpc.ResponseWrapper;
}

beforeEach(() => {
  vi.stubEnv("QINIU_ACCESS_KEY", "test-access-key");
  vi.stubEnv("QINIU_SECRET_KEY", "test-secret-key");
  vi.spyOn(qiniu.form_up.FormUploader.prototype, "putStream").mockResolvedValue(uploadResponse());
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("七牛图片交付", () => {
  it.each([["", ""], ["test-access-key", ""], ["", "test-secret-key"]])(
    "凭据不完整时跳过上传并保持原响应路径 (%s, %s)", async (access, secret) => {
      vi.stubEnv("QINIU_ACCESS_KEY", access);
      vi.stubEnv("QINIU_SECRET_KEY", secret);
      expect(await uploadTemporaryImage(result, context)).toBeNull();
      expect(qiniu.form_up.FormUploader.prototype.putStream).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    }
  );

  it("将解码后的图片上传到限定桶，返回已签名的展示和附件 URL", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-17T12:00:00Z"));
    let uploaded: Buffer | undefined;
    vi.mocked(qiniu.form_up.FormUploader.prototype.putStream).mockImplementation(
      async (token, key, stream, extra) => {
        const policy = JSON.parse(Buffer.from(token.split(":")[2], "base64url").toString());
        expect(policy.scope).toBe(`lihao66:${key}`);
        expect(key).toMatch(/^focal\/2026-11-17\/[0-9a-f-]{36}\.png$/);
        expect(extra?.mimeType).toBe("image/png");
        const chunks = [];
        for await (const chunk of stream as Readable) chunks.push(chunk);
        uploaded = Buffer.concat(chunks);
        return uploadResponse();
      }
    );
    const image = await uploadTemporaryImage(result, context);
    expect(uploaded).toEqual(Buffer.from(png, "base64"));
    expect(image?.output_format).toBe("png");
    expect(image).not.toHaveProperty("b64_json");
    for (const value of [image!.url, image!.download_url]) {
      const url = new URL(value);
      expect(url.origin).toBe("https://img.lihao66.top");
      expect(url.searchParams.get("e")).toBe("1795089600");
      const unsigned = value.slice(0, value.indexOf("&token="));
      const signature = createHmac("sha1", "test-secret-key").update(unsigned)
        .digest("base64").replaceAll("+", "-").replaceAll("/", "_");
      expect(url.searchParams.get("token")).toBe(`test-access-key:${signature}`);
    }
    expect(new URL(image!.download_url).searchParams.get("attname")).toBe("focal-preview.png");
    expect(new URL(image!.url).searchParams.has("attname")).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    ["ffd8ffe000104a4649460001", "jpeg", "jpg"],
    ["524946460c0000005745425056503820", "webp", "webp"],
    ["47494638396101000100", "gif", "gif"]
  ])("缺少 MIME 时从字节识别格式 %s", async (hex, format, extension) => {
    const image = await uploadTemporaryImage({ b64Json: Buffer.from(hex, "hex").toString("base64"), raw: {} }, context);
    expect(image?.output_format).toBe(format);
    expect(new URL(image!.url).pathname).toMatch(new RegExp(`\\.${extension}$`));
  });

  it("实际图片字节优先于错误的 provider MIME", async () => {
    const image = await uploadTemporaryImage({ ...result, mimeType: "image/jpeg" }, context);
    expect(image?.output_format).toBe("png");
  });

  it("不认识的图片格式回退 base64，不上传伪造格式的文件", async () => {
    expect(await uploadTemporaryImage({ b64Json: "not-an-image", raw: {} }, context)).toBeNull();
    expect(qiniu.form_up.FormUploader.prototype.putStream).not.toHaveBeenCalled();
  });

  it.each([401, 500])("上传 HTTP %s 回退并只记录安全错误类别", async (status) => {
    vi.mocked(qiniu.form_up.FormUploader.prototype.putStream).mockResolvedValue(uploadResponse(status));
    expect(await uploadTemporaryImage(result, context)).toBeNull();
    expect(console.warn).toHaveBeenCalledWith("[image-service] CDN upload fallback", {
      ...context, errorCode: "qiniu_upload_failed"
    });
  });

  it("SDK 异常不泄露密钥、图片或签名链接", async () => {
    vi.mocked(qiniu.form_up.FormUploader.prototype.putStream).mockRejectedValue(
      new Error(`test-secret-key ${png} https://img.lihao66.top/private?token=secret`)
    );
    expect(await uploadTemporaryImage(result, context)).toBeNull();
    const logs = JSON.stringify(vi.mocked(console.warn).mock.calls);
    for (const secret of ["test-secret-key", png, "token=secret"]) expect(logs).not.toContain(secret);
    expect(logs).toContain("qiniu_upload_failed");
  });

  it("上传挂起十秒后回退、释放输入流并忽略迟到结果", async () => {
    vi.useFakeTimers();
    let finish!: (value: qiniu.httpc.ResponseWrapper) => void;
    let stream!: Readable;
    vi.mocked(qiniu.form_up.FormUploader.prototype.putStream).mockImplementation((_token, _key, input) => {
      stream = input as Readable;
      return new Promise((resolve) => { finish = resolve; });
    });
    const pending = uploadTemporaryImage(result, context);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(await pending).toBeNull();
    expect(stream.destroyed).toBe(true);
    expect(console.warn).toHaveBeenCalledWith("[image-service] CDN upload fallback", {
      ...context, errorCode: "qiniu_upload_timeout"
    });
    finish(uploadResponse());
    await vi.advanceTimersByTimeAsync(1);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
