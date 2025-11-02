import { ofetch } from "ofetch";
import { env } from "../config";
import { logger } from "../logger";
import type { SearchItem } from "../types";

type GoogleResult = {
  items?: Array<{ title?: string; link?: string; snippet?: string }>;
};

export async function googleSearch(
  query: string,
  limit = 8,
  page=1
): Promise<SearchItem[]> {
  const key = env.GOOGLE_SEARCH_API_KEY;
  const cx = env.GOOGLE_SEARCH_CX;

  if (!key || !cx) {
    // Safe, deterministic mock for local dev when keys are missing
    logger.warn("GOOGLE_SEARCH_* env missing — returning dev mock results.");
    return [
      {
        title: "Sample: Top React Interview Questions",
        url: "https://example.com/react-questions",
        snippet: "Mock result for local development.",
      },
      {
        title: "Sample: System Design for JS Devs",
        url: "https://example.com/system-design",
        snippet: "Mock result for local development.",
      },
    ].slice(0, limit);
  }

  const url = "https://www.googleapis.com/customsearch/v1";
  const start = (page - 1) *limit + 1;
  const data = await ofetch<GoogleResult>(url, {
    query: { key, cx, q: query, num: Math.min(limit, 10),start },
  });

  const items = (data.items ?? [])
    .map((i) => ({
      title: i.title ?? "Untitled",
      url: i.link ?? "",
      snippet: i.snippet,
    }))
    .filter((i) => i.url);

  return items;
}
