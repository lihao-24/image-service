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

参考文档：

- MVP 设计：`docs/specs/2026-05-17-image-service-mvp-design.md`
- API 参考：`docs/reference/openai-compatible-images-api.md`
- 数据与存储：`docs/reference/data-and-storage.md`
- 主控提示词：`docs/controller/master-window-prompt.md`

## 已确认决策

- 技术栈使用 Next.js。
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
| 参考文档 | 进行中 |  | 创建 MVP 设计、API 参考、数据与存储、主控提示词和进度记录。 |
| 正式 spec review | 未开始 |  | 后续由主控窗口派发。 |
| 实施计划 | 未开始 |  | 后续由主控窗口派发。 |
| 工作窗口提示词 | 未开始 |  | 后续由主控窗口生成。 |
| Next.js 实现 | 未开始 |  | 当前阶段不做。 |

## 阶段结论

未完成。

## 主控记录

- 2026-05-17：创建 image-service Phase 0 参考文档和主控入口。

