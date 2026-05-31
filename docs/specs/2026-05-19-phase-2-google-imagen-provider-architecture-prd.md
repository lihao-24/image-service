
# Phase 2 PRD：图片创作平台架构升级与多模型接入

> 状态：阶段性产品需求文档，尚未全部实现。本文从 `/Users/hao/Downloads/phase-2.md` 归档而来，用于后续 Phase 2 设计和实施拆解。
>
> 最新状态：Google AI Studio / Gemini API 直连接入因可能产生额外 API 费用，已由用户决定先搁置。后续可能改为接入中转站模型。本文中的 Google/Gemini 直连、Vertex/Imagen、具体模型名和鉴权方式均不要作为近期默认实施目标。
>
> 执行前请先核对当前代码、`AGENTS.md`、`README.md`、`docs/README.md` 和 `docs/reference/`。本文中的多 provider dispatcher、高级参数 UI、差异化用量统计和 `/api/usage` 仍应按待实现需求处理，不要误写为当前稳定事实。
>
> 归档备注：当前仓库已经存在 `daily_usage`、服务端额度检查和成功后递增逻辑；本文第 7 章仍要求补详细用量弹窗和 `GET /api/usage`。第 1.2 节“零 Migration”与第 7.4 节“建议增加 daily_usage 表”存在历史张力，后续实现以现有 schema 和 `docs/reference/data-and-storage.md` 为准，除非另行确认要做 schema 变更。
>
> 路线修正：原始 PRD 中的 Google Vertex AI、Imagen REST、Service Account/ADC 方案保留为历史上下文；2026-05-19 曾短暂确认按 Google AI Studio / Gemini API key 路线评估，随后因费用风险决定暂停 Google/Gemini API 直连。
>
> 外部 API 参数和鉴权细节在实现前必须重新查阅官方文档；本文附录链接只作为入口，不作为已核验的最新事实。

## 最终追加指令

以下 5 条是 2026-05-19 用户追加的最新约束。后续实现 Phase 2 时，这些约束优先级高于本文原始 PRD 中的冲突表述。

1. **凭证读取方式以 Google AI Studio / Gemini API 为准**
   - 暂停状态：该路线因费用风险已先搁置，不作为近期默认实施目标。
   - 首发接入路线使用 Google AI Studio 提供的 Gemini API key。
   - 服务端环境变量优先使用 `GEMINI_API_KEY`，也可兼容官方常见的 `GOOGLE_API_KEY`。
   - 不使用 Base64 Service Account JSON，不使用 `GOOGLE_APPLICATION_CREDENTIALS` 作为首发方案，不为本期引入 ADC 鉴权链路。
   - Vertex AI、Service Account 和 ADC 只作为未来可选扩展；除非后续明确改回 Vertex 路线，否则不要按本文原始 PRD 的 Vertex 鉴权方案实现。

2. **首发模型配置**
   - 暂停状态：`gemini-3.1-flash-image-preview` 不再作为近期默认测试模型；等待用户确认免费/付费边界或中转站模型清单。
   - 多模型“热插拔”配置表首发配置 `gemini-3.1-flash-image-preview`。
   - `gemini-3.1-flash-image-preview` 作为本次重构默认测试模型，用于跑通全链路。
   - 首发 provider 类型建议命名为 `google-gemini-image`，与现有 `openai-compatible-images` 区分。
   - Gemini 图像模型调用应优先按 Gemini API `generateContent` 形态设计，避免套用 OpenAI Images API 或 Vertex Imagen REST payload。

3. **高级参数一次性交付**
   - 前端 Advanced Options 不分阶段交付，必须一次性覆盖文生图与图生图的全部高级参数控件。
   - `GenerationParamsSnapshot` 需要完整扩充：`negativePrompt`、`guidanceScale`、`seed`、`personGeneration`、`imageWeight`、`referenceMode`。
   - 前端应根据当前 `GenerationMode` 做条件渲染，并正确处理图生图参数互斥逻辑。

4. **高级设置融入当前侧边栏**
   - 绝对不要做大规模 UI 或状态重构。
   - 保留当前对话式工作台和中间聊天交互流，不回退或重做主界面结构。
   - 在左侧参数栏中、“尺寸”和“质量”配置下方新增 Accordion 折叠面板。
   - 点击展开后展示 Google 模型专属高级参数；未选择 Google 系列模型时保持轻量、低打扰。
   - 该方案应复用当前侧边栏参数状态和组件组织，避免引入新的复杂全局状态层。

