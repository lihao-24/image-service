import { NextResponse } from "next/server";
import { AUTH_REQUIRED, getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { closeDatabase, getDailyUsage, initializeDatabase, openDatabase } from "@/lib/db";
import { getUsageDate } from "@/lib/usage";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const userResult = await getSessionUser(supabase);

  if (!userResult.ok) {
    return NextResponse.json(
      {
        error: AUTH_REQUIRED,
        message: userResult.message
      },
      { status: 401 }
    );
  }

  const db = openDatabase();
  initializeDatabase(db);

  try {
    const usageDate = getUsageDate();
    const generationCount = getDailyUsage(db, userResult.userId, usageDate);

    return NextResponse.json({
      usage: {
        date: usageDate,
        generation_count: generationCount,
        limit: null,
        limited: false
      }
    });
  } finally {
    closeDatabase(db);
  }
}
