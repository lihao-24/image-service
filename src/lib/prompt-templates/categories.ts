export const PROMPT_TEMPLATE_CATEGORIES = [
  {
    id: "ui-interface",
    name: "UI与界面",
    description: "应用界面、社媒截图、直播界面、游戏 UI 和网页视觉。"
  },
  {
    id: "infographic",
    name: "图表与信息可视化",
    description: "信息图、知识卡片、技术图解、数据可视化和分析报告。"
  },
  {
    id: "poster-typography",
    name: "海报与排版",
    description: "主题海报、字体设计、活动 KV、旅行海报和视觉排版。"
  },
  {
    id: "ecommerce-product",
    name: "商品与电商",
    description: "商品主图、产品广告、包装标签、拆解图和电商英雄图。"
  },
  {
    id: "image-edit",
    name: "图生图",
    description: "参考图转换、证件照、头像、人像和主体重绘。"
  },
  {
    id: "brand-logo",
    name: "品牌与标志",
    description: "Logo 概念、品牌身份、触点系统、品牌人格和视觉规范。"
  },
  {
    id: "architecture-space",
    name: "建筑与空间",
    description: "建筑地标、空间摄影、室内外场景和城市空间视觉。"
  },
  {
    id: "photoreal",
    name: "摄影与写实",
    description: "人像摄影、产品摄影、生活抓拍、胶片质感和真实光影。"
  },
  {
    id: "illustration-art",
    name: "插画与艺术",
    description: "插画、绘本、纸雕、手绘、艺术风格和概念视觉。"
  },
  {
    id: "character",
    name: "人物与角色",
    description: "角色设定、人设参考、头像、穿搭、玩具和 IP 形象。"
  },
  {
    id: "scene-story",
    name: "场景与叙事",
    description: "电影感场景、故事分镜、世界观、连续叙事和氛围画面。"
  },
  {
    id: "history-guofeng",
    name: "历史与古风题材",
    description: "国风、古风、历史想象、传统服饰、神话人物和纹样。"
  },
  {
    id: "document-publishing",
    name: "文档与出版物",
    description: "演示封面、报告页面、出版封面、手册和档案页视觉。"
  },
  {
    id: "other-scenarios",
    name: "其他应用场景",
    description: "签名、服装拼贴、学习手记、旅行拼贴和跨类型创意图。"
  }
] as const;

export type PromptTemplateCategory = (typeof PROMPT_TEMPLATE_CATEGORIES)[number];
export type PromptTemplateCategoryId = PromptTemplateCategory["id"];
