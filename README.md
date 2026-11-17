# image-service

`image-service`（品牌名 Focal）是个人 AI 服务体系中的生图网页服务。

当前已创建 Next.js 应用骨架、登录边界、SQLite 数据层、provider allowlist、
OpenAI 兼容 Images API adapter、生成 API、Prompt 配方保存 API、Prompt 模板库、
用量统计和登录后的中文聊天式生图工作台。
测试使用 mock provider，不调用真实 provider。

## 本地开发

```bash
pnpm install
pnpm dev
```

常用验证命令：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

## Supabase Auth

应用入口通过 Supabase Auth cookie session 保护。未登录访问 `/` 会跳转到
`/auth/login`，受保护 API 可复用 `src/lib/auth` 中的服务端 helper。
`user_id` 只来自 `supabase.auth.getUser()` 校验后的用户，不接受客户端传入。

## Provider 配置

服务端通过 `IMAGE_PROVIDER_OPTIONS` 配置 provider -> models 二级 allowlist，并用
`IMAGE_DEFAULT_PROVIDER`、`IMAGE_DEFAULT_MODEL` 选择默认模型。当前默认是
`toioto / gpt-image-2`。

provider 的 `id` 是稳定配置值，`label` 是界面展示名；两者不要混用。每个 provider
持有连接信息和自己的 `models` 列表，model 持有 `id`、`label`、`family`、启用状态和
文生图/参考图生图能力。公开接口 `/api/image-options` 只返回默认 provider/model 和
provider/model 的公开字段，不包含 `baseUrl`、`apiKeyEnv` 或 API key。

当前支持三类 provider type：

- `openai-compatible-images`：用于 OpenAI Images API 兼容接口。文生图请求发到
  `{baseUrl}/images/generations`，请求体只包含 `model` 和 `prompt`；参考图生图发到
  `{baseUrl}/images/edits`，FormData 只包含 `model`、`prompt` 和 `image`。认证默认使用
  `Authorization: Bearer <apiKey>`。
- `gemini-generate-content`：用于 Gemini `generateContent` 形状接口。请求发到
  `{baseUrl}/models/{model}:generateContent`，文生图使用 `contents.parts[].text`，参考图生图
  额外提交 `inline_data` 图片。FastCode Gemini 当前使用 `authStyle: "api-key-header"`，
  即 `x-goog-api-key`。
- `minimax-image-generation`：用于 MiniMax `/v1/image_generation` 接口。文生图发送
  `model`、`prompt`、`response_format=base64`；参考图生图额外发送 `subject_reference`
  Data URL。认证使用 `Authorization: Bearer <apiKey>`。

当前 env 模板包含三个 provider：

- `toioto`：展示名 `Toioto`，`type` 为 `openai-compatible-images`，`baseUrl`
  为 `https://sub2api.toioto.org/v1`，`apiKeyEnv` 为 `SUB2API_API_KEY`，模型为
  `gpt-image-2`。
- `fastcode`：展示名 `FastCode`，`type` 为 `openai-compatible-images`，`baseUrl`
  为 `https://timebackward.com/v1`，`apiKeyEnv` 为 `FASTCODE_API_KEY`，模型为
  `gpt-image-2-2k` 和 `gpt-image-2-4k`。
- `fastcode-gemini`：展示名 `FastCode Gemini`，`type` 为
  `gemini-generate-content`，`baseUrl` 为 `https://timebackward.com/v1beta`，
  `apiKeyEnv` 为 `FASTCODE_API_KEY`，`authStyle` 为 `api-key-header`。当前模型为
  `gemini-3.1-flash-image-preview`，展示名 `Gemini 3.1 Flash`，支持文生图和参考图生图。

MiniMax 当前不在 env 模板默认 provider 列表中启用；如需使用，可新增
`type: "minimax-image-generation"` provider，并配置 `apiKeyEnv: "MINIMAX_API_KEY"`。

新增供应商时，优先复制同类 provider 的结构，并确认上游真实接口形状后再选择 `type`：

- 兼容 OpenAI Images API 的上游放在独立 `openai-compatible-images` provider 下。
- Gemini `generateContent` 形状的上游放在独立 `gemini-generate-content` provider 下。
- MiniMax `/v1/image_generation` 形状的上游放在独立 `minimax-image-generation` provider 下。
- 不要把 Gemini 模型塞进 `openai-compatible-images` provider 下，除非上游明确把该模型包装成
  OpenAI Images API 形状并完成实测。
