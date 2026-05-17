import { NextResponse } from "next/server";
import { getPublicImageConfig } from "@/lib/config";

export async function GET() {
  return NextResponse.json(getPublicImageConfig());
}
