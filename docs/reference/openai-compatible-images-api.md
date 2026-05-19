# OpenAI 兼容 Images API 参考

本文记录 image-service 当前对接的 OpenAI-compatible Images API 形态。

## Provider

```text
id: sub2api
model: gpt-image-2
```

`gpt-image-2` 当前作为默认 GPT Image 模型，通过 `sub2api` 这个
OpenAI-compatible provider 调用。provider base URL、API key 环境变量名和真实
API key 只能留在服务端配置与调用链路中，不新增写入文档或 Git。

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
  "size": "auto",
  "quality": "auto",
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
size = auto
quality = auto
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

当前默认值：

```text
models: gpt-image-2
size: auto
resolution: auto
quality: auto
output_format: png
background: auto
moderation: auto
```

公开选项：

```text
sizes: auto, 1:1, 3:2, 2:3, 16:9, 9:16
resolutions: auto, standard, hd, 4k
qualities: auto, high, medium, low
output_formats: png, jpeg, webp
backgrounds: auto, opaque
moderations: auto, low
```

前端只展示服务端返回的 allowlist，不允许用户直接输入 provider base URL。

后端规则：

- 生成接口和保存配置接口都必须重复校验 allowlist。
- 客户端只能提交 provider id，不能提交 base URL、apiKeyEnv 或 provider 配置对象。
- provider id 必须存在于服务端配置中，model 必须属于该 provider 的 models。
- size、resolution、quality、output_format、background、moderation 必须来自服务端配置的公开选项。
- 前端尺寸语义是“比例 + 分辨率档位”；后端对 `gpt-image-2` 映射为符合官方自定义尺寸规则的 API `size`。
- 如果比例是 `auto`，分辨率只能是 `auto`。
- 如果分辨率是 `auto`，后端发送 `size=auto`，不推断具体像素。
- `background=transparent` 暂不开放，因为 `gpt-image-2` 当前不支持透明背景。

`gpt-image-2` 尺寸映射表：

| 前端比例 | 分辨率档位 | API size |
| --- | --- | --- |
| auto | auto | auto |
| 1:1 | standard | 1024x1024 |
| 1:1 | hd | 2048x2048 |
| 3:2 | standard | 1536x1024 |
| 3:2 | hd | 2304x1536 |
| 2:3 | standard | 1024x1536 |
| 2:3 | hd | 1536x2304 |
| 16:9 | standard | 1536x864 |
| 16:9 | hd | 2048x1152 |
| 16:9 | 4k | 3840x2160 |
| 9:16 | standard | 864x1536 |
| 9:16 | hd | 1152x2048 |
| 9:16 | 4k | 2160x3840 |

`1:1 + 4k` 暂不开放，除非确认中转站支持合法 4K 方图。映射出的尺寸必须满足官方自定义尺寸规则：宽高为 16 的倍数，比例在 1:3 到 3:1，总像素不超过 8,294,400，最长边不超过 3840。

暂不开放的参数：

- `n`：保持单张生成，避免成本和用量统计口径复杂化。
- `stream` / `partial_images`：当前工作台不是流式图片渲染链路。
- `input_fidelity`：`gpt-image-2` 对图像输入自动高保真处理，当前不允许调整该参数。
- `outputCompression`：首期不展示、不校验、不发送，避免与 `output_format` 组合带来额外兼容性分支。

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

参考图上传：

- 第一版只接受常见图片 MIME，例如 `image/png`、`image/jpeg`、`image/webp`。
- 服务端必须设置文件大小上限。
- 上传文件只用于本次 `/v1/images/edits` 请求，不落盘长期保存。
