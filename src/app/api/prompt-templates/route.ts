import { NextResponse, type NextRequest } from "next/server";
import { AUTH_REQUIRED, getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { closeDatabase, initializeDatabase, openDatabase } from "@/lib/db";
import { getPromptTemplateLibrary, type PromptTemplateLibraryFilters } from "@/lib/prompt-template-library";

export async function GET(request: NextRequest | Request) {
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
    return NextResponse.json(
      getPromptTemplateLibrary(db, userResult.userId, readFilters(request.url))
    );
  } finally {
    closeDatabase(db);
  }
}

function readFilters(url: string): PromptTemplateLibraryFilters {
  const searchParams = new URL(url).searchParams;
  const filters: PromptTemplateLibraryFilters = {};

  const source = searchParams.get("source");
  if (source === "builtin" || source === "mine") {
    filters.source = source;
  }

  const category = searchParams.get("category");
  if (category) {
    filters.category = category;
  }

  const mode = searchParams.get("mode");
  if (mode) {
    filters.mode = mode;
  }

  const q = searchParams.get("q");
  if (q) {
    filters.q = q;
  }

  if (searchParams.get("favorite") === "true") {
    filters.favorite = true;
  }

  return filters;
}
