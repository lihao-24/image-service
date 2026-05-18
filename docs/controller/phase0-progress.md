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
| W15 提示词库 API / 我的模板聚合 | 已完成 | 90ce30a | 新增模板聚合 API、内置模板收藏 API、`template_favorites` 数据层和用户隔离测试。 |
| W16 工作台 UI 重构 | 已完成 | d6c2b46 / baf1acb | 三栏提示词库工作台已实现；补充修复 daily usage 测试日期口径；主控复核全量验证通过。 |
| W16.1 Apple 风格 UI 返工 | 已完成 | c9ce98e | 顶部压缩为状态栏，提示词库支持桌面折叠/展开，浅色 Apple 风格视觉重做；自动验证通过，未做截图测试。 |
| W16.2 Linear / Apple Pro 布局重构 | 已完成 | 66bff8a | 桌面端移除分段导航，重构三列布局并修复预览区截断；自动验证通过，未做截图测试。 |
| W16.3 Minimalist Premium 设计稿落地 | 已完成 | 6479847 | 参考用户提供的 Gemini 设计稿，落地 slate/indigo 极简现代三栏工作台；自动验证通过，未做截图测试。 |
| W16.4 对话式 AI 生图工作台 | 已完成 | 6f66e78 / 22d1624 | 全屏 ChatGPT 式聊天画布、可完全隐藏深色侧边栏、模板 Modal、消息流和保存配置 Modal 已实现；主控补充复核移动端 drawer 语义和参考图缩略图生命周期；自动验证通过，未做截图测试。 |
| W16.4.1 控件与模板区修正 | 已完成 | 3b80dce | 将顶部、生成和消息动作改为图标按钮；侧边栏模板区改为“默认 / 我的”切换下方列表，列表滚动且底部用户区固定可见；自动验证通过，未做截图测试。 |
| W16.4.2 模板列表溢出修正 | 已完成 | e3e2207 | 侧边栏模板列表禁用横向滚动，长分类标题和描述使用省略号截断；自动验证通过，未做截图测试。 |

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
- 2026-05-17：W15 提示词库 API / 我的模板聚合完成，提交 `90ce30a feat: add prompt template library api`。新增 `GET /api/prompt-templates`、`POST /api/prompt-templates/favorites`、`DELETE /api/prompt-templates/favorites/[templateId]`、`src/lib/prompt-template-library/index.ts`，并在 SQLite 新增 `template_favorites(user_id, template_id, created_at)`；聚合响应包含 categories、内置模板、我的模板和收藏 ids，支持 source/category/mode/q/favorite 筛选；收藏只保存当前用户的内置模板 id，不复制为 `prompt_recipes`；测试覆盖未登录保护、用户隔离、非法模板拒绝、收藏幂等、响应不泄露 baseUrl/apiKeyEnv/API key；验证 `pnpm test tests/api/prompt-template-library-route.test.ts tests/db/sqlite-data-layer.test.ts`（2 files / 20 tests）、`pnpm lint`、`pnpm typecheck`、`pnpm test`（16 files / 89 tests）、`git diff --check` 全部通过；主控复跑目标测试与 `git diff --check` 通过；无阻塞。
- 2026-05-18：W16 工作台 UI 重构完成，提交 `d6c2b46 feat: redesign image workbench with prompt library`。`src/app/image-workbench.tsx` 重构为中文三栏工具型工作台，接入 `/api/prompt-templates`，支持内置模板/我的模板/收藏、搜索、分类筛选、变量填写、替换/插入 prompt、推荐参数应用、内置模板收藏、保存配置后刷新我的模板，并保留文生图、参考图、临时预览、下载和 provider 错误脱敏；`src/app/globals.css` 新增桌面三栏、移动端“模板 / 编辑 / 预览”分段切换、稳定预览比例、44px 触控目标和焦点状态；`tests/app/image-workbench.test.tsx` 扩展到 12 个测试。W16 初次全量测试在北京时间凌晨跨 UTC 日期边界暴露既有测试问题：API 测试用 UTC 日期查询 `daily_usage`，生产代码按服务端本地日期写入；已由提交 `baf1acb test: align daily usage date assertions` 将测试查询口径改为 `getUsageDate()`。主控复核 `pnpm test tests/app/image-workbench.test.tsx`（12 tests）、`pnpm test tests/api/text-to-image-route.test.ts tests/api/reference-image-route.test.ts`（15 tests）、`pnpm test`（16 files / 96 tests）、`pnpm lint`、`pnpm typecheck`、`pnpm build`、`git diff --check` 全部通过；无阻塞。用户要求 W16 后停止，W17 浏览器/截图收口由用户手动执行，主控不派发 W17。
- 2026-05-18：用户反馈 W16 UI 仍不美观，要求改为 Apple 风格、顶部更小、左侧提示词库可展开/折叠，并明确不用截图测试，完成后通知手动验证。W16.1 Apple 风格 UI 返工完成，提交 `c9ce98e feat: refine workbench apple style layout`。`src/app/image-workbench.tsx` 将顶部改为约 56px 紧凑状态栏，移除大 H1，新增提示词库展开/折叠状态；桌面默认窄栏显示“模板”和数量，展开后显示搜索、来源、分类和模板列表；移动端保留“模板 / 编辑 / 预览”分段切换。`src/app/globals.css` 使用浅色 Apple 风格视觉系统、系统字体、轻边框、轻阴影、Apple Blue 强调色，重做布局、预览区、表单控件、焦点和 reduced-motion；`tests/app/image-workbench.test.tsx` 增加折叠/展开和紧凑顶部测试。主控复核 `pnpm test tests/app/image-workbench.test.tsx`（14 tests）、`pnpm lint`、`pnpm typecheck`、`pnpm test`（16 files / 98 tests）、`pnpm build`、`git diff --check` 全部通过；按用户要求未做截图测试，等待用户手动验证。
- 2026-05-18：用户继续反馈 W16.1 仍不美观，桌面端不应显示“模板 / 编辑 / 预览”三段导航，且预览区域被截断。W16.2 Linear / Apple Pro 布局重构完成，提交 `66bff8a feat: refine workbench pro layout`。桌面端彻底移除分段导航，仅移动端保留 `移动端工作台分区`；主布局改为左侧 64px rail / 中间编辑区 / 右侧 `clamp(320px, 28vw, 460px)` 预览 inspector，展开提示词库时左栏为 300-340px；新增 `预览画布` region 和 `preview-viewport`，预览空状态和图片使用 contain 布局，避免虚线框或图片被截断；测试增加桌面导航移除、移动导航语义和预览画布空状态覆盖。主控复核 `pnpm test tests/app/image-workbench.test.tsx`（16 tests）、`pnpm lint`、`pnpm typecheck`、`pnpm test`（16 files / 100 tests）、`pnpm build`、`git diff --check` 全部通过；按用户要求未做截图测试，等待用户手动验证。
- 2026-05-18：用户提供 Gemini 设计稿，要求 Minimalist Premium 风格、Next.js React、不使用外部 UI 组件库、内联 SVG、Tailwind 色系规范、桌面 280px / 自适应 / 400px 三栏、移动端功能 Tab、indigo 主按钮、slate 背景和完整预览画布。W16.3 设计稿落地完成，提交 `6479847 feat: apply minimalist premium workbench design`。未引入 Tailwind/AntD/Shadcn，使用现有原生 CSS 映射 `bg-slate-50`、`bg-white`、`indigo-600`、`text-slate-*` 等规范；`src/app/image-workbench.tsx` 改为完整桌面模板栏、语义化移动 tab、横向分类标签、Prompt 计数结构和预览 SVG 占位；`src/app/globals.css` 重做三栏布局、表单、按钮、模板卡片、预览画布、大圆角、轻阴影和弱边框；移动端默认编辑 tab，生成成功后切换到预览。主控复核 `pnpm test tests/app/image-workbench.test.tsx`（17 tests）、`pnpm lint`、`pnpm typecheck`、`pnpm test`（16 files / 101 tests）、`pnpm build`、`git diff --check` 全部通过；按用户要求未做截图测试，等待用户手动验证。
- 2026-05-18：用户反馈 W16.3 仍不满意，要求换新窗口重新讨论 UI，不再沿旧三栏方向小修。主控使用 `ui-ux-pro-max` 和 brainstorming 流程，确认改为全屏对话式 AI 生图工作台：深色 sidebar 可完全隐藏、桌面默认展开、手机默认折叠，设置区默认只展示尺寸并可展开完整参数；模板入口放入 sidebar，具体模板通过 Modal 选择并填写变量；主画布为 ChatGPT 式消息流，点击生成立即插入用户消息和 AI loading，清空输入框；生成成功后 AI 图片消息提供下载、重新生成、复制 Prompt、保存配置；保存配置改为图片消息动作中的 Modal；消息流、生成图片、参考图只存在 React state。新增设计文档 `docs/specs/2026-05-18-chat-style-image-workbench-redesign.md`，提交 `f555bd9 docs: design chat style image workbench`；新增实施计划 `docs/plans/2026-05-18-chat-style-image-workbench-implementation-plan.md`，提交 `47212d9 docs: plan chat style workbench implementation`。
- 2026-05-18：W16.4 对话式 AI 生图工作台实现完成，提交 `6f66e78 feat: redesign workbench as chat canvas`。新增 Tailwind/PostCSS 接入，拆分 `src/app/workbench/*` 组件；`src/app/image-workbench.tsx` 变为顶层编排，支持全屏聊天画布、可隐藏深色 sidebar、二级折叠设置区、模板 Modal、消息流、底部 Prompt composer、参考图上传、AI 图片动作和保存配置 Modal。主控复核发现移动端默认折叠语义和参考图缩略图对象 URL 生命周期两个偏差，已由 follow-up 提交 `22d1624 fix: align mobile drawer and reference previews` 修复：移动端默认不渲染 sidebar complementary，点击汉堡才打开 drawer；参考图消息独立持有 blob 预览 URL，清空 composer 不会立即 revoke 消息缩略图。主控复核 `pnpm test tests/app/image-workbench.test.tsx`（12 tests）、`pnpm lint`、`pnpm typecheck`、`pnpm test`（16 files / 96 tests）、`pnpm build`、`git diff --check` 全部通过；确认未提交 `.env`、密钥、SQLite/db 文件、上传图片、生成图片或运行时数据；按用户要求未做截图测试。
- 2026-05-18：用户基于浏览器截图反馈 W16.4：按钮样式异常，应改为图标按钮；模板区占用用户信息区域，“收藏/我的”不应打开弹窗，应改为“默认/我的”切换下方列表；隐藏/展开侧边栏也应为图标按钮。W16.4.1 修正完成，提交 `3b80dce fix: refine chat workbench controls and templates`。新增 `src/app/workbench/icons.tsx` 内联 SVG 图标；顶部侧边栏切换、更多、生成、用户消息动作、AI 图片动作改为 icon-only button 并保留 `aria-label`；侧边栏模板区改为“默认 / 我的”切换，下方列表使用 `min-h-0 overflow-y-auto`，底部用户信息区 `shrink-0` 固定可见；“默认”恢复内置分类列表，“我的”显示我的模板或简短空状态。主控复核 `pnpm test tests/app/image-workbench.test.tsx`（15 tests）、`pnpm lint`、`pnpm typecheck`、`pnpm test`（16 files / 99 tests）、`pnpm build`、`git diff --check` 全部通过；确认未提交敏感、数据库、上传/生成图片或运行时数据；按用户要求未做截图测试。
- 2026-05-18：用户反馈侧边栏模板列表仍出现横向滚动条，要求内容超出隐藏并显示省略号。W16.4.2 小修完成，提交 `e3e2207 fix: prevent sidebar template overflow`。`src/app/workbench/chat-sidebar.tsx` 为模板 section、滚动容器、列表按钮、标题和描述补充 `min-w-0`、`overflow-x-hidden`、`overflow-hidden`、`truncate` 和 `w-full`，保留纵向滚动并避免底部用户区被挤压；`tests/app/image-workbench.test.tsx` 增加长分类文本的溢出防护测试。主控复核 `pnpm test tests/app/image-workbench.test.tsx`（16 tests）、`pnpm lint`、`pnpm typecheck`、`pnpm test`（16 files / 100 tests）、`pnpm build`、`git diff --check` 全部通过；按用户要求未做截图测试。
