# 提示词模板转换报告

## 转换概况

- **源文件**：`docs/gpt-image-2-prompts.md`、`docs/reference/awesome-gpt-image-2-prompts.md`
- **转换条数**：30 条
- **跳过条数**：约 170+ 条
- **候选文件**：`docs/reference/converted-prompt-templates.candidates.ts`

## 分类映射规则

| 源文件分类 | 目标 category id | 转换数量 |
|---|---|---|
| 精选提示词 - 产品/海报 | ecommerce-product / poster-typography | 3 |
| 精选提示词 - UI/信息图 | ui-interface / infographic | 4 |
| 个人资料 / 头像 | photoreal / character / illustration-art | 12 |
| 社交媒体帖子 | photoreal / illustration-art | 4 |
| 信息图 / 教育视觉图 | infographic / ui-interface / poster-typography | 7 |
| YouTube 缩略图 | ui-interface | 3 |
| 产品营销 | poster-typography / ecommerce-product | 2 |
| 电商主图 | ecommerce-product | 1 |

## 跳过原因分类

| 跳过原因 | 数量 | 说明 |
|---|---|---|
| 真实名人/品牌 | ~15 | Elon Musk、Coca-Cola、Givenchy、Meta Quest、Tesla、Pirelli 等 |
| 重复/相似内容 | ~30 | 两个源文件大量重叠，以及同类模板过多（如多个城市立体模型地图） |
| 风险内容 | ~5 | 涉及真实动漫 IP 角色（五条悟、阿库娅等）、BL 内容 |
| 质量/复杂度不足 | ~20 | 过于简短（如搞笑狗狗倒立）、过于复杂难以变量化的模板 |
| 同类已选足额 | ~50 | 城市地图类已有 1 条、时尚编辑类已有足够代表等 |
| 不适合内置模板 | ~50 | 需要上传参考图的 image-edit 类、过于个人化的模板 |

## 需要人工复核的模板

1. **builtin-ui-live-commerce-mockup**（电商直播 UI 样机）：原 prompt 包含 Elon Musk、SPACEX、Tesla 等真实品牌，已泛化为通用主播和品牌，但生成效果需验证
2. **builtin-photoreal-moody-chiaroscuro-portrait**：原 prompt 包含 "OzairAI" 水印文字，已移除
3. **builtin-infographic-stone-stairs-evolution**：原 prompt 使用 REFERENCE_0，已改为纯文生图模式
4. **builtin-poster-classical-mbti-infographic**：原 prompt 使用历史人物"潘金莲"，已泛化为通用古典人物

## 安全风险备注

- 无真实 API key、证件、二维码相关内容
- 已移除所有真实品牌名（Meta、Tesla、Coca-Cola、Givenchy 等）
- 已移除所有真实名人名（Elon Musk 等）
- 部分模板的 safetyNotes 中标注了原始内容包含真实品牌信息
- 未包含任何色情、暴力或未成年人风险内容

## 后续建议

1. 对 30 条候选模板逐一运行 `pnpm test` 验证渲染效果
2. 对需要人工复核的 4 条模板进行重点审查
3. 确认无 ID 冲突后合并到 `src/lib/prompt-templates/builtin.ts`
4. 考虑后续补充更多 image-edit 类模板（当前候选中较少）
