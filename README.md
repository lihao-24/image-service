# image-service

`image-service` 是个人 AI 服务体系中的生图网页服务。

当前阶段只包含参考文档和主控工作入口，尚未创建 Next.js 应用代码。

核心决策：

- Next.js 独立应用。
- 复用 `https://supabase.lihao66.top` 的 Supabase Auth。
- 使用 OpenAI-compatible Images API。
- 当前只接 `sub2api`，Base URL 为 `https://sub2api.toioto.org/v1`。
- 图片不落服务器磁盘，只临时返回前端展示。
- 用户点击“保存配置”时才保存 Prompt 配方。
- generation log 自动保存元信息，不保存 prompt 全文和图片。

参考文档：

- `docs/specs/2026-05-17-image-service-mvp-design.md`
- `docs/reference/openai-compatible-images-api.md`
- `docs/reference/data-and-storage.md`
- `docs/controller/master-window-prompt.md`
- `docs/controller/phase0-progress.md`

