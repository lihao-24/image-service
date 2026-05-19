# gpt-image-2 与用量体验加固设计

日期：2026-05-19

## 背景

Google AI Studio / Gemini API 直连接入因 API 费用风险先搁置。当前阶段只推进不依赖 Google 直连的剩余需求：核对 `gpt-image-2` 相关配置、加固 OpenAI 兼容 adapter、完善用量读取与前端展示，并保持现有对话式工作台和侧边栏结构。

`gpt-image-2` 已确认是 OpenAI GPT Image 系列模型，可用于 Images generations 与 edits。当前项目仍通过 `sub2api` 作为 OpenAI-compatible provider 调用，不直接接入 OpenAI 官方 API key。

## 目标

- 明确 `gpt-image-2` 是当前默认 OpenAI-compatible 图像模型，保留现有 `sub2api` provider 配置。
- 核对并锁定文生图和参考图生图请求参数：`model`、`prompt`、`size`、`quality`、`output_format`。
- 按 OpenAI 官方 `gpt-image-2` 能力扩展服务端 allowlist，尤其是尺寸、质量、格式、背景和 moderation 参数。
- 加固 provider 错误归一化，避免前端收到 provider 原始错误、内部 URL、API key 或 stack trace。
- 新增登录后的 `GET /api/usage`，用于读取当前用户今日用量。
- 在当前侧边栏底部加入轻量用量详情入口和弹窗，不做大规模 UI 或状态重构。
- 为后续“中转站模型 / 受限模型”预留差异化用量语义，但本阶段不接新 provider。

## 非目标

- 不接入 Google AI Studio / Gemini API、Vertex AI、Imagen 或 ADC。
- 不新增中转站模型；不修改真实 provider base URL 或 API key 策略。
- 不改生成图片保存策略，不保存图片本体或参考图文件。
- 不重构主工作台布局，不重写消息流状态模型。
- 不做复杂成本估算或账单管理。
- 不做生产部署。

## 需求决策

### gpt-image-2 配置

- `IMAGE_DEFAULT_PROVIDER` 保持 `sub2api`。
- `IMAGE_DEFAULT_MODEL` 保持 `gpt-image-2`。
- `IMAGE_PROVIDER_OPTIONS` 中 `sub2api` 的 `type` 继续为 `openai-compatible-images`。
- 默认参数保持保守三件套：
  - `size`: `auto`
  - `quality`: `auto`
  - `outputFormat`: `png`
- 公开 allowlist 仍只暴露 provider id/label/models 和尺寸、质量、格式选项，不暴露 `baseUrl`、`apiKeyEnv` 或 API key。

### gpt-image-2 官方参数核对

OpenAI 官方文档显示 `gpt-image-2` 支持 `v1/images/generations` 和 `v1/images/edits`，并支持灵活图片尺寸和高保真图像输入。当前中转站管理员确认按官方 1:1 支持时，本项目应将服务端 allowlist 从“只覆盖三个常用尺寸”扩展为“覆盖官方主流尺寸与可选参数”。

第一阶段建议支持：

- 前端尺寸语义
  - 前端展示稳定的“比例 + 分辨率档位”两层选项。
  - 比例选项：`auto`、`1:1`、`3:2`、`2:3`、`16:9`、`9:16`
  - 分辨率选项：`auto`、`standard`、`hd`、`4k`
  - 默认：比例 `auto`，分辨率 `auto`
  - 如果比例是 `auto`，分辨率只能是 `auto`。
  - 如果分辨率是 `auto`，后端发送 `size=auto`，不强行推断具体像素。
  - 后端按 provider/model 映射到实际 API `size`，避免未来接入更多模型时改动前端显示。
