import { supabaseService } from "../clients/supabase";
import { embedText } from "../clients/openai";

export type RagChunk = {
  url: string;
  title: string;
  snippet?: string;
  similarity: number;
};

export async function retrieveContext(topicHint: string, k = 5) {
  const emb = await embedText(topicHint);
  const { data, error } = await supabaseService.rpc("match_docs", {
    query_embedding: emb,
    match_count: k,
  });
  if (error) throw error;

  // Ensure minimal structure
  const chunks: RagChunk[] = (data ?? []).map((d: any) => ({
    url: d.url,
    title: d.title,
    snippet: d.snippet ?? "",
    similarity: d.similarity ?? 0,
  }));
  return chunks;
}

/** Build a compact context string and citation list for prompts */
export function buildGrounding(chunks: RagChunk[]) {
  const context = chunks
    .map((c, i) => `[#${i + 1}] ${c.title}\nURL: ${c.url}\n${c.snippet ?? ""}`)
    .join("\n\n");
  const citations = chunks.map((c) => ({ url: c.url, title: c.title }));
  return { context, citations };
}
