# W16.4 对话式 AI 生图工作台 UI/UX 重构设计

日期：2026-05-18

## 背景

W16、W16.1、W16.2 和 W16.3 已经多次尝试把首页重构为模板库工作台，但整体仍然停留在“左模板、中表单、右预览”的后台工具台结构。即使调整为 Apple、Linear 或 Minimalist Premium 风格，核心体验仍像参数表单，而不是现代 AI 生图产品。

W16.4 需要完全抛弃传统三栏后台感，改为类似 ChatGPT 的“聊天即画布”流式布局：用户输入 prompt 后，消息流中立即出现用户请求和 AI loading，生成结果作为本次会话的临时图片消息展示。模板和参数退到可隐藏侧边栏与弹窗中，主画布只承载对话、生成状态和结果。

本设计已经过当前主控窗口与用户确认。当前阶段只写设计文档，不实现业务代码。

## 目标

- 将生图首页改为全屏对话式 AI 工作台。
- 左侧深色侧边栏可完全隐藏；桌面默认展开，手机默认折叠。
- 主体区域采用白色聊天画布和底部固定 prompt composer。
- 点击生成后立即插入用户消息和 AI loading 消息，并清空输入框。
- 生成结果作为 AI 图片消息展示，提供下载、重新生成、复制 Prompt、保存配置。
- 模板不再常驻占据屏幕，只在侧边栏展示入口，具体模板通过 Modal 选择。
- 生成图片、参考图和本次消息流只保存在 React state，不做任何持久化。
- 允许 W16.4 引入 Tailwind CSS 依赖和配置，并优先用 Tailwind utility class 实现视觉样式。

## 非目标

- 不保存生成图片历史。
- 不保存参考图文件。
- 不持久化本次聊天消息流。
- 不把 prompt 消息流写入 SQLite。
- 不做团队共享模板、公开模板发布或管理后台。
- 不改变后端生成 API、模板 API、收藏 API 和保存配置 API 的安全边界。
- 不使用外部 UI 组件库；Tailwind CSS 只作为原子 CSS 工具链使用。
- 不做浏览器截图测试，除非用户后续明确同意。

## 信息架构

页面为全屏结构：

```text
+--------------------------------------------------------------------------------+
| h-screen w-screen flex overflow-hidden                                         |
|                                                                                |
| +------------------------------+ +-------------------------------------------+ |
| | 可隐藏深色 Sidebar           | | Main Chat Canvas                          | |
| | desktop 默认 260px           | | flex-1 flex flex-col bg-white             | |
| | mobile 默认 drawer 关闭      | |                                           | |
| |                              | | 顶部 header：汉堡按钮 / chat / 更多       | |
| | Logo                         | |                                           | |
| | 折叠设置区                   | | 消息流：空状态 / 用户消息 / AI 图片消息   | |
| | 模板入口                     | |                                           | |
| | 用户、额度、退出             | | 底部 sticky prompt composer               | |
| +------------------------------+ +-------------------------------------------+ |
+--------------------------------------------------------------------------------+
```

### Sidebar

Sidebar 使用深色、紧凑、工具坞式视觉。桌面端默认展开，用户点击主面板顶部汉堡按钮后完全隐藏；隐藏后不保留 64px rail。手机端默认隐藏，点击汉堡按钮后以 drawer 覆盖打开，宽度 `min(84vw, 320px)`，右侧显示半透明遮罩。点击遮罩、关闭按钮或模板入口后可以关闭 drawer。

Sidebar 包含四个区域：

1. Logo 区：`IS` 标识与 `image-service` 产品名。
2. 设置区：默认只显示尺寸选择；点击展开后显示 Model、尺寸、质量、输出格式。设置区不放保存配置按钮。
3. 模板入口区：顶部固定 `收藏`、`我的模板`，下面展示内置分类，如电商产品、社媒封面、信息图表等。点击任一入口打开模板 Modal。
4. 用户信息区：固定在底部，显示用户邮箱、今日额度进度条和退出按钮。

### Main Chat Canvas

主区域为浅色聊天画布，包含：

- 顶部极简 header：左侧汉堡按钮，中间或左侧显示 `chat`，右侧保留更多按钮或状态入口。
- 消息流：`flex-1 overflow-y-auto`，内容居中，建议最大宽度 `max-w-4xl`。
- 底部固定输入栏：使用渐变背景从页面底部托起 composer，减少主画布压迫感。

## 核心交互

### 空状态

当本次 session 没有任何消息时，主画布中央显示空状态：

- 标题：`今天想生成什么？`
- 说明：`选择模板，或直接描述画面。`
- 三个快捷入口：`电商主图`、`社媒封面`、`参考图改造`

