import { describe, expect, it } from "vitest";
import {
  INVALID_REFERENCE_IMAGE,
  REFERENCE_IMAGE_ALLOWED_MIME_TYPES,
  REFERENCE_IMAGE_MAX_BYTES,
  validateTextToImageRequestBody,
  validateReferenceImageFormData
} from "@/lib/images";

const validFields = {
  provider: "sub2api",
  model: "gpt-image-2",
  prompt: "根据参考图生成一张产品海报",
  size: "1024x1536",
  quality: "high",
  output_format: "png"
};

function createForm(file?: File | null) {
  const form = new FormData();
  for (const [key, value] of Object.entries(validFields)) {
    form.set(key, value);
  }
  if (file !== null) {
    form.set(
      "image",
      file ?? new File(["bytes"], "reference.png", { type: "image/png" })
    );
  }
  return form;
}

describe("validateReferenceImageFormData", () => {
  it("文生图请求只要求 provider、model 和 prompt", () => {
    expect(
      validateTextToImageRequestBody({
        provider: "fastcode",
        model: "gpt-image-2-2k",
        prompt: "生成白底商品主图"
      })
    ).toMatchObject({ ok: true });
  });

  it("参考图请求不要求旧图片参数", () => {
    const formData = new FormData();
    formData.set("provider", "fastcode");
    formData.set("model", "gpt-image-2-2k");
    formData.set("prompt", "把参考图改成白底商品主图");
    formData.set("image", new File(["abc"], "reference.png", { type: "image/png" }));

    expect(validateReferenceImageFormData(formData)).toMatchObject({ ok: true });
  });

  it("接受常见图片 MIME 并保留内存中的 File", () => {
    for (const mimeType of REFERENCE_IMAGE_ALLOWED_MIME_TYPES) {
      const file = new File(["bytes"], `reference.${mimeType.split("/")[1]}`, {
        type: mimeType
      });

      const result = validateReferenceImageFormData(createForm(file));

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.body.image).toBe(file);
        expect(result.body.imageFilename).toBe(file.name);
      }
    }
  });

  it("缺少参考图、空文件、超出 10MB 或 MIME 不支持时返回 invalid_reference_image", () => {
    const cases = [
      createForm(null),
      createForm(new File([], "empty.png", { type: "image/png" })),
      createForm(
        new File([new Uint8Array(REFERENCE_IMAGE_MAX_BYTES + 1)], "large.png", {
          type: "image/png"
        })
      ),
      createForm(new File(["bytes"], "reference.gif", { type: "image/gif" }))
    ];

    for (const form of cases) {
      const result = validateReferenceImageFormData(form);

      expect(result).toMatchObject({
        ok: false,
        code: INVALID_REFERENCE_IMAGE,
        field: "image"
      });
    }
  });
});
