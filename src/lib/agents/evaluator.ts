import { chatOnce } from "../clients/llm";

export type EvalResult = {
  correctness: number;
  clarity: number;
  tradeoffs: number;
  notes: string;
  weak_subskills: string[];
};

export async function evaluateAnswer(
  context: string,
  question: string,
  answer: string
): Promise<EvalResult> {
  const { text } = await chatOnce([
    {
      role: "system",
      content: `Return ONLY valid JSON with keys:
{ "correctness":0-5, "clarity":0-5, "tradeoffs":0-5, "notes":"...", "weak_subskills":["..."] }
Score strictly. Use CONTEXT for grounding; if ungrounded, lower correctness and note missing points.`,
    },
    {
      role: "user",
      content: `CONTEXT:\n${context}\n\nQUESTION:\n${question}\n\nANSWER:\n${answer}`,
    },
  ]);
  try {
    const json = JSON.parse(text);
    return {
      correctness: json.correctness ?? 0,
      clarity: json.clarity ?? 0,
      tradeoffs: json.tradeoffs ?? 0,
      notes: json.notes ?? "",
      weak_subskills: Array.isArray(json.weak_subskills)
        ? json.weak_subskills
        : [],
    };
  } catch {
    // Fallback conservative
    return {
      correctness: 1,
      clarity: 2,
      tradeoffs: 1,
      notes: "Could not parse evaluator JSON.",
      weak_subskills: [],
    };
  }
}
