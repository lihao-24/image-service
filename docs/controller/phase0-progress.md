# Phase 0 进度记录

目标：为 image-service 创建参考文档和主控工作入口，后续通过主控窗口模式推进正式设计、计划和实现。

约束：

- 当前阶段只创建文档。
- 不 scaffold Next.js。
- 不写应用代码。
- 不连接中转站 API。
- 不连接 VPS。
- 不执行数据库 migration。
- 不提交真实 `.env`、密钥、数据库 dump、运行时数据或生成图片。
- 每个工作窗口完成后必须提交，并在回传中提供 commit hash。
- 本项目是中文网站；文档、代码注释、界面文案和用户可见错误说明优先使用中文。

参考文档：

- MVP 设计：`docs/specs/2026-05-17-image-service-mvp-design.md`
- API 参考：`docs/reference/openai-compatible-images-api.md`
- 数据与存储：`docs/reference/data-and-storage.md`
- 实施计划：`docs/plans/2026-05-17-image-service-mvp-implementation-plan.md`
- 主控提示词：`docs/controller/master-window-prompt.md`

## 已确认决策

- 技术栈使用 Next.js。
- 网站语言为中文，界面文案、文档和注释优先中文。
- 复用现有 self-hosted Supabase Auth。
- Provider 使用 OpenAI-compatible Images API。
- 当前只接 `sub2api`。
- Base URL 为 `https://sub2api.toioto.org/v1`。
- 文生图调用 `/v1/images/generations`。
- 参考图生图调用 `/v1/images/edits`。
- edits 结果优先取 `response.data[1].b64_json`，没有第二项时回退 `response.data[0].b64_json`。
- 参数开放给用户选择，但来自服务端 allowlist。
- 图片不落服务器磁盘，只返回前端临时展示。
- 用户点击下载时在本地下载。
- 用户点击“保存配置”才写 SQLite。
- 每次生成自动写 generation log，但只保存元信息，不保存 prompt 全文和图片。
- 未来会给少量朋友或家人使用，因此第一版要考虑登录、用户隔离和每日额度。

## 模块状态

| 模块 | 状态 | 提交 | 记录 |
| --- | --- | --- | --- |
| 参考文档 | 已完成 | c51e568 | MVP 设计、API 参考、数据与存储已完成 W01 review 修订。 |
| 正式 spec review | 已完成 | c51e568 | W01 完成；无阻塞；`git diff --check` 通过；提交只包含三份 W01 文档。 |
| 实施计划 | 已完成 | fa3ea83 | W02 完成；创建 `docs/plans/2026-05-17-image-service-mvp-implementation-plan.md` 并按项目语言要求改为中文；无阻塞。 |
| 工作窗口提示词 | 已完成 | fa3ea83 | 用户确认后续提示词直接由主控窗口发出，不再创建提示词文档；W02 已拆分 W03-W12；后续窗口必须要求提交。 |
| Next.js 实现 | 进行中 | 647c85d | W03-W09 已完成；W10 保存配置与用户隔离待派发。 |

## 阶段结论

未完成。

## 主控记录

