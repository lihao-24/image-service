# image-service MVP 设计

日期：2026-05-17

## 概要

`image-service` 是个人 AI 服务体系中的生图网页服务。第一版是一个独立 Next.js 应用，复用现有 self-hosted Supabase Auth，调用 OpenAI 兼容 Images API，通过中转站 `sub2api` 完成文生图和参考图生图。

第一版不保存生成图片本体。生成结果只在前端临时展示，用户可以下载。Prompt 配方和参数只有在用户点击“保存配置”后才写入 SQLite。

## 目标

- 建立独立 Next.js 应用。
- 复用 `https://supabase.lihao66.top` 的 Supabase Auth。
- 登录后使用，默认不开放匿名访问。
- 支持文生图。
- 支持参考图生图。
- 支持用户配置基础参数：model、size、quality、output_format。
- 调用服务端 API，由服务端读取 provider 配置和 API key。
- 图片不落服务器磁盘，只以 base64 临时返回前端展示。
- 支持下载生成图片。
- 支持用户点击“保存配置”后保存 Prompt 配方。
- 每次生成自动写入 generation log，但只保存元信息，不保存 prompt 全文或图片。
- 支持简单每日额度，为后续少量朋友/家人使用做准备。

## 非目标

- 不做批量生成。
- 不做 ComfyUI 接入。
- 不做多 provider UI 切换；第一版只接 `sub2api`。
- 不做公开注册管理后台。
- 不保存生成图片历史。
- 不保存参考图文件。
- 不做中央 SSO 门户。
- 不做共享 `packages/ui` 抽象。
- 不接入复杂工作流系统。

## 已确认产品决策

- 技术栈：Next.js。
- 当前 provider：`sub2api`。
- Provider 协议：OpenAI-compatible Images API。
- Base URL：`https://sub2api.toioto.org/v1`。
- 默认模型：`gpt-image-2`。
- 默认参数：
  - `size`: `1024x1536`
  - `quality`: `high`
  - `output_format`: `png`
- 参数对用户开放选择，但选项由服务端 allowlist 控制。
- 图片不写入服务器 cache。
- 配置不自动保存，用户点击“保存配置”才保存。
- generation log 自动保存元信息，用于额度、成本和排障。
- `user_id` 只来自服务端校验后的 Supabase Auth 用户，不接受客户端传入。
- 每日额度按用户和自然日计算，默认使用服务端本地日期。

## 用户流程

### 登录

```text
用户访问 image-service
  -> 未登录跳转登录页
  -> 登录成功进入生图页面
```

### 文生图

```text
用户输入 prompt
  -> 选择 model / size / quality / output_format
  -> 点击生成
  -> 服务端校验登录用户、参数 allowlist 和每日额度
  -> 服务端调用 /v1/images/generations
  -> 服务端写入 generation log 和每日用量
  -> 前端展示临时图片
  -> 用户可下载
  -> 用户可点击保存配置
```

### 参考图生图

```text
用户上传参考图
  -> 输入 prompt
  -> 选择参数
  -> 点击生成
  -> 服务端校验登录用户、参考图、参数 allowlist 和每日额度
  -> 服务端调用 /v1/images/edits
  -> 服务端优先取 response.data[1].b64_json
  -> 没有 data[1] 时回退 response.data[0].b64_json
  -> 服务端写入 generation log 和每日用量
  -> 前端展示临时图片
  -> 用户可下载
  -> 用户可点击保存配置
```

### 保存配置

```text
用户点击“保存配置”
  -> 服务端校验登录用户
  -> 服务端校验 provider / model / size / quality / output_format 仍在 allowlist 内
  -> 写入 prompt_recipes
  -> 只保存 prompt 和参数
  -> 不保存图片
```

## Provider 配置

第一版只配置一个 provider，但代码边界应保留 provider adapter 概念。

建议环境变量：

