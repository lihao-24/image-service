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
`IMAGE_DEFAULT_QUALITY`、`IMAGE_DEFAULT_OUTPUT_FORMAT` 配置默认值。公开接口
`/api/image-options` 只返回 `defaultProvider`、`defaults`、provider
`id/label/models` 和尺寸、质量、格式选项，不包含 `baseUrl`、`apiKeyEnv`
或 API key。

## Prompt 配方 API

- `POST /api/recipes`：保存当前登录用户的 Prompt 配方。
- `GET /api/recipes`：列出当前登录用户自己的 Prompt 配方。
- `GET /api/recipes/[recipeId]`：读取自己的单个 Prompt 配方。
- `PATCH /api/recipes/[recipeId]`：更新自己的 Prompt 配方。
- `DELETE /api/recipes/[recipeId]`：删除自己的 Prompt 配方。

保存和更新会在服务端按 allowlist 校验 `provider`、`model`、`size`、`quality`
和 `output_format`。`user_id` 只来自服务端 Auth helper；接口不会接受客户端
provider 配置、base URL 或 API key 元数据。生成 API 不会自动保存 Prompt 配方，
只有显式调用 recipe API 才写入 `prompt_recipes`。

## 前端生图工作台

登录后访问 `/` 会进入生图工作台。页面参数控件来自 `/api/image-options` 的公开
allowlist，支持文生图、参考图生图、临时预览、下载当前临时图片和手动保存配置。
生成成功不会自动保存 Prompt 配方；生成图片 base64 只保留在当前浏览器状态中，不写入
`localStorage`、SQLite、服务器磁盘或日志。

## 安全边界

- 不提交真实 `.env`、API key、数据库文件、上传文件或生成图片。
- `.env.example` 只包含变量名和占位说明。
- 第一版不保存生成图片本体。
- 不保存上传参考图文件。
- `user_id` 只能来自服务端校验后的 Supabase Auth 用户。

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
