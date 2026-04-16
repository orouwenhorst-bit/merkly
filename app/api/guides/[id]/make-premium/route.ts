import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const serverClient = await createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    // Controleer of gebruiker premium heeft
    const { isPremium } = await getUserSubscription(user.id);
    if (!isPremium) {
      return NextResponse.json({ error: "Premium abonnement vereist" }, { status: 403 });
    }

    const supabase = createServiceClient();

    // Controleer of guide bestaat en van deze gebruiker is
    const { data: guide, error } = await supabase
      .from("brand_guides")
      .select("id, user_id, is_premium")
      .eq("id", id)
      .single();

    if (error || !guide) {
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    }

    if (guide.user_id !== user.id) {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    if (guide.is_premium) {
      return NextResponse.json({ status: "already_premium" });
    }

    // Markeer als premium
    await supabase
      .from("brand_guides")
      .update({ is_premium: true })
      .eq("id", id);

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("make-premium error:", err);
    return NextResponse.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
