import { NextRequest, NextResponse } from "next/server";
import {
  loadOwnedGuideContext,
  persistResultPatch,
} from "@/lib/regenerate-helpers";
import type { ColorPalette, ColorSwatch } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as Partial<ColorPalette> & {
      colors?: ColorSwatch[];
    };

    if (!Array.isArray(body.colors) || body.colors.length === 0) {
      return NextResponse.json(
        { error: "Ongeldig kleurenpalet" },
        { status: 400 },
      );
    }

    const ctx = await loadOwnedGuideContext(id);
    if (ctx instanceof NextResponse) return ctx;

    const newPalette: ColorPalette = {
      colors: body.colors,
      ratioGuideline:
        body.ratioGuideline ??
        ctx.guide.result.colorPalette?.ratioGuideline ??
        "60% neutraal, 30% primair, 10% accent",
      // Accessibility wordt opnieuw afgeleid op de PDF/preview pagina;
      // hier laten we het bestaande veld staan (nieuwe kleuren = nieuwe ratio's).
      accessibility: ctx.guide.result.colorPalette?.accessibility ?? [],
    };

    await persistResultPatch(
      id,
      { colorPalette: newPalette },
      ctx.guide.result,
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("apply-colors error:", err);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }
}
