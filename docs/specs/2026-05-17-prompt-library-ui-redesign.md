# 提示词库与生图工作台 UI 重构设计

日期：2026-05-17

## 背景

MVP 已完成登录、文生图、参考图生图、每日额度、generation log、配置保存和用户隔离。用户本地真实测试已跑通 Supabase 和 `sub2api`，也已成功生成图片。当前主要问题不是链路可用性，而是 UI 和交互效率：用户每次都要从空白 prompt 开始，参数和预览也没有围绕“选择模板、改写提示词、生成、保存复用”的工作流组织。

本设计把首页升级为工具型生图工作台，并新增提示词库。提示词库同时包含内置中文模板库和用户自己的模板/收藏。内置模板参考公开仓库 `freestylefly/awesome-gpt-image-2` 的分类与模板形态，但在本项目中做中文化、结构化和改写，不直接大段复制原文。

## 目标

- 将生图页面重构为高效率工作台：左侧模板库，中间 prompt 编辑和参数，右侧生成预览和用量。
- 新增内置模板库，覆盖常见中文使用场景，并为 `gpt-image-2` 提供推荐参数。
- 新增“我的模板/个人收藏”入口，复用已有 `prompt_recipes` 保存用户自己的 prompt 配方。
- 点击模板只填充 prompt 和推荐参数，不自动生成图片。
- 支持“替换当前 prompt”和“插入到当前 prompt”。
- 保存配置后该配置出现在“我的模板”，可再次应用。
- 收藏内置模板时不复制生成图片，不保存参考图，只记录模板引用或必要快照。
- 保持已有安全边界：provider 配置只在服务端，生成图片和参考图不持久化，generation log 不保存 prompt 全文。

## 非目标

- 不实现图片历史、素材库、云端图片存储或图库管理。
- 不引入多 provider UI 切换；仍使用服务端 allowlist 控制 provider/model/size/quality/output_format。
- 不做团队共享模板、公开模板发布、审核流或管理后台。
- 不在 W13 实现代码；本文件只定义 W14-W17 的设计边界。
- 不把外部仓库内容作为原文镜像；后续只提取适合本项目的结构和改写后的中文模板。

## 已阅读的当前实现上下文

- `src/app/image-workbench.tsx`：当前首页是双栏结构，左侧 prompt、模式、参数、配置名称和生成/保存按钮，右侧临时预览和下载。状态包括 `loading/success/error` 与保存状态。成功图片只在浏览器内用 `data:image/...;base64,...` 展示。
- `src/app/globals.css`：已有浅色工具界面基础样式，卡片半径 8px，断点在 640px 和 980px 降为单栏。
- `src/app/api/recipes/route.ts` 和 `src/app/api/recipes/[recipeId]/route.ts`：已有登录后的 recipe CRUD。
- `src/lib/recipes/index.ts`：保存和更新 recipe 时校验 mode、prompt、allowlist 参数，并拒绝客户端提交 provider 配置、base URL 或 API key。
- `src/lib/config/index.ts`：公开配置只暴露 provider id/label/models 与 size/quality/outputFormats，真实 baseUrl/apiKeyEnv/apiKey 不返回前端。
- `tests/app/image-workbench.test.tsx`：已覆盖 allowlist 渲染、生成不自动保存、手动保存配置、参考图模式和 provider 错误脱敏。

## UI/UX 设计原则

依据 `/Users/hao/.codex/skills/ui-ux-pro-max/SKILL.md`，本项目采用“安静、密集、可扫描”的工具型设计，而不是营销页或大面积装饰布局。