5. **差异化持久用量统计**
   - 用户每日生图次数必须后端持久化，不能只存在前端内存。
   - `gpt-image-2` 或 GPT 系列模型不设额度上限，只做成功后用量统计并在前端展示，不做请求前拦截。
   - Google 系列模型及其他受限模型必须设定每日额度上限。请求前查库校验，超过上限时拦截；未超限则放行，并仅在 provider 成功返回可用图片后递增用量。
   - Usage Modal 需要清晰展示统计数据，优先区分无限制模型的使用量和受限模型的剩余额度。

## 剩余需求盘点

Google/Gemini 直连暂停后，仍可继续推进或拆分的需求如下：

- **可独立推进**
  - 全局自定义滚动条样式优化：只涉及现有 UI 体验，不依赖 provider。
  - OpenAI 兼容 adapter 技术债审计：补齐参数映射、错误归一化和测试，不需要接入新模型。
  - 用量详情 UI 与 `GET /api/usage`：基于现有 `daily_usage` 和 generation log 做展示；可先只覆盖当前 OpenAI 兼容模型。

- **建议作为 provider 架构预备工作**
  - provider 能力元数据：为模型配置增加 provider 类型、是否受限、是否有每日上限、支持哪些高级参数等描述。
  - 差异化额度策略：GPT/OpenAI 兼容模型默认只统计不拦截；受限模型在未来接入时按模型或 provider 额度池拦截。
  - 错误归一化接口：先定义平台统一错误码和前端提示契约，再分别适配 OpenAI 兼容 provider 与未来中转站 provider。

- **等待后续确认后再做**
  - Google AI Studio / Gemini API 直连。
  - Vertex AI / Imagen / Service Account / ADC。
  - 中转站模型接入：需要确认 base URL、鉴权方式、模型列表、是否 OpenAI 兼容、图生图接口形态、参数支持范围、计费和额度。
  - Google/Gemini 专属高级参数的真实请求映射；如果中转站不支持这些字段，前端可保留但后端需按 provider 能力过滤。

* * *

1. 项目概述与开发边界

------------

### 1.1 项目背景

当前图片创作平台（基于 Next.js App Router + React + SQLite）使用兼容 OpenAI 格式的 API（当前模型 `gpt-image-2`）进行图像生成。为提升平台生成质量与用户控制力，计划接入 Google Vertex AI 提供的 Imagen 4 系列模型，并借此机会将平台底层架构升级为支持多模型厂商的“热插拔”模式。

### 1.2 开发边界 (Scope & Out of Scope)

**✅ 本期必须实现 (In Scope)：**

* 前端 UI 的渐进式改造（针对 Google 模型展示高级设置）。

* 全局自定义滚动条样式优化。

* 核心类型定义的向后兼容扩充（修改 `types.ts`）。

* 新增基于 Google Vertex AI REST API 的全新 Adapter。

* 实现多厂商模型的“热插拔”分发架构。

* 处理跨厂商错误归一化。

* 清理与核对现有 OpenAI 接口的技术债。

**❌ 本期坚决不碰 (Out of Scope)：**

* **坚决不破坏现有主界面的核心布局**（维持左侧参数-中间画布-右侧模版的三列式）。

* **坚决不修改底层的数据库 Schema**（零 Migration，所有新参数存在现有的 JSON 字段内）。

* **坚决不涉足复杂的“画布内交互”**（不引入局部重绘/涂抹遮罩等复杂前端组件，图生图仅支持整图上传）。

* **坚决不破坏既有的 OpenAI 适配器生图逻辑**。

* * *

2. 前端 UI/UX 改造需求

----------------

### 2.1 动态“高级设置”面板 (Progressive Disclosure)

* **触发条件**：监听左侧设置面板的模型下拉菜单。当选中 Google 体系模型（如 `imagen-4`）时，在基础参数下方淡入一个“⚙️ 高级设置”入口。

* **呈现方式**：采用**左侧纵向展开（Accordion）**或**从左侧滑出的二级抽屉（Sub-drawer）**。绝对不能使用居中弹窗遮挡中间画布或底部输入框。

* **状态记忆**：使用本地状态（Local Storage 或 Context）记忆高级面板的展开/折叠状态。

### 2.2 高级参数组件规范（表单项）

**【通用参数】（文生图与图生图均展示）：**

1. **负向提示词 (Negative Prompt)**：多行文本框 (Textarea)。支持自动换行，带字数统计。Placeholder：“描述你不希望在画面中出现的元素，如：模糊，变形，多余的手指...”。

2. **提示词相关性 (CFG Scale)**：带数字输入框的滑动条 (Slider + Number Input)。范围 `1.0` - `20.0`，步长 `0.1`。双向绑定。默认值视 Imagen 推荐而定（例如 `7.0`）。

3. **随机种子 (Seed)**：数字输入框 (Number Input) + 附加“🎲 随机”按钮（点击清空输入）。

