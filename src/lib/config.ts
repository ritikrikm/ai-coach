import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["silent", "error", "warm", "info", "debug"])
    .default("info"),
  GOOGLE_SEARCH_API_KEY: z.string().min(1, "GOOGLE_SEARCH_API_KEY is required"),
  GOOGLE_SEARCH_CX: z.string().min(1, "GOOGLE_SEARCH_CX is required"),
  SUPABASE_URL: z.string().min(1, "SUPABASE_URL is required"),
  SUPABASE_SERVICE_KEY: z.string().min(1, "SUPABASE_SERVICE_KEY is required"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
});
const _env = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
  GOOGLE_SEARCH_API_KEY: process.env.GOOGLE_SEARCH_API_KEY,
  GOOGLE_SEARCH_CX: process.env.GOOGLE_SEARCH_CX,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
});

export const env = _env;
export const isProd = _env.NODE_ENV === "production";
