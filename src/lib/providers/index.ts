import type { ProviderConfig } from "@/lib/config";
import {
  readDiagnosticString,
  responseMetadata,
  safeBodyPreview,
  type ImageLogger
} from "@/lib/diagnostics/image-logs";

export type { ProviderConfig } from "@/lib/config";

export type ProviderImageResult = {
  b64Json: string;
  mimeType?: string;
  outputFormat?: string;
  raw: unknown;
};

export type GenerateImageRequest = {
  model: string;
  prompt: string;
};

export type EditImageRequest = GenerateImageRequest & {
  image: Blob;
  imageFilename?: string;
};

export type ImagesProviderAdapter = {
  generateImage(
    provider: ProviderConfig,
    request: GenerateImageRequest
  ): Promise<ProviderImageResult>;
  editImage(provider: ProviderConfig, request: EditImageRequest): Promise<ProviderImageResult>;
};

export type OpenAICompatibleImagesAdapterOptions = {
  fetch?: typeof fetch;
  logger?: ImageLogger;
  requestId?: string;
};

type ImagesApiResponse = {
  data?: Array<{
    b64_json?: unknown;
    url?: unknown;
  }>;
  error?: {
    code?: unknown;
    message?: unknown;
    type?: unknown;
  };
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: {
          mimeType?: unknown;
          data?: unknown;
        };
        inline_data?: {
          mime_type?: unknown;
          data?: unknown;
        };
        text?: unknown;
      }>;
    };
  }>;
};

