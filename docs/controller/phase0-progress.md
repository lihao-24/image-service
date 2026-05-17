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
| Next.js 实现 | 未开始 |  | 下一步为 W03 Next.js Project Initialization，进入实现阶段前等待用户确认派发。 |

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
