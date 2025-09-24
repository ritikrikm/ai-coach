import { withErrorHandling, jsonOk, readJson } from "@/lib/http";
import { z, parse } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { ingestQuestions } from "@/lib/services/ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  query: z.string().min(3),
  limit: z.number().int().min(1).max(10).optional(),
});

export const POST = withErrorHandling(async (req: Request) => {
  rateLimit(
    `ingest:${req.headers.get("x-forwarded-for") ?? "local"}`,
    5,
    60_000
  );

  const body = parse(Body, await readJson(req));
  const { inserted, items } = await ingestQuestions(
    body.query,
    body.limit ?? 8
  );

  return jsonOk({ inserted, items });
});
