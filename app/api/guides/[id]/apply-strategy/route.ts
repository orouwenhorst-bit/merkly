import { NextRequest, NextResponse } from "next/server";
import {
  loadOwnedGuideContext,
  persistResultPatch,
} from "@/lib/regenerate-helpers";
import type { BrandStrategy } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as Partial<BrandStrategy>;

    if (!body.mission || !body.vision) {
      return NextResponse.json(
        { error: "Missie en visie zijn vereist" },
        { status: 400 },
      );
    }

    const ctx = await loadOwnedGuideContext(id);
    if (ctx instanceof NextResponse) return ctx;

    const current = ctx.guide.result.strategy ?? ({} as BrandStrategy);

    const newStrategy: BrandStrategy = {
      mission: body.mission,
      vision: body.vision,
      brandStory: body.brandStory ?? current.brandStory ?? "",
      personalityTraits: body.personalityTraits ?? current.personalityTraits ?? [],
      personalityDescription:
        body.personalityDescription ?? current.personalityDescription ?? "",
      // Behoud bestaande kernwaarden en persona's; die worden niet meegegenereerd hier.
      coreValues: current.coreValues ?? [],
      personas: current.personas ?? [],
    };

    // Houd de top-level alias in sync (legacy compat).
    const patch = {
      strategy: newStrategy,
      brandPersonality: newStrategy.personalityTraits,
      brandStory: newStrategy.brandStory,
    };

    await persistResultPatch(id, patch, ctx.guide.result);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("apply-strategy error:", err);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }
}
