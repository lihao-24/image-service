# 七牛 CDN 图片交付实施计划

**目标：** 生成结果上传既有七牛私有桶，成功只返回 CDN URL，失败回退 base64，避免图片经过 VPS。

**已确认范围：** 本聊天中用户确认的简化需求；无用户开关、设置表或图片历史；不改 provider 抽象，不部署、不修改云资源。

**实现选择：** 官方 qiniu SDK；仅服务端读取 QINIU_ACCESS_KEY / QINIU_SECRET_KEY；固定 lihao66、华南 z2 和 https://img.lihao66.top。内存上传，key 使用 UTC 日期及 UUID，签名 48 小时，桶使用既有一天生命周期。上传总等待上限 10 秒；失败只记录 requestId、providerId 和安全错误类别。

## 1. 服务端上传及路由

- [x] 先添加 mock SDK 网络边界的测试，覆盖未配置/部分配置、真实格式识别、签名/附件参数、成功无 base64、失败/超时降级和日志脱敏。
- [x] 在 src/lib/images/qiniu.ts 实现上传 helper；SDK 使用静态区域避免区域查询落盘，上传不重试。
- [x] 两个生图路由在 provider 成功之后调用 helper，保留原响应 meta、用量与失败路径。
- [x] 验证：pnpm test tests/images tests/api/text-to-image-route.test.ts tests/api/reference-image-route.test.ts。

## 2. 前端 URL 交付

- [x] 先添加 UI 测试：URL-only、URL 优先、base64 兼容、放大预览、直接 CDN 附件下载。
- [x] 修改 image-workbench.tsx 响应处理、workbench/types.ts 和 message-list.tsx；保持当前交互样式。
- [x] 验证：pnpm test tests/app/image-workbench.test.tsx。

## 3. 配置文档和整体交付

- [x] 更新三份 env 模板、README、AGENTS 和存储参考说明。
- [x] 跑 lint、typecheck、全部 mock 测试、build 和 git diff --check。
- [x] 独立审查改动，重点看超时资源、密钥/签名日志、格式、下载签名和成功统计。
- [x] 提供文件清单、环境变量、本地验证步骤和真实七牛联调的验证边界。

## Review Focus

- 只有一个密钥时不能触发上传；默认响应保持一致。
- 上传响应非 2xx、异常、超时必须保留成功生成的图片和成功用量。
- MIME 缺失时按字节识别，无法识别时回退，不伪造扩展名。
- 附件参数必须参加签名；跨域下载不通过 VPS 或依赖新增 CORS 配置。
- 私有 URL/图片本体不写日志或持久化；源站生命周期不等于 CDN 精确过期。

## 验证记录与交付边界

- RED：新增服务端行为测试在空 helper/未接入路由时出现 11 项预期失败；前端 URL 测试出现 2 项预期失败。
- GREEN：相关 69 项测试通过；全量 19 个测试文件、179 项测试通过；lint、typecheck、build、git diff --check 通过。
- 构建修复：Turbopack 会解析 urllib 未安装的可选 proxy-agent。将 qiniu 加入 next.config.ts 的 serverExternalPackages，保留 Node SDK 运行时加载，避免新增不需要的代理依赖。
- standalone 验证：在产物中加载 qiniu 并使用虚拟凭据生成签名成功，所有已加载依赖均来自产物内部。
- 客户端产物检查：未发现七牛凭据环境变量名或 SDK 标记。
- 独立代码审查：无 Critical/Important；Minor 待补充：实际 SDK 网络连接超时释放的本地 HTTP 集成测试。现有测试证明 helper 十秒降级、输入流销毁和迟到结果处理；SDK/urllib 超时 abort 路径已代码核对。
- 未执行真实上传、生图、CDN 私有鉴权/附件响应头/带宽或桶生命周期实测；未部署、未修改真实环境变量或云资源。

## 改动文件清单

| 范围 | 文件 |
| --- | --- |
| 服务端上传 | `src/lib/images/qiniu.ts` |
| 两个生图入口 | `src/app/api/images/generations/route.ts`、`src/app/api/images/edits/route.ts` |
| 前端展示和下载 | `src/app/image-workbench.tsx`、`src/app/workbench/types.ts`、`src/app/workbench/message-list.tsx` |
| 依赖及构建 | `package.json`、`pnpm-lock.yaml`、`next.config.ts` |
| 测试 | `tests/images/qiniu-delivery.test.ts`、`tests/api/text-to-image-route.test.ts`、`tests/api/reference-image-route.test.ts`、`tests/app/image-workbench.test.tsx` |
| 环境变量模板 | `.env.example`、`env/image-service.local.env.example`、`env/image-service.production.env.example` |
| 使用和存储说明 | `README.md`、`AGENTS.md`、`docs/README.md`、`docs/reference/data-and-storage.md`、`docs/reference/openai-compatible-images-api.md` |
| 实施记录 | `docs/plans/2026-11-17-qiniu-cdn-delivery.md` |