- `gpt-image-2` 尺寸映射
  - `auto + auto` -> `auto`
  - `1:1 + standard` -> `1024x1024`
  - `1:1 + hd` -> `2048x2048`
  - `1:1 + 4k` 暂不开放，除非确认中转站支持合法 4K 方图。
  - `3:2 + standard` -> `1536x1024`
  - `3:2 + hd` -> `2304x1536`
  - `2:3 + standard` -> `1024x1536`
  - `2:3 + hd` -> `1536x2304`
  - `16:9 + standard` -> `1536x864`
  - `16:9 + hd` -> `2048x1152`
  - `16:9 + 4k` -> `3840x2160`
  - `9:16 + standard` -> `864x1536`
  - `9:16 + hd` -> `1152x2048`
  - `9:16 + 4k` -> `2160x3840`
  - 所有映射尺寸必须满足官方自定义尺寸规则：宽高为 16 的倍数，比例在 1:3 到 3:1，总像素不超过 8,294,400，最长边不超过 3840。
- `quality`
  - 支持：`auto`、`low`、`medium`、`high`
  - 默认：`auto`
- `output_format`
  - 支持：`png`、`jpeg`、`webp`
  - 默认：`png`
- `background`
  - 可选参数：`auto`、`opaque`
  - 默认：`auto`
  - 不支持 `transparent`，因为 `gpt-image-2` 当前不支持透明背景。
- `moderation`
  - 可选参数：`auto`、`low`
  - 默认：`auto`
- `output_compression`
  - 本阶段不展示、不校验、不发送。
- 参考图压缩
  - 图生图上传参考图时，前端应在提交前尝试压缩图片，降低上传体积和 provider 输入成本。
  - 压缩只影响本次请求使用的临时 File/Blob，不写入 SQLite、服务器磁盘或 localStorage。
  - 压缩失败时回退使用原图，并继续走现有服务端 MIME 与 10MB 大小校验。
  - 首期压缩策略：最长边限制到 `2048px`，输出为 `image/jpeg`，质量系数 `0.9`；如果原图已小于目标尺寸且体积较小，可直接使用原文件。
- `n`
  - 暂不开放到 UI。保持单张生成，避免成本和用量统计口径复杂化。
- `stream` / `partial_images`
  - 暂不开放。当前工作台不是流式图片渲染链路。
- `input_fidelity`
  - 图生图时不发送。官方说明 `gpt-image-2` 对图像输入自动高保真处理，不允许调整该参数。

配置形态建议保持向后兼容：旧的 `IMAGE_SIZE_OPTIONS`、`IMAGE_QUALITY_OPTIONS`、`IMAGE_OUTPUT_FORMAT_OPTIONS` 仍可工作；新增参数用新的可选 env 或内置默认值提供，不要求现有部署立刻改 `.env`。

### 用量与额度

当前代码已有 `daily_usage`，且生成成功后递增。为避免当前主力模型被费用无关的硬额度误挡，本阶段采用：

- GPT Image 系列模型：只统计，不拦截。
- 未来受限模型：请求前检查额度，超过上限时拦截。
- 当前没有受限模型接入，所以 `IMAGE_DAILY_LIMIT` 只作为未来受限模型的默认额度上限，不再阻断 `gpt-image-2`。

API 响应中的 `daily_usage` 需要表达是否受限：

```ts
type DailyUsageMeta = {
  generation_count: number;
  limit: number | null;
  limited: boolean;
};
```

`gpt-image-2` 成功生成后返回示例：

```json
{
  "daily_usage": {
    "generation_count": 12,
    "limit": null,
    "limited": false
  }
}
```

如果未来受限模型接入，则返回：

```json
{
  "daily_usage": {
    "generation_count": 3,
    "limit": 20,
    "limited": true
  }
}
```

## API 设计

### 生成 API

`POST /api/images/generations` 和 `POST /api/images/edits` 保持现有路径和请求格式。

变化：

- 对 `gpt-image-*` 模型不执行额度拦截。
- provider 成功返回可用图片后仍递增 `daily_usage`。
- provider 失败或返回空图片时不递增。
- 响应 `meta.daily_usage` 增加 `limited`，且无限额模型的 `limit` 为 `null`。

### 用量 API

新增：

