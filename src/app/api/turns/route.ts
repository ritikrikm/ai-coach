import { withErrorHandling, readJson, jsonOk } from "@/lib/http";
import { z, parse } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { createTurn } from "@/lib/repositories/turns";
import { withSession } from "@/lib/repositories/sessions";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  sessionId: z.string().min(1),
  question: z.string().min(3),
  citations: z
    .array(z.object({ url: z.string().url(), title: z.string() }))
    .default([]),
});

export const POST = withErrorHandling(
  withSession(async (req: Request) => {
  rateLimit(
    `turns:${req.headers.get("x-forwarded-for") ?? "local"}`,
    40,
    60_000
  );
  const body = parse(Body, await readJson(req));
  const turn = await createTurn(body.sessionId, body.question, body.citations);
  return jsonOk({ turn });
})
);
