import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !serviceKey) {
  throw new Error("Missing SUPABASE_URL and key env vars");
}

export const supabase = createClient(url, serviceKey);
