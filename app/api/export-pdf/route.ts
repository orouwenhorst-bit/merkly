import { NextRequest, NextResponse } from "next/server";
import { generateBrandBookPDF } from "@/lib/brand-book-pdf";
import { createClient } from "@/lib/supabase";
import { BrandGuideResult } from "@/types/brand";

export const dynamic = "force-dynamic";
// react-pdf + Google Font fetching don't fit in a short edge timeout
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { guideId } = await req.json();
    if (!guideId) {
      return NextResponse.json({ error: "guideId ontbreekt" }, { status: 400 });
    }

    const supabase = createClient();
    const { data: guide, error } = await supabase
      .from("brand_guides")
      .select("*")
      .eq("id", guideId)
      .single();

    if (error || !guide) {
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    }

    const result = guide.result as BrandGuideResult;
    const pdfBuffer = await generateBrandBookPDF(result);

    const safeName = result.companyName
      .replace(/[^a-zA-Z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}-huisstijl.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("PDF export failed:", err);
    return NextResponse.json(
      { error: "PDF genereren mislukt", detail: String(err) },
      { status: 500 }
    );
  }
}
