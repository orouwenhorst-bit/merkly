import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const serverClient = await createServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Alleen verwijderen als de guide van deze gebruiker is
  const { data: guide } = await supabase
    .from("brand_guides")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (!guide) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }
  if (guide.user_id !== user.id) {
    return NextResponse.json({ error: "Niet toegestaan" }, { status: 403 });
  }

  const { error } = await supabase.from("brand_guides").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Verwijderen mislukt" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
