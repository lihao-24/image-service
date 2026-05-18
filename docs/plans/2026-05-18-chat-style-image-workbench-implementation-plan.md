# W16.4 对话式 AI 生图工作台实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 按 `docs/specs/2026-05-18-chat-style-image-workbench-redesign.md` 将首页重构为全屏对话式 AI 生图工作台，彻底移除传统三栏后台感。

**架构：** 保留现有生成 API、模板 API、收藏 API 和保存配置 API；前端新增本次 session 消息流，只存在 React state。`src/app/image-workbench.tsx` 作为顶层编排，工作台 UI 拆分到 `src/app/workbench/*`，样式优先使用 Tailwind utility class。

**技术栈：** Next.js App Router、React、TypeScript、Tailwind CSS、Vitest、Testing Library、现有 Supabase Auth 与 provider allowlist。

---

## 全局约束

- Worker 必须先阅读：
  - `docs/specs/2026-05-18-chat-style-image-workbench-redesign.md`
  - `docs/specs/2026-05-17-image-service-mvp-design.md`
  - `docs/specs/2026-05-17-prompt-library-ui-redesign.md`
  - `src/app/image-workbench.tsx`
  - `src/app/globals.css`
  - `tests/app/image-workbench.test.tsx`
- 必须使用 `/Users/hao/.codex/skills/ui-ux-pro-max/SKILL.md` 的 UI/UX 约束。
- 实现前先 `git status --short`，不要回退用户改动。
- 普通 worker 不修改 `docs/controller/phase0-progress.md`。
- 每个 worker 完成后必须提交，并回传 commit hash。
- 文档、代码注释、界面文案和用户可见错误说明优先中文。
- 不做浏览器截图测试；如认为必须做视觉验证，先回报主控并等待用户同意。

## 安全边界

- 点击模板只填 prompt 和参数，不自动生成。
- 点击生成才调用生成 API。
- 保存配置必须由用户在 AI 图片消息动作中显式触发。
- 生成图片只保存在 React state 和页面内 data URL，用于预览和下载。
- 不把图片、base64、参考图文件、参考图缩略图写入 SQLite、`localStorage`、`sessionStorage`、IndexedDB 或日志。
- generation log 仍只保存元信息，不保存 prompt 全文和图片。
- provider baseUrl、apiKeyEnv、API key 不进入前端。
- 错误信息继续脱敏，不能暴露内部 URL、密钥、stack trace。

## 建议文件结构

- `src/app/image-workbench.tsx`：入口和顶层状态编排。
- `src/app/workbench/types.ts`：消息类型、参数快照、模板 Modal 类型。
- `src/app/workbench/chat-sidebar.tsx`：折叠侧边栏、参数设置、模板入口、用户额度、退出。
- `src/app/workbench/template-modal.tsx`：分类模板弹窗、变量填写、使用模板。
- `src/app/workbench/message-list.tsx`：空状态、用户消息、AI loading、图片结果、错误卡片。
- `src/app/workbench/prompt-composer.tsx`：底部输入框、模式切换、参考图上传、生成按钮。
- `src/app/workbench/save-recipe-modal.tsx`：生成结果保存配置。
- `src/app/workbench/helpers.ts`：纯 helper，例如标题生成、比例解析、模板过滤。
- `tests/app/image-workbench.test.tsx`：端到端组件交互测试。
- Tailwind 文件：按 Next.js 当前推荐方式新增必要配置与 `globals.css` 导入。

## W16.4 任务

### Task 1：Tailwind 接入与测试基线

**目标：** 在不改变 UI 行为的前提下接入 Tailwind CSS 工具链，确认现有测试仍可运行。

**允许修改：**

- `package.json`
- `pnpm-lock.yaml`
- Tailwind/PostCSS 配置文件
- `src/app/globals.css`

**步骤：**

- [ ] 检查当前依赖中是否已有 Tailwind；如果没有，添加 `tailwindcss`、`@tailwindcss/postcss` 或当前 Next.js 推荐所需依赖。
- [ ] 新增或更新 Tailwind/PostCSS 配置，使 `src/app/**/*.{ts,tsx}` 和 `src/app/globals.css` 能使用 Tailwind utility。
- [ ] 在 `src/app/globals.css` 中保留全局基础规则、body 字体、focus 可访问性样式；不要保留无用三栏样式作为长期依赖。
- [ ] 运行 `pnpm test tests/app/image-workbench.test.tsx`，确认接入 Tailwind 后现有测试没有被配置破坏。
- [ ] 运行 `pnpm lint` 和 `pnpm typecheck`，修复配置问题。

