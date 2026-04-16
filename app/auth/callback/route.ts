import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const cookieNext = request.cookies.get("auth_redirect")?.value;
  const next = searchParams.get("next") ??
    (cookieNext ? decodeURIComponent(cookieNext) : "/dashboard");

  if (code) {
    // Collect cookies set during exchangeCodeForSession so we can
    // forward them onto the redirect response. Using next/headers
    // cookieStore does NOT work here — those cookies never reach the
    // browser when a new NextResponse is created afterwards.
    const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(toSet) {
            cookiesToSet.push(...toSet);
          },
        },
      }
    );

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Stuur welkomstmail alleen bij nieuw account (created_at ≈ now)
      const user = sessionData?.user;
      if (user?.email) {
        const createdAt = new Date(user.created_at).getTime();
        const isNew = Date.now() - createdAt < 60_000;
        if (isNew) {
          sendWelcomeEmail(user.email, user.user_metadata?.full_name).catch(
            (e) => console.error("[welcome email]", e)
          );
        }
      }

      const response = NextResponse.redirect(`${origin}${next}`);
      // Forward all session cookies onto the redirect response
      for (const { name, value, options } of cookiesToSet) {
        response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
      }
      response.cookies.delete("auth_redirect");
      return response;
    }

    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);

    // "Database error saving new user" → wijzer naar signup met specifieke hint
    if (error.message?.toLowerCase().includes("database error")) {
      return NextResponse.redirect(`${origin}/signup?error=db_error`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