- 2026-05-17：创建 image-service Phase 0 参考文档和主控入口。
- 2026-05-17：用户确认后续工作窗口提示词直接在主控窗口发送，不创建提示词文件；等待派发 W01 正式 spec review。
- 2026-05-17：W01 正式 spec review 完成，提交 `c51e568 docs: refine image service mvp spec boundaries`。修订三份文档，补齐 Supabase Auth user_id 来源、请求校验顺序、每日额度口径、provider allowlist、generation log 元信息、参考图上传边界和应用错误码；无阻塞，`git diff --check` 通过。
- 2026-05-17：派发 W02 实施计划工作窗口，等待结果回传。
- 2026-05-17：W02 实施计划完成，待提交。新增 `docs/plans/2026-05-17-image-service-mvp-implementation-plan.md`，拆分 W03-W12：Next.js 初始化、Supabase Auth、SQLite 数据层、Provider adapter/allowlist、文生图 API、参考图生图 API、每日额度与 generation log、保存配置与用户隔离、前端页面、阶段收口 review；无阻塞。
- 2026-05-17：用户补充长期规则：每个工作窗口完成后必须提交并回传 commit hash；本项目是中文网站，后续文档、代码注释、界面文案和用户可见说明优先中文。主控已将 W02 实施计划改为中文。
- 2026-05-17：W02 实施计划和主控规则已提交，提交 `fa3ea83 docs: add image service implementation plan`。
- 2026-05-17：派发 W03 Next.js 项目初始化工作窗口，等待结果回传。
- 2026-05-17：W03 Next.js 项目初始化完成，提交 `0701130 chore: scaffold next app`。使用 `pnpm`，创建 Next.js App Router 骨架、TypeScript/ESLint/Vitest 配置、安全 `.env.example`、中文首页、`/health` 健康端点和 `src/lib/*` 模块占位；验证 `pnpm install`、`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`git diff --check`、浏览器首页和 `/health` 均通过；无阻塞。
- 2026-05-17：W04 Supabase Auth 接入完成，提交 `df45fc8 feat: add supabase auth boundary`。新增 Supabase SSR server client、cookie session 刷新、`getSessionUser` / `getRequiredUserId` helper、登录/登出路由、受保护 API 示例和 route guard；`user_id` 只来自服务端 `supabase.auth.getUser()` 校验后的 `user.id`；验证 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`git diff --check` 和浏览器未登录跳转均通过；无阻塞。
- 2026-05-17：W05 SQLite 数据层与 schema 完成，提交 `088f312 feat: add sqlite data layer`。新增本地 SQLite 初始化、`prompt_recipes`、`generation_logs`、`daily_usage` schema 和用户隔离测试；`generation_logs` 只保存元信息，不含 prompt 全文、图片字段或 API key；默认数据库路径为 `./data/image-service.sqlite`，测试使用 `/tmp/image-service-sqlite-tests` 临时库并清理 sidecar；验证 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`git diff --check` 通过；无阻塞。
- 2026-05-17：W06 Provider adapter 与 allowlist 完成，提交 `ee375f1 feat: add provider adapter allowlist`。新增 provider 配置变量解析、公开 `/api/image-options` allowlist、参数校验 helper 和可注入 fetch 的 OpenAI 兼容 Images adapter；公开 allowlist 不包含 `baseUrl`、`apiKeyEnv` 或 API key；mock 测试覆盖 generations/edits endpoint，未调用真实 provider；验证 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`git diff --check` 通过；无阻塞。
- 2026-05-17：W07 文生图 API 完成，提交 `5d9f77c feat: add text to image generation api`。新增 `POST /api/images/generations`，串联 auth、allowlist、额度预检查、provider adapter、generation log 和成功后 daily_usage 递增；成功返回临时 base64 和 UI 元信息，不保存图片或 prompt 全文；额度用尽不调用 provider，provider 失败不递增用量；验证 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`git diff --check` 通过；无阻塞。
- 2026-05-17：W08 参考图生图 API 完成，提交 `31376eb feat: add reference image generation api`。新增 `POST /api/images/edits`，支持 multipart 参考图校验，限制最大 10MB 且 MIME 仅允许 PNG/JPEG/WebP；串联 auth、allowlist、额度、edits adapter、generation log 和 daily_usage；测试覆盖 `data[1]` 优先和 `data[0]` fallback、quota/log、隐私边界，确认不保存参考图、生成图或 prompt 全文；验证 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`git diff --check` 通过；无阻塞。
- 2026-05-17：W09 每日额度与 generation log 加固完成，提交 `647c85d test: harden generation quota logging`。复核两个生成 API 的额度和日志语义，发现并修复 adapter 返回空 `b64Json` 时可能被计为成功的缺口；现在仅 provider 成功返回非空可用图片后递增 `daily_usage`，额度用尽写 rejected 且不调用 provider，失败写 failed 且不递增，日志只保存元信息；验证 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`git diff --check` 通过；无阻塞。
