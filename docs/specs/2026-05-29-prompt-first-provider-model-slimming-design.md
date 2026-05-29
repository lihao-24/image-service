# 自然语言优先生图与供应商模型配置瘦身设计

日期：2026-05-29

## 背景

线上最近两次生图失败都发生在当前供应商 `toioto / gpt-image-2`：一次上游返回 HTML 502，另一次在 provider 请求阶段失败。当前工作台还暴露尺寸、分辨率、质量、输出格式、背景和 moderation 等参数，这些参数增加了不同中转站和模型之间的兼容成本。

本阶段先把生图链路收敛为“供应商 + 模型 + 自然语言 prompt + 可选参考图”，降低 provider 请求体复杂度，再接入新的模型供应商。

## 目标

- 前端主流程只保留供应商、模型、prompt 和可选参考图。
- 供应商与模型改为二级配置：一个供应商包含多个模型。
- 新增显式默认模型配置，默认继续使用 `toioto / gpt-image-2`。
- 每个模型配置自己的模型家族和能力，支持按配置增删模型。
- 发给供应商的文生图请求只包含 `model` 和 `prompt`。
- 发给供应商的参考图生图请求只包含 `model`、`prompt` 和参考图。
- 保留旧 recipe 和 generation log 字段读取兼容，但新写入逐步脱离旧参数字段。
- 为 `chatgpt` 与 `gemini` 两类模型家族预留 adapter 分流。

## 非目标

- 不立即删除 SQLite 现有字段；字段删除放到后续迁移逐步处理。
- 不删除旧 recipe 中已有的参数字段，但新 recipe 不再写入旧参数字段。
- 不实现自然语言参数解析器。
- 不在本阶段强制统一输出格式。
- 不把未验证的非生图模型纳入 allowlist；已确认支持生图的模型都可启用。
- 不把生成图片、参考图、prompt 全文、API key 或 provider 私有配置写入长期存储或日志。

## 需求决策

### 主流程瘦身

工作台保留：

- 供应商选择。
- 模型选择。
- 文本 prompt。
- 参考图上传。
- 模板、生成消息、保存 recipe、下载、用量展示等已有主流程能力。

工作台移除主界面参数控件：

- `size`
- `resolution`
- `quality`
- `outputFormat`
- `background`
- `moderation`

这些意图由用户写进自然语言 prompt，例如“生成 4K 横版科技海报”“白底商品主图”“小红书封面比例”。服务端不解析这些描述，也不把它们转换成 provider 参数。

### 输出格式

输出格式默认由上游决定。服务端不主动发送 `output_format`。前端下载时优先使用返回图片的真实格式或已有响应字段；如果无法判断，则使用安全 fallback。

### 默认模型

配置中需要显式提供：

- `defaultProviderId`
- `defaultModelId`

默认值保持：

- `defaultProviderId`: `toioto`
- `defaultModelId`: `gpt-image-2`

当旧 recipe、旧链接状态或配置变更后找不到原 provider/model 时，回退到默认模型。

## 配置设计

### 配置形态

配置采用二级结构：provider 负责连接信息，model 负责模型信息、家族和能力。

示例：

```json
{
  "defaultProviderId": "toioto",
  "defaultModelId": "gpt-image-2",
  "providers": [
    {
      "id": "toioto",
      "label": "Toioto",
      "type": "openai-compatible-images",
      "baseUrl": "https://sub2api.toioto.org/v1",
      "apiKeyEnv": "SUB2API_API_KEY",
      "models": [
        {
          "id": "gpt-image-2",
          "label": "GPT Image 2",
          "family": "chatgpt",
          "enabled": true,
          "supportsTextToImage": true,
          "supportsImageToImage": true
        }
      ]
    },
    {
      "id": "fastcode",
      "label": "FastCode",
      "type": "openai-compatible-images",
      "baseUrl": "https://timebackward.com",
      "apiKeyEnv": "FASTCODE_API_KEY",
      "models": [
        {
          "id": "gpt-image-2-2k",
          "label": "GPT Image 2 2K",
          "family": "chatgpt",
          "enabled": true,
          "supportsTextToImage": true,
          "supportsImageToImage": true
        },
        {
          "id": "gpt-image-2-4k",
          "label": "GPT Image 2 4K",
          "family": "chatgpt",
          "enabled": true,
          "supportsTextToImage": true,
          "supportsImageToImage": true
        },
        {
          "id": "gemini-3.1-flash-image-preview",
          "label": "Gemini 3.1 Flash Image Preview",
          "family": "gemini",
          "enabled": true,
          "supportsTextToImage": true,
          "supportsImageToImage": true
        }
      ]
    }
  ]
}
```

### 类型草案

