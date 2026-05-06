import { NextRequest, NextResponse } from "next/server";
import {
  loadPremiumGuideContext,
  generateJsonSection,
  buildBrandContextBlock,
} from "@/lib/regenerate-helpers";
import type { FontSpec, TypeScaleEntry } from "@/types/brand";
import { trackEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

interface FontPairing {
  fonts: FontSpec[];
  typeScale: TypeScaleEntry[];
  pairingRationale: string;
  googleFontsUrl: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ctx = await loadPremiumGuideContext(id);
    if (ctx instanceof NextResponse) return ctx;

    const { userHint } = await req
      .json()
      .catch(() => ({ userHint: undefined }));

    const currentFonts = ctx.guide.result.typography?.fonts ?? [];
    const currentNames = currentFonts.map((f) => f.name).join(", ");

    const prompt = `Je bent een type-designer met expertise in Google Fonts pairings.
Genereer 4 unieke nieuwe font-koppels voor dit merk. Schrijf in het Nederlands.

CONTEXT
${buildBrandContextBlock(ctx.guide)}
${currentNames ? `Huidige koppel (NIET herhalen): ${currentNames}` : ""}
${userHint?.trim() ? `Wensen van gebruiker: "${userHint.trim()}"` : ""}

EISEN
- Elk koppel: 1 display font + 1 body font (beide op Google Fonts).
- VARIEER actief — vermijd standaard Inter/Poppins/Montserrat/Roboto tenzij echt het beste.
- Combinaties moeten harmoniëren én contrast hebben (serif + sans, of twee sans met heel ander karakter).
- Body fonts: leesbaar, neutraal, ondersteunend.
- Display fonts: karaktervol, passend bij merksfeer.
- Geef per font een werkende Google Fonts URL met de juiste gewichten.
- Geef typeScale met EXACT 3 entries: H1, body, small.
- Geef gecombineerde googleFontsUrl voor beide fonts.
- Schrijf pairingRationale in 1-2 zinnen NL.

Retourneer ALLEEN een JSON-array met 4 koppels. Geen markdown, geen tekst:

[
  {
    "fonts": [
      { "name": "DisplayFont", "category": "display", "weights": [400, 700], "source": "Google Fonts", "googleFontsUrl": "https://fonts.googleapis.com/css2?family=DisplayFont:wght@400;700&display=swap", "fallback": "serif", "usage": "Koppen en titels" },
      { "name": "BodyFont", "category": "body", "weights": [400, 500], "source": "Google Fonts", "googleFontsUrl": "https://fonts.googleapis.com/css2?family=BodyFont:wght@400;500&display=swap", "fallback": "sans-serif", "usage": "Lopende tekst" }
    ],
    "typeScale": [
      { "level": "H1", "fontFamily": "DisplayFont", "weight": 700, "sizePx": 48, "lineHeight": "1.1", "letterSpacing": "-1px", "usage": "Paginatitels" },
      { "level": "body", "fontFamily": "BodyFont", "weight": 400, "sizePx": 16, "lineHeight": "1.6", "letterSpacing": "0px", "usage": "Lopende tekst" },
      { "level": "small", "fontFamily": "BodyFont", "weight": 400, "sizePx": 14, "lineHeight": "1.5", "letterSpacing": "0px", "usage": "Bijschriften" }
    ],
    "pairingRationale": "Waarom deze fonts werken (1-2 zinnen).",
    "googleFontsUrl": "https://fonts.googleapis.com/css2?family=DisplayFont:wght@400;700&family=BodyFont:wght@400;500&display=swap"
  }
]`;

    const pairings = await generateJsonSection<FontPairing[]>(prompt, {
      maxTokens: 2500,
    });

    if (!Array.isArray(pairings) || pairings.length === 0) {
      throw new Error("Geen geldige array");
    }

    trackEvent("typography_regenerated", { userId: ctx.userId, guideId: ctx.guideId });
    return NextResponse.json({ pairings });
  } catch (err) {
    console.error("regenerate-typography error:", err);
    return NextResponse.json(
      { error: "Generatie mislukt" },
      { status: 500 },
    );
  }
}
