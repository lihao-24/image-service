import { NextResponse, type NextRequest } from "next/server";
import { AUTH_REQUIRED, getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { closeDatabase, initializeDatabase, openDatabase } from "@/lib/db";
import {
  addBuiltinTemplateFavorite,
  INVALID_TEMPLATE_ID,
  toTemplateFavoriteApiRecord
} from "@/lib/prompt-template-library";

export async function POST(request: NextRequest | Request) {
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

  const templateId = readTemplateId(await readJson(request));
  if (!templateId) {
    return invalidTemplateResponse();
  }

  const db = openDatabase();
  initializeDatabase(db);

  try {
    const favorite = addBuiltinTemplateFavorite(db, userResult.userId, templateId);
    if (!favorite) {
      return invalidTemplateResponse();
    }

    return NextResponse.json(
      {
        favorite: toTemplateFavoriteApiRecord(favorite)
      },
      { status: 201 }
    );
  } finally {
    closeDatabase(db);
  }
}

async function readJson(request: NextRequest | Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function readTemplateId(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const templateId = (body as Record<string, unknown>).template_id;
  return typeof templateId === "string" && templateId.trim() ? templateId.trim() : null;
}

function invalidTemplateResponse() {
  return NextResponse.json(
    {
      error: INVALID_TEMPLATE_ID,
      message: "请选择有效的内置提示词模板。"
    },
    { status: 400 }
  );
}