export function createOpenAICompatibleImagesAdapter(
  options: OpenAICompatibleImagesAdapterOptions = {}
): ImagesProviderAdapter {
  const fetchClient = options.fetch ?? fetch;
  const logger = options.logger ?? console;
  const requestId = options.requestId ?? "img_untracked";

  return {
    async generateImage(provider, request) {
      const endpoint = "/images/generations";
      const response = await fetchClient(buildProviderUrl(provider, endpoint), {
        method: "POST",
        headers: {
          authorization: `Bearer ${provider.apiKey}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(buildImageRequestBody(request))
      });
      const json = await readProviderJson(response, {
        provider,
        endpoint,
        logger,
        requestId
      });

      return {
        ...(await requireOpenAICompatibleImageResult(json, 0, {
          provider,
          endpoint,
          response,
          logger,
          requestId,
          fetchClient
        })),
        raw: json
      };
    },

    async editImage(provider, request) {
      const endpoint = "/images/edits";
      const body = new FormData();
      body.set("model", request.model);
      body.set("prompt", request.prompt);
      body.set("image", request.image, request.imageFilename ?? "reference-image");

      const response = await fetchClient(buildProviderUrl(provider, endpoint), {
        method: "POST",
        headers: {
          authorization: `Bearer ${provider.apiKey}`
        },
        body
      });
      const json = await readProviderJson(response, {
        provider,
        endpoint,
        logger,
        requestId
      });

      return {
        ...(await readOpenAICompatibleImageResult(json, 1, fetchClient) ??
          await requireOpenAICompatibleImageResult(json, 0, {
          provider,
          endpoint,
          response,
          logger,
          requestId,
          fetchClient
        })),
        raw: json
      };
    }
  };
}

export function createGeminiGenerateContentAdapter(
  options: OpenAICompatibleImagesAdapterOptions = {}
): ImagesProviderAdapter {
  const fetchClient = options.fetch ?? fetch;
  const logger = options.logger ?? console;
  const requestId = options.requestId ?? "img_untracked";

  return {
    async generateImage(provider, request) {
      const endpoint = `/models/${request.model}:generateContent`;
      const response = await fetchClient(buildProviderUrl(provider, endpoint), {
        method: "POST",
        headers: buildGeminiHeaders(provider),
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: request.prompt }]
            }
          ]
        })
      });
      const json = await readProviderJson(response, {
        provider,
        endpoint,
        logger,
        requestId
      });

      return normalizeGeminiImageResult(json as GeminiGenerateContentResponse, {
        provider,
        endpoint,
        response,
        logger,
        requestId
      });
    },

    async editImage(provider, request) {
      const endpoint = `/models/${request.model}:generateContent`;
      const imageBase64 = Buffer.from(await request.image.arrayBuffer()).toString("base64");
      const response = await fetchClient(buildProviderUrl(provider, endpoint), {
        method: "POST",
        headers: buildGeminiHeaders(provider),
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: request.prompt },
                {
                  inline_data: {
                    mime_type: request.image.type || "application/octet-stream",
                    data: imageBase64
                  }
                }
              ]
            }
          ]
        })
      });
      const json = await readProviderJson(response, {
        provider,
        endpoint,
        logger,
        requestId
      });

      return normalizeGeminiImageResult(json as GeminiGenerateContentResponse, {
        provider,
        endpoint,
        response,
        logger,
        requestId
      });
    }
  };
}

export function createImagesAdapterForProvider(
  provider: ProviderConfig,
  options: OpenAICompatibleImagesAdapterOptions = {}
): ImagesProviderAdapter {
  if (provider.type === "gemini-generate-content") {
    return createGeminiGenerateContentAdapter(options);
  }

  return createOpenAICompatibleImagesAdapter(options);
}

function buildProviderUrl(provider: ProviderConfig, endpointPath: string): string {
  return `${provider.baseUrl.replace(/\/+$/, "")}${endpointPath}`;
}

async function readProviderJson(
  response: Response,
  context: Omit<ProviderDiagnosticContext, "response">
): Promise<ImagesApiResponse> {
  let json: unknown;
  const responseForJson = response.clone();

  try {
    json = await responseForJson.json();
  } catch {
    logProviderJsonParseFailed({ ...context, response }, await readBodyPreview(response));
    throw new Error("provider_response_invalid");
  }

  if (!response.ok) {
    logProviderErrorResponse({ ...context, response }, json as ImagesApiResponse);
    throw normalizeProviderError(response, json as ImagesApiResponse);
  }

  return json as ImagesApiResponse;
}

function buildImageRequestBody(request: GenerateImageRequest): Record<string, string> {
  return {
    model: request.model,
    prompt: request.prompt
  };
}

function buildGeminiHeaders(provider: ProviderConfig): HeadersInit {
  const headers: Record<string, string> = {
    "content-type": "application/json"
  };

  if (provider.authStyle === "api-key-header") {
    headers["x-goog-api-key"] = provider.apiKey;
  } else {
    headers.authorization = `Bearer ${provider.apiKey}`;
  }

  return headers;
}

function normalizeGeminiImageResult(
  apiResponse: GeminiGenerateContentResponse,
  context: ProviderDiagnosticContext
): ProviderImageResult {
  for (const candidate of apiResponse.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      const inlineData = part.inlineData;
      const inlineDataRest = part.inline_data;
      const data = inlineData?.data ?? inlineDataRest?.data;
      const mimeType = inlineData?.mimeType ?? inlineDataRest?.mime_type;

      if (typeof data === "string" && data.length > 0) {
        return {
          b64Json: data,
          ...(typeof mimeType === "string" && mimeType ? { mimeType } : {}),
          ...(typeof mimeType === "string" && mimeType.includes("/")
            ? { outputFormat: mimeType.split("/").pop() }
            : {}),
          raw: apiResponse
        };
      }
    }
  }

  logInvalidProviderResponse(context, apiResponse);
  throw new Error("provider_response_invalid");
}

function normalizeProviderError(response: Response, json: ImagesApiResponse): Error {
  const code = typeof json.error?.code === "string" ? json.error.code : "";
  const type = typeof json.error?.type === "string" ? json.error.type : "";
  const normalized = `${code} ${type}`.toLowerCase();

  if (normalized.includes("content_policy_violation")) {
    return new Error("provider_content_policy_violation");
  }

  if (
    response.status === 401 ||
    response.status === 403 ||
    normalized.includes("api_key") ||
    normalized.includes("auth")
  ) {
    return new Error("provider_auth_failed");
  }

  if (
    response.status === 429 ||
    normalized.includes("rate_limit") ||
    normalized.includes("rate limit")
  ) {
    return new Error("provider_rate_limited");
  }

  return new Error("provider_request_failed");
}

async function requireOpenAICompatibleImageResult(
  apiResponse: ImagesApiResponse,
  index: number,
  context: ProviderDiagnosticContext & { fetchClient: typeof fetch }
): Promise<Omit<ProviderImageResult, "raw">> {
  const image = await readOpenAICompatibleImageResult(
    apiResponse,
    index,
    context.fetchClient
  );

  if (!image) {
    logInvalidProviderResponse(context, apiResponse);
    throw new Error("provider_response_invalid");
  }

  return image;
}

async function readOpenAICompatibleImageResult(
  apiResponse: ImagesApiResponse,
  index: number,
  fetchClient: typeof fetch
): Promise<Omit<ProviderImageResult, "raw"> | undefined> {
  const b64Json = extractB64Json(apiResponse, index);

  if (b64Json) {
    return { b64Json };
  }

  const imageUrl = extractImageUrl(apiResponse, index);

  if (!imageUrl) {
    return undefined;
  }

  return fetchImageUrlAsBase64(imageUrl, fetchClient);
}

function extractB64Json(response: ImagesApiResponse, index: number): string | undefined {
  const image = response.data?.[index]?.b64_json;

  if (typeof image !== "string" || image.length === 0) {
    return undefined;
  }

  return image;
}

function extractImageUrl(response: ImagesApiResponse, index: number): string | undefined {
  const imageUrl = response.data?.[index]?.url;

  if (typeof imageUrl !== "string" || imageUrl.length === 0) {
    return undefined;
  }

  return imageUrl;
}

async function fetchImageUrlAsBase64(
  imageUrl: string,
  fetchClient: typeof fetch
): Promise<Omit<ProviderImageResult, "raw">> {
  const response = await fetchClient(imageUrl);

  if (!response.ok) {
    throw new Error("provider_response_invalid");
  }

  const contentType = response.headers.get("content-type") ?? undefined;
  const bytes = Buffer.from(await response.arrayBuffer());

  return {
    b64Json: bytes.toString("base64"),
    ...(contentType ? { mimeType: contentType } : {}),
    ...(contentType?.includes("/") ? { outputFormat: contentType.split("/").pop() } : {})
  };
}

type ProviderDiagnosticContext = {
  provider: ProviderConfig;
  endpoint: string;
  response: Response;
  logger: ImageLogger;
  requestId: string;
};

function logInvalidProviderResponse(
  context: ProviderDiagnosticContext,
  apiResponse: unknown
) {
  context.logger.warn("[image-provider] invalid provider response", {
    requestId: context.requestId,
    providerId: context.provider.id,
    endpoint: context.endpoint,
    ...responseMetadata(context.response),
    response: summarizeProviderResponse(apiResponse)
  });
}

function logProviderJsonParseFailed(
  context: ProviderDiagnosticContext,
  bodyPreview: string
) {
  context.logger.warn("[image-provider] provider response json parse failed", {
    requestId: context.requestId,
    providerId: context.provider.id,
    endpoint: context.endpoint,
    ...responseMetadata(context.response),
    bodyPreview
  });
}

function logProviderErrorResponse(
  context: ProviderDiagnosticContext,
  apiResponse: ImagesApiResponse
) {
  context.logger.warn("[image-provider] provider error response", {
    requestId: context.requestId,
    providerId: context.provider.id,
    endpoint: context.endpoint,
    ...responseMetadata(context.response),
    response: summarizeProviderResponse(apiResponse)
  });
}

function summarizeProviderResponse(apiResponse: unknown) {
  const response =
    apiResponse && typeof apiResponse === "object" ? (apiResponse as ImagesApiResponse) : {};

  return {
    topLevelKeys: Object.keys(response).sort(),
    dataLength: Array.isArray(response.data) ? response.data.length : null,
    dataItems: Array.isArray(response.data)
      ? response.data.slice(0, 3).map((item, index) => ({
          index,
          keys: item && typeof item === "object" ? Object.keys(item).sort() : [],
          hasB64Json: typeof item?.b64_json === "string" && item.b64_json.length > 0
        }))
      : [],
    errorCode: readDiagnosticString(response.error?.code),
    errorType: readDiagnosticString(response.error?.type)
  };
}

async function readBodyPreview(response: Response): Promise<string> {
  try {
    return safeBodyPreview(await response.text());
  } catch {
    return "";
  }
}
