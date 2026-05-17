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
| Next.js 实现 | 已完成 | 04094c7 | W03-W12 已完成；基础验证与阶段收口 review 通过，无阻塞。 |
| 提示词库与 UI 重构设计 | 已完成 | 30659ba | W13 完成；新增三栏工作台、内置中文模板库、我的模板/收藏、变量填充和 W14-W17 实施边界设计。 |
| 提示词库与 UI 重构实施计划 | 已完成 | 4178a4f | 主控新增 W14-W17 自动调度计划。 |
| W14 内置中文模板数据 | 已完成 | 483260a | 新增 12 类/13 条内置中文模板、模板类型和变量渲染/插入 helper；完整验证通过。 |

## 阶段结论

已完成。

W12 收口验证通过。下一阶段建议进入部署准备；部署前补齐生产环境变量和数据目录确认，然后做一次受控 provider smoke test。禁止提交运行时数据库、生成图片或密钥。

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
- 2026-05-17：W10 保存配置与用户隔离完成，提交 `9b81f8a feat: add prompt recipe persistence`。新增 recipe save/list/read/update/delete API、recipe 校验和按用户隔离 CRUD helper；保存时复用 allowlist 校验并拒绝 provider config/base URL/API key 元数据；用户 A 不能读取或修改用户 B 的 recipe；生成 API 不自动保存 recipe；recipe 不保存生成图片或参考图文件列；验证 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`git diff --check` 通过；无阻塞。
- 2026-05-17：W11 前端生图页面完成，提交 `f9c53ca feat: add image generation workbench`。`/` 变为登录后的中文生图工作台，支持 allowlist 驱动参数、文生图、参考图生图、临时预览、下载、手动保存配置和 loading/success/saved/error 状态；组件测试覆盖 allowlist、生成不自动保存、保存配置、参考图和脱敏错误；确认未使用 localStorage/sessionStorage，客户端不发送 provider key/base URL/apiKeyEnv；验证 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`git diff --check` 通过，浏览器未登录跳转通过；无阻塞。
- 2026-05-17：W12 基础验证与阶段收口 review 完成，提交 `04094c7 docs: add w12 phase closeout review`。新增 `docs/reports/2026-05-17-w12-phase-closeout-review.md`；验证 `pnpm lint`、`pnpm typecheck`、`pnpm test`（13 个 test files、59 个 tests）、`pnpm build`、`git diff --check` 全部通过；验收清单覆盖未登录保护、文生图 data[0]、参考图 data[1]/fallback、图片不保存、配置只手动保存、generation log 不保存 prompt 全文、allowlist、每日额度和用户隔离；仓库扫描未发现真实 `.env`、SQLite/db 文件、上传/生成图片、密钥或长 base64；无阻塞。
- 2026-05-17：用户本地配置 Supabase 和 sub2api 后完成真实登录与真实生图测试，反馈功能跑通但 UI/交互较差，希望新增提示词库，避免每次从零编写 prompt。新阶段要求内置模板库、我的模板/个人收藏、中文分类、参考 `freestylefly/awesome-gpt-image-2` 提取适合 `gpt-image-2` 的提示词，并使用 `ui-ux-pro-max` 做 UI 设计。
- 2026-05-17：W13 提示词库与生图工作台 UI 重构设计完成，提交 `30659ba docs: design prompt library workbench redesign`。新增 `docs/specs/2026-05-17-prompt-library-ui-redesign.md`；设计三栏工具型工作台、12 个中文模板分类、内置模板数据结构、变量替换/插入逻辑、`prompt_recipes` 与 `template_favorites` 关系、模板聚合 API、移动端降级、安全隐私边界和 W14-W17 后续拆分；验证 `git diff --check` 通过，未跑完整测试因为只新增 Markdown 设计文档；无阻塞。
- 2026-05-17：主控新增 `docs/plans/2026-05-17-prompt-library-ui-redesign-implementation-plan.md`，提交 `4178a4f docs: plan prompt library ui implementation`。计划拆分 W14-W17：内置中文模板数据提取与结构化、提示词库 API / 我的模板聚合、工作台 UI 重构、UI/UX 验证与阶段收口；要求实现类窗口 TDD、每窗提交、忽略本地 `next-env.d.ts` 改动、不提交敏感/运行时数据。
- 2026-05-17：W14 内置中文模板数据提取与结构化完成，提交 `483260a feat: add builtin prompt templates`。新增 `src/lib/prompt-templates/*` 和 `tests/prompt-templates/*`；共 13 条内置中文模板，覆盖 12 个分类，包含文生图和参考图模板，推荐参数限定在 MVP allowlist；新增 `renderPromptTemplate` 与 `insertRenderedPrompt` 纯函数，覆盖必填变量、默认值、未知变量、未声明占位符、插入选区和 4000 字符上限；读取 GitHub README、`docs/templates.md` 和 LICENSE，模板内容中文化改写；验证 `pnpm test tests/prompt-templates`、`pnpm lint`、`pnpm typecheck`、`pnpm test`（15 files / 74 tests）、`git diff --check` 全部通过；无阻塞。
