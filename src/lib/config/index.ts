export type PublicProviderConfig = {
  id: string;
  label: string;
  models: string[];
};

export type PublicImageConfig = {
  defaultProvider: string;
  defaults: {
    model: string;
    size: string;
    quality: string;
    outputFormat: string;
  };
  providers: PublicProviderConfig[];
  options: {
    sizes: string[];
    qualities: string[];
    outputFormats: string[];
  };
};

export function getPublicImageConfig(): PublicImageConfig {
  return {
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
        models: ["gpt-image-2"]
      }
    ],
    options: {
      sizes: ["1024x1024", "1024x1536", "1536x1024"],
      qualities: ["high", "medium", "low"],
      outputFormats: ["png", "jpeg", "webp"]
    }
  };
}
