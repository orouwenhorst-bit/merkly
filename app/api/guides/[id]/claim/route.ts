import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Alleen unclaimed guides kunnen worden geclaimd (voorkomt overnemen)
  const { error } = await supabase
    .from("brand_guides")
    .update({ user_id: user.id })
    .eq("id", id)
    .is("user_id", null);

  if (error) {
    return NextResponse.json({ error: "Bewaren mislukt" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