- 信息架构优先：默认首屏直接进入工作台，模板、编辑、预览三件事同时可见；不做 landing page。
- 可访问性优先：正文最小 16px，普通文本对比度达到 4.5:1；所有 icon-only 按钮必须有 `aria-label`；焦点环清晰；键盘 Tab 顺序按左中右视觉流。
- 触控目标：按钮、模板卡片操作、分类筛选和移动端 tab 的可点击区域不小于 44px，高频操作之间至少 8px 间距。
- 表单反馈：prompt、变量、参考图、参数错误显示在对应区域附近；生成和保存按钮有 loading/disabled 状态；provider 类错误继续脱敏为中文安全说明。
- 响应式结构：桌面三栏，平板双栏或上下结构，移动端使用顶部模式切换或分段 tab，在“模板 / 编辑 / 预览”之间切换，不产生横向滚动。
- 视觉系统：保留 8px 或更小圆角，使用语义色 token；避免单一青绿色铺满页面，建议加入中性色、墨色文本、少量琥珀/靛蓝/绿色状态色来区分信息层级。
- 空间和密度：工具区用清晰分组和紧凑标题，避免卡片套卡片；模板列表可扫描，预览区保留稳定比例，避免生成前后布局跳动。
- 动效克制：仅在 tab 切换、模板应用成功、保存成功、预览加载时使用 150-300ms 的 opacity/transform 反馈，并尊重 `prefers-reduced-motion`。
- 错误可恢复：错误说明包含下一步动作，例如“请缩短 prompt 后重试”“今日额度已用完，请明天再试”“请上传 PNG、JPEG 或 WebP”。

## 外部参考与来源边界

已通过浏览器读取：

- GitHub 仓库：`https://github.com/freestylefly/awesome-gpt-image-2`
- 模板文档：`https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md`
- License：`https://github.com/freestylefly/awesome-gpt-image-2/blob/main/LICENSE`

公开仓库显示其定位为 “Prompt as Code | GPT-Image2 工业级提示词引擎与模板库”，强调将散文式提示词压缩为结构化协议，拆分主体、光影、材质、排版、视觉细节等原子元素。其 README 提到约 400+ 逆向案例、20+ 工业模板，公开分类包含 UI 与界面、图表与信息可视化、海报与排版、商品与电商、品牌与标志、建筑与空间、摄影与写实、插画与艺术、人物与角色、场景与叙事、历史与古风题材、文档与出版物、其他应用场景。`docs/templates.md` 包含常规模板、JSON 进阶模板、截图/直播界面、信息图、海报/字体、商品电商、品牌等模板和避坑指南。

来源处理规则：

- W14 可以读取公开仓库的 README、模板文档和结构化数据，记录可复验来源链接。
- 内置模板必须中文化、改写和适配 image-service 的字段结构，不大段复制外部原文。
- 对外部示例只吸收分类、结构和提示词工程方法；模板正文使用本项目自有中文表达。
- 模板记录保留 `source` 和 `referenceUrl`，便于后续复核来源。
- License 为 MIT，但仓库同时包含免责声明；本项目不保证外部提示词生成结果的版权、商标或肖像可商用，UI 需提示用户自行确认素材和用途合规。

## 提示词库信息架构

提示词库分为两个顶层来源：

- 内置模板：随代码发布的中文模板数据，所有登录用户可读，不能被用户直接修改。
- 我的模板：用户通过“保存配置”创建的个人模板，以及用户收藏的内置模板入口。按 `user_id` 隔离。

建议中文分类：

| 分类 id | 中文名 | 说明 | 典型参数 |
| --- | --- | --- | --- |
| `ecommerce-product` | 电商产品 | 商品主图、详情页视觉、套装陈列、材质卖点 | `1024x1536` / high / png |
| `social-cover` | 社媒封面 | 小红书、公众号、视频封面、活动封面 | `1536x1024` / high / png |
| `live-commerce` | 直播带货 | 直播间背景、商品讲解屏、福利弹窗氛围图 | `1536x1024` / medium / png |
| `poster-typography` | 海报字体 | 标题字、活动海报、字体排版、节日 KV | `1024x1536` / high / png |
| `photoreal` | 摄影写实 | 产品摄影、人像摄影、空间摄影、自然光 | `1024x1536` / high / jpeg |
| `character` | 人物角色 | IP 角色、头像、穿搭、职业形象 | `1024x1536` / high / png |
| `illustration-art` | 插画艺术 | 扁平插画、绘本、潮玩、艺术风格 | `1024x1024` / high / png |
| `infographic` | 信息图表 | 流程图、对比图、数据解释图、知识卡片 | `1536x1024` / high / png |
| `brand-visual` | 品牌视觉 | Logo 氛围图、品牌板、包装延展、视觉系统 | `1536x1024` / high / png |
| `scene-story` | 场景叙事 | 电影感场景、故事分镜、空间氛围 | `1536x1024` / high / jpeg |
| `guochao-history` | 古风国潮 | 国潮海报、古风人物、历史题材、传统纹样 | `1024x1536` / high / png |
| `document-publishing` | 文档出版 | 封面、手册、报告页、出版物视觉 | `1024x1536` / high / png |

