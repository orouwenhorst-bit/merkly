import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      // Forward all session cookies onto the redirect response
      for (const { name, value, options } of cookiesToSet) {
        response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
      }
      response.cookies.delete("auth_redirect");
      return response;
    }

    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
