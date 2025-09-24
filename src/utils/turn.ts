import { supabaseService } from "@/lib/clients/supabase";

export async function createTurn(
  sessionId: string,
  question: string,
  citations: Array<{ url: string; title: string }>
) {
  const { data, error } = await supabaseService
    .from("turns")
    .insert({ session_id: sessionId, question, citations })
    .select()
    .single();
  if (error) throw error;
  return data; // it contains id
}
