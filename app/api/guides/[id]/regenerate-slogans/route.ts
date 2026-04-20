import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";
import Anthropic from "@anthropic-ai/sdk";
import type { BrandGuideResult } from "@/types/brand";

export const dynamic = "force-dynamic";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

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
      .select("id, user_id, result")
      .eq("id", id)
      .single();

    if (error || !guide)
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    if (guide.user_id !== user.id)
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

    const result = guide.result as BrandGuideResult & {
      _input?: { industry?: string; mood?: string };
    };
    const companyName = result.companyName ?? "het bedrijf";
    const industry = result._input?.industry ?? "algemeen";
    const mood = result._input?.mood ?? "professioneel";
    const mission = result.strategy?.mission ?? "";
    const personality =
      result.strategy?.personalityTraits?.slice(0, 3).join(", ") ?? "";
    const currentTagline = result.toneOfVoice?.tagline ?? "";

    const prompt = `Je bent een senior copywriter. Genereer 5 unieke merktaglines voor ${companyName} (branche: ${industry}, sfeer: ${mood}).

Context:
- Missie: ${mission}
- Merkpersoonlijkheid: ${personality}
- Huidige tagline (niet herhalen): "${currentTagline}"

Eisen:
- Maximaal 6 woorden per tagline
- In het Nederlands
- Prikkelend, gedenkwaardig, onderscheidend
- Elke tagline anders van opbouw (vraag, uitroep, statement, actief, poëtisch)

Retourneer ALLEEN een JSON-array met 5 strings, geen markdown, geen uitleg:
["Tagline 1", "Tagline 2", "Tagline 3", "Tagline 4", "Tagline 5"]`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const slogans = JSON.parse(cleaned);
    if (!Array.isArray(slogans) || slogans.length === 0)
      throw new Error("Geen geldige array");

    return NextResponse.json({ slogans });
  } catch (err) {
    console.error("regenerate-slogans error:", err);
    return NextResponse.json({ error: "Generatie mislukt" }, { status: 500 });
  }
}
