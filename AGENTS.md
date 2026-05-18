# image-service Agent Guide

## 项目定位

- `image-service` 是个人 AI 服务体系中的生图网页服务。
- 当前技术栈是 Next.js App Router、React、TypeScript、Vitest、SQLite、Supabase Auth。
- 重点能力包括登录后的生图工作台、OpenAI 兼容 Images API provider、Prompt 模板/配方、用量限制和生成日志。
- 测试默认使用 mock provider，不应在测试中调用真实图片 provider。

## 先读入口

- 做代码改动前，先读与任务最相关的现有代码和测试。
- 产品、部署和安全边界先看 `README.md`，不要把 README 内容重复搬进本文件。
- 产品/设计细节看 `docs/specs/`。
- 执行计划和阶段背景看 `docs/plans/`。
- 数据和存储约束看 `docs/reference/data-and-storage.md`。
- OpenAI 兼容图片接口细节看 `docs/reference/openai-compatible-images-api.md`。

## 目录地图

- `src/app/`：页面、API routes、布局、健康检查。
- `src/app/image-workbench.tsx`：登录后的生图工作台主状态和流程编排。
- `src/app/workbench/`：工作台组件、类型、helper、弹窗、消息列表、输入区和图标。
- `src/app/api/images/`：文生图和参考图生图 API。
- `src/app/api/recipes/`：Prompt 配方 CRUD API。
- `src/app/api/prompt-templates/`：Prompt 模板库和收藏 API。
- `src/lib/auth/`：Supabase Auth、cookie session、用户校验和中间件。
- `src/lib/config/`：服务端图片配置解析、provider allowlist、公开配置投影和参数校验。
- `src/lib/db/`：SQLite 连接、schema、按用户隔离的数据访问 helper。
- `src/lib/images/`：图片请求体校验、参考图校验、临时图片响应。
- `src/lib/providers/`：图片 provider adapter 接口和 OpenAI 兼容 Images API 实现。
- `src/lib/usage/`：每日额度、用量统计和生成日志。
- `src/lib/recipes/`：Prompt 配方校验和按用户隔离的 CRUD helper。
- `src/lib/prompt-templates/`：内置模板、分类、模板渲染和模板索引。
- `tests/`：按功能域拆分的 Vitest 测试。

## 架构边界

- 客户端组件不得读取服务端密钥、真实 provider 配置、数据库文件路径或私有环境变量。
- `/api/image-options` 只能暴露公开配置：默认 provider、默认参数、provider id/label/models 和公开选项。
- provider base URL、apiKeyEnv 和 API key 只能留在服务端配置和 provider 调用链路中。
- 新增或修改图片 provider 时，优先从 `src/lib/config/` 和 `src/lib/providers/` 入手，并补对应测试。
- API route 中的用户身份只能来自 `src/lib/auth/` 校验后的 Supabase user，不接受客户端传入的 `user_id`。
- 数据读写优先走 `src/lib/db/`、`src/lib/recipes/`、`src/lib/usage/` 的既有 helper，不在 UI 或 route 中散落 SQL。
- 生成图片本体当前只作为临时响应返回，不写入 SQLite、服务器磁盘、日志或 localStorage。
- 上传参考图当前只用于本次请求和浏览器临时预览，不持久化文件。
- Prompt 模板渲染优先走 `src/lib/prompt-templates/render.ts`，不要在组件或 route 中重复拼接模板逻辑。
- 工作台 UI 改动优先复用 `src/app/workbench/` 现有组件、类型和 helper，避免把新状态和业务逻辑继续堆进单个文件。

## 安全与配置

- 不提交真实 `.env`、API key、SQLite 数据库、上传文件或生成图片。
- `.env.example` 和 `env/*.env.example` 只放占位值和部署模板。
- `.env.local`、`.env.production`、`data/` 下的运行数据默认视为本地私有内容。
- 环境变量以 `.env.example`、`README.md` 和 `src/lib/config/` 的解析逻辑为准。
- 修改鉴权、provider、配额、数据层或部署配置时，优先检查是否会扩大密钥、用户数据或生成结果的暴露面。

## 常用验证

- 安装依赖：`pnpm install`
- 本地开发：`pnpm dev`
- Lint：`pnpm lint`
- 类型检查：`pnpm typecheck`
- 测试：`pnpm test`
- 构建：`pnpm build`
- 空白和换行检查：`git diff --check`

## 验证取舍

- 纯 UI 小改动：优先跑相关组件测试；必要时启动本地页面做浏览器检查。
- API route、数据层、provider、鉴权、配额或配置改动：至少跑相关测试，并优先补覆盖目标行为的测试。
- 跨模块行为改动：优先跑 `pnpm lint`、`pnpm typecheck`、`pnpm test`。
- 生产部署、Next 配置、环境变量或路由结构改动：额外跑 `pnpm build`。
- 无法运行验证时，交付时必须说明原因、未验证范围和剩余风险。

## 文档更新触发器

完成改动前，如果本次变更满足以下任一条件，必须检查是否需要同步更新文档：

- 改变模块职责、目录结构、架构边界或数据流。
- 改变鉴权、用户隔离、密钥、provider 配置、图片/参考图/Prompt 的保存策略。
- 新增、删除或重命名环境变量、部署命令、验证命令或生产运行方式。
- 新增稳定能力、公共 API、数据表、provider 类型或长期复用的业务规则。
- 发现 `AGENTS.md`、`README.md`、`docs/README.md` 或 `docs/reference/` 与当前代码不一致。

更新优先级：

- 智能体工作规则、目录地图或架构边界变更：更新 `AGENTS.md`。
- 文档入口、目录说明或历史状态变更：更新 `docs/README.md`。
- 长期系统事实变更：更新 `docs/reference/`。
- 运行方式、部署方式或环境变量变更：更新 `README.md` 和必要的 `.env.example`。
- 阶段性设计、计划或验收：新增 `docs/specs/`、`docs/plans/` 或 `docs/reports/`，不要把历史计划改写成当前事实。

如果只是局部 bugfix、文案调整、样式微调或测试内部重排，默认不更新文档；交付时说明“不涉及长期文档更新”即可。
