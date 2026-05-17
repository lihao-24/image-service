export const AUTH_REQUIRED = "auth_required" as const;

export type SupabaseUser = {
  id: string;
  email?: string;
};

export type AuthenticatedUser = {
  ok: true;
  user: SupabaseUser;
  userId: string;
};

export type AuthRequired = {
  ok: false;
  code: typeof AUTH_REQUIRED;
  message: string;
};

export type SessionUserResult = AuthenticatedUser | AuthRequired;

export type SupabaseAuthClient = {
  auth: {
    getUser: () => Promise<{
      data: { user: SupabaseUser | null };
      error: unknown;
    }>;
  };
};

export const AUTH_REQUIRED_MESSAGE = "请先登录后再使用 image-service。";

export async function getSessionUser(
  supabase: SupabaseAuthClient
): Promise<SessionUserResult> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.id) {
    return {
      ok: false,
      code: AUTH_REQUIRED,
      message: AUTH_REQUIRED_MESSAGE
    };
  }

  return {
    ok: true,
    user: data.user,
    userId: data.user.id
  };
}

export async function getRequiredUserId(
  supabase: SupabaseAuthClient
): Promise<string | null> {
  const result = await getSessionUser(supabase);
  return result.ok ? result.userId : null;
}
