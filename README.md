# image-service

`image-service` 是个人 AI 服务体系中的生图网页服务。

当前已创建 Next.js 应用骨架和基础开发工具。W03 只提供首页、健康页、公开配置占位和模块目录，不实现登录、数据库、provider 调用或生图接口。

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

## 安全边界

- 不提交真实 `.env`、API key、数据库文件、上传文件或生成图片。
- `.env.example` 只包含变量名和占位说明。
- 第一版不保存生成图片本体。
- `user_id` 只能来自服务端校验后的 Supabase Auth 用户。

## 模块边界

- `src/app/`：页面、路由和健康检查。
- `src/lib/auth/`：Supabase Auth helper，占位等待 W04。
- `src/lib/config/`：服务端配置解析、provider allowlist 和默认参数。
- `src/lib/db/`：SQLite 连接和查询 helper，占位等待 W05。
- `src/lib/providers/`：provider adapter，占位等待 W06。
- `src/lib/usage/`：每日额度和 generation log，占位等待 W09。
- `src/lib/recipes/`：Prompt 配方 CRUD，占位等待 W10。
- `src/lib/images/`：图片请求校验和响应辅助，占位等待 W07/W08。

参考文档：

- `docs/specs/2026-05-17-image-service-mvp-design.md`
- `docs/reference/openai-compatible-images-api.md`
- `docs/reference/data-and-storage.md`
- `docs/controller/master-window-prompt.md`
- `docs/controller/phase0-progress.md`
