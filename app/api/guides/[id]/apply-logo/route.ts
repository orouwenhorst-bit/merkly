import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";
import { storeLogoSvg } from "@/lib/recraft-logo";
import type { BrandGuideResult } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { logoVariants } = await req.json();

    if (!logoVariants || typeof logoVariants !== "object")
      return NextResponse.json({ error: "Ongeldige data" }, { status: 400 });

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

    // Store the primary SVG and update the public URL
    const publicUrl = await storeLogoSvg(id, logoVariants.fullColor);
    result.logoImageUrl = publicUrl ?? undefined;
    result.logoVariants = logoVariants;

    await supabase.from("brand_guides").update({ result }).eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("apply-logo error:", err);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }
}
