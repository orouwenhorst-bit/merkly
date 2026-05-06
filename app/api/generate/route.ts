import { NextRequest, NextResponse } from "next/server";
import { generateBrandGuideLight, generateBrandGuide } from "@/lib/claude";
import { calculateAccessibility } from "@/lib/wcag";
import { createClient, createServerClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";
import { generateLogoSvg, storeLogoSvg } from "@/lib/recraft-logo";
import { deriveLogoVariants } from "@/lib/svg-processing";
import { BrandInput } from "@/types/brand";
import { trackEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel Hobby plan maximum

export async function POST(req: NextRequest) {
  const body: BrandInput = await req.json().catch(() => null);

  if (!body?.companyName || !body.industry || !body.mood || !body.targetAudience) {
    return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });
  }

  // Fast pre-flight checks (auth + rate limit) before opening the stream
  let user: { id: string } | null = null;
  try {
    const serverClient = await createServerClient();
    const { data } = await serverClient.auth.getUser();
    user = data.user;
  } catch {
    return NextResponse.json({ error: "Auth mislukt" }, { status: 500 });
  }

  const supabase = createClient();
  let isPremiumUser = false;

  if (user) {
    try {
      const sub = await getUserSubscription(user.id);
      isPremiumUser = sub.isPremium;
    } catch {
      return NextResponse.json({ error: "Abonnement ophalen mislukt" }, { status: 500 });
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

  // Log generation start (voor funnel-analyse)
  trackEvent("generation_started", {
    userId: user?.id,
    metadata: { isPremium: isPremiumUser, industry: body.industry, mood: body.mood },
  });

  // Stream SSE events so the connection stays alive during Claude generation
  const encoder = new TextEncoder();
  const userId = user?.id ?? null;

  const stream = new ReadableStream({
    async start(controller) {
      const sse = (event: string, data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          // client disconnected
        }
      };

      // Keepalive every 8s to prevent proxy/browser timeouts
      const ping = setInterval(() => sse("ping", {}), 8000);

      try {
        sse("ping", {}); // immediate first byte so connection is established

        const result = isPremiumUser
          ? await generateBrandGuide(body)
          : await generateBrandGuideLight(body);

        if (result.colorPalette?.colors?.length) {
          result.colorPalette.accessibility = calculateAccessibility(result.colorPalette.colors);
        }

        const resultWithInput = { ...result, _input: body };
        const { data: saved, error } = await supabase
          .from("brand_guides")
          .insert({
            company_name: body.companyName,
            industry: body.industry,
            mood: body.mood,
            logo_url: body.logoUrl || null,
            result: resultWithInput,
            is_premium: isPremiumUser,
            user_id: userId,
          })
          .select("id")
          .single();

        if (error) throw new Error(`[supabase-insert] ${error.message}`);

        trackEvent("generation_completed", {
          userId,
          guideId: saved.id,
          metadata: { isPremium: isPremiumUser, industry: body.industry, mood: body.mood },
        });

        // Logo generatie inline (Recraft V4 SVG) — snel genoeg met Haiku binnen 60s
        let finalResult: typeof resultWithInput = resultWithInput;
        if (process.env.RECRAFT_API_KEY) {
          try {
            const colors = result.colorPalette?.colors ?? [];
            const primaryColor =
              body.preferredColor ||
              colors.find((c: { category: string; hex: string }) => c.category === "primary")?.hex ||
              colors[0]?.hex ||
              "#000000";
            const brandPersonality =
              (result as { strategy?: { personalityTraits?: string[] } }).strategy?.personalityTraits ??
              (result as { brandPersonality?: string[] }).brandPersonality ??
              [];

            const v4Result = await generateLogoSvg(body.industry, body.mood, primaryColor, brandPersonality);
            if (v4Result) {
              const variants = deriveLogoVariants(v4Result.svg, primaryColor);
              const primarySvg = variants.monoPrimary;
              const publicUrl = await storeLogoSvg(saved.id, primarySvg);

              finalResult = {
                ...resultWithInput,
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

              await supabase.from("brand_guides").update({ result: finalResult }).eq("id", saved.id);
            }
          } catch (logoErr) {
            console.error("Inline logo generation failed, client will fallback to init-logo:", logoErr);
          }
        }

        sse("done", { id: saved.id, result: finalResult });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Generate stream error:", msg);
        sse("error", { error: msg || "Generatie mislukt" });
      } finally {
        clearInterval(ping);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