模板列表支持：

- 搜索：title、category、tags、prompt 中文内容、变量名。
- 筛选：来源、分类、模式、尺寸、质量、输出格式、是否收藏。
- 排序：推荐优先、最近保存、标题拼音或默认顺序。
- 标签：最多展示 3-5 个，避免模板卡片过高。

## 内置模板数据结构

建议新增静态数据模块，例如 `src/lib/prompt-templates/builtin.ts`，也可在 W14 先使用 JSON/TS 常量。内置模板不进 SQLite，避免污染用户数据。

```ts
type BuiltinPromptTemplate = {
  id: string;
  title: string;
  category: PromptTemplateCategoryId;
  tags: string[];
  mode: "text-to-image" | "image-edit";
  recommended: {
    model: string;
    size: string;
    quality: string;
    outputFormat: string;
    referenceMode?: "none" | "single-image";
  };
  prompt: string;
  variables: PromptTemplateVariable[];
  source: {
    type: "external-inspired" | "original";
    name: string;
    referenceUrl?: string;
    note: string;
  };
  safetyNotes?: string[];
};

type PromptTemplateVariable = {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
  defaultValue?: string;
  maxLength?: number;
  helperText?: string;
};
```

示例模板，以下为本项目中文改写示例，不是外部原文复制：

```json
{
  "id": "builtin-ecommerce-clean-packshot",
  "title": "电商白底质感主图",
  "category": "ecommerce-product",
  "tags": ["商品主图", "白底", "质感"],
  "mode": "text-to-image",
  "recommended": {
    "model": "gpt-image-2",
    "size": "1024x1536",
    "quality": "high",
    "outputFormat": "png",
    "referenceMode": "none"
  },
  "prompt": "为「{{商品名称}}」生成一张电商主图：纯净浅色背景，商品居中，保留真实材质与边缘细节，使用柔和棚拍光，画面干净高级。加入 2-3 个细节特写小元素突出「{{核心卖点}}」，不要出现夸张文字、水印、品牌错别字或多余装饰。",
  "variables": [
    {
      "key": "商品名称",
      "label": "商品名称",
      "placeholder": "例如：透明玻璃冷萃杯",
      "required": true,
      "maxLength": 60
    },
    {
      "key": "核心卖点",
      "label": "核心卖点",
      "placeholder": "例如：耐热玻璃、细腻杯口、极简造型",
      "required": true,
      "maxLength": 120
    }
  ],
  "source": {
    "type": "external-inspired",
    "name": "awesome-gpt-image-2",
    "referenceUrl": "https://github.com/freestylefly/awesome-gpt-image-2",
    "note": "参考商品与电商类模板的结构化拆分方法，中文化改写。"
  }
}
```

```json
{
  "id": "builtin-infographic-process-card",
  "title": "知识流程信息图",
  "category": "infographic",
  "tags": ["信息图", "流程", "知识卡片"],
  "mode": "text-to-image",
  "recommended": {
    "model": "gpt-image-2",
    "size": "1536x1024",
    "quality": "high",
    "outputFormat": "png",
    "referenceMode": "none"
  },
  "prompt": "生成一张中文信息图，主题是「{{主题}}」。画面采用清晰的三到五步流程结构，每一步包含短标题、简短说明和简洁图形符号；整体排版留白充足，主色不超过三种，文字必须为简体中文，避免错别字和密集小字。",
  "variables": [
    {
      "key": "主题",
      "label": "主题",
      "placeholder": "例如：新手如何选择咖啡豆",
      "required": true,
      "maxLength": 80
    }
  ],
  "source": {
    "type": "external-inspired",
    "name": "awesome-gpt-image-2",
    "referenceUrl": "https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md",
    "note": "参考信息图模板形态，改写为中文知识卡片场景。"
  }
}
```

## 模板变量与填充逻辑

变量语法使用 `{{变量名}}`，变量名必须是中文或 ASCII 字母数字下划线，不能嵌套。

交互规则：

