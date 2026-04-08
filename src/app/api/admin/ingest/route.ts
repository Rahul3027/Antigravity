import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { embedText } from "@/lib/vectorStore";

const MOCK_CASE_STUDY = `Case Name: The Coffee Shop Dilemma
Company: BeanBrothers
Background: BeanBrothers is a regional coffee chain with 50 stores. Their profits have dropped by 15% over the last year despite revenues remaining flat. They want you to figure out why and propose a solution.

Key Data Points:
- Revenue: $50M (flat YoY)
- Costs: Increased from $40M to $44.5M
- Rent Cost: Increased by 5%
- Labor Cost: Increased by 20% due to new minimum wage laws
- Coffee Bean Cost: Flat

Solution Structure: Focus on isolating the core cost driver (Labor), then brainstorming ways to either increase revenue (new premium products, price increase) or decrease labor dependence (automation, updated store layouts, adjusted hours).`;

export async function GET() {
  try {
    const existing = await prisma.caseStudyChunk.findFirst({ where: { caseName: "mock-case-study" } });
    if (existing) return NextResponse.json({ message: "Already ingested" });

    // Simple chunking
    const chunks = MOCK_CASE_STUDY.split("\n\n").filter(c => c.trim().length > 0);
    
    for (const text of chunks) {
      if (!process.env.GOOGLE_API_KEY) {
        return NextResponse.json({ message: "GOOGLE_API_KEY not configured" }, { status: 500 });
      }
      const embedding = await embedText(text);
      await prisma.caseStudyChunk.create({
        data: {
          caseName: "mock-case-study",
          text: text.trim(),
          embedding: JSON.stringify(embedding)
        }
      });
    }

    return NextResponse.json({ message: "Ingestion complete" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
