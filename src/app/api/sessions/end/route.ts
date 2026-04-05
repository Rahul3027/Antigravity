import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const sessionId = formData.get("sessionId") as string;
    const transcript = formData.get("transcript") as string;

    await prisma.session.update({
      where: { id: sessionId },
      data: { status: "COMPLETED", transcript }
    });

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/report/${sessionId}`, 303);
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Generate Report
    const prompt = `
Evaluate the following consulting case study interview transcript.
Return ONLY a valid JSON string (no markdown formatting, no backticks) with the following structure:
{
  "score": <0-100 overall score>,
  "feedback": "<detailed textual feedback summarizing their performance>",
  "structuring": <0-10 score>,
  "communication": <0-10 score>,
  "businessAcumen": <0-10 score>
}

Transcript:
${transcript}
`;
    
    const result = await model.generateContent(prompt);
    let jsonStr = result.response.text().trim();
    if(jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    const evalData = JSON.parse(jsonStr);

    await prisma.report.create({
      data: {
        sessionId,
        score: evalData.score || 0,
        feedback: evalData.feedback || "Unable to generate feedback.",
        structuring: evalData.structuring || 0,
        communication: evalData.communication || 0,
        businessAcumen: evalData.businessAcumen || 0,
      }
    });

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/report/${sessionId}`, 303);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
