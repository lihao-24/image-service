export type ImageLogger = Pick<typeof console, "info" | "warn">;

const BODY_PREVIEW_LIMIT = 500;

export type ImageRequestLogContext = {
  requestId: string;
  providerId: string;
  model: string;
  mode: string;
  size: string;
  resolution: string;
  providerSize: string;
  quality: string;
  outputFormat: string;
  background: string;
  moderation: string;
  hasReferenceImage: boolean;
  promptLength: number;
};

export function createImageRequestId(): string {
  return `img_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
}

export function logImageRequestStarted(
  logger: ImageLogger,
  context: ImageRequestLogContext
) {
  logger.info("[image-service] image request started", context);
}

export function logImageRequestFailed(
  logger: ImageLogger,
  context: ImageRequestLogContext,
  errorCode: string,
  durationMs: number
) {
  logger.warn("[image-service] image request failed", {
    ...context,
    errorCode,
    durationMs
  });
}

export function responseMetadata(response: Response) {
  return {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    contentType: response.headers.get("content-type") ?? "",
    contentLength: response.headers.get("content-length")
  };
}

export function safeBodyPreview(value: string): string {
  return redactSensitiveText(value).slice(0, BODY_PREVIEW_LIMIT);
}

export function readDiagnosticString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function redactSensitiveText(value: string): string {
  return value
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "[REDACTED_AUTH]")
    .replace(/\bsk-[A-Za-z0-9_-]+/g, "[REDACTED_SECRET]")
    .replace(/\b[A-Za-z0-9_-]*api[_-]?key[A-Za-z0-9_-]*\b/gi, "[REDACTED_KEY]");
}