```env
IMAGE_DEFAULT_PROVIDER=sub2api
IMAGE_PROVIDER_OPTIONS=[{"id":"sub2api","label":"Sub2API","type":"openai-compatible-images","baseUrl":"https://sub2api.toioto.org/v1","apiKeyEnv":"SUB2API_API_KEY","models":["gpt-image-2"]}]
SUB2API_API_KEY=
IMAGE_SIZE_OPTIONS=1024x1024,1024x1536,1536x1024
IMAGE_QUALITY_OPTIONS=high,medium,low
IMAGE_OUTPUT_FORMAT_OPTIONS=png,jpeg,webp
IMAGE_DAILY_LIMIT=20
```

规则：

- 前端只读取服务端暴露的公开 allowlist。
- 前端不能读取 provider API key。
- 用户不能直接输入 base URL。
- 第一版不允许用户自定义 provider。
- 服务端必须对生成请求和保存配置请求重复校验 provider、model、size、quality、output_format。
- 客户端只能提交 provider id，不能提交 base URL、apiKeyEnv 或任意 provider 配置。
- 默认 provider 和默认参数必须存在于服务端 allowlist 中，否则启动或健康检查应报配置错误。

## 数据策略

SQLite 保存 image-service 自己的数据。

生成图片：

- 不保存到服务器。
- 不进入 SQLite。
- 不进入备份。
- 只在当前前端页面临时展示。

Prompt 配方：

- 用户点击保存配置后写入。
- 按 `user_id` 隔离。
- 保存 prompt、参考图模式和生成参数。
- 不保存参考图文件。

生成日志：

- 每次通过登录校验的生成请求都自动写入。
- 只保存元信息。
- 不保存 prompt 全文。
- 不保存图片。
- 可保存 prompt 长度、参考图是否存在、错误码、耗时等排障元信息。

每日额度：

- 生成请求在调用 provider 前检查额度。
- 达到额度时不调用 provider，返回额度错误，并写入 `generation_logs` 的拒绝状态。
- 只有 provider 成功返回可用图片时递增 `daily_usage.generation_count`。
- provider 调用失败时写入失败日志，但不递增成功用量。

## 计划数据模型

```text
prompt_recipes
  id
  user_id
  title
  prompt
  negative_prompt
  mode
  provider
  model
  size
  quality
  output_format
  params_json
  reference_mode
  is_favorite
  created_at
  updated_at

generation_logs
  id
  user_id
  provider
  model
  mode
  size
  quality
  output_format
  status
  error_code
  duration_ms
  prompt_length
  has_reference_image
  created_at

daily_usage
  user_id
  usage_date
  generation_count
```

## 安全边界

- 所有生成请求必须在服务端校验登录用户。
- 登录状态由服务端通过 Supabase Auth session/JWT 校验，`user_id` 从校验结果派生。
- API key 只存在服务端环境变量中。
- 用户只能读取和保存自己的配置。
- generation log 按用户记录。
- 每日额度按用户计算。
- 上传的参考图只用于本次请求，不长期保存；第一版只接受常见图片 MIME，例如 `image/png`、`image/jpeg`、`image/webp`，并设置服务端文件大小上限。
- 错误信息返回给前端前应脱敏，不暴露 provider key、内部 URL 或 stack trace。

## 部署接入

目标链路：

```text
https://image.lihao66.top
  -> VPS Caddy
  -> Tailscale
  -> Mac mini image-service:3010
```

注意：

- `image.lihao66.top` 尚未配置。
- 开发完成并准备部署时，提醒用户手动配置 DNS 和 VPS Caddy。
- 生产数据目录使用 `/Users/hao/Desktop/lihao-data/image-service`。
- 第一版不需要图片 cache 目录，但保留目录规范供后续扩展。

## 验证重点

- 未登录不能生成图片。
- 文生图正确取 `response.data[0].b64_json`。
- 参考图生图优先取 `response.data[1].b64_json`，没有第二项时回退第一项。
- 生成成功不保存图片。
- 点击保存配置后才写入 prompt_recipes。
- generation_logs 不保存 prompt 全文。
- 未登录用户不能读写 prompt_recipes、generation_logs 或 daily_usage。
- 服务端拒绝不在 allowlist 内的 provider、model、size、quality、output_format。
- 每日额度在 provider 调用前生效，成功生成后递增。
- 用户 A 不能读取用户 B 的配置。
