import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/auth/server";

function sanitizeRedirectTo(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/";
  }

  if (value.startsWith("//")) {
    return "/";
  }

  return value;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = sanitizeRedirectTo(formData.get("redirectTo"));

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(
      `/auth/login?error=invalid_credentials&redirectTo=${encodeURIComponent(
        redirectTo
      )}`
    );
  }

  redirect(redirectTo);
}
