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
const GALLERY_PART_1_URL = `${REPOSITORY_URL}/blob/main/docs/gallery-part-1.md`;
const GALLERY_PART_2_URL = `${REPOSITORY_URL}/blob/main/docs/gallery-part-2.md`;

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
    category: "ui-interface",
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
    category: "ui-interface",
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
    category: "brand-logo",
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
    category: "history-guofeng",
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
    id: "builtin-ecommerce-premium-food-hero",
    title: "高端食品饮品英雄图",
    category: "ecommerce-product",
    tags: ["食品饮品", "商业广告", "英雄图"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "为「{{产品类型}}」生成一张高端电商英雄图。画面以「{{品牌调性}}」为核心，主体放在精致台面或真实使用场景中，使用商业棚拍级光线、可信材质细节和少量氛围道具；可加入一行中文短卖点，但不要堆叠促销文案。整体适合官网首屏、详情页头图和社媒广告，避免真实品牌 Logo、水印、错字和廉价合成感。",
    variables: [
      {
        key: "产品类型",
        label: "产品类型",
        placeholder: "例如：精品牛排礼盒、冷萃咖啡、低糖坚果棒",
        required: true,
        maxLength: 80
      },
      {
        key: "品牌调性",
        label: "品牌调性",
        placeholder: "例如：黑金奢华、自然有机、清爽运动感",
        required: true,
        maxLength: 100
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-373`,
      note: "参考 gallery 中高端肉类海鲜品牌英雄图案例，中文化归纳为通用食品电商模板。"
    }
  },
  {
    id: "builtin-social-profile-3d-card",
    title: "3D 社媒个人资料卡",
    category: "ui-interface",
    tags: ["社媒主页", "3D 卡片", "个人品牌"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张竖版 3D 社媒个人资料卡，主角是「{{账号人设}}」。画面包含头像区域、昵称、简介、关注数据、内容标签和一张代表性作品预览，整体像精致的移动端截图但不使用真实平台商标。视觉风格为「{{视觉风格}}」，层级清楚，中文短文本准确，适合个人品牌展示。避免真实账号冒充、乱码、小字过密和无意义 UI。",
    variables: [
      {
        key: "账号人设",
        label: "账号人设",
        placeholder: "例如：AI 效率博主、咖啡探店摄影师、健身教练",
        required: true,
        maxLength: 80
      },
      {
        key: "视觉风格",
        label: "视觉风格",
        placeholder: "例如：玻璃拟态、轻 3D、明亮潮流",
        required: false,
        defaultValue: "明亮精致的轻 3D 社媒风格",
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-402`,
      note: "参考 gallery 中 3D 小红书个人资料卡案例，改写为不依赖真实平台的中文社媒模板。"
    }
  },
  {
    id: "builtin-live-commerce-mobile-screenshot",
    title: "手机直播间截图氛围图",
    category: "ui-interface",
    tags: ["直播截图", "手机界面", "互动氛围"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "medium",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张竖版手机直播间截图风格画面，主播正在介绍「{{直播主题}}」。画面要包含主播区域、商品或内容展示区、弹幕互动、点赞动画和底部操作栏，但不出现真实平台 Logo。直播间氛围是「{{氛围关键词}}」，中文 UI 文案短而清楚，视觉焦点集中在主播和核心信息上。避免夸张擦边、虚假平台标识、错误文字和过密弹幕。",
    variables: [
      {
        key: "直播主题",
        label: "直播主题",
        placeholder: "例如：春季穿搭专场、咖啡豆讲解、新品护肤体验",
        required: true,
        maxLength: 90
      },
      {
        key: "氛围关键词",
        label: "氛围关键词",
        placeholder: "例如：热闹但高级、治愈、科技感、国风",
        required: false,
        defaultValue: "真实热闹、有购买欲",
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-330`,
      note: "参考 gallery 中直播画面案例，中文化改写并去除真实平台与人物依赖。"
    }
  },
  {
    id: "builtin-poster-concept-typography",
    title: "概念字体主题海报",
    category: "poster-typography",
    tags: ["字体海报", "概念设计", "排版"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "为标题「{{海报标题}}」生成一张完成度高的概念字体海报。标题必须成为画面的主要视觉结构，字形需要呼应「{{概念方向}}」，保持巨大、可读、有力量；背景只使用必要的质感、光影或抽象结构来强化主题。画面是单张成品海报，不要做成样机、过程板或多方案拼贴。避免乱码、错字、水印、过度装饰和不可读字体。",
    variables: [
      {
        key: "海报标题",
        label: "海报标题",
        placeholder: "例如：暗涌、醒来、Future Signals",
        required: true,
        maxLength: 60
      },
      {
        key: "概念方向",
        label: "概念方向",
        placeholder: "例如：液态金属、风暴、静默科技、复古胶片",
        required: true,
        maxLength: 90
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-355`,
      note: "参考 gallery 中概念字体海报 Prompt，中文化归纳为可复用标题字模板。"
    }
  },
  {
    id: "builtin-photoreal-editorial-candid",
    title: "杂志感自然抓拍人像",
    category: "photoreal",
    tags: ["人像摄影", "抓拍", "编辑感"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "jpeg",
      referenceMode: "none"
    },
    prompt:
      "生成一张写实杂志感人像摄影，人物是「{{人物设定}}」，地点在「{{场景地点}}」。画面像自然抓拍而非摆拍，使用真实环境光、轻微胶片颗粒、可信皮肤质感和生活化动作；服装与场景互相呼应，构图有编辑感但不过度修饰。不要模仿具体真人，不要出现畸形手指、塑料皮肤、过度磨皮、品牌水印或无关文字。",
    variables: [
      {
        key: "人物设定",
        label: "人物设定",
        placeholder: "例如：周末看展的年轻设计师、清晨慢跑后的咖啡师",
        required: true,
        maxLength: 100
      },
      {
        key: "场景地点",
        label: "场景地点",
        placeholder: "例如：东京街头、大学庭院、社区咖啡馆露台",
        required: true,
        maxLength: 90
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-434`,
      note: "参考 gallery 中街头胶片人像与生活方式摄影案例，中文化改写为通用人像模板。"
    },
    safetyNotes: ["请使用虚构人物设定，避免要求生成具体在世人物肖像。"]
  },
  {
    id: "builtin-character-design-sheet",
    title: "角色设定三视图参考表",
    category: "character",
    tags: ["角色设定", "三视图", "参考表"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "为原创角色「{{角色名称}}」生成一张横版角色设定参考表。角色身份是「{{角色身份}}」，画面包含正面、侧面、背面全身三视图，一个表情特写，以及 3 到 5 个服装或道具细节 callout；背景干净，文字标签尽量少且为简体中文。整体适合建模、插画或 IP 开发参考。不要使用现有动漫 IP、真实人物肖像或复杂到无法复现的细节。",
    variables: [
      {
        key: "角色名称",
        label: "角色名称",
        placeholder: "例如：林溪、NEO RIN、阿岚",
        required: true,
        maxLength: 40
      },
      {
        key: "角色身份",
        label: "角色身份",
        placeholder: "例如：街舞少女、赛博安全工程师、荒野邮差",
        required: true,
        maxLength: 90
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-397`,
      note: "参考 gallery 中街舞角色设定参考图与角色设计表案例，中文化归纳为原创角色模板。"
    },
    safetyNotes: ["角色必须原创，避免复刻现有 IP 或具体真人。"]
  },
  {
    id: "builtin-illustration-paper-cut-scene",
    title: "层叠纸雕故事插画",
    category: "illustration-art",
    tags: ["纸雕", "故事插画", "层次"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张层叠纸雕风格插画，主题是「{{故事主题}}」。画面由多层剪纸前景、中景和背景组成，边缘有真实纸张厚度、柔和投影和细腻纹理；主体动作清楚，色彩温暖但不单调，适合绘本封面、节日视觉或品牌插画。请让所有元素服务同一个故事瞬间，不要做成杂乱拼贴，不要出现乱码、错别字或水印。",
    variables: [
      {
        key: "故事主题",
        label: "故事主题",
        placeholder: "例如：雨后相遇、月光下的花园、城市里的小小庆典",
        required: true,
        maxLength: 100
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-435`,
      note: "参考 gallery 中层叠纸雕插画案例，中文化改写为通用故事插画模板。"
    }
  },
  {
    id: "builtin-infographic-science-scale",
    title: "科学尺度缩放信息图",
    category: "infographic",
    tags: ["科学信息图", "尺度缩放", "科普"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张关于「{{科学主题}}」的横版尺度缩放科普信息图。画面用 6 到 8 个递进圆形或六边形窗口展示从微观结构到宏观场景的层级，每层有简短中文标签、比例提示和关键结构说明；整体像高级科学手册页面，线条清晰、配色克制、信息密度适中。避免错误科学常识、不可读小字、乱码、过度装饰和无意义图标。",
    variables: [
      {
        key: "科学主题",
        label: "科学主题",
        placeholder: "例如：蜂巢结构、锂电池、珊瑚礁生态、云的形成",
        required: true,
        maxLength: 90
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-380`,
      note: "参考 gallery 中冠状病毒尺度缩放科学信息图案例，中文化归纳为通用科学图解模板。"
    }
  },
  {
    id: "builtin-brand-touchpoint-system-board",
    title: "品牌触点系统视觉板",
    category: "brand-logo",
    tags: ["品牌系统", "触点", "视觉板"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "为「{{品牌名称}}」生成一张品牌触点系统视觉板。品牌关键词是「{{品牌关键词}}」，画面要包含主视觉产品或服务场景、色彩系统、字体气质、包装或界面触点、社媒应用片段和材质细节；整体像专业品牌提案页，分区明确，中文标签短而准确。不要复刻真实品牌，不要出现商标侵权元素、二维码、水印或过长说明文字。",
    variables: [
      {
        key: "品牌名称",
        label: "品牌名称",
        placeholder: "例如：MATCHA MODE、禾木研究所、北岸跑团",
        required: true,
        maxLength: 60
      },
      {
        key: "品牌关键词",
        label: "品牌关键词",
        placeholder: "例如：现代、健康、轻奢、自然、年轻",
        required: true,
        maxLength: 120
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-362`,
      note: "参考 gallery 中抹茶品牌触点系统视觉板案例，中文化改写为通用品牌系统模板。"
    },
    safetyNotes: ["商用前需确认名称、标识、字体和素材授权。"]
  },
  {
    id: "builtin-scene-story-storyboard",
    title: "12 格电影分镜故事板",
    category: "scene-story",
    tags: ["分镜", "Storyboard", "叙事"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "medium",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "为「{{故事主题}}」生成一张横版 12 格电影分镜故事板。每格展示一个连续动作或情绪变化，镜头语言包含远景、中景、特写和运动镜头，整体线稿或半成品概念稿风格统一；画面需要能看出起承转合，但文字只保留简短中文镜头编号和动作标签。避免无关场景跳跃、人物造型前后不一致、字幕堆叠和水印。",
    variables: [
      {
        key: "故事主题",
        label: "故事主题",
        placeholder: "例如：雨夜追车、可颂烘焙的一天、舞台演出前后",
        required: true,
        maxLength: 120
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-413`,
      note: "参考 gallery 中当代舞现场 Storyboard 与流程分镜案例，中文化归纳为通用分镜模板。"
    }
  },
  {
    id: "builtin-guochao-mythology-archive",
    title: "东方神话人物志海报",
    category: "history-guofeng",
    tags: ["神话", "人物志", "国风"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张竖版东方神话人物志百科海报，主题人物是「{{神话人物或角色}}」。画面结合国风插画、博物图鉴和档案页排版，包含人物主视觉、法器或纹样细节、身份标签、象征元素和一段简短中文说明；历史与神话氛围要庄重克制，配色有传统韵味。避免错误朝代混搭、真实文物商标化、乱码、过密小字和廉价玄幻特效。",
    variables: [
      {
        key: "神话人物或角色",
        label: "神话人物或角色",
        placeholder: "例如：洛水女神、山海经异兽守护者、月宫司香人",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-415`,
      note: "参考 gallery 中东方神话人物志百科海报案例，中文化改写为国风人物志模板。"
    }
  },
  {
    id: "builtin-document-premium-slide-cover",
    title: "高级演示封面页",
    category: "document-publishing",
    tags: ["演示文稿", "封面", "PPT"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "创建一张 4:3 高级演示文稿封面页，主题是「{{演示主题}}」。版式需要像成熟科技或咨询公司提案封面，包含主标题、副标题、日期或版本信息和一处抽象主题视觉；风格为「{{封面风格}}」，留白充足，对齐严谨，字体层级清晰。不要使用真实公司 Logo，不要出现模板水印、错字、乱码、花哨装饰或低对比小字。",
    variables: [
      {
        key: "演示主题",
        label: "演示主题",
        placeholder: "例如：AI 原生客服平台方案、2026 品牌增长复盘",
        required: true,
        maxLength: 100
      },
      {
        key: "封面风格",
        label: "封面风格",
        placeholder: "例如：极简科技、咨询蓝白、高级初创企业美学",
        required: false,
        defaultValue: "现代极简、高级、专业",
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-175`,
      note: "参考 gallery 中高级 AI 演示平台封面设计案例，中文化归纳为通用演示封面模板。"
    }
  },
  {
    id: "builtin-ui-mobile-app-mockup",
    title: "竖版手机应用界面样机",
    category: "ui-interface",
    tags: ["App UI", "手机样机", "界面设计"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张竖版手机应用界面样机，应用主题是「{{应用主题}}」。画面包含状态栏、主导航、核心内容卡片、一个主要操作按钮和底部标签栏，整体像真实产品截图但不使用真实品牌或平台标识。视觉风格为「{{界面风格}}」，信息层级清晰，中文文案简短准确，适合产品概念展示。避免乱码、无意义图标、拥挤布局和不可点击感的装饰。",
    variables: [
      {
        key: "应用主题",
        label: "应用主题",
        placeholder: "例如：AI 旅行规划、宠物健康记录、个人财务看板",
        required: true,
        maxLength: 90
      },
      {
        key: "界面风格",
        label: "界面风格",
        placeholder: "例如：暗黑极简、轻 3D、清爽白底、未来科技",
        required: false,
        defaultValue: "现代清爽、真实可用",
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_1_URL}#case-7`,
      note: "参考 gallery 中应用界面样机图案例，归纳为通用移动端 UI 模板。"
    }
  },
  {
    id: "builtin-ui-stream-thumbnail",
    title: "视频封面与直播缩略图",
    category: "ui-interface",
    tags: ["视频封面", "直播缩略图", "内容界面"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张横版视频封面或直播缩略图，内容主题是「{{内容主题}}」。画面需要有强视觉主体、清晰标题区、频道或栏目标签、少量互动元素和适合点击的构图；标题文案为简体中文，控制在 8 到 14 个字。整体风格为「{{封面风格}}」，适合平台信息流快速识别。避免真实平台 Logo、错别字、密集小字和夸张低俗元素。",
    variables: [
      {
        key: "内容主题",
        label: "内容主题",
        placeholder: "例如：30 分钟做完工作复盘、深夜咖啡测评、AI 工具直播",
        required: true,
        maxLength: 100
      },
      {
        key: "封面风格",
        label: "封面风格",
        placeholder: "例如：科技感、综艺感、知识博主风、二次元直播间",
        required: false,
        defaultValue: "清晰醒目、有内容平台封面感",
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_1_URL}#case-92`,
      note: "参考 gallery 中视频封面界面图和直播界面案例，中文化改写为通用内容封面模板。"
    }
  },
  {
    id: "builtin-infographic-technical-exploded-atlas",
    title: "技术剖面图谱信息图",
    category: "infographic",
    tags: ["技术图解", "剖面图", "系统图谱"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张「{{对象或系统}}」的技术剖面图谱信息图。画面以工程白皮书和科学图谱风格呈现，包含主体剖面、关键模块编号、流程箭头、材料或数据流标注、局部放大窗口和底部摘要栏；中文标签要准确简洁。整体线条清晰、信息密度高但可读，适合技术科普或产品说明。避免错误结构、乱码、过度赛博风和无关装饰。",
    variables: [
      {
        key: "对象或系统",
        label: "对象或系统",
        placeholder: "例如：智能城市地下系统、相机成像系统、咖啡机萃取结构",
        required: true,
        maxLength: 100
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_1_URL}#case-1`,
      note: "参考 gallery 中城市生命系统图谱和技术剖面案例，归纳为技术图谱模板。"
    }
  },
  {
    id: "builtin-infographic-math-lecture-handout",
    title: "数学概念讲义信息图",
    category: "infographic",
    tags: ["数学可视化", "讲义", "教育"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "创建一张关于「{{数学概念}}」的数学可视化讲义信息图。画面解释它是什么、为什么成立、几何直觉、关键公式和典型应用；包含坐标图、步骤推导、小结框和 1 到 2 个例题结构。整体像高质量课堂讲义加现代信息图，中文说明准确，公式排版清楚。避免错误公式、不可读小字、随机符号和装饰性公式堆砌。",
    variables: [
      {
        key: "数学概念",
        label: "数学概念",
        placeholder: "例如：导数、贝叶斯定理、矩阵特征值、积分换元",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-341`,
      note: "参考 gallery 中 AP Calculus 学习表信息图案例，中文化归纳为数学讲义模板。"
    }
  },
  {
    id: "builtin-infographic-beauty-analysis-report",
    title: "美妆与造型分析报告",
    category: "infographic",
    tags: ["分析报告", "美妆", "造型"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传的人像参考图，生成一张「{{分析主题}}」分析报告信息图。报告需要保留人物基本面部特征，以专业编辑排版展示关键观察、推荐方向、色彩或造型建议、适配场景和注意事项；视觉风格为高级杂志或美妆顾问报告，中文标题和短标签清楚。不要做医疗诊断，不要贬低外貌，不要改变人物身份特征，不要出现真实品牌误导或不可读小字。",
    variables: [
      {
        key: "分析主题",
        label: "分析主题",
        placeholder: "例如：口红色号推荐、发型分析、面部风格定位",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-437`,
      note: "参考 gallery 中面部美学分析报告和口红推荐报告案例，安全改写为造型信息图模板。"
    },
    safetyNotes: ["仅用于审美与造型建议，不应生成医疗、身份或敏感属性判断。"]
  },
  {
    id: "builtin-poster-epic-silhouette-narrative",
    title: "剪影双重曝光叙事海报",
    category: "poster-typography",
    tags: ["叙事海报", "双重曝光", "收藏版"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "根据「{{主题}}」生成一张收藏版剪影双重曝光叙事海报。用一个优雅的大轮廓作为外形，内部自然生长出与主题强绑定的场景、角色关系、象征物、建筑或道具；画面融合电影海报与梦幻水彩插画，留白克制，氛围宏大而不杂乱。标题区清楚，整体一眼能识别主题。避免硬拼贴、模板化背景、乱码、水印和廉价奇幻素材感。",
    variables: [
      {
        key: "主题",
        label: "主题",
        placeholder: "例如：远航、旧城记忆、时间博物馆、夏夜传说",
        required: true,
        maxLength: 90
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_1_URL}#case-5`,
      note: "参考 gallery 中收藏版史诗叙事海报案例，去除固定签名后归纳为通用海报模板。"
    }
  },
  {
    id: "builtin-poster-city-travel-typography",
    title: "城市文字旅行海报",
    category: "poster-typography",
    tags: ["旅行海报", "城市", "字体"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张以「{{城市名称}}」为主题的横版文字旅行海报。画面用巨大城市英文或拼音字样作为主视觉结构，融合当地地标、街景、交通、食物或自然元素，整体像高级旅行杂志跨页；文字必须拼写正确、排版专业，中文信息只保留短标签。视觉风格为「{{旅行风格}}」。避免随机符号、错字、过密小字和旅游广告模板感。",
    variables: [
      {
        key: "城市名称",
        label: "城市名称",
        placeholder: "例如：Qingdao、Tokyo、Chengdu、Barcelona",
        required: true,
        maxLength: 60
      },
      {
        key: "旅行风格",
        label: "旅行风格",
        placeholder: "例如：复古航空海报、现代极简、拼贴编辑风",
        required: false,
        defaultValue: "现代编辑式旅行海报",
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-431`,
      note: "参考 gallery 中城市文字旅行海报案例，中文化归纳为城市海报模板。"
    }
  },
  {
    id: "builtin-ecommerce-exploded-product-diagram",
    title: "商品爆炸拆解图",
    category: "ecommerce-product",
    tags: ["爆炸图", "结构拆解", "产品卖点"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张「{{产品名称}}」的 3D 爆炸拆解图。主体各部件沿轴线有序分离，展示材料、结构、功能模块和关键卖点；画面包含短中文标注、编号引线、局部放大细节和底部规格摘要，整体像高端产品发布页或工程说明图。避免结构不合理、部件漂浮混乱、错误品牌名、乱码和过度复杂背景。",
    variables: [
      {
        key: "产品名称",
        label: "产品名称",
        placeholder: "例如：无线耳机、露营手电、便携咖啡机、手机保护壳",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-361`,
      note: "参考 gallery 中手机爆炸拆解图案例，归纳为通用商品结构拆解模板。"
    }
  },
  {
    id: "builtin-ecommerce-packaging-label-redesign",
    title: "产品包装标签改造",
    category: "ecommerce-product",
    tags: ["包装标签", "参考图", "商品包装"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传参考图，将主体产品改造成「{{包装用途}}」的包装标签或外观视觉。保留主体轮廓和核心识别元素，重新设计标题、色彩、图形装饰、口味或品类标签，让它像真实可上架商品；文字使用简体中文，层级明确。避免改变主体比例、产生侵权 Logo、错别字、无意义条码和低清晰度包装文字。",
    variables: [
      {
        key: "包装用途",
        label: "包装用途",
        placeholder: "例如：草本汤料包、咖啡豆袋、节日礼盒贴纸",
        required: true,
        maxLength: 100
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_1_URL}#case-153`,
      note: "参考 gallery 中产品包装标签改造案例，中文化归纳为图片编辑模板。"
    }
  },
  {
    id: "builtin-brand-logo-concept-set",
    title: "Logo 概念方案合集",
    category: "brand-logo",
    tags: ["Logo", "品牌身份", "多方案"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "为品牌「{{品牌名称}}」生成一张 Logo 概念方案合集。行业是「{{行业}}」，品牌个性是「{{品牌个性}}」。画面展示 5 个方向明显不同的标志概念，每个包含图形标、字标、简短中文设计说明和基础应用预览；整体像专业品牌提案板。避免复刻真实品牌、使用受保护商标、乱码、过度复杂细节和不可落地的图形。",
    variables: [
      {
        key: "品牌名称",
        label: "品牌名称",
        placeholder: "例如：北岸咖啡、FlowNote、森屿户外",
        required: true,
        maxLength: 60
      },
      {
        key: "行业",
        label: "行业",
        placeholder: "例如：精品咖啡、效率软件、户外装备",
        required: true,
        maxLength: 70
      },
      {
        key: "品牌个性",
        label: "品牌个性",
        placeholder: "例如：安静、可靠、年轻、锋利、自然",
        required: true,
        maxLength: 100
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-354`,
      note: "参考 gallery 中 Logo 与品牌身份系统提示词合集，归纳为视觉化多方案模板。"
    },
    safetyNotes: ["商用前需进行商标检索和字体授权确认。"]
  },
  {
    id: "builtin-brand-personality-comic",
    title: "品牌人格漫画信息图",
    category: "brand-logo",
    tags: ["品牌人格", "漫画信息图", "Logo 延展"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传的品牌标志或视觉参考，围绕「{{品牌人格方向}}」生成一张「品牌像一个人会是什么样」的漫画信息图。画面把品牌转译为角色性格、说话方式、行为方式、社交场景和视觉符号，包含 4 到 6 个漫画分镜或模块；中文标签简短，整体像品牌策略加角色设计。不要改变原始标志含义，不要生成攻击性人格标签，不要使用真实名人或现有 IP。",
    variables: [
      {
        key: "品牌人格方向",
        label: "品牌人格方向",
        placeholder: "例如：可靠的专业顾问、松弛的生活方式朋友、锋利的创意伙伴",
        required: true,
        maxLength: 100
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-379`,
      note: "参考 gallery 中品牌人格漫画信息图案例，改写为基于参考图的品牌延展模板。"
    },
    safetyNotes: ["仅用于品牌创意探索，不替代正式品牌策略或商标审查。"]
  },
  {
    id: "builtin-architecture-minimal-landmark-poster",
    title: "极简建筑地标海报",
    category: "architecture-space",
    tags: ["建筑", "地标", "极简海报"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "设计一张以「{{建筑或地标}}」为核心的高级极简建筑海报。画面中心是清晰的建筑插画或写实渲染，背后放置一个巨大英文关键词或城市名，字体气质与建筑身份匹配；保留少量说明文字、坐标或年代信息。整体留白充分、构图稳定、材质高级。避免错误建筑结构、随机文字、过度旅游广告感和侵权标识。",
    variables: [
      {
        key: "建筑或地标",
        label: "建筑或地标",
        placeholder: "例如：悉尼歌剧院、流水别墅、上海武康大楼",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-411`,
      note: "参考 gallery 中极简建筑地标海报案例，归纳为建筑海报模板。"
    }
  },
  {
    id: "builtin-architecture-interior-morning-photo",
    title: "室内晨间空间摄影",
    category: "architecture-space",
    tags: ["室内", "空间摄影", "自然光"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "jpeg",
      referenceMode: "none"
    },
    prompt:
      "生成一张写实室内空间摄影，空间类型是「{{空间类型}}」。画面使用晨间自然光，展示真实家具、材质、窗边光影、生活痕迹和空间层次；构图像室内设计杂志，不要过度摆拍。整体风格为「{{空间风格}}」，适合民宿、家居或空间设计展示。避免不合理透视、塑料质感、过曝窗户、乱码文字和品牌水印。",
    variables: [
      {
        key: "空间类型",
        label: "空间类型",
        placeholder: "例如：小户型客厅、独立书房、咖啡馆角落、民宿卧室",
        required: true,
        maxLength: 80
      },
      {
        key: "空间风格",
        label: "空间风格",
        placeholder: "例如：日式木质、现代极简、复古公寓、侘寂",
        required: false,
        defaultValue: "温暖真实、有生活感",
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-414`,
      note: "参考 gallery 中室内晨间写实摄影案例，中文化归纳为空间摄影模板。"
    }
  },
  {
    id: "builtin-architecture-city-timeline-scene",
    title: "城市历史时间轴场景",
    category: "architecture-space",
    tags: ["城市", "时间轴", "空间叙事"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张「{{城市或地点}}」的横版城市历史时间轴场景图。画面把城市地标、街区空间、关键年代和人物活动融合在一条清晰时间线中，既像城市插画也像知识海报；建筑和空间要有辨识度，中文标签短而准确。整体信息丰富但不拥挤。避免错误年代、地标错置、随机文字和低质拼贴。",
    variables: [
      {
        key: "城市或地点",
        label: "城市或地点",
        placeholder: "例如：古希腊雅典、上海外滩、北京中轴线、京都老街",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-375`,
      note: "参考 gallery 中古希腊三哲时间轴城市图案例，归纳为空间时间轴模板。"
    }
  },
  {
    id: "builtin-photoreal-product-doodle-overlay",
    title: "写实照片涂鸦叠加",
    category: "photoreal",
    tags: ["写实摄影", "涂鸦", "混合风格"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "jpeg",
      referenceMode: "none"
    },
    prompt:
      "生成一张写实照片与 2D 涂鸦叠加的创意图，主体是「{{主体}}」，场景是「{{场景}}」。底图保持真实摄影质感、自然光和可信空间，叠加的手绘线条、箭头、表情或小标签要像真实后期标注，增强趣味但不遮挡主体。整体适合社媒广告或创意内容封面。避免涂鸦过密、主体失真、乱码和低清晰度。",
    variables: [
      {
        key: "主体",
        label: "主体",
        placeholder: "例如：一杯拿铁、一辆折叠自行车、一只复古相机",
        required: true,
        maxLength: 80
      },
      {
        key: "场景",
        label: "场景",
        placeholder: "例如：街角咖啡馆、阳台桌面、清晨便利店门口",
        required: true,
        maxLength: 90
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-366`,
      note: "参考 gallery 中写实照片与 2D 涂鸦叠加案例，中文化归纳为混合摄影模板。"
    }
  },
  {
    id: "builtin-photoreal-screen-face-portrait",
    title: "屏幕遮脸创意人像",
    category: "photoreal",
    tags: ["创意人像", "手机屏幕", "写实"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "jpeg",
      referenceMode: "none"
    },
    prompt:
      "生成一张写实创意人像，人物设定是「{{人物设定}}」，用手机、相机屏幕或透明界面部分遮住脸部，并在屏幕中呈现与现实场景呼应的画面。光线自然，构图有时尚编辑感，人物动作真实，背景为「{{背景场景}}」。不要模仿具体真人，不要出现畸形手、错误屏幕反射、品牌 Logo 或无关文字。",
    variables: [
      {
        key: "人物设定",
        label: "人物设定",
        placeholder: "例如：城市通勤者、独立音乐人、旅行摄影师",
        required: true,
        maxLength: 80
      },
      {
        key: "背景场景",
        label: "背景场景",
        placeholder: "例如：地铁站台、唱片店楼梯间、海边公路",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-421`,
      note: "参考 gallery 中 iPhone 屏幕遮脸创意人像案例，安全改写为通用创意人像模板。"
    },
    safetyNotes: ["请使用虚构人物设定，避免生成具体在世人物肖像。"]
  },
  {
    id: "builtin-illustration-japanese-doodle-portrait",
    title: "日系手绘涂鸦半身插画",
    category: "illustration-art",
    tags: ["日系手绘", "半身像", "涂鸦"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张日系手绘涂鸦半身插画，人物是「{{人物设定}}」。线条轻松、表情自然、服装细节有记忆点，背景加入少量手写感图形、小贴纸或生活物件；色彩柔和清爽，适合头像、社媒配图或角色氛围图。不要模仿现有动漫角色，不要出现乱码、复杂背景和过度精修的 3D 质感。",
    variables: [
      {
        key: "人物设定",
        label: "人物设定",
        placeholder: "例如：戴耳机的夜跑女孩、花店少年、周末画画的设计师",
        required: true,
        maxLength: 100
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-423`,
      note: "参考 gallery 中日系手绘涂鸦半身插画案例，归纳为原创人物插画模板。"
    }
  },
  {
    id: "builtin-illustration-watercolor-travel-scene",
    title: "城市水彩旅行插画",
    category: "illustration-art",
    tags: ["水彩", "旅行", "城市插画"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张竖版城市水彩旅行插画，地点是「{{旅行地点}}」。画面包含具有辨识度的街景、建筑、植物或当地生活元素，水彩晕染自然，线稿轻盈，色彩清透；上方可有简短手写风地点标题。整体适合明信片、旅行手账或文旅海报。避免错误地标、过度写实、随机文字和廉价旅游素材感。",
    variables: [
      {
        key: "旅行地点",
        label: "旅行地点",
        placeholder: "例如：首尔弘大街区、青岛海边、京都鸭川、巴黎左岸",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-433`,
      note: "参考 gallery 中韩国城市水彩旅行插画案例，中文化归纳为旅行插画模板。"
    }
  },
  {
    id: "builtin-character-collectible-toy-launch-board",
    title: "收藏级玩具发布板",
    category: "character",
    tags: ["潮玩", "玩具发布", "角色周边"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "为「{{角色或人物原型}}」设计一张收藏级玩具发布板。画面包含主玩具英雄图、可替换配件、表情或手势、包装盒、比例参考、材质特写、稀有度标识和贴纸细节；整体像高端潮玩发布视觉。角色必须是原创或公共领域改写，中文标签短而准确。避免真实名人肖像、现有 IP 复刻、商标侵权和过度复杂小字。",
    variables: [
      {
        key: "角色或人物原型",
        label: "角色或人物原型",
        placeholder: "例如：天文研究员、复古机器人、森林邮差、海边厨师",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-365`,
      note: "参考 gallery 中科学家收藏级玩具发布板案例，安全改写为原创潮玩模板。"
    },
    safetyNotes: ["避免生成具体在世人物或受版权保护角色的玩具化形象。"]
  },
  {
    id: "builtin-character-fashion-outfit-collage",
    title: "多套穿搭角色拼贴",
    category: "character",
    tags: ["穿搭", "角色一致性", "编辑拼贴"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传参考图，生成同一人物的「{{穿搭主题}}」多套穿搭编辑拼贴。画面包含 6 到 8 个全身造型，保持面部和身材比例一致，每套服装姿态不同，并加入少量手写风箭头、材质标签和搭配关键词；背景干净，像时尚杂志造型页。不要改变身份特征，不要生成暴露或低俗服饰，不要出现错误肢体和不可读小字。",
    variables: [
      {
        key: "穿搭主题",
        label: "穿搭主题",
        placeholder: "例如：春日通勤、周末城市漫步、旅行胶囊衣橱",
        required: true,
        maxLength: 90
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-398`,
      note: "参考 gallery 中 8 套日常穿搭编辑拼贴案例，改写为基于参考图的穿搭模板。"
    }
  },
  {
    id: "builtin-scene-story-key-visual-worldview",
    title: "虚构动画世界观主视觉",
    category: "scene-story",
    tags: ["主视觉", "世界观", "动画概念"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "为虚构动画「{{作品主题}}」设计一张世界观主视觉。画面需要包含有吸引力的原创角色、背景场景、标志感道具、片名区和一句中文宣传语，让观众能在一张图中理解故事类型、时代背景和核心冲突；整体像动画电影 key visual。避免套用现有 IP、真实商标、乱码、角色过多和故事信息不清。",
    variables: [
      {
        key: "作品主题",
        label: "作品主题",
        placeholder: "例如：科幻桃太郎、云端邮局、深海图书馆、月球茶馆",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-172`,
      note: "参考 gallery 中赛博科幻桃太郎主视觉图案例，归纳为原创世界观主视觉模板。"
    }
  },
  {
    id: "builtin-scene-story-miniature-world-ad",
    title: "微缩世界广告场景",
    category: "scene-story",
    tags: ["微缩世界", "广告场景", "电影感"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张电影感微缩世界广告场景，巨大主体是「{{核心物件}}」，周围建造出与它主题相关的微型城市、人物活动、道路或灯光系统。主体既像产品也像建筑地标，材质细节清晰，比例关系有趣，画面适合高端广告海报。避免真实品牌商标、比例混乱、过度拥挤、低质塑料感和不可读文字。",
    variables: [
      {
        key: "核心物件",
        label: "核心物件",
        placeholder: "例如：钻石项链、机械腕表、咖啡杯、香水瓶",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-438`,
      note: "参考 gallery 中珠宝微缩城市广告海报案例，归纳为通用微缩世界广告模板。"
    }
  },
  {
    id: "builtin-history-guofeng-fashion-archive",
    title: "传统服饰时尚档案拼贴",
    category: "history-guofeng",
    tags: ["传统服饰", "时尚拼贴", "文化档案"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张「{{文化或朝代主题}}」传统服饰时尚档案拼贴。画面展示 6 到 10 个造型或细节模块，包含服装轮廓、纹样、发饰、材质近景和简短中文说明；整体像时尚编辑大片与博物馆服饰档案结合。请保持文化元素准确克制，避免混搭错误、刻板化表达、随机文字和廉价古装影楼感。",
    variables: [
      {
        key: "文化或朝代主题",
        label: "文化或朝代主题",
        placeholder: "例如：唐代春日女装、宋代文人衣冠、十国传统服饰对照",
        required: true,
        maxLength: 100
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-384`,
      note: "参考 gallery 中十国传统服饰时尚拼贴案例，中文化归纳为传统服饰档案模板。"
    }
  },
  {
    id: "builtin-history-vintage-creature-atlas",
    title: "复古神话生物百科海报",
    category: "history-guofeng",
    tags: ["神话生物", "百科海报", "复古图鉴"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "创建一张 A4 竖版复古神话生物百科海报，生物主题是「{{神话生物}}」。风格像古代探险手稿、博物馆档案和幻想生物图鉴，包含主体全身、局部结构、栖息地小图、尺度对比、习性标签和短中文说明；纸张有轻微旧化纹理。避免抄袭现有怪兽 IP、错误文字、过度血腥和不必要的恐怖元素。",
    variables: [
      {
        key: "神话生物",
        label: "神话生物",
        placeholder: "例如：青铜翼龙、山海经云鹿、月影蛟、古林守卫",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-396`,
      note: "参考 gallery 中龙类物种复古百科海报案例，归纳为原创神话生物图鉴模板。"
    },
    safetyNotes: ["请使用原创或公共领域神话元素，避免复刻现有影视怪兽。"]
  },
  {
    id: "builtin-document-editorial-handbook-page",
    title: "高级手册内页版式",
    category: "document-publishing",
    tags: ["手册", "内页", "编辑排版"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "为「{{手册主题}}」生成一张高级手册内页版式。画面包含页眉、章节标题、两到三栏正文结构、关键术语解释、图表或插图、页码和引用信息；整体像科学、品牌或产品手册页面，排版克制专业，中文标题清晰。正文可用短句示意，但不要生成大段不可读小字。避免错别字、低对比、装饰过多和随机占位符。",
    variables: [
      {
        key: "手册主题",
        label: "手册主题",
        placeholder: "例如：Neuro-AI 混合系统、咖啡烘焙流程、品牌视觉规范",
        required: true,
        maxLength: 100
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-407`,
      note: "参考 gallery 中科学认知工程手册页案例，中文化归纳为手册内页模板。"
    }
  },
  {
    id: "builtin-document-archive-encyclopedia-page",
    title: "档案百科页面",
    category: "document-publishing",
    tags: ["百科页", "档案", "图文页"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张关于「{{档案主题}}」的竖版档案百科页面。页面包含主图、档案编号、基础信息表、时间线、局部细节图、短说明和边注，风格介于博物馆档案、科普书页和收藏图鉴之间；中文信息清楚，留白合理。避免过密小字、随机拉丁文、伪造真实机构标志和不可信事实堆砌。",
    variables: [
      {
        key: "档案主题",
        label: "档案主题",
        placeholder: "例如：古董相机、稀有植物、虚构星舰、城市老电车",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-339`,
      note: "参考 gallery 中 Apple 风格自然科普海报和百科页案例，归纳为档案出版模板。"
    }
  },
  {
    id: "builtin-other-signature-choice-poster",
    title: "多风格签名选择海报",
    category: "other-scenarios",
    tags: ["签名设计", "卡片", "个性化"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "仅基于姓名「{{姓名}}」生成一张多风格签名选择海报。画面以卡片式结构展示 6 个差异明显的签名方向，每个方向包含签名、风格名称和简短气质标签；笔势要有力量和节奏，整体高级、可分享。中文标签清楚，签名主体必须可读。避免额外索要信息、错字、随机符号、像水印一样重复姓名和低质书法效果。",
    variables: [
      {
        key: "姓名",
        label: "姓名",
        placeholder: "例如：林夏、Hao Chen、青禾",
        required: true,
        maxLength: 40
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-400`,
      note: "参考 gallery 中多风格签名选择海报案例，归纳为个性化签名模板。"
    }
  },
  {
    id: "builtin-other-cozy-study-notes",
    title: "Cozy Academia 学习手记",
    category: "other-scenarios",
    tags: ["学习手记", "生活方式", "手账"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张 Cozy Academia 风格学习手记图，学习主题是「{{学习主题}}」。画面包含木桌、笔记本、打开的电脑或书、手写感摘记、贴纸、暖色自然光和校园或书房背景；整体温暖、安静、电影感，适合社媒学习记录。文字只保留简短中文关键词。避免过度摆拍、乱码、品牌 Logo 和难以阅读的小字。",
    variables: [
      {
        key: "学习主题",
        label: "学习主题",
        placeholder: "例如：微积分复习、英语阅读、产品设计笔记、咖啡烘焙课",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-408`,
      note: "参考 gallery 中 Cozy Academia 学习手记案例，中文化归纳为学习生活方式模板。"
    }
  },
  {
    id: "builtin-other-travel-collage-poster",
    title: "Lost in 国家旅行拼贴",
    category: "other-scenarios",
    tags: ["旅行拼贴", "国家主题", "编辑风"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none"
    },
    prompt:
      "生成一张「Lost in {{国家或地区}}」主题旅行拼贴海报。主角是现代旅行者而非当地居民，周围拼贴地标、地图、票据、街头食物、交通工具和当地色彩元素；整体像时尚旅行杂志或 scrapbook，层次丰富但不混乱。标题清晰，辅助文字简短。避免刻板化表达、错误国旗地标、随机文字和真实品牌商标。",
    variables: [
      {
        key: "国家或地区",
        label: "国家或地区",
        placeholder: "例如：Japan、Morocco、Iceland、云南",
        required: true,
        maxLength: 60
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-401`,
      note: "参考 gallery 中 Lost in 国家旅行海报拼贴案例，归纳为旅行拼贴模板。"
    }
  },
  {
    id: "builtin-image-edit-ui-redesign",
    title: "参考图 UI 视觉重设计",
    category: "ui-interface",
    tags: ["图生图", "UI 重设计", "界面优化"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传的界面参考图，保留「{{保留结构}}」的核心布局和信息关系，将视觉重设计为「{{目标风格}}」。优化字体层级、间距、按钮状态、图标一致性和色彩系统，让它像真实可用的产品界面。不要改变主要业务含义，不要生成真实平台 Logo，不要出现乱码、错字、不可读小字或无意义控件。",
    variables: [
      {
        key: "保留结构",
        label: "保留结构",
        placeholder: "例如：顶部导航、列表结构、底部操作栏、数据卡片",
        required: true,
        maxLength: 100
      },
      {
        key: "目标风格",
        label: "目标风格",
        placeholder: "例如：暗黑科技、Apple 风、轻 3D、企业级 SaaS",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_1_URL}#case-17`,
      note: "参考 gallery 中界面交互设计图案例，改写为基于参考图的 UI 重设计模板。"
    }
  },
  {
    id: "builtin-image-edit-poster-style-transfer",
    title: "参考图海报风格迁移",
    category: "poster-typography",
    tags: ["图生图", "海报改造", "风格迁移"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传参考图，保留「{{保留主体}}」的核心形象和构图关系，改造成「{{海报风格}}」海报。重新组织标题区、背景层次、色彩、光影和装饰元素，让成品像完整商业海报；如需文字，只使用简体中文短句。不要改变主体身份特征，不要生成水印、乱码、错别字、真实品牌 Logo 或过度拼贴感。",
    variables: [
      {
        key: "保留主体",
        label: "保留主体",
        placeholder: "例如：人物姿态、产品轮廓、城市地标、主视觉元素",
        required: true,
        maxLength: 100
      },
      {
        key: "海报风格",
        label: "海报风格",
        placeholder: "例如：电影感、国潮、复古旅行、极简字体、音乐节",
        required: true,
        maxLength: 90
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_1_URL}#case-96`,
      note: "参考 gallery 中主题海报版式和参考图改造案例，归纳为海报图生图模板。"
    }
  },
  {
    id: "builtin-image-edit-photo-editorial-retouch",
    title: "参考图杂志感写真改造",
    category: "photoreal",
    tags: ["图生图", "写真", "编辑感"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "jpeg",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传人像或生活照，保留人物身份特征、脸部比例和主要姿态，将画面改造成「{{写真风格}}」杂志感写真。优化光线、背景、服装质感、色彩和构图，让它真实自然而非过度修图。不要改变人物身份，不要磨皮成塑料质感，不要新增真实品牌 Logo、无关文字、畸形手指或不合理背景。",
    variables: [
      {
        key: "写真风格",
        label: "写真风格",
        placeholder: "例如：东京街头胶片、清晨咖啡馆、黑白时尚、夏日户外",
        required: true,
        maxLength: 90
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-434`,
      note: "参考 gallery 中街头胶片人像和真人写真案例，改写为参考图写真增强模板。"
    },
    safetyNotes: ["请确保参考图人物授权，避免生成具体在世人物的误导性内容。"]
  },
  {
    id: "builtin-image-edit-id-photo",
    title: "根据图片生成证件照",
    category: "image-edit",
    tags: ["图生图", "证件照", "人像"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "jpeg",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传的人像照片，生成一张「{{证件照规格}}」证件照。保留人物真实身份特征、脸型比例、五官和自然表情，调整为正面或接近正面的规范构图，背景使用「{{背景颜色}}」，光线均匀，服装整洁，边缘干净，适合正式证件照预览。不要改变人物身份，不要过度美颜，不要添加水印、文字、边框、夸张滤镜或不真实的制服。",
    variables: [
      {
        key: "证件照规格",
        label: "证件照规格",
        placeholder: "例如：一寸、二寸、护照风格、签证照风格",
        required: true,
        defaultValue: "一寸标准证件照",
        maxLength: 60
      },
      {
        key: "背景颜色",
        label: "背景颜色",
        placeholder: "例如：白色、蓝色、浅灰色、红色",
        required: true,
        defaultValue: "白色",
        maxLength: 30
      }
    ],
    source: {
      type: "original",
      name: "Focal",
      referenceUrl: REPOSITORY_URL,
      note: "原创中文图生图模板。"
    },
    safetyNotes: ["证件照结果仅用于视觉生成预览，正式证件要求请以办理机构规范为准。"]
  },
  {
    id: "builtin-image-edit-anime-avatar",
    title: "根据图片生成动漫头像",
    category: "image-edit",
    tags: ["图生图", "动漫头像", "头像"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传的人像、宠物或角色参考图，生成一张「{{动漫风格}}」动漫头像。保留主体最重要的识别特征、发型或轮廓、表情气质和配色记忆点，构图适合社交头像，背景简洁有氛围，线条干净，色彩明亮但不过曝。不要复刻具体在世画师或现有 IP 风格，不要改变主体身份，不要添加乱码、水印、真实品牌 Logo 或多余文字。",
    variables: [
      {
        key: "动漫风格",
        label: "动漫风格",
        placeholder: "例如：清爽日系、赛璐璐、软萌 Q 版、精致乙游风",
        required: true,
        defaultValue: "清爽日系动漫头像",
        maxLength: 80
      }
    ],
    source: {
      type: "original",
      name: "Focal",
      referenceUrl: REPOSITORY_URL,
      note: "原创中文图生图模板。"
    }
  },
  {
    id: "builtin-image-edit-human-to-animal",
    title: "根据图片中的人生成动物",
    category: "image-edit",
    tags: ["图生图", "人像拟物", "动物化"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传图片中的人物，生成一只「{{动物类型}}」形象。需要把人物的气质、表情、姿态、发型轮廓、服装配色或标志性配饰转译到动物角色上，让观众能感到两者有关联；画面风格为「{{画面风格}}」，可以可爱、写实或故事感，但不要保留真人脸部拼贴。不要生成侮辱性、歧视性或恐怖变形效果，不要添加乱码、水印或真实品牌 Logo。",
    variables: [
      {
        key: "动物类型",
        label: "动物类型",
        placeholder: "例如：猫、狐狸、柴犬、兔子、熊猫",
        required: true,
        defaultValue: "猫",
        maxLength: 40
      },
      {
        key: "画面风格",
        label: "画面风格",
        placeholder: "例如：温暖插画、写实摄影、Q 版头像、电影感",
        required: true,
        defaultValue: "温暖插画头像",
        maxLength: 80
      }
    ],
    source: {
      type: "original",
      name: "Focal",
      referenceUrl: REPOSITORY_URL,
      note: "原创中文图生图模板。"
    },
    safetyNotes: ["避免把真实人物动物化为带有侮辱、歧视或嘲讽含义的结果。"]
  },
  {
    id: "builtin-image-edit-animal-to-human",
    title: "根据图片中的动物生成人",
    category: "image-edit",
    tags: ["图生图", "动物拟人", "角色化"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传图片中的动物，生成一位「{{人物设定}}」人类角色。把动物的品种特征、毛色或花纹、眼神、性格气质、姿态和标志性配饰转译成人物的发型、服装、配色和表情；构图完整，像角色设定或头像写真。不要直接把动物头贴到人身上，不要复刻现有 IP，不要出现畸形肢体、乱码、水印或真实品牌 Logo。",
    variables: [
      {
        key: "人物设定",
        label: "人物设定",
        placeholder: "例如：温柔少年、酷飒少女、优雅管家、冒险家",
        required: true,
        defaultValue: "温柔年轻角色",
        maxLength: 80
      }
    ],
    source: {
      type: "original",
      name: "Focal",
      referenceUrl: REPOSITORY_URL,
      note: "原创中文图生图模板。"
    }
  },
  {
    id: "builtin-image-edit-gender-swap-portrait",
    title: "根据图片中的人生成反转性别的照片",
    category: "image-edit",
    tags: ["图生图", "性别反转", "人像"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "jpeg",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传人像，生成一张「{{目标呈现}}」的性别反转照片：如果参考图人物呈现为男性，则生成女性化版本；如果呈现为女性，则生成男性化版本。保留人物身份关联感、脸部比例、神态、年龄段、姿态和摄影光线，只调整发型、服装、妆容或面部性别表达，让结果自然可信。不要丑化、嘲讽或刻板化任何性别，不要生成低俗内容、水印、乱码或真实品牌 Logo。",
    variables: [
      {
        key: "目标呈现",
        label: "目标呈现",
        placeholder: "例如：自然写实、杂志写真、职场形象、生活照",
        required: true,
        defaultValue: "自然写实人像",
        maxLength: 80
      }
    ],
    source: {
      type: "original",
      name: "Focal",
      referenceUrl: REPOSITORY_URL,
      note: "原创中文图生图模板。"
    },
    safetyNotes: ["请尊重参考图人物授权和性别表达，避免冒犯性或误导性用途。"]
  },
  {
    id: "builtin-image-edit-illustration-redraw",
    title: "参考图插画风格重绘",
    category: "illustration-art",
    tags: ["图生图", "插画重绘", "风格化"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传参考图，保留「{{保留内容}}」的轮廓、动作和主要关系，将其重绘为「{{插画风格}}」插画。画面需要保持主体可识别，强化线条、色彩、材质和背景氛围，适合头像、贴纸、社媒配图或绘本视觉。不要复刻现有 IP 风格，不要改变主体数量和关键结构，不要出现乱码或水印。",
    variables: [
      {
        key: "保留内容",
        label: "保留内容",
        placeholder: "例如：人物动作、宠物姿态、建筑轮廓、物品组合",
        required: true,
        maxLength: 100
      },
      {
        key: "插画风格",
        label: "插画风格",
        placeholder: "例如：纸艺、日系手绘、彩色潦草线条、水彩、扁平矢量",
        required: true,
        maxLength: 90
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-374`,
      note: "参考 gallery 中彩色潦草线条风格重绘和纸艺重绘案例，归纳为插画图生图模板。"
    }
  },
  {
    id: "builtin-image-edit-character-reference-sheet",
    title: "参考图角色设定表生成",
    category: "character",
    tags: ["图生图", "角色设定", "三视图"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传的角色或人物参考图，保留「{{角色特征}}」的识别点，生成一张原创角色设定参考表。画面包含正面、侧面、背面全身视图，表情特写，道具或服装细节 callout，以及少量中文标签；风格为「{{设定风格}}」。不要照搬现有 IP，不要改变核心脸型和服装记忆点，不要生成复杂不可读文字。",
    variables: [
      {
        key: "角色特征",
        label: "角色特征",
        placeholder: "例如：银色短发、蓝色夹克、机械背包、温和表情",
        required: true,
        maxLength: 120
      },
      {
        key: "设定风格",
        label: "设定风格",
        placeholder: "例如：赛博朋克、街舞、奇幻冒险、校园日常",
        required: true,
        maxLength: 80
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-439`,
      note: "参考 gallery 中角色设定表案例，改写为基于参考图的原创角色设定模板。"
    },
    safetyNotes: ["参考图若来自现有 IP，只能做原创化改写，避免复刻。"]
  },
  {
    id: "builtin-image-edit-architecture-restyle",
    title: "参考图建筑空间风格改造",
    category: "architecture-space",
    tags: ["图生图", "建筑空间", "风格改造"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "jpeg",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传的建筑或室内空间参考图，保留空间结构、透视关系和主要家具或建筑轮廓，将其改造成「{{空间风格}}」。优化材质、光线、软装、色彩和环境氛围，让画面像真实空间摄影或设计提案图。不要改变承重结构逻辑，不要让透视变形，不要新增不合理门窗、乱码文字或品牌水印。",
    variables: [
      {
        key: "空间风格",
        label: "空间风格",
        placeholder: "例如：日式木质、现代极简、复古公寓、精品咖啡馆、未来展厅",
        required: true,
        maxLength: 100
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-414`,
      note: "参考 gallery 中室内晨间写实摄影和建筑空间案例，归纳为建筑空间图生图模板。"
    }
  },
  {
    id: "builtin-image-edit-brand-envelope",
    title: "产品图品牌包络广告",
    category: "brand-logo",
    tags: ["图生图", "品牌包络", "产品广告"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传产品图，保留产品外观、比例和材质，将它放入「{{品牌世界}}」的广告视觉中。画面需要围绕品牌色彩、材质、情绪和图形语言搭建场景，而不是只换背景；加入少量中文短卖点和应用触点。不要改变产品结构，不要生成真实品牌 Logo，不要出现错字、水印、过度促销文案或廉价合成感。",
    variables: [
      {
        key: "品牌世界",
        label: "品牌世界",
        placeholder: "例如：黑金奢华健身、清爽无糖饮品、自然手作香氛、未来科技配件",
        required: true,
        maxLength: 120
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-386`,
      note: "参考 gallery 中品牌包络产品广告案例，中文化改写为产品图品牌广告模板。"
    },
    safetyNotes: ["请避免要求套用真实品牌商标或未授权视觉资产。"]
  },
  {
    id: "builtin-image-edit-scene-miniature-self",
    title: "参考图微缩分身场景",
    category: "scene-story",
    tags: ["图生图", "微缩场景", "叙事合成"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传参考图，保留主体人物或物件的外观特征，生成一个「{{叙事场景}}」的微缩分身或迷你世界合成图。画面中原主体与迷你版本产生互动，空间、光影和比例要可信，整体像 scrapbook 或电影感叙事照片。不要改变主体身份特征，不要产生恐怖畸形效果，不要出现乱码、水印或过度杂乱背景。",
    variables: [
      {
        key: "叙事场景",
        label: "叙事场景",
        placeholder: "例如：桌面上的迷你工作室、旅行箱里的小城市、咖啡杯旁的小剧场",
        required: true,
        maxLength: 100
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-371`,
      note: "参考 gallery 中真人图与迷你分身案例，归纳为参考图叙事合成模板。"
    }
  },
  {
    id: "builtin-image-edit-guofeng-costume",
    title: "参考图国风服饰改造",
    category: "history-guofeng",
    tags: ["图生图", "国风服饰", "古风改造"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传人像参考图，保留人物脸部特征和姿态，将服饰、发饰、背景改造成「{{国风主题}}」视觉。服装结构、纹样、材质和场景要尽量符合主题气质，画面可以是写实写真、工笔画或国潮海报风。不要改变人物身份，不要混搭错误朝代元素，不要生成真实文物商标化、乱码、水印或低俗古装效果。",
    variables: [
      {
        key: "国风主题",
        label: "国风主题",
        placeholder: "例如：唐代春宴、宋代茶会、敦煌飞天灵感、青绿山水国潮",
        required: true,
        maxLength: 100
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-173`,
      note: "参考 gallery 中传统服饰与国风人像案例，改写为参考图国风改造模板。"
    },
    safetyNotes: ["请避免对真实人物生成误导性身份或历史身份暗示。"]
  },
  {
    id: "builtin-image-edit-document-report-from-image",
    title: "参考图分析报告页",
    category: "document-publishing",
    tags: ["图生图", "报告页", "分析版式"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image"
    },
    prompt:
      "基于上传参考图，生成一张「{{报告主题}}」分析报告页。保留参考图中的核心主体或视觉证据，将其整理为专业报告版式：标题区、主图、关键观察、局部放大、建议或结论、页脚信息；中文文案短而清楚。不要编造医疗或法律结论，不要泄露个人隐私，不要出现真实机构 Logo、二维码、乱码或大段不可读正文。",
    variables: [
      {
        key: "报告主题",
        label: "报告主题",
        placeholder: "例如：产品外观评估、空间改造建议、穿搭风格分析、视觉诊断",
        required: true,
        maxLength: 100
      }
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: `${GALLERY_PART_2_URL}#case-437`,
      note: "参考 gallery 中面部美学分析报告和分析信息图案例，安全改写为参考图报告页模板。"
    },
    safetyNotes: ["分析报告仅作视觉整理，不应生成高风险专业结论。"]
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
  },

  // ── 以下为从 converted-prompt-templates.candidates.ts 合入的模板 ──

  // ── 电商产品 (ecommerce-product) ──────────────────────────────────
  {
    id: "builtin-ecommerce-vr-headset-exploded",
    title: "VR 头显爆炸视图海报",
    category: "ecommerce-product",
    tags: ["产品", "爆炸视图", "VR", "科技", "海报"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `{
  "type": "产品爆炸视图海报",
  "subject": "VR 头显",
  "style": "简洁的高科技 3D 渲染，摄影棚灯光，发光装饰",
  "background": "{{background color}}",
  "header": {
    "logo": "∞ {{product name}}",
    "subtitle": "{{main catchphrase}}"
  },
  "layout": {
    "centerpiece": "VR 头显的垂直堆叠爆炸视图，展示了 9 层不同的内部组件：外壳、摄像头传感器、带芯片的主板、Pancake 透镜、内部框架、电池组、侧带、顶部头带和面部接口衬垫。",
    "callout_labels": {
      "count": 8,
      "left_side": [
        "Snapdragon® XR2 Gen 2\\n卓越的处理性能，带来实时沉浸体验。",
        "可调节 IPD 机构\\n为广大用户提供舒适的佩戴感。",
        "精密设计的头带\\n追求舒适与稳定的工程学设计。"
      ],
      "right_side": [
        "前面板\\n精致的设计与优化的重量平衡。",
        "追踪摄像头\\n实现高精度的位置追踪与环境感知。",
        "Pancake 透镜\\n轻薄设计，提供广阔视野与清晰画质。",
        "高性能电池\\n优化电源设计，支持长时间续航。",
        "柔软的面部接口\\n确保长时间佩戴依然舒适。"
      ]
    },
    "footer": {
      "left_text_block": {
        "headline": "{{bottom headline}}",
        "body": "每一个零件都蕴含着支撑沉浸式体验的前沿科技与匠心设计。"
      },
      "right_logo": "∞ Brand"
    }
  }
}`,
    variables: [
      { key: "background color", label: "背景颜色", placeholder: "例如：柔和的紫蓝色渐变", required: false, defaultValue: "柔和的紫蓝色渐变", maxLength: 80 },
      { key: "product name", label: "产品名称", placeholder: "例如：Meta Quest 3", required: false, defaultValue: "Meta Quest 3", maxLength: 60 },
      { key: "main catchphrase", label: "主标语", placeholder: "例如：以全新的结构，重塑全新的现实。", required: false, defaultValue: "以全新的结构，重塑全新的现实。", maxLength: 120 },
      { key: "bottom headline", label: "底部标题", placeholder: "例如：体验，源于结构的进化。", required: false, defaultValue: "体验，源于结构的进化。", maxLength: 80 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 精选提示词 #1：VR 头显爆炸视图海报，原模板含 Meta 品牌名已泛化",
    },
  },
  {
    id: "builtin-ecommerce-luxury-perfume-bottle",
    title: "奢华香水瓶产品摄影",
    category: "ecommerce-product",
    tags: ["香水", "产品摄影", "奢华", "电商主图"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `奢华产品摄影，主体为 {{perfume}} 香水瓶，长方形玻璃瓶身，边缘圆润，内含米色液体，厚实的透明玻璃底座，透明多面瓶盖配有银色喷头，黑色颈部丝带上带有金属 Logo 吊牌，瓶身印有品牌名称字样。香水瓶微微倾斜悬浮，周围环绕着柔和的缭绕烟雾。背景为深暖棕色渐变，底部透出金色光晕，电影级摄影棚布光，玻璃表面反射清晰，浅景深效果，奢华香水广告风格，3:4 竖构图，8K 超高清细节。`,
    variables: [
      { key: "perfume", label: "香水名称", placeholder: "例如：Givenchy L'Interdit", required: false, defaultValue: "Givenchy L'Interdit", maxLength: 80 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 电商主图 #3：奢华香水瓶产品摄影",
    },
  },

  // ── UI/信息图 (ui-interface) ──────────────────────────────────────
  {
    id: "builtin-ui-live-commerce-mockup",
    title: "电商直播 UI 样机",
    category: "ui-interface",
    tags: ["直播", "UI", "电商", "样机", "社交媒体"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `{
  "type": "直播 UI 样机",
  "subject": {
    "description": "{{host name}} 的肖像，面带微笑，身穿印有白色技术示意图的黑色 T 恤",
    "background": "左侧显示带有 '{{left background logo}}' 文字的屏幕，右侧显示红色的 '{{right background logo}}' 和一辆深色汽车"
  },
  "ui_overlay": {
    "top_header": {
      "host_info": "头像，名称 '{{host name}}'，'55.6万本场点赞'，红色 '关注' 按钮",
      "rank_badge": "带有 '全站第1名' 的金币图标",
      "viewer_stats": "3 个顶部观众头像，总计 '68.7万'，'X' 关闭按钮",
      "right_links": "'更多直播 >'，'礼物展馆'"
    },
    "mid_left_gifts": {
      "count": 2,
      "items": [
        "头像 '科技爱好者'，'送小心心' x 1314",
        "头像 '星辰大海'，'送火箭' x 666"
      ]
    },
    "bottom_left_chat": {
      "system_message": "37 级勋章 '宇宙漫游者' 加入了直播间",
      "message_count": 4,
      "messages": [
        "小火箭: 主播好！未来可期！🚀",
        "future: 新品什么时候出？",
        "星空梦想家: 今年有什么新计划吗？",
        "AI探索者: 技术进展如何？"
      ]
    },
    "bottom_right_product_card": {
      "hot_tag": "橙色 '热卖 x 1888'",
      "image": "产品图片",
      "title": "{{product name}}",
      "price": "{{product price}}",
      "button": "红色 '抢' 按钮",
      "floating_animation": "半透明爱心沿右侧边缘向上浮动"
    },
    "bottom_bar": {
      "input_field": "'说点什么...'",
      "icons": ["笑脸", "购物车", "礼物", "分享"]
    }
  }
}`,
    variables: [
      { key: "host name", label: "主播名称", placeholder: "例如：科技达人", required: false, defaultValue: "科技达人", maxLength: 40 },
      { key: "left background logo", label: "左侧背景 Logo", placeholder: "例如：背景品牌", required: false, defaultValue: "背景品牌", maxLength: 40 },
      { key: "right background logo", label: "右侧背景 Logo", placeholder: "例如：品牌 Logo", required: false, defaultValue: "品牌 Logo", maxLength: 40 },
      { key: "product name", label: "产品名称", placeholder: "例如：旗舰电动皮卡", required: false, defaultValue: "旗舰电动皮卡", maxLength: 60 },
      { key: "product price", label: "产品价格", placeholder: "例如：¥ 1,618,000", required: false, defaultValue: "¥ 1,618,000", maxLength: 30 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 精选提示词 #4：电商直播 UI 样机，已将 Elon Musk/SPACEX/Tesla 等真实品牌名泛化",
    },
    safetyNotes: [
      "原模板中包含 Elon Musk、SPACEX、Tesla 等真实品牌/人物名，已在 prompt 中泛化处理",
      "使用时请确保不侵犯任何品牌商标或个人肖像权",
    ],
  },
  {
    id: "builtin-ui-research-gallery-dark",
    title: "深色研究图示库 UI",
    category: "ui-interface",
    tags: ["UI", "深色模式", "研究", "图库", "信息图"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `目标：创建一个深色、高端的图库索引页面，用于展示精选的研究论文图示样式预设库，标题为 {{headline text}}。界面应呈现为展示学术图表缩略图的精致 Web 应用截图。

画布：宽屏横向浏览器风格构图，比例约为 16:9，深炭灰色背景，带有细微的网格边框，清晰的 UI 排版，高对比度的白色和青色文字。

页眉：标题居中置于顶部，左侧配有一个小型堆叠式多色文档图标。页眉下方添加一条细水平分割线。在右上角区域，放置一个圆角紧凑按钮，标签为"↑ 图库索引"。

章节标题：在分割线下方左侧，显示加粗的浅色章节标题 {{section title}}。

布局：展示一个 4 列的图库网格，带有细灰色边框和深色卡片间距。显示 12 张可见的图库卡片：前两行显示 8 张完整卡片，底部边缘显示 4 张部分可见的卡片。每张卡片包含一个白色研究论文风格的缩略图、下方加粗的字母标题，以及标题下方三个深色圆角标签，文字分别为"landscape"、"high"和"Curated"。

可见卡片数量与标签：卡片 A："患者队列与多模态生物标志物流程"。卡片 B："单细胞免疫图谱"。卡片 C："多模态医疗 AI 方法图"。卡片 D："治疗响应统计图"。卡片 E："Transformer 编码器-解码器架构"。卡片 F："多智能体 LLM 系统架构"。卡片 G："去噪扩散正/逆向链"。卡片 H："经验缩放规律图"。底部部分可见卡片 1-4 均为研究论文图示。

视觉风格：采用现代 SaaS 仪表盘美学，深色模式，整洁的学术策展感，细微的青色点缀，标签小巧但清晰易读，研究图示缩略图需逼真，类似于高质量期刊图表。

约束：保留所写的中文界面标签和卡片标题。不要添加人物、照片、水印、浏览器地址栏或装饰性杂物。构图应看起来像是一个名为 {{project name}} 的精选研究图示模板库的截图。`,
    variables: [
      { key: "headline text", label: "标题文本", placeholder: "例如：研究论文图示", required: false, defaultValue: "研究论文图示", maxLength: 60 },
      { key: "section title", label: "章节标题", placeholder: "例如：研究论文图示网格", required: false, defaultValue: "研究论文图示网格", maxLength: 60 },
      { key: "project name", label: "项目名称", placeholder: "例如：GPT-IMAGE-2-SKILL", required: false, defaultValue: "GPT-IMAGE-2-SKILL", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 信息图 #1：深色研究图示库 UI",
    },
  },
  {
    id: "builtin-ui-sakura-travel-title-card",
    title: "Sakura Travel Cinema 标题卡",
    category: "poster-typography",
    tags: ["YouTube", "标题卡", "旅行", "樱花", "日本"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `目标：为短视频合集制作一张充满活力的日本旅行视频标题卡，将电影感的春季旅行照片背景与光泽感霓虹 UI 图形相结合。

画布：横向 16:9 图像，高分辨率，明亮的柔和色调，柔和的光晕和镜头光斑。

背景：一位年轻女性旅行者站在右侧的火车站台上，身旁是一列现代火车，采用背影/四分之三侧背视角，面部刻意用纯肤色的矩形模糊处理。她留着深棕色长卷发，身穿浅米色风衣，背着棕色单肩包。场景设定在梦幻般的春季樱花车站，左侧和上方背景布满粉色樱花树，花瓣飘落，阳光温暖，景深较浅。

主要图形布局：在左侧中心放置一个巨大的圆角渐变横幅。横幅采用蓝-紫-粉半透明光泽渐变，最左侧有一个大圆形徽章。圆圈内显示一个巨大的白色数字 {{section number}}。圆圈右侧设置醒目的白色圆角日文标题文本：{{headline text}}。下方添加一个较小的白色圆角胶囊标签，内含紫粉色文本：{{subtitle text}}。

霓虹图标叠加数量：在横幅周围和右侧共有 9 个发光的粉白色线条图标和装饰元素。

风格：日本社交媒体缩略图设计，可爱的旅行美学，光泽感渐变面板，粉色和薰衣草色调氛围，电影级虚化，梦幻樱花瓣，简洁的圆角排版，带有微弱光泽的明亮白色文本，精致的宣传卡片构图。`,
    variables: [
      { key: "section number", label: "章节编号", placeholder: "例如：4.", required: false, defaultValue: "4.", maxLength: 10 },
      { key: "headline text", label: "标题文本", placeholder: "例如：旅行・季節・青春シネマ", required: false, defaultValue: "旅行・季節・青春シネマ", maxLength: 60 },
      { key: "subtitle text", label: "副标题文本", placeholder: "例如：情緒・旅感・短編向け", required: false, defaultValue: "情緒・旅感・短編向け", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 YouTube #10：Sakura Travel Cinema 标题卡",
    },
  },
  {
    id: "builtin-ui-asmr-youtuber-thumbnail",
    title: "ASMR YouTuber 缩略图",
    category: "ui-interface",
    tags: ["YouTube", "ASMR", "缩略图", "霓虹", "直播"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `目标：为 ASMR 主播领域创作一张光泽感十足的 YouTube 缩略图风格图像，将写实的舒适创作者照片与醒目的日文标题图形及霓虹社交媒体图标相结合。

画布：横向 16:9 缩略图，电影级浅景深，冷蓝色和紫色灯光搭配柔和的粉色高光。

主体：一位年轻的女性 ASMR YouTuber 坐在画面右侧，身处舒适的卧室或直播间，穿着露肩薰衣草紫针织毛衣，佩戴黑色入耳式监听耳机。她的脸部被一个哑光棕色的巨大扁平矩形隐私遮挡块刻意遮住，从额头到下巴居中覆盖。她手持一个巨大的黑色电容麦克风，麦克风带有银色金属网罩，安装在支架的黑色防震架上。整体氛围亲密、宁静，呈现耳语直播主题。

背景：柔焦卧室/工作室，配有窗帘、搁板、小盆栽、仙女灯以及一张床或沙发。全程使用蓝紫色环境光，背景中心有粉色光斑。右下角添加一个发光的蘑菇形状台灯。

布局：将创作者和麦克风置于右侧，在左下至左中位置放置一个巨大的半透明圆角矩形标题面板。面板采用蓝紫渐变的磨砂玻璃效果。在面板最左侧，包含一个巨大的圆形渐变徽章，内含粗体白色数字"1."。在徽章右侧，放置粗体圆润的白色主标题：{{headline text}}。在下方添加一个较小的白色胶囊状标签：{{subtitle text}}。

装饰元素：在场景周围精确包含 7 个霓虹/社交图形元素。使用紫色、白色和粉色的霓虹光效。`,
    variables: [
      { key: "headline text", label: "标题文本", placeholder: "例如：ASMR・配信・YouTuber", required: false, defaultValue: "ASMR・配信・YouTuber", maxLength: 60 },
      { key: "subtitle text", label: "副标题文本", placeholder: "例如：ささやき・会話・配信向け", required: false, defaultValue: "ささやき・会話・配信向け", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 YouTube #12：ASMR YouTuber 缩略图",
    },
  },
  {
    id: "builtin-ui-neon-marketing-thumbnail",
    title: "日式霓虹营销缩略图",
    category: "ui-interface",
    tags: ["YouTube", "营销", "霓虹", "日式", "缩略图"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `创建一个充满活力的日式营销课程缩略图，主题为 {{campaign topic}}。使用 16:9 横向画布，采用亮面紫蓝色霓虹美学和柔和的景深办公照明。背景：一个现代化的化妆品营销工作区，模糊的大显示器上显示着活动仪表盘。右侧放置一位身穿淡紫色衬衫的年轻女性营销人员，坐在桌前，一只手托着下巴拿着一支笔；她的脸部被一个大的不透明哑光棕色矩形刻意遮挡。桌面细节包含 5 个主要物品：左侧一台打开的笔记本电脑、前方一个一次性咖啡杯、印有彩色布局缩略图的营销单页、右侧的化妆品瓶，以及一个写着"NEW ARRIVAL 30% OFF LIMITED CAMPAIGN"的小标牌。在左下角至中心处覆盖一个带有发光和透明效果的蓝色渐变至紫色的圆角大横幅。横幅最左侧放置一个大的圆形徽章，内有白色文本"2."。横幅上的主要日文标题为粗体白色圆角无衬线字体，其中"商品訴求"位于第二行。在其下方，添加一个带有蓝色和粉色文本的白色胶囊状标签。添加 3 个大型霓虹线条图标：左上角一个青色扩音器，其下方一个粉色购物袋，右上角一个圆角矩形内的紫色播放按钮。在构图中散布 8 个小型发光闪烁装饰，并在底部中心附近添加一个小型的粉色上升柱状图图标。整体风格：日式 YouTube 缩略图，精致的数字广告设计，发光渐变，电影级模糊，清晰易读的排版，无水印，除指定标签外无额外文字。`,
    variables: [
      { key: "campaign topic", label: "营销主题", placeholder: "例如：CM・広告・商品訴求", required: false, defaultValue: "CM・広告・商品訴求", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 YouTube #11：日式霓虹营销缩略图",
    },
  },

  // ── 信息图 (infographic) ─────────────────────────────────────────
  {
    id: "builtin-infographic-city-food-map",
    title: "手绘城市美食地图",
    category: "infographic",
    tags: ["手绘", "地图", "美食", "城市", "信息图"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `{
  "type": "手绘地图信息图",
  "style": "{{art style}}",
  "title_section": {
    "text": "{{city name}} {{map title}}",
    "mascot": "戴着墨镜并竖起大拇指的卡通红辣椒"
  },
  "border": "{{border decoration}}",
  "layout": {
    "background": "带有黄色道路、蓝色河流和绿色公园区域的纹理米色羊皮纸",
    "sections": [
      {
        "title": "地标建筑",
        "count": 6,
        "illustrations": ["传统凉亭", "传统寺院", "带有攀爬熊猫的现代摩天大楼", "高耸的电视塔", "传统牌坊", "工业建筑"],
        "labels": ["人民公园", "文殊院", "IFS", "339电视塔", "宽窄巷子", "东郊记忆"]
      },
      {
        "title": "美食地点",
        "count": 12,
        "illustrations": ["麻婆豆腐", "红油水饺", "冷锅串串", "三大炮", "蛋烘糕", "九宫格火锅", "肥肠粉", "钵钵鸡", "冒菜", "盖碗茶", "冰粉", "兔头"],
        "labels": ["1 陈麻婆豆腐", "2 钟水饺", "3 春熙路", "4 宽窄巷子·三大炮", "5 建设路·叶婆婆蛋烘糕", "6 玉林路·小龙坎火锅", "7 香香巷·肥肠粉", "8 武侯祠大街·钵钵鸡", "9 东郊记忆·冒椒火辣", "10 人民公园·鹤鸣茶社", "11 锦里古街·冰粉", "12 双流老妈兔头"]
      },
      {
        "title": "图例",
        "position": "右下角",
        "count": 5,
        "items": ["红点", "绿色建筑", "绿树", "蓝线", "黄色双线"],
        "labels": ["美食地点", "地标景点", "公园绿地", "河流湖泊", "主要道路"]
      }
    ],
    "centerpiece": "坐着吃竹子的大熊猫",
    "bottom_right_extras": ["带有东南西北方向的复古罗盘", "带有红辣椒图标的免责声明：'温馨提示：吃辣需谨慎，肠胃要保护~'"]
  }
}`,
    variables: [
      { key: "art style", label: "艺术风格", placeholder: "例如：复古羊皮纸上的水彩墨水手绘插画", required: false, defaultValue: "复古羊皮纸上的水彩墨水手绘插画", maxLength: 80 },
      { key: "city name", label: "城市名称", placeholder: "例如：成都", required: false, defaultValue: "成都", maxLength: 30 },
      { key: "map title", label: "地图标题", placeholder: "例如：吃货暴走地图", required: false, defaultValue: "吃货暴走地图", maxLength: 40 },
      { key: "border decoration", label: "边框装饰", placeholder: "例如：绿叶与红辣椒藤蔓", required: false, defaultValue: "绿叶与红辣椒藤蔓", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 精选提示词 #2：手绘城市美食地图",
    },
  },
  {
    id: "builtin-infographic-stone-stairs-evolution",
    title: "3D 石阶演化信息图",
    category: "infographic",
    tags: ["信息图", "3D", "演化", "石阶", "教育"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image",
    },
    prompt: `{
  "type": "演化时间轴信息图",
  "instruction": "以 REFERENCE_0 作为结构基础，将平面矢量设计转化为高度逼真的 3D 信息图。将平滑的坡道替换为独特的石阶，并将所有生物升级为照片级真实的 3D 模型。",
  "style": {
    "background": "{{background style}}",
    "staircase": "{{staircase material}}",
    "subjects": "{{organism style}}"
  },
  "layout": {
    "main_title": "{{main title}}",
    "sections": [
      {
        "position": "左侧边栏",
        "count": 8,
        "labels": ["L0: 单细胞生命", "L1: 多细胞生物", "L2: 动物界", "L3: 脊索动物", "L4: 上陆革命", "L5: 哺乳纲", "L6: 人科演化", "L7: 智人纪元"]
      },
      {
        "position": "右上角",
        "title": "获得的功能 / 失去的功能",
        "description": "带有加号和减号图标的图例"
      },
      {
        "position": "底部中心",
        "title": "演化关键里程碑",
        "count": 6,
        "description": "包含 6 个展示从猿到人演化剪影图形的时间轴"
      }
    ],
    "centerpiece": {
      "description": "蜿蜒的石阶，共有 25 个编号台阶，展示特定生物。",
      "count": 25,
      "notable_elements": [
        "第 07 阶: 水母",
        "第 09 阶: 菊石",
        "第 10 阶: 三叶虫",
        "第 24 阶: 直立行走的人类",
        "第 25 阶: {{future evolution concept}}"
      ]
    }
  }
}`,
    variables: [
      { key: "background style", label: "背景风格", placeholder: "例如：复古纹理羊皮纸", required: false, defaultValue: "复古纹理羊皮纸", maxLength: 60 },
      { key: "staircase material", label: "石阶材质", placeholder: "例如：逼真的纹理石块", required: false, defaultValue: "逼真的纹理石块", maxLength: 60 },
      { key: "organism style", label: "生物风格", placeholder: "例如：高度精细的照片级真实 3D 渲染", required: false, defaultValue: "高度精细的照片级真实 3D 渲染", maxLength: 80 },
      { key: "main title", label: "主标题", placeholder: "例如：人类演化", required: false, defaultValue: "人类演化", maxLength: 40 },
      { key: "future evolution concept", label: "未来演化概念", placeholder: "例如：带有问号的发光宇宙剪影", required: false, defaultValue: "带有问号的发光宇宙剪影", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "精选提示词 #6：3D 石阶演化信息图，需配合参考图使用 REFERENCE_0",
    },
  },
  {
    id: "builtin-infographic-fashion-outfit-analysis",
    title: "时尚穿搭解析信息图",
    category: "infographic",
    tags: ["时尚", "穿搭", "信息图", "解析", "杂志"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image",
    },
    prompt: `创建一个 {{layout style}}，背景为 {{background color}}。左侧展示一位参考图中全身时尚的年轻女性，正拿着智能手机对着镜子自拍。她留着深棕色长波浪卷发，妆容自然透亮，佩戴金色耳环，展现出奢华休闲的审美风格。她身穿一件超大款灰米色衬衫，内搭黑色短款吊带背心，下穿黑色高腰阔腿裤，脚踩白色厚底运动鞋，背着带有金色五金件的黑色皮革单肩包，并佩戴精致的金色首饰（手表、项链、耳环、戒指）。

右侧以带有细微边框和阴影的圆角矩形卡片形式，展示整理后的穿搭组件。包含以下标注板块：发型 (HAIR)、衬衫 (SHIRT)、内搭 (TOP)、裤子 (PANTS)、包袋 (BAG)、运动鞋 (SNEAKERS) 以及配饰 (ACCESSORIES)。每个板块展示一张与 {{subject}} 相符的简洁独立产品图。配饰包括金色圆环耳环、吊坠项链、金色腕表和戒指。

时尚杂志编辑排版，Pinterest 审美，胶囊衣橱风格，中性色调，奢华极简时尚指南，柔和摄影棚灯光，超简洁构图，高端电商展示，逼真的面料质感，优雅的排版，对称间距，高端生活方式品牌感，4K 画质，高度细节化，照片级真实感。

负面提示词：低质量，模糊，多余的肢体，扭曲的手部，糟糕的解剖结构，杂乱的背景，水印，Logo，重复的物品，凌乱的排版，过多的配饰，生硬的阴影，色彩过饱和，身体被裁剪，文字错误，标签错位，卡通，插画，CGI，比例不真实。`,
    variables: [
      { key: "layout style", label: "版式风格", placeholder: "例如：简洁、极简主义的时尚穿搭解析信息图", required: false, defaultValue: "简洁、极简主义的时尚穿搭解析信息图", maxLength: 80 },
      { key: "background color", label: "背景颜色", placeholder: "例如：柔和的米色", required: false, defaultValue: "柔和的米色", maxLength: 40 },
      { key: "subject", label: "主题", placeholder: "例如：穿搭", required: false, defaultValue: "穿搭", maxLength: 30 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 信息图 #3：时尚穿搭解析信息图",
    },
  },
  {
    id: "builtin-infographic-golf-swing-sequence",
    title: "四格高尔夫挥杆动作序列",
    category: "infographic",
    tags: ["运动", "高尔夫", "四格", "教学", "信息图"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `目标：创作一张逼真的 2x2 教学运动照片拼图，展示一名女性高尔夫球手完成动态挥杆动作的全过程，拍摄视角为极低的地平线角度，背景为阳光明媚的高尔夫球场。

画布：垂直 4:5 比例图像，精确划分为 4 个等大的面板，面板间有细缝，呈两列两行排列。每个面板应呈现出在户外明亮蓝天、稀疏白云、绿色球道草坪及地平线附近树木背景下拍摄的高速动作照片效果。

主体细节：同一位运动型年轻女性出现在所有 4 个面板中，身穿无袖 {{outfit color}} 高尔夫球裙，搭配百褶裙摆、白色高尔夫手套和白色运动鞋。她留着长 {{hair color}} 发，扎成高马尾，随动作剧烈飘动。为保护隐私，她的面部应使用柔和的方形模糊处理。使用带有深色球头的发球木杆。

布局与面板数量要求：包含 4 个带编号的动作面板，每个面板左上角带有白色小字中文标签：1. 「站位准备」展示球手处于击球准备姿势，双脚分开，杆头靠近草地上的球；2. 「上杆顶点」展示上杆顶点，双臂举过头顶，身体呈弧形，裙摆和头发随之摆动；3. 「击球瞬间」展示击球瞬间，球杆扫过球体，泥土和草屑向镜头方向飞溅，杆头带有强烈的动态模糊；4. 「收杆定格」展示收杆动作，球杆挥至身后，头发飞扬，草屑和泥土颗粒悬浮在空中。

视觉风格：超写实运动摄影，电影级高速快门与细腻的动态模糊相结合，极具冲击力的低角度视角使球手显得高大且充满力量，明亮的正午阳光，清晰的阴影，饱和的自然色彩，充满活力的动态捕捉，草地附近具有浅景深效果。`,
    variables: [
      { key: "outfit color", label: "服装颜色", placeholder: "例如：白色", required: false, defaultValue: "白色", maxLength: 20 },
      { key: "hair color", label: "发色", placeholder: "例如：棕色", required: false, defaultValue: "棕色", maxLength: 20 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 信息图 #9：四格高尔夫挥杆动作序列",
    },
  },
  {
    id: "builtin-infographic-tokyo-diorama-map",
    title: "东京夜景立体模型地图",
    category: "infographic",
    tags: ["地图", "3D", "东京", "夜景", "立体模型"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `目标：创建一个高度精细的 3D 微缩立体模型地图，标题为 {{map title}}，将 {{city}} 的密集夜景渲染为微缩城市模型，包含发光的城市灯光、凸起的建筑、道路、铁路线、水道和地标标签。

画布：3:2 横向构图，采用类似博物馆展示台的俯视斜角视角。地图置于深色桌面上，呈现为一个带有斜切边缘的厚矩形项目，底座为深海军蓝黑色，配有细奶油色边框和印刷坐标网格。

主场景：使用数以千计的微小建筑和温暖的窗户灯光、精细的街道网络、铁路走廊、高速公路和深蓝色水面。整体质感应为高级实体地图，而非扁平的数字地图：具有凸起的类地形城市肌理、微型建筑块、雕刻标签和逼真的深度感。

地标与标签：包含 10 个黑色的双语（日文/英文）标签牌：1) 新宿 (Shinjuku)，2) 上野 (Ueno)，3) 浅草 (Asakusa)，4) 东京晴空塔 (Tokyo Skytree)，5) 皇居 (Imperial Palace)，6) 涩谷 (Shibuya)，7) 东京塔 (Tokyo Tower)，8) 银座 (Ginza)，9) 台场 (Odaiba)，10) 东京湾 (Tokyo Bay)。

底部信息栏：沿底边创建一个宽大的印刷图例和档案面板。包含中心标题块，文字为 {{map title}}，副标题为"Landscape Archive Model"，档案代码为 {{archive code}}。右下角添加比例尺（1:25,000）和指北针。

视觉风格：手工建筑模型的电影级微距摄影，超精细，前景清晰，带有轻微的大气雾感，逼真的微缩照明，暖金色与冷蓝色的对比，高级博物馆展品美学，深海军蓝与炭灰色调，搭配奶油色字体。`,
    variables: [
      { key: "map title", label: "地图标题", placeholder: "例如：TOKYO — NOCTURNAL URBAN ARCHIVE", required: false, defaultValue: "TOKYO — NOCTURNAL URBAN ARCHIVE", maxLength: 80 },
      { key: "city", label: "城市", placeholder: "例如：Tokyo", required: false, defaultValue: "Tokyo", maxLength: 30 },
      { key: "archive code", label: "档案编号", placeholder: "例如：TKY-NAM-2024-001", required: false, defaultValue: "TKY-NAM-2024-001", maxLength: 40 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 信息图 #11：东京夜景立体模型地图",
    },
  },

  // ── 海报排版 (poster-typography) ─────────────────────────────────
  {
    id: "builtin-poster-retro-osaka-umeda-travel",
    title: "复古风大阪梅田旅行海报",
    category: "poster-typography",
    tags: ["旅行", "复古", "大阪", "海报", "排版"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `目标：为 {{destination}} 创建一张复古旅行海报风格的信息图，结合简约的天际线插画、大型装饰性排版、等距视角地标地图以及旅行广告文案。

画布：竖版海报，比例约为 2:3，采用暖象牙色纸张背景，配有细双线装饰性金色边框及装饰艺术风格的边角细节。使用简洁的矢量线条艺术、柔和的粉彩色调、细腻的颗粒感、米色阴影，营造出复古日本旅游海报的氛围。

布局：顶部区域为宽矩形日落天际线面板，天空呈现从青色到粉色再到橙色的渐变，配有平面的米色城市剪影。中部区域包含一个巨大的单词 {{large title word}}，采用粗体轮廓块状字母，内部填充微型城市景观。主体区域为梅田的等距视角插画地图，标注有地标及连接引导线。底部区域包含地点/日期文本、大型日文标语、醒目的英文标语、交通信息、铁路线路图例、必看景点列表。

底部文本内容：使用标题"OSAKA, JAPAN | UMEDA 2026"。下方放置日文标语 {{Japanese slogan}}，采用大号粗体黑色字体。在其下方，用非常大的粗体大写字母书写"UMEDA — LET'S GO!"。

风格限制：保持插画简约清晰，使用细黑棕色轮廓、平涂填充、极简阴影，呈现手绘旅行指南的美感。避免照片写实、3D 渲染、过度细节、额外标签、Logo 或水印。`,
    variables: [
      { key: "destination", label: "目的地", placeholder: "例如：日本大阪梅田", required: false, defaultValue: "日本大阪梅田", maxLength: 60 },
      { key: "large title word", label: "大标题单词", placeholder: "例如：UMEDA", required: false, defaultValue: "UMEDA", maxLength: 30 },
      { key: "Japanese slogan", label: "日文标语", placeholder: "例如：そうだ、梅田行こう。", required: false, defaultValue: "そうだ、梅田行こう。", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 信息图 #16：复古风大阪梅田旅行海报",
    },
  },
  {
    id: "builtin-poster-frosted-glass-portfolio",
    title: "磨砂玻璃质感作品集封面",
    category: "poster-typography",
    tags: ["作品集", "磨砂玻璃", "极简", "排版", "产品营销"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `生成一张具有作品集封面质感的视觉作品，并聚焦于特定主题。核心主体不应完全展示，而是压缩在偏离中心轴的主要区域，沉浸在半透明的雾化表面与低饱和度背景场之间。主体的完整轮廓、次要细节及常规描述被压花玻璃颗粒、微小折射位移、乳白色雾化效果和低对比度模糊所吞没，仅在最能体现主题识别的位置留出一个干净、清晰的窄窗。该区域保留真实质感、较高对比度和必要的色彩，而其余部分则转化为暗调质感、柔化的轮廓、破碎的边缘以及被背景吞没的过渡。清晰的窄窗应如同从材质表面精准擦拭出的缝隙，尺寸克制但语义准确，作为观众进入主题的唯一强入口。背景源自主题的空间关系、材质属性、时间指向和情感温度，转化为大面积的低噪色场。整体表面保留可见的颗粒感压花玻璃触感，纹理密度随底层光影变化——暗部更致密，亮部更乳白，边缘带有精细折射和轻微位移。所有图像、物体和文字看起来仿佛被同一块材质压制而成。

主题：{{theme}}
比例：{{ratio}}`,
    variables: [
      { key: "theme", label: "主题", placeholder: "例如：疯狂星期四肯德基", required: true, maxLength: 120 },
      { key: "ratio", label: "比例", placeholder: "例如：9:10", required: false, defaultValue: "9:10", maxLength: 10 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 产品营销 #1：磨砂玻璃质感作品集封面",
    },
  },
  {
    id: "builtin-poster-vintage-texture-print",
    title: "复古质感印刷海报",
    category: "poster-typography",
    tags: ["复古", "印刷", "海报", "排版", "产品营销"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `围绕特定主题内容生成一张竖版印刷海报。首先，将主题转化为一个放大的触感主体样本或物质块，放置在画面的中心或中下部，赋予其清晰可辨的边缘、柔和的体积感、局部的细节高密度以及可触碰的材质变化。主体并非孤立呈现，而是被巨大的标题、边缘文字、硬边棋盘格模块和低对比度的说明性文字所夹杂。标题使用骨架清晰的粗体字，成为顶部、底部或侧边的边缘结构，像墙壁、基座或侧边栏一样参与构图；文字在承载语义之前先构成了结构。让主体的轮廓、附着的碎片、材质边缘或象征性的残片部分覆盖标题、竖排文字和几何色块，形成清晰但克制的层级关系，使图像与排版相互交织而非刻意避让。背景为单一的暖色调、低噪点、可印刷的纸张底色，带有细腻的纹理、纤维、颗粒感和轻微的吸墨感，用于统一写实主体、扁平文字和几何色块。在角落放置一到两个硬边棋盘格模块作为平面节奏的锚点。最终画面呈现复古印刷的钝化效果，文字边缘略微柔和，色块中有油墨沉积，纸张纹理贯穿所有图层且不模糊主体细节，整体呈现出一种精心排版的编辑海报、包装布局与样本说明的混合体。

主题：{{poster theme}}
比例：{{aspect ratio}}`,
    variables: [
      { key: "poster theme", label: "海报主题", placeholder: "例如：Apple 推广海报", required: true, maxLength: 120 },
      { key: "aspect ratio", label: "画面比例", placeholder: "例如：9:10", required: false, defaultValue: "9:10", maxLength: 10 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 产品营销 #2：复古质感印刷海报",
    },
  },
  {
    id: "builtin-poster-classical-mbti-infographic",
    title: "古典人物 MBTI 信息图海报",
    category: "poster-typography",
    tags: ["国风", "MBTI", "古典", "信息图", "海报"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `请生成一张 [高端国风古典人物 MBTI 信息图海报]。

[人物]
人物名称：{{character name}}
[预分析要求]
请基于该人物在古典文学、历史叙事或民间文化中的主流形象，完成并应用以下信息：
人物拼音：使用标准汉语拼音，建议标注声调。
MBTI 类型：选择最符合该人物核心性格的类型。
MBTI 英文标题：使用常见的 MBTI 标题。
中文性格标签：用 8-14 个字概括人物气质。
人物特征提取：身份定位、核心价值观、4-6 个性格关键词、象征性风格元素、代表性道具/武器/坐骑、1-3 个经典故事元素、人物结局或历史评价。
[整体风格]
竖版 3:4 构图，4K 超高清，高端国风人物设定海报。视觉融合：中国水墨、浅色工笔、宣纸纹理、传统纹样与现代高质量信息图布局。背景为温暖的宣纸白，配以淡墨云纹、回纹、窗棂格栅及朱砂印章。整体气质：优雅、庄重、具有收藏价值、文化底蕴深厚、简洁且高端。
[核心视觉：3D 出框效果]
人物主体必须具有强烈的"3D 破框而出 / 跳出画作"的半写实效果。人物上半身或全身位于中央主视觉区，营造清晰的前后景深。衣袖、武器、飘带、发丝、坐骑、云雾或标志性道具可以突破中式边框，营造出 3D 浮雕般的出框感。视觉焦点必须是人物。保持东方古典美学；禁止现代游戏 UI，禁止赛博朋克，禁止西方奇幻盔甲，禁止夸张的动漫脸。
[人物造型]
基于 {{character name}} 的主流形象进行设计：保留最具辨识度的服饰、面部特征、姿态及时代气质。表情需符合性格。动作应具有叙事感，体现人物命运与性格张力。
[布局结构]
海报分为三个区域：1. 顶部标题区：主标题、大字号 MBTI、英文标题、中文性格标签，包裹在传统窗棂中。2. 中部主视觉区：人物占据核心，3D 效果突出，水墨渲染。3. 底部信息区：设计为 4 个整齐的模块，分别用于介绍、性格特征、经典语录及人物档案。
[色彩]
主色调：宣纸白、淡墨灰、朱砂红、深金。辅色根据人物气质进行调整。色彩克制且高端。`,
    variables: [
      { key: "character name", label: "人物名称", placeholder: "例如：潘金莲", required: false, defaultValue: "潘金莲", maxLength: 30 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 信息图 #7：古典人物 MBTI 信息图海报",
    },
  },

  // ── 摄影写实 (photoreal) ─────────────────────────────────────────
  {
    id: "builtin-photoreal-moody-chiaroscuro-portrait",
    title: "Moody Chiaroscuro 影棚肖像",
    category: "photoreal",
    tags: ["肖像", "棚拍", "伦勃朗", "明暗对照", "写实"],
    mode: "image-edit",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "single-image",
    },
    prompt: `使用参考图中的同款面部，生成一张 {{subject}} 的特写棚拍头像。取景范围为肩部以上。光影：{{lighting style}} —— 主光从左上方照射，在他的右颧骨处形成完美的三角光，面部其余部分逐渐融入浓郁的阴影中。仅一只眼睛捕捉到完整的眼神光，另一只眼睛隐没在阴影中，营造出神秘感。背后的细微轮廓光将头发与背景区分开。{{clothing}}。背景：纯黑色无缝背景，与阴影侧完美融合。表情：沉思、脆弱而有力。充满情绪张力的杰作。9:13 竖屏格式。超写实摄影，8K 分辨率，无文字覆盖，电影级调色。`,
    variables: [
      { key: "subject", label: "主题", placeholder: "例如：下颌线分明、五官立体、深色凌乱短发、眼神深邃且充满张力的男性", required: false, defaultValue: "下颌线分明、五官立体、深色凌乱短发、眼神深邃且充满张力的男性", maxLength: 200 },
      { key: "lighting style", label: "布光风格", placeholder: "例如：伦勃朗/明暗对照法布光", required: false, defaultValue: "伦勃朗/明暗对照法布光", maxLength: 60 },
      { key: "clothing", label: "服装", placeholder: "例如：黑色高领毛衣，深色且富有质感", required: false, defaultValue: "黑色高领毛衣，深色且富有质感", maxLength: 80 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 个人资料 #1：Moody Chiaroscuro Studio Portrait",
    },
  },
  {
    id: "builtin-photoreal-window-portrait-privacy",
    title: "带隐私遮挡的舒适窗边肖像",
    category: "photoreal",
    tags: ["肖像", "窗边", "隐私遮挡", "写实", "生活方式"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `创作一张写实、柔光下的室内生活方式肖像，画面中 {{subject}} 坐在左侧大窗旁的木桌前，单手拿着一个小巧的米色陶瓷杯靠近嘴边。她留着 {{hair color and style}}，身穿 {{outfit}}。在脸部左侧添加隐约可见的黑色眼镜。面部必须完全被一个位于中央的哑光暖灰褐色不透明方形隐私遮挡块覆盖，遮挡范围从额头延伸至嘴部下方，边缘清晰，不显示任何面部特征。场景设定为温馨的家居室内，温暖的晨光透过窗户洒入，开衫和杯子上投下柔和的阴影，窗外是模糊的绿植，窗台附近有一株小植物，墙壁为中性米色，右侧边缘可见木椅靠背。使用浅景深，自然窗光，写实摄影风格，4:5 竖构图，营造宁静亲密的氛围，无文字，无水印，无其他人物。`,
    variables: [
      { key: "subject", label: "主题", placeholder: "例如：一位年轻女性", required: false, defaultValue: "一位年轻女性", maxLength: 60 },
      { key: "hair color and style", label: "发色与发型", placeholder: "例如：深棕色头发，扎成松散的低马尾，有几缕碎发", required: false, defaultValue: "深棕色头发，扎成松散的低马尾，有几缕碎发", maxLength: 100 },
      { key: "outfit", label: "服装", placeholder: "例如：浅灰色 T 恤，外搭一件超大款米色针织开衫，长袖", required: false, defaultValue: "浅灰色 T 恤，外搭一件超大款米色针织开衫，长袖", maxLength: 100 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 个人资料 #2：带隐私遮挡的舒适窗边肖像",
    },
  },
  {
    id: "builtin-photoreal-dramatic-male-fashion",
    title: "戏剧性明暗对照法男性时尚肖像",
    category: "photoreal",
    tags: ["肖像", "时尚", "黑白", "明暗对照", "男性"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `室内摄影棚环境，{{background}}，无环境光。

{{subject description}}，中短渐变发型，下颌线轮廓分明，高颧骨。

光影：{{lighting style}}，戏剧性明暗对照法，光线仅照射在眼睛和颧骨上，面部其余部分处于深影中。
相机：85mm 定焦人像镜头，f/1.8，浅景深，虹膜焦点清晰；质感：受光区域可见皮肤毛孔，哑光肤色，单色黑白高对比度调色。

时尚肖像摄影，高对比度黑白艺术摄影作品。

无柔和补光，瞳孔无眼神光，无发丝光，无背景细节，无额外主体，无水印，无数字噪点，无色彩信息，无灰度平滑处理。`,
    variables: [
      { key: "background", label: "背景", placeholder: "例如：纯黑背景", required: false, defaultValue: "纯黑背景", maxLength: 60 },
      { key: "subject description", label: "人物描述", placeholder: "例如：33 岁男性面部", required: false, defaultValue: "33 岁男性面部", maxLength: 80 },
      { key: "lighting style", label: "布光风格", placeholder: "例如：单束高强度左上方聚光灯", required: false, defaultValue: "单束高强度左上方聚光灯", maxLength: 80 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 个人资料 #5：戏剧性明暗对照法男性时尚肖像",
    },
  },
  {
    id: "builtin-photoreal-cinematic-bw-portrait",
    title: "电影感黑白肖像",
    category: "photoreal",
    tags: ["肖像", "黑白", "电影感", "雨窗", "社交媒体"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `电影感黑白肖像，主角是一位美丽的 {{nationality}} 女性，年龄 {{age}} 岁，身材优雅精致。她站在宅邸的落地雨窗旁，身穿一件 {{clothing}}。忧郁的氛围光，玻璃上的雨滴模糊了背景，充满叙事感，专业级调色。`,
    variables: [
      { key: "nationality", label: "国籍", placeholder: "例如：日本", required: false, defaultValue: "日本", maxLength: 30 },
      { key: "age", label: "年龄", placeholder: "例如：20", required: false, defaultValue: "20", maxLength: 10 },
      { key: "clothing", label: "服装", placeholder: "例如：剪裁合身、略微潮湿的白色衬衫", required: false, defaultValue: "剪裁合身、略微潮湿的白色衬衫", maxLength: 80 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 社交媒体 #8：电影感黑白肖像",
    },
  },
  {
    id: "builtin-photoreal-motion-blur-street",
    title: "电影感动态模糊街头人像",
    category: "photoreal",
    tags: ["街头", "动态模糊", "纪实", "人像", "社交媒体"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `电影感纪实街头人像，超写实风格。一位 {{subject}} 身着 {{outfit}}，在熙熙攘攘的城市人行道中央静止站立，与镜头进行直接且深情的对视。在她周围，行人在动态中模糊掠过，背景中交通信号灯和高耸的城市建筑呈现出冷色调。使用 {{lens}} 镜头，f/1.8 光圈拍摄，营造出浅景深效果，人物面部焦点清晰锐利，肤色自然，柔和的阴天自然光，8k 高细节纪实摄影。`,
    variables: [
      { key: "subject", label: "主题", placeholder: "例如：年轻女性", required: false, defaultValue: "年轻女性", maxLength: 60 },
      { key: "outfit", label: "服装", placeholder: "例如：亮蓝色羽绒服", required: false, defaultValue: "亮蓝色羽绒服", maxLength: 80 },
      { key: "lens", label: "镜头", placeholder: "例如：85mm", required: false, defaultValue: "85mm", maxLength: 20 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 社交媒体 #17：电影感动态模糊街头人像",
    },
  },
  {
    id: "builtin-photoreal-obscured-portrait-studio",
    title: "写实风格遮挡人像摄影",
    category: "photoreal",
    tags: ["肖像", "遮挡", "影棚", "写实", "极简"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `创作一张写实风格的摄影人像，主体为 {{subject}}，半身像，居中构图，背景为纯色的 {{background color}}。主体正面朝向镜头，略带四分之三侧转，露出耳朵和剃光的头顶，身穿 {{outerwear}}，内搭 {{layers}}。用一个巨大的、完美的正方形不透明遮挡块覆盖整个面部，遮挡块居中于头部，从发际线下方延伸至下巴下方；遮挡块呈现平滑的肤色渐变，从左侧的暖棕褐色过渡到右侧的深棕色，完全遮盖面部特征。采用柔和均匀的影棚布光，呈现自然的织物纹理，浅景深人像构图，高写实度，简洁的极简主义构图，无文字，无 Logo，无水印。`,
    variables: [
      { key: "subject", label: "主题", placeholder: "例如：一位秃顶的中年男子", required: false, defaultValue: "一位秃顶的中年男子", maxLength: 60 },
      { key: "background color", label: "背景颜色", placeholder: "例如：柔和芥末黄", required: false, defaultValue: "柔和芥末黄", maxLength: 40 },
      { key: "outerwear", label: "外套", placeholder: "例如：米色帆布工装夹克", required: false, defaultValue: "米色帆布工装夹克", maxLength: 60 },
      { key: "layers", label: "内搭", placeholder: "例如：黑色圆领衫和焦橙色罗纹高领毛衣", required: false, defaultValue: "黑色圆领衫和焦橙色罗纹高领毛衣", maxLength: 80 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 个人资料 #17：写实风格遮挡人像摄影",
    },
  },
  {
    id: "builtin-photoreal-kitchen-cooking-candid",
    title: "厨房烘焙抓拍照片",
    category: "photoreal",
    tags: ["厨房", "抓拍", "生活方式", "写实", "社交媒体"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `创作一张写实的智能手机风格抓拍照片，展示一位成年女性在紧凑的现代公寓厨房中烹饪的场景，视角为从背后拍摄的腰部至头部高度。她留着 {{hair color}} 的头发，扎成凌乱的高丸子头，为了保护隐私，她的面部被柔和的矩形模糊处理。她身穿一件修身的 {{top color}} 短袖罗纹露脐 T 恤，以及宽松的高腰 {{pants color}} 阔腿休闲裤，裤子带有细微的竖向纹理。她站在白色台面旁，靠近不锈钢水槽，一只手放在装有面粉或面团原料的金属搅拌碗附近。台面上需清晰呈现 4 件主要物品：一个金属搅拌碗、一袋韩式包装的白面粉、一部平放的黑色智能手机，以及一个透明量杯。厨房配有白色橱柜、白色瓷砖防溅墙、抽油烟机，以及两个安装在墙上的黑色调料架，架上摆放着许多小罐子和瓶子。左侧展示一扇带有深色边框的大型磨砂玻璃窗，窗下有一个白色垃圾桶。采用温暖的室内光线，呈现自然阴影，搭配浅色木地板，营造出随意且充满生活气息的氛围。构图为 4:5 竖版，细节写实，无影棚灯光，无水印，无额外文字。`,
    variables: [
      { key: "hair color", label: "发色", placeholder: "例如：深棕色", required: false, defaultValue: "深棕色", maxLength: 30 },
      { key: "top color", label: "上衣颜色", placeholder: "例如：白色", required: false, defaultValue: "白色", maxLength: 20 },
      { key: "pants color", label: "裤子颜色", placeholder: "例如：白色", required: false, defaultValue: "白色", maxLength: 20 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 社交媒体 #10：厨房烘焙抓拍照片",
    },
  },

  // ── 插画艺术 (illustration-art) ──────────────────────────────────
  {
    id: "builtin-illustration-anime-martial-arts-duel",
    title: "动漫武术对决",
    category: "illustration-art",
    tags: ["动漫", "武术", "对决", "插画", "动作"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `一幅极具动态感的动漫插画，描绘了两名少女在传统木质道场内进行激烈武术对决的场景。在前景中，一名留着 {{character 1 hair}} 的少女摆出强有力的低位武术架势，正奋力挥拳。她身穿 {{character 1 outfit}}，强烈的红色能量斩击环绕着她挥动的四肢。在右侧半空中，一名留着 {{character 2 hair}} 的少女优雅地跃起，自信地微笑着，身穿 {{character 2 outfit}}，伴随着扫过的蓝色水流状能量轨迹。背景是质朴的木质寺庙内部，上方悬挂着一块写有"{{sign text}}"的醒目招牌。场景充满了爆发性的动作感，飞扬的尘土、破碎的木质地板、发光的彩色粒子特效，以及将角色与精细背景完美区分开来的戏剧性低角度光影。`,
    variables: [
      { key: "character 1 hair", label: "角色 1 发型", placeholder: "例如：黑色高丸子头配红色丝带", required: false, defaultValue: "黑色高丸子头配红色丝带", maxLength: 60 },
      { key: "character 1 outfit", label: "角色 1 服装", placeholder: "例如：带有红色流苏的白色中式上衣和红色宽松长裤", required: false, defaultValue: "带有红色流苏的白色中式上衣和红色宽松长裤", maxLength: 100 },
      { key: "character 2 hair", label: "角色 2 发型", placeholder: "例如：浅紫色双丸子头", required: false, defaultValue: "浅紫色双丸子头", maxLength: 40 },
      { key: "character 2 outfit", label: "角色 2 服装", placeholder: "例如：带有金色刺绣的深绿色连衣裙和黑色紧身裤", required: false, defaultValue: "带有金色刺绣的深绿色连衣裙和黑色紧身裤", maxLength: 100 },
      { key: "sign text", label: "招牌文字", placeholder: "例如：武術会", required: false, defaultValue: "武術会", maxLength: 20 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 精选提示词 #5：动漫武术对决",
    },
  },
  {
    id: "builtin-illustration-neon-anime-street",
    title: "霓虹动漫街头风肖像",
    category: "illustration-art",
    tags: ["动漫", "霓虹", "街头", "肖像", "赛博朋克"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `创作一张电影级动漫风格的夜间街头肖像，主角为一名身处霓虹闪烁的日本城市街区的年轻男性城市角色。主体位于中景（腰部至头部），略微偏右，身体前倾，展现出自信的街头风姿态，一只手插在夹克口袋里，另一只手向观众做出手枪姿势。为他设计凌乱的层次感 {{hair color}} 发型，发丝细节丰富，佩戴明显的耳钉，面部被一个柔和肤色渐变的纯色方形模糊/马赛克块刻意遮挡。让他身穿全黑叠穿服装：一件带有拉链、绑带、按扣、袖标和光泽褶皱的超大号高领机能夹克；内搭黑色连帽衫；一件深色印花 T 恤；以及多条银色项链。背景是雨后熙熙攘攘、类似东京的夜生活街道，地面湿润且带有倒影，人行道旁设有金属护栏，背景中有模糊的行人、店面、路灯以及许多带有模糊日式文字的垂直发光招牌，颜色涵盖青色、粉色、橙色、黄色和白色。采用浅景深效果，背景虚化，角色边缘带有强烈的霓虹轮廓光，呈现高对比度的赛璐珞动漫渲染效果，线条清晰，高光丰富，色调为忧郁的赛博朋克风格。横向 16:9 构图，无可见品牌名称，无水印，确保面部遮挡块保持完美的正方形，并居中覆盖在面部特征上。`,
    variables: [
      { key: "hair color", label: "发色", placeholder: "例如：深棕色", required: false, defaultValue: "深棕色", maxLength: 30 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 个人资料 #10：霓虹动漫街头风肖像",
    },
  },
  {
    id: "builtin-illustration-ink-wash-fashion-portrait",
    title: "动漫风格水墨时尚肖像",
    category: "illustration-art",
    tags: ["动漫", "水墨", "时尚", "肖像", "遮挡"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `创作一张动态的正方形动漫水墨插画，主角是一位时尚的中性风年轻男性，{{character style}}，以半身像形式呈现，背景为干净的白色。他留着凌乱的 {{hair color}}，戴着多个耳环、垂坠链条耳饰、叠戴项链、戒指、手链，指甲涂成蓝色，并配有华丽的护身符式饰品。他的面部被一个位于中心的不透明方形遮挡块刻意遮住，遮挡块带有从灰色到暖灰褐色的柔和垂直渐变，遮盖了大部分面部特征，但保留了头发、耳朵、颈部和衣物可见。让他摆出自信的三分之四侧身姿势，身体微微后倾，一只手向观众伸出，运用戏剧性的透视缩短法，仿佛在招手或施展法术。让他身穿宽松的层叠和服外套：白色外袍配黑色滚边，内搭黑色服饰，点缀蓝色装饰、绑带、绳索、链条、金属挂饰、珠子和小型骷髅状装饰。采用高细节的日本漫画概念艺术风格，运用富有表现力的笔触、飞溅的水墨、粗犷的排线、流动的衣褶和充满活力的动感线条。色调以黑、白、米色和钴蓝色为主，人物和背景上散布着黑色与蓝色的墨迹。在他周围添加三个清晰可见的图形书法/涂鸦元素：左侧是一个巨大的黑色汉字状符号，右上角是一个带有小标记的蓝色手绘皇冠，左下角附近是一个蓝色的小矩形印章。保持构图的戏剧性、混乱感、时尚感和高细节度，拒绝写实风格，不要出现额外角色，也不要包含可辨识的英文字符。`,
    variables: [
      { key: "character style", label: "角色风格", placeholder: "例如：叛逆现代奇幻街头风剑士", required: false, defaultValue: "叛逆现代奇幻街头风剑士", maxLength: 60 },
      { key: "hair color", label: "发色", placeholder: "例如：黑色短发，带有细微的棕色挑染", required: false, defaultValue: "黑色短发，带有细微的棕色挑染", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 个人资料 #3：动漫风格水墨时尚肖像（含遮挡效果）",
    },
  },
  {
    id: "builtin-illustration-crayon-portrait",
    title: "蜡笔风格插画肖像",
    category: "illustration-art",
    tags: ["蜡笔", "插画", "肖像", "童趣", "涂鸦"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `蜡笔风格的插画肖像，描绘了 {{subject}}，他们正笑着趴在木质窗台上。大一点的孩子留着深色头发，戴着蜜蜂触角，背着黑黄相间的条纹翅膀；年幼的幼儿穿着全套蜜蜂连帽衫。周围的涂鸦包括一个戴着太阳镜的酷炫太阳、一只说着"Bzzz！"的卡通飞蜂、一颗粉色爱心、笑脸表情符号、彩色花朵、星星，以及写着"HA HA!"和"LOL!"的文字。整体呈现出童趣十足的蜡笔质感，白色背景，明亮且俏皮。`,
    variables: [
      { key: "subject", label: "主题", placeholder: "例如：两个穿着大黄蜂服装的孩子", required: false, defaultValue: "两个穿着大黄蜂服装的孩子", maxLength: 80 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 个人资料 #15：蜡笔风格插画肖像",
    },
  },
  {
    id: "builtin-illustration-red-pink-kaleidoscope",
    title: "红粉色分形万花筒",
    category: "illustration-art",
    tags: ["抽象", "万花筒", "分形", "几何", "社交媒体"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1024",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `创作一件方形抽象万花筒几何艺术品，严格采用 {{primary color}} 和 {{secondary color}} 的双色调配色。构图在垂直和水平轴上保持完美对称，并具有额外的对角镜像感，填满整个画布边缘。仅使用锐利的扁平矢量风格三角形多边形，无渐变、无轮廓、无阴影且无纹理。图像由嵌套三角形和递归分形三角形簇构成：1 个由许多微小红粉三角形组成的中心菱形奖章，4 个从奖章向顶部、底部、左侧和右侧延伸的尖锐三角形尖塔，4 个包含密集微型三角形马赛克的巨大镜像角部玫瑰花结构，4 条从中心区域向角落延伸的长对角分形带，以及 8 条围绕中心辐射的巨大粉色星状多边形臂。整体印象应类似于折纸曼陀罗、晶体镶嵌或谢尔宾斯基三角形万花筒，交替的红粉三角形切面形成大胆的对称抽象图案。保持设计清晰、高对比度、扁平化、数学精确且具有装饰性，不含文字、边框、物体或可识别的图形。`,
    variables: [
      { key: "primary color", label: "主色", placeholder: "例如：鲜艳深红色", required: false, defaultValue: "鲜艳深红色", maxLength: 30 },
      { key: "secondary color", label: "辅色", placeholder: "例如：柔和泡泡糖粉色", required: false, defaultValue: "柔和泡泡糖粉色", maxLength: 30 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 社交媒体 #4：红粉色分形万花筒",
    },
  },

  // ── 人物角色 (character) ─────────────────────────────────────────
  {
    id: "builtin-character-space-android-female",
    title: "太空船上的女性仿生人",
    category: "character",
    tags: ["科幻", "仿生人", "太空", "角色", "肖像"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `创作一张电影级的竖版科幻肖像，主体为 {{character description}}，右侧侧面视角，半身像，面向左侧深空。她拥有长而飘逸的 {{hair color}} 秀发，正被微风轻轻向后吹拂；可见的耳朵带有精致的机械细节，身着光泽感十足的白色人形赛博装甲，配有黑色关节、圆形肩部机械结构、精细的面板接缝、微小的螺丝以及反光的金属表面。在她的面部中心放置一个巨大的扁平不透明方形遮挡块，颜色为柔和的暖灰色，遮住面部特征，同时保留头发、耳朵、颈部和身体可见。她身后是一艘巨大的未来感太空船甲板或空间站，沿左下角对角线延伸，带有分层的金属面板、蓝白与琥珀色的发光灯带，最左侧有一座高耸的塔状结构。背景中，一颗巨大的发光 {{planet color}} 行星占据了画面的上半部分，带有大气辉光、云层纹理和明亮的边缘光，周围环绕着密集的星场。采用戏剧性的电影级布光，行星提供强烈的背光，辅以冷蓝绿色的高光，高对比度的阴影，超精细的硬表面科幻设计，写实的动漫风格渲染，浅景深，以及精致的概念艺术质感。构图应为 4:5 竖版，仿生人占据右半部分，太空船和行星在左侧营造出深度感；无文字，无水印。`,
    variables: [
      { key: "character description", label: "角色描述", placeholder: "例如：一位在太空船上的女性仿生人", required: false, defaultValue: "一位在太空船上的女性仿生人", maxLength: 80 },
      { key: "hair color", label: "发色", placeholder: "例如：银白色", required: false, defaultValue: "银白色", maxLength: 20 },
      { key: "planet color", label: "行星颜色", placeholder: "例如：绿色", required: false, defaultValue: "绿色", maxLength: 20 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 个人资料 #4：太空船上的女性仿生人",
    },
  },
  {
    id: "builtin-character-mystical-fox-spirit",
    title: "神秘狐仙神像肖像",
    category: "character",
    tags: ["狐仙", "神社", "日本", "奇幻", "角色"],
    mode: "text-to-image",
    recommended: {
      model: "gpt-image-2",
      size: "1024x1536",
      quality: "high",
      outputFormat: "png",
      referenceMode: "none",
    },
    prompt: `主题：{{subject}}

人物/表情：黑发年轻女性，自然的日本面部特征，精致的刘海和优雅的发髻，白狐耳，半透明的白皙皮肤，细长而迷人的双眼，柔和且引人注目的凝视，优雅的表情带着淡淡的微笑，神秘的眼眸中闪烁着虹彩折射光，光芒自然地从下眼睑溢出至眼角，自然且精致的日系妆容。

服装/姿势：{{clothing}}，领口微敞，优雅中透出一丝含蓄的魅力，自然丰满的胸部，姿态柔美，指尖轻触嘴唇，一只白狐灵兽栖息在肩头，脚边放着一个狐狸面具。

背景/光影：{{background}}，蓝天，朱红色的神社建筑和灯笼，柔和的春日自然光，飘落的花瓣，白狐周围环绕着淡粉色和虹彩光点，背景在保持神社氛围的同时进行柔和虚化。

构图/镜头：竖构图，以半身像为中心，近正面视角，视觉引导聚焦于面部和眼睛，白狐位于左侧，布局平衡，85mm 人像镜头，浅景深，高清锐利的面部细节，自然的背景虚化，非常适合社交媒体的震撼大片。

质感/风格：融合了写实摄影与奇幻元素的日本奇幻肖像，高清，4K 画质，展现自然毛孔、纹理和唇部细节的摄影级皮肤，鼻梁和眼部的阴影，高品质成品，减少 CG 感，柔软细腻的白狐毛发，虹彩眼光表现为瞳孔折射而非装饰性图案，受控的灯光效果将注意力聚焦于面部、眼睛和白狐，营造出可爱、神秘且优雅迷人的氛围。

负面提示：低质量，不自然的面部、眼睛或手部，多指或缺指，面部扭曲，眼睛过大，强烈的 CG 感，动漫风格，不自然的皮肤修饰，过度发光，背景杂乱，和服破损，动物重复，文字，Logo，水印。`,
    variables: [
      { key: "subject", label: "主题", placeholder: "例如：身披白狐、置身于春日神社的日本狐仙肖像", required: false, defaultValue: "身披白狐、置身于春日神社的日本狐仙肖像", maxLength: 100 },
      { key: "clothing", label: "服装", placeholder: "例如：以白色和金色为主调的华丽日式服装，带有精致金线刺绣的和服", required: false, defaultValue: "以白色和金色为主调的华丽日式服装，带有精致金线刺绣的和服", maxLength: 120 },
      { key: "background", label: "背景", placeholder: "例如：樱花盛开的明亮日间神社", required: false, defaultValue: "樱花盛开的明亮日间神社", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      referenceUrl: "https://github.com/freestylefly/awesome-gpt-image-2",
      note: "参考 个人资料 #7：神秘狐仙神像肖像",
    },
  },
];