点击快捷入口只打开对应模板分类 Modal，不直接填入 prompt，不生成图片。一旦用户点击生成并插入第一条用户消息，空状态立即消失；后续即使生成失败，也不恢复空状态。刷新页面后 React state 清空，空状态重新出现。

### Prompt Composer

底部 composer 是主要输入区：

- 上方或输入框上沿提供胶囊式模式切换：`文生图` / `参考图`。
- 输入区为大圆角白色容器，包含 textarea 和圆形生成按钮。
- 参考图模式下，输入框左侧显示上传按钮；选择文件后显示缩略图和文件名。
- 生成按钮使用高亮主色，例如 indigo，禁用态明确。
- 生成中禁用按钮并显示 loading 状态。

点击生成时：

1. 校验 prompt 非空；参考图模式下校验已选择合法图片。
2. 将当前 prompt、模式、参数快照和可选参考图缩略图插入一条用户消息。
3. 立即清空底部输入框。
4. 插入一条 AI loading 消息。
5. 调用现有生成 API。
6. 成功后用 AI 图片消息替换 loading。
7. 失败后用脱敏错误卡片替换 loading。

参考图 File 对象只用于本次请求和当前 React state，不写入任何持久化存储。

### 用户消息

用户消息靠右展示：

- 默认展示 prompt 前 3-5 行，超出后折叠。
- 提供 `展开 / 收起`。
- 提供动作：`编辑`、`复制 Prompt`。
- 显示小标签：`文生图` 或 `参考图`、尺寸、质量。
- 如果是参考图模式，显示参考图缩略图。

点击 `编辑`：

- 将该用户消息的 prompt 回填到底部输入框。
- 回填当时使用的模式和参数快照。
- 如果原消息为参考图模式，不回填 File 对象；提示用户重新选择参考图。

### AI 图片消息

AI 消息靠左展示。生成中 loading 和成功图片使用同一比例容器，避免布局跳动：

- 桌面端图片最大宽度为 `min(720px, 100%)`。
- 移动端图片占满内容宽度。
- 图片容器根据生成尺寸保持比例，例如 `1024x1536` 为竖图、`1536x1024` 为横图。
- Loading 卡片也使用同样比例。

生成成功后提供动作：

- `下载`：使用当前页面内的 base64 data URL 下载。
- `重新生成`：使用该 AI 消息关联的原 prompt 和参数快照重新发起生成，不依赖当前输入框。
- `复制 Prompt`：复制该图片对应的 prompt。
- `保存配置`：打开保存配置 Modal。

桌面端动作按钮可在图片 hover 时浮现；移动端动作按钮常驻在图片下方。

### 保存配置 Modal

常驻“配置名称”输入框从主界面移除。用户点击 AI 图片消息上的 `保存配置` 后打开小 Modal：

- 配置名称输入框，默认使用 prompt 前 20 个中文字符或等价短标题。
- 保存按钮、取消按钮。

保存时调用现有 `/api/recipes`：

- 保存该图片对应的 prompt 和参数快照。
- 不保存生成图片。
- 不保存图片 base64。
- 不保存参考图文件或参考图缩略图。
- 保存成功后刷新模板库聚合数据，使新配置出现在 `我的模板`。

### 模板 Modal

Sidebar 只展示模板入口，不展示完整模板列表。点击 `收藏`、`我的模板` 或内置分类后打开同一个模板 Modal。

Modal 行为：

- 顶部显示当前来源或分类名称。
- 支持搜索。
- 展示模板卡片网格。
- 点击内置模板后，在 Modal 内展开变量表单。
- 填完变量后点击 `使用模板`，渲染 prompt，写入底部输入框，并应用推荐参数。
- 点击我的模板后，展示 prompt 预览，点击 `使用模板` 后写入输入框并应用保存参数。
- `收藏` 混合展示已收藏的内置模板和我的模板。
- 使用模板不会生成图片、不会保存配置、不会写 generation log。

## 状态模型建议

实现时建议新增本次 session 消息类型：

```ts
type WorkbenchMessage =
  | {
      id: string;
      role: "user";
      prompt: string;
      mode: "text-to-image" | "image-edit";
      params: GenerationParamsSnapshot;
      referencePreviewUrl?: string;
      referenceFileName?: string;
      collapsed: boolean;
      createdAt: string;
    }
  | {
      id: string;
      role: "assistant";
      status: "loading" | "success" | "error";
      prompt: string;
      mode: "text-to-image" | "image-edit";
      params: GenerationParamsSnapshot;
      image?: {
        src: string;
        outputFormat: string;
        filename: string;
      };
      errorMessage?: string;
      createdAt: string;
    };
```

`GenerationParamsSnapshot` 只包含前端公开 allowlist 内的字段：