- 用户点击模板卡片后，右侧或中间显示模板详情与变量表单。
- 必填变量未填时，主按钮显示“填写变量后套用”，不能应用到 prompt。
- 用户填写变量后可选择“替换当前 prompt”或“插入到当前 prompt”。
- 替换：用变量值渲染模板完整 prompt，覆盖当前 prompt，同时应用推荐参数。
- 插入：将渲染后的 prompt 插入到当前光标位置；没有光标位置时追加到末尾，并在前后插入空行。
- 插入时不强制覆盖参数，但可显示“同时应用推荐参数”的复选框，默认开启。
- 应用模板后不调用生成接口，不写 generation log，不写 SQLite，除非用户随后点击保存配置。
- 变量值只进入当前 prompt 文本；generation log 仍只记录 prompt 长度。

边界：

- 渲染后 prompt 最大 4000 字符，与现有 recipe 保存校验一致。
- 超限时提示“套用后 prompt 超过 4000 字，请缩短变量内容或删除部分文本。”
- 模板变量表单不保存草稿到 localStorage，避免把 prompt 隐式持久化。

## 我的模板与 `prompt_recipes` 的关系

现有 `prompt_recipes` 可以继续作为“我的模板”的主存储：

- 用户点击“保存配置”后，当前 prompt、mode、provider、model、size、quality、output_format、reference_mode 写入 `prompt_recipes`。
- `is_favorite` 继续表示个人模板收藏状态，可在“我的模板”中筛选。
- `params_json` 可以承载非敏感模板元信息，例如 `{ "sourceTemplateId": "builtin-ecommerce-clean-packshot" }`，但不得存 provider 配置、base URL、API key、图片 base64 或参考图文件信息。
- 个人模板读取、更新、删除继续按服务端 `user_id` 隔离。

内置模板收藏有两种实现方案：

1. 推荐方案：新增轻量表 `template_favorites(user_id, template_id, created_at)`，只记录用户收藏了哪个内置模板。优点是不复制内置 prompt，后续内置模板修订可自动生效；缺点是需要新增数据表和 API。
2. 兼容方案：收藏内置模板时复制为一条 `prompt_recipes`，并在 `params_json.sourceTemplateId` 记录来源。优点是复用现有 API；缺点是内置模板升级不会同步，且“收藏”和“另存为我的模板”语义混在一起。

建议 W15 采用推荐方案，并保留“另存为我的模板”动作。用户侧显示：

- “收藏”：只把内置模板加入收藏入口，不复制为个人模板。
- “另存为我的模板”：复制当前渲染后的 prompt 和参数到 `prompt_recipes`，用户可编辑。
- “保存配置”：保存当前编辑器状态到 `prompt_recipes`，保存后出现在我的模板。

## API 与数据层设计建议

建议新增聚合 API，不影响现有生成 API：

- `GET /api/prompt-templates`
  - 登录后可用。
  - 返回内置模板、我的模板摘要、收藏关系、分类、筛选所需枚举。
  - 支持 query：`source`、`category`、`mode`、`q`、`favorite`。
  - 返回的内置模板不包含 provider baseUrl、apiKeyEnv 或 API key。

- `POST /api/prompt-templates/favorites`
  - body：`{ "template_id": "builtin-..." }`
  - 只接受存在于内置模板 allowlist 的 id。
  - 写入 `template_favorites` 或等价数据层。

- `DELETE /api/prompt-templates/favorites/[templateId]`
  - 删除当前用户对内置模板的收藏。

现有 API 继续保留：

- `GET /api/recipes`：我的模板列表。
- `POST /api/recipes`：保存当前配置为我的模板。
- `GET/PATCH/DELETE /api/recipes/[recipeId]`：查看、编辑、删除我的模板。

新增数据建议：

```text
template_favorites
  user_id
  template_id
  created_at
  PRIMARY KEY (user_id, template_id)
```

如果 W15 判断新增表超出当期投入，也可以先使用兼容方案，但必须在 API 响应中明确区分 `source: "builtin" | "mine"`，避免前端混淆。

## 工作台 UI 结构

桌面端使用三栏工作台，建议断点为：

- `>= 1180px`：三栏。
- `768px - 1179px`：模板库在上或左，编辑和预览双栏。
- `< 768px`：顶部 segmented tabs：模板、编辑、预览。

### 左侧：提示词库

区域职责：

