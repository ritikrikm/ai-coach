import { chatOnce } from "../clients/llm";

export async function tutorPlan(weakSubskills: string[], role: string) {
  if (!weakSubskills.length)
    return {
      lessons: [] as Array<{
        subskill: string;
        lesson: string;
        practices: string[];
      }>,
    };

  const { text } = await chatOnce([
    {
      role: "system",
      content: `Create short micro-lessons. Return JSON:
{ "lessons": [ { "subskill":"...", "lesson":"3-4 sentences", "practices": ["Q1","Q2"] } ] }`,
    },
    {
      role: "user",
      content: `Role: ${role}
Weak subskills: ${weakSubskills.join(", ")}

Write targeted lessons.`,
    },
  ]);
  try {
    return JSON.parse(text);
  } catch {
    return { lessons: [] };
  }
}
