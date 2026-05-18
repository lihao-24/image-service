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
  }
];
