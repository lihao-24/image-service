import { NextResponse, type NextRequest } from "next/server";
import { AUTH_REQUIRED, getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { closeDatabase, initializeDatabase, openDatabase } from "@/lib/db";
import {
  listRecipesForUser,
  saveRecipeForUser,
  toRecipeApiRecord,
  validateRecipeRequestBody
} from "@/lib/recipes";

export async function GET() {
  const userResult = await getRecipeUser();
  if (!userResult.ok) {
    return authRequiredResponse(userResult.message);
  }

  const db = openDatabase();
  initializeDatabase(db);

  try {
    return NextResponse.json({
      recipes: listRecipesForUser(db, userResult.userId).map(toRecipeApiRecord)
    });
  } finally {
    closeDatabase(db);
  }
}

export async function POST(request: NextRequest | Request) {
  const userResult = await getRecipeUser();
  if (!userResult.ok) {
    return authRequiredResponse(userResult.message);
  }

  const validation = validateRecipeRequestBody(await readJson(request));
  if (!validation.ok) {
    return recipeParamsResponse(validation.message);
  }

  const db = openDatabase();
  initializeDatabase(db);

  try {
    const recipe = saveRecipeForUser(db, userResult.userId, validation.input);
    return NextResponse.json({ recipe: toRecipeApiRecord(recipe) }, { status: 201 });
  } finally {
    closeDatabase(db);
  }
}

async function getRecipeUser() {
  const supabase = await createServerSupabaseClient();
  return getSessionUser(supabase);
}

async function readJson(request: NextRequest | Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function authRequiredResponse(message: string) {
  return NextResponse.json({ error: AUTH_REQUIRED, message }, { status: 401 });
}

function recipeParamsResponse(message: string) {
  return NextResponse.json({ error: "invalid_recipe_params", message }, { status: 400 });
}
