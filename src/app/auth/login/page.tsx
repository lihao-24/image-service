type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    redirectTo?: string;
  }>;
};

const errorText: Record<string, string> = {
  invalid_credentials: "邮箱或密码不正确，请检查后重试。",
  auth_failed: "登录失败，请稍后再试。"
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = params?.redirectTo ?? "/";
  const error = params?.error ? errorText[params.error] : null;

  return (
    <main className="page-shell auth-page">
      <form className="auth-panel" action="/auth/sign-in" method="post">
        <input name="redirectTo" type="hidden" value={redirectTo} />
        <p className="eyebrow">Supabase Auth</p>
        <h1>登录后使用生图服务</h1>
        <p className="lead">
          image-service 目前不开放匿名访问，请使用已有账号登录。
        </p>

        <label className="field">
          <span>邮箱</span>
          <input
            autoComplete="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>

        <label className="field">
          <span>密码</span>
          <input
            autoComplete="current-password"
            name="password"
            required
            type="password"
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" type="submit">
          登录
        </button>
      </form>
    </main>
  );
}
