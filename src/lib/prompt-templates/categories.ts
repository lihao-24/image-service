export const PROMPT_TEMPLATE_CATEGORIES = [
  {
    id: "ecommerce-product",
    name: "电商产品",
    description: "商品主图、详情页视觉、套装陈列和材质卖点表达。"
  },
  {
    id: "social-cover",
    name: "社媒封面",
    description: "小红书、公众号、视频封面和活动内容封面。"
  },
  {
    id: "live-commerce",
    name: "直播带货",
    description: "直播间背景、商品讲解屏、福利弹窗和转化氛围图。"
  },
  {
    id: "poster-typography",
    name: "海报字体",
    description: "标题字、活动海报、节日 KV 和字体排版视觉。"
  },
  {
    id: "photoreal",
    name: "摄影写实",
    description: "产品摄影、人像摄影、空间摄影和自然光写实画面。"
  },
  {
    id: "character",
    name: "人物角色",
    description: "IP 角色、头像、穿搭、职业形象和角色设定。"
  },
  {
    id: "illustration-art",
    name: "插画艺术",
    description: "扁平插画、绘本、潮玩、艺术风格和概念视觉。"
  },
  {
    id: "infographic",
    name: "信息图表",
    description: "流程图、对比图、知识卡片和数据解释图。"
  },
  {
    id: "brand-visual",
    name: "品牌视觉",
    description: "品牌板、包装延展、Logo 氛围图和视觉系统。"
  },
  {
    id: "scene-story",
    name: "场景叙事",
    description: "电影感场景、故事分镜、空间氛围和叙事画面。"
  },
  {
    id: "guochao-history",
    name: "古风国潮",
    description: "国潮海报、古风人物、历史题材和传统纹样。"
  },
  {
    id: "document-publishing",
    name: "文档出版",
    description: "封面、手册、报告页、目录页和出版物视觉。"
  }
] as const;

export type PromptTemplateCategory = (typeof PROMPT_TEMPLATE_CATEGORIES)[number];
export type PromptTemplateCategoryId = PromptTemplateCategory["id"];

