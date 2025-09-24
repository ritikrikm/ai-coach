import { withErrorHandling, jsonOk, readJson } from "@/lib/http";
import { z, parse } from "@/lib/validation";

import { rateLimit } from "@/lib/rate-limit";
import { googleSearch } from "@/lib/clients/search-google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  query: z.string().min(3),
  limit: z.number().int().min(1).max(10).optional(),
});

export const POST = withErrorHandling(async (req: Request) => {
  rateLimit(
    `search:${req.headers.get("x-forwarded-for") ?? "local"}`,
    20,
    60_000
  );

  const body = parse(Body, await readJson(req));
  const results = await googleSearch(body.query, body.limit ?? 8);
  return jsonOk({ results });
});
