import { NextRequest, NextResponse } from "next/server";
import { generateBrandGuideLight, generateBrandGuide } from "@/lib/claude";
import { calculateAccessibility } from "@/lib/wcag";
import { createClient, createServerClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";
import { BrandInput } from "@/types/brand";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel Hobby plan maximum

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

    // Subscription check + rate limiting (één call)
    let isPremiumUser = false;
    if (user) {
      try {
        const sub = await getUserSubscription(user.id);
        isPremiumUser = sub.isPremium;
      } catch (err) {
        throw label("subscription-check", err);
      }
      if (!isPremiumUser) {
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

    // Logo generatie via apart endpoint na redirect — voorkomt Vercel 60s timeout op Hobby plan
    // De result-pagina triggert /api/guides/[id]/regenerate-logo zodra de guide geladen is.

    return NextResponse.json({ id: savedGuide.id, result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Generate error:", msg, err);
    return NextResponse.json({ error: msg || "Generatie mislukt" }, { status: 500 });
  }
}
