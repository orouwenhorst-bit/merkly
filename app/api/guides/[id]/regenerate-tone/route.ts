import { NextRequest, NextResponse } from "next/server";
import {
  loadPremiumGuideContext,
  generateJsonSection,
  buildBrandContextBlock,
} from "@/lib/regenerate-helpers";

export const dynamic = "force-dynamic";

interface ToneOption {
  voiceAttributes: string[];
  doList: string[];
  dontList: string[];
  boilerplate: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ctx = await loadPremiumGuideContext(id);
    if (ctx instanceof NextResponse) return ctx;

    const { userHint } = await req.json().catch(() => ({}));

    const current = ctx.guide.result.toneOfVoice;
    const currentAttrs = current?.voiceAttributes?.join(", ") ?? "";

    const prompt = `Je bent een senior copywriter & brand strategist.
Genereer 3 alternatieven voor de tone of voice van dit merk.
Schrijf in het Nederlands. Wees specifiek, niet generiek.

CONTEXT
${buildBrandContextBlock(ctx.guide)}
${currentAttrs ? `Huidige stem-attributen (NIET herhalen): ${currentAttrs}` : ""}
${userHint?.trim() ? `Wensen van gebruiker: "${userHint.trim()}"` : ""}

EISEN PER VARIANT
- voiceAttributes: 4 woorden die de stem typeren (bijv. "helder, warm, direct, niet corporate"). Vermijd lege termen.
- doList: 4 concrete richtlijnen voor woordkeuze en toon.
- dontList: 4 dingen die het merk NOOIT doet in communicatie.
- boilerplate: 2-3 zinnen standaard bedrijfsbeschrijving voor footers/social bio's.

VARIATIE
- Variant 1: dicht bij de huidige toon — alleen scherper.
- Variant 2: warmer/menselijker.
- Variant 3: krachtiger/zelfverzekerd.

Retourneer ALLEEN een JSON-array met 3 varianten. Geen markdown:

[
  {
    "voiceAttributes": ["...", "...", "...", "..."],
    "doList": ["...", "...", "...", "..."],
    "dontList": ["...", "...", "...", "..."],
    "boilerplate": "..."
  }
]`;

    const tones = await generateJsonSection<ToneOption[]>(prompt, {
      maxTokens: 2000,
    });

    if (!Array.isArray(tones) || tones.length === 0) {
      throw new Error("Geen geldige array");
    }

    return NextResponse.json({ tones });
  } catch (err) {
    console.error("regenerate-tone error:", err);
    return NextResponse.json(
      { error: "Generatie mislukt" },
      { status: 500 },
    );
  }
}
