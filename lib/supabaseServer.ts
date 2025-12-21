// lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js"

// URL ist nicht geheim → darf NEXT_PUBLIC heißen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL ist nicht gesetzt")
}
if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt")
}

export function supabaseServerClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      // wir brauchen keine Sessions im Server-Kontext
      persistSession: false,
    },
  })
}

