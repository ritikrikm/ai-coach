import { withErrorHandling, jsonOk, readJson } from "@/lib/http";
import { z, parse } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { createSession } from "@/lib/repositories/sessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  role: z.string().min(2),
  jd: z.string().optional(),
});

export const POST = withErrorHandling(async (req: Request) => {
  rateLimit(
    `sessions:${req.headers.get("x-forwarded-for") ?? "local"}`,
    20,
    60_000
  );
  const body = parse(Body, await readJson(req));
  const session = await createSession(body.role, body.jd);
  return jsonOk({ session });
});