- 每个新模型都要配置 `family`、`enabled`、`supportsTextToImage` 和
  `supportsImageToImage`；不支持某种模式的模型不要在对应能力上写 `true`。

主生成流程已瘦身为 provider + model + prompt + 可选参考图。旧的 size、resolution、quality、
output format、background 和 moderation 不再作为主流程参数发送给上游；`generation_logs`
中的旧字段暂时保留兼容，占位值通常为 `auto`。

## Prompt 配方 API

- `POST /api/recipes`：保存当前登录用户的 Prompt 配方。
- `GET /api/recipes`：列出当前登录用户自己的 Prompt 配方。
- `GET /api/recipes/[recipeId]`：读取自己的单个 Prompt 配方。
- `PATCH /api/recipes/[recipeId]`：更新自己的 Prompt 配方。
- `DELETE /api/recipes/[recipeId]`：删除自己的 Prompt 配方。

保存和更新会在服务端按 allowlist 校验 `provider` 和 `model`。
`user_id` 只来自服务端 Auth helper；接口不会接受客户端 provider 配置、base URL
或 API key 元数据。生成 API 不会自动保存 Prompt 配方，只有显式调用 recipe API
才写入 `prompt_recipes`。

## Prompt 模板

应用内置 Prompt 模板库，支持按分类浏览和收藏。

- `GET /api/prompt-templates`：列出模板库。
- `GET /api/prompt-templates/favorites`：列出当前用户收藏的模板。
- `POST /api/prompt-templates/favorites/[templateId]`：收藏模板。
- `DELETE /api/prompt-templates/favorites/[templateId]`：取消收藏模板。

模板渲染走 `src/lib/prompt-templates/render.ts`，支持变量替换。

## 用量 API

- `GET /api/usage`：返回当前用户当日用量统计。

gpt-image 系列模型不计入每日配额。生成日志写入 SQLite `generation_logs` 表，包含
provider、model、mode、status、error_code、duration_ms 以及旧参数兼容占位字段。

## 前端生图工作台

登录后访问 `/` 会进入聊天式生图工作台。页面参数控件来自 `/api/image-options` 的公开
allowlist，支持文生图、参考图生图、Prompt 模板浏览和收藏、用量查看、临时预览、
下载当前临时图片和手动保存配置。
生成成功不会自动保存 Prompt 配方。未配置七牛时，图片 base64 只保留在当前浏览器状态中；
配置七牛后，图片临时上传云端，浏览器直接从 CDN 加载。图片和签名 URL 不写入
`localStorage`、SQLite、服务器磁盘或应用日志。刷新页面不会恢复图片历史。

## 七牛 CDN 图片交付（可选）

用于绕开 VPS 的图片下行带宽限制。无需界面开关或数据库迁移；只在运行环境同时配置以下两个
服务端变量时自动启用，任意一个为空都沿用原 base64 响应：

```dotenv
QINIU_ACCESS_KEY="你的七牛 AccessKey"
QINIU_SECRET_KEY="你的七牛 SecretKey"
```

本地填写项目根目录 `.env.local`，生产填写 `.env.production`，修改后重启对应服务。
不要加 `NEXT_PUBLIC_` 前缀，不要提交真实值。生产 Compose 已通过 `env_file` 读取该文件。

- 官方 `qiniu` SDK 使用 HTTPS 上传到既有华南（z2）私有桶 `lihao66`；不使用 S3 endpoint。
  `next.config.ts` 将 SDK 设为 `serverExternalPackages`，由 Node 服务端运行时加载并随 standalone 产物交付。
- 文生图和参考图生图都在 provider 成功后上传结果；不上传用户参考图，不改变 provider 调用。
- 文件 key 为 `focal/{UTC yyyy-MM-dd}/{uuid}.{ext}`，从图片字节识别 PNG/JPEG/WebP/GIF。
- 成功返回 `image.url`、`image.download_url` 和 `image.output_format`，**不返回 `b64_json`**。
  展示/放大直接使用 CDN；附件下载链接将 `attname` 纳入签名，不走 VPS 代理或依赖浏览器 CORS 下载。
