# image-service

`image-service` 是个人 AI 服务体系中的生图网页服务。

当前已创建 Next.js 应用骨架、登录边界、SQLite 数据层、provider allowlist
和 OpenAI 兼容 Images API adapter。当前阶段仍不实现完整生图接口编排，也不调用真实 provider。

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

## 安全边界

- 不提交真实 `.env`、API key、数据库文件、上传文件或生成图片。
- `.env.example` 只包含变量名和占位说明。
- 第一版不保存生成图片本体。
- `user_id` 只能来自服务端校验后的 Supabase Auth 用户。

## 模块边界

- `src/app/`：页面、路由和健康检查。
- `src/lib/auth/`：Supabase Auth 服务端 helper、cookie session 刷新和用户校验。
- `src/lib/config/`：服务端配置解析、provider allowlist、公开投影和参数校验。
- `src/lib/db/`：SQLite 连接和查询 helper，占位等待 W05。
- `src/lib/providers/`：provider adapter 接口和 OpenAI 兼容 Images API 实现。
- `src/lib/usage/`：每日额度和 generation log，占位等待 W09。
- `src/lib/recipes/`：Prompt 配方 CRUD，占位等待 W10。
- `src/lib/images/`：图片请求校验和响应辅助，占位等待 W07/W08。

参考文档：

- `docs/specs/2026-05-17-image-service-mvp-design.md`
- `docs/reference/openai-compatible-images-api.md`
- `docs/reference/data-and-storage.md`
- `docs/controller/master-window-prompt.md`
- `docs/controller/phase0-progress.md`
