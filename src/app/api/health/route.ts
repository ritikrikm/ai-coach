export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    service: "rolesim",
    time: new Date().toISOString(),
  });
}
