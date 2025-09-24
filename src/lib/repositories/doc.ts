import { supabaseService } from "../clients/supabase";
import type { SearchItem } from "../types";

export async function insertDocs(
  items: Array<SearchItem & { embedding: number[] }>
): Promise<number> {
  const { error, count } = await supabaseService.from("docs").insert(
    items.map((i) => ({
      title: i.title,
      url: i.url,
      snippet: i.snippet,
      embedding: i.embedding,
    })),
    { count: "exact" }
  );

  if (error) throw error;
  return count ?? items.length;
}

export async function findSimilarDocs(embedding: number[], limit = 5) {
  const { data, error } = await supabaseService.rpc("match_docs", {
    query_embedding: embedding,
    match_count: limit,
  });
  if (error) throw error;
  return data;
}
//(I can later add an RPC match_docs function for similarity search; for now we just insert.)
