import type { PromptTemplateCategoryId } from "./categories";

export type PromptTemplateMode = "text-to-image" | "image-edit";
export type PromptTemplateSize = "1024x1024" | "1024x1536" | "1536x1024";
export type PromptTemplateQuality = "high" | "medium" | "low";
export type PromptTemplateOutputFormat = "png" | "jpeg" | "webp";
export type PromptTemplateReferenceMode = "none" | "single-image";
export type PromptTemplateSourceType = "external-inspired" | "original";

export interface PromptTemplateRecommendedParams {
  model: "gpt-image-2";
  size: PromptTemplateSize;
  quality: PromptTemplateQuality;
  outputFormat: PromptTemplateOutputFormat;
  referenceMode: PromptTemplateReferenceMode;
}

export interface PromptTemplateVariable {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
  defaultValue?: string;
  maxLength?: number;
  helperText?: string;
}

export interface PromptTemplateSource {
  type: PromptTemplateSourceType;
  name: string;
  referenceUrl?: string;
  note: string;
}

export interface BuiltinPromptTemplate {
  id: string;
  title: string;
  category: PromptTemplateCategoryId;
  tags: string[];
  mode: PromptTemplateMode;
  recommended: PromptTemplateRecommendedParams;
  prompt: string;
  variables: PromptTemplateVariable[];
  source: PromptTemplateSource;
  safetyNotes?: string[];
}

const REPOSITORY_URL = "https://github.com/freestylefly/awesome-gpt-image-2";
const TEMPLATES_URL = `${REPOSITORY_URL}/blob/main/docs/templates.md`;