```ts
type ImageModelFamily = "chatgpt" | "gemini";

type ImageProviderType =
  | "openai-compatible-images"
  | "gemini-generate-content";

type ImageProviderAuthStyle = "bearer" | "api-key-header" | "query-key";

type ImageModelConfig = {
  id: string;
  label: string;
  family: ImageModelFamily;
  enabled: boolean;
  supportsTextToImage: boolean;
  supportsImageToImage: boolean;
  note?: string;
};

type ImageProviderConfig = {
  id: string;
  label: string;
  type: ImageProviderType;
  baseUrl: string;
  apiKeyEnv: string;
  apiKey: string;
  authStyle?: ImageProviderAuthStyle;
  models: ImageModelConfig[];
};

type ImageServiceConfig = {
  defaultProviderId: string;
  defaultModelId: string;
  providers: ImageProviderConfig[];
};
```

### 配置来源

沿用现有 `src/lib/config/` 作为唯一读取入口。代码只读取、校验和投影配置，不把供应商和模型写死到 UI。

推荐迁移策略：

- 第一阶段继续支持现有 `IMAGE_PROVIDER_OPTIONS` 环境变量，但解析新结构。
- 为旧结构 `models: string[]` 提供兼容解析，自动转为 `family: "chatgpt"`、`enabled: true`、两种模式均支持。
- 新部署配置使用新结构。
- 真实 key 继续只存在环境变量，例如 `SUB2API_API_KEY`、`FASTCODE_API_KEY`。FastCode 的 key 写入环境文件，由部署者自行填入真实值。

### 公开配置投影

`/api/image-options` 只能暴露公开字段：

```ts
type PublicImageModelConfig = {
  id: string;
  label: string;
  family: ImageModelFamily;
  supportsTextToImage: boolean;
  supportsImageToImage: boolean;
};

type PublicImageProviderConfig = {
  id: string;
  label: string;
  models: PublicImageModelConfig[];
};

type PublicImageConfig = {
  defaultProviderId: string;
  defaultModelId: string;
  providers: PublicImageProviderConfig[];
};
```

不公开：

- `baseUrl`
- `apiKeyEnv`
- API key
- 任何 provider 私有调试信息

## API 设计

### 请求入参

`POST /api/images/generations` 新主路径：

```json
{
  "provider": "fastcode",
  "model": "gpt-image-2-2k",
  "prompt": "生成一张 4K 横版科技海报，蓝白配色，适合官网首屏。"
}
```

`POST /api/images/edits` 新主路径：

```multipart
provider=fastcode
model=gpt-image-2-2k
prompt=把参考图中的产品放到白底电商主图里，保留真实材质。
image=<file>
```

旧字段兼容读取但不参与出站请求：

- `size`
- `resolution`
- `quality`
- `output_format`
- `outputFormat`
- `background`
- `moderation`

### 服务端校验

服务端校验顺序建议：

1. 校验登录用户。
2. 读取配置。
3. 校验 provider 存在且启用。
4. 校验 model 存在、启用且属于该 provider。
5. 根据 route 校验模型能力：
   - generations 需要 `supportsTextToImage=true`
   - edits 需要 `supportsImageToImage=true`
6. 校验 prompt。
7. edits 继续校验参考图 MIME 和大小。
8. 调用对应 adapter。

### 日志与数据库兼容

`generation_logs` 表字段先不删。

新日志建议：

- `provider`: 实际 provider id。
- `model`: 实际 model id。
- `mode`: `text-to-image` 或 `image-to-image`。
- `size`: 写 `"auto"`。
- `quality`: 写 `"auto"`。
- `output_format`: 如果上游响应能确认则写实际格式，否则写 `"auto"`。
- `error_code`: 继续使用现有归一化错误码。
- `prompt_length`: 继续只写长度。
- `has_reference_image`: 继续记录布尔值。

结构化诊断日志继续记录 requestId、provider、model、mode、耗时和安全的响应摘要，不记录 prompt 全文、图片内容、请求头、cookie 或 API key。

## Provider Adapter 设计

### 统一内部请求

内部 adapter 请求收敛为：

```ts
type GenerateImageRequest = {
  model: string;
  prompt: string;
};

type EditImageRequest = GenerateImageRequest & {
  image: Blob;
  imageMimeType: string;
  imageFilename?: string;
};
```

### ChatGPT / OpenAI-compatible

`family: "chatgpt"` 且 provider `type: "openai-compatible-images"` 时：

文生图出站 JSON：

```json
{
  "model": "gpt-image-2-2k",
  "prompt": "..."
}
```

参考图生图出站 FormData：

```text
model=<model>
prompt=<prompt>
image=<file>
```

不发送：

- `size`
- `quality`
- `output_format`
- `background`
- `moderation`

响应仍优先读取 OpenAI-compatible 的 `data[0].b64_json`。参考图生图保留现有 `data[1]` 优先、`data[0]` fallback 的兼容策略，除非新 provider 实测不需要。

