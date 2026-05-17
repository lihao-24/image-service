# image-service MVP 实施计划

> 给后续工作窗口：实现类窗口需要按任务逐步执行。每个工作窗口完成后必须提交，并把提交号、验证结果、阻塞问题回传给主控窗口。

**目标：** 构建第一版可用的 `image-service`，作为独立 Next.js 应用，接入 Supabase Auth、SQLite、OpenAI 兼容 Images API、Prompt 配方保存、生成日志和按用户计算的每日额度。

**架构边界：** 所有信任边界放在服务端。`user_id` 只能由服务端校验后的 Supabase Auth session/JWT 得出；provider 配置和 API key 只存在服务端；每次生成和保存配置都必须重复做 allowlist 校验。SQLite 只保存用户自己的元信息、Prompt 配方、生成日志和每日额度计数；生成图片和上传参考图只作为本次请求或当前页面的临时数据。

**技术栈：** Next.js、TypeScript、Supabase Auth、SQLite、OpenAI 兼容 Images API、单元/集成测试和浏览器手动验证。

**语言要求：** 本项目是中文网站。面向用户的界面文案、文档、代码注释、错误提示说明优先使用中文；代码标识、协议字段、第三方产品名和技术名词可保留原文。

---

## 输入文档

- `docs/specs/2026-05-17-image-service-mvp-design.md`
- `docs/reference/openai-compatible-images-api.md`
- `docs/reference/data-and-storage.md`
- `docs/controller/phase0-progress.md`

## 全局约束

- 每个工作窗口完成后必须提交，并在回传中提供 commit hash。
- 不提交真实 `.env`、API key、数据库 dump、运行时数据、上传参考图或生成图片。
- 除非后续窗口明确允许，不连接真实 `sub2api` provider。
- 不连接 VPS，不修改 DNS/Caddy，不做生产部署。
- 不执行生产数据库 migration。只有在应用初始化和数据层窗口明确本地开发 schema 后，才允许本地开发数据库初始化。
- 不把生成图片或上传参考图保存到 SQLite、服务器磁盘、备份或日志。
- `docs/controller/phase0-progress.md` 归主控窗口维护，普通工作窗口不要修改，除非任务明确要求。

## 建议文件和模块形态

最终文件名可按 Next.js 生成结果微调，但后续窗口应保持以下职责边界：

- `app/` 或 `src/app/`：页面、路由、API route handler、必要的 server action。
- `src/lib/auth/`：Supabase 服务端/客户端配置，以及获取当前登录用户的 helper。
- `src/lib/config/`：image-service 环境变量解析、provider allowlist、默认参数和配置校验。
- `src/lib/db/`：SQLite 连接、本地开发 schema、类型化查询 helper、测试数据库工具。
- `src/lib/providers/`：provider adapter 接口和 OpenAI 兼容 Images API 实现。
- `src/lib/usage/`：每日额度检查、generation log 写入、成功生成后的用量递增。
- `src/lib/recipes/`：Prompt 配方校验和按用户隔离的 CRUD helper。
- `src/lib/images/`：请求校验、图片响应提取、参考图校验、base64 响应辅助函数。
- `tests/` 或同目录 `*.test.ts`：覆盖配置、鉴权保护、数据库 helper、provider adapter、额度/日志、用户隔离等关键行为。
- `.env.example`：只放安全占位变量名，不放真实密钥。

## 工作窗口顺序

### W03 - Next.js 项目初始化

**目标**

创建应用骨架和基础开发工具，不实现生图行为。

**输入文档**

- `docs/specs/2026-05-17-image-service-mvp-design.md`
- `docs/reference/data-and-storage.md`
- `docs/plans/2026-05-17-image-service-mvp-implementation-plan.md`

**允许修改范围**

- 创建 Next.js 项目文件、包管理文件、TypeScript 配置、lint/test 配置和安全的 `.env.example`。
- 创建计划中的模块目录，可为空目录或最小占位文件。
- 如框架需要，可添加基础健康页或最小首页。

**禁止事项**

- 不连接 `sub2api`。
- 不写真实环境变量或密钥。
- 不在 `/Users/hao/Desktop/lihao-data/image-service` 下创建生产数据文件。
- 不实现 auth、数据库 schema、provider 调用或生成接口，除非只是占位。

