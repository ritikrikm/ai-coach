import { AppError, InternalError } from "./errors";
import { logger } from "./logger";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return Response.json({ ok: true, data }, { status: 200, ...init });
}

export function jsonError(e: unknown) {
  if (e instanceof AppError) {
    return Response.json(
      { ok: false, code: e.code, message: e.message },
      { status: e.status }
    );
  }
  logger.error("Unhandled error", e);
  return Response.json(
    { ok: false, code: "INTERNAL", message: "Something Went Wrong" },
    { status: 500 }
  );
}
//now wrapping nextjs route handler to standardiz error
export function withErrorHandling<
  T extends (req: Request) => Promise<Response>
>(fn: T) {
  return async (req: Request) => {
    try {
      return await fn(req);
    } catch (e) {
      return jsonError(e);
    }
  };
}
export async function readJson<T>(req: Request): Promise<T> {
  try {
    return await req.json();
  } catch (error:unknown) {
    if(error instanceof Error) throw new InternalError("Invalid Json Body");
    throw new InternalError("Invalid Json Body");
}
}
