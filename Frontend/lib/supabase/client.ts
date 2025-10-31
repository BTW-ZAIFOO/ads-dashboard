import { createClient } from "@supabase/supabase-js"

export const supabaseBrowser = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }
  return createClient(url, anonKey, { auth: { persistSession: true } })
}


