import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    await sendWelcomeEmail(email, name);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[send-welcome]", e);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
