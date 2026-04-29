import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { sendConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.merkly.nl"}/auth/callback`,
      },
    });

    if (error || !data?.properties?.action_link) {
      console.error("[send-confirmation] generateLink failed:", error?.message);
      return NextResponse.json({ error: "Could not generate confirmation link" }, { status: 500 });
    }

    await sendConfirmationEmail(email, data.properties.action_link);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[send-confirmation]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