### Gemini

Gemini 官方图片生成不是 OpenAI Images API 的同形接口。官方 Gemini API 使用 `generateContent`：文生图通过 `contents.parts[].text` 提交 prompt，图片结果从 response parts 的 `inlineData` 读取；图生图则在 parts 中同时提交 text 与 `inline_data` 图片。官方 REST 路径和认证方式形如：

```text
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
x-goog-api-key: {GEMINI_API_KEY}
```

官方当前图片生成文档示例模型包括 `gemini-2.5-flash-image`，模型列表中也包含 `gemini-3-pro-image-preview`。FastCode 价格页里的 Gemini 模型名可能是中转站自定义别名，接入前必须以 FastCode 实际 API 返回和调用成功为准。

文生图请求体形状：

```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "生成一张 4K 横版科技海报，蓝白配色，适合官网首屏。"
        }
      ]
    }
  ]
}
```

参考图生图请求体形状：

```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "把参考图中的产品放到白底电商主图里，保留真实材质。"
        },
        {
          "inline_data": {
            "mime_type": "image/png",
            "data": "<base64-reference-image>"
          }
        }
      ]
    }
  ]
}
```

响应解析重点：

- 遍历 `candidates[].content.parts[]`。
- 文本 part 可能出现在 `text` 字段中。
- 图片 part 出现在 `inlineData` 或 REST JSON 中的 `inline_data`，其中包含 `mimeType`/`mime_type` 和 base64 `data`。
- adapter 需要把 Gemini 的图片 part 归一化成项目内部的 `b64Json` 和可选 `mimeType`/`outputFormat`。
- 如果 response 只有文本没有图片，应归一化为 `provider_response_invalid`，并在诊断日志中记录安全的 response top-level keys 和 part 类型摘要。

出站参数策略：

- Gemini adapter 仍只接收项目内部的 `model`、`prompt` 和可选参考图。
- 不发送尺寸、质量、输出格式、背景或 moderation。
- 参考图需要在服务端读取为 base64，并带上 MIME type。
- 不把参考图 base64、prompt 全文或 Gemini 原始完整响应写入日志或 SQLite。

参考来源：

