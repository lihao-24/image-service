import type { ProviderConfig } from "@/lib/config";

export type { ProviderConfig } from "@/lib/config";

export type ProviderImageResult = {
  b64Json: string;
  raw: unknown;
};

export type GenerateImageRequest = {
  model: string;
  prompt: string;
  size: string;
  quality: string;
  outputFormat: string;
  background?: string;
  moderation?: string;
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
};

type ImagesApiResponse = {
  data?: Array<{
    b64_json?: unknown;
  }>;
  error?: {
    code?: unknown;
    message?: unknown;
    type?: unknown;
  };
};

export function createOpenAICompatibleImagesAdapter(
  options: OpenAICompatibleImagesAdapterOptions = {}
): ImagesProviderAdapter {
  const fetchClient = options.fetch ?? fetch;

  return {
    async generateImage(provider, request) {
      const response = await fetchClient(buildProviderUrl(provider, "/images/generations"), {
        method: "POST",
        headers: {
          authorization: `Bearer ${provider.apiKey}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(buildImageRequestBody(request))
      });
      const json = await readProviderJson(response);

      return {
        b64Json: requireB64Json(json, 0),
        raw: json
      };
    },

    async editImage(provider, request) {
      const body = new FormData();
      body.set("model", request.model);
      body.set("prompt", request.prompt);
      body.set("size", request.size);
      body.set("quality", request.quality);
      body.set("output_format", request.outputFormat);
      if (request.background) {
        body.set("background", request.background);
      }
      if (request.moderation) {
        body.set("moderation", request.moderation);
      }
      body.set("image", request.image, request.imageFilename ?? "reference-image");

      const response = await fetchClient(buildProviderUrl(provider, "/images/edits"), {
        method: "POST",
        headers: {
          authorization: `Bearer ${provider.apiKey}`
        },
        body
      });
      const json = await readProviderJson(response);

      return {
        b64Json: extractB64Json(json, 1) ?? requireB64Json(json, 0),
        raw: json
      };
    }
  };
}

function buildProviderUrl(provider: ProviderConfig, endpointPath: string): string {
  return `${provider.baseUrl.replace(/\/+$/, "")}${endpointPath}`;
}

async function readProviderJson(response: Response): Promise<ImagesApiResponse> {
  let json: unknown;

  try {
    json = await response.json();
  } catch {
    throw new Error("provider_response_invalid");
  }

  if (!response.ok) {
    throw normalizeProviderError(response, json as ImagesApiResponse);
  }

  return json as ImagesApiResponse;
}

function buildImageRequestBody(request: GenerateImageRequest): Record<string, string> {
  return {
    model: request.model,
    prompt: request.prompt,
    size: request.size,
    quality: request.quality,
    output_format: request.outputFormat,
    ...(request.background ? { background: request.background } : {}),
    ...(request.moderation ? { moderation: request.moderation } : {})
  };
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

function requireB64Json(response: ImagesApiResponse, index: number): string {
  const image = extractB64Json(response, index);

  if (!image) {
    throw new Error("provider_response_invalid");
  }

  return image;
}

function extractB64Json(response: ImagesApiResponse, index: number): string | undefined {
  const image = response.data?.[index]?.b64_json;

  if (typeof image !== "string" || image.length === 0) {
    return undefined;
  }

  return image;
}
