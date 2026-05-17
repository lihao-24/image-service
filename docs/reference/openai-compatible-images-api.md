# OpenAI 兼容 Images API 参考

本文记录 image-service 第一版要对接的中转站 API 形态。

## Provider

```text
id: sub2api
base_url: https://sub2api.toioto.org/v1
model: gpt-image-2
```

真实 API key 只能放在服务端环境变量中，不写入文档或 Git。

## 文生图

Endpoint:

```http
POST /v1/images/generations
```

请求 JSON：

```json
{
  "model": "gpt-image-2",
  "prompt": "用户输入的提示词",
  "size": "1024x1536",
  "quality": "high",
  "output_format": "png"
}
```

取结果：

```js
const b64 = response.data[0].b64_json
```

## 参考图生图

Endpoint:

```http
POST /v1/images/edits
Content-Type: multipart/form-data
```

表单字段：

```text
model = gpt-image-2
image = 用户上传的参考图文件
prompt = 用户输入的提示词
size = 1024x1536
quality = high
output_format = png
```

取结果时要处理中转站返回格式：

```js
const imageItem = response.data[1] ?? response.data[0]
const b64 = imageItem.b64_json
```

说明：

- `data[0]` 通常是原图。
- `data[1]` 通常是修改后的图。
- 后端应优先使用 `data[1]`。
- 没有第二张时再回退到 `data[0]`。

## 参数 allowlist

第一版建议：

```text
models: gpt-image-2
sizes: 1024x1024, 1024x1536, 1536x1024
qualities: high, medium, low
output_formats: png, jpeg, webp
```

前端只展示服务端返回的 allowlist，不允许用户直接输入 provider base URL。

后端规则：

- 生成接口和保存配置接口都必须重复校验 allowlist。
- 客户端只能提交 provider id，不能提交 base URL、apiKeyEnv 或 provider 配置对象。
- provider id 必须存在于服务端配置中，model 必须属于该 provider 的 models。
- size、quality、output_format 必须来自服务端配置的公开选项。

## 错误处理

后端应把 provider 错误转换成应用错误：

```text
auth_required
quota_exceeded
invalid_generation_params
invalid_reference_image
provider_request_failed
provider_response_invalid
provider_rate_limited
provider_auth_failed
```

返回给前端的错误不应包含 API key、完整请求头或内部 stack trace。

参考图上传：

- 第一版只接受常见图片 MIME，例如 `image/png`、`image/jpeg`、`image/webp`。
- 服务端必须设置文件大小上限。
- 上传文件只用于本次 `/v1/images/edits` 请求，不落盘长期保存。