4. **人物生成策略 (Person Generation)**：单选按钮组 (Radio Group) 或 切换开关 (Toggle)。带悬浮问号提示政策限制。选项：允许生成 / 禁止生成。

**【图生图专属参数】（仅在 `image-edit` 模式下展示）：**

1. **重绘强度 (Image Weight)**：滑动条 (Slider)。范围 `0.0` - `1.0`，步长 `0.01`。左端标注“偏向原图”，右端标注“偏向重绘”。

2. **参考模式 (Reference Mode)**：卡片式单选组 (Card-based Radio Group)。用于激活底层预留的 `reference_mode` 字段。提供明确的图文描述（如“风格参考”、“主体提取”）。

3. **参数互斥逻辑**：若某种参考模式不允许调节重绘强度，需将重绘强度滑动条置灰 (Disabled) 并提示。

### 2.3 全局 UI 细节优化：自定义滚动条 (Custom Scrollbar)

* **需求**：替换主页左侧参数、模板区域及中间信息流的系统默认粗犷滚动条。

* **视觉规范**：
  
  * **宽度**：4px - 6px。
  
  * **轨道 (Track)**：完全透明 (Transparent) 或极深灰色，平时视觉隐形。
  
  * **滑块 (Thumb)**：默认状态半透明浅灰（如 `bg-white/20`，完全圆角）；悬浮状态提亮（如 `bg-white/40`）。

* **实现方式**：仅允许使用全局 CSS (`::-webkit-scrollbar`) 或 `tailwind-scrollbar` 插件。**严禁引入第三方 React 滚动条组件库**。

* * *

3. 核心架构升级规范

-----------

### 3.1 数据库稳定性 (Database Immutability)

* **规范**：所有通过“高级设置”收集到的新增参数（如 `negativePrompt` 等），必须在前端组装完毕后，统一序列化存入现有的 `params: GenerationParamsSnapshot` JSON 字段中。**严禁修改 SQLite 表结构**。

### 3.2 “热插拔”模型调度架构 (Hot-Pluggable Provider Registry)

* **规范**：重构 `src/lib/config/index.ts` 和 `src/lib/providers/index.ts`。

* **逻辑**：
  
  1. 维护一个数据驱动的配置文件（支持的模型列表，包含 `id`, `providerType`, `displayName`）。
  
  2. 实现一个分发器 (Dispatcher) 工厂函数：`getAdapterForModel(modelId)`。
  
  3. 业务路由 `POST /api/images/generations` 调用该分发器动态获取对应的 Adapter（OpenAI Adapter 或是 Google Adapter）并执行，实现调用层级解耦。

### 3.3 跨厂商错误归一化处理 (Error Normalization)

* **规范**：Adapter 层必须拦截所有底层的非 2xx 响应。

* **逻辑**：在 `GoogleImagenAdapter` 和现有的 `OpenAICompatibleAdapter` 中，捕获厂商特有的报错结构（例如拦截策略报错、余额不足等），映射并抛出平台统一的错误结构或 JS `Error`，确保前端获得标准一致的提示信息。

* * *

4. API 接入与参数映射指南 (Google Vertex AI)

-----------------------------------

请开发人员在编写 `GoogleImagenAdapter` 时严格遵循以下规则：

### 4.1 核心 REST API 结构

* **使用方式**：使用纯 `fetch` 请求 REST API，不引入 Google Cloud 庞大的 SDK。

* **Endpoint 结构**：`https://[LOCATION]-aiplatform.googleapis.com/v1/projects/[PROJECT_ID]/locations/[LOCATION]/publishers/google/models/[MODEL_ID]:predict`

* **Payload 嵌套结构**：
  JSON
  
      {
        "instances": [
          { "prompt": "正向提示词" } // 图生图时将 base64 图片也放入此处
        ],
        "parameters": {
          // 高级参数放入此处
        }
      }
  
  

### 4.2 高级控制参数字典映射 (Parameters Mapping)

将前端传入的字段精确映射为 Google 官方要求命名：

* **生成数量** -> `sampleCount` (Integer)

* **负向提示词** -> `negativePrompt` (String)

* **提示词相关性** -> `guidanceScale` (Float)

* **随机种子** -> `seed` (Integer)

* **长宽比** -> `aspectRatio` (String, e.g., "1:1", "16:9")

* **人物生成策略** -> `personGeneration` (Enum: `"dont_allow"`, `"allow_adult"`, `"allow_all"`)

### 4.3 鉴权机制 (Service Account OAuth 2.0)

* **极度重要**：Google Vertex AI 不使用静态 API Key。系统配置中的 `apiKey` 将存放**服务账号 (Service Account) JSON 密钥的 Base64 编码或文件路径**。