**验证方式**

- 使用选定包管理器安装依赖。
- 如 scaffold 支持，运行 lint/typecheck/build。
- 启动本地 dev server，确认页面能打开。
- 确认 `git status --short` 只包含 W03 预期的 scaffold/config/docs 变更。

**回传主控**

- 修改文件摘要。
- 选定的包管理器和实际验证命令。
- 如启动服务，提供本地 dev URL。
- 与建议模块形态的差异。
- commit hash。
- 阻塞问题，如有。

### W04 - Supabase Auth 接入

**目标**

应用必须登录后使用，并提供服务端 helper，从校验后的 Supabase 用户中得出 `user_id`。

**输入文档**

- `docs/specs/2026-05-17-image-service-mvp-design.md`
- `docs/plans/2026-05-17-image-service-mvp-implementation-plan.md`
- W03 完成记录。

**允许修改范围**

- Supabase 客户端/服务端 auth helper。
- 登录/登出路由或 UI。
- middleware 或 route guard。
- 未登录/已登录访问的测试和 mock。
- `.env.example` 中增加安全的 Supabase 变量名。

**禁止事项**

- 不实现生图接口。
- 不接受客户端传入的 `user_id`。
- 不添加公开注册管理后台。
- 不提交真实 Supabase key。

**验证方式**

- 用 mock session/JWT 测试 auth helper 行为。
- 浏览器手动检查：未登录会跳转或被阻止；mock/dev 登录流程能进入应用 shell。
- 受保护 API 无 session 时返回 `auth_required` 或等价错误。

**回传主控**

- auth 相关文件和路由保护策略。
- `user_id` 的来源说明。
- 验证命令和手动检查结果。
- commit hash。
- 阻塞问题，如有。

### W05 - SQLite 数据层与 schema

**目标**

实现 `prompt_recipes`、`generation_logs`、`daily_usage` 的本地 SQLite 持久化和按用户隔离的查询 helper。

**输入文档**

- `docs/specs/2026-05-17-image-service-mvp-design.md`
- `docs/reference/data-and-storage.md`
- `docs/plans/2026-05-17-image-service-mvp-implementation-plan.md`
- W03/W04 完成记录。

**允许修改范围**

- SQLite 连接和配置 helper。
- schema 文件或本地开发 migration 脚本。
- 类型化数据访问 helper 和测试。
- 如需要，在 `.env.example` 增加安全的数据库路径变量名。

**禁止事项**

- 不执行生产 migration。
- 不创建或提交运行时 SQLite 数据库。
- 不在 `generation_logs` 中保存生成图片、参考图字节、provider API key 或 prompt 全文。
- 不暴露跨用户查询 helper。

**验证方式**

- 使用 ignored 临时路径中的 SQLite 数据库跑测试。
- schema 断言覆盖关键列：
  - `prompt_recipes`：`user_id`、prompt 字段、mode/provider/model/size/quality/output_format、`params_json`、`reference_mode`、时间戳。
  - `generation_logs`：`user_id`、provider/model/mode/options、status、error_code、duration_ms、prompt_length、has_reference_image、created_at。
  - `daily_usage`：`user_id`、usage_date、generation_count。
- 用户隔离测试：用户 A 的 helper 不能读到用户 B 的记录。

**回传主控**

- schema 摘要。
- 本地开发数据库路径行为。
- 测试数据库位置和清理方式。
- 验证命令。
- commit hash。
- 阻塞问题，如有。

### W06 - Provider adapter 与 allowlist

**目标**

实现服务端 provider 配置解析、allowlist 暴露、参数校验 helper 和 OpenAI 兼容 provider adapter，但不调用真实 provider。

**输入文档**

- `docs/specs/2026-05-17-image-service-mvp-design.md`
- `docs/reference/openai-compatible-images-api.md`
- `docs/plans/2026-05-17-image-service-mvp-implementation-plan.md`
- W03-W05 完成记录。

**允许修改范围**

