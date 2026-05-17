import { getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { getPublicImageConfig } from "@/lib/config";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const auth = await getSessionUser(supabase);
  const config = getPublicImageConfig();
  const provider = config.providers.find(
    (item) => item.id === config.defaultProvider
  );

  return (
    <main className="page-shell">
      <div className="page-content">
        <p className="eyebrow">image-service MVP</p>
        <h1>生图服务入口已受登录保护</h1>
        <p className="lead">
          当前页面只展示登录后的应用 shell。生成、数据库和 provider 调用会在后续工作窗口接入。
        </p>

        <section className="status-grid" aria-label="初始化状态">
          <article className="status-card">
            <h2>当前用户</h2>
            <p>{auth.ok ? auth.user.email ?? auth.userId : "未登录"}</p>
          </article>
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

        <form action="/auth/logout" method="post">
          <button className="secondary-button" type="submit">
            退出登录
          </button>
        </form>
      </div>
    </main>
  );
}
