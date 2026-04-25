import { NextRequest, NextResponse } from "next/server";
import {
  loadOwnedGuideContext,
  persistResultPatch,
} from "@/lib/regenerate-helpers";
import type { FontSpec, TypeScaleEntry, Typography } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as {
      fonts?: FontSpec[];
      typeScale?: TypeScaleEntry[];
      pairingRationale?: string;
      googleFontsUrl?: string;
    };

    if (!Array.isArray(body.fonts) || body.fonts.length < 1) {
      return NextResponse.json(
        { error: "Ongeldige fonts" },
        { status: 400 },
      );
    }

    const ctx = await loadOwnedGuideContext(id);
    if (ctx instanceof NextResponse) return ctx;

    const newTypography: Typography = {
      fonts: body.fonts,
      typeScale: body.typeScale ?? ctx.guide.result.typography?.typeScale ?? [],
      pairingRationale:
        body.pairingRationale ??
        ctx.guide.result.typography?.pairingRationale ??
        "",
      googleFontsUrl:
        body.googleFontsUrl ??
        ctx.guide.result.typography?.googleFontsUrl ??
        "",
    };

    await persistResultPatch(
      id,
      { typography: newTypography },
      ctx.guide.result,
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("apply-typography error:", err);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }
}
