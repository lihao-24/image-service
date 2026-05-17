# 提示词库与工作台 UI 重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 在已跑通的 `image-service` MVP 上新增中文提示词库、我的模板/收藏聚合，并把首页重构为更高效的三栏生图工作台。

**架构：** 内置模板使用随代码发布的静态数据和纯函数渲染 helper；用户模板继续复用 `prompt_recipes`，内置模板收藏新增轻量 `template_favorites` 用户隔离数据。前端只消费公开 allowlist、模板聚合 API 和现有生成/保存 API，不接触 provider base URL、apiKeyEnv 或 API key。

**技术栈：** Next.js App Router、React、TypeScript、SQLite、Vitest、Testing Library、现有 Supabase Auth helper 和 provider allowlist。

---

## 全局约束

- 每个工作窗口完成后必须提交，并把 commit hash、验证命令和阻塞问题回传主控。
- 普通 worker 不修改 `docs/controller/phase0-progress.md`，该文件由主控维护。
- 不提交真实 `.env`、密钥、SQLite/db 文件、上传参考图、生成图片或长 base64。
- 当前已知 `next-env.d.ts` 有本地运行产生的未提交改动，所有窗口必须忽略，不得回退或纳入提交。
- 本项目是中文网站。界面文案、错误提示、模板标题、分类、注释和文档优先中文。
- 实现类窗口必须先写失败测试，再写生产代码；如果因为纯样式调整无法 TDD，必须在回传中说明验证方式。
- 不把生成图片、参考图、图片 base64 写入 SQLite、localStorage、sessionStorage、IndexedDB 或日志。
- 生成接口和保存接口继续只接受服务端 allowlist 内的 provider/model/size/quality/output_format。

## 输入文档

- `docs/specs/2026-05-17-image-service-mvp-design.md`
- `docs/specs/2026-05-17-prompt-library-ui-redesign.md`
- `docs/plans/2026-05-17-image-service-mvp-implementation-plan.md`
- `docs/reports/2026-05-17-w12-phase-closeout-review.md`

## 建议文件结构

- `src/lib/prompt-templates/categories.ts`：中文分类定义和分类 id 类型。
- `src/lib/prompt-templates/builtin.ts`：内置中文模板数据。
- `src/lib/prompt-templates/render.ts`：变量解析、校验、渲染、插入 prompt helper。
- `src/lib/prompt-templates/index.ts`：对外导出模板类型、分类、列表和 helper。
- `tests/prompt-templates/builtin-templates.test.ts`：模板结构、分类、来源、参数和中文内容测试。
- `tests/prompt-templates/render-template.test.ts`：变量渲染、缺失变量、默认值、插入和 4000 字符上限测试。
- `src/lib/db/index.ts`：新增 `template_favorites` schema 和数据访问 helper。
- `src/lib/prompt-template-library/index.ts`：模板聚合、收藏校验、API record 转换。
- `src/app/api/prompt-templates/route.ts`：模板库聚合 API。
- `src/app/api/prompt-templates/favorites/route.ts`：收藏内置模板 API。
- `src/app/api/prompt-templates/favorites/[templateId]/route.ts`：取消收藏 API。
- `tests/api/prompt-template-library-route.test.ts`：聚合和收藏 API 测试。
- `src/app/image-workbench.tsx`：工作台 UI，可在 W16 拆分组件。
- `src/app/globals.css`：三栏工作台、移动端 tab 和状态样式。
- `tests/app/image-workbench.test.tsx`：工作台交互测试。
- `docs/reports/2026-05-17-w17-prompt-library-ui-closeout.md`：最终收口报告。

## W14：内置中文模板数据提取与结构化

**目标：** 建立内置中文模板库、分类定义和模板变量渲染 helper。只做数据和纯函数，不接 API、不改 UI。

**允许修改：**

- 新增 `src/lib/prompt-templates/*`。
- 新增 `tests/prompt-templates/*`。
- 如需要补充 `docs/specs/2026-05-17-prompt-library-ui-redesign.md` 的来源说明，只能做小修。

