import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  createServerClient as createSSRServerClient,
  createBrowserClient as createSSRBrowserClient,
} from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server Component / Route Handler client — uses anon key + RLS via cookies.
 * Must be awaited inside an async context (Server Component / Route Handler only).
 * Importeert next/headers dynamisch zodat Client Components dit bestand ook kunnen importeren.
 */
export async function createServerClient() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Components cannot set cookies — middleware handles refresh
        }
      },
    },
  });
}

/**
 * Service-role client — bypasses RLS, voor schrijvende API routes.
 */
export function createServiceClient() {
  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);
}

/**
 * Browser client — voor Client Components.
 */
export function createBrowserClient() {
  return createSSRBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Alias voor createServiceClient() — achterwaartse compatibiliteit met
 * bestaande API routes die createClient() importeren.
 */
export function createClient() {
  return createServiceClient();
}
