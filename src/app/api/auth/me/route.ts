import { NextResponse } from "next/server";
import { AUTH_REQUIRED, getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/auth/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const result = await getSessionUser(supabase);

  if (!result.ok) {
    return NextResponse.json(
      {
        error: AUTH_REQUIRED,
        message: result.message
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user_id: result.userId,
    email: result.user.email ?? null
  });
}
