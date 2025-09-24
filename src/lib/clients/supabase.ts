import { createClient } from "@supabase/supabase-js";
import { env } from "../config";

export const supabaseService = createClient(
  env.SUPABASE_URL!,
  env.SUPABASE_SERVICE_KEY!, // server-side only
  { auth: { persistSession: false } }
);
