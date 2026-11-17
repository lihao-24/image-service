import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import qiniu from "qiniu";
import type { ProviderImageResult } from "@/lib/providers";

const BUCKET = "lihao66";
const CDN_ORIGIN = "https://img.lihao66.top";
const UPLOAD_TIMEOUT_MS = 10_000;
const DOWNLOAD_LIFETIME_SECONDS = 48 * 60 * 60;

// SDK transport timeout also bounds requests still settling after our overall deadline.
qiniu.conf.RPC_TIMEOUT = UPLOAD_TIMEOUT_MS;

type CloudImage = {
  url: string;
  download_url: string;
  output_format: string;
};

type UploadContext = { requestId: string; providerId: string };

export async function uploadTemporaryImage(
  result: ProviderImageResult,
  context: UploadContext
): Promise<CloudImage | null> {
  const accessKey = process.env.QINIU_ACCESS_KEY?.trim();
  const secretKey = process.env.QINIU_SECRET_KEY?.trim();
  if (!accessKey || !secretKey) {
    return null;
  }

  let stream: Readable | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutError = new Error("qiniu_upload_timeout");

  try {
    const bytes = Buffer.from(result.b64Json, "base64");
    const format = detectImageFormat(bytes);
    if (!format) {
      throw new Error("unsupported_image_format");
    }

    const extension = format === "jpeg" ? "jpg" : format;
    const key = `focal/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    const config = new qiniu.conf.Config({
      useHttpsDomain: true,
      // Static South China region: no region discovery requests or disk cache.
      regionsProvider: qiniu.httpc.Region.fromRegionId("z2")
    });
    const token = new qiniu.rs.PutPolicy({ scope: `${BUCKET}:${key}`, expires: 60 }).uploadToken(mac);
    const uploader = new qiniu.form_up.FormUploader(config);
    stream = Readable.from([bytes]);

    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(timeoutError), UPLOAD_TIMEOUT_MS);
    });
    // putStream does not retry uploads; a retry would delay the base64 fallback.
    const uploaded = await Promise.race([
      uploader.putStream(token, key, stream, new qiniu.form_up.PutExtra(key, {}, `image/${format}`)),
      deadline
    ]);
    if (!uploaded.ok()) {
      throw new Error("qiniu_upload_failed");
    }

    const manager = new qiniu.rs.BucketManager(mac, config);
    const expiresAt = Math.floor(Date.now() / 1000) + DOWNLOAD_LIFETIME_SECONDS;
    return {
      url: manager.privateDownloadUrl(CDN_ORIGIN, key, expiresAt),
      // Sign the attachment parameter too. Cross-origin <a download> alone is ignored by browsers.
      download_url: manager.privateDownloadUrl(
        CDN_ORIGIN, `${key}?attname=focal-preview.${extension}`, expiresAt
      ),
      output_format: format
    };
  } catch (error) {
    // Never log SDK errors: they may contain credentials, signed URLs or request bodies.
    console.warn("[image-service] CDN upload fallback", {
      requestId: context.requestId,
      providerId: context.providerId,
      errorCode: error === timeoutError ? "qiniu_upload_timeout" : "qiniu_upload_failed"
    });
    return null;
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    stream?.destroy();
  }
}

function detectImageFormat(bytes: Buffer): "png" | "jpeg" | "webp" | "gif" | null {
  if (bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") return "png";
  if (bytes.subarray(0, 3).toString("hex") === "ffd8ff") return "jpeg";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") {
    return "webp";
  }
  if (["GIF87a", "GIF89a"].includes(bytes.toString("ascii", 0, 6))) return "gif";
  return null;
}
