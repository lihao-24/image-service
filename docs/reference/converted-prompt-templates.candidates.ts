import type { BuiltinPromptTemplate } from "@/lib/prompt-templates";

export const CONVERTED_PROMPT_TEMPLATE_CANDIDATES: BuiltinPromptTemplate[] = [
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
      { key: "background color", label: "background color", placeholder: "例如：柔和的紫蓝色渐变", required: false, defaultValue: "柔和的紫蓝色渐变", maxLength: 80 },
      { key: "product name", label: "product name", placeholder: "例如：Meta Quest 3", required: false, defaultValue: "Meta Quest 3", maxLength: 60 },
      { key: "main catchphrase", label: "main catchphrase", placeholder: "例如：以全新的结构，重塑全新的现实。", required: false, defaultValue: "以全新的结构，重塑全新的现实。", maxLength: 120 },
      { key: "bottom headline", label: "bottom headline", placeholder: "例如：体验，源于结构的进化。", required: false, defaultValue: "体验，源于结构的进化。", maxLength: 80 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "精选提示词 #1：VR 头显爆炸视图海报，原模板含 Meta 品牌名已泛化",
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
      { key: "perfume", label: "perfume", placeholder: "例如：Givenchy L'Interdit", required: false, defaultValue: "Givenchy L'Interdit", maxLength: 80 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "电商主图 #3：奢华香水瓶产品摄影",
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
      "host_info": "头像，名称 '{{host name}}'，副标题 '55.6万本场点赞'，红色 '关注' 按钮",
      "rank_badge": "带有 '全站第1名' 的金币图标",
      "viewer_stats": "3 个顶部观众头像，显示 '12.3w'、'8.6w'、'5.7w'，总计 '68.7万'，'X' 关闭按钮",
      "right_links": "'更多直播 >'，'礼物展馆 0/24'（带有蓝色 '经典' 标签）"
    },
    "mid_left_gifts": {
      "count": 2,
      "items": [
        "头像 '科技爱好者'，'送小心心'，爱心图标 x 1314",
        "头像 '星辰大海'，'送火箭'，火箭图标 x 666"
      ]
    },
    "bottom_left_chat": {
      "system_message": "37 级勋章 '宇宙漫游者 加入了直播间'",
      "message_count": 7,
      "messages": [
        "小火箭: 主播好！未来可期！🚀",
        "future: 新品什么时候出？",
        "星空梦想家: 今年有什么新计划吗？",
        "AI探索者: 技术进展如何？",
        "帅气的网友: 主播好！",
        "Mars: 第一次来你的直播，超激动！",
        "用户123: 讲讲 AI 吧，会取代人类吗？"
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
      "icons": ["笑脸", "三个点", "购物车", "礼物盒", "分享"]
    }
  }
}`,
    variables: [
      { key: "host name", label: "host name", placeholder: "例如：科技达人", required: false, defaultValue: "科技达人", maxLength: 40 },
      { key: "left background logo", label: "left background logo", placeholder: "例如：背景品牌", required: false, defaultValue: "背景品牌", maxLength: 40 },
      { key: "right background logo", label: "right background logo", placeholder: "例如：品牌 Logo", required: false, defaultValue: "品牌 Logo", maxLength: 40 },
      { key: "product name", label: "product name", placeholder: "例如：旗舰电动皮卡", required: false, defaultValue: "旗舰电动皮卡", maxLength: 60 },
      { key: "product price", label: "product price", placeholder: "例如：¥ 1,618,000", required: false, defaultValue: "¥ 1,618,000", maxLength: 30 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "精选提示词 #4：电商直播 UI 样机，已将 Elon Musk/SPACEX/Tesla 等真实品牌名泛化",
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
      { key: "headline text", label: "headline text", placeholder: "例如：研究论文图示", required: false, defaultValue: "研究论文图示", maxLength: 60 },
      { key: "section title", label: "section title", placeholder: "例如：研究论文图示网格", required: false, defaultValue: "研究论文图示网格", maxLength: 60 },
      { key: "project name", label: "project name", placeholder: "例如：GPT-IMAGE-2-SKILL", required: false, defaultValue: "GPT-IMAGE-2-SKILL", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "信息图 #1：深色研究图示库 UI",
    },
  },
  {
    id: "builtin-ui-sakura-travel-title-card",
    title: "Sakura Travel Cinema 标题卡",
    category: "ui-interface",
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
      { key: "section number", label: "section number", placeholder: "例如：4.", required: false, defaultValue: "4.", maxLength: 10 },
      { key: "headline text", label: "headline text", placeholder: "例如：旅行・季節・青春シネマ", required: false, defaultValue: "旅行・季節・青春シネマ", maxLength: 60 },
      { key: "subtitle text", label: "subtitle text", placeholder: "例如：情緒・旅感・短編向け", required: false, defaultValue: "情緒・旅感・短編向け", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "YouTube #10：Sakura Travel Cinema 标题卡",
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
      { key: "headline text", label: "headline text", placeholder: "例如：ASMR・配信・YouTuber", required: false, defaultValue: "ASMR・配信・YouTuber", maxLength: 60 },
      { key: "subtitle text", label: "subtitle text", placeholder: "例如：ささやき・会話・配信向け", required: false, defaultValue: "ささやき・会話・配信向け", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "YouTube #12：ASMR YouTuber 缩略图",
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
      { key: "campaign topic", label: "campaign topic", placeholder: "例如：CM・広告・商品訴求", required: false, defaultValue: "CM・広告・商品訴求", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "YouTube #11：日式霓虹营销缩略图",
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
      { key: "art style", label: "art style", placeholder: "例如：复古羊皮纸上的水彩墨水手绘插画", required: false, defaultValue: "复古羊皮纸上的水彩墨水手绘插画", maxLength: 80 },
      { key: "city name", label: "city name", placeholder: "例如：成都", required: false, defaultValue: "成都", maxLength: 30 },
      { key: "map title", label: "map title", placeholder: "例如：吃货暴走地图", required: false, defaultValue: "吃货暴走地图", maxLength: 40 },
      { key: "border decoration", label: "border decoration", placeholder: "例如：绿叶与红辣椒藤蔓", required: false, defaultValue: "绿叶与红辣椒藤蔓", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "精选提示词 #2：手绘城市美食地图",
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
      { key: "background style", label: "background style", placeholder: "例如：复古纹理羊皮纸", required: false, defaultValue: "复古纹理羊皮纸", maxLength: 60 },
      { key: "staircase material", label: "staircase material", placeholder: "例如：逼真的纹理石块", required: false, defaultValue: "逼真的纹理石块", maxLength: 60 },
      { key: "organism style", label: "organism style", placeholder: "例如：高度精细的照片级真实 3D 渲染", required: false, defaultValue: "高度精细的照片级真实 3D 渲染", maxLength: 80 },
      { key: "main title", label: "main title", placeholder: "例如：人类演化", required: false, defaultValue: "人类演化", maxLength: 40 },
      { key: "future evolution concept", label: "future evolution concept", placeholder: "例如：带有问号的发光宇宙剪影", required: false, defaultValue: "带有问号的发光宇宙剪影", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
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
      { key: "layout style", label: "layout style", placeholder: "例如：简洁、极简主义的时尚穿搭解析信息图", required: false, defaultValue: "简洁、极简主义的时尚穿搭解析信息图", maxLength: 80 },
      { key: "background color", label: "background color", placeholder: "例如：柔和的米色", required: false, defaultValue: "柔和的米色", maxLength: 40 },
      { key: "subject", label: "subject", placeholder: "例如：穿搭", required: false, defaultValue: "穿搭", maxLength: 30 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "信息图 #3：时尚穿搭解析信息图",
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
      { key: "outfit color", label: "outfit color", placeholder: "例如：白色", required: false, defaultValue: "白色", maxLength: 20 },
      { key: "hair color", label: "hair color", placeholder: "例如：棕色", required: false, defaultValue: "棕色", maxLength: 20 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "信息图 #9：四格高尔夫挥杆动作序列",
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
      { key: "map title", label: "map title", placeholder: "例如：TOKYO — NOCTURNAL URBAN ARCHIVE", required: false, defaultValue: "TOKYO — NOCTURNAL URBAN ARCHIVE", maxLength: 80 },
      { key: "city", label: "city", placeholder: "例如：Tokyo", required: false, defaultValue: "Tokyo", maxLength: 30 },
      { key: "archive code", label: "archive code", placeholder: "例如：TKY-NAM-2024-001", required: false, defaultValue: "TKY-NAM-2024-001", maxLength: 40 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "信息图 #11：东京夜景立体模型地图",
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
      { key: "destination", label: "destination", placeholder: "例如：日本大阪梅田", required: false, defaultValue: "日本大阪梅田", maxLength: 60 },
      { key: "large title word", label: "large title word", placeholder: "例如：UMEDA", required: false, defaultValue: "UMEDA", maxLength: 30 },
      { key: "Japanese slogan", label: "Japanese slogan", placeholder: "例如：そうだ、梅田行こう。", required: false, defaultValue: "そうだ、梅田行こう。", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "信息图 #16：复古风大阪梅田旅行海报",
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
      { key: "theme", label: "theme", placeholder: "例如：疯狂星期四肯德基", required: true, maxLength: 120 },
      { key: "ratio", label: "ratio", placeholder: "例如：9:10", required: false, defaultValue: "9:10", maxLength: 10 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "产品营销 #1：磨砂玻璃质感作品集封面",
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
      { key: "poster theme", label: "poster theme", placeholder: "例如：Apple 推广海报", required: true, maxLength: 120 },
      { key: "aspect ratio", label: "aspect ratio", placeholder: "例如：9:10", required: false, defaultValue: "9:10", maxLength: 10 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "产品营销 #2：复古质感印刷海报",
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
      { key: "character name", label: "character name", placeholder: "例如：潘金莲", required: false, defaultValue: "潘金莲", maxLength: 30 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "信息图 #7：古典人物 MBTI 信息图海报",
    },
  },

  // ── 摄影写实 (photoreal) ─────────────────────────────────────────
  {
    id: "builtin-photoreal-moody-chiaroscuro-portrait",
    title: "Moody Chiaroscuro Studio Portrait",
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
      { key: "subject", label: "subject", placeholder: "例如：下颌线分明、五官立体、深色凌乱短发、眼神深邃且充满张力的男性", required: false, defaultValue: "下颌线分明、五官立体、深色凌乱短发、眼神深邃且充满张力的男性", maxLength: 200 },
      { key: "lighting style", label: "lighting style", placeholder: "例如：伦勃朗/明暗对照法布光", required: false, defaultValue: "伦勃朗/明暗对照法布光", maxLength: 60 },
      { key: "clothing", label: "clothing", placeholder: "例如：黑色高领毛衣，深色且富有质感", required: false, defaultValue: "黑色高领毛衣，深色且富有质感", maxLength: 80 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "个人资料 #1：Moody Chiaroscuro Studio Portrait",
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
      { key: "subject", label: "subject", placeholder: "例如：一位年轻女性", required: false, defaultValue: "一位年轻女性", maxLength: 60 },
      { key: "hair color and style", label: "hair color and style", placeholder: "例如：深棕色头发，扎成松散的低马尾，有几缕碎发", required: false, defaultValue: "深棕色头发，扎成松散的低马尾，有几缕碎发", maxLength: 100 },
      { key: "outfit", label: "outfit", placeholder: "例如：浅灰色 T 恤，外搭一件超大款米色针织开衫，长袖", required: false, defaultValue: "浅灰色 T 恤，外搭一件超大款米色针织开衫，长袖", maxLength: 100 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "个人资料 #2：带隐私遮挡的舒适窗边肖像",
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
      { key: "background", label: "background", placeholder: "例如：纯黑背景", required: false, defaultValue: "纯黑背景", maxLength: 60 },
      { key: "subject description", label: "subject description", placeholder: "例如：33 岁男性面部", required: false, defaultValue: "33 岁男性面部", maxLength: 80 },
      { key: "lighting style", label: "lighting style", placeholder: "例如：单束高强度左上方聚光灯", required: false, defaultValue: "单束高强度左上方聚光灯", maxLength: 80 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "个人资料 #5：戏剧性明暗对照法男性时尚肖像",
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
      { key: "nationality", label: "nationality", placeholder: "例如：日本", required: false, defaultValue: "日本", maxLength: 30 },
      { key: "age", label: "age", placeholder: "例如：20", required: false, defaultValue: "20", maxLength: 10 },
      { key: "clothing", label: "clothing", placeholder: "例如：剪裁合身、略微潮湿的白色衬衫", required: false, defaultValue: "剪裁合身、略微潮湿的白色衬衫", maxLength: 80 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "社交媒体 #8：电影感黑白肖像",
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
      { key: "subject", label: "subject", placeholder: "例如：年轻女性", required: false, defaultValue: "年轻女性", maxLength: 60 },
      { key: "outfit", label: "outfit", placeholder: "例如：亮蓝色羽绒服", required: false, defaultValue: "亮蓝色羽绒服", maxLength: 80 },
      { key: "lens", label: "lens", placeholder: "例如：85mm", required: false, defaultValue: "85mm", maxLength: 20 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "社交媒体 #17：电影感动态模糊街头人像",
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
      { key: "subject", label: "subject", placeholder: "例如：一位秃顶的中年男子", required: false, defaultValue: "一位秃顶的中年男子", maxLength: 60 },
      { key: "background color", label: "background color", placeholder: "例如：柔和芥末黄", required: false, defaultValue: "柔和芥末黄", maxLength: 40 },
      { key: "outerwear", label: "outerwear", placeholder: "例如：米色帆布工装夹克", required: false, defaultValue: "米色帆布工装夹克", maxLength: 60 },
      { key: "layers", label: "layers", placeholder: "例如：黑色圆领衫和焦橙色罗纹高领毛衣", required: false, defaultValue: "黑色圆领衫和焦橙色罗纹高领毛衣", maxLength: 80 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "个人资料 #17：写实风格遮挡人像摄影",
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
      { key: "hair color", label: "hair color", placeholder: "例如：深棕色", required: false, defaultValue: "深棕色", maxLength: 30 },
      { key: "top color", label: "top color", placeholder: "例如：白色", required: false, defaultValue: "白色", maxLength: 20 },
      { key: "pants color", label: "pants color", placeholder: "例如：白色", required: false, defaultValue: "白色", maxLength: 20 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "社交媒体 #10：厨房烘焙抓拍照片",
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
      { key: "character 1 hair", label: "character 1 hair", placeholder: "例如：黑色高丸子头配红色丝带", required: false, defaultValue: "黑色高丸子头配红色丝带", maxLength: 60 },
      { key: "character 1 outfit", label: "character 1 outfit", placeholder: "例如：带有红色流苏的白色中式上衣和红色宽松长裤", required: false, defaultValue: "带有红色流苏的白色中式上衣和红色宽松长裤", maxLength: 100 },
      { key: "character 2 hair", label: "character 2 hair", placeholder: "例如：浅紫色双丸子头", required: false, defaultValue: "浅紫色双丸子头", maxLength: 40 },
      { key: "character 2 outfit", label: "character 2 outfit", placeholder: "例如：带有金色刺绣的深绿色连衣裙和黑色紧身裤", required: false, defaultValue: "带有金色刺绣的深绿色连衣裙和黑色紧身裤", maxLength: 100 },
      { key: "sign text", label: "sign text", placeholder: "例如：武術会", required: false, defaultValue: "武術会", maxLength: 20 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "精选提示词 #5：动漫武术对决",
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
      { key: "hair color", label: "hair color", placeholder: "例如：深棕色", required: false, defaultValue: "深棕色", maxLength: 30 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "个人资料 #10：霓虹动漫街头风肖像",
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
      { key: "character style", label: "character style", placeholder: "例如：叛逆现代奇幻街头风剑士", required: false, defaultValue: "叛逆现代奇幻街头风剑士", maxLength: 60 },
      { key: "hair color", label: "hair color", placeholder: "例如：黑色短发，带有细微的棕色挑染", required: false, defaultValue: "黑色短发，带有细微的棕色挑染", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "个人资料 #3：动漫风格水墨时尚肖像（含遮挡效果）",
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
      { key: "subject", label: "subject", placeholder: "例如：两个穿着大黄蜂服装的孩子", required: false, defaultValue: "两个穿着大黄蜂服装的孩子", maxLength: 80 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "个人资料 #15：蜡笔风格插画肖像",
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
      { key: "primary color", label: "primary color", placeholder: "例如：鲜艳深红色", required: false, defaultValue: "鲜艳深红色", maxLength: 30 },
      { key: "secondary color", label: "secondary color", placeholder: "例如：柔和泡泡糖粉色", required: false, defaultValue: "柔和泡泡糖粉色", maxLength: 30 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "社交媒体 #4：红粉色分形万花筒",
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
      { key: "character description", label: "character description", placeholder: "例如：一位在太空船上的女性仿生人", required: false, defaultValue: "一位在太空船上的女性仿生人", maxLength: 80 },
      { key: "hair color", label: "hair color", placeholder: "例如：银白色", required: false, defaultValue: "银白色", maxLength: 20 },
      { key: "planet color", label: "planet color", placeholder: "例如：绿色", required: false, defaultValue: "绿色", maxLength: 20 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "个人资料 #4：太空船上的女性仿生人",
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
      { key: "subject", label: "subject", placeholder: "例如：身披白狐、置身于春日神社的日本狐仙肖像", required: false, defaultValue: "身披白狐、置身于春日神社的日本狐仙肖像", maxLength: 100 },
      { key: "clothing", label: "clothing", placeholder: "例如：以白色和金色为主调的华丽日式服装，带有精致金线刺绣的和服", required: false, defaultValue: "以白色和金色为主调的华丽日式服装，带有精致金线刺绣的和服", maxLength: 120 },
      { key: "background", label: "background", placeholder: "例如：樱花盛开的明亮日间神社", required: false, defaultValue: "樱花盛开的明亮日间神社", maxLength: 60 },
    ],
    source: {
      type: "external-inspired",
      name: "awesome-gpt-image-2",
      note: "个人资料 #7：神秘狐仙神像肖像",
    },
  },
];