**必须执行：**

- 阅读 `docs/specs/2026-05-17-prompt-library-ui-redesign.md`。
- 联网读取 `https://github.com/freestylefly/awesome-gpt-image-2`、`docs/templates.md` 和可访问的结构化数据；如果网络受限，在回传中记录阻塞，不伪造来源。
- 使用中文化改写，不大段复制外部原文。
- 至少覆盖 12 个设计文档分类，每类不少于 1 个内置模板。

### W14 任务

- [ ] 写 `tests/prompt-templates/builtin-templates.test.ts`，先断言 12 个中文分类存在、模板 id 唯一、字段完整、来源可复验、推荐参数为 MVP allowlist 范围内值。
- [ ] 运行 `pnpm test tests/prompt-templates/builtin-templates.test.ts`，确认因为模块不存在或数据缺失而失败。
- [ ] 新增 `src/lib/prompt-templates/categories.ts`、`builtin.ts`、`index.ts`，实现分类和至少 12 条高质量中文模板。
- [ ] 再次运行该测试，确认通过。
- [ ] 写 `tests/prompt-templates/render-template.test.ts`，覆盖 `{{变量名}}` 渲染、必填变量缺失、默认值、插入到光标、追加到末尾、4000 字符上限。
- [ ] 运行新增测试，确认失败。
- [ ] 新增 `src/lib/prompt-templates/render.ts`，实现纯函数：`renderPromptTemplate`、`insertRenderedPrompt`，返回结构化错误码和中文消息。
- [ ] 运行 `pnpm test tests/prompt-templates`，确认通过。
- [ ] 运行 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`git diff --check`。
- [ ] 检查 `git status --short`，只提交 W14 相关文件，不包含 `next-env.d.ts`。
- [ ] 提交，建议信息：`feat: add builtin prompt templates`。

## W15：提示词库 API / 我的模板聚合

**目标：** 新增登录后模板聚合 API 和内置模板收藏 API；新增 `template_favorites` 数据层；复用 `prompt_recipes` 作为我的模板。

**允许修改：**

- `src/lib/db/index.ts`
- `src/lib/prompt-template-library/index.ts`
- `src/app/api/prompt-templates/route.ts`
- `src/app/api/prompt-templates/favorites/route.ts`
- `src/app/api/prompt-templates/favorites/[templateId]/route.ts`
- `tests/db/sqlite-data-layer.test.ts`
- `tests/api/prompt-template-library-route.test.ts`
- 必要的导出文件

**禁止事项：**

- 不改变生成 API 的请求/响应语义。
- 不复制内置模板到 `prompt_recipes` 作为收藏；收藏只保存 `user_id + template_id`。
- 不向前端暴露 provider baseUrl、apiKeyEnv 或 API key。

### W15 任务

- [ ] 写数据库测试，覆盖创建、列出、删除 `template_favorites`，以及用户 A 不能读到用户 B 的收藏。
- [ ] 运行对应测试，确认失败。
- [ ] 在 SQLite schema 中新增 `template_favorites` 表和 helper：`addTemplateFavorite`、`removeTemplateFavorite`、`listTemplateFavorites`、`isTemplateFavorite`。
- [ ] 运行数据库测试，确认通过。
- [ ] 写 API 测试，覆盖未登录返回 `auth_required`、`GET /api/prompt-templates` 返回内置模板/我的模板/收藏/分类、搜索筛选、收藏不存在模板被拒绝、收藏后聚合响应带 `is_favorite`。
- [ ] 运行 API 测试，确认失败。
- [ ] 新增 `src/lib/prompt-template-library/index.ts`，实现聚合和 API record 转换，明确 `source: "builtin" | "mine"`。
- [ ] 新增三个 API route，复用 `getRequiredUserId`、`getImageDatabase`、现有 recipe helper 和 W14 模板数据。
- [ ] 运行 `pnpm test tests/api/prompt-template-library-route.test.ts tests/db/sqlite-data-layer.test.ts`，确认通过。
- [ ] 运行 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`git diff --check`。
- [ ] 检查未提交敏感/运行时文件，且不包含 `next-env.d.ts`。
- [ ] 提交，建议信息：`feat: add prompt template library api`。

