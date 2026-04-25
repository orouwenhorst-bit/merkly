import { NextRequest, NextResponse } from "next/server";
import {
  loadPremiumGuideContext,
  generateJsonSection,
  buildBrandContextBlock,
} from "@/lib/regenerate-helpers";

export const dynamic = "force-dynamic";

interface StrategyOption {
  mission: string;
  vision: string;
  brandStory: string;
  personalityTraits: string[];
  personalityDescription: string;
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

    const current = ctx.guide.result.strategy;
    const currentMission = current?.mission ?? "";
    const currentVision = current?.vision ?? "";
    const currentTraits = current?.personalityTraits?.join(", ") ?? "";

    const prompt = `Je bent een senior brand strategist.
Genereer 3 nieuwe varianten van de merkstrategie voor dit merk.
Schrijf in het Nederlands. Wees concreet, niet generiek.

CONTEXT
${buildBrandContextBlock(ctx.guide)}
${currentMission ? `Huidige missie (NIET herhalen): "${currentMission}"` : ""}
${currentVision ? `Huidige visie: "${currentVision}"` : ""}
${currentTraits ? `Huidige persoonlijkheid: ${currentTraits}` : ""}
${userHint?.trim() ? `Wensen van gebruiker: "${userHint.trim()}"` : ""}

EISEN PER VARIANT
- Missie: één krachtige zin (max 20 woorden) — waarom bestaat het bedrijf.
- Visie: één ambitieuze zin (max 20 woorden) — waar gaat het naartoe.
- Brand story: 2-3 zinnen in wij-vorm, authentiek en emotioneel.
- Persoonlijkheid: 5 adjectieven, gevarieerd in karakter (niet allemaal "modern", "innovatief").
- PersonalityDescription: 2 zinnen — hoe deze persoonlijkheid zich uit in communicatie & vormgeving.

VARIATIE
- Variant 1: dichter bij huidige toon (subtiele aanscherping).
- Variant 2: meer ambitieus / visionair.
- Variant 3: warmer / persoonlijker.

Retourneer ALLEEN een JSON-array met 3 strategieën. Geen markdown, geen tekst:

[
  {
    "mission": "...",
    "vision": "...",
    "brandStory": "...",
    "personalityTraits": ["adj1", "adj2", "adj3", "adj4", "adj5"],
    "personalityDescription": "..."
  }
]`;

    const strategies = await generateJsonSection<StrategyOption[]>(prompt, {
      maxTokens: 2500,
    });

    if (!Array.isArray(strategies) || strategies.length === 0) {
      throw new Error("Geen geldige array");
    }

    return NextResponse.json({ strategies });
  } catch (err) {
    console.error("regenerate-strategy error:", err);
    return NextResponse.json(
      { error: "Generatie mislukt" },
      { status: 500 },
    );
  }
}
