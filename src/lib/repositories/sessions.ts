import { supabaseService } from "../clients/supabase";

/**
 * Create a new interview session.
 * @param role  The role being practiced (e.g. "Frontend (React)")
 * @param jd    Optional job description text that was used to build the competency graph
 * @returns     The inserted session row
 */
export async function createSession(role: string, jd?: string) {
  const { data, error } = await supabaseService
    .from("sessions")
    .insert({ role, jd })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Retrieve a session by its id.
 */
export async function getSession(id: string) {
  const { data, error } = await supabaseService
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * List all sessions for administrative or debugging purposes.
 * In a real app you would likely filter by user id once auth is added.
 */
export async function listSessions(limit = 20) {
  const { data, error } = await supabaseService
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
