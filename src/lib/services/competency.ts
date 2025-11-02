import { embedText, openai } from "../clients/openai";
import {
  insertSkills,
  insertSubskills,
  linkDocs,
} from "../repositories/skills";
import { supabaseService } from "../clients/supabase";
import { Competency } from "../types";

/**
 * Parsing the job description and return { skill: [subskills...] }.
 */
export async function extractCompetencies(jd: string) {
  const prompt = `
You are an expert technical recruiter. 
Extract from the following Job Description a JSON object of core skills and their key subskills.
Return strictly in the format:
[
  { "skill": "SkillName", "subskills": ["Sub1","Sub2"] }
]
Job Description:
"""${jd}"""
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,//determnistic output
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0].message.content ?? "{}";
  const parsed = JSON.parse(text);
  console.log(text);
  console.log("=====");
  console.log(parsed);
  if (Array.isArray(parsed)) return parsed as Competency[];
  if (Array.isArray(parsed.skills)) return parsed.skills as Competency[];

  throw new Error("LLM did not return a valid skills array");
}

/**
 * Storing competencies and link docs by semantic similarity.
 */
export async function buildCompetencyGraph(jd: string) {
  const competencies: Competency[] = await extractCompetencies(jd);

  // 1. Insert skills
  const skills = await insertSkills(
    competencies.map((c) => ({ name: c.skill }))
  );

  // 2. Insert subskills
  const skillMap: Record<string, string> = {};
  skills.forEach((s) => {
    skillMap[s.name] = s.id;
  });

  const subskillsToInsert: { skill_id: string; name: string }[] = [];
  competencies.forEach((c) => {
    const skillId = skillMap[c.skill];
    c.subskills.forEach((sub) =>
      subskillsToInsert.push({ skill_id: skillId, name: sub })
    );
  });

  const subskills = await insertSubskills(subskillsToInsert);

  // 3. Link docs to skills/subskills by vector similarity
  //    For simplicity: match each subskill string against docs using pgvector <-> embedding
  for (const sub of subskills) {
    const { data, error } = await supabaseService.rpc("match_docs", {
      query_embedding: await embedText(sub.name),
      match_count: 5,
    });
    if (error) throw error;
    const links = data.map((d: any) => ({
      skill_id: sub.skill_id,
      subskill_id: sub.id,
      doc_id: d.id,
    }));
    await linkDocs(links);
  }

  return { skills, subskills };
}
