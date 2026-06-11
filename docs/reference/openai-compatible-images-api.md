# Provider 与图片接口参考

本文记录 image-service 当前对接图片 provider 的稳定调用约束。当前主流程已瘦身为
provider、model、prompt 和可选参考图；尺寸、质量、输出格式、背景、moderation 等旧参数不再作为
主流程参数发送给上游。

## Provider 配置

服务端通过 `IMAGE_PROVIDER_OPTIONS` 配置 provider -> models 二级 JSON，并通过
`IMAGE_DEFAULT_PROVIDER`、`IMAGE_DEFAULT_MODEL` 选择默认模型。默认值保持：

```text
provider: toioto
model: gpt-image-2
```

provider base URL 和 API key 环境变量名可以写入服务端配置模板和文档，用于部署与排障；真实
API key 不写入 Git。`baseUrl`、`apiKeyEnv` 和 API key 都不得进入前端公开配置、SQLite 或日志。

当前支持的 provider type：

- `openai-compatible-images`：OpenAI Images API 兼容形状。
- `gemini-generate-content`：Gemini `generateContent` 形状。
- `minimax-image-generation`：MiniMax `/v1/image_generation` 形状。

当前 env 模板中的 provider：

- `toioto`：`openai-compatible-images`，`baseUrl=https://sub2api.toioto.org/v1`，
  `apiKeyEnv=SUB2API_API_KEY`，模型 `gpt-image-2`。
- `fastcode`：`openai-compatible-images`，`baseUrl=https://timebackward.com/v1`，
  `apiKeyEnv=FASTCODE_API_KEY`，模型 `gpt-image-2-2k`、`gpt-image-2-4k`。
- `fastcode-gemini`：`gemini-generate-content`，`baseUrl=https://timebackward.com/v1beta`，
  `apiKeyEnv=FASTCODE_API_KEY`，`authStyle=api-key-header`，模型
  `gemini-3.1-flash-image-preview`，展示名 `Gemini 3.1 Flash`。

新增 provider 时必须先确认上游接口形状。Gemini `generateContent` 形状的模型应放入独立
`gemini-generate-content` provider；不要放进 `openai-compatible-images` provider 下，除非上游
明确包装成 OpenAI Images API 形状并经过实测。MiniMax `/v1/image_generation` 形状的模型应放入
独立 `minimax-image-generation` provider。

## OpenAI-Compatible 文生图

Endpoint：

```http
POST /v1/images/generations
```

请求 JSON：

```json
{
  "model": "gpt-image-2",
  "prompt": "用户输入的提示词"
}
```

取结果：

```js
const imageItem = response.data[0]
const b64 = imageItem.b64_json
```

## OpenAI-Compatible 参考图生图

Endpoint：

```http
POST /v1/images/edits
Content-Type: multipart/form-data
```

表单字段：

```text
model = gpt-image-2
image = 用户上传的参考图文件
prompt = 用户输入的提示词
```

取结果时要处理中转站返回格式：

```js
const imageItem = response.data[1] ?? response.data[0]
const b64 = imageItem.b64_json
```

说明：

- OpenAI-compatible provider 可以返回 `b64_json` 或 `url`。返回 `url` 时，后端会下载图片并转为
  base64 临时响应；该 URL 不写入 SQLite 或日志。
- `data[0]` 通常是原图。
- `data[1]` 通常是修改后的图。
- 后端应优先使用 `data[1]`。
- 没有第二张时再回退到 `data[0]`。

## Gemini GenerateContent 文生图

Endpoint：

```http
POST /v1beta/models/{model}:generateContent
x-goog-api-key: <apiKey>
Content-Type: application/json
```

请求 JSON：

```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "用户输入的提示词"
        }
      ]
    }
  ]
}
```

## Gemini GenerateContent 参考图生图

Endpoint 同文生图。请求 JSON：

