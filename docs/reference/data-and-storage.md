# 数据与存储策略

## 核心原则

- 默认不保存生成图片。
- 只在用户点击“保存配置”后保存 Prompt 配方。
- 每次生成自动写 generation log，但只保存元信息。
- 上传参考图只用于本次请求，不长期保存。

## 存储目录

```text
/Users/hao/Desktop/lihao-data/image-service/
  sqlite/
  exports/
  cache/
```

第一版：

- `sqlite/`：保存 SQLite 数据库。
- `exports/`：预留给未来主动导出。
- `cache/`：第一版不使用，未来如需要临时落盘再启用。

## 备份

必须备份：

- SQLite 数据库。

可选备份：

- 用户主动导出的文件。

不备份：

- 临时 cache。
- 生成图片结果。
- 上传参考图。
- 日志文件。

## SQLite 数据

`prompt_recipes` 保存用户主动保存的配置。

`generation_logs` 保存生成元信息。

`daily_usage` 保存每日成功生成次数。

所有业务数据必须带 `user_id`，并在服务端按当前登录用户过滤。

`user_id` 只能来自服务端校验后的 Supabase Auth 用户，不接受客户端传入。

`prompt_recipes` 可以保存用户主动保存的 prompt 和参数，但不能保存生成图片、参考图文件或 provider API key。

`generation_logs` 不保存 prompt 全文。允许保存 provider、model、mode、status、error_code、duration_ms、prompt_length、has_reference_image、created_at 等元信息。`size`、`quality`、`output_format` 等旧字段暂时保留为兼容占位；当前主生成流程不再把这些字段作为上游请求参数。

`daily_usage` 以 `user_id + usage_date` 作为每日用量口径。只有 provider 成功返回可用图片后才递增 `generation_count`，provider 调用失败或返回空图片不递增成功用量。

GPT Image 系列模型当前只统计成功生成次数，不做每日额度拦截；因此 `gpt-image-2` 请求不会因为 `daily_usage` 达到某个上限而在调用 provider 前被拒绝。未来接入受限模型时，再启用请求前额度检查；达到额度时不调用 provider，并写入拒绝日志。

`GET /api/usage` 第一版读取当前登录用户今日总成功生成次数，不按模型拆分。按模型拆分留给后续需求，可基于 `generation_logs` 汇总或新增专门表。
