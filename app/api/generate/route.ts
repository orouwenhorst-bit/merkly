import { NextRequest, NextResponse } from "next/server";
import { generateBrandGuideLight, generateBrandGuide } from "@/lib/claude";
import { calculateAccessibility } from "@/lib/wcag";
import { createClient, createServerClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";
import { BrandInput } from "@/types/brand";

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

        sse("done", { id: saved.id, result });
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
