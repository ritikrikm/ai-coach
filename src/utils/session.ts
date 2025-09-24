import { postJSON } from "./api";

/**
 * Create a new interview session from the client side.
 * Calls the already existing POST /api/sessions endpoint.
 */
export async function createSession(
  role: string,
  jd?: string
): Promise<{ id: string; role: string }> {
  const res = await postJSON<{
    ok: boolean;
    data: { session: { id: string; role: string } };
  }>("/api/sessions", { role, jd });

  if (!res.ok) {
    throw new Error("Failed to create session");
  }

  // unwrap to a simple shape for the frontend
  return { id: res.data.session.id, role: res.data.session.role };
}
