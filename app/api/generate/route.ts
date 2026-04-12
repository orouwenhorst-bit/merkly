import { NextRequest, NextResponse } from "next/server";
import { generateBrandGuideLight } from "@/lib/claude";
import { generateAndStoreLogo } from "@/lib/dalle-logo";
import { generateLogoSvg, storeLogoSvg } from "@/lib/recraft-logo";
import { deriveLogoVariants } from "@/lib/svg-processing";
import { calculateAccessibility } from "@/lib/wcag";
import { createClient } from "@/lib/supabase";
import { BrandInput } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body: BrandInput = await req.json();

    if (!body.companyName || !body.industry || !body.mood || !body.targetAudience) {
      return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });
    }

    // Light generation — only preview content, saves ~75% tokens
    const result = await generateBrandGuideLight(body);

    // Server-side WCAG validation: overwrite Claude's estimates with real calculations
    if (result.colorPalette?.colors?.length) {
      result.colorPalette.accessibility = calculateAccessibility(result.colorPalette.colors);
    }

    // Save to Supabase first to get the guide ID
    const supabase = createClient();
    // Store input inside result JSONB for premium regeneration later
    const resultWithInput = { ...result, _input: body };

    const { data: savedGuide, error } = await supabase
      .from("brand_guides")
      .insert({
        company_name: body.companyName,
        industry: body.industry,
        mood: body.mood,
        logo_url: body.logoUrl || null,
        result: resultWithInput,
      })
      .select("id")
      .single();

    if (error) throw error;

    if (process.env.RECRAFT_API_KEY) {
      const colors = result.colorPalette?.colors ?? [];
      const primaryColor = body.preferredColor || colors.find(c => c.category === "primary")?.hex || colors[0]?.hex || "#000000";

      // Try Recraft V4 first (SVG output), fall back to V2 (PNG)
      const v4Result = await generateLogoSvg(
        body.industry,
        body.mood,
        primaryColor,
        result.brandPersonality ?? [],
      );

      if (v4Result) {
        // Store the primary SVG
        const publicUrl = await storeLogoSvg(savedGuide.id, v4Result.svg);

        // Derive color variants from the SVG
        const variants = deriveLogoVariants(v4Result.svg, primaryColor);

        // Store the raw SVG in the result for the preview component
        result.logoImageUrl = publicUrl ?? undefined;
        result.iconSvg = undefined;
        // Store logo variants for premium use later
        result.logoVariants = {
          fullColor: variants.fullColor,
          monoBlack: variants.monoBlack,
          monoWhite: variants.monoWhite,
          monoPrimary: variants.monoPrimary,
          transparent: variants.transparent,
          recraftImageId: v4Result.imageId,
        };

        await supabase.from("brand_guides").update({ result }).eq("id", savedGuide.id);
      } else {
        // Fallback: Recraft V2 (PNG output via legacy module)
        const logoImageUrl = await generateAndStoreLogo(
          savedGuide.id,
          body.companyName,
          body.industry,
          body.mood,
          primaryColor,
        );
        if (logoImageUrl) {
          result.logoImageUrl = logoImageUrl;
          result.iconSvg = undefined;
          await supabase.from("brand_guides").update({ result }).eq("id", savedGuide.id);
        }
      }
    }

    return NextResponse.json({ id: savedGuide.id, result });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Generatie mislukt" }, { status: 500 });
  }
}
