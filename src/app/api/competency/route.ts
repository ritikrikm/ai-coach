import { withErrorHandling, jsonOk, readJson } from "@/lib/http";
import { z, parse } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { buildCompetencyGraph } from "@/lib/services/competency";
import { withSession } from "@/lib/repositories/sessions";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  jd: z.string().min(10),
});

export const POST = withErrorHandling(
  withSession(async (req: Request) => {
  rateLimit(
    `competency:${req.headers.get("x-forwarded-for") ?? "local"}`,
    5,
    60_000
  );
  //sessin is verified till now
  const body = parse(Body, await readJson(req));
  const result = await buildCompetencyGraph(body.jd);
  return jsonOk(result);
})
);