- 服务端配置解析和配置校验。
- 供前端使用的公开 allowlist endpoint 或 server action。
- Provider adapter 接口。
- 带可注入 fetch/client 的 OpenAI 兼容 adapter，方便测试。
- 有效配置、无效配置、请求校验测试。

**禁止事项**

- 测试或验证时不调用 `https://sub2api.toioto.org/v1`。
- 不向浏览器暴露 `baseUrl`、`apiKeyEnv` 或 API key。
- 不允许用户提交 provider 配置对象。
- 不在本窗口实现完整生成路由编排，除非 W07/W08 明确要求。

**验证方式**

- 单元测试证明默认 provider 和默认参数必须存在于 allowlist。
- 测试非法 provider/model/size/quality/output_format 会被拒绝。
- 测试公开 allowlist 不包含 base URL 和 key 元数据。
- mock adapter 测试确认 generations 和 edits endpoint 路径符合文档。

**回传主控**

- 支持的配置变量。
- 公开 allowlist 结构。
- Adapter 接口摘要。
- 验证命令。
- commit hash。
- 阻塞问题，如有。

### W07 - 文生图 API

**目标**

实现需要登录的文生图服务端 API，串联 provider adapter、allowlist 校验、额度预检查、generation log 和临时 base64 返回。

**输入文档**

- `docs/specs/2026-05-17-image-service-mvp-design.md`
- `docs/reference/openai-compatible-images-api.md`
- `docs/reference/data-and-storage.md`
- `docs/plans/2026-05-17-image-service-mvp-implementation-plan.md`
- W04-W06 完成记录。

**允许修改范围**

- 文生图 route/handler。
- 请求校验。
- 与 auth helper、provider validator、quota/log helper、provider adapter 的集成。
- 使用 mock auth、mock 数据库、mock provider client 的测试。

**禁止事项**

- 不调用真实 provider。
- 不把生成图片保存到磁盘或 SQLite。
- 不在 `generation_logs` 保存 prompt 全文。
- 不接受客户端传入的 `user_id`、base URL 或 API key 元数据。
- 不在本窗口实现参考图上传处理。

**验证方式**

- 未登录请求返回 `auth_required`。
- 非法参数返回 `invalid_generation_params`。
- 额度用尽返回 `quota_exceeded`，且不调用 provider。
- 成功文生图会调用 `/v1/images/generations`，提取 `response.data[0].b64_json`，写成功日志，递增 daily usage，只返回 UI 所需的临时图片数据和元信息。
- Provider 失败会写失败日志，不递增 daily usage。

**回传主控**

- API route 路径和请求/响应结构。
- 日志与额度行为证据。
- 验证命令。
- commit hash。
- 阻塞问题，如有。

### W08 - 参考图生图 API

**目标**

实现需要登录的参考图生图 API，支持 multipart 上传校验、`/v1/images/edits`，并复用同样的额度、日志和隐私边界。

**输入文档**

- `docs/specs/2026-05-17-image-service-mvp-design.md`
- `docs/reference/openai-compatible-images-api.md`
- `docs/reference/data-and-storage.md`
- `docs/plans/2026-05-17-image-service-mvp-implementation-plan.md`
- W04-W07 完成记录。

**允许修改范围**

- 参考图生图 route/handler。
- multipart 解析和文件校验。
- adapter 对 `/v1/images/edits` 的支持。
- 使用 mock 上传和 mock provider 响应的测试。

**禁止事项**

- 不调用真实 provider。
- 不把上传参考图写入长期磁盘、SQLite、备份或日志。
- 不保存生成图片。
- 不跳过 allowlist 或额度检查。
- 不在错误中暴露 provider 内部信息。

**验证方式**

- 拒绝未登录请求。
- 缺少参考图、文件过大或 MIME 不支持时返回 `invalid_reference_image`。
- 成功请求以 multipart form data 调用 `/v1/images/edits`。
- 结果提取优先使用 `response.data[1].b64_json`，不存在时回退 `response.data[0].b64_json`。
- 成功后写 `has_reference_image=true` 的元信息日志，递增 daily usage，只返回临时 base64。
- Provider 失败会写失败日志，不递增 daily usage。

**回传主控**