### Task 2：先写聊天式工作台失败测试

**目标：** 用组件测试锁定 W16.4 行为，再改实现。

**允许修改：**

- `tests/app/image-workbench.test.tsx`

**必须覆盖：**

- [ ] 桌面默认显示 sidebar，点击汉堡后 sidebar 完全隐藏。
- [ ] 设置区默认只展示尺寸，点击展开后展示 Model、尺寸、质量、输出格式。
- [ ] 初始空状态显示；首次生成后空状态消失。
- [ ] 点击生成插入用户消息和 AI loading，并清空输入框。
- [ ] 文生图成功后 loading 替换为 AI 图片消息。
- [ ] 生成失败后显示脱敏错误卡片。
- [ ] 用户消息 `编辑` 回填 prompt 和参数。
- [ ] 参考图消息编辑提示重新选择参考图，不回填 File。
- [ ] 模板分类入口打开 Modal；内置模板填写变量后 `使用模板` 写入输入框，不调用生成 API。
- [ ] AI 图片消息 `重新生成` 使用消息关联 prompt 和参数调用生成 API。
- [ ] AI 图片消息 `保存配置` 打开 Modal，并调用 recipe API；请求体不包含图片、base64 或参考图。
- [ ] 页面不渲染 provider baseUrl、apiKeyEnv 或 API key。

**步骤：**

- [ ] 更新 mock 数据，保留内置模板、我的模板、收藏模板和生成 API mock。
- [ ] 更新测试查询语义，优先用 role、label、button name、region name，不依赖样式细节。
- [ ] 运行 `pnpm test tests/app/image-workbench.test.tsx`，确认测试因旧 UI 行为不匹配而失败。

### Task 3：拆分类型与纯 helper

**目标：** 为聊天消息流和 UI 拆分建立类型边界，避免 `image-workbench.tsx` 继续膨胀。

**允许修改：**

- 新增 `src/app/workbench/types.ts`
- 新增 `src/app/workbench/helpers.ts`

**步骤：**

- [ ] 定义 `GenerationMode`、`GenerationParamsSnapshot`、`TemporaryImage`、`WorkbenchMessage`、`TemplateModalState` 等类型。
- [ ] 新增 helper：根据 `size` 解析图片比例 class 或数值、根据 prompt 生成默认配置标题、过滤模板来源/分类、读取模板默认变量值。
- [ ] helper 不访问浏览器存储，不调用 fetch，不处理 provider 私密配置。
- [ ] 运行 `pnpm typecheck`，修复导出类型问题。

### Task 4：实现 Chat Sidebar

**目标：** 实现深色可完全隐藏 sidebar、二级折叠设置区和模板入口。

**允许修改：**

- 新增 `src/app/workbench/chat-sidebar.tsx`
- 后续由 `src/app/image-workbench.tsx` 引用

**行为要求：**

- 桌面默认展开，汉堡按钮隐藏/显示 sidebar 时完全切换。
- 手机端默认折叠，打开后以 drawer 语义覆盖。
- 设置区默认只显示尺寸；展开后显示 Model、尺寸、质量、输出格式。
- 模板入口只展示 `收藏`、`我的模板` 和内置分类，点击打开 Modal。
- 用户区显示邮箱、今日额度进度条和退出按钮。

**步骤：**

- [ ] 创建组件 props，接收公开 config、当前参数、用量、模板分类、打开 modal 回调、退出 action。
- [ ] 使用 Tailwind utility 完成深色视觉、44px 触控目标、清晰 focus 状态。
- [ ] 不在 sidebar 中放保存配置按钮。

### Task 5：实现 Template Modal

**目标：** 模板选择从常驻列表改为 Modal；支持变量填写后使用模板。

**允许修改：**

- 新增 `src/app/workbench/template-modal.tsx`
- 必要 helper 小修

**行为要求：**

- 点击 sidebar 分类、收藏或我的模板打开 Modal。
- Modal 顶部显示当前来源或分类名称，并支持搜索。
- 内置模板点击后展开变量表单；点击 `使用模板` 后渲染 prompt，写入输入框并应用推荐参数。
- 我的模板点击后展示 prompt 预览；点击 `使用模板` 后写入输入框并应用保存参数。
- 使用模板不会调用生成 API、保存 API 或 generation log。