- 域名固定为 `https://img.lihao66.top`，私有签名有效期 48 小时。已有桶生命周期规则在一天后清理文件；
  签名不延长源文件寿命，源文件删除也不意味着 CDN 缓存在同一时刻失效。
- 上传失败、格式无法识别或上传总等待超过 10 秒，回退原 base64 响应，成功用量保持正常统计。
  SDK 网络请求也设超时且不重试。应用只记录 `[image-service] CDN upload fallback`、requestId、
  providerId 和安全错误类别，不记录原始 SDK 错误、密钥、图片或签名 URL。
- 不新增图片历史、设置表、清理任务或七牛资源。需要撤回启用时清空密钥并重启服务即可。

本地自动验证（只 mock 上传网络和生图 provider，不消耗真实生图额度、不上传云端）：

```bash
pnpm test tests/images/qiniu-delivery.test.ts tests/api/text-to-image-route.test.ts tests/api/reference-image-route.test.ts tests/app/image-workbench.test.tsx
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

真实环境验收：配置密钥并运行 `pnpm dev`，登录后分别测试文生图和参考图生图。在浏览器 Network
中确认生成 API 的 JSON 只有 URL、没有 base64，图片 GET 的目标为 `img.lihao66.top`；检查放大预览及
下载附件。清空两个密钥并重启后，确认恢复 base64 展示。真实云端验收需单独执行，mock 通过不代表
七牛凭据权限、CDN 私有鉴权或实际带宽已验证。不要公开包含签名 URL 的 HAR/截图。

## 安全边界

- 不提交真实 `.env`、API key、数据库文件、上传文件或生成图片。
- `.env.example` 只包含变量名和占位说明。
- `env/*.env.example` 只保存部署模板；真实 `.env.production` 和 `.env.local` 不提交。
- 默认不保存生成图片本体；配置七牛后仅将结果临时上传既有私有桶，由桶生命周期清理。
- 不保存上传参考图文件。
- `user_id` 只能来自服务端校验后的 Supabase Auth 用户。

## 生产部署

目标链路：

```text
https://image.lihao66.top
  -> VPS Caddy
  -> Tailscale
  -> Mac mini image-service:3010
```

生产容器使用 `compose/prod/image-service.prod.compose.yml`。首次部署前，在项目根目录创建
真实生产环境文件：

```bash
cp env/image-service.production.env.example .env.production
```

然后填入真实 `NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUB2API_API_KEY`、`FASTCODE_API_KEY`、`MINIMAX_API_KEY`
等值。不要提交 `.env.production`。

上线前重点核对 `.env.production`：

- `NEXT_PUBLIC_APP_URL` 与线上域名一致。
- `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY` 是生产可用值，且不是
  service role key。
- `IMAGE_DEFAULT_PROVIDER` 和 `IMAGE_DEFAULT_MODEL` 指向 `IMAGE_PROVIDER_OPTIONS` 中已启用
  的 provider/model；默认仍建议保持 `toioto / gpt-image-2`，新 provider 稳定后再单独切换。
- `IMAGE_PROVIDER_OPTIONS` 是合法单行 JSON。OpenAI-compatible、Gemini generateContent
  和 MiniMax image_generation provider 分开配置；Gemini 不放进 `fastcode` 这类
  `openai-compatible-images` provider 下。
- 每个 provider 的 `apiKeyEnv` 都有对应真实环境变量；模板里的空字符串占位要在生产环境补齐。
- `IMAGE_SERVICE_SQLITE_PATH` 指向容器内 `/data/sqlite/image-service.sqlite`，并由 compose volume
  挂载到宿主机持久化目录。

生产数据目录：

```bash
mkdir -p /Users/hao/Desktop/lihao-data/image-service/sqlite
```

启动或更新生产容器：

```bash
docker compose --env-file .env.production -f compose/prod/image-service.prod.compose.yml up -d --build
```

检查状态：

```bash
docker compose --env-file .env.production -f compose/prod/image-service.prod.compose.yml ps
curl -fsS http://127.0.0.1:3010/health
curl -I https://image.lihao66.top/health
```

部署前建议先在当前提交上跑完整验证：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

部署后建议至少做一次健康检查、一次登录页面访问检查，并在登录后分别用当前默认模型和需要上线的
新增 provider 做文生图 smoke test；如上线 Gemini provider，再额外做一次参考图生图 smoke test。
确认容器日志里没有 provider 配置解析错误、认证错误或 `provider_response_invalid` 后，再把外部入口视为可用。

VPS Caddy 站点片段参考 `caddy/sites/image.lihao66.top.caddy`。Caddy 和 DNS 变更需要在
对应机器上手动确认后应用。

## 线上排障

查看生产容器日志：

```bash
docker compose --env-file .env.production -f compose/prod/image-service.prod.compose.yml logs --tail=220 image-service
```

查看最近生成记录：

```bash
sqlite3 /Users/hao/Desktop/lihao-data/image-service/sqlite/image-service.sqlite \
  "select datetime(created_at,'localtime'), status, coalesce(error_code,'(none)'), provider, model, mode, size, quality, output_format, duration_ms from generation_logs order by created_at desc limit 30;"
```

按错误类型汇总：

```bash
sqlite3 /Users/hao/Desktop/lihao-data/image-service/sqlite/image-service.sqlite \
  "select status, coalesce(error_code,'(none)'), provider, model, mode, count(*), min(created_at), max(created_at), round(avg(duration_ms),1) from generation_logs group by status, error_code, provider, model, mode order by max(created_at) desc;"
```

图片生成失败路径会输出结构化诊断日志，并用同一个 `requestId` 串联 route 和 provider：

```text
[image-service] image request started
[image-provider] provider response json parse failed
[image-provider] provider error response
[image-provider] invalid provider response
[image-service] image request failed
```

这些日志只记录 requestId、provider id、endpoint、HTTP status、content-type、content-length、
参数摘要、prompt 长度、响应顶层字段、`data` 数量、provider error code/type 和截断脱敏后的
非 JSON body 预览。不记录 prompt 全文、图片 base64、上传图片内容、请求头、API key、cookie
或完整 provider message。

## 后续更新

常规更新流程：

```bash
git pull
pnpm lint
pnpm typecheck
pnpm test
pnpm build
docker compose --env-file .env.production -f compose/prod/image-service.prod.compose.yml up -d --build
docker compose --env-file .env.production -f compose/prod/image-service.prod.compose.yml ps
curl -fsS http://127.0.0.1:3010/health
```

如需回滚，先找到上一个可用提交，再重建容器：

```bash
git log --oneline -5
git checkout <good-commit>
docker compose --env-file .env.production -f compose/prod/image-service.prod.compose.yml up -d --build
```

## 模块边界

- `src/app/`：页面、路由和健康检查。
- `src/app/workbench/`：工作台拆分组件、类型、helper、弹窗和图标。
- `src/lib/auth/`：Supabase Auth 服务端 helper、cookie session 刷新和用户校验。
- `src/lib/config/`：服务端配置解析、provider allowlist、公开投影和参数校验。
- `src/lib/db/`：SQLite 连接、schema 和按用户隔离的查询 helper。
- `src/lib/providers/`：provider adapter 接口和 OpenAI 兼容 Images API 实现。
- `src/lib/usage/`：每日额度和 generation log。
- `src/lib/recipes/`：Prompt 配方校验和按用户隔离的 CRUD helper。
- `src/lib/images/`：图片请求校验和响应辅助。
- `src/lib/prompt-templates/`：内置模板、分类、模板渲染和模板索引。
- `src/lib/diagnostics/`：结构化图片生成失败诊断日志。

参考文档：

- `docs/README.md`：文档索引。
- `docs/specs/2026-05-29-prompt-first-provider-model-slimming-design.md`：当前
  provider-model 二级配置和主流程瘦身设计。
- `docs/superpowers/plans/2026-05-29-prompt-first-provider-model-slimming-plan.md`：
  上述设计的实施计划和验证背景。
- `docs/specs/2026-05-17-image-service-mvp-design.md`：MVP 设计规格。
- `docs/specs/2026-05-18-chat-style-image-workbench-redesign.md`：聊天式工作台重设计。
- `docs/specs/2026-05-19-gpt-image-2-and-usage-hardening-design.md`：gpt-image-2 和用量加固设计。
- `docs/reference/openai-compatible-images-api.md`：当前 provider 和图片接口调用约束。
- `docs/reference/data-and-storage.md`：数据和存储约束。