- API route 路径和 multipart 限制。
- `data[1]` 优先和 fallback 测试证据。
- 验证命令。
- commit hash。
- 阻塞问题，如有。

### W09 - 每日额度与 generation log 加固

**目标**

复核并加固两个生成 API 的额度和日志行为，确保最终语义与 spec 完全一致。

**输入文档**

- `docs/specs/2026-05-17-image-service-mvp-design.md`
- `docs/reference/data-and-storage.md`
- `docs/plans/2026-05-17-image-service-mvp-implementation-plan.md`
- W05/W07/W08 完成记录。

**允许修改范围**

- 共享额度和日志 helper。
- 两个生成 API 的集成。
- 尽可能覆盖边界和并发敏感行为的测试。

**禁止事项**

- 不在未通过主控更新 spec 的情况下修改产品语义。
- 不增加图片持久化。
- 不把 prompt 全文、参考图字节、请求头、API key 或 stack trace 记录到日志或用户可见错误中。

**验证方式**

- 测试证明额度检查发生在 provider 调用前。
- 测试证明额度用尽会写 rejected generation log，且不会调用 provider。
- 测试证明只有 provider 成功返回可用图片后才递增 `daily_usage.generation_count`。
- 测试证明失败日志只包含脱敏的 error_code/status。
- 测试证明日志包含 prompt_length，但不包含 prompt 内容。

**回传主控**

- 最终额度和日志行为摘要。
- W07/W08 中发现的任何不一致。
- 验证命令。
- commit hash。
- 阻塞问题，如有。

### W10 - 保存配置与用户隔离

**目标**

实现 Prompt 配方保存/读取能力，确保用户隔离和 allowlist 校验。

**输入文档**

- `docs/specs/2026-05-17-image-service-mvp-design.md`
- `docs/reference/data-and-storage.md`
- `docs/plans/2026-05-17-image-service-mvp-implementation-plan.md`
- W04-W06 完成记录。

**允许修改范围**

- Prompt recipe API route 或 server action。
- Recipe 校验 helper。
- 按用户隔离的数据访问 helper。
- 如 MVP UI 需要，可测试 create/list/read/update/delete；最低要求覆盖保存和读取自己的配置。

**禁止事项**

- 生成后不自动保存 Prompt 配方。
- 不保存生成图片或参考图文件。
- 不允许用户 A 读取或修改用户 B 的 recipe。
- 不接受客户端传入 provider config、base URL 或 API key 元数据。

**验证方式**

- 未登录 recipe 请求返回 `auth_required`。
- 保存配置时按 allowlist 校验 provider/model/size/quality/output_format。
- 只有用户明确点击保存后，才保存 prompt 和参数。
- 用户 A 不能 list/read/update/delete 用户 B 的记录。
- 数据库检查或测试确认 recipe 持久化不使用图片或参考图文件列。

**回传主控**

- Recipe API route 路径或 server action。
- 用户隔离测试证据。
- 验证命令。
- commit hash。
- 阻塞问题，如有。

### W11 - 前端生图页面

**目标**

构建登录后的中文生图页面，支持 prompt 输入、参数选择、文生图、参考图生图、临时预览、下载和明确的“保存配置”操作。

**输入文档**

- `docs/specs/2026-05-17-image-service-mvp-design.md`
- `docs/reference/openai-compatible-images-api.md`
- `docs/plans/2026-05-17-image-service-mvp-implementation-plan.md`
- W04/W06-W10 完成记录。

**允许修改范围**

- 登录后的页面和组件。
- 客户端调用公开 allowlist、文生图、参考图生图、保存配置接口。
- 加载、成功、脱敏错误、预览、下载、已保存等 UI 状态。
- 项目工具支持时，增加浏览器或 UI 测试。

**禁止事项**

- 不在客户端代码暴露 provider API key、base URL 或 `apiKeyEnv`。
- 不把生成图片 base64 持久化到 local storage、SQLite、服务器磁盘或日志。
- 生成后不自动保存 Prompt 配方。
- 不添加多 provider 切换 UI；只能展示服务端允许的当前 provider 参数选项。

**验证方式**

