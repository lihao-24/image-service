# image-service 文档索引

本目录用于保存项目知识和历史记录。当前开发入口以根目录 `AGENTS.md`、`README.md` 和本索引为准；日期命名的 spec、plan 和 report 主要用于追溯当时的设计与执行背景。

## 优先阅读

- 项目概览、运行方式、部署和安全边界：`../README.md`
- 智能体工作规则、目录地图和架构边界：`../AGENTS.md`
- 稳定数据与存储约束：`reference/data-and-storage.md`
- 当前 provider 与图片接口调用约束：`reference/openai-compatible-images-api.md`

## 当前阶段材料

- `plans/2026-11-17-qiniu-cdn-delivery.md`：可选七牛 CDN 图片交付实施记录；配置和验证步骤见 `../README.md`，存储规则见 `reference/data-and-storage.md`。

- 当前已进入稳定运行阶段。部署入口以 `../README.md` 的”生产部署””线上排障”和
  `env/image-service.production.env.example` 为准；稳定 provider 行为以
  `reference/openai-compatible-images-api.md` 为准。
- `specs/2026-05-29-prompt-first-provider-model-slimming-design.md`：当前主流程瘦身设计，已完成。当前稳定事实是：生图主流程只保留 provider、model、prompt 和可选参考图；配置为 provider -> models 二级 JSON；默认模型为 `toioto / gpt-image-2`；FastCode OpenAI-compatible 和 FastCode Gemini 作为独立 provider 配置。
- `superpowers/plans/2026-05-29-prompt-first-provider-model-slimming-plan.md`：上述设计的实施计划，已完成。该计划用于追溯执行路径；当前事实以代码、`../README.md` 和 `reference/` 为准。
- `specs/2026-05-17-image-service-mvp-design.md`：MVP 设计规格，已完成。
- `specs/2026-05-17-prompt-library-ui-redesign.md`：Prompt 模板库 UI 重设计，已完成。
- `specs/2026-05-18-chat-style-image-workbench-redesign.md`：聊天式生图工作台重设计，已完成。
- `specs/2026-05-19-gpt-image-2-and-usage-hardening-design.md`：`gpt-image-2` 配置核对、OpenAI-compatible adapter 加固、`GET /api/usage` 和轻量用量弹窗，已完成。
- `specs/2026-05-19-phase-2-google-imagen-provider-architecture-prd.md`：Phase 2 PRD，记录多 provider 架构、侧边栏 Accordion 高级参数 UI、错误归一化和差异化用量详情需求。Google AI Studio / Gemini API 直连接入因费用风险已先搁置；当前已通过 FastCode Gemini 独立 provider 接入 Gemini `generateContent` 形状，该 PRD 中的旧 Google/Imagen 设想不代表当前稳定系统事实。
- `plans/2026-05-19-gpt-image-2-and-usage-hardening-implementation-plan.md`：上述设计的实施计划，已完成。

## 目录说明

- `reference/`：稳定参考文档。这里的内容应尽量保持当前有效，适合被实现、测试和 review 反复引用。
- `specs/`：产品和设计规格。日期文件记录对应阶段的设计决策；如果后续设计变化，以更新日期较新的 spec 和实际代码为准。
- `plans/`：实施计划和任务拆分。主要用于追溯执行过程，不一定代表当前代码结构。
- `superpowers/plans/`：Superpowers 工作流生成的实施计划。主要用于追溯执行过程，不一定代表当前代码结构。
- `reports/`：阶段验收、review 和验证记录。
- `controller/`：早期主控窗口和工作窗口调度记录，仅供历史追溯；当前不再作为任务入口。

## 维护原则

- 新增稳定规则时，优先放入 `reference/`，并在本索引或 `AGENTS.md` 中补入口。
- 临时计划、阶段拆分和设计草案应带日期，避免被误认为永久规则。
- 过期但有追溯价值的内容优先标记历史状态，不急于删除。
- 不在文档中写入真实 `.env`、API key、数据库路径中的敏感值、生成图片或上传文件内容。
