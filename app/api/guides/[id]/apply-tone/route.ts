import { NextRequest, NextResponse } from "next/server";
import {
  loadOwnedGuideContext,
  persistResultPatch,
} from "@/lib/regenerate-helpers";
import type { ToneOfVoice } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as Partial<ToneOfVoice>;

    if (
      !Array.isArray(body.voiceAttributes) ||
      !Array.isArray(body.doList) ||
      !Array.isArray(body.dontList)
    ) {
      return NextResponse.json(
        { error: "Ongeldige tone of voice" },
        { status: 400 },
      );
    }

    const ctx = await loadOwnedGuideContext(id);
    if (ctx instanceof NextResponse) return ctx;

    const current = ctx.guide.result.toneOfVoice ?? ({} as ToneOfVoice);
    const newTone: ToneOfVoice = {
      voiceAttributes: body.voiceAttributes,
      doList: body.doList,
      dontList: body.dontList,
      boilerplate: body.boilerplate ?? current.boilerplate ?? "",
      // Tagline + voorbeelden blijven behouden — die hebben hun eigen flow.
      tagline: current.tagline ?? "",
      examples: current.examples ?? [],
    };

    await persistResultPatch(
      id,
      { toneOfVoice: newTone },
      ctx.guide.result,
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("apply-tone error:", err);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }
}
