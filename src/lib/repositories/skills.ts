import { supabaseService } from "../clients/supabase";

export async function insertSkills(skills: { name: string }[]) {
  const { data, error } = await supabaseService
    .from("skills")
    .upsert(skills, { onConflict: "name" })
    .select();
  if (error) throw error;
  return data;
}

export async function insertSubskills(
  subskills: { skill_id: string; name: string }[]
) {
  const { data, error } = await supabaseService
    .from("subskills")
    .upsert(subskills, { ignoreDuplicates: true }) //for using conflict and dupl - used upsert instead of insert
    .select();
  if (error) throw error;
  return data;
}

export async function linkDocs(
  links: { skill_id: string; subskill_id: string; doc_id: string }[]
) {
  const { error } = await supabaseService
    .from("skill_doc_links")
    .upsert(links, { ignoreDuplicates: true });
  if (error) throw error;
}