```http
GET /api/usage
```

未登录：

```json
{
  "error": "auth_required",
  "message": "请先登录。"
}
```

已登录：

```json
{
  "usage": {
    "date": "2026-05-19",
    "generation_count": 12,
    "limit": null,
    "limited": false
  }
}
```

第一版只返回当前用户今日总成功生成次数。按模型拆分留给后续，因为当前 `daily_usage` 表不按模型拆分；如果未来需要精确拆分，可基于 `generation_logs` 汇总或新增专门表。

## Provider 错误归一化

OpenAI-compatible adapter 需要读取 provider 非 2xx 响应中的常见错误结构：

```json
{
  "error": {
    "code": "content_policy_violation",
    "message": "..."
  }
}
```

归一化目标：

- `content_policy_violation` -> `provider_content_policy_violation`
- HTTP `401` / `403` 或认证类 code -> `provider_auth_failed`
- HTTP `429` 或限流类 code -> `provider_rate_limited`
- 非 JSON 响应 -> `provider_response_invalid`
- 其他非 2xx -> `provider_request_failed`

前端继续使用安全文案，不展示 provider 原始错误。

## 前端设计

保持当前左侧侧边栏底部的用量展示位置。新增行为：

- 侧边栏底部用量区域可点击，打开 Usage Modal。
- GPT Image 当前口径展示为：`今日生成 12 次 · 不限额`。
- 受限模型未来展示为：`今日额度 3/20`。
- 进度条只在 `limited=true` 且 `limit>0` 时按百分比展示；无限额模型可显示静态细条或不显示进度。
- Modal 使用现有深色界面风格，展示：
  - 今日日期。
  - 总成功生成次数。
  - 当前模型组是否不限额。
  - 说明：`GPT Image 系列当前仅统计用量，不做每日额度拦截。`

不新增图表库，不引入第三方 UI 组件。

### 参数中文映射

前端所有参数字段使用中文展示，不直接暴露英文 API 字段名：

- `size`：显示为“画面比例”
  - `auto`：自动
  - `1:1`：方图 1:1
  - `3:2`：横图 3:2
  - `2:3`：竖图 2:3
  - `16:9`：宽屏 16:9
  - `9:16`：竖屏 9:16
- `resolution`：显示为“分辨率”
  - `auto`：自动
  - `standard`：标准
  - `hd`：高清
  - `4k`：4K
- `quality`：显示为“画质”
  - `auto`：自动
  - `low`：草稿
  - `medium`：标准
  - `high`：高质量
- `output_format`：显示为“输出格式”
  - `png`：PNG
  - `jpeg`：JPEG
  - `webp`：WebP
- `background`：显示为“背景”
  - `auto`：自动
  - `opaque`：不透明
- `moderation`：显示为“安全审核”
  - `auto`：自动
  - `low`：宽松

中文文案只影响 UI 展示；提交给 API route 的值仍使用稳定英文枚举。

## 测试策略

- 配置测试：确认 `gpt-image-2` 默认 provider、默认参数、公开 allowlist 不泄露密钥信息。
- Provider adapter 测试：确认请求路径、请求字段、`output_format` 下划线命名和错误归一化。
- API route 测试：确认 `gpt-image-2` 在 `IMAGE_DAILY_LIMIT=0` 时仍可调用 provider，成功后递增用量；失败不递增。
- Usage API 测试：确认未登录返回 `auth_required`，已登录返回当前用户今日用量，用户隔离有效。
- 前端 helper / 组件测试：确认无限额和受限两种用量文案。

## 文档影响

- 更新 `docs/reference/openai-compatible-images-api.md`，标明 `gpt-image-2` 是当前默认 OpenAI-compatible 图像模型，并记录错误归一化规则。
- 更新 `docs/reference/data-and-storage.md`，补充 GPT Image 系列“只统计不拦截”的当前额度策略。
- 如新增环境变量或改变部署命令，再同步 `README.md` 与 `.env.example`；本设计默认不新增环境变量。