- 顶部搜索框，占位文案“搜索模板、标签或用途”。
- 来源切换：内置模板、我的模板、收藏。
- 分类列表：显示中文分类和数量。
- 模板列表：展示标题、分类、标签、模式、推荐尺寸、收藏状态。
- 空状态：例如“还没有我的模板。保存当前配置后会出现在这里。”

模板卡片操作：

- “查看”：打开模板详情。
- “套用”：进入变量填写或直接应用。
- 收藏按钮：收藏/取消收藏内置模板；我的模板使用 `is_favorite`。
- 我的模板额外提供编辑、删除入口，删除需确认。

### 中间：Prompt 编辑与参数

区域职责：

- 模式：文生图 / 参考图，使用分段控件。
- Prompt 编辑器：显示当前 prompt、字数 `0/4000`、应用模板来源提示。
- 变量抽屉或内联面板：选中模板后显示变量表单、预览渲染结果、替换/插入按钮。
- 参数：model、尺寸、质量、输出格式，选项来自服务端 allowlist。
- 参考图：仅参考图模式显示文件选择，说明“不保存参考图，仅用于本次请求”。
- 配置名称：用于保存为我的模板。
- 主操作：生成图片、保存配置。

状态：

- 未选择模板：提示“从左侧选择模板，或直接输入 prompt。”
- 模板已应用：显示“已套用：模板名”，可清除来源标记，不清空 prompt。
- 保存成功：显示“已保存到我的模板。”
- 保存失败：显示中文原因，脱敏内部错误。

### 右侧：生成预览与用量

区域职责：

- 稳定比例预览框，生成前显示空状态。
- 生成中显示骨架或进度状态，不能让预览区域高度跳动。
- 生成成功显示临时图片、下载按钮、输出格式、今日用量。
- 明确提示“图片仅保留在当前页面，刷新后不会保存。”
- provider 错误显示“图片生成服务暂时不可用，请稍后再试。”，不显示内部 URL、key 或 stack。

## 移动端降级结构

移动端不挤三栏，使用顶部或底部的三段切换：

- 模板：搜索、来源、分类、模板列表。
- 编辑：prompt、变量、参数、参考图、生成/保存按钮。
- 预览：临时图片、用量、下载。

规则：

- 生成按钮固定在编辑页底部可见，但不能遮挡输入内容。
- 选择模板后自动切到“编辑”页，并显示变量面板。
- 生成成功后自动切到“预览”页，但保留返回编辑入口。
- 所有输入高度不低于 44px，不禁用用户缩放，不产生横向滚动。

## 关键交互流程

### 套用内置模板

```text
用户在左侧选择内置模板
  -> 中间显示模板详情和变量表单
  -> 用户填写变量
  -> 点击“替换当前 prompt”或“插入到当前 prompt”
  -> 前端渲染 prompt 并更新推荐参数
  -> 不调用生成 API，不保存 SQLite
  -> 用户可继续编辑并点击生成
```

### 保存配置进入我的模板

```text
用户编辑 prompt 和参数
  -> 输入配置名称
  -> 点击“保存配置”
  -> POST /api/recipes
  -> 服务端校验登录、allowlist、禁止 provider 密钥字段
  -> 写入 prompt_recipes
  -> 左侧“我的模板”刷新并出现该模板
```

### 应用我的模板

```text
用户切到“我的模板”
  -> 点击模板
  -> 可选择替换/插入
  -> 应用 prompt 和参数
  -> 不自动生成
```

### 收藏内置模板

```text
用户点击内置模板收藏按钮
  -> POST /api/prompt-templates/favorites
  -> 服务端只保存 user_id + template_id
  -> 收藏列表展示该模板
  -> 取消收藏时 DELETE
```

### 搜索与筛选

```text
用户输入关键词
  -> 前端 debounce 200-300ms
  -> 本地筛选已加载模板，或调用聚合 API
  -> 分类和来源筛选共同生效
  -> 无结果显示可恢复空状态
```

## 安全与隐私边界

