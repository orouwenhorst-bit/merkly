import { NextRequest, NextResponse } from "next/server";
import { generateBrandGuide } from "@/lib/claude";
import { generateLogoSvg, storeLogoSvg } from "@/lib/recraft-logo";
import { deriveLogoVariants } from "@/lib/svg-processing";
import { calculateAccessibility } from "@/lib/wcag";
import { createClient } from "@/lib/supabase";
import { BrandInput } from "@/types/brand";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Premium generation — called after payment.
 * Runs the full Claude call (~8000 tokens) and Recraft V4 logo generation.
 * Replaces the light preview result with the complete brand guide.
 */
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

    if (!guide.is_premium) {
      return NextResponse.json({ error: "Betaling niet ontvangen" }, { status: 403 });
    }

    // Check if already fully generated (has full strategy with personas)
    const existingResult = guide.result;
    if (existingResult?.strategy?.personas?.length > 0 && existingResult?.imageryGuidelines) {
      return NextResponse.json({ status: "already_generated", result: existingResult });
    }

    // Retrieve stored input from result JSONB
    const input = (existingResult?._input as BrandInput | undefined) ?? null;
    if (!input) {
      // Fallback: reconstruct input from stored guide fields
      const fallbackInput: BrandInput = {
        companyName: guide.company_name,
        industry: guide.industry,
        mood: guide.mood,
        targetAudience: "",
        logoUrl: guide.logo_url ?? undefined,
      };
      // Use fallback — it may not be as good but it works
      const result = await generateBrandGuide(fallbackInput);
      if (result.colorPalette?.colors?.length) {
        result.colorPalette.accessibility = calculateAccessibility(result.colorPalette.colors);
      }
      if (existingResult?.logoVariants) {
        result.logoVariants = existingResult.logoVariants;
        result.logoImageUrl = existingResult.logoImageUrl;
      }
      await supabase.from("brand_guides").update({ result }).eq("id", guideId);
      return NextResponse.json({ status: "generated", result });
    }

    // Run FULL Claude generation
    const result = await generateBrandGuide(input);

    // Server-side WCAG validation
    if (result.colorPalette?.colors?.length) {
      result.colorPalette.accessibility = calculateAccessibility(result.colorPalette.colors);
    }

    // Preserve existing logo data from light generation
    if (existingResult?.logoVariants) {
      result.logoVariants = existingResult.logoVariants;
      result.logoImageUrl = existingResult.logoImageUrl;
      result.iconSvg = existingResult.iconSvg;
    }

    // Generate Recraft V4 logo if not already done
    if (!result.logoVariants && process.env.RECRAFT_API_KEY) {
      const colors = result.colorPalette?.colors ?? [];
      const primaryColor = input.preferredColor || colors.find(c => c.category === "primary")?.hex || colors[0]?.hex || "#000000";

      const v4Result = await generateLogoSvg(
        input.industry,
        input.mood,
        primaryColor,
        result.brandPersonality ?? [],
      );

      if (v4Result) {
        const publicUrl = await storeLogoSvg(guideId, v4Result.svg);
        const variants = deriveLogoVariants(v4Result.svg, primaryColor);
        result.logoImageUrl = publicUrl ?? undefined;
        result.iconSvg = undefined;
        result.logoVariants = {
          fullColor: variants.fullColor,
          monoBlack: variants.monoBlack,
          monoWhite: variants.monoWhite,
          monoPrimary: variants.monoPrimary,
          transparent: variants.transparent,
          recraftImageId: v4Result.imageId,
        };
      }
    }

    // Update the guide with full result
    const { error: updateError } = await supabase
      .from("brand_guides")
      .update({ result })
      .eq("id", guideId);

    if (updateError) {
      console.error("Failed to update guide with premium result:", updateError);
      return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
    }

    return NextResponse.json({ status: "generated", result });
  } catch (err) {
    console.error("Premium generation error:", err);
    return NextResponse.json({ error: "Premium generatie mislukt", detail: String(err) }, { status: 500 });
  }
}
