import { NextRequest, NextResponse } from "next/server";
import { generatePDF } from "@/lib/pdf";
import { createClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { guideId } = await req.json();

  const supabase = createClient();
  const { data: guide } = await supabase
    .from("brand_guides")
    .select("*")
    .eq("id", guideId)
    .single();

  if (!guide) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const pdf = await generatePDF(`${baseUrl}/result/${guideId}?pdf=true`);

  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${guide.company_name}-huisstijl.pdf"`,
    },
  });
}