**步骤：**

- [ ] 复用 `renderPromptTemplate`，保留 4000 字符错误提示。
- [ ] Modal 支持 Esc/关闭按钮/遮罩关闭。
- [ ] Modal 内按钮和输入框使用中文 label，保证测试可稳定查询。

### Task 6：实现 Message List

**目标：** 实现空状态、用户消息、AI loading、成功图片和错误卡片。

**允许修改：**

- 新增 `src/app/workbench/message-list.tsx`

**行为要求：**

- 无消息时显示 `今天想生成什么？`、说明和三个快捷入口。
- 首次生成插入消息后空状态消失。
- 用户消息靠右，prompt 默认折叠，支持展开/收起、编辑、复制 Prompt。
- 参考图用户消息显示缩略图；编辑时提示重新选择参考图。
- AI loading 和图片成功态使用同一比例容器。
- AI 图片消息提供下载、重新生成、复制 Prompt、保存配置。
- AI 错误消息显示脱敏错误和可恢复说明。

**步骤：**

- [ ] 组件只接收消息数组和动作回调，不直接调用生成 API 或保存 API。
- [ ] 使用 `navigator.clipboard` 前做存在性保护，测试环境不可用时不报错。
- [ ] 图片使用普通 `img`，保留 alt 文案；不引入 Next Image 对 base64 的额外处理。

### Task 7：实现 Prompt Composer 与 Save Modal

**目标：** 实现底部固定输入区和生成结果保存配置 Modal。

**允许修改：**

- 新增 `src/app/workbench/prompt-composer.tsx`
- 新增 `src/app/workbench/save-recipe-modal.tsx`

**行为要求：**

- 文生图/参考图胶囊切换。
- 参考图模式显示上传按钮和缩略图。
- 生成按钮圆形高亮，生成中 disabled。
- 提交后由顶层负责清空 prompt。
- 保存配置 Modal 默认标题取 prompt 前 20 个中文字符或等价短标题。
- 保存请求体只包含 title、prompt、mode、provider、model、size、quality、output_format、reference_mode。

**步骤：**

- [ ] 输入区不使用 localStorage/sessionStorage 保存草稿。
- [ ] File 只存在组件 state/顶层 state，用于本次请求。
- [ ] 保存 Modal 关闭时不清除已有消息。

### Task 8：重构 ImageWorkbench 顶层编排

**目标：** 串联现有 API、模板库、消息流和新组件，替换旧三栏 UI。

**允许修改：**

- `src/app/image-workbench.tsx`
- `src/app/globals.css`
- 新增组件文件

**行为要求：**

- 加载 `/api/prompt-templates`，保留内置模板、我的模板、收藏。
- 点击生成立即插入用户消息和 AI loading，并清空 composer。
- 文生图调用 `/api/images/generations`。
- 参考图调用 `/api/images/edits`。
- 成功后 AI loading 替换为图片消息，并更新用量。
- 失败后 AI loading 替换为脱敏错误消息。
- `重新生成` 使用消息关联 prompt 和参数重新发起生成。
- `编辑` 回填 prompt 和参数；参考图模式提示重新选择参考图。
- `保存配置` 成功后刷新模板库。

**步骤：**

- [ ] 删除或停止使用旧三栏 DOM 结构。
- [ ] 复用 `SAFE_PROVIDER_ERROR_MESSAGE` 和 provider 错误码脱敏逻辑。
- [ ] 确保前端请求不包含 baseUrl、apiKeyEnv 或 API key。
- [ ] 确保保存配置请求不包含图片、base64、参考图或缩略图。

### Task 9：验证、清理和提交

**目标：** 完整验证 W16.4 并提交。

**步骤：**

- [ ] 运行 `pnpm test tests/app/image-workbench.test.tsx`。
- [ ] 运行 `pnpm lint`。
- [ ] 运行 `pnpm typecheck`。
- [ ] 运行 `pnpm test`。
- [ ] 运行 `pnpm build`。
- [ ] 运行 `git diff --check`。
- [ ] 扫描并确认未提交真实 `.env`、密钥、SQLite/db 文件、上传图片、生成图片、长 base64 或运行时数据。
- [ ] 检查 `git status --short`，只包含 W16.4 相关文件。
- [ ] 提交，建议信息：`feat: redesign workbench as chat canvas`。
- [ ] 回传 commit hash、验证命令结果和阻塞问题；不得修改 `docs/controller/phase0-progress.md`。

