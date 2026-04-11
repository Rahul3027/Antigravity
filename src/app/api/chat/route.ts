import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const lastMessage = messages[messages.length - 1].text;
    
    let contextText = "";
    try {
      // RAG: Fetch relevant case study facts
      const contextChunks = await searchSimilarChunks(lastMessage, "mock-case-study", 2);
      if (contextChunks && contextChunks.length > 0) {
        contextText = contextChunks.map((c: any) => c.text).join("\n\n");
      } else {
        contextText = "No specific case study context found for this topic. Proceed with general consulting knowledge.";
      }
    } catch (ragError) {
      console.error("RAG Context fetch failed, falling back to general model:", ragError);
      contextText = "System Error: Case study facts could not be retrieved. Proceed with generating a reasonable generic case interview scenario based on the conversation history.";
    }

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

    try {
      const result = await model.generateContent(prompt);
      const textRes = result.response.text();

      return NextResponse.json({ response: textRes.replace('INTERVIEWER:', '').trim() });
    } catch (genError) {
      console.error("Generative API failed (likely API Key issue), falling back to Mock Mode:", genError);
      
      const mockResponses = [
        "That's a good start to structuring your approach. To analyze revenues, our current primary price point is $50 per unit. Can you estimate our total revenue if we capture 10% of a 1 million customer market?",
        "Interesting point. So if we focus on higher tier subscriptions to offset those variable costs, what potential risks should we consider regarding our customer acquisition strategy?",
        "Excellent analysis. Let's look at the operational side now. Do you think our supply chain can handle a 50% increase in volume if that strategy succeeds?",
        "That wraps up the quantitative portion nicely. Your analytical skills seem solid. Let's conclude the mock case here. Thank you!"
      ];
      
      // Pick a mock response based on how many user messages have been sent
      const userMessageCount = messages.filter((m: any) => m.role === 'user').length;
      const index = Math.min(Math.max(0, userMessageCount - 1), mockResponses.length - 1);
      
      return NextResponse.json({ response: mockResponses[index] });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
