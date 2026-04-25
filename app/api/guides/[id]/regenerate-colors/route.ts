import { NextRequest, NextResponse } from "next/server";
import {
  loadPremiumGuideContext,
  generateJsonSection,
  buildBrandContextBlock,
} from "@/lib/regenerate-helpers";
import type { ColorPalette } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ctx = await loadPremiumGuideContext(id);
    if (ctx instanceof NextResponse) return ctx;

    const { userHint, keepPrimary } = await req.json().catch(() => ({}));

    const currentColors = ctx.guide.result.colorPalette?.colors ?? [];
    const currentPrimary =
      currentColors.find((c) => c.category === "primary")?.hex ?? "#8b5cf6";
    const currentHexes = currentColors.map((c) => c.hex.toUpperCase()).join(", ");

    const prompt = `Je bent een senior color designer.
Genereer 4 unieke nieuwe kleurpaletten voor dit merk. Schrijf in het Nederlands.

CONTEXT
${buildBrandContextBlock(ctx.guide)}
${currentHexes ? `Huidig palet (NIET herhalen): ${currentHexes}` : ""}
${keepPrimary ? `BELANGRIJK: behoud ${currentPrimary} als eerste primaire kleur in elk palet.` : ""}
${userHint?.trim() ? `Wensen van gebruiker: "${userHint.trim()}"` : ""}

EISEN PER PALET
- Exact 7 kleuren: 2 primair, 2 secundair, 3 neutraal.
- Kleuren moeten harmoniëren als één samenhangend palet.
- Secundaire kleuren analoog (±30°), tonaal of subtiel complementair aan primair.
- Geen neon of fluor, tenzij sfeer dit expliciet vraagt.
- Neutralen: één donkere tekst, één licht (NIET #FFFFFF), één medium.
- Primaire kleur moet leesbare witte tekst toestaan (WCAG AA).
- Maak de 4 paletten duidelijk verschillend in karakter (bv. warm/koel, levendig/ingetogen, modern/klassiek).

VARIATIE
- Palet 1: dichtst bij huidige stijl (subtiele verfrissing).
- Palet 2: warmere/levendigere variant.
- Palet 3: rustiger/donkerder variant.
- Palet 4: contrasterender/gedurfder variant.

Retourneer ALLEEN een JSON-array met 4 paletten. Geen markdown, geen tekst:

[
  {
    "label": "Korte naam (bijv. 'Warme aarde')",
    "ratioGuideline": "60% neutraal, 30% primair, 10% accent",
    "colors": [
      { "name": "Merknaam", "hex": "#HEX", "rgb": "rgb(R,G,B)", "cmyk": "cmyk(C%,M%,Y%,K%)", "pantone": "Pantone XXX", "usage": "Gebruik voor...", "category": "primary" }
    ]
  }
]`;

    type PaletteOption = ColorPalette & { label?: string };
    const palettes = await generateJsonSection<PaletteOption[]>(prompt, {
      maxTokens: 3500,
    });

    if (!Array.isArray(palettes) || palettes.length === 0) {
      throw new Error("Geen geldige array");
    }

    return NextResponse.json({ palettes });
  } catch (err) {
    console.error("regenerate-colors error:", err);
    return NextResponse.json(
      { error: "Generatie mislukt" },
      { status: 500 },
    );
  }
}
