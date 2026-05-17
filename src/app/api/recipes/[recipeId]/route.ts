import { NextResponse, type NextRequest } from "next/server";
import { AUTH_REQUIRED, getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { closeDatabase, initializeDatabase, openDatabase } from "@/lib/db";
import {
  deleteRecipeForUser,
  getRecipeForUser,
  RECIPE_NOT_FOUND,
  toRecipeApiRecord,
  updateRecipeForUser,
  validateRecipePatchBody
} from "@/lib/recipes";

type RecipeRouteContext = {
  params: Promise<{ recipeId: string }>;
};

export async function GET(_request: NextRequest | Request, context: RecipeRouteContext) {
  const result = await withRecipeDb(context, (db, userId, recipeId) => {
    const recipe = getRecipeForUser(db, userId, recipeId);
    return recipe
      ? NextResponse.json({ recipe: toRecipeApiRecord(recipe) })
      : recipeNotFoundResponse();
  });

  return result;
}

export async function PATCH(request: NextRequest | Request, context: RecipeRouteContext) {
  const validation = validateRecipePatchBody(await readJson(request));
  if (!validation.ok) {
    return NextResponse.json(
      {
        error: validation.code,
        message: validation.message
      },
      { status: 400 }
    );
  }

  const result = await withRecipeDb(context, (db, userId, recipeId) => {
    const recipe = updateRecipeForUser(db, userId, recipeId, validation.input);
    return recipe
      ? NextResponse.json({ recipe: toRecipeApiRecord(recipe) })
      : recipeNotFoundResponse();
  });

  return result;
}

export async function DELETE(_request: NextRequest | Request, context: RecipeRouteContext) {
  const result = await withRecipeDb(context, (db, userId, recipeId) => {
    const deleted = deleteRecipeForUser(db, userId, recipeId);
    return deleted ? NextResponse.json({ ok: true }) : recipeNotFoundResponse();
  });

  return result;
}

async function withRecipeDb(
  context: RecipeRouteContext,
  handler: (
    db: ReturnType<typeof openDatabase>,
    userId: string,
    recipeId: string
  ) => NextResponse
) {
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

  const { recipeId } = await context.params;
  const db = openDatabase();
  initializeDatabase(db);

  try {
    return handler(db, userResult.userId, recipeId);
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

function recipeNotFoundResponse() {
  return NextResponse.json(
    {
      error: RECIPE_NOT_FOUND,
      message: "没有找到该 Prompt 配方。"
    },
    { status: 404 }
  );
}
