# image-service

`image-service` 是个人 AI 服务体系中的生图网页服务。

当前已创建 Next.js 应用骨架、登录边界、SQLite 数据层、provider allowlist、
OpenAI 兼容 Images API adapter、生成 API、Prompt 配方保存 API 和登录后的中文生图工作台。
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

服务端通过 `IMAGE_PROVIDER_OPTIONS` 配置 provider allowlist，并用
`IMAGE_DEFAULT_PROVIDER`、`IMAGE_DEFAULT_MODEL`、`IMAGE_DEFAULT_SIZE`、
`IMAGE_DEFAULT_RESOLUTION`、`IMAGE_DEFAULT_QUALITY`、`IMAGE_DEFAULT_OUTPUT_FORMAT`、
`IMAGE_DEFAULT_BACKGROUND`、`IMAGE_DEFAULT_MODERATION` 配置默认值。公开接口
`/api/image-options` 只返回 `defaultProvider`、`defaults`、provider
`id/label/models` 和尺寸、分辨率、质量、格式、背景、安全审核选项，不包含
`baseUrl`、`apiKeyEnv` 或 API key。

## Prompt 配方 API

- `POST /api/recipes`：保存当前登录用户的 Prompt 配方。
- `GET /api/recipes`：列出当前登录用户自己的 Prompt 配方。
- `GET /api/recipes/[recipeId]`：读取自己的单个 Prompt 配方。
- `PATCH /api/recipes/[recipeId]`：更新自己的 Prompt 配方。
- `DELETE /api/recipes/[recipeId]`：删除自己的 Prompt 配方。

保存和更新会在服务端按 allowlist 校验 `provider`、`model`、`size`、
`resolution`、`quality`、`output_format`、`background` 和 `moderation`。
`user_id` 只来自服务端 Auth helper；接口不会接受客户端 provider 配置、base URL
或 API key 元数据。生成 API 不会自动保存 Prompt 配方，只有显式调用 recipe API
才写入 `prompt_recipes`。

## 前端生图工作台

登录后访问 `/` 会进入生图工作台。页面参数控件来自 `/api/image-options` 的公开
allowlist，支持文生图、参考图生图、临时预览、下载当前临时图片和手动保存配置。
生成成功不会自动保存 Prompt 配方；生成图片 base64 只保留在当前浏览器状态中，不写入
`localStorage`、SQLite、服务器磁盘或日志。

## 安全边界

- 不提交真实 `.env`、API key、数据库文件、上传文件或生成图片。
- `.env.example` 只包含变量名和占位说明。
- `env/*.env.example` 只保存部署模板；真实 `.env.production` 和 `.env.local` 不提交。
- 第一版不保存生成图片本体。
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

然后填入真实 `NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUB2API_API_KEY` 等值。不要提交
`.env.production`。

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
- `src/lib/auth/`：Supabase Auth 服务端 helper、cookie session 刷新和用户校验。
- `src/lib/config/`：服务端配置解析、provider allowlist、公开投影和参数校验。
- `src/lib/db/`：SQLite 连接、schema 和按用户隔离的查询 helper。
- `src/lib/providers/`：provider adapter 接口和 OpenAI 兼容 Images API 实现。
- `src/lib/usage/`：每日额度和 generation log。
- `src/lib/recipes/`：Prompt 配方校验和按用户隔离的 CRUD helper。
- `src/lib/images/`：图片请求校验和响应辅助。

参考文档：

- `docs/specs/2026-05-17-image-service-mvp-design.md`
- `docs/reference/openai-compatible-images-api.md`
- `docs/reference/data-and-storage.md`
- `docs/controller/master-window-prompt.md`
- `docs/controller/phase0-progress.md`