## W16：工作台 UI 重构

**目标：** 把 `ImageWorkbench` 重构为中文三栏工具型工作台，接入模板聚合 API、搜索/筛选、变量填写、替换/插入、收藏和保存配置后刷新我的模板。

**允许修改：**

- `src/app/image-workbench.tsx`
- `src/app/globals.css`
- `tests/app/image-workbench.test.tsx`
- 如组件过大，可新增 `src/app/workbench/*` 客户端组件和纯 helper。

**禁止事项：**

- 点击模板、替换 prompt、插入 prompt、收藏模板都不得调用生成 API。
- 不使用 localStorage/sessionStorage/IndexedDB 保存 prompt、图片或模板草稿。
- 不把 provider config/base URL/apiKeyEnv/API key 发送到客户端或保存。

### W16 任务

- [ ] 先扩展 `tests/app/image-workbench.test.tsx`，覆盖初始加载模板库、搜索分类筛选、点击模板不会生成、替换当前 prompt、插入到当前 prompt、推荐参数应用、收藏内置模板、保存配置后刷新我的模板。
- [ ] 运行 `pnpm test tests/app/image-workbench.test.tsx`，确认失败。
- [ ] 重构前端状态结构，加载 `/api/prompt-templates`，保留现有生成 API 和保存 API 调用。
- [ ] 实现三栏布局：左侧模板库/我的模板/收藏/搜索/分类，中间 prompt/变量/参数/参考图/保存，右侧预览/今日用量/下载。
- [ ] 实现移动端 `<768px` 的“模板 / 编辑 / 预览”分段切换，无横向滚动。
- [ ] 实现模板变量表单、替换/插入逻辑和 4000 字符上限提示。
- [ ] 实现收藏/取消收藏内置模板；我的模板收藏继续走 recipe `is_favorite` 或只展示既有状态，避免混淆。
- [ ] 保存配置成功后刷新模板库聚合数据，并在“我的模板”出现新记录。
- [ ] 更新中文 loading、成功、空状态、错误和隐私提示文案。
- [ ] 运行 `pnpm test tests/app/image-workbench.test.tsx`，确认通过。
- [ ] 运行 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`git diff --check`。
- [ ] 确认不提交 `next-env.d.ts` 和运行时文件。
- [ ] 提交，建议信息：`feat: redesign image workbench with prompt library`。

## W17：UI/UX 验证、截图与阶段收口

**目标：** 对 W14-W16 做阶段收口，运行完整自动验证和浏览器视觉验证，修复低风险 UI 问题并提交收口报告。

**允许修改：**

- 低风险 UI/CSS/测试修复。
- `docs/reports/2026-05-17-w17-prompt-library-ui-closeout.md`
- 必要时小修 W14-W16 文档或测试说明。

**必须使用：**

- `ui-ux-pro-max` 技能做 UI/UX 核对。
- 如需要浏览器自动化，使用 `playwright` 技能。

### W17 任务

- [ ] 运行 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`git diff --check`。
- [ ] 启动本地 dev server，用浏览器检查桌面和移动端关键状态：初始、模板选择、变量填写、替换/插入、生成中、生成成功、错误、我的模板空状态。
- [ ] 截图或记录浏览器检查结果，重点看三栏布局、移动端无横向滚动、文字不重叠、按钮 44px 触控目标、错误脱敏和图片临时保存提示。
- [ ] 如发现低风险 UI 问题，先补测试或明确人工验证点，再修复并重跑相关验证。
- [ ] 扫描仓库：真实 `.env`、SQLite/db 文件、上传/生成图片、长 base64、密钥样式。
- [ ] 新增 W17 收口报告，记录验证命令、截图/浏览器检查摘要、验收清单、敏感文件扫描和剩余风险。
- [ ] 提交，建议信息：`docs: add prompt library ui closeout review`。