```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "用户输入的提示词"
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

响应解析：

- 遍历 `candidates[].content.parts[]`。
- 图片可能出现在 `inlineData` 或 REST JSON 的 `inline_data`。
- 图片数据字段为 base64 `data`，MIME 字段为 `mimeType` 或 `mime_type`。
- 如果只有文本没有图片，归一化为 `provider_response_invalid`。

## MiniMax Image Generation 文生图

Endpoint：

```http
POST /v1/image_generation
Authorization: Bearer <apiKey>
Content-Type: application/json
```

请求 JSON：

```json
{
  "model": "image-01",
  "prompt": "用户输入的提示词",
  "response_format": "base64"
}
```

响应解析：

- `base_resp.status_code` 必须为 `0`。
- 优先读取 `data.image_base64[0]` 作为图片 base64。
- 如返回 `data.image_urls[0]`，后端下载图片并转为 base64 临时响应；该 URL 不写入 SQLite 或日志。

## MiniMax Image Generation 参考图生图

Endpoint 同文生图。请求 JSON：

```json
{
  "model": "image-01",
  "prompt": "用户输入的提示词",
  "response_format": "base64",
  "subject_reference": [
    {
      "type": "character",
      "image_file": "data:image/png;base64,<base64-reference-image>"
    }
  ]
}
```

说明：

- MiniMax 参数第一版保持默认，只传 `model`、`prompt`、`response_format` 和可选
  `subject_reference` 必要字段。
- `subject_reference[].image_file` 使用参考图 Data URL。
- `n` 暂不开放。

## 参数与 allowlist

当前稳定请求参数：

```text
provider
model
prompt
image（仅参考图生图）
```

后端规则：

- 生成接口和保存配置接口都必须重复校验 provider/model allowlist。
- 客户端只能提交 provider id，不能提交 base URL、apiKeyEnv 或 provider 配置对象。
- provider id 必须存在于服务端配置中，model 必须属于该 provider 的 models。
- 文生图要求模型 `supportsTextToImage=true`。
- 参考图生图要求模型 `supportsImageToImage=true`。
- 旧字段 `size`、`resolution`、`quality`、`output_format`、`outputFormat`、`background`、
  `moderation` 可被兼容读取，但不参与主流程上游请求。
- `generation_logs` 中的 `size`、`quality`、`output_format` 等旧字段暂保留兼容占位，新流程通常写
  `auto` 或响应可确认的输出格式。

前端只展示服务端返回的 allowlist，不允许用户直接输入 provider base URL。

暂不开放的参数：

- `n`：保持单张生成，避免成本和用量统计口径复杂化。
- `stream` / `partial_images`：当前工作台不是流式图片渲染链路。
- 尺寸、质量、输出格式、背景、moderation 等上游参数：当前由自然语言 prompt 表达，不做服务端参数映射。

## 错误处理

后端应把 provider 错误转换成应用错误：

```text
auth_required
quota_exceeded
invalid_generation_params
invalid_reference_image
provider_content_policy_violation
provider_auth_failed
provider_rate_limited
provider_response_invalid
provider_request_failed
```

返回给前端的错误不应包含 API key、完整请求头或内部 stack trace。

OpenAI-compatible adapter 需要读取 provider 非 2xx 响应中的常见错误结构，并按安全错误码归一化：

- `content_policy_violation` -> `provider_content_policy_violation`
- HTTP `401` / `403` 或认证类 code -> `provider_auth_failed`
- HTTP `429` 或限流类 code -> `provider_rate_limited`
- 非 JSON 响应 -> `provider_response_invalid`
- 其他非 2xx -> `provider_request_failed`

图片生成失败路径必须输出结构化诊断日志，并用同一个 `requestId` 串联 route 和 provider。
当前日志事件包括：

- `[image-service] image request started`
- `[image-provider] provider response json parse failed`
- `[image-provider] provider error response`
- `[image-provider] invalid provider response`
- `[image-service] image request failed`

日志只能包含脱敏结构信息：requestId、provider id、endpoint、mode、model、prompt 长度、
HTTP status/statusText、content-type、content-length、响应顶层字段、
`data` 数量、前几个 `data` item 的字段名和是否有非空 `b64_json`、provider error code/type。
非 JSON 响应可记录截断后的 body 预览，但必须先脱敏并限制长度。不得记录 prompt 全文、图片
base64、上传图片内容、Authorization header、API key、cookie、完整 provider message 或 stack trace。

参考图上传：

- 第一版只接受常见图片 MIME，例如 `image/png`、`image/jpeg`、`image/webp`。
- 服务端必须设置文件大小上限。
- 上传文件只用于本次 `/v1/images/edits` 请求，不落盘长期保存。
