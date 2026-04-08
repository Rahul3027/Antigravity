import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

export async function GET(req: Request, ctx: any) {
  try {
    const handler = NextAuth(authOptions);
    // We expect it to fail here or during request handling
    const res = await handler(req, ctx);
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
  }
}
