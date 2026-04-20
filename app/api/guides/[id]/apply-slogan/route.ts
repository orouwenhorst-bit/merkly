import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";
import type { BrandGuideResult } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tagline } = await req.json();

    if (!tagline || typeof tagline !== "string" || tagline.trim().length === 0)
      return NextResponse.json({ error: "Ongeldige tagline" }, { status: 400 });

    const serverClient = await createServerClient();
    const {
      data: { user },
    } = await serverClient.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

    const { isPremium } = await getUserSubscription(user.id);
    if (!isPremium)
      return NextResponse.json(
        { error: "Premium abonnement vereist" },
        { status: 403 }
      );

    const supabase = createServiceClient();
    const { data: guide, error } = await supabase
      .from("brand_guides")
      .select("id, user_id, result")
      .eq("id", id)
      .single();

    if (error || !guide)
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    if (guide.user_id !== user.id)
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

    const result = guide.result as BrandGuideResult;
    if (result.toneOfVoice) {
      result.toneOfVoice.tagline = tagline.trim();
    }
    result.tagline = tagline.trim();

    await supabase.from("brand_guides").update({ result }).eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("apply-slogan error:", err);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }
}