* **实现**：引入轻量级库 `google-auth-library`。在发起 fetch 前动态换取短期有效的 Access Token，并将其注入 `Authorization: Bearer ${accessToken}` 请求头中。

* * *

5. 附加开发任务：OpenAI 历史技术债审计

------------------------

在完成上述功能前/后，需审计并修复现有的 `createOpenAICompatibleImagesAdapter`：

1. **类型补全**：核查官方 DALL-E 3 参数，为 `GenerateImageRequest` 和 `ApiRecommendedParams` 补充缺失字段，如 `style` (`"vivid"` / `"natural"`) 和 `quality` (`"standard"` / `"hd"`)。

2. **规范化映射**：核对并确保现有参数（如 `outputFormat`）在发起请求时，正确转换为了官方 API 要求的下划线命名（如 `output_format`）。

3. **错误归一化捕获**：重点审查 `readProviderJson`，精准捕获内容安全拦截报错（判断 `response.data.error.code === 'content_policy_violation'`），并抛出归一化的错误信息。

* * *

6. 附录：Codex 专属开发官方链接清单

----------------------

为了避免代码幻觉，请直接参考以下官方文档进行参数组装和鉴权处理：

* **Google Vertex AI 核心指南与参数字典**:
  
  * [Generate Images with Imagen](https://cloud.google.com/vertex-ai/generative-ai/docs/image/generate-images)
  
  * [Imagen API Parameters Reference](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/imagen-api)
  
  * [REST API Predict Endpoint](https://cloud.google.com/vertex-ai/docs/reference/rest/v1/projects.locations.publishers.models/predict)

* **Google Cloud 鉴权指南**:
  
  * [Node.js google-auth-library GitHub](https://github.com/googleapis/google-auth-library-nodejs) (参考 README 中的 Authentication 部分)

* **OpenAI API 对齐参考**:
  
  * [OpenAI Image Generation API Reference](https://platform.openai.com/docs/api-reference/images/create)

### 

### 补充 PRD 章节：📊 7. 详细额度统计与持久化模块 (Quota & Usage Tracking)

**7.1 业务背景** 当前系统的用量统计为纯前端状态（刷新即重置），无法有效控制 API 调用成本。本次迭代需引入后端的用量持久化机制，并在前端增加详细的用量可视化弹窗。

**7.2 前端 UI/UX 需求**

1. **侧边栏微型面板 (Mini Dashboard)**：
   
   * **位置**：左侧边栏底部（账号/退出按钮上方）。
   
   * **展示**：一个非常克制的进度条或文字（如 `今日额度: 12 / 50`）。
   
   * **交互**：鼠标悬浮 (Hover) 时高亮，点击后触发“详细用量弹窗”。

2. **详细用量弹窗 (Usage Modal)**：
   
   * **排版**：居中弹窗，采用与模版弹窗一致的深色/现代设计风格。
   
   * **数据展示**：
     
     * **总览环形图/进度条**：直观展示“已用额度”与“总额度”的占比。
     
     * **重置时间提示**：明确告知用户额度何时刷新（例如：“额度将于每日 00:00 (UTC+8) 重置”）。
     
     * **按模型消耗拆分 (进阶可选)**：列表展示不同模型带来的消耗（例如：`Imagen 4: 5次`, `gpt-image-2: 7次`）。_注：若初期为了敏捷开发，可先做总次数统计。_

**7.3 后端 API 与逻辑控制**

1. **新建/修改接口**：
   
   * `GET /api/usage`：前端初始化时调用，获取当前用户的用量数据。

2. **路由拦截与扣费逻辑**：
   
   * 在 `POST /api/images/generations` 和 `POST /api/images/edits` 两个核心路由处理流程的**最前端**加入“额度校验”中间件逻辑。
   
   * **成功才扣费**：只有当底层的 `Adapter` 成功返回 `b64Json` 图片数据后，才对数据库中的用户用量进行 +1 操作。如果 Google 或 OpenAI 接口报错（如超时、安全拦截），**绝不扣除用户额度**。

**7.4 数据库 Schema 更新 (SQLite)** _(注：Codex 在实现时需添加对应的 SQL 初始化/迁移脚本)_

* **方案**：建议增加一张轻量级的 `daily_usage` 表，或者在现有的 `users` 表中增加 JSON 格式的扩展字段。

* **核心需存储字段**：
  
  * `user_id`: 关联当前登录用户 (Supabase Auth UID)。
  
  * `date`: 记录日期（用于每日零点判断是否需要重置）。
  
  * `used_count`: 当日已使用次数。
  
  * `limit_count`: 当日总上限次数（可为不同用户设置不同上限）。
