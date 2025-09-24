import { googleSearch } from "../clients/search-google";
import { embedText } from "../clients/openai";

import type { SearchItem } from "../types";
import { insertDocs } from "../repositories/doc";

/**
 * Full pipeline:
 * 1. Search Google for interview questions
 * 2. Create embeddings
 * 3. Store in Supabase
 */
export async function ingestQuestions(
  query: string,
  limit = 8
): Promise<{ inserted: number; items: SearchItem[] }> {
  //step1
  const results = await googleSearch(query, limit);
  //create numerical values of text(embedding)
  const itemsWithEmbeddings = await Promise.all(
    results.map(async (r) => ({
      ...r,
      embedding: await embedText(`${r.title} ${r.snippet ?? ""}`),
    }))
  );
  //stored in supabase
  const inserted = await insertDocs(itemsWithEmbeddings);
  return { inserted, items: results };
}
