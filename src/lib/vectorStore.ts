import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function embedText(text: string): Promise<number[]> {
  const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await embedModel.embedContent(text);
  return result.embedding.values;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function searchSimilarChunks(query: string, caseName: string, topK: number = 3) {
  const queryEmbedding = await embedText(query);
  const chunks = await prisma.caseStudyChunk.findMany({ where: { caseName } });
  
  const scoredChunks = chunks.map((chunk: any) => {
    const chunkEmbedding = JSON.parse(chunk.embedding) as number[];
    return {
      text: chunk.text,
      score: cosineSimilarity(queryEmbedding, chunkEmbedding),
    };
  });

  return scoredChunks.sort((a: any, b: any) => b.score - a.score).slice(0, topK);
}