- 浏览器手动流程：
  - 未登录用户不能访问生图页面；
  - model/size/quality/output_format 控件由 allowlist 驱动；
  - 文生图能用 mock 或开发安全响应展示预览；
  - 参考图流程接受合法图片并展示预览；
  - 下载使用当前浏览器中的临时图片；
  - 只有点击“保存配置”后才保存；
  - 脱敏错误不显示 provider 内部信息。
- 如项目工具支持，为核心 UI 状态流转增加组件或 E2E 测试。
- 检查浏览器网络请求，确认没有 provider key/base URL 发送到客户端。

**回传主控**

- UI 路由和组件变更。
- 如可用，提供截图或手动验证记录。
- 验证命令。
- 如启动服务，提供本地 dev URL。
- commit hash。
- 阻塞问题，如有。

### W12 - 基础验证与阶段收口 review

**目标**

按 spec 做端到端 MVP review，确认各部分能组合工作，并在部署准备前识别阻塞问题。

**输入文档**

- `docs/specs/2026-05-17-image-service-mvp-design.md`
- `docs/reference/openai-compatible-images-api.md`
- `docs/reference/data-and-storage.md`
- `docs/plans/2026-05-17-image-service-mvp-implementation-plan.md`
- W03-W11 完成记录。

**允许修改范围**

- 发现实现备注时，可做小范围文档更新。
- 只修复明确为满足 spec 所需且低风险的小 bug。
- 为未覆盖的验收标准补测试。

**禁止事项**

- 未经主控明确变更任务，不连接真实 provider。
- 不部署到 VPS。
- 不执行生产 migration。
- 不引入新的 MVP scope。
- 不提交运行时数据、生成图片、上传文件或密钥。

**验证方式**

- 运行所有可用自动验证：lint、typecheck、单元测试、集成测试、build。
- 按 MVP spec 手动验收：
  - 未登录用户不能生成或读写数据；
  - 文生图提取 `response.data[0].b64_json`；
  - 参考图生图优先取 `data[1]`，没有时回退 `data[0]`；
  - 生成图片不会被保存；
  - Prompt 配方只在明确点击后保存；
  - generation log 不保存 prompt 全文；
  - allowlist 拒绝非法参数；
  - 每日额度在 provider 调用前校验，成功后递增；
  - 用户 A 不能读取用户 B 的 recipe 或 log。
- 扫描仓库状态，确认没有意外 `.env`、数据库、上传文件或生成图片。

**回传主控**

- 完整验证命令和结果。
- 验收清单结果。
- 剩余阻塞或上线风险。
- commit hash。
- 下一阶段建议：部署准备、provider smoke test 或继续修复。

## 建议派发顺序

1. W03 - Next.js 项目初始化
2. W04 - Supabase Auth 接入
3. W05 - SQLite 数据层与 schema
4. W06 - Provider adapter 与 allowlist
5. W07 - 文生图 API
6. W08 - 参考图生图 API
7. W09 - 每日额度与 generation log 加固
8. W10 - 保存配置与用户隔离
9. W11 - 前端生图页面
10. W12 - 基础验证与阶段收口 review

## 依赖关系

- W04 可在 W03 后开始。
- W05 可在 W03 后开始，但 W07-W10 需要 W04 的 auth 语义和 W05 的数据 helper。
- W06 可在 W03 后开始，并应在 W07、W08、W10、W11 前完成。
- W07 和 W08 可在 W04-W06 后分别实现，但 W09 需要同时复核两者。
- W10 可在 W04-W06 和 W05 后开始。
- W11 应等待 W06-W10 明确公开 allowlist 和 API route 形态。
- W12 只能在 W03-W11 全部完成后进行。

## 计划自检

- Spec 覆盖：工作窗口覆盖项目初始化、Supabase Auth、SQLite schema、provider adapter/allowlist、文生图、参考图生图、每日额度/log、保存 Prompt 配方、用户隔离、前端流程和最终 review。
- 隐私覆盖：相关窗口都重复强调不保存生成图片、参考图、真实密钥、provider 内部信息，以及不在 generation log 保存 prompt 全文。
- 实施准备度：每个工作窗口都列出输入文档、允许范围、禁止事项、验证预期和回传字段。
- 当前阻塞：计划阶段未发现阻塞。
