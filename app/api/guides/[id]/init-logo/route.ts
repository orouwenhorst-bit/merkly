import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { generateLogoSvg, storeLogoSvg } from "@/lib/recraft-logo";
import { deriveLogoVariants } from "@/lib/svg-processing";
import { generateAndStoreLogo } from "@/lib/dalle-logo";
import type { BrandGuideResult } from "@/types/brand";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Genereert automatisch een logo voor een guide die er nog geen heeft.
 * Geen auth vereist — wordt aangeroepen vanuit de result-pagina direct na generatie.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data: guide } = await supabase
      .from("brand_guides")
      .select("id, industry, mood, result")
      .eq("id", id)
      .single();

    if (!guide) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

    const result = guide.result as BrandGuideResult & { _input?: { preferredColor?: string } };

    // Al een logo — niets te doen
    if (result.logoImageUrl) return NextResponse.json({ logoImageUrl: result.logoImageUrl });

    if (!process.env.RECRAFT_API_KEY) {
      return NextResponse.json({ error: "Logo generatie niet beschikbaar" }, { status: 503 });
    }

    const colors = result.colorPalette?.colors ?? [];
    const primaryColor =
      result._input?.preferredColor ||
      colors.find((c) => c.category === "primary")?.hex ||
      colors[0]?.hex ||
      "#000000";

    const brandPersonality =
      result.strategy?.personalityTraits ?? result.brandPersonality ?? [];

    // Recraft V4 SVG
    const v4Result = await generateLogoSvg(
      guide.industry,
      guide.mood,
      primaryColor,
      brandPersonality
    );

    if (v4Result) {
      const variants = deriveLogoVariants(v4Result.svg, primaryColor);
      const primarySvg = variants.monoPrimary;
      const publicUrl = await storeLogoSvg(id, primarySvg);

      const updatedResult = {
        ...result,
        logoImageUrl: publicUrl ?? undefined,
        iconSvg: undefined,
        logoVariants: {
          fullColor: primarySvg,
          monoBlack: variants.monoBlack,
          monoWhite: variants.monoWhite,
          monoPrimary: variants.monoPrimary,
          transparent: primarySvg,
          recraftImageId: v4Result.imageId,
        },
      };

      await supabase.from("brand_guides").update({ result: updatedResult }).eq("id", id);
      return NextResponse.json({ logoImageUrl: publicUrl });
    }

    // Fallback: DALL-E
    const companyName = (result as { companyName?: string }).companyName ?? "";
    const logoImageUrl = await generateAndStoreLogo(
      id,
      companyName,
      guide.industry,
      guide.mood,
      primaryColor
    );

    if (logoImageUrl) {
      const updatedResult = { ...result, logoImageUrl, iconSvg: undefined };
      await supabase.from("brand_guides").update({ result: updatedResult }).eq("id", id);
      return NextResponse.json({ logoImageUrl });
    }

    return NextResponse.json({ error: "Logo generatie mislukt" }, { status: 500 });
  } catch (err) {
    console.error("init-logo error:", err);
    return NextResponse.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