export const BUILTIN_PROMPT_TEMPLATES: BuiltinPromptTemplate[] = [
  {
    id: "builtin-ecommerce-clean-packshot",
    title: "电商白底质感主图",
    category: "ecommerce-product",
    tags: ["商品主图", "白底", "质感"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "为「{{商品名称}}」生成一张电商主图。画面使用干净浅色背景，商品居中完整展示，保留真实材质、边缘高光和细节纹理；光线为柔和棚拍光，阴影自然。围绕「{{核心卖点}}」加入 2 到 3 个克制的细节提示元素，整体高级、清爽、适合商品详情页首图。不要出现水印、夸张大字、错误品牌名或杂乱装饰。",
    variables: [
      {
        key: "商品名称",
        label: "商品名称",
        placeholder: "例如：透明玻璃冷萃杯",
        required: true,
        maxLength: 60
      },
      {
        key: "核心卖点",
        label: "核心卖点",
        placeholder: "例如：耐热玻璃、细腻杯口、极简造型",
        required: true,
        maxLength: 120
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: TEMPLATES_URL,
      note: "参考商品与电商类模板的结构拆分方法，中文化改写。"
    }
  },
  {
    id: "builtin-social-xiaohongshu-cover",
    title: "小红书经验分享封面",
    category: "social-cover",
    tags: ["小红书", "封面", "内容营销"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张适合小红书笔记的横版封面，主题是「{{内容主题}}」。画面要有清晰视觉焦点，背景干净明亮，标题区域预留明显留白；可加入与主题相关的实物、界面片段或生活场景元素。整体风格为「{{视觉风格}}」，色彩不超过三种，信息层级清楚，适合手机端快速浏览。文字只使用简体中文，避免密集小字和错别字。",
    variables: [
      {
        key: "内容主题",
        label: "内容主题",
        placeholder: "例如：新手 7 天学会做早餐",
        required: true,
        maxLength: 80
      },
      {
        key: "视觉风格",
        label: "视觉风格",
        placeholder: "例如：清新、轻复古、明亮生活感",
        required: false,
        defaultValue: "清新明亮的生活方式风格",
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: REPOSITORY_URL,
      note: "参考社媒封面与结构化视觉要素方法，中文化改写。"
    }
  },
  {
    id: "builtin-live-commerce-studio-board",
    title: "直播间商品讲解屏",
    category: "live-commerce",
    tags: ["直播间", "带货", "讲解屏"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "medium",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "设计一张直播带货场景图，用于讲解「{{商品名称}}」。画面包含主播侧的讲解区域、商品展示台和醒目的福利信息区；整体像真实直播间截图但不出现真实平台标识。重点突出「{{促销信息}}」，用中文短句表达，避免过多数字和小字。灯光明亮、背景有层次，商品看起来可信、清晰、有购买欲。",
    variables: [
      {
        key: "商品名称",
        label: "商品名称",
        placeholder: "例如：便携式榨汁杯",
        required: true,
        maxLength: 60
      },
      {
        key: "促销信息",
        label: "促销信息",
        placeholder: "例如：今晚限量、买一送一、前 100 名赠杯刷",
        required: true,
        maxLength: 100
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: TEMPLATES_URL,
      note: "参考截图与直播界面模板的版面组织方式，中文化改写。"
    }
  },
  {
    id: "builtin-poster-typography-campaign",
    title: "活动主视觉标题海报",
    category: "poster-typography",
    tags: ["海报", "标题字", "活动"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "为「{{活动名称}}」生成一张竖版活动海报。画面核心是醒目的中文标题字，字体气质为「{{字体气质}}」，标题与背景形成强对比但保持可读；背景可以加入抽象形状、轻微材质和空间光影来增强层次。请保留明确的上中下信息区，主标题最大，副信息克制，整体适合线上传播。避免错别字、英文乱码、水印和过度复杂的装饰。",
    variables: [
      {
        key: "活动名称",
        label: "活动名称",
        placeholder: "例如：夏日焕新计划",
        required: true,
        maxLength: 60
      },
      {
        key: "字体气质",
        label: "字体气质",
        placeholder: "例如：现代粗黑、圆润亲和、复古手写",
        required: false,
        defaultValue: "现代、醒目、具有设计感",
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: TEMPLATES_URL,
      note: "参考海报与排版类模板的层级描述，中文化改写。"
    }
  },
  {
    id: "builtin-photoreal-natural-light-product",
    title: "自然光写实产品摄影",
    category: "photoreal",
    tags: ["摄影", "写实", "自然光"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "jpeg",
      referenceMode: "none"
    },
    prompt:
      "生成一张写实产品摄影作品，主体是「{{拍摄主体}}」。场景设定在「{{拍摄场景}}」，使用自然侧光和真实浅景深，保留材质细节、微小反光和环境阴影；构图像专业商业摄影，主体清晰，背景不过度虚化。画面色彩真实克制，不要出现 AI 感过强的皮肤、塑料质感、畸形结构或多余文字。",
    variables: [
      {
        key: "拍摄主体",
        label: "拍摄主体",
        placeholder: "例如：陶瓷香薰蜡烛",
        required: true,
        maxLength: 70
      },
      {
        key: "拍摄场景",
        label: "拍摄场景",
        placeholder: "例如：靠窗木桌、清晨厨房、极简浴室",
        required: true,
        maxLength: 90
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: REPOSITORY_URL,
      note: "参考摄影与写实类分类和光影拆分方法，中文化改写。"
    }
  },
  {
    id: "builtin-character-brand-mascot",
    title: "品牌 IP 吉祥物设定",
    category: "character",
    tags: ["IP", "角色", "吉祥物"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "设计一个适合「{{品牌类型}}」的原创 IP 吉祥物。角色性格是「{{角色性格}}」，造型要有容易识别的轮廓、亲和表情和 2 到 3 个可记忆特征；使用干净背景，展示角色正面全身、轻微动态姿势和基础配色。整体适合做头像、贴纸和品牌宣传，不要使用已有知名角色、商标元素或过度复杂的服装细节。",
    variables: [
      {
        key: "品牌类型",
        label: "品牌类型",
        placeholder: "例如：儿童零食品牌、咖啡店、AI 工具",
        required: true,
        maxLength: 80
      },
      {
        key: "角色性格",
        label: "角色性格",
        placeholder: "例如：聪明、温暖、活力、可靠",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: REPOSITORY_URL,
      note: "参考人物与角色类模板的角色拆解方式，中文化改写。"
    },
    safetyNotes: ["请避免要求模仿具体在世人物或知名 IP。"]
  },
  {
    id: "builtin-illustration-editorial-scene",
    title: "编辑感主题插画",
    category: "illustration-art",
    tags: ["插画", "编辑视觉", "艺术"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张方形主题插画，主题为「{{主题}}」。画面使用「{{插画风格}}」的表现方式，主体关系清楚，背景有少量象征性元素辅助表达；色彩统一、边缘干净、细节有节制，适合用于文章头图或产品空状态。不要堆叠过多元素，不要出现难以辨认的小字和无意义符号。",
    variables: [
      {
        key: "主题",
        label: "主题",
        placeholder: "例如：远程协作、城市夜跑、低碳生活",
        required: true,
        maxLength: 80
      },
      {
        key: "插画风格",
        label: "插画风格",
        placeholder: "例如：扁平几何、细腻手绘、轻 3D",
        required: false,
        defaultValue: "现代扁平插画",
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: REPOSITORY_URL,
      note: "参考插画与艺术类分类，结合中文内容场景改写。"
    }
  },
  {
    id: "builtin-infographic-process-card",
    title: "知识流程信息图",
    category: "infographic",
    tags: ["信息图", "流程", "知识卡片"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张中文信息图，主题是「{{主题}}」。画面采用三到五步流程结构，每一步包含短标题、简短说明和简洁图形符号；整体排版留白充足，主色不超过三种，重点信息突出。文字必须为简体中文，字号层级清楚，适合横版展示。避免错别字、密集小字、复杂 3D 图标和无法阅读的说明文字。",
    variables: [
      {
        key: "主题",
        label: "主题",
        placeholder: "例如：新手如何选择咖啡豆",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: TEMPLATES_URL,
      note: "参考信息图模板形态，改写为中文知识卡片场景。"
    }
  },
  {
    id: "builtin-brand-visual-moodboard",
    title: "品牌视觉情绪板",
    category: "brand-visual",
    tags: ["品牌", "情绪板", "视觉系统"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "为「{{品牌名称}}」生成一张品牌视觉情绪板。品牌关键词是「{{品牌关键词}}」。画面包含主色与辅助色块、材质样张、图形元素、包装或界面应用片段，整体排版像专业品牌提案页；信息分区清晰，视觉统一，中文标签简短准确。不要生成真实商标侵权元素，不要出现 API key、二维码、水印或无法辨认的长文本。",
    variables: [
      {
        key: "品牌名称",
        label: "品牌名称",
        placeholder: "例如：山谷咖啡",
        required: true,
        maxLength: 60
      },
      {
        key: "品牌关键词",
        label: "品牌关键词",
        placeholder: "例如：自然、安静、精品、手作",
        required: true,
        maxLength: 120
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: TEMPLATES_URL,
      note: "参考品牌与标志类模板的元素拆分方法，中文化改写。"
    },
    safetyNotes: ["品牌视觉仅作概念草案，商用前需确认商标和素材授权。"]
  },
  {
    id: "builtin-scene-story-cinematic-frame",
    title: "电影感叙事场景",
    category: "scene-story",
    tags: ["电影感", "叙事", "场景"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "jpeg",
      referenceMode: "none"
    },
    prompt:
      "生成一张电影感横版场景图，故事瞬间是「{{故事瞬间}}」。地点设定为「{{场景地点}}」，画面使用明确前景、中景、背景层次，光线带有情绪但不过度戏剧化；人物或物件的位置要能暗示故事关系。整体像电影剧照，构图稳定，细节服务叙事。不要出现字幕、水印、畸形人物或与场景无关的物体。",
    variables: [
      {
        key: "故事瞬间",
        label: "故事瞬间",
        placeholder: "例如：雨停后两个人在车站重逢",
        required: true,
        maxLength: 120
      },
      {
        key: "场景地点",
        label: "场景地点",
        placeholder: "例如：夜晚的老火车站、清晨的海边公路",
        required: true,
        maxLength: 100
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: REPOSITORY_URL,
      note: "参考场景与叙事类分类，按中文分镜需求改写。"
    }
  },
  {
    id: "builtin-guochao-festival-kv",
    title: "国潮节日主视觉",
    category: "guochao-history",
    tags: ["国潮", "节日", "传统纹样"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张竖版国潮主视觉，主题是「{{节日或主题}}」。画面融合传统纹样、现代构成和层次化留白，主视觉元素为「{{主视觉元素}}」；色彩有节日气氛但不过度饱和，中文标题区域清晰，适合活动海报或社媒传播。请避免错误历史服饰、随意拼贴符号、难以辨认的文字和真实文物商标化使用。",
    variables: [
      {
        key: "节日或主题",
        label: "节日或主题",
        placeholder: "例如：端午安康、春日茶会、中秋礼遇",
        required: true,
        maxLength: 80
      },
      {
        key: "主视觉元素",
        label: "主视觉元素",
        placeholder: "例如：粽叶与龙舟、月兔与桂花、青绿山水",
        required: true,
        maxLength: 100
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: REPOSITORY_URL,
      note: "参考历史与古风题材分类，结合国潮海报需求改写。"
    }
  },
  {
    id: "builtin-document-report-cover",
    title: "中文报告封面设计",
    category: "document-publishing",
    tags: ["报告", "封面", "出版"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "设计一张中文报告封面，报告主题是「{{报告主题}}」。封面需要有清晰标题区、作者或机构信息区、日期区和一处主题相关的抽象视觉；整体专业、克制、适合打印和 PDF 首页。视觉风格为「{{设计风格}}」，排版对齐明确，留白充足。请避免过多装饰、低对比文字、错误中文、真实机构标志和无意义图表。",
    variables: [
      {
        key: "报告主题",
        label: "报告主题",
        placeholder: "例如：2026 年社区商业观察",
        required: true,
        maxLength: 90
      },
      {
        key: "设计风格",
        label: "设计风格",
        placeholder: "例如：咨询报告风、学术简洁、科技蓝白",
        required: false,
        defaultValue: "现代专业、清晰克制",
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: REPOSITORY_URL,
      note: "参考文档与出版物分类，改写为中文报告封面场景。"
    }
  },
  {
    id: "builtin-image-edit-product-background",
    title: "参考图商品换背景",
    category: "ecommerce-product",
    tags: ["参考图", "商品换景", "图片编辑"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传的参考图，保留「{{保留内容}}」的主体形状、材质、颜色和关键细节，为它替换成「{{新背景}}」背景。新背景要与主体透视和光线一致，边缘自然，阴影可信，整体像真实商业摄影。不要改变主体结构，不要新增品牌文字、水印、夸张装饰或与商品不符的元素。",
    variables: [
      {
        key: "保留内容",
        label: "保留内容",
        placeholder: "例如：杯子本体、包装盒和瓶身标签",
        required: true,
        maxLength: 100
      },
      {
        key: "新背景",
        label: "新背景",
        placeholder: "例如：浅灰棚拍台面、夏日露营桌、极简浴室",
        required: true,
        maxLength: 100
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: TEMPLATES_URL,
      note: "参考图片编辑与电商模板的主体保留方法，中文化改写。"
    }
  }
];