- [Google AI Developers: Image generation with Gemini](https://ai.google.dev/gemini-api/docs/image-generation)
- [Google AI Developers: Gemini API image understanding](https://ai.google.dev/gemini-api/docs/image-understanding)

因此 `family: "gemini"` 不应直接复用 OpenAI-compatible adapter。设计上预留：

- `type: "gemini-generate-content"`：直连或完全模拟 Gemini 官方接口的 provider。
- `family: "gemini"` + `type: "openai-compatible-images"`：仅在中转站明确把 Gemini 模型包装成 OpenAI Images 形状并通过实测后启用。
- 如果 FastCode 使用官方 Gemini API 风格，`baseUrl` 应能拼出 `/v1beta/models/{model}:generateContent`，认证方式可能是 `x-goog-api-key` header；如果 FastCode 做了 OpenAI-compatible 包装，也可能继续使用 Bearer token。provider 配置中预留 `authStyle: "bearer" | "api-key-header" | "query-key"` 或等价字段。

首期策略：

- FastCode 支持的 Image 模型都写入配置并启用。
- Gemini 系列模型也需要写入配置并支持使用。
- Gemini 实现必须先确认 FastCode 的实际接口形状，再选择 OpenAI-compatible 兼容路径或 Gemini `generateContent` adapter。

## 前端设计

### 供应商与模型选择

UI 可以采用两个 select：

- 供应商 select：显示 provider label。
- 模型 select：只显示当前供应商下 `enabled=true` 的模型。

切换供应商时：

- 如果当前 model 不属于新 provider，自动选中新 provider 下第一个支持当前 mode 的模型。
- 如果当前 mode 是参考图模式，只展示或优先选择支持 `supportsImageToImage` 的模型。
- 如果没有模型支持当前 mode，禁用生成按钮并显示轻量错误文案。

也可以后续演进为一个分组选项 select，但本阶段两个 select 更直观，也符合二级配置。

### 模式与参考图

现有 mode 可以继续由“是否上传参考图 / 用户选择参考图模式”决定。

生成前：

- 文生图要求模型支持 `supportsTextToImage`。
- 参考图生图要求模型支持 `supportsImageToImage`。

### 旧模板与 recipe

使用旧模板或旧 recipe 时：

- 恢复 prompt。
- 恢复 mode。
- 恢复 provider/model，前提是配置中仍存在且启用。
- 忽略旧尺寸、质量、格式、背景、moderation 等参数。
- provider/model 不可用时回退默认模型。

保存新 recipe 时：

- 保留现有数据库 schema。
- 只把 provider/model 作为有效生成配置。
- 不再写入旧参数字段；如果当前 schema 或 helper 暂时要求非空值，应优先调整写入 helper，让新 recipe 不产生尺寸、质量、格式、背景、moderation 等旧字段数据。旧字段后续逐步删除。

消息流中不再展示质量、尺寸等参数标签。可以展示模型标签，例如 `FastCode · GPT Image 2 2K`。

## 新供应商接入策略

### 配置示例

FastCode provider：

- `id`: `fastcode`
- `label`: `FastCode`
- `baseUrl`: `https://timebackward.com`
- `apiKeyEnv`: `FASTCODE_API_KEY`

FastCode 页面中确认支持 Image 的模型都写入配置并启用；不只限于 `gpt-image-2-2k` 与 `gpt-image-2-4k`。

Gemini preview 系列需要写入配置且能够支持使用。实现前必须确认 FastCode 对 Gemini image 模型的实际转发形状：

- 如果 FastCode 将 Gemini image 模型包装成 OpenAI Images API 形状，则可使用 `type: "openai-compatible-images"`，但仍以 `family: "gemini"` 标记。
- 如果 FastCode 暴露 Gemini 官方 `generateContent` 形状，则使用 `type: "gemini-generate-content"` 或新增 provider/adapter 配置。
- 不允许只因模型出现在价格页就假设它兼容 OpenAI Images API；每个 Gemini 生图模型至少需要一次真实或 mock 对齐验证。

### 验证顺序

1. 本地 mock provider 测试极简请求体。
2. 本地配置解析测试新旧结构。
3. 线上或准线上用新 provider 做一次文生图。
4. 做一次参考图生图。
5. 检查 generation log 和容器结构化日志。
6. 再决定是否把默认模型切到新 provider。

默认模型在本阶段仍保持 `toioto / gpt-image-2`；新供应商稳定后再单独改默认配置。

## 迁移步骤建议

1. 更新 config 类型和解析逻辑，兼容旧 `models: string[]` 与新 `models: object[]`。
2. 更新 public config 投影，隐藏 options 参数列表。
3. 更新参数校验，只要求 provider/model/prompt 和对应模型能力。
4. 更新 provider adapter，请求体只发送 `model`、`prompt` 和参考图。
5. 更新 API routes，移除出站请求前的 size/resolution 映射路径，但保留日志占位。
6. 更新工作台类型和 UI，只显示供应商与模型选择。
7. 更新 recipe/template 应用逻辑，忽略旧参数。
8. 更新测试覆盖配置解析、API 入参兼容、adapter 请求体、UI 参数移除和旧 recipe fallback。
9. 更新 `.env.example`、`env/*.env.example` 和 README 的配置说明。

## 测试计划

配置：

- 默认配置仍解析为 `toioto / gpt-image-2`。
- 新二级配置可解析多个 provider 和多个 model。
- 旧 `models: string[]` 配置兼容。
- 默认 provider/model 不存在时报错。
- disabled model 不进入 public config 或不可被 API 使用。

API：

- generations 只需要 provider/model/prompt。
- edits 只需要 provider/model/prompt/image。
- 旧参数存在时不报错，但不进入 provider 请求体。
- 不支持文生图的模型调用 generations 返回 `invalid_generation_params`。
- 不支持参考图的模型调用 edits 返回 `invalid_generation_params`。

Provider：

- OpenAI-compatible generations body 只包含 `model`、`prompt`。
- OpenAI-compatible edits FormData 只包含 `model`、`prompt`、`image`。
- 非 JSON、401/403、429、content policy 等错误继续归一化。

前端：

- 参数控件不再渲染。
- 供应商切换后模型列表随之变化。
- 参考图模式下不允许选择不支持参考图的模型，或生成前给出明确提示。
- 旧 recipe 加载只恢复 prompt/provider/model。

验证命令建议：

```bash
pnpm test tests/config/public-config.test.ts tests/providers/openai-compatible-images.test.ts tests/api/text-to-image-route.test.ts tests/api/reference-image-route.test.ts tests/app/image-workbench.test.tsx
pnpm lint
pnpm typecheck
git diff --check
```

如涉及生产配置模板或 Next 构建行为，再追加：

```bash
pnpm build
```

## 审核结论

- 新供应商 provider id 使用 `fastcode`，展示名使用 `FastCode`。
- FastCode base URL 使用 `https://timebackward.com`。
- FastCode API key 写入环境文件，环境变量名暂定 `FASTCODE_API_KEY`，真实值由部署者自行填写。
- FastCode 支持的 Image 模型都写入配置并启用。
- Gemini preview 模型需要写入配置且能够支持使用；实现前必须确认实际接口形状并补 adapter 或兼容层。
- 新 recipe 不写入旧参数字段；旧字段后续逐步删除。
