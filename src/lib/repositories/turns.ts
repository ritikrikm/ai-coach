import { supabaseService } from "../clients/supabase";

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
  return data;
}

export async function setUserAnswer(turnId: string, answer: string) {
  const { error } = await supabaseService
    .from("turns")
    .update({ user_answer: answer })
    .eq("id", turnId);
  if (error) throw error;
}
