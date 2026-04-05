import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchSimilarChunks } from "@/lib/vectorStore";

export async function POST(req: Request) {
  try {
    const { sessionId, messages } = await req.json();
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages" }, { status: 400 });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: "GOOGLE_API_KEY missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const lastMessage = messages[messages.length - 1].text;
    
    // RAG: Fetch relevant case study facts
    const contextChunks = await searchSimilarChunks(lastMessage, "mock-case-study", 2);
    const contextText = contextChunks.map((c: any) => c.text).join("\n\n");

    const prompt = `
You are a professional management consulting interviewer from a top-tier firm.
Maintain a formal, encouraging, but rigorous tone. 

Here is the context of the case study retrieved based on the student's current response:
${contextText}

Here is the conversation history:
${messages.map((m: any) => `${m.role.toUpperCase()}: ${m.text}`).join("\n")}

Respond to the student's latest message as the interviewer. Do not break character. 
If they made a good point, acknowledge it. If they are missing something, guide them lightly but do not give them the answer.
INTERVIEWER:`;

    const result = await model.generateContent(prompt);
    const textRes = result.response.text();

    return NextResponse.json({ response: textRes.replace('INTERVIEWER:', '').trim() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
