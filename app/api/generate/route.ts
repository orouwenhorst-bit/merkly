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
export const maxDuration = 120;

function label(step: string, err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err);
  return new Error(`[${step}] ${msg}`);
}

export async function POST(req: NextRequest) {
  try {
    const body: BrandInput = await req.json();

    if (!body.companyName || !body.industry || !body.mood || !body.targetAudience) {
      return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });
    }

    // Auth
    let user: { id: string } | null = null;
    try {
      const serverClient = await createServerClient();
      const { data } = await serverClient.auth.getUser();
      user = data.user;
    } catch (err) {
      throw label("auth", err);
    }

    const supabase = createClient();

    // Rate limiting
    if (user) {
      let isPremium = false;
      try {
        ({ isPremium } = await getUserSubscription(user.id));
      } catch (err) {
        throw label("subscription-check", err);
      }
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

    // Subscription check for generation type
    let isPremiumUser = false;
    if (user) {
      try {
        const sub = await getUserSubscription(user.id);
        isPremiumUser = sub.isPremium;
      } catch (err) {
        throw label("subscription-type", err);
      }
    }

    // Claude generatie
    let result;
    try {
      result = isPremiumUser
        ? await generateBrandGuide(body)
        : await generateBrandGuideLight(body);
    } catch (err) {
      throw label("claude-generatie", err);
    }

    // WCAG
    if (result.colorPalette?.colors?.length) {
      result.colorPalette.accessibility = calculateAccessibility(result.colorPalette.colors);
    }

    // Supabase opslaan
    const resultWithInput = { ...result, _input: body };
    let savedGuide: { id: string };
    try {
      const { data, error } = await supabase
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
      savedGuide = data;
    } catch (err) {
      throw label("supabase-insert", err);
    }

    // Logo generatie
    if (process.env.RECRAFT_API_KEY) {
      try {
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
      } catch (err) {
        // Logo is niet-kritiek: log maar laat generatie slagen
        console.error("Logo generatie fout (niet-kritiek):", err);
      }
    }

    return NextResponse.json({ id: savedGuide.id, result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Generate error:", msg, err);
    return NextResponse.json({ error: msg || "Generatie mislukt" }, { status: 500 });
  }
}
