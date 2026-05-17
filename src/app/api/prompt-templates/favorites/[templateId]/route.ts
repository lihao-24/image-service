import { NextResponse, type NextRequest } from "next/server";
import { AUTH_REQUIRED, getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { closeDatabase, initializeDatabase, openDatabase } from "@/lib/db";
import {
  INVALID_TEMPLATE_ID,
  removeBuiltinTemplateFavorite,
  TEMPLATE_FAVORITE_NOT_FOUND
} from "@/lib/prompt-template-library";

type FavoriteRouteContext = {
  params: Promise<{ templateId: string }>;
};

export async function DELETE(_request: NextRequest | Request, context: FavoriteRouteContext) {
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

  const { templateId } = await context.params;
  const db = openDatabase();
  initializeDatabase(db);

  try {
    const result = removeBuiltinTemplateFavorite(db, userResult.userId, templateId);
    if (result === "invalid_template_id") {
      return NextResponse.json(
        {
          error: INVALID_TEMPLATE_ID,
          message: "请选择有效的内置提示词模板。"
        },
        { status: 400 }
      );
    }

    if (result === "not_found") {
      return NextResponse.json(
        {
          error: TEMPLATE_FAVORITE_NOT_FOUND,
          message: "没有找到该内置提示词模板收藏。"
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } finally {
    closeDatabase(db);
  }
}
