import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: guide, error } = await supabase
    .from("brand_guides")
    .select("id, company_name, industry, created_at, is_premium, user_id, result")
    .eq("id", id)
    .single();

  if (error || !guide) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }
  if (guide.user_id !== user.id) {
    return NextResponse.json({ error: "Niet toegestaan" }, { status: 403 });
  }

  const { isPremium } = await getUserSubscription(user.id);

  return NextResponse.json({ guide, isPremiumUser: isPremium });
}
