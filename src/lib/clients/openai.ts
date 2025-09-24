import OpenAI from "openai";
import { env } from "../config";

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function embedText(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return res.data[0].embedding;
}
