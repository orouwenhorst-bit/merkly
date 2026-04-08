import { NextRequest, NextResponse } from "next/server";
import { generateBrandGuide } from "@/lib/claude";
import { generateAndStoreLogo } from "@/lib/dalle-logo";
import { createClient } from "@/lib/supabase";
import { BrandInput } from "@/types/brand";

export async function POST(req: NextRequest) {
  try {
    const body: BrandInput = await req.json();

    if (!body.companyName || !body.industry || !body.mood || !body.targetAudience) {
      return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });
    }

    // Generate brand guide (Claude) + programmatic logos in parallel
    const result = await generateBrandGuide(body);

    // Save to Supabase first to get the guide ID
    const supabase = createClient();
    const { data: savedGuide, error } = await supabase
      .from("brand_guides")
      .insert({
        company_name: body.companyName,
        industry: body.industry,
        mood: body.mood,
        logo_url: body.logoUrl || null,
        result,
      })
      .select("id")
      .single();

    if (error) throw error;

    if (process.env.RECRAFT_API_KEY) {
      // If user picked a preferred color, the palette is already built around it
      // (Claude was instructed to use it as colorPalette[0]) so this stays consistent.
      const logoColor = body.preferredColor || result.colorPalette[0]?.hex || "#000000";
      const logoImageUrl = await generateAndStoreLogo(
        savedGuide.id,
        body.companyName,
        body.industry,
        body.mood,
        logoColor
      );
      if (logoImageUrl) {
        result.logoImageUrl = logoImageUrl;
        result.iconSvg = undefined;
        await supabase.from("brand_guides").update({ result }).eq("id", savedGuide.id);
      }
    }

    return NextResponse.json({ id: savedGuide.id, result });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Generatie mislukt" }, { status: 500 });
  }
}
