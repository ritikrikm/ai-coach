import { supabaseService } from "../clients/supabase";

export async function insertScore(
  turnId: string,
  s: {
    correctness: number;
    clarity: number;
    tradeoffs: number;
    notes: string;
    weak_subskills: string[];
  }
) {
  const { error } = await supabaseService.from("scores").insert({
    turn_id: turnId,
    correctness: s.correctness,
    clarity: s.clarity,
    tradeoffs: s.tradeoffs,
    notes: s.notes,
    weak_subskills: s.weak_subskills,
  });
  if (error) throw error;
}
