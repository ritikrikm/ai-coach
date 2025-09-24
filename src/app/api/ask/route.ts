import { withErrorHandling, readJson, jsonOk } from "@/lib/http";
import { z, parse } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { createTurn } from "@/lib/repositories/turns";
import {
  nextQuestionStream,
  evaluateAndCoach,
} from "@/lib/services/orchestration";
import { redact } from "@/lib/safety/redact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("next-question"),
    sessionId: z.string().min(1),
    role: z.string().min(2),
    topicHint: z.string().optional(),
  }),
  z.object({
    action: z.literal("evaluate"),
    turnId: z.string().min(1),
    role: z.string().min(2),
    question: z.string().min(3),
    answer: z.string().min(1),
    topicHint: z.string().optional(),
  }),
]);

export const POST = withErrorHandling(async (req: Request) => {
  rateLimit(`ask:${req.headers.get("x-forwarded-for") ?? "local"}`, 40, 60_000);

  const body = parse(Body, await readJson(req));

  if (body.action === "next-question") {
    const { streamResp, citations } = await nextQuestionStream(
      (body as { sessionId: string }).sessionId,
      body.role,
      body.topicHint ?? ""
    );
    // To persist the turn we need the question text. We can:
    //  1) Let the client read the stream, collect the question text, then POST /turns to save it with citations.
    //  2) Or buffer on server (loses immediacy). We'll choose (1) for simplicity.
    // So return the SSE stream + citations header (as JSON text event).
    return new Response(streamResp.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        // pass citations via a priming event (client will request them first)
        "X-Citations": encodeURIComponent(JSON.stringify(citations)),
        "Access-Control-Expose-Headers": "X-Citations",
      },
    });
  }

  if (body.action === "evaluate") {
    // Redact sensitive info before storing
    const safeAnswer = redact((body as { answer: string }).answer);
    const { eval: evalRes, coach } = await evaluateAndCoach(
      (body as { turnId: string }).turnId,
      (body as { role: string }).role,
      (body as { question: string }).question,
      safeAnswer,
      body.topicHint ?? ""
    );
    return jsonOk({ eval: evalRes, coach });
  }

  // Should be unreachable
  return jsonOk({ ok: true });
});
