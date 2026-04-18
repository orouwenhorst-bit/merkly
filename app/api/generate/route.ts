import { NextRequest, NextResponse } from "next/server";
import { generateBrandGuideLight, generateBrandGuide } from "@/lib/claude";
import { generateAndStoreLogo } from "@/lib/dalle-logo";
import { generateLogoSvg, storeLogoSvg } from "@/lib/recraft-logo";
import { deriveLogoVariants } from "@/lib/svg-processing";
import { calculateAccessibility } from "@/lib/wcag";
import { createClient, createServerClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";
import { BrandInput } from "@/types/brand";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // Claude + logo generatie kan tot 2 minuten duren

export async function POST(req: NextRequest) {
  try {
    const body: BrandInput = await req.json();

    if (!body.companyName || !body.industry || !body.mood || !body.targetAudience) {
      return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });
    }

    // Lees huidige gebruiker uit auth cookies
    const serverClient = await createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    const supabase = createClient(); // service client voor DB schrijven

    // Rate limiting voor gratis accounts (3 generaties per dag)
    if (user) {
      const { isPremium } = await getUserSubscription(user.id);
      if (!isPremium) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count } = await supabase
          .from("brand_guides")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", today.toISOString());
        if ((count ?? 0) >= 3) {
          return NextResponse.json(
            { error: "Je hebt je daglimiet van 3 generaties bereikt.", upgrade: true },
            { status: 429 }
          );
        }
      }
    }

    // Bepaal of we volledig of licht genereren
    let isPremiumUser = false;
    if (user) {
      const sub = await getUserSubscription(user.id);
      isPremiumUser = sub.isPremium;
    }

    const result = isPremiumUser
      ? await generateBrandGuide(body)       // Volledig — PDF + mockups + merkstem
      : await generateBrandGuideLight(body); // Preview — alleen basis

    // Server-side WCAG validatie
    if (result.colorPalette?.colors?.length) {
      result.colorPalette.accessibility = calculateAccessibility(result.colorPalette.colors);
    }

    // Sla op in Supabase
    const resultWithInput = { ...result, _input: body };

    const { data: savedGuide, error } = await supabase
      .from("brand_guides")
      .insert({
        company_name: body.companyName,
        industry: body.industry,
        mood: body.mood,
        logo_url: body.logoUrl || null,
        result: resultWithInput,
        is_premium: isPremiumUser,
        user_id: user?.id ?? null,
      })
      .select("id")
      .single();

    if (error) throw error;

    if (process.env.RECRAFT_API_KEY) {
      const colors = result.colorPalette?.colors ?? [];
      const primaryColor =
        body.preferredColor ||
        colors.find((c) => c.category === "primary")?.hex ||
        colors[0]?.hex ||
        "#000000";

      const v4Result = await generateLogoSvg(
        body.industry,
        body.mood,
        primaryColor,
        result.brandPersonality ?? []
      );

      if (v4Result) {
        const variants = deriveLogoVariants(v4Result.svg, primaryColor);
        // Always use the brand-colored variant as the primary display logo.
        // monoPrimary recolors all non-white fills to the exact primaryColor,
        // ensuring the logo matches the chosen/derived brand color.
        const primarySvg = variants.monoPrimary;
        const publicUrl = await storeLogoSvg(savedGuide.id, primarySvg);
        result.logoImageUrl = publicUrl ?? undefined;
        result.iconSvg = undefined;
        result.logoVariants = {
          fullColor: primarySvg,
          monoBlack: variants.monoBlack,
          monoWhite: variants.monoWhite,
          monoPrimary: variants.monoPrimary,
          transparent: primarySvg,
          recraftImageId: v4Result.imageId,
        };
        await supabase.from("brand_guides").update({ result }).eq("id", savedGuide.id);
      } else {
        const logoImageUrl = await generateAndStoreLogo(
          savedGuide.id,
          body.companyName,
          body.industry,
          body.mood,
          primaryColor
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
