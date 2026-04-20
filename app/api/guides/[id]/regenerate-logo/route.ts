import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";
import { generateLogoSvg } from "@/lib/recraft-logo";
import { deriveLogoVariants } from "@/lib/svg-processing";
import type { BrandGuideResult } from "@/types/brand";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const serverClient = await createServerClient();
    const {
      data: { user },
    } = await serverClient.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

    const { isPremium } = await getUserSubscription(user.id);
    if (!isPremium)
      return NextResponse.json(
        { error: "Premium abonnement vereist" },
        { status: 403 }
      );

    const supabase = createServiceClient();
    const { data: guide, error } = await supabase
      .from("brand_guides")
      .select("id, user_id, industry, mood, result")
      .eq("id", id)
      .single();

    if (error || !guide)
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    if (guide.user_id !== user.id)
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

    const result = guide.result as BrandGuideResult & {
      _input?: { preferredColor?: string };
    };
    const colors = result.colorPalette?.colors ?? [];
    const primaryColor =
      result._input?.preferredColor ||
      colors.find((c) => c.category === "primary")?.hex ||
      colors[0]?.hex ||
      "#000000";

    const brandPersonality =
      result.strategy?.personalityTraits ?? result.brandPersonality ?? [];

    if (!process.env.RECRAFT_API_KEY)
      return NextResponse.json(
        { error: "Logo generatie niet beschikbaar" },
        { status: 503 }
      );

    const v4Result = await generateLogoSvg(
      guide.industry,
      guide.mood,
      primaryColor,
      brandPersonality
    );

    if (!v4Result)
      return NextResponse.json(
        { error: "Logo generatie mislukt" },
        { status: 500 }
      );

    const variants = deriveLogoVariants(v4Result.svg, primaryColor);
    const primarySvg = variants.monoPrimary;

    // Return variants without saving — client picks old or new via apply-logo
    return NextResponse.json({
      logoVariants: {
        fullColor: primarySvg,
        monoBlack: variants.monoBlack,
        monoWhite: variants.monoWhite,
        monoPrimary: variants.monoPrimary,
        transparent: primarySvg,
        recraftImageId: v4Result.imageId,
      },
    });
  } catch (err) {
    console.error("regenerate-logo error:", err);
    return NextResponse.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
