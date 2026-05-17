import { getPublicImageConfig } from "@/lib/config";

export default function Home() {
  const config = getPublicImageConfig();
  const provider = config.providers.find(
    (item) => item.id === config.defaultProvider
  );

  return (
    <main className="page-shell">
      <div className="page-content">
        <p className="eyebrow">image-service MVP</p>
        <h1>生图服务骨架已就绪</h1>
        <p className="lead">
          当前页面只用于确认 Next.js 应用、TypeScript、lint 和测试工具链可运行。
          生成、登录、数据库和 provider 调用会在后续工作窗口接入。
        </p>

        <section className="status-grid" aria-label="初始化状态">
          <article className="status-card">
            <h2>默认 Provider</h2>
            <p>{provider?.label ?? "未配置"}，仅公开模型 allowlist。</p>
          </article>
          <article className="status-card">
            <h2>默认参数</h2>
            <p>
              {config.defaults.model} / {config.defaults.size} /{" "}
              {config.defaults.quality} / {config.defaults.outputFormat}
            </p>
          </article>
          <article className="status-card">
            <h2>数据策略</h2>
            <p>当前不保存图片、不创建 SQLite 数据库、不连接真实 provider。</p>
          </article>
        </section>

        <div className="health-badge" aria-label="健康状态">
          <span className="health-dot" aria-hidden="true" />
          <span>健康页可用：/health</span>
        </div>
      </div>
    </main>
  );
}
