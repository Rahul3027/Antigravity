import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const newSession = await prisma.session.create({
    data: {
      userId: (session.user as any).id as string,
      caseStudyId: "mock-case-study", 
    }
  });

  return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/interview/${newSession.id}`, 303);
}
