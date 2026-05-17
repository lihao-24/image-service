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

`daily_usage` 保存每日额度计数。

所有业务数据必须带 `user_id`，并在服务端按当前登录用户过滤。

`user_id` 只能来自服务端校验后的 Supabase Auth 用户，不接受客户端传入。

`prompt_recipes` 可以保存用户主动保存的 prompt 和参数，但不能保存生成图片、参考图文件或 provider API key。

`generation_logs` 不保存 prompt 全文。允许保存 provider、model、mode、size、quality、output_format、status、error_code、duration_ms、prompt_length、has_reference_image、created_at 等元信息。

`daily_usage` 以 `user_id + usage_date` 作为每日额度口径。生成请求应先检查额度；达到额度时不调用 provider，并写入拒绝日志。只有 provider 成功返回可用图片后才递增 `generation_count`，provider 调用失败不递增成功用量。