```ts
type GenerationParamsSnapshot = {
  provider: string;
  model: string;
  size: string;
  quality: string;
  outputFormat: string;
};
```

不得把 provider baseUrl、apiKeyEnv、API key 或任何服务端内部配置放入前端状态。

## 组件拆分建议

允许 W16.4 worker 拆分现有 `src/app/image-workbench.tsx`。建议边界：

- `src/app/image-workbench.tsx`：入口和顶层状态编排。
- `src/app/workbench/chat-sidebar.tsx`：折叠侧边栏、参数设置、模板入口、用户额度。
- `src/app/workbench/template-modal.tsx`：分类模板弹窗、变量填写、使用模板。
- `src/app/workbench/message-list.tsx`：空状态、用户消息、AI loading、图片结果、错误卡片。
- `src/app/workbench/prompt-composer.tsx`：底部输入框、模式切换、参考图上传、生成按钮。
- `src/app/workbench/save-recipe-modal.tsx`：生成结果保存配置。
- `src/app/workbench/types.ts`：消息类型和参数快照类型。

如果 worker 发现组件拆分过细造成 props 传递复杂，可以合并相邻组件，但必须保持 `image-workbench.tsx` 不再成为难以维护的超大文件。

## Tailwind 接入

用户已允许 W16.4 引入 Tailwind CSS 依赖和配置。实现要求：

- 使用 Tailwind CSS 原生 utility class。
- 不引入 Ant Design、Shadcn、Radix、Headless UI 或其他外部 UI 组件库。
- 保留现有全局基础样式中对 body、focus、可访问性有价值的规则。
- 逐步弱化或删除旧三栏工作台相关 CSS，避免死样式和命名冲突。
- 中文界面文本继续优先使用中文。

## 安全与隐私边界

W16.4 必须保持以下边界：

- 点击模板只填 prompt 和参数，不自动生成。
- 点击生成才调用生成 API。
- 保存配置必须由用户在 AI 图片消息动作中显式触发。
- 生成图片只保存在 React state 和页面内 data URL，用于预览和下载。
- 不把图片、base64、参考图文件、参考图缩略图写入 SQLite。
- 不把图片、base64、参考图文件、prompt 草稿或消息流写入 `localStorage`、`sessionStorage`、IndexedDB。
- generation log 仍只保存元信息，不保存 prompt 全文和图片。
- provider baseUrl、apiKeyEnv、API key 不进入前端。
- 错误信息继续脱敏，不能暴露内部 URL、密钥、stack trace。

## 测试要求

W16.4 worker 必须更新 `tests/app/image-workbench.test.tsx`，覆盖以下行为：

- 桌面默认显示 sidebar，点击汉堡后 sidebar 完全隐藏。
- 手机端相关结构使用 drawer 语义；不要求截图测试。
- 设置区默认只展示尺寸，展开后展示完整参数。
- 初始空状态显示，首次生成后消失。
- 点击生成插入用户消息和 AI loading，并清空输入框。
- 文生图成功后 loading 替换为 AI 图片消息。
- 生成失败后显示脱敏错误卡片。
- 用户消息 `编辑` 会回填 prompt 和参数。
- 参考图消息编辑时提示重新选择参考图，不回填 File。
- 模板分类入口打开 Modal；内置模板填写变量后使用模板写入输入框，不调用生成 API。
- AI 图片消息 `重新生成` 使用消息关联 prompt 和参数调用生成 API。
- AI 图片消息 `保存配置` 打开 Modal，并调用 recipe API；请求体不包含图片、base64 或参考图。
- 不出现 provider baseUrl、apiKeyEnv 或 API key。

完整自动验证仍需执行：

- `pnpm test tests/app/image-workbench.test.tsx`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `git diff --check`

按用户当前要求，不做浏览器截图测试；如后续需要视觉验证，必须先征求用户同意。

## W16.4 Worker 边界

允许修改：

- Tailwind 相关配置和依赖文件。
- `src/app/image-workbench.tsx`
- `src/app/globals.css`
- 新增 `src/app/workbench/*`
- `tests/app/image-workbench.test.tsx`
- 必要时更新测试配置以支持 Tailwind。

禁止修改：

- 生成 API 的安全语义。
- Provider adapter 和 allowlist 的服务端边界。
- SQLite schema，除非只是现有模板保存流程所需的测试适配；原则上 W16.4 不需要改数据库。
- `docs/controller/phase0-progress.md`，该文件由主控维护。
- 真实 `.env`、密钥、SQLite/db 文件、上传图片、生成图片或运行时数据。

W16.4 完成后 worker 必须提交并回传 commit hash、验证命令和阻塞问题。
