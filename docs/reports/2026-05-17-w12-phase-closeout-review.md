# W12 基础验证与阶段收口 review

日期：2026-05-17

## 范围

本次 review 按 MVP spec、API 参考、数据与存储策略和实施计划，对 W03-W11 的实现做阶段收口核对。未连接真实 provider，未部署到 VPS，未执行生产 migration。

## 自动验证

| 命令 | 结果 |
| --- | --- |
| `pnpm lint` | 通过，exit 0 |
| `pnpm typecheck` | 通过，exit 0 |
| `pnpm test` | 通过，13 个 test files、59 个 tests 全部通过 |
| `pnpm build` | 通过，Next.js build exit 0 |
| `git diff --check` | 通过，exit 0 |

## 验收清单

| 验收项 | 结果 | 证据 |
| --- | --- | --- |
| 未登录保护 | 通过 | middleware 保护 `/`，生成和 recipe API 未登录返回 `auth_required`；测试覆盖 `tests/auth/*`、`tests/api/*`。 |
| 文生图取 `data[0].b64_json` | 通过 | `src/lib/providers/index.ts` 的 `generateImage` 使用 index 0；provider 测试覆盖。 |
| 参考图取 `data[1]` 并 fallback `data[0]` | 通过 | `editImage` 优先 index 1，缺失时回退 index 0；`tests/providers/openai-compatible-images.test.ts` 覆盖两种响应。 |
| 图片不保存 | 通过 | SQLite schema 不含图片字段；生成接口只返回临时 `b64_json`，日志 helper 不写 `imageB64Json`；测试断言日志和 recipe 不含 base64。 |
| 配置只手动保存 | 通过 | 生成 API 不写 `prompt_recipes`；前端只在点击保存后调用 `/api/recipes`；测试覆盖生成不自动保存。 |
| generation log 不保存 prompt 全文 | 通过 | `generation_logs` 只保存 `prompt_length`；测试断言日志不含完整 prompt。 |
| allowlist 拒绝非法参数 | 通过 | 生成和 recipe 保存均复用服务端 `validateImageGenerationParams`；测试覆盖非法 provider/model/size/quality/output_format。 |
| 每日额度 provider 前校验且成功后递增 | 通过 | route 测试记录 quota 在 provider 前执行；额度用尽不调用 provider，只有非空图片成功后递增 `daily_usage`。 |
| 用户隔离 | 通过 | recipe CRUD 和 db helper 均按服务端 auth user_id 过滤；日志和 usage 当前未暴露读取 API，数据层记录均带 user_id，查询 helper 也按 user_id 过滤。 |

## 仓库扫描

| 扫描项 | 命令 | 结果 |
| --- | --- | --- |
| `.env` 文件 | `find . -path './node_modules' -prune -o -path './.next' -prune -o -path './.git' -prune -o -type f -name '.env*' -print` | 仅发现安全占位 `.env.example`。 |
| SQLite/db 文件 | `find . -path './node_modules' -prune -o -path './.next' -prune -o -path './.git' -prune -o -type f \( -name '*.sqlite' -o -name '*.sqlite3' -o -name '*.db' -o -name '*.db-*' -o -name '*.sqlite-*' \) -print` | 未发现。 |
| 上传/生成图片 | `find . -path './node_modules' -prune -o -path './.next' -prune -o -path './.git' -prune -o -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' -o -iname '*.gif' -o -iname '*.avif' \) -print` | 未发现。 |
| 密钥样式 | `rg -n --hidden -g '!node_modules/**' -g '!.next/**' -g '!.git/**' -g '!pnpm-lock.yaml' -e 'sk-[A-Za-z0-9_-]{20,}' -e 'SUB2API_API_KEY\s*=\s*[^\s#]+' -e 'OPENAI_API_KEY\s*=\s*[^\s#]+' -e 'SUPABASE_SERVICE_ROLE_KEY\s*=\s*[^\s#]+' -e 'Bearer\s+[A-Za-z0-9._-]{20,}' .` | 仅命中 `.env.example` 占位值和测试中的 `test-key`。 |
| 长 base64 | `rg -n --hidden -g '!node_modules/**' -g '!.next/**' -g '!.git/**' -g '!pnpm-lock.yaml' -e '[A-Za-z0-9+/]{200,}={0,2}' .` | 未命中。 |

## 修复与文档更新

本窗口未发现需要低风险代码修复的问题。新增本收口报告，用于记录 W12 验证和验收结果。

## 剩余风险

无阻塞。

上线前仍建议在受控环境做一次 provider smoke test，验证真实 `sub2api` key、网络、返回格式和额度配置。该 smoke test 应使用测试 prompt，避免提交任何生成图片或运行时数据库文件。

## 下一阶段建议

进入部署准备；部署前补齐生产环境变量和数据目录确认，然后做一次受控 provider smoke test。