- 不保存生成图片到 SQLite、服务器磁盘、localStorage、sessionStorage 或日志。
- 不保存参考图文件、参考图 base64、参考图文件名到 SQLite 或日志；文件名仅当前页面显示。
- 不把生成图片 base64 写入 localStorage、sessionStorage、IndexedDB 或 `prompt_recipes.params_json`。
- generation log 继续只记录元信息，例如 prompt 长度、模式、尺寸、质量、状态、错误码、耗时和是否有参考图。
- 生成 API 和保存 API 继续由服务端重复校验 provider/model/size/quality/output_format allowlist。
- 前端永远不接收 provider baseUrl、apiKeyEnv 或 API key。
- 收藏内置模板只记录模板 id，不记录用户生成图。
- 错误消息必须脱敏，不包含内部 URL、stack trace、API key、baseUrl 或 apiKeyEnv。
- 内置模板的商标、人物、版权敏感场景需要在模板 `safetyNotes` 中提示用户自行确认使用权。

## 测试与验收标准

W14 内置模板数据：

- 模板分类为中文，分类 id 稳定。
- 每个模板有 id/title/category/tags/mode/recommended/prompt/variables/source。
- 所有内置模板 id 唯一。
- 所有推荐参数存在于公开 allowlist 或有明确 fallback 策略。
- Prompt 为中文改写，不包含大段外部原文。
- 模板渲染覆盖必填变量、默认值、缺失变量和 4000 字符上限。

W15 API / 我的模板聚合：

- 未登录访问模板聚合和收藏 API 返回 `auth_required`。
- 内置模板列表不泄露 provider baseUrl、apiKeyEnv、API key。
- 我的模板只返回当前用户数据。
- 收藏内置模板只接受存在的内置模板 id。
- 保存配置后可在“我的模板”中读取。
- `params_json` 不接受图片 base64、provider config、base URL 或 API key。

W16 工作台 UI 重构：

- 左侧模板库、中间编辑器、右侧预览在桌面端可同时使用。
- 移动端无横向滚动，模板/编辑/预览可切换。
- 点击模板不会调用生成 API。
- 替换和插入行为有测试覆盖。
- 保存配置后刷新“我的模板”。
- 生成成功仍只临时展示图片，下载可用。
- 错误和 loading 状态有中文反馈。

W17 UI/UX 验证与收口：

- `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`git diff --check` 通过。
- 使用浏览器截图检查桌面和移动端关键状态：初始、选择模板、变量填写、生成中、生成成功、错误、我的模板空状态。
- 扫描仓库确认没有真实 `.env`、SQLite/db 文件、上传/生成图片、长 base64 或密钥样式。
- 验证 `next-env.d.ts` 等本地运行改动未被误提交。

## 后续实施窗口建议

### W14：内置中文模板数据提取与结构化

- 读取 `awesome-gpt-image-2` 的 README、模板文档和可访问数据文件。
- 建立 `src/lib/prompt-templates` 静态模板数据、分类定义、变量渲染 helper 和测试。
- 至少覆盖 12 个中文分类，每类先提供少量高质量模板，保证结构可扩展。
- 不接 UI，不改生成 API，不保存图片。

### W15：提示词库 API / 我的模板聚合

- 新增模板聚合 API 和收藏 API。
- 如采用推荐方案，新增 `template_favorites` 数据层和测试。
- 复用现有 `prompt_recipes` 作为我的模板。
- 覆盖 auth、用户隔离、收藏、内置模板 allowlist 和脱敏边界。

### W16：工作台 UI 重构

- 将 `ImageWorkbench` 拆成可测试的小组件或局部 helper。
- 实现三栏工作台、模板搜索/筛选、变量填写、替换/插入、收藏、保存配置刷新我的模板。
- 保持生成 API 调用和隐私边界不变。
- 更新 `tests/app/image-workbench.test.tsx` 覆盖关键交互。

### W17：UI/UX 验证、截图与阶段收口

- 做完整自动验证和浏览器视觉验证。
- 根据截图修正布局、移动端、可访问性、空状态和错误状态。
- 新增阶段收口报告，记录验收结果、剩余风险和不提交敏感/运行时数据的扫描结果。

## 自检结论

- 本设计无占位字段或未决实现分支；内置模板收藏推荐新增 `template_favorites`，兼容方案仅作为 W15 遇到成本约束时的降级选择。
- 设计不改变 MVP 安全边界：生成图片、参考图和 provider 配置仍不持久化、不暴露到前端、不进入日志。
- 范围可拆分为 W14-W17：数据、API、UI、验证四个窗口，且 W13 不实现业务代码。
